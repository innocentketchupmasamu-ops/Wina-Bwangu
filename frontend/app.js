requireLogin();

const user = localStorage.getItem("winaBwanguUser") || "Administrator";
document.getElementById("current-user").textContent = user;
document.getElementById("logout-button").addEventListener("click", logout);

const menuButton = document.getElementById("menu-button");
const sideMenu = document.getElementById("side-menu");
menuButton.addEventListener("click", () => sideMenu.classList.toggle("open"));

function money(value) {
  return "K" + Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

async function loadDashboard() {
  try {
    const [summary, services, booths, frequency, revenueCapital] = await Promise.all([
      apiRequest("/dashboard/summary"),
      apiRequest("/dashboard/service-performance"),
      apiRequest("/dashboard/booth-performance"),
      apiRequest("/dashboard/service-frequency"),
      apiRequest("/dashboard/revenue-capital")
    ]);

    document.getElementById("total-transactions").textContent = Number(summary.total_transactions).toLocaleString();
    document.getElementById("total-revenue").textContent = money(summary.total_revenue);
    document.getElementById("total-capital").textContent = money(summary.total_capital);

    document.getElementById("service-performance-body").innerHTML = services.map(item => `
      <tr>
        <td>${item.service_name}</td>
        <td>${money(item.used)}</td>
        <td>${money(item.remaining)}</td>
        <td><div class="progress"><span style="width:${Math.min(item.utilisation_percent, 100)}%"></span></div><small>${item.utilisation_percent.toFixed(2)}%</small></td>
      </tr>
    `).join("");

    document.getElementById("booth-performance-body").innerHTML = booths.map(item =>
      `<tr><td>${item.booth_name}</td><td>${item.transaction_count}</td><td>${money(item.total_revenue)}</td></tr>`
    ).join("");

    document.getElementById("frequency-body").innerHTML = frequency.map(item =>
      `<tr><td>${item.booth_name}</td><td>${item.service_name}</td><td>${item.count}</td></tr>`
    ).join("");

    document.getElementById("limit-bars").innerHTML = services.map(item => `
      <div class="limit-row">
        <div class="limit-label"><strong>${item.service_name}</strong><span>${money(item.used)} / ${money(item.monthly_limit)}</span></div>
        <div class="progress large"><span style="width:${Math.min(item.utilisation_percent, 100)}%"></span></div>
      </div>
    `).join("");

    drawChart(Number(revenueCapital.total_revenue), Number(revenueCapital.total_capital));
  } catch (error) {
    const message = document.getElementById("dashboard-message");
    message.textContent = error.message;
    message.className = "form-message error";
    showToast("Could not load dashboard data.");
  }
}

function drawChart(revenue, capital) {
  const canvas = document.getElementById("revenue-chart");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const size = Math.min(canvas.parentElement.clientWidth - 30, 300);

  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";
  ctx.scale(dpr, dpr);

  const center = size / 2;
  const radius = size * 0.36;
  const values = [revenue, capital];
  const labels = ["Revenue", "Capital"];
  const colors = ["#4080e0", "#6c6591"];
  const total = values.reduce((a, b) => a + b, 0) || 1;
  let angle = -Math.PI / 2;

  values.forEach((value, index) => {
    const slice = (value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = colors[index];
    ctx.fill();
    angle += slice;
  });

  document.getElementById("chart-legend").innerHTML = labels.map((label, i) =>
    `<div><span class="legend-dot" style="background:${colors[i]}"></span>${label}: ${money(values[i])}</div>`
  ).join("");
}

loadDashboard();
