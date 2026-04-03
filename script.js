// Product Data (Scalable)
const products = [
  { name: "Shell Advance 4T Long Ride 10W-40 1L", price: 429, img: "longride.webp" },
  { name: "Shell Advance AX7 10W-40 1L", price: 379, img: "ax7_1l.webp" },
  { name: "Shell Advance AX7 10W-40 0.8L", price: 319, img: "ax7_0.8l.webp" },
  { name: "Shell Advance AX7 Scooter 0.8L + Free 120ML Gear Oil", price: 349, img: "withgearoil.webp" },
  { name: "Shell Advance City Scooter 1L", price: 389, img: "cityscooter.webp" }
];

// Cart initialization
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Render products
function renderProducts() {
  const container = document.querySelector(".products");
  container.innerHTML = "";
  products.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>₱${p.price}</p>
      <button onclick="addToCart(${i})">Add to Cart</button>
    `;
    container.appendChild(div);
  });
}

// Add to cart
function addToCart(index) {
  const product = products[index];
  const item = cart.find(p => p.name === product.name);
  if (item) item.qty++;
  else cart.push({ name: product.name, price: product.price, qty: 1 });
  saveCart();
  showToast(`${product.name} added to cart!`);
  displayCart();
}

// Save cart
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Display cart
function displayCart() {
  const container = document.querySelector(".cart-items");
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = `<p style="text-align:center; font-style:italic; color:#888;">Your cart is empty</p>`;
    document.getElementById("total").textContent = "0.00";
    return;
  }

  let total = 0;
  cart.forEach((item, i) => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-name">${item.name}</div>
      <div class="cart-item-qty">
        <button onclick="changeQty(${i}, -1)">-</button>
        ${item.qty}
        <button onclick="changeQty(${i}, 1)">+</button>
      </div>
      <div class="cart-item-price">₱${(item.price * item.qty).toFixed(2)}</div>
      <button onclick="removeItem(${i})">Remove</button>
    `;
    container.appendChild(div);
  });

  document.getElementById("total").textContent = total.toFixed(2);
}

// Change quantity
function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
  displayCart();
}

// Remove item
function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  displayCart();
}

// Checkout via Messenger
function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let message = "Hello! I want to order:\n\n";
  cart.forEach(item => {
    message += `${item.name} x${item.qty} = ₱${(item.price * item.qty).toFixed(2)}\n`;
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  message += `\nTotal: ₱${total.toFixed(2)}`;

  navigator.clipboard.writeText(message).then(() => {
    alert(
      `✅ Order copied!\n\n📌 Next Steps:\n1. Open Messenger\n2. Tap the message box\n3. Hold then press PASTE\n4. Send your order\n\nThank you!`
    );

    const username = "stephenjay.balansag.3";
    const messengerAppURL = `fb-messenger://user-thread/${username}`;
    const messengerWebURL = `https://m.me/${username}`;

    window.location.href = messengerAppURL;
    setTimeout(() => window.open(messengerWebURL, "_blank"), 700);
  });
}

// Toast notification
function showToast(msg) {
  const toast = document.createElement("div");
  toast.textContent = msg;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = "#333";
  toast.style.color = "#fff";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "5px";
  toast.style.opacity = "0.9";
  toast.style.zIndex = "1000";
  document.body.appendChild(toast);
  setTimeout(() => document.body.removeChild(toast), 2000);
}

// Initialize
renderProducts();
displayCart();
document.getElementById("checkout-btn").addEventListener("click", checkout);