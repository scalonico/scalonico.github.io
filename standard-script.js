const yearNode = document.querySelector("#year");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll(".site-nav a")];

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const setNavState = (isOpen) => {
  if (!navToggle || !nav) {
    return;
  }

  navToggle.setAttribute("aria-expanded", String(isOpen));
  nav.setAttribute("data-open", String(isOpen));
};

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    setNavState(!isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 700) {
        setNavState(false);
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) {
      setNavState(false);
    }
  });
}
