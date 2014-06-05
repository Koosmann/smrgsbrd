'use strict';

/* Admin Controllers */

cats.controller('Admin', function ($scope) {

});

cats.controller('AdminFeeds', function ($scope, $route, Feed, Feeds, $http) {

	$http.get('/api/admin/feeds/alphabetical').then(function (result) {
		if (result.status == 200) {
			console.log(result.data);
			$scope.feedList = result.data;
			//$scope.feeds = _.sortBy($scope.feedList, "title");
			$scope.feeds = $scope.feedList;

			console.log("CONTENT LOADED");
			console.dir($scope.feeds);

			/*Feeds.load($scope.feedList, function (data) {
				console.log(data);


				$scope.feeds = _.sortBy(data, "title");

				console.log("CONTENT LOADED");
				console.dir($scope.feeds);
			});*/
		}
		
	});

	$scope.feed = {};

	// Category selection handling...
	//Need to dynamically get categories in the future...
	$scope.categories = [	'Photography',
							'Art & Illustration',
							'Curated',
							'Food',
							'Maker & Craft',
							'Home & Interiors',
							'Product Design',
							'Graphic Design',
							'Architecture',
							'Clothing & Fashion',
							'Image Only',
							'Journal'
						];

	var updateSelected = function(action, id) {
	  	if (!$scope.feed.categories)
	  		$scope.feed.categories = [];

	  	if (action == 'add' & $scope.feed.categories.indexOf(id) == -1)
	    	$scope.feed.categories.push(id);
	  	if (action == 'remove' && $scope.feed.categories.indexOf(id) != -1)
	    	$scope.feed.categories.splice($scope.feed.categories.indexOf(id), 1);
	};

	$scope.updateSelection = function($event, id) {
	  	var checkbox = $event.target;
	  	var action = (checkbox.checked ? 'add' : 'remove');
	  	updateSelected(action, id);
	  	console.dir($scope.feed);
	};

	$scope.isSelected = function(id) {
	  	if ($scope.feed.categories)
	  		return $scope.feed.categories.indexOf(id) >= 0;
	  	else
	  		return null;
	};

	// Feed action handling...
	$scope.openEditModal = function (feed) {
		console.log("OPEN EDIT FEED");
		console.dir(feed);
		
		$("#avatarUpload").val(null);
		
		$scope.feed = angular.copy(feed);
		if (!$scope.feed.avatar)
			$scope.feed.avatar = {};

		$('#editFeed').modal('show');
	}

	$scope.openAddModal = function () {
		$('#addFeed').modal('show');
	}

	$scope.addFeed = function (feed) {
		console.log("ADD FEED");
		console.dir(feed);
		
		Feed.add(feed, function (response) {
			if (response) {
				console.dir(response);

				console.log("ADD SUCCESS");
				$scope.feeds.push(response);
			} else {
				console.log("ADD FAILURE");
			}

			$scope.feed = {};
			$('#addFeed').modal('hide');
		});
	}

	$scope.saveFeed = function (feed) {
		console.log("EDIT FEED: %s", feed.feedUrl);
		console.dir(feed);
		
		Feed.edit(feed, function (response) {
			console.dir(response);
			if (response) {
				console.log("EDIT SUCCESS");
				var feedToUpdate = $scope.feeds.indexOf(_.findWhere($scope.feeds, {id: response._id}));
				console.dir(feedToUpdate);

				$scope.feeds[feedToUpdate].title = response.title;
				$scope.feeds[feedToUpdate].author = response.author;
				$scope.feeds[feedToUpdate].url = response.url;
				$scope.feeds[feedToUpdate].feedUrl = response.feedUrl;
				$scope.feeds[feedToUpdate].description = response.description;
				$scope.feeds[feedToUpdate].categories = response.categories;
				$scope.feeds[feedToUpdate].storeUrl = response.storeUrl;
				$scope.feeds[feedToUpdate].portfolioUrl = response.portfolioUrl;
				$scope.feeds[feedToUpdate].newsletterSignupUrl = response.newsletterSignupUrl;
				$scope.feeds[feedToUpdate].twitterUrl = response.twitterUrl;
				$scope.feeds[feedToUpdate].instagramUrl = response.instagramUrl;
				$scope.feeds[feedToUpdate].facebookUrl = response.facebookUrl;
				$scope.feeds[feedToUpdate].pinterestUrl = response.pinterestUrl;
				$scope.feeds[feedToUpdate].tumblrUrl = response.tumblrUrl;
				$scope.feeds[feedToUpdate].flickrUrl = response.flickrUrl;
				$scope.feeds[feedToUpdate].etsyUrl = response.etsyUrl;
				$scope.feeds[feedToUpdate].city = response.city;
				$scope.feeds[feedToUpdate].state = response.state;
				$scope.feeds[feedToUpdate].country = response.country;
				$scope.feeds[feedToUpdate].hidden = response.hidden;
			} else {
				console.log("EDIT FAILURE");
			}

			$scope.feed = {};
			$('#editFeed').modal('hide');
		});
	}

	/* $scope.updateFeed = function (feed) {
		console.log("UPDATE FEED: %s", feed.feedUrl);
		console.dir(feed);

		feed.loading = true;
		Feed.update(feed, function (response) {
			console.dir(response);
			if (response) {
				console.log("UPDATE SUCCESS");
				feed.loading = false;
				var feedToUpdate = $scope.feeds.indexOf(_.findWhere($scope.feeds, {id: response.id}));
				console.dir(feedToUpdate);

				$scope.feeds[feedToUpdate].entryCount = response.entryCount;
				$scope.feeds[feedToUpdate].lastPublished = response.lastPublished;
			} else {
				console.log("UPDATE FAILURE");
			}
		});
	} */
	
	////////////////////
	// Image handling //
	////////////////////

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

	$scope.uploadImage = function (feed) {
		console.log("IMAGE UPLOAD: %s", $scope.image);
		console.dir($scope.image);
		if ($scope.image) {
			Feed.uploadAvatar(feed.id, $scope.image, "feed", function (response) {
				console.log("RESPONSE: %s", response);
				if (response) {
					console.log("UPLOAD SUCCESS");

					// Show image...
					$scope.feed.avatar = response + "#" + new Date().getTime();
					var feedToUpdate = $scope.feeds.indexOf(_.findWhere($scope.feeds, {id: feed.id}));
					console.dir(feedToUpdate);

					$scope.feeds[feedToUpdate].avatar = response + "#" + new Date().getTime();
					if (!$scope.$$phase) $scope.$digest();
				} else {
					console.log("UPLOAD FAILURE");
				}

				$scope.image = null;
				$("#avatarUpload").val(null);
			});
		} else {
			console.log("No file selected.");
		}
	}
});

cats.controller('AdminUsers', function($scope, $routeParams, $http, Feeds, Users, User) {
	Users.get(function (users) {
		if (users) {
			$scope.users = users;
		} else {
			console.log("No users found :(");
		}
	});

	// User action handling...
	$scope.openEditModal = function (user) {
		console.log("OPEN EDIT USER");
		console.dir(user);

		$("#avatarUpload").val(null);
		
		$scope.user = angular.copy(user);
		if (!$scope.user.avatar)
			$scope.user.avatar = {};

		$scope.newPassword = null;

		//if (!$scope.$$phase) $scope.$digest();

		$('#editUser').modal('show');
	}

	$scope.openAddModal = function () {
		$scope.user = {};
		$('#addUser').modal('show');
	}

	$scope.addNewUser = function (user) {
		console.log("ADD USER");
		console.dir(user);
		
		User.add(user, function (response) {
			if (response) {
				console.dir(response);

				console.log("ADD SUCCESS");
				$scope.users.push(response);
			} else {
				console.log("ADD FAILURE");
			}

			$scope.user = {};
			$('#addUser').modal('hide');
		});
	}

	$scope.saveUser = function (user) {
		console.log("EDIT USER: %s", user.username);
		console.dir(user);
		
		User.edit(user, function (response, status) {
			console.dir(response);
			if (response) {
				console.log("EDIT SUCCESS");
				var userToUpdate = $scope.users.indexOf(_.findWhere($scope.users, {id: response.id}));
				console.dir(userToUpdate);

				$scope.users[userToUpdate].username = response.username;
				$scope.users[userToUpdate].firstName = response.firstName;
				$scope.users[userToUpdate].lastName = response.lastName;
				$scope.users[userToUpdate].bio = response.bio;
				$scope.users[userToUpdate].email = response.email;

			} else {
				console.log("EDIT FAILURE");
			}

			$scope.user = {};
			$('#editUser').modal('hide');
		});
	}

	////////////////////
	// Image handling //
	////////////////////

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

	$scope.uploadImage = function (user) {
		console.log("IMAGE UPLOAD: %s", $scope.image);
		console.dir($scope.image);
		if ($scope.image) {
			User.uploadAvatar(user.id, $scope.image, function (response) {
				console.log("RESPONSE: %s", response);
				if (response) {
					console.log("UPLOAD SUCCESS");

					// Show image...
					$scope.user.avatar = response + "#" + new Date().getTime();
					var userToUpdate = $scope.users.indexOf(_.findWhere($scope.users, {id: user.id}));
					console.dir(userToUpdate);

					$scope.users[userToUpdate].avatar = response + "#" + new Date().getTime();
					console.dir($scope.users[userToUpdate]);
					if (!$scope.$$phase) $scope.$digest();
				} else {
					console.log("UPLOAD FAILURE");
				}

				$scope.image = null;
				$("#avatarUpload").val(null);
			});
		} else {
			console.log("No file selected.");
		}
	}

	//////////////
	// Password //
	//////////////

	$scope.resetPassword = function (id) {
		$http.post('/api/user/' + id + '/reset-password').
			success(function(data, status) {					
				if (status == 200) {
					console.log('password reset');
					$scope.newPassword = data;
				} else {
					console.log("%s - %s", status, data);
					//callback(status, data);
				}
			}).error(function(data, status) {
				console.log("%s - %s", status, data);
				//callback(status, data);
		});
	}
});

cats.controller('AdminCollections', function($scope, $routeParams, $http, Feeds, Users, Collections, Collection) {
	Collections.get({ published: false }, function (collections) {
		if (collections) {
			console.dir(collections);
			$scope.collections = collections;
		} else {
			console.log("No collections found :(");
		}
	});

	Feeds.get('alphabetical', null).then(function (result) {
		console.log(result.data);
		$scope.feedTitles = _.pluck(result.data, "title");;
		$scope.feeds = result.data;
		console.dir($scope.feedTitles);

		/*_.each($scope.collections, function (elm, x, collectionList) {
			_.each(elm.feeds, function(elm, i, list) {
				if (elm != null && _.indexOf($scope.feeds, _.findWhere($scope.feeds, {_id: elm.feedId})) > -1) 
					collectionList[x].feeds[i].title = $scope.feeds[_.indexOf($scope.feeds, _.findWhere($scope.feeds, {_id: elm.feedId}))].title;
			});
		});*/
		
	});

	// Collection action handling...
	$scope.openEditModal = function (collection) {
		console.log("OPEN EDIT COLLECTION");
		console.dir(collection);
		
		$("#avatarUpload").val(null);
		
		$scope.collection = angular.copy(collection);
		if (!$scope.collection.avatar)
			$scope.collection.avatar = {};

		//if (!$scope.$$phase) $scope.$digest();

		$('#editCollection').modal('show');
	}

	$scope.openAddModal = function () {
		$scope.collection = {};
		$('#addCollection').modal('show');
	}

	$scope.addNewCollection = function (collection) {
		console.log("ADD COLLECTION");
		console.dir(collection);
		
		Collection.add(collection, function (response) {
			if (response) {
				console.dir(response);

				console.log("ADD SUCCESS");
				$scope.collections.push(response);
			} else {
				console.log("ADD FAILURE");
			}

			$scope.collection = {};
			$('#addCollection').modal('hide');
		});
	}

	$scope.getUsernames = function (query) {
		/*Users.search(query, 'username', function (results) {
			console.log("USERNAMES");
			console.dir(results);
			return results;
		});*/

		return $http.get('/api/users/search/username/' + query)
		.then(function(response){
			console.log("USERNAMES");
			console.dir(response.data);
        	return response.data;
      	});
	}

	$scope.addFeedToCollection = function () {
		if ($scope.collection.feeds === undefined) $scope.collection.feeds = [];
		$scope.collection.feeds.push({});
	}

	$scope.removeFeedFromCollection = function (i) {
		console.log("REMOVE FEED - %s", i);
		$scope.collection.feeds.splice(i, 1);
		console.dir($scope.collection.feeds);
	}

	$scope.moveFeedUp = function (i) {
		console.log("MOVE FEED UP - %s", i);
		if (i > 0) {
			var feed = angular.copy($scope.collection.feeds[i]);
			$scope.collection.feeds.splice(i, 1);
			$scope.collection.feeds.splice(i-1, 0, feed);
		}

		console.dir($scope.collection.feeds);
	}

	$scope.moveFeedDown = function (i) {
		console.log("MOVE FEED DOWN - %s", i);
		if (i < $scope.collection.feeds.length - 1) {
			var feed = angular.copy($scope.collection.feeds[i]);
			$scope.collection.feeds.splice(i, 1);
			$scope.collection.feeds.splice(i+1, 0, feed);
		}

		console.dir($scope.collection.feeds);
	}

	$scope.saveCollection = function (collection) {
		console.log("EDIT FEED: %s", collection.title);
		console.dir(collection);

		/*_.each(collection.feeds, function(elm, i, list) {
			console.dir(_.findWhere($scope.feeds, {title: elm.title}));

			if (_.indexOf($scope.feeds, _.findWhere($scope.feeds, {title: elm.title})) > -1)
				list[i].feedId = $scope.feeds[_.indexOf($scope.feeds, _.findWhere($scope.feeds, {title: elm.title}))].id;
			else
				delete list[i];
		});*/

		console.dir(collection);
		
		Collection.edit(collection, function (status, response) {
			console.dir(response);
			if (response) {
				console.log("EDIT SUCCESS");
				console.dir(response);
				var collectonToUpdate = $scope.collections.indexOf(_.findWhere($scope.collections, {id: response.id}));
				console.dir(collectonToUpdate);

				$scope.collections[collectonToUpdate].title = response.title;
				$scope.collections[collectonToUpdate].author = response.author;
				$scope.collections[collectonToUpdate].description = response.description;
				$scope.collections[collectonToUpdate].feeds = response.feeds;

				/*_.each($scope.collections[collectonToUpdate].feeds, function(elm, i, list) {
					if (elm != null && _.indexOf($scope.feeds, _.findWhere($scope.feeds, {_id: elm.feedId})) > -1) 
						$scope.collections[collectonToUpdate].feeds[i].title = $scope.feeds[_.indexOf($scope.feeds, _.findWhere($scope.feeds, {_id: elm.feedId}))].title;
				});*/
			} else {
				console.log("EDIT FAILURE");
			}

			$scope.collection = {};
			$('#editCollection').modal('hide');
		});
	}


	$scope.publish = function (id) {
		Collection.publish(id, function (status, data) {
			console.dir(data);
			if (status == 200) {
				console.log("PUBLISH SUCCESS");
				
				var collectonToUpdate = $scope.collections.indexOf(_.findWhere($scope.collections, {id: id}));

				$scope.collections[collectonToUpdate].published = true;
				$scope.collections[collectonToUpdate].publishDate = false;
				console.dir($scope.collections[collectonToUpdate]);
			} else {
				console.log("PUBLISH FAILURE :(");
			}
		});
	}

	////////////////////
	// Image handling //
	////////////////////

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

	$scope.uploadImage = function (collection) {
		console.log("IMAGE UPLOAD: %s", $scope.image);
		console.dir($scope.image);
		if ($scope.image) {
			Collection.uploadCover(collection.id, $scope.image, function (response) {
				console.log("RESPONSE: %s", response);
				if (response) {
					console.log("UPLOAD SUCCESS");

					// Show image...
					$scope.collection.avatar = response + "#" + new Date().getTime();
					var collectionToUpdate = $scope.collections.indexOf(_.findWhere($scope.collections, {id: collection.id}));
					console.dir(collectionToUpdate);

					$scope.collections[collectionToUpdate].avatar = response + "#" + new Date().getTime();
					if (!$scope.$$phase) $scope.$digest();
				} else {
					console.log("UPLOAD FAILURE");
				}

				$scope.image = null;
				$("#avatarUpload").val(null);
			});
		} else {
			console.log("No file selected.");
		}
	}
});

cats.controller('AdminCategories', function($scope, $routeParams, $http, Feeds, Feed, Categories) {
	Categories.admin.get().then(function (results) {
		console.log(results.data);
		$scope.categories = results.data;
	});

	Feeds.get('alphabetical', null).then(function (result) {
		if (result.status == 200) {
			console.log('FEED %s', result.data);
			$scope.feedTitles = _.pluck(result.data, "title");;
			$scope.feeds = result.data;
			console.dir($scope.feedTitles);
		}
	});

	$scope.selectCategory = function (category) {
		$scope.category = category;

		Categories.getCategoryFeedList(category.title, function (feeds) {
			if (feeds) {
				console.log("found feeds");
				$scope.feedsInCategory = feeds;
				console.dir(feeds);
			} else {
				console.log("no found feeds");
				$scope.feedsInCategory = [];
			}

			_.each($scope.feedsInCategory, function (elm, i, list) {
				var rank = elm.rankedCategories[_.indexOf(elm.rankedCategories, _.findWhere(elm.rankedCategories, { category: $scope.category.title }))].rank;
				list[i].rank = rank;
				list[i].oldRank = rank;
			});
		});
	};

	$scope.openAddCategoryModal = function () {
		$scope.newCategory = null;
		$('#addCategory').modal('show');
	}

	$scope.openEditCategoryModal = function () {
		$scope.editCategory = angular.copy($scope.category);
		console.dir($scope.category);
		$('#editCategory').modal('show');
	}

	$scope.addNewCategory = function (category) {
		Categories.add(category, function (category) {
			if (category) $scope.categories.push(category);
			console.dir($scope.categories);
			//if (!$scope.$$phase) $scope.$apply();

			$('#addCategory').modal('hide');
		});
	}

	$scope.saveCategory = function (category) {
		Categories.edit(category).then(function (results) {
			if (results.status == 200) {
				$scope.categories[_.indexOf($scope.categories, _.findWhere($scope.categories, {_id: category._id}))] = category;

				console.dir($scope.categories);
				//if (!$scope.$$phase) $scope.$apply();
				$scope.selectCategory(category);
				$('#editCategory').modal('hide');
			}
		});
	}

	$scope.addFeedToCategory = function (feed) {
		if (feed) {
			console.dir(_.findWhere($scope.feeds, {id: feed}));
			var newFeed = {};
			newFeed.id = feed;
			newFeed.title = _.findWhere($scope.feeds, {id: feed}).title;
			newFeed.rankedCategories = _.findWhere($scope.feeds, {id: feed}).rankedCategories;
			$scope.feedsInCategory.push(newFeed);

			console.dir(newFeed);
			
			$scope.newFeed = null;
		}
	}

	$scope.saveFeed = function (feed) {
		console.dir(feed);
		$scope.savingFeed = true;

		console.dir(_.findWhere(feed.rankedCategories, { category: $scope.category.title }));

		if (_.findWhere(feed.rankedCategories, { category: $scope.category.title }) !== undefined) { 
			feed.rankedCategories[_.indexOf(feed.rankedCategories, _.findWhere(feed.rankedCategories, { category: $scope.category.title }))].rank = feed.rank;
		} else {
			var newCategory = {};
			newCategory.category = $scope.category.title;
			newCategory.categoryId = $scope.category.id;
			newCategory.rank = feed.rank;

			if (feed.rankedCategories === undefined) feed.rankedCategories = [];
			feed.rankedCategories.push(newCategory);
		}

		console.dir($scope.category);
		console.dir(feed);

		Feed.saveCategories(feed, function (status, data) {
			if (status == 200) {
				feed.oldRank = feed.rank;
			} else {
				feed.rank = feed.oldRank;
			}

			$scope.savingFeed = false;
		});
	}
});


cats.controller('AdminInvites', function($scope, Invites) {
	Invites.get(null).then(function (results) {
		if (results.status == 200) {
			console.dir(results.data);
			$scope.invites = results.data;

			$scope.sentInvites = _.countBy($scope.invites, function(elm) {
			  return elm.sentInvites.length > 0;
			}).true;
			console.log($scope.sentInvites);

			$scope.sentInvitesPercent = $scope.sentInvites/$scope.invites.length*100;

			$scope.registeredInvites = _.countBy($scope.invites, function(elm) {
			  return elm.sentInvites.length > 0 && elm.registered == true;
			}).true;
			console.log($scope.registeredInvites);

			$scope.registeredInvitesPercentage = $scope.registeredInvites/$scope.sentInvites*100;
		} else {
			console.log("No invites found :(");
		}
	});

	// Invite action handling...
	$scope.openInviteModal = function (invite) {
		console.log("OPEN SEND INVITE");
		console.dir(invite);
		
		
		$scope.invite = angular.copy(invite);

		$('#sendInvite').modal('show');
	}


	// Invite action handling...
	$scope.sendInviteEmail = function (invite) {
		console.log("SEND INVITE");
		console.dir(invite);
		
		var options = {
			id: invite._id,
			email: invite.emailAddress,
			message: invite.message
		}

		Invites.send(options).then(function (results) {
			console.dir(results);
			if (results.status == 200) {
				$scope.invites[_.indexOf($scope.invites, _.findWhere($scope.invites, {_id: invite._id}))].sentInvites.push(Date.now());
			}
		});

		$('#sendInvite').modal('hide');
	}

});

/*cats.controller('AdminFeedPreview', function($scope, $routeParams, Feed) {

	Feed.load($routeParams, function (response) {
		console.dir(response);
		if (response) {
			console.log("GET SUCCESS");
			$scope.feed = response;
		} else {
			console.log("GET FAILURE");
		}
	});
});*/