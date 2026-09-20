# HACK IT BROS '26 — Zero-Click Store Operator

**Track 1: Autonomous AI & Agentic Workflows**

An autonomous AI operator for neighborhood Kirana (general) stores. Customers place orders via natural language chat; the backend agent understands requests, checks inventory, creates orders, and manages stock — all without manual intervention.

---

## Tech Stack

- **Frontend:** React + Vite, Tailwind CSS, Lucide React
- **Backend:** Python FastAPI
- **Database:** Supabase PostgreSQL
- **AI:** Google Gemini (via `google-genai`)

---

## Architecture

```
Customer Chat (React)
        ↓
   FastAPI REST API
        ↓
  Supabase PostgreSQL
```

The frontend never connects to Supabase directly. All data flows through the FastAPI backend.

---

## MVP Features

### 🔐 Authentication & Authorization

- Role-based login: **Customer** and **Store Owner**
- Session persisted via `supabase`
- `/login` — login page with role selector and password field
- `/chat` — protected, customer-only route
- `/dashboard`, `/orders`, `/products`, etc. — protected, owner-only routes
- Unauthenticated users are redirected to `/login`
- Logout clears session and redirects to login

### 💬 Customer Chat Interface (`/chat`)

- WhatsApp-like chat UI with message bubbles
- Customer messages on the right (teal), AI responses on the left (white)
- Timestamps on all messages
- Language selector: **English / हिंदी / Hinglish**
- Send button, microphone icon, attachment icon (UI only)
- Quick action buttons:
  - Check Price
  - Check Availability
  - Place Order
  - Cancel Order
  - + New Request (resets chat)

### 🎙️ Voice Input

- Microphone button uses the browser's **Web Speech API**
- Language-aware recognition (`hi-IN` for Hindi, `en-US` for English/Hinglish)
- Pulsing red indicator + "Listening... speak now" while active
- Transcribed text auto-fills the input field
- Graceful fallback alert if browser doesn't support it (Chrome recommended)

### 🛒 Natural Language Ordering

- Customer types messages like:
  - English: *"Give me 2 kg rice and 1 litre oil"*
  - Hindi: *"मुझे 2 किलो चावल और 1 लीटर तेल चाहिए"*
  - Hinglish: *"2 kg chawal aur 1 litre oil de do"*
- Frontend sends the raw message to `POST /api/v1/process`
- Backend extracts products, quantities, checks inventory, calculates totals, creates the order
- Frontend renders the backend response — never hardcodes product names, prices, or stock

### 🧾 Order Bill

- Professional digital bill rendered after successful order creation
- Includes:
  - Store name and order ID
  - Customer name
  - Itemized list: product, quantity, unit, unit price, item total
  - Grand total
  - Order status (Confirmed)
  - Date
- **Download / Print Bill** button (browser `window.print()`)

### ⚠️ Unavailable Product Handling

- If stock is insufficient, backend returns `available: false`
- Frontend shows a clear orange alert:
  - *"Sorry! 😕 Only 4 kg Rice is available. You requested 10 kg."*
- For partial orders, shows which items are available and which are not
- Frontend never creates an order when backend reports unavailable quantities

### 💰 Price Summary

- When customer asks for prices, backend returns itemized breakdown
- Frontend renders structured price summary:
  ```
  🧾 PRICE SUMMARY
  Rice     2 kg × ₹60 = ₹120
  Oil      1 L × ₹130 = ₹130
  -------------------------------
  Total: ₹250
  ```

### 🤖 AI Operator Activity Log

- Expandable section after each AI interaction
- Shows autonomous workflow steps:
  1. Received customer request
  2. Understood products and quantities
  3. Checked inventory
  4. Checked prices
  5. Calculated total
  6. Created structured order
  7. Updated inventory
  8. Sent confirmation
- Each step shows status, timestamp, and short description
- Rendered from actual backend response data — no fake animations

### 📋 Order Cancellation

- Customer can cancel via chat: *"Cancel my order ORD-1001"*
- Frontend sends cancellation request to backend
- Backend validates whether cancellation is allowed
- Success: *"Your order #ORD-1001 has been cancelled successfully."*
- Failure: *"Sorry, this order cannot be cancelled because it has already been delivered."*

### 📊 Merchant Dashboard (`/dashboard`)

- **Top stat cards:**
  - Today's Orders
  - Sales (₹)
  - Low Stock Items
  - AI Agent Status (● ACTIVE / Running)
- **Recent Orders table** — Order ID, Customer, Source, Total, Status
- **Low Stock Alert panel** — products below threshold
- **Latest AI Activity** — recent workflow logs

### 📦 Orders Page (`/orders`)

- Full orders table: Order ID, Customer, Items, Qty, Price, Source, Status
- Inline status editing with save/cancel
- Statuses: New, Processing, Confirmed, Delivered, Cancelled
- Sources: WhatsApp, Phone, Walk-in

### 🏪 Products Page (`/products`)

- Search bar with real-time filtering
- **Add New Product** form
- Product table: Product, Category, Stock, Unit Price, Status, Actions
- Edit product (inline form)
- Delete product (with confirmation modal)
- Update stock (inline editor)
- Low stock badges (orange) for items below threshold

### 👥 Customers Page (`/customers`)

- Customer table: Name, Phone, ID

### 📈 Analytics Page (`/analytics`)

- Total Revenue, Total Orders, Average Order Value, Customer Count
- Product counts and fulfillment rate
- Order source breakdown (WhatsApp, Phone, Walk-in)

### 🤖 AI Logs Page (`/ai-logs`)

- 9-step autonomous workflow pipeline overview
- Chronological logs grouped by order
- Timeline view with checkmarks for each step
- Timestamps and status per log entry

### ⚙️ Settings Page (`/settings`)

- Store name configuration
- Low stock threshold configuration
- About section with hackathon info

### 🌐 Beach/Sand Theme

- Ocean blue sidebar (`#075985`)
- Sand/cream page backgrounds (`#fdf8f0`)
- Palm green success indicators (`#2d6a4f`)
- Shell orange warnings (`#ff7f50`)
- Clean, flat SaaS/admin UI — no gradients, no animations

---

## Backend API Contract

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/process` | Send customer message to AI agent |
| GET | `/api/v1/health` | Health check |
| GET | `/api/orders` | List all orders |
| GET | `/api/orders/:id` | Get single order |
| PATCH | `/api/orders/:id/status` | Update order status |
| POST | `/api/orders/:id/cancel` | Cancel order |
| GET | `/api/products` | List products |
| POST | `/api/products` | Create product |
| PATCH | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| PATCH | `/api/products/:id/stock` | Update product stock |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/customers` | List customers |
| GET | `/api/ai-logs` | AI workflow logs |

---

## Demo Flow

1. Customer opens the app → sees login page
2. Logs in as Customer → lands on chat interface
3. Types: *"2 kg chawal, 1 litre oil aur 2 packet Maggi chahiye"*
4. Frontend sends message to FastAPI backend
5. Backend (AI agent):
   - Understands the request
   - Identifies products in Supabase
   - Checks inventory
   - Calculates total
   - Creates structured order
   - Deducts stock
   - Generates workflow logs
6. Frontend displays:
   - **Order Confirmed** message
   - **Digital bill** with itemized breakdown
   - **AI Operator Activity** expandable section
7. Merchant logs in as Owner → views order in dashboard, manages products

---

## Project Structure

```
bee-tech/
├── backend/
│   ├── api/
│   │   └── routes.py          # FastAPI endpoints
│   ├── agent/
│   │   ├── graph.py           # AI agent (Gemini + tools)
│   │   ├── state.py           # Agent state model
│   │   └── tools.py           # Agent tool wrappers
│   ├── db/
│   │   └── supabase.py        # Supabase client
│   ├── services/
│   │   ├── orders.py          # Order CRUD
│   │   ├── inventory.py       # Product/inventory
│   │   ├── customers.py       # Customer lookup
│   │   └── delivery.py        # Delivery tasks
│   ├── schemas/
│   │   └── models.py          # Pydantic models
│   ├── mock_db.py             # Temporary mock (to be replaced by Supabase)
│   └── main.py                # FastAPI app entry
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── api.js         # API service layer (all fetch calls)
│   │   │   └── auth.js        # Auth service (login/logout/session)
│   │   ├── components/
│   │   │   ├── Layout.jsx     # Sidebar + TopBar + Outlet
│   │   │   ├── Sidebar.jsx    # Navigation sidebar
│   │   │   └── TopBar.jsx     # Header with user info + logout
│   │   ├── pages/
│   │   │   ├── Login.jsx      # Login with role selection
│   │   │   ├── Chat.jsx       # Customer chat interface
│   │   │   ├── Dashboard.jsx  # Merchant dashboard
│   │   │   ├── Orders.jsx     # Order management
│   │   │   ├── Products.jsx   # Product CRUD
│   │   │   ├── Customers.jsx  # Customer list
│   │   │   ├── Analytics.jsx  # Sales analytics
│   │   │   ├── AILogs.jsx     # AI workflow logs
│   │   │   └── Settings.jsx   # Store settings
│   │   ├── App.jsx            # Router with auth guards
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Tailwind + base styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

---

## Setup

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../database/.env .env   # or set env vars
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env       # set VITE_API_URL
npm run dev
```

---

## Notes

- Mock data exists in `src/services/api.js` as a fallback when the backend is unreachable — easy to remove once all endpoints are live
- Frontend never contains Supabase credentials or database logic
- All business logic (inventory checks, order creation, stock deduction, price calculation) lives in the backend
- Voice input uses the browser-native Web Speech API — no additional dependencies
- `supabase` is used only for auth session persistence, not as a database
