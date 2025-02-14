document.addEventListener('DOMContentLoaded', function () {
  /* ---------- Preloader ---------- */
  window.addEventListener('load', function () {
    const preloader = document.getElementById('preloader');
    preloader.style.opacity = '0';
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 500);
  });

  /* ---------- Hamburger Menu Toggle ---------- */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('toggle');
  });

  /* ---------- Smooth Scrolling for Navigation ---------- */
  const navLinkElements = document.querySelectorAll('.nav-link');
  navLinkElements.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 70,
          behavior: 'smooth',
        });
      }
      // Close mobile menu if open
      if (navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('toggle');
      }
    });
  });

  /* ---------- Firebase Configuration ---------- */
  // Replace the placeholder values with your actual Firebase project configuration.
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  /* ---------- Global Cart Array ---------- */
  let cart = [];

  /* ---------- Load Products from Firestore ---------- */
  function loadProducts() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    db.collection("products")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const product = doc.data();
          product.id = doc.id;
          // Create product card
          const productCard = document.createElement('div');
          productCard.classList.add('product-card');
          productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-details">
              <h3>${product.name}</h3>
              <p>Price: $${parseFloat(product.price).toFixed(2)}</p>
              <p>Available: ${product.stock}</p>
              <button class="add-to-cart btn" data-id="${product.id}">Add to Cart</button>
            </div>
          `;
          productList.appendChild(productCard);
        });
        // Attach event listeners to "Add to Cart" buttons
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
          button.addEventListener('click', addToCart);
        });
      })
      .catch((error) => {
        console.error("Error loading products: ", error);
      });
  }
  loadProducts();

  /* ---------- Add to Cart Function ---------- */
  function addToCart(e) {
    const productId = e.target.getAttribute('data-id');
    // Retrieve product data from Firestore to check stock
    db.collection("products")
      .doc(productId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const product = doc.data();
          if (product.stock > 0) {
            // Check if product already in cart
            const existingItem = cart.find((item) => item.id === productId);
            if (existingItem) {
              if (existingItem.quantity < product.stock) {
                existingItem.quantity += 1;
              } else {
                alert("No more stock available for this product.");
              }
            } else {
              cart.push({
                id: productId,
                name: product.name,
                price: parseFloat(product.price),
                quantity: 1,
              });
            }
            updateCartDisplay();
          } else {
            alert("Product is out of stock.");
          }
        }
      });
  }

  /* ---------- Update Cart Display ---------- */
  function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElem = document.getElementById('cart-total');
    cartItemsContainer.innerHTML = '';
    let total = 0;
    cart.forEach((item) => {
      total += item.price * item.quantity;
      const cartItem = document.createElement('div');
      cartItem.classList.add('cart-item');
      cartItem.innerHTML = `
        <p>${item.name} x ${item.quantity}</p>
        <button class="remove-item btn" data-id="${item.id}">Remove</button>
      `;
      cartItemsContainer.appendChild(cartItem);
    });
    cartTotalElem.textContent = total.toFixed(2);

    // Attach remove event listeners
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach((btn) => {
      btn.addEventListener('click', removeCartItem);
    });
  }

  /* ---------- Remove Item from Cart ---------- */
  function removeCartItem(e) {
    const productId = e.target.getAttribute('data-id');
    cart = cart.filter((item) => item.id !== productId);
    updateCartDisplay();
  }

  /* ---------- Cart Modal Toggle ---------- */
  const cartLink = document.getElementById('cart-link');
  const cartModal = document.getElementById('cart-modal');
  const closeCart = document.querySelector('.close-cart');

  cartLink.addEventListener('click', (e) => {
    e.preventDefault();
    cartModal.style.display = 'block';
  });

  closeCart.addEventListener('click', () => {
    cartModal.style.display = 'none';
  });

  /* ---------- Checkout Button ---------- */
  const checkoutBtn = document.getElementById('checkout-btn');
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    // Simulate payment process (redirect to payment gateway)
    alert("Redirecting to payment gateway...");
    window.location.href = "https://example-payment-gateway.com"; // Replace with your payment link
  });

  /* ---------- Admin Login ---------- */
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    // Simple hard-coded admin credentials (for demo purposes)
    const validAdmins = ["admin1@example.com", "admin2@example.com"];
    if (validAdmins.includes(email) && password === "password") {
      alert("Admin login successful!");
      document.getElementById('admin-login').style.display = 'none';
      document.getElementById('admin-dashboard').style.display = 'block';
    } else {
      alert("Invalid admin credentials.");
    }
    loginForm.reset();
  });

  /* ---------- Product Upload (Admin) ---------- */
  const productForm = document.getElementById('product-form');
  productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('product-name').value;
    const image = document.getElementById('product-image').value;
    const price = document.getElementById('product-price').value;
    const stock = document.getElementById('product-stock').value;

    // Add product to Firestore
    db.collection("products")
      .add({
        name: name,
        image: image,
        price: parseFloat(price),
        stock: parseInt(stock),
      })
      .then(() => {
        alert("Product uploaded successfully!");
        productForm.reset();
        loadProducts();
      })
      .catch((error) => {
        console.error("Error adding product: ", error);
      });
  });

  /* ---------- Admin Logout ---------- */
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn.addEventListener('click', () => {
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('admin-login').style.display = 'block';
    alert("Logged out successfully.");
  });
});
