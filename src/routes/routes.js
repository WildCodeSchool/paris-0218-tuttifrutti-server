const express = require('express')
const router = express.Router()

const avocatModel = require('../models/avocat.js')
const missionModel = require('../models/mission.js')
const studentModel = require('../models/student.js')
const bcrypt = require('bcrypt-promise')
const jwt = require('jsonwebtoken')
const jwtSecret = 'MAKEITUNUVERSAL'

// POST Registration Student

router.post('/regstudent', function (req, res, next) {
  const newStudent = new studentModel(req.body.user)
  
  newStudent.save()
    .then(doc => res.json('ok'))
    .catch(next)
})

// POST Registration Avocat

router.post('/reg', function (req, res, next) {
  const newAvocat = new avocatModel(req.body.user)
  
  newAvocat.save()
    .then(doc => res.json('ok'))
    .catch(next)
})

// POST Login Student

router.post('/loginStudent', async (req, res, next) => {
  const user = await studentModel.findOne({ email: req.body.creds.email })

  const isEqual = await bcrypt.compare(req.body.creds.password, user.password)
  if (isEqual) {
    const token = jwt.sign({
      id: user._id,
      username: user.email
    }, jwtSecret)
    
    res.json({ token })
  } else {
    return next(Error('Wrong Password'))
  }
})

// POST Login avocat

router.post('/login', async (req, res, next) => {
  const user = await avocatModel.findOne({ email: req.body.creds.email })

  const isEqual = await bcrypt.compare(req.body.creds.password, user.password)
  if (isEqual) {
    const token = jwt.sign({
      id: user._id,
      username: user.email
    }, jwtSecret)
    
    res.json({ token })
  } else {
    return next(Error('Wrong Password'))
  }
})

// Route to Auth?

router.get('/secure', (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1]

  jwt.verify(token, jwtSecret)
    .then(() => res.json('ok'))
    .catch(next)
})

// Create mission
router.post('/missions', function (req, res, next) {
  const newMission = new missionModel(req.body.mission)
  
  newMission.save()
    .then(doc => res.json('ok'))
    .catch(next)
})

// Read missions
router.get('/missions', (req, res, next) => {
  missionModel.find()
    .then(missions => res.json(missions))
    .catch(next)
})

// GET ONE CURRENT MISSION
router.get('/missions/:missionId', (req, res, next) => {
  missionModel.findById(req.params.missionId)
    .then(mission => res.json(mission))
    .catch(next)
})

// EDIT ONE MISSION
router.put('/missions/:missionId', (req, res, next) => {
  const update = req.body

  missionModel.findByIdAndUpdate(req.params.missionId, { $set: update })
    .then(() => res.json('ok'))
    .catch(next)
})

// DELETE ONE MISSION
router.delete('/missions/:missionId', (req, res, next) => {
  missionModel.findByIdAndRemove(req.params.missionId)
    .then(() => res.json('ok'))
    .catch(next)
})

module.exports = router
