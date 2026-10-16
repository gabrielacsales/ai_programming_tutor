# Contas desenvolvedora e aluno — liberar exercícios com segurança

Status: **código implementado na branch `feature/supabase-auth-and-database`**, mas **ainda precisa executar a migração SQL no Supabase e testar**.

## 1. Criar permissões no Supabase
1. Vá a **Supabase → SQL Editor → New query**.
2. Abra no GitHub o arquivo `supabase/developer-access.sql`.
3. Copie e execute o arquivo inteiro no SQL Editor.
4. A mensagem correta é **Success. No rows returned**.
5. Essa migração **não apaga exercícios, usuários nem progresso**. Ela cria a lista de desenvolvedores e as regras oficiais de desbloqueio, protegidas por RLS e funções que checam a conta autenticada.

## 2. Autorizar SOMENTE sua própria conta
No **SQL Editor** do Supabase, execute **um SQL separado**, substituindo `SEU_EMAIL_AQUI` pelo endereço de e-mail que você usou para criar sua conta no site:

```sql
insert into public.developer_accounts(user_id)
select id from auth.users where lower(email) = lower('SEU_EMAIL_AQUI')
on conflict (user_id) do nothing;
```

**Não me envie seu e-mail ou ID do usuário. Não coloque esse SQL com seu e-mail no GitHub.**

Se aparecer **Success. No rows returned**, isso só indica que o comando terminou; verifique que sua conta realmente entrou:

```sql
select u.email, d.granted_at
from public.developer_accounts d
join auth.users u on u.id = d.user_id;
```

Deve retornar **uma linha com seu e-mail**. Se não retornar nenhuma, confira o endereço digitado e se essa conta já foi cadastrada no sistema.

Somente quem administra o banco pode adicionar/remover pessoas nessa tabela. O aluno não tem permissão para promover a si próprio. Todos os demais usuários são **student/aluno** automaticamente.

## 3. Baixar o projeto atualizado e testar
1. Baixe novamente o ZIP da branch `feature/supabase-auth-and-database`.
2. Extraia em uma pasta nova, abra no VS Code e rode `python -m http.server 8000`.
3. Entre na sua conta de desenvolvedora. Na página de conteúdos, deve aparecer a indicação **Modo desenvolvedora** e os 15 exercícios + desafio final devem estar liberados, mesmo sem terminar os anteriores.
4. Abra um exercício distante, por exemplo de módulo 5. O popup de revisão ainda deve aparecer.
5. Saia e entre com **outra conta de teste**. Ela deve mostrar a sequência normal: só o primeiro desafio e aqueles cujos pré-requisitos foram concluídos estão liberados; o desafio final permanece bloqueado.
6. Tente navegar manualmente, na conta aluno, até `http://localhost:8000/tutor.html?exercise=m5_extremos`. O sistema deve redirecionar para `conteudos.html` sem carregar o exercício.
7. Verifique que login, Gemini, histórico e progresso permanecem funcionando.

## Como funciona
- A autorização `developer` existe exclusivamente na tabela `public.developer_accounts` (não em uma variável ou na página HTML).
- `public.get_tutor_access()` consulta quais exercícios estão liberados para a conta autenticada.
- `public.can_access_exercise(exercise_id)` verifica acesso no Supabase, inclusive quando alguém digita a URL manualmente.
- Políticas RLS de `exercise_progress` impedem gravações em exercícios ainda bloqueados para a conta.
- O desbloqueio do aluno continua usando os registros de conclusão que já estão em `exercise_progress` e o desafio final exige os cinco desafios finais de módulo.
- Corrigidos cinco links da página `conteudos.html` que apontavam para IDs desatualizados.

### Limitação importante do TCC
O papel **developer** é protegido pelo banco, mas **a conclusão dos exercícios ainda é calculada no navegador (Pyodide)**. Um aluno tecnicamente avançado pode falsificar o resultado `completed` e liberar a progressão. Antes da coleta formal com alunos, vamos precisar validar os resultados em um servidor confiável. As permissões de desenvolvedor, entretanto, não podem ser concedidas com uma alteração no JavaScript local.

Não é necessário criar novas Secrets ou outra função Gemini. Não execute novamente `supabase/schema.sql`.
