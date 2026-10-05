const loginForm = document.getElementById("login-form");
const message = document.getElementById("login-message");

if (localStorage.getItem("winaBwanguSession")) {
  window.location.href = "index.html";
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  message.textContent = "Signing in...";
  message.className = "form-message";

  try {
    const result = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });

    localStorage.setItem("winaBwanguSession", result.token);
    localStorage.setItem("winaBwanguUser", result.username);
    window.location.href = "index.html";
  } catch (error) {
    message.textContent = error.message;
    message.className = "form-message error";
  }
});
