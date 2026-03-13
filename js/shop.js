/**
 * shop.js - Shop Page Interactions (Filtering, Sorting, Rendering)
 */

document.addEventListener('DOMContentLoaded', () => {
    initShop();
});

let currentProducts = [];
let activeFilters = new Set();
let currentSort = 'featured';

function initShop() {
    if (!window.velouraStore) {
        console.error("Store not initialized");
        return;
    }

    currentProducts = window.velouraStore.getProducts();

    populateFilters();
    bindEvents();
    renderProducts();
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.getElementById('nav-cart-badge');
    if (badge && window.velouraStore) {
        badge.textContent = window.velouraStore.getCartCount();
    }
}

window.addEventListener('cartUpdated', updateCartBadge);

function populateFilters() {
    const filterContainer = document.getElementById('scent-filters');
    if (!filterContainer) return;

    // Extract unique scent families
    const scents = [...new Set(window.velouraStore.getProducts().map(p => p.scentFamily))].sort();

    // Build HTML (keeping the 'all' option from HTML)
    let html = `<li><label><input type="checkbox" value="all" checked class="filter-cb"> All Scents</label></li>`;

    scents.forEach(scent => {
        html += `<li><label><input type="checkbox" value="${scent}" class="filter-cb"> ${scent}</label></li>`;
    });

    filterContainer.innerHTML = html;
}

function bindEvents() {
    // Filter Events
    const filterContainer = document.getElementById('scent-filters');
    if (filterContainer) {
        filterContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('filter-cb')) {
                handleFilterChange(e.target);
            }
        });
    }

    // --- Product Details Modal ---
    function setupProductDetailsModal() {
        const modal = document.getElementById('product-details-modal');
        const btnClose = document.getElementById('btn-close-details');
        const btnAddCart = document.getElementById('detail-add-cart');

        let currentProductId = null;

        if (!modal) return;

        // Close logic
        const closeModal = () => {
            const modalBox = modal.querySelector('.modal-box');
            modalBox.classList.replace('slide-up', 'slide-down');
            setTimeout(() => {
                modal.style.display = 'none';
                modalBox.classList.replace('slide-down', 'slide-up');
                document.body.style.overflow = 'auto';
            }, 300);
        };

        btnClose.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Add to cart from modal
        if (btnAddCart) {
            btnAddCart.addEventListener('click', () => {
                if (currentProductId && window.velouraStore) {
                    window.velouraStore.addToCart(currentProductId, 1);
                    showToast('Added to cart');
                    closeModal();
                }
            });
        }
    }

    // Call it
    setupProductDetailsModal();

    // Setup mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-xmark');
            } else {
                icon.classList.replace('fa-xmark', 'fa-bars');
            }
        });
    }

    // Sort Events
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderProducts();
        });
    }
}

function handleFilterChange(checkbox) {
    const value = checkbox.value;
    const allCheckbox = document.querySelector('.filter-cb[value="all"]');
    const otherCheckboxes = document.querySelectorAll('.filter-cb:not([value="all"])');

    if (value === 'all') {
        if (checkbox.checked) {
            activeFilters.clear();
            otherCheckboxes.forEach(cb => cb.checked = false);
        } else {
            // Can't uncheck "all" directly if nothing else is checked, keep it checked
            checkbox.checked = true;
        }
    } else {
        if (checkbox.checked) {
            activeFilters.add(value);
            if (allCheckbox) allCheckbox.checked = false;
        } else {
            activeFilters.delete(value);
            // If no filters are active, re-check "all"
            if (activeFilters.size === 0 && allCheckbox) {
                allCheckbox.checked = true;
            }
        }
    }

    renderProducts();
}

function getFilteredAndSortedProducts() {
    let result = [...window.velouraStore.getProducts()];

    // Filter
    if (activeFilters.size > 0) {
        result = result.filter(p => activeFilters.has(p.scentFamily));
    }

    // Sort
    switch (currentSort) {
        case 'price-low':
            result.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            result.sort((a, b) => b.price - a.price);
            break;
        case 'name-a':
            result.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'featured':
        default:
            // "Featured" relies on original array order, which is fine
            break;
    }

    return result;
}

function renderProducts() {
    const productGrid = document.getElementById('product-grid');
    const countDisplay = document.getElementById('product-count');

    if (!productGrid) return;

    const productsToRender = getFilteredAndSortedProducts();

    // Update count
    if (countDisplay) {
        countDisplay.textContent = `Showing ${productsToRender.length} product${productsToRender.length !== 1 ? 's' : ''}`;
    }

    // Render function
    function renderProductCards(productsToRender) {
        if (!productGrid) return;

        productGrid.innerHTML = '';

        if (productsToRender.length === 0) {
            productGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 4rem 0; color: var(--text-muted);"><i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i><p>No products found matching your criteria.</p></div>';
            return;
        }

        productsToRender.forEach((product, index) => {
            const delay = (index % 6) * 0.1;
            const card = document.createElement('div');
            card.className = `product-card fade-in`;
            card.style.animationDelay = `${delay}s`;

            // Add click listener to the entire card
            card.addEventListener('click', (e) => {
                // Ignore clicks on Add to Cart button
                if (e.target.closest('.btn-add-cart')) return;

                openProductDetails(product);
            });
            card.style.cursor = 'pointer';

            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                </div>
                <div class="product-info">
                    <div class="product-family">${product.scentFamily}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">${window.formatCurrency(product.price)}</div>
                    <button class="btn-add-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            `;
            productGrid.appendChild(card);
        });

        // Attach add to cart listeners
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                if (window.velouraStore) {
                    window.velouraStore.addToCart(id, 1);
                    showToast('Added to cart');
                }
            });
        });
    }
    renderProductCards(productsToRender);
}

// Function to open details modal
function openProductDetails(product) {
    const modal = document.getElementById('product-details-modal');
    if (!modal) return;

    document.getElementById('detail-image').src = product.image;
    document.getElementById('detail-family').textContent = product.scentFamily;
    document.getElementById('detail-title').textContent = product.name;
    document.getElementById('detail-price').textContent = window.formatCurrency(product.price);

    document.getElementById('detail-story').textContent = product.story || product.description;
    document.getElementById('detail-benefits').textContent = product.benefits || 'No specific benefits listed.';
    document.getElementById('detail-purpose').textContent = product.purpose || 'For atmospheric illumination.';

    // Store ID for the add to cart button inside the modal
    const addCartBtn = document.getElementById('detail-add-cart');
    if (addCartBtn) {
        // Need to hackily store it on the setup function scope using a dataset
        addCartBtn.dataset.currentId = product.id;
    }

    // Let's redefine the add to cart logic here just to be safe
    addCartBtn.onclick = function () {
        if (window.velouraStore) {
            window.velouraStore.addToCart(product.id, 1);
            showToast('Added to cart');

            // Close modal
            const modalBox = modal.querySelector('.modal-box');
            modalBox.classList.replace('slide-up', 'slide-down');
            setTimeout(() => {
                modal.style.display = 'none';
                modalBox.classList.replace('slide-down', 'slide-up');
                document.body.style.overflow = 'auto';
            }, 300);
        }
    };

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

window.resetFilters = function () {
    activeFilters.clear();
    const allCheckbox = document.querySelector('.filter-cb[value="all"]');
    const otherCheckboxes = document.querySelectorAll('.filter-cb:not([value="all"])');

    if (allCheckbox) allCheckbox.checked = true;
    otherCheckboxes.forEach(cb => cb.checked = false);

    renderProducts();
};

window.addToCart = function (productId) {
    if (!window.velouraStore) return;

    const product = window.velouraStore.getProduct(productId);
    if (!product) return;

    const success = window.velouraStore.addToCart(productId, 1);

    if (success) {
        showToast(product.name);
    }
};

function showToast(productName) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fa-solid fa-check-circle toast-icon"></i>
        <span><strong>${productName}</strong> added to cart</span>
    `;

    container.appendChild(toast);

    // Remove toast after a few seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300); // Matches CSS transition
    }, 3000);
}
