const express = require('express')
const router = express.Router()
const AvocatModel = require('../models/avocat.js')
const MissionModel = require('../models/mission.js')
const StudentModel = require('../models/student.js')
const AdminModel = require('../models/admin.js')
const bcrypt = require('bcrypt-promise')
const jwt = require('jsonwebtoken')
const jwtSecret = 'MAKEITUNUVERSAL'
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
const multer = require('multer')
// const uuidv4 = require('uuid/v4')
// const path = require('path')

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
		console.log('fail')
		res.send({ result: 'fail', error: { code: 1001, message: 'File is too big' } }
		)
		return
	}
	next(err)
})

// POST Registration Admin

router.post('/signupadmin', async (req, res, next) => {

	const newAdmin = await new AdminModel(req.body.user)
	newAdmin.password = await bcrypt.hash(newAdmin.password, 16)

	await newAdmin
		.save()
		.then(res.json('ok'))
		.then(async () => {
			const user = await AdminModel.findOne({ email: req.body.user.email })
			console.log(user._id)
			// await AdminModel.findByIdAndUpdate(user._id, {uuid: uuidv4()}) const user2 =
			// await AdminModel.findOne({email: req.body.user.email})
			let link = await `http://localhost:3000/confirmationadmin/${user._id}` // attention backend a changer -Dan
			console.log(link)
			// setup email data with unicode symbols
			let mailOptions = {
				from: 'tester@gmail.com', // sender address
				to: `${req.body.user.email}`, // list of receivers
				subject: 'Confirmez votre adresse mail', // Subject line
				text: `Admin,

                      Afin de validez votre compte administrateur, merci de cliquer sur le lien suivant :

                      ${link}

                      Merci,

                      L’équipe de LITTA`,
				html: `<style>
                    a {text-decoration: none; color: #7accbc;}
                    a:hover {color: #1fa792;}
                    button {width: 140px; height: 30px; background-color: #7accbc; color: white; border: none; padding: 7px; text-transform: uppercase; font-size: 10px; cursor: pointer;}
                    button:hover {background-color: #1fa792; padding: 7px; font-weight: bold;}
                    img {height: 70px; width: auto;}
                    table {border: none; font-size: 12px; color: #7accbc;}
                    span {font-weight: bold; color: #1fa792;}
                  </style>
                  <p>Admin,</p>
                  <p>Afin de validez votre compte administrateur, merci de cliquer sur le lien suivant :</p>
                  <a href="${link}" target="_blank">
                    <button>Valider l'inscription</button>
                  </a>
                  <p>Merci,<br />L’équipe de LITTA</p>
                  <table>
                    <tr>
                      <td rowspan="2" style="padding-right: 10px;"><img src="cid:logo" /></td>
                    </tr>
                    <tr>
                      <td style="border-left: solid 1px; padding-left: 8px;"><span>LITTA</span><br /><a href="mailto:contact@litta.fr">contact@litta.fr</a><br /><a href="litta.fr">litta.fr</a><br />&copy; Legal Intern to Take Away</td>
                    </tr>
                  </table>`,
				attachments: [{
					filename: 'logo.png',
					path: __dirname + '/img/logo.png',
					cid: 'logo' // same cid value as in the html img src
				}]
			}

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
})

// POST Registration Student

router.post('/regstudent', async (req, res, next) => {
	const newStudent = await new StudentModel(req.body.user)
	newStudent.password = await bcrypt.hash(newStudent.password, 16)


	await newStudent
		.save()
		.then(res.json('ok'))
		.then(async () => {
			const user = await StudentModel.findOne({ email: req.body.user.email })
			let link = await `http://localhost:3000/confirmationstudent/${user._id}`


			// setup email data with unicode symbols
			let mailOptions = {
				from: 'tester@gmail.com', // sender address
				to: `${req.body.user.email}`, // list of receivers
				subject: 'Confirmez votre adresse mail', // Subject line
				text: `Cheres Etudiant,

                Afin de validez votre inscription sur LITTA en attendant la validation d'un administrateur, merci de cliquer sur le lien suivant :

                ${link}

                Merci,

                L’équipe de LITTA`,
				html: `<style>
            a {text-decoration: none; color: #7accbc;}
            a:hover {color: #1fa792;}
            button {width: 140px; height: 30px; background-color: #7accbc; color: white; border: none; padding: 7px; text-transform: uppercase; font-size: 10px; cursor: pointer;}
            button:hover {background-color: #1fa792; padding: 7px; font-weight: bold;}
            img {height: 70px; width: auto;}
            table {border: none; font-size: 12px; color: #7accbc;}
            span {font-weight: bold; color: #1fa792;}
          </style>
          <p><Cheres Etudiant,/p>
          <p>Afin de validez votre inscription sur LITTA en attendant la validation d'un administrateur, merci de cliquer sur le lien suivant :</p>
          <a href="${link}" target="_blank">
            <button>Valider l'inscription</button>
          </a>
          <p>Merci,<br />L’équipe de LITTA</p>
          <table>
            <tr>
              <td rowspan="2" style="padding-right: 10px;"><img src="cid:logo" /></td>
            </tr>
            <tr>
              <td style="border-left: solid 1px; padding-left: 8px;"><span>LITTA</span><br /><a href="mailto:contact@litta.fr">contact@litta.fr</a><br /><a href="litta.fr">litta.fr</a><br />&copy; Legal Intern to Take Away</td>
            </tr>
          </table>`,
				attachments: [{
					filename: 'logo.png',
					path: __dirname + '/img/logo.png',
					cid: 'logo' // same cid value as in the html img src
				}]
			}

			// send mail with defined transport object
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					return console.log(error)
				}
				console.log('Message sent: %s', info.messageId)
				// Preview only available when sending through an Ethereal account
				console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
			})
		})
		.catch(next)
})
// POST Registration Avocat


router.post('/reg', async (req, res, next) => {

	const newAvocat = await new AvocatModel(req.body.user)
	newAvocat.password = await bcrypt.hash(newAvocat.password, 16)

	await newAvocat
		.save()
		.then(res.json('ok'))
		.then(async () => {
			const user = await AvocatModel.findOne({ email: req.body.user.email })
			// await AvocatModel.findByIdAndUpdate(user._id, {uuid: uuidv4()}) const user2 =
			// await AvocatModel.findOne({email: req.body.user.email})
			let link = await `http://localhost:3000/confirmationlawyer/${user._id}` // attention backend a changer -Dan

			// setup email data with unicode symbols
			let mailOptions = {
				from: 'tester@gmail.com', // sender address
				to: `${req.body.user.email}`, // list of receivers
				subject: 'Confirmez votre adresse mail', // Subject line
				text: `Maître,

                Afin de validez votre inscription sur LITTA, merci de cliquer sur le lien suivant :

                ${link}

                Merci,

                L’équipe de LITTA`,
				html: `<style>
            a {text-decoration: none; color: #7accbc;}
            a:hover {color: #1fa792;}
            button {width: 140px; height: 30px; background-color: #7accbc; color: white; border: none; padding: 7px; text-transform: uppercase; font-size: 10px; cursor: pointer;}
            button:hover {background-color: #1fa792; padding: 7px; font-weight: bold;}
            img {height: 70px; width: auto;}
            table {border: none; font-size: 12px; color: #7accbc;}
             span {font-weight: bold; color: #1fa792;}
          </style>
          <p>Maître,</p>
          <p>Afin de validez votre inscription sur LITTA, merci de cliquer sur le lien suivant :</p>
          <a href="${link}" target="_blank">
            <button>Valider l'inscription</button>
          </a>
          <p>Merci,<br />L’équipe de LITTA</p>
          <table>
            <tr>
              <td rowspan="2" style="padding-right: 10px;"><img src="cid:logo" /></td>
            </tr>
            <tr>
              <td style="border-left: solid 1px; padding-left: 8px;"><span>LITTA</span><br /><a href="mailto:contact@litta.fr">contact@litta.fr</a><br /><a href="litta.fr">litta.fr</a><br />&copy; Legal Intern to Take Away</td>
            </tr>
          </table>`,
				attachments: [{
					filename: 'logo.png',
					path: __dirname + '/img/logo.png',
					cid: 'logo' // same cid value as in the html img src
				}]
			}

			// send mail with defined transport object
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					return console.log(error)
				}
				console.log('Message sent: %s', info.messageId)
				// Preview only available when sending through an Ethereal account
				console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
			})
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
// 	}
// 	if (user.activated === false) {
// 		return res.json('not verified')
// 	} else {
// 		const isEqual = await bcrypt.compare(req.body.creds.password, user.password)
// 		if (isEqual) {
// 			const token = jwt.sign({
// 				id: user._id,
// 				username: user.email
// 			}, jwtSecret)
// 			return res.json({token})
// 		} else {
// 			return res.json('auth failed')
// 		}
// 	}
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

// Create mission
router.post('/missions', function (req, res, next) {
	const newMission = new MissionModel(req.body.mission)
	console.log(req.body.mission)
	newMission
		.save()
		.then(() => res.json(newMission))
		.then(() => {
			console.log('trigger')
			StudentModel
				.find()
				.then(async students => {
					let emails = []
					let ids = []
					const studentList = students.filter(students => students.field === req.body.mission.field)
					for (let key in studentList) {
						if (studentList.hasOwnProperty(key)) {
							emails.push(studentList[key].email)
							ids.push(studentList[key]._id)
						}
					}
					console.log(`Number of potential students: ${emails.length}`)
					for (let i = 0; i < emails.length; i++) {
						let link = `http://localhost:3000/accept/${newMission._id}/${ids[i]}`
						// setup email data with unicode symbols
						let mailOptions = {
							from: 'tester@gmail.com', // sender address
							to: `${emails[i]}`, // list of receivers
							subject: 'Proposition de mission', // Subject line
							text: `Bonjour,

                Une nouvelle mission est disponible en ${req.body.mission.field}
                La description de la mission est la suivante:
                ${req.body.mission.description}


                //insérer un bouton//
                ${link}
                Merci,

                L’équipe de LITTA`,
							html: ` <style>
                a {text-decoration: none; color: #7accbc;}
                a:hover {color: #1fa792;}
                button {width: 140px; height: 30px; background-color: #7accbc; color: white; border: none; padding: 7px; text-transform: uppercase; font-size: 10px; cursor: pointer;}
                button:hover {background-color: #1fa792; padding: 7px; font-weight: bold;}
                img {height: 70px; width: auto;}
                table {border: none; font-size: 12px; color: #7accbc;}
                span {font-weight: bold; color: #1fa792;}
                </style>
                <p>Bonjour,</p>
                <p>Une nouvelle mission est disponible en ${req.body.mission.field}</p>
                <p>La description de la mission est la suivante :<br />${req.body.mission.description}</p>
                <a href="${link}" target="_blank">
                  <button>Accepter la mission</button>
                </a>
                <p>Merci,<br />L’équipe de LITTA</p>
                <table>
                  <tr>
                    <td rowspan="2" style="padding-right: 10px;"><img src="cid:logo" /></td>
                  </tr>
                  <tr>
                    <td style="border-left: solid 1px; padding-left: 8px;"><span>LITTA</span><br /><a href="mailto:contact@litta.fr">contact@litta.fr</a><br /><a href="litta.fr">litta.fr</a><br />&copy; Legal Intern to Take Away</td>
                  </tr>
                </table>`,
							attachments: [{
								filename: 'logo.png',
								path: __dirname + '/img/logo.png',
								cid: 'logo' // same cid value as in the html img src
							}]
						}

						// send mail with defined transport object
						transporter.sendMail(mailOptions, (error, info) => {
							if (error) {
								return console.log(error)
							}
							console.log('Message sent: %s', info.messageId)
							// Preview only available when sending through an Ethereal account
							console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
						})
					}
				})
				.catch(next)
		})
	// .then(() => {
	// 	let mailOptions = {
	// 		from: 'tester@gmail.com', // sender address
	// 		to: 'admin@litta.fr', // list of receivers
	// 		subject: `Mission n°${newMission._id.slice(-5)} / Nouvelle mission déposée`, // Subject line
	// 		text: `Admin,

	// 		Numéro de mission unique : ${newMission._id.slice(-5)}
	// 		Echéance : ${new Date(newMission.deadline).toLocaleString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
	// 		Nom du cabinet : ${newMission.name}
	// 		Nom de l’avocat : ${newMission.author}
	// 		Prix : ${newMission.price}
	// 		Domaine du droit : ${newMission.field}
	// 		Contenu : ${newMission.description}
	// 						`,
	// 		html: `<style>
	// 				a {text-decoration: none; color: #7accbc;}
	// 				a:hover {color: #1fa792;}
	// 				button {width: 140px; height: 30px; background-color: #7accbc; color: white; border: none; padding: 7px; text-transform: uppercase; font-size: 10px; cursor: pointer;}
	// 				button:hover {background-color: #1fa792; padding: 7px; font-weight: bold;}
	// 				img {height: 70px; width: auto;}
	// 				table {border: none; font-size: 12px; color: #7accbc;}
	// 				span {font-weight: bold; color: #1fa792;}
	// 			</style>
	// 			<p>Admin,</p>
	// 			<p>Numéro de mission unique : ${newMission._id.slice(-5)}
	// 			<br/>
	// 			Echéance : ${new Date(newMission.deadline).toLocaleString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
	// 			<br/>
	// 			Nom du cabinet : ${newMission.cabinet}
	// 			<br/>
	// 			Nom de l’avocat : ${newMission.author}
	// 			<br/>
	// 			Prix : ${newMission.price}
	// 			<br/>
	// 			Domaine du droit : ${newMission.field}
	// 			<br/>
	// 			Contenu : ${newMission.description}</p>
	// 			<table>
	// 				<tr>
	// 					<td rowspan="2" style="padding-right: 10px;"><img src="cid:logo" /></td>
	// 				</tr>
	// 				<tr>
	// 					<td style="border-left: solid 1px; padding-left: 8px;"><span>LITTA</span><br /><a href="mailto:contact@litta.fr">contact@litta.fr</a><br /><a href="litta.fr">litta.fr</a><br />&copy; Legal Intern to Take Away</td>
	// 				</tr>
	// 			</table>`,
	// 		attachments: [{
	// 			filename: 'logo.png',
	// 			path: __dirname + '/img/logo.png',
	// 			cid: 'logo' // same cid value as in the html img src
	// 		}]
	// 	}

	// 	// send mail with defined transport object
	// 	transporter.sendMail(mailOptions, (error, info) => {
	// 		if (error) {
	// 			return console.log(error)
	// 		}
	// 		console.log('Message sent: %s', info.messageId)
	// 		// Preview only available when sending through an Ethereal account
	// 		console.log('Preview URL admin: %s', nodemailer.getTestMessageUrl(info))
	// 	})
	// })
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
	await StudentModel.findOne({ _id: req.body.messageContent.studentId })
		.then(student => {
			let mailOptions = {
				from: 'tester@gmail.com', // sender address
				to: 'admin@litta.fr', // list of receivers
				subject: `Mission n°${missionId} / Message pour l'étudiant`, // Subject line
				text: `Admin,

								Pour la mission n°${missionId}, le cabinet ${messageContent.author} souhaite envoyer le message ci-dessous à :
								${student.firstName} ${student.lastName}
								${student.email}

								Objet :
								${messageContent.objet}

								Message :
								${messageContent.message}
								`,
				html: `<style>
						a {text-decoration: none; color: #7accbc;}
						a:hover {color: #1fa792;}
						button {width: 140px; height: 30px; background-color: #7accbc; color: white; border: none; padding: 7px; text-transform: uppercase; font-size: 10px; cursor: pointer;}
						button:hover {background-color: #1fa792; padding: 7px; font-weight: bold;}
						img {height: 70px; width: auto;}
						table {border: none; font-size: 12px; color: #7accbc;}
						span {font-weight: bold; color: #1fa792;}
					</style>
					<p>Admin,</p>
					<p>Pour la mission n°${missionId}, le cabinet ${messageContent.author} souhaite envoyer le message ci-dessous à :
					<br>
					<br/>
					${student.firstName} ${student.lastName}
					<br/>
					${student.email}
					<br/>
					<br/>
					Objet :
					<br/>${messageContent.objet}
					<br/>
					<br />
					Message :
					<br />
					${messageContent.message}</p>
					<table>
						<tr>
							<td rowspan="2" style="padding-right: 10px;"><img src="cid:logo" /></td>
						</tr>
						<tr>
							<td style="border-left: solid 1px; padding-left: 8px;"><span>LITTA</span><br /><a href="mailto:contact@litta.fr">contact@litta.fr</a><br /><a href="litta.fr">litta.fr</a><br />&copy; Legal Intern to Take Away</td>
						</tr>
					</table>`,
				attachments: [{
					filename: 'logo.png',
					path: __dirname + '/img/logo.png',
					cid: 'logo' // same cid value as in the html img src
				}]
			}

			// send mail with defined transport object
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					return console.log(error)
				}
				console.log('Message sent: %s', info.messageId)
				// Preview only available when sending through an Ethereal account
				console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
			})
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
			// return res.json(oldmissions)
)
		.then(oldmissions => res.json(oldmissions))
		.catch(next)
})

// REPORT PROBLEM TO ADMIN
router.post('/missions/:missionId/reportproblem', async (req, res, next) => {
	const messageContent = req.body.messageContent
	const missionId = messageContent.missionId.slice(-5)
	await StudentModel.findOne({ _id: req.body.messageContent.studentId })
		.then(student => {
			let mailOptions = {
				from: 'tester@gmail.com', // sender address
				to: 'admin@litta.fr', // list of receivers
				subject: `Mission n°${missionId} / Report de problème`, // Subject line
				text: `Admin,

								Pour la mission n°${missionId}, le cabinet ${messageContent.author} souhaite reporter un problème rencontré durant sa collaboration avec :
								${student.firstName} ${student.lastName}

								Nature du problème :
								${messageContent.problem}

								Description :
								${messageContent.description}
								`,
				html: `<style>
						a {text-decoration: none; color: #7accbc;}
						a:hover {color: #1fa792;}
						button {width: 140px; height: 30px; background-color: #7accbc; color: white; border: none; padding: 7px; text-transform: uppercase; font-size: 10px; cursor: pointer;}
						button:hover {background-color: #1fa792; padding: 7px; font-weight: bold;}
						img {height: 70px; width: auto;}
						table {border: none; font-size: 12px; color: #7accbc;}
						span {font-weight: bold; color: #1fa792;}
					</style>
					<p>Admin,</p>
					<p>Pour la mission n°${missionId}, le cabinet ${messageContent.author} souhaite reporter un problème rencontré durant sa collaboration avec :
					<br>
					<br/>
					${student.firstName} ${student.lastName}
					<br/>
					<br/>
					Nature du problème :
					<br/>${messageContent.problem}
					<br/>
					<br />
					Description :
					<br />
					${messageContent.description}</p>
					<table>
						<tr>
							<td rowspan="2" style="padding-right: 10px;"><img src="cid:logo" /></td>
						</tr>
						<tr>
							<td style="border-left: solid 1px; padding-left: 8px;"><span>LITTA</span><br /><a href="mailto:contact@litta.fr">contact@litta.fr</a><br /><a href="litta.fr">litta.fr</a><br />&copy; Legal Intern to Take Away</td>
						</tr>
					</table>`,
				attachments: [{
					filename: 'logo.png',
					path: __dirname + '/img/logo.png',
					cid: 'logo' // same cid value as in the html img src
				}]
			}

			// send mail with defined transport object
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					return console.log(error)
				}
				console.log('Message sent: %s', info.messageId)
				// Preview only available when sending through an Ethereal account
				console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
			})
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
// 		console.log(req.body)
// 		console.log(req.body.user.email)
// 		const query = await {uuid: `${req.params.uuid}`}
// 		console.log(query)
// 		await StudentModel.findOneAndUpdate(query, {activated: true})
// 		res.json('testing');
// })

module.exports = router
