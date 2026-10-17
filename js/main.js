/* ============================================================
   Dombastis A5 Global Interactive Scripts
   - Back to top (fokus ke #main-content)
   - Navbar shrink on scroll
   - Cookie banner (UU PDP)
   - GA4 event tracking click_whatsapp
   - Lightbox galeri (keyboard accessible)
   - Filter galeri
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Helper: GA4 ---------- */
  function trackEvent(name, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params || {});
    } else {
      // Fallback: log saat GA belum dimuat
      console.debug("[GA4 event]", name, params);
    }
  }

  /* ---------- Back to Top ---------- */
  function initBackTop() {
    const btn = document.getElementById("btnBackTop");
    if (!btn) return;

    const toggle = () => {
      const shouldShow = window.scrollY > 300;
      btn.classList.toggle("show", shouldShow);
      btn.inert = !shouldShow;
      if (shouldShow) btn.removeAttribute("aria-hidden");
      else btn.setAttribute("aria-hidden", "true");
    };

    window.addEventListener("scroll", toggle, { passive: true });
    toggle();

    btn.addEventListener("click", () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
      const main = document.getElementById("main-content") || document.body;
      main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
    });
  }

  /* ---------- Navbar shrink ---------- */
  function initNavbarShrink() {
    const nav = document.querySelector(".navbar-custom");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Cookie Banner (UU PDP) ---------- */
  function initCookieBanner() {
    const KEY = "dombastis_cookie_consent_v1";
    if (localStorage.getItem(KEY)) return;

    const banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Persetujuan cookie");
    banner.innerHTML = `
      <div class="container d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <p class="mb-0 small">
          Kami menggunakan cookie untuk analitik agar pengalaman Anda lebih baik.
          Baca <a href="kebijakan-privasi.html">Kebijakan Privasi</a>.
        </p>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-sm btn-outline-light" data-consent="deny">Tolak</button>
          <button type="button" class="btn btn-sm btn-primary-custom" data-consent="accept">Terima</button>
        </div>
      </div>`;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add("show"));

    banner.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-consent]");
      if (!btn) return;
      const choice = btn.dataset.consent;
      localStorage.setItem(KEY, choice);
      banner.classList.remove("show");
      setTimeout(() => banner.remove(), 400);
      trackEvent("cookie_consent", { choice });
    });
  }

  /* ---------- GA4 WhatsApp tracking ---------- */
  function initWhatsAppTracking() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href*="wa.me"], a[href*="whatsapp"]');
      if (!a) return;
      trackEvent("click_whatsapp", {
        page_path: window.location.pathname,
        link_url: a.href,
        link_text: (a.innerText || a.getAttribute("aria-label") || "").trim().slice(0, 80)
      });
    });

    // klik telepon
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="tel:"]');
      if (!a) return;
      trackEvent("click_phone", { page_path: window.location.pathname });
    });
  }

  /* ---------- Lightbox Galeri ---------- */
  function initLightbox() {
    const triggers = document.querySelectorAll("[data-lightbox]");
    if (!triggers.length) return;

    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Pratinjau gambar");
    lightbox.innerHTML = `
      <button type="button" class="lightbox__close" aria-label="Tutup pratinjau">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <button type="button" class="lightbox__nav lightbox__prev" aria-label="Gambar sebelumnya">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <img class="lightbox__img" src="" alt="">
      <button type="button" class="lightbox__nav lightbox__next" aria-label="Gambar berikutnya">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <p class="lightbox__caption"></p>`;
    document.body.appendChild(lightbox);

    const imgEl = lightbox.querySelector(".lightbox__img");
    const capEl = lightbox.querySelector(".lightbox__caption");
    const items = Array.from(triggers).map((el) => ({
      src: el.getAttribute("data-src") || el.querySelector("img")?.src,
      alt: el.getAttribute("data-alt") || el.querySelector("img")?.alt || "",
      caption: el.getAttribute("data-caption") || "",
      trigger: el
    }));
    let current = 0;
    let lastFocused = null;

    function open(index) {
      current = (index + items.length) % items.length;
      const it = items[current];
      imgEl.src = it.src;
      imgEl.alt = it.alt;
      capEl.textContent = it.caption;
      lightbox.classList.add("show");
      document.body.style.overflow = "hidden";
      lastFocused = document.activeElement;
      lightbox.querySelector(".lightbox__close").focus();
      trackEvent("view_lightbox", { index: current, image: it.src });
    }
    function close() {
      lightbox.classList.remove("show");
      document.body.style.overflow = "";
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }
    function next() { open(current + 1); }
    function prev() { open(current - 1); }

    triggers.forEach((el, i) => {
      el.addEventListener("click", (e) => { e.preventDefault(); open(i); });
      el.style.cursor = "zoom-in";
    });

    lightbox.querySelector(".lightbox__close").addEventListener("click", close);
    lightbox.querySelector(".lightbox__next").addEventListener("click", next);
    lightbox.querySelector(".lightbox__prev").addEventListener("click", prev);
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("show")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Tab") {
        // Fokus terkunci pada kontrol lightbox
        const focusables = lightbox.querySelectorAll("button");
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Filter Galeri ---------- */
  function initGalleryFilter() {
    const buttons = document.querySelectorAll("[data-filter]");
    const items = document.querySelectorAll("[data-category]");
    if (!buttons.length || !items.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;
        buttons.forEach((b) => {
          const isActive = b === btn;
          b.classList.toggle("active", isActive);
          b.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
        items.forEach((item) => {
          const show = filter === "all" || item.dataset.category === filter;
          item.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* ---------- Form kontak → WhatsApp ---------- */
  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.querySelector("#name").value.trim();
      const need = form.querySelector("#need")?.value || "";
      const msg = form.querySelector("#msg").value.trim();
      const text = `Halo Dombastis A5, nama saya ${name}. Kebutuhan: ${need}. ${msg}`;
      trackEvent("submit_contact_form", { need });
      window.open("https://wa.me/6282152188508?text=" + encodeURIComponent(text), "_blank", "noopener");
    });
  }

  /* ---------- Init all ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initBackTop();
    initNavbarShrink();
    initCookieBanner();
    initWhatsAppTracking();
    initLightbox();
    initGalleryFilter();
    initContactForm();
  });
})();