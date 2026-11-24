if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  if (screenId === 'screen-list') renderPlants();
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

setInterval(() => {
  const now = new Date();
  const currentDate = now.toISOString().split('T');
  const currentTime = now.toTimeString().slice(0, 5);
  const plants = JSON.parse(localStorage.getItem('plants') || '[]');
  let updated = false;

  plants.forEach(plant => {
    if (plant.date === currentDate && plant.time === currentTime && !plant.notified) {
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
}, 30000);
