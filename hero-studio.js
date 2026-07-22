(function () {
  const stage = document.getElementById("heroStage");
  const config = window.HERO_CONFIG;
  const hero = config.hero;
  let customPortrait = config.defaultPortrait || "";

  function getPalette() {
    if (document.body.getAttribute("data-theme") === "dark") {
      return {
        background: "linear-gradient(135deg, #3a261b, #241711)",
        heading: "#f4e9df",
        subheading: "#dcc9b9",
        body: "#c8b3a2",
        muted: "#b69985",
        buttonBg: "#f1e4d7",
        buttonText: "#241d19",
        imageRadius: hero.palette.imageRadius
      };
    }

    return hero.palette;
  }

  function applyPalette(palette) {
    stage.style.background = palette.background;
    stage.style.setProperty("--heading", palette.heading);
    stage.style.setProperty("--subheading", palette.subheading);
    stage.style.setProperty("--body", palette.body);
    stage.style.setProperty("--muted", palette.muted);
    stage.style.setProperty("--button-bg", palette.buttonBg);
    stage.style.setProperty("--button-text", palette.buttonText);
    stage.style.setProperty("--image-radius", palette.imageRadius);
  }

  function render() {
    applyPalette(getPalette());

    const portraitMarkup = customPortrait
      ? `<img src="${customPortrait}" alt="Obii portrait" />`
      : "";

    stage.innerHTML = `
      <section class="hero">
        <div class="portrait">${portraitMarkup}</div>
        <div class="content">
          <div class="eyebrow">${hero.copy.eyebrow}</div>
          <h1>${hero.copy.title}</h1>
          ${hero.copy.location ? `<p class="location"><span class="gm-pin" aria-hidden="true"></span>${hero.copy.location}</p>` : ""}
          ${hero.copy.subtitle ? `<h3>${hero.copy.subtitle}</h3>` : ""}
          ${hero.copy.tagline ? `<p class="tagline">${hero.copy.tagline}</p>` : ""}
          ${hero.copy.body ? `<p>${hero.copy.body}</p>` : ""}
          <div class="cta-row">
            ${
              hero.copy.ctaPrimaryHref
                ? `<a class="primary" href="${hero.copy.ctaPrimaryHref}">${hero.copy.ctaPrimary}</a>`
                : `<button class="primary">${hero.copy.ctaPrimary}</button>`
            }
            ${
              hero.copy.ctaSecondaryHref
                ? `<a class="secondary" href="${hero.copy.ctaSecondaryHref}">${hero.copy.ctaSecondary}</a>`
                : `<button class="secondary">${hero.copy.ctaSecondary}</button>`
            }
          </div>
          ${hero.copy.tags ? `<div class="tags">${hero.copy.tags}</div>` : ""}
        </div>
      </section>
    `;
  }

  document.querySelectorAll(".theme-toggle").forEach((button) => {
    button.addEventListener("click", render);
  });

  window.addEventListener("storage", function (event) {
    if (event.key === "obii-theme") {
      render();
    }
  });

  render();
})();
