// Import built-in and third-party modules.
const express = require('express');
const fs = require('fs');
const path = require('path');

// Create the Express app and choose a port.
const app = express();
const PORT = 3000;

// Path to our JSON file that acts like a tiny database.
const dataFilePath = path.join(__dirname, 'data', 'patients.json');

// Middleware: parse JSON request bodies and serve static files from /public.
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper function: read patient data from the JSON file.
function readPatients() {
  try {
    const fileData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(fileData);
  } catch (error) {
    // If file is missing/broken, safely return an empty list.
    return [];
  }
}

// Helper function: write patient data back to the JSON file.
function writePatients(patients) {
  fs.writeFileSync(dataFilePath, JSON.stringify(patients, null, 2), 'utf-8');
}

// Helper function: generate department-based token numbers.
// Example: Cardiology -> CAR-001, General -> GEN-002.
function generateToken(department, patients) {
  const cleanedDepartment = (department || 'GEN').trim().toUpperCase();
  const prefix = cleanedDepartment.slice(0, 3).padEnd(3, 'X');

  const sameDepartmentPatients = patients.filter((patient) => patient.token.startsWith(prefix));
  const nextNumber = sameDepartmentPatients.length + 1;

  return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
}

// POST /api/patients
// Register a patient, set status to Waiting, and save in JSON file.
app.post('/api/patients', (req, res) => {
  const { name, age, gender, department, symptoms } = req.body;

  // Basic validation to keep input clean for beginners.
  if (!name || !age || !gender || !department || !symptoms) {
    return res.status(400).json({ message: 'Please provide all patient fields.' });
  }

  const patients = readPatients();
  const token = generateToken(department, patients);

  const newPatient = {
    token,
    name,
    age,
    gender,
    department,
    symptoms,
    status: 'Waiting',
    prescription: '',
    doctorNotes: '',
    createdAt: new Date().toISOString()
  };

  patients.push(newPatient);
  writePatients(patients);

  return res.status(201).json({ message: 'Patient registered successfully.', patient: newPatient });
});

// GET /api/patients
// Return all patients sorted by registration time (oldest first).
app.get('/api/patients', (req, res) => {
  const patients = readPatients().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  return res.json(patients);
});

// GET /api/patients/:token
// Return a single patient with queue details.
app.get('/api/patients/:token', (req, res) => {
  const token = req.params.token.toUpperCase();
  const patients = readPatients().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const patient = patients.find((item) => item.token.toUpperCase() === token);

  if (!patient) {
    return res.status(404).json({ message: 'Patient not found.' });
  }

  // Queue logic: check waiting patients in same department before this patient.
  const waitingInDepartment = patients.filter(
    (item) => item.department === patient.department && item.status === 'Waiting'
  );

  const position = waitingInDepartment.findIndex((item) => item.token === patient.token);
  const patientsBefore = position > -1 ? position : 0;

  // Very simple estimate: 10 minutes per waiting patient before this token.
  const estimatedWaitingTimeMinutes = patientsBefore * 10;

  return res.json({
    ...patient,
    patientsBefore,
    estimatedWaitingTimeMinutes
  });
});

// PATCH /api/patients/:token/status
// Update status, for example Waiting -> Done.
app.patch('/api/patients/:token/status', (req, res) => {
  const token = req.params.token.toUpperCase();
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  const patients = readPatients();
  const index = patients.findIndex((item) => item.token.toUpperCase() === token);

  if (index === -1) {
    return res.status(404).json({ message: 'Patient not found.' });
  }

  patients[index].status = status;
  writePatients(patients);

  return res.json({ message: 'Patient status updated.', patient: patients[index] });
});

// PATCH /api/patients/:token/prescription
// Doctor adds prescription and optional notes.
app.patch('/api/patients/:token/prescription', (req, res) => {
  const token = req.params.token.toUpperCase();
  const { prescription, doctorNotes } = req.body;

  if (!prescription && !doctorNotes) {
    return res.status(400).json({ message: 'Please provide prescription or doctorNotes.' });
  }

  const patients = readPatients();
  const index = patients.findIndex((item) => item.token.toUpperCase() === token);

  if (index === -1) {
    return res.status(404).json({ message: 'Patient not found.' });
  }

  if (typeof prescription === 'string') {
    patients[index].prescription = prescription;
  }

  if (typeof doctorNotes === 'string') {
    patients[index].doctorNotes = doctorNotes;
  }

  writePatients(patients);

  return res.json({ message: 'Prescription updated.', patient: patients[index] });
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Mini Hospital Workflow System is running on http://localhost:${PORT}`);
});
