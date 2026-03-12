# HealthSync — Smart Medication & Nutrition Companion

A full-stack healthcare web platform for managing medications, nutrition, wellness, vaccinations, women's health, and AI-powered health assistance.

---

## Project Structure

```
healthsync/
├── frontend/                    # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # Base UI (Button, Input, etc.)
│   │   │   ├── AppLayout.tsx    # Main layout wrapper
│   │   │   ├── AppSidebar.tsx   # Navigation sidebar
│   │   │   ├── FloatingChatbot.tsx  # Global AI chatbot widget
│   │   │   ├── StatCard.tsx     # Dashboard stat cards
│   │   │   ├── ThemeToggle.tsx  # Dark/light mode
│   │   │   └── NavLink.tsx      # Active nav links
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # JWT auth state
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── HealthProfile.tsx
│   │   │   ├── MedicineManager.tsx
│   │   │   ├── MedicineFood.tsx  # Interaction checker
│   │   │   ├── DietPlanner.tsx
│   │   │   ├── FoodTracker.tsx
│   │   │   ├── WellnessTracker.tsx
│   │   │   ├── VaccinationTracker.tsx
│   │   │   ├── WomensHealth.tsx
│   │   │   └── Settings.tsx
│   │   ├── services/
│   │   │   └── api.ts           # Axios instance with JWT interceptors
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   └── package.json
│
└── backend/                     # Node.js + Express
    ├── config/
    │   └── db.js                # MongoDB connection
    ├── controllers/
    │   ├── authController.js
    │   ├── medicineController.js
    │   ├── foodController.js
    │   ├── wellnessController.js
    │   ├── vaccinationController.js
    │   ├── womensHealthController.js
    │   └── chatController.js
    ├── middleware/
    │   └── auth.js              # JWT verify middleware
    ├── models/
    │   ├── User.js
    │   ├── Medicine.js
    │   ├── FoodLog.js
    │   ├── WellnessLog.js
    │   ├── Vaccination.js
    │   └── MenstrualCycle.js
    ├── routes/
    │   ├── auth.js
    │   ├── medicines.js
    │   ├── food.js
    │   ├── wellness.js
    │   ├── vaccinations.js
    │   ├── womensHealth.js
    │   ├── chat.js
    │   └── interactions.js
    ├── .env.example
    ├── package.json
    └── server.js
```

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, TypeScript, Vite, Tailwind CSS |
| Animation   | Framer Motion                       |
| Charts      | Recharts                            |
| HTTP Client | Axios                               |
| Backend     | Node.js, Express.js                 |
| Database    | MongoDB Atlas (Mongoose ODM)        |
| Auth        | JWT + bcryptjs                      |
| AI          | OpenAI API (GPT-4o-mini)            |
| Deployment  | Frontend → Vercel, Backend → Render |

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- OpenAI API key (optional — fallback responses work without it)

---

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd healthsync
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/healthsync
JWT_SECRET=your_super_secret_key_min_32_chars
OPENAI_API_KEY=sk-...          # Optional — chatbot falls back gracefully
CLIENT_URL=http://localhost:5173
```

Start backend:
```bash
npm run dev        # With nodemon (recommended)
# or
npm start          # Production
```

Backend runs on: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get profile (auth required) |
| PUT | `/api/auth/profile` | Update profile (auth required) |

### Medicines
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medicines` | List all medicines |
| POST | `/api/medicines` | Add medicine |
| PUT | `/api/medicines/:id` | Update medicine |
| DELETE | `/api/medicines/:id` | Delete medicine |

### Food Tracker
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/food` | Today's food logs |
| POST | `/api/food` | Add food log |
| DELETE | `/api/food/:id` | Delete food log |
| GET | `/api/food/weekly` | Weekly stats |

### Wellness
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wellness` | Get logs |
| POST | `/api/wellness` | Add log |

### Vaccinations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vaccinations` | Get all vaccinations |
| POST | `/api/vaccinations` | Add vaccination |
| PUT | `/api/vaccinations/:id` | Update vaccination |
| DELETE | `/api/vaccinations/:id` | Delete vaccination |

### Women's Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/womens-health` | Get cycle history |
| POST | `/api/womens-health` | Add cycle entry + predictions |
| GET | `/api/womens-health/predictions` | Get latest predictions |

### Interactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/interactions/check?medicine=iron` | Check food interactions |

### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to AI assistant |

---

## Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### Backend → Render

1. Create new Web Service on [render.com](https://render.com)
2. Connect GitHub repo, set root directory to `backend/`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - `CLIENT_URL=https://your-app.vercel.app`

### Database → MongoDB Atlas

1. Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user
3. Whitelist all IPs (0.0.0.0/0) or Render's IP
4. Copy connection string to `MONGODB_URI`

---

## Features

- **JWT Authentication** — Secure register/login/logout
- **Health Profile** — BMI calculator, daily calorie goals
- **Medicine Manager (MedSafe)** — Add/edit/delete/mark medicines, adherence tracking
- **Medicine-Food Interaction Checker** — JSON dataset for common medicines
- **Smart Diet Planner** — Goal-based meal suggestions (weight loss/gain/fitness/general)
- **Food Tracker** — Log meals with macro tracking (calories/protein/carbs/fats)
- **Wellness Tracker** — Energy, water intake, sleep hours with trend charts
- **Vaccination Tracker** — Store vaccine records with due date alerts
- **Women's Health** — Menstrual cycle tracking with period/ovulation predictions + menopause education
- **AI Health Assistant** — Floating chatbot powered by OpenAI (educational info only disclaimer)
- **Dashboard** — Charts: calorie intake, medicine adherence, energy trends, weight progress
- **Dark Mode** — Full theme support

---

## Important Disclaimer

HealthSync provides **educational health information only**. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your physician or qualified health provider for personal medical decisions.
