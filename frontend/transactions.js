requireLogin();

document.getElementById("current-user").textContent =
  localStorage.getItem("winaBwanguUser") || "Administrator";
document.getElementById("logout-button").addEventListener("click", logout);

const menuButton = document.getElementById("menu-button");
const sideMenu = document.getElementById("side-menu");
menuButton.addEventListener("click", () => sideMenu.classList.toggle("open"));

const boothSelect = document.getElementById("booth-select");
const serviceSelect = document.getElementById("service-select");
const amountInput = document.getElementById("amount");
const rateDisplay = document.getElementById("revenue-rate");
const revenueDisplay = document.getElementById("estimated-revenue");
const form = document.getElementById("transaction-form");
const message = document.getElementById("transaction-message");
const body = document.getElementById("transactions-body");
const filterBooth = document.getElementById("filter-booth");
const filterService = document.getElementById("filter-service");

let booths = [];
let services = [];
let transactions = [];
let page = 1;
const pageSize = 10;

function money(value) {
  return "K" + Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3
  });
}

async function loadReferenceData() {
  booths = await apiRequest("/booths/");
  services = await apiRequest("/services/");

  const boothOptions = booths.map(b => `<option value="${b.id}">${b.name} — ${b.location}</option>`).join("");
  boothSelect.insertAdjacentHTML("beforeend", boothOptions);
  filterBooth.insertAdjacentHTML("beforeend", boothOptions);

  const serviceOptions = services.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  filterService.insertAdjacentHTML("beforeend", serviceOptions);
}

async function loadBoothServices() {
  const boothId = boothSelect.value;
  serviceSelect.innerHTML = '<option value="">Select service</option>';
  serviceSelect.disabled = !boothId;
  rateDisplay.textContent = "—";
  revenueDisplay.textContent = "—";

  if (!boothId) return;

  const available = await apiRequest("/booths/" + boothId + "/services");
  serviceSelect.insertAdjacentHTML(
    "beforeend",
    available.map(s => `<option value="${s.service_id}" data-rate="${s.revenue_per_kwacha}">${s.service_name}</option>`).join("")
  );
}

function updateEstimate() {
  const selected = serviceSelect.options[serviceSelect.selectedIndex];
  const rate = Number(selected?.dataset.rate || 0);
  const amount = Number(amountInput.value || 0);
  rateDisplay.textContent = rate ? "K" + rate.toFixed(4) + " per K1" : "—";
  revenueDisplay.textContent = rate && amount > 0 ? money(amount * rate) : "—";
}

async function loadTaxPerformance() {
  const servicesPerformance = await apiRequest("/dashboard/service-performance");
  const taxValues = servicesPerformance.map(item => ({
    name: item.service_name,
    tax: Number(item.used) * 0.16
  }));
  const highest = Math.max(...taxValues.map(item => item.tax), 0) || 1;
  document.getElementById("tax-performance").innerHTML = taxValues.map(item => {
    const percent = Math.round((item.tax / highest) * 100);
    return `
      <div class="limit-row">
        <div class="limit-label"><strong>${item.name}</strong><span>${money(item.tax)} estimated tax</span></div>
        <div class="progress large"><span style="width:${percent}%"></span></div>
      </div>`;
  }).join("");
}

async function loadTransactions() {
  const params = new URLSearchParams();
  if (filterBooth.value) params.set("booth_id", filterBooth.value);
  if (filterService.value) params.set("service_id", filterService.value);

  transactions = await apiRequest("/transactions/?" + params.toString());
  page = 1;
  renderTransactions();
}

function renderTransactions() {
  const start = (page - 1) * pageSize;
  const rows = transactions.slice(start, start + pageSize);

  body.innerHTML = rows.map(t => {
    const booth = booths.find(b => b.id === t.booth_id);
    const service = services.find(s => s.id === t.service_id);
    return `
      <tr>
        <td>${t.transaction_code}</td>
        <td>${booth?.name || t.booth_id}</td>
        <td>${booth?.location || "—"}</td>
        <td>${service?.name || t.service_id}</td>
        <td>${service ? Number(service.revenue_per_kwacha).toFixed(4) : "—"}</td>
        <td>${money(t.transaction_amount)}</td>
        <td>${money(t.revenue)}</td>
        <td>${new Date(t.created_at).toLocaleString()}</td>
      </tr>
    `;
  }).join("");

  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
  document.getElementById("page-indicator").textContent = "Page " + page + " of " + totalPages;
  document.getElementById("previous-button").disabled = page <= 1;
  document.getElementById("next-button").disabled = page >= totalPages;
}

function showMessage(text, error = false) {
  message.textContent = text;
  message.className = "form-message" + (error ? " error" : " success");
}

boothSelect.addEventListener("change", async () => {
  try { await loadBoothServices(); } catch (e) { showMessage(e.message, true); }
});
serviceSelect.addEventListener("change", updateEstimate);
amountInput.addEventListener("input", updateEstimate);
filterBooth.addEventListener("change", () => loadTransactions().catch(e => showMessage(e.message, true)));
filterService.addEventListener("change", () => loadTransactions().catch(e => showMessage(e.message, true)));

document.getElementById("previous-button").addEventListener("click", () => {
  if (page > 1) { page--; renderTransactions(); }
});
document.getElementById("next-button").addEventListener("click", () => {
  if (page < Math.ceil(transactions.length / pageSize)) { page++; renderTransactions(); }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const boothId = Number(boothSelect.value);
  const serviceId = Number(serviceSelect.value);
  const amount = Number(amountInput.value);

  if (!boothId || !serviceId || amount <= 0) {
    showMessage("Select a booth, service and valid amount.", true);
    return;
  }

  try {
    const result = await apiRequest("/transactions/", {
      method: "POST",
      body: JSON.stringify({
        booth_id: boothId,
        service_id: serviceId,
        transaction_amount: amount
      })
    });

    showMessage("Saved successfully as " + result.transaction_code + ".");
    form.reset();
    serviceSelect.innerHTML = '<option value="">Select booth first</option>';
    serviceSelect.disabled = true;
    rateDisplay.textContent = "—";
    revenueDisplay.textContent = "—";
    await loadTransactions();
    await loadTaxPerformance();
  } catch (error) {
    showMessage(error.message, true);
  }
});

(async function init() {
  try {
    await loadReferenceData();
    await loadTransactions();
  } catch (error) {
    showMessage(error.message, true);
  }
})();
