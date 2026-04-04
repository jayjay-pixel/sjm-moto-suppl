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

function render(filter = "oil") {
  const items = products.filter(p => p.type === filter);
  document.getElementById('section-title').innerText = filter === "oil" ? "Motorcycle Oil" : "Our Services";
  UI.grid.innerHTML = items.map(p => `
    <div class="product-card">
      <img src="${p.img}" onerror="this.src='https://via.placeholder.com/150?text=SJM'">
      <h3>${p.name}</h3>
      <p class="price">₱${p.price}</p>
      <button class="btn-primary" onclick="addToCart(${p.id})">Add to Cart</button>
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

// --- NEW: Change Quantity Logic ---
window.changeQty = (idx, delta) => {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
  }
  update();
};

function update() {
  localStorage.setItem("cart", JSON.stringify(cart));
  const hasService = cart.some(i => i.type === 'service');
  UI.servicePanel.style.display = hasService ? "block" : "none";

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
      <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <div style="flex: 2;">
          <strong style="font-size: 0.9rem;">${item.name}</strong><br>
          <small>₱${price} each</small>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; flex: 1; justify-content: center;">
          <button onclick="changeQty(${idx}, -1)" style="width:25px; height:25px; border:1px solid #ddd; background:#eee; cursor:pointer;">-</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${idx}, 1)" style="width:25px; height:25px; border:1px solid #ddd; background:#eee; cursor:pointer;">+</button>
        </div>
        <div style="flex: 1; text-align: right; font-weight: bold;">
          ₱${(price * item.qty).toLocaleString()}
        </div>
      </div>`;
  }).join('');

  const distFee = serviceMode === "home" ? (parseFloat(UI.distInput.value) || 0) * 3 : 0;
  UI.total.innerText = (subtotal + distFee).toLocaleString(undefined, {minimumFractionDigits: 2});
  document.getElementById('cart-count').innerText = `${cart.length} item(s)`;
}

// Tab Switching
document.getElementById('show-oils').onclick = (e) => { render('oil'); switchTab(e.target); };
document.getElementById('show-services').onclick = (e) => { render('service'); switchTab(e.target); };
function switchTab(btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// Mode Switching
document.getElementById('btn-shop').onclick = () => { serviceMode = "shop"; toggleMode('btn-shop'); };
document.getElementById('btn-home').onclick = () => { serviceMode = "home"; toggleMode('btn-home'); };
function toggleMode(id) {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  UI.distBox.style.display = serviceMode === "home" ? "block" : "none";
  update();
}

UI.distInput.oninput = update;

UI.checkout.onclick = async () => {
  const name = UI.name.value.trim();
  if (!name || cart.length === 0) return alert("Please enter your name!");

  const oilItems = cart.filter(item => item.type === 'oil');
  const serviceItems = cart.filter(item => item.type === 'service');
  const today = new Date().toLocaleDateString();

  // 1. Send to Sales Tracking (Oil)
  if (oilItems.length > 0) {
    const salesData = {
      date: today,
      customer: name,
      description: oilItems.map(i => `• ${i.name} (x${i.qty})`).join("\n"),
      totalQty: oilItems.reduce((sum, i) => sum + i.qty, 0),
      totalCost: oilItems.reduce((sum, i) => sum + (i.price * i.qty), 0).toFixed(2)
    };
    fetch('https://script.google.com/macros/s/AKfycbzmBkMTPCv67r4Nek-ge6Rz0CyxFiaXTfmftrBq7NzDnpFkGYCuqYQgkAx9-vx71zELNA/exec', { method: 'POST', mode: 'no-cors', body: JSON.stringify(salesData) });
  }

  // 2. Send to SJM Services (Labor)
  // --- Send Services to SJM Services ---
  if (serviceItems.length > 0) {
    const dist = parseFloat(UI.distInput.value) || 0;
    const distFee = serviceMode === "home" ? dist * 3 : 0;
    
    // Calculate the overall total for services
    const serviceSubtotal = serviceItems.reduce((sum, i) => {
      const p = serviceMode === "home" ? i.homePrice : i.price;
      return sum + (p * i.qty);
    }, 0);

    const overallServiceTotal = (serviceSubtotal + distFee).toFixed(2);

    const serviceData = {
      date: today,
      customer: name,
      serviceType: serviceItems.map(i => `• ${i.name}`).join("\n"),
      serviceMode: serviceMode === "home" ? "Home Service" : "Walk-in",
      distance: serviceMode === "home" ? dist : 0, // Sends 0 if Walk-in
      totalCost: overallServiceTotal // Overall Total (Service + Fee)
    };

    fetch('https://script.google.com/macros/s/AKfycbz6nRX4KqZ-QM3O4-ojscDzQEuTWsrDBwzrEYLV7Vpy0y5FK6ZXIENLI2mr-FKzub6ApA/exec', { 
      method: 'POST', 
      mode: 'no-cors', 
      body: JSON.stringify(serviceData) 
    }).catch(e => console.log("Service Sheet error"));
  }

  // 3. Messenger Redirect
  let msg = `📦 *ORDER: SJM MOTO*\nName: ${name}\n\n` + 
            cart.map(i => `• ${i.name} (x${i.qty})`).join("\n") + 
            `\n\n*TOTAL: ₱${UI.total.innerText}*`;

  await navigator.clipboard.writeText(msg);
  alert("✅ Recorded! Opening Messenger... \n\n Paste the order in messenger.");
  
  cart = [];
  localStorage.removeItem("cart");
  update();
  window.location.href = "https://m.me/stephenjay.balansag.3";
};

function showToast(m) {
  const t = document.createElement("div"); 
  t.className = "toast"; 
  t.innerText = m;
  document.body.appendChild(t); 
  setTimeout(() => t.remove(), 2000);
}

// Initial Load
render('oil');
update();