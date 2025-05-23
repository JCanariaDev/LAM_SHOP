import { products } from './items.js';
import { cart, addToCart } from './cart.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Render products grid first
    renderProductsGrid();
    
    // Update cart quantity display
    updateCartQuantity();
    
    // Add event listeners for adding and removing items
    setupEventListeners();
});

function renderProductsGrid() {
    const contentContainer = document.querySelector('.content');
    if (!contentContainer) {
        console.error('Content container not found');
        return;
    }
    
    let productsHTML = '';
  
    products.forEach((product) => {
      productsHTML += `
        <div class="product" data-product-id="${product.id}">
            <div class="content_center">
                <img src="${product.image}" alt="${product.name}">     
            </div>
            <div class="product-details">
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">₱${product.priceCents}</p>
                    <p>Proof: ${product.proof}</p>
                    <p>Day of Stock: ${product.dayOfStock}</p>
                </div>
                <div class="add_minus">
                    <button class="minus">-</button>
                    <h4 class="count" data-product-id="${product.id}">0</h4>
                    <button class="add">+</button>
                </div>
                <div class="last_row">
                    <button class="add_to_cart" data-product-id="${product.id}">Add to Cart</button>
                </div>
            </div>         
        </div>
      `;
    });
  
    contentContainer.innerHTML = productsHTML;
}

function setupEventListeners() {
    // Event listener for Add to Cart buttons
    document.querySelectorAll('.add_to_cart').forEach((button) => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            const parent = button.closest('.product');
            const countElement = parent.querySelector('.count');
            const productCount = parseInt(countElement.innerHTML.trim(), 10);
            
            if (productCount > 0) {
                addToCart(productId, productCount);
                updateCartQuantity();
                countElement.innerHTML = "0";
                
                // Show notification
                showNotification("Item added to cart!");
            } else {
                showNotification("Please select a quantity first");
            }
        });
    });
    
    // Event listeners for + buttons
    document.querySelectorAll('.add').forEach((button) => {
        button.addEventListener('click', () => {
            const parent = button.closest('.product');
            const countElement = parent.querySelector('.count');
            const count = parseInt(countElement.innerHTML.trim(), 10);
            countElement.innerHTML = count + 1;
        });
    });
    
    // Event listeners for - buttons
    document.querySelectorAll('.minus').forEach((button) => {
        button.addEventListener('click', () => {
            const parent = button.closest('.product');
            const countElement = parent.querySelector('.count');
            const count = parseInt(countElement.innerHTML.trim(), 10);
            if (count > 0) {
                countElement.innerHTML = count - 1;
            }
        });
    });
}

function updateCartQuantity() {
    const cartQuantityElement = document.querySelector('.js-cart-quantity');
    if (!cartQuantityElement) {
        console.error('Cart quantity element not found');
        return;
    }
    
    let cartQuantity = 0;
    cart.forEach((cartItem) => {
        cartQuantity += cartItem.quantity;
    });
    
    cartQuantityElement.innerHTML = cartQuantity;
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    if (notification && notificationMessage) {
        notificationMessage.textContent = message;
        notification.classList.add('show');
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Export functions for external use
export { updateCartQuantity };