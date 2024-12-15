const express = require('express')
const data = require('./data.js')
const session = require('express-session')
const bcrypt = require('bcrypt')
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
app.use(session({
  secret: ';hnio;nihnoevfnynpnpyyewynoyfviobiabfuv80n0n8ufe.dfsa98mcwrqourw9ko;erugto',
  resave: false,
  saveUninitialized: true,
}))

// Render functions
async function renderHomePage(req, res) {
  let option = req.query.option
  if (!option) option = "all"

  let todos = []
  if (req.session && req.session.userName) {
    todos = await data.getTodos(option, req.session.userName)
  }
  res.status(200).render("home.pug", {todos, option, session:req.session})
}

function renderCreateForm(req, res) {
  if (req.session && req.session.userName) {
    res.status(200).render("create.pug")
  }
  else {
    res.status(400).render("failure.pug", {heading: "You're Not logged in!"})
  }
}

async function renderUpdateForm(req, res) {
  const todoId = req.params.id
  if (!isNaN(todoId) && req.session && req.session.userName) {
    const todo = await data.getTodoById(todoId, req.session.userName)
    const item = {
      id:todo[0].id,
      title:todo[0].title,
      done:todo[0].done,
      deadline:todo[0].deadline.toLocaleDateString('en-CA') // Convert to "yyyy-mm-dd" date format
    }
    res.status(200).render("update.pug", item)
  }
  else {
    res.status(400).render("failure.pug", {heading: "Update Todo Failed!"})
  }
}

function renderRegisterForm(req, res) {
  res.status(200).render("login_register.pug", {state: "register"})
}

function renderLoginForm(req, res) {
  res.status(200).render("login_register.pug", {state: "login"})
}

// Todo functions
async function createNewTodo(req, res) {
  if (req.session && req.session.userName) {
    const input = {
      title: req.body.title,
      done: req.body.done === 'on' ? 1 : 0,
      deadline: req.body.deadline,
      userName: req.session.userName
    }
  
    const queryResId = await data.addTodo(input)
    if (queryResId !== -1) {
      // Redirect to home page
      res.location('http://localhost:4131/home')
      res.status(303).send()
      return
    }
  }
  res.status(400).render("failure.pug", {heading: "Create Todo Failed!"})
}

async function updateTodo(req, res) {
  if (req.session && req.session.userName) {
    const input = {
      id: req.body.id,
      title: req.body.title,
      done: req.body.done ? 1 : 0,
      deadline: req.body.deadline,
      userName: req.session.userName
    }

    const queryRes = await data.updateTodo(input)
    if (queryRes) {
      res.status(204).send()
      return
    }
  }
  res.status(400).render("failure.pug", {heading: "Update Todo Failed!"})
}

async function changeDone(req, res) {
  const todoId = req.body.todo_id
  if (req.session && req.session.userName) {
    const queryRes = await data.changeDoneState(todoId)
    if (queryRes) {
      res.status(204).send()
    }
  }
  res.status(400).send()
}

async function deleteTodo(req, res) {
  const id = req.body.todo_id
  if (req.session && req.session.userName) {
    const queryRes = await data.deleteTodo(id, req.session.userName)
    if (queryRes) {
      res.status(204).send()
      return
    }
  }
  res.status(400).render("failure.pug", {heading: "Delete Todo Failed!"})
}

// User functions
async function register(req, res) {
  // hash the password
  const hpass = await bcrypt.hash(req.body.password, 10)
  const queryRes = await data.addUser({username: req.body.username, password: hpass})
  if (queryRes !== -1) {
    req.session.userName = req.body.username
    // redirect to home page
    res.location('http://localhost:4131/home')
    res.status(303).send()
  }
  else {
    res.status(400).render("failure.pug", {heading: "Username already exists!"})
  }
}

async function login(req, res) {
  const DBpassword = await data.getPassword(req.body.username)
  if (DBpassword !== "") {    
    const valid = await bcrypt.compare(req.body.password, DBpassword)
    if (valid) {
      req.session.userName = req.body.username
      // redirect to home page
      res.location('http://localhost:4131/home')
      res.status(303).send()
      return
    }
  }
  res.status(400).render("failure.pug", {heading: "Username or password isn't valid!"})
}

function logout(req, res) {
  req.session.destroy(function(err) {
    // redirect to home page
    res.location('http://localhost:4131/home')
    res.status(303).send()
  })
}

// GET requests
app.get(['/', '/home'], renderHomePage)
app.get('/create', renderCreateForm)
app.get('/update/:id', renderUpdateForm)
app.get('/register', renderRegisterForm)
app.get('/login', renderLoginForm)
app.get('/logout', logout)

// POST requests
app.post('/create_todo', createNewTodo)
app.post('/register', register)
app.post('/login', login)

// PUT requests
app.put('/update_todo', updateTodo)
app.put('/change_done', changeDone)

// DELETE requests
app.delete('/delete_todo', deleteTodo)

// Default route (404)
app.use((req, res) => {
  res.status(404).render("404.pug")
});

app.listen(port, () => {
  console.log(`Premier Auctions Server running: http://localhost:${port}`) 
})