////////////
// Models //
////////////

module.exports = function (mongoose) {
	
	// Activity
	var ActivitySchema = new mongoose.Schema({
		
		// ID
		id: { type: mongoose.Schema.Types.ObjectId },
		
		// User
		cookieId: { type: String },

		// User
		userId: { type: mongoose.Schema.Types.ObjectId },

		// snapshot
		snapshotId: { type: mongoose.Schema.Types.ObjectId },

		// User username
		username: String,

		// User email
		userEmail: String,

		// Target User
		targetUserId: { type: mongoose.Schema.Types.ObjectId },

		// Target username
		targetUsername: String,

		// Target user email
		targetUserEmail: String,
		
		// Feed
		feedId: { type: mongoose.Schema.Types.ObjectId },

		// Feed url
		feedUrl: String,

		// Feed feed url
		feedFeedUrl: String,
		
		// Entry
		entryId: { type: mongoose.Schema.Types.ObjectId },

		// Entry Link
		entryLink: String,

		// Entry guId
		entryGuId: String,

		// Image id
		imageId: { type: mongoose.Schema.Types.ObjectId },

		// Image url
		imageUrl: String,

		// Type
		type: { type: String, required: true },

		// Date
		dateAdded: { type: Date, default: Date.now }
	});

	ActivitySchema.method('asterisk', function (userId, feedId, callback) {
		var date = new Date(),
			dateCutoff = new Date(date.getTime() - (1000 * 60 * 60 * 24)), // one day ago
			activity = this;

		activity.model("Activity").findOne({ userId: userId, feedId: feedId, dateAdded: {$gte: dateCutoff}, type: 'asterisk' }, function(err, asterisk) {
			if (err) {
				console.log('Asterisk search error: ' + err);
				callback(null);
			} else if (asterisk) {
				console.log("Already asterisked: %s", asterisk);
				callback(null);
			} else {					
				activity.userId = userId;
				activity.feedId = feedId;
				activity.dateAdded = date;

				activity.type = 'asterisk';
				
				activity.save(function (err) {
					if (err) {
						console.log('Asterisk save error: ' + err);
						callback(null);
					} else {

						Feed.findOne({_id: feedId}, function (err, feed) {
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

						callback(true);
					}
				});
			}
			
		});
	});


	ActivitySchema.method('likeSnapshot', function (userId, snapshotId, callback) {
		var activity = this;

		activity.model("Activity").findOne({ userId: userId, snapshotId: snapshotId, type: 'snapshotLike' }, function(err, snapshotLike) {
			if (err) {
				console.log('Snapshot Like search error: ' + err);
				callback(null);
			} else if (snapshotLike) {
				console.log("Already liked: %s", snapshotLike);
				callback(null);
			} else {					
				activity.userId = userId;
				activity.snapshotId = snapshotId;

				activity.type = 'snapshotLike';
				
				activity.save(function (err) {
					if (err) {
						console.log('Snapshot Like save error: ' + err);
						callback(null);
					} else {

						/*Feed.findOne({_id: feedId}, function (err, feed) {
							if (err) {
								console.log('Update feed ranking error: ' + err);
							}

							if (feed) {
								feed.updateRank(function () {
									console.log("RANK UPDATED");
								});
							} else
								console.log('No feed found?');
						});*/

						callback(true);
					}
				});
			}
			
		});
	});

	ActivitySchema.method('clickImageLink', function (options, callback) {
		var activity = this;

		var query = { 
			userId: options.userId, 
			feedId: options.feedId, 
			entryId: options.entryId, 
			imageId: options.imageId, 
			imageUrl: options.imageUrl, 
			type: 'imageLinkClick' 
		};

		if (options.userId) {
			query.userId = options.userId;
		} else if (options.cookieId) {
			query.cookieId = options.cookieId;
		}

		activity.model("Activity").findOne(query, function(err, imageLinkClick) {
			if (err) {
				console.log('Image link click search error: ' + err);
				callback(null);
			} else if (imageLinkClick) {
				console.log("Already clicked: %s", imageLinkClick);
				callback(null);
			} else {					
				//activity.userId = options.userId;

				if (options.userId) {
					activity.userId = options.userId;
				} else if (options.cookieId) {
					activity.cookieId = options.cookieId;
				}

				if (options.userId || options.cookieId) {
					activity.feedId = options.feedId;
					activity.entryId = options.entryId;
					activity.entryUrl = options.entryUrl;
					activity.imageId = options.imageId;
					activity.imageUrl = options.imageUrl;
					activity.type = 'imageLinkClick';
					
					activity.save(function (err) {
						if (err) {
							console.log('Image link click save error: ' + err);
							callback(null);
						} else {
							callback(true);
						}
					});
				} else {
					callback(null);
				}
			}
			
		});
	});

	ActivitySchema.method('clickTitleLink', function (options, callback) {
		var activity = this,
			date = new Date(),
				dateCutoff = new Date(date.getTime() - (1000 * 60 * 60 * 24)); // one day ago

		var query = { 
			feedId: options.feedId, 
			type: 'titleLinkClick', 
			dateAdded: { $gte: dateCutoff} 
		};

		if (options.userId) {
			query.userId = options.userId;
		} else if (options.cookieId) {
			query.cookieId = options.cookieId;
		}

		activity.model("Activity").findOne(query, function(err, titleLinkClick) {
			if (err) {
				console.log('Title link click search error: ' + err);
				callback(null);
			} else if (titleLinkClick) {
				console.log("Already clicked: %s", titleLinkClick);
				callback(null);
			} else {	

				if (options.userId) {
					activity.userId = options.userId;
				} else if (options.cookieId) {
					activity.cookieId = options.cookieId;
				}

				if (options.userId || options.cookieId) {				
					activity.feedId = options.feedId;
					activity.type = 'titleLinkClick';
					
					activity.save(function (err) {
						if (err) {
							console.log('Title link click save error: ' + err);
							callback(null);
						} else {
							callback(true);
						}
					});
				} else {
					callback(null);
				}
			}
			
		});
	});

	ActivitySchema.index({ feedId: 1, type: 1, date: -1 }); // schema level
	ActivitySchema.index({ userId: 1, type: 1, date: -1 }); // schema level

	return mongoose.model('Activity', ActivitySchema, 'activity');
}