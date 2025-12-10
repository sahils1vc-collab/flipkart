import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { initiatePayment, createOrder } from '../services/data';
import { ShieldCheck, ArrowLeft, CreditCard, Smartphone, Wallet, Building2, Percent, Truck, Loader2, AtSign } from 'lucide-react';
import { Order } from '../types';

// Declare Cashfree on Window
declare global {
  interface Window {
    Cashfree: any;
  }
}

// Expanded Payment Modes
type PaymentMode = 'gpay' | 'phonepe' | 'paytm' | 'upi_id' | 'card' | 'wallet' | 'netbanking' | 'emi' | 'cod';

const PAYMENT_MODES: { id: PaymentMode; label: string; icon: any; subLabel?: string }[] = [
    { id: 'gpay', label: 'Google Pay', icon: Smartphone },
    { id: 'phonepe', label: 'PhonePe', icon: Smartphone },
    { id: 'paytm', label: 'Paytm', icon: Smartphone },
    { id: 'upi_id', label: 'Enter UPI ID', icon: AtSign },
    { id: 'wallet', label: 'Wallets', icon: Wallet, subLabel: 'Paytm, Mobikwik, Freecharge' },
    { id: 'card', label: 'Credit / Debit / ATM Card', icon: CreditCard, subLabel: 'Add and secure cards as per RBI guidelines' },
    { id: 'netbanking', label: 'Net Banking', icon: Building2, subLabel: 'All Indian banks supported' },
    { id: 'emi', label: 'EMI (Easy Installments)', icon: Percent, subLabel: 'No Cost EMI available' },
    { id: 'cod', label: 'Cash on Delivery', icon: Truck }
];

export const Payment: React.FC = () => {
  const { checkoutItems, user, shippingAddress, completeOrder } = useShop();
  const navigate = useNavigate();
  
  const [selectedMode, setSelectedMode] = useState<PaymentMode>('gpay'); 
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cashfree, setCashfree] = useState<any>(null);

  // Initialize Cashfree SDK
  useEffect(() => {
     if (window.Cashfree) {
         setCashfree(new window.Cashfree({
             mode: "sandbox" // Change to "production" for real payments
         }));
     }
  }, []);
  
  // Validate flow
  useEffect(() => {
      if (!shippingAddress || checkoutItems.length === 0) {
          navigate('/cart');
      }
  }, [shippingAddress, checkoutItems, navigate]);

  const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = checkoutItems.reduce((acc, item) => acc + ((item.originalPrice - item.price) * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  const handlePay = async () => {
    // 1. Basic Validation
    if (!user) {
        navigate('/');
        return;
    }
    
    if (selectedMode === 'upi_id' && !upiId.includes('@')) {
        alert("Please enter a valid UPI ID");
        return;
    }

    setIsProcessing(true);

    try {
        const orderId = `ORD-${Date.now()}`;
        const email = user?.email || 'guest@flipkart.com';
        const mobile = user?.mobile || '9999999999';

        const result = await initiatePayment(
            total, 
            orderId, 
            email, 
            mobile,
            selectedMode.toUpperCase(), 
            selectedMode === 'upi_id' ? upiId : undefined
        );

        if (result.success) {
            
            // Scenario A: Real Payment via Cashfree SDK
            if (result.paymentSessionId && cashfree) {
                cashfree.checkout({
                    paymentSessionId: result.paymentSessionId,
                    redirectTarget: "_self" // Redirects current page
                });
                return; // Stop here, SDK takes over
            }

            // Scenario B: Fallback Redirect (If keys missing on backend or API fails)
            if (result.redirectUrl) {
                window.location.href = result.redirectUrl;
                return;
            }
            
            // Scenario C: Manual Fallback
            const newOrder: Order = {
                id: orderId,
                userId: user.id,
                items: checkoutItems,
                total: total,
                status: 'Ordered',
                date: new Date().toISOString(),
                address: shippingAddress!,
                paymentMethod: selectedMode.toUpperCase(),
                estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                trackingHistory: [{
                    status: 'Ordered',
                    date: new Date().toISOString(),
                    location: 'Online',
                    description: 'Order Placed Successfully'
                }]
            };

            await createOrder(newOrder);
            completeOrder();
            navigate(`/order-success/${orderId}`);

        } else {
            alert("Payment initiation failed. Please check credentials or try again.");
        }
    } catch (error) {
        console.error("Payment Error:", error);
        alert("Unable to connect to payment gateway. Please ensure backend is running.");
    } finally {
        setIsProcessing(false);
    }
  };

  // --- CONTENT RENDERER ---

  const renderPaymentContent = (mode: PaymentMode) => {
      switch (mode) {
          case 'gpay':
          case 'phonepe':
          case 'paytm':
              return (
                  <div className="p-4 md:pt-0 animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="text-xs text-slate-500 mb-4">Pay instantly using {mode === 'gpay' ? 'Google Pay' : mode === 'phonepe' ? 'PhonePe' : 'Paytm'} UPI.</p>
                      <button 
                        onClick={handlePay}
                        disabled={isProcessing}
                        className="bg-[#fb641b] text-white font-bold py-3.5 px-8 rounded-[2px] text-sm uppercase shadow-sm hover:bg-[#e85d19] transition-colors w-full md:w-auto flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : `PAY ₹${total.toLocaleString('en-IN')}`}
                      </button>
                  </div>
              );
          case 'upi_id':
              return (
                  <div className="p-4 md:pt-0 animate-in fade-in slide-in-from-top-2 duration-200">
                      <input 
                        type="text" 
                        placeholder="e.g. mobile@upi" 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full md:w-2/3 p-3 border border-slate-300 rounded-[2px] mb-4 text-sm outline-none focus:border-[#2874f0]" 
                      />
                      <button 
                        onClick={handlePay}
                        disabled={isProcessing}
                        className="bg-[#fb641b] text-white font-bold py-3.5 px-8 rounded-[2px] text-sm uppercase shadow-sm hover:bg-[#e85d19] transition-colors w-full md:w-auto flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                         {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Verify & PAY ₹${total.toLocaleString('en-IN')}`}
                      </button>
                  </div>
              );
          case 'card':
          case 'wallet':
          case 'netbanking':
          case 'emi':
              return (
                  <div className="p-4 md:pt-0 animate-in fade-in slide-in-from-top-2 duration-200">
                       <p className="text-xs text-slate-500 mb-4">You will be redirected to the secure payment gateway.</p>
                       <button 
                        onClick={handlePay}
                        disabled={isProcessing}
                        className="bg-[#fb641b] text-white font-bold py-3.5 px-8 rounded-[2px] text-sm uppercase shadow-sm hover:bg-[#e85d19] transition-colors w-full md:w-auto flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                         {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : `PAY ₹${total.toLocaleString('en-IN')}`}
                      </button>
                  </div>
              );
           case 'cod':
              return (
                  <div className="p-4 md:pt-0 animate-in fade-in slide-in-from-top-2 duration-200">
                       <div className="flex items-start gap-2 bg-slate-50 p-3 border border-slate-200 rounded-[2px]">
                           <Truck className="w-4 h-4 text-slate-500 mt-0.5" />
                           <p className="text-xs text-slate-500">
                               Confirm Order with Cash on Delivery
                           </p>
                       </div>
                       <button 
                        onClick={handlePay}
                        disabled={isProcessing}
                        className="mt-4 bg-[#fb641b] text-white font-bold py-3.5 px-8 rounded-[2px] text-sm uppercase shadow-sm hover:bg-[#e85d19] transition-colors w-full md:w-auto flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                         {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Place Order`}
                      </button>
                  </div>
              );
          default:
              return null;
      }
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-20 md:pb-8 font-sans page-animate relative">
        <div className="container mx-auto px-0 md:px-4 pt-2 md:pt-6 max-w-[1100px]">
            
             <div className="bg-[#2874f0] p-4 text-white md:hidden flex items-center gap-3 sticky top-0 z-10 shadow-md">
                <button onClick={() => navigate('/order-summary')}><ArrowLeft className="w-6 h-6" /></button>
                <span className="font-medium text-lg">Payments</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mt-2 md:mt-4">
                 
                 <div className="flex-1">
                    {/* Steps Indicator */}
                    <div className="bg-white shadow-sm mb-4 hidden md:flex rounded-[2px] overflow-hidden text-sm">
                        <div className="flex-1 p-3 border-r border-slate-200 text-slate-400 font-medium flex items-center gap-2 bg-slate-50">
                            <span className="bg-slate-200 text-slate-500 w-5 h-5 flex items-center justify-center text-[10px] rounded font-bold">1</span> Login <span className="ml-auto text-slate-800 font-bold text-xs">✓</span>
                        </div>
                        <div className="flex-1 p-3 border-r border-slate-200 text-slate-400 font-medium flex items-center gap-2 bg-slate-50">
                            <span className="bg-slate-200 text-slate-500 w-5 h-5 flex items-center justify-center text-[10px] rounded font-bold">2</span> Address <span className="ml-auto text-slate-800 font-bold text-xs">✓</span>
                        </div>
                         <div className="flex-1 p-3 border-r border-slate-200 text-slate-400 font-medium flex items-center gap-2 bg-slate-50">
                            <span className="bg-slate-200 text-slate-500 w-5 h-5 flex items-center justify-center text-[10px] rounded font-bold">3</span> Order Summary <span className="ml-auto text-slate-800 font-bold text-xs">✓</span>
                        </div>
                        <div className="flex-1 p-3 bg-[#2874f0] text-white font-medium flex items-center gap-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                            <span className="bg-white text-[#2874f0] w-5 h-5 flex items-center justify-center text-[10px] rounded font-bold">4</span> Payment
                        </div>
                    </div>

                    {/* MAIN PAYMENT SECTION */}
                    <div className="bg-white shadow-sm rounded-[2px] overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[400px]">
                        
                        {/* Sidebar (Desktop) / List (Mobile) */}
                        <div className="w-full md:w-[320px] bg-slate-50 border-r border-slate-200 flex flex-col">
                             <div className="p-3 bg-[#2874f0] text-white font-medium text-sm uppercase md:hidden">
                                Payment Options
                             </div>
                             
                             <div className="flex flex-col">
                                 {PAYMENT_MODES.map((mode) => (
                                     <React.Fragment key={mode.id}>
                                        {/* Option Header / Button */}
                                        <button 
                                            onClick={() => setSelectedMode(mode.id)}
                                            className={`p-4 text-sm font-medium text-left flex items-start gap-3 border-b border-slate-200 md:border-b-0 md:border-l-4 transition-all w-full
                                                ${selectedMode === mode.id 
                                                    ? 'bg-white text-[#2874f0] border-l-[#2874f0] shadow-[0_1px_4px_rgba(0,0,0,0.05)] z-10' 
                                                    : 'text-slate-600 border-l-transparent hover:bg-slate-100'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center flex-shrink-0 ${selectedMode === mode.id ? 'border-[#2874f0]' : 'border-slate-400'}`}>
                                                {selectedMode === mode.id && <div className="w-2 h-2 bg-[#2874f0] rounded-full" />}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={selectedMode === mode.id ? 'font-bold' : ''}>{mode.label}</span>
                                                </div>
                                                {mode.subLabel && <div className="text-[11px] text-slate-400 mt-0.5 font-normal">{mode.subLabel}</div>}
                                            </div>
                                            
                                            <div className="w-6 h-6 opacity-60">
                                                <mode.icon className="w-full h-full p-0.5" />
                                            </div>
                                        </button>

                                        {/* Mobile Content - Accordion Style */}
                                        {selectedMode === mode.id && (
                                            <div className="md:hidden bg-white border-b border-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                                                {renderPaymentContent(mode.id)}
                                            </div>
                                        )}
                                     </React.Fragment>
                                 ))}
                             </div>
                        </div>

                        {/* Desktop Content Area (Hidden on Mobile) */}
                        <div className="hidden md:block flex-1 p-8 bg-white min-h-[400px]">
                             <div className="mb-6">
                                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                    {PAYMENT_MODES.find(m => m.id === selectedMode)?.label}
                                </h3>
                             </div>
                             {renderPaymentContent(selectedMode)}
                             
                             <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
                                <ShieldCheck className="w-4 h-4 text-green-600" />
                                <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>
                            </div>
                        </div>

                    </div>
                 </div>

                 {/* Right: Summary */}
                <div className="lg:w-1/3 w-full hidden md:block">
                   <div className="bg-white shadow-sm border border-slate-100 sticky top-20 rounded-[2px] overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50">
                         <h2 className="text-slate-500 font-bold uppercase text-sm">Price Details</h2>
                      </div>
                      <div className="p-4 space-y-4 text-sm">
                         <div className="flex justify-between">
                            <span className="text-slate-800">Price ({checkoutItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                            <span className="text-slate-800">₹{(subtotal + discount).toLocaleString('en-IN')}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-800">Discount</span>
                            <span className="text-green-600">- ₹{discount.toLocaleString('en-IN')}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-800">Delivery Charges</span>
                            <span className="text-green-600">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                         </div>
                         <div className="flex justify-between border-t border-dashed border-slate-200 pt-4 text-lg font-bold">
                            <span className="text-slate-900">Total Amount</span>
                            <span className="text-slate-900">₹{total.toLocaleString('en-IN')}</span>
                         </div>
                      </div>
                      
                      <div className="p-4 border-t border-slate-100">
                         <div className="flex items-center gap-3 mb-2">
                            <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/shield_5f9216.png" className="h-8" alt="Secure" />
                            <p className="text-xs text-slate-500 leading-tight">Safe and Secure Payments. Easy returns. 100% Authentic products.</p>
                         </div>
                      </div>
                   </div>
                </div>
            </div>
        </div>
    </div>
  );
};