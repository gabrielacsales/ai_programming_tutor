import streamlit as st

def go_app():
    st.session_state["route"] = "app"

def render_landing():
    st.markdown('<div class="ds-container">', unsafe_allow_html=True)

    # Top bar
    colA, colB = st.columns([4, 1])
    with colA:
        st.markdown('<div style="display:flex;align-items:center;gap:10px;">'
                    '<div style="width:14px;height:14px;border-radius:999px;background:var(--color-primary);"></div>'
                    '<div style="font-weight:900;font-size:20px;color:var(--color-text);">IA Tutor</div>'
                    '</div>', unsafe_allow_html=True)
    with colB:
        st.markdown('<div> <br/> </div>', unsafe_allow_html=True)
        # st.button("Começar agora", use_container_width=True, on_click=go_app)

    st.markdown("<div style='height:36px'></div>", unsafe_allow_html=True)

    # Hero
    hero_left, hero_right = st.columns([1.2, 1])
    with hero_left:
        st.markdown('<h1 class="ds-h1">Aprenda programação<br/>sem depender da resposta pronta.</h1>', unsafe_allow_html=True)
        st.markdown('<p class="ds-p">Uma aplicação de IA para evitar superdependencia e guiar sua evolução em lógica em Python.</p>', unsafe_allow_html=True)
        
        c1, c2 = st.columns(2)
        with c1:
            st.button("Começar agora", type="primary", use_container_width=True, on_click=go_app)
        with c2:
            st.button("Ver como funciona", use_container_width=True)
        st.caption("⚠️ Protótipo de Trabalho de Conclusão de Curso.")

    with hero_right:
        st.markdown(
            """<div class="ds-card">
                <div style="font-weight:900;font-size:16px;color:var(--color-text);">O que você ganha</div>
                <div style="height:10px"></div>
                <div class="ds-grid" style="grid-template-columns:1fr;gap:10px">
                  <div style="display:flex;gap:10px;align-items:flex-start;">
                    <div class="ds-badge">1</div>
                    <div><b>Dicas graduais</b><br/><span style="color:var(--color-text-muted)">dicas por nível para destravar</span></div>
                  </div>
                  <div style="display:flex;gap:10px;align-items:flex-start;">
                    <div class="ds-badge">2</div>
                    <div><b>Professor Socrático</b><br/><span style="color:var(--color-text-muted)">perguntas que fazem você pensar</span></div>
                  </div>
                  <div style="display:flex;gap:10px;align-items:flex-start;">
                    <div class="ds-badge">3</div>
                    <div><b>Auxilio em Erros</b><br/><span style="color:var(--color-text-muted)">Ao rodar o código ter apoio</span></div>
                  </div>
                  <div style="display:flex;gap:10px;align-items:flex-start;">
                    <div class="ds-badge">4</div>
                    <div><b>Métricas</b><br/><span style="color:var(--color-text-muted)">IPT, TRIB, RER, IT</span></div>
                  </div>
                </div>
            </div>""", unsafe_allow_html=True
        )

    st.markdown("<div style='height:22px'></div>", unsafe_allow_html=True)
    st.markdown("</br>",unsafe_allow_html=True)

    # Feature cards
    st.markdown('<h2 class="ds-h2">Como funciona ? </h2>', unsafe_allow_html=True)
    st.markdown("<div style='height:12px'></div>", unsafe_allow_html=True)
    
    st.markdown(
        """<div class="ds-grid">
          <div class="ds-card">
            <div style="font-weight:900">Escolha um exercício</div>
            <div class="ds-p" style="margin:8px 0 0 0">Enunciado + restrições e exemplos do professor.</div>
          </div>
          <div class="ds-card">
            <div style="font-weight:900">Tente (ideia ou código)</div>
            <div class="ds-p" style="margin:8px 0 0 0">Registra tentativa e recebe feedback sem gabarito.</div>
          </div>
          <div class="ds-card">
            <div style="font-weight:900">Conclua e valide</div>
            <div class="ds-p" style="margin:8px 0 0 0">Testes + justificativa (JQ) para reforçar metacognição.</div>
          </div>
        </div>""", unsafe_allow_html=True
    )

    # st.markdown("<div style='height:26px'></div>", unsafe_allow_html=True)
    # st.markdown('<div class="ds-card" style="display:flex;justify-content:space-between;align-items:center;gap:16px;">'
    #             '<div><div style="font-weight:900;font-size:18px;">Pronto para começar?</div>'
    #             '<div class="ds-p" style="margin:6px 0 0 0;">Entre e escolha seu primeiro exercício.</div></div>'
    #             '<div style="min-width:260px;">', unsafe_allow_html=True)
    # if st.button("Começar agora ✅", type="primary", use_container_width=True):
    #     go_app()
    #     st.rerun()
    # st.markdown('</div></div>', unsafe_allow_html=True)

    st.markdown('</div>', unsafe_allow_html=True)