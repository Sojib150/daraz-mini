// Worker list (example)
const workers = [
  { id: 1, name: "Ali", task: "No work" },
  { id: 2, name: "Rahman", task: "No work" },
  { id: 3, name: "Kumar", task: "No work" }
];

// Task list
const tasks = [
  "Unloading goods from container",
  "Arranging goods by barcode",
  "Receiving goods",
  "Picking goods",
  "QC checking",
  "Driving forklift",
  "MC (Medical leave / sick)",
  "Store cleaning",
  "No work"
];

// HTML elements
const tableBody = document.querySelector("#workerTable tbody");
const popup = document.getElementById("popup");
const taskSelect = document.getElementById("taskSelect");
const saveBtn = document.getElementById("saveBtn");
const closeBtn = document.getElementById("closeBtn");

let currentWorker = null;

// Load worker table
function loadWorkers() {
  tableBody.innerHTML = "";
  workers.forEach(w => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${w.id}</td>
      <td>${w.name}</td>
      <td>${w.task}</td>
      <td><button onclick="openPopup(${w.id})">Update</button></td>
    `;
    tableBody.appendChild(tr);
  });
}

// Load tasks in select menu
function loadTasks() {
  taskSelect.innerHTML = "";
  tasks.forEach(t => {
    const option = document.createElement("option");
    option.value = t;
    option.textContent = t;
    taskSelect.appendChild(option);
  });
}

function openPopup(id) {
  currentWorker = workers.find(w => w.id === id);
  loadTasks();
  popup.style.display = "flex";
}

saveBtn.onclick = () => {
  const newTask = taskSelect.value;
  currentWorker.task = newTask;
  popup.style.display = "none";
  loadWorkers();
};

closeBtn.onclick = () => popup.style.display = "none";

window.onload = loadWorkers;
