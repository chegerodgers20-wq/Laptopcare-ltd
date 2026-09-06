/* ==========================================================
   admin.js — Laptop Care Ltd admin panel (pairs with admin.html)
   ----------------------------------------------------------
   Access control is enforced in TWO places, both required:
   1. Here, so the UI stays hidden from non-admins.
   2. In firestore.rules, so even a signed-in non-admin cannot
      write to "products" directly against the database.
   Point 2 is the one that actually matters for security —
   never trust the client alone.
   ========================================================== */

const auth = firebase.auth();
let currentUid = null;

const gate = document.getElementById("adminGate");
const panel = document.getElementById("adminPanel");
const authMsg = document.getElementById("authMsg");
const userLabel = document.getElementById("adminUserLabel");

document.getElementById("signInBtn").addEventListener("click", async () => {
  authMsg.textContent = "";
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    authMsg.textContent = err.message;
  }
});

document.getElementById("signOutLink").addEventListener("click", (e) => {
  e.preventDefault();
  auth.signOut();
});

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    gate.style.display = "block";
    panel.style.display = "none";
    userLabel.textContent = "";
    return;
  }

  currentUid = user.uid;

  // Check the admins collection — doc ID matches the user's uid.
  // This mirrors what firestore.rules enforces server-side.
  const adminDoc = await db.collection("admins").doc(user.uid).get();

  if (!adminDoc.exists) {
    authMsg.textContent =
      "This account isn't authorised to manage products. Ask an existing admin to add your email.";
    await auth.signOut();
    return;
  }

  gate.style.display = "none";
  panel.style.display = "block";
  userLabel.textContent = user.email;

  loadProductList();
});

/* ---------- Product form ---------- */

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("productMsg");
  msg.className = "admin-msg";
  msg.textContent = "Saving…";

  const price = Number(document.getElementById("pPrice").value);
  const wasPriceRaw = document.getElementById("pWasPrice").value;

  const product = {
    name: document.getElementById("pName").value.trim(),
    grade: document.getElementById("pGrade").value,
    price,
    wasPrice: wasPriceRaw ? Number(wasPriceRaw) : null,
    specs: document.getElementById("pSpecs").value.trim(),
    imageUrl: document.getElementById("pImage").value.trim(),
    published: document.getElementById("pPublished").checked,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    createdBy: currentUid,
  };

  try {
    await db.collection("products").add(product);
    msg.classList.add("admin-msg--ok");
    msg.textContent = "Product saved.";
    document.getElementById("productForm").reset();
    document.getElementById("pPublished").checked = true;
    loadProductList();
  } catch (err) {
    msg.classList.add("admin-msg--error");
    msg.textContent = err.message;
  }
});

/* ---------- Product list ---------- */

function loadProductList() {
  const el = document.getElementById("productList");
  db.collection("products")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        el.innerHTML =
          "<p style='color:var(--slate);font-size:0.875rem;'>No products yet.</p>";
        return;
      }
      el.innerHTML = "";
      snapshot.forEach((doc) => {
        const p = doc.data();
        const row = document.createElement("div");
        row.className = "admin-list-item";
        row.innerHTML = `
          <span>${p.name} — KSh ${Number(p.price).toLocaleString("en-KE")} ${
            p.published ? "" : "(hidden)"
          }</span>
          <button data-del="${doc.id}">Delete</button>`;
        el.appendChild(row);
      });
    });
}

document.getElementById("productList").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-del]");
  if (!btn) return;
  if (!confirm("Delete this product?")) return;
  db.collection("products").doc(btn.dataset.del).delete().then(loadProductList);
});
