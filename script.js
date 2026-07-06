const body = document.body;
const nav = document.querySelector("[data-nav]");
const scenes = document.querySelectorAll("[data-theme]");
const revealBlocks = document.querySelectorAll(".reveal-block");
const motionVideos = document.querySelectorAll("video[autoplay]");
const gallerySteps = document.querySelectorAll("[data-gallery-step]");
const galleryImages = document.querySelectorAll("[data-gallery-image]");
const experienceSliders = document.querySelectorAll("[data-experience-slider]");
const driftItems = document.querySelectorAll(
  ".hero-content, .split-media, .broken-large, .broken-small, .atmosphere-card img, .contact-map video, .contact-map iframe, .quote-video"
);

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
  motionVideos.forEach((video) => video.play().catch(() => {}));
}

document.addEventListener("DOMContentLoaded", () => window.setTimeout(updateNavThemeFromPoint, 360), { once: true });
window.addEventListener("hashchange", () => window.setTimeout(updateNavThemeFromPoint, 180));

experienceSliders.forEach((slider) => {
  const track = slider.querySelector("[data-slider-track]");
  const previous = slider.querySelector("[data-slider-prev]");
  const next = slider.querySelector("[data-slider-next]");

  if (!track || !previous || !next) return;

  const scrollAmount = () => Math.max(320, track.clientWidth * 0.58);

  previous.addEventListener("click", () => {
    track.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    track.scrollBy({ left: scrollAmount(), behavior: "smooth" });
  });
});

let ticking = false;

const updateParallax = () => {
  const viewport = window.innerHeight || 1;

  driftItems.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
    const clamped = Math.max(-1, Math.min(1, progress));
    const direction = index % 2 === 0 ? -1 : 1;
    const isCompact = window.innerWidth < 720;
    const xStrength = isCompact ? 0 : item.classList.contains("hero-content") ? 18 : 34;
    const yStrength = isCompact ? 20 : item.classList.contains("quote-video") ? 18 : 46;
    const x = clamped * direction * xStrength;
    const y = clamped * -yStrength;

    item.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
  });

  ticking = false;
};

window.addEventListener(
  "scroll",
  () => {
    updateNavThemeFromPoint();

    if (!ticking && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  },
  { passive: true }
);

updateParallax();
