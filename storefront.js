/* ==========================================================
   storefront.js — Laptop Care Ltd public storefront
   ----------------------------------------------------------
   Products are loaded live from Firestore (collection: "products")
   so new stock can be added from admin.html without touching code.
   Categories, grades, testimonials, and the stat strip are static
   content below — edit the arrays directly if those need to change.
   ========================================================== */

const CURRENCY = "KES";

// Single source of truth for the WhatsApp number — used by both the
// floating button and the cart checkout link, so it only needs updating
// in one place. Format: country code + number, no "+", no leading 0.
const WHATSAPP_NUMBER = "254741546004";

function formatKES(amount) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}

/* ---------- Static content ---------- */

const STATS = [
  { value: "500+", label: "Laptops refurbished" },
  { value: "48hr", label: "Average repair turnaround" },
  { value: "90-day", label: "Warranty on every unit" },
  { value: "Grade A–C", label: "Honest, visible condition rating" },
];

const CATEGORIES = [
  {
    title: "Refurbished Laptops",
    desc: "Graded, tested, and warrantied — from budget to business spec.",
    icon: `<path d="M4 5h16v10H4z"/><path d="M2 19h20l-1.5-2h-17L2 19Z"/>`,
  },
  {
    title: "New Laptops",
    desc: "Sealed units from authorised suppliers, full manufacturer warranty.",
    icon: `<path d="M12 2v6M12 2 8 6M12 2l4 4"/><path d="M4 10h16v10H4z"/>`,
  },
  {
    title: "Parts & Repairs",
    desc: "Screens, keyboards, batteries, chargers, and diagnostic services.",
    icon: `<path d="M14 4 4 14l3 3 10-10-3-3Z"/><path d="M9 19h10"/>`,
  },
];

const GRADES = [
  {
    letter: "A",
    label: "Grade A — Like new",
    desc: "Minimal to no visible wear. Screen and shell in excellent condition. Full battery health check.",
  },
  {
    letter: "B",
    label: "Grade B — Light wear",
    desc: "Light scuffs or scratches that don't affect use. Fully functional, tested internals.",
  },
  {
    letter: "C",
    label: "Grade C — Visible wear",
    desc: "Noticeable cosmetic wear (dents, scratches) but fully tested and working reliably.",
  },
];

const PARTS = [
  "Batteries",
  "Chargers & adapters",
  "Keyboards",
  "RAM & storage",
  "Screens",
  "Hinges & casings",
  "Cooling fans",
  "Diagnostics",
];

const TESTIMONIALS = [
  {
    name: "Wanjiru K.",
    device: "ThinkPad T14, Grade A",
    quote:
      "Bought a refurbished ThinkPad and it looked barely used. The grading was accurate to the letter.",
    stars: 5,
  },
  {
    name: "Brian O.",
    device: "HP EliteBook, screen repair",
    quote:
      "Cracked my screen the day before a client pitch. They had it fixed same day.",
    stars: 5,
  },
  {
    name: "Amina S.",
    device: "Dell Latitude, Grade B",
    quote:
      "Good value for a Grade B unit — the small marks were exactly as described, nothing hidden.",
    stars: 4,
  },
];

/* ---------- Rendering: static sections ---------- */

function renderStats() {
  const el = document.getElementById("statStrip");
  el.innerHTML = STATS.map(
    (s) => `
    <div class="stat-strip__item">
      <div class="stat-strip__value">${s.value}</div>
      <div class="stat-strip__label">${s.label}</div>
    </div>`,
  ).join("");
}

function renderCategories() {
  const el = document.getElementById("categoryGrid");
  el.innerHTML = CATEGORIES.map(
    (c) => `
    <div class="category-card">
      <div class="category-card__icon">
        <svg class="icon" viewBox="0 0 24 24">${c.icon}</svg>
      </div>
      <div class="category-card__title">${c.title}</div>
      <div class="category-card__desc">${c.desc}</div>
    </div>`,
  ).join("");
}

function renderGrades() {
  const el = document.getElementById("gradeGrid");
  el.innerHTML = GRADES.map(
    (g) => `
    <div class="grade-card">
      <div class="grade-card__head">
        <div class="grade-card__letter">${g.letter}</div>
        <div class="grade-card__label">${g.label}</div>
      </div>
      <div class="grade-card__desc">${g.desc}</div>
    </div>`,
  ).join("");
}

function renderParts() {
  const el = document.getElementById("partsChips");
  el.innerHTML = PARTS.map((p) => `<span class="chip">${p}</span>`).join("");
}

function renderTestimonials() {
  const el = document.getElementById("testimonialGrid");
  el.innerHTML = TESTIMONIALS.map((t) => {
    const stars = "★".repeat(t.stars) + "☆".repeat(5 - t.stars);
    return `
    <div class="testimonial-card">
      <div class="testimonial-card__stars">${stars}</div>
      <p class="testimonial-card__quote">${t.quote}</p>
      <div class="testimonial-card__footer">
        <div class="testimonial-card__name">${t.name}</div>
        <div class="testimonial-card__device">${t.device}</div>
      </div>
    </div>`;
  }).join("");
}

/* ---------- Rendering: products (from Firestore) ---------- */

const GRADE_BADGE_CLASS = {
  A: "badge--grade-a",
  B: "badge--grade-b",
  C: "badge--grade-b",
  New: "badge--new",
};

function productCardHTML(id, p) {
  const badgeClass = GRADE_BADGE_CLASS[p.grade] || "badge--new";
  const badgeText = p.grade === "New" ? "New" : `Grade ${p.grade}`;
  const image = p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}" />` : "";
  const wasPrice = p.wasPrice
    ? `<span class="product-card__price-was">${formatKES(p.wasPrice)}</span>`
    : "";

  return `
    <div class="product-card">
      <div class="product-card__image">${image}</div>
      <div class="product-card__top">
        <div>
          <div class="product-card__name">${p.name}</div>
          <div class="product-card__specs">${p.specs || ""}</div>
        </div>
        <span class="badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="product-card__price">
        <span class="product-card__price-now">${formatKES(p.price)}</span>
        ${wasPrice}
      </div>
      <div class="product-card__actions">
        <button class="btn btn--dark" data-add-to-cart="${id}">Add to cart</button>
      </div>
    </div>`;
}

const productCache = {};

function renderProducts(snapshot) {
  const el = document.getElementById("productGrid");

  if (snapshot.empty) {
    el.innerHTML = `<div class="empty-state">No laptops listed yet — check back soon.</div>`;
    return;
  }

  let html = "";
  snapshot.forEach((doc) => {
    const p = doc.data();
    productCache[doc.id] = { id: doc.id, ...p };
    html += productCardHTML(doc.id, p);
  });
  el.innerHTML = html;
}

function loadProducts() {
  const el = document.getElementById("productGrid");

  if (typeof db === "undefined") {
    el.innerHTML = `<div class="empty-state">Product catalogue is not connected yet.</div>`;
    return;
  }

  db.collection("products")
    .where("published", "==", true)
    .orderBy("createdAt", "desc")
    .limit(8)
    .get()
    .then(renderProducts)
    .catch((err) => {
      console.error("Failed to load products:", err);
      el.innerHTML = `<div class="empty-state">Couldn't load laptops right now — please refresh.</div>`;
    });
}

/* ---------- Cart ---------- */

const CART_KEY = "laptopcare_cart";
let cart = JSON.parse(localStorage.getItem(CART_KEY) || "{}");

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function cartCount() {
  return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
}

function cartSubtotal() {
  return Object.values(cart).reduce(
    (sum, item) => sum + item.qty * item.price,
    0,
  );
}

function addToCart(id) {
  const product = productCache[id];
  if (!product) return;

  if (cart[id]) {
    cart[id].qty += 1;
  } else {
    cart[id] = {
      id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || "",
      qty: 1,
    };
  }
  saveCart();
  renderCart();
  showToast(`${product.name} added to cart`);
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  const items = Object.values(cart);

  document.getElementById("cartCount").textContent = cartCount();
  document.getElementById("cartSubtotal").textContent =
    formatKES(cartSubtotal());

  if (items.length === 0) {
    itemsEl.innerHTML = `<div class="cart-drawer__empty">Your cart is empty.</div>`;
  } else {
    itemsEl.innerHTML = items
      .map(
        (item) => `
      <div class="cart-item">
        <div class="cart-item__image">${
          item.imageUrl
            ? `<img src="${item.imageUrl}" alt="${item.name}" />`
            : ""
        }</div>
        <div>
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">${formatKES(item.price)}</div>
          <div class="cart-item__qty">
            <button data-qty-down="${item.id}" aria-label="Decrease quantity">−</button>
            <span>${item.qty}</span>
            <button data-qty-up="${item.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="cart-item__remove" data-remove="${item.id}">Remove</button>
      </div>`,
      )
      .join("");
  }

  const items2 = Object.values(cart);
  const message =
    items2.length === 0
      ? "Hi, I'd like to ask about a laptop."
      : "Hi, I'd like to order:%0A" +
        items2
          .map((i) => `- ${i.name} x${i.qty} (${formatKES(i.price * i.qty)})`)
          .join("%0A") +
        `%0A%0ASubtotal: ${formatKES(cartSubtotal())}`;

  document.getElementById("cartCheckout").href =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      decodeURIComponent(message),
    )}`;
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("is-open");
  document.getElementById("cartOverlay").classList.add("is-open");
}

function closeCart() {
  document.getElementById("cartDrawer").classList.remove("is-open");
  document.getElementById("cartOverlay").classList.remove("is-open");
}

let toastTimer;
function showToast(text) {
  const toast = document.getElementById("cartToast");
  toast.textContent = text;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

/* ---------- Floating WhatsApp button ---------- */

function setupWhatsappFloat() {
  const greeting = "Hi, can I get more info on this?";
  document.getElementById("whatsappFloat").href =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(greeting)}`;
}

/* ---------- Event wiring ---------- */

document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  renderCategories();
  renderGrades();
  renderParts();
  renderTestimonials();
  renderCart();
  loadProducts();
  setupWhatsappFloat();

  document.getElementById("cartToggle").addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  document.getElementById("cartOverlay").addEventListener("click", closeCart);

  document.getElementById("productGrid").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-to-cart]");
    if (btn) addToCart(btn.dataset.addToCart);
  });

  document.getElementById("cartItems").addEventListener("click", (e) => {
    const up = e.target.closest("[data-qty-up]");
    const down = e.target.closest("[data-qty-down]");
    const remove = e.target.closest("[data-remove]");
    if (up) changeQty(up.dataset.qtyUp, 1);
    if (down) changeQty(down.dataset.qtyDown, -1);
    if (remove) removeFromCart(remove.dataset.remove);
  });
});
