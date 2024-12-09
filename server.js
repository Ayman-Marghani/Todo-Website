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
  // res.status(200).send(todos)
  res.status(200).render("home.pug", {todos})
}

async function createNewTodo(req, res) {
  const input = {
    title: req.body.title,
    done: req.body.done,
    deadline: req.body.deadline
  }
  const queryResId = await data.addTodo(input)
  if (queryResId === -1) {
    res.status(400).render("create_fail.pug")
  }
  else {
    // Send the response
    res.status(201).send()
  }
}

// needs an interface before testing
// could be a hidden input in html
async function updateTodo(req, res) {

}
async function deleteTodo(req, res) {
  const id = req.params.id
  const queryRes = await data.deleteTodo(id)
  if (queryRes) {
    res.status(204).send()
  }
  else {
    res.status(404).render("404.pug")
  }
}

// GET requests
app.get(['/', '/home'], renderHomePage)

// POST requests
app.post('/create_todo', createNewTodo)

// PUT requests
// or maybe /update_todo/:id ???
app.delete('/update_todo', updateTodo)

// DELETE requests
app.delete('/delete_todo/:id', deleteTodo)

// Default route (404)
app.use((req, res) => {
  res.status(404).render("404.pug")
});

app.listen(port, () => {
  console.log(`Premier Auctions Server listening on port ${port}`) 
})