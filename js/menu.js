const DEFAULT_CATEGORY = "coffee";
const INITIAL_MOBILE_PRODUCT_COUNT = 4;
const mobileCatalog = window.matchMedia("(max-width: 768px)");
const menuGrid = document.querySelector("[data-menu-grid]");
const menuMoreButton = document.querySelector("[data-menu-more]");
const categoryTabs = Array.from(document.querySelectorAll("[data-category]"));
const productModal = document.querySelector("[data-product-modal]");
const modalImageBox = productModal.querySelector("[data-modal-image-box]");
const modalImage = document.createElement("img");
const modalTitle = productModal.querySelector("[data-modal-title]");
const modalDescription = productModal.querySelector("[data-modal-description]");
const modalPrice = productModal.querySelector("[data-modal-price]");
const modalSizes = productModal.querySelector("[data-modal-sizes]");
const modalAdditives = productModal.querySelector("[data-modal-additives]");
const modalCloseButton = productModal.querySelector("[data-modal-close]");

let activeCategory = DEFAULT_CATEGORY;
let isCatalogExpanded = false;
let lastFocusedCard = null;
let selectedProduct = null;
let selectedSizeIndex = 0;
let selectedAdditives = new Set();

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "menu-card";
  card.dataset.productId = product.id;
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-haspopup", "dialog");
  card.setAttribute("aria-label", `View details for ${product.name}`);

  card.innerHTML = `
    <div class="menu-card__image-box">
      <img src="../assets/images/${product.image}" alt="${product.name}">
    </div>
    <div class="menu-card__content">
      <div class="menu-card__heading">
        <h2>${product.name}</h2>
        <p>${product.description}</p>
      </div>
      <p class="menu-card__price">${formatPrice(product.price)}</p>
    </div>
  `;

  return card;
}

function createModalOption(marker, label, isActive, dataName, index) {
  const button = document.createElement("button");
  button.className = "product-option";
  button.type = "button";
  button.dataset[dataName] = String(index);
  button.setAttribute("aria-pressed", String(isActive));
  button.classList.toggle("product-option--active", isActive);

  const optionMarker = document.createElement("span");
  optionMarker.className = "product-option__marker";
  optionMarker.textContent = marker;

  const optionLabel = document.createElement("span");
  optionLabel.textContent = label;

  button.append(optionMarker, optionLabel);
  return button;
}

function updateModalPrice() {
  const sizePrice = selectedProduct.sizes[selectedSizeIndex].addPrice;
  const additivesPrice = Array.from(selectedAdditives).reduce(
    (total, index) => total + selectedProduct.additives[index].addPrice,
    0,
  );

  modalPrice.textContent = formatPrice(
    selectedProduct.price + sizePrice + additivesPrice,
  );
}

function renderModalOptions() {
  const sizeButtons = selectedProduct.sizes.map((size, index) =>
    createModalOption(
      size.code,
      size.value,
      index === selectedSizeIndex,
      "sizeIndex",
      index,
    ),
  );
  const additiveButtons = selectedProduct.additives.map((additive, index) =>
    createModalOption(
      String(index + 1),
      additive.name,
      selectedAdditives.has(index),
      "additiveIndex",
      index,
    ),
  );

  modalSizes.replaceChildren(...sizeButtons);
  modalAdditives.replaceChildren(...additiveButtons);
}

function updateModalOptionStates() {
  modalSizes.querySelectorAll("[data-size-index]").forEach((option) => {
    const isActive = Number(option.dataset.sizeIndex) === selectedSizeIndex;
    option.classList.toggle("product-option--active", isActive);
    option.setAttribute("aria-pressed", String(isActive));
  });

  modalAdditives
    .querySelectorAll("[data-additive-index]")
    .forEach((option) => {
      const isActive = selectedAdditives.has(
        Number(option.dataset.additiveIndex),
      );
      option.classList.toggle("product-option--active", isActive);
      option.setAttribute("aria-pressed", String(isActive));
    });
}

function openProductModal(productId, card) {
  const product = PRODUCTS.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  selectedProduct = product;
  selectedSizeIndex = 0;
  selectedAdditives = new Set();
  lastFocusedCard = card;

  modalImage.src = `../assets/images/${selectedProduct.image}`;
  modalImage.alt = selectedProduct.name;
  modalImageBox.replaceChildren(modalImage);
  modalTitle.textContent = selectedProduct.name;
  modalDescription.textContent = selectedProduct.description;
  renderModalOptions();
  updateModalPrice();

  productModal.showModal();
  document.body.classList.add("is-scroll-locked");
}

function closeProductModal() {
  if (productModal.open) {
    productModal.close();
  }
}

function renderProducts() {
  const products = PRODUCTS.filter(
    (product) => product.category === activeCategory,
  );
  const hasHiddenProducts =
    mobileCatalog.matches && products.length > INITIAL_MOBILE_PRODUCT_COUNT;
  const visibleProducts =
    hasHiddenProducts && !isCatalogExpanded
      ? products.slice(0, INITIAL_MOBILE_PRODUCT_COUNT)
      : products;
  const cards = visibleProducts.map(createProductCard);

  menuGrid.replaceChildren(...cards);
  menuMoreButton.hidden = !hasHiddenProducts || isCatalogExpanded;
  menuMoreButton.setAttribute("aria-expanded", String(isCatalogExpanded));
}

function setActiveCategory(category) {
  activeCategory = category;
  isCatalogExpanded = false;

  categoryTabs.forEach((tab) => {
    const isActive = tab.dataset.category === activeCategory;
    tab.classList.toggle("menu-tab--active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });

  renderProducts();
}

categoryTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (tab.dataset.category !== activeCategory) {
      setActiveCategory(tab.dataset.category);
    }
  });
});

menuGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-product-id]");

  if (card) {
    openProductModal(card.dataset.productId, card);
  }
});

menuGrid.addEventListener("keydown", (event) => {
  const card = event.target.closest("[data-product-id]");

  if (card && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openProductModal(card.dataset.productId, card);
  }
});

modalCloseButton.addEventListener("click", closeProductModal);

modalSizes.addEventListener("click", (event) => {
  const option = event.target.closest("[data-size-index]");

  if (!option) {
    return;
  }

  selectedSizeIndex = Number(option.dataset.sizeIndex);
  updateModalOptionStates();
  updateModalPrice();
});

modalAdditives.addEventListener("click", (event) => {
  const option = event.target.closest("[data-additive-index]");

  if (!option) {
    return;
  }

  const additiveIndex = Number(option.dataset.additiveIndex);

  if (selectedAdditives.has(additiveIndex)) {
    selectedAdditives.delete(additiveIndex);
  } else {
    selectedAdditives.add(additiveIndex);
  }

  updateModalOptionStates();
  updateModalPrice();
});

productModal.addEventListener("click", (event) => {
  if (event.target !== productModal) {
    return;
  }

  const bounds = productModal.getBoundingClientRect();
  const clickedOutside =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;

  if (clickedOutside) {
    closeProductModal();
  }
});

productModal.addEventListener("close", () => {
  document.body.classList.remove("is-scroll-locked");
  lastFocusedCard?.focus();
  lastFocusedCard = null;
});

menuMoreButton.addEventListener("click", () => {
  isCatalogExpanded = true;
  renderProducts();
});

mobileCatalog.addEventListener("change", () => {
  isCatalogExpanded = false;
  renderProducts();
});

setActiveCategory(DEFAULT_CATEGORY);
