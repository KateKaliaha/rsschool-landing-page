const DEFAULT_CATEGORY = "coffee";
const menuGrid = document.querySelector("[data-menu-grid]");
const categoryTabs = Array.from(document.querySelectorAll("[data-category]"));

let activeCategory = DEFAULT_CATEGORY;

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
  const cards = products.map(createProductCard);

  menuGrid.replaceChildren(...cards);
}

function setActiveCategory(category) {
  activeCategory = category;

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

setActiveCategory(DEFAULT_CATEGORY);
