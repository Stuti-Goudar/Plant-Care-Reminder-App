if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  if (screenId === 'screen-list') renderPlants();
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

function getCalendarLink(plant) {
  const start = plant.date.replace(/-/g, '') + 'T' + plant.time.replace(':', '') + '00';
  const title = encodeURIComponent(`🌱 Care for ${plant.name}`);
  const details = encodeURIComponent(`Water every ${plant.waterInterval} days. Fertilize every ${plant.fertilizerInterval} days.`);
  return `https://google.com{title}&dates=${start}/${start}&details=${details}`;
}

function savePlant() {
  const name = document.getElementById('plantName').value.trim();
  const waterInterval = document.getElementById('waterInterval').value;
  const fertilizerInterval = document.getElementById('fertilizerInterval').value;
  const date = document.getElementById('reminderDate').value;
  const time = document.getElementById('reminderTime').value;

  if (!name || !waterInterval || !fertilizerInterval || !date || !time) {
    alert("Please fill out all plant and reminder fields.");
    return;
  }

  const plants = JSON.parse(localStorage.getItem('plants') || '[]');
  plants.push({ name, waterInterval, fertilizerInterval, date, time, notified: false });
  localStorage.setItem('plants', JSON.stringify(plants));

  alert(`Saved ${name}! Reminder set for ${date} at ${time}.`);
  document.getElementById('plantName').value = '';
  document.getElementById('waterInterval').value = '';
  document.getElementById('fertilizerInterval').value = '';
  showScreen('screen-list');
}

function renderPlants() {
  const list = document.getElementById('plantList');
  const plants = JSON.parse(localStorage.getItem('plants') || '[]');
  list.innerHTML = plants.length ? '' : '<li>No plants added yet.</li>';

  plants.forEach((p, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>🌱 ${p.name}</strong><br>
      💧 Water: Every ${p.waterInterval} days<br>
      🧪 Fertilizer: Every ${p.fertilizerInterval} days<br>
      ⏰ Next Reminder: ${p.date} at ${p.time}<br>
      <a href="${getCalendarLink(p)}" target="_blank" style="display:inline-block;margin-top:8px;padding:6px 10px;background:#1976d2;color:#fff;border-radius:6px;text-decoration:none;font-size:12px;">🔔 Set Phone Alarm</a>
      <button class="delete-btn" onclick="deletePlant(${index})">Delete</button>
    `;
    list.appendChild(li);
  });
}

function deletePlant(index) {
  const plants = JSON.parse(localStorage.getItem('plants') || '[]');
  plants.splice(index, 1);
  localStorage.setItem('plants', JSON.stringify(plants));
  renderPlants();
}

// Check every 5 seconds using exact local phone date & time
setInterval(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const currentDate = `${year}-${month}-${day}`;
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const plants = JSON.parse(localStorage.getItem('plants') || '[]');
  let updated = false;

  plants.forEach(plant => {
    if (plant.date === currentDate && plant.time === currentTime && !plant.notified) {
      playBeep();
      alert(`🌱 Plant Care Alert: Time to care for ${plant.name}!`);
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Plant Care Reminder 🌱", {
          body: `Time to water/fertilize ${plant.name}!`
        });
      }
      plant.notified = true;
      updated = true;
    }
  });

  if (updated) localStorage.setItem('plants', JSON.stringify(plants));
}, 5000);
