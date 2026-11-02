# Teste do editor Python e da nova avaliação

## Regras pedagógicas explicadas ao aluno
- **`entrada` é fornecida automaticamente**, com valor diferente em cada caso de teste; não digite `entrada = 6` no seu código.
- Para módulos 1–3, escreva um script que utiliza `entrada` e mostra resultado com `print()`.
- Nos exercícios de função (módulos 4–5 e final), siga o nome/parâmetro do enunciado e use `return`.
- O código é **executado no Pyodide, interpretador Python real compilado para WebAssembly**, no navegador. Não é o Gemini quem determina acertos.
- O texto de saída mostra **apenas o primeiro caso**, e a tabela mostra a entrada, saída esperada e saída obtida em **cada caso**.
- Resolução de problemas de lógica deve ser generalizável: passar só no exemplo não conclui a atividade.

## Passos
1. Baixe a versão atual da branch `feature/supabase-auth-and-database`, extraia em uma nova pasta e execute `python -m http.server 8000`.
2. Entre em `http://localhost:8000/login.html`. Na primeira visita **neste navegador com essa conta**, a aba **Descrever ideia** pode abrir primeiro como acolhimento. Nas próximas entradas, o **editor de código** é a primeira aba e o modo padrão.
3. Abra **Dobro de um Número**. O editor deve mostrar números de linha, colorização Python e autoindentação. Digite:

```python
entrada = 6
dobro = entrada * 2
print(dobro)
```

4. Clique **Registrar código**. Deve passar **1/4** casos: 6 → 12; os demais têm entrada diferente e obtêm 12 incorretamente. Deve aparecer a explicação **não redefina entrada**.
5. **Remova** a linha `entrada = 6` e teste de novo. Agora os **4/4** casos devem passar. Confira se a tabela mostra também as entradas **6, 0, -4, 15** e respectivos resultados.
6. Na aba **Exemplos do professor**, confira que o código tem fonte monoespaçada e destaque de sintaxe, numa caixa apenas de leitura.
7. Teste uma função do módulo 4: o editor deve iniciar com o nome e parâmetro corretos, e os resultados individuais devem mostrar retornos de função. Funções não são avaliadas por `print()`.
8. Mude de exercício e volte; recarregue a página; faça logout/login e confira se o código foi salvo.
9. Depois de 90 segundos sem interagir no editor, confira que aparece um **convite opcional** a descrever a ideia. **Nunca** deve trocar de aba automaticamente. Se a revisão em blocos estiver aberta, não deve contar esse tempo para o convite.
10. Teste a tecla Tab dentro do editor: deve inserir 4 espaços/indentar; mantenha Shift+Tab para diminuir recuo. Se o CDN CodeMirror estiver bloqueado, a aplicação deve continuar com textarea simples.

## Limitações e próximos passos
- CodeMirror faz **realce de sintaxe, indentação e números de linha**. Ele **não executa Python** e não faz formatação automática integral tipo Black; quem executa é o Pyodide.
- Esta mudança foi conferida por leitura de código e sintaxe JS; **a interface real e a execução WASM ainda precisam ser validadas no navegador**.
- No momento os testes são públicos no código JavaScript. O browser não é uma fonte inviolável para certificação, mesmo utilizando Python de verdade; a futura coleta acadêmica deve utilizar validação de conclusão no backend.
- Esta atualização de UI e execução **não exige alterações adicionais no Supabase**, além das migrations de versão já indicadas anteriormente.
