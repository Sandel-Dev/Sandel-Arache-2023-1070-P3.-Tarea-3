const STORAGE_KEY = "crud_tareas";

const taskForm = document.getElementById("task-form");
const taskIdInput = document.getElementById("task-id");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const statusSelect = document.getElementById("status");
const taskTableBody = document.getElementById("task-table-body");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const statusFilterSelect = document.getElementById("status-filter");
const filterInfo = document.getElementById("filter-info");

let tasks = [];

function loadTasksFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    tasks = JSON.parse(data);
  } else {
    tasks = [];
  }
}

function saveTasksToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function handleFormSubmit(event) {
  event.preventDefault();

  const id = taskIdInput.value;
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const status = statusSelect.value;

  // Validación del título
  if (!title) {
    alert("El título es obligatorio.");
    return;
  }

  if (title.length < 3) {
    alert("El título debe tener al menos 3 caracteres.");
    return;
  }

  if (title.length > 40) {
    alert("El título no puede tener más de 40 caracteres.");
    return;
  }

  if (id) {
    const index = tasks.findIndex((task) => task.id === id);
    if (index !== -1) {
      tasks[index].title = title;
      tasks[index].description = description;
      tasks[index].status = status;
    }
  } else {
    const newTask = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      title,
      description,
      status,
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
  }

  saveTasksToStorage();
  renderTasks();
  resetForm();
}

function renderTasks() {
  taskTableBody.innerHTML = "";

  const filter = statusFilterSelect ? statusFilterSelect.value : "todas";
  let filteredTasks = tasks;

  if (filter === "pendiente" || filter === "completada") {
    filteredTasks = tasks.filter((task) => task.status === filter);
  }

  if (filteredTasks.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;

    if (tasks.length === 0) {
      // 🔹 Hotfix: mensaje mejorado cuando no hay tareas
      cell.textContent =
        "No hay tareas registradas. Usa el formulario de arriba para agregar una nueva tarea.";
    } else {
      if (filter === "pendiente") {
        cell.textContent = "No hay tareas con estado pendiente.";
      } else if (filter === "completada") {
        cell.textContent = "No hay tareas con estado completada.";
      } else {
        cell.textContent = "No hay tareas para mostrar.";
      }
    }

    row.appendChild(cell);
    taskTableBody.appendChild(row);
  } else {
    filteredTasks.forEach((task) => {
      const row = document.createElement("tr");

      const titleCell = document.createElement("td");
      titleCell.textContent = task.title;

      const descriptionCell = document.createElement("td");
      descriptionCell.textContent = task.description;

      const statusCell = document.createElement("td");
      const statusBadge = document.createElement("span");
      statusBadge.classList.add("status-badge");

      if (task.status === "completada") {
        statusBadge.classList.add("status-completada");
        statusBadge.textContent = "Completada";
      } else {
        statusBadge.classList.add("status-pendiente");
        statusBadge.textContent = "Pendiente";
      }

      statusCell.appendChild(statusBadge);

      const actionsCell = document.createElement("td");

      const editButton = document.createElement("button");
      editButton.textContent = "Editar";
      editButton.classList.add("action-btn", "edit-btn");
      editButton.addEventListener("click", () => loadTaskIntoForm(task.id));

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Eliminar";
      deleteButton.classList.add("action-btn", "delete-btn");
      deleteButton.addEventListener("click", () => deleteTask(task.id));

      actionsCell.appendChild(editButton);
      actionsCell.appendChild(deleteButton);

      row.appendChild(titleCell);
      row.appendChild(descriptionCell);
      row.appendChild(statusCell);
      row.appendChild(actionsCell);

      taskTableBody.appendChild(row);
    });
  }

  if (filterInfo) {
    let etiquetaFiltro = "todas las tareas";
    if (filter === "pendiente") etiquetaFiltro = "tareas pendientes";
    if (filter === "completada") etiquetaFiltro = "tareas completadas";

    filterInfo.textContent = `Mostrando ${filteredTasks.length} ${etiquetaFiltro}.`;
  }
}

function loadTaskIntoForm(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  taskIdInput.value = task.id;
  titleInput.value = task.title;
  descriptionInput.value = task.description;
  statusSelect.value = task.status;

  cancelEditBtn.style.display = "inline-block";
}

function resetForm() {
  taskIdInput.value = "";
  titleInput.value = "";
  descriptionInput.value = "";
  statusSelect.value = "pendiente";
  cancelEditBtn.style.display = "none";
}

function deleteTask(id) {
  const confirmDelete = confirm("¿Seguro que deseas eliminar esta tarea?");
  if (!confirmDelete) return;

  tasks = tasks.filter((task) => task.id !== id);
  saveTasksToStorage();
  renderTasks();
}

function exportTasksAsJSON() {
  const dataStr = JSON.stringify(tasks, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "tareas.json";
  a.click();

  URL.revokeObjectURL(url);
}

cancelEditBtn.addEventListener("click", () => {
  resetForm();
});

function init() {
  loadTasksFromStorage();
  renderTasks();
  taskForm.addEventListener("submit", handleFormSubmit);

  const exportBtn = document.getElementById("export-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportTasksAsJSON);
  }

  if (statusFilterSelect) {
    statusFilterSelect.addEventListener("change", renderTasks);
  }
}

init();
