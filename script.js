const body = document.body;
const nav = document.querySelector("[data-nav]");
const scenes = document.querySelectorAll("[data-theme]");
const revealBlocks = document.querySelectorAll(".reveal-block");
const motionVideos = document.querySelectorAll("video[autoplay]");
const gallerySteps = document.querySelectorAll("[data-gallery-step]");
const galleryImages = document.querySelectorAll("[data-gallery-image]");
const hoverList = document.querySelector("[data-hover-list]");
const hoverImage = document.querySelector("[data-hover-image]");
const parallaxItems = document.querySelectorAll(".parallax-media");

body.classList.add("is-loading", "nav-dark");

window.addEventListener("load", () => {
  window.setTimeout(() => {
    body.classList.remove("is-loading");
    body.classList.add("is-ready");
  }, 520);
});

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
      body.classList.toggle("nav-dark", theme === "dark");
      body.classList.toggle("nav-light", theme !== "dark");
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

if (hoverList && hoverImage) {
  hoverList.addEventListener("pointermove", (event) => {
    if (event.target instanceof HTMLElement) {
      const item = event.target.closest("[data-preview]");
      if (!item) return;

      hoverImage.src = item.dataset.preview;
      hoverImage.classList.add("is-visible");
      hoverImage.style.left = `${event.clientX}px`;
      hoverImage.style.top = `${event.clientY}px`;
    }
  });

  hoverList.addEventListener("pointerleave", () => {
    hoverImage.classList.remove("is-visible");
  });
}

let ticking = false;

const updateParallax = () => {
  const viewport = window.innerHeight || 1;

  parallaxItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
    const offset = Math.max(-1, Math.min(1, progress)) * -28;
    item.style.transform = `translate3d(0, ${offset}px, 0)`;
  });

  ticking = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (!ticking && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  },
  { passive: true }
);

updateParallax();
