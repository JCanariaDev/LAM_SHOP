export let cart;

loadFromStorage();

export function loadFromStorage() {
  cart = JSON.parse(localStorage.getItem('cart'));

  if (!cart) {
    cart = [];
  }
}

export function saveToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function addToCart(productId, count) {
  let matchingItem;

  cart.forEach((cartItem) => {
    if (productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });

  if (matchingItem) {
    matchingItem.quantity += count;
  } else if (count === 0) {
    return;
  } else {
    cart.push({
      productId: productId,
      quantity: count
    });
  }

  saveToStorage();
}

// Add this new function to remove a product from cart
export function removeFromCart(productId) {
  const index = cart.findIndex((item) => item.productId === productId);
  if (index !== -1) {
    cart.splice(index, 1);
    saveToStorage();
    return true;
  }
  return false;
}