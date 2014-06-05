'use strict';

/* Services */

///////////////////
// User Services //
///////////////////

cats.factory('Cat', function($resource){
  	return $resource('/api/cat/validate/:field', {}, {
  		byUsername: {method: 'GET', params: {field: 'username'}},
  		byEmail: {method: 'GET', params: {field: 'email'}},
  	});
});

cats.factory('Device', function($rootScope, $window) {
	
	function getDevice() {
		var oldDevice = $rootScope.smallDevice;
		console.log("GET DEVICE");
		$rootScope.device = window.getComputedStyle(document.body,':after').getPropertyValue('content');
		console.log("Device - " + $rootScope.device);
		console.log("Device - " + $rootScope.smallDevice);

		switch ($rootScope.device) {
			case 'phone':
				$rootScope.smallDevice = true;
				break;
			case 'phoneTablet':
				$rootScope.smallDevice = true;
				break;
			default:
				$rootScope.smallDevice = false;
				break;
		}
	}

	function getRetina() {
		if ($window.devicePixelRatio > 1) $rootScope.retina = true;
		else $rootScope.retina = false;

		console.log("RETINA - %s", $rootScope.retina);
		console.dir($window);
	}

	return {
		runChecks: function () {
			$(window).resize(function (e) {
				getDevice();
			});

			getDevice();
			getRetina();
		},
		get: function () {
			return $rootScope.smallDevice;
		}
	}
});

/*cats.factory('Resize', function($scope, $window) {
	var resizeEvents = {}
	return {		
		addResizeEvent: function (name, event) {
			resizeEvents[name] = function () {
				$scope.$broadcast(event);
			}

			$window.onresize = function (e) {
				_.each(resizeEvents, function (elm) {
					elm();
				});
			}
		},
		removeResizeEvent: function () {
			delete resizeEvents[name];	
		}
	}
});*/

cats.factory('User', function ($http, $rootScope) {
	return {
		get: function (username, callback) {
  			$http.get('/api/user/' + username).
				success(function(data, status) {					
					if (status == 200) {
						console.log('cat retrieved');
						callback(data);
					} else {
						console.log("%s - %s", status, data);
					}
				})
  		},
  		add: function (user, callback) {  			
  			$http.post('/api/user/add', { user: user }).
				success(function(data, status) {					
					if (status == 200) {
						console.log('User added');
						callback(data);
					} else {
						console.log("%s - %s", status, data);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
			});
  		},
  		edit: function (user, callback) {
  			console.log("EDIT USER");
  			
  			$http.post('/api/user/' + user.id + '/edit', { user: user }).
				success(function(data, status) {					
					if (status == 200) {
						console.log('user edited');
						callback(data, status);
					} else {
						console.log("%s - %s", status, data);
						callback(data, status);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
					callback(data, status);
			});
  		},
  		changePassword: function (password, callback) {
  			console.log("CHANGE PASSWORD");
  			
  			$http.post('/api/user/' + $rootScope.currentUser.id + '/change-password', { password: password }).
				success(function(data, status) {					
					if (status == 200) {
						console.log('password changed');
						callback(data, status);
					} else {
						console.log("%s - %s", status, data);
						callback(data, status);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
					callback(data, status);
			});
  		},
  		chooseDefaultAvatar: function (id, callback) {
  			return $http.post('/api/user/' + id + '/choose-default-avatar').
				then(function(result) {					
					return result;
				});
  		},
  		uploadAvatar: function (id, image, callback) {
			console.log('Uploading image: %s', image);
			$http({method: 'POST', url: '/api/user/' + id + '/upload-avatar', 
	            //IMPORTANT!!! You might think this should be set to 'multipart/form-data' 
	            // but this is not true because when we are sending up files the request 
	            // needs to include a 'boundary' parameter which identifies the boundary 
	            // name between parts in this multi-part request and setting the Content-type 
	            // manually will not set this boundary parameter. For whatever reason, 
	            // setting the Content-type to 'false' will force the request to automatically
	            // populate the headers properly including the boundary parameter.
	            headers: { 'Content-Type': undefined },
	            //This method will allow us to change how the data is sent up to the server
	            // for which we'll need to encapsulate the model data in 'FormData'
	            transformRequest: function (data) {
	                var formData = new FormData();
	                //need to convert our json object to a string version of json otherwise
	                // the browser will do a 'toString()' on the object which will result 
	                // in the value '[Object object]' on the server.
	                //formData.append("model", angular.toJson(data.model));
	                //now add all of the assigned files
	                /*for (var i = 0; i < data.avatar; i++) {
	                    //add each file to the form data and iteratively name them
	                    formData.append("file" + i, data.files[i]);
	                }*/
	                formData.append("image", data.avatar);
	                console.dir(data);
	                console.dir(formData);
	                return formData;
	            },
	            //Create an object that contains the model and files which will be transformed
	            // in the above transformRequest method
	            data: { avatar: image }
	        }).
	        success(function (data, status, headers, config) {
	            if (status == 200) {
					console.dir(data);
					callback(data, status);
				} else {
					console.log("%s - %s", status, data);
					callback(data, status);
				}
	        }).
	        error(function (data, status, headers, config) {
	            console.log("%s - %s", status, data);
	            callback(data, status);
	        });
		},
		getRecentlyUpdatedCount: function (id, callback) {
  			return $http.get('/api/user/' + id + '/recently-updated-favorites').
				then(function(result) {	
					console.log('COUNT');
					console.dir(result);				
					return result;
				});
  		},
	}
});

cats.factory('Users', function($http){
  	return {
  		get: function (callback) {
  			$http.get('/api/users/').
			success(function(data, status) {
				console.dir(data);
				console.dir(status);
				
				if (data && status == 200) {
					console.log('feeds retrieved');
					return callback(data);
				} else {
					console.log("error retrieving users!");
					return callback(null);
				}
			}).
	        error(function (data, status, headers, config) {
	            console.log("%s - %s", status, data);
	        });
		},
		search: function (query, field, callback) {
  			$http.get('/api/users/search/' + field + '/' + query).
			success(function(data, status) {
				console.dir(data);
				console.dir(status);
				
				if (data && status == 200) {
					console.log('users retrieved');
					return callback(data);
				} else {
					console.log("error retrieving users!");
					return callback(null);
				}
			}).
	        error(function (data, status, headers, config) {
	            console.log("%s - %s", status, data);
	        });
		}
  	}
});

// Old Version
/* cats.factory('Feed', function($resource){
  	return $resource('/api/feed/:url/:action', {}, {
  		init: {method:'GET', params:{action: 'init'}},
  		loadMore: {method:'GET', params:{action: 'more'}},
  		list: {method:'GET'}
  	});
}); */

///////////////////////
// Snapshot Services //
///////////////////////

cats.factory('Snapshot', function($resource, $http){
  	return {
  		like: function (snapshotId, callback) {
  			console.log("LIKE Snapshot");
  			console.dir(snapshotId);
  			
  			$http.post('/api/snapshot/like', { snapshotId: snapshotId } ).
				success(function(data, status) {					
					if (status == 200) {
						console.log('snapshot liked');
						callback(data, status);
					} else {
						console.log("%s - %s", status, data);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
					callback(data, status);
			});
  		},
  	}
});

///////////////////
// Feed Services //
///////////////////

cats.factory('Feed', function($rootScope, $resource, $http){
  	return {
  		load: function (feedId, callback) {
  			console.log("LOAD FEED");
  			console.dir(feedId);
  			
  			$http.get('/api/feed/' + feedId).
				success(function(data, status) {					
					if (status == 200) {
						console.log('feed retrieved');
						callback(data);
					} else {
						console.log("%s - %s", status, data);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
			});
  		},
  		loadContent: function (feedId, limit, lastUrl, callback) {
  			$http.post('/api/feed/' + feedId + "/load-content", { limit: limit, lastUrl: lastUrl }).
				success(function(data, status) {					
					if (status == 200) {
						console.log('feed content retrieved');
						callback(data);
					} else {
						console.log("%s - %s", status, data);
					}
				}).error(function(data, status) {
					console.log("ERROR: %s - %s", status, data);
			});
  		},
  		loadImages: function (feedId, limit, lastUrl, callback) {
  			return $http.post('/api/feed/' + feedId + "/load-images").
				then(function(results) {					
					return results;
			});
  		},
  		getNext: function (feedId, callback) {
  			return $http.get('/api/feed/' + feedId + "/get-next-feed").
				then(function(results) {					
					return results;
			});
  		},
  		loadRecentInstagram: function (instagramUsername, callback) {
  			return $http.get('/api/feed/' + instagramUsername + '/load-recent-instagram').
  				then(function (results) {
  					return results;
  			});
  		},
  		loadRecentTweet: function (twitterUsername, callback) {
  			return $http.get('/api/feed/' + twitterUsername + '/load-recent-tweet').
  				then(function (results) {
  					return results;
  			});
  		},
  		add: function(feed, callback) {
			console.log('Adding feed: %s', feed.title);
			$http.post('/api/feed/add', feed).
				success(function(data, status) {					
					if (status == 201) {
						console.log(status);
						console.dir(data);
						callback(data);
					} else {
						console.log("%s - %s", status, data);
						callback();
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
			});
		},
		edit: function(feed, callback) {
			console.log('Editing feed: %s', feed.title);
			$http.post('/api/feed/' + feed.id + '/edit', { feed: feed }).
				success(function(data, status) {
					if (status == 200) {
						console.dir(data);
						callback(data);
					} else {
						console.log("%s - %s", status, data);
						callback();
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
			});
		},
		asterisk: function(feed, callback) {
			console.log('Marking feed: %s', feed.title);
			$http.post('/api/feed/' + feed.id + '/asterisk', { feedId: feed.id, lastPublished: feed.lastPublished }).
				success(function(data, status) {
					if (status == 200) {
						console.dir(data);
						callback(status, data);
					} else {
						console.log("%s - %s", status, data);
						callback(status, data);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
					callback(status, data);
			});
		},
		takeSnapshot: function(options, callback) {
			console.log('Taking snapshot');
			$http.post('/api/take-snapshot', options).
				success(function(data, status) {
					if (status == 200) {
						console.dir(data);
						callback(status, data);
					} else {
						console.log("%s - %s", status, data);
						callback(status, data);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
					callback(status, data);
			});
		},
		findSimilar: function (id, callback) {
  			console.log("LOAD FEED");
  			console.dir(id);
  			
  			$http.get('/api/feed/' + id + '/find-similar').
				success(function(data, status) {					
					if (status == 200) {
						console.log('similar feeds retrieved');
						callback(data);
					} else {
						console.log("%s - %s", status, data);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
			});
  		},
  		clickImageLink: function (options, callback) {
  			console.log("CLICK IMAGE LINK");
  			console.dir(options);
  			
  			$http.post('/api/feed/click-image-link', options).
				success(function(data, status) {					
					if (status == 200) {
						console.log('image link click success');
						callback(data, status);
					} else {
						console.log("%s - %s", status, data);
						callback(data, status);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
					callback(data, status);
			});
  		},
  		clickTitleLink: function (options, callback) {
  			console.log("CLICK TITLE LINK");
  			console.dir(options);
  			
  			$http.post('/api/feed/click-title-link', options).
				success(function(data, status) {					
					if (status == 200) {
						console.log('title link click success');
						callback(data, status);
					} else {
						console.log("%s - %s", status, data);
						callback(data, status);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
					callback(data, status);
			});
  		},
  		unfavorite: function (feedId, callback) {
  			console.log("Unfavorite Feed");
  			console.dir(feedId);
  			
  			return $http.get('/api/feed/' + feedId + '/unfavorite').
				then(function(result) {
					return result;
			});
  		},
  		favorite: function (feedId, callback) {
  			console.log("Favorite Feed");
  			console.dir(feedId);
  			
  			$http.get('/api/feed/' + feedId + '/favorite').
				success(function(data, status) {					
					if (status == 200) {
						console.log('favorite feed success');
						callback(data, status);
					} else {
						console.log("%s - %s", status, data);
						callback(data, status);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
					callback(data, status);
			});
  		},
  		hide: function (feedId, callback) {
  			console.log("Hide Feed");
  			console.dir(feedId);
  			
  			$http.get('/api/feed/' + feedId + '/hide').
				success(function(data, status) {					
					if (status == 200) {
						console.log('hide feed success');
						callback(data, status);
					} else {
						console.log("%s - %s", status, data);
						callback(data, status);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
					callback(data, status);
			});
  		},
  		unhide: function (feedId, callback) {
  			console.log("Unhide Feed");
  			console.dir(feedId);
  			
  			return $http.get('/api/feed/' + feedId + '/unhide').
				then(function(result) {
					return result;
			});
  		},
  		markAsSeen: function (feedId, callback) {
  			console.log("Mark Feed as Seen");
  			console.dir(feedId);
  			
  			$http.get('/api/feed/' + feedId + '/mark-as-seen').
				success(function(data, status) {					
					if (status == 200) {
						console.log('mark feed as seen success');
						callback(data, status);
					} else {
						console.log("%s - %s", status, data);
						callback(data, status);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
					callback(data, status);
			});
  		},
  		addToList: function (options, callback) {
  			console.log("Add Feed to List");
  			console.dir(options);
  			
  			return $http.post('/api/user/' + $rootScope.currentUser.id + '/add-feed-to-list', options).
				then(function(results) {
					return results;
				}, function (results) {
					return results;
			});
  		},
		saveCategories: function(feed, callback) {
			console.log('Marking feed: %s', feed.title);
			$http.post('/api/feed/' + feed.id + '/save-categories', { id: feed.id, rankedCategories: feed.rankedCategories }).
				success(function(data, status) {
					if (status == 200) {
						console.dir(data);
						callback(status, data);
					} else {
						console.log("%s - %s", status, data);
						callback(status, data);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
					callback(status, data);
			});
		},
		update: function(feed, callback) {
			console.log('Apdating feed: %s', feed.title);
			$http.post('/api/feed/' + feed.id + '/update', {feedUrl: feed.feedUrl}).
				success(function(data, status) {
					if (status == 200) {
						console.dir(data);
						callback(data);
					} else {
						console.log("%s - %s", status, data);
						callback();
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
			});
		},
		uploadAvatar: function (id, image, folder, callback) {
			console.log('Uploading image: %s', image);
			$http({method: 'POST', url: '/api/upload-avatar/' + folder + '/' + id,
	            //IMPORTANT!!! You might think this should be set to 'multipart/form-data' 
	            // but this is not true because when we are sending up files the request 
	            // needs to include a 'boundary' parameter which identifies the boundary 
	            // name between parts in this multi-part request and setting the Content-type 
	            // manually will not set this boundary parameter. For whatever reason, 
	            // setting the Content-type to 'false' will force the request to automatically
	            // populate the headers properly including the boundary parameter.
	            headers: { 'Content-Type': undefined },
	            //This method will allow us to change how the data is sent up to the server
	            // for which we'll need to encapsulate the model data in 'FormData'
	            transformRequest: function (data) {
	                var formData = new FormData();
	                //need to convert our json object to a string version of json otherwise
	                // the browser will do a 'toString()' on the object which will result 
	                // in the value '[Object object]' on the server.
	                //formData.append("model", angular.toJson(data.model));
	                //now add all of the assigned files
	                /*for (var i = 0; i < data.avatar; i++) {
	                    //add each file to the form data and iteratively name them
	                    formData.append("file" + i, data.files[i]);
	                }*/
	                formData.append("image", data.avatar);
	                return formData;
	            },
	            //Create an object that contains the model and files which will be transformed
	            // in the above transformRequest method
	            data: { avatar: image }
	        }).
	        success(function (data, status, headers, config) {
	            if (status == 200) {
					console.dir(data);
					callback(data);
				} else {
					console.log("%s - %s", status, data);
					callback();
				}
	        }).
	        error(function (data, status, headers, config) {
	            console.log("%s - %s", status, data);
	        });
		},
		validateUrl: function(feedUrl, callback) {
			console.log('Validating feed URL: %s', feedUrl);
			$http.get('/api/feed/validate/url?feedUrl=' + feedUrl).
				success(function(data, status) {
					if (status == 200) {
						console.dir(data);
						callback(data, status);
					} else {
						console.log("%s - %s", status, data);
						callback(data, status);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
					callback(data, status);
			});
		},
  	}
});

////////////////////
// Feeds Services //
////////////////////

cats.factory('Feeds', function($resource, $http){
  	var feedList;

  	return {
  		get: function (order, options, callback) {

  			var query = '';
	  		if (options) {
	  			if (options.filter) {
	  				query = "?filter=" + options.filter;
	  				if (options.subFilter) {
	  					query = query.concat("&subFilter=" + options.subFilter);
	  				}
	  			}
	  		}

  			console.log("QUERY - %s", query);

  			return $http.get('/api/feeds/' + order + query).
				then(function(result) {
					return result;
			});
  		},
  		getCategorizedFeeds: function (callback) {
  			return $http.get('/api/categorized-feeds/').
				then(function(results) {
					return results;
			});
  		},
  		getSampleFeeds: function (callback) {
  			$http.get('/api/feeds-preview/').
				success(function(data, status) {
					console.dir(data);
					console.dir(status);
					
					if (data && status == 200) {
						console.log('feeds retrieved');
						return callback(data);
					} else {
						console.log("error retrieving feeds!");
						return callback(null);
					}
				})
  		},
  		list: function () { return feedList; },
  		load: function (feedIds, callback) {
  			$http.post('/api/feeds/load-content', {feedIds: feedIds}).
				success(function(data, status) {
					console.dir(data);
					console.dir(status);
					
					if (data) {
						console.log('feeds content retrieved');
						return callback(data);
					} else {
						console.log("error retrieving feeds!");
					}
				});
  		}
  	}
});

////////////////////
// Entry Services //
////////////////////

cats.factory('Entry', function($resource, $http){
  	return {
  		markAsRead: function (feed, entry, callback) {
  			$http.post('/api/entry/' + entry.id + '/markAsRead', {feedId: feed.id}).
				success(function(data, status) {
					console.dir(data);
					console.dir(status);
					
					if (status == '200' && data) {
						console.log('Entry marked as read.');
						return callback(data);
					} else {
						console.log("Error marking entry!");
						return callback(null);
					}
				})
  		},
  		markAsLiked: function (feed, entry, callback) {
  			$http.post('/api/entry/' + entry.id + '/markAsLiked', {feedId: feed.id}).
				success(function(data, status) {
					console.dir(data);
					console.dir(status);
					
					if (status == '200' && data) {
						console.log('Entry like.');
						return callback(data);
					} else {
						console.log("Error liking entry!");
						return callback(null);
					}
				})
  		}
  	}
});

/////////////////////////
// Collection Services //
/////////////////////////

cats.factory('Collections', function($resource, $http){
  	return {
  		get: function (options, callback) {
  			console.log("LOAD COLLECTIONS");

  			if (options) {
  				var query = [];

  				_.each(options, function (val, key, obj) {
  					query.push(key + '=' + val);
  				});

  				query = '?' + query.join('&');
  			}

  			console.log("QUERY: %s", query);

  			$http.get('/api/collections' + query).
				success(function(data, status) {					
					if (status == 200) {
						console.log('collections retrieved');
						callback(data);
					} else {
						console.log("%s - %s", status, data);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
			});
  		},
  	}
});

cats.factory('Collection', function($resource, $http){
  	return {
  		get: function (id, callback) {
  			console.log("LOAD COLLECTION");
  			
  			$http.get('/api/collection/' + id).
				success(function(data, status) {					
					if (status == 200) {
						console.log('collection retrieved');
						callback(data);
					} else {
						console.log("%s - %s", status, data);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
			});
  		},
  		add: function (collection, callback) {
  			console.log("ADD COLLECTION");
  			
  			$http.post('/api/collection/add', { collection: collection }).
				success(function(data, status) {					
					if (status == 200) {
						console.log('collection added');
						callback(data);
					} else {
						console.log("%s - %s", status, data);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
			});
  		},
  		edit: function (collection, callback) {
  			console.log("EDIT COLLECTION");
  			
  			$http.post('/api/collection/' + collection.id + '/edit', { collection: collection }).
				success(function(data, status) {					
					if (status == 200) {
						console.log('collection edited');
						callback(status, data);
					} else {
						console.log("%s - %s", status, data);
						callback(status, data);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
					callback(status, data);
			});
  		},
  		publish: function (id, callback) {
  			console.log("EDIT COLLECTION");
  			
  			$http.post('/api/collection/' + id + '/publish').
				success(function(data, status) {					
					if (status == 200) {
						console.log('collection published');
						callback(status, data);
					} else {
						console.log("%s - %s", status, data);
						callback(status, data);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
					callback(status, data);
			});
  		},
  		uploadCover: function (id, image, callback) {
			console.log('Uploading image: %s', image);
			$http({method: 'POST', url: '/api/collection/' + id + '/upload-cover',
	            //IMPORTANT!!! You might think this should be set to 'multipart/form-data' 
	            // but this is not true because when we are sending up files the request 
	            // needs to include a 'boundary' parameter which identifies the boundary 
	            // name between parts in this multi-part request and setting the Content-type 
	            // manually will not set this boundary parameter. For whatever reason, 
	            // setting the Content-type to 'false' will force the request to automatically
	            // populate the headers properly including the boundary parameter.
	            headers: { 'Content-Type': undefined },
	            //This method will allow us to change how the data is sent up to the server
	            // for which we'll need to encapsulate the model data in 'FormData'
	            transformRequest: function (data) {
	                var formData = new FormData();
	                //need to convert our json object to a string version of json otherwise
	                // the browser will do a 'toString()' on the object which will result 
	                // in the value '[Object object]' on the server.
	                //formData.append("model", angular.toJson(data.model));
	                //now add all of the assigned files
	                /*for (var i = 0; i < data.avatar; i++) {
	                    //add each file to the form data and iteratively name them
	                    formData.append("file" + i, data.files[i]);
	                }*/
	                formData.append("image", data.avatar);
	                return formData;
	            },
	            //Create an object that contains the model and files which will be transformed
	            // in the above transformRequest method
	            data: { avatar: image }
	        }).
	        success(function (data, status, headers, config) {
	            if (status == 200) {
					console.dir(data);
					callback(data);
				} else {
					console.log("%s - %s", status, data);
					callback();
				}
	        }).
	        error(function (data, status, headers, config) {
	            console.log("%s - %s", status, data);
	        });
		},
  	}
});

///////////////////////
// Snapshot Services //
///////////////////////

cats.factory('Snapshots', function($resource, $http){
  	return {
  		get: function (options, callback) {
  			console.log("LOAD COLLECTION???");
  			
  			if (options) {
  				var query = [];

  				_.each(options, function (val, key, obj) {
  					query.push(key + '=' + val);
  				});

  				query = '?' + query.join('&');
  			} else {
  				var query = '';
  			}

  			console.log("QUERY: %s", query);

  			$http.get('/api/snapshots/' + query).
				success(function(data, status) {					
					if (status == 200) {
						console.log('snapshots retrieved');
						callback(data);
					} else {
						console.log("%s - %s", status, data);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
			});
  		}
  	}
});

///////////////////////
// Category Services //
///////////////////////

cats.factory('Categories', function($resource, $http){
  	return {
  		get: function (options, callback) {
  			console.log("LOAD CATEGORIES");
  			
  			$http.post('/api/categories', options).
				success(function(data, status) {					
					if (status == 200) {
						console.log('categories retrieved');
						callback(data);
					} else {
						console.log("%s - %s", status, data);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
			});
  		},
  		add: function (category, callback) {
  			console.log("ADD CATEGORY");
  			console.dir(category);
  			
  			$http.post('/api/category/add', category).
				success(function(data, status) {					
					if (status == 200) {
						console.log('category added');
						callback(data);
					} else {
						console.log("%s - %s", status, data);
					}
				}).error(function(data, status) {
					console.log("%s - %s", status, data);
			});
  		},
  		edit: function (category, callback) {
  			console.log("SAVE CATEGORY");
  			console.dir(category);
  			
  			return $http.post('/api/category/edit', category).
				then(function(results) {					
					return results;
			});
  		},
  		getCategoryFeedList: function (category, callback) {
  			console.log("ADD CATEGORY");
  			
  			$http.get('/api/category/' + category + '/feeds').
				success(function(data, status) {					
					if (status == 200) {
						console.log('category list found');
						callback(data);
					} else {
						console.log("%s - %s", status, data);
						callback(null);
					}
				}).error(function(data, status) {
					console.log("ERROR: %s - %s", status, data);
					callback(null);
			});
  		},
  		admin: {
  			get: function (callback) {
	  			console.log("GET ADMIN CATEGORIES");
	  			
	  			return $http.post('/api/admin/categories').
					then(function(results) {					
						return results;
				});
	  		},
  		}
  	}
});

////////////////////
//Invite Services //
////////////////////

cats.factory('Invites', function($resource, $http){
  	return {
  		get: function (options) {
  			console.log("LOAD INVITES");
  			
  			return $http.get('/api/invites').
				then(function(results) {					
					return results;
			});
  		},
  		send: function (options) {
  			console.log("SEND INVITE");
  			
  			return $http.post('/api/send-invite', options).
				then(function(results) {					
					return results;
			});
  		}
  	}
});

///////////////////
// Auth Services //
///////////////////

cats.factory('AuthService', function($rootScope, $http, $location) {
	var currentUser = null;
	
	return {
		register: function(user, hash, callback) {
			console.log("registering!");
			return $http.post('/register/' + hash, {lastName: user.lastName, firstName: user.firstName, username: user.username, email: user.email, gender: user.gender, birthday: user.birthday, password: user.password}).then(
				function(result) {
					return result;
			});	
		},
		login: function(user, callback) {
			console.log("logging in!");
			console.dir(user);
			$http.post('/login', {username: user.username, password: user.password}).
				success(function(data, status) {
					console.dir(data);
					console.dir(status);
					
					if (data) {
						console.log("logged in!");
						currentUser = data;
						console.dir(currentUser);

						// Mixpanel tracking //
						mixpanel.identify(data.id);
						mixpanel.track('login');
						///////////////////////

						return callback("login successful");
					} else {
						console.log("error logging in: " + status);
						callback(null);
					}
				}).error(function(data, status) {
					console.dir(data);
					console.dir(status);
			});	
		},
		logout: function(callback) {
			$http.get('/logout').
				success(function(data, status) {
					console.dir(data);
					console.dir(status);
					
					if (data) {
						console.log("logged out!");

						// Mixpanel tracking //
						mixpanel.track('logout');
						///////////////////////

						currentUser = null;
						console.dir(currentUser);
						console.log('disconnecting');
						return callback('logout successful');
					} else {
						console.log("error logging out!");
					}
				})
		},
		isLoggedIn: function() { return currentUser ? 1 : 0; },
		currentUser: function() { return currentUser; },
		getUser: function(callback) { 
			$http.get('/api/me', {cache : false}).
				success(function(data, status) {
					console.dir(data);
					console.dir(status);

					if (data) {
			            $rootScope.isLoggedIn = 1;
			            $rootScope.currentUser = data;
			            console.log("authenticated / %s / %s / %s", $rootScope.isLoggedIn, $rootScope.currentUser, $rootScope.currentUser.id);
			            
			            $rootScope.$broadcast('userLoaded');

			            console.log("GET USER / ADD USER");
			            //SocketIO.emit('adduser', $rootScope.currentUser);

			            // Mixpanel tracking //
			            mixpanel.identify($rootScope.currentUser.id);
			            ///////////////////////
			        } else {
			        	console.log("No user returned - %s", status);
			        	console.dir(data);
			        }
					
					//callback();
				})
			return currentUser;	
		}
	};
});

////////////////////////
// Socket IO Services //
//?/////////////////////

cats.factory('SocketIO', function ($rootScope) {
  //var socket = io.connect('/', {'sync disconnect on unload' : true});
  
  return {
    connect: function () {
    	//socket = io.connect('/', {'sync disconnect on unload' : true});
    },
    on: function (eventName, callback) {
      /*socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });*/
    },
    emit: function (eventName, data, callback) {
      /*socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });*/
    }
  };
});

/////////////////
// Dynamic CSS //
/////////////////

cats.service('DynamicStylesheets', ['$rootScope', '$compile', function($rootScope, $compile) {

        var scope = angular.element('head').scope();
   
        var addStylesheet = function(href)
        {
            if(scope.stylesheets_service_dynamicStylesheets === undefined)
            {
                angular.element('head').scope().stylesheets_service_dynamicStylesheets = [];
                angular.element('head').append($compile("<link data-ng-repeat='stylesheet in stylesheets_service_dynamicStylesheets' data-ng-href='{{stylesheet.href}}' rel='stylesheet' />")(scope)); // Found here : http://stackoverflow.com/a/11913182/1662766
            }
            else
            {
                for(var i in scope.stylesheets_service_dynamicStylesheets)
                {
                    if(scope.stylesheets_service_dynamicStylesheets[i].href == href) // Unique
                        return;
                }
            }
            
            scope.stylesheets_service_dynamicStylesheets.push({href: href});
        };

        var clearStylesheets = function()
        {
            if(scope.stylesheets_service_dynamicStylesheets === undefined)
            {
                angular.element('head').scope().stylesheets_service_dynamicStylesheets = [];
                angular.element('head').append($compile("<link data-ng-repeat='stylesheet in stylesheets_service_dynamicStylesheets' data-ng-href='{{stylesheet.href}}' rel='stylesheet' />")(scope)); // Found here : http://stackoverflow.com/a/11913182/1662766
            }
            else
            {
                scope.stylesheets_service_dynamicStylesheets = [];
            }
        };

        return {
            add: addStylesheet,
            clear: clearStylesheets
        };
    }
]);

///////////////
// Utilities //
///////////////

cats.service('Utility', function($rootScope, $compile) {
    return {
        toBoolean: function (value) {
		 	if (value && value.length !== 0) {
		    	var v = "" + value;
		    	v = v.toLowerCase();
		    	value = !(v == 'f' || v == '0' || v == 'false' || v == 'no' || v == 'n' || v == '[]');
		  	} else {
		    	value = false;
		  	}
		  	return value;
        },
        lengthToBoolean: function (value) {
		 	if (value > 0 ) return true;
			else return false;
        }
    };
});