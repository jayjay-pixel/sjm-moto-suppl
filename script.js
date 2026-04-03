const UI = {
  productGrid: document.getElementById('product-grid'),
  cartItems: document.getElementById('cart-items'),
  totalDisplay: document.getElementById('total'),
  checkoutBtn: document.getElementById('checkout-btn'),
  toastContainer: document.getElementById('toast-container'),
  nameInput: document.getElementById('customer-name')
};

const products = [
  { id: 1, name: "Shell Advance 4T Long Ride 10W-40 1L", price: 429, img: "longride.webp" },
  { id: 2, name: "Shell Advance AX7 10W-40 1L", price: 379, img: "ax7_1l.webp" },
  { id: 3, name: "Shell Advance AX7 10W-40 0.8L", price: 319, img: "ax7_0.8l.webp" },
  { id: 4, name: "Shell Advance AX7 Scooter 0.8L + Gear Oil", price: 349, img: "withgearoil.webp" },
  { id: 5, name: "Shell Advance City Scooter 1L", price: 389, img: "cityscooter.webp" }
];

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// --- Core Logic ---

function renderProducts() {
  UI.productGrid.innerHTML = products.map(p => `
    <div class="product-card">
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <h3>${p.name}</h3>
      <p class="price">₱${p.price.toLocaleString()}</p>
      <button class="btn-primary add-to-cart" data-id="${p.id}">Add to Cart</button>
    </div>
  `).join('');
}

function displayCart() {
  if (cart.length === 0) {
    UI.cartItems.innerHTML = `<p style="text-align:center; color:#888; font-style:italic;">Your cart is empty</p>`;
    UI.totalDisplay.textContent = "0.00";
    return;
  }

  UI.cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div style="flex:2">
        <strong>${item.name}</strong><br>
        <small>₱${item.price} each</small>
      </div>
      <div class="cart-controls">
        <button class="qty-btn" data-index="${index}" data-delta="-1">-</button>
        <span>${item.qty}</span>
        <button class="qty-btn" data-index="${index}" data-delta="1">+</button>
      </div>
      <div style="flex:1; text-align:right">₱${(item.price * item.qty).toFixed(2)}</div>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  UI.totalDisplay.textContent = total.toLocaleString(undefined, { minimumFractionDigits: 2 });
}

// --- Event Handlers ---

function handleCartActions(e) {
  if (e.target.classList.contains('add-to-cart')) {
    const id = parseInt(e.target.dataset.id);
    const product = products.find(p => p.id === id);
    const cartItem = cart.find(item => item.id === id);

    if (cartItem) cartItem.qty++;
    else cart.push({ ...product, qty: 1 });

    saveAndRefresh(`Added ${product.name}`);
  }

  if (e.target.classList.contains('qty-btn')) {
    const index = e.target.dataset.index;
    const delta = parseInt(e.target.dataset.delta);
    
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    
    saveAndRefresh();
  }
}

function saveAndRefresh(msg) {
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
  if (msg) showToast(msg);
}

function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  UI.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

async function checkout() {
  const name = UI.nameInput.value.trim();

  if (cart.length === 0) return alert("Your cart is empty!");
  if (!name) return alert("Please enter your name before checking out!");

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  const orderData = {
    customer: name,
    items: cart,
    total: total.toFixed(2)
  };

  // 1. Prepare Messenger Message
  let message = `📦 *New Order for SJM Moto*\nCustomer: ${name}\n\n`;
  cart.forEach(item => {
    message += `• ${item.name} (x${item.qty}) - ₱${(item.price * item.qty).toFixed(2)}\n`;
  });
  message += `\n*Total: ₱${total.toFixed(2)}*`;

  UI.checkoutBtn.innerText = "Redirecting...";
  UI.checkoutBtn.disabled = true;

  // 2. IMMEDIATE CLIPBOARD COPY
  try {
    await navigator.clipboard.writeText(message);
  } catch (err) {
    console.warn("Clipboard failed, proceeding anyway.");
  }

  // 3. BACKGROUND FETCH (Don't "await" this so redirect happens immediately)
  fetch('https://script.google.com/macros/s/AKfycbwLhKj_ApouehvAVNQL9CvhrxjrHPIj8_eyOQEC84b8U01px4mh2oyDUC5TEsTQtbmO/exec', {
    method: 'POST',
    mode: 'no-cors', 
    body: JSON.stringify(orderData)
  }).catch(err => console.error("Sheet save failed in background", err));

  // 4. ALERT AND REDIRECT (Mobile browsers like alerts to 'unlock' the redirect)
  alert("✅ Order recorded! Opening Messenger...\n\nPlease paste the details in our chat.");
  
  // Use location.href instead of window.open to bypass pop-up blockers
  window.location.href = `https://m.me/stephenjay.balansag.3`;

  // 5. CLEAR LOCAL STATE
  cart = [];
  UI.nameInput.value = "";
  saveAndRefresh();
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  displayCart();
  document.body.addEventListener('click', handleCartActions);
  UI.checkoutBtn.addEventListener('click', checkout);
});