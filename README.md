# Monelog App

A lightweight, high-performance monetary logging and expense tracking application written in Go.

## Features

- **Monetary Logging:** Quickly log income and expenses with precise timestamps.
- **Categorization:** Classify transactions with custom categories and tags.
- **CLI & Web Interface:** Friendly command-line interface and API endpoints for integrations.
- **Local Storage:** SQLite or simple JSON-based storage for minimal setup and maximum portability.
- **Reporting:** Generate summary reports of spending patterns over custom timeframes.

## Prerequisites

- **Go:** `1.21` or higher installed.

## Getting Started

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/satria/monelog-app.git
   cd monelog-app
   ```

2. **Initialize Go Modules (if starting development):**
   ```bash
   go mod init monelog-app
   ```

3. **Install Dependencies:**
   ```bash
   go mod tidy
   ```

## Directory Structure

```text
├── cmd/
│   └── monelog/        # Main entry points for the CLI/Server
├── internal/
│   ├── config/         # Application configurations
│   ├── db/             # Database/Storage interfaces
│   ├── logger/         # Logging and entry formatting logic
│   └── service/        # Core business and tracking services
├── README.md           # This readme file
└── go.mod              # Go module file
```

## Running the Application

To build and run the application locally:

```bash
go run cmd/monelog/main.go
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.
