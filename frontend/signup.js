const signupForm = document.getElementById("signup-form");
const message = document.getElementById("signup-message");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");
const submitButton = signupForm.querySelector('button[type="submit"]');

document.querySelectorAll("[data-toggle]").forEach(button => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.toggle);
    const reveal = input.type === "password";
    input.type = reveal ? "text" : "password";
    button.textContent = reveal ? "Hide" : "Show";
    button.setAttribute("aria-label", (reveal ? "Hide" : "Show") + " " + (button.dataset.toggle === "password" ? "password" : "confirmation password"));
  });
});

passwordInput.addEventListener("input", () => {
  const value = passwordInput.value;
  const score = [
    value.length >= 8,
    /[A-Za-z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value)
  ].filter(Boolean).length;
  const bar = document.getElementById("password-strength-bar");
  bar.style.width = (score * 25) + "%";
  bar.dataset.strength = score <= 1 ? "weak" : score <= 2 ? "fair" : score === 3 ? "good" : "strong";
  checkPasswordMatch();
});

confirmInput.addEventListener("input", checkPasswordMatch);

function checkPasswordMatch() {
  const match = document.getElementById("password-match");
  if (!confirmInput.value) {
    match.textContent = "";
    match.className = "field-hint";
  } else if (passwordInput.value === confirmInput.value) {
    match.textContent = "Passwords match.";
    match.className = "field-hint match";
  } else {
    match.textContent = "Passwords do not match yet.";
    match.className = "field-hint mismatch";
  }
}

signupForm.addEventListener("submit", async event => {
  event.preventDefault();
  const fullName = document.getElementById("full-name").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;

  if (fullName.length < 2) return showMessage("Enter your full name.", "error");
  if (username.length < 3) return showMessage("Username must contain at least 3 characters.", "error");
  if (password.length < 8) return showMessage("Use a password with at least 8 characters.", "error");
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return showMessage("For a stronger password, include at least one letter and one number.", "error");
  }
  if (password !== confirmPassword) return showMessage("Passwords do not match.", "error");

  submitButton.disabled = true;
  submitButton.classList.add("is-loading");
  submitButton.querySelector("span").textContent = "Creating account…";
  showMessage("Please wait while we create your account.", "");

  try {
    const result = await apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        full_name: fullName,
        username,
        email,
        password,
        confirm_password: confirmPassword
      })
    });
    showMessage(result.message || "Account created successfully. Redirecting to sign in…", "success");
    signupForm.reset();
    document.getElementById("password-strength-bar").style.width = "0";
    document.getElementById("password-match").textContent = "";
    setTimeout(() => window.location.href = "login.html", 1100);
  } catch (error) {
    showMessage(error.message || "We couldn't create the account. Please try again.", "error");
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
    submitButton.querySelector("span").textContent = "Create account";
  }
});

function showMessage(text, state) {
  message.textContent = text;
  message.className = "form-message" + (state ? " " + state : "");
}
