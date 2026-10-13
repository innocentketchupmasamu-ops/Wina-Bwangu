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
    document.getElementById("tax-rate").textContent = (Number(summary.tax_rate) * 100).toFixed(2) + "%";

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
    renderAnalytics(booths, services, frequency, Number(summary.total_transactions), Number(summary.total_revenue));
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


function renderAnalytics(booths, services, frequency, totalTransactions, totalRevenue) {
  const boothHost = document.getElementById("booth-revenue-chart");
  const serviceHost = document.getElementById("service-analytics");
  const insightsHost = document.getElementById("analytics-insights");

  const sortedBooths = [...booths].sort((a, b) => Number(b.total_revenue) - Number(a.total_revenue));
  const highestBoothRevenue = Math.max(...sortedBooths.map(item => Number(item.total_revenue) || 0), 1);
  boothHost.innerHTML = sortedBooths.length ? sortedBooths.map(item => {
    const value = Number(item.total_revenue) || 0;
    const width = Math.max(value > 0 ? 3 : 0, value / highestBoothRevenue * 100);
    return `<div class="analytics-bar-row">
      <div class="analytics-bar-label"><span>${escapeHtml(item.booth_name)}</span><strong>${money(value)}</strong></div>
      <div class="analytics-track"><span style="width:${width.toFixed(1)}%"></span></div>
      <small>${Number(item.transaction_count || 0).toLocaleString()} transactions</small>
    </div>`;
  }).join("") : '<p class="analytics-empty">No booth transaction data is available yet.</p>';

  const sortedServices = [...services].sort((a, b) => Number(b.utilisation_percent) - Number(a.utilisation_percent));
  serviceHost.innerHTML = sortedServices.length ? sortedServices.map(item => {
    const pct = Math.max(0, Math.min(Number(item.utilisation_percent) || 0, 100));
    return `<div class="service-analytics-row">
      <div class="analytics-bar-label"><span>${escapeHtml(item.service_name)}</span><strong>${pct.toFixed(1)}%</strong></div>
      <div class="analytics-track service-track"><span style="width:${pct}%"></span></div>
      <small>${money(item.used)} used of ${money(item.monthly_limit)}</small>
    </div>`;
  }).join("") : '<p class="analytics-empty">No service data is available yet.</p>';

  const topBooth = sortedBooths[0];
  const topService = [...frequency].sort((a, b) => Number(b.count) - Number(a.count))[0];
  const average = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  insightsHost.innerHTML = `
    <article class="insight-card"><span>Top-performing booth</span><strong>${topBooth ? escapeHtml(topBooth.booth_name) : "No data"}</strong><small>${topBooth ? money(topBooth.total_revenue) + " revenue" : "Add transactions to see results"}</small></article>
    <article class="insight-card"><span>Most-used service</span><strong>${topService ? escapeHtml(topService.service_name) : "No data"}</strong><small>${topService ? Number(topService.count).toLocaleString() + " recorded transactions" : "Add transactions to see results"}</small></article>
    <article class="insight-card"><span>Average revenue / transaction</span><strong>${money(average)}</strong><small>Revenue divided by transaction count</small></article>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}
