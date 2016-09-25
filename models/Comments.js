var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
	body: String,
	author: String,
	upvotes: {type: Number, default: 0},
	hadUpvoted: {type: Boolean, default: false},
	downvotes: {type: Number, default: 0},
	hadDownvoted: {type: Boolean, default: false},
	post: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}]
});

CommentSchema.methods.upvote = function(cb) {
	this.upvotes += 1;
	this.hadUpvoted = true;
	this.save(cb);
};

CommentSchema.methods.downvote = function(cb) {
	this.downvotes += 1;
	this.hadDownvoted = true;
	this.save(cb);
};

mongoose.model('Comment', CommentSchema);