import { cart } from './cart.js';
import { db } from './firebase-config.js';
import { collection, where, deleteDoc, updateDoc, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
let firestoreProducts = [];

// Set up authentication state listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userEmail = user.email;
        console.log('User email:', userEmail);
        // Load products first, then orders
        await loadProducts();
        await loadOrders();
    } else {
        userEmail = null;
        console.log('No user logged in');
        showAuthError();
    }
});

async function loadProducts() {
    try {
        const productsQuery = await getDocs(collection(db, "all_products"));
        firestoreProducts = [];
        productsQuery.forEach((doc) => {
            firestoreProducts.push({
                id: doc.id,
                ...doc.data()
            });
        });
        console.log('Loaded products from Firestore:', firestoreProducts);
    } catch (error) {
        console.error("Error loading products:", error);
        showNotification("❌ Failed to load products. Some order details may be limited.", "error");
    }
}

function showAuthError() {
    const contentDiv = document.querySelector(".content");
    if (contentDiv) {
        contentDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <svg width="48" height="48" fill="#dc3545" viewBox="0 0 20 20" style="margin-bottom: 1rem;">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <h3 style="color: #dc3545; margin-bottom: 0.5rem;">Authentication Required</h3>
                <p style="color: #666;">Please log in to view your orders.</p>
            </div>
        `;
    }
}

updateCartQuantity();

document.querySelector(".remove")?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all cart items?')) {
        removeItems();
        showNotification('🗑️ Cart cleared successfully!', 'success');
    }
});

function removeItems() {
    localStorage.clear();
    cart.length = 0;
    updateCartQuantity();
}

function updateCartQuantity() {
    let cartQuantity = 0;
    cart.forEach((cartItem) => {
        cartQuantity += cartItem.quantity;
    });
    const cartBadge = document.querySelector('.js-cart-quantity');
    if (cartBadge) {
        cartBadge.innerHTML = cartQuantity;
    }
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    if (notification && notificationMessage) {
        notificationMessage.textContent = message;
        notification.className = 'toast show ' + type;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
}

function formatDate(date) {
    if (!date) return 'Date not available';
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(d);
}

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
        
        // Show loading state
        contentDiv.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
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

        if (!userEmail) {
            showAuthError();
            return;
        }

        const q = query(
            collection(db, "orders"),
            where("email", "==", userEmail),
            orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(q);
        contentDiv.innerHTML = "";

        if (querySnapshot.empty) {
            contentDiv.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
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

        let totalOrders = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const orderDiv = document.createElement("div");
            orderDiv.classList.add("order");

            // Try to find product in Firestore products
            const product = firestoreProducts.find((p) => p.id === data.productID);
            
            // Validate image URL and provide fallback if invalid
            let productImage = 'images/container.png';
            if (product?.image) {
                try {
                    new URL(product.image);
                    productImage = product.image;
                } catch (e) {
                    // URL is invalid, use fallback
                }
            }
            
            // Format order data
            const orderId = doc.id;
            const orderDate = formatDate(data.timestamp);
            const productName = product?.name || data.inputPName || 'Lambanog Product';
            
            orderDiv.innerHTML = `
                <div class="order-header">
                    <div class="order-id">Order ID: ${orderId}</div>
                    <div class="order-date">${orderDate}</div>
                </div>
                <div class="order-body">
                    <div class="order-box">
                        <h1>Product Details</h1>
                        <img src="${productImage}" alt="Product Image" onerror="this.src='images/container.png'">
                        <div class="product-detail">
                            <p><strong>Product:</strong> ${productName}</p>
                            <p><strong>Price:</strong> ₱${data.basedPrice || data.productPrice / data.productCount || 'N/A'}</p>
                            <p><strong>Proof:</strong> ${data.productProof || product?.proof || 'N/A'}%</p>
                            <p><strong>Stock Date:</strong> ${data.productDayOfStock || product?.dayOfStock || 'N/A'}</p>
                            <p><strong>Quantity:</strong> ${data.productCount}</p>
                            <p><strong>Total Amount:</strong> ₱${parseFloat(data.productPrice) || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="order-box">
                        <div class="payment-detail">
                            <h1>Order Information</h1>
                            <h3><strong>Payment Method:</strong> ${data.payment || 'Not specified'}</h3>
                            <h3><strong>Delivery Address:</strong> ${data.address || 'Not specified'}</h3>
                            <h3><strong>Customer Name:</strong> ${data.name || 'Not specified'}</h3>
                            <h3><strong>Email:</strong> ${data.email || userEmail || 'Not specified'}</h3>
                            <h3><strong>Delivery Date:</strong> ${data.deliveryDate || 'Not specified'}</h3>
                            <h3><strong>Status:</strong> ${getStatusBadge(data.status || 'Pending')}</h3>
                            <div class="last_row">
                                <button class="cancel" ${['cancelled', 'delivered', 'recieved'].includes(data.status?.toLowerCase()) ? 'disabled' : ''}>
                                    ${data.status?.toLowerCase() === 'cancelled' ? 'Cancelled' : 'Cancel Order'}
                                </button>
                                <button class="recieved" ${['recieved', 'delivered', 'cancelled'].includes(data.status?.toLowerCase()) ? 'disabled' : ''}>
                                    ${['recieved', 'delivered'].includes(data.status?.toLowerCase()) ? 'Received' : 'Mark as Received'}
                                </button>
                            </div>         
                        </div>
                    </div>
                </div>
            `;

            totalOrders++;
            contentDiv.appendChild(orderDiv);
            
            // Add event listeners for buttons
            const cancelButton = orderDiv.querySelector(".cancel");
            const recievedButton = orderDiv.querySelector(".recieved");

            cancelButton?.addEventListener("click", async () => {
                if (cancelButton.disabled) return;
                
                if (confirm("Are you sure you want to cancel this order?")) {
                    try {
                        cancelButton.disabled = true;
                        cancelButton.textContent = "Cancelling...";
                        
                        await updateDoc(doc.ref, {
                            status: "Cancelled",
                            cancelledAt: new Date()
                        });
                        
                        showNotification("✅ Order cancelled successfully!", "success");
                        cancelButton.textContent = "Cancelled";
                        
                        // Update status display
                        const statusElement = orderDiv.querySelector(".status");
                        if (statusElement) {
                            statusElement.textContent = "Cancelled";
                            statusElement.className = "status cancelled";
                        }

                        // Immediately disable and update the "Mark as Received" button
                        const recievedButton = orderDiv.querySelector(".recieved");
                        if (recievedButton) {
                            recievedButton.disabled = true;
                            recievedButton.textContent = "Received";
                        }
                    } catch (error) {
                        console.error("Error cancelling order:", error);
                        showNotification("❌ Failed to cancel order", "error");
                        cancelButton.disabled = false;
                        cancelButton.textContent = "Cancel Order";
                    }
                }
            });

            recievedButton?.addEventListener("click", async () => {
                if (recievedButton.disabled) return;
                
                if (confirm("Mark this order as received?")) {
                    try {
                        recievedButton.disabled = true;
                        recievedButton.textContent = "Updating...";
                        
                        await updateDoc(doc.ref, {
                            status: "Recieved",
                            receivedAt: new Date()
                        });
                        
                        showNotification("✅ Order marked as received!", "success");
                        recievedButton.textContent = "Received";
                        
                        // Update status display
                        const statusElement = orderDiv.querySelector(".status");
                        if (statusElement) {
                            statusElement.textContent = "Recieved";
                            statusElement.className = "status delivered";
                        }
                        
                        // Disable cancel button if needed
                        if (cancelButton) {
                            cancelButton.disabled = true;
                            cancelButton.textContent = "Cancelled";
                        }
                    } catch (error) {
                        console.error("Error updating status:", error);
                        showNotification("❌ Failed to update status", "error");
                        recievedButton.disabled = false;
                        recievedButton.textContent = "Mark as Received";
                    }
                }
            });
        });

        if (totalOrders > 0) {
            showNotification(`📦 Loaded ${totalOrders} order${totalOrders !== 1 ? 's' : ''} successfully!`, "success");
        }
        
    } catch (error) {
        console.error("Error loading orders:", error);
        const contentDiv = document.querySelector(".content");
        contentDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <svg width="48" height="48" fill="#dc3545" viewBox="0 0 20 20" style="margin-bottom: 1rem;">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <h3 style="color: #dc3545; margin-bottom: 0.5rem;">Error Loading Orders</h3>
                <p style="color: #666; margin-bottom: 1.5rem;">We couldn't load your orders. Please try again later.</p>
                <button onclick="location.reload()" style="background-color: #008000; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold;">Try Again</button>
            </div>
        `;
        showNotification("❌ Failed to load orders", "error");
    }
}