const signupForm = document.getElementById("signup-form");
const message = document.getElementById("signup-message");

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fullName = document.getElementById("full-name").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    message.textContent = "Passwords do not match.";
    message.className = "form-message error";
    return;
  }

  message.textContent = "Creating account...";
  message.className = "form-message";

  try {
    await apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        full_name: fullName,
        username,
        email,
        password,
        confirm_password: confirmPassword
      })
    });

    message.textContent = "Account created. Redirecting to login...";
    message.className = "form-message success";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 900);
  } catch (error) {
    message.textContent = error.message;
    message.className = "form-message error";
  }
});
