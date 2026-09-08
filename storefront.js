/* ==========================================================
   storefront.js — Laptop Care Ltd public storefront
   ----------------------------------------------------------
   Shared by index.html, laptops.html, parts.html, repairs.html,
   and contact.html. Every render function checks the target
   element exists first, since not every page has every section.

   Products load live from Firestore (collection: "products").
   Add these fields from admin.html for best results (all optional
   — sensible fallbacks kick in if they're missing):
     - category: "laptop" | "part"      (missing = treated as laptop)
     - brand: e.g. "HP", "Dell"          (missing = guessed from name)
     - partType: one of the PART_TYPES keys below (missing = guessed
       from keywords in the name/specs)
   ========================================================== */

const CURRENCY = "KES";

// Single source of truth for the WhatsApp number — used by the
// floating button, cart checkout, and the repairs booking link.
const WHATSAPP_NUMBER = "254741546004";

function formatKES(amount) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}

function waLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* ---------- Static content ---------- */

const STATS = [
  { value: "500+", label: "Laptops refurbished" },
  { value: "72hr", label: "Average repair turnaround" },
  { value: "90 day", label: "Warranty on every unit" },
  { value: "Grade A to C", label: "Honest, visible condition rating" },
];

const CATEGORIES = [
  {
    title: "Refurbished Laptops",
    desc: "Graded, tested, and warrantied — from budget to business spec.",
    icon: `<path d="M4 5h16v10H4z"/><path d="M2 19h20l-1.5-2h-17L2 19Z"/>`,
    href: "laptops.html?type=refurbished",
  },
  {
    title: "New Laptops",
    desc: "Sealed units from authorised suppliers, full manufacturer warranty.",
    icon: `<path d="M12 2v6M12 2 8 6M12 2l4 4"/><path d="M4 10h16v10H4z"/>`,
    href: "laptops.html?type=new",
  },
  {
    title: "Parts & Repairs",
    desc: "Screens, keyboards, batteries, chargers, and diagnostic services.",
    icon: `<path d="M14 4 4 14l3 3 10-10-3-3Z"/><path d="M9 19h10"/>`,
    href: "parts.html",
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

// Used for the homepage chip strip and as the source of Parts page
// sections (each entry becomes its own heading + grid on parts.html).
const PART_TYPES = [
  { key: "batteries", label: "Batteries", keywords: ["battery", "batteries"] },
  {
    key: "chargers",
    label: "Chargers & Adapters",
    keywords: ["charger", "adapter", "power supply", "psu"],
  },
  { key: "keyboards", label: "Keyboards", keywords: ["keyboard"] },
  {
    key: "ram-storage",
    label: "RAM & Storage",
    keywords: ["ram", "memory", "ssd", "hdd", "nvme", "storage"],
  },
  {
    key: "screens",
    label: "Screens",
    keywords: ["screen", "display", "panel", "lcd"],
  },
  {
    key: "hinges-casings",
    label: "Hinges & Casings",
    keywords: ["hinge", "casing", "case", "chassis", "shell", "cover"],
  },
  {
    key: "cooling-fans",
    label: "Cooling Fans",
    keywords: ["fan", "cooling", "heatsink"],
  },
  {
    key: "diagnostics",
    label: "Diagnostics",
    keywords: ["diagnostic", "diagnosis"],
  },
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

// Edit the "eta" field on any service below to change the turnaround
// time shown on repairs.html — nothing else needs to change.
const REPAIR_SERVICES = [
  {
    title: "Screen replacement",
    desc: "Cracked, flickering, or dead-pixel screens swapped with tested, grade-matched panels.",
    eta: "Same day",
    icon: `<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/>`,
  },
  {
    title: "Battery replacement",
    desc: "Health check plus replacement for laptops that no longer hold charge or shut down unexpectedly.",
    eta: "1 to 2 hours",
    icon: `<rect x="5" y="7" width="13" height="10" rx="1"/><path d="M18 10h2v4h-2z"/>`,
  },
  {
    title: "Keyboard replacement",
    desc: "Sticky, unresponsive, or missing keys — full keyboard assembly replacement.",
    eta: "1 to 2 hours",
    icon: `<rect x="3" y="6" width="18" height="12" rx="1"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/>`,
  },
  {
    title: "Motherboard diagnostics",
    desc: "No-power, no-boot, or intermittent fault diagnosis down to component level.",
    eta: "24 to 48 hours",
    icon: `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 4v16M15 4v16M4 9h16M4 15h16"/>`,
  },
  {
    title: "Data recovery",
    desc: "Recovery from failing drives or accidental deletion, plus migration to a new drive.",
    eta: "24 to 72 hours",
    icon: `<path d="M4 7v10a8 3 0 0 0 16 0V7"/><ellipse cx="12" cy="7" rx="8" ry="3"/>`,
  },
  {
    title: "Software & virus removal",
    desc: "OS reinstalls, malware removal, slow-laptop tune-ups, and software setup.",
    eta: "Same day",
    icon: `<circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/>`,
  },
];

const PROCESS_STEPS = [
  {
    title: "Message us",
    desc: "Send your laptop's issue via WhatsApp for a quick first read.",
  },
  {
    title: "Drop off or pickup",
    desc: "Bring it in, or arrange a pickup in Nairobi.",
  },
  {
    title: "Diagnosis & quote",
    desc: "We confirm the fault and give you a fixed price before starting.",
  },
  { title: "Repair", desc: "Work begins only once you approve the quote." },
  {
    title: "Collect",
    desc: "Tested, cleaned, and handed back with a warranty on the repair.",
  },
];

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://facebook.com/laptopcareltd",
    icon: `<path d="M15 3h-2a4 4 0 0 0-4 4v3H7v3h2v7h3v-7h2.5l.5-3H12V7a1 1 0 0 1 1-1h2z"/>`,
  },
  {
    name: "Instagram",
    href: "https://instagram.com/laptopcareltd",
    icon: `<rect x="3" y="3" width="18" height="18" rx="4.5"/><circle cx="12" cy="12" r="3.5"/><line x1="16.7" y1="6.8" x2="16.7" y2="6.8"/>`,
  },
  {
    name: "X",
    href: "https://x.com/laptopcareltd",
    icon: `<path d="M5 4 19 20M19 4 5 20"/>`,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/laptopcareltd",
    icon: `<path d="M15 8a5 5 0 0 1 5 5v6h-3v-6a2 2 0 0 0-4 0v6h-3v-10h3v1.3A4.98 4.98 0 0 1 15 8Z"/><rect x="3" y="9" width="3" height="10"/><circle cx="4.5" cy="5" r="1.6"/>`,
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/@laptopcareltd",
    icon: `<path d="M14 4v9.5a3.5 3.5 0 1 1-3-3.46"/><path d="M14 4c.4 2.2 2 3.7 4 4"/>`,
  },
];

const KNOWN_BRANDS = [
  "HP",
  "Dell",
  "Lenovo",
  "Apple",
  "Asus",
  "Acer",
  "MSI",
  "Microsoft",
  "Samsung",
  "Toshiba",
  "LG",
];

function getBrand(p) {
  if (p.brand) return p.brand;
  const firstWord = (p.name || "").trim().split(/\s+/)[0] || "";
  const match = KNOWN_BRANDS.find(
    (b) => b.toLowerCase() === firstWord.toLowerCase(),
  );
  return match || firstWord || "Other";
}

function getPartType(p) {
  if (p.partType) return p.partType;
  const text = `${p.name || ""} ${p.specs || ""}`.toLowerCase();
  const match = PART_TYPES.find((t) =>
    t.keywords.some((k) => text.includes(k)),
  );
  return match ? match.key : "other";
}

/* ---------- Rendering: static sections (guarded — not every page has these) ---------- */

function renderStats() {
  const el = document.getElementById("statStrip");
  if (!el) return;
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
  if (!el) return;
  el.innerHTML = CATEGORIES.map(
    (c) => `
    <a class="category-card" href="${c.href}">
      <div class="category-card__icon">
        <svg class="icon" viewBox="0 0 24 24">${c.icon}</svg>
      </div>
      <div class="category-card__title">
        ${c.title}
        <svg class="icon" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </div>
      <div class="category-card__desc">${c.desc}</div>
    </a>`,
  ).join("");
}

function renderGrades() {
  const el = document.getElementById("gradeGrid");
  if (!el) return;
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

function renderPartsChipsHome() {
  // Homepage's informational chip strip (not clickable — parts.html
  // has the real clickable, jump-to-section version).
  const el = document.getElementById("partsChips");
  if (!el) return;
  el.innerHTML = PART_TYPES.map(
    (p) => `<span class="chip">${p.label}</span>`,
  ).join("");
}

function renderTestimonials() {
  const el = document.getElementById("testimonialGrid");
  if (!el) return;
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

function renderServices() {
  const el = document.getElementById("serviceGrid");
  if (!el) return;
  el.innerHTML = REPAIR_SERVICES.map(
    (s) => `
    <div class="service-card">
      <div class="service-card__icon">
        <svg class="icon" viewBox="0 0 24 24">${s.icon}</svg>
      </div>
      <div class="service-card__title">${s.title}</div>
      <div class="service-card__desc">${s.desc}</div>
      <span class="service-card__eta">${s.eta}</span>
    </div>`,
  ).join("");
}

function renderProcessSteps() {
  const el = document.getElementById("processGrid");
  if (!el) return;
  el.innerHTML = PROCESS_STEPS.map(
    (s, i) => `
    <div class="process-step">
      <div class="process-step__num">${i + 1}</div>
      <div class="process-step__title">${s.title}</div>
      <div class="process-step__desc">${s.desc}</div>
    </div>`,
  ).join("");
}

function renderSocialInto(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = SOCIAL_LINKS.map(
    (s) => `
    <a class="social-icon" href="${s.href}" target="_blank" rel="noopener noreferrer" aria-label="${s.name}">
      <svg class="icon" viewBox="0 0 24 24">${s.icon}</svg>
    </a>`,
  ).join("");
}

function renderAllSocial() {
  renderSocialInto("footerSocial");
  renderSocialInto("contactSocial");
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
  const badgeText =
    p.grade === "New" ? "New" : p.grade ? `Grade ${p.grade}` : "";
  const badge = badgeText
    ? `<span class="badge ${badgeClass}">${badgeText}</span>`
    : "";
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
        ${badge}
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

function sortDocs(docs, sortBy) {
  const arr = [...docs];
  if (sortBy === "brand") {
    arr.sort((a, b) => {
      const ba = getBrand(a).toLowerCase();
      const bb = getBrand(b).toLowerCase();
      if (ba !== bb) return ba < bb ? -1 : 1;
      return (a.name || "").localeCompare(b.name || "");
    });
  } else if (sortBy === "price-asc") {
    arr.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortBy === "price-desc") {
    arr.sort((a, b) => (b.price || 0) - (a.price || 0));
  }
  return arr; // "newest" keeps Firestore's createdAt-desc order
}

function fetchPublishedProducts(limitCount) {
  if (typeof db === "undefined") return Promise.reject(new Error("no-db"));
  return db
    .collection("products")
    .where("published", "==", true)
    .orderBy("createdAt", "desc")
    .limit(limitCount)
    .get()
    .then((snapshot) => {
      const docs = [];
      snapshot.forEach((doc) => {
        const p = { id: doc.id, ...doc.data() };
        productCache[doc.id] = p;
        docs.push(p);
      });
      return docs;
    });
}

// Generic single-grid loader — homepage and laptops.html use this.
function loadProducts({
  gridId = "productGrid",
  category = null,
  gradeType = null,
  sortBy = "newest",
  limitCount = 8,
} = {}) {
  const el = document.getElementById(gridId);
  if (!el) return;

  el.innerHTML = `<div class="empty-state">Loading…</div>`;

  fetchPublishedProducts(limitCount)
    .then((docs) => {
      if (category)
        docs = docs.filter((p) => (p.category || "laptop") === category);
      if (gradeType === "new") docs = docs.filter((p) => p.grade === "New");
      else if (gradeType === "refurbished")
        docs = docs.filter((p) => p.grade && p.grade !== "New");

      if (docs.length === 0) {
        el.innerHTML = `<div class="empty-state">Nothing to show here yet — check back soon.</div>`;
        return;
      }

      docs = sortDocs(docs, sortBy);
      el.innerHTML = docs.map((p) => productCardHTML(p.id, p)).join("");
    })
    .catch((err) => {
      if (err.message === "no-db") {
        el.innerHTML = `<div class="empty-state">Product catalogue is not connected yet.</div>`;
      } else {
        console.error("Failed to load products:", err);
        el.innerHTML = `<div class="empty-state">Couldn't load items right now — please refresh.</div>`;
      }
    });
}

// Parts page: one grid per category, grouped client-side by partType.
function loadPartsPage() {
  PART_TYPES.forEach((t) => {
    const el = document.getElementById(`partsGrid-${t.key}`);
    if (el) el.innerHTML = `<div class="empty-state">Loading…</div>`;
  });

  fetchPublishedProducts(150)
    .then((docs) => {
      const parts = docs.filter((p) => (p.category || "laptop") === "part");
      const grouped = {};
      PART_TYPES.forEach((t) => (grouped[t.key] = []));

      parts.forEach((p) => {
        const key = getPartType(p);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(p);
      });

      PART_TYPES.forEach((t) => {
        const el = document.getElementById(`partsGrid-${t.key}`);
        if (!el) return;
        const items = grouped[t.key] || [];
        el.innerHTML = items.length
          ? items.map((p) => productCardHTML(p.id, p)).join("")
          : `<div class="empty-state">No ${t.label.toLowerCase()} in stock right now — check back soon.</div>`;
      });
    })
    .catch((err) => {
      if (err.message === "no-db") {
        PART_TYPES.forEach((t) => {
          const el = document.getElementById(`partsGrid-${t.key}`);
          if (el)
            el.innerHTML = `<div class="empty-state">Product catalogue is not connected yet.</div>`;
        });
      } else {
        console.error("Failed to load parts:", err);
        PART_TYPES.forEach((t) => {
          const el = document.getElementById(`partsGrid-${t.key}`);
          if (el)
            el.innerHTML = `<div class="empty-state">Couldn't load parts right now — please refresh.</div>`;
        });
      }
    });
}

/* ---------- Laptops page: brand-sort + type filter (no full reload) ---------- */

function initLaptopsPage() {
  const params = new URLSearchParams(window.location.search);
  let type = params.get("type");
  let sort = params.get("sort") || "brand";

  function refresh() {
    loadProducts({
      gridId: "productGrid",
      category: "laptop",
      gradeType: type,
      sortBy: sort,
      limitCount: 24,
    });
    document.querySelectorAll(".filter-tab").forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.type === (type || "all"));
    });
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) sortSelect.value = sort;
  }

  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      type = tab.dataset.type === "all" ? null : tab.dataset.type;
      const url = new URL(window.location);
      if (type) url.searchParams.set("type", type);
      else url.searchParams.delete("type");
      window.history.pushState({}, "", url);
      refresh();
    });
  });

  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      sort = sortSelect.value;
      const url = new URL(window.location);
      url.searchParams.set("sort", sort);
      window.history.pushState({}, "", url);
      refresh();
    });
  }

  refresh();
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
  if (cart[id]) cart[id].qty += 1;
  else
    cart[id] = {
      id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || "",
      qty: 1,
    };
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
  const countEl = document.getElementById("cartCount");
  const subtotalEl = document.getElementById("cartSubtotal");
  const checkoutEl = document.getElementById("cartCheckout");
  if (!itemsEl) return;

  const items = Object.values(cart);
  if (countEl) countEl.textContent = cartCount();
  if (subtotalEl) subtotalEl.textContent = formatKES(cartSubtotal());

  if (items.length === 0) {
    itemsEl.innerHTML = `<div class="cart-drawer__empty">Your cart is empty.</div>`;
  } else {
    itemsEl.innerHTML = items
      .map(
        (item, index) => `
      <div class="cart-item">
        <div class="cart-item__number">${index + 1}</div>
        <div class="cart-item__image">${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" />` : ""}</div>
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

  if (checkoutEl) {
    const message =
      items.length === 0
        ? "Hi, I'd like to ask about a laptop."
        : "Hi, I'd like to order:\n" +
          items
            .map((i) => `- ${i.name} x${i.qty} (${formatKES(i.price * i.qty)})`)
            .join("\n") +
          `\n\nSubtotal: ${formatKES(cartSubtotal())}`;
    checkoutEl.href = waLink(message);
  }
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
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

/* ---------- Floating WhatsApp + repairs booking ---------- */

function setupWhatsappFloat() {
  const el = document.getElementById("whatsappFloat");
  if (el) el.href = waLink("Hi, can I get more info on this?");
}

function setupRepairBooking() {
  const el = document.getElementById("bookRepairBtn");
  if (el) el.href = waLink("Hi, I'd like to book a repair. Here's the issue: ");
  const bottomBtn = document.getElementById("bookRepairBtnBottom");
  if (el && bottomBtn) bottomBtn.href = el.href;
}

/* ---------- Active nav highlighting ---------- */

function highlightActiveNav() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll(".site-header__nav a[data-nav]").forEach((a) => {
    if (a.dataset.nav === page) a.classList.add("is-active");
  });
}

/* ---------- Header search (client-side filter of visible cards) ---------- */

function wireSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;
  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    document.querySelectorAll(".product-card").forEach((card) => {
      const nameEl = card.querySelector(".product-card__name");
      const name = nameEl ? nameEl.textContent.toLowerCase() : "";
      card.style.display = !term || name.includes(term) ? "" : "none";
    });
  });
}

/* ---------- Back link ---------- */

function wireBackLink() {
  const el = document.getElementById("backLink");
  if (!el) return;
  el.addEventListener("click", (e) => {
    e.preventDefault();
    if (window.history.length > 1) window.history.back();
    else window.location.href = "index.html";
  });
}

/* ---------- Event wiring ---------- */

document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  renderCategories();
  renderGrades();
  renderPartsChipsHome();
  renderTestimonials();
  renderServices();
  renderProcessSteps();
  renderAllSocial();
  renderCart();
  setupWhatsappFloat();
  setupRepairBooking();
  highlightActiveNav();
  wireSearch();
  wireBackLink();

  const cartToggle = document.getElementById("cartToggle");
  const cartClose = document.getElementById("cartClose");
  const cartOverlay = document.getElementById("cartOverlay");
  if (cartToggle) cartToggle.addEventListener("click", openCart);
  if (cartClose) cartClose.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

  document.querySelectorAll("[data-product-grid]").forEach((grid) => {
    grid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-add-to-cart]");
      if (btn) addToCart(btn.dataset.addToCart);
    });
  });

  const cartItemsEl = document.getElementById("cartItems");
  if (cartItemsEl) {
    cartItemsEl.addEventListener("click", (e) => {
      const up = e.target.closest("[data-qty-up]");
      const down = e.target.closest("[data-qty-down]");
      const remove = e.target.closest("[data-remove]");
      if (up) changeQty(up.dataset.qtyUp, 1);
      if (down) changeQty(down.dataset.qtyDown, -1);
      if (remove) removeFromCart(remove.dataset.remove);
    });
  }

  const page = document.body.dataset.page;
  if (page === "home") {
    loadProducts({ gridId: "productGrid", limitCount: 8 });
  } else if (page === "laptops") {
    initLaptopsPage();
  } else if (page === "parts") {
    loadPartsPage();
  }
});
