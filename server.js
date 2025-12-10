import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve Static Frontend Files from the 'dist' folder created by 'npm run build'
app.use(express.static(path.join(__dirname, 'dist')));

// --- IN-MEMORY DATABASE (MOCK DATA) ---

const generateMockProducts = () => {
    const products = [];
    
    const generateReviews = () => {
        const reviewsData = [
            { c: "Absolutely amazing! Worth every penny.", r: 5 },
            { c: "Good product, but delivery was slow.", r: 4 },
            { c: "Not as expected. Quality could be better.", r: 2 },
            { c: "Perfect for my needs. Highly recommended!", r: 5 },
            { c: "Decent quality for the price.", r: 3 },
            { c: "Loved the design and build quality.", r: 5 },
            { c: "Packaging was damaged, but product is fine.", r: 4 },
            { c: "Worst experience. Don't buy.", r: 1 },
            { c: "Great value for money.", r: 5 },
            { c: "Just okay.", r: 3 }
        ];
        const users = ["Rahul K.", "Priya S.", "Amit M.", "Sneha G.", "Vikram R.", "Anjali D.", "Rohit V.", "Kavita P."];
        
        const numReviews = Math.floor(Math.random() * 6) + 2; 
        const generated = [];
        
        for(let i=0; i<numReviews; i++) {
            const data = reviewsData[Math.floor(Math.random() * reviewsData.length)];
            const user = users[Math.floor(Math.random() * users.length)];
            generated.push({
                id: `rev-${Math.random().toString(36).substr(2, 9)}`,
                userId: `u-${Math.random().toString(36).substr(2, 9)}`,
                userName: user,
                rating: data.r,
                comment: data.c,
                date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString(),
                likes: Math.floor(Math.random() * 50),
                isCertified: Math.random() > 0.4
            });
        }
        return generated;
    };

    // Helper to ensure at least 4 colors
    const ensureFourColors = (colors = []) => {
        const defaults = ["Black", "White", "Blue", "Red", "Silver", "Grey", "Gold", "Green"];
        const result = [...colors];
        const set = new Set(result);
        
        for (const c of defaults) {
            if (set.size >= 4) break;
            if (!set.has(c)) {
                result.push(c);
                set.add(c);
            }
        }
        return result;
    };

    const create = (category, title, price, originalPrice, image, brand, colors = [], sizes = []) => {
        // Deterministic ID for persistence across restarts based on title hash
        const id = 'p-' + title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
        const reviews = generateReviews();
        // Calculate dynamic average rating based on reviews
        const avgRating = reviews.length > 0 
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
            : 4.5;

        const finalColors = ensureFourColors(colors);

        return {
            id,
            title,
            description: `Experience the best of ${brand} with the ${title}. Featuring premium build quality, advanced features, and stylish design. Perfect for your daily needs.`,
            price,
            originalPrice,
            category,
            image,
            images: [image, image, image, image],
            rating: parseFloat(avgRating.toFixed(1)),
            reviewsCount: Math.floor(Math.random() * 100) + reviews.length,
            reviews: reviews,
            trending: Math.random() > 0.7,
            brand,
            colors: finalColors,
            sizes,
            isCustom: false
        };
    };

    // 1. MOBILES
    const mobiles = [
        { t: "Apple iPhone 15 (Black, 128 GB)", p: 72999, op: 79900, b: "Apple", i: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80", c: ["Black", "Blue", "Green", "Pink"] },
        { t: "Apple iPhone 15 Pro Max (Natural Titanium, 256 GB)", p: 156900, op: 159900, b: "Apple", i: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=400&q=80", c: ["Natural Titanium", "Blue Titanium"] },
        { t: "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256 GB)", p: 129999, op: 134999, b: "Samsung", i: "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?auto=format&fit=crop&w=400&q=80", c: ["Titanium Gray", "Black"] },
        { t: "Realme 12 Pro+ 5G (Submarine Blue, 256 GB)", p: 29999, op: 34999, b: "Realme", i: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=400&q=80", c: ["Submarine Blue", "Navigator Beige"] },
        { t: "Google Pixel 8 Pro (Obsidian, 128 GB)", p: 98999, op: 106999, b: "Google", i: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80", c: ["Obsidian", "Porcelain"] },
        { t: "OnePlus 12 (Flowy Emerald, 512 GB)", p: 69999, op: 69999, b: "OnePlus", i: "https://images.unsplash.com/photo-1661237427977-33d3ed752a94?auto=format&fit=crop&w=400&q=80", c: ["Flowy Emerald", "Silky Black"] },
        { t: "Nothing Phone (2a) 5G (Black, 128 GB)", p: 23999, op: 27999, b: "Nothing", i: "https://images.unsplash.com/photo-1692620359197-43763772244f?auto=format&fit=crop&w=400&q=80", c: ["Black", "White"] },
        { t: "Xiaomi 14 (Jade Green, 512 GB)", p: 69999, op: 79999, b: "Xiaomi", i: "https://images.unsplash.com/photo-1592436129527-294c7076334d?auto=format&fit=crop&w=400&q=80", c: ["Jade Green", "Matte Black"] },
        { t: "Samsung Galaxy Z Flip 5 (Mint, 256 GB)", p: 89999, op: 99999, b: "Samsung", i: "https://images.unsplash.com/photo-1657182642707-2b2433493406?auto=format&fit=crop&w=400&q=80", c: ["Mint", "Cream"] },
        { t: "POCO X6 Pro 5G (Yellow, 256 GB)", p: 25999, op: 30999, b: "POCO", i: "https://images.unsplash.com/photo-1574628379319-12be6a42489e?auto=format&fit=crop&w=400&q=80", c: ["Yellow", "Black"] }
    ];
    mobiles.forEach(m => products.push(create("Mobiles", m.t, m.p, m.op, m.i, m.b, m.c)));

    // 2. ELECTRONICS
    const electronics = [
        { t: "Apple MacBook Air M2 (Starlight, 256 GB)", p: 92990, op: 114900, b: "Apple", i: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80", c: ["Starlight", "Midnight"] },
        { t: "Sony WH-1000XM5 Headphones", p: 26990, op: 34990, b: "Sony", i: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80", c: ["Black", "Silver"] },
        { t: "Dell XPS 13 Plus Laptop", p: 164990, op: 190000, b: "Dell", i: "https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&w=400&q=80", c: ["Platinum", "Graphite"] },
        { t: "HP Pavilion 15", p: 62990, op: 75000, b: "HP", i: "https://images.unsplash.com/photo-1588872657578-a3d827a4507d?auto=format&fit=crop&w=400&q=80", c: ["Silver", "Gold"] },
        { t: "Apple iPad Air 5th Gen", p: 54900, op: 59900, b: "Apple", i: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80", c: ["Blue", "Purple"] },
        { t: "Canon EOS 1500D DSLR", p: 41990, op: 47995, b: "Canon", i: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80", c: ["Black"] },
        { t: "JBL Flip 6 Speaker", p: 9999, op: 13999, b: "JBL", i: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=400&q=80", c: ["Blue", "Red"] }
    ];
    electronics.forEach(e => products.push(create("Electronics", e.t, e.p, e.op, e.i, e.b, e.c)));

    // 3. FASHION
    const fashion = [
        { t: "Nike Air Max 270", p: 11495, op: 14995, b: "Nike", i: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80", c: ["Red", "Black"] },
        { t: "Puma Men White Sneakers", p: 3499, op: 6999, b: "Puma", i: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=400&q=80", c: ["White"] },
        { t: "Adidas Ultraboost Light", p: 14999, op: 18999, b: "Adidas", i: "https://images.unsplash.com/photo-1587563871167-1ee7c7358bcc?auto=format&fit=crop&w=400&q=80", c: ["Black", "White"] },
        { t: "Levi's Men Slim Jeans", p: 2199, op: 3599, b: "Levis", i: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&w=400&q=80", c: ["Blue"] },
        { t: "Ray-Ban Aviator", p: 6590, op: 8990, b: "Ray-Ban", i: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=80", c: ["Gold", "Black"] },
        { t: "Zara Woman Floral Dress", p: 2990, op: 3990, b: "Zara", i: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=400&q=80", c: ["Floral"] }
    ];
    fashion.forEach(f => {
        let sizes = [];
        const t = f.t.toLowerCase();
        if (t.includes('shoe') || t.includes('sneaker') || t.includes('boot')) {
            sizes = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'];
        } else if (t.includes('jeans') || t.includes('dress') || t.includes('shirt') || t.includes('jacket') || t.includes('top')) {
            sizes = ['S', 'M', 'L', 'XL', 'XXL'];
        }
        products.push(create("Fashion", f.t, f.p, f.op, f.i, f.b, f.c, sizes));
    });

    // 4. WATCHES
    const watches = [
        { t: "Apple Watch Ultra 2", p: 89900, op: 89900, b: "Apple", i: "https://images.unsplash.com/photo-1664733762736-22c9c4984a75?auto=format&fit=crop&w=400&q=80", c: ["Titanium"] },
    ];
    watches.forEach(w => products.push(create("Watches", w.t, w.p, w.op, w.i, w.b, w.c)));
    
    // 5. FOOD & KITCHEN
    const foodKitchen = [
        { t: "Prestige Induction Cooktop", p: 1999, op: 3495, b: "Prestige", i: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80", c: ["Black"] },
        { t: "Milton Thermosteel Flask (1L)", p: 799, op: 1199, b: "Milton", i: "https://images.unsplash.com/photo-1602143407151-511191054379?auto=format&fit=crop&w=400&q=80", c: ["Silver"] },
        { t: "Tata Sampann Toor Dal (1kg)", p: 145, op: 180, b: "Tata", i: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80", c: ["Yellow"] },
        { t: "Maggi 2-Minute Noodles", p: 160, op: 180, b: "Maggi", i: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=400&q=80", c: ["Yellow"] },
        { t: "Fortune Refined Oil (1L)", p: 115, op: 145, b: "Fortune", i: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80", c: ["Golden"] },
        { t: "Wonderchef Nutri-Blend Mixer", p: 2899, op: 5500, b: "Wonderchef", i: "https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?auto=format&fit=crop&w=400&q=80", c: ["Black", "Red"] }
    ];
    foodKitchen.forEach(k => {
        const cat = (k.t.includes('Dal') || k.t.includes('Maggi') || k.t.includes('Oil')) ? 'Food' : 'Kitchen';
        products.push(create(cat, k.t, k.p, k.op, k.i, k.b, k.c));
    });

    return products;
};

// In-Memory Data Store
let products = generateMockProducts();
let orders = [];
let users = [];

// --- API ROUTES ---

// PRODUCTS
app.get('/api/products', (req, res) => {
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

app.post('/api/products', (req, res) => {
    const newProduct = { ...req.body, id: `p-${Date.now()}` };
    products.unshift(newProduct);
    res.json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index >= 0) {
        products[index] = { ...products[index], ...req.body };
        res.json(products[index]);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    products = products.filter(p => p.id !== req.params.id);
    res.json({ success: true });
});

// ORDERS
app.get('/api/orders', (req, res) => {
    res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if(order) res.json(order);
    else res.status(404).json({message: "Order not found"});
});

app.post('/api/orders', (req, res) => {
    const order = req.body;
    orders.unshift(order);
    res.json(order);
});

app.patch('/api/orders/:id', (req, res) => {
    const { status } = req.body;
    const order = orders.find(o => o.id === req.params.id);
    if (order) {
        order.status = status;
        if(status === 'Delivered') {
            order.trackingHistory.unshift({
                status: 'Delivered',
                date: new Date().toISOString(),
                location: 'Delivered to Customer',
                description: 'Package delivered successfully'
            });
        }
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

// USERS
app.get('/api/users/check', (req, res) => {
    const { id } = req.query;
    const exists = users.some(u => u.email === id || u.mobile === id);
    res.json({ exists });
});

app.post('/api/users/register', (req, res) => {
    const user = { ...req.body, id: `u-${Date.now()}`, role: 'user' };
    users.push(user);
    res.json(user);
});

app.post('/api/users/login', (req, res) => {
    const { identifier } = req.body;
    const user = users.find(u => u.email === identifier || u.mobile === identifier);
    if (user) res.json(user);
    else res.status(404).json({ message: 'User not found' });
});

app.put('/api/users/:id', (req, res) => {
    const index = users.findIndex(u => u.id === req.params.id);
    if(index >= 0) {
        users[index] = { ...users[index], ...req.body };
        res.json(users[index]);
    } else {
        res.status(404).json({message: "User not found"});
    }
});

// PAYMENT - CASHFREE INTEGRATION
app.post('/api/payment/initiate', async (req, res) => {
    const { amount, orderId, customerId, customerPhone, customerEmail } = req.body;
    
    // Credentials from Environment Variables
    const APP_ID = process.env.CASHFREE_APP_ID;
    const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
    const ENV = process.env.CASHFREE_ENV || 'TEST'; // TEST or PROD

    // Check if keys are missing
    if (!APP_ID || !SECRET_KEY) {
        console.warn("Cashfree Credentials Missing - Falling back to Mock");
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');
        
        // Return success with redirectUrl (mock) instead of error
        return res.json({ 
            success: true, 
            redirectUrl: `${protocol}://${host}/#/mock-payment-gateway?orderId=${orderId}&amount=${amount}`
        });
    }

    try {
        console.log(`[Payment] Creating Cashfree Order ${orderId}`);
        
        const baseUrl = ENV === 'PROD' 
            ? 'https://api.cashfree.com/pg/orders' 
            : 'https://sandbox.cashfree.com/pg/orders';

        const payload = {
            order_id: orderId,
            order_amount: amount,
            order_currency: "INR",
            customer_details: {
                customer_id: customerId || 'guest',
                customer_email: customerEmail || 'guest@example.com',
                customer_phone: customerPhone || '9999999999'
            },
            order_meta: {
                return_url: `${req.headers.origin}/#/order-success/${orderId}?status={order_status}`
            }
        };

        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-version': '2023-08-01',
                'x-client-id': APP_ID,
                'x-client-secret': SECRET_KEY
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data.payment_session_id) {
             res.json({
                 success: true,
                 paymentSessionId: data.payment_session_id
             });
        } else {
             console.error("Cashfree API Error:", data.message);
             // Return Mock URL as fallback even if API call fails (so user isn't stuck)
             const protocol = req.headers['x-forwarded-proto'] || req.protocol;
             const host = req.get('host');
             return res.json({ 
                 success: true, 
                 redirectUrl: `${protocol}://${host}/#/mock-payment-gateway?orderId=${orderId}&amount=${amount}&msg=api_fail`
             });
        }

    } catch (error) {
        console.error("Payment API Failed", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// OTP
app.post('/api/send-otp', (req, res) => {
    const { identifier } = req.body;
    console.log(`[Server] Sending OTP to ${identifier}`);
    res.json({ success: true, message: "OTP Sent", devCode: "1234" });
});

app.post('/api/verify-otp', (req, res) => {
    const { identifier, code } = req.body;
    if (code === "1234") {
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: "Invalid OTP" });
    }
});

// --- CATCH-ALL ROUTE ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));