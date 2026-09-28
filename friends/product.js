// === product.js (Standalone & Production-Ready) ===
// --- Handles the PRODUCT DETAIL page ---

document.addEventListener('DOMContentLoaded', function () {

    // --- 1. INITIALIZATION & CONFIG (Same as shop.js) ---
    const firebaseConfig = {
        apiKey: "AIzaSyDnS_o6asJeO6J6eUTZA7f3ONfmUJK6t_g",
        authDomain: "jewellery-308b1.firebaseapp.com",
        projectId: "jewellery-308b1",
        storageBucket: "jewellery-308b1.firebasestorage.app",
        messagingSenderId: "275610166334",
        appId: "1:275610166334:web:5290beefa8cadae4415d6f"
    };
    if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
    const db = firebase.firestore();
    const auth = firebase.auth();

    // --- 2. GLOBAL STATE & DOM ELEMENTS ---
    const appState = {
        user: null,
        product: null,
        cart: {},
        allProducts: [], // Need this to render cart items correctly
        activeDiscount: null
    };
    const UI = {
        preloader: document.getElementById('preloader'),
        userProfileIcon: document.getElementById('user-profile-icon'),
        userDropdownMenu: document.getElementById('user-dropdown-menu'),
      
        themeToggle: document.getElementById('theme-toggle'),
        productDetailContent: document.getElementById('product-detail-content'),
         // --- ADD THESE TWO LINES ---
    youMayAlsoLikeSection: document.getElementById('you-may-also-like-section'),
    relatedProductsRow: document.getElementById('related-products-row'),
    // --- END OF NEW LINES ---
        toastEl: document.getElementById('appToast'),
        bsToast: null,
    };
    if (UI.toastEl) UI.bsToast = new bootstrap.Toast(UI.toastEl, { delay: 3000 });
    
    // --- Reusable Helper Functions ---
    function showToast(title, body, type = 'info') {
        const icons = { success: 'bi-check-circle-fill text-success', danger: 'bi-x-circle-fill text-danger', info: 'bi-info-circle-fill text-info' };
        document.getElementById('toastTitle').textContent = title;
        document.getElementById('toastBody').textContent = body;
        document.getElementById('toast-icon').className = `bi me-2 ${icons[type] || icons.info}`;
        UI.bsToast.show();
    }
    // === PASTE THIS NEW HELPER FUNCTION into product.js ===
// Place it right after your showToast function

window.setButtonLoading = function(button, isLoading, loadingText = 'Loading...') {
    if (!button) return;
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${loadingText}`;
    } else {
        button.disabled = false;
        // Use the saved original text, or a default
        button.innerHTML = button.dataset.originalText || 'Submit Review';
    }
}
    // === PASTE THIS NEW FUNCTION into product.js ===
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

   // === PASTE THIS NEW, CORRECTED handleAuthStateChange FUNCTION ===

async function handleAuthStateChange(user) {
    appState.user = user;
    updateNavbarUI(user);

    if (user) {
        // Fetch the user's favorites so we know which hearts to fill
        await fetchUserFavorites(user.uid);
        
        // After fetching favorites, we re-render the related products
        // to show the correct heart icon status.
        if (appState.product && appState.product.category) {
            await fetchRelatedProducts(appState.product.category, appState.product.id);
        }
    } else {
        // User is logged out, clear their favorites
        appState.favorites.clear();
        
        // Re-render to show all hearts as empty
         if (appState.product && appState.product.category) {
            await fetchRelatedProducts(appState.product.category, appState.product.id);
        }
    }
}

    async function fetchAllProducts() {
        try {
            const snapshot = await db.collection('products').get();
            appState.allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Could not fetch all products for cart rendering:", e);
        }
    }

    async function fetchProduct(productId) {
        try {
            const doc = await db.collection('products').doc(productId).get();
            if (doc.exists) {
                appState.product = { id: doc.id, ...doc.data() };
                renderProductDetail();
            } else {
                UI.productDetailContent.innerHTML = `<div class="text-center p-5"><h2 class="text-danger">Product Not Found</h2><p class="text-secondary">The item you are looking for does not exist or may have been removed.</p><a href="shop.html" class="btn btn-main mt-3">Back to Shop</a></div>`;
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            UI.productDetailContent.innerHTML = `<p class="text-danger text-center">Could not load product details.</p>`;
        }
    }

    // === PASTE THIS NEW, MISSING FUNCTION into product.js ===

async function fetchUserFavorites(userId) {
    if (!userId) return;
    try {
        const favSnapshot = await db.collection('users').doc(userId).collection('favorites').get();
        appState.favorites = new Set(favSnapshot.docs.map(doc => doc.id));
    } catch (error) { 
        console.error("Error fetching user favorites on product page:", error);
        // On error, ensure favorites is an empty Set to prevent crashes
        appState.favorites = new Set();
    }
}

// === PASTE THIS NEW, MISSING FUNCTION into product.js ===
async function toggleFavorite(productId) {
    if (!appState.user) {
        // Assuming showToast exists
        return showToast("Login Required", "Please sign in to save favorites.", "info");
    }
    
    const favRef = db.collection('users').doc(appState.user.uid).collection('favorites').doc(productId);
    // Target all potential heart icons for this product
    const heartIcons = document.querySelectorAll(`.product-favorite-icon[data-product-id="${productId}"]`);
    
    if (appState.favorites.has(productId)) {
        await favRef.delete();
        appState.favorites.delete(productId);
        heartIcons.forEach(icon => {
            icon.classList.replace('bi-heart-fill', 'bi-heart');
            icon.classList.remove('favorited');
        });
    } else {
        await favRef.set({ addedAt: firebase.firestore.FieldValue.serverTimestamp() });
        appState.favorites.add(productId);
        heartIcons.forEach(icon => {
            icon.classList.replace('bi-heart', 'bi-heart-fill');
            icon.classList.add('favorited');
        });
        showToast("Added!", "Item added to your favorites.", "success");
    }
}

   
function renderProductDetail() {
        if (!appState.product) return;
        const p = appState.product;
        const mainImageUrl = p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/600x600';

        document.title = `${p.name} - RS Sisters`;

        UI.productDetailContent.innerHTML = `
            <div class="row">
                <div class="col-lg-6 product-detail-gallery">
                    <img src="${mainImageUrl}" alt="${p.name}" class="main-image" id="main-product-image">
                    <div class="product-thumbnail-container">
                        ${(p.images || []).map((img, i) => `<img src="${img}" alt="Thumbnail ${i+1}" class="product-thumbnail ${i === 0 ? 'active' : ''}" data-full-image="${img}">`).join('')}
                    </div>
                </div>
                <div class="col-lg-5 offset-lg-1 product-detail-info">
                    <p class="product-category">${p.category === 'Bracelets' ? 'Handmade Jewellery' : (p.category || 'Jewellery')}</p>
                    <h1 class="product-name">${p.name}</h1>
                    <p class="product-price">₹${p.price.toLocaleString()}</p>
                    <!-- === REAL-TIME REVIEW COUNT TICKET (NEW) === -->
                    <div id="review-ticker-container" class="mb-3">
                        <!-- Review badge will be injected here -->
                    </div>
                    <!-- === END OF REVIEW COUNT TICKET === -->
                    <!-- === THIS IS THE NEW DESCRIPTION BLOCK === -->
<div class="product-description-wrapper" id="product-description-wrapper">
    <p class="text-secondary" id="product-description-text">${p.description}</p>
</div>
<button class="read-more-btn" id="read-more-btn">Read More</button>
<!-- === END OF NEW BLOCK === -->
                    
                   <!-- === PASTE THIS NEW SHARE BUTTON BLOCK === -->
<div class="product-share-section">
    <p class="product-share-label">Share:</p>
    <div class="share-buttons-container">
        <button class="share-btn" id="native-share-btn" title="Share Product">
            <i class="bi bi-share-fill"></i>
        </button>
    </div>
</div>
<hr>
                    <div id="size-selector-container" class="mb-3" style="display: none;">
                        <label class="form-label fw-bold">Select Size:</label>
                        <div id="size-buttons" class="d-flex flex-wrap gap-2">
                            <!-- Size buttons will be injected here -->
                        </div>
                    </div>
        
                    <p><strong>Availability:</strong> <span class="text-${p.stock > 0 ? 'success' : 'danger'}">${p.stock > 0 ? `${p.stock} In Stock` : 'Out of Stock'}</span></p>
                    <!-- === IN STOCK CONFIDENCE BAR (NEW) === -->
                    <div id="stock-confidence-bar" class="mt-3">
                        <!-- Content injected by JS -->
                    </div>
                    <!-- === END OF CONFIDENCE BAR === -->
                   <!-- === THIS IS THE NEW WHATSAPP BUTTON === -->
<button class="btn-whatsapp-inquiry btn-lg mt-3" data-product-id="${p.id}" data-product-name="${p.name}" ${p.stock === 0 ? 'disabled' : ''}>
    <i class="bi bi-whatsapp me-2"></i> ${p.stock > 0 ? 'Inquire & Order' : 'Sold Out'}
</button>
<button class="btn-add-to-bag" data-product-id="${p.id}" title="Add to Bag" 'disabled' : ''}>
            <i class="bi bi-plus-lg"></i>
        </button>
<!-- === THIS IS THE NEW TRUST BADGES HTML === -->
<div class="trust-badges-section">
    <div class="trust-badge">
        <div class="trust-badge-icon">
            <i class="bi bi-shield-check"></i>
        </div>
        <div class="trust-badge-text">
            <strong>Premium Quality</strong>
            <span>Anti-tarnish & Hypoallergenic materials</span>
        </div>
    </div>
    <div class="trust-badge">
        <div class="trust-badge-icon">
            <i class="bi bi-box-seam"></i>
        </div>
        <div class="trust-badge-text">
            <strong>Secure & Fast Shipping</strong>
            <span>Tracked delivery all over India</span>
        </div>
    </div>
    <div class="trust-badge">
        <div class="trust-badge-icon">
            <i class="bi bi-patch-question-fill"></i>
        </div>
        <div class="trust-badge-text">
            <strong>Personal Support</strong>
            <span>Directly from the designer on WhatsApp</span>
        </div>
    </div>
</div>
<!-- === END OF NEW HTML === -->
                </div>
            </div>
        `;
        
// At the end of your renderProductDetail function, add this line:
setupProductDetailPageListeners();
renderBreadcrumbs(appState.product);
 setupShareButton();
 renderStockConfidenceBar(p);
 renderReviewTicker(p.id);

    }
    // === NEW FUNCTION: RENDER STOCK CONFIDENCE BAR ===
    function renderStockConfidenceBar(product) {
        const barContainer = document.getElementById('stock-confidence-bar');
        if (!barContainer || !product) return;
        
        const stock = product.stock || 0; // Use 0 if stock is missing

        let html = '';
        let className = '';
        let message = '';

        if (stock <= 0) {
            // Out of Stock
            className = 'low-stock';
            message = `<i class="bi bi-x-circle-fill"></i> Sold Out. Contact us for restock options.`;
        } else if (stock <= 5) {
            // Low Stock (Trigger Urgency)
            className = 'low-stock';
            message = `<i class="bi bi-exclamation-triangle-fill"></i> Only ${stock} left! Buy now before it's gone.`;
        } else {
            // High Stock (Reassurance)
            className = 'high-stock';
            message = `<i class="bi bi-check-circle-fill"></i> In stock and ready to ship!`;
        }

        html = `<div class="confidence-bar ${className}">${message}</div>`;
        barContainer.innerHTML = html;
    }
    // === NEW FUNCTION: RENDER REAL-TIME REVIEW TICKER (THE WOW) ===
    async function renderReviewTicker(productId) {
        const container = document.getElementById('review-ticker-container');
        if (!container || !productId) return;

        try {
            // 1. Fetch only approved reviews for this product
            const snapshot = await db.collection('reviews')
                .where('productId', '==', productId)
                .where('isApproved', '==', true) 
                .get();
            
            if (snapshot.empty) {
                // --- PREMIUM EMPTY STATE FIX (Updated for smooth scroll) ---
                container.innerHTML = `
                    <span class="review-ticker-invitation" id="review-invitation-btn">
                        ✨ Be the first to review this elegant piece!
                    </span>
                `;
                
                // --- ATTACH SMOOTH SCROLL LISTENER (NEW BLOCK) ---
                document.getElementById('review-invitation-btn').addEventListener('click', () => {
                    const reviewAnchor = document.getElementById('review-section');
                    if (reviewAnchor) {
                        reviewAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
                
                return;
            }

            const totalReviews = snapshot.size;
            let totalRating = 0;
            
            snapshot.forEach(doc => {
                totalRating += doc.data().rating;
            });

            // Calculate average rating, rounded to one decimal place
            const averageRating = (totalRating / totalReviews).toFixed(1);
            
            // Generate star visualization (e.g., ★★★★★)
            const fullStars = '★'.repeat(Math.round(averageRating));
            const emptyStars = '☆'.repeat(5 - Math.round(averageRating));

            const html = `
                <div class="review-ticker-badge">
                    <span class="review-ticker-rating">${averageRating}</span>
                    <span class="review-ticker-stars">${fullStars}${emptyStars}</span>
                    <span class="review-ticker-count">(${totalReviews} Reviews)</span>
                </div>
            `;
            
            container.innerHTML = html;

        } catch (error) {
            console.error("Error fetching review ticker:", error);
            // Fail gracefully
            container.innerHTML = `<span class="review-ticker-count text-secondary">Loading reviews...</span>`;
        }
    }

    // === PASTE THIS NEW, MISSING FUNCTION into product.js ===
    // === PASTE THESE TWO NEW FUNCTIONS in product.js ===

    async function fetchRelatedProducts(category, currentProductId) {
        if (!category) return;
        try {
            const snapshot = await db.collection('products')
                .where('category', '==', category)
                .where(firebase.firestore.FieldPath.documentId(), '!=', currentProductId)
                .limit(8) // Fetch up to 8 related products
                .get();
            
            const relatedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderRelatedProducts(relatedProducts, category);
        } catch (error) {
            console.error("Error fetching related products:", error);
        }
    }

function renderRelatedProducts(relatedProducts, category) {
    if (!UI.relatedProductsRow || relatedProducts.length === 0) {
        if (UI.youMayAlsoLikeSection) UI.youMayAlsoLikeSection.classList.add('d-none');
        return;
    }

    // This helper function is the same as in shop.js
    const createProductCardHTML = (p) => {
        const imageUrl = (p.images && p.images[0]) || 'https://via.placeholder.com/300';
        const stock = typeof p.stock === 'number' ? p.stock : 1;
        const isSoldOut = stock === 0;
        let badgeHTML = '';
        if (isSoldOut) badgeHTML = `<span class="product-badge sold-out-badge">Sold Out</span>`;
        else if (p.isOnSale && p.salePrice) badgeHTML = `<span class="product-badge sale-badge">On Sale</span>`;

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
                    <h5 class="product-name">${p.name}</h5>
                    <div class="product-price-cart-row">
                        <p class="product-price mb-0">₹${p.price.toLocaleString()}</p>
                        <button class="btn-add-to-bag" data-product-id="${p.id}" title="Add to Bag" ${isSoldOut ? 'disabled' : ''}>
            <i class="bi bi-plus-lg"></i>
        </button>
                        <button class="btn-whatsapp-inquiry" data-product-id="${p.id}" data-product-name="${p.name}" title="Inquire on WhatsApp" ${isSoldOut ? 'disabled' : ''}>
                            <i class="bi ${isSoldOut ? 'bi-x-lg' : 'bi-whatsapp'}"></i>
                        </button>
                        
                    </div>
                </div>
                <i class="bi product-favorite-icon ${appState.favorites.has(p.id) ? 'bi-heart-fill favorited' : 'bi-heart'}" data-product-id="${p.id}"></i>
            </div>
        </div>`;
    };

    UI.relatedProductsRow.innerHTML = relatedProducts.slice(0, 7).map(createProductCardHTML).join('');

    // Add the "View All" card if there were more than 7 products
    if (relatedProducts.length > 7) {
        UI.relatedProductsRow.innerHTML += `
        <div class="product-card-wrapper">
            <a href="category.html?category=${encodeURIComponent(category)}" class="product-card-link">
                <div class="view-all-card">
                    <div>
                        <i class="bi bi-arrow-right-circle"></i>
                        <p>View All<br>${category}</p>
                    </div>
                </div>
            </a>
        </div>`;
    }
    
    UI.youMayAlsoLikeSection.classList.remove('d-none');
}
// === PASTE THESE TWO NEW FUNCTIONS in product.js ===

// --- The "Tracker" Logic ---
async function trackProductView(currentProductId) {
    const lastViewedId = sessionStorage.getItem('lastViewedProductId');

    if (lastViewedId && lastViewedId !== currentProductId) {
        const relationId = [lastViewedId, currentProductId].sort().join('_');
        const relationRef = db.collection('product_relations').doc(relationId);
        
        try {
            await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(relationRef);
                if (!doc.exists) {
                    transaction.set(relationRef, {
                        products: [lastViewedId, currentProductId],
                        count: 1
                    });
                } else {
                    const newCount = (doc.data().count || 0) + 1;
                    transaction.update(relationRef, { count: newCount });
                }
            });
        } catch (e) { console.error("Error updating product relation:", e); }
    }
    sessionStorage.setItem('lastViewedProductId', currentProductId);
}

// === PASTE THIS NEW DEBUGGING showAlsoViewed FUNCTION ===

async function showAlsoViewed(currentProductId) {
    console.log("--- Starting showAlsoViewed ---");
    console.log("Looking for recommendations for product:", currentProductId);

    const section = document.getElementById('customers-also-viewed-section');
    const container = document.getElementById('also-viewed-products-row');
    if (!section || !container) {
        console.error("Stopping: Could not find HTML containers.");
        return;
    }

    try {
        console.log("Step 1: Fetching up to 20 relations from the database...");
        const relationsSnap = await db.collection('product_relations').limit(20).get();

        if (relationsSnap.empty) {
            console.warn("Stopping: The 'product_relations' collection is empty. No recommendations to show.");
            return;
        }
        console.log(`Step 2: Found ${relationsSnap.size} total relations.`);

        let relatedProductIds = new Set();
        relationsSnap.forEach(doc => {
            const products = doc.data().products;
            if (products && products.includes(currentProductId)) {
                const relatedId = products[0] === currentProductId ? products[1] : products[0];
                relatedProductIds.add(relatedId);
            }
        });
        
        const uniqueIds = Array.from(relatedProductIds);
        if (uniqueIds.length === 0) {
            console.warn("Stopping: Found relations, but none match the current product.");
            return;
        }
        console.log(`Step 3: Found ${uniqueIds.length} related product IDs:`, uniqueIds);

        const productPromises = uniqueIds.slice(0, 10).map(id => db.collection('products').doc(id).get());
        const productDocs = await Promise.all(productPromises);
        
        const productsToDisplay = productDocs.filter(doc => doc.exists).map(doc => ({ id: doc.id, ...doc.data() }));

        if (productsToDisplay.length > 0) {
            console.log(`Step 4: Successfully fetched details for ${productsToDisplay.length} products. Rendering now...`);
            container.innerHTML = productsToDisplay.map(p => {
                const imageUrl = (p.images && p.images[0]) || 'https://via.placeholder.com/120';
                return `<div class="product-card-wrapper"><a href="product.html?id=${p.id}" class="product-card-link"><div class="product-card"><div class="product-image-container"><img src="${imageUrl}" alt="${p.name}" class="product-image"></div><div class="product-info"><h5 class="product-name">${p.name}</h5></div></div></a></div>`;
            }).join('');
            section.classList.remove('d-none');
            console.log("--- SUCCESS: Rendered 'Customers Also Viewed' section. ---");
        } else {
             console.warn("Stopping: Found related IDs, but could not fetch their product details.");
        }

    } catch (error) { 
        console.error("--- CRITICAL ERROR in showAlsoViewed ---", error); 
    }
}

function setupProductDetailPageListeners() {
    // This function's only job is to make the image thumbnails clickable.
    
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.product-thumbnail');

    if (mainImage && thumbnails.length > 0) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                // Set the main image src to the clicked thumbnail's full image URL
                mainImage.src = thumb.dataset.fullImage;

                // Update the 'active' class to show a border on the selected thumbnail
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });
    }
}
    
    function updateNavbarUI(user) {
        if (!UI.userProfileIcon || !UI.userDropdownMenu) return;
        if (user) {
            UI.userProfileIcon.innerHTML = `<img src="${user.photoURL}" alt="User">`;
            UI.userDropdownMenu.innerHTML = `
                <li><a class="dropdown-item" href="#">My Orders</a></li>
                <li><a class="dropdown-item" href="#">My Favorites</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item" id="logout-btn">Logout</button></li>
            `;
            document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());
        } else {
            UI.userProfileIcon.innerHTML = `<i class="bi bi-person-circle nav-icon"></i>`;
            UI.userDropdownMenu.innerHTML = `<li><button class="dropdown-item" id="login-btn">Sign in with Google</button></li>`;
            document.getElementById('login-btn').addEventListener('click', () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()));
        }
    }

    // === PASTE THIS NEW FUNCTION into product.js ===

function renderBreadcrumbs(product) {
    if (!product || !product.category || !product.name) return; // Safety check

    const productDetailContainer = document.getElementById('product-detail-content');
    if (!productDetailContainer) return;

    // Check if a breadcrumb already exists to prevent duplicates
    if (productDetailContainer.querySelector('.breadcrumb-nav')) return;
    // === PASTE THIS NEW TRANSLATOR LOGIC HERE ===
const displayNameMap = {
    'Bracelets': 'Handmade Jewellery'
};
const categoryDisplayName = displayNameMap[product.category] || product.category;
// === END OF NEW LOGIC ===

   // === REPLACE your old breadcrumbHTML with this one ===
const breadcrumbHTML = `
<div class="breadcrumb-nav">
    <a href="shop.html">Shop</a>
    <span class="separator">/</span>
    <a href="category.html?category=${encodeURIComponent(product.category)}">${categoryDisplayName}</a>
    <span class="separator">/</span>
    <span class="current-page">${product.name}</span>
</div>
`;

    // 2. Insert the breadcrumb HTML at the very top of the content container.
    productDetailContainer.insertAdjacentHTML('afterbegin', breadcrumbHTML);
}

   
  
   

    

   
    
    // === PASTE THIS NEW FUNCTION into product.js ===

function setupShareButton() {
    // We can now directly access appState because we are inside the same file.
    const product = appState.product;
    if (!product) return;

    const nativeShareBtn = document.getElementById('native-share-btn');
    if (!nativeShareBtn) return;

    const productUrl = window.location.href;
    const shareData = {
        title: `Check out ${product.name}!`,
        text: `I found this beautiful piece from RS Sisters: ${product.name}`,
        url: productUrl,
    };

    // Check if the browser supports the native Web Share API
    if (navigator.share) {
        // MODERN MOBILE BROWSER: Use the native share
        nativeShareBtn.addEventListener('click', async () => {
            try {
                await navigator.share(shareData);
                console.log("Shared successfully");
            } catch (err) {
                console.error("Share failed:", err.message);
            }
        });
    } else {
        // DESKTOP / OLDER BROWSER: Fallback to "Copy Link"
        nativeShareBtn.innerHTML = '<i class="bi bi-link-45deg"></i>'; // Change icon
        nativeShareBtn.setAttribute('title', 'Copy Link');

        // We use .replaceWith(.cloneNode) to remove any old listeners before adding a new one
        const newBtn = nativeShareBtn.cloneNode(true);
        nativeShareBtn.parentNode.replaceChild(newBtn, nativeShareBtn);
        
        newBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(productUrl).then(() => {
                showToast("Link Copied!", "Product link is now on your clipboard.", "success");
            }).catch(err => {
                console.error('Failed to copy link: ', err);
                showToast("Copy Failed", "Could not copy link to clipboard.", "danger");
            });
        });
    }
}

    function setupSharedEventListeners() {
        
         document.body.addEventListener('click', e => {
        const favoriteIcon = e.target.closest('.product-favorite-icon');
        if (favoriteIcon) {
            e.preventDefault();
            toggleFavorite(favoriteIcon.dataset.productId);
        }
    });
    

        if (UI.themeToggle) {
            UI.themeToggle.addEventListener('click', () => {
                const isLight = document.body.classList.toggle('light-mode');
                localStorage.setItem('shopTheme', isLight ? 'light' : 'dark');
                UI.themeToggle.classList.toggle('light', isLight);
            });
        }
    }

    async function main() {
        if (UI.preloader) UI.preloader.style.opacity = 1;
        
        const savedTheme = localStorage.getItem('shopTheme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            if (UI.themeToggle) UI.themeToggle.classList.add('light');
        }

        const productId = new URLSearchParams(window.location.search).get('id');
        if (!productId) {
            UI.productDetailContent.innerHTML = `<p class="text-danger text-center">No product specified.</p>`;
            return;
        }

        auth.onAuthStateChanged(handleAuthStateChange);
        setupSharedEventListeners();
        await fetchAllProducts(); 
        await fetchProduct(productId);
        // --- PASTE THESE TWO NEW LINES in main() ---
trackProductView(productId);
showAlsoViewed(productId);
// --- END OF NEW LINES ---
        // === PASTE THIS NEW BLOCK in the main() function ===
if (appState.product && appState.product.category) {
    await fetchRelatedProducts(appState.product.category, productId);
}
// === END OF NEW BLOCK ===

        if (UI.preloader) {
            UI.preloader.style.opacity = 0;
            setTimeout(() => UI.preloader.style.display = 'none', 500);
        }
    }
    
    main();
});