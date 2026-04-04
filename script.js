const UI = {
  productGrid: document.getElementById('product-grid'),
  cartItems: document.getElementById('cart-items'),
  totalDisplay: document.getElementById('total'),
  checkoutBtn: document.getElementById('checkout-btn'),
  toastContainer: document.getElementById('toast-container'),
  nameInput: document.getElementById('customer-name'),
  sectionTitle: document.getElementById('section-title'),
  btnOils: document.getElementById('show-oils'),
  btnServices: document.getElementById('show-services'),
  serviceOptions: document.getElementById('service-options'),
  serviceMode: document.getElementById('service-mode'),
  distanceWrap: document.getElementById('distance-input-wrap'),
  distanceInput: document.getElementById('distance')
};

const products = [
  { id: 1, name: "Shell Advance 4T Long Ride 10W-40 1L", price: 429, img: "longride.webp", type: "oil" },
  { id: 2, name: "Shell Advance AX7 10W-40 1L", price: 379, img: "ax7_1l.webp", type: "oil" },
  { id: 3, name: "Shell Advance AX7 10W-40 0.8L", price: 319, img: "ax7_0.8l.webp", type: "oil" },
  { id: 4, name: "Shell Advance AX7 Scooter 0.8L + Gear Oil", price: 349, img: "withgearoil.webp", type: "oil" },
  { id: 5, name: "Shell Advance City Scooter 1L", price: 389, img: "cityscooter.webp", type: "oil" },
  // Services
  { id: 101, name: "CVT Cleaning", price: 200, homePrice: 250, img: "cvt.png", type: "service" },
  { id: 102, name: "Change Oil", price: 30, homePrice: 50, img: "change_oil.png", type: "service" }
];

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentView = "oil";

function renderItems(filter) {
  currentView = filter;
  const filtered = products.filter(p => p.type === filter);
  
  UI.productGrid.innerHTML = filtered.map(p => `
    <div class="product-card">
      <img src="${p.img}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/150?text=SJM+Moto'">
      <h3>${p.name}</h3>
      <p class="price">₱${p.price.toLocaleString()}${p.type === 'service' ? ' (Base)' : ''}</p>
      <button class="btn-primary add-to-cart" data-id="${p.id}">Add to Cart</button>
    </div>
  `).join('');

  // Update UI State
  UI.sectionTitle.textContent = filter === "oil" ? "Motorcycle Oil" : "Our Services";
  UI.btnOils.classList.toggle('active', filter === 'oil');
  UI.btnServices.classList.toggle('active', filter === 'service');
}

function displayCart() {
  const hasService = cart.some(item => item.type === 'service');
  UI.serviceOptions.style.display = hasService ? "block" : "none";

  if (cart.length === 0) {
    UI.cartItems.innerHTML = `<p style="text-align:center; color:#888;">Empty</p>`;
    UI.totalDisplay.textContent = "0.00";
    return;
  }

  let subtotal = 0;
  const isHomeService = UI.serviceMode.value === "home";
  const distance = parseFloat(UI.distanceInput.value) || 0;

  UI.cartItems.innerHTML = cart.map((item, index) => {
    // Logic: If Home Service, use the service's homePrice, else use standard price
    let itemPrice = (isHomeService && item.type === 'service') ? item.homePrice : item.price;
    let lineTotal = itemPrice * item.qty;
    subtotal += lineTotal;

    return `
      <div class="cart-item">
        <div style="flex:2">
          <strong>${item.name}</strong><br>
          <small>₱${itemPrice} ${item.type === 'service' && isHomeService ? '(Home Rate)' : ''}</small>
        </div>
        <div class="cart-controls">
          <button class="qty-btn" data-index="${index}" data-delta="-1">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-index="${index}" data-delta="1">+</button>
        </div>
        <div style="flex:1; text-align:right">₱${lineTotal.toFixed(2)}</div>
      </div>
    `;
  }).join('');

  // Add Distance Fee if Home Service
  let distanceFee = isHomeService ? (distance * 3) : 0;
  let finalTotal = subtotal + distanceFee;

  if(distanceFee > 0) {
    UI.cartItems.innerHTML += `
      <div class="cart-item" style="border-top: 1px dashed red">
        <div style="flex:2"><strong>Distance Fee</strong><br><small>₱3.00 x ${distance}km</small></div>
        <div style="flex:1; text-align:right">₱${distanceFee.toFixed(2)}</div>
      </div>`;
  }

  UI.totalDisplay.textContent = finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });
}

// Event handlers
UI.btnOils.addEventListener('click', () => renderItems('oil'));
UI.btnServices.addEventListener('click', () => renderItems('service'));

UI.serviceMode.addEventListener('change', (e) => {
  UI.distanceWrap.style.display = e.target.value === "home" ? "block" : "none";
  displayCart();
});

UI.distanceInput.addEventListener('input', displayCart);

// Updated Checkout logic to include service details
async function checkout() {
  const name = UI.nameInput.value.trim();
  if (cart.length === 0) return alert("Your cart is empty!");
  if (!name) return alert("Please enter your name!");

  const isHome = UI.serviceMode.value === "home";
  const dist = UI.distanceInput.value;
  const total = UI.totalDisplay.textContent;

  // 1. Prepare Message
  let message = `📦 *New Order/Booking*\nCustomer: ${name}\n`;
  message += `Type: ${isHome ? '🏠 Home Service (' + dist + 'km)' : '🏪 Shop Visit'}\n\n`;
  cart.forEach(item => {
    let p = (isHome && item.type === 'service') ? item.homePrice : item.price;
    message += `• ${item.name} (x${item.qty}) - ₱${(p * item.qty).toFixed(2)}\n`;
  });
  message += `\n*Total: ₱${total}*`;

  // 2. iOS-Friendly Clipboard Copy
  try {
    await navigator.clipboard.writeText(message);
  } catch (err) {
    // Fallback for older iOS versions
    const textArea = document.createElement("textarea");
    textArea.value = message;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }

  // 3. The Redirect (Crucial for iOS)
  // On iOS, the alert "pauses" the script. 
  // We place the redirect IMMEDIATELY after the alert so Safari sees it 
  // as a direct result of the user clicking "OK".
  alert("✅ Details Copied!\n\nClick OK to open Messenger and PASTE your order.");

  // Using window.location.href is the most stable way to trigger the Messenger App on iOS
  window.location.href = "fb-messenger://user-thread/stephenjay.balansag.3";

  // Fallback: If the app doesn't open via the deep link, use the web link
  setTimeout(() => {
    window.location.href = "https://m.me/stephenjay.balansag.3";
  }, 500);

  // 4. Clear Cart
  cart = [];
  localStorage.removeItem("cart");
  UI.nameInput.value = "";
  displayCart();
}
// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderItems('oil');
  displayCart();
  document.body.addEventListener('click', (e) => {
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
  });
  UI.checkoutBtn.addEventListener('click', checkout);
});

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