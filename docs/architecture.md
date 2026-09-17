# Monelog App Architecture

This document describes the architectural layout, modules, and data flow of the Monelog App.

## 1. Architectural Overview

The application follows a clean-architecture/modular Go design, combining a Go backend server with a lightweight embedded web frontend.

```text
               +----------------------------------+
               |          Browser / Client        |
               +----------------------------------+
                                |
                        HTTP / JSON APIs
                                |
                                v
               +----------------------------------+
               |            Go Backend            |
               |                                  |
               |   +--------------------------+   |
               |   |     HTTP Handlers /      |   |
               |   |     Router Layer         |   |
               |   +--------------------------+   |
               |                 |                |
               |                 v                |
               |   +--------------------------+   |
               |   |    Business Services     |   |
               |   |    (Usecases/Log Logic)   |   |
               |   +--------------------------+   |
               |                 |                |
               |                 v                |
               |   +--------------------------+   |
               |   |   Repository / Database  |   |
               |   |   (SQLite / SQL)         |   |
               |   +--------------------------+   |
               +----------------------------------+
                                |
                            SQL Queries
                                |
                                v
               +----------------------------------+
               |         SQLite Database          |
               +----------------------------------+
```

## 2. Component Directory Structure

- **`cmd/`**: Entry points. Each subdirectory corresponds to a binary (e.g., `cmd/monelog` for the web server and CLI).
- **`internal/`**: Private application code.
  - **`config/`**: Environment configuration parsing.
  - **`db/`**: Connection setups, schema migrations, and SQLite drivers.
  - **`logger/`**: Domain logger wrapper.
  - **`service/`**: Core logic for transactions and account balance calculations.
- **`docs/`**: Project documentation, specification, and issue/plan tracking.

## 3. Data Persistence

- A local SQLite database (`monelog.db`) is used to store logged transactions.
- Schema migration scripts are integrated directly into the binary to automatically initialize the database on startup.
