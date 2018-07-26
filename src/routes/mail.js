const studentPropositionMail = (mission, link) => ({
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
  html: `
    <style>
      a {text-decoration: none; color: #7accbc;}
      a:hover {color: #1fa792;}
      button {width: 140px; height: 30px; background-color: #7accbc; color: white; border: none; padding: 7px; text-transform: uppercase; font-size: 10px; cursor: pointer;}
      button:hover {background-color: #1fa792; padding: 7px; font-weight: bold;}
      img {height: 70px; width: auto;}
      table {border: none; font-size: 12px; color: #7accbc;}
      span {font-weight: bold; color: #1fa792;}
    </style>
    <p>Bonjour,</p>
    <p>Une nouvelle mission est disponible en ${mission.field}</p>
    <p>La description de la mission est la suivante :<br />${mission.description}</p>
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
    </table>
  `,
  attachments: [
    {
      filename: 'logo.png',
      path: __dirname + '/img/logo.png',
      cid: 'logo' // same cid value as in the html img src
    }
  ]
})

const send = (options) => {
  let mailOptions = {
    from: 'tester@gmail.com',
    ...options,
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    }
    console.log('Message sent: %s', info.messageId)
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
  })
}

module.exports = {
  studentPropositionMail,
  send,
}
