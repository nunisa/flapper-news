var app = angular.module('myngapp', ['ui.router']);

app
.controller('MainCtrl', ['$scope', 'posts', 'auth', function($scope, posts, auth) {
	$scope.headingTitle = 'Yay...You did a safe landing!';
	$scope.posts = posts.posts;
	$scope.addPost = function() {
		if (!$scope.title || $scope.title==='') {return;}
		posts.create({
			title: $scope.title, 
			link: $scope.link,
		});
		$scope.title = '';
		$scope.link = '';
	};
	$scope.incrementUpvotes = function(post) {
		if (!post.hadUpvoted) {
			post.hadUpvoted = true;
			posts.upvote(post);
		}
	};
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.postFormShown = 0;
	$scope.showPostForm = function() {
		$scope.postFormShown = 1;
	};
	$scope.incrementDownvotes = function(post) {
		if (!post.hadDownvoted) {
			post.hadDownvoted = true;
			posts.downvote(post);
		}
	};
}])
.controller('PostsCtrl', ['$scope', '$stateParams', 'posts', 'post', 'auth', function($scope, $stateParams, posts, post, auth) {
	$scope.headingTitle = 'Yay...You did a safe landing!';
	$scope.post = post;
	$scope.addComment = function() {
		if ($scope.body==='') {return;}
		posts.createComment(post._id, {
			body: $scope.body, 
			author: $scope.author || 'User'
		}).success(function(comment) {
			$scope.post.comments.push(comment);
		});
		$scope.body = '';
	};
	$scope.incrementUpvotes = function(comment) {
		if (!comment.hadUpvoted) {
			comment.hadUpvoted = true;
			posts.upvoteComment(post, comment);
		}
	};
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.commentFormShown = 0;
	$scope.showCommentForm = function() {
		$scope.commentFormShown = 1;
	};
	$scope.incrementDownvotes = function(comment) {
		if (!comment.hadDownvoted) {
			comment.hadDownvoted = true;
			posts.downvoteComment(post, comment);
		}
	};
}])
.controller('AuthCtrl', ['$scope', '$state', 'auth', function($scope, $state, auth){
	$scope.headingTitle = 'Yay...You did a safe landing!';
	$scope.user = {};

	$scope.register = function(){
		auth.register($scope.user).error(function(error){
			$scope.error = error;
		}).then(function(){
			$state.go('home');
		});
	};

	$scope.logIn = function(){
		auth.logIn($scope.user).error(function(error){
			$scope.error = error;
		}).then(function(){
			$state.go('home');
		});
	};
}])
.controller('NavCtrl', ['$scope', 'auth', function($scope, auth){
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentUser = auth.currentUser;
	$scope.logOut = auth.logOut;
}])
.factory('posts', ['$http', 'auth', function($http, auth) {
	var o = {
		posts: []
	};
	o.getAll = function() {
		return $http.get('/posts').success(function(data) {
			angular.copy(data, o.posts);
		});
	};
	o.create = function(post) {
		return $http.post('/posts', post, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data) {
			o.posts.push(data);
		});
	};
	o.upvote = function(post) {
		return $http.put('/posts/'+post._id+'/upvote', null, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data) {
			post.upvotes += 1;
			// angular.element(document.getElementById(post._id+'-postUpvote'))[0].disabled = true;
		});
	};
	o.downvote = function(post) {
		return $http.put('/posts/'+post._id+'/downvote', null, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data) {
			post.downvotes += 1;
			// angular.element(document.getElementById(post._id+'-postDownvote'))[0].disabled = true;
		});
	};
	o.get = function(id) {
		return $http.get('/posts/'+id).then(function(res) {
			return res.data;
		});
	};
	o.createComment = function(id, comment) {
		return $http.post('/posts/'+id+'/comments', comment, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		});
	};
	o.upvoteComment = function(post, comment) {
		return $http.put('/posts/'+post._id+'/comments/'+comment._id+'/upvote', null, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data) {
			comment.upvotes += 1;
			// angular.element(document.getElementById(comment._id+'-commentUpvote'))[0].disabled = true;
		});
	};
	o.downvoteComment = function(post, comment) {
		return $http.put('/posts/'+post._id+'/comments/'+comment._id+'/downvote', null, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data) {
			comment.downvotes += 1;
			// angular.element(document.getElementById(comment._id+'-commentDownvote'))[0].disabled = true;
		});
	};
	return o;
}])
.factory('auth', ['$http', '$window', function($http, $window){
	var auth = {};

	auth.saveToken = function (token){
		$window.localStorage['bWVhbi1wcmFjdGMtdG9rZW5z'] = token; // mean-practc-tokens
	};
	auth.getToken = function (){
		return $window.localStorage['bWVhbi1wcmFjdGMtdG9rZW5z'];
	};
	auth.isLoggedIn = function(){
		var token = auth.getToken();

		if(token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};
	auth.currentUser = function(){
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};
	auth.register = function(user){
		return $http.post('/register', user).success(function(data){
			auth.saveToken(data.token);
		});
	};
	auth.logIn = function(user){
		return $http.post('/login', user).success(function(data){
			auth.saveToken(data.token);
		});
	};
	auth.logOut = function(){
		$window.localStorage.removeItem('bWVhbi1wcmFjdGMtdG9rZW5z');
		$scope.postFormShown = 1;
		$scope.commentFormShown = 1;
	};

	return auth;
}])
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl',
			resolve: {
				postPromise: ['posts', function(posts) {
					return posts.getAll();
				}]
			}
		})
		.state('posts', {
			url: '/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsCtrl',
			resolve: {
				post: ['$stateParams', 'posts', function($stateParams, posts) {
					return posts.get($stateParams.id);
				}]
			}
		})
		.state('login', {
			url: '/login',
			templateUrl: '/login.html',
			controller: 'AuthCtrl',
			onEnter: ['$state', 'auth', function($state, auth){
				if(auth.isLoggedIn()){
					$state.go('home');
				}
			}]
		})
		.state('register', {
			url: '/register',
			templateUrl: '/register.html',
			controller: 'AuthCtrl',
			onEnter: ['$state', 'auth', function($state, auth){
				if(auth.isLoggedIn()){
					$state.go('home');
				}
			}]
		});

	$urlRouterProvider.otherwise('home');
}]);