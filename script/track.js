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
            contentDiv.innerHTML = "<p style='text-align: center;'>Please log in to view your orders.</p>";
        }
    }
});

updateCartQuantity();

document.querySelector(".remove").addEventListener('click', () => {
    removeItems()
})

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

async function loadOrders() {
    try {
        const contentDiv = document.querySelector(".content");
        contentDiv.innerHTML = "<p style='text-align: center;'>Loading orders...</p>";

        // Check if userEmail is available
        if (!userEmail) {
            contentDiv.innerHTML = "<p style='text-align: center;'>User not authenticated.</p>";
            return;
        }

        const q = query(
            collection(db, "orders"),
            where("email", "==", userEmail),  // Filter by email
            orderBy("timestamp", "desc")      // Order by timestamp
        );

        const querySnapshot = await getDocs(q);

        // Clear "Loading..." message now that we're done
        contentDiv.innerHTML = "";

        if (querySnapshot.empty) {
            contentDiv.innerHTML = "<p style='text-align: center;'>No orders found.</p>";
            return;
        }

        let ordersHTML = '';
        let totalNumber = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            console.log("Processing cartItem:", data); // Debugging statement
            const product = products.find((p) => p.id === data.productID.toString());
            console.log("Found product:", product); // Debugging statement

            const orderDiv = document.createElement("div");
            orderDiv.classList.add("order");

            if (product) {
                orderDiv.innerHTML = `
                    <div class="order-box">
                        <h1>Product</h1>
                        <img src="${product.image}" alt="Product Image">
                        <div class="product-detail">
                            <p>Price: ${data.productPrice}</p>
                            <p>Proof: ${data.productProof}</p>
                            <p>Day of Stock: ${data.productDayOfStock}</p>
                            <p>Count: ${data.productCount}</p>
                        </div>
                    </div>
                    <div class="order-box">
                        <div class="payment-detail">
                            <h1>Info</h1>
                            <h3 id="paymentMethod">Payment Method: ${data.payment}</h3>
                            <h3 id="address">Address: ${data.address}</h3>
                            <h3 id="cusName">Customer Name: ${data.name}</h3>
                            <h3 id="cusEmail">Customer Email: ${data.email}</h3>
                            <h3 id="delDate">Delivery Date: ${data.deliveryDate}</h3>
                            <h3 id="status">Status: ${data.status}</h3>
                            <div class="last_row">
                                <button class="cancel">Cancel</button>
                                <button class="recieved">Recieved</button>
                            </div>         
                        </div>
                    </div>
                `;

                totalNumber++;
                contentDiv.appendChild(orderDiv);
                const cancelButton = orderDiv.querySelector(".cancel");
                const recievedButton = orderDiv.querySelector(".recieved");

                cancelButton.addEventListener("click", async () => {
                    try {
                        await deleteDoc(doc.ref); // Use the unique doc reference
                        alert("Order cancelled successfully.");
                        orderDiv.remove(); // Remove from UI
                    } catch (error) {
                        console.error("Error cancelling order:", error);
                        alert("Failed to cancel order.");
                    }
                });

                recievedButton.addEventListener("click", async () => {
                    try {
                        await updateDoc(doc.ref, {
                            status: "Recieved"
                        });
                        alert("Order marked as received.");
                        const statusElement = orderDiv.querySelector("#status");
                        if (statusElement) statusElement.textContent = "Status: Recieved";
                    } catch (error) {
                        console.error("Error updating status:", error);
                        alert("Failed to update status.");
                    }
                });

            } else {
                console.warn("Product not found for cartItem:", data); // Debugging statement
            }
        });

        console.log("Total number of orders:", totalNumber); // Debugging statement
    } catch (error) {
        console.error("Error retrieving data from Firebase:", error);
        alert("Unable to retrieve orders. Please check your internet connection or try again later.");
    }
}

// Remove the initPage function since we're now handling everything in onAuthStateChanged
// document.addEventListener('DOMContentLoaded', initPage);