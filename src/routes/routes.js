const express = require('express')
const router = express.Router()
const app = express()
const mongoose = require('mongoose')
const avocatModel = require('../models/avocat.js')
const missionModel = require('../models/mission.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const jwtSecret = 'MAKEITUNUVERSAL'

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
                        console.log(token)
                        res.json({ token })
                    }
                    if (result === false) {
                        console.log(err)
                        console.log('wrong password')
                        return next(Error('Wrong Password'))
                    }
                })
        })
})
// Route to Auth?

router.get('/secure', (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1]
    jwt.verify(token, jwtSecret, function (err, decoded) {
        console.log('token verify')
        if (err) {
            console.log(err)
            res.json('notlogged')
        } else if (err === null) {
            console.log(true)
            res.json('logged')
        }
    })
})


// POST NEW MISSION

router.post('/newmission', function (req, next) {

    let newMission = new missionModel({      
        name: req.body.mission.name,
        field: req.body.mission.field,
        deadline: req.body.mission.deadline,
        price: req.body.mission.price,
        description: req.body.mission.description,
        author: req.body.mission.author
    })
    newMission
        .save()
        .then(doc => {
            console.log(doc)
        })
        .catch(err => {
            console.error(err)
        })
})

// GET CURRENT MISSIONS
router.get('/mission', (req, res, next) => {
    missionModel.find({}, (err, missions) => {
        res.json(missions)
    })
})

// GET ONE CURRENT MISSION
router.get('/mission/:missionId', (req, res, next) => {
    missionModel.findById(req.params.missionId, (err, mission) => {
        res.json(mission)
    })
})

// EDIT ONE MISSION
router.put('/mission/:missionId', (req, res, next) => {
    missionModel.findById(req.params.missionId, (err, mission) => {
        mission.name = req.body.name;
        mission.deadline = req.body.deadline;
        mission.description = req.body.description;
        mission.save()
        res.json(mission)
    })
})

// DELETE ONE MISSION
router.delete('/mission/:missionId', (req, res, next) => {
    missionModel.findById(req.params.missionId, (err, mission) => {
        mission.remove(err => {
            if (err) {
                res.status(500).send(err)
            }
            else {
                res.status(204).send('removed')
            }
        })

    })
})

module.exports = router
