const API_BASE =
  window.location.port === "8000" || window.location.port === ""
    ? window.location.origin + "/api/v1"
    : "http://127.0.0.1:8000/api/v1";

async function apiRequest(path, options = {}) {
  const response = await fetch(API_BASE + path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  let data = {};
  try {
    data = await response.json();
  } catch (_) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.detail || "The server could not complete the request.");
  }

  return data;
}

function requireLogin() {
  if (!localStorage.getItem("winaBwanguSession")) {
    window.location.href = "login.html";
  }
}

function logout() {
  localStorage.removeItem("winaBwanguSession");
  localStorage.removeItem("winaBwanguUser");
  window.location.href = "login.html";
}
