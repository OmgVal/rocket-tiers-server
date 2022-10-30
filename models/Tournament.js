const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    content: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
}, {
    timestamps: true
})

const RosterSchema = new mongoose.Schema({
    team: {
        type: String
    },
    members: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
}, {
    timestamps: true
})


const SubmissionSchema = new mongoose.Schema({
    teamsize: {
        type: Number
    },
    othermember: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approved: {
        type: Boolean,
        other: {
            type: String
        }
    }
}, {
    timestamps: true
})

const TournamentSchema = new mongoose.Schema({
    photo: {
        type: String
    },
    content: {
        type: String
    },
    url: {
        type: String
    },
    category: {
        type: String
    },
    ranks: {
        type: String
    },
    reward: {
        type: Number
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    comments: [CommentSchema],
    roster: [RosterSchema],
    submissions: [SubmissionSchema]    
},{
    timestamps: true
})

module.exports = mongoose.model('Tournament', TournamentSchema)