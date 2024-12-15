const deleteBtns = document.querySelectorAll(".task-del-btn");
const filterBtns = document.querySelectorAll(".filter-btn");
const tasksCheckboxes = document.querySelectorAll(".task-checkbox");

// Functions 
async function sendReq(route, reqMethod, todoId) {
  let response = await fetch(`http://localhost:4131/${route}`, {
    method: reqMethod,
    body: JSON.stringify({"todo_id": todoId}),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
}

async function deleteTodo(todoId, todoElem) {
  const response = await sendReq("delete_todo", "DELETE", todoId);
  if (response.status === 204) {
    todoElem.remove();
  }
}

// Event Listeners
deleteBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // get todo id from data-todo-id attribute in the button
    const todoId = parseInt(btn.getAttribute("data-todo-id"));
    // delete the todo element from DOM
    deleteTodo(todoId, btn.parentNode.parentNode.parentNode);
  });
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // filter todos based on the button
    window.location.href = `http://localhost:4131/home?option=${btn.id}`;
  });
});

tasksCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", async () => {
    const todoId = parseInt(checkbox.getAttribute("data-todo-id"));
    await sendReq("change_done", "PUT", todoId);
  });
});