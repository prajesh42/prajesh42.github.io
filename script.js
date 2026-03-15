const navToggle = document.querySelector(".nav-toggle");
const siteHeader = document.querySelector(".site-header");
const siteNav = document.querySelector(".site-nav");
const revealElements = document.querySelectorAll(".reveal");
const driftingElements = [
  ...document.querySelectorAll(
    ".hero-copy, .spotlight-card, .contact-card, .content-card, .timeline-card, .project-card, .skill-card"
  ),
];
const speedPattern = [0.018, -0.015, 0.02, -0.018, 0.016, -0.014];
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let rafHandle = 0;

if (navToggle && siteHeader && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteHeader.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteHeader.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const assignDriftClasses = () => {
  driftingElements.forEach((element, index) => {
    element.classList.add("scroll-drift");
    element.dataset.driftSpeed = String(speedPattern[index % speedPattern.length]);
    if (element.classList.contains("project-card")) {
      element.dataset.driftSpeed = String(0.02 * (index % 2 === 0 ? 1 : -1));
    }
  });
};

const updateScrollProgress = () => {
  const doc = document.documentElement;
  const scrolled = doc.scrollTop || window.pageYOffset;
  const maxScrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
  const progress = Math.min(scrolled / maxScrollable, 1);
  doc.style.setProperty("--scroll-progress", progress.toFixed(4));
};

const updateParallax = () => {
  const viewportCenter = window.innerHeight / 2;
  driftingElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const distanceFromCenter = rect.top + rect.height / 2 - viewportCenter;
    const speed = Number(element.dataset.driftSpeed || 0);
    const rawOffset = -distanceFromCenter * speed;
    const offset = Math.max(-12, Math.min(12, rawOffset));
    element.style.setProperty("--drift-y", `${offset.toFixed(2)}px`);
  });
};

const updateMotion = () => {
  updateScrollProgress();
  if (!reducedMotionQuery.matches) {
    updateParallax();
  }
};

const queueMotionUpdate = () => {
  if (rafHandle !== 0) {
    return;
  }
  rafHandle = window.requestAnimationFrame(() => {
    rafHandle = 0;
    updateMotion();
  });
};

assignDriftClasses();

if (reducedMotionQuery.matches) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
  updateScrollProgress();
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealElements.forEach((element) => observer.observe(element));
  updateMotion();
  window.addEventListener("scroll", queueMotionUpdate, { passive: true });
  window.addEventListener("resize", queueMotionUpdate);
}

reducedMotionQuery.addEventListener("change", () => window.location.reload());
