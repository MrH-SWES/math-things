(() => {
  "use strict";

  const HOME_URL = new URL("../../", window.location.href).href;
  const LABEL = "Math Things.";

  const compact = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/\u00a0/g, "");

  const looksLikeMathThings = (el) => {
    const aria = compact(el.getAttribute && el.getAttribute("aria-label"));
    const text = compact(el.textContent);
    const cls = String(el.className && (el.className.baseVal || el.className) || "").toLowerCase();

    if (aria.includes("maththings")) return true;
    if (text === "maththings." || text === "maththings") return true;
    if ((cls.includes("brand") || cls.includes("logo") || cls.includes("math-things")) &&
        (text.startsWith("maththings.") || text.startsWith("maththings"))) return true;
    return false;
  };

  const scoreCandidate = (el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return Infinity;
    if (r.bottom < 0 || r.right < 0 || r.top > 180 || r.left > Math.max(360, innerWidth * 0.45)) {
      return Infinity;
    }

    const text = compact(el.textContent);
    const aria = compact(el.getAttribute && el.getAttribute("aria-label"));
    const cls = String(el.className && (el.className.baseVal || el.className) || "").toLowerCase();
    let score = Math.max(0, r.top) * 8 + Math.max(0, r.left) * 2 + (r.width * r.height) / 1500;

    if (text === "maththings." || text === "maththings" ||
        aria === "maththings." || aria === "maththings") score -= 1200;
    if (cls.includes("math-things")) score -= 900;
    if (cls.includes("brand") || cls.includes("logo")) score -= 400;

    return score;
  };

  const makeBrandHomeLink = (el) => {
    const existingAnchor = el.closest && el.closest("a");
    if (existingAnchor) {
      existingAnchor.href = HOME_URL;
      existingAnchor.setAttribute("aria-label", "Back to Math Things app menu");
      existingAnchor.title = "Back to Math Things.";
      return;
    }

    el.style.cursor = "pointer";
    el.style.pointerEvents = "auto";
    el.setAttribute("role", "link");
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", "Back to Math Things app menu");
    el.title = "Back to Math Things.";

    const goHome = (event) => {
      if (event) event.preventDefault();
      window.location.href = HOME_URL;
    };

    el.addEventListener("click", goHome);
    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") goHome(event);
    });
  };

  const injectBrand = () => {
    const a = document.createElement("a");
    a.href = HOME_URL;
    a.textContent = LABEL;
    a.setAttribute("aria-label", "Back to Math Things app menu");
    a.title = "Back to Math Things.";
    Object.assign(a.style, {
      position: "fixed",
      top: "10px",
      left: "12px",
      zIndex: "2147483646",
      fontFamily: "'Lexend', system-ui, sans-serif",
      fontSize: "15px",
      fontWeight: "800",
      letterSpacing: "-0.035em",
      lineHeight: "1",
      color: "#1e293b",
      textDecoration: "none",
      background: "rgba(245,245,247,0.88)",
      border: "1px solid rgba(30,41,59,0.10)",
      borderRadius: "8px",
      padding: "7px 9px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)"
    });
    document.body.appendChild(a);
  };

  const init = () => {
    const pool = Array.from(document.querySelectorAll(
      ".math-things, .brand, .logo, [aria-label], header svg, #topBar svg, header div, header span"
    ));

    let best = null;
    let bestScore = Infinity;
    for (const el of pool) {
      if (!looksLikeMathThings(el)) continue;
      const score = scoreCandidate(el);
      if (score < bestScore) {
        best = el;
        bestScore = score;
      }
    }

    if (best && Number.isFinite(bestScore)) makeBrandHomeLink(best);
    else injectBrand();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
