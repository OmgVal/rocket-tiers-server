const router = require('express').Router()
const db = require('../../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authLockedRoute = require('./authLockedRoute')

const { cloudinary } = require('../../utils/cloudinary')
const multer = require('multer')
const { unlinkSync } = require('fs')
const uploads = multer({ dest: 'uploads/' })


router.get('/', async (req, res) => {
  const allAdmins = await db.Admin.find({})
  res.json(allAdmins)
})

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

router.post('/login', async (req, res) => {
  try {
    // try to find user in the db
    const foundAdmin = await db.Admin.findOne({
      username: req.body.username
    })

    const noLoginMessage = 'Incorrect username or password'
    // console.log('foundadmin:', foundAdmin)

    // if the user is not found in the db, return and sent a status of 400 with a message
    if(!foundAdmin) return res.status(400).json({ msg: noLoginMessage})
    
    // check the password from the req body against the password in the database
    const matchPasswords = await bcrypt.compare(req.body.password, foundAdmin.password)
    
    // if provided password does not match, return an send a status of 400 with a message
    if(!matchPasswords) return res.status(400).json({ msg: noLoginMessage})

    // create jwt payload
    const payload = {
      username: foundAdmin.username, 
      id: foundAdmin.id
    }

    // sign jwt and send back
    const token = await jwt.sign(payload, process.env.JWT_SECRET)

    res.json({ token })
  } catch(error) {
    console.log(error)
    res.status(500).json({ msg: 'server error'  })
  }
})


// GET /auth-locked - will redirect if bad jwt token is found
router.get('/:username', authLockedRoute, async (req, res) => {
  // you will have access to the user on the res.local.user
  try {
    const profile = await db.Admin.findOne({
      username: req.params.username
    }).populate('tournaments')

    res.json(profile)
    
  } catch(err) {
    console.log(err)
    res.status(500).json({ msg: 'server error'  })
  }
})


// Update a user's profile
router.put('/:username/edit', async (req, res) => {
  try {
    // console.log(req.body)
    const options = {new: true} 
    const updatedUser = await db.Admin.findOneAndUpdate({ username: req.params.username}, req.body, options)
    res.json(updatedUser)
    // console.log(updatedUser)
  }catch(err) {
    console.warn(err)
    res.status(500).json({ msg: 'server error'  })
  }
})
// update a user's profile photo
router.put('/:username/photo', uploads.single('image'), async (req, res) => {
  try {
    // console.log(req.body, req.file)
    const uploadedResponse = await cloudinary.uploader.upload(req.file.path)
    const options = {new: true} 
    const updatedUser = await db.Admin.findByIdAndUpdate(req.body.adminId, {image: uploadedResponse.url}, options)
    res.json(updatedUser)
    unlinkSync(req.file.path)
    
  }catch(err) {
    console.warn(err)
    res.status(500).json({ msg: 'server error'  })
  }
})
// delete a profile
router.delete('/:username', authLockedRoute, async (req, res) => {
  try {
    await db.Admin.findByIdAndDelete(res.locals.admin.id)
    res.sendStatus(204)
    
  }catch(err) {
    console.warn(err)
    res.status(500).json({ msg: 'server error'  })
  }
})

  module.exports = router