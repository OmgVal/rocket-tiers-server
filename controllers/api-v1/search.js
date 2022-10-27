// const router = require('express').Router()
// const db = require('../../models')

// function escapeRegex(text) {
//     return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
// };
// // GET all users -- adapted code from https://stackoverflow.com/questions/38421664/fuzzy-searching-with-mongodb
// router.get('/:username', async (req, res) => {
//     const regex = new RegExp(escapeRegex(req.params.username), 'gi');
//     const users = await db.Tournament.find({username: regex})
//     res.json(users)
// })

// module.exports = router