// Executador de código Python via Pyodide (WebAssembly)
class CodeRunner {
  constructor() {
    this.pyodide = null;
    this.loading = false;
  }

  // Inicializa o Pyodide carregando os arquivos WebAssembly
  async init(onProgress) {
    if (this.pyodide) return this.pyodide;
    if (this.loading) {
      // Espera até que já esteja carregado
      while (this.loading) {
        await new Promise(r => setTimeout(r, 100));
      }
      return this.pyodide;
    }

    this.loading = true;
    if (onProgress) onProgress("Carregando Python em WebAssembly...");

    try {
      // Carrega o Pyodide usando a biblioteca inserida no HTML
      this.pyodide = await loadPyodide();
      if (onProgress) onProgress("Python carregado com sucesso!");
    } catch (e) {
      console.error("Falha ao carregar o Pyodide:", e);
      if (onProgress) onProgress("Erro ao carregar o interpretador Python.");
      throw e;
    } finally {
      this.loading = false;
    }

    return this.pyodide;
  }

  // Executa o código e valida contra os casos de teste
  async run(code, functionName, tests) {
    if (!this.pyodide) {
      await this.init();
    }

    // Passa os parâmetros do JS para o escopo global do Pyodide para evitar bugs de string escaping
    this.pyodide.globals.set("user_code_to_run", code);
    this.pyodide.globals.set("function_name_to_test", functionName);
    this.pyodide.globals.set("tests_json_to_test", JSON.stringify(tests));

    // Script Python Wrapper que simula o _safe_exec_with_output e _run_tests
    const runnerScript = `
import sys
import io
import json
import builtins
import traceback
import ast
import math

stdout_buffer = io.StringIO()
sys.stdout = stdout_buffer

allowed_builtins = [
    "abs", "all", "any", "enumerate", "len", "max", "min", "range", "sum", 
    "print", "map", "filter", "zip", "sorted", "list", "dict", "set", "tuple",
    "int", "float", "str", "bool", "round", "type"
]
safe_builtins = {k: getattr(builtins, k) for k in allowed_builtins if hasattr(builtins, k)}
globals_dict = {"__builtins__": safe_builtins}

compilation_error = None
test_results = []
preview_stdout = ""
tests = json.loads(tests_json_to_test)

# Diagnóstico pedagógico: 'entrada' vem do avaliador e varia entre os testes.
# Uma reatribuição de 'entrada' no código causa resultados constantes incorretos.
input_overwritten = False
try:
    student_tree = ast.parse(user_code_to_run)
    input_overwritten = any(
        isinstance(node, ast.Name) and node.id == "entrada" and isinstance(node.ctx, ast.Store)
        for node in ast.walk(student_tree)
    )
except SyntaxError:
    pass
func_name = function_name_to_test

# Modo Função vs Modo Script
is_function_mode = bool(func_name)

if is_function_mode:
    # MODO FUNÇÃO (Módulo 4+)
    locals_dict = {}
    try:
        exec(user_code_to_run, globals_dict, locals_dict)
    except Exception as e:
        compilation_error = f"{type(e).__name__}: {e}"

    if not compilation_error:
        if func_name in locals_dict and callable(locals_dict[func_name]):
            func = locals_dict[func_name]
            for i, t in enumerate(tests, start=1):
                inp = t["in"]
                expected = t["out"]
                try:
                    res = func(inp)
                    ok = (res == expected)
                    test_results.append({
                        "id": i,
                        "ok": bool(ok),
                        "result": repr(res),
                        "expected": repr(expected),
                        "input": repr(inp),
                        "error": None
                    })
                except Exception as e:
                    test_results.append({
                        "id": i,
                        "ok": False,
                        "result": None,
                        "expected": repr(expected),
                        "input": repr(inp),
                        "error": f"{type(e).__name__}: {e}"
                    })
        else:
            compilation_error = f"Função '{func_name}' não encontrada ou não é chamável."

else:
    # MODO SCRIPT (Módulo 1 a 3)
    for i, t in enumerate(tests, start=1):
        inp = t["in"]
        expected = t["out"]
        
        stdout_buffer.seek(0)
        stdout_buffer.truncate(0)
        
        test_locals = {}
        # Injetamos a entrada do teste na variável 'entrada'
        test_locals['entrada'] = inp
        
        try:
            exec(user_code_to_run, globals_dict, test_locals)
            
            # Captura a saída do print
            out_str = stdout_buffer.getvalue().strip()
            if i == 1:
                preview_stdout = out_str
            # Compare tipos/valores, não apenas texto. Evita penalizar '77' vs '77.0'
            # e permite listas, números negativos e booleanos exibidos corretamente.
            # Para enunciados de texto, preservamos a comparação literal.
            expected_str = str(expected)
            if isinstance(expected, str):
                ok = (out_str == expected)
            else:
                try:
                    parsed = ast.literal_eval(out_str)
                    if isinstance(expected, bool):
                        ok = type(parsed) is bool and parsed == expected
                    elif isinstance(expected, (int, float)) and not isinstance(parsed, bool):
                        ok = isinstance(parsed, (int, float)) and math.isclose(
                            float(parsed), float(expected), rel_tol=1e-9, abs_tol=1e-9
                        )
                    else:
                        ok = parsed == expected
                except (SyntaxError, ValueError, TypeError, MemoryError):
                    ok = False
            test_results.append({
                "id": i,
                "ok": bool(ok),
                "result": out_str,
                "expected": expected_str,
                "input": repr(inp),
                "error": None
            })
        except Exception as e:
            test_results.append({
                "id": i,
                "ok": False,
                "result": None,
                "expected": str(expected),
                "input": repr(inp),
                "error": f"{type(e).__name__}: {e}"
            })

sys.stdout = sys.__stdout__

json.dumps({
    "stdout": preview_stdout,
    "input_overwritten": input_overwritten,
    "error": compilation_error,
    "test_results": test_results
})
`;

    const jsonResult = await this.pyodide.runPythonAsync(runnerScript);
    return JSON.parse(jsonResult);
  }
}

// Torna global no navegador
window.CodeRunner = CodeRunner;
