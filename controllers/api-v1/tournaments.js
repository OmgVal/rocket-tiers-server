const router = require('express').Router()
const db = require('../../models')

const { cloudinary } = require('../../utils/cloudinary')
const multer = require('multer')
const { unlinkSync } = require('fs')
const uploads = multer({ dest: 'uploads/' })

// GET /tournaments - test endpoint
router.get('/', async (req, res) => {
    try { 
        const allTourn = await db.Tournament.find().sort({"created_at": -1})
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
      const admin = await db.User.findById(req.body.adminId)
    //   console.log(req.body, req.file)
      const uploadedResponse = await cloudinary.uploader.upload(req.file.path)
    //   console.log(uploadedResponse)
  
      const newTour = await db.Tournament.create({
          content: req.body.content,
          title: req.body.title,
          date: req.body.date,
          admin: admin.id,
          url: req.body.url,
          category: req.body.category,
          image: uploadedResponse.url,
          ranks: req.body.ranks,
          reward: req.body.reward     
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


// router.post('/', uploads.single('image'), async (req, res) => {
//     try {
//       // find the user
//       //   console.log(req.body, req.file)
//       const uploadedResponse = await cloudinary.uploader.upload(req.file.path)
//       //   console.log(uploadedResponse)
//       const user = await db.User.findById(req.body.adminId).populate('tournaments')
      
//       const newTour = await db.Tournament.create({
//           title: req.body.title,
//           content: req.body.content,
//           admin: user,
//           url: req.body.url,
//           category: req.body.category,
//           image: uploadedResponse.url,
//           ranks: req.body.ranks,
//           reward: req.body.reward     
//         })


//       user.tournaments = [newTour, ...user.tournaments]
//       await user.save()
//       res.status(201).json(newTour)
//       unlinkSync(req.file.path)
//     } catch (error) {
//       console.log(error)
//       res.status(500).json({ msg: 'server error'  })
//     }
//   })

// GET Tournament by id
router.get('/:id', async (req, res) => {
    try {
        const tournament = await db.Tournament.findById(req.params.id).populate('comments').populate({path: 'comments', populate: 'user'}).populate('submissions').populate('roster')
        // console.log(tournament)
        res.json(tournament)
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})

router.put('/:id/photo', uploads.single('image'), async (req, res) => {
    try {
      // console.log(req.body, req.file)
      const uploadedResponse = await cloudinary.uploader.upload(req.file.path)
      const options = {new: true} 
      const updatedTour = await db.Tournament.findByIdAndUpdate(req.body.id, {photo: uploadedResponse.url}, options)
      res.json(updatedTour)
      unlinkSync(req.file.path)
      
    }catch(err) {
      console.warn(err)
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
        const tournament = await db.Tournament.findById(req.params.id)
        console.log(tournament)
        const admin = tournament.admin
        const foundUser = await db.User.findById(admin)
        foundUser.tournaments.splice(foundUser.tournaments.indexOf(req.params.id),1)
        await foundUser.save()
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
        const user = await db.User.findById(req.body.user)

        if(user) {
            const newSub = { teamsize: req.body.teamsize, othermember: req.body.othermember, user: user}
            const tour = await db.Tournament.findById(req.params.id).populate('submissions')
            tour.submissions = [newSub, ...tour.submissions]
            await tour.save()
            res.status(201).json(newSub)
        }
  
      } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'server error'  })
      }
})

router.get('/:id/submissions', async (req, res) => {
    try { 
        const tour = await db.Tournament.findById(req.params.id).populate('submissions').populate({path:'submissions', populate: 'user'})
    
        // const subs = tour.submissions.sort({"created_at": 1})
        res.json(tour)

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'server error'  })
    }
})

// Update a submission
router.put('/:id/submission/:subid', async (req, res) => {
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
      
        const user = await db.User.findById(req.body.user)
        if (user) {

            const newComment = {content: req.body.content, user: user}
            const tournament = await db.Tournament.findById(req.params.id).populate('admin')
            tournament.comments = [newComment, ...tournament.comments]
            await tournament.save()
      
            res.status(201).json(newComment)
        }
    
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'server error'  })
    }
})

router.get('/:id/comments/:commentid', async (req, res) => {
    try {
        const tournament = await db.Tournament.findById(req.params.id).populate('comments')
        // console.log(tournament)
        const index = tournament.comments.findIndex((comment) => {return comment.id === req.params.commentid})
        tournament.comments[index]
        res.json(tournament.comments[index])
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})

// Update a specific comment
router.put('/:id/comments/:commentid', async (req, res) => {
    try {
        const tournament = await db.Tournament.findById(req.params.id)
        const index = tournament.comments.findIndex((comment) => {return comment.id === req.params.commentid})
        tournament.comments[index] = {id: tournament.comments[index].id, user: tournament.comments[index].user, content: req.body.content}
        await tournament.save()
        res.json(tournament.comments[index])
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})
// delete a specific comment
router.delete('/:id/comments/:commentid', async (req, res) => {
    try {
        const tournament = await db.Tournament.findById(req.params.id).populate({path:'comments', populate: 'user'})
        const index = tournament.comments.findIndex((comment) => {return comment.id === req.params.commentid})
        tournament.comments.splice(index, 1)
        await tournament.save()
        res.json(tournament)
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})
module.exports = router