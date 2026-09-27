const slider = document.querySelector("[data-slider]");
const sliderTrack = slider.querySelector("[data-slider-track]");
const sliderViewport = slider.querySelector("[data-slider-viewport]");
const slides = Array.from(sliderTrack.children);
const sliderControls = Array.from(slider.querySelectorAll("[data-slide-index]"));
const sliderPagination = slider.querySelector("[data-slider-pagination]");
const SWIPE_THRESHOLD = 50;

let currentIndex = 0;
let trackIndex = 1;
let isAnimating = false;
let pointerStart = null;

function createEdgeClone(slide) {
  const clone = slide.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  return clone;
}

sliderTrack.prepend(createEdgeClone(slides.at(-1)));
sliderTrack.append(createEdgeClone(slides[0]));

function setTrackPosition(shouldAnimate = true) {
  sliderTrack.classList.toggle("slider__track--no-transition", !shouldAnimate);
  sliderTrack.style.transform = `translate3d(-${trackIndex * 100}%, 0, 0)`;

  if (!shouldAnimate) {
    sliderTrack.getBoundingClientRect();
    sliderTrack.classList.remove("slider__track--no-transition");
  }
}

function updateSliderState() {
  slides.forEach((slide, index) => {
    slide.setAttribute("aria-hidden", String(index !== currentIndex));
  });

  sliderControls.forEach((control, index) => {
    const isActive = index === currentIndex;
    control.classList.toggle("slider__control--active", isActive);
    control.toggleAttribute("aria-current", isActive);
  });

  sliderPagination.setAttribute(
    "aria-label",
    `Slide ${currentIndex + 1} of ${slides.length}`,
  );
}

function moveSlider(direction) {
  if (isAnimating) {
    return;
  }

  isAnimating = true;
  currentIndex = (currentIndex + direction + slides.length) % slides.length;
  trackIndex += direction;
  updateSliderState();
  setTrackPosition();
}

function goToSlide(nextIndex) {
  if (nextIndex === currentIndex || isAnimating) {
    return;
  }

  const forwardDistance = (nextIndex - currentIndex + slides.length) % slides.length;
  const backwardDistance = (currentIndex - nextIndex + slides.length) % slides.length;

  if (forwardDistance === 1) {
    moveSlider(1);
  } else if (backwardDistance === 1) {
    moveSlider(-1);
  } else {
    isAnimating = true;
    currentIndex = nextIndex;
    trackIndex = nextIndex + 1;
    updateSliderState();
    setTrackPosition();
  }
}

slider.querySelectorAll("[data-slider-direction]").forEach((button) => {
  button.addEventListener("click", () => {
    moveSlider(button.dataset.sliderDirection === "next" ? 1 : -1);
  });
});

sliderControls.forEach((control) => {
  control.addEventListener("click", () => {
    goToSlide(Number(control.dataset.slideIndex));
  });
});

sliderTrack.addEventListener("transitionend", (event) => {
  if (event.propertyName !== "transform") {
    return;
  }

  if (trackIndex === 0) {
    trackIndex = slides.length;
    setTrackPosition(false);
  } else if (trackIndex === slides.length + 1) {
    trackIndex = 1;
    setTrackPosition(false);
  }

  isAnimating = false;
});

sliderViewport.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary || event.pointerType === "mouse") {
    return;
  }

  pointerStart = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
  };
  sliderViewport.setPointerCapture(event.pointerId);
});

sliderViewport.addEventListener("pointerup", (event) => {
  if (!pointerStart || event.pointerId !== pointerStart.id) {
    return;
  }

  const distanceX = event.clientX - pointerStart.x;
  const distanceY = event.clientY - pointerStart.y;
  pointerStart = null;

  if (Math.abs(distanceX) >= SWIPE_THRESHOLD && Math.abs(distanceX) > Math.abs(distanceY)) {
    moveSlider(distanceX < 0 ? 1 : -1);
  }
});

sliderViewport.addEventListener("pointercancel", () => {
  pointerStart = null;
});

sliderTrack.addEventListener("dragstart", (event) => {
  event.preventDefault();
});

setTrackPosition(false);
updateSliderState();
