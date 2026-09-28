// === shop.js (Standalone & Production-Ready) ===
// --- Handles the MAIN SHOP page ---

document.addEventListener('DOMContentLoaded', function () {

    // --- 1. INITIALIZATION & CONFIG ---
    const firebaseConfig = {
        apiKey: "AIzaSyDnS_o6asJeO6J6eUTZA7f3ONfmUJK6t_g",
        authDomain: "jewellery-308b1.firebaseapp.com",
        projectId: "jewellery-308b1",
        storageBucket: "jewellery-308b1.firebasestorage.app",
        messagingSenderId: "275610166334",
        appId: "1:275610166334:web:5290beefa8cadae4415d6f"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();
    const auth = firebase.auth();

    // --- 2. GLOBAL STATE & DOM ELEMENTS ---
    const appState = {
        user: null,
        products: [],
        favorites: new Set(),
        unsubscribeBanner: null,
    };

    const UI = {
        preloader: document.getElementById('preloader'),
        productGrid: document.getElementById('product-grid'),
        userProfileIcon: document.getElementById('user-profile-icon'),
        userDropdownMenu: document.getElementById('user-dropdown-menu'),
        welcomeMessage: document.getElementById('welcome-message'),
        themeToggle: document.getElementById('theme-toggle'),
        // Banner
        banner: document.getElementById('live-announcement-banner'),
        bannerMessage: document.getElementById('banner-message'),
        bannerCloseBtn: document.getElementById('banner-close-btn'),
        // Modals
        // Checkout Form
        
       
        // Toast
        toastEl: document.getElementById('appToast'),
        bsToast: null,
    };
    UI.bsToast = new bootstrap.Toast(UI.toastEl, { delay: 3000 });

    // --- 3. CORE FUNCTIONS (The Brains) ---

    // -- Notifications --
    function showToast(title, body, type = 'info') {
        const icons = { success: 'bi-check-circle-fill text-success', danger: 'bi-x-circle-fill text-danger', info: 'bi-info-circle-fill text-info' };
        document.getElementById('toastTitle').textContent = title;
        document.getElementById('toastBody').textContent = body;
        document.getElementById('toast-icon').className = `bi me-2 ${icons[type] || icons.info}`;
        UI.bsToast.show();
    }
    // === PASTE THIS NEW FUNCTION in shop.js, product.js, and category.js ===
function logPublicEvent(type, details) {
    if (!auth.currentUser) return; // Only log events for signed-in users
    const eventData = {
        type,
        details,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    db.collection('public_feed').add(eventData)
      .catch(err => console.error("Failed to log public event:", err));
}
    // -- Robust Button State --
    function setButtonLoading(button, isLoading, loadingText = 'Loading...') {
        if (!button) return;
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${loadingText}`;
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText;
        }
    }

    // === PASTE THIS NEW FUNCTION into shop.js ===
function logActivity(icon, color, message) {
    db.collection('activity_feed').add({
        icon: icon,
        color: color,
        message: message,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(err => console.error("Failed to log activity:", err));
}

    // -- Authentication --
// === PASTE THIS NEW, CORRECTED handleAuthStateChange FUNCTION ===
function handleAuthStateChange(user) {
    appState.user = user;
    updateNavbarUI(user);
    resetCategoryTabs();

    if (user) {
        const userRef = db.collection('users').doc(user.uid);
        userRef.get().then(doc => {
            if (!doc.exists) {
                userRef.set({
                    email: user.email,
                    displayName: user.displayName,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    logActivity('bi-person-plus-fill', 'success', `<strong>${user.displayName}</strong> just signed up.`);
                     // This is the corrected line that sends data to the admin feed.
        if (window.logActivity) {
            window.logActivity('newUser', { name: user.displayName, email: user.email });
        }
                    fetchUserSpecificData(user.uid).then(() => {
                        renderProducts(); // Only render products
                    });
                }).catch(err => console.error("Error creating new user document:", err));
            } else {
                fetchUserSpecificData(user.uid).then(() => {
                    renderProducts(); // Only render products
                });
            }
        });
    } else {
        // User is signed out, clear local data and re-render products
        appState.favorites.clear();
        renderProducts();
        resetCategoryTabs();
        // --- THIS IS THE FIX ---
    const searchInput = document.getElementById('modal-search-input');
    if (searchInput) searchInput.value = '';
    // --- END OF FIX ---
    }
}

    function signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).catch(error => {
            console.error("Sign-in Error:", error);
            showToast("Sign-in Failed", error.message, "danger");
        });
    }

    // -- Data Fetching --
    async function fetchProducts() {
        try {
            const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
            appState.products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching products:", error);
            if (UI.productGrid) UI.productGrid.innerHTML = `<p class="text-danger text-center col-12">Could not load products. Please check Firestore rules.</p>`;
        }
    }

    async function fetchUserSpecificData(userId) {
        if (!userId) return;
        const favPromise = db.collection('users').doc(userId).collection('favorites').get();
        const cartPromise = db.collection('users').doc(userId).collection('cart').get();
        try {
            const [favSnapshot, cartSnapshot] = await Promise.all([favPromise, cartPromise]);
            appState.favorites = new Set(favSnapshot.docs.map(doc => doc.id));
            appState.cart = {};
            cartSnapshot.forEach(doc => { appState.cart[doc.id] = doc.data().quantity; });
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }
    

    // === PASTE THIS NEW FUNCTION in shop.js ===

function resetCategoryTabs() {
    const tabsContainer = document.querySelector('.category-tabs-container');
    const contentPanes = document.querySelectorAll('#category-content-panes .category-section-wrapper');
    if (!tabsContainer || !contentPanes.length) return;

    // 1. Reset all tabs to inactive
    tabsContainer.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
    
    // 2. Set the FIRST tab ("Neck Sets") as active
    const firstTab = tabsContainer.querySelector('.category-tab[data-target="necklaces-section-container"]');
    if (firstTab) firstTab.classList.add('active');

    // 3. Hide all content panes
    contentPanes.forEach(pane => {
        pane.classList.remove('active');
        pane.style.display = 'none';
    });

    // 4. Show the FIRST content pane ("Neck Sets")
    const firstPane = document.getElementById('necklaces-section-container');
    if (firstPane) {
        firstPane.classList.add('active');
        firstPane.style.display = 'block';
    }

    // 5. Reset the scroll position of the tab bar
    tabsContainer.scrollTo({ left: 0, behavior: 'smooth' });
}
   // === PASTE THIS NEW, CORRECTED renderProducts FUNCTION ===

function renderProducts() {
    // 1. Create a precise map from the database category name to the HTML ID.
    const categoryIdMap = {
        'Neck Sets': 'products-necklaces',
        'Bracelets': 'products-bracelets',
        'Bangles': 'products-bangles',
        'Earring': 'products-earrings',
        'Clothes': 'products-clothes',
        'Others': 'products-others'
    };
    const sectionIdMap = {
        'Neck Sets': 'necklaces-section-container',
        'Bracelets': 'bracelets-section-container',
        'Bangles': 'bangles-section-container',
        'Earring': 'earrings-section-container',
        'Clothes': 'clothes-section-container',
        'Others': 'others-section-container' 
    };

    // 2. Clear all containers initially
    Object.values(categoryIdMap).forEach(id => {
        const container = document.getElementById(id);
        if (container) container.innerHTML = '';
    });

   // === PASTE THIS NEW, CORRECTED createProductCardHTML HELPER FUNCTION ===
const createProductCardHTML = (p) => {
    const imageUrl = (p.images && p.images[0]) ? p.images[0] : 'https://images.unsplash.com/photo-1599352431339-2b2917355c12?q=80&w=1887&auto=format&fit=crop';
    
    // --- NEW LOGIC FOR BADGES AND PRICE ---
    let badgeHTML = '';
    let priceHTML = `<p class="product-price mb-0">₹${p.price.toLocaleString()}</p>`;
    // Check for a stock field, default to > 0 if it doesn't exist yet
    const stock = typeof p.stock === 'number' ? p.stock : 1; 
    const isSoldOut = stock === 0;

    if (isSoldOut) {
        badgeHTML = `<span class="product-badge sold-out-badge">Sold Out</span>`;
    } else if (p.isOnSale && p.salePrice) {
        badgeHTML = `<span class="product-badge sale-badge">On Sale</span>`;
        priceHTML = `
            <p class="product-price mb-0">
                <span class="original-price">₹${p.price.toLocaleString()}</span>
                ₹${p.salePrice.toLocaleString()}
            </p>`;
    }
    // --- END OF NEW LOGIC ---

    return `
    <div class="product-card-wrapper">
        <div class="product-card ${isSoldOut ? 'is-sold-out' : ''}" data-product-id="${p.id}">
            <a href="product.html?id=${p.id}" class="product-card-link">
                <div class="product-image-container">
                    ${badgeHTML} 
                    <img src="${imageUrl}" alt="${p.name}" class="product-image">
                </div>
            </a>
            <div class="product-info">
                
<div class="product-category">${p.category === 'Bracelets' ? 'Handmade Jewellery' : (p.category || 'Jewellery')}</div>
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
    </div>
    `;
};
    // 4. Group all products by their category
    const productsByCategory = {};
    appState.products.forEach(p => {
        if (!p.category) return;
        if (!productsByCategory[p.category]) productsByCategory[p.category] = [];
        productsByCategory[p.category].push(p);
    });
    
    // 5. Loop through each category and populate its section with a limit
    for (const category in categoryIdMap) {
        const containerId = categoryIdMap[category];
        const sectionId = sectionIdMap[category];
        const container = document.getElementById(containerId);
        const sectionWrapper = document.getElementById(sectionId);
        // --- THIS IS THE FIX ---
    const displayNameMap = {
        'Bracelets': 'Handmade Jewellery'
    };
    const displayName = displayNameMap[category] || category;
    // --- END OF FIX ---
        
        if (container && sectionWrapper) {
            const allCategoryProducts = productsByCategory[category] || [];
           // --- NEW SORTING LOGIC ---
// Sort products to show in-stock items first, then sold-out items.
allCategoryProducts.sort((a, b) => {
    const stockA = typeof a.stock === 'number' ? a.stock : 1;
    const stockB = typeof b.stock === 'number' ? b.stock : 1;
    // If product A is sold out (0) and B is not, B comes first.
    if (stockA === 0 && stockB > 0) return 1;
    // If product B is sold out (0) and A is not, A comes first.
    if (stockB === 0 && stockA > 0) return -1;
    // Otherwise, keep original order (which is by date).
    return 0;
});
// --- END OF NEW LOGIC ---
            
            if (allCategoryProducts.length > 0) {
                // --- THIS IS THE CRITICAL CHANGE ---
                // Show only the first 7 products for the preview
                const previewProducts = allCategoryProducts.slice(0, 7);
                container.innerHTML = previewProducts.map(createProductCardHTML).join('');
                
                // Add the "View All" card if the total number of products is greater than 7
                if (allCategoryProducts.length > 7) {
                     container.innerHTML += `
                     <div class="product-card-wrapper">
                         <a href="category.html?category=${encodeURIComponent(category)}" class="product-card-link">
                             <div class="view-all-card">
                                 <div>
                                     <i class="bi bi-arrow-right-circle"></i>
                                     <p>View All<br>${displayName}</p>
                                 </div>
                             </div>
                         </a>
                     </div>`;
                }
                // --- END OF CHANGE ---
                
                sectionWrapper.style.display = 'block';
            } else {
                sectionWrapper.style.display = 'none';
            }
        }
    }
}
    function updateNavbarUI(user) {
        if (user) {
            UI.userProfileIcon.innerHTML = `<img src="${user.photoURL}" alt="User">`;
            if (UI.welcomeMessage) {
                const firstName = user.displayName.split(' ')[0];
                UI.welcomeMessage.textContent = `Welcome, ${firstName}!`;
                UI.welcomeMessage.classList.remove('d-lg-block', 'd-none'); // Make sure it's visible
                UI.welcomeMessage.style.display = 'block';
            }
            // === PASTE THIS NEW, CORRECTED BLOCK ===
UI.userDropdownMenu.innerHTML = `
    <li><a class="dropdown-item" href="#" id="my-orders-btn">My Orders</a></li>
    <li><a class="dropdown-item" href="#" id="my-favorites-btn">My Favorites</a></li>
    <li><hr class="dropdown-divider"></li>
    <li><button class="dropdown-item" id="logout-btn">Logout</button></li>
`;
            document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());
            // --- PASTE THIS NEW BLOCK HERE ---
// Show the favorites shortcut button if it exists
const favShortcutBtn = document.getElementById('show-favorites-btn');
if (favShortcutBtn) {
    favShortcutBtn.classList.remove('d-none');
}
// --- END OF NEW BLOCK ---
        } else {
            UI.userProfileIcon.innerHTML = `<i class="bi bi-person-circle nav-icon"></i>`;
            if (UI.welcomeMessage) UI.welcomeMessage.style.display = 'none';
            UI.userDropdownMenu.innerHTML = `<li><button class="dropdown-item" id="login-btn">Sign in with Google</button></li>`;
            document.getElementById('login-btn').addEventListener('click', signInWithGoogle);
// Hide the favorites shortcut button if it exists
const favShortcutBtn = document.getElementById('show-favorites-btn');
if (favShortcutBtn) {
    favShortcutBtn.classList.add('d-none');
}
// --- END OF NEW BLOCK ---
        }
    }
    
   
    
   

    // --- User Actions ---
    async function toggleFavorite(productId) {
        if (!appState.user) return showToast("Login Required", "Please sign in to save favorites.", "info");
        
        const favRef = db.collection('users').doc(appState.user.uid).collection('favorites').doc(productId);
        const heartIcon = document.querySelector(`.product-favorite-icon[data-product-id="${productId}"]`);
        // --- THIS IS THE CRITICAL FIX ---
    // It now safely checks both possible product lists.
    const product = appState.products.find(p => p.id === productId) || (appState.allProducts && appState.allProducts.find(p => p.id === productId));
    // --- END OF FIX ---
        
        if (appState.favorites.has(productId)) {
            await favRef.delete();
            appState.favorites.delete(productId);
            if(heartIcon) {
                heartIcon.classList.replace('bi-heart-fill', 'bi-heart');
                heartIcon.classList.remove('favorited');
            }
        } else {
            
            await favRef.set({ addedAt: firebase.firestore.FieldValue.serverTimestamp() });
            appState.favorites.add(productId);
             // Log the public event only if we found the product details
        if (product) {
            logPublicEvent('favorite', { productName: product.name });
        }
            if (heartIcon) {
                heartIcon.classList.replace('bi-heart', 'bi-heart-fill');
                heartIcon.classList.add('favorited');
            }
            showToast("Added!", "Item added to your favorites.", "success");
        }
    }

  

    // --- Live Banner ---
    function listenForBanner() {
        if (appState.unsubscribeBanner) appState.unsubscribeBanner(); // Unsubscribe from previous listener
        
        appState.unsubscribeBanner = db.collection('site_config').doc('live_banner')
            .onSnapshot(doc => {
                const data = doc.data();
                if (data && data.isActive) {
                    UI.bannerMessage.textContent = data.message;
                    UI.banner.className = `live-announcement-banner visible style-${data.style || 'info'}`;
                    document.body.classList.add('banner-visible');
                    if(data.link) {
                        UI.banner.onclick = () => window.location.href = data.link;
                        UI.banner.style.cursor = 'pointer';
                    } else {
                        UI.banner.onclick = null;
                        UI.banner.style.cursor = 'default';
                    }
                } else {
                    UI.banner.classList.remove('visible');
                    document.body.classList.remove('banner-visible');
                }
            }, error => console.error("Banner listener error:", error));
    }
    
   // === PASTE THIS NEW, CORRECTED setupEventListeners FUNCTION ===
function setupEventListeners() {
    document.body.addEventListener('click', e => {

        
        const favoriteIcon = e.target.closest('.product-favorite-icon');
        
        if (favoriteIcon) {
            e.preventDefault(); // Prevent link navigation
            toggleFavorite(favoriteIcon.dataset.productId);
        }
        // === PASTE THIS NEW IF BLOCK inside the body click listener ===
if (e.target.closest('#show-favorites-btn')) {
    e.preventDefault();
    // This is the magic: we find the hidden link in the dropdown and "click" it for the user.
    const hiddenFavLink = document.querySelector('#user-dropdown-menu a[href="#"][id="my-favorites-btn"]');
    if (hiddenFavLink) {
        hiddenFavLink.click();
    }
}
        // === PASTE THIS NEW BLOCK at the end of setupEventListeners ===

// --- Intersection Observer for active nav link on scroll ---
const navLinks = document.querySelectorAll('#category-nav-links .nav-link');
const sections = document.querySelectorAll('.category-section-wrapper');

const observerOptions = {
    root: null, // observes intersections relative to the viewport
    rootMargin: '-50% 0px -50% 0px', // trigger when the middle of the screen crosses the section
    threshold: 0
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                // Check if the link's href matches the intersecting section's ID
                if (link.getAttribute('href') === `#${entry.target.id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => {
    sectionObserver.observe(section);
});
    });

    // Your other static listeners are fine, but remove any related to cart
    UI.themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('shopTheme', isLight ? 'light' : 'dark');
        UI.themeToggle.classList.toggle('light', isLight);
    });

    if (UI.bannerCloseBtn) {
        UI.bannerCloseBtn.addEventListener('click', () => UI.banner.classList.remove('visible'));
    }
}

    // --- 5. INITIALIZATION ---
    async function main() {
        document.body.classList.add('preloading');
        
        const savedTheme = localStorage.getItem('shopTheme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            UI.themeToggle.classList.add('light');
        }

        auth.onAuthStateChanged(handleAuthStateChange);
        setupEventListeners();
        listenForBanner();
        await fetchProducts();
        renderProducts();

        UI.preloader.classList.add('loaded');
        setTimeout(() => {
            UI.preloader.style.display = 'none';
            document.body.classList.remove('preloading');
        }, 800);
    }

    main();
    // === PASTE THIS NEW FUNCTION AT THE END OF shop.js ===

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

});