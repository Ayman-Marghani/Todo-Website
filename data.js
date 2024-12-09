// this package behaves just like the mysql one, but uses async await instead of callbacks.
const mysql = require(`mysql-await`); // npm install mysql-await

// first -- I want a connection pool: https://www.npmjs.com/package/mysql#pooling-connections
// this is used a bit differently, but I think it's just better -- especially if server is doing heavy work.
var connPool = mysql.createPool({
  connectionLimit: 5, // it's a shared resource, let's not go nuts.
  host: "127.0.0.1",// this will work
  user: "C4131F24U81",
  database: "C4131F24U81",
  password: "6611", // we really shouldn't be saving this here long-term -- and I probably shouldn't be sharing it with you...
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
// Output: list of matching Todos
async function getTodos(option) {
  let todos = [];
  if (option == "overdue") {
    todos = await connPool.awaitQuery("SELECT * FROM Todo WHERE deadline < CURDATE()");
  }
  else if (option == "done") {
    todos = await connPool.awaitQuery("SELECT * FROM Todo WHERE done = true"); // is it true or 1
  }
  else if (option == "undone") {
    todos = await connPool.awaitQuery("SELECT * FROM Todo WHERE done = false"); // is it false or 0
  }
  else {
    todos = await connPool.awaitQuery("SELECT * FROM Todo");
  }
  return todos;
}

// Input: id (int), data object {title, done, deadline}
// Output: true if updated, false otherwise
async function updateTodo(id, data) {
  let { title, done, deadline } = data;
  console.log(title, done, deadline)
  const todo = await getTodoById(id);
  if (title === undefined) {
    title = todo[0].title;
  }
  if (done === undefined) {
    done = todo[0].done;
  }
  if (deadline === undefined) {
    deadline = todo[0].deadline;
  }
  const res = await connPool.awaitQuery("UPDATE Todo SET title = ?, done = ?, deadline = ? WHERE id = ?", [title, done, deadline, id]);
  if (res.affectedRows === 0) {
    return false;
  }
  return true;
}

// Helper Functions
async function getTodoById(id) {
  const todo = await connPool.awaitQuery("SELECT title, done, deadline from Todo WHERE id = ?", [id]);
  return todo;
}

module.exports = {
  addTodo,
  deleteTodo,
  getTodos,
  updateTodo
};