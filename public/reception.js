// Reception page script: handles patient registration and slip creation.
const patientForm = document.getElementById('patientForm');
const slipCard = document.getElementById('slipCard');
const slipText = document.getElementById('slipText');

patientForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Collect data from form fields.
  const formData = new FormData(patientForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    // Send new patient data to backend.
    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || 'Could not register patient.');
      return;
    }

    // Show a simple printable slip.
    const patient = result.patient;
    slipText.textContent =
`Mini Hospital Workflow System
------------------------------
Token: ${patient.token}
Name: ${patient.name}
Age: ${patient.age}
Gender: ${patient.gender}
Department: ${patient.department}
Symptoms: ${patient.symptoms}
Status: ${patient.status}`;

    slipCard.style.display = 'block';
    patientForm.reset();
  } catch (error) {
    alert('Server error. Please try again.');
  }
});
