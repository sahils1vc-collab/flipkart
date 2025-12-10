import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { createOrder } from '../services/data';
import { Loader2, ShieldCheck, Lock, Smartphone, CreditCard } from 'lucide-react';
import { Order } from '../types';

export const MockGateway: React.FC = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    
    const { user, checkoutItems, shippingAddress, completeOrder } = useShop();
    const navigate = useNavigate();

    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Redirect if direct access without params
    useEffect(() => {
        if (!orderId || !amount) {
            navigate('/');
        }
    }, [orderId, amount, navigate]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (otp.length !== 4) {
            alert("Please enter a valid 4-digit OTP (Try 1234)");
            return;
        }

        setIsLoading(true);

        // Simulate Network Delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create Order Object
        if (user && shippingAddress && checkoutItems.length > 0) {
             const newOrder: Order = {
                id: orderId || `ORD-${Date.now()}`,
                userId: user.id,
                items: checkoutItems,
                total: parseFloat(amount || '0'),
                status: 'Ordered',
                date: new Date().toISOString(),
                address: shippingAddress,
                paymentMethod: 'Prepaid',
                estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                trackingHistory: [{
                    status: 'Ordered',
                    date: new Date().toISOString(),
                    location: 'Online',
                    description: 'Order Placed Successfully'
                }]
             };

             try {
                // Call API to create order
                await createOrder(newOrder);
                
                // Clear Cart
                completeOrder();

                setIsSuccess(true);
                setTimeout(() => {
                    navigate(`/order-success/${orderId}`);
                }, 1000);
             } catch (error) {
                 console.error("Order Creation Failed", error);
                 alert("Payment Successful but Order Creation Failed. Please contact support.");
                 setIsLoading(false);
             }
        } else {
             // Fallback for missing context data (e.g. page refresh)
             // In a real app, you'd fetch this from a temp server session
             alert("Session Expired. Please retry checkout.");
             navigate('/cart');
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
                <p className="text-slate-500">Redirecting to Flipkart...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
            <div className="bg-white w-full max-w-[400px] shadow-lg rounded-lg overflow-hidden border border-slate-200">
                
                {/* Header */}
                <div className="bg-[#2874f0] p-4 flex justify-between items-center text-white">
                     <span className="font-bold tracking-wide italic">SecurePay</span>
                     <div className="flex items-center gap-1 text-xs opacity-90">
                         <Lock className="w-3 h-3" /> 128-bit Encrypted
                     </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
                        <div>
                           <p className="text-xs text-slate-500 uppercase font-bold mb-1">Merchant</p>
                           <p className="font-bold text-slate-800">Flipkart Internet Pvt Ltd</p>
                        </div>
                        <div className="text-right">
                           <p className="text-xs text-slate-500 uppercase font-bold mb-1">Amount</p>
                           <p className="font-bold text-2xl text-slate-900">₹{parseFloat(amount || '0').toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    <form onSubmit={handlePayment}>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Authentication</label>
                            <p className="text-xs text-slate-500 mb-3">An OTP has been sent to your registered mobile number ending in *******89.</p>
                            
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Enter OTP (1234)"
                                    className="w-full border border-slate-300 rounded px-4 py-3 text-center text-lg tracking-[0.2em] font-bold focus:border-[#2874f0] outline-none"
                                    maxLength={4}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    autoFocus
                                />
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#fb641b] text-white font-bold py-3.5 rounded shadow-sm hover:bg-[#e85d19] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CONFIRM PAYMENT'}
                        </button>
                    </form>
                    
                    <div className="mt-6 flex justify-center gap-4 text-slate-400">
                        <CreditCard className="w-6 h-6" />
                        <div className="w-6 h-6 border rounded flex items-center justify-center text-[10px] font-bold">UPI</div>
                        <ShieldCheck className="w-6 h-6" />
                    </div>

                    <div className="mt-6 text-center">
                        <button onClick={() => navigate('/payment')} className="text-xs text-red-500 font-bold hover:underline">Cancel Transaction</button>
                    </div>
                </div>
            </div>
        </div>
    );
};