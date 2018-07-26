const express = require('express')
const router = express.Router()
const AvocatModel = require('../models/avocat.js')
const MissionModel = require('../models/mission.js')
const StudentModel = require('../models/student.js')
const AdminModel = require('../models/admin.js')
const bcrypt = require('bcrypt-promise')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
const multer = require('multer')
// const uuidv4 = require('uuid/v4')
// const path = require('path')
const mail = require('./mail')

const hostUrl = process.env.HOST_URL || 'http://localhost:3000'
const jwtSecret = process.env.JWT_SECRET || 'MAKEITUNUVERSAL'
const LITTA_ADMIN_EMAIL = process.env.LITTA_ADMIN_EMAIL || 'admin@litta.fr'

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
      return cb(Error('.pdf, .doc/docx, .jpg/jpeg uniquement'))
    }
    cb(null, true)
  }

})

// create the multer instance that will be used to upload/save the file

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

// Upload  de fichier
router.post('/upload', upload.single('selectedFile'), (req, res) => {
  // console.dir(res, { depth: 0 })
  res.send({ result: 'ok' })
})

// Handle any other errors
router.use(function (err, req, res, next) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.send({ result: 'fail', error: { code: 1001, message: 'File is too big' } })
    return
  }

  next(err)
})

// POST Registration Admin

router.post('/signupadmin', async (req, res, next) => {
  const { user } = req.body
  const newAdmin = await new AdminModel(user)
  newAdmin.password = await bcrypt.hash(newAdmin.password, 16)

  newAdmin.save()
    .then(res.json('ok'))
    .then(async () => {
      const user = await AdminModel.findOne({ email: user.email })
      const link = `${hostUrl}/confirmationadmin/${user._id}`

      const options = {
        to: LITTA_ADMIN_EMAIL,
        ...mail.templates.ADMIN_ACCOUNT_CONFIRMATION(link)
      }

      return mail.send(options)
    })
    .catch(next)
})

// POST Registration Student

router.post('/regstudent', async (req, res, next) => {
  const { user } = req.body
  const newStudent = await new StudentModel(user)
  newStudent.password = await bcrypt.hash(newStudent.password, 16)

  newStudent.save()
    .then(res.json('ok'))
    .then(async () => {
      const user = await StudentModel.findOne({ email: user.email })
      const link = `${hostUrl}/confirmationstudent/${user._id}`

      const options = {
        to: `${user.email}`,
        subject: 'Confirmez votre adresse mail',
        ...mail.templates.STUDENT_ACCOUNT_CONFIRMATION(link)
      }

      return mail.send(options)
    })
    .catch(next)
})
// POST Registration Avocat


router.post('/reg', async (req, res, next) => {
  const { user } = req.body
  const newAvocat = await new AvocatModel(user)
  newAvocat.password = await bcrypt.hash(newAvocat.password, 16)

  newAvocat.save()
    .then(res.json('ok'))
    .then(async () => {
      const user = await AvocatModel.findOne({ email: user.email })
      const link = `${hostUrl}/confirmationlawyer/${user._id}`

      const options = {
        to: `${user.email}`,
        subject: 'Confirmez votre adresse mail',
        ...mail.templates.LAWYER_ACCOUNT_CONFIRMATION(link)
      }

      return mail.send(options)
    })
    .catch(next)
})

// Mail Confirm Get Admin
router.get('/confirmationadmin/:uuid', async (req, res) => {
  const query = await { _id: `${req.params.uuid}` }
  await AdminModel.findOneAndUpdate(query, { activated: true })
    .catch(err => { if (err) res.json('invalid user') })
  res.json('verified')
})

// Mail Confirm Get Advocat

router.get('/confirmationlawyer/:uuid', async (req, res) => {
  console.log(req.params.uuid)
  const query = await { _id: `${req.params.uuid}` }
  await AvocatModel.findOneAndUpdate(query, { activated: true })
    .catch(err => { if (err) res.json('invalid user') })
  res.json('verified')
})

// Mail Confirm Get Student

router.get('/confirmationstudent/:uuid', async (req, res) => {

  console.log(req.params.uuid)
  const query = await { _id: `${req.params.uuid}` }
  await StudentModel.findOneAndUpdate(query, { activated: true })
    .catch(err => { if (err) res.json('invalid user') })
  res.json('verified')

})

// POST Login admin

router.post('/loginadmin', async (req, res) => {
  const user = await AdminModel.findOne({ email: req.body.creds.email })
  console.log(user)
  if (user === null) {
    return res.json('auth failed')
  }
  if (user.activated === false) {
    return res.json('not verified')
  } else {
    const isEqual = await bcrypt.compare(req.body.creds.password, user.password)
    if (isEqual) {
      const token = jwt.sign({
        id: user._id,
        username: user.email
      }, jwtSecret)
      return res.json({ token })
    } else {
      return res.json('auth failed')
    }
  }
})

// POST Login Student / A VENIR

// router.post('/loginstudent', async (req, res, next) => {
//   const user = await StudentModel.findOne({email: req.body.creds.email})
//   console.log(user)
//   if (user === null) {
//     return res.json('auth failed')
//  }
//  if (user.activated === false) {
//    return res.json('not verified')
//  } else {
//    const isEqual = await bcrypt.compare(req.body.creds.password, user.password)
//    if (isEqual) {
//      const token = jwt.sign({
//        id: user._id,
//        username: user.email
//      }, jwtSecret)
//      return res.json({token})
//    } else {
//      return res.json('auth failed')
//    }
//  }
// })

// POST Login avocat

router.post('/login', async (req, res, next) => {
  const user = await AvocatModel.findOne({ email: req.body.creds.email })
  console.log(user)
  if (user === null) {
    return res.json('auth failed')
  }
  if (user.activated === false) {
    return res.json('not verified')
  } else {
    const isEqual = await bcrypt.compare(req.body.creds.password, user.password)
    if (isEqual) {
      const token = jwt.sign({
        id: user._id,
        username: user.email
      }, jwtSecret)
      return res.json({ token })
    } else {
      return res.json('auth failed')
    }
  }
})

// Route to Auth?

router.get('/secure', (req, res, next) => {
  const token = req
    .headers
    .authorization
    .split(' ')[1]
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

// POST to get info admin

router.post('/infoadmin', async (req, res, next) => {
  console.log(req.body.decoded.id)
  const user = await AdminModel.findOne({ _id: req.body.decoded.id })
  console.log(user)
  res.json(user)
})

// EDIT ADMIN INFO
router.put('/infoadmin', async (req, res, next) => {
  const update = req.body.user
  console.log(update)

  if (update.password && update.password !== '') {
    console.log('password modifié', update)
    update.password = await bcrypt.hash(update.password, 16)
    console.log('password modifié apres crypt', update)

    AdminModel.findByIdAndUpdate({
      _id: update.id
    }, { $set: update }).then((admin) => res.json(admin)).catch(next)
  } else {
    console.log('password pas modifié', update)
    AdminModel.findByIdAndUpdate({
      _id: update.id
    }, {
        $set: {
          email: update.email,
          firstName: update.firstName,
          lastName: update.lastName
        }
      })
      .then(admin => console.log(admin))
      .then(admin => res.json(admin))
      .catch(next)
  }
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

    AvocatModel.findByIdAndUpdate({
      _id: update.id
    }, { $set: update }).then((lawyer) => res.json(lawyer)).catch(next)
  } else {
    console.log('password pas modifié', update)
    AvocatModel.findByIdAndUpdate({
      _id: update.id
    }, {
        $set: {
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

// POST to get student info
router.post('/infostudent', async (req, res, next) => {
  await StudentModel.findOne({ _id: req.body.studentId })
    .then(student => res.json(student.firstName))
    .catch(next)
})


const sendNewMissionProposalToStudent = (student, mission) => {
  const link = `${hostUrl}/accept/${mission._id}/${student._id}`

  const options = {
    to: student.email,
    ...mail.templates.STUDENT_MISSION_WITH_LINK_PROPOSAL(mission, link)
  }

  return mail.send(options)
}

const sendNewMissionToAdmin = (mission) => {
  const options = {
    to: LITTA_ADMIN_EMAIL,
    ...mail.templates.ADMIN_CONFIRMATION_NEW_MISSION(mission)
  }

  return mail.send(options)
}

// Create mission
router.post('/missions', function (req, res, next) {
  const { mission } = req.body
  const newMission = new MissionModel(mission)

  newMission
    .save()
    .then(() => res.json(newMission))
    .then(async () => {
      const students = await StudentModel.find()
      const concernedStudents = students.filter(student => student.field === mission.field)

      console.log(`Number of potential students: ${concernedStudents.length}`)

      concernedStudents
        .map(student => sendNewMissionProposalToStudent(student, newMission))

      sendNewMissionToAdmin(newMission)
    })
    .catch(next)
})

// GET Accept Mission

router.get('/accept/:mission/:uuid', async (req, res) => {
  const queryStudent = await { _id: `${req.params.uuid}` }
  const queryMission = await { _id: `${req.params.mission}` }
  await MissionModel.find(queryMission, async (err, result) => {
    if (result[0].student === '') {
      await MissionModel.findOneAndUpdate(queryMission, { student: queryStudent })
      res.send('Ok')
    } else {
      res.send('Not avalaible')
    }
  })
})

// Read missions
router.post('/missionsfiltered', (req, res, next) => {
  const lawyer = req.body.lawyerId
  MissionModel
    .find()
    .then(missions => res.json(missions.filter(mission => mission.finished === false).filter(mission => mission.author === lawyer)))
    .catch(next)
})

// GET ONE CURRENT MISSION
router.get('/missions/:missionId', (req, res, next) => {
  MissionModel
    .findById(req.params.missionId)
    .then(mission => res.json(mission))
    .catch(next)
})

// EDIT ONE MISSION WITH FILES SENDED NAMES
router.put('/missions/:missionId', (req, res, next) => {

  const name = req.body.fileName

  MissionModel
    .findByIdAndUpdate(req.params.missionId, { $push: { filesSended: name } })
    .then((names) => res.json(names))
    .catch(next)
})

// SEND MESSAGE TO STUDENT
router.post('/missions/:missionId/sendmessage', async (req, res, next) => {
  const messageContent = req.body.messageContent
  const missionId = messageContent.missionId.slice(-5)

  StudentModel.findOne({ _id: messageContent.studentId })
    .then(student => {
      const options = {
        to: LITTA_ADMIN_EMAIL,
        ...mail.templates.LAWYER_MESSAGE_TO_STUDENT(missionId, student, message)
      }

      return mail.send(options)
    })
    .then(res.json("ok"))
    .catch(next)
})

// DELETE ONE MISSION
router.delete('/missions/:missionId', (req, res, next) => {
  MissionModel
    .findByIdAndRemove(req.params.missionId)
    .then(() => res.json('ok'))
    .catch(next)
})

// GET OLD MISSIONS

router.post('/oldmissionsfiltered', (req, res, next) => {
  const lawyer = req.body.lawyerId
  MissionModel
    .find()
    .then(missions =>
      missions.filter(mission => mission.finished === true)
        .filter(mission => mission.author === lawyer))
    .then(oldmissions => Promise.all(
      oldmissions.map(async mission => {
        let studentFirstName = ''
        await StudentModel
          .findById({ _id: mission.student })
          .then(id => {
            studentFirstName = id.firstName
          })
        const oldmission = {
          ...mission.toObject(),
          studentName: studentFirstName
        }
        console.log(oldmission)
        return oldmission
      })
    )
  )
  .then(oldmissions => res.json(oldmissions))
  .catch(next)
})

// REPORT PROBLEM TO ADMIN
router.post('/missions/:missionId/reportproblem', async (req, res, next) => {
  const messageContent = req.body.messageContent
  const missionId = messageContent.missionId.slice(-5)

  StudentModel.findOne({ _id: req.body.messageContent.studentId })
    .then(student => {
      const options = {
        to: LITTA_ADMIN_EMAIL,
        ...mail.templates.LAWYER_REPORT_PROBLEM_TO_ADMIN(missionId, student, message)
      }

      return mail.send(options)
    })
    .then(res.json("ok"))
    .catch(next)
})


// GET ALL LAWYERS

router.get('/alllawyers', (req, res, next) => {
  AvocatModel
    .find()
    .then(users => res.json(users))
    .catch(next)
});


// GET ALL STUDENTS

router.get('/allstudents', (req, res, next) => {
  StudentModel
    .find()
    .then(users => res.json(users))
    .catch(next)
})

// CHANGE STATUS OF A STUDENT

router.post('/allstudents', async (req, res, next) => {
  console.log(req.body)
  const update = req.body.user
  await StudentModel.findByIdAndUpdate(update._id,
    { $set: update })
    .then((user) => res.json(user))
    .catch(next)
})

// router.post('/allstudents', async(req, res, next) => {
//    console.log(req.body)
//    console.log(req.body.user.email)
//    const query = await {uuid: `${req.params.uuid}`}
//    console.log(query)
//    await StudentModel.findOneAndUpdate(query, {activated: true})
//    res.json('testing');
// })

module.exports = router
