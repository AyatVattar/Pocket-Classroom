// js/modules/author.js
import { getCapsules, setCapsules, generateId, escapeHtml } from "../utils/data.js";
import { renderCapsuleGrid } from "./library.js";
import { navigateTo } from "../utils/router.js";

export function initAuthor() {
  const form = document.getElementById("authorForm");
  if (!form) return;

  const editId = localStorage.getItem("pc_edit_capsule_id");
  const arr = getCapsules();
  const editingCapsule = editId ? arr.find((c) => c.id === editId) : null;

  if (editingCapsule) {
    document.getElementById("capsuleTitle").value = editingCapsule.meta?.title || "";
    document.getElementById("capsuleSubject").value = editingCapsule.meta?.subject || "";
    document.getElementById("capsuleLevel").value = editingCapsule.meta?.level || "";
    document.getElementById("capsuleDescription").value = editingCapsule.meta?.description || "";
    document.getElementById("capsuleNotes").value = editingCapsule.notes || "";
    if (editingCapsule.flashcards?.length) editingCapsule.flashcards.forEach(fc => addFlashcardUI(fc.front, fc.back));
    if (editingCapsule.quizQuestions?.length) editingCapsule.quizQuestions.forEach(q => addQuizUI(q.question, q.options || [], q.correct || 0));
  } else {
    document.getElementById("flashcardsContainer").innerHTML = "";
    document.getElementById("quizContainer").innerHTML = "";
  }

  document.getElementById("addFlashcard")?.addEventListener("click", () => addFlashcardUI());
  document.getElementById("addQuiz")?.addEventListener("click", () => addQuizUI());

  form.onsubmit = (e) => {
    e.preventDefault();
    handleSaveFromForm(editId);
  };
}

function addFlashcardUI(front = "", back = "") {
  const container = document.getElementById("flashcardsContainer");
  if (!container) return;
  const div = document.createElement("div");
  div.className = "flashcard-row";
  div.innerHTML = `
    <textarea class="form-control mb-2 flash-front" rows="2" placeholder="Front...">${escapeHtml(front)}</textarea>
    <textarea class="form-control flash-back" rows="2" placeholder="Back...">${escapeHtml(back)}</textarea>
    <button type="button" class="btn btn-sm btn-warning btn-danger-small">&times;</button>
  `;
  div.querySelector(".btn-danger-small").addEventListener("click", () => div.remove());
  container.appendChild(div);
}

function addQuizUI(question = "", options = [], correct = 0) {
  const container = document.getElementById("quizContainer");
  if (!container) return;
  const quizEl = document.createElement("div");
  quizEl.className = "quiz-item mb-3 p-3 border rounded quiz-row";
  quizEl.innerHTML = `
    <label class="form-label fw-bold">Question:</label>
    <input type="text" class="form-control mb-2 quiz-question" value="${escapeHtml(question)}" placeholder="Write question...">
    <div class="quiz-options mb-2"></div>
    <div class="d-flex gap-2 mb-2 align-items-center">
      <button type="button" class="btn btn-sm btn-outline-secondary add-option">+ Option</button>
      <input type="number" min="0" class="form-control form-control-sm quiz-correct" style="width:80px" value="${correct}">
      <div class="form-text small text-muted">Correct option index (0-based)</div>
    </div>
    <button type="button" class="btn btn-sm btn-warning remove-quiz mt-2">Remove Question</button>
  `;
  const optContainer = quizEl.querySelector(".quiz-options");
  if (options.length) options.forEach(opt => addOptionUI(optContainer, opt));
  else addOptionUI(optContainer, "");
  quizEl.querySelector(".add-option").addEventListener("click", () => addOptionUI(optContainer, ""));
  quizEl.querySelector(".remove-quiz").addEventListener("click", () => quizEl.remove());
  container.appendChild(quizEl);
}

function addOptionUI(container, text = "") {
  if (container.querySelectorAll(".quiz-option").length >= 4) {
    alert("You can only have up to 4 options per question.");
    return;
  }
  const div = document.createElement("div");
  div.className = "d-flex align-items-center mb-2";
  div.innerHTML = `
    <input type="text" class="form-control form-control-sm me-2 quiz-option" value="${escapeHtml(text)}" placeholder="Option text...">
    <button type="button" class="btn btn-sm btn-outline-warning remove-option">&times;</button>
  `;
  div.querySelector(".remove-option").addEventListener("click", () => div.remove());
  container.appendChild(div);
}

function handleSaveFromForm(editId) {
  const title = document.getElementById("capsuleTitle").value.trim();
  if (!title) { alert("Please enter a title before saving."); return; }
  const subject = document.getElementById("capsuleSubject").value.trim();
  const level = document.getElementById("capsuleLevel").value.trim();
  const description = document.getElementById("capsuleDescription").value.trim();
  const notes = document.getElementById("capsuleNotes").value.trim();

  const flashcards = [...document.querySelectorAll(".flashcard-row")].map(fc => ({
    front: fc.querySelector(".flash-front")?.value || "",
    back: fc.querySelector(".flash-back")?.value || ""
  }));

  const quizQuestions = [...document.querySelectorAll("#quizContainer .quiz-item")].map(qEl => {
    const question = qEl.querySelector(".quiz-question")?.value.trim() || "";
    const options = [...qEl.querySelectorAll(".quiz-option")].map(o => o.value.trim()).filter(Boolean);
    const correct = parseInt(qEl.querySelector(".quiz-correct")?.value) || 0;
    return { question, options, correct };
  });

  const arr = getCapsules();
  const capsule = {
    id: editId || generateId(),
    meta: { title, subject, level, description, progress: 0 },
    notes,
    flashcards,
    quizQuestions,
    updatedAt: new Date().toISOString()
  };

  if (editId) {
    const idx = arr.findIndex(c => c.id === editId);
    if (idx !== -1) arr[idx] = capsule;
    else arr.unshift(capsule);
  } else {
    arr.unshift(capsule);
  }
  setCapsules(arr);

  alert("Capsule saved successfully!");
  navigateTo("library");
  setTimeout(() => renderCapsuleGrid(), 80);
}