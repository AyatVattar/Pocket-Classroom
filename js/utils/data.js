// js/utils/data.js
export function getCapsules() {
    try { return JSON.parse(localStorage.getItem("capsules")) || []; }
    catch(e) { return []; }
  }
  export function setCapsules(arr) {
    localStorage.setItem("capsules", JSON.stringify(arr || []));
  }
  export function saveCapsulesGlobal(arr) {
    setCapsules(arr);
  }
  export function generateId() {
    return "pc_" + Math.random().toString(36).slice(2,10);
  }
  export function escapeHtml(s) {
    return String(s || "").replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }