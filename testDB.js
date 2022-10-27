const db = require('./models')

db.Tournament.find({
    content: 'admin',
    admin: ObjectId('6359a65d7b985bee1a7ac2ba')
})
    .then(admin => {
        console.log(admin)
    })



