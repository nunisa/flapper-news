
/*
 * GET home page.
 */

var express = require('express');
var passport = require('passport');
var jwt = require('express-jwt');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

router.param('post', function(req, res, next, id) {
	var query = Post.findById(id);

	query.exec(function(err, post) {
		if (err) {return next(err);}
		if (!post) {return next(new Error('Can\'t find post'));}

		req.post = post;
		return next();
	});
});

router.param('comment', function(req, res, next, id) {
	var query = Comment.findById(id);

	query.exec(function (err, comment){
		if(err) return next(err);
		if (!comment) { return next(new Error('can\'t find comment')); }

		req.comment = comment;
		return next();
	});
});

router.get('/', function(req, res, next) {
	res.render('index', { title: 'practc-MEAN' });
});

router.get('/posts', function(req, res, next) {
	Post.find(function(err, posts) {
		if (err) {return next(err);}

		res.json(posts);
	});
});

router.post('/posts', auth, function(req, res, next) {
	var post = new Post(req.body);
	post.author = req.payload.username;

	post.save(function(err, post) {
		if (err) {return next(err);}

		res.json(post);
	});
});

router.get('/posts/:post', function(req, res) {
	req.post.populate('comments', function(err, post) {
		if (err) {return next(err);}

		res.json(post);
	});
});

router.put('/posts/:post/upvote', auth, function(req, res, next) {
	req.post.upvotedUsers.push(req.payload.username);
	req.post.upvote(function(err, post) {
		if (err) {return next(err);}

		res.json(post);
	});
});

router.put('/posts/:post/downvote', auth, function(req, res, next) {
	req.post.downvotedUsers.push(req.payload.username);
	req.post.downvote(function(err, post) {
		if (err) {return next(err);}

		res.json(post);
	});
});

router.post('/posts/:post/comments', auth, function(req, res, next) {
	var comment = new Comment(req.body);
	comment.post = req.post;
	if (comment.author === 'User') {
		comment.author = req.payload.username;
	}else{
		comment.author = req.body.author;
	}

	comment.save(function(err, comment) {
		if (err) {return next(err);}

		req.post.comments.push(comment);
		req.post.save(function(err, post) {
			if (err) {return next(err);}

			res.json(comment);
		});
	});
});

router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next) {
	req.comment.upvotedUsers.push(req.payload.username);
	req.comment.upvote(function(err, comment) {
		if (err) {return next(err);}

		res.json(comment);
	});
});

router.put('/posts/:post/comments/:comment/downvote', auth, function(req, res, next) {
	req.comment.downvotedUsers.push(req.payload.username);
	req.comment.downvote(function(err, comment) {
		if (err) {return next(err);}

		res.json(comment);
	});
});

router.post('/register', function(req, res, next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please fill out all fields'});
	}

	var user = new User();
	user.username = req.body.username;
	user.setPassword(req.body.password)
	user.save(function (err){
		if(err){ return next(err); }

		return res.json({token: user.generateJWT()})
	});
});

router.post('/login', function(req, res, next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please fill out all fields'});
	}

	passport.authenticate('local', function(err, user, info){
		if(err){ return next(err); }

		if(user){
			return res.json({token: user.generateJWT()});
		} else {
			return res.status(401).json(info);
		}
	})(req, res, next);
});

module.exports = router;

// curl --data 'title=Cookies+vs+Tokens.+Getting+auth+right+with+Angular.JS&link=https://auth0.com/blog/angularjs-authentication-with-cookies-vs-token/' http://localhost:3000/posts