// this package behaves just like the mysql one, but uses async await instead of callbacks.
const mysql = require(`mysql-await`); 

var connPool = mysql.createPool({
  connectionLimit: 10, // it's a shared resource, let's not go nuts.
  host: "127.0.0.1",
  user: "C4131F24U81",
  database: "C4131F24U81",
  password: "6611", 
});

// Input: data object {title, done, deadline}
// Output: the id of new Todo
async function addTodo(data) {
  const { title, done, deadline } = data;
  if (title === undefined || done === undefined || deadline === undefined) {
    return -1;
  }
  const res = await connPool.awaitQuery("INSERT INTO Todo (title, done, deadline) VALUES (?, ?, ?);", [title, done, deadline]);
  return res.insertId;
}

// Input: id (int)
// Output: true if deleted, false otherwise
async function deleteTodo(id) {
  const res = await connPool.awaitQuery("DELETE FROM Todo WHERE id = ?", [id]);
  if (res.affectedRows === 0) {
    return false;
  }
  return true;
}

// Input: option (string) one of the following (overdue, done, undone, all)
// Output: list of matching Todos ordered by done status (if applicable) and due date 
async function getTodos(option) {
  let todos = [];
  if (option == "overdue") {
    todos = await connPool.awaitQuery("SELECT * FROM Todo WHERE deadline < CURDATE() AND done = false ORDER BY deadline");
  }
  else if (option == "done") {
    todos = await connPool.awaitQuery("SELECT * FROM Todo WHERE done = true ORDER BY deadline"); // is it true or 1
  }
  else if (option == "undone") {
    todos = await connPool.awaitQuery("SELECT * FROM Todo WHERE done = false ORDER BY deadline"); // is it false or 0
  }
  else {
    todos = await connPool.awaitQuery("SELECT * FROM Todo ORDER BY done, deadline");
  }
  return todos;
}

// Input: data object {id, title, done, deadline}
// Output: true if updated, false otherwise
async function updateTodo(data) {
  let { id, title, done, deadline } = data;
  console.log(title, done, deadline)
  const res = await connPool.awaitQuery("UPDATE Todo SET title = ?, done = ?, deadline = ? WHERE id = ?", [title, done, deadline, id]);
  if (res.affectedRows === 0) {
    return false;
  }
  return true;
}

// Input: id (int)
// Output: matching todo
async function getTodoById(id) {
  const todo = await connPool.awaitQuery("SELECT * from Todo WHERE id = ?", [id]);
  return todo;
}

module.exports = {
  addTodo,
  deleteTodo,
  getTodos,
  updateTodo,
  getTodoById
};