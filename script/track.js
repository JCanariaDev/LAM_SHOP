import { cart } from './cart.js';
import { products } from './items.js';
import { db } from './firebase-config.js';
import { collection, where, deleteDoc, updateDoc, addDoc, getDocs ,query, orderBy  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Move Firebase config and initialization to the top
const firebaseConfig = {
    apiKey: "AIzaSyA0wmUiGJ90sy0h0RTF9Q9BsVMlXoKrs04",
    authDomain: "simplewebdb.firebaseapp.com",
    projectId: "simplewebdb",
    storageBucket: "simplewebdb.firebasestorage.app",
    messagingSenderId: "757799625418",
    appId: "1:757799625418:web:3fa10727ad1ffb9e9e4a33",
    measurementId: "G-G6PBLPTHMG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let userEmail = null;

// Set up authentication state listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userEmail = user.email;
        console.log('User email:', userEmail);
        // Load orders only after we have the user email
        await loadOrders();
    } else {
        userEmail = null;
        console.log('No user logged in');
        // Handle case when user is not logged in
        const contentDiv = document.querySelector(".content");
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <svg width="48" height="48" fill="#dc3545" viewBox="0 0 20 20" style="margin-bottom: 1rem;">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <h3 style="color: #dc3545; margin-bottom: 0.5rem;">Authentication Required</h3>
                    <p style="color: #666;">Please log in to view your orders.</p>
                </div>
            `;
        }
    }
});

updateCartQuantity();

// Enhanced remove items functionality with confirmation
document.querySelector(".remove").addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all cart items?')) {
        removeItems();
        showNotification('🗑️ Cart cleared successfully!');
    }
});

function removeItems() {
    localStorage.clear(); // Clear localStorage
    cart.length = 0; // Clear the in-memory cart array
    updateCartQuantity(); // Update the cart quantity display
}

function updateCartQuantity() {
    let cartQuantity = 0;

    cart.forEach((cartItem) => {
        cartQuantity += cartItem.quantity;
    });

    document.querySelector('.js-cart-quantity')
        .innerHTML = cartQuantity;
}

// Enhanced notification system
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    if (notification && notificationMessage) {
        notificationMessage.textContent = message;
        
        // Remove existing type classes
        notification.classList.remove('success', 'error', 'warning', 'info');
        
        // Add appropriate styling based on type
        switch(type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ffc107';
                notification.style.color = '#333';
                break;
            default:
                notification.style.backgroundColor = '#17a2b8';
                notification.style.color = '#fff';
        }
        
        notification.classList.add('show');
        
        // Auto hide after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
}

// Generate random order ID for demo purposes
function generateOrderId() {
    const prefix = 'LAM';
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    return prefix + randomNum;
}

// Format date for display
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusLower = status.toLowerCase();
    let badgeClass = 'status';
    
    switch(statusLower) {
        case 'pending':
            badgeClass += ' pending';
            break;
        case 'processing':
            badgeClass += ' processing';
            break;
        case 'shipped':
        case 'out for delivery':
            badgeClass += ' shipped';
            break;
        case 'delivered':
        case 'recieved':
            badgeClass += ' delivered';
            break;
        case 'cancelled':
            badgeClass += ' cancelled';
            break;
        default:
            badgeClass += ' pending';
    }
    
    return `<span class="${badgeClass}">${status}</span>`;
}

async function loadOrders() {
    try {
        const contentDiv = document.querySelector(".content");
        
        // Enhanced loading state
        contentDiv.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #008000; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
                <h3 style="color: #008000; margin-bottom: 0.5rem;">Loading Your Orders</h3>
                <p style="color: #666;">Please wait while we fetch your order history...</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;

        // Check if userEmail is available
        if (!userEmail) {
            contentDiv.innerHTML = `
                <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <svg width="48" height="48" fill="#dc3545" viewBox="0 0 20 20" style="margin-bottom: 1rem;">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <h3 style="color: #dc3545; margin-bottom: 0.5rem;">Authentication Error</h3>
                    <p style="color: #666;">User not authenticated. Please refresh the page and try again.</p>
                </div>
            `;
            return;
        }

        const q = query(
            collection(db, "orders"),
            where("email", "==", userEmail),  // Filter by email
            orderBy("timestamp", "desc")      // Order by timestamp
        );

        const querySnapshot = await getDocs(q);

        // Clear loading message
        contentDiv.innerHTML = "";

        if (querySnapshot.empty) {
            contentDiv.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <svg width="64" height="64" fill="#6c757d" viewBox="0 0 20 20" style="margin-bottom: 1rem;">
                        <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zM8 6a2 2 0 114 0v1H8V6zm0 3a1 1 0 012 0 1 1 0 11-2 0zm4 0a1 1 0 112 0 1 1 0 11-2 0z" clip-rule="evenodd"/>
                    </svg>
                    <h3 style="color: #6c757d; margin-bottom: 0.5rem;">No Orders Found</h3>
                    <p style="color: #666; margin-bottom: 1.5rem;">You haven't placed any orders yet.</p>
                    <a href="products.html" style="display: inline-block; background-color: #008000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Start Shopping</a>
                </div>
            `;
            return;
        }

        let totalNumber = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            console.log("Processing cartItem:", data); // Debugging statement
            const product = products.find((p) => p.id === data.productID.toString());
            console.log("Found product:", product); // Debugging statement

            const orderDiv = document.createElement("div");
            orderDiv.classList.add("order");

            if (product) {
                // Generate order ID if not present
                //const orderId = data.orderId || generateOrderId();
                const orderId = doc.id;
                
                // Format timestamp
                //const orderDate = data.timestamp ? formatDate(data.timestamp.toDate()) : 'Date not available';
                
                orderDiv.innerHTML = `
                    <div class="order-header">
                        <div class="order-id">Order ID: ${orderId}</div>
                    </div>
                    <div class="order-body">
                        <div class="order-box">
                            <h1>Product Details</h1>
                            <img src="${product.image}" alt="Product Image">
                            <div class="product-detail">
                                <p><strong>Product:</strong> ${product.name || 'Lambanog'}</p>
                                <p><strong>Price:</strong> ₱${data.basedPrice}</p>
                                <p><strong>Proof:</strong> ${data.productProof}%</p>
                                <p><strong>Stock Date:</strong> ${data.productDayOfStock}</p>
                                <p><strong>Quantity:</strong> ${data.productCount}</p>
                                <p><strong>Total Amount:</strong> ₱${parseFloat(data.productPrice)}</p>
                            </div>
                        </div>
                        <div class="order-box">
                            <div class="payment-detail">
                                <h1>Order Information</h1>
                                <h3><strong>Payment Method:</strong> ${data.payment}</h3>
                                <h3><strong>Delivery Address:</strong> ${data.address}</h3>
                                <h3><strong>Customer Name:</strong> ${data.name}</h3>
                                <h3><strong>Email:</strong> ${data.email}</h3>
                                <h3><strong>Delivery Date:</strong> ${data.deliveryDate}</h3>
                                <h3><strong>Status:</strong> ${getStatusBadge(data.status)}</h3>
                                <div class="last_row">
                                    <button class="cancel" ${data.status.toLowerCase() === 'cancelled' || data.status.toLowerCase() === 'delivered' || data.status.toLowerCase() === 'recieved' ? 'disabled' : ''}>
                                        ${data.status.toLowerCase() === 'cancelled' ? 'Cancelled' : 'Cancel Order'}
                                    </button>
                                    <button class="recieved" ${data.status.toLowerCase() === 'recieved' || data.status.toLowerCase() === 'delivered' ? 'disabled' : ''}>
                                        ${data.status.toLowerCase() === 'recieved' || data.status.toLowerCase() === 'delivered' ? 'Received' : 'Mark as Received'}
                                    </button>
                                </div>         
                            </div>
                        </div>
                    </div>
                `;

                totalNumber++;
                contentDiv.appendChild(orderDiv);
                
                const cancelButton = orderDiv.querySelector(".cancel");
                const recievedButton = orderDiv.querySelector(".recieved");

                cancelButton.addEventListener("click", async () => {
                    if (cancelButton.disabled) return;
                    
                    if (confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
                        try {
                            cancelButton.disabled = true;
                            cancelButton.textContent = "Cancelling...";
                            
                            await deleteDoc(doc.ref); // Use the unique doc reference
                            showNotification("✅ Order cancelled successfully!", "success");
                            orderDiv.remove(); // Remove from UI
                        } catch (error) {
                            console.error("Error cancelling order:", error);
                            showNotification("❌ Failed to cancel order. Please try again.", "error");
                            cancelButton.disabled = false;
                            cancelButton.textContent = "Cancel Order";
                        }
                    }
                });

                /*recievedButton.addEventListener("click", async () => {
                    if (recievedButton.disabled) return;
                    
                    if (confirm("Mark this order as received?")) {
                        try {
                            recievedButton.disabled = true;
                            recievedButton.textContent = "Updating...";
                            
                            await updateDoc(doc.ref, {
                                status: "Recieved"
                            });
                            showNotification("✅ Order marked as received!", "success");
                            
                            // Update UI
                            const statusElement = orderDiv.querySelector("#status");
                            if (statusElement) {
                                statusElement.innerHTML = `<strong>Status:</strong> ${getStatusBadge("Recieved")}`;
                            }
                            recievedButton.textContent = "Received";
                            cancelButton.disabled = true;
                            cancelButton.textContent = "Cancelled";
                        } catch (error) {
                            console.error("Error updating status:", error);
                            showNotification("❌ Failed to update status. Please try again.", "error");
                            recievedButton.disabled = false;
                            recievedButton.textContent = "Mark as Received";
                        }
                    }
                });*/

                recievedButton.addEventListener("click", async () => {
                if (recievedButton.disabled) return;
                
                if (confirm("Mark this order as received?")) {
                    try {
                        recievedButton.disabled = true;
                        recievedButton.textContent = "Updating...";
                        
                        await updateDoc(doc.ref, {
                            status: "Recieved"
                        });
                        showNotification("✅ Order marked as received!", "success");
                        
                        // Update UI immediately
                        const statusBadge = orderDiv.querySelector(".status");
                        if (statusBadge) {
                            statusBadge.textContent = "Recieved";
                            // Remove all status classes
                            statusBadge.className = "status delivered"; // Use 'delivered' class since it has the same styling
                        }
                        
                        recievedButton.textContent = "Received";
                        cancelButton.disabled = true;
                        cancelButton.textContent = "Cancelled";
                    } catch (error) {
                        console.error("Error updating status:", error);
                        showNotification("❌ Failed to update status. Please try again.", "error");
                        recievedButton.disabled = false;
                        recievedButton.textContent = "Mark as Received";
                    }
                }
            });

            } else {
                console.warn("Product not found for cartItem:", data); // Debugging statement
                // Handle case where product is not found
                orderDiv.innerHTML = `
                    <div class="order-header">
                        <div class="order-id">Order #${data.orderId || generateOrderId()}</div>
                        <div class="order-date">${data.timestamp ? formatDate(data.timestamp.toDate()) : 'Date not available'}</div>
                    </div>
                    <div class="order-body">
                        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background-color: #f8f9fa; border-radius: 8px;">
                            <svg width="48" height="48" fill="#dc3545" viewBox="0 0 20 20" style="margin-bottom: 1rem;">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                            </svg>
                            <h3 style="color: #dc3545; margin-bottom: 0.5rem;">Product Information Unavailable</h3>
                            <p style="color: #666;">The product details for this order could not be loaded.</p>
                        </div>
                    </div>
                `;
                contentDiv.appendChild(orderDiv);
            }
        });

        console.log("Total number of orders:", totalNumber); // Debugging statement
        
        // Show summary
        if (totalNumber > 0) {
            showNotification(`📦 Loaded ${totalNumber} order${totalNumber !== 1 ? 's' : ''} successfully!`, "success");
        }
        
    } catch (error) {
        console.error("Error retrieving data from Firebase:", error);
        const contentDiv = document.querySelector(".content");
        contentDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <svg width="48" height="48" fill="#dc3545" viewBox="0 0 20 20" style="margin-bottom: 1rem;">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <h3 style="color: #dc3545; margin-bottom: 0.5rem;">Connection Error</h3>
                <p style="color: #666; margin-bottom: 1.5rem;">Unable to retrieve orders. Please check your internet connection or try again later.</p>
                <button onclick="location.reload()" style="background-color: #008000; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold;">Retry</button>
            </div>
        `;
        showNotification("❌ Failed to load orders. Please check your connection.", "error");
    }
}