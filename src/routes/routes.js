const express = require('express')
const router = express.Router()
const AvocatModel = require('../models/avocat.js')
const MissionModel = require('../models/mission.js')
const StudentModel = require('../models/student.js')
const bcrypt = require('bcrypt-promise')
const jwt = require('jsonwebtoken')
const jwtSecret = 'MAKEITUNUVERSAL'
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser')
const multer = require('multer')
const uuidv4 = require('uuid/v4')
// const path = require('path') Generate test SMTP service account from
// ethereal.email Only needed if you don't have a real mail account for testing
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'vbkawgch3kkkhqax@ethereal.email',
        pass: 'bVWMcjVnQenkaJsGz4'
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'tmp/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})

const upload = multer({storage: storage})

// create the multer instance that will be used to upload/save the file

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: true}))

// Upload  de fichier
router.post('/upload', upload.single('selectedFile'), (req, res) => {
    res.json('sucess')
})

// POST Registration Student

router.post('/regstudent', function (req, res, next) {
    const newStudent = new StudentModel(req.body.user)
    newStudent
        .save()
        .then(doc => res.json('ok'))
        .catch(next)
})

// POST Registration Avocat

router.post('/reg', async(req, res, next) => {

    const newAvocat = await new AvocatModel(req.body.user)
    newAvocat.password = await bcrypt.hash(newAvocat.password, 16)

    await newAvocat
        .save()
        .then(res.json('ok'))
        .then(async () => {
            const user = await AvocatModel.findOne({email: req.body.user.email})
            await AvocatModel.findByIdAndUpdate(user._id, {uuid: uuidv4()})
            const user2 = await AvocatModel.findOne({email: req.body.user.email})
            let link = await `http://localhost:3030/confirmation/${user2.uuid}`

            // setup email data with unicode symbols
            let mailOptions = {
                from: 'tester@gmail.com', // sender address
                to: `${req.body.user.email}`, // list of receivers
                subject: 'Confirmez votre adresse mail', // Subject line
                text: `Maître,
    
                Afin de validez votre inscription sur LITTA, merci de cliquer sur le lien suivant :
                
                ${link}
                
                Merci,
                
                L’équipe de LITTA`
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            })
        })
        .catch(next)

        // const mail =
})

// Mail Confirm Get
router.get('/confirmation/:uuid', async (req, res) => {

  console.log(req.params.uuid)
  const query = await { uuid: `${req.params.uuid}` }
  await AvocatModel.findOneAndUpdate(query, { activated: true })
  res.json('testing')
})

// POST Login Student

router.post('/loginStudent', async(req, res, next) => {
    const user = await StudentModel.findOne({email: req.body.creds.email})
    const isEqual = await bcrypt.compare(req.body.creds.password, user.password)
    if (isEqual === true) {
        const token = jwt.sign({
            id: user._id,
            username: user.email
        }, jwtSecret)
        res.json({token})
    } else {
        return next(Error('error'))
    }
})

// POST Login avocat

router.post('/login', async(req, res, next) => {
    const user = await AvocatModel.findOne({email: req.body.creds.email})
    console.log(user)
    if (user === null) {
        return res.json('error')
    }
    const isEqual = await bcrypt.compare(req.body.creds.password, user.password)
    if (isEqual) {
        const token = jwt.sign({
            id: user._id,
            username: user.email
        }, jwtSecret)
        res.json({token})
    } else {
        res.json('auth failed')
        return next(Error('Wrong Password'))
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

// POST to get info avocat

router.post('/infolawyer', async(req, res, next) => {
    console.log(req.body.decoded.id)
    const user = await AvocatModel.findOne({_id: req.body.decoded.id})
    console.log(user)
    res.json(user)
})

// EDIT LAWYER INFO
router.put('/infolawyer', async(req, res, next) => {
    const update = req.body.user

    update.password = await bcrypt.hash(update.password, 16)

    AvocatModel.findByIdAndUpdate({
        _id: update.id
    }, {$set: update}).then((lawyer) => res.json(lawyer)).catch(next)
})

// Create mission
router.post('/missions', function (req, res, next) {
    const newMission = new MissionModel(req.body.mission)

    newMission
        .save()
        .then(doc => res.json('ok'))
        .catch(next)
})

// Read missions
router.get('/missions', (req, res, next) => {
    MissionModel
        .find()
        .then(missions => res.json(missions.filter(mission => mission.finished === false)))
        .catch(next)
})

// POST Upload file
router.post('/missions/:missionId', upload.single('selectedFile'), (req, res) => {
    /*
    We now have a new req.file object here. At this point the file has been saved
    and the req.file.filename value will be the name returned by the
    filename() function defined in the diskStorage configuration. Other form fields
    are available here in req.body.
  */
    res.send()
})

// GET ONE CURRENT MISSION
router.get('/missions/:missionId', (req, res, next) => {
    MissionModel
        .findById(req.params.missionId)
        .then(mission => res.json(mission))
        .catch(next)
})

// EDIT ONE MISSION
router.put('/missions/:missionId', (req, res, next) => {
    const update = req.body

    MissionModel
        .findByIdAndUpdate(req.params.missionId, {$set: update})
        .then((mission) => res.json(mission))
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
router.get('/oldmissions', (req, res, next) => {
    MissionModel
        .find()
        .then(missions => res.json(missions.filter(mission => mission.finished === true)))
        .catch(next)
})

module.exports = router
