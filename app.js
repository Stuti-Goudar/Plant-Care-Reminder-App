const reminders = {
  water: { time: "", done: false, label: "💧 Time to water your plants!" },
  fertilizer: { time: "", done: false, label: "🧪 Time to add fertilizer!" },
  flowers: { time: "", done: false, label: "🌸 Time to care for your flowers!" }
};

const permStatus = document.getElementById("permStatus");
const enableBtn = document.getElementById("enableBtn");

function updatePermissionText() {
  if (!("Notification" in window)) {
    permStatus.textContent = "This browser does not support notifications.";
    return;
  }
  permStatus.textContent = `Notification permission: ${Notification.permission}`;
}

enableBtn.addEventListener("click", async () => {
  if (!("Notification" in window)) return;
  const permission = await Notification.requestPermission();
  updatePermissionText();
  if (permission === "granted") {
    new Notification("Notifications Enabled! 🌱", {
      body: "You will get alerts when your plant timers go off."
    });
  }
});

function setReminder(type) {
  const input = document.getElementById(`${type}Time`).value;
  const status = document.getElementById(`${type}Status`);

  if (!input) {
    alert("Please pick a time first!");
    return;
  }

  reminders[type].time = input;
  reminders[type].done = false;
  status.textContent = `Set: ${input}`;
}

setInterval(() => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const currentTime = `${hours}:${minutes}`;

  for (const key in reminders) {
    const item = reminders[key];
    if (item.time === currentTime && !item.done) {
      item.done = true;
      document.getElementById(`${key}Status`).textContent = "Done ✅";

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Plant Care Reminder", { body: item.label });
      } else {
        alert(item.label);
      }
    }
  }
}, 1000);

updatePermissionText();
