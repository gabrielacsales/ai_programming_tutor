import time
import streamlit as st
from core import Orchestrator, load_problems
from landing_page import render_landing  # função da landing page


# ---------------- Page config ----------------
st.set_page_config(page_title="IA Tutor", page_icon="🎓", layout="wide")

# ---------------- Design System  ----------------
DS_CSS = """
<style>
:root{
  --color-primary:#1CB0F6;
  --color-primary-hover:#169ad6;
  --color-bg:#F7F7F7;
  --color-surface:#FFFFFF;
  --color-border:#E5E5E5;
  --color-text:#3C3C3C;
  --color-text-muted:#777777;

  --radius-md:12px;
  --radius-lg:16px;

  --space-xs:4px;
  --space-sm:8px;
  --space-md:16px;
  --space-lg:24px;
  --space-xl:32px;

  --shadow-soft:0 2px 0 rgba(0,0,0,0.06);
  --shadow-hover:0 4px 0 rgba(0,0,0,0.10);
}

.stApp{ background: var(--color-bg); }
.ds-container{ max-width: 1120px; margin: 0 auto; padding: 8px 4px; }
.ds-h1{ font-size: 42px; font-weight: 800; color: var(--color-text); margin: 0; }
.ds-h2{ font-size: 28px; font-weight: 800; color: var(--color-text); margin: 0; }
.ds-p{ font-size: 16px; color: var(--color-text-muted); margin-top: 10px; }

.ds-card{
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 22px;
  box-shadow: var(--shadow-soft);
}

button[kind="primary"]{
  background: var(--color-primary) !important;
  border: 0 !important;
  color: #fff !important;
  box-shadow: var(--shadow-soft) !important;
  border-radius: var(--radius-md) !important;
  font-weight: 800 !important;
  text-transform: uppercase !important;
  letter-spacing: .5px !important;
}
button[kind="primary"]:hover{ background: var(--color-primary-hover) !important; }
button[kind="secondary"]{ border-radius: var(--radius-md) !important; }

/* deixa text_area com cara de editor */
textarea{
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace !important;
  font-size: 14px !important;
}

section[data-testid="stSidebar"]{
  background: #ffffff;
  border-right: 1px solid var(--color-border);
}
</style>
"""

st.markdown(DS_CSS, unsafe_allow_html=True)


# ---------------- Simple router ----------------
if "route" not in st.session_state:
    st.session_state["route"] = "landing"


def go_app():
    st.session_state["route"] = "app"


def go_landing():
    st.session_state["route"] = "landing"


# def render_landing():
#     st.markdown('<div class="ds-container">', unsafe_allow_html=True)

#     colA, _ = st.columns([4, 1])
#     with colA:
#         st.markdown(
#             '<div style="display:flex;align-items:center;gap:10px;">'
#             '<div style="width:14px;height:14px;border-radius:999px;background:var(--color-primary);"></div>'
#             '<div style="font-weight:900;font-size:20px;color:var(--color-text);">IA Tutor</div>'
#             "</div>",
#             unsafe_allow_html=True,
#         )

#     st.markdown("<div style='height:36px'></div>", unsafe_allow_html=True)

#     hero_left, hero_right = st.columns([1.2, 1])
#     with hero_left:
#         st.markdown(
#             '<h1 class="ds-h1">Aprenda programação<br/>sem depender da resposta pronta.</h1>',
#             unsafe_allow_html=True,
#         )
#         st.markdown(
#             '<p class="ds-p">Um tutor socrático para evoluir sua lógica em Python.</p>',
#             unsafe_allow_html=True,
#         )
#         c1, c2 = st.columns(2)
#         with c1:
#             st.button("Começar agora", type="primary", use_container_width=True, on_click=go_app)
#         with c2:
#             st.button("Ver como funciona", use_container_width=True)
#         st.caption("⚠️ Protótipo de Trabalho de Conclusão de Curso.")

#     with hero_right:
#         st.markdown(
#             """<div class="ds-card">
#                 <div style="font-weight:900;font-size:16px;color:var(--color-text);">O que você ganha</div>
#                 <div style="height:10px"></div>
#                 <div style="display:flex;flex-direction:column;gap:10px">
#                   <div><b>Dicas graduais</b><br/><span style="color:var(--color-text-muted)">para destravar</span></div>
#                   <div><b>Execução do código</b><br/><span style="color:var(--color-text-muted)">mostra erro/saída</span></div>
#                   <div><b>Ajuda ao errar</b><br/><span style="color:var(--color-text-muted)">IA orienta sem gabarito</span></div>
#                 </div>
#             </div>""",
#             unsafe_allow_html=True,
#         )

#     st.markdown("</div>", unsafe_allow_html=True)


def render_app():
    st.markdown('<div class="ds-container">', unsafe_allow_html=True)

    h1, h2, h3 = st.columns([2, 1, 1])
    with h1:
        st.markdown(
            '<div style="display:flex;align-items:center;gap:10px;">'
            '<div style="width:14px;height:14px;border-radius:999px;background:var(--color-primary);"></div>'
            '<div style="font-weight:900;font-size:20px;color:var(--color-text);">IA Tutor</div>'
            "</div>",
            unsafe_allow_html=True,
        )
    with h2:
        st.caption("Socrático • Anti-overreliance")
    with h3:
        st.button("Página inicial", use_container_width=True, on_click=go_landing)

    # ---------------- Load problems ----------------
    PROBLEMS_PATH = "problems/logic_basics.yaml"
    problems = load_problems(PROBLEMS_PATH)

    # ---------------- Sidebar ----------------
    st.sidebar.header("Exercícios")
    problem_titles = {p.title: p for p in problems}
    choice = st.sidebar.selectbox("Selecione um exercício", list(problem_titles.keys()))
    problem = problem_titles[choice]

    # ---------------- Session state ----------------
    if "orch" not in st.session_state or st.session_state.get("current_problem") != problem.id:
        st.session_state["orch"] = Orchestrator(problem=problem)
        st.session_state["current_problem"] = problem.id
        st.session_state["last_attempt_time"] = None
        st.session_state["last_run"] = None  # resultado do último registro

    orch: Orchestrator = st.session_state["orch"]

    # -------- idle time metric --------
    now = time.time()
    last = st.session_state.get("last_attempt_time")
    if last is not None:
        idle = now - last
        if idle > 5:
            orch.record_idle_time(idle)
    st.session_state["last_attempt_time"] = now

    # ---------------- Problem card ----------------
    st.markdown(
        f"""<div class="ds-card">
        <div style="font-weight:900;font-size:18px;color:var(--color-text);">{problem.title}</div>
        <div style="height:8px"></div>
        <div style="color:var(--color-text-muted);white-space:pre-wrap;">{problem.statement}</div>
        </div>""",
        unsafe_allow_html=True,
    )

    st.markdown("<div style='height:14px'></div>", unsafe_allow_html=True)

    mode = st.radio("", ["Descrever ideia", "Escrever código (Python)"], horizontal=True)

    # ---------------- Idea ----------------
    if mode == "Descrever ideia":
        orch.set_mode("descricao")
        idea = st.text_area(
            "Escreva sua ideia",
            value="",
            height=220,
            placeholder="Descreva em passos o que você pretende fazer...",
            key="idea_box",
        )

        col1, col2 = st.columns([1, 2])
        with col1:
            if st.button("Pergunte ao professor", type="primary", use_container_width=True):
                orch.record_attempt(idea)
                ctx = orch.build_context()
                feedback = orch.tutor.critique_idea(idea, ctx)
                st.session_state["idea_feedback"] = feedback
        with col2:
            pass

        if st.session_state.get("idea_feedback"):
            st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)
            st.info(st.session_state["idea_feedback"])

    # ---------------- Code ----------------
    else:
        orch.set_mode("codigo")
        default_code = orch.state.get("user_code", "") or ""

        code = st.text_area(
            "Escreva seu código (Python)",
            value=default_code,
            height=220,
            placeholder="Digite seu código aqui...",
            key="code_box",
        )
        orch.set_user_code(code)

        c1, c2, c3 = st.columns([1, 1, 2])
        with c1:
            run_clicked = st.button("Registrar código", type="primary", use_container_width=True)
        with c2:
            if st.button("Hint", use_container_width=True):
                st.toast(orch.request_hint())
        with c3:
            st.caption("Dica: use print() para ver saídas.")

        if run_clicked:
            orch.record_attempt(code)
            st.session_state["last_run"] = orch.validate_submission()

        # --------- Status ---------
        last_run = st.session_state.get("last_run")
        if last_run:
            if last_run.get("ok") is True and orch.state.get("completed") is True:
                st.success("Concluído ✅")
            else:
                st.warning("Ainda não concluído")

            # --------- Resultado da execução ---------
            st.markdown("### Resultado do código")
            stdout = last_run.get("stdout") or ""
            err = last_run.get("error")

            if stdout.strip():
                st.markdown("**Saída (stdout):**")
                st.code(stdout, language="text")
            else:
                st.markdown("**Saída (stdout):** *(vazia)*")

            if err:
                st.markdown("**Erro:**")
                st.code(err, language="text")

                # IA logo abaixo do erro
                ai_help = last_run.get("ai_help") or ""
                if ai_help:
                    st.markdown("### Ajuda do professor")
                    st.info(ai_help)
            else:
                # Se não teve erro, mas falhou testes, mostre ajuda logo abaixo também
                if last_run.get("status") == "falhou_testes":
                    ai_help = last_run.get("ai_help") or ""
                    if ai_help:
                        st.markdown("### Ajuda do professor")
                        st.info(ai_help)

                # Detalhes de testes só se existirem e fizer sentido
                tests = last_run.get("tests")
                if tests:
                    with st.expander("Verificação (testes)"):
                        for line in tests:
                            st.write(line)

    st.markdown("</div>", unsafe_allow_html=True)


if st.session_state["route"] == "landing":
    render_landing()
else:
    render_app()
