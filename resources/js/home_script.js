const deleteBtns = document.querySelectorAll(".task-del-btn");
const filterBtns = document.querySelectorAll(".filter-btn");

// Functions
async function sendDeleteReq(todoId) {
  let response = await fetch("http://localhost:4131/delete_todo", {
    method: "DELETE",
    body: JSON.stringify({"todo_id": todoId}),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
}

async function deleteTodo(todoId, todoElem) {
  const response = await sendDeleteReq(todoId);
  if (response.status === 204) {
    todoElem.remove();
    console.log("success removing elem")
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
    window.location.href = `http://localhost:4131/home?option=${btn.id}`;
  });
});