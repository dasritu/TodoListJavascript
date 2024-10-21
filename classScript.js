class Todo {
  constructor(title, description, date, time, visibility = "Y") {
    this.id = Todo.generateId();
    this.title = title;
    this.description = description;
    this.date = date;
    this.time = time;
    this.visibility = visibility;
  }

  static generateId() {
    const todos = TodoStorage.getTodos();
    return todos.length > 0 ? todos[todos.length - 1].id + 1 : 0;
  }
}

class TodoStorage {
  static getTodos() {
    return JSON.parse(localStorage.getItem("todos")) || [];
  }

  static saveTodos(todos) {
    localStorage.setItem("todos", JSON.stringify(todos));
  }
}

class TodoManager {
  constructor() {
    this.todos = TodoStorage.getTodos();
    this.editId = null;
    this.DisplayTodos();
    this.displayDeleteTodo();
  }

  addOrUpdate() {
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (this.isTitleDuplicate(title)) {
      alert("Title should not be the same.");
      return;
    }
    if (title.length > 20) {
      alert("Title must be less than or equal to 20 characters.");
      return;
    }
    if (!this.validateInput(title, description, date, time)) {
      return;
    }

    if (this.editId !== null) {
      this.UpdateTodo(title, description, date, time);
      alert("Todo Updated");
    } else {
      const newTodo = new Todo(title, description, date, time);
      this.todos.push(newTodo);
      alert("Todo Added");
    }

    this.resetForm();
    TodoStorage.saveTodos(this.todos);
    this.DisplayTodos();
  }

  isTitleDuplicate(title) {
    return this.todos.some(
      (todo) =>
        todo.title.replace(/\s/g, "").toLowerCase() ===
          title.replace(/\s/g, "").toLowerCase() && todo.id !== this.editId
    );
  }

  validateInput(title, description, date, time) {
    if (title === "" || description === "" || date === "" || time === "") {
      alert("Title, description, date, and time should not be empty.");
      return false;
    }
    return true;
  }

  UpdateTodo(title, description, date, time) {
    const todo = this.todos.find((item) => item.id === this.editId);
    todo.title = title;
    todo.description = description;
    todo.date = date;
    todo.time = time;
    this.editId = null;
    document.getElementById("button").textContent = "Add Todo";
  }

  resetForm() {
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("date").value = "";
    document.getElementById("time").value = "";
  }

  DisplayTodos() {
    const todoDisplay = document.getElementById("display");
    todoDisplay.innerHTML = "";

    const hasTodo = this.todos.some((todo) => todo.visibility === "Y");
    const todoHead = document.createElement("h2");
    todoHead.innerHTML = hasTodo
      ? `<h2>Todo List</h2>`
      : `<h2>No todos to show</h2>`;
    todoDisplay.appendChild(todoHead);

    const todoDiv = document.createElement("div");
    todoDiv.classList.add("card-div");
    todoDisplay.appendChild(todoDiv);

    this.todos.forEach((element) => {
      if (element.visibility === "Y") {
        const todoCard = this.createTodo(element);
        todoCard.classList.add("todocard");
        todoDiv.appendChild(todoCard);
      }
    });
  }

  createTodo(todo) {
    const todoItem = document.createElement("div");
  
    todoItem.innerHTML = `
            <h4>Title: ${todo.title}</h4>
            <p>Description: ${todo.description}</p>
            <p>Date: ${todo.date}</p>
            <p>Time: ${todo.time}</p>
            <div class= "buttondiv">
            <button class="editbutton" onclick="todoManager.editTodo(${todo.id})">
            <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
            </button>
            <button class="deletebutton" onclick="todoManager.deleteTodo(${todo.id})">
            <i class="fa fa-trash" aria-hidden="true"></i></button>
            <div>
            <hr />
            
        `;
    return todoItem;
  }
  editTodo(id) {
    const todo = this.todos.find((item) => item.id === id);
    document.getElementById("title").value = todo.title;
    document.getElementById("description").value = todo.description;
    document.getElementById("date").value = todo.date;
    document.getElementById("time").value = todo.time;
    this.editId = id;
    document.getElementById("button").textContent = "Update Todo";
  }
  deleteTodo(id) {
    const confirm = window.confirm("Are you sure to delete?");
    if(confirm){
        const todo = this.todos.find((item) => item.id === id);
        todo.visibility = "N";
        TodoStorage.saveTodos(this.todos);
        this.DisplayTodos();
        this.displayDeleteTodo();
    }
  }

  displayDeleteTodo() {
    const todoDisplay = document.getElementById("history");
    todoDisplay.innerHTML = "";

    const hasDeletedTodos = this.todos.some((item) => item.visibility === "N");
    const head = document.createElement("div");
    head.innerHTML = hasDeletedTodos
      ? `<h3>Deleted Todos</h3>
         <p>Select items to delete permanently:
         <button class="history-button" id="delete-permanently" disabled onclick="todoManager.clearTrash()">
           Delete Permanently
         </button></p>`
      : `<h3>Deleted Todos</h3><p>No Deleted todos to show</p>`;
    todoDisplay.appendChild(head);



    this.todos.forEach((item) => {
      if (item.visibility === "N") {
        const todoItem = document.createElement("div");
        todoItem.classList.add("deleted-todo");
        todoItem.innerHTML = `
            <input type="checkbox" class="delete-check" data-id="${item.id}">
            <h4>Title: ${item.title}</h4>
            <p>Description: ${item.description}</p>
            <p>Date: ${item.date}</p>
            <p>Time: ${item.time}</p>
            <button class="restoreButton" onclick="todoManager.restoreTodo(${item.id})">Restore</button>
            <hr />
          `;
        todoDisplay.appendChild(todoItem);
      }
    });

    document.querySelectorAll(".delete-check").forEach((checkbox) => {
      checkbox.addEventListener("change", this.toggleDeleteButton);
    });
  }

  toggleDeleteButton() {
    const deleteButton = document.getElementById("delete-permanently");
    const checkedBoxes = document.querySelectorAll(".delete-check:checked");
    deleteButton.disabled = checkedBoxes.length === 0;
  }

  restoreTodo(id) {
    const todoIndex = this.todos.findIndex((item) => item.id === id);
    this.todos[todoIndex].visibility = "Y";
    TodoStorage.saveTodos(this.todos);
    alert("Todo Restored");
    this.DisplayTodos();
    this.displayDeleteTodo();
  }


  clearTrash() {
    const checkedBoxes = document.querySelectorAll(".delete-check:checked");
    if (checkedBoxes.length === 0) {
      alert("No todos selected");
      return;
    }
    if (window.confirm("Are you sure to permanently delete?")) {
      const deleteIds = Array.from(checkedBoxes).map((box) =>
        parseInt(box.getAttribute("data-id"))
      );

      this.todos = this.todos.filter((item) => !deleteIds.includes(item.id));
      TodoStorage.saveTodos(this.todos);
      this.displayDeleteTodo();
      this.DisplayTodos();
      alert("Selected todos deleted permanently!");
    }
  }
}

const todoManager = new TodoManager();
