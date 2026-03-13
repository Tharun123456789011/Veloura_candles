/**
 * checkout.js - Checkout process, cart rendering on checkout page, order submission
 */

document.addEventListener('DOMContentLoaded', () => {
    initCheckout();
});

function initCheckout() {
    if (!window.velouraStore) {
        console.error("Store not initialized");
        return;
    }

    // Render the initial checkout view
    renderCheckoutLayout();

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
}

function renderCheckoutLayout() {
    const container = document.getElementById('checkout-container');
    if (!container) return;

    const cart = window.velouraStore.getCart();

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart fade-in">
                <i class="fa-solid fa-cart-shopping"></i>
                <h2>Your Cart is Empty</h2>
                <p>Discover our signature fragrances and elevate your space.</p>
                <a href="shop.html" class="btn btn-primary">Explore Collection</a>
            </div>
        `;
        return;
    }

    // Calculate totals
    const subtotal = window.velouraStore.getCartTotal();
    const shipping = 50.00; // Flat rate INR
    const taxes = subtotal * 0.18; // 18% GST placeholder
    const total = subtotal + shipping + taxes;

    container.innerHTML = `
        <div class="checkout-grid fade-in">
            <!-- Forms -->
            <div class="checkout-form-container">
                <form id="checkout-form" onsubmit="handleCheckoutSubmit(event)">
                    
                    <!-- Contact Info -->
                    <section class="checkout-form-section">
                        <h2 class="section-title"><i class="fa-regular fa-envelope"></i> Contact</h2>
                        <div class="form-group">
                            <label class="form-label">Email Address</label>
                            <input type="email" class="form-input" id="email" required placeholder="you@example.com">
                        </div>
                    </section>
                    
                    <!-- Shipping Info -->
                    <section class="checkout-form-section">
                        <h2 class="section-title"><i class="fa-solid fa-truck-fast"></i> Shipping Address</h2>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">First Name</label>
                                <input type="text" class="form-input" id="firstName" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Last Name</label>
                                <input type="text" class="form-input" id="lastName" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Address</label>
                            <input type="text" class="form-input" id="address" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Apartment, suite, etc. (optional)</label>
                            <input type="text" class="form-input" id="address2">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">City</label>
                                <input type="text" class="form-input" id="city" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">State</label>
                                <input type="text" class="form-input" id="state" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">ZIP Code</label>
                                <input type="text" class="form-input" id="zip" required>
                            </div>
                        </div>
                    </section>
                    
                    <!-- Payment Info (MOCK) -->
                    <section class="checkout-form-section">
                        <h2 class="section-title"><i class="fa-regular fa-credit-card"></i> Payment</h2>
                        <div class="form-group card-input-wrapper">
                            <label class="form-label">Card Number</label>
                            <input type="text" class="form-input" placeholder="0000 0000 0000 0000" required maxlength="19" onkeyup="formatCard(this)">
                            <i class="fa-brands fa-cc-mastercard card-icon"></i>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Expiration (MM/YY)</label>
                                <input type="text" class="form-input" placeholder="MM/YY" required maxlength="5" onkeyup="formatExpiry(this)">
                            </div>
                            <div class="form-group">
                                <label class="form-label">CVV</label>
                                <input type="text" class="form-input" placeholder="123" required maxlength="4">
                            </div>
                        </div>
                    </section>
                    
                    <!-- Desktop button hidden in mobile order, shown under summary -->
                    <button type="submit" class="btn btn-primary btn-checkout" id="submit-order-btn">
                        <i class="fa-solid fa-lock" style="margin-right: 10px;"></i> Pay ${window.formatCurrency(total)}
                    </button>
                    
                </form>
            </div>
            
            <!-- Order Summary Sidebar -->
            <aside class="order-summary">
                <h3 class="summary-title">Order Summary</h3>
                <div class="cart-items-list" id="cart-items-list">
                    ${renderCartItemsHTML(cart)}
                </div>
                
                <div class="summary-totals">
                    <div class="total-row">
                        <span>Subtotal</span>
                        <span>${window.formatCurrency(subtotal)}</span>
                    </div>
                    <div class="total-row">
                        <span>Shipping</span>
                        <span>${window.formatCurrency(shipping)}</span>
                    </div>
                    <div class="total-row">
                        <span>Estimated Taxes</span>
                        <span>${window.formatCurrency(taxes)}</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>Total</span>
                        <span>${window.formatCurrency(total)}</span>
                    </div>
                </div>
            </aside>
        </div>
    `;
}

function renderCartItemsHTML(cart) {
    return cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\'><rect width=\\'100\\' height=\\'100\\' fill=\\'%23111\\'/></svg>'">
            <div class="cart-item-details">
                <div style="display: flex; justify-content: space-between;">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <button class="item-remove" onclick="removeItem('${item.id}')" title="Remove"><i class="fa-solid fa-times"></i></button>
                </div>
                <div class="cart-item-price">${window.formatCurrency(item.price)}</div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQty('${item.id}', ${item.quantity - 1})"><i class="fa-solid fa-minus"></i></button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQty('${item.id}', ${item.quantity + 1})"><i class="fa-solid fa-plus"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

// Global actions for cart
window.updateQty = function (id, qty) {
    if (!window.velouraStore) return;
    window.velouraStore.updateCartQuantity(id, qty);
    renderCheckoutLayout(); // Re-render to update totals
};

window.removeItem = function (id) {
    if (!window.velouraStore) return;
    window.velouraStore.removeFromCart(id);
    renderCheckoutLayout();
};

window.handleCheckoutSubmit = function (e) {
    e.preventDefault();

    const btn = document.getElementById('submit-order-btn');
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;
    }

    // Gather info
    const customerInfo = {
        email: document.getElementById('email').value,
        name: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
        address: `${document.getElementById('address').value}, ${document.getElementById('city').value}, ${document.getElementById('state').value} ${document.getElementById('zip').value}`
    };

    // Simulate API delay
    setTimeout(() => {
        // Place order in store.js
        const orderId = window.velouraStore.placeOrder(customerInfo, 'Credit Card ending in 1234');

        if (orderId) {
            showConfirmation(orderId);
        } else {
            alert('Error processing order. Your cart might be empty.');
            if (btn) {
                btn.innerHTML = 'Try Again';
                btn.disabled = false;
            }
        }
    }, 1500);
};

function showConfirmation(orderId) {
    const mainView = document.getElementById('checkout-container');
    const confView = document.getElementById('confirmation-view');
    const displayId = document.getElementById('order-id-display');

    if (mainView) mainView.style.display = 'none';
    if (displayId) displayId.textContent = orderId;
    if (confView) {
        confView.style.display = 'flex';
        // Confetti effect could go here
    }
}

// Input Formatters
window.formatCard = function (input) {
    let val = input.value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < val.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formatted += ' ';
        }
        formatted += val[i];
    }
    input.value = formatted;
};

window.formatExpiry = function (input) {
    let val = input.value.replace(/\D/g, '');
    if (val.length > 2) {
        input.value = val.substring(0, 2) + '/' + val.substring(2, 4);
    } else {
        input.value = val;
    }
};
