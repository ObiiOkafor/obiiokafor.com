(function () {
  const storageKey = "obii-theme";
  const body = document.body;
  const themeButton = document.querySelector(".theme-toggle");
  const page = body.dataset.page || "";

  function setTheme(theme) {
    body.setAttribute("data-theme", theme);
    if (themeButton) {
      const isDark = theme === "dark";
      themeButton.classList.toggle("is-active", isDark);
      themeButton.setAttribute("role", "switch");
      themeButton.setAttribute("aria-checked", String(isDark));
      themeButton.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      themeButton.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
      themeButton.innerHTML = `
        <span class="theme-track" aria-hidden="true">
          <span class="theme-knob">
            <span class="theme-icon">${isDark ? "☼" : "☾"}</span>
          </span>
        </span>
      `;
    }
    window.localStorage.setItem(storageKey, theme);
  }

  function initNav() {
    if (!page || page === "home") {
      return;
    }

    const activeLink = document.querySelector(`.top-nav a[data-page-link="${page}"]`);
    if (activeLink) {
      activeLink.classList.add("is-active");
      activeLink.setAttribute("aria-current", "page");
    }
  }

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const nextTheme = body.getAttribute("data-theme") === "dark" ? "light" : "dark";
      setTheme(nextTheme);
    });
  }

  initNav();
  setTheme(window.localStorage.getItem(storageKey) === "dark" ? "dark" : "light");
})();
