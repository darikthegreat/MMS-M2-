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

document.getElementById('signupForm').addEventListener('submit', function(e) {
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

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const existingUser = users.find(user =>
        user.email === email || user.username === username
    );
    if (existingUser) {
        errorDiv.textContent = 'Email or username already exists.';
    } else {
        users.push({ email, username, password });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Sign up successful! Please login.');
        window.location.href = 'login.html'; 
    }
});
