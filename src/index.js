const express = require('express')
const router = express.Router()
const app = express()
const database = require('./database.js')
const bodyParser = require('body-parser')
const routes = require('./routes/routes.js')
// const session = require('express-session')
// const FileStore = require('session-file-store')(session) MIDDLEWARES

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000') //req.headers.origin)
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    res.header('Access-Control-Allow-Credentials', 'true')
    next()
})

// const secret = 'work hard'
//use sessions for tracking logins
// app.use(session({
//     secret, resave: true, saveUninitialized: true,
//     // store: new FileStore({ secret })
// }))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

	
// ROUTES

app.get('/', (req, res) => {
    res.json('A SUCCESFUL FETCH')
})

app.use('/', routes)

app.listen(3030, () => console.log(`server listening on port: 3030`))