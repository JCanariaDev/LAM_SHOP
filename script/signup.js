import { cart } from './cart.js';
removeItems()
function removeItems() {
  localStorage.clear(); // Clear localStorage
  cart.length = 0; // Clear the in-memory cart array
}

// Select the signup form
/*const signupForm = document.getElementById('signup_form');

// Add an event listener for form submission
signupForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Collect form data
    const name = signupForm.elements['name'].value.trim();
    const email = signupForm.elements['email'].value.trim();
    const password = signupForm.elements['password'].value;
    const confirmPassword = signupForm.elements['confirm_password'].value;

    // Validate passwords
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        // Send the data to the server via POST in JSON format
        const response = await fetch('http://localhost/LAM_WEBSITE/php/signup.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        // Parse the JSON response
        const result = await response.json();

        // Handle the response
        if (result.success) {
            alert('Signup successful! Redirecting to login...');
            window.location.href = 'login.html';
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
});*/
