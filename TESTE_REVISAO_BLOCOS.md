# Revisão rápida em blocos — teste local

Implementação da revisão de sintaxe em formato de minijogo antes de cada exercício.

## Como testar

1. Baixe a versão mais recente da branch `feature/supabase-auth-and-database` e extraia o ZIP em uma **nova pasta**.
2. Abra a pasta no VS Code e execute `python -m http.server 8000`.
3. Acesse `http://localhost:8000/login.html`, entre com sua conta e abra qualquer exercício.
4. O modal **Revisão rápida** deve abrir automaticamente.
5. Toque no bloco errado: ele **não** deve entrar na linha e um feedback orienta tentar novamente.
6. Toque nos blocos corretos em ordem: cada um entra na área de resposta. Ao terminar, aparece **Começar exercício →**.
7. Clique no botão: o modal fecha e o exercício normal fica disponível, com o progresso já salvo preservado.
8. Entre em exercícios de outros módulos para testar revisões de comparações, operações, `for`, funções e listas.
9. Clique em **Pular** e confira que é possível prosseguir sem concluir a revisão; nada do banco deve ser apagado.
10. Confira a visualização também no celular, reduzindo a janela do navegador.

## Arquivos
- `preflight-review.js`: perguntas contextuais, lógica de ordenação e feedback.
- `preflight-review.css`: interface responsiva.
- `tutor.html`: inclui os arquivos.
- `app.js`: abre o modal no carregamento e troca do exercício.

## Observações
- A revisão **não** dá a resposta do exercício principal; usa exemplos pequenos e paralelos.
- Aparece toda vez que se entra em um exercício. **Pular** é intencional para não atrapalhar a acessibilidade nem os testes com participantes.
- Nesta versão, conclusão e erros **não são persistidos no banco**; ainda não fazem parte dos indicadores do TCC. Isso evita mudar as métricas sem validar os instrumentos de pesquisa.
- Não requer novo SQL, secrets, nem nova Edge Function.
- Não faça Merge ou publicação para participantes reais antes de validar fluxo e coleta acadêmica.
