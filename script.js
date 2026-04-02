// Load cart from localStorage or start empty
let cart = JSON.parse(localStorage.getItem("cart")) || [];
displayCart();

// Add item to cart
function addToCart(productName, price) {
  let item = cart.find(p => p.name === productName);
  if (item) { item.qty++; }
  else { cart.push({ name: productName, price: price, qty: 1 }); }

  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
  alert(`${productName} added to cart!`);
}

// Display cart in table
function displayCart() {
  const tbody = document.querySelector("#cart-table tbody");
  tbody.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    let price = item.price * item.qty;
    total += price;

    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>
        <button onclick="changeQty(${index}, -1)">-</button>
        ${item.qty}
        <button onclick="changeQty(${index}, 1)">+</button>
      </td>
      <td>₱${price.toFixed(2)}</td>
      <td><button onclick="removeItem(${index})">Remove</button></td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("total").textContent = total.toFixed(2);
}

// Remove item
function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

// Change quantity (+/-)
function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
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

  let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  message += `\nTotal: ₱${total.toFixed(2)}`;

  navigator.clipboard.writeText(message).then(() => {
    alert("Order copied to clipboard! Open Messenger and paste it to send.");
    window.open("https://m.me/stephenjay.balansag.3", "_blank"); // replace with your Messenger username
  });
}

function displayCart() {
  const tbody = document.querySelector("#cart-table tbody");
  tbody.innerHTML = "";

  if (cart.length === 0) {
    // Display empty message
    let row = document.createElement("tr");
    row.innerHTML = `<td colspan="4" style="text-align:center; font-style:italic; color:#888;">Your cart is empty</td>`;
    tbody.appendChild(row);
    document.getElementById("total").textContent = "0.00";
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    let price = item.price * item.qty;
    total += price;

    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>
        <button onclick="changeQty(${index}, -1)">-</button>
        ${item.qty}
        <button onclick="changeQty(${index}, 1)">+</button>
      </td>
      <td>₱${price.toFixed(2)}</td>
      <td><button onclick="removeItem(${index})">Remove</button></td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("total").textContent = total.toFixed(2);
}