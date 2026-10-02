"use strict";

// Page references
const page = document.body;
const panels = [...document.querySelectorAll(".panel")];
const panelTriggers = [...document.querySelectorAll("[data-open-panel]")];
const menuPanel = document.getElementById("menu-panel");
const menuBackdrop = document.querySelector(".menu-backdrop");
const menuToggle = document.querySelector('[data-open-panel="menu-panel"]');
const menuIcon = menuToggle?.querySelector("[data-menu-icon]");
const hero = document.querySelector(".hero");
const heroArtwork = document.querySelector(".hero-artwork");
const heroArtworkImage = document.querySelector(".hero-artwork-image");
const heroArtworkTitle = document.querySelector(".hero-artwork-title");
const siteHeader = document.querySelector(".site-header");
const siteShell = document.querySelector(".site-shell");
const festivalRecap = document.querySelector(".festival-recap");
const compactHeroQuery = window.matchMedia("(max-width: 1200px)");
let menuCloseTimer;
let menuCloseHandler;

// Hero sizing
function alignHeroTitle() {
  if (compactHeroQuery.matches) return;
  if (!hero || !heroArtwork || !heroArtworkImage || !heroArtworkTitle) return;

  const artworkBounds = heroArtwork.getBoundingClientRect();
  const imageBounds = heroArtworkImage.getBoundingClientRect();
  const imageBottom = imageBounds.bottom - artworkBounds.top;
  const firstLineBottomRatio = 114.97 / 228;
  const titleAspectRatio = 228 / 1377;
  const titleEdgeGap = Number.parseFloat(
    window.getComputedStyle(document.documentElement).getPropertyValue("--hero-title-edge-gap"),
  ) || 0;
  const titleWidth = Math.max(0, imageBounds.width - titleEdgeGap * 2);
  const titleHeight = titleWidth * titleAspectRatio;

  if (!artworkBounds.width || !imageBounds.width || !titleWidth) return;

  const top = imageBottom - titleHeight * firstLineBottomRatio;
  const overflow = Math.max(0, top + titleHeight - artworkBounds.height);

  // The title stays centred 3px inside the image edges; its first line ends
  // precisely at the photo edge. Any extra title height extends the hero.
  heroArtworkTitle.style.setProperty("--hero-title-width", `${titleWidth}px`);
  heroArtworkTitle.style.setProperty("--hero-title-top", `${top}px`);
  heroArtworkTitle.style.setProperty("--hero-title-offset", `${(artworkBounds.width - titleWidth) / 2}px`);
  hero.style.setProperty("--hero-title-overflow", `${overflow}px`);
  const siteShellBounds = siteShell?.getBoundingClientRect();
  if (siteShellBounds) {
    // Every card shares the main image's measured width and left edge.
    siteShell.style.setProperty("--content-card-width", `${imageBounds.width}px`);
    siteShell.style.setProperty(
      "--content-card-offset",
      `${imageBounds.left - siteShellBounds.left}px`,
    );
  }
  festivalRecap?.style.setProperty("--hero-content-width", `${imageBounds.width}px`);
}

function sizeHeroArtwork() {
  if (!hero || !heroArtwork || !siteHeader) return;

  if (compactHeroQuery.matches) {
    heroArtwork.style.removeProperty("--hero-artwork-width");
    heroArtworkTitle?.style.removeProperty("--hero-title-width");
    heroArtworkTitle?.style.removeProperty("--hero-title-top");
    heroArtworkTitle?.style.removeProperty("--hero-title-offset");
    hero.style.removeProperty("--hero-title-overflow");
    siteShell?.style.removeProperty("--content-card-width");
    siteShell?.style.removeProperty("--content-card-offset");
    festivalRecap?.style.removeProperty("--hero-content-width");
    return;
  }

  heroArtwork.style.removeProperty("--compact-hero-height");
  heroArtworkTitle?.style.removeProperty("--compact-hero-title-top");

  const heroStyles = window.getComputedStyle(hero);
  // Read the resolved top padding; the artwork keeps its original scale.
  const topGap = Number.parseFloat(heroStyles.paddingTop) || 0;
  const availableWidth = hero.clientWidth;
  const availableHeight = Math.max(
    0,
    window.innerHeight - siteHeader.getBoundingClientRect().height - topGap,
  );
  const imageWidthRatio = 0.727966;
  const titleFirstLineBottomRatio = 114.97 / 228;
  const titleContentHeightRatio =
    imageWidthRatio * (1207 / 1766)
    + imageWidthRatio * (228 / 1377) * (1 - titleFirstLineBottomRatio);
  const bottomGap = topGap;
  const artworkWidth = Math.min(
    availableWidth,
    Math.max(0, availableHeight - bottomGap) / titleContentHeightRatio,
    2099,
  );

  heroArtwork.style.setProperty("--hero-artwork-width", `${artworkWidth}px`);
  window.requestAnimationFrame(alignHeroTitle);
}

sizeHeroArtwork();
window.addEventListener("resize", sizeHeroArtwork, { passive: true });
compactHeroQuery.addEventListener("change", sizeHeroArtwork);
heroArtworkImage?.addEventListener("load", sizeHeroArtwork);
heroArtworkTitle?.addEventListener("load", sizeHeroArtwork);

// Menu panel
function setMenuToggleState(isOpen) {
  if (!menuToggle || !menuIcon) return;

  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  menuIcon.src = isOpen ? menuIcon.dataset.openSrc : menuIcon.dataset.closedSrc;
  menuIcon.width = isOpen ? 96 : 97;
  menuIcon.height = isOpen ? 96 : 70;
}

function clearMenuCloseTransition() {
  window.clearTimeout(menuCloseTimer);

  if (menuCloseHandler && menuPanel) {
    menuPanel.removeEventListener("transitionend", menuCloseHandler);
  }

  menuCloseHandler = undefined;
}

function closePanels() {
  clearMenuCloseTransition();

  panels.forEach((panel) => {
    panel.classList.remove("is-visible");
    panel.hidden = true;
  });

  panelTriggers.forEach((trigger) => {
    trigger.setAttribute("aria-expanded", "false");
  });

  page.classList.remove("panel-open");
  page.classList.remove("menu-open");
  setMenuToggleState(false);
}

function closeMenu() {
  if (!menuPanel || menuPanel.hidden || menuPanel.classList.contains("is-closing")) return;

  clearMenuCloseTransition();
  menuPanel.classList.remove("is-visible");
  menuPanel.classList.add("is-closing");
  menuToggle?.setAttribute("aria-expanded", "false");
  setMenuToggleState(false);

  menuCloseHandler = (event) => {
    if (event && (event.target !== menuPanel || event.propertyName !== "transform")) return;

    clearMenuCloseTransition();
    menuPanel.hidden = true;
    menuPanel.classList.remove("is-closing");
    page.classList.remove("panel-open", "menu-open");
  };

  menuPanel.addEventListener("transitionend", menuCloseHandler);
  menuCloseTimer = window.setTimeout(menuCloseHandler, 420);
}

function openPanel(panelId, trigger) {
  closePanels();

  const panel = document.getElementById(panelId);
  if (!panel) return;

  panel.hidden = false;
  trigger.setAttribute("aria-expanded", "true");
  page.classList.add("panel-open");

  if (panelId === "menu-panel") {
    page.classList.add("menu-open");
    setMenuToggleState(true);
    panel.classList.remove("is-closing");
    void panel.offsetWidth;
    window.requestAnimationFrame(() => panel.classList.add("is-visible"));
  }

  const focusTarget = panel.querySelector("input") ?? panel.querySelector("button");
  focusTarget?.focus();
}

panelTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (trigger.dataset.openPanel === "menu-panel" && !menuPanel?.hidden) {
      closeMenu();
      return;
    }

    openPanel(trigger.dataset.openPanel, trigger);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (!menuPanel?.hidden) {
    closeMenu();
    return;
  }

  closePanels();
});

document.addEventListener("click", (event) => {
  if (!menuPanel || menuPanel.hidden || menuPanel.classList.contains("is-closing")) return;
  if (menuPanel.contains(event.target) || menuToggle?.contains(event.target)) return;

  closeMenu();
});

menuBackdrop?.addEventListener("click", closeMenu);
