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
        showMessage(`Grazie mille per la partecipazione, ${firstName}!`, 'success');
        attendeeForm.reset();
      } else {
        showMessage(result.error || 'Errore nella convalidazione.', 'error');
      }
    } catch (err) {
      showMessage('Errore di rete, riprova più tardi.', 'error');
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
        currentPasscodeEl.textContent = 'Errore: ' + (data.error || 'Problemi nella generazione del codice.');
      }
    } catch (err) {
      currentPasscodeEl.textContent = 'Errore nella generazione del codice.';
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
      currentPasscodeEl.textContent = 'Errore nel caricamento del codice.';
    }
  } catch {
    currentPasscodeEl.textContent = 'Errore nel caricamento dei dati.';
  }
}

async function loadAttendees() {
  try {
    const res = await fetch('/api/attendees');
    const data = await res.json();
    if (res.ok) {
      displayAttendees(data.attendees);
    } else {
      attendeeListEl.textContent = 'Errore nel caricamento dei partecipanti.';
    }
  } catch {
    attendeeListEl.textContent = 'Errore nel ritrovamento dei partecipanti.';
  }
}

function displayPasscode(code) {
  currentPasscodeEl.textContent = `Codice corrente: ${code || 'None'}`;
}

function displayAttendees(attendees) {
  attendeeListEl.innerHTML = '';
  if (!attendees || attendees.length === 0) {
    attendeeListEl.textContent = 'Non ci sono dei partecipanti al momento.';
    return;
  }

  attendees.forEach(att => {
    const el = document.createElement('div');
    el.className = 'attendee-name';
    el.textContent = `${att.first_name} ${att.last_name}`;
    attendeeListEl.appendChild(el);
  });
}
