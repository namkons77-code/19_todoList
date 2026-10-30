const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const message = document.querySelector("#message");
const todoCount = document.querySelector("#todo-count");
const emptyState = document.querySelector("#empty-state");

const STORAGE_KEY = "daily-note";
let todos = [];

// 로컬스토리지에서 할 일 불러오기
function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    todos = saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("데이터 로드 실패:", error);
    todos = [];
  }
}

// 로컬스토리지에 할 일 저장
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

// 카운트 및 빈 목록(empty-state) UI 갱신
function updateUIState() {
  const totalCount = todos.length;
  const completedCount = todos.reduce(
    (count, todo) => count + (todo.completed ? 1 : 0),
    0,
  );

  if (todoCount) {
    todoCount.textContent = `${completedCount} / ${totalCount} 개 남음`;
  }
  if (emptyState) {
    emptyState.hidden = totalCount > 0;
  }
}

// 단일 할 일 DOM 요소 생성
function createTodoElement(todo) {
  const item = document.createElement("li");
  item.className = `todo-item ${todo.completed ? "completed" : ""}`;
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
  return item;
}

// 전체 할 일 목록 렌더링
function renderTodos() {
  const fragment = document.createDocumentFragment();

  for (const todo of todos) {
    fragment.append(createTodoElement(todo));
  }

  todoList.replaceChildren(fragment);
  updateUIState();
}

// 할 일 삭제
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

// 체크박스 상태 토글 (DOM 직접 업데이트로 깜빡임 방지 및 렌더링 최적화)
function toggleTodo(id, completed, itemElement) {
  const target = todos.find((todo) => todo.id === id);
  if (!target) return;

  target.completed = completed;
  saveTodos();

  if (itemElement) {
    itemElement.classList.toggle("completed", completed);
    const textSpan = itemElement.querySelector(".todo-text");
    if (textSpan) textSpan.classList.toggle("completed", completed);
    updateUIState();
  } else {
    renderTodos();
  }
}

// 수정 모드로 전환
function startEditing(item) {
  // 이미 다른 항목이 수정 중이라면 원복
  if (todoList.querySelector(".edit-input")) {
    renderTodos();
  }

  const currentItem =
    todoList.querySelector(`[data-id="${item.dataset.id}"]`) || item;
  const textSpan = currentItem.querySelector(".todo-text");
  if (!textSpan) return;

  const editButton = currentItem.querySelector(".edit-button");
  const deleteButton = currentItem.querySelector(".delete-button");
  const currentText = textSpan.textContent;

  // 수정용 입력창 생성
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit-input";
  editInput.value = currentText;
  editInput.required = true;
  editInput.maxLength = 100;

  // 버튼 변경: 수정 -> 저장, 삭제 -> 취소
  if (editButton) {
    editButton.textContent = "저장";
    editButton.classList.replace("edit-button", "save-button");
  }

  if (deleteButton) {
    deleteButton.textContent = "취소";
    deleteButton.classList.replace("delete-button", "cancel-button");
  }

  textSpan.replaceWith(editInput);
  editInput.focus();
  editInput.select();
}

// 수정 사항 저장
function saveEdit(item) {
  const id = item.dataset.id;
  const editInput = item.querySelector(".edit-input");
  if (!editInput) return;

  const newText = editInput.value.trim();
  editInput.value = newText;

  if (!editInput.reportValidity()) {
    return;
  }

  const target = todos.find((todo) => todo.id === id);
  if (target) {
    target.text = newText;
    saveTodos();
    renderTodos();
  }
}

// 이벤트 위임: 체크박스
todoList.addEventListener("change", (e) => {
  if (e.target.matches(".todo-checkbox")) {
    const item = e.target.closest(".todo-item");
    if (item) {
      toggleTodo(item.dataset.id, e.target.checked, item);
    }
  }
});

// 이벤트 위임: 버튼 클릭 (수정 / 저장 / 취소 / 삭제)
todoList.addEventListener("click", (e) => {
  const item = e.target.closest(".todo-item");
  if (!item) return;

  const id = item.dataset.id;

  if (e.target.matches(".edit-button")) {
    startEditing(item);
  } else if (e.target.matches(".save-button")) {
    saveEdit(item);
  } else if (e.target.matches(".cancel-button")) {
    renderTodos();
  } else if (e.target.matches(".delete-button")) {
    deleteTodo(id);
  }
});

// 이벤트 위임: 수정 입력창 단축키 (Enter로 저장, Escape로 취소)
todoList.addEventListener("keydown", (e) => {
  if (!e.target.matches(".edit-input")) return;

  const item = e.target.closest(".todo-item");
  if (!item) return;

  if (e.key === "Enter") {
    e.preventDefault();
    saveEdit(item);
  } else if (e.key === "Escape") {
    renderTodos();
  }
});

// 할 일 추가
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();

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
  todoInput.focus();
});

// 앱 시작 시 초기화
loadTodos();
renderTodos();
