// require packages
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rowdy = require('rowdy-logger')

// config express app
const app = express()
const PORT = process.env.PORT || 3001 
// for debug logging 
const rowdyResults = rowdy.begin(app)
// cross origin resource sharing 
app.use(cors())
// request body parsing
app.use(express.urlencoded({ limit: "50mb", extended: false })) // optional 
app.use(express.json({ limit: "50mb" }))


// GET / -- test index route
app.get('/', (req, res) => {
  res.json({ msg: 'hello backend 🤖' })
})

// controllers
app.use('/api-v1/users', require('./controllers/api-v1/users.js'))
app.use('/api-v1/tournaments', require('./controllers/api-v1/tournaments'))
app.use('/api-v1/admins', require('./controllers/api-v1/admins'))

// hey listen
app.listen(PORT, () => {
  rowdyResults.print()
  console.log(`is that port ${PORT} I hear? 🙉`)
})

