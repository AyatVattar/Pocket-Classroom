// js/modules/learn.js
import { getCapsules, setCapsules, escapeHtml } from "../utils/data.js";

/* ---------------------------
   DOM
   --------------------------- */
const qs = id => document.getElementById(id);
const show = el => { if(!el) return; el.classList.add("lc-show"); el.setAttribute("aria-hidden","false"); };
const hide = el => { if(!el) return; el.classList.remove("lc-show"); el.setAttribute("aria-hidden","true"); };

/* ---------------------------
  Flashcards + Quiz
   --------------------------- */
let flashState = { idx:0, arr:[], known: new Set(), unknown: new Set() };
let quizState = { idx:0, arr:[], userAnswers:[], score:0 };

/* ============================
    select
   ============================ */
function populateCapsuleSelect() {
  const sel = qs("capsuleSelect");
  if (!sel) return;
  sel.innerHTML = `<option value="">Select a capsule...</option>`;
  const arr = getCapsules() || [];
  arr.forEach(c => {
    const o = document.createElement("option");
    o.value = c.id; o.textContent = c.meta?.title || "Untitled";
    sel.appendChild(o);
  });
  
  const prev = localStorage.getItem("pc_preselect_capsule");
  if (prev && arr.find(x=>x.id===prev)) sel.value = prev;
}

/* ============================
   Notes modal
   ============================ */
function openNotesModal(text){
  qs("notesModalBody").textContent = text || "No notes.";
  show(qs("notesModal"));
}
function initNotesModal(){
  const modal = qs("notesModal");
  if (!modal) return;
  modal.querySelectorAll(".lc-close").forEach(b=>b.addEventListener("click", ()=> hide(modal)));
  modal.addEventListener("click", (e)=> { if (e.target === modal) hide(modal); });
}

/* ============================
   Flashcards modal logic
   ============================ */
function renderFlashCard(){
  const wrap = qs("flashCardWrap");
  const count = qs("flashCardCount");
  if (!wrap) return;
  wrap.innerHTML = "";
  if (!flashState.arr.length){ wrap.innerHTML = `<p class="text-muted">No flashcards.</p>`; count.textContent = ""; return; }
  const fc = flashState.arr[flashState.idx];
  count.textContent = `Card ${flashState.idx+1} / ${flashState.arr.length}`;
  const card = document.createElement("div");
  card.className = "flashcard";
  card.innerHTML = `
    <div class="flashcard-inner">
      <div class="flashcard-front">${escapeHtml(fc.front)}</div>
      <div class="flashcard-back">${escapeHtml(fc.back)}</div>
    </div>
  `;
  // flip on click (but avoid clicking buttons)
  card.addEventListener("click", (e)=> { if (e.target.tagName.toLowerCase() === 'button') return; card.classList.toggle("flipped"); });
  wrap.appendChild(card);

  // update mark buttons states
  qs("markKnown").classList.toggle("active", flashState.known.has(flashState.idx));
  qs("markUnknown").classList.toggle("active", flashState.unknown.has(flashState.idx));
}

function openFlashModal(arr){
  flashState.arr = arr || [];
  flashState.idx = 0; flashState.known = new Set(); flashState.unknown = new Set();
  renderFlashCard();
  show(qs("flashModal"));
}

function initFlashModal(){
  const modal = qs("flashModal");
  if (!modal) return;
  modal.querySelectorAll(".lc-close").forEach(b=>b.addEventListener("click", ()=> hide(modal)));
  modal.addEventListener("click", (e)=> { if (e.target === modal) hide(modal); });

  qs("flashPrev")?.addEventListener("click", ()=> {
    if (flashState.idx>0) { flashState.idx--; renderFlashCard(); }
  });
  qs("flashNext")?.addEventListener("click", ()=> {
    if (flashState.idx < flashState.arr.length-1){ flashState.idx++; renderFlashCard(); }
  });
  qs("markKnown")?.addEventListener("click", (e)=> {
    flashState.known.add(flashState.idx);
    flashState.unknown.delete(flashState.idx);
    renderFlashCard(); updateProgressFromFlash();
  });
  qs("markUnknown")?.addEventListener("click", (e)=> {
    flashState.unknown.add(flashState.idx);
    flashState.known.delete(flashState.idx);
    renderFlashCard(); updateProgressFromFlash();
  });

  // keyboard left/right while modal open
  document.addEventListener("keydown", (ev) => {
    const open = qs("flashModal")?.classList.contains("lc-show");
    if (!open) return;
    if (ev.key === "ArrowLeft") { if (flashState.idx>0) { flashState.idx--; renderFlashCard(); } }
    if (ev.key === "ArrowRight") { if (flashState.idx < flashState.arr.length-1) { flashState.idx++; renderFlashCard(); } }
    if (ev.key === "Escape") hide(modal);
  });
}

/* ============================
   Quiz modal logic
   ============================ */
function renderQuizQuestion(){
  const wrap = qs("quizQuestionWrap");
  const prog = qs("quizProgress");
  if (!wrap) return;
  wrap.innerHTML = "";
  if (!quizState.arr.length) { wrap.innerHTML = `<p class="text-muted">No quiz.</p>`; if (prog) prog.textContent = ""; return; }
  const q = quizState.arr[quizState.idx];
  if (prog) prog.textContent = `Question ${quizState.idx+1} / ${quizState.arr.length} — Score: ${quizState.score}`;
  const box = document.createElement("div");
  box.innerHTML = `<div class="mb-2"><strong>${escapeHtml(q.question)}</strong></div>`;
  const opts = document.createElement("div");
  (q.options || []).forEach((opt,i)=>{
    const b = document.createElement("button");
    b.className = "btn btn-sm btn-outline-secondary d-block mb-2 w-100 quiz-choice";
    b.textContent = opt;
    b.addEventListener("click", ()=>{
      quizState.userAnswers[quizState.idx] = i;
      opts.querySelectorAll("button").forEach(bt=>bt.classList.remove("selected"));
      b.classList.add("selected");
    });
    opts.appendChild(b);
  });
  box.appendChild(opts);
  wrap.appendChild(box);
}

function openQuizModal(arr){
  quizState.arr = arr || [];
  quizState.idx = 0;
  quizState.userAnswers = new Array(quizState.arr.length).fill(null);
  quizState.score = 0;
  renderQuizQuestion();
  show(qs("quizModal"));
}

function initQuizModal(){
  const modal = qs("quizModal");
  if (!modal) return;
  modal.querySelectorAll(".lc-close").forEach(b=>b.addEventListener("click", ()=> hide(modal)));
  modal.addEventListener("click", (e)=> { if (e.target === modal) hide(modal); });

  qs("quizPrev")?.addEventListener("click", ()=> { if (quizState.idx>0){ quizState.idx--; renderQuizQuestion(); } });
  qs("quizNext")?.addEventListener("click", ()=> { if (quizState.idx < quizState.arr.length-1){ quizState.idx++; renderQuizQuestion(); } });
  qs("quizSubmit")?.addEventListener("click", ()=> {
    const cur = quizState.arr[quizState.idx];
    const chosen = quizState.userAnswers[quizState.idx];
    if (chosen === null || chosen === undefined) { alert("Please select an option first."); return; }
    if (chosen === (cur.correct || 0)) { alert("Correct ✅"); quizState.score++; }
    else { alert("Wrong ❌"); }
    if (quizState.idx < quizState.arr.length-1) { quizState.idx++; renderQuizQuestion(); }
    else { alert(`Quiz finished — Score: ${quizState.score} / ${quizState.arr.length}`); hide(modal); }
  });

  // esc handler
  document.addEventListener("keydown", (ev)=> { if (ev.key === "Escape") hide(modal); });
}

/* ============================
   progress update
   ============================ */
function updateProgressFromFlash(){
  const sel = qs("capsuleSelect"); if (!sel) return;
  const id = sel.value; if (!id) return;
  const arr = getCapsules() || [];
  const idx = arr.findIndex(c => c.id === id);
  if (idx === -1) return;
  const total = flashState.arr.length || 0;
  const known = flashState.known.size || 0;
  const percent = total === 0 ? 0 : Math.round((known / total) * 100);
  arr[idx].meta = arr[idx].meta || {};
  arr[idx].meta.progress = percent;
  setCapsules(arr);
  // update library UI counters if present
  document.querySelectorAll(".progress-text").forEach(p => p.innerText = percent + "%");
  document.querySelectorAll(".progress-bar").forEach(bar => bar.setAttribute("stroke-dasharray", `${percent},100`));
}

/* ============================
   Export helper 
   ============================ */
function exportCapsuleById(id){
  const arr = getCapsules() || [];
  const cap = arr.find(x => x.id === id);
  if (!cap) { alert("No capsule selected for export."); return; }
  try {
    const payload = Object.assign({}, cap, { schema: "pocket-classroom/v2" });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = (cap.meta?.title || "capsule") + ".json"; document.body.appendChild(a); a.click(); a.remove();
  } catch(e){ alert("Export failed: " + e.message); }
}

/* ============================
   Init: expose initLearn
   ============================ */
export function initLearn(){
  populateCapsuleSelect();
  initNotesModal(); initFlashModal(); initQuizModal();

  // selection change
  const sel = qs("capsuleSelect");
  sel?.addEventListener("change", ()=> {
    const id = sel.value;
    if (!id){
      qs("learnTitle").textContent = "Select a capsule from library to start learning.";
      qs("learnMeta").textContent = "";
      qs("learnPreviewBody").textContent = "Select a capsule to see notes/flashcards/quiz preview.";
      return;
    }
    const arr = getCapsules() || [];
    const cap = arr.find(x => x.id === id);
    if (!cap) return;
    qs("learnTitle").textContent = cap.meta?.title || "Untitled";
    qs("learnMeta").textContent = `${cap.meta?.subject || ""} • ${cap.meta?.level || ""}`;
    qs("learnPreviewBody").textContent = (cap.notes && cap.notes.trim()) ? cap.notes.slice(0,400) + (cap.notes.length>400? "…" : "") : "No notes.";
    // store preselect
    localStorage.setItem("pc_preselect_capsule", id);
  });

  // open buttons
  qs("openNotesBtn")?.addEventListener("click", () => {
    const id = qs("capsuleSelect")?.value; if (!id) { alert("Choose a capsule first."); return; }
    const c = (getCapsules()||[]).find(x => x.id === id);
    openNotesModal(c?.notes || "No notes.");
  });
  qs("openFlashBtn")?.addEventListener("click", () => {
    const id = qs("capsuleSelect")?.value; if (!id) { alert("Choose a capsule first."); return; }
    const c = (getCapsules()||[]).find(x => x.id === id) || {};
    openFlashModal(c.flashcards || []);
  });
  qs("openQuizBtn")?.addEventListener("click", () => {
    const id = qs("capsuleSelect")?.value; if (!id) { alert("Choose a capsule first."); return; }
    const c = (getCapsules()||[]).find(x => x.id === id) || {};
    openQuizModal(c.quizQuestions || []);
  });

  // keyboard: Esc closes any shown modal, and left/right handled in flash modal's listener
  document.addEventListener("keydown", (ev)=>{
    if (ev.key === "Escape") {
      ["notesModal","flashModal","quizModal"].forEach(id=> hide(qs(id)));
    }
    // Ctrl+E export (learn view)
    if (ev.ctrlKey && ev.key.toLowerCase() === "e"){
      const id = qs("capsuleSelect")?.value;
      if (!id) { return; }
      ev.preventDefault();
      exportCapsuleById(id);
    }
  });

  // preselect if exists
  const prev = localStorage.getItem("pc_preselect_capsule");
  if (prev) {
    const option = Array.from(qs("capsuleSelect").options).find(o=>o.value===prev);
    if (option) { qs("capsuleSelect").value = prev; qs("capsuleSelect").dispatchEvent(new Event('change')); }
    // but keep it (no removal)
  }
}