import { db } from './firebase-config.js';
import { collection, addDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { cart, saveToStorage } from './cart.js';
// Get the input values safely
const nameElement = document.getElementById("inputName");
const addressElement = document.getElementById("inputAddress");
const paymentElement = document.getElementById("inputPayment");

document.querySelector(".remove").addEventListener('click', () => {
    removeItems()
    renderCart();
})

renderCart();


async function renderCart() {
    let cartHTML = '';
    
    // Check if cart is empty
    if (cart.length === 0) {
        cartHTML = `
            <div class="empty-cart" style="grid-column: 1 / -1;">
                <h2>Your cart is empty</h2>
                <p>Add some products to your cart to get started.</p>
                <a href="products.html" class="continue-shopping">Continue Shopping</a>
            </div>
        `;
    } else {
        // Fetch all products in cart from Firestore
        for (const cartItem of cart) {
            try {
                const productDoc = await getDoc(doc(db, "all_products", cartItem.productId));
                
                if (productDoc.exists()) {
                    const product = productDoc.data();
                    
                    // Validate image URL and provide fallback if invalid
                    let imageUrl = product.image;
                    try {
                        new URL(imageUrl);
                    } catch (e) {
                        // If URL is invalid, use fallback image
                        imageUrl = 'images/container.png';
                    }
                    
                    cartHTML += `
                        <div class="product">
                            <div class="content_center">
                                <img src="${imageUrl}" alt="${product.name}" onerror="this.src='images/container.png'">     
                            </div>
                            <div class="product-details">
                                <h3 id="name">${product.name}</h3>
                               <p id="price">₱${product.priceCents * cartItem.quantity}</p>
                                <p id="proof">Proof: ${product.proof}</p>
                                <p id="dayOfStock">Day of Stock: ${product.dayOfStock}</p>
                                <div class="add_minus">
                                    <button class="minus" data-product-id="${productDoc.id}">-</button>
                                    <h4 data-product-count="${productDoc.id}" id="count" class="count">${cartItem.quantity}</h4>
                                    <button class="add" data-product-id="${productDoc.id}">+</button>
                                </div>
                                <div class="last_row">
                                    <button class="remove_from_cart" data-product-id="${productDoc.id}">Remove</button>
                                    <button class="buy" data-product-id="${productDoc.id}">Buy Now</button>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    console.warn(`Product ${cartItem.productId} not found in Firestore`);
                }
            } catch (error) {
                console.error(`Error fetching product ${cartItem.productId}:`, error);
            }
        }
    }

    document.querySelector('.content').innerHTML = cartHTML;

    // Attach event listeners
    attachEventListeners();
    updateCartQuantity();
}



function attachEventListeners() {
    // Add button
    document.querySelectorAll('.add').forEach((button) => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            const cartItem = cart.find((item) => item.productId === productId);
            if (cartItem) {
                cartItem.quantity += 1;
                renderCart(); // Re-render the cart
            }
            saveToStorage();
        });
    });

    // Minus button
    document.querySelectorAll('.minus').forEach((button) => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            const cartItem = cart.find((item) => item.productId === productId);
            if (cartItem && cartItem.quantity > 1) {
                cartItem.quantity -= 1;
                renderCart(); // Re-render the cart
            } else if (cartItem) {
                removeFromCart(productId); // Remove item if quantity is 0
            }
            saveToStorage();
        });
    });

    // Remove button
    document.querySelectorAll('.remove_from_cart').forEach((button) => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            removeFromCart(productId); // Remove the item
            saveToStorage();
        });
    });

    // Buy button event listeners
    document.querySelectorAll('.buy').forEach((button) => {
        button.addEventListener('click', () => {
            showBuyPopup(button);
        });
    });
}

function removeFromCart(productId) {
    const index = cart.findIndex((item) => item.productId === productId);
    if (index !== -1) {
        cart.splice(index, 1);
        renderCart(); // Re-render the cart
    }
}

function removeItems() {
    // Clear the cart array and save to storage
    cart.length = 0;
    saveToStorage();
    updateCartQuantity();
}

function updateCartQuantity() {
    let cartQuantity = 0;

    cart.forEach((cartItem) => {
        cartQuantity += cartItem.quantity;
    });

    document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
}

let choosenBuy = [];

// Get elements
const popupForm = document.getElementById('popupForm');
const closeButton = document.querySelector('.close');

function showBuyPopup(button) {
    popupForm.style.display = "flex";
    const parent = button.closest('.product');
    const productId = button.dataset.productId;
    const name = parent.querySelector('#name').innerText.trim();
    const price = parent.querySelector('#price').innerText.trim().replace('₱', '');
    const count = parent.querySelector('#count').innerText.trim();
    const proof = parent.querySelector('#proof').innerText.trim().replace('Proof: ', '');
    const dayOfStock = parent.querySelector('#dayOfStock').innerText.trim().replace('Day of Stock: ', '');
    
    choosenBuy = [{
        id: productId,
        name: name,
        price: price,
        quantity: count
    }];

    const selectedProduct = {
        id: productId,
        name: name,
        price: price,
        quantity: count,
        cproof: proof,
        cdayOfStock: dayOfStock
    };

    document.querySelector('.pPrice').innerText = "Total Price: ₱" + price;
    document.querySelector('.pCount').innerText = "Quantity: " + count;

    // Use the stored email from Firebase auth
    document.querySelector('#inputEmail').value = window.userEmail || "";

    document.querySelector('#inputID').value = selectedProduct.id;
    document.querySelector('#inputPName').value = selectedProduct.name;
    document.querySelector('#inputPPrice').value = selectedProduct.price;
    document.querySelector('#inputPCount').value = selectedProduct.quantity;
    document.querySelector('#inputPProof').value = selectedProduct.cproof;
    document.querySelector('#inputPDayOfStock').value = selectedProduct.cdayOfStock;
}

// Close the popup when the "x" button is clicked
closeButton.addEventListener("click", () => {
    popupForm.style.display = "none";
    nameElement.value = "";
    addressElement.value = "";
});

// Close the popup when clicking outside the form
window.addEventListener("click", (e) => {
    if (e.target === popupForm) {
        popupForm.style.display = "none";
        nameElement.value = "";
        addressElement.value = "";
    }
});

// Handle delivery date radio buttons
document.querySelectorAll('input[name="deliveryDate"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const customDateInput = document.getElementById("customDate");

        if (document.getElementById("custom").checked) {
            customDateInput.disabled = false;
        } else {
            customDateInput.disabled = true;
            customDateInput.value = "";
        }
    });
});

// Select the order form
const orderForm = document.getElementById('myForm');

// Add an event listener for form submission
orderForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Collect form data
    const name = orderForm.elements['name'].value.trim();
    const address = orderForm.elements['address'].value.trim();
    const payment = orderForm.elements['payment'].value;
    const email = orderForm.elements['email'].value;
    const productID = orderForm.elements['inputID'].value;
    const productName = orderForm.elements['inputPName'].value;
    const productPrice = orderForm.elements['inputPPrice'].value;
    const productCount = orderForm.elements['inputPCount'].value;
    const productProof = orderForm.elements['inputPProof'].value;
    const productDayOfStock = orderForm.elements['inputPDayOfStock'].value;

    // Handle delivery date
    const selected = document.querySelector('input[name="deliveryDate"]:checked');
    let deliveryDate = "";

    if (selected) {
        if (selected.value === "Custom") {
            const customDate = document.getElementById("customDate").value;
            if (customDate) {
                deliveryDate = customDate;
            } else {
                alert("Please choose a custom delivery date.");
                return;
            }
        } else {
            deliveryDate = selected.value;
        }
    }

    // Validate required fields
    if (!name || !address || !email) {
        alert("Please fill in all required fields.");
        return;
    }

    // Create order object
    const orderData = {
        name,
        email,
        address, 
        payment,
        productID,   
        basedPrice: productPrice / productCount, 
        productPrice,
        productCount,
        productProof,       
        productDayOfStock,
        deliveryDate,
        status: "Pending",
        timestamp: new Date()
    };

    try {
        // Show loading state
        const submitButton = document.querySelector('.submit');
        const originalText = submitButton.textContent;
        submitButton.textContent = "Processing...";
        submitButton.disabled = true;

        // Add order to Firebase
        const docRef = await addDoc(collection(db, "orders"), orderData);
        
        console.log("Order added to Firebase with ID: ", docRef.id);
        
        // Show success message
        document.getElementById('response').innerHTML = `
            <div style="color: green; margin-top: 10px; padding: 10px; background-color: #e8f5e8; border-radius: 5px;">
                <strong>Order placed successfully!</strong><br>
                Order ID: ${docRef.id} You will receive a confirmation email shortly.
            </div>
        `;

        // Only remove the purchased item from cart AFTER successful Firebase submission
        removeFromCart(productID);
        saveToStorage(); // Make sure to save the updated cart

        // Reset form after successful submission
        setTimeout(() => {
            popupForm.style.display = "none";
            orderForm.reset();
            nameElement.value = "";
            addressElement.value = "";
            document.getElementById('response').innerHTML = "";
            
            // Reset submit button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            
            // Reset delivery date radio buttons
            document.getElementById("today").checked = true;
            document.getElementById("customDate").disabled = true;
            document.getElementById("customDate").value = "";
        }, 3000);

    } catch (error) {
        console.error("Error adding order: ", error);
        console.error("Error details:", error.code, error.message);
        
        // Show error message
        document.getElementById('response').innerHTML = `
            <div style="color: red; margin-top: 10px; padding: 10px; background-color: #ffe8e8; border-radius: 5px;">
                <strong>Error placing order!</strong><br>
                Error: ${error.message}<br>
                Please try again later or contact support.
            </div>
        `;

        // Reset submit button
        const submitButton = document.querySelector('.submit');
        submitButton.textContent = "Submit your Order";
        submitButton.disabled = false;

        // Clear error message after 5 seconds
        setTimeout(() => {
            document.getElementById('response').innerHTML = "";
        }, 5000);
    }
});

// Function to calculate total cart value (optional feature)
function calculateCartTotal() {
    let total = 0;
    cart.forEach((cartItem) => {
        const product = products.find((p) => p.id === cartItem.productId);
        if (product) {
            total += (product.priceCents * cartItem.quantity);
        }
    });
    return total.toFixed(2);
}

// Optional: Add a cart summary section
function renderCartSummary() {
    if (cart.length > 0) {
        const total = calculateCartTotal();
        const summaryHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 20px;">
                <h3 style="color: #006400; margin-bottom: 10px;">Cart Summary</h3>
                <p style="font-size: 1.2rem; font-weight: bold;">Total: ₱${total}</p>
                <button id="checkoutAll" style="width: 100%; padding: 12px; background-color: #008000; color: white; border: none; border-radius: 8px; font-weight: bold; margin-top: 10px; cursor: pointer;">
                    Checkout All Items
                </button>
            </div>
        `;
        
        // Insert summary after the cart content
        const mainContent = document.querySelector('.main');
        let existingSummary = document.querySelector('.cart-summary');
        
        if (existingSummary) {
            existingSummary.remove();
        }
        
        if (cart.length > 0) {
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'cart-summary';
            summaryDiv.innerHTML = summaryHTML;
            mainContent.appendChild(summaryDiv);
            
            // Add event listener for checkout all button
            document.getElementById('checkoutAll').addEventListener('click', () => {
                alert('Checkout all functionality would be implemented soon!');
                // This could open a bulk checkout form
            });
        }
    }
}

// Update the renderCart function to include summary
const originalRenderCart = renderCart;
renderCart = function() {
    originalRenderCart();
    renderCartSummary();
};

// Initialize cart quantity on page load
updateCartQuantity();