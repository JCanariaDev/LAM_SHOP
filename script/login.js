import { cart } from './cart.js';
removeItems()
function removeItems() {
  localStorage.clear(); // Clear localStorage
  cart.length = 0; // Clear the in-memory cart array
}

// Select the login form
/*const loginForm = document.getElementById('login_form');

// Add an event listener for form submission
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Collect form data
    const username = loginForm.elements['username'].value;
    const password = loginForm.elements['password'].value;

    try {
        // Send the data to the server via POST in JSON format
        const response = await fetch('http://localhost/LAM_WEBSITE/php/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        // Get the raw response text
        const responseText = await response.text();

        // Parse JSON (handle unexpected HTML errors)
        try {
            const result = JSON.parse(responseText);

            if (result.success) {
                alert('Login successful! Redirecting...');
                window.location.href = 'index.html'; // Change this to your actual dashboard page
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Server response error:', responseText);
            alert('Unexpected server response. Check the console.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
});*/
