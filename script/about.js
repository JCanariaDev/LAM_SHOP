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
