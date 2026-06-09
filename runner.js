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

# Redireciona a saída de tela (stdout)
stdout_buffer = io.StringIO()
sys.stdout = stdout_buffer

# Configura o ambiente de execução restrito (Sandbox)
allowed_builtins = [
    "abs", "all", "any", "enumerate", "len", "max", "min", "range", "sum", 
    "print", "map", "filter", "zip", "sorted", "list", "dict", "set", "tuple",
    "int", "float", "str", "bool"
]
safe_builtins = {k: getattr(builtins, k) for k in allowed_builtins if hasattr(builtins, k)}
globals_dict = {"__builtins__": safe_builtins}
locals_dict = {}

compilation_error = None
test_results = []

try:
    # user_code_to_run foi configurado via JS globals
    exec(user_code_to_run, globals_dict, locals_dict)
except Exception as e:
    compilation_error = f"{type(e).__name__}: {e}"

if not compilation_error:
    # Carrega testes e assinatura configurados via JS globals
    tests = json.loads(tests_json_to_test)
    func_name = function_name_to_test
    
    if func_name in locals_dict and callable(locals_dict[func_name]):
        func = locals_dict[func_name]
        for i, t in enumerate(tests, start=1):
            inp = t["in"]
            expected = t["out"]
            try:
                # Chama a função do estudante
                res = func(inp)
                ok = res == expected
                test_results.append({
                    "id": i,
                    "ok": bool(ok),
                    "result": repr(res),
                    "expected": repr(expected),
                    "error": None
                })
            except Exception as e:
                test_results.append({
                    "id": i,
                    "ok": False,
                    "result": None,
                    "expected": repr(expected),
                    "error": f"{type(e).__name__}: {e}"
                })
    else:
        compilation_error = f"Função '{func_name}' não encontrada ou não é chamável."

# Restaura o stdout original
stdout_val = stdout_buffer.getvalue()
sys.stdout = sys.__stdout__

# Devolve a estrutura de resposta serializada em JSON
json.dumps({
    "stdout": stdout_val,
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
