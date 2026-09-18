# Monelog App Requirements

This document outlines the business and functional requirements for the **Monelog App**, specifically focusing on the Web MVP stage.

## 1. Functional Requirements

### 1.1 Transaction Logging
- Users must be able to log transactions with the following fields:
  - **Amount:** Numerical decimal value (positive for income, negative or distinct type for expense).
  - **Type:** `income` or `expense`.
  - **Category:** Predefined/custom categorization (e.g., Food, Salary, Utilities).
  - **Description:** Optional text describing the transaction.
  - **Timestamp:** The date and time of the transaction (defaults to current time).

### 1.2 Balance Calculation
- The application must compute and display the current total balance in real-time or upon dashboard load.

### 1.3 Transaction History
- Users must be able to view a chronological history of logged transactions.
- Filter transactions by type (income/expense) or category.

### 1.4 Web MVP Dashboard
- A simple, clean, and responsive web user interface to perform all of the above operations.

## 2. Non-Functional Requirements

- **Simplicity:** No complex authentication required for the MVP; a single-user or local-first approach.
- **Performance:** HTTP responses should be served under 100ms on local networks.
- **Data Persistence:** Transactions must be persistently stored in a local SQLite database.
- **Portability:** Built as a single self-contained binary (Go backend + embedded static frontend files).
