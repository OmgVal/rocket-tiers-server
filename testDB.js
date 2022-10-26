const db = require('./models')

db.Admin.findOneAndDelete({
    username: 'admin',
    password: 'admin'
})

.then( newuser => {
    console.log(newuser)
})

