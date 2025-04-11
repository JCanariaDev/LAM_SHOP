
import { products } from './items.js';
import { cart, addToCart } from './cart.js';


document.querySelector(".remove").addEventListener('click', () => {
    removeItems()
})
//------------
renderProductsGrid()

function renderProductsGrid() {
    let productsHTML = '';
  
    products.forEach((product) => {
      productsHTML += `
        <div class="product">
            <div class="content_center">
                <img src="${product.image}">     
            </div>              
            <p>Prices: ${product.priceCents}</p>
            <p>Proof: ${product.proof}</p>
            <p>Day of Stock: ${product.dayOfStock}</p>
            <div class="add_minus">
                <button class="minus" >-</button>
                <h4 data-product-count="${product.id}" class="count" >0</h4>
                <button class="add" >+</button>
            </div>
            <div class="last_row">
                <button class="add_to_cart" data-product-id="${product.id}" >Add to Cart</button>
            </div>         
        </div>
      `;
    });
  
    document.querySelector('.content').innerHTML = productsHTML;

    document.querySelectorAll('.add_to_cart')
    .forEach((button) => {
      button.addEventListener('click', () => {
          const productId = button.dataset.productId;
  
          // Find the parent container for this specific product
          const parent = button.closest('.product'); 
          
          // Get the count element within this specific product
          const countElement = parent.querySelector('.count'); 
          
          // Parse the count from the count element
          const productCount = parseInt(countElement.innerHTML.trim(), 10);
  
          // Call the addToCart function with the specific product ID and count
          addToCart(productId, productCount);
  
          // Update the cart quantity display
          updateCartQuantity();
  
          // Reset the count for this specific product
          countElement.innerHTML = "0";
      });
    });
  
}

function updateCartQuantity() {
    let cartQuantity = 0;

    cart.forEach((cartItem) => {
      cartQuantity += cartItem.quantity;
    });
    
    document.querySelector('.js-cart-quantity')
      .innerHTML = cartQuantity;
}
function removeItems() {
    localStorage.clear(); // Clear localStorage
    cart.length = 0; // Clear the in-memory cart array
    updateCartQuantity(); // Update the cart quantity display
}

updateCartQuantity()

const buttons_add = document.querySelectorAll('.add');
// Loop through each button and attach the event listener
buttons_add.forEach((button) => {
    button.addEventListener('click', (event) => {
        const parent = button.closest('.product'); // Find the parent product container
        const countElement = parent.querySelector('.count'); // Find the count element within this product
        const count = parseInt(countElement.innerHTML.trim(), 10); // Get the current count
        countElement.innerHTML = count + 1; // Increment the count
    });
});

const buttons_minus = document.querySelectorAll('.minus');
// Loop through each button and attach the event listener
buttons_minus.forEach((button) => {
    button.addEventListener('click', (event) => {
        const parent = button.closest('.product'); // Find the parent product container
        const countElement = parent.querySelector('.count'); // Find the count element within this product
        const count = parseInt(countElement.innerHTML.trim(), 10); // Get the current count
        if (count === 0){
            return;
        }
        countElement.innerHTML = count - 1; // Decrement the count
    });
});
