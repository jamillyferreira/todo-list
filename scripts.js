const dataDay = document.querySelector("#data-day");
const dataMonth = document.querySelector("#data-month");

const darkLightToggle = document.querySelector("#darklight-toggle");

const buttonSubmit = document.querySelector("#button");
const inputTask = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCountElement = document.querySelector(".count-task");

const tasksContainerCompleted = document.querySelector(".tasks-completed");
const tasksListCompleted = document.querySelector(".tasks-list-completed");

const filterAll = document.querySelector(".filter-all");
const filterPending = document.querySelector(".filter-pending");
const filterCompleted = document.querySelector(".filter-completed");

const data = () => {
  const data = new Date();
  const daysWeeks = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const monthOfTheYear = months[data.getMonth()];
  const dayOfTheMonth = String(data.getDate()).padStart(2, "0");
  const dayOfTheWeek = daysWeeks[data.getDay()];

  dataDay.innerHTML = `${dayOfTheMonth}, ${dayOfTheWeek}`;
  dataMonth.innerHTML = `${monthOfTheYear}`;
};

data();

const toggleDarkLightMode = () => {
  const body = document.body;
  const icon = darkLightToggle.querySelector("i");
  body.classList.toggle("dark-mode");

  const isDarkMode = body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

  if (isDarkMode) {
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
  } else {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  }
};
darkLightToggle.addEventListener("click", toggleDarkLightMode);

const loadTheme = () => {
  const saveTheme = localStorage.getItem("theme");
  const body = document.body;
  const icon = darkLightToggle.querySelector("i");
  if (saveTheme === "dark") {
    body.classList.add("dark-mode");
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
  } else {
    body.classList.remove("dark-mode");
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  }
};

const detectSystemTheme = () => {
  const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const body = document.body;
  const icon = darkLightToggle.querySelector("i");
  if(prefersDarkMode) {
    body.classList.add('dark-mode');
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon')
  } else {
    body.classList.remove('dark-mode');
    icon.classList.remove('fa-moon')
    icon.classList.add('fa-sun')
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const saveTheme = localStorage.getItem("theme");
  if (saveTheme) loadTheme();
  else detectSystemTheme()
  loadTasksFromLocalStorage();
});

 const showMessage = (msg) => {
  const modal = document.querySelector('.modal')
  const message = modal.querySelector('.modal-message');
  message.innerHTML = msg

  modal.classList.add('show');
  modal.classList.remove('hide');

  setTimeout(() => {
    modal.classList.remove('show');
    modal.classList.add('hide')

    setTimeout(() => {
      modal.classList.remove('hide')
    }, 300)
  }, 3000)

};


let tasks = [];
let filterCurrent = "tudo";

const addTask = () => {
  const taskText = inputTask.value.trim();
  if (taskText == "") {
    showMessage('Nenhuma tarefa adicionada!')
    return;
  }
  const taskExists = tasks.some(
    (task) => task.text.toLowerCase() === taskText.toLowerCase()
  );
  if (taskExists) {
    showMessage("Já existe uma tarefa com esse nome")
    return;
  }
  tasks.push({ text: taskText, completed: false });
  updateTask();
  saveTasksToLocalStorage();
};

const updateTask = () => {
  let newTask = ""; // Começa vazio
  let newCompletedTask = "";

  tasks.forEach((task, index) => {
    const taskElement = `
  <li class="task">
  <div class="content-task">
    <input type="checkbox" class="task-checkbox" ${
      task.completed ? "checked" : ""
    } data-index="${index}">
    <p class="task-text ${task.completed ? "completed" : ""}">${task.text}</p>
  </div>
  <button class="delete-btn">
    <i class="fa-solid fa-trash"></i>
  </button>
  </li>
  `;

    if (filterCurrent === "tudo") {
      if (task.completed) {
        newCompletedTask += taskElement;
      } else {
        newTask += taskElement;
      }
    } else if (filterCurrent === "pendentes" && !task.completed) {
      newTask += taskElement;
    } else if (filterCurrent === "concluidas" && task.completed) {
      newTask += taskElement;
    }
  });

  taskList.innerHTML = newTask;

  if (filterCurrent === "tudo") {
    tasksListCompleted.innerHTML = newCompletedTask;
    tasksContainerCompleted.classList.remove("hidden");
  } else if (filterCurrent === "concluidas") {
    tasksContainerCompleted.classList.add("hidden");
  } else {
    tasksContainerCompleted.classList.add("hidden");
  }

  inputTask.value = "";

  countTask();

  const checkbox = document.querySelectorAll(".task-checkbox");
  checkbox.forEach((check) => check.addEventListener("click", toggleComplete));

  const deleteBtn = document.querySelectorAll(".delete-btn");
  deleteBtn.forEach((button) => button.addEventListener("click", deleteTask));
};

const toggleComplete = (e) => {
  if (e.target.classList.contains("task-checkbox")) {
    const taskIndex = parseInt(e.target.dataset.index);
    if (!isNaN(taskIndex)) {
      tasks[taskIndex].completed = e.target.checked;
      const taskElement = e.target.closest(".task");
      taskElement.classList.add("fade-out");
      setTimeout(() => {
        updateTask();
        saveTasksToLocalStorage();
      }, 500);
    }
  }
};

const deleteTask = (e) => {
  const taskText = e.target
    .closest(".task")
    .querySelector(".task-text").textContent;
  const taskIndex = tasks.findIndex((task) => task.text === taskText);
  console.log("Índice da tarefa encontrado:", taskIndex);
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    updateTask();
    saveTasksToLocalStorage();
  }
};

const countTask = () => {
  if (tasks.length === 0) {
    taskCountElement.textContent =
      "Nada por aqui ainda. Que tal adicionar uma nova tarefa?";
  } else if (filterCurrent === "tudo" || filterCurrent === "pendentes") {
    const incompletTask = tasks.filter((task) => !task.completed);
    taskCountElement.textContent = `${incompletTask.length} tarefas pendentes`;
  } else if (filterCurrent === "concluidas") {
    const completedTask = tasks.filter((task) => task.completed);
    taskCountElement.textContent = `${completedTask.length} tarefas concluidas`;
  }
};

const saveTasksToLocalStorage = () => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

const loadTasksFromLocalStorage = () => {
  const savedTasks = localStorage.getItem('tasks');
  if(savedTasks) {
    tasks = JSON.parse(savedTasks) // Converte de volta para array
    updateTask();
  }
};

const setActiveFilter = (filterButton) => {
  filterAll.classList.remove("active");
  filterPending.classList.remove("active");
  filterCompleted.classList.remove("active");

  filterButton.classList.add("active");
};

filterAll.addEventListener("click", () => {
  filterCurrent = "tudo";
  setActiveFilter(filterAll);
  updateTask();
});

filterPending.addEventListener("click", () => {
  filterCurrent = "pendentes";
  setActiveFilter(filterPending);
  tasksContainerCompleted.classList.add("hidden");
  updateTask();
});

filterCompleted.addEventListener("click", () => {
  filterCurrent = "concluidas";
  setActiveFilter(filterCompleted);
  tasksContainerCompleted.classList.add("hidden");
  updateTask();
});

const form = document.querySelector(".todo__input");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  countTask();
  addTask();
});
setActiveFilter(filterAll);