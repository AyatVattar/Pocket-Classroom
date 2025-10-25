// js/utils/router.js
export function navigateTo(page) {
    if (!page) page = "library";
    location.hash = "#/" + page;
    // if mobile sidebar open, close it (uses bootstrap)
    const mobile = document.getElementById("mobileSidebar");
    if (mobile && window.bootstrap && bootstrap.Offcanvas) {
      const inst = bootstrap.Offcanvas.getInstance(mobile);
      if (inst) try { inst.hide(); } catch (e) {}
    }
  }