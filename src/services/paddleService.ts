
/**
 * Paddle Service for handling payments and subscriptions
 */
export const paddleService = {
  initialize: () => {
    const vendorIdStr = import.meta.env.VITE_PADDLE_VENDOR_ID;
    
    // Safety check: ensure vendorId is a valid integer string
    if (vendorIdStr && !isNaN(parseInt(vendorIdStr)) && (window as any).Paddle) {
      (window as any).Paddle.Setup({ 
        vendor: parseInt(vendorIdStr) 
      });
      console.log("Paddle Initialized with ID:", vendorIdStr);
    } else {
      console.warn("Paddle: Missing or invalid VITE_PADDLE_VENDOR_ID. Checkout will be disabled.");
    }
  },

  openCheckout: (productId: string, email: string) => {
    if (!(window as any).Paddle) {
      alert("Paddle SDK not loaded. Check your internet connection.");
      return;
    }

    try {
        (window as any).Paddle.Checkout.open({
            product: productId,
            email: email,
            successCallback: (data: any) => {
              console.log("Payment Successful", data);
            },
            closeCallback: (reason: string) => {
              console.log("Checkout closed", reason);
            }
          });
    } catch (err) {
        console.error("Paddle Checkout error:", err);
        alert("Failed to open checkout. Please ensure Vendor ID is correct.");
    }
  }
};
