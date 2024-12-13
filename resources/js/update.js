const formUpdateBtn = document.querySelector(".form-update-btn");

// Functions
async function sendUpdateReq(id, title, done, deadline) {
  let response = await fetch("http://localhost:4131/update_todo", {
    method: "PUT",
    body: JSON.stringify({
      id, title, done, deadline
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
}

// Event Listeners
formUpdateBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  const todoId = parseInt(formUpdateBtn.getAttribute("data-todo-id"));
  const title = document.getElementById("title").value;
  const done = document.getElementById("done").checked;
  const deadline = document.getElementById("deadline").value;

  const response = await sendUpdateReq(todoId, title, done, deadline);
  if (response.status === 204) {
    window.location.href = "http://localhost:4131/home";
  }
});