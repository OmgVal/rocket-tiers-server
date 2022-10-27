const router = require('express').Router()
const db = require('../../models')

const { cloudinary } = require('../../utils/cloudinary')
const multer = require('multer')
const { unlinkSync } = require('fs')
const uploads = multer({ dest: 'uploads/' })

// GET /tournaments - test endpoint
router.get('/', async (req, res) => {
    try { 
        const allTourn = await db.Tournament.find().sort({"created_at": 1})
        res.json(allTourn)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'server error'  })
    }
})


// New tournament
router.post('/', uploads.single('image'), async (req, res) => {
    try {
      // find the user
      const admin = await db.Admin.findById(req.body.adminId)
    //   console.log(req.body, req.file)
      const uploadedResponse = await cloudinary.uploader.upload(req.file.path)
    //   console.log(uploadedResponse)
  
      const newTour = await db.Tournament.create({
          content: req.body.content,
          admin: admin.id,
          url: req.body.url,
          photo: uploadedResponse.url     
      })

      admin.tournaments.push(newTour.id)
      await admin.save()
      res.status(201).json(newTour)
      unlinkSync(req.file.path)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'server error'  })
    }
  })

// GET Tournament by id
router.get('/:id', async (req, res) => {
    try {
        const Tournament = await db.Tournament.findById(req.params.id).populate({path:'comments', populate: {path: 'user'}}).populate('submissions').populate({path:'roster', populate: {path: 'user'}})
        res.json(Tournament)
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})

// Update Tournament
router.put('/:id', async (req, res) => {
    try {
        const options = {new: true}
        const updatedTour = await db.Tournament.findByIdAndUpdate(req.params.id, req.body, options)
        res.json(updatedTour)
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})

// Delete Tournament
router.delete('/:id', async (req, res) => {
    try {
        tournament = await db.Tournament.findById(req.params.id)
        const adminid = tournament.admin
        const foundAdmin = await db.Admin.findById(adminid)
        foundAdmin.posts.splice(foundAdmin.tournaments.indexOf(req.params.id),1)
        await foundAdmin.save()
        await db.Tournament.findByIdAndDelete(req.params.id)
        res.sendStatus(204)
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})

// submission
router.post('/:id/submission', async (req, res) => {
    try {
        const user = await db.User.findById(req.body.userId)
        const newSub = { teamsize: req.body.teamsize, othermember: req.body.othermember, user: user}
        const tour = await db.Tournament.findById(req.params.id).populate('user')
        tour.submissions = [newSub, ...tour.submissions]
        await tour.save()
  
        res.status(201).json(newSub)
      } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'server error'  })
      }
})

// Update a submission
router.put('/:id/submissions/:subid', async (req, res) => {
    try {
        const tournament = await db.Tournament.findById(req.params.id)
        const index = tournament.submissions.findIndex((sub) => {return sub.id === req.params.subid})
        tournament.submissions[index] = {id: tournament.submissions[index].id, user: tournament.submissions[index].user, content: req.body.content}
        await tournament.save()
        res.json(tournament.submissions[index])
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})
// delete submission
router.delete('/:id/submission/:subid', async (req, res) => {
    try {
        const tournament = await db.Tournament.findById(req.params.id).populate({path:'submissions'})
        const index = tournament.comments.findIndex((comment) => {return comment.id === req.params.commentid})
        tournament.comments.splice(index, 1)
        await tournament.save()
        res.json(tournament)
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})



// // Add a comment
router.post('/:id/comments', async (req, res) => {
    try {
      const admin = await db.admin.findById(req.body.adminId)
      const newComment = {content: req.body.content, user: user}
      const post = await db.Post.findById(req.params.id).populate('user')
      post.comments = [newComment, ...post.comments]
      await post.save()

      res.status(201).json(newComment)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'server error'  })
    }
})

// Update a specific comment
router.put('/:id/comments/:commentid', async (req, res) => {
    try {
        const post = await db.Post.findById(req.params.id)
        const index = post.comments.findIndex((comment) => {return comment.id === req.params.commentid})
        post.comments[index] = {id: post.comments[index].id, user: post.comments[index].user, content: req.body.content}
        await post.save()
        res.json(post.comments[index])
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})
// delete a specific comment
router.delete('/:id/comments/:commentid', async (req, res) => {
    try {
        const post = await db.Post.findById(req.params.id).populate({path:'comments', populate: {path: 'user'}})
        const index = post.comments.findIndex((comment) => {return comment.id === req.params.commentid})
        post.comments.splice(index, 1)
        await post.save()
        res.json(post)
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})
module.exports = router