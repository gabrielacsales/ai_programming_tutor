// Supabase Edge Function: exclusão de conta com senha confirmada no servidor.
// Implantar com JWT verification habilitada. Nunca expor SERVICE_ROLE_KEY no frontend.
import { createClient } from "npm:@supabase/supabase-js@2";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};
const respond = (payload: object, status = 200) =>
  new Response(JSON.stringify(payload), { status, headers });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return respond({ error: "Método não permitido." }, 405);
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !service) return respond({ error: "Serviço indisponível." }, 503);

  const bearer = request.headers.get("authorization") || "";
  if (!/^Bearer\s+\S+$/i.test(bearer)) return respond({ error: "Faça login novamente." }, 401);
  const token = bearer.replace(/^Bearer\s+/i, "").trim();

  try {
    const body = await request.json();
    const password = body?.password;
    if (typeof password !== "string" || password.length < 1 || password.length > 1024) {
      return respond({ error: "Informe sua senha para confirmar." }, 400);
    }
    const authClient = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: identity, error: identityError } = await authClient.auth.getUser(token);
    const user = identity?.user;
    if (identityError || !user?.id || !user.email) {
      return respond({ error: "Sessão inválida. Entre novamente." }, 401);
    }

    // Validação efetiva da senha no backend, sem depender do formulário.
    const { data: check, error: passwordError } = await authClient.auth.signInWithPassword({
      email: user.email,
      password,
    });
    if (passwordError || check?.user?.id !== user.id) {
      return respond({ error: "Senha incorreta. Confira e tente novamente." }, 403);
    }

    const admin = createClient(url, service, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    // Exclusão permanente; FKs ON DELETE CASCADE apagam os dados vinculados.
    const { error: deletionError } = await admin.auth.admin.deleteUser(user.id);
    if (deletionError) {
      console.error("Falha ao excluir conta:", deletionError.message);
      return respond({ error: "Não foi possível excluir a conta. Tente novamente ou contate o suporte." }, 500);
    }
    return respond({ success: true });
  } catch (err) {
    console.error("Erro inesperado na exclusão:", err);
    return respond({ error: "Não foi possível concluir a solicitação." }, 500);
  }
});
