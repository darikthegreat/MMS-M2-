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

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const emailOrUsername = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user =>
        (user.email === emailOrUsername || user.username === emailOrUsername) &&
        user.password === password
    );
    if (user) {
        alert('Login successful!');
        localStorage.setItem('currentUser', JSON.stringify(user));
        document.body.classList.add('fade-out');
        setTimeout(() => window.location.href = 'index.html', 500);
    } else {
        document.getElementById('loginError').textContent = 'Invalid credentials. Please try again.';
    }
});
