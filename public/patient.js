// Patient page script: checks patient queue status with token number.
const tokenInput = document.getElementById('tokenInput');
const checkBtn = document.getElementById('checkBtn');
const statusCard = document.getElementById('statusCard');
const statusOutput = document.getElementById('statusOutput');

checkBtn.addEventListener('click', async () => {
  const token = tokenInput.value.trim().toUpperCase();

  if (!token) {
    alert('Please enter a token number.');
    return;
  }

  const response = await fetch(`/api/patients/${token}`);
  const patient = await response.json();

  if (!response.ok) {
    alert(patient.message || 'Patient not found.');
    return;
  }

  statusCard.style.display = 'block';
  statusOutput.innerHTML = `
    <p><strong>Name:</strong> ${patient.name}</p>
    <p><strong>Department:</strong> ${patient.department}</p>
    <p><strong>Token:</strong> ${patient.token}</p>
    <p><strong>Status:</strong> ${patient.status}</p>
    <p><strong>Patients before you:</strong> ${patient.patientsBefore}</p>
    <p><strong>Estimated waiting time:</strong> ${patient.estimatedWaitingTimeMinutes} minutes</p>
    <p><strong>Prescription:</strong> ${patient.prescription || 'Not updated yet.'}</p>
    <p><strong>Doctor Notes:</strong> ${patient.doctorNotes || 'Not updated yet.'}</p>
  `;
});
