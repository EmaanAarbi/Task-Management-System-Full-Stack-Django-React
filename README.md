# FlowTask — Full-Stack Task Management System

A production-style practice project built with **Django + DRF** (backend) and **React + Vite** (frontend).

---

## Tech Stack

| Layer      | Technology                                     |
|------------|------------------------------------------------|
| Backend    | Django 4.2, Django REST Framework 3.14         |
| Auth       | drf-simplejwt (JWT), custom registration view  |
| Filtering  | django-filter, DRF SearchFilter, OrderingFilter|
| CORS       | django-cors-headers                            |
| Frontend   | React 18, Vite, React Router v6                |
| HTTP       | Axios (with JWT interceptors + auto-refresh)   |
| UI         | Custom CSS design system (dark editorial theme)|
| Toasts     | react-hot-toast                                |
| Database   | SQLite (dev) — swap for PostgreSQL in prod     |

---

## Project Structure

```
taskmanager/
├── backend/
│   ├── config/
│   │   ├── settings.py      # All Django + DRF + JWT settings
│   │   └── urls.py          # Root URL configuration
│   ├── accounts/
│   │   ├── models.py        # Custom User (email login)
│   │   ├── serializers.py   # Registration, Profile, JWT customisation
│   │   ├── views.py         # RegisterView, LoginView, MeView, UserListView
│   │   └── urls.py
│   ├── tasks/
│   │   ├── models.py        # Task (status, priority, due_date, created_by, assigned_to)
│   │   ├── serializers.py   # TaskSerializer, TaskListSerializer
│   │   ├── views.py         # TaskViewSet, TaskStatsView
│   │   ├── filters.py       # TaskFilter (status, priority, assigned_to_me, overdue…)
│   │   └── urls.py
│   ├── requirements.txt
│   └── seed.py              # Demo data: 2 users + 8 tasks
│
└── frontend/
    └── src/
        ├── api/
        │   ├── axios.js     # Axios instance + JWT interceptors + auto-refresh
        │   ├── auth.js      # register, login, logout, getMe, getUsers
        │   └── tasks.js     # CRUD + complete/reopen/assign/stats
        ├── context/
        │   └── AuthContext.jsx  # Global auth state
        ├── components/
        │   ├── AppLayout.jsx    # Sidebar + Outlet wrapper
        │   ├── Sidebar.jsx      # Navigation sidebar
        │   ├── ProtectedRoute.jsx
        │   ├── TaskCard.jsx     # Card with inline actions
        │   └── StatCard.jsx     # Dashboard stat tile
        ├── pages/
        │   ├── Login.jsx        # Email/password login
        │   ├── Register.jsx     # Full registration form with validation
        │   ├── Dashboard.jsx    # Stats + recent tasks + quick links
        │   ├── TaskList.jsx     # Grid/list with search, filter, sort, pagination
        │   ├── TaskDetail.jsx   # Full task view
        │   ├── TaskForm.jsx     # Create + Edit (shared form)
        │   └── Profile.jsx      # View + edit profile
        ├── App.jsx              # Router configuration
        └── index.css            # Complete design system
```

---

## Setup

### 1. Backend

```bash
cd backend

# Create & activate virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# (Optional) Create superuser for Django admin
python manage.py createsuperuser

# Populate demo data
python seed.py

# Start dev server
python manage.py runserver
```

Backend runs at **http://localhost:8000**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

The Vite proxy forwards all `/api/*` requests to the Django backend — no CORS issue in development.

---

## API Reference

### Authentication
| Method | Endpoint                    | Auth | Description                       |
|--------|-----------------------------|------|-----------------------------------|
| POST   | `/api/accounts/register/`   | ✗    | Register new user                 |
| POST   | `/api/accounts/login/`      | ✗    | Login → returns access + refresh  |
| POST   | `/api/auth/token/refresh/`  | ✗    | Refresh access token              |
| POST   | `/api/auth/logout/`         | ✓    | Blacklist refresh token           |
| GET    | `/api/accounts/me/`         | ✓    | Get current user profile          |
| PATCH  | `/api/accounts/me/`         | ✓    | Update profile                    |
| GET    | `/api/accounts/users/`      | ✓    | List users (for task assignment)  |

### Tasks
| Method | Endpoint                      | Auth | Description                          |
|--------|-------------------------------|------|--------------------------------------|
| GET    | `/api/tasks/`                 | ✓    | List tasks (filter/search/sort/page) |
| POST   | `/api/tasks/`                 | ✓    | Create task (auto sets created_by)   |
| GET    | `/api/tasks/{id}/`            | ✓    | Retrieve task detail                 |
| PATCH  | `/api/tasks/{id}/`            | ✓    | Update task                          |
| DELETE | `/api/tasks/{id}/`            | ✓    | Delete task                          |
| PATCH  | `/api/tasks/{id}/complete/`   | ✓    | Mark as completed                    |
| PATCH  | `/api/tasks/{id}/reopen/`     | ✓    | Reopen (back to pending)             |
| PATCH  | `/api/tasks/{id}/assign/`     | ✓    | Assign/unassign user                 |
| GET    | `/api/tasks/stats/`           | ✓    | Summary counts for dashboard         |

### Query Parameters (GET /api/tasks/)
```
?search=text              # searches title + description
?status=pending           # pending | in_progress | completed | cancelled
?priority=high            # low | medium | high | urgent
?assigned_to_me=true      # tasks assigned to current user
?created_by_me=true       # tasks created by current user
?is_overdue=true          # past due date, not completed
?due_date_before=YYYY-MM-DD
?due_date_after=YYYY-MM-DD
?ordering=-created_at     # any field, prefix - for descending
?page=2&page_size=10
```

---

## Demo Accounts

After running `seed.py`:

| Email               | Password  |
|---------------------|-----------|
| alice@example.com   | pass1234  |
| bob@example.com     | pass1234  |
| admin@example.com   | admin1234 |

Django admin panel: **http://localhost:8000/admin**

---

## Key Architecture Notes

### JWT Flow
1. User posts credentials to `/api/accounts/login/`
2. Server returns `{ access, refresh, user }` — user object embedded in token response via `CustomTokenObtainPairSerializer`
3. Access token stored in `localStorage`, attached to every request via Axios interceptor
4. On 401, interceptor auto-refreshes using the refresh token, then retries the original request
5. Logout blacklists the refresh token server-side

### Task Visibility
Users can see tasks they **created** OR tasks **assigned to them**. This is enforced in `TaskViewSet.get_queryset()` using a `Q` filter — not a permission class, so it's data-scoped rather than endpoint-scoped.

### drf-rest-registration Note
`drf-rest-registration` is not available on PyPI for Python 3.10+. The registration endpoint in `accounts/views.py` (`RegisterView`) implements the same clean API contract: validates passwords match, hashes the password, returns the new user object with a 201 status. No functionality is lost.

### Auto created_by
`TaskViewSet.perform_create()` injects `created_by=request.user` before saving — the frontend never needs to send this field.

---

## Production Checklist

- [ ] Replace `SECRET_KEY` with a real secret (use `python-decouple` or env vars)
- [ ] Set `DEBUG = False`
- [ ] Replace SQLite with PostgreSQL
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set up static file serving (WhiteNoise or S3)
- [ ] Add rate limiting to auth endpoints
- [ ] Enable HTTPS and set `SECURE_SSL_REDIRECT = True`
