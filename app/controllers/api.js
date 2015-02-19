/////////
// Api //
/////////

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
	redis = redisLib.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});

if (redisURL.auth) redis.auth(redisURL.auth.split(":")[1]);
		
module.exports = function (users, Cat, Feed, _, async, s3, fs, Read, Activity, request, Feedparser, email, validator, Collections, Category, Canvas, Snapshot, im, eventEmitter, bcrypt, crypto, Invite, config, EmailTemplate, bases, twitter) {

	// Get user info
	function getUser(id, callback) {
		Cat.findById(id, function (err, user) {
			if (err) {
				console.log(err);
				return;
			}

			if (user) {
				//console.log("User found!");
				//console.dir(user);
				callback(user);
			} else {
				console.log("No user found!");
				callback();
			}
		});
	}

	// Get user info
	function getUserByUsername(username, callback) {
		Cat.findOne({username: username}, function (err, user) {
			if (err) {
				console.log(err);
				return;
			}

			if (user) {
				console.log("User found!");
				console.dir(user);
				callback(user);
			} else {
				console.log("No user found!");
				callback();
			}
		});
	}

	// Get user info (GROUP)
	function getUsers(users, callback) {
		Cat.find({_id: {$in: users}}, function (err, friendList) {
			if (err) {
				console.log("GET USERS ERROR");
				console.log(err);
				return;
			} 
			
			if (friendList) {
				var friends = [];
				_.each(friendList, function (elm, i, list) {
					var friend = {};
					friend.id = elm._id;
					friend.firstName = elm.firstName;
					friend.lastName = elm.lastName;
					friend.username = elm.username;
					friend.avatar = elm.avatar || 'http://s3-us-west-1.amazonaws.com/pctrly-dev/avatars/users/default.jpg';

					friends[i] = friend;
				});

				callback(friends);
			} else
				callback();
		});
	}

	// Get feed info
	function getFeed(id, callback) {
		Feed.findById(id, function (err, feed) {
			if (err) {
				console.log(err);
				return;
			}

			if (feed) {
				console.log("Feed found!");
				//console.dir(feed);
				callback(feed);
			} else {
				console.log("No feed found!");
				callback();
			}
		});
	}

	// Get feed info (GROUP)
	function getFeeds(feeds, user, callback) {
		async.each(feeds, function (feed, callback) {
			async.series([function (callback) {
				var projection = {
					id: 1,		
					title: 1,
					url: 1,
					feedUrl: 1,
					//entries: { $slice: 15 },
					imagePreview: 1,
					longSmallImagePreview: 1,
					longSmallImagePreview2: 1,
					longSmallImagePreview3: 1,
					longLargeImagePreview: 1,
					longLargeImagePreview2: 1,
					categories: 1,
					storeUrl: 1,
					portfolioUrl: 1,
					newsletterSignupUrl: 1,
					twitterUrl: 1,
					instagramUrl: 1,
					facebookUrl: 1,
					pinterestUrl: 1,
					tumblrUrl: 1,
					flickrUrl: 1,
					etsyUrl: 1,
					city: 1,
					state: 1,
					country: 1,
					rank: 1,
					clicks: 1,
					asterisks: 1,
					asteriskCount: 1,
					badges: 1,
					topHalfPercentile: 1,
					lastPublished: 1
				}

				Feed.findOne({_id: feed.id}, projection, function (err, value) {
					if (err) console.log("Find feed info err: %s", err);

					feed.title = value.title;
					feed.url = value.url;
					feed.feedUrl = value.feedUrl;
					feed.entries = value.entries;
					feed.imagePreview = value.imagePreview;

					if (value.longLargeImagePreview.length > 0) {
						feed.longLargeImagePreview = value.longLargeImagePreview;
						if (value.longLargeImagePreview2.length > 0) feed.longLargeImagePreview2 = value.longLargeImagePreview2;
					} 

					feed.longSmallImagePreview = value.longSmallImagePreview;
					if (value.longSmallImagePreview2.length > 0) feed.longSmallImagePreview2 = value.longSmallImagePreview2;
					if (value.longSmallImagePreview3.length > 0) feed.longSmallImagePreview3 = value.longSmallImagePreview3;

					feed.categories = value.categories;
					feed.storeUrl = value.storeUrl;
					feed.portfolioUrl = value.portfolioUrl;
					feed.newsletterSignupUrl = value.newsletterSignupUrl;
					feed.twitterUrl = value.twitterUrl;
					feed.instagramUrl = value.instagramUrl;
					feed.facebookUrl = value.facebookUrl;
					feed.pinterestUrl = value.pinterestUrl;
					feed.tumblrUrl = value.tumblrUrl;
					feed.flickrUrl = value.flickrUrl;
					feed.etsyUrl = value.etsyUrl;
					feed.city = value.city;
					feed.state = value.state;
					feed.country = value.country;
					feed.rank = value.rank;
					feed.clicks = value.clicks;
					feed.asterisks = value.asterisks;
					feed.asteriskCount = value.asteriskCount;
					feed.badges = value.badges;
					feed.topHalfPercentile = value.topHalfPercentile;
					feed.lastPublished = value.lastPublished;

					callback();
				});
			}, function (callback) {

				if (user) {
					feed.favorite = false;

					_.each(user.favoriteFeeds, function (elm) {
						//console.log('%s - %s', elm, feed.id);
						if (elm.equals(feed.id)) feed.favorite = true;
					});

					feed.hidden = false;

					_.each(user.hiddenFeeds, function (elm) {
						//console.log('%s - %s', elm, feed.id);
						if (elm.equals(feed.id)) feed.hidden = true;
					});
				}

				callback();
			}, /*function (callback) {
				Activity.find({ feedId: feed.id, $or: [{type: 'imageLinkClick'}, {type: 'titleLinkClick'}] }, { id:1 }, function (err, clicks) {
					if (err) console.log("Error searching for clicks: %s", err);

					//console.dir(comments);

					if (clicks) {
						feed.clicks = clicks.length;
					} else {
						feed.clicks = 0;
					}

					callback();
				});
			}, function (callback) {
				Collection.find({ feeds: { $elemMatch: { feedId: feed.id } } }, {authorId: 1, "feeds.$": 1, title: 1}, function (err, comments) {
					if (err) console.log("Error searching for comments: %s", err);

					//console.dir(comments);

					if (comments.length > 0) {
						feed.comments = [];

						_.each(comments, function (elm) {
							console.log("ADD COMMENT");
							var comment = {};

							comment.collectionId = elm._id;
							comment.collectionTitle = elm.title;
							comment.authorId = elm.authorId;
							comment.body = elm.feeds[0].comment;

							feed.comments.push(comment);
						});
					} else {
						feed.comments = null;
					}

					callback();
				});
			}, function (callback) {
				if (feed.comments) {
					async.each(feed.comments, function (comment, callback) {
						getUser(mongoose.Types.ObjectId(comment.authorId.toString()), function (user) {
							comment.authorFirstName = user.firstName;
							comment.authorLastName = user.lastName;
							comment.authorAvatar = user.avatar;

							callback();
						});
					}, function (err) {
						if (err) console.log(err);

						callback();
					});
				} else {
					callback();
				}
			}*/], function (err) {
				if (err) console.log(err);

				callback();
			});
		}, function (err) {
			if (err) console.log(err);

			callback(feeds);
		});
	}

	// Find similar
	function findSimilarFeeds(id, user, callback) {
		var similarFeedsSorted = [],
			baseFeed,
			similarFeedsUnsorted;
		
		async.series([function (callback) {
			// Get categories of base feed
			Feed.find({_id: mongoose.Types.ObjectId(id)}, 'id title rankedCategories', function (err, feed) {
				if (err) callback({ message: "Error finding base feed:" + err, status: 500});

				if (feed.length > 0) {
					console.log("Found base feed - %s", feed[0]._id);

					console.log("BASE FEED");
					console.dir(feed);

					baseFeed = feed[0];
					callback();
				} else {
					callback({ message: "Base feed not found:" + err, status: 404});
				}

			});
		}, function (callback) {
			// Get list of feeds with ANY matching category
			Feed.find({_id: { $ne: baseFeed._id }, rankedCategories: { $elemMatch: { category: { $in: _.pluck(baseFeed.rankedCategories, 'category')} } } }, 'id title rankedCategories', function (err, feeds) {
				if (err) callback({ message: "Error finding similar feeds:" + err, status: 500});

				if (feeds.length > 0) {
					console.log("Found %s similar feeds", feeds.length);
					similarFeedsUnsorted = feeds;
					callback();
				} else {
					console.log("Found no similar feeds");
					callback();
				}

			});

		}, function (callback) {
			// Sort feeds by how closely categories relate			
			similarFeedsUnsorted = _.map(similarFeedsUnsorted, function (elm, i, list) {
				var newElm = {};
					
				newElm.id = elm._id;
				newElm.title = elm.title;
				newElm.rankedCategories = elm.rankedCategories;
				newElm.score = 0;

				_.each(elm.rankedCategories, function (elm, i, list) {
					var baseFeedRankedCategoryIndex = _.indexOf(baseFeed.rankedCategories, _.findWhere(baseFeed.rankedCategories, { category: elm.category}));
					
					// Check if category is a match at all
					if (baseFeedRankedCategoryIndex > -1) {
						// Increase score by a max of the base feed rank for that category
						if(elm.rank >= baseFeed.rankedCategories[baseFeedRankedCategoryIndex].rank)
							newElm.score += baseFeed.rankedCategories[baseFeedRankedCategoryIndex].rank;
						else {
							newElm.score += elm.rank; 	
						} 
					}
				});

				return newElm;
			});

			similarFeedsSorted = _.sortBy(similarFeedsUnsorted, 'score').reverse();	

			console.log("SORTED FEEDS");
			console.dir(similarFeedsSorted);

			callback();

		}, function (callback) {
			// Get first 10 feeds
			getFeeds(similarFeedsSorted.slice(0, 10), user, function (feeds) {
				_.each(feeds, function (elm, i) {
					similarFeedsSorted[i] = elm;
				});

				callback();
			});

		}], function (err) {
			if (err) {
				console.log("ASYNC (find similar feeds) ERROR - %s", err.message);
				callback(err, null);
			}

			// Send list of similar feeds
			callback(null, similarFeedsSorted);

			// Release enclosed variables
			similarFeedsSorted = null;
			similarFeedsUnsorted = null;
		});


	}

	function getFeedImages(id, amount, callback) {
		var entries = null,
			limit = 0,
			images = [],
			imageCount = 0;

		async.doUntil(function (callback) {
			// Get enough entries to fill image preview
			images = [];
			limit += 10;
			imageCount = 0;
			Entry.find({feedId: id}, {images:1, title:1, url:1, publishDate:1 }, { limit: limit, sort: { publishDate: -1}}, function (err, results) {
				if (err) {
					callback("Error searching entries for images: %s", err);
				} else {
					console.log('Found %s entries', results.length);
					entries = results;
					callback();
				}
			});
		}, function () { 
			var totalWidth = 0,
				//imageCount = 0,
				margin = 2,
				width = 4200;

			_.each(entries, function (entry, i) {
				_.each(entry.images, function (elm, i) {
					if (elm.smallThumbnail && elm.smallThumbnail.height >= 150) {
						//totalWidth += image.smallThumbnail.width;
						console.dir(elm);
						var image = {};

						image.id = elm._id;
						image.url = elm.url;
						image.width = elm.width;
						image.height = elm.height;
						image.smallThumbnail = elm.smallThumbnail;
						image.largeThumbnail = elm.largeThumbnail;
						image.large2xThumbnail = elm.large2xThumbnail;

						image.entryId = entry._id;
						image.entryTitle = entry.title;
						image.entryUrl = entry.url;
						image.entryPublishDate = entry.publishDate;

						images.push(image);
						imageCount++;
					}
				});
			});

			//totalWidth = totalWidth - (margin * (imageCount+1));

			console.log("ENOUGH IMAGES CHECK - LIMIT: %s - RESULT LENGTH - %s - IMAGE COUNT - %s", limit, entries.length, imageCount);

			return imageCount >= amount || entries.length < limit; 

		}, function (err) {
			if (err) {
				console.log(err);
				callback(null, err.status);
			} else {
				callback(images, 200);
			}

			limit = null;
			imageCount = null;
			images = null;
			entries = null;
		});
	}

	// Get entry info
	function getEntry(id, callback) {
		Entry.findById(id, function (err, entry) {
			if (err) {
				console.log(err);
				return;
			}

			if (entry) {
				console.log("Entry found!");
				console.dir(entry);
				callback(entry);
			} else {
				console.log("No entry found!");
				callback();
			}
		});
	}

	// Get entry IDs
	function getEntryIds(userId, entryId, feedId, callback) {
		var entryInfo = {};

		async.series([function (callback) {
			Cat.findById(userId, 'username email', function (err, user) {
				if (err) {
					console.log(err);
				}

				if (user) {
					console.log("User found!");
					console.dir(user);

					entryInfo.username = user.username;
					entryInfo.userEmail = user.email;

					callback();
				} else {
					console.log("No user found!");
					callback();
				}
			});
		}, function (callback) {
			Entry.findById(entryId, 'link guId', function (err, entry) {
				if (err) {
					console.log(err);
				}

				if (entry) {
					console.log("Entry found!");
					console.dir(entry);

					entryInfo.entryLink = entry.link;
					entryInfo.entryGuId = entry.guId;

					callback();
				} else {
					console.log("No entry found!");
					callback();
				}
			});
		}, function (callback) {
			Feed.findById(feedId, 'url feedUrl', function (err, feed) {
				if (err) {
					console.log(err);
					return;
				}

				if (feed) {
					console.log("Feed found!");
					console.dir(feed);

					entryInfo.feedUrl = feed.url;
					entryInfo.feedFeedUrl = feed.feedUrl;

					callback();
				} else {
					console.log("No feed found!");
					callback();
				}
			});
		}], function (err) {
			if (err) {
				console.log(err);
			}

			console.log("ENTRY IDs");
			console.dir(entryInfo);

			if (entryInfo.username && entryInfo.userEmail && entryInfo.entryLink && entryInfo.entryGuId && entryInfo.feedUrl && entryInfo.feedFeedUrl) {
				callback(entryInfo);
			} else {
				callback(null);
			}
		});
	}

	// Get # of entries
	function getCount(id, callback) {
		Entry.where('feedId', id).count(function (err, count) {
			if (err) {
				console.log(err);
				return;
			}

			callback(count);
		});
	}

	// Get date of latest post
	function getLastPublishedDate(id, callback) {
		Entry.findOne({feedId: id}, 'publishDate', {sort: {publishDate: -1}}, function (err, result) {
			if (err) {
				console.log(err);
				return;
			}

			if (result)
				callback(result.publishDate);
			else
				callback('-');
		});
	}

	// Get entries
	function getFeedEntries(id, limit, lastUrl, callback) {
		//cutoffDate = !cutoffDate ? Date.now() + (24 * 60 * 60 * 1000) : cutoffDate; // Set cutoff date in the future (by one day to offset timezone issues) to pull from beginning

		console.log("DATE: %s", id);
		console.log("LIMIT: %s", limit);
		console.log("LAST URL: %s", lastUrl);

		Feed.find({_id: mongoose.Types.ObjectId(id)}, {entries: 1}, function (err, result) {
			if (err) {
				console.log(err);
				//return;
			}

			if (result.length) {
				/*for (var i=0; i < result.length; i++) {
					var entry = {};
					entry.id = result[i]._id;
					entry.url = result[i].url;
					entry.feedId = result[i].feedId;
					entry.content = result[i].content;
					entry.images = result[i].images;
					entry.title = result[i].title;
					entry.publishDate = result[i].publishDate;

					result[i] = entry;
				}*/

				console.log("INDEX: %s", result[0].entries.indexOf(_.findWhere(result[0].entries, {url:lastUrl})));
				console.log("FIND: %s", _.findWhere(result[0].entries, {url:lastUrl}));

				var additionalEntries = result[0].entries.splice(result[0].entries.indexOf(_.findWhere(result[0].entries, {url:lastUrl}))+1, 15);
				
				if (additionalEntries.length >= 15) {
					console.log("FOUND ENOUGH ENTRIES");
					callback(additionalEntries, 200);
				} else {
					console.log("NOT ENOUGH ENTRIES");
					callback(null, 200);
				}
			} else {
				console.log("GET FEED ENTRIES ELSE");
				callback(null, 200);
			}
		});
	}

	// Get entries
	function getRecentEntries(user, ids, callback) {
		// Calculate userDateCutoff...
		//if (user.previousLogin !== undefined)
		//	var date = user.previousLogin;
		//else
			var date = new Date();
		var userDateCutoff = date - (3 * 24 * 60 * 60 * 1000); // subtract 3 days from previous login

		Entry.find({feedId: {$in: ids}, publishDate:{$gte: userDateCutoff}}).select('id feedId url content images title publishDate').sort({publishDate: -1}).exec(function (err, result) {
			if (err) {
				console.log(err);
				return;
			}

			if (result) {
				for (var i=0; i < result.length; i++) {
					var entry = {};
					entry.id = result[i]._id;
					entry.feedId = result[i].feedId;
					entry.url = result[i].url;
					entry.content = result[i].content;
					entry.images = result[i].images;
					entry.title = result[i].title;
					entry.publishDate = result[i].publishDate;

					result[i] = entry;
				}

				callback(result);
			} else
				callback();
		});
	}

	function sizeImage(image, callback) {
		im(image).identify(function (err, value) {
			if (err) {
				console.dir(err);
				callback(null);
			} else {
				console.dir(value);
				callback(value);
			}
		});
	}

	function resizeImage (image, width, height, quality, callback) {
		im(image).setFormat('JPEG').resize(1280).stream(function (err, stdout, stderr) {
			//console.log('IMAGE RESIZE');
			
			if (err) {
				console.log('COMPRESSION ERROR: ' + err);

				callback();
			}
					
			var imageData = [];
	
			stdout.on('data', function (data) {
				imageData.push(data);
			});
			
			stdout.on('error', function (err){
				console.log('IMAGE RESIZE ERROR: ' + err);
				entry.images[task.index][size] = null;

				callback(null);
				imageData = null;
			});
	
			stdout.on('close', function () {
				console.log('^ end ^');
				
				var resizedImageFile = Buffer.concat(imageData);
				imageData = null;

				console.log("IMAGE RESIZED");
				console.dir(resizedImageFile);

				sizeImage(resizedImageFile, function (value) {
					im(resizedImageFile).filesize(function (err, filesize) {
	  					if (err) console.log("Filesize error - %s", err);
	  					console.log("FILESIZE - %s", filesize.replace('B', ''));

	  					callback(resizedImageFile, filesize.replace('B', ''), value.size);
						resizedImageFile = null;
					});
				});
			});
		});
	}	

	function cropImage (image, callback) {
		im(image).identify(function (err, value) {
			if (err) {
				console.dir(err);
				callback(null);
			} else {
				console.dir(value);

				var size, width, height;

				if (value.size.width <= value.size.height) {
					width = size = 300;
					height = null;
				} else {
					height = size = 300;
					width = null;
				}

				console.log("%s - %s - %s", width, height, size);

				im(image).resize(width, height).gravity('North').crop(size, size, 0, 0).stream(function (err, stdout, stderr) {
					//console.log('IMAGE RESIZE');
					
					if (err) {
						console.log('COMPRESSION ERROR: ' + err);

						callback();
					}
							
					var imageData = [];
			
					stdout.on('data', function (data) {
						imageData.push(data);
					});
					
					stdout.on('error', function (err){
						console.log('IMAGE RESIZE ERROR: ' + err);
						entry.images[task.index][size] = null;

						callback(null);
						imageData = null;
					});
			
					stdout.on('close', function () {
						console.log('^ end ^');
						
						var croppedImageFile = Buffer.concat(imageData);
						imageData = null;

						im(croppedImageFile).filesize(function (err, filesize) {
		  					console.log("FILESIZE - %s", filesize.replace('B', ''));

		  					callback(croppedImageFile, filesize.replace('B', ''));
							croppedImageFile = null;
						});
					});
				});

			}
		});
	}

	function cropTo3x2Image (image, callback) {
		im(image).identify(function (err, value) {
			if (err) {
				console.dir(err);
				callback(null);
			} else {
				console.dir(value);

				var width, height;

				if (value.size.width <= value.size.height) {
					// Portrait
					width = value.size.width;
					height = value.size.width/1.5;
				} else {
					// Landscape
					width = value.size.height*1.5;
					height = value.size.height;
				}

				console.log("%s - %s - %s", width, height);

				im(image).gravity('North').crop(width, height, 0, 0).stream(function (err, stdout, stderr) {
					//console.log('IMAGE RESIZE');
					
					if (err) {
						console.log('CROP ERROR: ' + err);

						callback();
					}
							
					var imageData = [];
			
					stdout.on('data', function (data) {
						imageData.push(data);
					});
					
					stdout.on('error', function (err){
						console.log('IMAGE CROP ERROR: ' + err);
						entry.images[task.index][size] = null;

						callback(null);
						imageData = null;
					});
			
					stdout.on('close', function () {
						console.log('^ end ^');
						
						var croppedImageFile = Buffer.concat(imageData);
						imageData = null;

						im(croppedImageFile).filesize(function (err, filesize) {
		  					console.log("FILESIZE - %s", filesize.replace('B', ''));

		  					callback(croppedImageFile, filesize.replace('B', ''));
							croppedImageFile = null;
						});
					});
				});

			}
		});
	}

	function uploadAvatar(id, files, folder, imageData, filesize, callback) {
		console.log('UPLOADING AVATAR: %s', id);
		console.dir(files);

		var imageTypes = ['image/jpeg', 'image/jpg', 'image/png'];

		// Validate Image
		if (imageTypes.indexOf(files.image.mime) < 0) {
			console.log("File type not supported: %s", files.image.mime);
			callback({ message: "Image must be a JPG or PNG", status: 406}, null);
		} else if (files.image.length > 10 * 1000000) {
			console.log("File too large: %s", files.image.length);
			callback({ message: "Image must be 10mb or less", status: 413}, null);
		}

		// Build address for image
		var imageUrl = '/' + folder + '/avatars/' + id + '_original.' + files.image.mime.split('/')[1];;

		var s3Req = s3.put(imageUrl, {
			'Content-Length' : filesize.replace('B', ''),
			'Content-Type' : files.image.mime,
			'x-amz-acl': 'public-read'
		});
		
		s3Req.on('error', function (err){
			console.log('S3 SAVE ERROR: ' + err);
		});

		s3Req.on('response', function (s3Res) {  //prepare 'response' callback from S3
			
			console.dir(s3Res.statusCode);
			
			if (200 == s3Res.statusCode) {
				console.log('it worked');
				
				callback(null, s3Req.url);
			} else {
				callback({ message: "S3 Save Error", status: 500 }, null);
			}	
		});			
	
	  	console.log("ABOUT TO SEND S3 REQ");
	  	console.dir(imageData);
		s3Req.end(imageData);  //send the content of the file and an end
	}


	function createSnapshot(imageList, comment, feedId, userId, links, callback) {

		console.log("CREATING SNAPSHOT");

		var filesize,
			images = [],
		  	canvas = new Canvas(904, 904),
		  	ctx = canvas.getContext('2d'),
		  	finalImage,
		  	finalImages = [],
		  	snapshot = new Snapshot();

		// SET CANVAS BACKGROUND
		ctx.fillStyle   = '#FFF';
  		ctx.fillRect(0, 0, 904, 904);

		// NEED ORDERS FOR SIZES
		if (imageList.length == 2) {
			orders = [600, 300];
		} else if (imageList.length == 3) {
			orders = [300, 300, 300];
		} else {
			callback({ message: "Error: Can only have 2 or 3 rows of images.", status: 501 }, null);
		}

		async.series([function (callback) {
			// GET IMAGES
			console.log("GET IMAGES");

			var i = 0;

			async.eachSeries(imageList, function (list, callback) {	
				var ii = 0;

				async.eachSeries(list.images, function (elm, callback) {
					console.log("IMAGE - %s - %s", i, ii);
					Entry.find({ _id: elm.entryId }, { title: 1, url: 1, images: { $elemMatch: { url: elm.url } } }, function (err, entry) {
						if (err) callback({ message: "ERROR RETRIEVING ENTRY: " + err, status: 502 });
						else if (entry.length > 0 && entry[0] != null) {
							imageList[i].images[ii] = entry[0].images[0];

							imageList[i].images[ii].entryUrl = entry[0].url;
							imageList[i].images[ii].entryTitle = entry[0].title;
							imageList[i].images[ii].entryId = entry[0]._id;

							ii++;
							callback();
						} else {
							callback({ message: "ENTRY NOT FOUND: " + err, status: 502 });
						}
					});
				}, function (err) {
					if (err) callback(err);
					else {
						i++;
						callback();
					}
				});
			}, function (err) {
				if (err) callback(err);
				else callback();
			});


		}, function (callback) {
			// PREP IMAGES
			console.log("PREP IMAGES");

			var i = 0;

			async.eachSeries(imageList, function (list, callback) {	
				var ii = 0;

				images[i] = { images: [], offset: list.offset };

				async.eachSeries(list.images, function (elm, callback) {

					console.log("LG RESIZE: %d - %s", orders[i], elm.large2xThumbnail.url || elm.largeThumbnail.url || elm.smallThumbnail.url || elm.url);
					im(elm.large2xThumbnail.url || elm.largeThumbnail.url || elm.smallThumbnail.url || elm.url).resize(null, orders[i]).matteColor('#FFFFFF').frame(2, 2, 0, 0).setFormat('jpeg').toBuffer(function (err, buffer) {
						if (err) callback({ message: 'LG RESIZE ERR: ' + err, status: 500 });
						else {
							im(buffer).size(function(err, value) {
								if (err) callback({ message: 'LG SIZE ERR: ' + err, status: 500 });
								else {
									images[i].images[ii] = { image: buffer, size: value };

									ii++;
									callback();
								}
							});
						}
					});
				}, function (err) {
					if (err) callback(err);
					else {
						i++;
						callback();
					}
				});
			}, function (err) {
				if (err) callback(err);
				else callback();
			});

		}, function (callback) {
			// PLACE IMAGES
			console.log("PLACE IMAGES");

			var	y = 0,
				i = 0;

			async.eachSeries(images, function (list, callback) {
				var x = 0;

				async.eachSeries(list.images, function (elm, callback) {
					var img = new Canvas.Image;

					img.src = elm.image;

					ctx.drawImage(img, x - list.offset*2, y, elm.size.width, elm.size.height);

					x += elm.size.width;

					callback();
				}, function (err) {
					if (err) callback(err);
					else {
						y += orders[i] + 4;
						i++;

						callback();
					}
				});
			}, function (err) {
				if (err) callback(err);
				else callback();
			});

		}, function (callback) {
			// EXPORT CANVAS
			console.log("EXPORT CANVAS");

			canvas.toBuffer(function(err, buf){
				finalImage = buf;
				callback();
			});
		}, function (callback) {
			// FINISH IMAGE
			console.log("FINISH IMAGE");

			im(finalImage).crop(902, 902, 2, 2).matteColor('#FFFFFF').frame(16, 16, 0, 0).setFormat('jpeg').toBuffer(function (err, buffer) {
				if (err) callback({ message: 'FRAME RESIZE ERROR: ' + err, status: 500 });
				else {
					finalImages['url'] = buffer;
					callback();
				}
			});
		}, function (callback) {
			// RESIZE
			console.log("RESIZE");

			async.eachSeries([600, 300, 150], function (size, callback) {
				switch(size) {
					case 600:
						var sizeTitle = 'large2xThumbnail';
						break;
					case 300:
						var sizeTitle = 'largeThumbnail';
						break;
					case 150:
						var sizeTitle = 'smallThumbnail';
						break;
				}

				console.log("RESIZE START ----");
				console.dir(finalImages);

				im(finalImages['url']).quality(100).resize(size, null).toBuffer(function (err, buffer) {	
					if (err) callback({ message: 'RESIZE ERROR: ' + err, status: 500 });
					else {

						finalImages[sizeTitle] = buffer;
						console.log("RESIZE DONE -----");
						console.dir(finalImages);
						console.log("-----------------");
						callback();
					}
				});
									
			}, function (err) {
				if (err) callback(err);
				else callback();
			});
			
		}, function (callback) {
			// BUILD & SAVE SNAPSHOT
			console.log("BUILD & SAVE SNAPSHOT");

			snapshot.images = imageList;
			snapshot.userId = userId;
			snapshot.feedId = feedId;
			snapshot.links = links;
			snapshot.comment = comment;

			snapshot.save(function(err, snapshot) {
				if (err) callback({ message: "ERROR SAVING SNAPSHOT: " + err, status: 500 });
				else callback();
			});

		}, function (callback) {
			// EXPORT TO S3
			console.log("EXPORT TO S3");

			async.eachSeries(['original', 600, 300, 150], function (size, callback) {
				var callbackCalled = false;

				switch(size) {
					case 'original':
						var sizeTitle = 'url';
						break;
					case 600:
						var sizeTitle = 'large2xThumbnail';
						break;
					case 300:
						var sizeTitle = 'largeThumbnail';
						break;
					case 150:
						var sizeTitle = 'smallThumbnail';
						break;
				}

				console.log("length: %s", finalImages[sizeTitle].length);
				console.log("URL: %s", '/snapshots/' + userId + '/' + snapshot._id + '_' + size + '.jpg');
				
				var s3Req = s3.put('/snapshots/' + userId + '/' + snapshot._id + '_' + size + '.jpg', {
					'Content-Length' : finalImages[sizeTitle].length,
					'Content-Type' : 'image/jpg',
					'x-amz-acl': 'public-read'
				});
				
				s3Req.on('error', function (err){
					console.log('S3 SAVE ERROR: ' + err);

					if (!callbackCalled) {
						callback(null);
						callbackCalled = true;
					}
				});

				s3Req.on('response', function (s3Res) {  //prepare 'response' callback from S3
					
					console.dir(s3Req);
					
					if (200 == s3Res.statusCode) {
						console.log('snapshot successfully saved to S3');
						
						snapshot[sizeTitle] = s3Req.url;

						if (!callbackCalled) {
							callback();
							callbackCalled = true;
						}
					} else {
						if (!callbackCalled) {
							callback({ message: s3Res, status: s3Res.statusCode }, null);
							callbackCalled = true;
						}
					}
				});			
			
			  	console.log("ABOUT TO SEND SNAPSHOT TO S3 REQ");
				s3Req.end(finalImages[sizeTitle]);  //send the content of the file and an end
			}, function (err) {
				if (err) callback(err);
				else callback();
			});

		}, function (callback) {
			// SAVE FINAL SNAPSHOT
			console.log("SAVE FINAL SNAPSHOT");

			snapshot.save(function(err, snapshot) {
				if (err) callback({ message: "ERROR SAVING FINAL SNAPSHOT: " + err, status: 500 });
				else callback();
			});
		}, function (callback) {
			// MARK FEED
			console.log("MARK FEED");

			var activity = new Activity();

			activity.asterisk(userId, feedId, function (response) {
				console.log("ASTERISK RESPONSE: %s", response);
				callback();
			});
		}], function (err) {
			// FINISHED
			console.log("FINISHED");

			if (err) {
				callback(err, null);
			} else {
				callback(null, snapshot);
			}

			// RELEASE ENCLOSED VARIABLES
			images = null;
			filesize = null;
		  	canvas = null;
		  	ctx = null;
		  	finalImage = null;
		  	finalImages = null;
		  	snapshot = null;
		});
	}

	////////////////////
	// Route Handlers //
	////////////////////

	return {	

		///////////////
		// User Info //
		///////////////

		cat: function (req, res) {
			Cat.findOne({username: req.params.username}, function (err, user) {
				if (user) {
					var cat = {};
					cat.id = user._id;
					cat.firstName = user.firstName;
					cat.lastName = user.lastName;
					cat.username = user.username;
					cat.email = user.email;
					cat.gender = user.gender;
					cat.birthday = user.birthday;
					cat.bio = user.bio;
					cat.favoriteFeeds = user.favoriteFeeds;
					cat.avatar = user.avatar || 'http://s3-us-west-1.amazonaws.com/pctrly-dev/avatars/users/default.jpg';

					res.send(cat, 200);
				} else 
					res.send(null, 500);
			});
		},

		catCheck: function (req, res) {
		
			var foundCat = new Object;
		
			if (req.params.field == 'username') {
				Cat.findOne({ username: req.query.value}, function(err, cat) {
					console.log('Querying for a cat!');
					console.log(cat);
					
					if (cat != null) {
						foundCat.id = cat._id;
						foundCat.name = cat.username;
						res.json(foundCat);
					} else if (err) {
						console.log('Error: ' + err);
						res.send(null);
					} else {
						res.send(null);
					}
				});
			} else if (req.params.field == 'email') {
				Cat.findOne({ email: req.query.value}, function(err, cat) {
					console.log('Querying for a cat!');
					console.log(cat);
					
					if (cat != null) {
						foundCat.id = cat._id;
						foundCat.email = cat.email;
						res.json(foundCat);
					} else if (err) {
						console.log('Error: ' + err);
						res.send(null);
					} else {
						res.send(null);
					}
				});
			} else {
				res.send("error :)");
			}
		
		},

		usernameSearch: function (req, res) {
			Cat.find({username: { $regex: req.params.query, $options: 'i' }}, {username: 1}, function (err, results) {
				if (err) {
					console.log('User search error: ' + err);
					return res.send(null, 500);
				}
				
				if (results) {
					console.log("SEARCH SUCCESS: %s", results);

					var users = [];

					_.each(results, function (elm) {
						users.push(elm.username);
					});

					res.send(users, 200);
					
				} else {
					res.send(null, 404);
				}
			})
		},

		addUser: function (req, res) {
			Cat.findOne({username: req.body.user.username}, function(err, cat) {
				if (cat) {
					console.log('Name already taken: ' + req.body.username);
					return res.send('null', 409);
				} else {
					console.log("NO NAMES FOUND");
					console.log(req.body);
					
					var user = new Cat();
				  
					user.firstName = req.body.user.firstName;
					user.lastName = req.body.user.lastName;
					user.username = req.body.user.username;
					user.email = req.body.user.email;
					user.gender = req.body.user.gender;
					user.birthday.month = req.body.user.birthday.month;
					user.birthday.day = req.body.user.birthday.day;
					user.birthday.year = req.body.user.birthday.year;
					user.bio = req.body.user.bio;

					user.save(function (err, newUser) {		
						if (err) {
							console.log("-------------------");
							console.log("Registration error!" + err);
							console.log("-------------------");
							return res.send('null', 500);
						}

						if (newUser) {
							console.log("----------");
							console.log("User Added!");
							console.log("----------");

							user.id = newUser._id;

							res.send(user, 200);
						} else {
							res.send(null, 500);
						}
					});
				}
			});
		},
		
		editUser: function (req, res) {
			console.log('EDITING USER: %s', req.body.user);
			console.dir(req.params.id);
			console.dir(req.body.user);

			var update = {},
				valid = true;


			if (req.body.user.username !== undefined) {
				console.log('Check username - %s - %s', req.body.user.username, validator.isNumeric(req.body.user.username));
				if (!validator.matches(req.body.user.username, /^[a-zA-Z0-9_]*$/)) {
					console.log('INVALID USERNAME');
					valid = false;
				}
				update.username = req.body.user.username;
			}
			
			if (req.body.user.firstName !== undefined) {
				if (!validator.isAlpha(req.body.user.firstName)) {
					console.log('INVALID FIRST NAME');
					valid = false;
				}
				update.firstName = req.body.user.firstName;
			}

			if (req.body.user.lastName !== undefined) {
				if (!validator.isAlpha(req.body.user.lastName)) {
					console.log('INVALID  LAST NAME');
					valid = false;
				}
				update.lastName = req.body.user.lastName;
			}

			if (req.body.user.email !== undefined) {
				if (!validator.isEmail(req.body.user.email)) {
					console.log('INVALID EMAIL');
					valid = false;
				}
				update.email = req.body.user.email;
			}

			if (req.body.user.bio !== undefined) {
				update.bio = validator.escape(req.body.user.bio);
			}

			if (req.body.user.gender !== undefined) {
				if (!validator.isAlpha(req.body.user.gender)) {
					console.log('INVALID GENDER');
					valid = false;
				}
				update.gender = req.body.user.gender;
			}

			if (req.body.user.birthday !== undefined) {
				update.birthday = {};
				
				if (req.body.user.birthday.month !== undefined) {
					if (!validator.isNumeric(req.body.user.birthday.month)) {
						console.log('INVALID MONTH');
						valid = false;
					}
					update.birthday.month = req.body.user.birthday.month;
				}

				if (req.body.user.birthday.day !== undefined) {
					if (!validator.isNumeric(req.body.user.birthday.day)) {
						console.log('INVALID DAY');
						valid = false;
					}
					update.birthday.day = req.body.user.birthday.day;
				}

				if (req.body.user.birthday.year !== undefined) {
					if (!validator.isNumeric(req.body.user.birthday.year)) {
						console.log('INVALID YEAR');
						valid = false;
					}
					update.birthday.year = req.body.user.birthday.year;
				}
			}

			if (valid) {

				Cat.findOneAndUpdate({ _id: req.params.id }, update, function(err, user) {
				if (err) {
						console.log('User search error: ' + err);
						return res.send(null, 500);
					}
					
					if (user) {
						console.log("EDITING SUCCESS: %s", user);

						var userInfo = {};

						userInfo.id = user._id;
						userInfo.username = user.username;
						userInfo.email = user.email;
						userInfo.firstName = user.firstName;
						userInfo.lastName = user.lastName;
						userInfo.bio = user.bio;
						userInfo.gender = user.gender;
						userInfo.birthday = user.birthday;

						res.send(userInfo, 200);
						
					} else {
						res.send(null, 404);
					}
				});
			} else {
				res.send(null, 406)
			}
		},

		addUserAvatar: function (req, res) {
			console.dir(req.files);

			fs.readFile(req.files.image.path, function (err, data) {
			  	if (err) {
			  		console.log("Error loading avatar - %s", err)
			  		callback(null);
			  	}

			  	cropImage(data, function (data, filesize) {
					
					uploadAvatar(req.params.id, req.files, 'users', data, filesize, function (err, url) {
						if (err) res.send(err.message, err.status);
						else {
							Cat.findOneAndUpdate({ _id: req.params.id }, { avatar: url }, function(err, user) {
								if (err) {
									console.log('User search error: ' + err);
									return res.send('Error saving avatar', 500);
								}
								
								if (user) {
									console.log("USER AVATAR SUCCESS: %s", user.username);
									res.send(url, 200);
								} else {
									res.send('Error saving avatar', 500);
								}
							});
						}
					});
				});
			});
		},

		chooseDefaultUserAvatar: function (req, res) {
			Cat.findOneAndUpdate({_id: req.params.id}, { $set: { avatar: '/assets/img/avatars/' + Math.floor(Math.random()*16) + ".png" } }, function (err, user) {
				if (err) {
					console.log(err);
					res.send(null, 500);
				} else if (user) {
					res.send(user.avatar, 200);
				} else {
					res.send(null, 500);
				}
			});
		},

		changePassword: function (req, res) {
			console.dir(req.body);

			var valid = true;

			if (!validator.isLength(req.body.password.new, 4, 10)) valid = false;
			if (!validator.matches(req.body.password.new, /^[a-zA-Z0-9!@#$%^&*]*$/)) valid = false;

			if (valid) {
			    req.user.password = validator.escape(req.body.password.new);

			    req.user.save(function (err) {
			    	if (err) {
			    		console.log('Change password error: %s', err);
			    		res.send(null, 500);
			    	} else {
			    		res.send(null, 200);
			    	}
			    });
			} else {
			    res.send("Password is invalid", 406);
			}
		},

		resetPassword: function (req, res) {

			Cat.findOne({ _id: req.params.id }, { id: 1  }, function(err, user) {
				if (err) {
					console.log('User search error: ' + err);
					res.send(null, 500);
				}
				
				if (user) {
					user.setPassword(null, function (err, password) {
						if (err) res.send(null, 500);
						else {
							console.log("USER PASSWORD RESET: %s", password);
							res.send(password, 200);
						}
					})
				} else {
					res.send(null, 500);
				}
			});
		},

		getRecentlyUpdatedFavorites: function (req, res) {
			var date = new Date(),
				cutoffDate = new Date(date.getTime() - 1000*60*60*24);

			Feed.find({ _id: { $in: req.user.favoriteFeeds }, seenUsers: { $ne: req.user.id }, lastPublished: {$gte: cutoffDate }}, {_id:1}, function (err, feeds) {
				if (err) {
					console.log('Error getting updated count: %s', err);
					res.send(null, 500);
				} else {
					console.log('RECENTLY UDATED COUNT - %s', feeds.length);
					res.send({feeds: _.pluck(feeds, '_id'), count: feeds.length}, 200);
				}
			})
		},
		


		
		///////////
		// Users //
		///////////

		users: function (req, res) {
		
			Cat.find({}, function(err, cats) {
				console.log(cats.length);
				console.log('Querying for cats!');
				var catList = [];
							
				if (cats != null) {
					for (i=0 ; i < cats.length ; i++) {
						var cat = new Object;
						cat.id = cats[i]._id;
						cat.username = cats[i].username;
						cat.firstName = cats[i].firstName;
						cat.lastName = cats[i].lastName;
						cat.email = cats[i].email;
						cat.bio = cats[i].bio;
						cat.avatar = cats[i].avatar;
						cat.birthday = cats[i].birthday;
						cat.gender = cats[i].gender;

						
						//if (users.online[cat.username])
						//	cat.online = 1;
							
						catList.push(cat);
					}
					
					res.json(catList, 200);
				} else if (err) {
					console.log('Error: ' + err);
					res.send(null, 500);
				} else {
					res.send(null, 404);
				}
			});
		
		},

		getFeeds: function (req, res) {
			//console.log("GET FEEDS");
			var date = new Date();
			//var userDateCutoff = new Date(date.getTime() - (3 * 24 * 60 * 60 * 1000)), // subtract 7 days from previous login
			//	feedActions = ['read', 'subscribe', 'see', 'like'];
			/*console.log('Querying for feeds!');
			console.dir(userDateCutoff);

			Entry.aggregate({$project: {feedId: 1, newPost: {$cond: [{$gte: ['$publishDate', new Date(1377053604609)]}, 1, 0]} }}, {$group: {_id: '$feedId', recentPosts: {$sum: '$newPost'}}}, {$sort: {recentPosts:-1 } }, function (err, results) {
			*/

			async.waterfall([function (callback) {

				if (req.query.filter == 'list' && req.query.subFilter) {
					// OPTIONAL: ADD'l FEED LIST
					async.waterfall([function (callback) {
						// Check if category is featured
						var titleCheck = new RegExp("^" + req.query.subFilter + "$", "i");
						Category.findOne({title: titleCheck}, {}, function (err, result) {
							if (err) callback({ message: 'Error searching for category', status: 500 });
							else {
								console.log("CATEGORY FOUND");
								if (!result.featured) {
									console.log("CATEGORY NOT FEATURED");
									callback(null, result);
								} else {
									console.log("CATEGORY FEATURED");
									callback(null, null);
								}
							}
						})
					}, function (category, callback) {
						// Get add'l feed list
						//console.dir(category);

						if (category) {
							Cat.find({ savedFeeds: { $elemMatch: { categoryId: category._id } } }, { 'savedFeeds.$.feedId': 1 }, function (err, results) {
								if (err) callback({ message: 'Error seraching for saved feeds', status: 500 });
								else {
									console.dir(results);
									console.dir(_.flatten(_.pluck(results, 'savedFeeds')));
									callback(null, _.unique(_.pluck(_.flatten(_.pluck(results, 'savedFeeds')), 'feedId')));
								}
							});
						} else {
							callback(null, []);
						}
					}], function (err, addlFeeds) {
						if (err) {
							console.log(err);
							res.send(null, err.status);
						} else {
							callback(null, addlFeeds);
						}
					});
				} else {
					callback(null, []);
				}

			}, function (addlFeeds, callback) {

				// GET FEEDS

				switch (req.params.order) {
					case 'subscriptions':
						//console.log("~GET SUBSCRIPTIONS~");
						//console.dir(filteredFeedList);
						//console.dir(req.user.feeds);
						filteredFeedList = _.reduce(req.user.feeds, function (memo, elm) { 
							_.each(filteredFeedList, function (elm2) {
								if (elm.equals(elm2)) return memo.push(elm);
							});
							return memo; 
						}, []);
						console.dir(filteredFeedList);

						Entry.aggregate({$match: {feedId: {$in: filteredFeedList}}}, {$group:{"_id":"$feedId", "recentPost":{$max:"$publishDate"}}},{$sort:{'recentPost':-1}}, {$limit:100}, {$project:{"feedId":1, "recentPost":1}}, function (err, results) {
							if (err) {
								console.log(err);
								return;
							}

							callback(null, results);
						});

						break;
					case 'alphabetical':
						console.log("~GET ALPHABETICAL~");

						var projection = {
							id: 1,		
							title: 1,
							url: 1,
							feedUrl: 1,
							avatar: 1,
							author: 1,
							categories: 1,
							storeUrl: 1,
							portfolioUrl: 1,
							newsletterSignupUrl: 1,
							twitterUrl: 1,
							instagramUrl: 1,
							facebookUrl: 1,
							pinterestUrl: 1,
							tumblrUrl: 1,
							flickrUrl: 1,
							etsyUrl: 1,
							city: 1,
							state: 1,
							country: 1,
							rank: 1,
							asterisks: 1,
							asteriskCount: 1,
							badges: 1,
							lastPublished: 1
						}

						var query = {};

						console.log('CURRENT ROLE: %s', req.currentRole);

						//if (req.currentRole != 'administrator') {
						//	query.hidden = { $ne: true };
						//} else {
							projection.hidden = 1;
							projection.rankedCategories = 1;
						//}

						Feed.find(query, projection, {sort: {title: 1}}, function (err, results) {
							if (err) {
								console.log(err);
								return;
							}

							callback(null, results);
						});

						break;
					case 'new':
						console.log("~GET NEW~");
						var time = new Date();
						console.log("-- 1 -- %d", time.getTime() - date.getTime());
						//console.log(filteredFeedList);
						/*Entry.aggregate({$match: {feedId: {$in: filteredFeedList} }}, {$group:{"_id":"$feedId", "recentPost":{$max:"$publishDate"}}},{$sort:{'recentPost':-1}}, {$limit:100}, {$project:{"feedId":1, "recentPost":1}}, function (err, results) {
							if (err) {
								console.log(err);
								return;
							}

							callback(null, results);
						});*/

						var query = {},
							options = {};

						//console.log(req.query.categories.split(","));
						//console.log(req.query.categories.split(",")[0]);

						if (req.query.categories) query.categories = {$all: req.query.categories.split(",")};
						if (req.query.city) query.city = req.query.city;
						if (req.query.badges) query.badges = {$all: req.query.badges.split(",")};
						if (req.query.state) query.state = req.query.state;
						if (req.query.country) query.country = req.query.country;

						// By default, sort by rank
						options.sort = { "rank": -1 };

						if (req.isAuthenticated()) {
							if (req.query.filter == 'suggested') {
								console.log('SUGGESTED');
								//if (req.user.categoryPreferences.length > 0)
									//query.rankedCategories = { $elemMatch: { category: { $in: _.pluck(req.user.categoryPreferences, 'category')} } };

								//if (req.user.favoriteFeeds.length > 0)
								//	query._id = { $nin: req.user.favoriteFeeds };

								if (req.user.hiddenFeeds.length > 0)
									query._id = { $nin: req.user.hiddenFeeds };
							} else if (req.query.filter == 'favorites') {
								console.log('FAVORITES');

								// For favorites, sort by date
								options.sort = { "lastPublished": -1 };

								if (req.user.favoriteFeeds.length > 0)
									query._id = { $in: req.user.favoriteFeeds };
								else
									query._id = { $in: [] };
							} else if (req.query.filter == 'hidden') {
								console.log('HIDDEN');
								if (req.user.hiddenFeeds.length > 0)
									query._id = { $in: req.user.hiddenFeeds };
								else
									query._id = { $in: [] };
							} else if (req.query.filter == 'list') {
								console.log('LIST - %s', req.query.subFilter);
								//console.dir(addlFeeds);
								query.$or = [
									{ rankedCategories: { $elemMatch: { category: req.query.subFilter } } },
									{ _id: { $in: addlFeeds } }
								];

							} else {

								if (req.user.categoryPreferences.length > 0)
									query.rankedCategories = { $not: { $elemMatch: { category: { $in: _.pluck(req.user.categoryPreferences, 'category')} } } };

								if (req.user.favoriteFeeds.length > 0)
									query._id = { $nin: req.user.favoriteFeeds };

								console.log('EVERYTHING');
							}
						
							//query.seenUsers = { $ne: req.user.id };
						}

						query.lastPublished = { $exists: true, $ne: null };

						query.hidden = { $ne: true };

						//console.log("QUERY");
						//console.dir(req.query);

						//console.log("OPTIONS");
						//console.dir(options);

						var projection = {
							id: 1,
							rank: 1,
							clicks: 1,
							rankedCategories: 1
						}

						time = new Date();
						console.log("-- 2 -- %d", time.getTime() - date.getTime());

						Feed.find(query, projection, options, function (err, results) {

						//Entry.aggregate({$match: {feedId: {$in: filteredFeedList} }}, {$group:{"_id":"$feedId", "lastPublished":{$max:"$publishDate"}}},{$sort:{'lastPublished':-1}}, {$project:{"feedId":1, "recentPost":1}}, function (err, results) {
							if (err) {
								console.log("Feed search error: " + err);
								return;
							}

							// Map-reduce asterisks using recentPost cutoff
							/*var date = new Date(),
								feedList = [];

							console.dir(results);

							async.eachSeries(results, function (result, callback) {
								Activity.find({type:'asterisk', feedId: result._id, dateAdded: {$gte: result.lastPublished}}, function (err, asterisks) {
									if (err) {
										console.log("ASTERISK FIND ERROR - %s", err);
										return;
									}

									// Calculate rank
									if (result.lastPublished) {
										console.log("LAST PUBLISHED DATE IS GOOD");
										var recentPost = new Date(result.lastPublished);
									} else {
										console.log("NO LAST PUBLISHED DATE");
										var recentPost = new Date();

										recentPost = new Date(recentPost - 31*1000*60*60*24);
									}
									console.dir("*** " + result._id);
									console.log(date);
									console.log(date.getTime());
									console.log(recentPost);
									console.log(recentPost.getTime());
									console.dir(asterisks);
									console.log("DAYS ELAPSED - %d", (date.getTime() - recentPost.getTime())/(1*1000*60*60*24));
									console.log("ASTERISKS - %d", asterisks.length);

									//var daysElapsed = (date.getTime() - recentPost.getTime())/(1*1000*60*60*24) + 1;
									//var daysElapsed = (date.getTime() - recentPost.getTime())/(.5*1000*60*60*24);
									var daysElapsed = (date.getTime() - recentPost.getTime())/(1*1000*60*60*24)+1;

									console.log("RANK - %d", (Math.pow(asterisks.length+20, 1))/(Math.log(Math.pow(daysElapsed, Math.pow(daysElapsed, .9)))/Math.LN10+2));
									console.log("TEST - %d", Math.pow(daysElapsed, 1));
									console.log("TEST - %d", Math.pow(daysElapsed, Math.pow(daysElapsed, 1)));

									//result.rank = (Math.log((asterisks.length+1)/10)/Math.LN10+2)/(Math.log(daysElapsed*daysElapsed)/Math.LN10+2);
									//result.rank = (Math.log((asterisks.length+1))/Math.LN10+2)/(Math.log(daysElapsed*daysElapsed)/Math.LN10+2);
									result.rank = (Math.pow(asterisks.length+50, 1))/(Math.log(Math.pow(daysElapsed, Math.pow(daysElapsed, 1)))/Math.LN10+2);
									//(x^2)/(ln(y^(y^1.1))/ln(10)+2)
									feedList.push(result);

									callback();
								});
							}, function (err) {
								if (err) console.log("ASTERISK AGGREGATE ERROR - %s", err);

								feedList = _.sortBy(feedList, 'rank').reverse();
								
								console.log("AGGGGGGGGREGATE");
								console.dir(feedList);

								callback(null, feedList);
							});*/

							time = new Date();
							console.log("-- 3 -- %d", time.getTime() - date.getTime());

							if (req.user.categoryPreferences !== undefined && req.query.filter == 'suggested') {
								if (req.user.categoryPreferences.length > 0) {
									// Sort feeds by how closely categories relate	
									console.log("WEIGHT SUGGESTED - 1");		
									results = _.map(results, function (elm, i, list) {
										var newElm = {};
											
										newElm._id = elm._id;
										newElm.rank = elm.rank;
										newElm.rankedCategories = elm.rankedCategories;
										newElm.score = 0;

										_.each(elm.rankedCategories, function (elm, i, list) {
											var baseFeedRankedCategoryIndex = _.indexOf(req.user.categoryPreferences, _.findWhere(req.user.categoryPreferences, { category: elm.category}));
											
											// Check if category is a match at all
											if (baseFeedRankedCategoryIndex > -1) {
												// Increase score by a max of the base feed rank for that category
												if(elm.rank >= req.user.categoryPreferences[baseFeedRankedCategoryIndex].rank)
													newElm.score += req.user.categoryPreferences[baseFeedRankedCategoryIndex].rank;
												else {
													newElm.score += elm.rank; 	
												} 
											}
										});

										// Modify rank
										newElm.rank += newElm.score/10;

										return newElm;
									});
								} else {
									// Sort feeds by how closely categories relate	
									console.log("WEIGHT SUGGESTED - 2");		
									results = _.map(results, function (elm, i, list) {
										var newElm = {};
											
										newElm._id = elm._id;
										newElm.rank = elm.rank;
										newElm.clicks = elm.clicks;
										newElm.rankedCategories = elm.rankedCategories;
										newElm.score = 0;

										// Modify rank
										newElm.rank += Math.floor(newElm.clicks/5)*5;

										return newElm;
									});
								}

									results = _.sortBy(results, 'rank').reverse();
							} else if (req.user.categoryPreferences === undefined && req.query.filter == 'suggested') {
								// Sort feeds by how closely categories relate	
								console.log("WEIGHT SUGGESTED - 3");		
								results = _.map(results, function (elm, i, list) {
									var newElm = {};
										
									newElm._id = elm._id;
									newElm.rank = elm.rank;
									newElm.clicks = elm.clicks;
									newElm.rankedCategories = elm.rankedCategories;
									newElm.score = 0;

									// Modify rank
									newElm.rank += newElm.clicks;

									return newElm;
								});

								results = _.sortBy(results, 'rank').reverse();
							}

							callback(null, results);
						});

						break;
					case 'friends':
						console.log("~GET FRIENDS~");
						Activity.aggregate({$match: {feedId: {$in: filteredFeedList}, userId: {$in: req.user.following}, type: {$in: feedActions} }}, {$project:{"feedId":1, recentRead: {$cond: [{$gte: ['$dateAdded', userDateCutoff]}, 1, 0]} }}, {$group:{"_id":"$feedId", "recentReads":{$sum: '$recentRead'} }}, {$sort:{'recentReads':-1}}, {$limit:100}, function (err, results) {
							if (err) {
								console.log(err);
								return;
							}

							callback(null, results);
						});

						break;
					case 'popular':
						console.log("~GET POPULAR~");
						Activity.aggregate({$match: {feedId: {$in: filteredFeedList}, type: {$in: feedActions} }}, {$project:{"feedId":1, recentRead: {$cond: [{$gte: ['$dateAdded', userDateCutoff]}, 1, 0]} }}, {$group:{"_id":"$feedId", "recentReads":{$sum: '$recentRead'} }}, {$sort:{'recentReads':-1}}, {$limit:100}, function (err, results) {
							if (err) {
								console.log(err);
								return;
							}

							callback(null, results);
						});

						break;
				}

			}], function (err, results) {
				if (err) console.log("ERROR getting feeds: %s", err);

				// Should get feedInfo here to add a double check for feed's existence...

				if (results.length) {
					console.log("FOUND FEEDS");
					//console.dir(results);
					//var feeds = _.pluck(_.sortBy(results, "recentPosts").reverse(), "_id");
					//var feeds = _.pluck(results, "_id");

					if (req.params.order == 'alphabetical') {
						_.each(results, function (elm, i, list) {
							var newElm = {};
							newElm.id = elm._id;
							newElm.title = elm.title;
							newElm.badges = elm.badges;
							newElm.avatar = elm.avatar;
							newElm.author = elm.author;
							newElm.url = elm.url;
							newElm.feedUrl = elm.feedUrl;
							newElm.storeUrl = elm.storeUrl;
							newElm.portfolioUrl = elm.portfolioUrl;
							newElm.newsletterSignupUrl = elm.newsletterSignupUrl;
							newElm.twitterUrl = elm.twitterUrl;
							newElm.instagramUrl = elm.instagramUrl;
							newElm.facebookUrl = elm.facebookUrl;
							newElm.pinterestUrl = elm.pinterestUrl;
							newElm.tumblrUrl = elm.tumblrUrl;
							newElm.flickrUrl = elm.flickrUrl;
							newElm.etsyUrl = elm.etsyUrl;
							newElm.city = elm.city;
							newElm.state = elm.state;
							newElm.country = elm.country;
							newElm.description = elm.description;
							newElm.categories = elm.categories;
							newElm.rankedCategories = elm.rankedCategories;
							newElm.lastPublished = elm.lastPublished;

							if (req.currentRole == 'administrator') {
								newElm.hidden = elm.hidden;
							}

							list[i] = newElm;
						});

						console.log("ABC RESULTS");

						res.send(results, 200);
					} else {
						_.each(results, function (elm, i, list) {
							var newElm = {};
							newElm.id = elm._id;
							list[i] = newElm;
						});

						//console.dir(results);

						if (req.query.randomize == 'true') {
							console.log("RANDOMIZE");
							results = _.shuffle(results);
						}

						getFeeds(results.slice(0, 10), req.user, function (feeds) {
							_.each(feeds, function (elm, i) {
								results[i] = elm;
							});

							res.send(results, 200);
						});
					}

				} else {
					console.log("No feeds found :(");
					res.send(null, 200);
				}
			});
		},

		loadFeeds: function (req, res) {
			console.log("--FEEDS--");
			//console.dir(req.body.feedIds);

			var feeds = req.body.feedIds;
			
			getFeeds(feeds, req.user, function (results) {
				res.send(results, 200);
			});
		},

		getCategorizedFeeds: function (req, res) {
			var projection = {
				id: 1,		
				title: 1,
				url: 1,
				feedUrl: 1,
				lastPublished: 1,
				rankedCategories: 1,
				imagePreview: 1,
			}

			async.waterfall([function (callback) {
				Category.find({ public: true, featured: true }, function (err, categories) {
					if (err) callback({ message: "Error searching for categories: " + err, status: 500 });
					else {
						callback(null, categories);
					}
				});
			}, function (categories, callback) {
				Feed.find({ rankedCategories: { $elemMatch: { categoryId: { $in: _.pluck(categories, 'id') } } } }, projection, { sort:{ "rank": -1 }}, function (err, feeds) {
					if (err) callback({ message: "Error searching for categories: " + err, status: 500 });
					else {
						//console.dir(feeds);

						callback(null, categories, feeds);
					}
				});
			}, function (categories, feeds, callback) {
				/*var feedsWithImages = [];
				async.eachSeries(feeds, function (feed, callback) {
					//getFeedImages(feed._id, 10, function (images, status) {

						//if (images) {
							var newElm = {
								id: feed._id,
								title: feed.title,
								//images: images,
								lastPublished: feed.lastPublished,
								rankedCategories: feed.rankedCategories,
								longSmallImagePreview: feed.longSmallImagePreview,
								longSmallImagePreview2: feed.longSmallImagePreview2,
								longSmallImagePreview3: feed.longSmallImagePreview3
							}
							feedsWithImages.push(newElm);
						//}

						callback();
					//});

				}, function (err) {
					if (err) callback(err);
					else callback(null, categories, feedsWithImages);
				});*/
				callback(null, categories, feeds);
			}, function (categories, feeds, callback) {
				var sortedFeeds = [];

				console.log("SORT FEEDS");
				_.each(categories, function (category) {
					var newCategory = {
						label: category.title,
						feeds: []
					}

					_.each(feeds, function (feed) {
						var inCategory = false;
						_.each(feed.rankedCategories, function (elm, i) {
							if (category.id == elm.categoryId) inCategory = true;
						});
						if (inCategory) {
							var newElm = {
								id: feed._id,
								title: feed.title,
								//images: images,
								lastPublished: feed.lastPublished,
								rankedCategories: feed.rankedCategories,
								imagePreview: feed.imagePreview
							}

							var dateCutoff = Date.now() - (24*60*60*1000);

							if (feed.lastPublished >= dateCutoff) feed.newPosts = true;
							else feed.newPosts = false;

							if (newCategory.feeds.length <= 10) newCategory.feeds.push(newElm);
						}
					});

					if (newCategory.feeds.length > 0) sortedFeeds.push(newCategory);
				});

				callback(null, sortedFeeds);
			}], function (err, feeds) {
				if (err) {
					console.log(err);
					res.send(null, err.status);
				} else {
					res.send(feeds, 200);
				}
			});
		},

		getSampleFeeds: function (req, res) {
			var projection = {
				id: 1,		
				title: 1,
				url: 1,
				feedUrl: 1,
				imagePreview: 1,
				longSmallImagePreview: 1,
				longSmallImagePreview2: 1,
				longSmallImagePreview3: 1,
				longLargeImagePreview: 1,
				longLargeImagePreview2: 1,
				clicks: 1,
				city: 1,
				state: 1,
				country: 1,
				lastPublished: 1
			}

			var feeds = [];

			Feed.find({ hidden: { $ne: true }}, projection, {sort:{'clicks':-1}, limit: 25}, function (err, results) {
				if (err) {
					console.log("Feed search error: " + err);
					return;
				}

				_.each(results, function (elm) {
					feeds.push({
						id: elm._id,
						title: elm.title,
						url: elm.url,
						feedUrl: elm.feedUrl,
						imagePreview: elm.imagePreview,
						longSmallImagePreview: elm.longSmallImagePreview,
						longSmallImagePreview2: elm.longSmallImagePreview2,
						longSmallImagePreview3: elm.longSmallImagePreview3,
						longLargeImagePreview: (elm.longLargeImagePreview.length > 0) ? elm.longLargeImagePreview : null,
						longLargeImagePreview2: elm.longLargeImagePreview2,
						clicks: elm.clicks,
						city: elm.city,
						state: elm.state,
						country: elm.country,
						lastPublished: elm.lastPublished
					});
				});

				res.send(_.shuffle(feeds).slice(0, 5), 200);
			});
		},

		searchFeeds: function (req, res) {
			Feed.find({ title: new RegExp('^' + req.params.query, "i") }).select('title').exec(function (err, results) {
				if (err) console.log(err);
				else {
					res.send(200, results);
				}
			})
		},

		///////////////////////////
		// Collection Management //
		///////////////////////////

		getCollections: function (req, res) {
			var query = {},
				options = {};

			if (req.query.limit !== undefined) 
				options.limit = req.query.limit;
			if (req.query.published == 'true') {
				query.published = req.query.published;
				options.sort = { publishDate: -1 };
			}

			console.log("PROJ: %s", query);
			console.dir(query);


			Collection.find(query, {}, options, function (err, results) {
				if (err) {
					console.log("Collection search error: " + err);
					res.send(null, 500);
					return;
				}

				var collections = [];

				async.eachSeries(results, function (result, callback) {
					var collection = {};
					collection.id = result._id;
					collection.title = result.title;
					collection.cover = result.cover;
					collection.authorId = result.authorId;
					collection.description = result.description;
					collection.imagePreview = result.imagePreview;
					collection.imagePreview2 = result.imagePreview2;
					collection.imagePreview3 = result.imagePreview3;
					collection.imagePreview4 = result.imagePreview4;
					collection.published = result.published;
					collection.publishDate = result.publishDate;
					collection.feeds = result.feeds;

					getUser(result.authorId, function (user) { 
						if (user) {
							collection.author = user.username;
							collection.authorAvatar = user.avatar;
							collection.authorFirstName = user.firstName;
							collection.authorLastName = user.lastName;
							collection.authorBio = user.bio;
						}
							
						collections.push(collection);
						callback();
						
					});

				}, function (err) {
					res.send(collections, 200);
				});
			});
		},

		getCollection: function (req, res) {
			Collection.findOne({_id: mongoose.Types.ObjectId(req.params.id)}, {}, {}, function (err, result) {
				if (err) {
					console.log("Collection search error: " + err);
					res.send(null, 500);
					return;
				}

				if (result) {
					var collection = {};
					collection.id = result._id;
					collection.title = result.title;
					collection.cover = result.cover;
					collection.authorId = result.authorId;
					collection.description = result.description;
					collection.feeds = result.feeds;
					collection.publishDate = result.publishDate;
					collection.dateAdded = result.dateAdded;



					async.series([function (callback) {
						getUser(result.authorId, function (user) { 
							if (user) {
								collection.author = user.username;
								collection.authorFirstName = user.firstName;
								collection.authorLastName = user.lastName;
								collection.authorBio = user.bio;
								collection.authorAvatar = user.avatar;
							}
								
							callback();
						});
					}, function (callback) {
						var collectionFeeds = [];
						if (collection.feeds) {
							async.eachSeries(collection.feeds, function (result, callback) {
								var collectionFeed = {};
								collectionFeed.feedId = result.feedId;
								collectionFeed.comment = result.comment;

								getFeed(result.feedId, function (feed) { 
									if (feed) {
										collectionFeed.id = feed._id;
										collectionFeed.title = feed.title;
										collectionFeed.url = feed.url;
										collectionFeed.city = feed.city;
										collectionFeed.state = feed.state;
										collectionFeed.country = feed.country;
										collectionFeed.state = feed.state;
										collectionFeed.asterisks = feed.asterisks;

										if (feed.longLargeImagePreview.length > 0) {
											collectionFeed.longLargeImagePreview = feed.longLargeImagePreview;
											collectionFeed.longLargeImagePreview2 = feed.longLargeImagePreview2;
										} else {
											collectionFeed.longSmallImagePreview = feed.longSmallImagePreview;
											collectionFeed.longSmallImagePreview2 = feed.longSmallImagePreview2;
											collectionFeed.longSmallImagePreview3 = feed.longSmallImagePreview3;
										}
									}
									
									collectionFeeds.push(collectionFeed);
									callback();
								});
							}, function (err) {
								collection.feeds = collectionFeeds;
								callback();
							})
						} else {
							callback();
						}
					}, function (callback) {
						// Get previous collection
						console.dir(collection.dateAdded);
						Collection.find({ dateAdded: {$gte: collection.dateAdded}, _id: {$ne: collection.id} }, {}, {sort: {'dateAdded':1}, limit: 1}, function (err, previous) {
							if (err) {
								console.log("Collection search error: " + err);
								res.send(null, 500);
								return;
							}

							console.log("PREVIOUS");
							_.each(previous, function (elm) {
								console.log(elm.title)
							});

							if (previous.length > 0) {
								var previousCollection = {};
								previousCollection.id = previous[0]._id;
								previousCollection.title = previous[0].title;
								previousCollection.cover = previous[0].cover;
								previousCollection.authorId = previous[0].authorId;
								previousCollection.description = previous[0].description;
								previousCollection.imagePreview = previous[0].imagePreview;
								previousCollection.imagePreview2 = previous[0].imagePreview2;
								previousCollection.imagePreview3 = previous[0].imagePreview3;
								previousCollection.dateAdded = previous[0].dateAdded;

								collection.previousCollection = previousCollection;
							} else {
								collection.previousCollection = null;
							}

							callback();
						});
					}, function (callback) {
						// Get next collection
						Collection.find({ dateAdded: {$lt: collection.dateAdded}, _id: {$ne: collection.id} }, {}, {sort: {'dateAdded':-1}, limit: 1}, function (err, next) {
							if (err) {
								console.log("Collection search error: " + err);
								res.send(null, 500);
								return;
							}

							console.log("NEXT");
							_.each(next, function (elm) {
								console.log(elm.title)
							});

							if (next.length > 0) {
								var nextCollection = {};
								nextCollection.id = next[0]._id;
								nextCollection.title = next[0].title;
								nextCollection.cover = next[0].cover;
								nextCollection.authorId = next[0].authorId;
								nextCollection.description = next[0].description;
								nextCollection.imagePreview = next[0].imagePreview;
								nextCollection.imagePreview2 = next[0].imagePreview2;
								nextCollection.imagePreview3 = next[0].imagePreview3;
								nextCollection.dateAdded = next[0].dateAdded;

								collection.nextCollection = nextCollection;
							} else {
								collection.nextCollection = null;
							}

							callback();
						});
					}], function (err) {
						res.send(collection, 200);
					});
				} else {
					res.send(null, 404);
				}
			});
		},

		addCollection: function (req, res) {
			async.series([function(callback) {
				getUserByUsername(req.body.collection.author, function (user) {
					if (user) {
						req.body.collection.authorId = user._id;
						callback();
					} else {
						res.send('Invalid Author', 400);
					}
				});
			}], function (err) {
				var collection = new Collection();

				collection.title = req.body.collection.title;
				collection.cover = req.body.collection.cover;
				collection.authorId = req.body.collection.authorId;
				collection.description = req.body.collection.description;
				collection.feeds = req.body.collection.feeds;

				collection.save(function (err, newCollection) { 
					if (err) {
						console.log("Error adding collection - %s", err);
					}

					if (newCollection) {
						req.body.collection.id = newCollection._id;
						res.send(req.body.collection, 200);
					} else {
						res.send('Collection not saved', 500);
					}
				});
						
					
			});
		},

		editCollection: function (req, res) {
			console.log('EDITING COLLECTION: %s', req.body.collection);
			console.dir(req.params.id);
			console.dir(req.body.collection);

			async.series([function(callback) {
				getUserByUsername(req.body.collection.author, function (user) {
					if (user) {
						req.body.collection.authorId = user._id;
						callback();
					} else {
						res.send('Invalid Author', 400);
					}
				});
			}], function (err) {
				Collection.findOneAndUpdate({ _id: req.params.id }, { 	title: req.body.collection.title || null, 
																		authorId: req.body.collection.authorId || null,
																		description: req.body.collection.description || null,
																		feeds: req.body.collection.feeds || null
																		}, function(err, result) {
					if (err) {
						console.log('Collection search error: ' + err);
						return res.send(null, 500);
					}
					
					if (result) {
						console.log("EDITING SUCCESS: %s", result);

						var collection = {};
						collection.id = result._id;
						collection.title = result.title;
						collection.cover = result.cover;
						collection.authorId = result.authorId;
						collection.description = result.description;
						collection.feeds = result.feeds;

						getUser(collection.authorId, function (user) { 
							if (user) {
								collection.author = user.username;
								res.send(collection, 200);
							} else {
								res.send('Author not found', 404);
							}
						});
						
					} else {
						res.send(null, 404);
					}
				});
			});
		},

		publishCollection: function (req, res) {
			console.log('PUBLISHING COLLECTION: %s', req.params.id);

			
			Collection.findOneAndUpdate({ _id: req.params.id, published: {$ne:true}, publishDate: null }, { published: true,
																											publishDate: Date.now() }, function(err, collection) {
				if (err) {
					console.log('Collection search error: ' + err);
					return res.send(null, 500);
				}
				
				if (collection) {
					console.log("PUBlISHING SUCCESS: %s", collection.publishDate);
					res.send(collection.publishDate, 200);
					
				} else {
					console.log("PUBlISHING FAILURE: %s", collection);
					res.send(null, 404);
				}
			});
		},

		addCollectionCover: function (req, res) {
			//console.dir(req);

			fs.readFile(req.files.image.path, function (err, data) {
			  	if (err) {
			  		console.log("Error loading avatar - %s", err)
			  		callback(null);
			  	}

			  	cropTo3x2Image(data, function (data, filesize) {

				  	resizeImage(data, 1280, null, 5, function (data, filesize, dimensions) {
				  		console.log("RESIZED?");
				  		console.dir(data);
				  		console.dir(filesize);

						uploadAvatar(req.params.id, req.files, 'collections', data, filesize, function (err, url) {
							if (err) res.send(err.message, err.status);
							else {
								var cover = {	url: url,
												width: dimensions.width,
												height: dimensions.height
											};

								Collection.findOneAndUpdate({ _id: req.params.id }, { cover: cover }, function(err, collection) {
									if (err) {
										console.log('Collection search error: ' + err);
										return res.send('Error saving cover', 500);
									}
									
									if (collection) {
										console.log("COLLECTION AVATAR SUCCESS: %s", collection.title);
										res.send(url, 200);
									} else {
										res.send('Error saving cover', 500);
									}
								});
							}	
						});
					});
				});
			});
		},


		/////////////////////////
		// Category Management //
		/////////////////////////

		getCategories: function (req, res) {
			console.log("--------------");
			console.log("get categories");
			console.log("--------------");

			async.waterfall([function (callback) {

				var projection = { 
						title: 1,
						featured: 1,
					},
					query = { public: true, featured: true };

				if (req.currentRole == 'administrator') {
					projection = {};
					query = {};
				}

				if (req.body.userList) {
					query._id = { $in: _.pluck(req.user.savedFeeds, 'categoryId') };
				}

				Category.find(query, projection, {sort: {title:1} }, function (err, results) {
					if (err) {
						callback({ message: "Error searching for categories: " + err, status: 500 });
					} else {
						console.log("CATEGORIES FOUND");

						var categories = [];

						_.each(results, function (elm) {
							var newElm = {};
							newElm.id = elm.id;
							newElm.title = elm.title;
							newElm.featured = elm.featured;

							if (req.currentRole == 'administrator') {
								newElm.public = elm.public;
							}

							categories.push(newElm);
						});

						callback(null, categories);
					}
				});
			}, function (categories, callback) {
				async.eachSeries(categories, function (category, callback) {
					Feed.count({rankedCategories:{ $elemMatch: { categoryId: category.id } }}, function (err, count) {
						if (err) callback({ message: "Error getting category feed count: " + err, status: 500 });
						else {
							category.feedCount = count;
							callback();
						}
					});
				}, function (err) {
					if (err) callback(err);
					else {
						callback(null, categories);
					}
				});
			}], function (err, categories) {
				if (err) {
					console.dir(err);
					res.send(null, err.status);
				} else {
					res.send(categories, 200);
				}
			});
		},

		addCategory: function (req, res) {
			console.log("--------------");
			console.log("add categories: %s",  req.body.title);
			console.log("--------------");

			var valid = true;


			if (!validator.matches(req.body.title.trim(), /^[a-zA-Z0-9& ]*$/)) {
				console.log('INVALID CATEGORY');
				valid = false;
			}

			if (valid) {
				Category.find({title: req.body.title.trim()}, {}, function (err, category) {
					if (err) {
						console.log('Category search error: ' + err);
						return res.send(null, 500);
					}

					if (category[0]) {
						console.log("CATEGORY ALREADY EXISTS");
						res.send(null, 409);
					} else {
						var category = new Category();
						category.title = req.body.title;
						category.createdBy = req.user.id;
						
						if (req.currentRole === undefined) {
							category.featured = true;
							category.public = true;
						} else {
							if (req.currentRole == 'administrator') {
								category.featured = req.body.featured || false;
								category.public = req.body.public || false;
							}
						}

						category.save(function (err) {
							if (err) {
								console.log("-------------------");
								console.log("Category save error! / " + err);
								console.log("-------------------");
								return res.send(null, 500);
							} else {
								console.log("---------------------------");
								console.log("Category saved succesfully!");
								console.log("---------------------------");

								res.send(category, 200);
							}
						})
					}
				});
			} else {
				res.send(null, 406);
			}
		},
		editCategory: function (req, res) {
			console.log("--------------");
			console.log("edit categories: %s",  req.body.title);
			console.log("edit categories: %s",  req.body.id);
			console.log("--------------");

			var valid = true,
				update = {},
				category;


			if (!validator.matches(req.body.title.trim(), /^[a-zA-Z0-9& ]*$/)) {
				console.log('INVALID CATEGORY');
				valid = false;
			} else {
				update.title = req.body.title.trim();
				update.public = req.body.public;
				update.featured = req.body.featured;
			}

			if (valid) {
				async.series([function (callback) {
					// Update category document
					Category.findOneAndUpdate({_id: req.body.id}, {$set: update }, function (err, result) {
						if (err) {
							callback({ message: 'Category search error: ' + err, status: 500});
						} else {
							console.log("SUCCESS EDITING CATEGORY");
							category = result;
							callback();
						}
					});
				}, function (callback) {
					// Update feeds' ranked category titles
					Feed.update({ "rankedCategories.categoryId": category._id }, {$set: { "rankedCategories.$.category": category.title }}, {multi: true}, function (err, count, feeds) {
						if (err) {
							callback({ message: 'Error updating ranked category names: ' + err, status: 500});
						} else {
							console.log("SUCCESS UPDATING FEED CATEGORY NAMES - %s", count);
							callback();
						}

					});

				}, function (callback) {
					// Update users' category preference titles
					console.log("USER CATEGORY TO UPDATE - %s", category._id);
					Cat.update({ "categoryPreferences.categoryId": category._id }, {$set: { "categoryPreferences.$.category": category.title }}, {multi: true}, function (err, count, users) {
						if (err) {
							callback({ message: 'Error updating category preference names: ' + err, status: 500});
						} else {
							console.log("SUCCESS UPDATING USER CATEGORY NAMES - %s", count);
							callback();
						}

					});
				}], function (err, callback) {
					if (err) {
						console.log("Error editing category: %s", err.message);
						res.send(null, err.status);
					} else {
						console.log("SUCCESS EDITING/UPDATING CATEGORY");
						res.send(category, 200);
					}

					category = null;
				});
			} else {
				res.send(null, 406);
			}
		},
		getCategoryFeedList: function (req, res) {
			console.log('CATEGORY FEED LIST');

			Feed.find({rankedCategories: { $elemMatch: { category: req.params.category } }}, {rankedCategories: 1, title: 1}, function (err, feeds) {
				if (err) {
					console.log('Feed in category search error: ' + err);
					return res.send(null, 500);
				}

				if (feeds.length > 0) {
					console.log("Feeds in category found %s", req.params.category);

					var feedList = [];
					_.each(feeds, function (elm) {
						var newElm = {};
						newElm.id = elm._id;
						newElm.title = elm.title;
						newElm.rankedCategories = elm.rankedCategories;

						feedList.push(newElm);
					});

					res.send(feedList, 200);
				} else {
					console.log("No feeds in category found: %s", req.params.category);
					res.send(null, 404);
				}
			})
		},

		/////////////////////
		// Feed Management //
		/////////////////////
		
		addFeed: function (req, res) {
			console.log("--------");
			console.log("add feed");
			console.log("--------");

			console.dir(req.body);
					
			Feed.findOne({ url: req.body.url}, function(err, feed) {
				if (err) {
					console.log('Error: ' + err);
					return res.send('null');
				}

				if (feed) {
					console.log('Feed already in the system: ' + req.body.url);
					return res.send('null');
				} else {
					console.log("NO FEEDS FOUND");
					
					var feed = new Feed();
					
					feed.title = req.body.title;
					feed.author = req.body.author || null;
					feed.url = req.body.url;
					feed.feedUrl = req.body.feedUrl;
					feed.description = req.body.description || null;
					feed.categories = req.body.categories || [];
					feed.storeUrl = req.body.storeUrl || null;
					feed.portfolioUrl = req.body.portfolioUrl || null;
					feed.newsletterSignupUrl = req.body.newsletterSignupUrl || null;
					feed.twitterUrl = req.body.twitterUrl || null;
					feed.instagramUrl = req.body.instagramUrl || null;
					feed.facebookUrl = req.body.facebookUrl || null;
					feed.pinterestUrl = req.body.pinterestUrl || null;
					feed.tumblrUrl = req.body.tumblrUrl || null;
					feed.flickrUrl = req.body.flickrUrl || null;
					feed.etsyUrl = req.body.etsyUrl || null;
					feed.city = req.body.city || null;
					feed.state = req.body.state || null;
					feed.country = req.body.country || null;

					console.dir(feed);
										
					feed.save(function (err) {		
						if (err) {
							console.log("-------------------");
							console.log("Feed save error! / " + err);
							console.log("-------------------");
							return res.send('null', 500);
						}

						/* feed.load(req.body.amount, function (results) {				
							feed.buildEntries(results, function (entries) {
								_.each(entries, function (num) {
									console.log('>>', num);
								});
							});
						}); */
						
						console.log("----------");
						console.log("Feed added!");
						console.dir(feed);
						console.log("----------");

						var feedInfo = {};
						feedInfo.id = feed._id;
						feedInfo.title = feed.title;
						feedInfo.author = feed.author;
						feedInfo.url = feed.url;
						feedInfo.feedUrl = feed.feedUrl;
						feedInfo.description = feed.description;
						feedInfo.categories = feed.categories;
						feedInfo.storeUrl = feed.storeUrl;
						feedInfo.portfolioUrl = feed.portfolioUrl;
						feedInfo.newsletterSignupUrl = feed.newsletterSignupUrl;
						feedInfo.twitterUrl = feed.twitterUrl;
						feedInfo.instagramUrl = feed.instagramUrl;
						feedInfo.facebookUrl = feed.facebookUrl;
						feedInfo.pinterestUrl = feed.pinterestUrl;
						feedInfo.tumblrUrl = feed.tumblrUrl;
						feedInfo.flickrUrl = feed.flickrUrl;
						feedInfo.etsyUrl = feed.etsyUrl;
						feedInfo.city = feed.city;
						feedInfo.state = feed.state;
						feedInfo.country = feed.country;

						async.series([function (callback) {
							getLastPublishedDate(feed.id, function (result) {
	 							console.log("DATE CHECK: %s", result);
	 							feedInfo.lastPublished = result;
	 							console.dir(feed);
	 							callback();
	 						});
						}, function (callback) {
							getCount(feed.id, function (result) {
								console.log("COUNT CHECK: %d", result);
	 							feedInfo.entryCount = result;
	 							callback();
	 						});
						}], function (err) {
							if (err)
								console.log(err);

							// Send success code					
							res.send(feedInfo, 201);
						});
					});
				}
			});
		},
		
		loadFeed: function (req, res) {
			console.log("+++++++++");
			console.log("load feed");
			console.log("+++++++++");
			
			getFeed(req.params.id, function (result) { 
				var feed = {};

				if (result) {
					feed.id = result._id;
					feed.title = result.title;
					feed.author = result.author;
					feed.url = result.url;
					feed.city = result.city;
					feed.state = result.state;
					feed.country = result.country;
					feed.state = result.state;
					feed.rank = result.rank;
					feed.clicks = result.clicks;
					feed.storeUrl = result.storeUrl;
					feed.portfolioUrl = result.portfolioUrl;
					feed.twitterUrl = result.twitterUrl;
					feed.newsletterSignupUrl = result.newsletterSignupUrl;
					if (feed.twitterUrl) feed.twitterUsername = feed.twitterUrl.split("/").pop().replace(/\/?#/g, '');
					feed.instagramUrl = result.instagramUrl;
					if (feed.instagramUrl) feed.instagramUsername = feed.instagramUrl.split("/").pop().replace(/\/?#/g, '');
					feed.facebookUrl = result.facebookUrl;
					feed.pinterestUrl = result.pinterestUrl;
					feed.tumblrUrl = result.tumblrUrl;
					feed.flickrUrl = result.flickrUrl;
					feed.etsyUrl = result.etsyUrl;

					//feed.asterisks = result.asterisks;
					//feed.asteriskCount = result.asteriskCount;
					//feed.badges = result.badges;
					//feed.topHalfPercentile = result.topHalfPercentile;

					if (result.longLargeImagePreview.length > 0) {
						feed.longLargeImagePreview = result.longLargeImagePreview;
						if (result.longLargeImagePreview2.length > 0) feed.longLargeImagePreview2 = result.longLargeImagePreview2;
					}
						
					feed.longSmallImagePreview = result.longSmallImagePreview;
					if (result.longSmallImagePreview2.length > 0) feed.longSmallImagePreview2 = result.longSmallImagePreview2;
					if (result.longSmallImagePreview3.length > 0) feed.longSmallImagePreview3 = result.longSmallImagePreview3;
				}

				//console.dir(feed);

				res.send(feed, 200);
			});
		},

		loadFeedContent: function (req, res) {
			console.log("+++++++++++++++++");
			console.log("load feed content");
			console.log("+++++++++++++++++");
			
			getFeedEntries(req.params.id, req.body.limit, req.body.lastUrl, function (entries) {
				if (!entries) {
					res.send(null, 200);
				} else {
					console.log("feed content found & sent");
					res.send(entries, 200);
				}
			});
		},

		loadFeedImages: function (req, res) {
			console.log("++++++++++++++++");
			console.log("load feed images");
			console.log("++++++++++++++++");

			getFeedImages(req.params.id, 100, function (images, status) {
				res.send(images, status);
			});
			
		},

		getNextFeed: function (req, res) {
			console.log("+++++++++++++");
			console.log("get next feed");
			console.log("+++++++++++++");
			
			async.waterfall([function (callback) {
				Category.find({ public: true, featured: true }, function (err, categories) {
					if (err) callback({ message: "Error searching for categories: " + err, status: 500 });
					else {
						console.log("CATEGORIES FOUND");
						console.dir(categories);
						callback(null, _.pluck(categories, 'id'));
					}
				});
			}, function (categories, callback) {
				Feed.find({_id: req.params.id }, { rankedCategories: { $elemMatch: { categoryId: { $in: categories } } } }, function (err, feed) {
					if (err) {
						callback({ message: "Error searching for feed: " + err, status: 500 });
					} else {
						console.log("FOUND FEED");
						if (feed[0].rankedCategories.length > 0) {
							callback(null, feed[0]._id, feed[0].rankedCategories[0].categoryId);
						} else {
							callback(null, null, null);
						}
					}
				});
			}, function (feedId, categoryId, callback) {
				if (feedId) {
					Feed.find({ rankedCategories: { $elemMatch: { categoryId: categoryId } } }, { title: 1, url: 1 }, function (err, feeds) {
						if (err) {
							callback({ message: "Error searching for feeds: " + err, status: 500 });
						} else {
							console.log("FOUND NEXT FEED");
							console.dir(feeds);
							console.dir(feedId);

							var otherFeeds = {};
							_.each(feeds, function (elm, i) {
								if (elm._id.toString() == feedId.toString()) {
									console.log("FOUND NEXT FEED!!!");
									if (i == feeds.length-1) otherFeeds.nextFeed = feeds[0];
									else otherFeeds.nextFeed = feeds[i+1];

									if (i == 0) otherFeeds.previousFeed = feeds[feeds.length-1];
									else otherFeeds.previousFeed = feeds[i-1];
								}
							});

							if (otherFeeds.nextFeed) {
								otherFeeds.nextFeed = {
									id: otherFeeds.nextFeed._id,
									title: otherFeeds.nextFeed.title,
									url: otherFeeds.nextFeed.url
								};
							}

							if (otherFeeds.previousFeed) {
								otherFeeds.previousFeed = {
									id: otherFeeds.previousFeed._id,
									title: otherFeeds.previousFeed.title,
									url: otherFeeds.previousFeed.url
								};
							}

							console.dir(otherFeeds);

							callback(null, otherFeeds);
						}
					});
				} else {
					callback(null, null);
				}
			}], function (err, nextFeed) {
				if (err) {
					console.log(err);
					res.send(null, err.status);
				} else {
					res.send(nextFeed, 200);
				}
			});
		},

		findSimilar: function (req, res) {
			console.log("+++++++++++++++++");
			console.log("find similar feeds");
			console.log("+++++++++++++++++");
			
			findSimilarFeeds(req.params.id, req.user, function (err, feeds) {
				if (err) {
					console.log(err.message);
					res.send(null, err.status);
				} else {
					res.send(feeds, 200);
				}
			});
		},

		clickImageLink: function (req, res) {
			console.log("+++++++++++++++++");
			console.log("click image link");
			console.dir(req.body);
			console.log("+++++++++++++++++");
			
			var activity = new Activity(),
				options = req.body;

			console.dir(options);
			
			if (req.user !== undefined) {
				options.userId = req.user.id;
			} else if (req.cookies.smorgasbord !== undefined) {
				options.cookieId = req.cookies.smorgasbord;
			}

			activity.clickImageLink(options, function (response) {
				console.log("CLICK IMAGE LINK RESPONSE: %s", response);
				
				if (response) {
					console.log(req.body.feedId);
					Feed.findOne({_id: req.body.feedId}, {id:1}, function(err, feed) {
						if (feed) {
							console.log("UPDATE CLICKS");
							console.log(feed);
							feed.updateClicks(function() {
								res.send(null, 200);
							});
						}
					});
				} else {
					res.send(null, 500);
				}
			});
		},

		clickTitleLink: function (req, res) {
			console.log("+++++++++++++++++");
			console.log("click title link");
			console.dir(req.body);
			console.log("+++++++++++++++++");
			
			var activity = new Activity(),
				options = req.body;

			console.dir(options);
			
			//options.userId = req.user.id;

			if (req.user !== undefined) {
				options.userId = req.user.id;
			} else if (req.cookies.smorgasbord !== undefined) {
				options.cookieId = req.cookies.smorgasbord;
			}

			activity.clickTitleLink(options, function (response) {
				console.log("CLICK TITLE LINK RESPONSE: %s", response);
				
				if (response) {
					Feed.find({_id: req.body.feedId}, {id:1}, function(err, feed) {
						if (feed) {
							console.log("UPDATE CLICKS");
							console.log(feed);
							feed[0].updateClicks(function() {
								res.send(null, 200);
							});
						}
					});
				} else {
					res.send(null, 500);
				}
			});
		},

		favoriteFeed: function (req, res) {
			console.log("+++++++++++++++++");
			console.log("favorite feed");
			console.dir(req.params);
			console.log("+++++++++++++++++");
			
			Cat.findOneAndUpdate({_id: req.user.id}, { $addToSet: { favoriteFeeds: req.params.id } }, function (err, user) {
				if (err) {
					console.log("Error favoriting feed - %s", err);
					res.send(null, 500);
				} else {
					console.log("Favorited feed");

					// Update user category preferences
					user.updateCategoryPreferences(function (response) {
						if (response) console.log("USER PREF SUCCESS");
						else console.log("USER PREF FAILURE");
					});

					res.send(null, 200);
				}
			})
		},

		unfavoriteFeed: function (req, res) {
			console.log("+++++++++++++++++");
			console.log("UNfavorite feed");
			console.dir(req.params);
			console.log("+++++++++++++++++");
			
			Cat.findOneAndUpdate({_id: req.user.id}, { $pull: { favoriteFeeds: req.params.id } }, function (err, user) {
				if (err) {
					console.log("Error unfavoriting feed - %s", err);
					res.send(null, 500);
				} else {
					console.log("Unavorited feed");

					// Update user category preferences
					user.updateCategoryPreferences(function (response) {
						if (response) console.log("USER PREF SUCCESS");
						else console.log("USER PREF FAILURE");
					});

					res.send(null, 200);
				}
			})
		},

		hideFeed: function (req, res) {
			console.log("+++++++++++++++++");
			console.log("hide feed");
			console.dir(req.params);
			console.log("+++++++++++++++++");
			
			Cat.findOneAndUpdate({_id: req.user.id}, { $addToSet: { hiddenFeeds: req.params.id } }, function (err) {
				if (err) {
					console.log("Error hiding feed - %s", err);
					res.send(null, 500);
				} else {
					console.log("Hid feed");
					res.send(null, 200);
				}
			})
		},

		unhideFeed: function (req, res) {
			console.log("+++++++++++++++++");
			console.log("unhide feed");
			console.dir(req.params);
			console.log("+++++++++++++++++");
			
			Cat.findOneAndUpdate({_id: req.user.id}, { $pull: { hiddenFeeds: req.params.id } }, function (err) {
				if (err) {
					console.log("Error unhiding feed - %s", err);
					res.send(null, 500);
				} else {
					console.log("Unhid feed");
					res.send(null, 200);
				}
			})
		},

		markFeedAsSeen: function (req, res) {
			console.log("+++++++++++++++++");
			console.log("mark feed as seen");
			console.dir(req.params);
			console.log("+++++++++++++++++");
			
			Feed.findOneAndUpdate({_id: req.params.id}, { $addToSet: { seenUsers: req.user.id } }, function (err) {
				if (err) {
					console.log("Error marking feed as seen - %s", err);
					res.send(null, 500);
				} else {
					console.log("Marked feed as seen");
					res.send(null, 200);
				}
			})
		},

		addFeedToList: function (req, res) {
			console.log("+++++++++++");
			console.log("add to list");
			console.dir(req.body);
			console.log("++++++++++++");

			var category,
				valid = true;


			if (!validator.matches(req.body.title.trim(), /^[a-zA-Z0-9]*$/)) {
				console.log('INVALID CATEGORY');
				valid = false;
			}

			if (valid) {
			
				async.series([function (callback) {
					// Add category
					var titleCheck = new RegExp("^" + req.body.title + "$", "i");
					console.dir(titleCheck);
					Category.findOne({ title: titleCheck }, {}, function (err, result) {
						if (err) callback({ message: "Error searching for category: " + err, status: 500});
						else if (result) {
							// Category already exists
							console.log("CATEGORY EXISTS");
							category = result;

							// Check if user has added feed to this list already
							Cat.count({_id: req.user.id, savedFeeds:{ $elemMatch: { categoryId: category._id, feedId: req.body.feedId } } }, function (err, count) {
								if (err) callback({ message: "Error searching user's saved feeds: " + err, status: 500});
								else if (count > 0) {
									console.log("ALREADY ADDED THIS FEED TO THIS LIST");
									callback({ message: "Duplicate feed in list", status: 409 });
								} else {
									console.log('NOT IN USER LIST YET');
									callback();
								}
							});
							
						} else {
							// New category
							category = new Category();

							category.title = req.body.title;
							category.public = true;
							category.featured = false;
							category.createdBy = req.user.id;

							category.save(function (err, result) {
								if (err) callback({ message: "Error saving category: " + err, status: 500});
								else {
									console.log("CATEGORY ADDED");
									category = result;
									callback();
								}
							})
						}
					});

				}, function (callback) {
					// Add to users saved list
					Cat.update({_id: req.user.id}, { $addToSet: {savedFeeds: { feedId: req.body.feedId, categoryId: category._id }}}, { multi: false }, function (err, count) {
						if (err) callback({ message: "Error adding to user's saved feeds: " + err, status: 500});
						else {
							console.log("ADDED TO LIST");
							callback();
						}
					});

				}, function (callback) {
					// Add category to feed
					callback();
				}], function (err) {
					if (err) {
						console.log(err);
						res.send(null, err.status);
					} else {
						res.send(null, 200);
					}
				});
			} else {
				res.send(null, 406);
			}
		},

		getRecentInstagram: function (req, res) {
			var url;

			async.waterfall([function (callback) {
				url = 'https://api.instagram.com/v1/users/search?q=' + req.params.instagramUsername + '&client_id=714f3f920f1d44f687d4c3cf8836202c';

				request(url, function (err, res, body) {
					if (err) {
						callback({ message: 'Instagram user request error: ' + err, status: 400 })
					} else if (!err && res.statusCode == 200) {
						//console.dir(body);
						//console.dir(res)
						callback(null, JSON.parse(body).data[0].id);
					} else {
						//console.log(res);
						callback({ message: 'Instagram user request not successful: ' + err, status: 400 });
					}
				});
			}, function (id, callback) {
				url = 'https://api.instagram.com/v1/users/' + id + '/media/recent?client_id=714f3f920f1d44f687d4c3cf8836202c';

				request(url, function (err, res, body) {
					if (err) {
						callback({ message: 'Instagram recent media request error: ' + err, status: 400 })
					} else if (!err && res.statusCode == 200) {
						console.log(JSON.parse(body)); // Print the google web page.
						callback(null, JSON.parse(body).data);
					} else {
						callback({ message: 'Instagram recent media request not successful: ' + err, status: 400 });
					}
				});
			}], function (err, images) {
				if (err) {
					console.log(err);
					res.send(null, err.status);
				} else {
					res.send(images, 200);
				}
			});
		},

		getRecentTweet: function (req, res) {
			console.log("TWEET");

			async.waterfall([function (callback) {
				twitter.getAccessToken(function (data) {
					if (!data) {
						callback({ messsage: 'Failed to retrieve twitter access token', status: 400 }, null);
					} else {
						console.dir(data);
						callback(null, data.access_token);
					}
				});
			}, function (token, callback) {
				var twitterData = '',
				options = {
					url: 'https://api.twitter.com/1.1/statuses/user_timeline.json?count=1&screen_name=' + req.params.twitterUsername,
					method: 'GET',
					headers: {
						'Host': 'api.twitter.com',
						'User-Agent': 'SMRGSBRD',
						'Authorization': 'Bearer ' + token,
						'Accept-Encoding': 'gzip'
					},
					strictSSL: true
				};

				var callbackCalled = false;
				request(options)
					.pipe(zlib.createGunzip())
			  		.on('error', function (err) {
			  			console.log(err);

			  			if (!callbackCalled) {
			  				callback({ message: "Error searching Twitter: " + err, status: 500 }, null);
			  				callbackCalled = true;
			  			}
			  		}).on('data', function (data) {
			  			twitterData += data.toString('UTF-8');
			  		}).on('end', function () {
			  			if (!callbackCalled) {
			  				console.dir(JSON.parse(twitterData)[0]);
			  				callback(null, JSON.parse(twitterData));
			  				callbackCalled = true;
			  			}
			  	});
			}], function (err, twitterData) {
				if (err) {
					console.log(err);
					res.send(null, err.status);
				} else {
					res.send(twitterData[0], 200);
				}
			});
		},

		/////////////////
		// Email Links //
		/////////////////

		addFavorite: function (req, res) {
			Cat.findOneAndUpdate({_id: req.email.recipient}, { $addToSet: { favoriteFeeds: req.params.feedId } }, function (err, user) {
				if (err) res.send("Error adding feed: %s", err);
				else {
					// Update user category preferences
					user.updateCategoryPreferences(function (response) {
						if (response) console.log("USER PREF SUCCESS");
						else console.log("USER PREF FAILURE");
					});

					var multi = redis.multi();
					multi
						.lrem('user:' + req.email.recipient + ':updatedFeeds', 0, req.params.feedId)
						.lrem('user:' + req.email.recipient + ':randomFeeds', 0, req.params.feedId)
						.lpush('user:' + req.email.recipient + ':updatedFeeds', req.params.feedId)
						.exec(function (err, response) {
							console.log(response);
							res.send(200);
					});	
				}
			});
		},

		removeFavorite: function (req, res) {
			Cat.findOneAndUpdate({_id: req.email.recipient}, { $pull: { favoriteFeeds: req.params.feedId } }, function (err, user) {
				if (err) res.send("Error removing feed: %s", err);
				else {
					// Update user category preferences
					user.updateCategoryPreferences(function (response) {
						if (response) console.log("USER PREF SUCCESS");
						else console.log("USER PREF FAILURE");
					});

					var multi = redis.multi();
					multi
						.lrem('user:' + req.email.recipient + ':updatedFeeds', 0, req.params.feedId)
						.exec(function (err, response) {
							console.log(response);
							res.send(200);
					});	
				}
			});
		},

		getEmailByID: function (req, res, next, emailId) {
			Email.findById(emailId).exec(function(err, email) {
				if (err) return next(err);
				if (!email) return next(new Error('Failed to load email ' + emailId));
				req.email = email;
				next(); 
			})
		},

		/////////////////////////
		// Snapshot Management //
		/////////////////////////

		getSnapshots: function (req, res) {
			console.log("-------------");
			console.log("get snapshots");
			console.log("-------------");

			var query = { url: {$ne: null}, large2xThumbnail: {$ne: null}, largeThumbnail: {$ne: null}, smallThumbnail: {$ne: null} },
				options = {};

			if (req.query.limit !== undefined) {
				options.limit = req.query.limit;
			}

			if (req.query.userId !== undefined) {
				query.userId = req.query.userId;
			}
			
			options.sort = {'dateAdded':-1};

			console.log("PROJ: %s", query);
			console.dir(query);

			Snapshot.find(query, {}, options, function (err, results) {
				if (err) {
					console.log('Snapshot search error: ' + err);
					return res.send(null, 500);
				}

				if (results) {
					console.log("SNAPSHOTS FOUND");	
					var snapshots = [];

					_.each(results, function (elm) {
						var newElm = {};

						newElm.id = elm._id;
						newElm.comment = elm.comment;
						newElm.dateAdded = elm.dateAdded;
						newElm.images = elm.images;
						newElm.feedId = elm.feedId;
						newElm.userId = elm.userId;
						newElm.links = elm.links;
						newElm.url = elm.url;
						newElm.large2xThumbnail = elm.large2xThumbnail;
						newElm.largeThumbnail = elm.largeThumbnail;
						newElm.smallThumbnail = elm.smallThumbnail;
						newElm.user = {};
						newElm.feed = {};

						snapshots.push(newElm);
					})

					async.series([function (callback) {
						async.eachSeries(snapshots, function (snapshot, callback) {
							getUser(snapshot.userId, function (user) {
								snapshot.user.firstName = user.firstName;
								snapshot.user.lastName = user.lastName;
								snapshot.user.username = user.username;
								snapshot.user.avatar = user.avatar;

								callback();
							});
						}, function (err) {
							if (err) callback(err);
							callback();
						});
					}, function (callback) {
						async.eachSeries(snapshots, function (snapshot, callback) {
							Activity.find({snapshotId: snapshot.id, type: 'snapshotLike'}, {userId:1}, function (err, likes) {
								snapshot.likes = likes.length;

								snapshot.liked = false;
								snapshot.rank = snapshot.likes*1000*60*60+snapshot.dateAdded.getTime();

								if (req.isAuthenticated()) {
									_.each(likes, function(elm) {
										if (elm.userId.equals(req.user.id)) snapshot.liked = true;
									});
								}

								callback();
							});
						}, function (err) {
							if (err) callback(err);
							callback();
						});
					}, function (callback) {
						async.eachSeries(snapshots, function (snapshot, callback) {
							Feed.findOne({_id: snapshot.feedId}, {title:1, url:1}, function (err, feed) {
								snapshot.feed.title = feed.title;
								snapshot.feed.url = feed.url;

								callback();
							});
						}, function (err) {
							if (err) callback(err);
							callback();
						});
					}], function (err) {
						if (err) {
							console.log(err);
							res.send(null, err.status);
						}

						res.send(snapshots, 200);
					});			
				} else {
					res.send(null, 404);
				}
			});
		},

		takeSnapshot: function (req, res) {
			console.log("+++++++++++++++++");
			console.log("take snapshot");
			console.dir(req.body);
			console.dir(req.user.id);
			console.log("+++++++++++++++++");
			
			createSnapshot(req.body.images, req.body.comment, req.body.feedId, req.user.id, req.body.links, function (err, snapshot) {
				if (err) {
					console.log(err);
					console.log("snapshot unsuccessful :(");
					console.log("+++++++++++++++++");
					res.send(null, err.status);
				} else {
					console.log("snapshot successful!");
					console.log("+++++++++++++++++");

					var newSnapshot = {};

					async.series([function (callback) {
						newSnapshot.id = snapshot._id;
						newSnapshot.comment = snapshot.comment;
						newSnapshot.dateAdded = snapshot.dateAdded;
						newSnapshot.images = snapshot.images;
						newSnapshot.feedId = snapshot.feedId;
						newSnapshot.userId = snapshot.userId;
						newSnapshot.links = snapshot.links;
						newSnapshot.url = snapshot.url;
						newSnapshot.large2xThumbnail = snapshot.large2xThumbnail;
						newSnapshot.largeThumbnail = snapshot.largeThumbnail;
						newSnapshot.smallThumbnail = snapshot.smallThumbnail;
						newSnapshot.user = {};
						newSnapshot.feed = {};

						callback();
					},function (callback) {
						getUser(snapshot.userId, function (user) {
							newSnapshot.user.firstName = user.firstName;
							newSnapshot.user.lastName = user.lastName;
							newSnapshot.user.username = user.username;
							newSnapshot.user.avatar = user.avatar;

							callback();
						});
					}, function (callback) {
						Activity.find({snapshotId: snapshot.id, type: 'snapshotLike'}, {userId:1}, function (err, likes) {
							newSnapshot.likes = likes.length;

							newSnapshot.liked = false;
							newSnapshot.rank = snapshot.likes*1000*60*60+snapshot.dateAdded.getTime();

							if (req.isAuthenticated()) {
								_.each(likes, function(elm) {
									if (elm.userId.equals(req.user.id)) snapshot.liked = true;
								});
							}

							callback();
						});
					}, function (callback) {
						Feed.findOne({_id: snapshot.feedId}, {title:1}, function (err, feed) {
							newSnapshot.feed.title = feed.title;
							callback();
						});
					}, function (callback) {
						//broadcast new snapshot
						/*console.log("BROADCAST SNAPSHOT");
						console.log(require('util').inspect(eventEmitter.listeners('snapshotTaken')));
						eventEmitter.emit('snapshotTaken', newSnapshot);*/
						callback();
					}, function (callback) {
						// Update user category preferences
						Cat.findOne({_id: req.user.id }, {id: 1, favoriteFeeds:1}, function (err, user) {
							if (err) console.log("Error finding user for pref update: %s", err);
							else {
								console.dir(user);
								user.updateCategoryPreferences(function (response) {
									if (response) console.log("USER PREF SUCCESS");
									else console.log("USER PREF FAILURE");
								});
							}
						});

						callback();
					}], function (err) {
						if (err) {
							console.log(err);
							res.send(null, err.status);
						}

						res.send(null, 200);
					});
				}
			});
		},

		likeSnapshot: function (req, res) {
			console.log("+++++++++++++++++");
			console.log("like snapshot");
			console.dir(req.body);
			console.log("+++++++++++++++++");
			
			var activity = new Activity();

			activity.likeSnapshot(req.user.id, req.body.snapshotId, function (response) {
				console.log("LIKE SNAPSHOT RESPONSE: %s", response);
				
				if (response) {
					res.send(null, 200);
				} else {
					res.send(null, 500);
				}
			});
		},

		/*
		 * FEED
		 */

		editFeed: function (req, res) {
			console.log('EDITING FEED: %s', req.body.feed.title);
			console.dir(req.params.id);
			console.dir(req.body.feed);

			Feed.findOneAndUpdate({ _id: req.params.id }, { title: req.body.feed.title, 
															author: req.body.feed.author || null, 
															url: req.body.feed.url, 
															feedUrl: req.body.feed.feedUrl,
															description: req.body.feed.description || null,
															categories: req.body.feed.categories || [],
															storeUrl: req.body.feed.storeUrl || null,
															portfolioUrl: req.body.feed.portfolioUrl || null,
															newsletterSignupUrl: req.body.feed.newsletterSignupUrl || null,
															twitterUrl: req.body.feed.twitterUrl || null,
															instagramUrl: req.body.feed.instagramUrl || null,
															facebookUrl: req.body.feed.facebookUrl || null,
															pinterestUrl: req.body.feed.pinterestUrl || null,
															tumblrUrl: req.body.feed.tumblrUrl || null,
															flickrUrl: req.body.feed.flickrUrl || null,
															etsyUrl: req.body.feed.etsyUrl || null,
															city: req.body.feed.city || null,
															state: req.body.feed.state || null,
															country: req.body.feed.country || null,
															hidden: req.body.feed.hidden || false
															}, function(err, feed) {
				if (err) {
					console.log('Feed search error: ' + err);
					return res.send(null, 500);
				}
				
				if (feed) {
					console.log("EDITING SUCCESS: %s", feed);
					res.send(feed, 200);
					
				} else {
					res.send(null, 404);
				}
			});
		},

		uploadAvatar: function (req, res) {
			console.log('UPLOADING AVATAR: %s', req.params.id);
			console.dir(req.files);

			var imageTypes = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png'];

			// Check file type
			if (imageTypes.indexOf(req.files.image.mime) < 0) {
				console.log("File type not supported: %s", req.files.image.mime);
				res.send(null, 500);
			}

			// Build address for image
			var imageUrl = '/' + req.params.folder + '/avatars/' + req.params.id + '_original.' + req.files.image.mime.split('/')[1];;

			var s3Req = s3.put(imageUrl, {
				'Content-Length' : req.files.image.length,
				'Content-Type' : req.files.image.mime,
				'x-amz-acl': 'public-read'
			});
			
			s3Req.on('error', function (err){
				console.log('S3 SAVE ERROR: ' + err);
			});

			s3Req.on('response', function (s3Res) {  //prepare 'response' callback from S3
				
				console.log(s3Res.statusCode);
				
				if (200 == s3Res.statusCode) {
					console.log('it worked');
					
					if (req.params.folder == 'feed') {
						Feed.findOneAndUpdate({ _id: req.params.id }, { avatar: s3Req.url }, function(err, feed) {
							if (err) {
								console.log('Feed search error: ' + err);
								return res.send(null, 500);
							}
							
							if (feed) {
								console.log("AVATAR SUCCESS: %s", feed);
								res.send(s3Req.url, 200);
							} else {
								res.send(null, 404);
							}
						});
					} else if ((req.params.folder == 'user')) {
					Cat.findOneAndUpdate({ _id: req.params.id }, { avatar: s3Req.url }, function(err, feed) {
							if (err) {
								console.log('Feed search error: ' + err);
								return res.send(null, 500);
							}
							
							if (feed) {
								console.log("AVATAR SUCCESS: %s", feed);
								res.send(s3Req.url, 200);
							} else {
								res.send(null, 404);
							}
						});
					}
				} else {
					res.send(null, 500);
				}	
			});			
		  	
		  	fs.readFile(req.files.image.path, function (err, data) {
			  	if (err) {
			  		console.log("Error - %s", err)
			  		res.send(null, 500);
			  	}

			  	console.log("ABOUT TO SEND S3 REQ");
				s3Req.end(data);  //send the content of the file and an end
			});
		},

		saveCategories: function (req, res) {
			Feed.findOneAndUpdate({ _id: req.params.id }, { rankedCategories: req.body.rankedCategories || null }, function(err, feed) {
			if (err) {
					console.log('Feed search error: ' + err);
					return res.send(null, 500);
				}
				
				if (feed) {
					console.log("CATEGORY SAVE SUCCESS");
					res.send(null, 200);
				} else {
					res.send(null, 404);
				}
			});
		},
		
		deleteFeed: function (req, res) {
		
		},

		feedCheck: function (req, res) {
			var data = [];

			try {
				request({url: req.query.feedUrl, timeout: 30*1000})
					.on('error', function (error) {
				    	console.error("ERROR for FEED URL: %s / %s", req.query.feedUrl, error);
				    	res.send("Invalid URL", 400);
				  	})
					.pipe(new Feedparser())
					.on('error', function (error) {
					    console.error("FEEDPARSER ERROR for FEED URL: %s / %s", req.query.feedUrl, error);
					    res.send("Invalid Feed", 400);
					})
				  	.on('meta', function (meta) {
				    	//console.log('===== %s =====', meta.title);
				  	})
				  	.on('readable', function() {
				    	//console.log("READABLE EVENT");
				    	var item;

				    	while(item = this.read()) {
				    		///console.log('= %s =', item.title);
				    		data.push(item);
				    	}
				    })
				    .on('end', function () {

				    	if (data.length > 0)
				    		res.send(data[0].meta.title, 200);
				    	else
				    		res.send("No content found at this URL", 400);
				});
			} catch (e) {
				res.send("Invalid URL", 500);
			}

		},

		/////////////
		// Signups //
		/////////////

		addEmail: function (req, res) {
			console.log("SIGNUP: " + req.body.email);

			var valid = true;
			    
			if (!validator.isEmail(req.body.email)) valid = false;

			if (valid) {
			    Email.findOne({ emailAddress: req.body.email.toLowerCase() }, function(err, email) {
					if (email) {
						console.log('Email already submitted: ' + req.body.email);

						email.cookieId = req.cookies.pictorally;

						email.save(function (err) {		
							if (err) {
								console.log("-------------------");
								console.log("Submission error! - " + err);
								console.log("-------------------");
								res.send('fail', 500);
							} else {	
								console.log("----------");
								console.log("New cookie for email saved!");
								console.log("----------");

								res.send("duplicate", 409);
							}
							
						});
					} else {
						console.log("NO EMAILS FOUND");
						
						var email = new Email();
					  
						email.emailAddress = req.body.email;
						email.cookieId = req.cookies.pictorally;
					
						email.save(function (err) {		
							if (err) {
								console.log("-------------------");
								console.log("Submission error! - " + err);
								console.log("-------------------");
								res.send('fail', 500);
							} else {	
								console.log("----------");
								console.log("Email saved!");
								console.log("----------");

								res.send("success", 200);
							}
							
						});
					}
				});

			} else {
			    res.send("unvalidated", 400);
			}
		},

		requestInvite: function (req, res) {
			console.log("INVITE: " + req.body.email);

		    try {
			    validator.isEmail(req.body.email);

			    Invite.findOne({ emailAddress: req.body.email.toLowerCase() }, function(err, invite) {
					if (invite) {
						console.log('Email already submitted: ' + req.body.email);
						res.send("duplicate", 409);							
					} else {
						console.log("NO INVITES FOUND");
						
						var invite = new Invite();
					  
						//invite.favoriteBlog = req.body.favoriteBlog;
						invite.emailAddress = req.body.email;
						invite.secret = invite._id;
					
						invite.save(function (err) {		
							if (err) {
								console.log("-------------------");
								console.log("Submission error! - " + err);
								console.log("-------------------");
								res.send('fail', 500);
							} else {	
								console.log("----------");
								console.log("Invite saved!");
								console.log("----------");

								res.send("success", 200);
							}
							
						});
					}
				});

			} catch (e) {
			    console.log(e.message);
			    res.send("unvalidated", 400);
			}
		},

		///////////////////
		// Entry Actions //
		///////////////////

		mark: function (req, res) {
			var date = new Date(),
				dateCutoff = new Date(date.getTime() - (1000 * 60 * 60 * 24)); // one day ago

			Activity.findOne({ userId: req.user.id, feedId: req.body.feedId, dateAdded: {$gte: dateCutoff /*req.body.lastPublished*/}, type: 'asterisk' }, function(err, asterisk) {
				if (err) {
					console.log('Asterisk search error: ' + err);
					return res.send(null, 500);
				}

				if (asterisk) {
					console.log("Already asterisked: %s", asterisk);
					res.send(null, 409);
				} else if (req.body.lastPublished > date) {
					console.log("Cant vote for future posts: %s", asterisk);
					res.send(null, 500);
				} else {					
					var activity = new Activity();
					activity.userId = req.user.id;
					activity.feedId = req.body.feedId;
					activity.dateAdded = date;

					
					activity.type = 'asterisk';
					
					activity.save(function (err) {
						if (err) {
							console.log('Asterisk save error: ' + err);
							return res.send(null, 500);
						}

						Feed.findOne({_id: req.body.feedId}, function (err, feed) {
							if (err) {
								console.log('Update feed ranking error: ' + err);
							}

							if (feed) {
								feed.updateRank(function () {
									console.log("RANK UPDATED");
								});
							} else
								console.log('No feed found?');
						});

						res.send('success', 200);
					});
				}
			});
		},

		markAsRead: function (req, res) {
			Activity.findOne({ userId: req.user.id, entryId: req.params.entryId, type: 'read' }, function(err, read) {
				if (err) {
					console.log('Read search error: ' + err);
					return res.send(null, 500);
				}

				if (read) {
					console.log("Already read: %s", read);
					res.send(null, 409);
				} else {
					
					getEntryIds(req.user.id, req.params.entryId, req.body.feedId, function (entryIds) {
						if (entryIds) {
							var activity = new Activity();
							activity.userId = req.user.id;
							activity.username = entryIds.username;
							activity.userEmail = entryIds.userEmail;
							activity.entryId = req.params.entryId;
							activity.entryLink = entryIds.entryLink;
							activity.entryGuId = entryIds.entryGuId;
							activity.feedId = req.body.feedId;
							activity.feedUrl = entryIds.feedUrl;
							activity.feedFeedUrl = entryIds.feedFeedUrl;
							activity.type = 'read';
							
							activity.save(function (err) {
								if (err) {
									console.log('Read save error: ' + err);
									return res.send(null, 500);
								}

								res.send('success', 200);
							});
						} else {
							console.log('Entry ID error: ' + err);
							return res.send(null, 500);
						}
					});
				}
			});
		},

		markAsLiked: function (req, res) {
			var date = new Date();
			//	dateCutoff = new Date(date.getTime() - (1000 * 60 * 60 * 24)); // one day ago

			if (req.cookies.pictorally) {
				Activity.findOne({ cookieId: req.cookies.pictorally, imageId: req.body.feedId, dateAdded: {$gte: req.body.lastPublished}, type: 'like' }, function(err, like) {
					if (err) {
						console.log('Like search error: ' + err);
						return res.send(null, 500);
					}

					if (asterisk) {
						console.log("Already liked: %s", like);
						res.send(null, 409);
					} else if (req.body.lastPublished > date) {
						console.log("Cant like future images: %s", like);
						res.send(null, 500);
					} else {					
						var activity = new Activity();
						activity.cookieId = req.cookies.pictorally;
						activity.feedId = req.body.feedId;
						activity.imageId = req.body.imageId;
						activity.dateAdded = date;

						
						activity.type = 'like';
						
						activity.save(function (err) {
							if (err) {
								console.log('Like save error: ' + err);
								return res.send(null, 500);
							}

							Feed.findOne({_id: req.body.feedId}, function (err, feed) {
								if (err) {
									console.log('Update feed ranking error: ' + err);
								}

								if (feed) {

									// Add like to image...

									feed.updateRank(function () {
										console.log("RANK UPDATED");
									});
								} else
									console.log('No feed found?');
							});

							res.send('success', 200);
						});
					}
				});
			} else {
				return res.send(null, 500);
			}
		},

		//
		// Invites
		//

		getInvites: function (req, res) {
			console.log("GET INVITES");
			Invite.find({}, function(err, invites) {
				if (err) {
					console.log("Error finding invites: %s", err);
					res.send(null, 500);
				} else res.send(invites, 200);
			})
		},

		sendInvite: function (req, res) {
			console.log("SEND INVITE");
			console.dir(req.body);
			Invite.findOneAndUpdate({_id: req.body.id}, {$push:{ sentInvites: Date.now() }}, function(err, invite) {
				if (err) {
					console.log("Error sending invite: %s", err);
					res.send(null, 500);
				} else {
					//var message = req.body.message ? req.body.message.replace(/\n+/g, '<br /><br />') + "<br ><br />----------<br />": '';
					/*var html = 	message + "You've been invited to join Pictoral.ly!<br /><br />" +
								"<b>Here's your registration link: </b>" + "<a href='" + config.url + "/register/1/" + invite.hash + "?utm_source=invite&utm_medium=email&utm_campaign=invite'>" + config.url + "/register/1/" + invite.hash + "?utm_source=invite&utm_medium=email&utm_campaign=invite</a>";
					var text = html;*/
					email.send([{email:invite.emailAddress}], 'hello@visitsmorgasbord.com', 'Welcome to Smörgåsbord', null, EmailTemplate.invite(invite), null, function (err, response) {

					});
					res.send(null, 200);
				}
			})
		},
	}
}	