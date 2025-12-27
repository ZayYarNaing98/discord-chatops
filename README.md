# FinLog ChatOps - Discord Bot

A Discord bot for managing financial logs and leave requests with Laravel backend integration.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Commands](#commands)
- [Usage Flow](#usage-flow)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [API Integration](#api-integration)
- [Troubleshooting](#troubleshooting)

---

## Overview

FinLog ChatOps is a Discord bot that enables team members to:
- Log financial transactions (income/expenses) directly from Discord
- Submit leave requests for HR approval
- All data is synced with a Laravel backend for dashboard reporting

---

## Features

### Financial Logging (`/finlog`)
- Select category from predefined list (fetched from Laravel API)
- Choose transaction type (Income/Expense) via dropdown
- Enter amount, date, and optional notes
- Preview before confirming
- Automatic sync to Laravel database

### Leave Requests (`/leave`)
- Submit leave requests with type, dates, and reason
- HR approvers can approve/reject via buttons
- Role-based access control for approvers

---

## Prerequisites

- Node.js v18+
- npm or yarn
- Discord Bot Token (from Discord Developer Portal)
- Laravel backend running (for API integration)

---

## Installation

1. **Clone the repository**
   ```bash
   cd discord-chatops
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Register slash commands**
   ```bash
   npm run register-commands
   ```

5. **Start the bot**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

---

## Configuration

### Environment Variables (`.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DISCORD_TOKEN` | Bot token from Discord Developer Portal | `MTQ1MDA3MTM0Njc1NDI...` |
| `CLIENT_ID` | Application ID from Discord Developer Portal | `1450071346754228305` |
| `GUILD_ID` | Server ID where bot is installed | `1450072635731083328` |
| `LARAVEL_API_URL` | Laravel API base URL | `http://localhost:8000/api` |

### Constants Configuration

**HR Constants** (`constants/hr.constants.js`)
```javascript
HR_REVIEW_CHANNEL_ID    // Channel for leave request reviews
HR_APPROVER_ROLE_ID     // Role ID that can approve/reject leaves
```

**FinLog Constants** (`constants/finlog.constants.js`)
```javascript
FINLOG_CHANNEL_ID       // Channel for financial log entries
```

---

## Commands

### `/finlog` - Financial Logging

Log income or expense transactions.

**Flow:**
```
/finlog
   ↓
Select Category (dropdown)
   ↓
Select Type: 💰 Income / 💸 Expense (dropdown)
   ↓
Modal Form:
  - Date (auto-filled with today)
  - Amount
  - Notes (optional)
   ↓
Preview with Confirm/Cancel buttons
   ↓
✅ Saved to Laravel database & posted to channel
```

### `/leave` - Leave Request

Submit a leave request for HR approval.

**Flow:**
```
/leave
   ↓
Modal Form:
  - Leave Type (Annual/Sick/Other)
  - Start Date
  - End Date
  - Reason (optional)
   ↓
Posted to HR Review Channel with Approve/Reject buttons
   ↓
HR Approver clicks Approve or Reject
   ↓
Status updated in channel
```

---

## Usage Flow

### Financial Log Entry

1. **User runs `/finlog`**

   ![Step 1](https://via.placeholder.com/400x100?text=Select+Category+Dropdown)

2. **Select a category**
   - Categories are fetched from Laravel API
   - Options: Office Supplies, Travel, Software, Sales Revenue, etc.

3. **Select transaction type**
   ```
   📁  Category:  Office Supplies

   📊  Select transaction type:

   [💰 Income ▼]  [💸 Expense ▼]
   ```

4. **Fill in the modal form**
   ```
   ┌─────────────────────────────────┐
   │  💸 Expense - Office Supplies   │
   ├─────────────────────────────────┤
   │  Date (YYYY-MM-DD)              │
   │  [2025-12-27          ]         │
   │                                 │
   │  Amount                         │
   │  [150.00              ]         │
   │                                 │
   │  Notes (optional)               │
   │  [Printer ink and paper]        │
   └─────────────────────────────────┘
   ```

5. **Preview and confirm**
   ```
   💸  Financial Log Preview
   ━━━━━━━━━━━━━━━━━━━━━━━━━━

   👤  User:  john_doe

   📅  Date:  2025-12-27

   📊  Type:  Expense

   💵  Amount:  $150.00

   🏷️  Category:  Office Supplies

   📝  Notes:  Printer ink and paper

   ━━━━━━━━━━━━━━━━━━━━━━━━━━

   ⚠️  Please confirm to save this entry.

   [Confirm]  [Cancel]
   ```

6. **Entry saved and posted**
   - Saved to Laravel database
   - Posted to FinLog channel
   - Visible on Laravel dashboard

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Discord                               │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │ /finlog │    │ /leave  │    │ Buttons │    │ Modals  │   │
│  └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘   │
└───────┼──────────────┼──────────────┼──────────────┼────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────────────────────────────────────────────────────┐
│                      ChatOps Bot (Node.js)                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                     index.js                            │  │
│  │              (Interaction Handler)                      │  │
│  └────────────────────────────────────────────────────────┘  │
│           │                    │                    │         │
│           ▼                    ▼                    ▼         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │   commands/    │  │ interactions/  │  │   services/    │  │
│  │  - finlog.js   │  │  - modals      │  │  - api.js      │  │
│  │  - leave.js    │  │  - buttons     │  │  - finlog.js   │  │
│  │                │  │  - selectmenu  │  │  - leave.js    │  │
│  └────────────────┘  └────────────────┘  └───────┬────────┘  │
└──────────────────────────────────────────────────┼───────────┘
                                                   │
                                                   ▼
┌──────────────────────────────────────────────────────────────┐
│                    Laravel Backend API                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  GET  /api/finlog-categories  - Get categories          │  │
│  │  POST /api/finlog             - Store financial log     │  │
│  └────────────────────────────────────────────────────────┘  │
│                            │                                  │
│                            ▼                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    MySQL Database                       │  │
│  │  - categories                                           │  │
│  │  - financial_logs                                       │  │
│  │  - users                                                │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
chatops/
├── index.js                    # Main entry point, interaction handler
├── register-commands.js        # Script to register slash commands
├── package.json
├── .env                        # Environment variables
│
├── commands/                   # Slash command definitions
│   ├── finlog.command.js       # /finlog command
│   └── leave.command.js        # /leave command
│
├── interactions/               # Interaction handlers
│   ├── finlog.modal.js         # Financial log modal form
│   ├── finlog.selectmenu.js    # Category & type select menus
│   ├── finlog.buttons.js       # Confirm/cancel buttons
│   ├── leave.modal.js          # Leave request modal form
│   └── leave.buttons.js        # Approve/reject buttons
│
├── services/                   # Business logic
│   ├── api.service.js          # Laravel API client
│   ├── finlog.service.js       # Financial log formatting
│   └── leave.service.js        # Leave request formatting
│
└── constants/                  # Configuration constants
    ├── finlog.constants.js     # FinLog channel ID, modal IDs
    └── hr.constants.js         # HR channel ID, approver role ID
```

---

## API Integration

### Laravel Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/finlog-categories` | Fetch active categories |
| `POST` | `/api/finlog` | Store financial log entry |

### GET `/api/finlog-categories`

**Response:**
```json
[
  { "id": 1, "name": "Office Supplies", "description": "...", "type": "expense" },
  { "id": 2, "name": "Travel", "description": "...", "type": "expense" },
  { "id": 11, "name": "Sales Revenue", "description": "...", "type": "income" }
]
```

### POST `/api/finlog`

**Request:**
```json
{
  "category_id": 1,
  "amount": 150.00,
  "type": "expense",
  "transaction_date": "2025-12-27",
  "description": "Printer ink and paper",
  "discord_user_id": "123456789",
  "discord_username": "john_doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Financial log created successfully",
  "data": {
    "id": 16,
    "user_id": 2,
    "category_id": 1,
    "amount": "150.00",
    "type": "expense",
    "transaction_date": "2025-12-27",
    "description": "Printer ink and paper"
  }
}
```

---

## Troubleshooting

### Bot not responding to commands

1. **Check bot is online**
   ```bash
   npm run dev
   # Look for: ✅ Logged in as chatops-test#6972
   ```

2. **Re-register commands**
   ```bash
   npm run register-commands
   ```

3. **Check bot permissions**
   - Ensure bot has `Send Messages`, `Use Slash Commands` permissions

### Categories not loading

1. **Check Laravel is running**
   ```bash
   cd ../finlog && php artisan serve
   ```

2. **Verify API URL in .env**
   ```
   LARAVEL_API_URL=http://localhost:8000/api
   ```

3. **Test API manually**
   ```bash
   curl http://localhost:8000/api/finlog-categories
   ```

### "Unknown interaction" error

- This occurs when the bot takes too long to respond (>3 seconds)
- Ensure Laravel API is fast and accessible
- Check for network issues

### Buttons not working

1. **Check button custom IDs match handlers in index.js**
2. **Ensure correct role IDs in constants for HR approval**

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the bot |
| `npm run dev` | Start with auto-reload (nodemon) |
| `npm run register-commands` | Register slash commands with Discord |
| `npm run bot` | Alias for `npm start` |

---

## Dependencies

| Package | Version | Description |
|---------|---------|-------------|
| `discord.js` | ^14.x | Discord API library |
| `axios` | ^1.x | HTTP client for API calls |
| `dotenv` | ^17.x | Environment variable management |
| `nodemon` | ^3.x | Development auto-reload |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 🙏 Acknowledgments

- [Laravel](https://laravel.com/) - The PHP framework
- [FrankenPHP](https://frankenphp.dev/) - The application server
- [Spatie](https://spatie.be/) - Laravel packages