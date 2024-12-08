const express = require('express')
const data = require('./data.js')
const app = express()
const port = 4131

app.set("views", "templates")
app.set("view engine", "pug")

// Middlewares
app.use("/", express.static("resources/"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json()) 
app.use((req, res, next) => {
  next()
  // request information
  console.log(`${req.method} ${req.url} ${res.statusCode}`)
})

// functions
async function renderHomePage(req, res) {
  let option = req.query.option
  if (!option) option = "all"

  const todos = await data.getTodos(option)
  res.status(200).send(todos)
  // res.status(200).render("gallery.pug", {listings})
}

async function createNewTodo(req, res) {
  
}
async function updateTodo(req, res) {
  
}
async function deleteTodo(req, res) {
  
}

// GET requests
app.get(['/', '/home'], renderHomePage)

// POST requests
app.post('/create_todo', createNewTodo)

// PUT requests
// or maybe /update_todo/:id ???
app.delete('/update_todo', updateTodo)

// DELETE requests
// or maybe /delete_todo/:id ???
app.delete('/delete_todo', deleteTodo)

// Default route (404)
app.use((req, res) => {
  res.status(404).render("404.pug")
});

app.listen(port, () => {
  console.log(`Premier Auctions Server listening on port ${port}`) 
})