const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const message = document.querySelector("#message");

const STORAGE_KEY = "daily-note";
let todos = [];

function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    todos = saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("데이터 로드 실패:", error);
    todos = [];
  }
}

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    if (message) message.textContent = "";
  } catch (error) {
    if (message) {
      message.textContent =
        "저장되지 않았습니다. 새로고침하여 다시 시도해 주세요.";
    }
  }
}

function renderTodos() {
  todoList.replaceChildren();

  // DocumentFragment로 DOM 조작 횟수를 1회로 단축
  const fragment = document.createDocumentFragment();

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = "todo-item";
    item.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = todo.completed;

    const text = document.createElement("span");
    text.className = `todo-text ${todo.completed ? "completed" : ""}`;
    text.textContent = todo.text;

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "text-button edit-button";
    editButton.textContent = "수정";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "text-button delete-button";
    deleteButton.textContent = "삭제";

    item.append(checkbox, text, editButton, deleteButton);
    fragment.append(item);
  });

  todoList.append(fragment);
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

function toggleTodo(id, completed) {
  const target = todos.find((todo) => todo.id === id);
  if (target) {
    target.completed = completed;
    saveTodos();
    renderTodos();
  }
}

// 1개의 리스너로 모든 체크박스 상태 제어 (이벤트 위임)
todoList.addEventListener("change", (e) => {
  if (e.target.matches(".todo-checkbox")) {
    const item = e.target.closest(".todo-item");
    toggleTodo(item.dataset.id, e.target.checked);
  }
});

// 1개의 리스너로 모든 삭제/수정 버튼 제어 (이벤트 위임)
todoList.addEventListener("click", (e) => {
  const item = e.target.closest(".todo-item");
  if (!item) return;

  const id = item.dataset.id;

  if (e.target.matches(".delete-button")) {
    deleteTodo(id);
  } else if (e.target.matches(".edit-button")) {
    // 필요 시 수정 로직 연동
  }
});

// 할 일 등록
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();

  // 빈 문자열 방지
  if (!text) return;

  const newTodo = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    completed: false,
  };

  todos.push(newTodo);
  todoInput.value = "";

  saveTodos();
  renderTodos();
});

// 초기화
loadTodos();
renderTodos();
