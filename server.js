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

// Render functions
async function renderHomePage(req, res) {
  let option = req.query.option
  if (!option) option = "all"

  const todos = await data.getTodos(option)
  res.status(200).render("home.pug", {todos, option})
}

async function renderCreateForm(req, res) {
  res.status(200).render("create.pug")
}

async function renderUpdateForm(req, res) {
  const todoId = req.params.id
  if (!isNaN(todoId)) {
    const todo = await data.getTodoById(todoId)
    const item = {
      id:todo[0].id,
      title:todo[0].title,
      done:todo[0].done,
      deadline:todo[0].deadline.toLocaleDateString('en-CA') // Convert to "yyyy-mm-dd" date format
    }
    res.status(200).render("update.pug", item)
  }
  else {
    res.status(400).render("failure.pug")
  }
}

async function createNewTodo(req, res) {
  const input = {
    title: req.body.title,
    done: req.body.done === 'on' ? 1 : 0,
    deadline: req.body.deadline
  }

  const queryResId = await data.addTodo(input)
  if (queryResId === -1) {
    res.status(400).render("failure.pug")
  }
  else {
    // Redirect to home page
    res.location('http://localhost:4131/home')
    res.status(303).send()
  }
}

async function updateTodo(req, res) {
  const input = {
    id: req.body.id,
    title: req.body.title,
    done: req.body.done ? 1 : 0,
    deadline: req.body.deadline
  }

  const queryRes = await data.updateTodo(input)
  if (queryRes) {
    res.status(204).send()
  }
  else {
    res.status(400).render("failure.pug")
  }
}

async function deleteTodo(req, res) {
  const id = req.body.todo_id
  const queryRes = await data.deleteTodo(id)
  if (queryRes) {
    res.status(204).send()
  }
  else {
    res.status(400).render("failure.pug")
  }
}

// GET requests
app.get(['/', '/home'], renderHomePage)
app.get('/create', renderCreateForm)
app.get('/update/:id', renderUpdateForm)

// POST requests
app.post('/create_todo', createNewTodo)

// PUT requests
app.put('/update_todo', updateTodo)

// DELETE requests
app.delete('/delete_todo', deleteTodo)

// Default route (404)
app.use((req, res) => {
  res.status(404).render("404.pug")
});

app.listen(port, () => {
  console.log(`Premier Auctions Server running: http://localhost:${port}`) 
})