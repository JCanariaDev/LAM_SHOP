import { cart } from './cart.js';
import { products } from './items.js';
import { db } from './firebase-config.js';
import { collection, where, deleteDoc, updateDoc, addDoc, getDocs ,query, orderBy  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

        const userEmail = localStorage.getItem('userEmail');
        
        const q = query(
            collection(db, "orders"),
            where("email", "==", userEmail),  // Filter by email
            orderBy("timestamp", "desc")      // Order by timestamp
        );
        //const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        // Clear "Loading..." message now that we're done
        contentDiv.innerHTML = "";

        //const querySnapshot = await getDocs(collection(db, "orders"));
        const totalOrders = querySnapshot.size; // This gives the number of documents

        /*contentDiv.innerHTML = ""; // Clear previous content

        if (totalOrders === 0) {
            contentDiv.innerHTML = "<p style='text-align: center;'>No orders found.</p>";
            return;
        }*/

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

async function initPage() {
    await loadOrders();
}

document.addEventListener('DOMContentLoaded', initPage);


/*document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("http://localhost/LAM_WEBSITE/php/track.php", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data); // Debugging statement

        const contentDiv = document.querySelector(".content");
        contentDiv.innerHTML = ""; // Clear previous content

        if (data.length === 0) {
            contentDiv.innerHTML = "<p>No orders found.</p>";
            return;
        }

        let ordersHTML = '';

        data.forEach((cartItem) => {
            console.log("Processing cartItem:", cartItem); // Debugging statement
            const product = products.find((p) => p.id === cartItem.product_id.toString());
            console.log("Found product:", product); // Debugging statement

            if (product) {
                ordersHTML += `  
                    <div class="product">
                        <div class="content_center">
                            <img src="${product.image}">     
                        </div>              
                        <p id="price">Price: ${cartItem.product_price}</p>
                        <p>Proof: ${cartItem.proof}</p>
                        <p>Day of Stock: ${cartItem.dayOfStock}</p>
                        <p><strong>Quantity:</strong> ${cartItem.product_count}</p>
                        <h3 id="status">Status: ${cartItem.status}</h3>
                        <div class="last_row">
                            <button class="cancel">Cancel</button>
                            <button class="recieved">Recieved</button>
                        </div>         
                    </div>
                `;
            } else {
                console.warn("Product not found for cartItem:", cartItem); // Debugging statement
            }
        });

        document.querySelector('.content').innerHTML = ordersHTML;
    } catch (error) {
        console.error("Error fetching orders:", error);
        alert("An error occurred while retrieving orders. Please try again later.");
    }
});*/