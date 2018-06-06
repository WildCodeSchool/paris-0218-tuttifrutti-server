const express = require('express')
const router = express.Router()
const app = express()
const mongoose = require('mongoose')
const avocatModel = require('../models/avocat.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const jwtSecret = 'ENCRYPTMEORSOMETHING'

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
                    if (result === true) {
                        console.log(result)
                    const token = jwt.sign({
                        id: user._id,
                        username: user.email
                    }, jwtSecret)
                    res.json({token})
                }
                if (result === false) {
                    console.log(err)
                    console.log('wrong password')
                    return next(Error('Wrong Password'))
                }
                })
        })
})

app.get('/profile', (req, res) => {
    res.json('A wqdgywygdgywd FETCH')
})


module.exports = router
