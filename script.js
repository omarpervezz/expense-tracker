class ExpenseTracker {
  constructor() {
    this.expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    this.currentEditId = null;
    this.currentDeleteId = null;
    this.initializeElements();
    this.attachEventListeners();
    this.initializeTheme();
    this.renderExpenses();
    this.updateTotal();
  }

  initializeElements() {
    this.expenseNameInput = document.getElementById("expenseName");
    this.expenseAmountInput = document.getElementById("expenseAmount");
    this.addExpenseButton = document.getElementById("addExpense");
    this.expenseItemsContainer = document.getElementById("expenseItems");
    this.totalExpenseSpan = document.getElementById("totalExpense");
    this.editModal = document.getElementById("editModal");
    this.editExpenseNameInput = document.getElementById("editExpenseName");
    this.editExpenseAmountInput = document.getElementById("editExpenseAmount");
    this.saveEditButton = document.getElementById("saveEdit");
    this.cancelEditButton = document.getElementById("cancelEdit");
    this.deleteModal = document.getElementById("deleteModal");
    this.deleteExpenseName = document.getElementById("deleteExpenseName");
    this.deleteExpenseAmount = document.getElementById("deleteExpenseAmount");
    this.deleteExpenseDate = document.getElementById("deleteExpenseDate");
    this.confirmDeleteBtn = document.getElementById("confirmDelete");
    this.cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    this.cancelDeleteX = document.getElementById("cancelDelete");
    this.themeToggleBtn = document.getElementById("themeToggle");
    this.systemThemeMedia = window.matchMedia("(prefers-color-scheme: dark)");
    this.systemThemeMedia.addEventListener("change", (e) =>
      this.handleSystemThemeChange(e)
    );
  }

  attachEventListeners() {
    this.addExpenseButton.addEventListener("click", () => this.addExpense());
    this.saveEditButton.addEventListener("click", () => this.saveEdit());
    this.cancelEditButton.addEventListener("click", () => this.closeModal());
    this.confirmDeleteBtn.addEventListener("click", () => this.confirmDelete());
    this.cancelDeleteBtn.addEventListener("click", () =>
      this.closeDeleteModal()
    );
    this.cancelDeleteX.addEventListener("click", () => this.closeDeleteModal());
    this.themeToggleBtn.addEventListener("click", () => this.toggleTheme());
  }

  initializeTheme() {
    const savedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    document.documentElement.setAttribute("data-theme", savedTheme);
    this.updateThemeIcon(savedTheme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.updateThemeIcon(theme);
    localStorage.setItem("theme", theme);
  }
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    this.updateThemeIcon(newTheme);
  }

  handleSystemThemeChange(e) {
    // Only update theme if user hasn't set a preference
    if (!localStorage.getItem("theme")) {
      const newTheme = e.matches ? "dark" : "light";
      this.applyTheme(newTheme);
    }
  }
  updateThemeIcon(theme) {
    const icon = this.themeToggleBtn.querySelector("i");
    icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
  }

  deleteExpense(id) {
    this.currentDeleteId = id;
    const expense = this.expenses.find((exp) => exp.id === id);

    if (!expense) return;

    // Update delete modal with expense details
    this.deleteExpenseName.textContent = expense.name;
    this.deleteExpenseAmount.textContent = expense.amount.toFixed(2);
    this.deleteExpenseDate.textContent = new Date(
      expense.date
    ).toLocaleString();

    // Show delete modal
    this.deleteModal.style.display = "block";
  }

  confirmDelete() {
    if (this.currentDeleteId === null) return;

    this.expenses = this.expenses.filter(
      (expense) => expense.id !== this.currentDeleteId
    );
    this.saveToLocalStorage();
    this.renderExpenses();
    this.updateTotal();
    this.closeDeleteModal();
  }

  closeDeleteModal() {
    this.deleteModal.style.display = "none";
    this.currentDeleteId = null;
  }

  addExpense() {
    const name = this.expenseNameInput.value.trim();
    const amount = parseFloat(this.expenseAmountInput.value);

    if (!name || isNaN(amount) || amount <= 0) {
      alert("Please enter valid expense details");
      return;
    }

    const expense = {
      id: Date.now(),
      name,
      amount,
      date: new Date().toISOString(),
    };

    this.expenses.push(expense);
    this.saveToLocalStorage();
    this.renderExpenses();
    this.updateTotal();
    this.clearInputs();
  }

  editExpense(id) {
    const expense = this.expenses.find((exp) => exp.id === id);
    if (!expense) return;

    this.currentEditId = id;
    this.editExpenseNameInput.value = expense.name;
    this.editExpenseAmountInput.value = expense.amount;
    this.editModal.style.display = "block";
  }

  saveEdit() {
    const name = this.editExpenseNameInput.value.trim();
    const amount = parseFloat(this.editExpenseAmountInput.value);

    if (!name || isNaN(amount) || amount <= 0) {
      alert("Please enter valid expense details");
      return;
    }

    const expenseIndex = this.expenses.findIndex(
      (exp) => exp.id === this.currentEditId
    );
    if (expenseIndex === -1) return;

    // Store the old expense data for comparison
    const oldExpense = { ...this.expenses[expenseIndex] };

    // Update the expense
    this.expenses[expenseIndex] = {
      ...oldExpense,
      name,
      amount,
      lastModified: new Date().toISOString(),
    };

    this.saveToLocalStorage();
    this.renderExpenses();
    this.updateTotal();
    this.closeModal();

    // Show success message with changes
    alert(
      `Expense updated successfully!\n\n` +
        `Previous: ${oldExpense.name} - ${oldExpense.amount.toFixed(2)}\n` +
        `Updated: ${name} - $${amount.toFixed(2)}`
    );
  }

  closeModal() {
    this.editModal.style.display = "none";
    this.currentEditId = null;
  }

  renderExpenses() {
    this.expenseItemsContainer.innerHTML = "";

    this.expenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach((expense) => {
        const expenseElement = document.createElement("div");
        expenseElement.className = "expense-item";

        const date = new Date(expense.date).toLocaleString();
        const lastModified = expense.lastModified
          ? `<div class="expense-date">Modified: ${new Date(
              expense.lastModified
            ).toLocaleString()}</div>`
          : "";

        expenseElement.innerHTML = `
                <div class="expense-info">
                    <div class="expense-name">${expense.name}</div>
                    <div class="expense-amount">$${expense.amount.toFixed(
                      2
                    )}</div>
                    <div class="expense-date">Created: ${date}</div>
                    ${lastModified}
                </div>
                <div class="expense-actions">
                    <button class="btn-action btn-edit" onclick="expenseTracker.editExpense(${
                      expense.id
                    })">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="expenseTracker.deleteExpense(${
                      expense.id
                    })">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

        this.expenseItemsContainer.appendChild(expenseElement);
      });
  }

  updateTotal() {
    const total = this.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    this.totalExpenseSpan.textContent = `$${total.toFixed(2)}`;
  }

  saveToLocalStorage() {
    localStorage.setItem("expenses", JSON.stringify(this.expenses));
  }

  clearInputs() {
    this.expenseNameInput.value = "";
    this.expenseAmountInput.value = "";
  }
}

// Initialize the expense tracker
const expenseTracker = new ExpenseTracker();

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    expenseTracker.closeModal();
    expenseTracker.closeDeleteModal();
  }
});

window.addEventListener("click", (e) => {
  if (e.target === expenseTracker.editModal) {
    expenseTracker.closeModal();
  }
  if (e.target === expenseTracker.deleteModal) {
    expenseTracker.closeDeleteModal();
  }
});
