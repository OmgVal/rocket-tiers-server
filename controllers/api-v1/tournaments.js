const router = require('express').Router()
const db = require('../../models')

const { cloudinary } = require('../../utils/cloudinary')
const multer = require('multer')
const { unlinkSync } = require('fs')
const uploads = multer({ dest: 'uploads/' })

// GET /posts - test endpoint
router.get('/', async (req, res) => {
    try { 
        const allTourn = await db.Tournament.find({})
        allTourn.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
        res.json(sortedTourn)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'server error'  })
    }
    
})

// router.post('/', uploads.single('image'), async (req, res) => {
//     try {
//       // find the user
//       const user = await db.User.findById(req.body.userId)
//     //   console.log(req.body, req.file)
//       const uploadedResponse = await cloudinary.uploader.upload(req.file.path)
//     //   console.log(uploadedResponse)
  
//       const newPost = await db.Post.create({
//           content: req.body.content,
//           user: user.id,
//           photo: uploadedResponse.url     
      
//       })
//       user.posts.push(newPost.id)
//       await user.save()
//       res.status(201).json(newPost)
//       unlinkSync(req.file.path)
//     } catch (error) {
//       console.log(error)
//       res.status(500).json({ msg: 'server error'  })
//     }
//   })

// // GET /:postid 
// router.get('/:postid', async (req, res) => {
//     try {
//         const post = await db.Post.findById(req.params.postid).populate({path:'comments', populate: {path: 'user'}}).populate('likes').populate('user')
//         res.json(post)
//     } catch(err) {
//         console.log(err)
//         res.status(500).json({ msg: 'server error'  })
//     }
// })

// // Like a post
// router.post('/:postid/like', async (req, res) => {
//     try {
//         const post = await db.Post.findById(req.params.postid)
//         const user = await db.User.findById(req.body.userId)
//         const like = {user: user}
//         user.likedposts.push(post)
//         await user.save()
//         post.likes.push(like)
//         await post.save()
//         res.json(post)
//     } catch(err) {
//         console.log(err)
//         res.status(500).json({ msg: 'server error'  })
//     }
// })
// // Unlike a post
// router.put('/:postid/like', async (req, res) => {
//     try {
//         const post = await db.Post.findById(req.params.postid)
//         const index = post.likes.findIndex((like) => {
//             return like.user == req.body.userId})
//         const user = await db.User.findById(req.body.userId)
//         const indexLikedPost = user.likedposts.findIndex((likepost) => {
//             return likepost == post.id})
//         user.likedposts.splice(indexLikedPost, 1)
//         post.likes.splice(index, 1)
//         await post.save()
//         await user.save()
//         res.json(post)
//     } catch(err) {
//         console.log(err)
//         res.status(500).json({ msg: 'server error'  })
//     }
// })

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