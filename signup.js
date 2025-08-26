// signup.js

// This helper function can stay, but it's not a module so it needs to be global.
// For better practice, this should be part of a shared utility module.
window.togglePassword = function(id) {
    const passwordField = document.getElementById(id);
    const showBtn = passwordField.nextElementSibling;
    if (passwordField.type === "password") {
        passwordField.type = "text";
        showBtn.textContent = "HIDE";
    } else {
        passwordField.type = "password";
        showBtn.textContent = "SHOW";
    }
}

document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('signupError');
    errorDiv.textContent = '';

    if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters long.';
        return;
    }
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match.';
        return;
    }

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, username }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error);
        }
        alert('Sign up successful! Check your email for a confirmation link before you log in.');
        window.location.href = 'login.html';
    } catch (err) {
        errorDiv.textContent = err.message;
    }
});