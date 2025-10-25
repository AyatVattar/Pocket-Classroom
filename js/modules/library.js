// js/modules/library.js
import { getCapsules, setCapsules, generateId, escapeHtml } from "../utils/data.js";
import { navigateTo } from "../utils/router.js";

export function renderCapsuleGrid(list) {
  const grid = document.getElementById("capsulesGrid");
  if (!grid) return;
  const items = Array.isArray(list) ? list : getCapsules();
  grid.innerHTML = "";
  if (!items.length) {
    grid.innerHTML = `<div class="empty-state card-panel">No capsules yet — create one or import a JSON file.</div>`;
    return;
  }

  const iconMap = {
    japanese: "https://cdn-icons-png.flaticon.com/512/197/197604.png",
    english: "https://cdn-icons-png.flaticon.com/512/197/197374.png",
    figma: "https://cdn-icons-png.flaticon.com/512/5968/5968705.png",
    html: "https://cdn-icons-png.flaticon.com/512/732/732212.png",
    css: "https://cdn-icons-png.flaticon.com/512/732/732190.png",
    javascript: "https://cdn-icons-png.flaticon.com/512/5968/5968292.png",
    design: "https://cdn-icons-png.flaticon.com/512/2920/2920244.png",
    general: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png"
  };
  function getCapsuleIcon(subject){
    if (!subject) return iconMap.general;
    const key = subject.toLowerCase().trim();
    return iconMap[key] || iconMap.general;
  }

  items.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "capsule-card new-style";
    card.dataset.id = entry.id;
    const progress = entry.meta?.progress ?? 0;
    const level = escapeHtml(entry.meta?.level || "0");
    const title = escapeHtml(entry.meta?.title || "Untitled");
    const subject = escapeHtml(entry.meta?.subject || "");
    card.innerHTML = `
      <div class="capsule-top d-flex align-items-center justify-content-between">
        <img src="${getCapsuleIcon(subject)}" class="capsule-icon" alt="capsule">
        <span class="level-badge">${level}</span>
      </div>
      <div class="capsule-middle mt-2">
        <h5 class="capsule-title">${title}</h5>
        <p class="capsule-sub text-muted">${subject}</p>
      </div>
      <div class="capsule-bottom d-flex align-items-center justify-content-between mt-3">
        <div class="d-flex align-items-center gap-2">
          <div class="progress-ring">
            <svg class="progress-svg" viewBox="0 0 36 36">
              <circle class="progress-bg" cx="18" cy="18" r="15.9155"></circle>
              <circle class="progress-bar" cx="18" cy="18" r="15.9155" stroke-dasharray="${progress},100"></circle>
            </svg>
            <span class="progress-text">${progress}%</span>
          </div>
        </div>

        <div class="capsule-actions d-flex flex-column gap-2">
          <button class="btn btn-sm btn-outline-primary learn-btn">Learn</button>
          <button class="btn btn-sm btn-outline-secondary edit-btn">Edit</button>
          <button class="btn btn-sm btn-outline-secondary export-btn">Export</button>
          <button class="btn btn-sm btn-outline-warning delete-btn">Delete</button>
        </div>
      </div>
    `;
    // events
    card.querySelector(".learn-btn").addEventListener("click", () => {
      localStorage.setItem("pc_preselect_capsule", entry.id);
      navigateTo("learn");
    });
    card.querySelector(".edit-btn").addEventListener("click", () => {
      localStorage.setItem("pc_edit_capsule_id", entry.id);
      navigateTo("author");
    });
    card.querySelector(".export-btn").addEventListener("click", () => {
      try {
        const payload = Object.assign({}, entry, { schema: "pocket-classroom/v2" });
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = (entry.meta?.title || "capsule") + ".json";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (err) {
        alert("Export failed: " + err.message);
      }
    });
    card.querySelector(".delete-btn").addEventListener("click", () => {
      if (confirm(`Delete "${entry.meta?.title || "Untitled"}"?`)) {
        const arr = getCapsules();
        const idx = arr.findIndex((c) => c.id === entry.id);
        if (idx !== -1) {
          arr.splice(idx, 1);
          setCapsules(arr);
          renderCapsuleGrid();
        }
      }
    });

    grid.appendChild(card);
  });
}

// ========== Study Calendar ==========
let currentYear, currentMonth;

function initCalendar() {
  const cal = document.getElementById("calendarDays");
  const title = document.getElementById("calendarTitle");
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");
  if (!cal || !title) return;

  const today = new Date();
  if (currentYear == null) currentYear = today.getFullYear();
  if (currentMonth == null) currentMonth = today.getMonth();

  renderCalendar();

  prevBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
  });

  nextBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
  });

  function renderCalendar() {
    cal.innerHTML = "";
    const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" });
    title.textContent = ` ${monthName} ${currentYear}`;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const key = `studyCalendar-${currentYear}-${currentMonth}`;
    const saved = JSON.parse(localStorage.getItem(key) || "[]");

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement("div");
      cell.className = "calendar-day";
      cell.textContent = d;

      if (
        currentYear === today.getFullYear() &&
        currentMonth === today.getMonth() &&
        d === today.getDate()
      ) {
        cell.classList.add("today");
      }

      if (saved.includes(d)) cell.classList.add("active");

      cell.addEventListener("click", () => {
        const idx = saved.indexOf(d);
        if (idx === -1) saved.push(d);
        else saved.splice(idx, 1);
        localStorage.setItem(key, JSON.stringify(saved));
        cell.classList.toggle("active");
      });

      cal.appendChild(cell);
    }
  }
}

export function initLibrary() {
  const search = document.getElementById("librarySearch");
  const btnNew = document.getElementById("btnNewCapsule");
  const btnImport = document.getElementById("btnImport");

  if (search) {
    search.value = "";
    search.oninput = (e) => {
      const term = e.target.value.trim().toLowerCase();
      const filtered = getCapsules().filter((c) => {
        const t = (c.meta?.title || "").toLowerCase();
        const s = (c.meta?.subject || "").toLowerCase();
        return t.includes(term) || s.includes(term);
      });
      renderCapsuleGrid(filtered);
    };
  }
  if (btnNew) btnNew.onclick = () => {
    localStorage.removeItem("pc_edit_capsule_id");
    navigateTo("author");
  };
  if (btnImport) btnImport.onclick = () => openImportPicker();

  renderCapsuleGrid();
  initCalendar();
}

function openImportPicker() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.onchange = (e) => {
    const f = e.target.files[0];
    if (f) handleImportFile(f);
  };
  input.click();
}

function handleImportFile(file) {
  const reader = new FileReader();
  reader.onload = function (ev) {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.meta && !data.notes && !data.flashcards && !data.quizQuestions) throw new Error("Not a capsule file");
      data.id = generateId();
      data.updatedAt = new Date().toISOString();
      data.meta = data.meta || { title: "Imported Capsule" };
      data.meta.level = data.meta.level ?? "0";
      const arr = getCapsules();
      arr.unshift(data);
      setCapsules(arr);
      renderCapsuleGrid();
      alert("Imported: " + (data.meta.title || "Untitled"));
    } catch (err) {
      alert("Import failed: " + err.message);
    }
  };
  reader.readAsText(file);
}