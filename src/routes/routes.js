const express = require('express')
const router = express.Router()
const app = express()
const mongoose = require('mongoose')
const avocatModel = require('../models/avocat.js')
const bcrypt = require('bcrypt')

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
})

// POST Login

router.post('/login', (req, res, next) => {

    avocatModel
        .findOne({
            email: req.body.creds.email
        }, function (err, user) {
            if (err) 
                return next(err)

            bcrypt
                .compare(req.body.creds.password, user.password, function (err, result) {
                    if (err) {
                        console.log(err)
                        return next(Error('Wrong Password'))
                    }

                    req.session.userId = user._id
                    console.log({logged: req.session.userId, session: req.session})
                    res.json('ok')
                })
        })
})

app.get('/profile', function (req, res) {
    res.send('hello world')
})

module.exports = router
