// this package behaves just like the mysql one, but uses async await instead of callbacks.
const mysql = require(`mysql-await`); 

var connPool = mysql.createPool({
  connectionLimit: 10, 
  host: "127.0.0.1",
  user: "C4131F24U81",
  database: "C4131F24U81",
  password: "", 
});

// Helper functions
// Input: userName
// Output: userId
async function getUserId(userName) {
  const res = await connPool.awaitQuery("SELECT id FROM Users WHERE username = ?", [userName]);
  if (res[0]) {
    return res[0].id; 
  }
  else {
    return -1;
  }
}

// Input: data object {title, done, deadline, userName}
// Output: the id of new Todo
async function addTodo(data) {
  const { title, done, deadline, userName } = data;
  const userId = await getUserId(userName);
  if (title === undefined || done === undefined || deadline === undefined || userId === -1) {
    return -1;
  }
  const res = await connPool.awaitQuery("INSERT INTO Todo (title, done, deadline, userId) VALUES (?, ?, ?, ?);", [title, done, deadline, userId]);
  return res.insertId;
}

// Input: id (int), userName (str)
// Output: true if deleted, false otherwise
async function deleteTodo(id, userName) {
  const userId = await getUserId(userName);
  const res = await connPool.awaitQuery("DELETE FROM Todo WHERE id = ? AND userId = ?", [id, userId]);
  if (res.affectedRows === 0) {
    return false;
  }
  return true;
}

// Input: option (string) one of the following (overdue, done, undone, all)
// Output: list of matching Todos ordered by done status (if applicable) and due date 
async function getTodos(option, userName) {
  const userId = await getUserId(userName);
  let todos = [];
  if (option == "overdue") {
    todos = await connPool.awaitQuery("SELECT id, title, done, deadline FROM Todo WHERE deadline < CURDATE() AND done = false AND userId = ? ORDER BY deadline", [userId]);
  }
  else if (option == "done") {
    todos = await connPool.awaitQuery("SELECT id, title, done, deadline FROM Todo WHERE done = true AND userId = ? ORDER BY deadline", [userId]); 
  }
  else if (option == "undone") {
    todos = await connPool.awaitQuery("SELECT id, title, done, deadline FROM Todo WHERE done = false AND userId = ? ORDER BY deadline", [userId]); 
  }
  else {
    todos = await connPool.awaitQuery("SELECT id, title, done, deadline FROM Todo WHERE userId = ? ORDER BY done, deadline", [userId]);
  }
  return todos;
}

// Input: data object {id, title, done, deadline, userName}
// Output: true if updated, false otherwise
async function updateTodo(data) {
  let { id, title, done, deadline, userName } = data;
  const userId = await getUserId(userName);
  const res = await connPool.awaitQuery("UPDATE Todo SET title = ?, done = ?, deadline = ? WHERE id = ? AND userId = ?", [title, done, deadline, id, userId]);
  if (res.affectedRows === 0) {
    return false;
  }
  return true;
}

// Input: id (int), userName (str)
// Output: matching todo or empty list
async function getTodoById(id, userName) {
  const userId = await getUserId(userName);
  const todo = await connPool.awaitQuery("SELECT * from Todo WHERE id = ? AND userId = ?", [id, userId]);
  return todo;
}

// Input: data {username, password}
// Output: User id if added, -1 otherwise
async function addUser(data) {
  let {username, password} = data;
  const user = await connPool.awaitQuery("SELECT * from Users WHERE username = ?", [username]);
  if (user.length !== 0) {
    return -1;
  }
  const res = await connPool.awaitQuery("INSERT INTO Users (username, password) VALUES (?, ?)", [username, password]);
  return res.insertId;
}

// Input: userName
// Output: password if user exists, empty string otherwise
async function getPassword(userName) {
  const res = await connPool.awaitQuery("SELECT password FROM Users WHERE username = ?", [userName]);
  if (res.length === 0) {
    return "";
  }
  return res[0].password;
}

// Input: todoId
// Output: true if done state changed, false otherwise
async function changeDoneState(todoId) {
  const res = await connPool.awaitQuery("UPDATE Todo SET done = !done WHERE id = ?", [todoId]);
  if (res.affectedRows === 0) {
    return false;
  }
  return true;
}

module.exports = {
  addTodo,
  deleteTodo,
  getTodos,
  updateTodo,
  getTodoById,
  addUser,
  getPassword,
  getUserId, 
  changeDoneState
};