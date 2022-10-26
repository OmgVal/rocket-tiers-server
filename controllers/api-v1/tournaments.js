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

// GET /:id 
router.get('/:id', async (req, res) => {
    try {
        const Tournament = await db.Tournament.findById(req.params.id).populate({path:'comments', populate: {path: 'user'}}).populate('submissions').populate({path:'roster', populate: {path: 'user'}})
        res.json(Tournament)
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})

// submission
router.post('/:id/register', async (req, res) => {
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
// Unlike a post
router.put('/id/like', async (req, res) => {
    try {
        const post = await db.Post.findById(req.params.postid)
        const index = post.likes.findIndex((like) => {
            return like.user == req.body.userId})
        const user = await db.User.findById(req.body.userId)
        const indexLikedPost = user.likedposts.findIndex((likepost) => {
            return likepost == post.id})
        user.likedposts.splice(indexLikedPost, 1)
        post.likes.splice(index, 1)
        await post.save()
        await user.save()
        res.json(post)
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})

// // Update a post
// router.put('/:postid', async (req, res) => {
//     try {
//         const options = {new: true}
//         const updatedPost = await db.Post.findByIdAndUpdate(req.params.postid, req.body, options)
//         res.json(updatedPost)
//     } catch(err) {
//         console.log(err)
//         res.status(500).json({ msg: 'server error'  })
//     }
// })

// // Delete a post
// router.delete('/:postid', async (req, res) => {
//     try {
//         post = await db.Post.findById(req.params.postid)
//         const userid = post.user
//         const foundUser = await db.User.findById(userid)
//         foundUser.posts.splice(foundUser.posts.indexOf(req.params.postid),1)
//         await foundUser.save()
//         await db.Post.findByIdAndDelete(req.params.postid)
//         res.sendStatus(204)
//     } catch(err) {
//         console.log(err)
//         res.status(500).json({ msg: 'server error'  })
//     }
// })
// // Add a comment
// router.post('/:postid/comments', async (req, res) => {
//     try {
//       const user = await db.User.findById(req.body.userId)
//       const newComment = {content: req.body.content, user: user}
//       const post = await db.Post.findById(req.params.postid).populate('user')
//       post.comments = [newComment, ...post.comments]
//       await post.save()

//       res.status(201).json(newComment)
//     } catch (error) {
//       console.log(error)
//       res.status(500).json({ msg: 'server error'  })
//     }
// })
// // Read a specific comment
// router.get('/:postid/comments/:commentid', async (req, res) => {
//     try {
//         const post = await db.Post.findById(req.params.postid).populate('comments')
//         const index = post.comments.findIndex((comment) => {return comment.id === req.params.commentid})
//         post.comments[index]
//         res.json(post.comments[index])
//     } catch(err) {
//         console.log(err)
//         res.status(500).json({ msg: 'server error'  })
//     }
// })

// // Update a specific comment
// router.put('/:postid/comments/:commentid', async (req, res) => {
//     try {
//         const post = await db.Post.findById(req.params.postid)
//         const index = post.comments.findIndex((comment) => {return comment.id === req.params.commentid})
//         post.comments[index] = {id: post.comments[index].id, user: post.comments[index].user, content: req.body.content}
//         await post.save()
//         res.json(post.comments[index])
//     } catch(err) {
//         console.log(err)
//         res.status(500).json({ msg: 'server error'  })
//     }
// })
// // delete a specific comment
// router.delete('/:postid/comments/:commentid', async (req, res) => {
//     try {
//         const post = await db.Post.findById(req.params.postid).populate({path:'comments', populate: {path: 'user'}})
//         const index = post.comments.findIndex((comment) => {return comment.id === req.params.commentid})
//         post.comments.splice(index, 1)
//         await post.save()
//         res.json(post)
//     } catch(err) {
//         console.log(err)
//         res.status(500).json({ msg: 'server error'  })
//     }
// })
module.exports = router