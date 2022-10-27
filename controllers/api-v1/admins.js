const router = require('express').Router()
const db = require('../../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authLockedRoute = require('./authLockedRoute')

const { cloudinary } = require('../../utils/cloudinary')
const multer = require('multer')
const { unlinkSync } = require('fs')
const uploads = multer({ dest: 'uploads/' })


router.post('/register', uploads.single('image'), async (req, res) => {
    try {
      // check if user exists already
      const findUsername = await db.Admin.findOne({
        username: req.body.username
      })
      
      // // check the password from the req body against the password in the database
      // const matchPasswords = await process.env.compare(req.body.password, foundUser.password)
      
      // // if provided password does not match, return an send a status of 400 with a message
      // if(!matchPasswords) return res.status(400).json({ msg: noLoginMessage})
      
      // don't allow emails to register twice
      if(findUsername) return res.status(400).json({ msg: 'username exists already' })
      // user must supply admin key
      console.log(process.env.ADMIN_SECRET, req.body.adminkey)
      if (process.env.ADMIN_SECRET != req.body.adminkey) return res.status(400).json({msg: 'why no admin?'})

      // hash password
      const password = req.body.password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds)
    
      // create new user
      const newUser = new db.Admin({
        username: req.body.username,
        password: hashedPassword,
      })
    
      await newUser.save()
  
      if (req.file) {
        // upload profile photo
        // console.log(req.body, req.file)
        const uploadedResponse = await cloudinary.uploader.upload(req.file.path)
        // console.log(uploadedResponse)
        // create jwt payload
        newUser.image = uploadedResponse.url
        await newUser.save()
  
        unlinkSync(req.file.path)
      }
  
      // create jwt payload
      const payload = {
        username: newUser.username,
        id: newUser.id
      }
  
      // sign jwt and send back
      const token = await jwt.sign(payload, process.env.JWT_SECRET)
  
      res.json({ token })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'server error'  })
    }
  })

  module.exports = router