import { cart } from './cart.js';

updateCartQuantity();

function updateCartQuantity() {
    let cartQuantity = 0;

    cart.forEach((cartItem) => {
      cartQuantity += cartItem.quantity;
    });
    
    document.querySelector('.js-cart-quantity')
      .innerHTML = cartQuantity;
}

document.querySelector(".remove").addEventListener('click', () => {
  removeItems()
})

function removeItems() {
  localStorage.clear(); // Clear localStorage
  cart.length = 0; // Clear the in-memory cart array
  updateCartQuantity(); // Update the cart quantity display
}