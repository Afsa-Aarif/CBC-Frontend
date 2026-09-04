// 1. Load the cart from LocalStorage
export const loadCart = () => {
    const cart = localStorage.getItem("cart");
    try {
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error("Cart parsing error:", error);
        return [];
    }
};

// 2. Save the cart to LocalStorage
export const saveCart = (cart) => {
    localStorage.setItem("cart", JSON.stringify(cart));
};

// 3. Add or update items in the cart
// FIXED: Now accepts (product, selectedQuantity) to match your UI buttons
export const addToCart = (product, selectedQuantity = 1) => {
    let cart = loadCart();
    
    // Use _id primarily as that is what MongoDB returns
    const productId = product._id || product.id || product.productID;
    
    const index = cart.findIndex(item => (item._id || item.id) === productId);
    
    if (index > -1) {
        // Increase by the specific amount chosen in the ProductOverview
        cart[index].quantity += selectedQuantity;
    } else {
        // Add new item with the selected quantity
        const newItem = {
            ...product,
            _id: productId, 
            quantity: selectedQuantity
        };
        cart.push(newItem);
    }
    
    saveCart(cart);
};

// 4. Remove a specific item from the cart
export const removeFromCart = (productId) => {
    let cart = loadCart();
    const filteredCart = cart.filter(item => (item._id || item.id) !== productId);
    saveCart(filteredCart);
};

// 5. Update quantity (Used for + and - buttons on the Cart Page)
export const updateQuantity = (productId, amount) => {
    let cart = loadCart();
    const index = cart.findIndex(item => (item._id || item.id) === productId);

    if (index > -1) {
        cart[index].quantity += amount;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart(cart);
    }
};

// 6. Clear the entire cart
export const clearCart = () => {
    localStorage.removeItem("cart");
};