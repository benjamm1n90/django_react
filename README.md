Creates a simple moving estimation web app

Goal: gain experience with full stack development, api, jwt auth, and deployment

can create username/password with unique jwt

can create an estimate on the estimate page (the landing page after login) for a customer, saves the estimate, ability to edit or delete old estimates

each estimate can have notes attached to it via an "Add Notes" button on that estimate's card, which opens an inline area to add move details (special items, access issues, etc.) and view/delete existing notes for that estimate

project future goals:

deep, accurate estimate information based on years of personal experience in the moving industry (utilizing information such as walk distance, steps, types of furniture/special needs (piano moving, valuable items, etc), loading dock access vs street parking)
estimate should utilize those metrics to predict an hour estimate instead of being manually input

a new page for completed moves, linked to the same estimate/notes data - all data should be able to be edited


---

## Running with Docker

The whole stack (Postgres, Django/gunicorn backend, nginx-served React frontend) runs via Docker Compose:

```
cp .env.docker.example .env
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

Edit `.env` to set real values for `DJANGO_SECRET_KEY`, `POSTGRES_PASSWORD`, etc. before deploying anywhere beyond local testing.

## Running tests

Backend (Django):

```
cd backend
python manage.py test api
```

Frontend (Vitest + React Testing Library):

```
cd frontend
npm install
npm test
```
