'use strict';

/* Controllers */

cats.controller('Main', function ($window, $rootScope, $scope, $templateCache, $location, AuthService, SocketIO, $route, Feed, Entry, User) {
	
	console.log("ROUTE---");
	console.dir($location.url());
	console.log("--------");
	console.log("AUTH---");
	console.dir($rootScope.currentUser);
	console.dir($rootScope.user);
	console.dir($rootScope.isLoggedIn);
	console.log("-------");

	$rootScope.$on('$routeChangeStart', function (e, newRoute, oldRoute) {
		console.log("MAIN - ROUTE CHANGE START");
		console.dir($rootScope.slideLink);
		//console.dir(oldRoute.$$route.originalPath);
		//console.dir(newRoute.$$route.originalPath);
		$rootScope.fade = false;
		$rootScope.slideup = false;
		if (oldRoute !== undefined) {
			if (oldRoute.$$route.originalPath.match('/register/')) {
				console.log("SRC SLIDE");
				$rootScope.slideup = true;
			}
		}

		if ($rootScope.slideLink == true) {
			console.log("SLIDE UP!!!!!!");
			$rootScope.slideup = true;
			if (!$scope.$$phase) $scope.$digest();
		}
	});

	$rootScope.$on('$routeChangeSuccess', function (e, newRoute, oldRoute) {
		console.log("MAIN - ROUTE CHANGE SUCCESS");
		console.dir($rootScope.slideLink);
		console.dir(e);
		console.dir(oldRoute);
		console.dir(newRoute);
		$rootScope.fade = false;
		$rootScope.slideup = false;
		$scope.alert = false;
		if (oldRoute === undefined && newRoute.$$route.originalPath.match('/register/')) {
			console.log("DEST FADE");
			$rootScope.fade = true;
		} else if (oldRoute !== undefined) {
				if (oldRoute.$$route.originalPath.match('/register/') && newRoute.$$route.originalPath == '/feed') {
					$rootScope.slideup = false;
					$rootScope.fade = true;

					setTimeout(function () {
						$rootScope.slideup = false;
						$rootScope.fade = false;

						/*$scope.alert = { 
							show: true, 
							message: 	"<span class='big'>Hi!</span>" +
										"<br /><span class=''>You're about to discover to great blogs.</span>" +
										"<br /><span class='very-small thin'>Tip: Favorite blogs you like so you don't forget them!</span>" +
										//"&nbsp;&nbsp;&nbsp;<a href='http://www.instagram.com/pictoral_ly' class='gray' target='_blank'><i class='fa fa-instagram'></i></a>" +
										//"&nbsp;&nbsp;<a href='http://www.twitter.com/pictoral_ly' class='gray' target='_blank'><i class='fa fa-twitter'></i></a>" +
										//"&nbsp;&nbsp;<a href='http://www.pinterest.com/pictorally' class='gray' target='_blank'><i class='fa fa-pinterest'></i></span></a>" +
										"<span class='white'><br /><br />&#60;3 The Smörgåsbord Team</span>"
						};*/

						if (!$scope.$$phase) $scope.$digest();
					}, 1000);
				} else if (oldRoute.$$route.originalPath.match('/register/')) {
					console.log("DEST SLIDE");
					$rootScope.slideup = true;
				}
		}

		if ($rootScope.slideLink == true) {
			console.log("SLIDE UP!!!!!!");
			$rootScope.slideup = true;
			if (!$scope.$$phase) $scope.$digest();
		}
	});
	
	//Manage Auth
		
	$rootScope.register = function (catUser) {
		console.dir(catUser);
		AuthService.register(catUser, function (status) {
			console.log(status);
			
			$rootScope.isLoggedIn = 1;
			$rootScope.currentUser = AuthService.currentUser();
			console.log("auth change / " + $rootScope.isLoggedIn + " / " + $rootScope.currentUser);
			
			console.log("LOGIN / ADD USER");
			SocketIO.emit('adduser', $rootScope.currentUser);
			
			// WARNING:  Need to make sure registration was successful...
			$location.path('/upload-avatar');
		});
	}
	
	/*$rootScope.login = function (catUser) {
		AuthService.login(catUser, function (data) {
			if (data) {

				$rootScope.isLoggedIn = 1;
				$rootScope.currentUser = AuthService.currentUser();
				console.log("auth change / " + $rootScope.isLoggedIn + " / " + $rootScope.currentUser.username);
				
				console.log("LOGIN / ADD USER");
				SocketIO.emit('adduser', $rootScope.currentUser.username);
				
				// WARNING:  This is messing with the routing...
				$window.location.href = '/admin';
			} else 
				$scope.error = "Invalid username or password!"
		});
	}*/
	
	$rootScope.logout = function (catUser) {
		console.log("logging out!");
		
		//WARNING: Other user specific data needs to be removed on logout.
		
		AuthService.logout(function (status) {
			console.log(status);

			//$templateCache.removeAll();
			$rootScope.$destroy();
			$window.location.href = '/login';
			
			/*$rootScope.isLoggedIn = 0;
			SocketIO.emit('removeuser');
			$rootScope.user = [];
			$rootScope.currentUser = [];
			SocketIO.connect();*/
		});
	}
	
	$rootScope.cats = [];
	
	// Socket
	
	/*SocketIO.on('connect', function() {
		
		// Call the server-side function 'adduser' and send one parameter (value of prompt)
		
		console.log("current user (on socket connect): " + $rootScope.currentUser.username);
		
	});

	SocketIO.on('logged in', function(data) {
		console.log("socket event: logged in");
		console.dir($rootScope.cats.length);
		
		var catsLength = $rootScope.cats.length;
		
		for(var i = 0; i < catsLength; i++) {
			console.dir($rootScope.cats.length);
			
			if ($rootScope.cats[i].username === data) {
				$rootScope.cats[i].online = 1;
				return;
			}
			
			// Add the newly registered if they're not found
			
			if (i == ($rootScope.cats.length - 1)) {
				console.log("NEW USER ADDED");
				$rootScope.cats.push(
					{ "username": data, "online": 1 }
				);
			}
		}
		console.dir($rootScope.cats);
		console.log(data);
	});
	
	SocketIO.on('logged out', function(data) {
		console.log("user disconnecting");
		
		for(var i = 0; i < $rootScope.cats.length; i++) {
			if($rootScope.cats[i].username === data) {
				$rootScope.cats[i].online = 0;
			}
		}
		console.dir($rootScope.cats);
		console.log(data);
	});
	
	SocketIO.on('log out', function() {
		console.log("LOG OUT EVENT");
		$rootScope.logout();
	});
	
	SocketIO.on('not authenticated', function() {
		$location.path('/');
	});
	
	SocketIO.on('init content', function(data) {
		console.log("Content received!");
		$rootScope.entries = data;
		console.dir($rootScope.entries);
			
	});
	
	SocketIO.on('new content', function(data) {
		console.log("New content received!");
		$rootScope.entries = data.concat($rootScope.entries);
		console.dir($rootScope.entries);
	});
	
	SocketIO.on('more content', function(data) {
		console.log("More content received!");
		$rootScope.entries = $rootScope.entries.concat(data);
		console.dir($rootScope.entries);
	});	
	
	SocketIO.on('test', function(data) {
		console.log("~~~~");
		console.log(data);
		console.log("~~~~");
	});*/	

	/*$scope.addFeed = function (feed) {
		User.addFeed(feed.id, function (data) {
			if (data) {
				console.log("Feed added.");
				$rootScope.currentUser.feeds.push(data);
				feed.isSubscribed = true;
				feed.subscribers.push($rootScope.currentUser);
				console.dir($rootScope.currentUser);

				// Mixpanel tracking //
				mixpanel.track('subscribe', {
					"feed": feed.title,
				});
				///////////////////////

			} else {
				console.log("Cat not found :(");
			}
		});
	}

	$scope.$on('$routeChangeStart', function(next, current) { 
        $(window).unbind('scroll');
        $(window).unbind('keydown');
    });*/
});

cats.controller('Header', function ($scope, $location) {
	$scope.nav = {
		discover: {
			title: "Discover",
			subtitle: "Great blogs posting right now."
		},
		collections: {
			title: "Collections",
			subtitle: "Cool people discovering cool blogs."
		},
		directory: {
			title: "Directory",
			subtitle: "Our library of amazing blogs - Help us discover more!"
		},
		sidebar: {
			title: "Sidebar",
			subtitle: "Open a world of settings."
		},
		snapshots: {
			title: "Snapshots",
			subtitle: "See what's being discovered."
		},
		account: {
			title: "Account",
			subtitle: "All of your cool account stuff."
		},
		userProfile: {
			title: "Profile",
			subtitle: "Snapshots & Stats"
		},
		findSimilar: {
			title: "Find Similar",
			subtitle: "Blogs like that other one."
		},
	};

	/*if ($scope.nav.indexOf(_.findWhere($scope.nav, {url: $location.path()})) >= 0)
		$scope.nav[$scope.nav.indexOf(_.findWhere($scope.nav, {url: $location.path()}))].current = true;
	console.log("NAV");
	console.dir($scope.nav);

	console.log("ROUTE");
	console.dir($location.path());*/
});

cats.controller('CreateProfile', function ($rootScope, $scope, $location, Feed) {
	//listen for the file selected event
    $scope.$on("fileSelected", function (event, args) {
        $scope.$apply(function () {            
            //add the file object to the scope's files collection
            $scope.image = args.file;
        });
    });

    // File type error
    $scope.$on("fileTypeError", function (event, args) {
        console.log("%s is not a supported file type.", args);
    });

	$scope.uploadUserAvatar = function () {
		console.log("IMAGE UPLOAD: %s", $scope.image);
		console.dir($scope);
		console.dir($rootScope.currentUser);
		if ($scope.image) {
			Feed.uploadAvatar($rootScope.currentUser.id, $scope.image, "user", function (response) {
				console.log("RESPONSE: %s", response);
				if (response) {
					console.log("UPLOAD SUCCESS");
					$scope.avatar.avatar = response + "#" + new Date().getTime();
				} else {
					console.log("UPLOAD FAILURE");
				}

				$scope.image = null;
				$("#userAvatarUpload").val(null);
			});
		} else {
			console.log("No file selected.");
		}
	}

	$scope.go = function ( path ) {
		$location.path( path );
	};
});

cats.controller('Cats', function ($location, $rootScope, $scope, $routeParams, Feeds, $sce, $compile, Categories) {
	//$scope.welcome = true;
	$rootScope.yellow = false;

	// Set header
	if ($location.path() == '/feed') {
		$scope.page = { title: 'feed', current: true, feed: true };
	} else if ($location.path() == '/favorites') {
		$scope.page = { title: 'favorites', current: true, favorites: true };
		$scope.pageTitle = "MY FAVORITES";
	} else if ($location.path().slice(0, 5) == '/list') {
		$scope.page = { title: 'list', current: true, list: true };
	}

	// Sorting feeds
	$scope.feedTabs = 	[
							{name: 'Favorites', value: 'favorites', active: false },
							{name: 'Suggested', value: 'suggested', active: true },
							{name: 'Everything Else', value: 'everything', active: false },
						];

	/*$scope.topMenu = "<div class='tabs'>" +
						"<ul>" +
							"<li ng-repeat='tab in feedTabs' ng-click='tabFeeds(tab.value)' class='tab' ng-class='{ &quot;tab-highlighted&quot;: tab.active }' pct-mx='tab {{ tab.value }}'>{{ tab.name }}<pct-tab-update></pct-tab-update></li>" +
						"</ul>" +
					"</div>";*/

	/*if ($routeParams !== undefined && _.findWhere($scope.feedTabs, { value: $routeParams.filter })) {
		$scope.feedTabs[_.indexOf($scope.feedTabs, _.findWhere($scope.feedTabs, { value: $routeParams.filter }))].active = true;
	} else {
		$scope.feedTabs[_.indexOf($scope.feedTabs, _.findWhere($scope.feedTabs, { value: 'suggested' }))].active = true;
	}*/

	console.dir($scope.feedTabs);

	$scope.tabFeeds = function (filter) {
		if (!$scope.loading) {
			$scope.$broadcast('newFeeds', filter);
			_.each($scope.feedTabs, function (elm, i, list) {
				if (elm.active) list[i].active = false;
				else if (elm.value == filter) list[i].active = true;
			});
			console.dir($scope.feedTabs);
			$scope.welcome = false;
			if ($scope.alert !== undefined) $scope.alert.show = false;
		}

	}

	/*$scope.getFeeds = function (order, options) {
		if ($scope.feedScope) $scope.feedScope.$destroy();
		$scope.feedScope = $scope.$new();
		$scope.loaded = false;

		$scope.$broadcast('feedsLoading');

		console.log("GET %s FEEDS ", order);

		console.dir($scope.orderOptions);

		Feeds.get('new', options).then(function (result) {
			if (result.status == 200) {
				$scope.feedScope.feedList = result.data;
				console.dir(result.data);

				$scope.scrollCount = 10;

				$scope.feedScope.feeds = result.data.slice(0, 10);

				console.log("CONTENT LOADED");
				console.dir($scope.feedScope.feedList);
				$scope.loading = false;

				$scope.$broadcast('feedsLoaded');

				//$scope.loadFeeds(function () { });

			} else {
				$scope.feedScope.feedList = [];
				$scope.$broadcast('feedsLoaded');
				$scope.loading = false;
				$scope.loaded = true;
			}

			//return null;
		});
	}

	$scope.loadFeeds = function (callback) {
		console.log($scope.scrollCount);
		console.log($scope.feedScope.feedList);
		if ($scope.scrollCount < $scope.feedScope.feedList.length) {
			$scope.$broadcast('feedsLoading');
			Feeds.load($scope.feedScope.feedList.slice($scope.scrollCount, $scope.scrollCount+10), function (data) {

				if (data) {
					console.log(data);

					_.each(data, function (elm) {
						$scope.feedScope.feeds.push(elm);
						//if (!$scope.$$phase) $scope.$digest();
						console.log("BROADCAST - loadMoreImages%s", elm.id);
						$scope.$broadcast('loadMoreImages' + elm.id);
					});
					

					// Mixpanel tracking //
					mixpanel.track('load feeds', {
						'Feed List Length': $scope.feedScope.feeds.length
					});
					///////////////////////

					//$scope.feeds += data;
					$scope.scrollCount += 10;
					//$scope.$emit('feedsLoaded');
					$scope.$broadcast('feedsLoaded');
					//loading = false;
					$scope.loading = false;

					if ($scope.scrollCount >= $scope.feedScope.feedList.length) {
						console.log("Everything is already loaded!");
						$scope.loaded = true;
						$scope.loading = false;
						if (!$scope.$$phase) $scope.$digest();
					}

				} else {
					console.log("Everything is already loaded!");
					$scope.loaded = true;
					$scope.loading = false;
					if (!$scope.$$phase) $scope.$digest();
				}

				data = null;
				return null;
			});
		} else {
			console.log("Everything is already loaded!");
			$scope.loaded = true;
			$scope.loading = false;
			if (!$scope.$$phase) $scope.$digest();
		}

		return callback();
	}*/

	// Newsletter sign up

	/*$scope.signup = function (form) {
		$scope.submittingNewsletterSignup = true;
		//if (!$scope.$$phase) $scope.$digest();
		$scope.signupFooter = {};

		$http.post('/api/signup/newsletter', form).
		success(function(data, status) {
			
			switch(status) {
				case 200:
					$scope.signupFooter.state = 'confirmation';
					$scope.signupFooter.message = 'Thanks for signing up - you\'re good to go!';
					break;
				default:
					$scope.signupFooter.message = 'Please try again.';
					break;
			}
			$scope.form = null; // Clear form
			console.log($scope);

			$scope.submittingNewsletterSignup = false;
		}).
		error(function(data, status) {
			switch(status) {
				case 400:
					$scope.signupFooter.message = 'Need a real email...';
					break;
				case 409:
					$scope.signupFooter.state = 'confirmation';
					$scope.signupFooter.message = 'Thanks for signing up again, but you\'re already good to go!';
					break;
				default:
					$scope.signupFooter.message = 'Please try again.';
					break;
			}
			$scope.form = null; // Clear form
			console.log($scope);

			$scope.submittingNewsletterSignup = false;
			//if (!$scope.$$phase) $scope.$digest();
		});
	}

	$scope.hideSignupFooter = function() {
		$scope.signupFooterHidden = true;
	}*/

	console.log("GET FEEDS PARAMS");
	console.dir($routeParams);
	//if (_.isEmpty($routeParams)) $scope.welcome = true;
	//$scope.getFeeds('new', _.findWhere($scope.feedTabs, {active:true}).value);
	if ($location.path() == '/feed') {
		$scope.filter = 'suggested';
	} else if ($location.path() == '/favorites') {
		$scope.filter = 'favorites';
	} else if ($location.path().slice(0, 5) == '/list') {
		$scope.filter = 'list';
		$scope.subFilter = $routeParams.list;
	}

	console.log("FILTER? - %s", $scope.filter);

	$rootScope.lockedFeeds = false;

	$scope.$on('firstFeedsLoaded', function () {
		console.log("LOCK FEEDS?");
		if ($rootScope.currentUser !== undefined) {
			if ($rootScope.currentUser.favoriteFeeds.length == 0) {
				//$rootScope.$broadcast('lock feeds');
				$rootScope.noFavorites = true;
			}

			if ($rootScope.currentUser.snapshotCount == 0) {
				$rootScope.noSnapshots = true;
			}
		} else {
			$scope.$on('userLoaded', function () {
				if ($rootScope.currentUser.favoriteFeeds.length == 0) {
					//$rootScope.$broadcast('lock feeds');
					$rootScope.noFavorites = true;
				}

				if ($rootScope.currentUser.snapshotCount == 0) {
					$rootScope.noSnapshots = true;
				}
			});
		}
	});
});

cats.controller('Feed', function ($scope, $routeParams, Feed) {
	Feed.load($routeParams.id, function (feed) {
		if (feed) {
			console.log("FEED");
			console.dir(feed);
			$scope.feed = feed;
			console.log($scope.feed.instagramUsername);

			if ($scope.feed.instagramUsername) {
				Feed.loadRecentInstagram($scope.feed.instagramUsername).then(function (results) {
					console.log("INSTAGRAM");
					console.dir(results);
					_.each(results.data, function (elm, i) {
						results.data[i].width = 300;
						results.data[i].height = 300;
						if (results.data[i].caption) results.data[i].entryTitle = results.data[i].caption.text;
						else results.data[i].entryTitle = "";
						results.data[i].entryUrl = results.data[i].link;
						results.data[i].entryPublishDate = new Date(parseInt(results.data[i].created_time)*1000);
					});
					$scope.instagramImages = results.data;
				});
			}

			if ($scope.feed.twitterUsername !== undefined) {
				Feed.loadRecentTweet($scope.feed.twitterUsername).then(function (results) {
					console.log("TWEET");
					console.dir(results);
					
					$scope.recentTweet = results.data;
				});
			}
		}
	});

	Feed.loadImages($routeParams.id).then(function (results) {
		console.log("IMAGES");
		console.dir(results);
		$scope.images = results.data;
	});

	Feed.getNext($routeParams.id).then(function (results) {
		console.log("NEXT FEED");
		console.dir(results);
		$scope.nextFeed = results.data.nextFeed;
		$scope.previousFeed = results.data.previousFeed;
	});
});

cats.controller('Collection', function ($scope, Collection, $routeParams) {
	// Set header
	$scope.header = { clear: false };

	Collection.get($routeParams.id, function (collection) {
		$scope.collection = collection;
		console.log("COLLECTION");
		console.dir($scope.collection);
	});
});

/*cats.controller('Home', function ($scope, $http, Feeds, Collections) {	
	Collections.get({ limit: 4, published: true}, function (collections) {
		if (collections) {
			$scope.collections = collections;
		}
	});

	Feeds.get('new', null, null, null, null, null, null, function (feeds) {
		if (feeds) {
			$scope.feeds = feeds.slice(0, 5);
		}
	});
});*/

cats.controller('FindSimilar', function ($scope, $routeParams, Feed, Feeds) {	
	$scope.page = { title: 'findSimilar', current: true, findSimilar: true };
	Feed.load($routeParams.id, function (feed) {
		if (feed) {
			$scope.baseFeed = feed;
		}
	})

	$scope.loaded = false;

	$scope.$broadcast('feedsLoading');

	Feed.findSimilar($routeParams.id, function (feeds) {
		if (feeds) {
			console.log("FEEDS");
			console.dir(feeds);
			$scope.loading = false;
			$scope.$broadcast('feedsLoaded');
			$scope.feedList = [];
			_.each(_.pluck(feeds, 'id'), function (elm) {
				$scope.feedList.push({id: elm});
			});
			$scope.$broadcast('loadFeeds', $scope.feedList);
		} else {
			$scope.feedList = [];
			$scope.$broadcast('feedsLoaded');
			$scope.loading = false;
			$scope.loaded = true;
		}

		return null;
	});
});

cats.controller('Intro', function ($rootScope, $scope, $http, Feeds, Feed, Collections, Snapshots) {	
	$scope.intro = true;
	$rootScope.yellow = true;

	console.log("GET CATEGORIZED FEEDS");
	Feeds.getCategorizedFeeds().then(function (results) {
		if (results.data) {
			$scope.sortedFeeds = results.data;
			$scope.images = $scope.sortedFeeds[0].feeds[0].images;
			console.log("SORTED FEEDS");
			console.dir($scope.sortedFeeds);
		}
	});

	Feed.loadRecentTweet('teamsmorgasbord').then(function (results) {
		console.log("TWEET");
		console.dir(results);
		
		$scope.recentTweet = results.data;
	});

	/*Feeds.getSampleFeeds(function (feeds) {
		if (feeds) {
			console.log(feeds);
			$scope.feeds = feeds;
			$scope.introFeeds = [];

			_.each(feeds, function (elm, i) {
				console.log(((i - ((i % 5)))/5));
				
				if ($scope.introFeeds[((i - (i % 5))/5)] === undefined) {
					$scope.introFeeds[((i - (i % 5))/5)] = {};
					$scope.introFeeds[((i - (i % 5))/5)].main = [];
					$scope.introFeeds[((i - (i % 5))/5)].mirror = [];
				}
				
				if (i % 5 > 2) {
					$scope.introFeeds[((i - (i % 5))/5)].mirror.unshift(elm);
				} else {
					$scope.introFeeds[((i - (i % 5))/5)].main.push(elm);
				}
			});

			console.log('SORTED FEEDS');
			console.dir($scope.introFeeds);
			
			$scope.$broadcast('feedsLoaded');
		}

		return null;
	});*/

	/*Snapshots.get({ limit: 25 }, function (snapshots) {
		if (snapshots) {
			console.log("Snapshots found!");
			console.dir(snapshots);
			$scope.snapshots = snapshots;
		} else {
			console.log("No snapshots found :(");
		}
	});*/

	/*Collections.get({ limit: 3, published: true}, function (collections) {
		if (collections) {
			$scope.collections = [];

			_.each(collections, function (elm, i) {
				console.log(((i - ((i % 4)))/4));
				
				if ($scope.collections[((i - (i % 4))/4)] === undefined) {
					$scope.collections[((i - (i % 4))/4)] = {};
					$scope.collections[((i - (i % 4))/4)].main = [];
					$scope.collections[((i - (i % 4))/4)].mirror = [];
				}
				
				if (i % 4 > 2) {
					$scope.collections[((i - (i % 4))/4)].mirror.unshift(elm);
				} else {
					$scope.collections[((i - (i % 4))/4)].main.push(elm);
				}
			});

			//$scope.collections[$scope.collections.length-1].main.splice(1, 0, { yourCollection: true });

			console.dir($scope.collections);
		}
	});*/

	// Submit Invite Request

	$scope.request = function (invitee) {

		// Mixpanel tracking //
		mixpanel.track('request invite', {
			emailAddress: invitee.email,
		});
		///////////////////////

		$http.post('/api/request-invite', invitee).
		success(function(data, status) {
			
			switch(status) {
				case 200:
					// Success
					$scope.confirmed = true;
					break;
				default:
					// Server Error
					$scope.error = 'Please try again';
					break;
			}
			$scope.invitee = null; // Clear form
			if (!$scope.$$phase) $scope.$digest();
		}).
		error(function(data, status) {
			switch(status) {
				case 400:
					// Invalid Email
					$scope.error = 'Need a real email...';
					break;
				case 409:
					// Duplicate Email
					$scope.error = 'Email already submitted';
					break;
				default:
					// Server Error
					$scope.error = 'Please try again';
					break;
			}
			$scope.invitee = null; // Clear form
			console.log($scope);
			if (!$scope.$$phase) $scope.$digest();
		});
	}

	$scope.confirmed = false;
});


cats.controller('Collections', function ($scope, Collections) {
	// Set header
	$scope.page = { title: 'collections', current: true, collections: true };

	Collections.get({ published: true }, function (collections) {
		if (collections) {
			console.dir(collections);
			$scope.collections = collections;
		} else {
			console.log("No collections found :(");
		}
	});
});

cats.controller('Snapshots', function ($rootScope, $scope, Snapshots, SocketIO) {
	// Set header
	$scope.page = { title: 'snapshots', current: true, snapshots: true };
	$scope.snapshots = [];

	// For the future
	/*SocketIO.on('connect', function() {	
		// Call the server-side function 'adduser' and send one parameter (value of prompt)
		console.log("current user (on socket connect): " + $rootScope.currentUser.username);
	});

	SocketIO.on('new snapshot', function(snapshot) {
		console.log("new snapshot!!");
		$scope.snapshots.unshift(snapshot);
		$scope.snapshots.pop();	
		console.dir(snapshot);
		//if (!$scope.$$phase) $scope.$digest();
	});*/

	Snapshots.get({ limit: 100 }, function (snapshots) {
		if (snapshots) {
			console.dir(snapshots);
			$scope.snapshots = snapshots;
		} else {
			console.log("No snapshots found :(");
		}
	});
});

cats.controller('Directory', function ($scope, Feeds) {
	// Set header
	$scope.page = { title: 'directory', current: true, directory: true };

	Feeds.get('alphabetical', null).then(function (result) {
		
		// Process feeds on callback
		
		console.log('FEEDS');
		console.dir(result.data);
		$scope.feeds = result.data;
		$scope.sortedFeeds = [];
		$scope.badges = [];

		var pattern = /^[A-Z]/i;

		_.each($scope.feeds, function (elm, i, list) {

			if (pattern.test(elm.title.charAt(0))) {
				var label = elm.title.charAt(0).toUpperCase();
			} else {
				var label = '#';
			}

			var section = _.findWhere($scope.sortedFeeds, {label: label}),
				sectionIndex = _.indexOf($scope.sortedFeeds, section);

			if (section === undefined) {
				var newSection = {};

				newSection.label = label;
				newSection.feeds = [elm];

				$scope.sortedFeeds.push(newSection);
			} else {
				console.log("%s exists - pushing %s into %d", label, elm.title, sectionIndex);
				$scope.sortedFeeds[sectionIndex].feeds.push(elm);
			}

			// Process badges

			list[i].badges = _.intersection(elm.badges, ['Popular', 'Newly Added']);

			// Badge classes

			$scope.badgeClasses = {
				'Popular': 'night',
				'Newly Added': 'day'
			};

			console.dir($scope.badgeClasses);

			_.each(list[i].badges, function (elm, i, list) {
				$scope.badges.push(elm);
			});

			$scope.badges = _.unique($scope.badges);

		});

		console.dir($scope.sortedFeeds);

	});
});

cats.controller('Login', function ($scope, $rootScope, $routeParams, $window, AuthService, SocketIO) {	
	$rootScope.yellow = true;
	console.log($scope);

	$scope.login = function (user) {
		AuthService.login(user, function (data) {
			if (data) {

				$rootScope.isLoggedIn = 1;
				$rootScope.currentUser = AuthService.currentUser();
				console.log("auth change / " + $rootScope.isLoggedIn + " / " + $rootScope.currentUser.username);
				
				console.log("LOGIN / ADD USER");
				SocketIO.emit('adduser', $rootScope.currentUser.username);
				
				// WARNING:  This is messing with the routing...
				console.log("REFERRED FROM: %s", $routeParams.ref);
				$window.location.href = $routeParams.ref || '/';
			} else {
				console.log("LOGIN FAIL");
				$scope.error = "Invalid username or password!"
			}
		});
	}
});

cats.controller('Register', function ($rootScope, $scope, $location, AuthService, $routeParams) {
	console.log('REGISTER');
	$scope.hash = $routeParams.hash;
	$rootScope.yellow = true;

	console.dir($scope.registerInfo);
	console.dir($scope.user);

	$scope.registerInfoSubmit = function (user) {
		console.log('REGISTER 1');
		$location.path('/register/3/' + $scope.hash);
	};

	$scope.registerInfo2Submit = function (user) {
		console.dir(user);
		AuthService.register(user, $scope.hash).then(function (result) {
			if (result.status == 200) {
				console.log(result.status);
				console.dir(result.data);
				
				$rootScope.isLoggedIn = 1;
				$rootScope.currentUser = result.data;
				console.log("auth change / " + $rootScope.isLoggedIn + " / " + $rootScope.currentUser);
				
				console.log("LOGIN / ADD USER");
				console.dir($rootScope.currentUser);

				// Mixpanel tracking //
	            mixpanel.identify($rootScope.currentUser.id);
	            ///////////////////////
				
				$location.path('/register/4/'  + $scope.hash);
			} else {
				// WARNING:  Need to make sure registration was successful...
			}
		});
	};

	$scope.registerInfo3Submit = function (user) {
		console.log("REGISTRATION DONE");
		$location.path('/');
	};
	console.dir($scope);
});

cats.controller('Account', function ($scope, Snapshots, $rootScope, User) {
	// Set header
	$scope.page = { title: 'account', current: true, account: true };
	//$scope.user = $rootScope.currentUser;
	//console.log($scope.user);

	$scope.changePassword = function(password) {
		User.changePassword(password, function (data, status) {
			if (status == 200) {
				$scope.passwordMessage = 'Password changed successfully!';
				$scope.passwordError = false;
				$scope.newPassword = false;
				$scope.password = null;
			} else if (status == 406) {
				$scope.passwordMessage = 'Something went wrong. Please try again.';
				$scope.passwordError = true;
				$scope.password = null;
			} else if (status == 400) {
				$scope.passwordMessage = 'You didn\'t enter your current password!';
				$scope.passwordError = true;
				$scope.password.current = null;
			} else {
				$scope.passwordMessage = 'Something went wrong. Please try again.';
				$scope.passwordError = true;
				$scope.password = null;
			}
		})
	}

	$scope.resetPassword = function () {
		console.log($scope.password);
		//$scope.updatePassword.$setPristine();
		$scope.newPassword = false;
		$scope.password = null;
		$scope.passwordMessage = null;

		console.log($scope.password);
	}

});

cats.controller('UserProfile', function ($scope, $rootScope, $routeParams, Snapshots, User) {
	// Set header
	$scope.page = { title: 'userProfile', current: true, userProfile: true };
	$scope.section = 'snapshots';
	$scope.snapshotSection = true;

	User.get($routeParams.username, function (user) {
		if (user) {
			$scope.user = user;
			if (angular.equals($scope.user.id, $rootScope.currentUser.id)) {
				$scope.page.myProfile = true;
				$scope.currentUserProfile = true;
				$scope.user.hiddenFeeds = $rootScope.currentUser.hiddenFeeds || [];
			}
			console.log('CURRENT USER? %s', angular.equals($scope.user.id, $rootScope.currentUser.id));
			console.dir($scope.user);
		}
		
		Snapshots.get({ userId: $scope.user.id }, function (snapshots) {
			if (snapshots) {
				console.dir(snapshots);
				$scope.snapshots = snapshots;
				
				if ($scope.snapshots.length == 0) {
					console.log("No snapshots found :(");
					$scope.placeholder = {
						title: 'No snapshots yet!',
						message: "Check out the feed to find stuff to snapshot."
					}
				}
			}
		});

	});

	$scope.changeSection = function (section) {
		
		if (section != $scope.section) {
			$scope.showHidden = false;
			$scope.placeholder = null;

			switch (section) {
				case 'snapshots':
					$scope.section = 'snapshots';

					if ($scope.snapshots.length == 0) {
						console.log("No snapshots found :(");
						$scope.placeholder = {
							title: 'No snapshots yet!',
							message: "Check out the feed to find stuff to snapshot."
						}
					}
					break;
				case 'favorites':
					$scope.filter = null;
					$scope.feedList = [];
					_.each($scope.user.favoriteFeeds, function (elm) {
						$scope.feedList.push({id: elm});
					});
					$scope.section = 'favorites';
					break;
				case 'hidden':
					$scope.filter = 'hidden';
					$scope.section = 'hidden';
					$scope.showHidden = true;
					break;
			}
		}
	}
});











/*cats.controller('Feed', function ($rootScope, $scope, Feeds, Feed, $location, $routeParams, User, Entry) {
	if (Feeds.list()) {
		$scope.feedList = Feeds.list();

		$scope.previousFeed = {};
		$scope.nextFeed = {};

		$scope.previousFeed.id = angular.equals($scope.feedList.indexOf($routeParams.id), 0) ? null : $scope.feedList[$scope.feedList.indexOf($routeParams.id)-1];
		$scope.nextFeed.id = angular.equals($scope.feedList.indexOf($routeParams.id), $scope.feedList.length-1) ? null : $scope.feedList[$scope.feedList.indexOf($routeParams.id)+1];

		if ($scope.previousFeed.id) {
			Feed.load($scope.previousFeed.id, function(data) {
				if (data) {
					$scope.previousFeed.title = data.title;
					$scope.previousFeed.avatar = data.avatar;
				}
			});
		}

		if ($scope.nextFeed.id) {
			Feed.load($scope.nextFeed.id, function(data) {
				if (data) {
					$scope.nextFeed.title = data.title;
					$scope.nextFeed.avatar = data.avatar;
				}
			});
		}
	}

	$scope.initFeed = function (feedId) {
		Feed.load(feedId, function(data) {
			if (data) {
				console.log("Feed found.");
				console.dir(data);
				$scope.feed = data;
				$scope.feed.isSubscribed = ($rootScope.currentUser.feeds.indexOf($scope.feed.id) + 1) ? true : false;

			} else {
				console.log("Cat not found :(");
			}

			$scope.$broadcast("feedContentLoaded");
		});
	}

	$scope.loadContent = function (callback) {
		var lastPost = _.last($scope.feed.entries),
			cutoffDate = lastPost.publishDate || null;

		console.dir($scope.feed);
		console.dir(lastPost);
		console.dir(cutoffDate);

		Feed.loadContent($scope.feed.id, 5, cutoffDate, function (data) {
			console.log("LOAD CONTENT COMPLETE");
			console.dir(data);
			_.each(data, function (elm, i) {
				$scope.feed.entries.push(elm);
			});

			callback();
		});
	}

	$scope.expandPost = function (feed, entry) {
		entry.isExpanded = true;

		// Mixpanel tracking //
		mixpanel.track('expand post', {
			"feed": feed.title,
			"entry": entry.title
		});
		///////////////////////

		Entry.markAsRead(feed, entry, function(data) {
			console.log(data);
		});
	}

	console.log("LOCATION path() - %s", $location.path());
	if ($location.path().slice(0,5) == '/feed') {
		$scope.isChild = false;
		$scope.initFeed($routeParams.id);
	} else {
		$scope.isChild = true;
	}
});*/