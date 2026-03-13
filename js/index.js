/**
 * index.js - Landing Page Interactions & Animations
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initHeroCanvas();
    renderFeaturedProducts();
    initScrollAnimations();
    updateCartBadge();
});

// Update cart badge based on global store
function updateCartBadge() {
    const badge = document.getElementById('nav-cart-badge');
    if (badge && window.velouraStore) {
        badge.textContent = window.velouraStore.getCartCount();
    }
}

// Listen for global cart updates
window.addEventListener('cartUpdated', updateCartBadge);

// Scroll Navbar Effect
function initNavbar() {
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

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

    // --- Product Details Modal Setup ---
    function setupProductDetailsModal() {
        const modal = document.getElementById('product-details-modal');
        const btnClose = document.getElementById('btn-close-details');
        const btnAddCart = document.getElementById('detail-add-cart');

        let currentProductId = null;

        if (!modal) return;

        const closeModal = () => {
            const modalBox = modal.querySelector('.modal-box');
            modalBox.classList.replace('slide-up', 'slide-down');
            setTimeout(() => {
                modal.style.display = 'none';
                modalBox.classList.replace('slide-down', 'slide-up');
                document.body.style.overflow = 'auto';
            }, 300);
        };

        if (btnClose) btnClose.addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Add to cart from modal
        if (btnAddCart) {
            btnAddCart.addEventListener('click', () => {
                const id = btnAddCart.dataset.currentId;
                if (id && window.velouraStore) {
                    window.velouraStore.addToCart(id, 1);
                    showToast('Added to cart');
                    closeModal();
                }
            });
        }
    }

    setupProductDetailsModal();
}

// Global modal open function for index page
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

    const addCartBtn = document.getElementById('detail-add-cart');
    if (addCartBtn) {
        addCartBtn.dataset.currentId = product.id;
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Render Featured Products (first 3 from store)
function renderFeaturedProducts() {
    const container = document.getElementById('featured-products');
    const featuredProductsContainer = document.getElementById('featured-products');
    if (!featuredProductsContainer || !window.velouraStore) return;

    const allProducts = window.velouraStore.getProducts();

    if (allProducts.length === 0) {
        featuredProductsContainer.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No products found.</p>';
        return;
    }

    // Clear existing content
    featuredProductsContainer.innerHTML = '';

    // Render up to 3 for featured
    const featuredList = allProducts.slice(0, 3);

    featuredList.forEach((product, index) => {
        const delay = (index + 2) * 0.2;
        const card = document.createElement('div');
        card.className = `product-card fade-in-scroll`;
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
                <div style="position: absolute; width: 100%; height: 100%; background: linear-gradient(to bottom, #2a2a2a, #111); z-index: 0;"></div>
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.style.display='none'" style="position: relative; z-index: 1;">
            </div>
            <div class="product-info">
                <div class="product-family">${product.scentFamily}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${window.formatCurrency(product.price)}</div>
                ${product.stock > 0
                ? `<button class="btn-add-cart" data-id="${product.id}">Add to Cart</button>`
                : `<button class="btn-add-cart" disabled style="opacity: 0.5; cursor: not-allowed; border-color: transparent;">Out of Stock</button>`
            }
            </div>
        `;
        featuredProductsContainer.appendChild(card);
    });

    // Event delegation for "Add to Cart" buttons
    featuredProductsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add-cart')) {
            const id = e.target.getAttribute('data-id');
            if (window.velouraStore) {
                window.velouraStore.addToCart(id, 1);
                showToast('Added to cart');
            }
        }
    });

    // We don't need the global simple addToCart function anymore as we'll use the modal/event delegation
};

// Scroll reveal animations
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in-scroll');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 1s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// Emulate a cinematic particle / light mote effect on canvas for hero
function initHeroCanvas() {
    const canvas = document.getElementById('candleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.1;
            this.speedY = Math.random() * -0.5 - 0.1;
            this.speedX = Math.random() * 0.4 - 0.2;

            // Gold / Ember colors
            const colors = ['rgba(212, 175, 55, ', 'rgba(255, 223, 115, ', 'rgba(255, 140, 0, '];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.5 + 0.1;

            // Flicker logic
            this.flickerSpeed = Math.random() * 0.05 + 0.01;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;

            // Gentle wave
            this.x += Math.sin(this.y * 0.01) * 0.5;

            // Flicker opacity
            this.opacity += Math.sin(Date.now() * this.flickerSpeed) * 0.02;
            if (this.opacity < 0.1) this.opacity = 0.1;
            if (this.opacity > 0.8) this.opacity = 0.8;

            // Reset if out of bounds
            if (this.y < 0) {
                this.y = canvas.height;
                this.x = Math.random() * canvas.width;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const numParticles = Math.min(window.innerWidth / 10, 100);
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    initParticles();
    animate();
}
