const express = require('express')
const router = express.Router()
const AvocatModel = require('../models/avocat.js')
const MissionModel = require('../models/mission.js')
const StudentModel = require('../models/student.js')
const bcrypt = require('bcrypt-promise')
const jwt = require('jsonwebtoken')
const jwtSecret = 'MAKEITUNUVERSAL'

const bodyParser = require('body-parser')
const multer = require('multer')
const uuidv4 = require('uuid/v4')
const path = require('path')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 10 ** 6 }, // 5mo
  fileFilter: function (req, file, cb) {
    if (!file.originalname.toLowerCase().match(/\.(pdf|jpeg|jpg|doc|docx)$/)) {
      return cb(Error('Envoi de pdf, doc, docx, jpg ou jpeg seulement'))
    }
    cb(null, true)
  }

})

// create the multer instance that will be used to upload/save the file

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

// Upload  de fichier
router.post('/upload', upload.single('selectedFile'), (req, res) => {
  console.dir(res, { depth: 0 })
  res.send({ result: 'ok' })
})

// Handle any other errors
router.use(function (err, req, res, next) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    console.log("fail")
    res.send({ result: 'fail', error: { code: 1001, message: 'File is too big' } }
    )
    return
  }
  next(err)
})

// POST Registration Student

router.post('/regstudent', function (req, res, next) {
  const newStudent = new StudentModel(req.body.user)

  newStudent.save()
    .then(doc => res.json('ok'))
    .catch(next)
})

// POST Registration Avocat

router.post('/reg', async (req, res, next) => {
  const newAvocat = new AvocatModel(req.body.user)

  newAvocat.password = await bcrypt.hash(newAvocat.password, 16)

  newAvocat.save()
    .then(doc => res.json('ok'))
    .catch(next)
})

// POST Login Student

router.post('/loginStudent', async (req, res, next) => {
  const user = await StudentModel.findOne({ email: req.body.creds.email })
  const isEqual = await bcrypt.compare(req.body.creds.password, user.password)
  if (isEqual === true) {
    const token = jwt.sign({
      id: user._id,
      username: user.email
    }, jwtSecret)
    res.json({ token })
  } else {
    return next(Error('error'))
  }
})

// POST Login avocat

router.post('/login', async (req, res, next) => {
  const user = await AvocatModel.findOne({ email: req.body.creds.email })
  console.log(user)
  if (user === null) { return res.json('error') }
  const isEqual = await bcrypt.compare(req.body.creds.password, user.password)
  if (isEqual) {
    const token = jwt.sign({
      id: user._id,
      username: user.email
    }, jwtSecret)
    res.json({ token })
  } else {
    res.json('auth failed')
    return next(Error('Wrong Password'))
  }
})

// Route to Auth?

router.get('/secure', (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1]
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

// POST to get info avocat

router.post('/infolawyer', async (req, res, next) => {
  console.log(req.body.decoded.id)
  const user = await AvocatModel.findOne({ _id: req.body.decoded.id })
  console.log(user)
  res.json(user)
})

// EDIT LAWYER INFO
router.put('/infolawyer', async (req, res, next) => {
  const update = req.body.user
  console.log(update)

  if (update.password && update.password !== '') {
    console.log('password modifié', update)
    update.password = await bcrypt.hash(update.password, 16)
    console.log('password modifié apres crypt', update)

    AvocatModel.findByIdAndUpdate({_id: update.id}, { $set: update })
      .then((lawyer) => res.json(lawyer))
      .catch(next)
  } else {
    console.log('password pas modifié', update)
    AvocatModel.findByIdAndUpdate({_id: update.id}, { $set: {
      email: update.email,
      firstName: update.firstName,
      lastName: update.lastName,
      cabinet: update.cabinet,
      phone: update.phone,
      address: update.address,
      city: update.city,
      zipCode: update.zipCode,
      toque: update.toque,
      field: update.field
    }
    })
      .then(lawyer => console.log(lawyer))
      .then(lawyer => res.json(lawyer))
      .catch(next)
  }
})

// Create mission
router.post('/missions', function (req, res, next) {
  const newMission = new MissionModel(req.body.mission)

  newMission.save()
    .then(doc => res.json('ok'))
    .catch(next)
})

// Read missions
router.get('/missions', (req, res, next) => {
  MissionModel.find()
    .then(missions => res.json(missions.filter(mission => mission.finished === false)))
    .catch(next)
})

// POST Upload file
router.post('/missions/:missionId', upload.single('selectedFile'), (req, res) => {
  console.log('blabla', req)
  res.send()
})

// GET ONE CURRENT MISSION
router.get('/missions/:missionId', (req, res, next) => {
  MissionModel.findById(req.params.missionId)
    .then(mission => res.json(mission))
    .catch(next)
})

// EDIT ONE MISSION
router.put('/missions/:missionId', (req, res, next) => {
  const update = req.body

  MissionModel.findByIdAndUpdate(req.params.missionId, { $set: update })
    .then((mission) => res.json(mission))
    .catch(next)
})

// DELETE ONE MISSION
router.delete('/missions/:missionId', (req, res, next) => {
  MissionModel.findByIdAndRemove(req.params.missionId)
    .then(() => res.json('ok'))
    .catch(next)
})

// GET OLD MISSIONS
router.get('/oldmissions', (req, res, next) => {
  MissionModel.find()
    .then(missions => res.json(missions.filter(mission => mission.finished === true)))
    .catch(next)
})

module.exports = router
