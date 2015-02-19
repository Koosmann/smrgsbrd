/////////////////////
// User Management //
/////////////////////

// NodeJS Utilities
var url = require('url'),
	path = require('path'),

// Environment Configuration
	env = process.env.NODE_ENV || 'development',
	port = process.env.PORT || 3000,
	config = require('../../config/config')(path, port)[env],

// Redis
	redisLib = require("redis"),
	redisURL = url.parse(config.cache);
	redis = redisLib.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true}),

// Async
	async = require('async');

if (redisURL.auth) redis.auth(redisURL.auth.split(":")[1]);
	
module.exports = function (users, passport, config, Cat, Feed, mixpanel, settings, env, crypto, Snapshot) {

	return {
		login: function(req, res, next) {
			console.log("-----");
			console.log("login");
			console.log("-----");
			
			
			console.log("Passport about to auth");
			//console.dir(req.body);
			passport.authenticate('local', function(err, user, info) {
				if (err) { 
					console.log(err);
					return next(err);
				} else if (user) {
					
					console.log("-----");
					console.log("User: " + user);
					console.dir(mixpanel);
					console.log("-----");
					
					req.logIn(user, function(err) {
						if (err) { return next(err); }
						var currentUser = new Object();
						currentUser.id = req.user._id;
						currentUser.firstName = req.user.firstName;
						currentUser.lastName = req.user.lastName;
						currentUser.username = req.user.username;
						currentUser.following = req.user.following || [];
						currentUser.feeds = req.user.feeds || [];
						currentUser.role = req.user.role || 'user';
						currentUser.avatar = req.user.avatar || '/assets/img/avatars/' + Math.floor(Math.random()*16) + ".png";
						currentUser.previousLogin = req.user.previousLogin;

						// Indentify on Mixpanel
						/*mixpanel.people.set(user._id, {
						    "$username": user.username,
						    "$name": user.firstName + " " + user.lastName,
						    "$firstName": user.firstName,
						    "$lastName": user.lastName,
						    "Gender": user.gender,
						    "$email": user.email
						}, function (err) {
							if (err) {
								console.log("MIXPANEL ERROR");
								console.dir(err);
							}

							console.log("MIXPANEL SET COMPLETE");
						});*/

						user.updateLastLogin(function(){
							return res.send(currentUser);
						});
					});
				} else {    	
					return res.send(null)
				}
		  	})(req, res, next);
		},
		
		logout: function (req, res) {
		  	req.logout();
		  	console.log("LOGOUT!");
		  	res.redirect('/');
		},
		
		register: function (req, res) {
			console.log("--------");
			console.log("register");
			console.log("--------");
			
			Invite.findOneAndUpdate({ hash: req.params.hash}, {$set: {registered: true}}, function (err, invite) {
				if (err) res.send(null, 500);
				else {
					console.log(invite);
					Cat.findOne({ email: invite.emailAddress}, function(err, cat) {
						if (cat) {
							console.log('Already registered: ' + req.body.username);
							return res.send(null, 409);
						} else {
							console.log("Not registered yet!");
							//console.log(req.body);
							
							var cat = new Cat();
						  
							cat.firstName = req.body.firstName;
							cat.lastName = req.body.lastName;
							cat.username = req.body.username;
							cat.email = invite.emailAddress;
							/*cat.gender = req.body.gender;
							cat.birthday.month = req.body.birthday.month;
							cat.birthday.day = req.body.birthday.day;
							cat.birthday.year = req.body.birthday.year;*/
							cat.avatar = '/assets/img/avatars/' + Math.floor(Math.random()*16) + ".png";
							cat.password = req.body.password;

							cat.save(function (err) {		
								if (err) {
									console.log("-------------------");
									console.log("Registration error!" + err);
									console.log("-------------------");
									return res.send('null', 500);
								} else {
								
									console.log("----------");
									console.log("Cat saved!");
									console.log("----------");
									
									//Authenticate New User
									
									req.logIn(cat, function(err) {
										if (err) { 
											console.log(err);	
											return res.redirect('/login');
										} else {
											var currentUser = new Object();
											currentUser.username = cat.username;
											currentUser.firstName = cat.firstName;
											currentUser.lastName = cat.lastName;
											//currentUser.following = cat.following || [];
											//currentUser.feeds = cat.feeds || [];
											//currentUser.role = cat.role || 'user';

											currentUser.email = cat.email;
											currentUser.bio = cat.bio;
											//user.following = cat.following || [];
											//user.feeds = cat.feeds || [];
											//user.role = req.user.role || 'user';
											currentUser.favoriteFeeds = cat.favoriteFeeds || [];
											currentUser.hiddenFeeds = cat.hiddenFeeds;
											currentUser.savedFeeds = cat.savedFeeds;
											currentUser.snapshotCount = 0;

											currentUser.id = cat._id;
											currentUser.avatar = cat.avatar || 'http://s3-us-west-1.amazonaws.com/pctrly-dev/avatars/users/default.jpg';
											currentUser.previousLogin = cat.previousLogin || Date.now();

											console.log("-----------------------");
											console.log("Registered & logged in!");
											console.log(req.user);
											console.log("-----------------------");
											return res.send(currentUser, 200);
										}
									});
								}
							});
						}
					});
				}
			});
		},
		
		//Used to check for the current logged in user
		me: function (req, res) {
			
			console.log("--");
			console.log("me");
			console.dir(req.user);
			console.log("--");
			
			if (req.hasOwnProperty('user')) {
				console.log("GETTING USER");	
				async.waterfall([function (callback) {
					Cat.findOne({ username: req.user.username}, function(err, cat) {
						if (err) callback({ message: "Error searching for current user: " + err, status: 500 });
						else {
							if (cat != null) {
								console.log("USER");
								console.dir(req.user);

								var user = new Object();
								user.id = req.user._id;
								user.firstName = cat.firstName;
								user.lastName = cat.lastName;
								user.username = req.user.username;
								user.email = req.user.email;
								user.bio = req.user.bio;
								//user.following = cat.following || [];
								//user.feeds = cat.feeds || [];
								//user.role = req.user.role || 'user';
								user.favoriteFeeds = req.user.favoriteFeeds || [];
								user.hiddenFeeds = req.user.hiddenFeeds;
								user.savedFeeds = req.user.savedFeeds;
								user.avatar = cat.avatar || 'http://s3-us-west-1.amazonaws.com/pctrly-dev/avatars/users/default.jpg';
								user.previousLogin = req.user.previousLogin;
								/*user.online = 0;
								
								if (users.online[cat.username])
									cat.online = 1;*/
									
								callback(null, user);
							} else if (err) {
								console.log("NO USER");
								console.dir(req.user);

								console.log('Error: ' + err);
								res.send(null);
							}
						}
					});
				}, function (user, callback) {
					// Get snapshot count

					Snapshot.count({userId: req.user.id}, function (err, count) {
						if (err) callback({ message: "Error getting snapshot count: " + err, status: 500 });
						else {
							user.snapshotCount = count || 0;
							callback(null, user);
						}
					})
				}], function (err, user) {
					if (err) {
						console.log(err);
						res.send(err.message, err.status);
					} else res.send(user);
				});
			} else {
				console.log("No user in req");
				res.send(null);
			}
		
		},
		
		
////////////////////////
// Routing Management //
////////////////////////
		
		index: function (req, res) {
			console.log("index - %s", req.url);

			var data = new Object();
			
			if (env == 'development') data.dev = true;
			//if (req.url.match('/intro') || req.url.match('/login') || req.url.match('/home') || req.url.match('/directory') || req.url.match('/snapshots') || req.url.match('/discover') || req.url.match('/collections') || req.url.match('/collection/') || (req.url.match('/feed/') && req.url.match('/find-similar'))) data.intro = true;
			
			data.title = config.app.name;
			data.mixpanelToken = config.mixpanel;
			data.googleAnalyticsToken = config.googleAnalytics;
			
			data.css = settings.clientCss.renderTags("app");
			data.js = settings.clientJs.renderTags("app");
			
			console.dir(data);

			res.render('index', { data : data });
		},

		admin: function (req, res) {
			console.log("admin");
			
			var data = new Object();
			
			if (env == 'development') data.dev = true;

			data.admin = true;
			data.title = config.app.name;
			
			data.css = settings.clientCss.renderTags("admin");
			data.js = settings.clientJs.renderTags("admin");
			
			res.render('index', { data : data });
		},
		
		partials: function (req, res) {
			var name = req.params.name;
			console.log("Partial: %s", name);
			
			// Template Data
			
			var data = new Object();
			// Add partial data here...
			if (req.isAuthenticated()) {
				console.log("AUTHED");
				data.auth = true;
			} else {
				console.log("NOT AUTHED - %s", req.isAuthenticated());
			}
			
			data.email = req.pctEmail ? true : false;
			console.log("EMAIL: %s", data.email);
			
			switch (name) {
				case "cats":
					break;
				case "cat":
					break;
				case "admin":
					console.log("ADMIN PARTIAL");
					console.log(name);
					data.title = "Feeds";
					break;
				case "adminFeedPreview":
					console.log("ADMIN PARTIAL");
					console.log(name);
					data.title = "Feeds";
					break;
			}
			
			res.render('partials/' + name, { data : data });
		},

////////////////
// Email Page //
////////////////

		fullEmail: function (req, res) {
			async.waterfall([function (callback) {
				var data = {};

				callback(null, data);
			}, function (data, callback) {
				console.log("EMAIL" + req.email.recipient)
				var multi = redis.multi();
				multi
					.get('user:' + req.email.recipient)
					.lrange('user:' + req.email.recipient + ':updatedFeeds', 0, -1)
					.lrange('user:' + req.email.recipient + ':randomFeeds', 0, -1)
					.exec(function (err, res) {
						console.dir(err);
						console.dir(res);
						data.user = JSON.parse(res[0]);
						data.updatedFeeds = res[1];
						data.randomFeeds = res[2];
						callback(null, data);
				});			
			}, function (data, callback) {
				var multi = redis.multi();

				_.each(data.updatedFeeds, function (elm) {
					multi.get('feed:' + elm);
				});

				multi.exec(function (err, res) {
					_.each(res, function (elm, i) {
						data.updatedFeeds[i] = JSON.parse(elm);
					});

					callback(null, data);
				});

			}, function (data, callback) {
				var multi = redis.multi();

				_.each(data.randomFeeds, function (elm) {
					multi.get('feed:' + elm);
				});

				multi.exec(function (err, res) {
					_.each(res, function (elm, i) {
						data.randomFeeds[i] = JSON.parse(elm);
					});

					callback(null, data);
				});

			}], function (err, data) {
				res.send(data);
				//res.render('emails/daily-email', { feeds: data.updatedFeeds, randomFeeds: data.randomFeeds, name: data.user.firstName, emailId: data.id });
			});
		}
	}
}