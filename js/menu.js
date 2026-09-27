const DEFAULT_CATEGORY = "coffee";
const INITIAL_MOBILE_PRODUCT_COUNT = 4;
const mobileCatalog = window.matchMedia("(max-width: 768px)");
const menuGrid = document.querySelector("[data-menu-grid]");
const menuMoreButton = document.querySelector("[data-menu-more]");
const categoryTabs = Array.from(document.querySelectorAll("[data-category]"));

let activeCategory = DEFAULT_CATEGORY;
let isCatalogExpanded = false;

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "menu-card";
  card.dataset.productId = product.id;

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

menuMoreButton.addEventListener("click", () => {
  isCatalogExpanded = true;
  renderProducts();
});

mobileCatalog.addEventListener("change", () => {
  isCatalogExpanded = false;
  renderProducts();
});

setActiveCategory(DEFAULT_CATEGORY);
