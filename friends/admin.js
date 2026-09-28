// === admin.js (FINAL, COMPLETE, & Production-Ready) ===

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONFIG & INITIALIZATION ---
    const firebaseConfig = {
        apiKey: "AIzaSyDnS_o6asJeO6J6eUTZA7f3ONfmUJK6t_g",
        authDomain: "jewellery-308b1.firebaseapp.com",
        projectId: "jewellery-308b1",
        storageBucket: "jewellery-308b1.appspot.com",
        messagingSenderId: "275610166334",
        appId: "1:275610166334:web:5290beefa8cadae4415d6f"
    };

    if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
    const db = firebase.firestore();
    const auth = firebase.auth();

    // --- [CRITICAL] ADMIN UID CONFIGURATION ---
    const ADMIN_UID = "WvjiTsfUV3dAL2pkpCv2aCDsOkV2";

    // --- EmailJS Config (Get these from your EmailJS account) ---
    const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
    const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
    const EMAILJS_USER_ID = 'YOUR_PUBLIC_KEY'; 
    
    // --- 2. DOM ELEMENTS & STATE ---
    const UI = {
        loginScreen: document.getElementById('login-screen'),
        adminPanel: document.getElementById('admin-panel'),
        adminLoginBtn: document.getElementById('admin-login-btn'),
        adminLogoutBtn: document.getElementById('admin-logout-btn'),
        adminWelcome: document.getElementById('admin-welcome'),
        navLinks: document.querySelectorAll('.offcanvas-body .nav-link'),
        sections: document.querySelectorAll('.admin-section'),
        dashboardContent: document.querySelector('#dashboard-section .row'),
        ordersList: document.getElementById('orders-list'),
        productsList: document.getElementById('products-list'),
        bannerMessageInput: document.getElementById('bannerMessage'),
        bannerStyleSelect: document.getElementById('bannerStyle'),
        updateBannerBtn: document.getElementById('update-banner-btn'),
        deactivateBannerBtn: document.getElementById('deactivate-banner-btn'),
        discountCodesList: document.getElementById('discount-codes-list'),
        newDiscountCodeInput: document.getElementById('newDiscountCode'),
        newDiscountPercentInput: document.getElementById('newDiscountPercent'),
        addDiscountBtn: document.getElementById('add-discount-btn'),
        dashboardRefreshBtn: document.getElementById('dashboard-refresh-btn'),
        productSearchInput: document.getElementById('product-search-input'),
    };

    let appState = { products: [], orders: [], siteConfig: {} };

    // --- 3. SECURITY & AUTHENTICATION ---
    auth.onAuthStateChanged(user => {
        if (user && user.uid === ADMIN_UID) {
            UI.loginScreen.classList.add('d-none');
            UI.adminPanel.classList.remove('d-none');
            
            // --- NEW PREMIUM PROFILE INJECTION ---
            const firstName = user.displayName.split(' ')[0];
            
            document.getElementById('admin-profile-name').textContent = user.displayName;
            document.getElementById('admin-profile-photo').src = user.photoURL || "https://via.placeholder.com/80/495057/fff?text=RS";
            document.getElementById('admin-profile-welcome-detail').textContent = `Welcome, ${firstName}!`;
            
            // The old top welcome bar is now redundant, but update it just in case:
            UI.adminWelcome.textContent = `Welcome, ${firstName}`;
            
            // Ensure the Mission Control dashboard is the first thing shown
            navigateToSection('mission-control-section'); 

            initializeApp();
        } else {
            UI.loginScreen.classList.remove('d-none');
            UI.adminPanel.classList.add('d-none');
            if (user) auth.signOut();
        }
    });
    // === PROFILE INTERACTION LOGIC (NEW) ===
    document.addEventListener('click', (e) => {
        if (e.target.closest('#profile-photo-btn')) {
            const user = auth.currentUser;
            if (user) {
                // Simulating a "View Full Profile" or "Settings" modal opening
                alert(`Hello, ${user.displayName.split(' ')[0]}! This is where your Profile Settings or a full-screen image viewer would open.`);
                
                // For demonstrating the full image (using the browser's image viewer capability)
                if (user.photoURL) {
                    window.open(user.photoURL, '_blank');
                }
            }
        }
    });
    // --- Event Listener for Sidebar Quick Actions ---
    document.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('.sidebar-action-btn');
        if (actionBtn && actionBtn.dataset.sectionTrigger) {
            e.preventDefault();
            const sectionName = actionBtn.dataset.sectionTrigger;
            
            // This reuses your existing function defined earlier in admin.js
            navigateToSection(sectionName + '-section'); 

            // Close the offcanvas on mobile after clicking
            const offcanvasEl = document.getElementById('offcanvasNavbar');
            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
            if (offcanvas) offcanvas.hide();
        }
    });

    UI.adminLoginBtn.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).catch(error => {
            console.error("Admin Login Error:", error);
            alert("Could not sign in. Please check if pop-ups are blocked or try again.");
        });
    });

    UI.adminLogoutBtn.addEventListener('click', () => auth.signOut());

    // === PASTE THE NEW REFRESH BUTTON LOGIC HERE ===
if (UI.dashboardRefreshBtn) {
    UI.dashboardRefreshBtn.addEventListener('click', async () => {
        // Add a visual loading state to the button
        const btn = UI.dashboardRefreshBtn;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Refreshing...`;

        // Re-run the main initialization function to fetch all new data
        await initializeApp();

        // Restore the button after a short delay
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = `<i class="bi bi-arrow-clockwise me-1"></i> Refresh`;
        }, 500);
    });
}
// === END OF PASTE ===


    // --- 4. NAVIGATION & APP LOGIC ---
    function navigateToSection(sectionId) {
        UI.sections.forEach(s => s.classList.add('d-none'));
        document.getElementById(sectionId).classList.remove('d-none');
        UI.navLinks.forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-section="${sectionId.replace('-section', '')}"]`);
        if (activeLink) activeLink.classList.add('active');
    }
    // --- Event Listener for dashboard clickable cards ---
const dashboardSection = document.getElementById('dashboard-section');
if (dashboardSection) {
    dashboardSection.addEventListener('click', (e) => {
        const actionCard = e.target.closest('.stat-card, .action-card');
        if (!actionCard) return;

        const action = actionCard.dataset.action;
        let sectionName = '';

        // This maps the click action to the menu link's data-section attribute
        if (action === 'addProduct') {
            new bootstrap.Modal(document.getElementById('productModal')).show();
            return;
        } else if (action === 'viewInquiries') sectionName = 'inquiries';
        else if (action === 'viewReviews') sectionName = 'reviews';
        else if (action === 'viewProducts') sectionName = 'products';
        // Add more else if for other sections like customers later

        const targetNavLink = document.querySelector(`.nav-link[data-section="${sectionName}"]`);
        if (targetNavLink) targetNavLink.click();
    });
}

    UI.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToSection(e.target.dataset.section + '-section');
            const offcanvasEl = document.getElementById('offcanvasNavbar');
            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
            if (offcanvas) offcanvas.hide();
        });
    });

   // === PASTE THIS NEW, COMPLETE initializeApp FUNCTION ===
async function initializeApp() {
    try {
        // Fetch all necessary collections in parallel for speed.
        const [productsSnapshot, ordersSnapshot, configSnapshot, inquiriesSnap, reviewsSnap, usersSnap] = await Promise.all([
            db.collection('products').orderBy('createdAt', 'desc').get(),
            db.collection('orders').orderBy('createdAt', 'desc').get(),
            db.collection('site_config').get(),
            db.collection('inquiries').get(),
            db.collection('reviews').get(),
            db.collection('users').get()
        ]);

        // Assign all data to the central appState
        appState.products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        appState.orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        appState.siteConfig = {};
        configSnapshot.forEach(doc => { appState.siteConfig[doc.id] = doc.data(); });
        // Add the new data
        appState.inquiries = inquiriesSnap.docs.map(doc => doc.data());
        appState.reviews = reviewsSnap.docs.map(doc => doc.data());
        appState.users = usersSnap.docs.map(doc => doc.data());

        // Now, render all components with the complete data
        renderDashboard();
        renderOrders();
        renderProductsTable();
        renderSettings();

    } catch (error) {
        console.error("Initialization Error: ", error);
        alert("Could not load app data. Check Firestore rules and network connection.");
    }
}
   // === PASTE THIS NEW, CORRECTED renderDashboard FUNCTION ===
function renderDashboard() {
    if (!UI.dashboardContent) return;
    
    // --- Calculate Stats from the complete appState ---
    const newInquiries = (appState.inquiries || []).filter(i => i.status === 'New').length;
    const newReviews = (appState.reviews || []).filter(r => !r.isApproved).length;
    const totalProducts = (appState.products || []).length;
    const totalCustomers = (appState.users || []).length;
    
    UI.dashboardContent.innerHTML = `
        <div class="col-md-6 col-lg-3 mb-4">
            <div class="stat-card" data-action="viewInquiries">
                <div class="stat-icon text-primary bg-primary-light"><i class="bi bi-chat-dots-fill"></i></div>
                <div><div class="stat-value">${newInquiries}</div><div class="stat-label">New Inquiries</div></div>
            </div>
        </div>
        <div class="col-md-6 col-lg-3 mb-4">
            <div class="stat-card" data-action="viewReviews">
                <div class="stat-icon text-warning bg-warning-light"><i class="bi bi-star-fill"></i></div>
                <div><div class="stat-value">${newReviews}</div><div class="stat-label">Reviews to Approve</div></div>
            </div>
        </div>
        <div class="col-md-6 col-lg-3 mb-4">
            <div class="stat-card" data-action="viewProducts">
                <div class="stat-icon text-info bg-info-light"><i class="bi bi-gem"></i></div>
                <div><div class="stat-value">${totalProducts}</div><div class="stat-label">Total Products</div></div>
            </div>
        </div>
        <div class="col-md-6 col-lg-3 mb-4">
            <div class="stat-card" data-action="viewCustomers">
                <div class="stat-icon text-success bg-success-light"><i class="bi bi-people-fill"></i></div>
                <div><div class="stat-value">${totalCustomers}</div><div class="stat-label">Total Customers</div></div>
            </div>
        </div>
    `;
}
    
    function renderOrders() {
        if (!UI.ordersList) return;
        if (appState.orders.length === 0) {
            UI.ordersList.innerHTML = `<div class="alert alert-info">No orders have been placed yet.</div>`;
            return;
        }
        UI.ordersList.innerHTML = appState.orders.map(order => {
            const orderDate = order.createdAt?.toDate().toLocaleDateString() || 'N/A';
            const itemsHTML = (order.items || []).map(item => {
                const product = appState.products.find(p => p.id === item.id);
                const productName = product?.name || 'Product Not Found';
                const productImage = product?.images[0] || 'https://via.placeholder.com/50';
                return `<div class="order-item-details"><img src="${productImage}" alt="${productName}"><div>${productName} (Qty: ${item.qty})</div></div>`
            }).join('');
            return `<div class="card"><div class="card-header"><strong>Order ID: ${order.id.substring(0, 6)}...</strong><span class="badge bg-${order.orderStatus === 'New' ? 'warning' : 'success'}">${order.orderStatus}</span></div><div class="card-body"><div class="row gy-3"><div class="col-md-4"><strong>Customer:</strong> ${order.customerName}<br><strong>Phone:</strong> ${order.customerPhone}<br><strong>Date:</strong> ${orderDate}</div><div class="col-md-5"><strong>Address:</strong> ${order.customerAddress}</div><div class="col-md-3"><strong>Total:</strong> ₹${(order.finalPrice || 0).toLocaleString()}<br>${order.trackingId ? `<strong>Tracking:</strong> ${order.trackingId}` : ''}</div></div><hr><h6>Items Ordered</h6>${itemsHTML}</div><div class="card-footer text-end">${order.orderStatus === 'New' ? `<button class="btn btn-primary btn-sm ship-order-btn" data-order-id="${order.id}">Confirm & Ship Order</button>` : `<button class="btn btn-secondary btn-sm" disabled>Shipped</button>`}</div></div>`;
        }).join('');
    }
    
    function renderProductsTable(productsToRender = appState.products) {
        if (!UI.productsList) return;
        if (appState.products.length === 0) {
            UI.productsList.innerHTML = `<div class="alert alert-info">No products found. Click "Add New Product" to start.</div>`;
            return;
        }
        UI.productsList.innerHTML = `<div class="table-responsive"><table class="table table-striped table-hover align-middle"><thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>${productsToRender.map(p => `<tr><td><img src="${(p.images && p.images[0]) || 'https://via.placeholder.com/50'}" width="50" height="50" style="object-fit: cover; border-radius: 4px;"></td><td>${p.name}</td><td>${p.category}</td><td>₹${p.price.toLocaleString()}</td><td>${p.stock}</td><td><button class="btn btn-sm btn-outline-primary edit-product-btn" data-bs-toggle="modal" data-bs-target="#productModal" data-product-id="${p.id}" title="Edit"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger delete-product-btn" data-product-id="${p.id}" title="Delete"><i class="bi bi-trash"></i></button></td></tr>`).join('')}</tbody></table></div>`;
    }

    function renderSettings() {
        const bannerData = appState.siteConfig.live_banner || {};
        if (UI.bannerMessageInput) UI.bannerMessageInput.value = bannerData.message || '';
        if (UI.bannerStyleSelect) UI.bannerStyleSelect.value = bannerData.style || 'info';
        const discountData = appState.siteConfig.discount_codes || {};
        if (UI.discountCodesList) {
            const codesHTML = Object.entries(discountData).map(([code, details]) => `<div class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"><span><code>${code}</code> - ${details.discountPercent}% off</span><button class="btn btn-sm btn-outline-danger delete-discount-btn" data-code="${code}" title="Delete Code">×</button></div>`).join('');
            UI.discountCodesList.innerHTML = codesHTML || '<p class="text-secondary">No active discount codes.</p>';
        }
    }

    // --- 6. EVENT HANDLERS & ACTIONS ---
    const productModalEl = document.getElementById('productModal');
    const productModal = new bootstrap.Modal(productModalEl);
    
    productModalEl.addEventListener('show.bs.modal', (e) => {
        const button = e.relatedTarget;
        const productId = button ? button.getAttribute('data-product-id') : null;
        document.getElementById('product-form').reset();
        document.getElementById('productId').value = productId || '';
        if (productId) {
            document.getElementById('productModalTitle').textContent = 'Edit Product';
            const product = appState.products.find(p => p.id === productId);
            if (product) {
                document.getElementById('productName').value = product.name || '';
                document.getElementById('productPrice').value = product.price || 0;
                document.getElementById('productStock').value = product.stock || 0;
                document.getElementById('productCategory').value = product.category || '';
                document.getElementById('productDescription').value = product.description || '';
                document.getElementById('productImages').value = (product.images || []).join(', ');
                document.getElementById('productSizes').value = (product.sizes || []).join(', '); // Load sizes
            }
        } else {
            document.getElementById('productModalTitle').textContent = 'Add New Product';
        }
    });

    document.getElementById('save-product-btn').addEventListener('click', async () => {
        const productId = document.getElementById('productId').value;
        const sizesString = document.getElementById('productSizes').value;

        const productData = {
            name: document.getElementById('productName').value.trim(),
            price: Number(document.getElementById('productPrice').value),
            stock: Number(document.getElementById('productStock').value),
            category: document.getElementById('productCategory').value,
            description: document.getElementById('productDescription').value.trim(),
            images: document.getElementById('productImages').value.split(',').map(url => url.trim()).filter(url => url),
            sizes: sizesString.split(',').map(s => s.trim().toUpperCase()).filter(s => s), // Process sizes
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (!productData.name || !productData.price || !productData.category) {
            return alert('Name, Price, and Category are required.');
        }

        try {
            if (productId) {
                await db.collection('products').doc(productId).update(productData);
                alert('Product updated successfully!');
            } else {
                productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('products').add(productData);
                alert('Product added successfully!');
            }
            productModal.hide();
            initializeApp();
        } catch (error) {
            console.error("Error saving product: ", error);
            alert("Error saving product.");
        }
    });
    
    UI.productsList.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-product-btn');
        if (deleteBtn) {
            const productId = deleteBtn.dataset.productId;
            if (confirm(`Are you sure you want to delete this product? This cannot be undone.`)) {
                try {
                    await db.collection('products').doc(productId).delete();
                    alert('Product deleted successfully.');
                    initializeApp();
                } catch (error) {
                    console.error("Error deleting product:", error);
                    alert("Failed to delete product.");
                }
            }
        }
    });

    const shippingModalEl = document.getElementById('shippingModal');
    const shippingModal = new bootstrap.Modal(shippingModalEl);
    UI.ordersList.addEventListener('click', e => {
        const shipBtn = e.target.closest('.ship-order-btn');
        if (shipBtn) {
            document.getElementById('shippingOrderId').value = shipBtn.dataset.orderId;
            document.getElementById('trackingId').value = '';
            shippingModal.show();
        }
    });

    document.getElementById('confirm-shipping-btn').addEventListener('click', async () => {
        const orderId = document.getElementById('shippingOrderId').value;
        const trackingId = document.getElementById('trackingId').value.trim();
        if (!trackingId) return alert('Tracking ID is required.');
        
        const confirmBtn = document.getElementById('confirm-shipping-btn');
        const originalText = confirmBtn.innerHTML;
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Sending...`;

        try {
            await db.collection('orders').doc(orderId).update({
                orderStatus: 'Shipped',
                trackingId: trackingId,
                shippedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            const order = appState.orders.find(o => o.id === orderId);
            if (order && order.customerEmail && EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID') {
                const productNames = (order.items || []).map(item => appState.products.find(p => p.id === item.id)?.name || 'an item').join(', ');
                const templateParams = {
                    customer_name: order.customerName,
                    product_name: productNames,
                    tracking_id: trackingId,
                    reply_to: order.customerEmail,
                    order_id: order.id
                };
                
                emailjs.init(EMAILJS_USER_ID);
                await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
                alert('Order marked as shipped and notification sent!');
            } else {
                 alert('Order marked as shipped! (Email notification not sent/configured)');
            }

            shippingModal.hide();
            initializeApp();
        } catch (error) {
            console.error("Error updating order or sending email:", error);
            alert("Error processing shipment.");
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = originalText;
        }
    });
    
    UI.updateBannerBtn.addEventListener('click', async () => {
        const message = UI.bannerMessageInput.value.trim();
        const style = UI.bannerStyleSelect.value;
        if (!message) return alert('Banner message cannot be empty.');

        const bannerData = { isActive: true, message, style, link: '' };

        try {
            await db.collection('site_config').doc('live_banner').set(bannerData);
            alert('Live banner has been activated/updated!');
            appState.siteConfig.live_banner = bannerData;
        } catch (error) {
            console.error("Error updating banner:", error);
            alert("Failed to update banner.");
        }
    });
    
    UI.deactivateBannerBtn.addEventListener('click', async () => {
         try {
            await db.collection('site_config').doc('live_banner').update({ isActive: false });
            alert('Live banner has been deactivated!');
            if (appState.siteConfig.live_banner) appState.siteConfig.live_banner.isActive = false;
        } catch (error) {
            console.error("Error deactivating banner:", error);
            alert("Failed to deactivate banner.");
        }
    });
    
    UI.addDiscountBtn.addEventListener('click', async () => {
        const code = UI.newDiscountCodeInput.value.trim().toUpperCase();
        const percent = Number(UI.newDiscountPercentInput.value);

        if (!code || !percent || percent <= 0 || percent > 100) {
            return alert('Please enter a valid code and a percentage between 1 and 100.');
        }
        
        const updateData = { [`${code}`]: { discountPercent: percent, isActive: true } };
        
        try {
            await db.collection('site_config').doc('discount_codes').set(updateData, { merge: true });
            alert(`Discount code "${code}" added successfully!`);
            UI.newDiscountCodeInput.value = '';
            UI.newDiscountPercentInput.value = '';
            initializeApp();
        } catch(error) {
            console.error("Error adding discount code:", error);
            alert("Failed to add discount code.");
        }
    });
    
    UI.discountCodesList.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-discount-btn');
        if (deleteBtn) {
            const codeToDelete = deleteBtn.dataset.code;
            if (!confirm(`Are you sure you want to delete the code "${codeToDelete}"?`)) return;

            const updateData = { [`${codeToDelete}`]: firebase.firestore.FieldValue.delete() };
            
            try {
                await db.collection('site_config').doc('discount_codes').update(updateData);
                alert(`Code "${codeToDelete}" deleted.`);
                initializeApp();
            } catch(error) {
                console.error("Error deleting discount code:", error);
                alert("Failed to delete discount code.");
            }
        }
    });
    // === PASTE THIS NEW EVENT LISTENER BLOCK ===

// --- Product Search Logic ---
if (UI.productSearchInput) {
    UI.productSearchInput.addEventListener('input', () => {
        const query = UI.productSearchInput.value.trim().toLowerCase();
        if (query === '') {
            // If search is empty, render the full list
            renderProductsTable(appState.products);
            return;
        }
        
        // Filter the products based on the search query
        const filteredProducts = appState.products.filter(product => 
            product.name.toLowerCase().includes(query)
        );

        // Render the table with only the filtered products
        renderProductsTable(filteredProducts);
    });
}

});