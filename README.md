# Mini Hospital Workflow System

A beginner-friendly hospital workflow web app built with:
- Node.js
- Express
- HTML
- CSS
- Vanilla JavaScript

No React, MongoDB, JWT, or complex frameworks are used.

## Features

### 1) Reception Panel
- Register patient with name, age, gender, department, and symptoms.
- Auto-generate department token (example: `GEN-001`, `CAR-001`).
- Save patient data in `data/patients.json`.
- Default status is `Waiting`.
- Generate a simple patient slip after registration.

### 2) Doctor Panel
- Show all registered patients in queue.
- Show number of patients left (`Waiting`).
- Open patient record.
- Add prescription and doctor notes.
- Mark patient status as `Done`.

### 3) Patient Panel
- Search by token number.
- View name, department, token, and status.
- View how many patients are before them.
- View estimated waiting time.
- View prescription and doctor notes after update.

## Pages
- Home: `/`
- Reception: `/reception.html`
- Doctor: `/doctor.html`
- Patient: `/patient.html`

## API Routes
- `POST /api/patients`
- `GET /api/patients`
- `GET /api/patients/:token`
- `PATCH /api/patients/:token/status`
- `PATCH /api/patients/:token/prescription`

## Project Structure

```
mini-hospital-workflow-system/
├── data/
│   └── patients.json
├── public/
│   ├── index.html
│   ├── reception.html
│   ├── doctor.html
│   ├── patient.html
│   ├── style.css
│   ├── reception.js
│   ├── doctor.js
│   └── patient.js
├── server.js
├── package.json
└── README.md
```

## How to Run in VS Code

1. Open this project folder in VS Code.
2. Open the integrated terminal.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open browser:
   - `http://localhost:3000`

## Beginner Notes
- This app uses a JSON file as storage (`data/patients.json`) instead of a database.
- Data resets only if you edit/delete `patients.json`.
- Queue wait time is estimated as **10 minutes per waiting patient before your token** in the same department.
