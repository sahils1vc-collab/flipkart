
import { API_BASE_URL, ENABLE_API } from './config';

// In-memory fallback store for simulation
const mockOtpStore: Record<string, { code: string; expiresAt: number }> = {};

export const sendOtp = async (identifier: string): Promise<{ success: boolean; message: string; devCode?: string }> => {
    
    // 1. Try connecting to Real Backend if Enabled
    if (ENABLE_API) {
        try {
            // This is where your future Node.js backend will trigger the Email/SMS
            const response = await fetch(`${API_BASE_URL}/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier }) // Sending generic identifier
            });

            const data = await response.json();
            if (data.success) {
                return { success: true, message: data.message, devCode: data.devCode };
            }
        } catch (error) {
            console.log("Backend not reachable. Switching to Simulation Mode.");
        }
    }

    // 2. Fallback: Simulation Mode (Frontend Only)
    return new Promise((resolve) => {
        // Generate Random 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); 
        
        const isEmail = identifier.includes('@');
        const type = isEmail ? 'Email' : 'Mobile';

        console.log(`[Mock Backend] Triggering ${type} OTP to ${identifier} with code: ${otp}`);
        
        mockOtpStore[identifier] = {
            code: otp,
            expiresAt: Date.now() + 5 * 60 * 1000
        };

        // Simulate network delay
        setTimeout(() => {
            resolve({ 
                success: true, 
                message: `${type} OTP Sent to ${identifier}`,
                devCode: otp 
            });
        }, 1000);
    });
};

export const verifyOtp = async (identifier: string, code: string): Promise<{ success: boolean; message: string }> => {
    
    // 1. Try Backend Verification first
    if (ENABLE_API) {
        try {
            const response = await fetch(`${API_BASE_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, code })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                return { success: true, message: "Verification Successful" };
            } else {
                 // If backend explicitly says Invalid OTP, don't check mock store
                 throw new Error(data.message || "Invalid OTP");
            }
        } catch (error: any) {
            // Only fall back to local mock if connection failed, not if logic failed
            if (error.message !== "Invalid OTP" && error.message !== "OTP expired") {
                 console.log("Backend verification unavailable. Checking local mock.");
            } else {
                 return { success: false, message: error.message };
            }
        }
    }

    // 2. Fallback: Check Simulation Store
    return new Promise((resolve) => {
        setTimeout(() => {
            const session = mockOtpStore[identifier];
            
            // STRICT CHECK: Code must match generated OTP
            if (session && session.code === code) {
                // Clear used OTP to prevent replay
                delete mockOtpStore[identifier];
                resolve({ success: true, message: "Verification Successful" });
            } else {
                resolve({ success: false, message: "Invalid OTP" });
            }
        }, 800);
    });
};
