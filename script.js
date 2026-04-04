const products = [
  { id: 1, name: "Shell Advance 4T Long Ride 1L", price: 429, img: "longride.webp", type: "oil" },
  { id: 2, name: "Shell Advance AX7 1L", price: 379, img: "ax7_1l.webp", type: "oil" },
  { id: 3, name: "Shell Advance AX7 0.8L", price: 319, img: "ax7_0.8l.webp", type: "oil" },
  { id: 4, name: "Shell AX7 Scooter 0.8L + Gear Oil", price: 349, img: "withgearoil.webp", type: "oil" },
  { id: 5, name: "Shell Advance City Scooter 1L", price: 389, img: "cityscooter.webp", type: "oil" },
  { id: 101, name: "CVT Cleaning", price: 200, homePrice: 250, img: "cvt.png", type: "service" },
  { id: 102, name: "Change Oil", price: 30, homePrice: 50, img: "change_oil.png", type: "service" }
];

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let serviceMode = "shop";

const UI = {
  grid: document.getElementById('product-grid'),
  cartList: document.getElementById('cart-items'),
  total: document.getElementById('total'),
  name: document.getElementById('customer-name'),
  distInput: document.getElementById('distance'),
  checkout: document.getElementById('checkout-btn'),
  servicePanel: document.getElementById('service-options'),
  distBox: document.getElementById('distance-box')
};

// 1. RENDER FUNCTION
function render(filter = "oil") {
  const items = products.filter(p => p.type === filter);
  document.getElementById('section-title').innerText = filter === "oil" ? "Motorcycle Oil" : "Our Services";
  
  UI.grid.innerHTML = items.map(p => `
    <div class="product-card">
      <div class="img-container">
        <img src="${p.img}" onerror="this.src='https://via.placeholder.com/150?text=SJM'">
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p class="price">₱${p.price}</p>
        <button class="btn-primary" onclick="addToCart(${p.id})">
          ${p.type === 'service' ? 'Book Service' : 'Add to Cart'}
        </button>
      </div>
    </div>
  `).join('');
}

window.addToCart = (id) => {
  const item = products.find(p => p.id === id);
  const exists = cart.find(c => c.id === id);
  if (exists) exists.qty++;
  else cart.push({ ...item, qty: 1 });
  update();
  showToast(`Added ${item.name}`);
};

window.changeQty = (idx, delta) => {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  update();
};

// 2. UPDATE FUNCTION
function update() {
  localStorage.setItem("cart", JSON.stringify(cart));
  UI.servicePanel.style.display = cart.length > 0 ? "block" : "none";

  if (cart.length === 0) {
    UI.cartList.innerHTML = `<p style="text-align:center; color:#999; padding:10px;">Cart is empty</p>`;
    UI.total.innerText = "0.00";
    document.getElementById('cart-count').innerText = "0 items";
    return;
  }

  let subtotal = 0;
  UI.cartList.innerHTML = cart.map((item, idx) => {
    const price = (serviceMode === "home" && item.type === "service") ? item.homePrice : item.price;
    subtotal += (price * item.qty);
    return `
      <div class="cart-item">
        <div style="flex: 2;">
          <strong>${item.name}</strong><br>
          <small>₱${price} each</small>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; flex: 1; justify-content: center;">
          <button class="qty-btn" onclick="changeQty(${idx}, -1)">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
        </div>
        <div style="flex: 1; text-align: right; font-weight: bold;">
          ₱${(price * item.qty).toLocaleString()}
        </div>
      </div>`;
  }).join('');

  UI.total.innerText = subtotal.toLocaleString(undefined, {minimumFractionDigits: 2});
  document.getElementById('cart-count').innerText = `${cart.length} item(s)`;
}

// 3. NAVIGATION
document.getElementById('show-oils').onclick = (e) => { render('oil'); switchTab(e.target); };
document.getElementById('show-services').onclick = (e) => { render('service'); switchTab(e.target); };

function switchTab(btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// 4. MODE SWITCHING
document.getElementById('btn-shop').onclick = () => { serviceMode = "shop"; toggleMode('btn-shop'); };
document.getElementById('btn-home').onclick = () => { serviceMode = "home"; toggleMode('btn-home'); };

function toggleMode(id) {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  UI.distBox.style.display = serviceMode === "home" ? "block" : "none";
  update();
}

UI.distInput.oninput = update;

// 5. CHECKOUT & MESSENGER
UI.checkout.onclick = async () => {
  const name = UI.name.value.trim();
  const location = UI.distInput.value.trim();
  
  if (!name || cart.length === 0) return alert("Please enter your name!");
  if (serviceMode === "home" && !location) return alert("Please enter your location/address!");

  // Define orderMode to prevent ReferenceError
  const orderMode = serviceMode === "home" ? "Home Delivery / Service" : "Walk-in / Pickup";
  const oilItems = cart.filter(item => item.type === 'oil');
  const serviceItems = cart.filter(item => item.type === 'service');
  const today = new Date().toLocaleDateString();

  // 1. Send to SJM Sales Tracker (Oil Only)
  if (oilItems.length > 0) {
    const salesData = {
      date: today,
      customer: name,
      description: oilItems.map(i => `• ${i.name} (x${i.qty})`).join("\n"),
      totalQty: oilItems.reduce((sum, i) => sum + i.qty, 0),
      totalCost: oilItems.reduce((sum, i) => sum + (i.price * i.qty), 0).toFixed(2),
      mode: orderMode,
      location: serviceMode === "home" ? location : "N/A" 
    };

    fetch('https://script.google.com/macros/s/AKfycbzmBkMTPCv67r4Nek-ge6Rz0CyxFiaXTfmftrBq7NzDnpFkGYCuqYQgkAx9-vx71zELNA/exec', { 
      method: 'POST', 
      mode: 'no-cors', 
      body: JSON.stringify(salesData) 
    });
  }
  
  // 2. Send to SJM Services (Services Only)
  if (serviceItems.length > 0) {
    const serviceSubtotal = serviceItems.reduce((sum, i) => {
      const p = (serviceMode === "home") ? i.homePrice : i.price;
      return sum + (p * i.qty);
    }, 0);

    const serviceData = {
      date: today,
      customer: name,
      serviceType: serviceItems.map(i => `• ${i.name}`).join("\n"),
      serviceMode: orderMode,
      distance: serviceMode === "home" ? location : "N/A",
      totalCost: serviceSubtotal.toFixed(2) 
    };

    fetch('https://script.google.com/macros/s/AKfycbz6nRX4KqZ-QM3O4-ojscDzQEuTWsrDBwzrEYLV7Vpy0y5FK6ZXIENLI2mr-FKzub6ApA/exec', { 
      method: 'POST', 
      mode: 'no-cors', 
      body: JSON.stringify(serviceData) 
    });
  }

  // 3. Messenger Message
  let msg = `📦 NEW ORDER: SJM MOTO\n`;
  msg += `--------------------------\n`;
  msg += `👤 Customer: ${name}\n`;
  msg += `📍 Type: ${orderMode.toUpperCase()}\n`;
  
  if (serviceMode === "home") {
    msg += `🗺️ Location: ${location}\n`;
  }
  
  msg += `\n🛒 DETAILS:\n`;
  cart.forEach(i => {
    const p = (serviceMode === "home" && i.type === "service") ? i.homePrice : i.price;
    msg += `• ${i.name} (x${i.qty}) - ₱${(p * i.qty).toFixed(2)}\n`;
  });

  msg += `\n💰 ESTIMATED TOTAL: ₱${UI.total.innerText}`;
  msg += `\n--------------------------\n`;
  msg += `Note: Final service fee depends on distance.`;

  try {
    await navigator.clipboard.writeText(msg);
    alert("✅ Order Recorded!\n\nDetails copied. Opening Messenger... Just PASTE in our chat.");
    
    cart = [];
    localStorage.removeItem("cart");
    update();
    window.location.href = "https://m.me/stephenjay.balansag.3";
  } catch (err) {
    alert("Error copying message.");
  }
};

function showToast(m) {
  const t = document.createElement("div"); 
  t.className = "toast"; 
  t.innerText = m;
  document.body.appendChild(t); 
  setTimeout(() => t.remove(), 2000);
}

// INITIALIZE
render('oil');
update();