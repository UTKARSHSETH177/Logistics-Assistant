# Logistics Assistant

Full-stack demo that pairs a FastAPI backend with a React frontend to answer logistics questions over a Cargo 2000 dataset and a conversation-ready OpenAI model.

## Project Structure
- `logistics-assistant-backend/` — FastAPI service exposing `POST /ask`, loads `c2k_data_comma.csv`, handles a few structured queries (shipment status by `nr`, average delays, hop counts) and falls back to an OpenAI model with LangChain conversation memory.
- `logistics-frontend/` — React single-page chat UI that posts user messages to the backend and displays bot replies.
- `venv/` — (optional) Python virtual environment if you choose to create one locally.

## Prerequisites
- Python 3.10+ (recommended)
- Node.js 18+ and npm 8+ (Create React App requires a modern Node; Node 22 also works with the `--openssl-legacy-provider` flag if needed)
- An OpenAI API key with access to completion/chat models

## Backend Setup (FastAPI)
1. Open a terminal in `logistics-assistant-backend`.
2. (Recommended) Create and activate a virtualenv:
   - Windows PowerShell: `python -m venv ..\venv; ..\venv\Scripts\Activate.ps1`
   - macOS/Linux: `python -m venv ../venv && source ../venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Create a `.env` file in `logistics-assistant-backend` with:
   ```
   OPENAI_API_KEY=your_key_here
   ```
5. Start the API (dev mode with reload):
   - `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
6. The API will load `c2k_data_comma.csv` on startup; ensure it stays alongside `main.py`.

## Frontend Setup (React)
1. Open another terminal in `logistics-frontend`.
2. Install packages: `npm install`
3. Start the dev server: `npm start`
4. The app runs on `http://localhost:3000` and calls the backend at `http://localhost:8000/ask`. If you change backend host/port, update the URL in `src/App.jsx`.

## Usage
- Open the frontend, type a question, and hit Send.
- Examples:
  - `Shipment 12345 status` (returns planned vs actual delivery time and hops for `nr=12345` if present)
  - `Average delay` (computes mean `o_dlv_e - o_dlv_p`)
  - `Shipments with more than 3 hops?`
- Any other phrasing is handed to the OpenAI model with per-client (IP-based) conversation memory.

## Environment Notes
- CORS is wide open for development (`allow_origins=["*"]`).
- Session memory is stored in-memory by client IP; restarting the server resets history.
- Data files present: `c2k_data_comma.csv`, `delivery_docs.csv`, `pincodes.csv`, `shipments.csv`. Only `c2k_data_comma.csv` is actively used in code.

## Production Hardening (optional next steps)
- Secure CORS and authentication before internet exposure.
- Persist conversation history (Redis/DB) instead of in-memory.
- Validate/clean user input before numeric lookups; add rate limiting and logging.
- Externalize the API base URL to an environment variable for the frontend (e.g., `.env` with `REACT_APP_API_URL`).

