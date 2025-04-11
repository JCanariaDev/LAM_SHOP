import { products } from './items.js';
import { cart, saveToStorage } from './cart.js';
import { db } from './firebase-config.js';
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

//import { showAlert } from './custom_alert/custom_alert.js';
/*if (!sessionStorage.getItem("refreshed")) {
    sessionStorage.setItem("refreshed", "true");
    location.reload();
}*/

// Get the input values safely
const nameElement = document.getElementById("inputName");
const addressElement = document.getElementById("inputAddress");
const paymentElement = document.getElementById("inputPayment");

document.querySelector(".remove").addEventListener('click', () => {
    removeItems()
    renderCart();
})

renderCart();

function renderCart() {
    
    let cartHTML = '';
  
    cart.forEach((cartItem) => {
        const product = products.find((p) => p.id === cartItem.productId);
        //const product = products.find((p) => p.id === cartItem.productId);
        
        if (product) {
            cartHTML += `
                <div class="product">
                    <div class="content_center">
                        <img src="${product.image}">     
                    </div>              
                    <h3 id="name">${product.name}</h3>
                    <p id="price">Price: ${product.priceCents * cartItem.quantity}</p>
                    <p id="proof">Proof: ${product.proof}</p>
                    <p id="dayOfStock">Day of Stock: ${product.dayOfStock}</p>
                    <div class="add_minus">
                        <button class="minus" data-product-id="${product.id}">-</button>
                        <h4 data-product-count="${product.id}" id="count" class="count">${cartItem.quantity}</h4>
                        <button class="add" data-product-id="${product.id}">+</button>
                    </div>
                    <div class="last_row">
                        <button class="remove_from_cart" data-product-id="${product.id}">Remove</button>
                        <button class="buy" data-product-id="${product.id}">Buy</button>
                    </div>         
                </div>
            `;
        }
    });

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
            //location.reload();
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
            //location.reload();
        });
    });

    // Remove button
    document.querySelectorAll('.remove_from_cart').forEach((button) => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            removeFromCart(productId); // Remove the item
            saveToStorage();
            //location.reload();
        });
    });
}

function removeFromCart(productId) {
    const index = cart.findIndex((item) => item.productId === productId);
    if (index !== -1) {
        cart.splice(index, 1);
        renderCart(); // Re-render the cart
        location.reload();
    }
}
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

    document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
}

let choosenBuy = [];

// Get elements
const buyButton = document.querySelectorAll('.buy');
const popupForm = document.getElementById('popupForm');
const closeButton = document.querySelector('.close');

// Show the popup when the "Buy" button is clicked
buyButton.forEach((button) => {
    button.addEventListener('click', () => {
        popupForm.style.display = "flex"; // Display the popup as a flex container
        const parent = button.closest('.product');
        const productId = parent.querySelector('.buy').dataset.productId;
        const name = parent.querySelector('#name').innerText.trim(); // Use querySelector for selecting elements inside parent
        //const price = parent.querySelector('#price').innerText.trim(); // Use querySelector
        const price = parent.querySelector('#price').innerText.trim().replace('Price: ', ''); // Remove 'Price: ' prefix
        const count = parent.querySelector('#count').innerText.trim(); 
        const proof = parent.querySelector('#proof').innerText.trim().replace('Proof: ', '');
        const dayOfStock = parent.querySelector('#dayOfStock').innerText.trim().replace('Day of Stock: ', '');
        choosenBuy.push({
            id: productId,
            name: name,
            price: price, //this is a string
            quantity: count
        });

        const selectedProduct = {
            id: productId,
            name: name,
            price: price,
            quantity: count,
            cproof: proof,
            cdayOfStock: dayOfStock
        };

        //document.querySelector('.id').innerText = choosenBuy.at(0).id;
        //document.querySelector('.pName').innerText = "Name: " + choosenBuy.at(0).name;
        document.querySelector('.pPrice').innerText = "Price: " + choosenBuy.at(0).price ;
        document.querySelector('.pCount').innerText = "Quantity: " + choosenBuy.at(0).quantity;

        
        document.querySelector('#inputEmail').value = "" + localStorage.getItem('userEmail') + "";

        document.querySelector('#inputID').value = selectedProduct.id;
        document.querySelector('#inputPName').value = selectedProduct.name;
        document.querySelector('#inputPPrice').value = selectedProduct.price;
        document.querySelector('#inputPCount').value = selectedProduct.quantity;
        document.querySelector('#inputPProof').value = selectedProduct.cproof;
        document.querySelector('#inputPDayOfStock').value = selectedProduct.cdayOfStock;

        choosenBuy.length = 0; // Clear the array after setting the input values

        //removeFromCart(selectedProduct.id)

    });
});

document.querySelectorAll('input[name="deliveryDate"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const customDateInput = document.getElementById("customDate");

        if (document.getElementById("custom").checked) {
            customDateInput.disabled = false;
        } else {
            customDateInput.disabled = true;
            customDateInput.value = ""; // Optionally clear the date
        }
    });
});

// Select the order form
const orderForm = document.getElementById('myForm');

// Add an event listener for form submission
orderForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Collect form data
    const name = orderForm.elements['name'].value.trim();
    const address = orderForm.elements['address'].value.trim();
    const payment = orderForm.elements['payment'].value;
    const email = orderForm.elements['email'].value;
    const productID = orderForm.elements['inputID'].value;
    //const productName = orderForm.elements['inputPName'].value;
    const productPrice = orderForm.elements['inputPPrice'].value;
    const productCount = orderForm.elements['inputPCount'].value;
    const productProof = orderForm.elements['inputPProof'].value;
    const productDayOfStock = orderForm.elements['inputPDayOfStock'].value;

    /*const deliveryDate = orderForm.elements['deliveryDate'].value;
    const deliveryTime = orderForm.elements['deliveryTime'].value;
    const deliveryMethod = orderForm.elements['deliveryMethod'].value;*/

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
                return; // Stop submission
            }
        } else {
            deliveryDate = selected.value;
        }
    } else {
        alert("Please select a delivery date.");
        return; // Stop submission
    }



    try {
        await addDoc(collection(db, "orders"), {
            name,
            email,
            address, 
            payment,
            productID,    
            productPrice,
            productCount,
            productProof,
            productDayOfStock,
            deliveryDate,
            status: "Pending",
            timestamp: new Date()
        });
        removeFromCart(productID); // Remove the item from the cart after placing the order
        saveToStorage();
        alert("Order placed!");
        window.location.href = 'track_orders.html';
    } catch (e) {
    alert("Error placing order: " + e.message);
    }

    /*try {
        // Send the data to the server via POST in JSON format
        const response = await fetch('http://localhost/LAM_WEBSITE/php/insert_order.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, address, payment, productID, productName, productPrice, productCount, productProof, productDayOfStock })
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        // Parse the JSON response
        const result = await response.json();
        //removeFromCart(productID);

        // Handle the response
        if (result.success) {
            alert('Order placed successfully!');
            window.location.href = 'track_orders.html';
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }*/
});


// Close the popup when the "x" button is clicked
closeButton.addEventListener("click", () => {
    popupForm.style.display = "none";
        nameElement.value = ""
        addressElement.value = ""
      //location.reload();
});

// Close the popup when clicking outside the form
window.addEventListener("click", (e) => {
    if (e.target === popupForm) {
        popupForm.style.display = "none";
        nameElement.value = ""
        addressElement.value = ""
    }
});
// Get the submit button
/*const submit = document.querySelector(".submit");

submit.addEventListener("click", (event) => {
    // Prevent the default form submission behavior
    event.preventDefault();

    if (!nameElement || !addressElement || !paymentElement) {
        console.error("One or more input elements are missing from the DOM.");
        return;
    }

    const name = nameElement.value.trim();
    const address = addressElement.value.trim();
    const payment = paymentElement.value;

    // Check if the inputs are empty
    if (name === "" || address === "" || payment === "") {
        alert("Please fill out all the fields before submitting.")
        //showAlert("Please fill out all the fields before submitting.")
    } else {
        alert("Submit!")
        //showAlert("Submit!");


        const formData = new FormData(document.getElementById('myForm'));

        fetch('/php/insert_user.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const responseDiv = document.getElementById('response');
            if (data.success) {
                responseDiv.textContent = data.message;
                console.log(data.message);
                responseDiv.style.color = 'green';
            } else {
                responseDiv.textContent = data.message;
                console.log(data.message);
                responseDiv.style.color = 'red';
            }
        })
        .catch(error => console.error('Error:', error));
        nameElement.value = ""
        addressElement.value = ""
    }
});*/


