////////////
// Routes //
////////////

module.exports = function (app, auth, routes, api, config, validator, Email, Invite) {

	if (process.env.NODE_STATUS == 'offline') {
		
		// Serve Temporary Landing Page

		app.get('/', function(req, res) {
			var data = new Object();
			data.title = config.app.name;
			
			res.render('welcome', { data : data });
		});

		app.post('/signup', function(req, res) {
			console.log("SIGNUP: " + req.body.emailAddress);

			var valid = true;
			    
			if (!validator.isEmail(req.body.emailAddress)) valid = false;

			if (valid) {
			    Email.findOne({ emailAddress: req.body.emailAddress.toLowerCase() }, function(err, email) {
					if (email) {
						console.log('Email already submitted: ' + req.body.emailAddress);
						res.send("Email already submitted - We've got you covered!");
					} else {
						console.log("NO EMAILS FOUND");
						
						var email = new Email();
					  
						email.emailAddress = req.body.emailAddress;
					
						email.save(function (err) {		
							if (err) {
								console.log("-------------------");
								console.log("Submission error! - " + err);
								console.log("-------------------");
								res.send('Please try again.');
							} else {	
								console.log("----------");
								console.log("Email saved!");
								console.log("----------");

								res.send("Thanks, we'll keep you posted!");
							}
							
						});
					}
				});

			} else {
			    res.send("Please enter a valid email address.");
			}
		});

	} else {

		// Auth
		
		app.post('/register/:hash', auth.ensureAuth(false, 'api'), routes.register);  
		app.post('/login', auth.ensureAuth(false, 'api'), routes.login);
		app.get('/logout', routes.logout);                                       
		
		// Pages (must register all accepted routes or it will trigger a 404)
		
		app.get('/', auth.ensureAuth(false, 'page'), routes.index);
		app.get('/invite', auth.ensureAuth(false, 'page'), routes.index);
		//app.get('/home', routes.index);
		//app.get('/about', routes.index);
		//app.get('/intro', routes.index);
		app.get('/collection/:id', routes.index);
		app.get('/list/:list', auth.ensureAuth(true, 'page'), routes.index);
		app.get('/feed', auth.ensureAuth(true, 'page'), routes.index);
		app.get('/feed/:id', routes.index);
		app.get('/favorites', auth.ensureAuth(true, 'page'), routes.index);
		app.get('/collections', auth.ensureAuth(true, 'page'), auth.requireRole('administrator'), routes.index);
		app.get('/directory', auth.ensureAuth(true, 'page'), routes.index);
		app.get('/snapshots', auth.ensureAuth(true, 'page'), routes.index);
		app.get('/account', auth.ensureAuth(true, 'page'), routes.index);
		app.get('/feed/:id/find-similar', auth.ensureAuth(true, 'page'), routes.index);
		//app.get('/friends', auth.ensureAuth(true, 'page'), routes.index);
		
		app.get('/user/:username', auth.ensureAuth(true, 'page'), routes.index);
		//app.get('/feed/:id', auth.ensureAuth(true, 'page'), routes.index);
		
		app.get('/login', auth.ensureAuth(false, 'page'), routes.index);
		app.get('/register/1/:hash', auth.ensureAuth(false, 'page'), auth.requireValidInvite(Invite), routes.index);
		app.get('/register/2/:hash', auth.ensureAuth(false, 'page'), auth.requireValidInvite(Invite), function (req, res) { res.redirect('/register/1/' + req.params.hash) });
		app.get('/register/3/:hash', auth.ensureAuth(false, 'page'), auth.requireValidInvite(Invite), function (req, res) { res.redirect('/register/1/' + req.params.hash) });
		app.get('/register/4/:hash', auth.ensureAuth(true, 'page'), auth.requireValidInvite(Invite), routes.index);//function (req, res) { res.redirect('/') });
		//app.get('/upload-avatar', auth.ensureAuth(true, 'page'), routes.index);
		
		// Admin

		app.get('/admin', auth.ensureAuth(true, 'page'), auth.requireRole('administrator'), routes.admin);
		app.get('/admin/categories', auth.ensureAuth(true, 'page'), auth.requireRole('administrator'), routes.admin);
		app.get('/admin/collections', auth.ensureAuth(true, 'page'), auth.requireRole('administrator'), routes.admin);
		app.get('/admin/users', auth.ensureAuth(true, 'page'), auth.requireRole('administrator'), routes.admin);
		app.get('/admin/feeds', auth.ensureAuth(true, 'page'), auth.requireRole('administrator'), routes.admin);
		app.get('/admin/invites', auth.ensureAuth(true, 'page'), auth.requireRole('administrator'), routes.admin);
		//app.get('/admin/feed/:id/preview', auth.ensureAuth(true, 'page'), auth.requireRole('administrator'), routes.admin);

		// Partials
		
		app.get('/partials/outside/:name', routes.partials);
		app.get('/partials/inside/:name', auth.ensureAuth(true, 'partial'), routes.partials);
		app.get('/partials/restricted/:name', auth.ensureAuth(true, 'partial'), auth.requireRole('administrator'), routes.partials);
		
		// JSON API
		// Users
		
		app.get('/api/me', routes.me);
		//app.get('/api/user/:id', auth.ensureAuth(true, 'api'), api.cat);
		
		// WARNING: Need to guard these api routes better (i.e. only for admins & the right users)
		app.get('/api/cat/validate/:field', api.catCheck);
		app.post('/api/user/add', auth.ensureAuth(true, 'api'), auth.requireRole('administrator'), api.addUser);
		app.get('/api/user/:username', auth.ensureAuth(true, 'api'), api.cat);
		app.get('/api/user/:id/recently-updated-favorites', auth.ensureAuth(true, 'api'), auth.requireRole('administrator', true), api.getRecentlyUpdatedFavorites);
		app.post('/api/user/:id/edit', auth.ensureAuth(true, 'api'), auth.requireRole('administrator', true), api.editUser);
		app.post('/api/user/:id/upload-avatar', auth.ensureAuth(true, 'api'), auth.requireRole('administrator', true), api.addUserAvatar);
		app.post('/api/user/:id/choose-default-avatar', auth.ensureAuth(true, 'api'), auth.requireRole('administrator', true), api.chooseDefaultUserAvatar);
		app.post('/api/user/:id/change-password', auth.ensureAuth(true, 'api'), auth.requirePassword(), auth.requireRole(null, true), api.changePassword);
		app.post('/api/user/:id/reset-password', auth.ensureAuth(true, 'api'), auth.requireRole('administrator'), api.resetPassword);
		app.post('/api/user/:id/add-feed-to-list', auth.ensureAuth(true, 'api'), auth.requireRole('administrator', true), api.addFeedToList);

		app.get('/api/users', /*auth.ensureAuth(false, 'api'),*/ api.users);
		app.get('/api/users/search/username/:query', /*auth.ensureAuth(false, 'api'),*/ api.usernameSearch);

		app.post('/api/signup/newsletter', api.addEmail);
		app.post('/api/request-invite', api.requestInvite);

		app.get('/api/invites', auth.ensureAuth(true, 'api'), auth.requireRole('administrator'), api.getInvites);
		app.post('/api/send-invite', auth.ensureAuth(true, 'api'), auth.requireRole('administrator'), api.sendInvite);

		// Feed
		// WARNING: Need to guard these api routes better (i.e. only for admins & the right users)
		app.get('/api/feed/:id', /*auth.ensureAuth(true, 'api'),*/ api.loadFeed);
		app.post('/api/feed/:id/load-content', api.loadFeedContent);
		app.post('/api/feed/:id/load-images', api.loadFeedImages);
		app.get('/api/feed/:id/get-next-feed', api.getNextFeed);
		app.get('/api/feed/:instagramUsername/load-recent-instagram', api.getRecentInstagram);
		app.get('/api/feed/:twitterUsername/load-recent-tweet', api.getRecentTweet);
		app.post('/api/feed/add', auth.ensureAuth(true, 'api'), auth.requireRole('administrator'), api.addFeed);
		app.post('/api/feed/:id/edit', auth.ensureAuth(true, 'api'), auth.requireRole('administrator'), api.editFeed);
		//app.post('/api/feed/:id/update', auth.ensureAuth(true, 'api'), api.updateFeed);
		//app.post('/api/upload-avatar/:folder/:id', auth.ensureAuth(true, 'api'), api.uploadAvatar);
		app.get('/api/feed/validate/url', api.feedCheck);
		app.post('/api/feed/:id/asterisk', auth.ensureAuth(true, 'api'), api.mark);
		app.post('/api/feed/:id/save-categories', auth.ensureAuth(true, 'api'), auth.requireRole('administrator'),  api.saveCategories);
		app.get('/api/feed/:id/find-similar', api.findSimilar);
		app.post('/api/feed/click-image-link', api.clickImageLink);
		app.post('/api/feed/click-title-link', api.clickTitleLink);
		app.get('/api/feed/:id/favorite', api.favoriteFeed);
		app.get('/api/feed/:id/unfavorite', api.unfavoriteFeed);
		app.get('/api/feed/:id/hide', api.hideFeed);
		app.get('/api/feed/:id/unhide', api.unhideFeed);
		app.get('/api/feed/:id/mark-as-seen', api.markFeedAsSeen);

		// Snapshots

		app.get('/api/snapshots', api.getSnapshots);
		app.post('/api/take-snapshot', auth.ensureAuth(true, 'api'), api.takeSnapshot);
		app.post('/api/snapshot/like', auth.ensureAuth(true, 'api'), api.likeSnapshot);
		
		// Feeds

		app.get('/api/feeds/:order', auth.ensureAuth(true, 'api'), api.getFeeds);
		app.get('/api/admin/feeds/:order', auth.ensureAuth(true, 'api'), auth.requireRole('administrator'), api.getFeeds);
		app.get('/api/feeds-preview', api.getSampleFeeds);
		app.get('/api/categorized-feeds', api.getCategorizedFeeds);
		app.post('/api/feeds/load-content', api.loadFeeds);
		//app.post('/api/feeds/update', auth.ensureAuth, api.updateFeed);

		// Collections

		app.get('/api/collections', api.getCollections);

		// Collection

		//app.post('/api/collection/add', api.addCollection);
		app.get('/api/collection/:id', api.getCollection);
		app.post('/api/collection/add', auth.ensureAuth(true, 'api'), auth.requireRole('administrator'), api.addCollection);
		app.post('/api/collection/:id/edit', auth.ensureAuth(true, 'api'), auth.requireRole('administrator'), api.editCollection);
		app.post('/api/collection/:id/publish', auth.ensureAuth(true, 'api'), auth.requireRole('administrator'), api.publishCollection);
		app.post('/api/collection/:id/upload-cover', auth.ensureAuth(true, 'api'), api.addCollectionCover);

		// Categories

		app.post('/api/categories', api.getCategories);
		app.post('/api/admin/categories', auth.ensureAuth(true, 'api'), auth.requireRole('administrator'), api.getCategories);
		app.get('/api/category/:category/feeds', auth.ensureAuth(true, 'api'), auth.requireRole('administrator'), api.getCategoryFeedList);
		app.post('/api/category/add', auth.ensureAuth(true, 'api'), auth.requireRole('administrator'), api.addCategory);
		app.post('/api/category/edit', auth.ensureAuth(true, 'api'), auth.requireRole('administrator'), api.editCategory);

		
		// Social Account Verification

		app.get('/pinterest-verify', auth.ensureAuth(true, 'page'), auth.requireRole('administrator'), function (req, res) { res.redirect('/pinterest-20af9.html') })

	}
	
	// Redirect all others to a 404
	
	app.get('/*', function(req, res) {
		res.send("404 not found :)", 404);
	});

}