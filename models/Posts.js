var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
	title: String,
	link: String,
	upvotes: {type: Number, default: 0},
	hadUpvoted: {type: Boolean, default: false},
	downvotes: {type: Number, default: 0},
	hadDownvoted: {type: Boolean, default: false},
	comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
});

PostSchema.methods.upvote = function(cb) {
	this.upvotes += 1;
	this.hadUpvoted = true;
	this.save(cb);
};

PostSchema.methods.downvote = function(cb) {
	this.downvotes += 1;
	this.hadDownvoted = true;
	this.save(cb);
};

mongoose.model('Post', PostSchema);