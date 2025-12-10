import { Product, Order, User, UserRole, OrderStatus, TrackingEvent, Review } from '../types';
import { API_BASE_URL, ENABLE_API, MOCK_DELAY } from './config';
import { BANNER_IMAGES } from '../constants';

// --- UTILITY: Image Compression (Crucial for Client-Side Scaling) ---
export const compressImage = (base64Str: string, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(base64Str); // Return original if fail
    });
};

// Helper for API requests
async function apiRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    
    const config: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("API Request Failed", error);
        throw error;
    }
}

const apiDelay = () => new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

// Keys for Local Storage (acting as your NoSQL Database)
const PRODUCTS_KEY = 'swiftcart_products_v23'; 
const ORDERS_KEY = 'swiftcart_orders_v2';
const USERS_KEY = 'swiftcart_users_v2'; 
const BANNERS_KEY = 'swiftcart_banners_v4';

// Hardcoded Admin List
const ADMIN_EMAILS = ['admin@flipkart.com', 'owner@flipkart.com'];
const ADMIN_MOBILES = ['6378041283', '9999999999'];

// --- DATABASE SEEDER (Initial Data) ---
const generateMockProducts = (): Product[] => {
    const products: Product[] = [];
    
    // Helper to generate random reviews
    const generateReviews = (): Review[] => {
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
        
        const numReviews = Math.floor(Math.random() * 6) + 2; // 2 to 7 reviews
        const generated: Review[] = [];
        
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
    const ensureFourColors = (colors: string[] = []) => {
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

    const create = (category: string, title: string, price: number, originalPrice: number, image: string, brand: string, colors: string[] = [], sizes: string[] = [], rating: number = 4.5): Product => {
        const reviews = generateReviews();
        // Calculate dynamic average rating based on reviews
        const avgRating = reviews.length > 0 
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
            : rating;

        const finalColors = ensureFourColors(colors);

        return {
            id: `p-${Math.random().toString(36).substr(2, 9)}`,
            title,
            description: `Experience the best of ${brand} with the ${title}. Featuring premium build quality, advanced features, and stylish design. Perfect for your daily needs.`,
            price,
            originalPrice,
            category,
            image,
            images: [image, image, image, image],
            rating: parseFloat(avgRating.toFixed(1)),
            reviewsCount: Math.floor(Math.random() * 100) + reviews.length, // Total ratings count (mocked higher than text reviews)
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
        let sizes: string[] = [];
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
    
    // 5. FOOD & KITCHEN (Seed Data)
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

// --- SERVICE FUNCTIONS (Backend Wrapper) ---

export const initializeData = async (): Promise<void> => {
    // Only simulate delay if using Local Storage to mimic DB load
    if (!ENABLE_API) await apiDelay();
    
    // Initialize Products in Local Storage if not present
    const existingProducts = localStorage.getItem(PRODUCTS_KEY);
    if (!existingProducts) {
        console.log("Seeding Database...");
        const mockProducts = generateMockProducts();
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mockProducts));
    }

    // Initialize Users
    let users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const defaultAdminExists = users.some((u: User) => u.mobile === '6378041283');
    if (!defaultAdminExists) {
        users.push({ 
            id: 'admin-default', 
            name: 'Flipkart Admin', 
            email: 'admin@flipkart.com', 
            mobile: '6378041283', 
            role: UserRole.ADMIN 
        });
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
};

export const fetchProducts = async (): Promise<Product[]> => {
    // 1. Try API if Enabled
    if (ENABLE_API) {
        try { 
            return await apiRequest<Product[]>('/products'); 
        } catch (e) {
            console.warn("API unavailable, falling back to local storage");
        }
    }
    
    // 2. Fallback to Local Storage (Mock DB)
    await apiDelay();
    const localData = localStorage.getItem(PRODUCTS_KEY);
    return localData ? JSON.parse(localData) : [];
};

export const fetchOrders = async (): Promise<Order[]> => {
    if (ENABLE_API) {
        try { return await apiRequest<Order[]>('/orders'); } catch (e) {}
    }
    await apiDelay();
    const localData = localStorage.getItem(ORDERS_KEY);
    return localData ? JSON.parse(localData) : [];
};

export const fetchOrderById = async (id: string): Promise<Order | null> => {
    if (ENABLE_API) {
        try { return await apiRequest<Order>(`/orders/${id}`); } catch (e) {}
    }
    await apiDelay(); 
    const orders = await fetchOrders(); 
    return orders.find(o => o.id === id) || null;
}

export const createOrder = async (order: Order): Promise<Order> => {
    if (ENABLE_API) {
        try { return await apiRequest<Order>('/orders', 'POST', order); } catch (e) {}
    }
    await apiDelay();
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    orders.unshift(order); // Add new order to start
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return order;
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    if (ENABLE_API) {
        try { await apiRequest(`/orders/${id}`, 'PATCH', { status }); return; } catch (e) {}
    }
    await apiDelay();
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    const updated = orders.map((o: Order) => o.id === id ? { ...o, status } : o);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
};

// --- CRUD PRODUCTS (BACKEND READY) ---

export const saveProduct = async (product: Product): Promise<Product> => {
    // 1. Backend API Logic
    if (ENABLE_API) {
        try {
            if (product.id.startsWith('new-')) {
                const { id, ...newProduct } = product; 
                return await apiRequest<Product>('/products', 'POST', newProduct);
            } else {
                return await apiRequest<Product>(`/products/${product.id}`, 'PUT', product);
            }
        } catch (e) {
            console.error("Failed to save to API, falling back to local");
        }
    }

    // 2. Local Storage Logic
    await apiDelay();
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
    const index = products.findIndex((p: Product) => p.id === product.id);
    
    // Auto-Compress main image if it's base64 (approx check)
    if (product.image.startsWith('data:image')) {
        product.image = await compressImage(product.image);
    }
    // Compress gallery images
    if (product.images) {
        product.images = await Promise.all(product.images.map(async img => 
            img.startsWith('data:image') ? await compressImage(img) : img
        ));
    }

    let savedProduct = product;
    if (index >= 0) {
        // Update existing
        products[index] = product;
    } else {
        // Create new
        if (product.id.startsWith('new-') || !product.id) {
            savedProduct = { ...product, id: `p-${Date.now()}` };
        }
        products.unshift(savedProduct);
    }
    try {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
        console.error("Storage Limit Exceeded even after compression", e);
        alert("Storage Full! Cannot save image. Please delete some items.");
        return product; // Fail gracefully
    }
    return savedProduct;
};

export const deleteProduct = async (id: string): Promise<void> => {
    if (ENABLE_API) {
        try { await apiRequest(`/products/${id}`, 'DELETE'); return; } catch (e) {}
    }
    
    await apiDelay();
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
    const filtered = products.filter((p: Product) => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
};

// --- USER MANAGEMENT ---

export const checkUserExists = async (identifier: string): Promise<boolean> => {
    await apiDelay();
    // Check Admin Hardcoded List
    if (ADMIN_EMAILS.includes(identifier) || ADMIN_MOBILES.includes(identifier)) return true;
    
    if (ENABLE_API) {
        try { 
            const res = await apiRequest<{exists: boolean}>(`/users/check?id=${identifier}`);
            return res.exists;
        } catch (e) {}
    }
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return users.some((u: User) => u.email === identifier || u.mobile === identifier);
};

export const registerUser = async (userData: any): Promise<User> => {
    await apiDelay();
    if (ENABLE_API) {
        try { return await apiRequest<User>('/users/register', 'POST', userData); } catch (e) {}
    }
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const newUser: User = { 
        id: `u-${Date.now()}`, 
        name: userData.name, 
        email: userData.email, 
        mobile: userData.mobile, 
        role: UserRole.USER 
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
};

export const authenticateUser = async (identifier: string): Promise<User> => {
    await apiDelay();
    // Admin Backdoor
    if (ADMIN_EMAILS.includes(identifier) || ADMIN_MOBILES.includes(identifier)) {
        return { 
            id: 'admin-force', 
            name: 'Admin', 
            email: identifier.includes('@') ? identifier : 'admin@flipkart.com', 
            mobile: identifier.includes('@') ? '' : identifier, 
            role: UserRole.ADMIN 
        };
    }
    
    if (ENABLE_API) {
        try { return await apiRequest<User>('/users/login', 'POST', { identifier }); } catch (e) {}
    }
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: User) => u.email === identifier || u.mobile === identifier);
    if (!user) throw new Error("User not found");
    return user;
};

export const updateUser = async (user: User): Promise<User> => {
    await apiDelay();
    if (ENABLE_API) {
        try { return await apiRequest<User>(`/users/${user.id}`, 'PUT', user); } catch(e) {}
    }
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map((u: User) => u.id === user.id ? user : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    return user;
};

export const fetchBanners = async () => {
    await apiDelay();
    const stored = localStorage.getItem(BANNERS_KEY);
    return stored ? JSON.parse(stored) : BANNER_IMAGES;
};

export const saveBanners = async (banners: string[]) => {
    await apiDelay();
    // Compress new banners if they are base64
    const compressedBanners = await Promise.all(banners.map(async b => 
        b.startsWith('data:image') ? await compressImage(b) : b
    ));
    localStorage.setItem(BANNERS_KEY, JSON.stringify(compressedBanners));
};

// --- PAYMENT INTEGRATION ---

export const initiatePayment = async (
    amount: number, 
    orderId: string, 
    email: string, 
    mobile: string,
    paymentMode: string, 
    vpa?: string
): Promise<{success: boolean, paymentSessionId?: string, redirectUrl?: string, error?: string, environment?: string}> => {
    
    const customerId = email ? email.replace(/[^a-zA-Z0-9]/g, '') : mobile;
    const payload = { orderId, amount, customerPhone: mobile, customerEmail: email, customerId, paymentMode, vpa };

    if (ENABLE_API) {
        try {
            console.log("Calling Backend with Payload:", payload);
            const response = await apiRequest<{success: boolean, paymentSessionId?: string, redirectUrl?: string, environment?: string}>('/payment/initiate', 'POST', payload);
            
            return {
                success: response.success,
                paymentSessionId: response.paymentSessionId,
                redirectUrl: response.redirectUrl,
                environment: response.environment
            };
        } catch (e) {
            console.error("Payment API Failed", e);
            throw e; // STRICT MODE: Throw error if API fails (removed mock fallback)
        }
    }

    // Fallback only if ENABLE_API is explicitly set to FALSE (Mock Mode)
    await apiDelay();
    return {
        success: true
    };
}