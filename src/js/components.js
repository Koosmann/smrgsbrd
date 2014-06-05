'use strict';

/* Components */


cats.directive('pctHoverBillboard', function ($location, $anchorScroll) {
	return {
		restrict: 'E',
		scope: true,
		template: "<div ng-show='display' class='fade-out'><span><span>{{ message }}</span><br/><span class='very-small'>Click to request an invite</span></span></div>",
		link: function (scope, elm, attrs) {
			scope.messages = [
				"Request an invite!",
				"It's time to discover!",
				"Let's find some cool @#$% together!",
				"So much to see, so little time!",
				"You've made it! Sign up today!",
				"What should we find today?",
				"Very pleased you could join us!"
			]

			elm.bind('mouseenter', function () {
				scope.message = scope.messages[Math.floor(Math.random()*7)];
				console.log("HOVER ON - %s", scope.message);
				scope.display = true;
				if (!scope.$$phase) scope.$digest();
			});

			elm.bind('mouseleave', function () {
				console.log("HOVER OFF");
				scope.display = false;
				if (!scope.$$phase) scope.$digest();
			});
		}
	}
});

cats.directive('pctHoverMenu', function ($location, $anchorScroll) {
	return {
		restrict: 'E',
		scope: true,
		template: "<div ng-show='display && !$parent.scrolling'></div>",
		link: function (scope, elm, attrs) {
			

			elm.bind('mouseenter', function () {
				console.log("HOVER ON - %s", scope.message);
				scope.display = true;
				if (!scope.$$phase) scope.$digest();
			});

			elm.bind('mouseleave', function () {
				console.log("HOVER OFF");
				scope.display = false;
				if (!scope.$$phase) scope.$digest();
			});
		}
	}
});

cats.directive('pctHoverLink', function ($location, $anchorScroll) {
	return {
		restrict: 'E',
		scope: true,
		template: "<div ng-show='display' ng-class='{ &quot;bg-arrows-left&quot;: left, &quot;bg-arrows-right&quot;: right }''></div>",
		link: function (scope, elm, attrs) {

			switch (attrs.pctHoverArrows) {
				case 'left':
					scope.left = true;
					break;
				case 'right':
					scope.right = true;
					break;
			}



			elm.bind('mouseenter', function () {
				console.log("HOVER ON - %s");
				scope.display = true;
				if (!scope.$$phase) scope.$digest();
			});

			elm.bind('mouseleave', function () {
				console.log("HOVER OFF");
				scope.display = false;
				if (!scope.$$phase) scope.$digest();
			});

			elm.bind('click', function () {
				//$location.hash('join');
				//$anchorScroll();
				if (!scope.$$phase) scope.$digest();
			});
		}
	}
});


cats.directive('browse', function() {
    return {
		templateUrl: '/partials/outside/browseComponent',
		restrict: 'E'
    };
});

cats.directive('horizontalBrowse', function() {
    return {
		templateUrl: '/partials/outside/horizontalBrowseComponent',
		restrict: 'E'
    };
});

cats.directive('read', function(Entry) {
    return {
		templateUrl: '/partials/outside/readerComponent',
		restrict: 'E',
		replace: true,
		controller: function ($scope) {
			console.dir($scope);
			$scope.openFeed = function (feed, entry) {
				console.log(entry);
				$scope.isReading = true;
				$scope.initFeed(feed.id);
				$('body').css('overflow','hidden');
				$scope.reading = entry.content;

				// Mixpanel tracking //
				mixpanel.track('read', {
					"feed": feed.title,
					"entry": entry.title
				});
				///////////////////////

				Entry.markAsRead(feed, entry, function(data) {
					if (data) entry.read = true;
					console.dir($scope);
					console.log(data);
				});
			}

			$scope.closeFeed = function () {
				$('body').css('overflow','auto');
				$scope.isReading = false;
				$scope.reading = null;
			}
		}
    };
});

cats.directive('pCoolNowButton', function(AuthService, Feed) {
    return {
		restrict: 'E',
		replace: true,
		scope: true,
		template: 	"<div class='cool-now-button' ng-class='{ &quot;cool-now-button-pressed&quot;: asterisked }' ng-click=press(feed)>" +
					"<i class='icon-arrow-up icon-large' tooltip-placement='right' tooltip-html-unsafe='<div style=&quot;margin:5px;&quot;>{{ buttonTooltip }}</div>'></i>" +
					"<div class='text-detail text-small' style='display:block;margin-top:4px;'>{{ count }}</div>" +
					"</div>",
		controller: function ($scope) {
			if ($scope.$parent.feed.asterisks === undefined) $scope.$parent.feed.asterisks = [];

			if (AuthService.currentUser())
				var user = AuthService.currentUser().id;
			else
				var user = null;

			console.log("COOL SCOPE");
			console.dir($scope.$parent.feed);
			//$scope.count = $scope.$parent.feed.asterisks.length;
			$scope.count = Math.ceil($scope.$parent.feed.asteriskCount);
			$scope.asterisked = ($scope.$parent.feed.asterisks.indexOf(user) >= 0) ? true : false;
			console.dir($scope.asterisked);

			//$scope.count = '1k';
			//$scope.asterisked = true;

			$scope.createButtonTooltip = function () {
				$scope.buttonTooltip = $scope.asterisked ? 'You think this blog is cool right now.' : 'Click here if this blog is cool right now.';

				if (!$scope.$$phase) $scope.$digest();
			}

			$scope.createButtonTooltip();

			$scope.$watch('asterisked', function (value) {
				$scope.createButtonTooltip();
			});

			console.log("INDEX OF COOKIE - %d", $scope.$parent.feed.asterisks.indexOf(user));

			$scope.press = function (feed) {
				if (!$scope.asterisked) {
					console.log("USER - %s", user);

					Feed.asterisk(feed, function (status, data) {
						if (status == 200) {
							console.log("Feed asterisked.");

						} else {
							console.log("Error asterisking feed.");
						}
					});

					$scope.asterisked = true;
					$scope.count++;

					// Mixpanel tracking //
					mixpanel.track('up vote', {
						"Feed": feed.title,
						"Categories": feed.categories,
						"Badges": feed.badges
					});
					///////////////////////

				} else {
					console.log("Already asterisked.");
				}
			}
		}
    };
});

cats.directive('pctSubmitBlogFooter', function($location) {
    return {
		restrict: 'E',
		replace: true,
		scope: true,
		template: "<div ng-show='$parent.$parent.loaded' style='text-align:center;font-size:16px;white-space:normal;'>Know of any great {{ categoryString|lowercase }}blogs {{ locationString }}that we missed? <a href='mailto:hello@pictoral.ly' style='color:#FF0057' class='pct-email-link-footer' target='_blank'>Email them to us!</a>&nbsp;&nbsp;&nbsp;&nbsp;We're adding new blogs all the time.</a></div>",
		controller: function ($scope) {
			$scope.update = function () {
				var search = $location.search();

				console.log("SUBMIT SCOPE");
				console.dir($scope);
				console.dir($scope.$parent.$parent.loaded);

				$scope.locationString = '';
				$scope.categoryString = '';

				$scope.category = '';
				$scope.city = '';
				$scope.state = '';
				$scope.country = '';

				if (search.categories) {
					$scope.category = search.categories;
					$scope.categoryString = search.categories.split(',')[0] + ' ';
				} else if (search.city) {
					$scope.city = search.city;
					$scope.locationString = 'in ' + search.city + ' ';
				} else if (search.state) {
					$scope.state = search.state;
					$scope.locationString = 'in ' + search.state + ' ';
				} else if (search.country) {
					$scope.country = search.country;
					if (search.country == 'USA') search.country = 'the ' + search.country;
					$scope.locationString = 'in ' + search.country + ' ';
				}

				$scope.search = search;
			}

			$scope.$on('$routeUpdate', function () {
				$scope.update();
			});

			$scope.update();
		}
    };
});

cats.directive('pLikeButton', function(Entry) {
    return {
		restrict: 'A',
		controller: function ($scope) {
			//console.dir($scope);
			$scope.markAsLiked = function (feed, entry) {

				// Mixpanel tracking //
				mixpanel.track('like', {
					"feed": feed.title,
					"entry": entry.title
				});
				///////////////////////

				Entry.markAsLiked(feed, entry, function(data) {
					if (data) entry.liked = true;
					console.dir($scope);
					console.log(data);
				});
			}
		}
    };
});

cats.directive('pctFeedInput', function() {
    return {
		restrict: 'A',
		template: "<label class='col-sm-3 control-label' for='{{ &#39;feedTitle&#39; + $index }}''>Feed {{ $index + 1 }}</label>" +
                            "<div class='col-sm-8'>" +
                                "<input name='{{ &#39;feedTitle&#39; + $index }}' class='form-control' type='text' id='{{ &#39;feedTitle&#39; + $index }}'' placeholder='Feed Title' ng-model='collection.feeds[$index].title' required>" +
                                "<span class='help-block' ng-show='editCollection.$dirty && editCollection.{{ &#39;feedTitle&#39; + $index }}.$dirty && editCollection.{{ &#39;feedTitle&#39; + $index }}.$error.required'>Please enter the feed&#39;s title.</span>" +
                            "</div>"
		}
});

cats.directive('pctEditUser', function() {
	return {
		restrict: 'A',
		controller: function ($rootScope, $scope, User) {
			$scope.changed = false;
			$scope.saveMessage = 'Save';
			
			$scope.$watch('currentUser', function (value) {
				$scope.user = angular.copy($rootScope.currentUser);
			}, true);

			$scope.$watch('user', function (value, oldValue) {
				if (!angular.equals(value, oldValue) && !$scope.changed) {
					console.log("CHANGES MADE");
					$scope.changed = true;
					$scope.saveMessage = 'Save';
				} else if (angular.equals(value, $rootScope.currentUser) && $scope.changed) {
					console.log("CHANGED BACK");
					$scope.changed = false;
				}

				console.dir($scope);
				console.dir($rootScope.currentUser);
			}, true);

			$scope.saveUser = function (user) {
				console.log("EDIT USER: %s", user.username);
				console.dir(user);

				$scope.changed = false;
				$scope.saveMessage = 'Saving...';
				
				User.edit(user, function (data, status) {
					console.dir(data);
					if (status == 200) {
						console.log("EDIT SUCCESS");

						// Show Update
						$scope.user.username = data.username;
						$scope.user.firstName = data.firstName;
						$scope.user.lastName = data.lastName;
						$scope.user.bio = data.bio;
						$scope.user.email = data.email;

						// Update model
						$rootScope.currentUser.username = data.username;
						$rootScope.currentUser.firstName = data.firstName;
						$rootScope.currentUser.lastName = data.lastName;
						$rootScope.currentUser.bio = data.bio;
						$rootScope.currentUser.email = data.email;

						$scope.saveMessage = 'Saved';

					} else {
						console.log("EDIT FAILURE");
						$scope.changed = true;
						$scope.saveMessage = 'Save';

						$scope.editUserMessage = 'Something went wrong! Please try again.';
						$scope.editUserError = true;
					}
				});
			}

		}
	}
});

cats.directive('pctUploadUserAvatar', function() {
	return {
		restrict: 'A',
		controller: function ($rootScope, $scope, User) {

			$scope.avatar = angular.copy($rootScope.currentUser.avatar);

			$scope.$watch('currentUser', function (value) {
				if (value) $scope.avatar = angular.copy($rootScope.currentUser.avatar);
			}, true);
			$scope.uploadMessage = 'Upload';

			////////////////////
			// Image handling //
			////////////////////

		    //listen for the file selected event
		    $scope.$on("fileSelected", function (event, args) {
		        $scope.$apply(function () {            
		            //add the file object to the scope's files collection
		            $scope.image = args.file;
		            console.dir($scope.image);
		            $scope.avatarMessage = null;
		            if (!$scope.$$phase) $scope.$apply();
		        });
		    });

		    // File type error
		    $scope.$on("fileTypeError", function (event, args) {
		        console.log("%s is not a supported file type.", args);
		        $scope.avatarMessage = 'Image must be a JPG or PNG';
		        $scope.image = null;
		        if (!$scope.$$phase) $scope.$apply();
		    });

		    // File size error
		    $scope.$on("fileSizeError", function (event, args) {
		        console.log("Image (%smb) must be 10mb or less.", args);
		        $scope.avatarMessage = 'Image must be 10mb or less';
		        $scope.image = null;
		        if (!$scope.$$phase) $scope.$apply();
		    });

		    $scope.resetAvatarUpload = function () {
		    	$scope.uploadMessage = 'Upload';
				$scope.image = null;
				$("#avatarUpload").val(null);
				$scope.showAvatarUpload = false;
				$scope.avatarMessage = null;
		    }

		    $scope.chooseDefaultAvatar = function () {
		    	User.chooseDefaultAvatar($rootScope.currentUser.id).then(function (result) {
		    		if (result.status == 200) {
		    			// Show image...
					$scope.avatar = result.data + "#" + new Date().getTime();

					// Update model
					$rootScope.currentUser.avatar = result.data + "#" + new Date().getTime();

					$scope.avatarSuccess = true;
					$scope.resetAvatarUpload();
					if (!$scope.$$phase) $scope.$apply();	
		    		}
		    	});
		    }

			$scope.uploadImage = function (avatar) {
				$scope.uploadMessage = 'Uploading...';
				console.log("IMAGE UPLOAD: %s", $scope.image);
				if ($scope.image) {
					User.uploadAvatar($rootScope.currentUser.id, $scope.image, function (response, status) {
						console.log("RESPONSE: %s", response);
						if (status == 200) {
							console.log("UPLOAD SUCCESS");

							// Show image...
							$scope.avatar = response + "#" + new Date().getTime();

							// Update model
							$rootScope.currentUser.avatar = response + "#" + new Date().getTime();

							$scope.avatarSuccess = true;
							$scope.resetAvatarUpload();
							if (!$scope.$$phase) $scope.$apply();							
						} else {

							console.log("UPLOAD FAILURE");
							$scope.resetAvatarUpload();

							if (status == 413) {
								$scope.avatarMessage = 'Image must be 10mb or less';
							} else if (status == 406) {
								$scope.avatarMessage = 'Image must be a JPG or PNG';
							} else {
								$scope.avatarMessage = 'Agh, our bad, please try again.';
							}

							if (!$scope.$$phase) $scope.$apply();
						} 
					});
				} else {
					console.log("No file selected.");
				}
			}
		}
	}
});

cats.directive('pctTabUpdate', function() {
	return {
		restrict: 'E',
		template: "<div ng-show='tab.updated' class='tab-update fade-out'>{{ tab.message }}</div>",
		replace: true,
		link: function (scope, elm, attrs) {
			scope.$on(scope.tab.value, function () {
				console.log("TAB UPDATED");
				scope.tab.message = 'FAVORITE ADDED';
				scope.tab.updated = true;
				if (!scope.$$phase) scope.$apply();
				setTimeout(function () {
					scope.tab.updated = false;
					if (!scope.$$phase) scope.$apply();
				}, 2500);
			});
		}
	}
});

cats.directive('pctSidebar', function() {
	return {
		restrict: 'A',
		link: function (scope, elm, attrs) {
			console.log('PCT-SIDEBAR');
			scope.$watch('showSidebar', function (value, oldValue) {
				console.log('SIDEBAR');
				if (value) {
					console.log('SIDEBAR ON');
					
					setTimeout(function () {
						$(document).one('click', function () {
							console.log('CLICK');
							scope.showSidebar = false;
							if (!scope.$$phase) scope.$apply();
						});
					}, 0);
				}
			});

			$('#sidebar').bind('click', function(e) {
				console.log('STOP PROP');
			    e.stopPropagation();
			});
		},
		controller: function ($rootScope, $scope, Categories, User) {
			$scope.getLists = function () {
				Categories.get({}, function(categories) {
					console.log('ALL CATEGORIES');
					console.dir(categories);
					$scope.lists = categories;
				});
			}

			/*$scope.getUserLists = function () {
				console.log('USER LOADED - GET CATEGORIES')
				Categories.get({ userList: true }, function(categories) {
					console.log('MY CATEGORIES');
					console.dir(categories);
					$scope.savedLists = categories;
					//if (!$scope.$$phase) $scope.$apply();
				});
			}*/

			$scope.getUpdatedCount = function () {
				User.getRecentlyUpdatedCount($rootScope.currentUser.id).then(function(result) {
					if (result.status == 200) {
						$scope.recentlyUpdatedCount = result.data.count;
						$rootScope.currentUser.updatedFeeds = result.data.feeds;
					}

					console.log('GOT UPDATED');
					console.dir($rootScope.currentUser.updatedFeeds);

					console.log('RECENTLY UPDATED COUNT - %s', result.data);
					console.dir(result);
				});
			}

			$scope.$on('userLoaded', function() {
				//$scope.getUserLists();
				$scope.getUpdatedCount();
			});

			$scope.$on('reloadLists', function() {
				//$scope.getUserLists();
				$scope.getLists();
			});

			$scope.getLists();
			if ($rootScope.currentUser !== undefined) {
				//$scope.getUserLists();
				$scope.getUpdatedCount();
			}
		}
	}
});

cats.directive('pctFeeds', function($rootScope, $timeout, Feeds) {
	return {
		restrict: 'A',
		controller: function ($scope) {
			$scope.getFeeds = function (order, options) {
				if ($scope.feedScope) $scope.feedScope.$destroy();
				$scope.feedScope = $scope.$new();
				$scope.loaded = false;

				$scope.$emit('feedsLoading');

				console.log("GET %s FEEDS ", order);

				console.dir($scope.orderOptions);

				Feeds.get('new', options).then(function (result) {
					$scope.placeholder = null;
					if (result.status == 200) {
						$scope.feedScope.feedList = result.data;
						console.dir(result.data);

						$scope.scrollCount = 10;
						$rootScope.$broadcast('firstFeedsLoaded');


						$scope.feedScope.feeds = result.data.slice(0, 10);

						console.log("CONTENT LOADED");
						console.dir($scope.feedScope.feedList);
						$scope.loading = false;

						$scope.$emit('feedsLoaded');

						if ($scope.feedScope.feedList.length == 0) {
							$scope.placeholder = {
								title: 'No favorites yet!',
								message: "Check out 'All Feeds' to find favorites to add."
							}
						}

						//$scope.loadFeeds(function () { });

					} else {
						$scope.feedScope.feedList = [];
						$scope.$emit('feedsLoaded');
						$scope.loading = false;
						$scope.loaded = true;
					}

					//return null;
					if (!$scope.$$phase) $scope.$digest();
				});
			}

			$scope.loadFeeds = function (callback) {
				if (!$scope.locked) {
					console.log($scope.scrollCount);
					console.log($scope.feedScope.feedList);
					if ($scope.scrollCount < $scope.feedScope.feedList.length) {
						$scope.$emit('feedsLoading');
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
								$scope.$emit('feedsLoaded');
								$scope.scrollCount += 10;
								
								//$scope.$broadcast('feedsLoaded');
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
				}
			}


			$scope.$on('newFeeds', function(e, filter) {
				$scope.feedScope.$destroy();
				if (!$scope.loading) {
					console.log('TABBING FEEDS - %s', filter);
					console.dir(filter);
					$scope.getFeeds('new', filter);
				}
			});

			$scope.$on('loadFeeds', function(e, feedList) {
				console.log('LOAD FEEDS');
				if ($scope.feedScope !== undefined) $scope.feedScope.$destroy();
				if (!$scope.loading) {
					$scope.feedScope = $scope.$new();
					console.log('LOAD FEEDS');
					$scope.scrollCount = 0;
					$scope.feedScope.feedList = feedList;
					$scope.feedScope.feeds = [];
					$scope.loadFeeds(function () {

					});
				}
			});

			$scope.$on('lock feeds', function(e, filter) {
				console.log("FEEDS LOCKED");
				$scope.locked = true;
			});

			$scope.$on('unlock feeds', function(e, filter) {
				console.log("FEEDS UNLOCKED");
				$scope.locked = false;
				$scope.loadFeeds(function () {

				});
			});

			$timeout(function () {

				if ($scope.filter) {
					console.log("FILTER - %s", $scope.filter);
					if ($scope.feedScope) $scope.feedScope.$destroy();
					$scope.getFeeds('new', { filter: $scope.filter, subFilter: $scope.subFilter || null });
				} else if ($scope.feedList) {
					if (!$scope.loading) {

						if ($scope.feedScope) $scope.feedScope.$destroy();
						if ($scope.feedList.length > 0) {
							$scope.feedScope = $scope.$new();
							console.log('LOAD FEEDS');
							$scope.scrollCount = 0;
							$scope.feedScope.feedList = $scope.feedList;
							$scope.feedScope.feeds = [];
							$scope.loadFeeds(function () {

							});
						} else {
							if ($scope.feedList.length == 0) {
								$scope.placeholder = {
									title: 'No favorites yet!',
									message: "Check out 'Suggested' & 'Everything Else' to find favorites to add."
								}
							}
						}
					}
				}
			}, $rootScope.feedDelay || 0);

		}
	}
});

cats.directive('pctFeed', function($rootScope, $location, Feed) {
	return {
		restrict: 'A',
		scope: false,
		link: function (scope, elm, attrs) {
			var marking = false;

			scope.setUpdatedStatus = function () {
				scope.isUpdated = (_.indexOf($rootScope.currentUser.updatedFeeds, scope.feed.id) > -1) ? true : false;
				console.log("IS UPDATED - %s - %s", scope.isUpdated, scope.feed.id);
				console.dir($rootScope.currentUser.updatedFeeds);
				console.dir(scope);

				if (scope.isUpdated) {
					$(window).on('scroll.markAsSeen' + scope.feed.id, function () {
						var target = $(document).scrollTop() + $(window).height()/2,
							current = elm.offset().top + elm.height()/2;
						
						//console.log("MARK AS SEEN CHECK - %s - %s", target, current);
						if (current <= target && !marking) {
							marking = true;
							console.log('SEEN');
							$rootScope.currentUser.updatedFeeds = _.without($rootScope.currentUser.updatedFeeds, scope.feed.id);
							console.dir($rootScope.currentUser);
							if (!scope.$$phase) scope.$apply();

							Feed.markAsSeen(scope.feed.id, function (data, status) {
		                        if (status == 200) {
		                            console.log('MARK AS SEEN SUCCESS');
		                            
		                            // Mixpanel tracking //
		                            mixpanel.track('mark favorite as seen', {
		                                "Feed": scope.feed.title,
		                                "Categories": scope.feed.categories,
		                                "Badges": scope.feed.badges,
		                                Path: $location.path()
		                            });
		                            ///////////////////////

		                        } else console.log('MARK AS SEEN FAILURE');

		                        marking = false;
		                    });
						}
					});
				} else {
					$(window).off('scroll.markAsSeen' + scope.feed.id);
				}
			}

			$rootScope.$watch('currentUser.updatedFeeds', function () {
				console.log("UPDATED FEEDS UPDATED");
				scope.setUpdatedStatus();
			});

			scope.$on('userLoaded', function () {
				scope.setUpdatedStatus();
			});

			if ($rootScope.currentUser !== undefined) scope.setUpdatedStatus();
		}
	}
});

cats.directive('pctAddToList', function ($rootScope, Feed) {
	return {
		restrict: 'A',
		controller: function ($scope) {
			$scope.saveToList = function (list) {
				console.log("ADD TO LIST - %s - %s", $scope.feedToAdd.title, list.title);

				var options = {
					feedId: $rootScope.feedToAdd.id,
					title: $scope.list.title
				}

				Feed.addToList(options).then(function (results) {
					if (results.status == 200) {
						console.log('FEED ADDED TO LIST');
						$rootScope.feedToAdd = null;
						$rootScope.modalOpen = false;
						$rootScope.addToList = false;
						$scope.list = null;
						$scope.error = null;
						$rootScope.$broadcast('reloadLists');
					} else if (results.status == 406) {
						console.log('FEED NOT ADDED TO LIST - %s', results.status);
						$scope.error = "List titles can only have letters & numbers.";
					} else if (results.status == 409) {
						console.log('FEED NOT ADDED TO LIST - %s', results.status);
						$scope.error = "You've already added this feed to this list!";
					} else {
						console.log('FEED NOT ADDED TO LIST - %s', results.status);
						$scope.error = "Something went wrong :( Try again.";
					}
				});
			}

			$scope.cancelAddToList = function () {
				$rootScope.addToList=false;
				$rootScope.feedToAdd=null;
				$rootScope.modalOpen=false;
				$scope.list = null;
				$scope.error = null;
			}
		}
	}
});






cats.directive('pctIntroTour', function ($window) {
	return {
		restrict: 'A',
		link: function (scope, elm, attrs) {
			//console.log('TOP %s', $window.height()-200 + 'px');
			//elm.css('top', $(window).height()-300 + 'px');
			scope.changeStep = function (step) {
				clearInterval(scope.blinker);
				switch (step) {
					case 0:
						elm.css('top', $(window).height()-300 + 'px');
						scope.introMessage = "<span class='thick'>Would you like us to show you around?</span>";
						break;
					case 1:
						scope.introMessage = "<span class='thick'>Great!</span> We'd love to!<br />Click again to begin.";
						scope.blink('#introNext');
						break;
					case 2:
						elm.css('top', '125px');
						scope.scrollToFeedBox(0);
						scope.introMessage = " This is the <span class='thick'>Feed Box</span>, a visual billboard showing a blog's most current images.";
						break;
					case 3:
						scope.flutterThrough('.feed-box-liquid:eq(0) .feed-image-wrapper');
						scope.introMessage = "Each image is a link to the source - clicks are tallied up in the corner.<br /><br /><span class='small thick'>Tip: support your favorite blogs by clicking through to their site.  Clicks also help keep blogs towards the top of the list.</span>";
						scope.blink('.feed-clicks-wrapper');
						break;
					case 4:
						//if (angular.element('.feed-box-liquid').eq(1)) scope.scrollToFeedBox(1);
						angular.element('.inline-menu').attr('style', 'display:inline-block !important;opacity:1;');
						scope.introMessage = "The menu has a bunch of things to help you organize your feeds.<br /><br /><span class='thick'>Favorite</span><span class='small'> your favs</span><br /><span class='thick'>Hide</span><span class='small'> your least favs</span><br /><span class='thick'>Mark</span><span class='small'> what you've seen</span><br /><span class='thick'>Find similarly</span><span class='small'> awesome blogs</span><br /><span class='thick'>Snapshot</span><span class='small'> to remember</span>";
						break;
					case 5:
						angular.element('.inline-menu').attr('style', '');
						scope.flutterThrough('.tab');
						scope.introMessage = "Find suggestions up here! <br /><br /><span class='small thick'>Tip: suggestions get better when you favorite, click to, like, or snapshot a blog!</span>"
						break;
					case 6:
						//scope.blink('');
						elm.css('top', $(window).height()-300 + 'px');
						scope.showSidebar = true;
						scope.introMessage = "& take care of business over here in the sidebar menu.<br /><br /><span class='small thick'>Tip: having a cool avatar actually makes you cool!"
						break;
					case 7:
						elm.css('top', $(window).height()/2-100 + 'px');
						scope.showSidebar = false;
						scope.introDone = true;
						scope.introMessage = "That's it - Have fun discovering!<br/><br /><span class='small thick'>Tip: if you get lonely, <br />follow us here: <i class='fa fa-instagram'></i> <i class='fa fa-twitter'></i> <i class='fa fa-pinterest'></i>"
						break;
				}

			}

			scope.introNext = function () {
				scope.introStep++;
				scope.changeStep(scope.introStep);
			}

			scope.introPrevious = function () {
				scope.introStep--;
				scope.changeStep(scope.introStep);
			}

			scope.scrollToFeedBox = function (i) {
				$("body, html").animate({scrollTop: angular.element('.feed-box-liquid').eq(i).offset().top-100}, 1000, 'swing');
			}

			scope.closeIntro = function () {
				elm.css('right', '-200px');
				clearInterval(scope.blinker);
				scope.welcome = false;
				if (!scope.$$phase) scope.$digest();
			}

			scope.blink = function(selector, delay) {
				function blink () {
					for (var i=0; i<3; i++) {
						setTimeout(function() {
					    	angular.element(selector).fadeOut(1000)
					    	setTimeout(function() {
					    		angular.element(selector).stop().fadeIn(500);
					    	}, 750);
			    		}, i*1000+50);
			    	}
				}

				scope.blinker = setInterval(function() {
					blink()
				}, 4000);

				if (!delay) blink();
			}

			scope.flutterThrough = function (selector) {
				$(selector).each(function(index) {
					console.log("FLUTTER");
					var image = $(this);
					setTimeout(function() {
						console.log("FLUTTER IT");
				    	
						image.fadeOut(1000);
				    	setTimeout(function () {
				    		image.stop().fadeIn(1000);
				    	}, 500);
			    	}, index*250);
				});
			}

			scope.flutterThroughInvert = function (selector) {
				$(selector).each(function(index) {
					console.log("FLUTTER");
					var image = $(this);
					setTimeout(function() {
						console.log("FLUTTER IT");
				    	
						/*image.fadeIn(1000);
				    	setTimeout(function () {
				    		image.stop().fadeOut(1000);
				    	}, 500);*/
						image.hover();
			    	}, index*250+2000);
				});
			}

			scope.introStep = 0;
			scope.changeStep(scope.introStep);
		},
		controller: function ($scope) {
			//$scope.introStep = 0;
			//$scope.message = 'Would you like us to show you around?';


		}
	}
});