// Load cart from localStorage or start empty
let cart = JSON.parse(localStorage.getItem("cart")) || [];
displayCart();

// Add item to cart
function addToCart(productName, price) {
    let item = cart.find(p => p.name === productName);
    if (item) {
        item.qty++;
    } else {
        cart.push({ name: productName, price: price, qty: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
    alert(`${productName} added to cart!`);
}

// Display cart
function displayCart() {
    const tbody = document.querySelector("#cart-table tbody");
    tbody.innerHTML = "";
    if (cart.length === 0) {
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

// Remove item
function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
}

// Change quantity
function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
}

function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    if (typeof html2canvas === "undefined") {
        alert("Receipt generator not loaded.");
        return;
    }

    const receiptDiv = document.getElementById("cart-receipt");
    const tbody = receiptDiv.querySelector("tbody");
    tbody.innerHTML = "";

    let total = 0;

    cart.forEach(item => {
        let price = item.price * item.qty;
        total += price;

        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.name}</td>
            <td style="text-align:right;">${item.qty}</td>
            <td style="text-align:right;">₱${price.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById("receipt-total").textContent = total.toFixed(2);

    receiptDiv.style.display = "block";

    html2canvas(receiptDiv, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL("image/png");

        receiptDiv.style.display = "none";

        // ✅ OPEN IMAGE (ANDROID SAFE)
        const newTab = window.open();
        newTab.document.write(`
            <h2>Receipt</h2>
            <p><b>Android:</b> Long press the image → Download Image</p>
            <p><b>iPhone:</b> Long press → Save Image</p>
            <img src="${imgData}" style="width:100%;" />
        `);

        // ✅ Copy order text
        let message = "Hello! I want to order:\n\n";
        cart.forEach(item => {
            message += `${item.name} x${item.qty} = ₱${(item.price * item.qty).toFixed(2)}\n`;
        });
        message += `\nTotal: ₱${total.toFixed(2)}`;

        navigator.clipboard.writeText(message).then(() => {
            alert("Receipt ready!\nSave the image, then Messenger will open.");

            // ✅ Open Messenger AFTER
            setTimeout(() => {
                window.open("https://m.me/stephenjay.balansag.3", "_blank");
            }, 1000);
        });

    }).catch(err => {
        console.error(err);
        alert("Error generating receipt.");
        receiptDiv.style.display = "none";
    });
}

function openInBrowser() {
    // Reloads the current page, which prompts the system to open in default browser
    window.location.href = window.location.href;
}