const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.NODEMAILER_USER || 'vbkawgch3kkkhqax@ethereal.email',
    pass: process.env.NODEMAILER_PASS || 'bVWMcjVnQenkaJsGz4'
  }
})

const htmlLayout = content => `
  <style>
    a {text-decoration: none; color: #7accbc;}
    a:hover {color: #1fa792;}
    button {width: 140px; height: 30px; background-color: #7accbc; color: white; border: none; padding: 7px; text-transform: uppercase; font-size: 10px; cursor: pointer;}
    button:hover {background-color: #1fa792; padding: 7px; font-weight: bold;}
    img {height: 70px; width: auto;}
    table {border: none; font-size: 12px; color: #7accbc;}
    span {font-weight: bold; color: #1fa792;}
  </style>
  ${content}
  <p>Merci,<br />L’équipe de LITTA</p>
  <table>
    <tr>
      <td rowspan="2" style="padding-right: 10px;"><img src="cid:logo" /></td>
    </tr>
    <tr>
      <td style="border-left: solid 1px; padding-left: 8px;"><span>LITTA</span><br /><a href="mailto:contact@litta.fr">contact@litta.fr</a><br /><a href="litta.fr">litta.fr</a><br />&copy; Legal Intern to Take Away</td>
    </tr>
  </table>
`

const baseAttachements = [
  {
    filename: 'logo.png',
    path: __dirname + '/img/logo.png',
    cid: 'logo' // same cid value as in the html img src
  }
]

const STUDENT_MISSION_WITH_LINK_PROPOSAL = (mission, link) => ({
  subject: 'Proposition de mission',
  text: `
    Bonjour,

    Une nouvelle mission est disponible en ${mission.field}
    La description de la mission est la suivante:
    ${mission.description}

    ${link}
    Merci,

    L’équipe de LITTA
  `,
  html: htmlLayout(`
    <p>Bonjour,</p>
    <p>Une nouvelle mission est disponible en ${mission.field}</p>
    <p>La description de la mission est la suivante :<br />${mission.description}</p>
    <a href="${link}" target="_blank">
      <button>Accepter la mission</button>
    </a>
  `)
})

const ADMIN_CONFIRMATION_NEW_MISSION = (mission) => ({
  subject: `Mission n°${String(mission._id).slice(-5)} / Nouvelle mission déposée`,
  text: `
    Admin,

    Numéro de mission unique : ${String(mission._id).slice(-5)}
    Echéance : ${new Date(mission.deadline).toLocaleString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
    Nom du cabinet : ${mission.name}
    Nom de l’avocat : ${mission.author}
    Prix : ${mission.price}
    Domaine du droit : ${mission.field}
    Contenu : ${mission.description}
  `,
  html: htmlLayout(`
    <p>Admin,</p>
    <p>Numéro de mission unique : ${String(mission._id).slice(-5)}
    <br/>
    Echéance : ${new Date(mission.deadline).toLocaleString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
    <br/>
    Nom du cabinet : ${mission.name}
    <br/>
    Nom de l’avocat : ${mission.author}
    <br/>
    Prix : ${mission.price}
    <br/>
    Domaine du droit : ${mission.field}
    <br/>
    Contenu : ${mission.description}</p>
  `)
})

const send = (options) => {
  const mailOptions = {
    from: 'tester@gmail.com',
    attachments: [ ...baseAttachements, ...(options.attachments || []) ],
    ...options,
  }

  return transporter.sendMail(mailOptions)
    .then(info => {
      console.log('Message sent: %s', info.messageId)
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)) // Preview only available when sending through an Ethereal account
    })
    .catch(console.error)
}

module.exports = {
  templates: {
    STUDENT_MISSION_WITH_LINK_PROPOSAL,
    ADMIN_CONFIRMATION_NEW_MISSION,
  },
  send,
}
