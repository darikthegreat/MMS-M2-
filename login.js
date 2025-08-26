// login.js
import { supabase } from './lib/supabaseClient.js';

// This helper function can stay as a global function for now.
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

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = '';

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            throw error;
        }

        document.body.classList.add('fade-out');
        setTimeout(() => window.location.href = 'index.html', 500);

    } catch (err) {
        errorDiv.textContent = err.message;
    }
});