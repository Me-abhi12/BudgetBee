const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const categorySelect = document.getElementById('category');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

form.addEventListener('submit', addTransaction);

function addTransaction(e) {
  e.preventDefault();

  const transaction = {
    id: Date.now(),
    text: text.value,
    amount: +amount.value,
    category: categorySelect.value
  };

  transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));

  text.value = '';
  amount.value = '';
  categorySelect.selectedIndex = 0;

  init();
}

function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  init();
}

function renderList() {
  list.innerHTML = '';
  transactions.forEach(t => {
    const li = document.createElement('li');
    li.classList.add(t.amount > 0 ? 'plus' : 'minus');
    li.innerHTML = `
      ${t.text} (${t.category})
      <span>${t.amount > 0 ? '+' : '-'}$${Math.abs(t.amount)}</span>
      <button onclick="removeTransaction(${t.id})">x</button>
    `;
    list.appendChild(li);
  });
}

function updateValues() {
  const amounts = transactions.map(t => t.amount);
  const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
  const income = amounts.filter(a => a > 0).reduce((acc, a) => acc + a, 0).toFixed(2);
  const expense = (amounts.filter(a => a < 0).reduce((acc, a) => acc + a, 0) * -1).toFixed(2);

  balance.innerText = `$${total}`;
  money_plus.innerText = `+$${income}`;
  money_minus.innerText = `-$${expense}`;
}

/* --------- CHARTS --------- */
let expenseChart, monthlyChart, categoryChart;

function updateChart() {
  const incomeTotal = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expenseTotal = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const ctx = document.getElementById('expenseChart').getContext('2d');
  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expenses'],
      datasets: [{ data: [incomeTotal, expenseTotal], backgroundColor: ['#2ecc71', '#e74c3c'] }]
    }
  });
}

function updateMonthlyChart() {
  const monthlyData = {};
  transactions.forEach(t => {
    const date = new Date(t.id);
    const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
    if (t.amount > 0) monthlyData[month].income += t.amount;
    else monthlyData[month].expense += Math.abs(t.amount);
  });

  const labels = Object.keys(monthlyData);
  const incomeData = labels.map(m => monthlyData[m].income);
  const expenseData = labels.map(m => monthlyData[m].expense);

  const ctx = document.getElementById('monthlyChart').getContext('2d');
  if (monthlyChart) monthlyChart.destroy();

  monthlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Income', data: incomeData, backgroundColor: '#2ecc71' },
        { label: 'Expenses', data: expenseData, backgroundColor: '#e74c3c' }
      ]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}

function updateCategoryChart() {
  const categoryData = {};
  transactions.forEach(t => {
    if (t.amount < 0) {
      if (!categoryData[t.category]) categoryData[t.category] = 0;
      categoryData[t.category] += Math.abs(t.amount);
    }
  });

  const labels = Object.keys(categoryData);
  const data = Object.values(categoryData);

  const ctx = document.getElementById('categoryChart').getContext('2d');
  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{ data, backgroundColor: ['#f39c12', '#3498db', '#9b59b6', '#e67e22', '#2ecc71'] }]
    }
  });
}

/* --------- INIT --------- */
function init() {
  renderList();
  updateValues();
  updateChart();
  updateMonthlyChart();
  updateCategoryChart();
}

init();
