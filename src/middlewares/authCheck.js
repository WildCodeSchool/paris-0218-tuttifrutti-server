// const jwt = require('jsonwebtoken')
// const jwtSecret = 'MAKEITUNUVERSAL'

// module.exports = (req, res, next) => {
//     console.log('decoding')
//     const token = req.headers.authorization
//         .split(" ")[1]
//     jwt.verify(token, jwtSecret, function (err, decoded) {
//         if (err) {
//             console.log('error')
//             res.redirect('http:///localhost:3000/login')
//         } else {
//             res.json('logged')
//         }

//     })
// }