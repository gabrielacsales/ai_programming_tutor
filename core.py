from __future__ import annotations

import builtins
import dataclasses
import os
import re
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

import yaml
from dotenv import load_dotenv

load_dotenv()

# ---------------- OpenAI toggle (optional) ----------------
USE_OPENAI = False
try:
    if os.getenv("OPENAI_API_KEY"):
        # Lazy import in runtime call; keep flag only
        USE_OPENAI = True
except Exception:
    USE_OPENAI = False


# ---------------- Data models ----------------
@dataclass
class Problem:
    id: str
    title: str
    statement: str
    hints: List[str]
    solution: str
    rubric: List[str]

    expected_function_signature: Optional[str] = None
    tests: List[Dict[str, Any]] = field(default_factory=list)
    test_cases_hidden: List[Dict[str, Any]] = field(default_factory=list)

    docs_summary: Optional[str] = None
    examples: List[str] = field(default_factory=list)
    constraints: List[str] = field(default_factory=list)


def load_problems(path: str) -> List[Problem]:
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}

    problems: List[Problem] = []
    for p in data.get("problems", []):
        problems.append(
            Problem(
                id=str(p.get("id", "")),
                title=str(p.get("title", "Exercício")),
                statement=str(p.get("statement", "")),
                hints=p.get("hints", []) or [],
                solution=str(p.get("solution", "")),
                rubric=p.get("rubric", []) or [],
                expected_function_signature=p.get("expected_function_signature"),
                tests=p.get("tests", []) or [],
                test_cases_hidden=p.get("test_cases_hidden", []) or [],
                docs_summary=p.get("docs_summary"),
                examples=p.get("examples", []) or [],
                constraints=p.get("constraints", []) or [],
            )
        )
    return problems


# ---------------- Metrics (somente o que não depende das partes removidas) ----------------
@dataclass
class Metrics:
    hints_used: int = 0
    idle_time_seconds: float = 0.0

    blocked_direct_answer_attempts: int = 0
    direct_answer_attempts: int = 0
    reengagement_after_block: int = 0

    t_first_attempt: Optional[float] = None
    t_success: Optional[float] = None

    def as_dict(self) -> Dict[str, Any]:
        return dataclasses.asdict(self)

    def IPT(self) -> float:
        return float(self.hints_used)

    def TRIB(self) -> float:
        denom = self.blocked_direct_answer_attempts + self.direct_answer_attempts
        denom = max(1, denom)
        return self.blocked_direct_answer_attempts / denom

    def RER(self) -> float:
        if self.blocked_direct_answer_attempts == 0:
            return 0.0
        return self.reengagement_after_block / max(1, self.blocked_direct_answer_attempts)

    def IT(self) -> float:
        return float(self.idle_time_seconds)


# ---------------- Guardrails ----------------
_FINAL_ASK_RE = re.compile(r"\b(resposta|solu[cç][aã]o|c[oó]digo\s*completo|gabarito)\b", re.I)
_LIB_SKIP_RE = re.compile(r"\b(us(ar|o)\s+(uma\s+)?fun[cç][aã]o\s+pronta|biblioteca|lib|import\s+\w+)\b", re.I)


def is_direct_answer_request(text: str) -> bool:
    return bool(_FINAL_ASK_RE.search(text or ""))


def suggests_ready_library(text: str) -> bool:
    return bool(_LIB_SKIP_RE.search(text or ""))


# ---------------- Tutor ----------------
class SocraticTutor:
    """Tutor socrático: guia por perguntas, sem entregar solução pronta."""

    def __init__(self):
        self.use_openai = USE_OPENAI

    def _chat(self, system: str, user: str, temperature: float = 0.3) -> str:
        if not self.use_openai:
            return ""
        try:
            from openai import OpenAI  # type: ignore

            client = OpenAI()
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                temperature=temperature,
            )
            return (resp.choices[0].message.content or "").strip()
        except Exception:
            return ""

    @staticmethod
    def _ctx_to_str(ctx: Dict[str, Any]) -> str:
        title = ctx.get("title", "Exercício")
        language = ctx.get("language", "Python")
        rules = ctx.get("constraints", [])
        rules_txt = (", ".join(rules)) if rules else "siga as instruções do enunciado"
        return f"[contexto] exercício: {title} | linguagem: {language} | restrições: {rules_txt}"

    def ask(self, user_message: str, ctx: Dict[str, Any], current_code: str = "") -> str:
        if is_direct_answer_request(user_message):
            return (
                f"Para o {self._ctx_to_str(ctx)}, não posso dar a resposta pronta. "
                "Vamos por passos: qual é a entrada e o retorno? "
                "Esboce a assinatura e um caso de teste simples."
            )

        sys = (
            "Você é um professor socrático. Nunca entregue a solução final ou código pronto. "
            "Use o contexto fornecido para manter a conversa alinhada ao exercício e à linguagem. "
            "Quando o aluno tentar atalhos (ex.: usar lib pronta se a meta é implementar do zero), "
            "reoriente de forma gentil, propondo pequenos passos e perguntas."
        )
        code_context = f"\n[Código atual do aluno]:\n{current_code}" if current_code else ""
        user = f"{self._ctx_to_str(ctx)}{code_context}\nPergunta do aluno: {user_message}"
        out = self._chat(sys, user)
        if out:
            return out
        return "Me diga: qual é a entrada e qual é a saída esperada? Escreva 1 caso de teste e descreva os passos."

    def critique_idea(self, idea: str, ctx: Dict[str, Any]) -> str:
        if suggests_ready_library(idea):
            return (
                f"No {self._ctx_to_str(ctx)}, o objetivo é implementar a lógica. "
                "Evite bibliotecas prontas. Liste os passos do algoritmo e 2 casos de teste."
            )

        sys = (
            "Você é um professor. Avalie se a descrição faz sentido em alto nível para o contexto dado. "
            "Responda em 1–2 frases, sem código e sem entregar a solução. "
            "Se fizer sentido, diga 'Sim, a lógica faz sentido.' e incentive a ir ao código. "
            "Se houver lacunas, faça 1–2 perguntas guiando o aluno."
        )
        user = f"{self._ctx_to_str(ctx)}\nDescrição do aluno: {idea}"
        out = self._chat(sys, user)
        if out:
            return out
        if len((idea or "").strip()) >= 20:
            return "Sim, a lógica faz sentido. Agora traduza para código e valide com casos simples."
        return "Há pontos a esclarecer: qual é a entrada? O que retornar em casos-limite?"

    def explain_error(self, error_msg: str, code_excerpt: str, ctx: Dict[str, Any]) -> str:
        sys = (
            "Você é um professor de Python. Explique a causa provável do erro e próximos passos, "
            "sem fornecer o código pronto. Reforce o contexto do exercício e as restrições."
        )
        user = (
            f"{self._ctx_to_str(ctx)}\nErro: {error_msg}\n"
            f"Trecho de código:\n{(code_excerpt or '')[:600]}"
        )
        out = self._chat(sys, user)
        if out:
            return out
        return (
            f"Deu erro: {error_msg}. Confira: (1) assinatura/retorno, (2) operadores (== vs =), "
            "(3) indentação e (4) casos-limite. Rode um teste pequeno e veja o que seu código devolve."
        )


# ---------------- Safe exec (captura stdout) ----------------
import contextlib
import io


def _safe_exec_with_output(code: str, user_ns: Optional[dict] = None) -> Tuple[Optional[dict], str, Optional[str]]:
    allowed_builtins = {
        "abs",
        "all",
        "any",
        "enumerate",
        "len",
        "max",
        "min",
        "range",
        "sum",
        "print",
        "map",
        "filter",
        "zip",
        "sorted",
        "list",
        "dict",
        "set",
        "tuple",
        "int",
        "float",
        "str",
        "bool",
    }
    safe_builtins = {k: getattr(builtins, k) for k in allowed_builtins if hasattr(builtins, k)}
    globals_ns = {"__builtins__": safe_builtins}
    locals_ns = user_ns if user_ns is not None else {}

    buf = io.StringIO()
    try:
        compiled = compile(code, "<user_code>", "exec")
        with contextlib.redirect_stdout(buf):
            exec(compiled, globals_ns, locals_ns)
        return locals_ns, buf.getvalue(), None
    except Exception as e:
        return None, buf.getvalue(), f"{type(e).__name__}: {e}"


# ---------------- Tests (tolerante a formatos diferentes) ----------------

def _infer_function_name(problem: Problem) -> Optional[str]:
    sig = (problem.expected_function_signature or "").strip()
    if sig.startswith("def "):
        # def foo(x):
        try:
            name = sig.split("def", 1)[1].split("(", 1)[0].strip()
            return name or None
        except Exception:
            return None
    # tenta inferir pela solution
    sol = (problem.solution or "")
    m = re.search(r"def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(", sol)
    if m:
        return m.group(1)
    return None


def _normalize_tests(problem: Problem) -> List[Dict[str, Any]]:
    # Junta testes visíveis + ocultos
    raw = (problem.tests or []) + (problem.test_cases_hidden or [])
    return [t for t in raw if isinstance(t, dict)]


def _run_tests(locals_ns: dict, problem: Problem) -> Tuple[bool, List[str], int]:
    tests = _normalize_tests(problem)
    fn_name = _infer_function_name(problem)

    messages: List[str] = []
    any_valid = 0
    all_ok = True

    for i, t in enumerate(tests, start=1):
        # Formato 1: {code: "eh_par(2)", expected: True}
        expr = t.get("code") or t.get("expr") or t.get("expression")
        expected = t.get("expected")

        # Formato 2: {args: [...], expected: ...} (+ optional kwargs)
        args = t.get("args")
        kwargs = t.get("kwargs")

        # Formato 3: {input: X, expected: Y}
        inp = t.get("input")

        try:
            if expr:
                any_valid += 1
                result = eval(str(expr), {"__builtins__": {}}, locals_ns)
                ok = (result == expected) if ("expected" in t) else True
                all_ok = all_ok and ok
                messages.append(
                    f"Teste {i}: {'OK' if ok else 'FALHOU'} — obtido={result!r}, esperado={expected!r}" if ("expected" in t) else f"Teste {i}: OK"
                )
                continue

            # chamada por função
            if fn_name and fn_name in locals_ns and callable(locals_ns[fn_name]):
                fn = locals_ns[fn_name]

                # args explícitos
                if args is not None or kwargs is not None:
                    any_valid += 1
                    a = args if isinstance(args, list) else ([] if args is None else [args])
                    k = kwargs if isinstance(kwargs, dict) else {}
                    result = fn(*a, **k)
                    ok = (result == expected) if ("expected" in t) else True
                    all_ok = all_ok and ok
                    messages.append(
                        f"Teste {i}: {'OK' if ok else 'FALHOU'} — obtido={result!r}, esperado={expected!r}" if ("expected" in t) else f"Teste {i}: OK"
                    )
                    continue

                # input único
                if "input" in t:
                    any_valid += 1
                    if isinstance(inp, dict):
                        result = fn(**inp)
                    elif isinstance(inp, list):
                        result = fn(*inp)
                    else:
                        result = fn(inp)
                    ok = (result == expected) if ("expected" in t) else True
                    all_ok = all_ok and ok
                    messages.append(
                        f"Teste {i}: {'OK' if ok else 'FALHOU'} — obtido={result!r}, esperado={expected!r}" if ("expected" in t) else f"Teste {i}: OK"
                    )
                    continue

            # teste inválido
            messages.append(f"Teste {i}: inválido (formato não suportado / sem dados suficientes).")
        except Exception as e:
            any_valid += 1
            all_ok = False
            messages.append(f"Teste {i}: FALHOU — exceção: {type(e).__name__}: {e}")

    # Se nenhum teste válido foi executado, NÃO considerar concluído
    if any_valid == 0:
        return False, ["Não há testes válidos configurados para este exercício (não posso marcar como concluído)."], 0

    return all_ok, messages, any_valid


# ---------------- Orchestrator ----------------
@dataclass
class Orchestrator:
    problem: Problem
    tutor: SocraticTutor = field(default_factory=SocraticTutor)
    state: Dict[str, Any] = field(default_factory=dict)
    metrics: Metrics = field(default_factory=Metrics)
    session_id: str = field(default_factory=lambda: str(uuid.uuid4()))

    def __post_init__(self):
        self.state.setdefault("attempts", [])
        self.state.setdefault("hints_given", [])
        self.state.setdefault("mode", "descricao")
        self.state.setdefault("user_code", "")
        self.state.setdefault("completed", False)
        self.state.setdefault("last_stdout", "")
        self.state.setdefault("last_error", None)
        self.state.setdefault("last_test_messages", [])
        self.state.setdefault("last_ai_help", "")

    def build_context(self) -> Dict[str, Any]:
        short_stmt = (self.problem.statement or "").strip()
        if len(short_stmt) > 220:
            short_stmt = short_stmt[:220].rstrip() + "..."
        return {
            "id": self.problem.id,
            "title": self.problem.title,
            "statement": short_stmt,
            "language": "Python",
            "constraints": self.problem.constraints or [],
        }

    def record_attempt(self, text: str):
        now = time.time()
        if self.metrics.t_first_attempt is None:
            self.metrics.t_first_attempt = now
        self.state["attempts"].append({"t": now, "text": text})

    def record_idle_time(self, seconds: float):
        self.metrics.idle_time_seconds += float(seconds)

    def request_hint(self) -> str:
        hints = self.problem.hints or []
        idx = len(self.state["hints_given"])
        if idx < len(hints):
            hint = hints[idx]
            self.state["hints_given"].append(hint)
            self.metrics.hints_used += 1
            return hint
        return "Não há mais dicas disponíveis para esta tarefa."

    def set_mode(self, mode: str):
        self.state["mode"] = mode

    def set_user_code(self, code: str):
        self.state["user_code"] = code

    def validate_submission(self) -> Dict[str, Any]:
        """Executa o código e testa. Conclui apenas se NÃO houver erro e testes PASSAREM."""
        code = (self.state.get("user_code") or "").rstrip()

        # reset outputs
        self.state["last_stdout"] = ""
        self.state["last_error"] = None
        self.state["last_test_messages"] = []
        self.state["last_ai_help"] = ""

        if not code.strip():
            self.state["completed"] = False
            return {"ok": False, "status": "vazio", "message": "Escreva um código antes de registrar."}

        locals_ns, stdout, err = _safe_exec_with_output(code, {})
        self.state["last_stdout"] = stdout

        if err is not None or locals_ns is None:
            self.state["completed"] = False
            self.state["last_error"] = err
            ai = self.tutor.explain_error(err, code, self.build_context())
            self.state["last_ai_help"] = ai
            return {
                "ok": False,
                "status": "erro_execucao",
                "message": "Seu código deu erro ao executar.",
                "stdout": stdout,
                "error": err,
                "ai_help": ai,
            }

        tests_ok, test_msgs, _n = _run_tests(locals_ns, self.problem)
        self.state["last_test_messages"] = test_msgs

        if not tests_ok:
            self.state["completed"] = False
            # ajuda da IA baseada em falha (sem entregar solução)
            ai = self.tutor.ask(
                "Me ajude a entender por que meu código falhou nos testes e como corrigir.",
                self.build_context(),
                current_code=code,
            )
            self.state["last_ai_help"] = ai
            return {
                "ok": False,
                "status": "falhou_testes",
                "message": "Executou, mas não passou nos testes.",
                "stdout": stdout,
                "tests": test_msgs,
                "ai_help": ai,
            }

        self.state["completed"] = True
        self.metrics.t_success = time.time()
        return {
            "ok": True,
            "status": "concluido",
            "message": "Concluído ✅",
            "stdout": stdout,
            "tests": test_msgs,
        }
