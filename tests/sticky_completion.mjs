// Regressão executável: conclusão é irreversível no currículo atual.
// Sem acesso à internet nem ao Supabase real.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script, createContext } from "node:vm";

const storage = new Map();
const db = new Map();
const writes = [];
const client = {
  auth: {
    async getUser() {
      return { data: { user: { id: "student-test" } }, error: null };
    },
  },
  from(table) {
    assert.equal(table, "exercise_progress");
    return {
      select() {
        return Promise.resolve({ data: [...db.values()], error: null });
      },
      upsert(row) {
        return {
          select() {
            return {
              async single() {
                db.set(row.exercise_id, { ...row });
                writes.push({ id: row.exercise_id, completed: row.completed });
                return { data: { ...row }, error: null };
              },
            };
          },
        };
      },
    };
  },
};
const script = new Script(readFileSync(new URL("../progress-store.js", import.meta.url), "utf8"));
function newSession() {
  const window = { TutorAuth: { client } };
  const localStorage = { setItem(k, v) { storage.set(k, v); } };
  script.runInContext(createContext({ window, localStorage, console, Date, Map, Promise, Set, String, Number }));
  return window.TutorProgress;
}
function save(store, exerciseId, completed, code) {
  return store.save(exerciseId, {
    completed, user_code: code, user_idea: "",
    metrics: { code_submissions: 1 },
  });
}

const store = newSession();
await store.init();
const id = "m1_imc";
assert.equal((await save(store, id, false, "wrong first")).completed, false);
assert.equal((await save(store, id, true, "correct")).completed, true);
assert.equal((await save(store, id, false, "wrong later")).completed, true);
assert.equal((await save(store, id, false, "syntax error")).completed, true);
assert.ok(store.getCompletedIds().includes(id));
assert.equal(db.get(id).user_code, "syntax error", "Último código deve continuar editável");

const queued = await Promise.all([
  save(store, id, true, "correct again"),
  save(store, id, false, "wrong after passing"),
]);
assert.ok(queued.every(row => row.completed === true), "Gravações simultâneas não devem reverter acerto");
assert.equal(writes.at(-1).completed, true);

const reloaded = newSession();
await reloaded.init();
assert.ok(reloaded.getCompletedIds().includes(id), "Conclusão deve persistir após novo login");
assert.equal((await save(reloaded, id, false, "another wrong after login")).completed, true);

db.set("legacy", { exercise_id: "legacy", completed: true, user_code: "", user_idea: "", metrics: { curriculum_version: 1 } });
const curriculumSession = newSession();
await curriculumSession.init();
assert.ok(!curriculumSession.getCompletedIds().includes("legacy"), "Não carregar conclusões do currículo anterior");
assert.equal((await save(curriculumSession, "legacy", false, "new curriculum")).completed, false);

console.log("PASS: conclusão preservada após erro, fila de salvamento e novo login.");
