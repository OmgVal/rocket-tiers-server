const db = require('./models')


// db.Tournament.findand({
//     content: 'admin',
//     admin: ObjectId('6359a65d7b985bee1a7ac2ba')
// })
//     .then(admin => {
//         console.log(admin)
//     })



  // // hash password
  // const password = 'admin1'
  // const saltRounds = 12;
  // const hashedPassword = bcrypt.hash(password, saltRounds)

  // create new user
  db.Admin.create({
    username: 'admin',
    password: 'admin1',

  })

  .then(admin => {
      console.log(admin)
  })