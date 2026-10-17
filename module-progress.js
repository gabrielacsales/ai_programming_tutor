/* Progresso visual por módulo: somente conclusão real carregada da conta.
 * Não altera permissões, desbloqueios ou dados do Supabase. */
(function () {
  "use strict";

  function calculate(ids, completedIds) {
    const uniqueExercises = [...new Set(ids.filter(Boolean))];
    const completed = new Set(completedIds || []);
    const total = uniqueExercises.length;
    const done = uniqueExercises.filter(id => completed.has(id)).length;
    const percent = total ? Math.round(done * 100 / total) : 0;
    return { done, total, percent };
  }

  function element(tag, className, text) {
    const result = document.createElement(tag);
    if (className) result.className = className;
    if (text != null) result.textContent = text;
    return result;
  }

  function render(moduleCard, completedIds) {
    const moduleNumber = moduleCard.dataset.moduleNumber;
    const exerciseIds = Array.from(moduleCard.querySelectorAll(".exercise-link[data-exercise-id]"),
      link => link.dataset.exerciseId);
    const { done, total, percent } = calculate(exerciseIds, completedIds);
    if (!total) return;

    let container = moduleCard.querySelector(".module-learning-progress");
    if (!container) {
      container = element("section", "module-learning-progress");
      container.setAttribute("aria-label", "Progresso do Módulo " + moduleNumber);

      const heading = element("div", "module-learning-progress__head");
      const label = element("span", "module-learning-progress__label", "Seu progresso neste módulo");
      const percentage = element("strong", "module-learning-progress__percent");
      heading.append(label, percentage);

      const track = element("div", "module-learning-progress__track");
      track.setAttribute("role", "progressbar");
      track.setAttribute("aria-label", "Exercícios concluídos no Módulo " + moduleNumber);
      track.setAttribute("aria-valuemin", "0");
      track.setAttribute("aria-valuemax", "100");
      const fill = element("div", "module-learning-progress__fill");
      fill.setAttribute("aria-hidden", "true");
      track.appendChild(fill);

      const footer = element("div", "module-learning-progress__footer");
      footer.append(
        element("span", "module-learning-progress__count"),
        element("span", "module-learning-progress__motivation")
      );
      container.append(heading, track, footer);

      // Fica entre o cabeçalho do módulo e os exercícios, inclusive no celular.
      moduleCard.firstElementChild.insertAdjacentElement("afterend", container);
    }

    container.classList.toggle("is-complete", done === total);
    container.querySelector(".module-learning-progress__percent").textContent = percent + "%";
    const progressbar = container.querySelector('[role="progressbar"]');
    progressbar.setAttribute("aria-valuenow", String(percent));
    progressbar.setAttribute("aria-valuetext", done + " de " + total + " exercícios concluídos");
    container.querySelector(".module-learning-progress__fill").style.width = percent + "%";
    container.querySelector(".module-learning-progress__count").textContent =
      done + " de " + total + " exercícios concluídos";
    container.querySelector(".module-learning-progress__motivation").textContent =
      done === total ? "Módulo concluído! ✨" :
      done === 0 ? "Seu próximo desafio começa aqui!" :
      "Continue, faltam " + (total - done) + "!";
  }

  function update(completedIds) {
    document.querySelectorAll(".module-learning-card[data-module-number]").forEach(card => {
      render(card, completedIds);
    });
  }

  window.TutorModuleProgress = { calculate, update };
})();
