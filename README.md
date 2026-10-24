# LinkVault — MERN URL Shortener with Basic Analytics

LinkVault is a clean, reliable, and developer-focused URL shortener built with the **MERN** stack (MongoDB, Express, React, Node.js) and Vite.

It was designed specifically as a solid, understandable full-stack project for technical recruitment tasks, avoiding unnecessary complexity while following web standards and security best practices.

---

## 1. Features

- **Link Shortening**: Converts long HTTP/HTTPS URLs into unique, compact 6-character short codes.
- **Instant Copy**: 1-click clipboard copy with immediate feedback.
- **Redirection**: Visiting `/:shortCode` performs an HTTP 302 redirect directly to the destination.
- **Click Analytics**: Tracks total visits atomically in MongoDB using `$inc`.
- **Expiration Protection**: Optional expiry date prevents access after a link has elapsed.
- **Collision Safety**: Validates unique short codes with automatic collision retries.
- **Link Management**: Dashboard showing all shortened links, destination previews, click counts, creation timestamps, and deletion.
- **Developer-Focused UI**: Built with pure CSS, responsive tables, real metrics, and zero generic AI bloat.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | User interface, component lifecycle, reactive state |
| **Styling** | Vanilla CSS | Custom design system using CSS variables, no heavy UI dependencies |
| **Backend** | Node.js + Express.js | REST API, validation, routing, HTTP redirection |
| **Database** | MongoDB Atlas + Mongoose | Document database, schema validation, atomic operations |
| **Identifiers** | Nanoid (alphanumeric) | URL-safe, compact unique code generator |
| **Deployment** | Render (API) + Vercel (UI) | Free-tier cloud hosting for frontend and backend |

---

## 3. Project Architecture & Data Flow

```text
User visits Frontend (Vercel / localhost:5173)
       │
       ▼
[React: UrlForm] ─── POST /api/urls ─────────► [Express Server: server.js]
                                                      │
                                                      ▼
                                              Validate URL & Protocol
                                              Generate Unique Code (nanoid)
                                              Save to MongoDB via Mongoose
                                                      │
                                                      ▼
User clicks Short Link (e.g., localhost:5000/aB39xZ)
       │
       ▼
[GET /:shortCode] ───► Find Document in MongoDB
                       Check Expiration (expiresAt)
                       Increment Clicks: $inc: { clicks: 1 }
                       HTTP 302 Found ──► Original Destination URL
```

---

## 4. Folder Structure

```text
EventEase/
├── backend/
│   ├── config/
│   │   └── db.js            # MongoDB connection handler
│   ├── models/
│   │   └── Url.js           # Mongoose schema (originalUrl, shortCode, clicks, expiresAt)
│   ├── routes/
│   │   └── urls.js          # REST endpoints (POST, GET, DELETE /api/urls)
│   ├── server.js            # Express app, health check, and GET /:shortCode redirect
│   ├── package.json         # Backend scripts & dependencies
│   ├── .env.example         # Template for environment variables
│   └── .env                 # Local secrets (never committed to Git)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Header and live server status indicator
│   │   │   ├── StatsCards.jsx  # Computed metrics (total links, clicks, active)
│   │   │   ├── UrlForm.jsx     # Input form, validation, and instant copy feedback
│   │   │   └── UrlTable.jsx    # Table displaying links, click badges, and actions
│   │   ├── App.jsx             # Main state coordinator and API client
│   │   ├── App.css             # Developer-grade CSS styling
│   │   └── main.jsx            # React root DOM mounting
│   ├── vite.config.js          # Vite build configuration
│   ├── package.json            # Frontend scripts & dependencies
│   └── .env.example            # Frontend environment variable template
├── .gitignore                  # Ignores node_modules, build outputs, and .env files
├── package.json                # Root convenience scripts (npm run dev)
└── README.md                   # Full documentation & interview prep guide
```

---

## 5. Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB (local running MongoDB instance or MongoDB Atlas cloud connection string)

### 1. Clone & Install Dependencies
From the project root:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables
Inside `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/linkvault?retryWrites=true&w=majority
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

Inside `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Run the Development Servers
From the root directory:
```bash
# Runs backend with nodemon
npm run dev

# In a second terminal, run frontend
npm run client
```

Now open `http://localhost:5173` in your browser!

---

## 6. API Reference

### Health Check
- **`GET /api/health`**
  - **Response (200 OK)**:
    ```json
    {
      "status": "ok",
      "service": "LinkVault Backend API",
      "database": "connected",
      "timestamp": "2026-10-22T16:35:08.850Z"
    }
    ```

### Create Short URL
- **`POST /api/urls`**
  - **Body**:
    ```json
    {
      "originalUrl": "https://developer.mozilla.org",
      "expiresAt": "2026-12-31T23:59:59.000Z" // optional
    }
    ```
  - **Response (201 Created)**:
    ```json
    {
      "message": "Short URL created successfully.",
      "url": {
        "_id": "6717d...",
        "originalUrl": "https://developer.mozilla.org",
        "shortCode": "k4J9pQ",
        "shortUrl": "http://localhost:5000/k4J9pQ",
        "clicks": 0,
        "expiresAt": null,
        "createdAt": "2026-10-22T..."
      }
    }
    ```

### Get All Short URLs
- **`GET /api/urls`**
  - **Response (200 OK)**:
    ```json
    {
      "urls": [ ... ]
    }
    ```

### Delete a Short URL
- **`DELETE /api/urls/:id`**
  - **Response (200 OK)**:
    ```json
    {
      "message": "URL deleted successfully."
    }
    ```

### Redirect Short URL
- **`GET /:shortCode`**
  - Increments `clicks` by 1.
  - Returns `302 Found` with `Location: <originalUrl>`.
  - Returns `410 Gone` if expired.
  - Returns `404 Not Found` if shortCode does not exist.

---

## 7. Deployment Instructions

### Backend (Render)
1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com) and click **New Web Service**.
3. Connect your GitHub repository.
4. Set the **Root Directory** to `backend`.
5. Set **Build Command** to `npm install`.
6. Set **Start Command** to `npm start`.
7. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas URI.
   - `BASE_URL`: Your Render public URL (e.g. `https://linkvault-api.onrender.com`).
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://linkvault.vercel.app`) for CORS and error page navigation.
   - `PORT`: `5000`.

### Frontend (Vercel)
1. Sign in to [Vercel](https://vercel.com) and import your GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: The URL of your Render backend (e.g. `https://linkvault-api.onrender.com`).
5. Click **Deploy**.

---

## 8. Technical Interview Preparation Guide

### Q1: What does the MERN stack stand for and what is the role of each piece?
- **M (MongoDB)**: A NoSQL document database where data is stored as flexible JSON-like BSON documents.
- **E (Express.js)**: A lightweight Node.js web application framework that provides routing, middleware support, and HTTP utilities.
- **R (React.js)**: A frontend component library used to build interactive, state-driven user interfaces.
- **N (Node.js)**: A JavaScript runtime built on Chrome's V8 engine that allows us to execute JavaScript on the server.

### Q2: Why did we use HTTP 302 instead of HTTP 301 for redirects?
- **301 Moved Permanently**: Browsers cache 301 redirects aggressively. If a user clicks the short link a second time, the browser wouldn't contact our server at all, skipping our click tracker.
- **302 Found (Temporary Redirect)**: The browser does not cache the destination permanently. Every visit sends a request to our server, allowing our analytics counter to increment accurately on every click.

### Q3: How is click counting handled, and what are its limitations?
- We use Mongoose's `Url.findByIdAndUpdate(id, { $inc: { clicks: 1 } })`.
- Using `$inc` ensures that MongoDB increments the integer atomically directly in the database engine, preventing lost updates from basic read-modify-write race conditions.
- **Limitation**: In high-traffic production systems with tens of thousands of concurrent clicks per second, hitting MongoDB on every redirect can bottleneck database I/O. In large-scale architectures, clicks would instead be buffered in Redis or a message queue (like Kafka/RabbitMQ) and written to the database in batches.

### Q4: How does short code collision handling work?
- We generate a 6-character alphanumeric string using `nanoid`.
- Before inserting, our backend checks `Url.findOne({ shortCode })`.
- If a collision occurs (which has an astronomically low probability with ~68 billion combinations), the loop generates a new code up to 5 attempts before returning an error.
- The `shortCode` field also has a unique index in MongoDB (`unique: true, index: true`), which ensures lookups during redirection run in $O(\log N)$ time rather than full collection scans.

### Q5: How do environment variables protect configuration?
- Secrets such as database credentials (`MONGODB_URI`) are stored in a `.env` file that is listed in `.gitignore`.
- This ensures sensitive passwords and production connection strings are never exposed in public Git commits or client-side JavaScript bundles.
