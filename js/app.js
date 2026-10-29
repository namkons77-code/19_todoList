const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const message = document.querySelector("#message");

let todos = [];

function loadTodos() {
  try {
    const savedTodos = localStorage.getItem("daily-note");
    if (savedTodos !== null) {
      todos = JSON.parse(savedTodos);
    }
  } catch (error) {
    console.log("error");
  }
}

function saveTodos() {
  try {
    localStorage.setItem("daily-note", JSON.stringify(todos));
  } catch (error) {
    message.textContent =
      "저장되지 않았습니다. 새로고침하여 다지 시도해 주세요";
  }
}

function renderTodos() {
  todoList.replaceChildren();

  todos.forEach(function (todo) {
    const item = document.createElement("li");
    item.className = "todo-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", function () {
      todo.completed = checkbox.checked;
      saveTodos();
      renderTodos();
    });

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "text-button";
    editButton.textContent = "수정";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "text-button delete-button";
    deleteButton.textContent = "삭제";
    deleteButton.addEventListener("click", function () {
      deleteTodo(todo.id);
    });

    item.append(checkbox, text, editButton, deleteButton);
    todoList.append(item);
    // <li class="todo-item"></li>
    // <input type="checkbox" class="todo-checkbox" />
  });
}

function deleteTodo(id) {
  todos = todos.filter(function (todo) {
    return todo.id !== id;
  });
  saveTodos();
  renderTodos();
}

todoForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const text = todoInput.value;

  const newTodo = {
    id: Date.now().toString() + "-" + Math.random().toString(36).slice(2, 8),
    text: text,
    completed: false,
  };

  todos.push(newTodo);
  todoInput.value = "";
  console.log(todos);

  saveTodos();
  renderTodos();
});

loadTodos();
renderTodos();
