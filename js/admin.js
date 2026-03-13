/**
 * admin.js - Admin dashboard logic (login, CRUD products, view orders)
 */

document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
});

function initAdmin() {
    // Auth Check
    const isLoggedIn = sessionStorage.getItem('veloura_admin_logged_in') === 'true';
    if (isLoggedIn) {
        showDashboard();
    } else {
        setupLogin();
    }
}

function setupLogin() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const pw = document.getElementById('admin-password').value;
        if (pw === 'veloura2024') {
            sessionStorage.setItem('veloura_admin_logged_in', 'true');
            showDashboard();
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    });
}

function showDashboard() {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('dashboard-container').style.display = 'flex';

    setupTabs();
    setupModals();
    setupImageUpload();

    // Load initial data
    loadOverview();
    loadProducts();
    loadOrders();

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        sessionStorage.removeItem('veloura_admin_logged_in');
        window.location.reload();
    });
}

function setupTabs() {
    const links = document.querySelectorAll('.admin-nav-link');
    const contents = document.querySelectorAll('.tab-content');
    const pageTitle = document.getElementById('page-title');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active
            links.forEach(l => l.classList.remove('active'));
            contents.forEach(c => c.style.display = 'none');

            // Set active
            const targetId = link.getAttribute('data-tab');
            link.classList.add('active');
            document.getElementById(`tab-${targetId}`).style.display = 'block';

            // Update title
            pageTitle.textContent = link.textContent.trim();

            // Refresh data when switching tabs to ensure freshness
            if (targetId === 'overview') loadOverview();
            if (targetId === 'products') loadProducts();
            if (targetId === 'orders') loadOrders();
        });
    });
}

// --- Data Loading --- //

function loadOverview() {
    if (!window.velouraStore) return;

    const orders = JSON.parse(localStorage.getItem('veloura_orders') || '[]');
    const products = window.velouraStore.getProducts();

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    document.getElementById('stat-revenue').textContent = window.formatCurrency(totalRevenue);
    document.getElementById('stat-orders').textContent = orders.length;
    document.getElementById('stat-products').textContent = products.length;
}

function loadProducts() {
    if (!window.velouraStore) return;

    const products = window.velouraStore.getProducts();
    const tbody = document.getElementById('products-table-body');

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <div class="product-cell">
                    <img src="${product.image}" class="product-thumb" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'40\\' height=\\'40\\'><rect width=\\'40\\' height=\\'40\\' fill=\\'%23111\\'/></svg>'">
                    <strong>${product.name}</strong>
                </div>
            </td>
            <td>${product.scentFamily}</td>
            <td>${window.formatCurrency(product.price)}</td>
            <td>
                <span style="color: ${product.stock > 10 ? 'inherit' : product.stock > 0 ? 'orange' : 'red'}; font-weight: 500;">
                    ${product.stock}
                </span>
            </td>
            <td>
                <button class="action-btn" onclick="editProduct('${product.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn delete" onclick="deleteProduct('${product.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('veloura_orders') || '[]');
    const tbody = document.getElementById('orders-table-body');

    // Sort by date descending
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No orders yet.</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const date = new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

        let statusClass = 'status-pending';
        if (order.status === 'Shipped') statusClass = 'status-shipped';
        if (order.status === 'Delivered') statusClass = 'status-delivered';

        return `
            <tr>
                <td><strong>${order.orderId}</strong></td>
                <td>${date}</td>
                <td>
                    <div style="font-size: 0.9rem;">${order.customer.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${order.customer.email}</div>
                </td>
                <td>${window.formatCurrency(order.total)} <span style="font-size: 0.8rem; color: var(--text-muted);">(${itemsCount} items)</span></td>
                <td><span class="status-badge ${statusClass}">${order.status}</span></td>
                <td>
                    <button class="action-btn" onclick="viewOrder('${order.orderId}')" title="View Details"><i class="fa-solid fa-eye"></i></button>
                    ${order.status !== 'Delivered' ?
                `<button class="action-btn" onclick="updateOrderStatus('${order.orderId}')" title="Mark Next Status"><i class="fa-solid fa-truck"></i></button>`
                : ''
            }
                </td>
            </tr>
        `;
    }).join('');
}

// --- Product Management --- //

function setupModals() {
    // Product Modal
    const productModal = document.getElementById('product-modal');
    document.getElementById('btn-add-product').addEventListener('click', () => {
        resetProductForm();
        document.getElementById('modal-title').textContent = 'Add New Product';
        productModal.style.display = 'flex';
    });

    document.getElementById('btn-close-modal').addEventListener('click', () => productModal.style.display = 'none');
    document.getElementById('btn-cancel-modal').addEventListener('click', () => productModal.style.display = 'none');

    // Save Product Handlers
    document.getElementById('product-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProduct();
        productModal.style.display = 'none';
    });

    // Order Modal
    const orderModal = document.getElementById('order-modal');
    document.getElementById('btn-close-order-modal').addEventListener('click', () => orderModal.style.display = 'none');
}

function setupImageUpload() {
    const area = document.getElementById('image-upload-area');
    const fileInput = document.getElementById('product-image');
    const preview = document.getElementById('image-preview');
    const placeholder = document.getElementById('upload-placeholder');
    const dataInput = document.getElementById('product-image-data');

    area.addEventListener('click', () => fileInput.click());

    area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.style.borderColor = 'var(--gold)';
    });

    area.addEventListener('dragleave', () => {
        area.style.borderColor = '';
    });

    area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.style.borderColor = '';
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            preview.src = dataUrl;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
            dataInput.value = dataUrl;
        };
        reader.readAsDataURL(file);
    }
}

function resetProductForm() {
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('upload-placeholder').style.display = 'flex';
    document.getElementById('product-image-data').value = '';
}

window.editProduct = function (id) {
    const product = window.velouraStore.getProduct(id);
    if (!product) return;

    document.getElementById('modal-title').textContent = 'Edit Product';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-scent').value = product.scentFamily;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-desc').value = product.description;

    if (product.image) {
        document.getElementById('image-preview').src = product.image;
        document.getElementById('image-preview').style.display = 'block';
        document.getElementById('upload-placeholder').style.display = 'none';
        document.getElementById('product-image-data').value = product.image;
    }

    document.getElementById('product-modal').style.display = 'flex';
};

function saveProduct() {
    const id = document.getElementById('product-id').value;

    // Provide a fallback placeholder if no image uploaded
    let imageUrl = document.getElementById('product-image-data').value;
    if (!imageUrl) {
        // Fallback default silhouette or data url
        imageUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%231a1a1a"/><text x="50%" y="50%" fill="%23d4af37" font-size="24" text-anchor="middle" font-family="sans-serif">VELOURA</text></svg>';
    }

    const newProduct = {
        id: id || 'c_' + Date.now(), // Generate ID if new
        name: document.getElementById('product-name').value,
        scentFamily: document.getElementById('product-scent').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        description: document.getElementById('product-desc').value,
        image: imageUrl
    };

    let products = window.velouraStore.getProducts();

    if (id) {
        // Update
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = newProduct;
        }
    } else {
        // Add
        products.push(newProduct);
    }

    localStorage.setItem('veloura_products', JSON.stringify(products));
    loadProducts();
}

window.deleteProduct = function (id) {
    if (confirm('Are you sure you want to delete this product?')) {
        let products = window.velouraStore.getProducts();
        products = products.filter(p => p.id !== id);
        localStorage.setItem('veloura_products', JSON.stringify(products));
        loadProducts();
    }
};

// --- Order Management --- //

window.viewOrder = function (orderId) {
    const orders = JSON.parse(localStorage.getItem('veloura_orders') || '[]');
    const order = orders.find(o => o.orderId === orderId);

    if (!order) return;

    const content = document.getElementById('order-details-content');
    const date = new Date(order.date).toLocaleString();

    let itemsHtml = order.items.map(item => `
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-light); padding: 0.5rem 0; font-size: 0.9rem;">
            <span>${item.quantity}x ${item.name}</span>
            <span>${window.formatCurrency(item.price * item.quantity)}</span>
        </div>
    `).join('');

    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div>
                <h4 style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Customer info</h4>
                <p><strong>${order.customer.name}</strong></p>
                <p>${order.customer.email}</p>
                <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-muted);">${order.customer.address}</p>
            </div>
            <div>
                <h4 style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Order info</h4>
                <p><strong>ID:</strong> ${order.orderId}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Status:</strong> <span style="color: ${order.status === 'Pending' ? 'orange' : 'limegreen'};">${order.status}</span></p>
            </div>
        </div>
        
        <div>
            <h4 style="margin-bottom: 1rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">Items</h4>
            ${itemsHtml}
            <div style="display: flex; justify-content: space-between; padding-top: 1rem; font-weight: bold; font-size: 1.2rem; margin-top: 1rem; border-top: 1px solid var(--border-color);">
                <span>Total</span>
                <span class="text-gold">${window.formatCurrency(order.total)}</span>
            </div>
        </div>
    `;

    document.getElementById('order-modal').style.display = 'flex';
};

window.updateOrderStatus = function (orderId) {
    const orders = JSON.parse(localStorage.getItem('veloura_orders') || '[]');
    const order = orders.find(o => o.orderId === orderId);

    if (!order) return;

    if (order.status === 'Pending') {
        order.status = 'Shipped';
    } else if (order.status === 'Shipped') {
        order.status = 'Delivered';
    }

    localStorage.setItem('veloura_orders', JSON.stringify(orders));
    loadOrders();
};
