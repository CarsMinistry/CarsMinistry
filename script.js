document.getElementById("uploadForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Get form values
    const productImage = document.getElementById("productImage").files[0];
    const productName = document.getElementById("productName").value;
    const productPrice = document.getElementById("productPrice").value;
    const productQuantity = document.getElementById("productQuantity").value;

    if (!productImage || !productName || !productPrice || !productQuantity) {
        alert("Please fill in all fields.");
        return;
    }

    // Create product object
    const reader = new FileReader();
    reader.onload = function(e) {
        const productData = {
            image: e.target.result,
            name: productName,
            price: productPrice,
            quantity: productQuantity
        };

        // Save to local storage
        let products = JSON.parse(localStorage.getItem("products")) || [];
        products.push(productData);
        localStorage.setItem("products", JSON.stringify(products));

        // Refresh product display
        displayProducts();
    };
    reader.readAsDataURL(productImage);

    // Clear form
    document.getElementById("uploadForm").reset();
});

function displayProducts() {
    const productList = document.getElementById("productList");
    productList.innerHTML = "";

    let products = JSON.parse(localStorage.getItem("products")) || [];

    products.forEach((product, index) => {
        const productElement = document.createElement("div");
        productElement.classList.add("product");
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h2>${product.name}</h2>
            <p>Price: ₹${product.price}</p>
            <p>Available: ${product.quantity} pieces</p>
            <a href="https://wa.me/your-number?text=I'm%20interested%20in%20${encodeURIComponent(product.name)}" target="_blank" class="buy-btn">Buy on WhatsApp</a>
        `;
        productList.appendChild(productElement);
    });
}

// Load products on page load
document.addEventListener("DOMContentLoaded", displayProducts);
