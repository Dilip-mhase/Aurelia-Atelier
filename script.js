const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navAnchors = document.querySelectorAll(".nav-links a");
const filterButtons = document.querySelectorAll(".filter-btn");
const galleryItems = document.querySelectorAll(".gallery-item");
const estimateForm = document.querySelector("#estimate-form");
const portraitType = document.querySelector("#portrait-type");
const portraitSize = document.querySelector("#portrait-size");
const rushTimeline = document.querySelector("#rush-timeline");
const estimateOutput = document.querySelector("#estimate-output");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const backToTop = document.querySelector(".back-to-top");
const slotsLeft = document.querySelector("#slots-left");
const slotsProgress = document.querySelector("#slots-progress");

const pricing = {
  individual: 2800,
  couple: 4200,
  family: 5600,
  gift: 3400
};

const sizeAddons = {
  small: 0,
  medium: 950,
  large: 2100
};

function closeMenu() {
  body.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation");
}

function updateEstimate() {
  if (!portraitType || !portraitSize || !estimateOutput || !rushTimeline) return;

  const base = pricing[portraitType.value];
  const sizeAddon = sizeAddons[portraitSize.value];
  const rushAddon = rushTimeline.checked ? 850 : 0;
  const total = base + sizeAddon + rushAddon;

  estimateOutput.value = `$${total.toLocaleString("en-US")}`;
  estimateOutput.textContent = `$${total.toLocaleString("en-US")}`;
}

function setFieldError(field, message) {
  const label = field.closest("label");
  const error = label?.querySelector(".error-message");

  field.classList.toggle("is-invalid", Boolean(message));
  field.setAttribute("aria-invalid", String(Boolean(message)));

  if (error) {
    error.textContent = message;
  }
}

function validateField(field) {
  const value = field.value.trim();
  let message = "";

  if (!value) {
    message = "This field is required.";
  } else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    message = "Enter a valid email address.";
  } else if (field.name === "message" && value.length < 20) {
    message = "Please share at least 20 characters.";
  }

  setFieldError(field, message);
  return !message;
}

function updateAvailability() {
  if (!slotsLeft || !slotsProgress) return;

  const totalSlots = Number(slotsProgress.max);
  const monthSeed = new Date().getMonth() + 1;
  const reserved = Math.min(totalSlots - 1, 3 + (monthSeed % 4));
  const openSlots = totalSlots - reserved;

  slotsLeft.textContent = String(openSlots);
  slotsProgress.value = reserved;
  slotsProgress.textContent = `${reserved} of ${totalSlots} spots reserved`;
}

function updateActiveNav() {
  const sections = [...navAnchors]
    .map((anchor) => {
      const href = anchor.getAttribute("href");
      const hash = href?.startsWith("#") ? href : new URL(href, window.location.href).hash;

      return hash ? document.querySelector(hash) : null;
    })
    .filter(Boolean);

  const current = sections
    .filter((section) => section.getBoundingClientRect().top <= 130)
    .at(-1);

  navAnchors.forEach((anchor) => {
    const href = anchor.getAttribute("href");
    const linkUrl = new URL(href, window.location.href);
    const isCurrentPage = linkUrl.pathname === window.location.pathname;
    const isCurrentSection = current && linkUrl.hash === `#${current.id}`;
    const isCurrentFile = !linkUrl.hash && isCurrentPage;

    anchor.classList.toggle("active", Boolean(isCurrentFile || (isCurrentPage && isCurrentSection)));
  });
}

menuToggle?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

navLinks?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    closeMenu();
  }
});

document.querySelectorAll("[data-estimate-type]").forEach((link) => {
  link.addEventListener("click", () => {
    if (!portraitType) return;

    portraitType.value = link.dataset.estimateType;
    updateEstimate();
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    galleryItems.forEach((item) => {
      item.classList.toggle("hidden", filter !== "all" && item.dataset.category !== filter);
    });
  });
});

estimateForm?.addEventListener("input", updateEstimate);

contactForm?.addEventListener("input", (event) => {
  if (event.target.matches("input, select, textarea")) {
    validateField(event.target);
  }
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const fields = [...contactForm.querySelectorAll("input, select, textarea")];
  const validity = fields.map(validateField);
  const isValid = validity.every(Boolean);

  if (!isValid) {
    formStatus.textContent = "Please fix the highlighted fields.";
    return;
  }

  const request = Object.fromEntries(new FormData(contactForm).entries());
  localStorage.setItem("aureliaCommissionRequest", JSON.stringify({
    ...request,
    estimate: estimateOutput.textContent,
    submittedAt: new Date().toISOString()
  }));

  formStatus.textContent = "Your consultation request has been saved. We will reply within two business days.";
  contactForm.reset();
  updateEstimate();
});

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("scroll", () => {
  backToTop?.classList.toggle("visible", window.scrollY > 520);
  updateActiveNav();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

updateEstimate();
updateAvailability();
updateActiveNav();
