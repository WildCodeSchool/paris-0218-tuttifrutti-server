const express = require('express')
const router = express.Router()
const app = express()
const avocatModel = require('../src/models/avocat.js')

router.post('/reg', function (req, next) {

    let newUser = new avocatModel({
        email: req.body.user.email,
        password: req.body.user.password,
        firstName: req.body.user.firstName,
        lastName: req.body.user.lastName,
        cabinet: req.body.user.cabinet,
        phone: req.body.user.phone,
        address: req.body.user.address,
        zipCode: req.body.user.zipCode,
        toque: req.body.user.toque,
        field: req.body.user.field,
    })
    newUser.save()
     .then(doc => {
       console.log(doc)
     })
     .catch(err => {
       console.error(err)
     })
    
  });

  module.exports = router
  