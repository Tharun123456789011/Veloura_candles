/**
 * JS Store: State management via LocalStorage
 * Manages Products, Cart, and Orders
 */

// Initial seed products
const defaultProducts = [
    {
        id: 'c_001',
        name: 'Midnight Amber',
        scentFamily: 'Woody',
        price: 299.00,
        image: 'assets/midnight_amber_1773400468662.png',
        description: 'A handmade, deep, resinous blend of rich amber, aged mahogany, and subtle hints of dark vanilla. Perfect for evening relaxation.',
        story: 'Inspired by the quiet solitude of an ancient library at midnight, this scent was crafted to evoke the feeling of old leather-bound books and warm, glowing embers.',
        benefits: 'Promotes deep relaxation, Grounding aroma, Reduces stress',
        purpose: 'Ideal for evening wind-downs, meditation spaces, and cozy reading nooks.',
        stock: 45
    },
    {
        id: 'c_002',
        name: 'Velvet Rose & Oud',
        scentFamily: 'Floral',
        price: 349.00,
        image: 'assets/velvet_rose_1773400484753.png',
        description: 'Handmade with care. Damascus rose infused with smoky oud wood, spiked with clove. A decadent and textured fragrance.',
        story: 'Sourced from the heart of the Middle East, the rare Oud wood used in this candle creates a magnificent, deeply textured contrast against the delicate, velvety petals of the Damascus rose.',
        benefits: 'Elevates mood, luxurious atmosphere, long-lasting scent throw',
        purpose: 'Perfect for romantic evenings, dinner parties, and adding a touch of opulent luxury to any room.',
        stock: 32
    },
    {
        id: 'c_003',
        name: 'Bergamot Noir',
        scentFamily: 'Citrus',
        price: 249.00,
        image: 'assets/bergamot_noir_1773400499263.png',
        description: 'Crisp bergamot tempered by dark vetiver and black pepper. Uniquely refreshing yet mysteriously dark.',
        story: 'A tribute to the rugged Italian coastline at twilight, Bergamot Noir captures the crisp, salty air mingling with the zesty, sun-ripened citrus orchards.',
        benefits: 'Energizing top notes, clears the mind, refreshing ambiance',
        purpose: 'Excellent for home offices, morning routines, and brightening up living spaces during the day.',
        stock: 50
    },
    {
        id: 'c_004',
        name: 'Smoked Fig',
        scentFamily: 'Fruity',
        price: 279.00,
        image: 'assets/smoked_fig_1773400534096.png',
        description: 'Ripe Mediterranean figs dried over a crackling hearth fire, intertwined with cedarwood.',
        story: 'Born from a memory of an autumn harvest festival, this fragrance blends the sticky sweetness of late-season figs with the comforting, smoky scent of crackling bonfires.',
        benefits: 'Comforting aroma, warm and inviting atmosphere, subtle sweetness',
        purpose: 'Best suited for the fall and winter seasons, or creating a welcoming atmosphere for guests.',
        stock: 18
    },
    {
        id: 'c_005',
        name: 'Santal Mystique',
        scentFamily: 'Woody',
        price: 499.00,
        image: 'assets/santal_mystique_1773400550854.png',
        description: 'The ultimate luxury signature. Australian sandalwood, cardamom, papyrus, and leather.',
        story: 'This is our signature masterpiece, blending highly sought-after Australian sandalwood with an exotic heart of spiced cardamom and dry papyrus for a truly intoxicating and sophisticated profile.',
        benefits: 'Sophisticated signature scent, calming properties, intensely aromatic',
        purpose: 'The ultimate statement candle for grand entryways, luxurious master bedrooms, and highly curated spaces.',
        stock: 12
    },
    {
        id: 'c_006',
        name: 'Jasmine Noir',
        scentFamily: 'Floral',
        price: 399.00,
        image: 'assets/jasmine_noir_1773400566663.png',
        description: 'A handmade masterpiece. Night-blooming jasmine paired with patchouli and tonka bean for a sultry, intoxicating aura.',
        story: 'Harvested entirely under the moonlight when the blossoms are most fragrant, this night-blooming jasmine provides a deeply sensual and hypnotic floral experience unlike any daytime bloom.',
        benefits: 'Sensual ambiance, stress relief, intensely floral yet grounded',
        purpose: 'Ideal for intimate settings, relaxing baths, and quiet, reflective evenings.',
        stock: 25
    },
    {
        id: 'c_007',
        name: 'Gilded Vetiver',
        scentFamily: 'Woody',
        price: 359.00,
        image: 'assets/gilded_vetiver_1773402900339.png',
        description: 'Earth-grounding vetiver root steeped with golden tobacco leaves and whispers of frankincense. Distinctly bold.',
        story: 'Poured in our signature matte black vessel emblazoned with gold, this blend traces its roots to volcanic soils, capturing an unapologetically bold, earthy strength.',
        benefits: 'Grounding, masculine energy, deeply complex aroma profile',
        purpose: 'Excellent for study rooms, lounges, and spaces requiring a strong, anchoring presence.',
        stock: 40
    },
    {
        id: 'c_008',
        name: 'Tuberose Blanc',
        scentFamily: 'Floral',
        price: 289.00,
        image: 'assets/tuberose_blanc_1773402930912.png',
        description: 'Luminous white tuberose and gardenia balanced by crisp pear and white woods. Radiantly pure.',
        story: 'Encased in frosted glass to represent the pure, blindingly white petals of the tuberose flower, this scent is a tribute to early spring mornings in a blooming conservatory.',
        benefits: 'Uplifting, clean atmosphere, mood-brightening',
        purpose: 'Perfect for morning rituals, sunrooms, and refreshing living spaces.',
        stock: 55
    },
    {
        id: 'c_009',
        name: 'Cashmere Woods',
        scentFamily: 'Woody',
        price: 319.00,
        image: 'assets/cashmere_woods_1773402963929.png',
        description: 'Soft cashmere musk wrapped around warm cedar and vanilla bean. The ultimate cozy luxury.',
        story: 'Glowing through deep amber glass, this candle was formulated to replicate the feeling of wrapping yourself in a hand-loomed cashmere throw by a dying fire.',
        benefits: 'Supremely comforting, warm, anxiety-reducing',
        purpose: 'Best for crisp evenings, bedrooms, and creating a cabin-like retreat at home.',
        stock: 22
    }
];

class VelouraStore {
    constructor() {
        this.products = [];
        this.cart = [];
        this.orders = [];
        this.init();
    }

    // Initialize application state
    init() {
        // Clear old storage keys manually to prevent any caching issues for the user
        localStorage.removeItem('veloura_products');
        localStorage.removeItem('veloura_products_v2');
        localStorage.removeItem('veloura_products_v3');
        localStorage.removeItem('veloura_products_v4');

        this.loadProducts();
        this.loadCart();
        this.loadOrders();
    }

    // Load or initialize products
    loadProducts() {
        if (!localStorage.getItem('veloura_products_v8')) {
            localStorage.setItem('veloura_products_v8', JSON.stringify(defaultProducts));
        }
        this.products = JSON.parse(localStorage.getItem('veloura_products_v8'));
    }

    // Load or initialize cart
    loadCart() {
        if (!localStorage.getItem('veloura_cart')) {
            localStorage.setItem('veloura_cart', JSON.stringify([]));
        }
        this.cart = JSON.parse(localStorage.getItem('veloura_cart'));
    }

    // Load or initialize orders
    loadOrders() {
        if (!localStorage.getItem('veloura_orders')) {
            localStorage.setItem('veloura_orders', JSON.stringify([]));
        }
        this.orders = JSON.parse(localStorage.getItem('veloura_orders'));
    }

    // --- Products ---
    getProducts() {
        return JSON.parse(localStorage.getItem('veloura_products_v8')) || [];
    }

    getProduct(id) {
        return this.getProducts().find(p => p.id === id);
    }

    // --- Cart ---
    getCart() {
        return JSON.parse(localStorage.getItem('veloura_cart')) || [];
    }

    getCartTotal() {
        return this.getCart().reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartCount() {
        return this.getCart().reduce((count, item) => count + item.quantity, 0);
    }

    addToCart(productId, quantity = 1) {
        const cart = this.getCart();
        const product = this.getProduct(productId);

        if (!product) return false;

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }

        localStorage.setItem('veloura_cart', JSON.stringify(cart));
        this.triggerCartUpdate();
        return true;
    }

    removeFromCart(productId) {
        let cart = this.getCart();
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('veloura_cart', JSON.stringify(cart));
        this.triggerCartUpdate();
    }

    updateCartQuantity(productId, quantity) {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const cart = this.getCart();
        const item = cart.find(i => i.id === productId);

        if (item) {
            item.quantity = quantity;
            localStorage.setItem('veloura_cart', JSON.stringify(cart));
            this.triggerCartUpdate();
        }
    }

    clearCart() {
        localStorage.setItem('veloura_cart', JSON.stringify([]));
        this.triggerCartUpdate();
    }

    // Event system for real-time UI updates across the page
    triggerCartUpdate() {
        const event = new CustomEvent('cartUpdated', { detail: { count: this.getCartCount(), total: this.getCartTotal() } });
        window.dispatchEvent(event);
    }

    // --- Orders ---
    placeOrder(customerInfo, paymentInfo) {
        const cart = this.getCart();
        if (cart.length === 0) return null;

        const orders = JSON.parse(localStorage.getItem('veloura_orders') || '[]');

        const newOrder = {
            orderId: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            date: new Date().toISOString(),
            items: cart,
            total: this.getCartTotal(),
            customer: customerInfo,
            status: 'Pending'
        };

        orders.push(newOrder);
        localStorage.setItem('veloura_orders', JSON.stringify(orders));

        // Decrement stock
        const products = this.getProducts();
        cart.forEach(cartItem => {
            const product = products.find(p => p.id === cartItem.id);
            if (product && product.stock > 0) {
                product.stock -= cartItem.quantity;
            }
        });
        localStorage.setItem('veloura_products_v8', JSON.stringify(products));

        this.clearCart();
        return newOrder.orderId;
    }
}

// Global instance
window.velouraStore = new VelouraStore();

// Helper to format currency
window.formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};
