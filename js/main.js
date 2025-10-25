// js/main.js
import { initLibrary } from "./modules/library.js";
import { initAuthor } from "./modules/author.js";
import { initLearn } from "./modules/learn.js";
import "./theme.js"; 
function hideAllSections() {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none");
}

function closeMobileSidebarIfOpen() {
  const mobile = document.getElementById("mobileSidebar");
  if (mobile && window.bootstrap && bootstrap.Offcanvas) {
    const inst = bootstrap.Offcanvas.getInstance(mobile);
    if (inst) try { inst.hide(); } catch(e) {}
  }
}

function handlePageChange() {
  const page = window.location.hash.replace("#/","") || "library";
  hideAllSections();
  if (page === "library") {
    document.getElementById("library").style.display = "block";
    initLibrary();
  } else if (page === "author") {
    document.getElementById("author").style.display = "block";
    initAuthor();
  } else if (page === "learn") {
    document.getElementById("learn").style.display = "block";
    initLearn();
  }
  closeMobileSidebarIfOpen();

  
}

// shortcuts including export (Ctrl+E)
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === "s") {
    e.preventDefault();
    if (window.location.hash === "#/author") document.getElementById("authorForm")?.requestSubmit();
  }
  if (e.ctrlKey && e.key.toLowerCase() === "c") {
    e.preventDefault();
    localStorage.removeItem("pc_edit_capsule_id");
    location.hash = "#/author";
  }
  if (e.ctrlKey && e.key.toLowerCase() === "i") {
    e.preventDefault();
    document.getElementById("btnImport")?.click();
  }
  if (e.ctrlKey && e.key.toLowerCase() === "e") {
    // export currently preselected capsule (if any) — handy shortcut
    e.preventDefault();
    const pre = localStorage.getItem("pc_preselect_capsule");
    const arr = JSON.parse(localStorage.getItem("capsules") || "[]");
    const cap = arr.find(c => c.id === pre);
    if (!cap) { alert("No capsule preselected to export. Select one or click Export on a capsule card."); return; }
    try {
      const payload = Object.assign({}, cap, { schema: "pocket-classroom/v2" });
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = (cap.meta?.title || "capsule") + ".json";
      document.body.appendChild(a); a.click(); a.remove();
      alert("Exported: " + (cap.meta?.title || "capsule"));
    } catch(err) { alert("Export failed: " + err.message); }
  }
});

window.addEventListener("hashchange", handlePageChange);
window.addEventListener("load", () => {
  if (!window.location.hash) location.hash = "#/library";
  handlePageChange();
});

document.querySelectorAll("#mobileSidebar a.nav-link").forEach(link =>{
  link.addEventListener("click", (e) =>{
    e.preventDefault();
    const target = link.getAttribute("href").replace("#/", "");
    if (target){
      location.hash = "#/" + target;
      const mobile = document.getElementById("mobileSidebar");
      if (mobile && window.bootstrap && bootstrap.Offcanvas){
        const inst = bootstrap.Offcanvas.getInstance(mobile);
        if (inst) try {inst.hide();} catch(e){}
      }
    }
  });
});

// ===============================
// 💡 Floating Shortcuts Button 
// ===============================
document.addEventListener("DOMContentLoaded", () => {
 
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "shortcut-btn";
  toggleBtn.innerHTML = "‽";
  document.body.appendChild(toggleBtn);


  const panel = document.createElement("div");
  panel.className = "shortcut-panel";
  panel.innerHTML = `
    <h5>Keyboard Shortcuts</h5>
    <ul>
      <li><b>Ctrl + C</b> → New Capsule</li>
      <li><b>Ctrl + S</b> → Save Capsule</li>
      <li><b>Ctrl + I</b> → Import Capsule</li>
      <li><b>Ctrl + E</b> → Export Capsule</li>
      <li><b>Esc</b> → Close Modal</li>
      <li><b>← Arrow</b> → Previous Flashcard</li>
      <li><b>→ Arrow</b> → Next Flashcard</li>
    </ul>
    <button class="close-btn">Close</button>
  `;
  document.body.appendChild(panel);

  toggleBtn.addEventListener("click", () => {
    panel.classList.toggle("show");
  });
  panel.querySelector(".close-btn").addEventListener("click", () => {
    panel.classList.remove("show");
  });
});