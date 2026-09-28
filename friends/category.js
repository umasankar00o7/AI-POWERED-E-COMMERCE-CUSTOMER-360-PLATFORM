// === category.js (FINAL, COMPLETE & Production-Ready) ===

document.addEventListener('DOMContentLoaded', function () {
    const firebaseConfig = { apiKey: "AIzaSyDnS_o6asJeO6J6eUTZA7f3ONfmUJK6t_g", authDomain: "jewellery-308b1.firebaseapp.com", projectId: "jewellery-308b1", storageBucket: "jewellery-308b1.firebasestorage.app", messagingSenderId: "275610166334", appId: "1:275610166334:web:5290beefa8cadae4415d6f" };
    if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
    const db = firebase.firestore();
    const auth = firebase.auth();

    const appState = { user: null, products: [], favorites: new Set(), cart: {}, allProducts: [] };

    const UI = {
        preloader: document.getElementById('preloader'),
        categoryTitle: document.getElementById('category-title'),
        categoryGrid: document.getElementById('category-product-grid'),
        userProfileIcon: document.getElementById('user-profile-icon'),
        userDropdownMenu: document.getElementById('user-dropdown-menu'),
        
        themeToggle: document.getElementById('theme-toggle'),
        toastEl: document.getElementById('appToast'),
        bsToast: null,
        categoryHeroBanner: document.getElementById('category-hero-banner'),
    itemCount: document.getElementById('item-count'),
    sortBySelect: document.getElementById('sort-by-select'),
    };
    if (UI.toastEl) {
        UI.bsToast = new bootstrap.Toast(UI.toastEl, { delay: 3000 });
    }

    function showToast(title, body, type = 'info') {
        if (!UI.bsToast) return;
        const icons = { success: 'bi-check-circle-fill text-success', danger: 'bi-x-circle-fill text-danger', info: 'bi-info-circle-fill text-info' };
        if(document.getElementById('toastTitle')) document.getElementById('toastTitle').textContent = title;
        if(document.getElementById('toastBody')) document.getElementById('toastBody').textContent = body;
        if(document.getElementById('toast-icon')) document.getElementById('toast-icon').className = `bi me-2 ${icons[type] || icons.info}`;
        UI.bsToast.show();
    }
    // === PASTE THIS NEW FUNCTION into category.js ===
// === THIS MAKES THE FUNCTION PUBLIC ===
window.logActivity = function(type, details) {
    // ... the rest of the function code remains exactly the same ...
    const activityData = {
        type: type,
        details: details,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    db.collection('activity_feed').add(activityData).catch(err => console.error("Failed to log activity:", err));
}

    async function handleAuthStateChange(user) {
        appState.user = user;
        updateNavbarUI(user);
        if (user) {
            await fetchUserSpecificData(user.uid);
            renderCategoryProducts();
            renderCartBadge();
        } else {
            appState.favorites.clear();
            renderCategoryProducts();
            renderCartBadge();
        }
    }

    function updateNavbarUI(user) {
        if (user) {
            UI.userProfileIcon.innerHTML = `<img src="${user.photoURL}" alt="User" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">`;
            UI.userDropdownMenu.innerHTML = `<li><a class="dropdown-item" href="#">My Orders</a></li><li><a class="dropdown-item" href="#">My Favorites</a></li><li><hr class="dropdown-divider"></li><li><button class="dropdown-item" id="logout-btn">Logout</button></li>`;
            document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());
        } else {
            UI.userProfileIcon.innerHTML = `<i class="bi bi-person-circle nav-icon"></i>`;
            UI.userDropdownMenu.innerHTML = `<li><button class="dropdown-item" id="login-btn">Sign in with Google</button></li>`;
            document.getElementById('login-btn').addEventListener('click', () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()));
        }
    }
    
    async function fetchAllProducts() {
        try {
            const snapshot = await db.collection('products').get();
            appState.allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) { console.error("Could not fetch all products:", e); }
    }

    async function fetchUserSpecificData(userId) {
        if (!userId) return;
        try {
            const [favSnapshot, cartSnapshot] = await Promise.all([
                db.collection('users').doc(userId).collection('favorites').get(),
                db.collection('users').doc(userId).collection('cart').get()
            ]);
            appState.favorites = new Set(favSnapshot.docs.map(doc => doc.id));
            appState.cart = {};
            cartSnapshot.forEach(doc => appState.cart[doc.id] = doc.data().quantity);
        } catch (error) { console.error("Error fetching user data:", error); }
    }

    async function fetchCategoryProducts(categoryName) {
        if (!categoryName) {
            UI.categoryTitle.textContent = "Category Not Found";
            UI.categoryGrid.innerHTML = '';
            return;
        }
        // --- The Translator Logic ---
const displayNameMap = {
    'Bracelets': 'Handmade Jewellery'
    // You can add more translations here in the future
};
const displayName = displayNameMap[categoryName] || categoryName;
// --- End of Logic ---
        UI.categoryTitle.textContent = displayName;

        document.title = `${displayName} - RS Sisters`;

        try {
            const snapshot = await db.collection('products').where('category', '==', categoryName).orderBy('createdAt', 'desc').get();
            appState.products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderCategoryProducts();
        } catch (error) {
            console.error("Error fetching category products:", error);
            UI.categoryGrid.innerHTML = `<p class="text-center text-danger">Could not load products.</p>`;
        }
    }

    // === PASTE THESE TWO NEW FUNCTIONS in category.js ===

async function fetchCategoryBanner(categoryName) {
    if (!UI.categoryHeroBanner) return;
    try {
        const doc = await db.collection('categories').doc(categoryName).get();
        if (doc.exists && doc.data().bannerImageUrl) {
            const data = doc.data();
            // === PASTE THIS NEW TRANSLATOR LOGIC HERE ===
const displayNameMap = {
    'Bracelets': 'Handmade Jewellery'
};
const displayName = displayNameMap[categoryName] || categoryName;
// === END OF NEW LOGIC ===
            UI.categoryHeroBanner.innerHTML = `
                <img src="${data.bannerImageUrl}" alt="${categoryName} Banner">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <h1>${displayName}</h1>
                </div>`;
        } else {
            UI.categoryHeroBanner.style.display = 'none'; // Hide banner if none is set
        }
    } catch (error) { console.error("Error fetching category banner:", error); }
}

function handleSortChange() {
    const sortBy = UI.sortBySelect.value;
    switch(sortBy) {
        case 'price-asc':
            appState.products.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
            break;
        case 'price-desc':
            appState.products.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
            break;
        case 'newest':
        default:
            appState.products.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
            break;
    }
    renderCategoryProducts(); // Re-render the grid with the new sorted order
}

   // === NEW, SMARTER renderCategoryProducts function ===
function renderCategoryProducts() {
    if (!UI.categoryGrid) return;
     UI.itemCount.textContent = `${appState.products.length} items`;
    if (appState.products.length === 0) {
        UI.categoryGrid.innerHTML = `<p class="text-center text-secondary col-12 p-5">No products found in this category yet.</p>`;
        return;
    }
      // --- PASTE THE NEW SORTING LOGIC HERE ---
    appState.products.sort((a, b) => {
        const stockA = typeof a.stock === 'number' ? a.stock : 1;
        const stockB = typeof b.stock === 'number' ? b.stock : 1;
        if (stockA === 0 && stockB > 0) return 1;
        if (stockB === 0 && stockA > 0) return -1;
        return 0;
    });
    // --- END OF NEW LOGIC ---
    UI.categoryGrid.innerHTML = appState.products.map(p => {
        const imageUrl = (p.images && p.images[0]) || 'https://via.placeholder.com/300';

        // --- NEW LOGIC FOR BADGES AND PRICE (Identical to shop.js) ---
        let badgeHTML = '';
        let priceHTML = `<p class="product-price mb-0">₹${p.price.toLocaleString()}</p>`;
        let isSoldOut = p.stock === 0;

        if (isSoldOut) {
            badgeHTML = `<span class="product-badge sold-out-badge">Sold Out</span>`;
        } else if (p.isOnSale && p.salePrice) {
            badgeHTML = `<span class="product-badge sale-badge">On Sale</span>`;
            priceHTML = `
                <div class="product-price-cart-row">
                    <p class="product-price mb-0">
                        <span class="original-price">₹${p.price.toLocaleString()}</span>
                        ₹${p.salePrice.toLocaleString()}
                    </p>
                </div>`;
        } else {
             priceHTML = `
                <div class="product-price-cart-row">
                    <p class="product-price mb-0">₹${p.price.toLocaleString()}</p>
                </div>`;
        }
        // --- END OF NEW LOGIC ---

        return `
        <div class="col-lg-3 col-md-4 col-6">
            <div class="product-card ${isSoldOut ? 'is-sold-out' : ''}">
                <a href="product.html?id=${p.id}" class="product-card-link">
                    <div class="product-image-container">
                        ${badgeHTML}
                        <img src="${imageUrl}" alt="${p.name}" class="product-image">
                    </div>
                </a>
               <div class="product-info">
                    <h5 class="product-name">${p.name}</h5>
                   <div class="product-price-cart-row">
    ${priceHTML}
    <div class="d-flex align-items-center gap-2">
        <button class="btn-add-to-bag" data-product-id="${p.id}" title="Add to Bag" ${isSoldOut ? 'disabled' : ''}>
            <i class="bi bi-plus-lg"></i>
        </button>
        <button class="btn-whatsapp-inquiry" data-product-id="${p.id}" data-product-name="${p.name}" title="Inquire on WhatsApp">
            <i class="bi bi-whatsapp"></i>
        </button>
    </div>
</div>
                </div>
                <i class="bi product-favorite-icon ${appState.favorites.has(p.id) ? 'bi-heart-fill favorited' : 'bi-heart'}" data-product-id="${p.id}"></i>
            </div>
        </div>`;
    }).join('');

}

    function renderCartBadge() {
        if (!UI.cartBadge) return;
        const itemCount = Object.values(appState.cart).reduce((sum, qty) => sum + qty, 0);
        UI.cartBadge.textContent = itemCount;
        UI.cartBadge.classList.toggle('visible', itemCount > 0);
    }

    function renderCartContents() {
        if (!UI.cartBody) return;
        const itemCount = Object.values(appState.cart).reduce((sum, qty) => sum + qty, 0);
        if(UI.btnCheckout) UI.btnCheckout.disabled = itemCount === 0;

        if (itemCount === 0) {
            UI.cartBody.innerHTML = `<p class="text-center text-secondary p-4">Your cart is empty.</p>`;
        } else {
            UI.cartBody.innerHTML = Object.entries(appState.cart).map(([productId, quantity]) => {
                const product = appState.allProducts.find(p => p.id === productId);
                if (!product) return '';
                const imageUrl = product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/70';
                return `<div class="cart-item" data-product-id="${productId}"><img src="${imageUrl}" alt="${product.name}" class="cart-item-image"><div class="cart-item-details"><div class="cart-item-name">${product.name}</div><div class="cart-item-quantity"><button class="quantity-btn" data-action="decrease" title="Decrease quantity">-</button><span class="quantity-display">${quantity}</span><button class="quantity-btn" data-action="increase" title="Increase quantity">+</button></div></div><span class="cart-item-price">₹${(product.price * quantity).toLocaleString()}</span></div>`;
            }).join('');
        }
        updateCheckoutSummary();
    }

    function updateCheckoutSummary() {
        if (!UI.cartTotalPrice) return;
        const subtotal = Object.entries(appState.cart).reduce((sum, [productId, quantity]) => {
            const product = appState.allProducts.find(p => p.id === productId);
            return sum + (product ? product.price * quantity : 0);
        }, 0);
        UI.cartTotalPrice.textContent = `₹${subtotal.toLocaleString()}`;
    }
    
   

    async function toggleFavorite(productId) {
        if (!appState.user) {
            return showToast("Login Required", "Please sign in to save favorites.", "info");
        }
        
        const favRef = db.collection('users').doc(appState.user.uid).collection('favorites').doc(productId);
        const heartIcon = document.querySelector(`.product-favorite-icon[data-product-id="${productId}"]`);
        
        if (appState.favorites.has(productId)) {
            await favRef.delete();
            appState.favorites.delete(productId);
            if (heartIcon) {
                heartIcon.classList.replace('bi-heart-fill', 'bi-heart');
                heartIcon.classList.remove('favorited');
            }
        } else {
            await favRef.set({ addedAt: firebase.firestore.FieldValue.serverTimestamp() });
            appState.favorites.add(productId);
            if (heartIcon) {
                heartIcon.classList.replace('bi-heart', 'bi-heart-fill');
                heartIcon.classList.add('favorited');
            }
            showToast("Added!", "Item added to your favorites.", "success");
        }
    }

    function setupEventListeners() {
        document.body.addEventListener('click', e => {
            const favoriteIcon = e.target.closest('.product-favorite-icon');
            const addToCartBtn = e.target.closest('.btn-add-to-cart');
            const quantityBtn = e.target.closest('.quantity-btn');
            const addToBagBtn = e.target.closest('.btn-add-to-bag');
if (addToBagBtn) {
    const productId = addToBagBtn.dataset.productId;
    const currentQty = appState.cart[productId] || 0;
    updateBagItem(appState.user, productId, currentQty + 1); // We'll define this
    showToast("Success", "Added to your shopping bag!", "success");
}


            if (favoriteIcon) {
                e.preventDefault();
                toggleFavorite(favoriteIcon.dataset.productId);
            }

            
            if (addToCartBtn) {
                e.preventDefault();
                const productId = addToCartBtn.dataset.productId;
                const currentQty = appState.cart[productId] || 0;
                updateCart(productId, currentQty + 1);
                showToast("Added!", "Item added to your cart.", "success");
            }

            if (quantityBtn) {
                const productId = quantityBtn.closest('.cart-item').dataset.productId;
                const currentQty = appState.cart[productId] || 0;
                const newQty = quantityBtn.dataset.action === 'increase' ? currentQty + 1 : currentQty - 1;
                updateCart(productId, newQty);
            }
        });

        if(UI.cartIcon) UI.cartIcon.addEventListener('click', () => { renderCartContents(); if(UI.sideCart) UI.sideCart.classList.add('open'); });
        const closeBtn = document.getElementById('cart-close-btn');
        if(closeBtn) closeBtn.addEventListener('click', () => { if(UI.sideCart) UI.sideCart.classList.remove('open'); });
        
        if(UI.btnCheckout) UI.btnCheckout.addEventListener('click', () => {
            if (!appState.user) return showToast("Login Required", "Please sign in to proceed.", "info");
            if(UI.sideCart) UI.sideCart.classList.remove('open');
            if(UI.checkoutModal) UI.checkoutModal.show();
        });
    }

    async function main() {
        if(UI.preloader) UI.preloader.style.opacity = 1;
        
        const savedTheme = localStorage.getItem('shopTheme');
        if (savedTheme === 'light') document.body.classList.add('light-mode');
        
        const themeToggle = document.getElementById('theme-toggle');
        if(themeToggle) {
            if (savedTheme === 'light') themeToggle.classList.add('light');
            themeToggle.addEventListener('click', () => {
                const isLight = document.body.classList.toggle('light-mode');
                localStorage.setItem('shopTheme', isLight ? 'light' : 'dark');
                themeToggle.classList.toggle('light', isLight);
            });
        }

        setupEventListeners();
        await fetchAllProducts(); // Needed for cart details
        
        const categoryName = new URLSearchParams(window.location.search).get('category');
        // --- THIS IS THE NEW LOGIC FLOW ---
    // Fetch banner and products in parallel
    await Promise.all([
        fetchCategoryBanner(categoryName),
        fetchCategoryProducts(categoryName)
    ]);

    UI.sortBySelect.addEventListener('change', handleSortChange);
        await fetchCategoryProducts(categoryName);
        
        auth.onAuthStateChanged(handleAuthStateChange);

        if(UI.preloader) {
            UI.preloader.style.opacity = 0;
            setTimeout(() => UI.preloader.style.display = 'none', 500);
        }
    }
    main();
});