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
      //   console.log(req.body, req.file)
      const uploadedResponse = await cloudinary.uploader.upload(req.file.path)
      //   console.log(uploadedResponse)
      const user = await db.User.findById(req.body.adminId).populate('tournaments')
      
      const newTour = await db.Tournament.create({
          title: req.body.title,
          content: req.body.content,
          admin: user,
          url: req.body.url,
          category: req.body.category,
          photo: uploadedResponse.url,
          ranks: req.body.ranks,
          reward: req.body.reward     
        })


      user.tournaments = [newTour, ...user.tournaments]
      await user.save()
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
        const tournament = await db.Tournament.findById( req.params.id).populate('comments').populate('submissions').populate('roster')
        console.log(tournament)
        res.json(tournament)
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
router.get('/:id/submissions', async (req, res) => {
    try { 
        const tour = await db.Tournament.findById(req.params.id).populate({path:'submissions', populate: 'user'})
        const subs = tour.submissions.find().sort({"created_at": 1})
        res.json(subs)
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



// // // Add a comment
// router.post('/:id/comments', async (req, res) => {
//     try {
//       if(user) {
//         const user = await db.User.findById(req.body.userId)
//         const userComment = {content: req.body.content, user: user}
//         const tournament = await db.Tournament.findById(req.params.id).populate({path:'comments', populate: 'user'})
//         tournament.comments = [userComment, ...tournament.comments]
//         await tournament.save()
  
//         res.status(201).json(userComment)
//       }
//     } catch (error) {
//       console.log(error)
//       res.status(500).json({ msg: 'server error'  })
//     }
// })

// // Update a specific comment
// router.put('/:id/comments/:commentid', async (req, res) => {
//     try {
//         const tournament = await db.Tournament.findById(req.params.id)
//         const index = tournament.comments.findIndex((comment) => {return comment.id === req.params.commentid})
//         tournament.comments[index] = {id: tournament.comments[index].id, user: tournament.comments[index].user, content: req.body.content}
//         await tournament.save()
//         res.json(tournament.comments[index])
//     } catch(err) {
//         console.log(err)
//         res.status(500).json({ msg: 'server error'  })
//     }
// })
// // delete a specific comment
// router.delete('/:id/comments/:commentid', async (req, res) => {
//     try {
//         const tournament = await db.Tournament.findById(req.params.id).populate({path:'comments', populate: 'user'})
//         const index = tournament.comments.findIndex((comment) => {return comment.id === req.params.commentid})
//         tournament.comments.splice(index, 1)
//         await tournament.save()
//         res.json(tournament)
//     } catch(err) {
//         console.log(err)
//         res.status(500).json({ msg: 'server error'  })
//     }
// })
module.exports = router