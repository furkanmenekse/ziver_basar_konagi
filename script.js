const body = document.body;
const nav = document.querySelector("[data-nav]");
const scenes = document.querySelectorAll("[data-theme]");
const revealBlocks = document.querySelectorAll(".reveal-block");
const motionVideos = document.querySelectorAll("video[autoplay]");
const gallerySteps = document.querySelectorAll("[data-gallery-step]");
const galleryImages = document.querySelectorAll("[data-gallery-image]");
const experienceSliders = document.querySelectorAll("[data-experience-slider]");
const growFrames = document.querySelectorAll("[data-grow-image]");
const roomCards = document.querySelectorAll("[data-room-card]");
const testimonialCards = document.querySelectorAll("[data-testimonial-card]");
const driftItems = document.querySelectorAll(
  ".hero-content, .split-media, .broken-large, .broken-small, .atmosphere-card img, .contact-map video, .contact-map iframe, .quote-video"
);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

body.classList.add("is-loading", "nav-dark");

const finishLoader = () => {
  body.classList.remove("is-loading");
  body.classList.add("is-ready");
};

document.addEventListener("DOMContentLoaded", () => window.setTimeout(finishLoader, 260), { once: true });
window.setTimeout(finishLoader, 950);

const setNavTheme = (theme) => {
  body.classList.toggle("nav-dark", theme === "dark");
  body.classList.toggle("nav-light", theme !== "dark");
};

const updateNavThemeFromPoint = () => {
  if (!nav) return;

  const navHeight = nav.getBoundingClientRect().height || 76;
  const probeY = Math.min(window.innerHeight - 1, Math.max(navHeight + 36, window.innerHeight * 0.16));
  const scene = document
    .elementsFromPoint(window.innerWidth / 2, probeY)
    .map((element) => element.closest?.("[data-theme]"))
    .find((element) => element && !nav.contains(element));
  setNavTheme(scene?.dataset.theme || "light");
};

const setActiveGallery = (index) => {
  gallerySteps.forEach((step) => {
    step.classList.toggle("is-active", step.dataset.galleryStep === String(index));
  });
  galleryImages.forEach((image) => {
    image.classList.toggle("is-active", image.dataset.galleryImage === String(index));
  });
};

if ("IntersectionObserver" in window) {
  const sceneObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible || !nav) return;

      const theme = visible.target.dataset.theme;
      setNavTheme(theme);
    },
    { threshold: [0.18, 0.38, 0.58] }
  );

  scenes.forEach((scene) => sceneObserver.observe(scene));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.22 }
  );

  revealBlocks.forEach((block) => revealObserver.observe(block));
  roomCards.forEach((card) => revealObserver.observe(card));

  const galleryObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveGallery(entry.target.dataset.galleryStep);
        }
      });
    },
    { rootMargin: "-34% 0px -42% 0px", threshold: 0.01 }
  );

  gallerySteps.forEach((step) => galleryObserver.observe(step));

  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.18 }
  );

  motionVideos.forEach((video) => videoObserver.observe(video));
} else {
  revealBlocks.forEach((block) => block.classList.add("is-visible"));
  roomCards.forEach((card) => card.classList.add("is-visible"));
  motionVideos.forEach((video) => video.play().catch(() => {}));
}

document.addEventListener("DOMContentLoaded", () => window.setTimeout(updateNavThemeFromPoint, 360), { once: true });
window.addEventListener("hashchange", () => window.setTimeout(updateNavThemeFromPoint, 180));

document.querySelectorAll(".nav-contact-panel a[href^='#']").forEach((link) => {
  link.addEventListener("click", () => {
    link.closest("details")?.removeAttribute("open");
  });
});

experienceSliders.forEach((slider) => {
  const track = slider.querySelector("[data-slider-track]");

  if (!track) return;

  let isDragging = false;
  let didDrag = false;
  let startX = 0;
  let startScroll = 0;

  track.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;

    isDragging = true;
    didDrag = false;
    startX = event.clientX;
    startScroll = track.scrollLeft;
    track.classList.add("is-dragging");
    track.setPointerCapture?.(event.pointerId);
  });

  track.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    const delta = event.clientX - startX;
    if (Math.abs(delta) > 4) didDrag = true;
    track.scrollLeft = startScroll - delta;
    event.preventDefault();
  });

  const stopDragging = (event) => {
    if (!isDragging) return;

    isDragging = false;
    track.classList.remove("is-dragging");
    track.releasePointerCapture?.(event.pointerId);
  };

  track.addEventListener("pointerup", stopDragging);
  track.addEventListener("pointercancel", stopDragging);
  track.addEventListener(
    "click",
    (event) => {
      if (!didDrag) return;

      event.preventDefault();
      event.stopPropagation();
      didDrag = false;
    },
    true
  );
  track.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });
});

let ticking = false;

const updateParallax = () => {
  const viewport = window.innerHeight || 1;
  const isCompact = window.innerWidth < 720;

  driftItems.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
    const clamped = Math.max(-1, Math.min(1, progress));
    const direction = index % 2 === 0 ? -1 : 1;
    const xStrength = isCompact ? 0 : item.classList.contains("hero-content") ? 18 : 34;
    const yStrength = isCompact ? 20 : item.classList.contains("quote-video") ? 18 : 46;
    const x = clamped * direction * xStrength;
    const y = clamped * -yStrength;

    item.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
  });

  roomCards.forEach((card, index) => {
    if (prefersReducedMotion.matches) {
      card.style.removeProperty("--room-x");
      card.style.removeProperty("--room-y");
      card.style.removeProperty("--room-rotate");
      card.style.removeProperty("--room-img-scale");
      return;
    }

    const rect = card.getBoundingClientRect();
    const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
    const clamped = Math.max(-1, Math.min(1, progress));
    const direction = index % 2 === 0 ? -1 : 1;
    const x = isCompact ? 0 : clamped * direction * 26;
    const y = clamped * (index % 2 === 0 ? -34 : -22);
    const rotate = isCompact ? 0 : clamped * direction * 0.9;
    const imageScale = 1.025 + (1 - Math.abs(clamped)) * 0.035;

    card.style.setProperty("--room-x", `${x.toFixed(2)}px`);
    card.style.setProperty("--room-y", `${y.toFixed(2)}px`);
    card.style.setProperty("--room-rotate", `${rotate.toFixed(3)}deg`);
    card.style.setProperty("--room-img-scale", imageScale.toFixed(3));
  });

  testimonialCards.forEach((card, index) => {
    if (prefersReducedMotion.matches) {
      card.style.removeProperty("--testimonial-x");
      card.style.removeProperty("--testimonial-y");
      return;
    }

    const rect = card.getBoundingClientRect();
    const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
    const clamped = Math.max(-1, Math.min(1, progress));
    const direction = index % 2 === 0 ? -1 : 1;
    const x = isCompact ? 0 : clamped * direction * 18;
    const y = clamped * -18;

    card.style.setProperty("--testimonial-x", `${x.toFixed(2)}px`);
    card.style.setProperty("--testimonial-y", `${y.toFixed(2)}px`);
  });

  growFrames.forEach((frame) => {
    const image = frame.querySelector("img");
    if (!image) return;

    if (prefersReducedMotion.matches) {
      image.style.transform = "none";
      return;
    }

    const rect = frame.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const rawProgress = 1 - center / (viewport + rect.height * 0.5);
    const progress = Math.max(0, Math.min(1, rawProgress));
    const scale = 1.02 + progress * 0.18;
    const y = (0.5 - progress) * 44;

    image.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
  });

  ticking = false;
};

window.addEventListener(
  "scroll",
  () => {
    updateNavThemeFromPoint();

    if (!ticking && !prefersReducedMotion.matches) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  },
  { passive: true }
);

updateParallax();
