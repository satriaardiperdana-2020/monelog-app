# API Integration Guide

This document describes the REST API endpoints provided by the Monelog App backend for use by the web frontend or external consumers.

## 1. Base URL

All endpoints are relative to the server host, typically: `http://localhost:8080`

## 2. Endpoints

### 2.1 Get Balance
- **Endpoint:** `/api/balance`
- **Method:** `GET`
- **Response Format:** `application/json`
- **Success Response (200 OK):**
  ```json
  {
    "balance": 1250.75,
    "currency": "USD"
  }
  ```

### 2.2 List Transactions
- **Endpoint:** `/api/transactions`
- **Method:** `GET`
- **Query Parameters:**
  - `type` (optional): `income` or `expense`
  - `limit` (optional): integer (default: 50)
- **Response Format:** `application/json`
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "amount": 1500.00,
      "type": "income",
      "category": "Salary",
      "description": "Monthly paycheck",
      "timestamp": "2026-09-17T09:00:00Z"
    },
    {
      "id": 2,
      "amount": 249.25,
      "type": "expense",
      "category": "Utilities",
      "description": "Electricity bill",
      "timestamp": "2026-09-17T14:30:00Z"
    }
  ]
  ```

### 2.3 Create Transaction
- **Endpoint:** `/api/transactions`
- **Method:** `POST`
- **Request Format:** `application/json`
- **Body:**
  ```json
  {
    "amount": 45.50,
    "type": "expense",
    "category": "Food",
    "description": "Dinner at restaurant"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "id": 3,
    "amount": 45.50,
    "type": "expense",
    "category": "Food",
    "description": "Dinner at restaurant",
    "timestamp": "2026-09-17T18:45:00Z"
  }
  ```
- **Error Response (400 Bad Request):**
  ```json
  {
    "error": "Invalid amount, must be greater than zero"
  }
  ```
