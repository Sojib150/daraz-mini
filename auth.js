// সিম্পল লগইন সিস্টেম (পরে Firebase দিয়ে আপগ্রেড করা যাবে)
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === "admin" && password === "1234") {
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("username", username);
        window.location.href = "admin.html";
    } 
    else if (username && password) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        window.location.href = "index.html";
    } else {
        alert("ইউজারনেম বা পাসওয়ার্ড ভুল");
    }
}

// লগইন চেক করার ফাংশন (সব পেজে ব্যবহার করবে)
function checkLogin() {
    if (!localStorage.getItem("isLoggedIn")) {
        window.location.href = "login.html";
    }
}
