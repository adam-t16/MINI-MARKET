// Financial Management System

let employees = [];
let currentTheme = 'light';
let currentAccentColor = '#3b82f6';

// Theme Management
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const savedAccentColor = localStorage.getItem('accentColor') || '#3b82f6';
  
  currentTheme = savedTheme;
  currentAccentColor = savedAccentColor;
  
  applyTheme();
  updateAccentColor();
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', currentTheme);
  applyTheme();
}

function applyTheme() {
  document.body.className = currentTheme;
  
  const themeIcon = document.querySelector('.theme-toggle i');
  if (themeIcon) {
    themeIcon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  }
}

function changeAccentColor(color) {
  currentAccentColor = color;
  localStorage.setItem('accentColor', color);
  updateAccentColor();
}

function updateAccentColor() {
  document.documentElement.style.setProperty('--accent-color', currentAccentColor);
}

// Employee Management
function addEmployee() {
  const nameInput = document.getElementById('employeeName');
  const salaryInput = document.getElementById('employeeSalary');
  
  const name = nameInput.value.trim();
  const salary = parseFloat(salaryInput.value) || 0;
  
  if (name && salary > 0) {
    employees.push({ name, salary });
    updateEmployeesList();
    nameInput.value = '';
    salaryInput.value = '';
  }
}

function removeEmployee(index) {
  employees.splice(index, 1);
  updateEmployeesList();
}

function updateEmployeesList() {
  const container = document.getElementById('employeesList');
  
  if (employees.length === 0) {
    container.innerHTML = '<p class="no-employees">Aucun employé ajouté</p>';
    return;
  }
  
  container.innerHTML = employees.map((emp, index) => `
    <div class="employee-item">
      <div class="employee-info">
        <span class="employee-name">${emp.name}</span>
        <span class="employee-salary">${formatCurrency(emp.salary)}</span>
      </div>
      <button type="button" class="btn-remove" onclick="removeEmployee(${index})">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');
}

// Calculations
function calculateFinancials(formData) {
  const monthlyRevenue = parseFloat(formData.get('monthlyRevenue')) || 0;
  const waterBill = parseFloat(formData.get('waterBill')) || 0;
  const electricityBill = parseFloat(formData.get('electricityBill')) || 0;
  const wifiBill = parseFloat(formData.get('wifiBill')) || 0;
  const otherExpenses = parseFloat(formData.get('otherExpenses')) || 0;
  const numberOfPartners = parseInt(formData.get('numberOfPartners')) || 1;
  
  const totalEmployeeSalaries = employees.reduce((total, emp) => total + emp.salary, 0);
  const totalExpenses = waterBill + electricityBill + wifiBill + otherExpenses + totalEmployeeSalaries;
  const netProfit = monthlyRevenue - totalExpenses;
  const profitPerPartner = numberOfPartners > 0 ? netProfit / numberOfPartners : 0;

  return {
    monthlyRevenue,
    expenses: {
      waterBill,
      electricityBill,
      wifiBill,
      otherExpenses,
      otherExpensesDescription: formData.get('otherExpensesDescription') || ''
    },
    totalEmployeeSalaries,
    totalExpenses,
    netProfit,
    profitPerPartner,
    numberOfPartners
  };
}

// Chart Data
function getChartData(expenses, calc) {
  return {
    labels: ['Eau', 'Électricité', 'WiFi', 'Autres', 'Salaires', 'Bénéfice'],
    datasets: [{
      data: [
        expenses.waterBill,
        expenses.electricityBill,
        expenses.wifiBill,
        expenses.otherExpenses,
        calc.totalEmployeeSalaries,
        Math.max(0, calc.netProfit)
      ],
      backgroundColor: [
        '#3b82f6',
        '#ef4444',
        '#10b981',
        '#f59e0b',
        '#8b5cf6',
        '#06b6d4'
      ]
    }]
  };
}

// Table Data
function getTableData(data, expenses, calc) {
  const rows = [
    { category: 'Revenus', description: 'Revenu mensuel total', amount: data.monthlyRevenue, type: 'positive' },
    { category: 'Dépenses', description: 'Facture d\'eau', amount: -expenses.waterBill, type: 'negative' },
    { category: 'Dépenses', description: 'Facture d\'électricité', amount: -expenses.electricityBill, type: 'negative' },
    { category: 'Dépenses', description: 'Facture WiFi', amount: -expenses.wifiBill, type: 'negative' },
    { category: 'Dépenses', description: `Autres dépenses - ${expenses.otherExpensesDescription}`, amount: -expenses.otherExpenses, type: 'negative' }
  ];

  employees.forEach(emp => {
    rows.push({
      category: 'Salaires',
      description: `Salaire de ${emp.name}`,
      amount: -emp.salary,
      type: 'negative'
    });
  });

  return rows;
}

// Form Submission
function handleFormSubmit(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const data = calculateFinancials(formData);
  
  displayResults(data);
}

// Display Results
function displayResults(data) {
  const resultsSection = document.getElementById('results');
  const expenseItems = [
    { label: 'Facture d\'eau:', value: formatCurrency(data.expenses.waterBill) },
    { label: 'Facture d\'électricité:', value: formatCurrency(data.expenses.electricityBill) },
    { label: 'Facture WiFi:', value: formatCurrency(data.expenses.wifiBill) },
    { label: `Autres dépenses - ${data.expenses.otherExpensesDescription}:`, value: formatCurrency(data.expenses.otherExpenses) }
  ];

  resultsSection.innerHTML = `
    <div class="results-container">
      <div class="results-header">
        <h2><i class="fas fa-chart-line"></i> Résultats Financiers</h2>
        <div class="results-actions">
          <button onclick="printResults()" class="btn-secondary">
            <i class="fas fa-print"></i> Imprimer
          </button>
          <button onclick="exportToPDF()" class="btn-secondary">
            <i class="fas fa-file-pdf"></i> PDF
          </button>
        </div>
      </div>
      
      <div class="results-grid">
        <div class="result-card">
          <div class="result-header">
            <i class="fas fa-dollar-sign result-icon positive"></i>
            <h3>Revenu Total</h3>
          </div>
          <div class="result-value positive">${formatCurrency(data.monthlyRevenue)}</div>
        </div>
        
        <div class="result-card">
          <div class="result-header">
            <i class="fas fa-credit-card result-icon negative"></i>
            <h3>Dépenses Totales</h3>
          </div>
          <div class="result-value negative">${formatCurrency(data.totalExpenses)}</div>
        </div>
        
        <div class="result-card">
          <div class="result-header">
            <i class="fas fa-chart-line result-icon ${data.netProfit >= 0 ? 'positive' : 'negative'}"></i>
            <h3>Bénéfice Net</h3>
          </div>
          <div class="result-value ${data.netProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(data.netProfit)}</div>
        </div>
        
        <div class="result-card">
          <div class="result-header">
            <i class="fas fa-users result-icon"></i>
            <h3>Bénéfice par Associé</h3>
          </div>
          <div class="result-value">${formatCurrency(data.profitPerPartner)}</div>
        </div>
      </div>
      
      <div class="expenses-breakdown">
        <h3><i class="fas fa-list"></i> Détail des Dépenses</h3>
        <div class="expenses-list">
          ${expenseItems.map(item => `
            <div class="expense-item">
              <span class="expense-label">${item.label}</span>
              <span class="expense-value">${item.value}</span>
            </div>
          `).join('')}
          ${employees.map(emp => `
            <div class="expense-item">
              <span class="expense-label">Salaire de ${emp.name}:</span>
              <span class="expense-value">${formatCurrency(emp.salary)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Utility Functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2
  }).format(amount);
}

function printResults() {
  window.print();
}

function exportToPDF() {
  // Simple PDF export using browser's print to PDF functionality
  const printWindow = window.open('', '_blank');
  const resultsContent = document.getElementById('results').innerHTML;
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Rapport Financier</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .results-container { max-width: 800px; margin: 0 auto; }
          .result-card { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
          .result-value { font-size: 24px; font-weight: bold; }
          .positive { color: #10b981; }
          .negative { color: #ef4444; }
        </style>
      </head>
      <body>${resultsContent}</body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.print();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  initializeTheme();
  
  // Form submission
  const form = document.getElementById('financialForm');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
  
  // Theme toggle
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Color palette
  const colorButtons = document.querySelectorAll('.color-option');
  colorButtons.forEach(button => {
    button.addEventListener('click', () => {
      const color = button.dataset.color;
      changeAccentColor(color);
    });
  });
  
  // Add employee button
  const addEmployeeBtn = document.getElementById('addEmployee');
  if (addEmployeeBtn) {
    addEmployeeBtn.addEventListener('click', addEmployee);
  }
  
  // Enter key for adding employees
  const employeeInputs = document.querySelectorAll('#employeeName, #employeeSalary');
  employeeInputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addEmployee();
      }
    });
  });
});