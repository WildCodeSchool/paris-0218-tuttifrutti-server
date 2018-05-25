const express = require('express')
const database = require('./src/database.js')
// const routes = require("./routes") ???????
const router = express.Router();
const app = express()
const bodyParser = require('body-parser');
const avocatModel = require('./src/models/avocat.js')
// const Avocat = require('./src/models/avocat.js')
const auth = require('./routes/auth.js')


// MIDDLEWARES

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// ROUTES

app.get('/', (req, res) => {
  res.json('A SUCCESFUL FETCH')
})

// new routes here..

app.post('/reg', function (req, next) {

  let newUser = new avocatModel({
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      cabinet: req.body.cabinet,
      phone: req.body.phone,
      address: req.body.address,
      zipCode: req.body.zipCode,
      toque: req.body.toque,
      field: req.body.field,
  })
  newUser.save()
   .then(doc => {
     console.log(doc)
   })
   .catch(err => {
     console.error(err)
   })
  
});

app.listen(3030, () => console.log(`server listening on port: 3030`))