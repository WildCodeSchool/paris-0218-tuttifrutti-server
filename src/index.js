const express = require('express')
// const router = express.Router()
const app = express()
const database = require('./database.js')
const bodyParser = require('body-parser')
const routes = require('./routes/routes.js')
// const jwtSecret = 'MAKEITUNUVERSAL'
// const cors = require('cors')

// app.options('*', cors())
// app.use(cors())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  next()
})

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, {
    cookie: req.headers.cookie,
    token: req.headers.authorization
  })
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

// ROUTES

app.get('/', (req, res) => {
  res.json('A SUCCESFUL FETCH on /')
})

app.use('/', routes)

app.listen(3030, () => console.log(`server listening on port: 3030`))
