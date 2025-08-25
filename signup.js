function togglePassword(id) {
    const passwordField = document.getElementById(id);
    const showBtn = passwordField.nextElementSibling;
    if (passwordField.type === "password") {
        passwordField.type = "text";
        showBtn.textContent = "HIDE";
        showBtn.style.color = "#4CAF50";
    } else {
        passwordField.type = "password";
        showBtn.textContent = "SHOW";
        showBtn.style.color = "#222";
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

    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match.';
        return;
    }

    const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
    });

    const result = await response.json();

    if (response.ok) {
        alert('Sign up successful! Check your email for verification before logging in.');
        window.location.href = 'login.html';
    } else {
        errorDiv.textContent = result.error || 'An unknown error occurred.';
    }
});
