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
tests = json.loads(tests_json_to_test)
func_name = function_name_to_test

# Modo Função vs Modo Script
is_function_mode = bool(func_name) and (f"def {func_name}" in user_code_to_run)

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
            # Converte expected para string para comparar com texto impresso
            expected_str = str(expected)
            
            ok = (out_str == expected_str)
            test_results.append({
                "id": i,
                "ok": bool(ok),
                "result": out_str,
                "expected": expected_str,
                "error": None
            })
        except Exception as e:
            test_results.append({
                "id": i,
                "ok": False,
                "result": None,
                "expected": str(expected),
                "error": f"{type(e).__name__}: {e}"
            })

stdout_val = stdout_buffer.getvalue()
sys.stdout = sys.__stdout__

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
