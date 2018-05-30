const express = require('express')
const router = express.Router()
const app = express()
const mongoose = require('mongoose')
const avocatModel = require('../src/models/avocat.js')
const bcrypt = require('bcrypt');

// Init Session

router.get('/', (req, res) => {
    req.session.userId = '';
});

// POST Registration 
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
        field: req.body.user.field
    })
    newUser
        .save()
        .then(doc => {
            console.log(doc)
        })
        .catch(err => {
            console.error(err)
        })
});

// POST Login


router.post('/login', function (req, next) {
    // loginEmail = ,
    // loginPassword = 

    avocatModel.findOne({
        email: req.body.creds.email
    }, function (err, user) {
        if (err) 
            throw err;
        {
            bcrypt
                .compare(req.body.creds.password, user.password, function (err, res) {
                    if (res === true) {
                        console.log('yes')
                        req.session.userId = user._id;
                        console.log(req.session.userId)
                        console.log(req.session)
                    } else {
                        console.log('wrong password')
                    }
                });
        }
    })
})

function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  }
}

router.get('/profile', requiresLogin, function(req, res, next) {
 console.log('test')
});




module.exports = router
