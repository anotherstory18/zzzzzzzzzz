// Doctor page script: queue display, record opening, prescription update, and status update.
const queueBody = document.getElementById('queueBody');
const queueCount = document.getElementById('queueCount');
const refreshBtn = document.getElementById('refreshBtn');
const recordCard = document.getElementById('recordCard');
const patientDetails = document.getElementById('patientDetails');
const prescriptionInput = document.getElementById('prescription');
const doctorNotesInput = document.getElementById('doctorNotes');
const savePrescriptionBtn = document.getElementById('savePrescriptionBtn');
const markDoneBtn = document.getElementById('markDoneBtn');

let selectedToken = null;

// Fetch and show all patients in queue.
async function loadQueue() {
  const response = await fetch('/api/patients');
  const patients = await response.json();

  // We only count waiting patients as "left in queue".
  const waitingCount = patients.filter((patient) => patient.status === 'Waiting').length;
  queueCount.textContent = `Patients left: ${waitingCount}`;

  queueBody.innerHTML = '';

  patients.forEach((patient) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${patient.token}</td>
      <td>${patient.name}</td>
      <td>${patient.department}</td>
      <td><span class="badge ${patient.status === 'Done' ? 'done' : 'waiting'}">${patient.status}</span></td>
      <td><button class="btn secondary" data-token="${patient.token}">Open</button></td>
    `;

    queueBody.appendChild(row);
  });
}

// Show selected patient's details in the form.
async function openPatient(token) {
  const response = await fetch(`/api/patients/${token}`);
  const patient = await response.json();

  if (!response.ok) {
    alert(patient.message || 'Patient not found.');
    return;
  }

  selectedToken = patient.token;
  patientDetails.innerHTML = `
    <p><strong>Token:</strong> ${patient.token}</p>
    <p><strong>Name:</strong> ${patient.name}</p>
    <p><strong>Age/Gender:</strong> ${patient.age} / ${patient.gender}</p>
    <p><strong>Department:</strong> ${patient.department}</p>
    <p><strong>Symptoms:</strong> ${patient.symptoms}</p>
    <p><strong>Status:</strong> ${patient.status}</p>
  `;
  prescriptionInput.value = patient.prescription || '';
  doctorNotesInput.value = patient.doctorNotes || '';
  recordCard.style.display = 'block';
}

// Save prescription and notes.
savePrescriptionBtn.addEventListener('click', async () => {
  if (!selectedToken) return;

  const response = await fetch(`/api/patients/${selectedToken}/prescription`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prescription: prescriptionInput.value,
      doctorNotes: doctorNotesInput.value
    })
  });

  const result = await response.json();
  if (!response.ok) {
    alert(result.message || 'Could not save prescription.');
    return;
  }

  alert('Prescription updated successfully.');
  await loadQueue();
});

// Mark selected patient as done.
markDoneBtn.addEventListener('click', async () => {
  if (!selectedToken) return;

  const response = await fetch(`/api/patients/${selectedToken}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Done' })
  });

  const result = await response.json();
  if (!response.ok) {
    alert(result.message || 'Could not update status.');
    return;
  }

  alert('Patient marked as Done.');
  await openPatient(selectedToken);
  await loadQueue();
});

// Event delegation for Open buttons in the queue table.
queueBody.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-token]');
  if (!button) return;
  openPatient(button.dataset.token);
});

refreshBtn.addEventListener('click', loadQueue);

// Initial data load when page opens.
loadQueue();
