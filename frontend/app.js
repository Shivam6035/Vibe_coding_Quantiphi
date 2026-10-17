// frontend/app.js

// DOM Elements
const sourceSelect = document.getElementById("sourceCurrency");
const targetSelect = document.getElementById("targetCurrency");
const amountInput = document.getElementById("amountInput");
const convertBtn = document.getElementById("convertBtn");
const swapBtn = document.getElementById("swapCurrenciesBtn");
const addFavoriteBtn = document.getElementById("addFavoriteBtn");
const favoritesContainer = document.getElementById("favoritesContainer");
const historyTableBody = document.getElementById("historyTableBody");

// Result Elements
const resultSubtext = document.getElementById("resultSubtext");
const resultMainValue = document.getElementById("resultMainValue");
const resultRateInfo = document.getElementById("resultRateInfo");
const resultInverseInfo = document.getElementById("resultInverseInfo");

// Trend Chart Elements
const chartTitle = document.getElementById("chartTitle");
const trendMinBadge = document.getElementById("trendMinBadge");
const trendMaxBadge = document.getElementById("trendMaxBadge");
const trendPctBadge = document.getElementById("trendPctBadge");

// Travel Budgeting Mode Elements
const travelModeToggle = document.getElementById("travelModeToggle");
const standardModeSection = document.getElementById("standardModeSection");
const travelModeSection = document.getElementById("travelModeSection");
const travelBaseSelect = document.getElementById("travelBaseCurrency");
const travelAmountInput = document.getElementById("travelAmountInput");
const calcTravelBudgetBtn = document.getElementById("calcTravelBudgetBtn");
const travelComparisonTableBody = document.getElementById("travelComparisonTableBody");

// Error Banner Elements
const errorBanner = document.getElementById("errorBanner");
const errorMessage = document.getElementById("errorMessage");

let trendChartInstance = null;

// --- Error Handling Helpers ---
function showError(msg) {
  errorMessage.textContent = msg;
  errorBanner.classList.remove("hidden");
}

function hideError() {
  errorBanner.classList.add("hidden");
}

// --- 1. Initialize Currencies Dropdowns ---
async function loadCurrencies() {
  try {
    const res = await fetch("/api/currencies");
    const data = await res.json();
    const currencies = data.currencies || ["USD", "INR", "EUR", "GBP", "JPY"];

    const optionsHtml = currencies
      .map((code) => `<option value="${code}">${code}</option>`)
      .join("");

    sourceSelect.innerHTML = optionsHtml;
    targetSelect.innerHTML = optionsHtml;
    travelBaseSelect.innerHTML = optionsHtml;

    // Set sensible defaults
    sourceSelect.value = currencies.includes("USD") ? "USD" : currencies[0];
    targetSelect.value = currencies.includes("INR") ? "INR" : currencies[1];
    travelBaseSelect.value = currencies.includes("INR") ? "INR" : currencies[0];
  } catch (err) {
    showError("Failed to load currency list from server.");
  }
}

// --- 2. Perform Conversion (Server-Side Calculation) ---
async function handleConversion() {
  hideError();
  const payload = {
    source_currency: sourceSelect.value,
    target_currency: targetSelect.value,
    amount: parseFloat(amountInput.value),
  };

  try {
    const res = await fetch("/api/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const errDetail = Array.isArray(data.detail)
        ? data.detail[0].msg
        : data.detail || "Conversion validation failed on server.";
      showError(errDetail);
      return;
    }

    // Render server-computed values directly
    resultSubtext.textContent = `${data.amount} ${data.source_currency} equals`;
    resultMainValue.textContent = `${data.converted_amount} ${data.target_currency}`;
    resultRateInfo.textContent = `1 ${data.source_currency} = ${data.exchange_rate} ${data.target_currency}`;
    resultInverseInfo.textContent = `1 ${data.target_currency} = ${data.inverse_rate} ${data.source_currency}`;

    // Refresh SQLite conversion history and 30-day trend chart
    await Promise.all([
      loadHistory(),
      loadTrends(data.source_currency, data.target_currency),
    ]);
  } catch (err) {
    showError("Network error while communicating with conversion server.");
  }
}

// --- 3. Load & Render 30-Day Historical Trend Chart ---
async function loadTrends(source, target) {
  try {
    const res = await fetch(
      `/api/trends?source=${encodeURIComponent(source)}&target=${encodeURIComponent(target)}`
    );
    const data = await res.json();
    if (!res.ok) return;

    chartTitle.textContent = `30-Day Trend: ${data.source_currency} → ${data.target_currency}`;
    trendMinBadge.textContent = `Min: ${data.min_rate}`;
    trendMaxBadge.textContent = `Max: ${data.max_rate}`;
    const sign = data.pct_change > 0 ? "+" : "";
    trendPctBadge.textContent = `30d: ${sign}${data.pct_change}%`;

    const ctx = document.getElementById("trendChart").getContext("2d");
    if (trendChartInstance) {
      trendChartInstance.destroy();
    }

    trendChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.dates,
        datasets: [
          {
            label: `${data.source_currency} to ${data.target_currency}`,
            data: data.rates,
            borderColor: "#4f46e5",
            backgroundColor: "rgba(79, 70, 229, 0.1)",
            borderWidth: 2.5,
            pointRadius: 2,
            pointHoverRadius: 5,
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          x: {
            ticks: { maxTicksLimit: 8, font: { size: 11 } },
            grid: { display: false },
          },
          y: {
            ticks: { font: { size: 11 } },
            grid: { color: "#f1f5f9" },
          },
        },
      },
    });
  } catch (err) {
    console.error("Failed to load 30-day trend chart:", err);
  }
}

// --- 4. Favorites Management (SQLite Persistence) ---
async function loadFavorites() {
  try {
    const res = await fetch("/api/favorites");
    const data = await res.json();
    renderFavorites(data.favorites || []);
  } catch (err) {
    console.error("Error loading favorites:", err);
  }
}

function renderFavorites(favorites) {
  if (!favorites.length) {
    favoritesContainer.innerHTML = `<span class="text-xs text-slate-400">No favorite pairs saved yet.</span>`;
    return;
  }

  favoritesContainer.innerHTML = favorites
    .map(
      (fav) => `
      <div class="inline-flex items-center bg-slate-100 hover:bg-indigo-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 transition">
        <button
          onclick="selectFavoritePair('${fav.source_currency}', '${fav.target_currency}')"
          class="hover:text-indigo-600 mr-2"
        >
          ${fav.source_currency} &rarr; ${fav.target_currency}
        </button>
        <button
          onclick="deleteFavoritePair(${fav.id})"
          title="Remove Favorite"
          class="text-slate-400 hover:text-red-600 font-bold"
        >
          &times;
        </button>
      </div>
    `
    )
    .join("");
}

async function selectFavoritePair(source, target) {
  // Switch back to standard mode if in travel mode
  if (travelModeToggle.checked) {
    travelModeToggle.checked = false;
    toggleTravelMode();
  }
  sourceSelect.value = source;
  targetSelect.value = target;
  await handleConversion();
}

async function addCurrentPairToFavorites() {
  hideError();
  const payload = {
    source_currency: sourceSelect.value,
    target_currency: targetSelect.value,
  };

  try {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      showError(data.detail || "Could not save favorite pair.");
      return;
    }
    renderFavorites(data.favorites || []);
  } catch (err) {
    showError("Failed to save favorite pair.");
  }
}

async function deleteFavoritePair(favId) {
  try {
    const res = await fetch(`/api/favorites/${favId}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      renderFavorites(data.favorites || []);
    }
  } catch (err) {
    showError("Failed to remove favorite pair.");
  }
}

// --- 5. Recent Conversion History (SQLite Cache) ---
async function loadHistory() {
  try {
    const res = await fetch("/api/history");
    const data = await res.json();
    const rows = data.history || [];

    if (!rows.length) {
      historyTableBody.innerHTML = `<tr><td colspan="4" class="py-3 text-center text-slate-400">No conversions yet.</td></tr>`;
      return;
    }

    historyTableBody.innerHTML = rows
      .map(
        (item) => `
        <tr class="hover:bg-slate-50">
          <td class="py-2 font-semibold text-indigo-600">${item.source_currency}/${item.target_currency}</td>
          <td class="py-2">${item.amount} ${item.source_currency}</td>
          <td class="py-2 font-semibold">${item.converted_amount} ${item.target_currency}</td>
          <td class="py-2 text-slate-500">${item.exchange_rate}</td>
        </tr>
      `
      )
      .join("");
  } catch (err) {
    console.error("Failed to load history:", err);
  }
}

// --- 6. The Vibe Check: Travel Budgeting Mode ---
function toggleTravelMode() {
  const isTravelMode = travelModeToggle.checked;
  if (isTravelMode) {
    standardModeSection.classList.add("hidden");
    travelModeSection.classList.remove("hidden");
    handleTravelBudgetCalculation();
  } else {
    travelModeSection.classList.add("hidden");
    standardModeSection.classList.remove("hidden");
  }
}

async function handleTravelBudgetCalculation() {
  hideError();
  const payload = {
    base_currency: travelBaseSelect.value,
    amount: parseFloat(travelAmountInput.value),
  };

  try {
    const res = await fetch("/api/travel-budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const errDetail = Array.isArray(data.detail)
        ? data.detail[0].msg
        : data.detail || "Failed to calculate travel budget.";
      showError(errDetail);
      return;
    }

    travelComparisonTableBody.innerHTML = (data.comparisons || [])
      .map(
        (row) => `
        <tr class="hover:bg-indigo-50/40 transition">
          <td class="py-3.5 px-4 font-bold text-indigo-600">${row.currency_code}</td>
          <td class="py-3.5 px-4 text-slate-700">${row.currency_name}</td>
          <td class="py-3.5 px-4 text-slate-500">1 ${data.base_currency} = ${row.exchange_rate} ${row.currency_code}</td>
          <td class="py-3.5 px-4 font-extrabold text-slate-900 text-base">${row.symbol} ${row.converted_amount}</td>
        </tr>
      `
      )
      .join("");
  } catch (err) {
    showError("Network error while calculating travel budget.");
  }
}

// --- 7. Event Listeners & Startup ---
convertBtn.addEventListener("click", handleConversion);

swapBtn.addEventListener("click", () => {
  const temp = sourceSelect.value;
  sourceSelect.value = targetSelect.value;
  targetSelect.value = temp;
  handleConversion();
});

addFavoriteBtn.addEventListener("click", addCurrentPairToFavorites);
travelModeToggle.addEventListener("change", toggleTravelMode);
calcTravelBudgetBtn.addEventListener("click", handleTravelBudgetCalculation);

window.addEventListener("DOMContentLoaded", async () => {
  await loadCurrencies();
  await loadFavorites();
  await handleConversion();
});