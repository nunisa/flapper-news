var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
	body: String,
	author: String,
	upvotes: {type: Number, default: 0},
	downvotes: {type: Number, default: 0},
	post: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
	upvotedUsers: [{type: String, default: null}],
	downvotedUsers: [{type: String, default: null}]
});

CommentSchema.methods.upvote = function(cb) {
	this.upvotes += 1;
	this.save(cb);
};

CommentSchema.methods.downvote = function(cb) {
	this.downvotes += 1;
	this.save(cb);
};

mongoose.model('Comment', CommentSchema);