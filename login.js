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

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value; // Assuming you change this field to just email
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        errorDiv.textContent = error.message;
    } else {
        // Supabase automatically handles the session (using cookies)
        alert('Login successful!');
        document.body.classList.add('fade-out');
        setTimeout(() => window.location.href = 'index.html', 500);
    }
});
