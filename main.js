// IMPORTS
import "./general.css";
import "./style.css";
import "./querries.css";

// Mobile-nav

document.addEventListener("click", (e) => {
  if (!e.target.matches(".navigation__icon")) return;

  const navBar = document.querySelector(".navigation");
  const buttonContainer = e.target.closest(".navigation__button-mobile");
  const navOpen = buttonContainer.querySelector(".navigation__icon--open");
  const navClose = buttonContainer.querySelector(".navigation__icon--close");

  if (e.target.matches(".navigation__icon--open")) {
    navOpen.classList.toggle("hide-nav");
    navBar.classList.toggle("hide-nav");
    navClose.classList.toggle("hide-nav");
  }

  if (e.target.matches(".navigation__icon--close")) {
    navClose.classList.toggle("hide-nav");
    navBar.classList.toggle("hide-nav");
    navOpen.classList.toggle("hide-nav");
  }
});

// Scroll effect
document.addEventListener("click", (e) => {
  if (!e.target.matches(".scroll-to")) return;

  if (e.target.dataset.information === "information") {
    const information = document.querySelector("#information");
    information.scrollIntoView({ behavior: "smooth" });
  }
  if (e.target.dataset.home === "home") {
    const home = document.querySelector("#home");
    home.scrollIntoView({ behavior: "smooth" });
  }
});
