# Smart Library QR-Based Research Registration & Session Management System

An enterprise-grade, full-stack university library management system engineered for colleges and research institutions. The platform delivers static QR-based reader registration, persistent library study sessions, automatic 24-hour cycle tracking in the `Asia/Kolkata` timezone, and a secured research repository for academic manuscripts, capstone reports, and seminar presentation decks.

---

## 🏛️ Key System Modules

### 1. Static QR Code Management (Module 1 & 11)
- **Two Permanent QR Codes**:
  1. **QR Code 1 (Registration)**: Permanent URL `https://yourdomain.com/register`
     - Validates student/scholar name, academic department, and university position.
     - Automatically generates a unique college Registration ID (e.g., `LIB-2026-10024`).
     - Directly routes reader to the session login stage.
  2. **QR Code 2 (Library Login & Session)**: Permanent URL `https://yourdomain.com/library-login`
     - Authenticates reader with Registration ID.
     - Displays personalized greeting:
       ```
       Welcome, Debadrito Chakraborty!
       Department: Computer Science and Engineering
       Position: Student
       ```
     - Triggers active countdown timer in `HH:MM:SS`.
     - Automatically logs check-in and check-out timestamps in the database.
- **Permanent Static Guarantee**: Neither QR code ever changes across daily resets or system restarts.
- **Export Formats**: High-resolution PNG, scalable vector SVG, and A4 printable PDF placard (kiosk acrylic mount).

### 2. Automatic 24-Hour Registration Cycle (Module 2)
- **Autonomous Server Daemon**: Evaluates cycle state every 10 seconds via server-side logic in the `Asia/Kolkata` timezone (IST, UTC+5:30).
- **Zero Data Loss**: Existing registrations are **never deleted**.
- **Daily Rollover**: Cycles advance every 24 hours (Cycle #1 → #2 → #N), archiving historical tallies while refreshing daily counters.

### 3. Persistent Library Sessions (Module 6)
- **Reload-Resistant Countdown**: If a reader refreshes their browser or closes their tab, the timer resumes from the server-recorded expiration time (`scheduledEndTime`), preventing timer resets.
- **Remote Checkout**: Administrators can terminate active reading hall sessions directly from the control panel.

### 4. Research Document Repository (Module 3)
- **A. Research Papers**:
  - Title, Researcher Name, Department, Domain, Abstract.
  - PDF file upload.
  - Communication Status: `Communicated` vs `Not Communicated` toggle.
  - Journal/Conference Name, Communication Date, Publication Status, DOI Link.
- **B. Project Reports**:
  - Title, Description, Department, Domain, Faculty Guide/Supervisor, PDF file, Submission Date.
- **C. PPT Presentations**:
  - Presentation Title, Presenter Name, Department, Domain, PPT/PPTX/PDF upload, Presentation Date.

### 5. Administrative Dashboard & Analytics (Module 4)
- **9 Official KPIs**:
  1. Total Registered Users
  2. Today's Registrations
  3. Active Library Sessions
  4. Completed Sessions
  5. Total Research Papers
  6. Communicated Research Papers
  7. Not Communicated Research Papers
  8. Total Project Reports
  9. Total PPT Presentations
- **Interactive Analytics**: Daily, weekly, and monthly registration trends, department breakdowns, and session duration distributions.

### 6. Module 12 Verification Test Harness (Settings)
- Built-in test harness verifying all 18 end-to-end integration test scenarios with live assertions against the backend.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Recharts, jsPDF, html5-qrcode.
- **Backend**: Node.js, Express.js, TypeScript (`tsx`).
- **Persistence**: Atomic JSON file store and structured document collections (`/data/db.json`), compatible with MongoDB / Mongoose schemas.
- **Security**: JWT tokens, bcrypt password hashing, input sanitization, file-type filters.

---

## 🚀 Installation & Local Setup

### 1. Clone Repository & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration:
```env
PORT=3000
APP_URL=http://localhost:3000
NODE_ENV=development
JWT_SECRET=smart_library_secret_key_2026_ist
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
```bash
npm run build
npm start
```

---

## 🔑 Default Administrator Credentials
- **Username**: `admin` (or `admin@library.edu`)
- **Password**: `Admin@Library2026`
- **Role**: Super Admin

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/qr/codes` | Returns static QR-1 & QR-2 data URLs and SVG vectors |
| `POST` | `/api/users/register` | Registers reader, creates unique ID & assigns to active cycle |
| `GET` | `/api/users/lookup/:id` | Validates Registration ID, fetches profile & active sessions |
| `GET` | `/api/users/export/csv` | Exports complete user directory to CSV |
| `POST` | `/api/sessions/start` | Initiates library session timer with scheduled end time |
| `POST` | `/api/sessions/end` | Concludes session, calculates duration in minutes |
| `GET` | `/api/sessions/current/:id` | Returns active timer remaining seconds for browser reload sync |
| `GET` | `/api/sessions/active` | Lists all live reading hall sessions |
| `GET` | `/api/sessions/history` | Historical session audit log with department filtering |
| `GET` | `/api/research/papers` | Retrieves research papers catalog with communication stats |
| `POST` | `/api/research/papers` | Uploads research paper manuscript (PDF) |
| `PATCH` | `/api/research/papers/:id/communication-status` | Updates communication status (Communicated/Not Communicated) |
| `GET` | `/api/research/projects` | Retrieves project capstone reports |
| `POST` | `/api/research/projects` | Uploads project dissertation (PDF) |
| `GET` | `/api/research/presentations` | Retrieves seminar PPT/PPTX presentation decks |
| `POST` | `/api/research/presentations` | Uploads PPT/PPTX presentation deck |
| `GET` | `/api/cycle-status` | Current 24-hour cycle window in Asia/Kolkata timezone |
| `POST` | `/api/admin/cycles/rollover` | Triggers manual cycle rollover (Module 2 test) |
| `GET` | `/api/admin/stats` | Dashboard KPIs and Recharts registration graphs |
| `POST` | `/api/admin/login` | Administrator authentication returning signed JWT |
