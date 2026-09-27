const MOBILE_NAVIGATION_QUERY = "(max-width: 768px)";
const mobileNavigation = window.matchMedia(MOBILE_NAVIGATION_QUERY);
const navigation = document.querySelector("[data-navigation]");
const burgerButton = document.querySelector("[data-burger-button]");

function setNavigationState(isOpen, shouldRestoreFocus = false) {
  navigation.classList.toggle("navigation--open", isOpen);
  burgerButton.classList.toggle("burger-button--open", isOpen);
  burgerButton.setAttribute("aria-expanded", String(isOpen));
  burgerButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  document.body.classList.toggle("is-scroll-locked", isOpen);

  if (mobileNavigation.matches) {
    navigation.toggleAttribute("inert", !isOpen);
    navigation.setAttribute("aria-hidden", String(!isOpen));
  } else {
    navigation.removeAttribute("inert");
    navigation.removeAttribute("aria-hidden");
  }

  if (!isOpen && shouldRestoreFocus) {
    burgerButton.focus();
  }
}

function closeNavigation(shouldRestoreFocus = false) {
  setNavigationState(false, shouldRestoreFocus);
}

burgerButton.addEventListener("click", () => {
  const isOpen = burgerButton.getAttribute("aria-expanded") !== "true";
  setNavigationState(isOpen);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a") && mobileNavigation.matches) {
    closeNavigation();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && burgerButton.getAttribute("aria-expanded") === "true") {
    closeNavigation(true);
  }
});

mobileNavigation.addEventListener("change", () => {
  closeNavigation();
});

setNavigationState(false);
