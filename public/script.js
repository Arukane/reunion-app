// ---------- Attendee Side ----------
const attendeeForm = document.getElementById('attendee-form');
const messageEl = document.getElementById('confirmation-message');

if (attendeeForm) {
  attendeeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = document.getElementById('nome').value.trim();
    const lastName = document.getElementById('cognome').value.trim();
    const passcode = document.getElementById('codice').value.trim();

    try {
      const response = await fetch('/api/attend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, passcode })
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(`Thanks, ${firstName}! You've been marked as attending.`, 'success');
        attendeeForm.reset();
      } else {
        showMessage(result.error || 'Failed to confirm attendance.', 'error');
      }
    } catch (err) {
      showMessage('Network error. Try again later.', 'error');
    }
  });

  function showMessage(msg, type) {
    messageEl.textContent = msg;
    messageEl.style.color = type === 'success' ? 'green' : 'red';
  }
}

// ---------- Admin Side ----------
const generateBtn = document.getElementById('generate-passcode');
const currentPasscodeEl = document.getElementById('current-passcode');
const attendeeListEl = document.getElementById('attendees-list');

if (generateBtn && currentPasscodeEl && attendeeListEl) {
  generateBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/passcode', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        displayPasscode(data.passcode);
        loadAttendees();
      } else {
        currentPasscodeEl.textContent = 'Error: ' + (data.error || 'Failed to generate passcode.');
      }
    } catch (err) {
      currentPasscodeEl.textContent = 'Error generating passcode.';
    }
  });

  loadAdminData();
}

async function loadAdminData() {
  try {
    const res = await fetch('/api/passcode');
    const data = await res.json();
    if (res.ok) {
      displayPasscode(data.passcode);
      loadAttendees();
    } else {
      currentPasscodeEl.textContent = 'Error loading passcode.';
    }
  } catch {
    currentPasscodeEl.textContent = 'Failed to load data.';
  }
}

async function loadAttendees() {
  try {
    const res = await fetch('/api/attendees');
    const data = await res.json();
    if (res.ok) {
      displayAttendees(data.attendees);
    } else {
      attendeeListEl.textContent = 'Error loading attendees.';
    }
  } catch {
    attendeeListEl.textContent = 'Error fetching attendees.';
  }
}

function displayPasscode(code) {
  currentPasscodeEl.textContent = `Current Passcode: ${code || 'None'}`;
}

function displayAttendees(attendees) {
  attendeeListEl.innerHTML = '';
  if (!attendees || attendees.length === 0) {
    attendeeListEl.textContent = 'No attendees confirmed yet.';
    return;
  }

  attendees.forEach(att => {
    const el = document.createElement('div');
    el.className = 'attendee-name';
    el.textContent = `${att.first_name} ${att.last_name}`;
    attendeeListEl.appendChild(el);
  });
}
