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


/* login.php
File
look at that 3 files, now can you create or add a code in cart_script.js to be able to insert data into the Firebase database. Also ofcourse their is firebase-config.js i also add that after you give the code, so basically i want is the cart_script.js is same as main.js like in the firebase_ecommerce_site folder you give me* */