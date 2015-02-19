//////////
// Feed //
//////////

module.exports = function (mongoose, request, Entry, async, _, Feedparser, Activity, memwatch) {
	var loading = [];

	var FeedSchema = new mongoose.Schema({
		// ID
		id: { type: mongoose.Schema.Types.ObjectId },
		
		// Username
		title: { type: String, required: true, unique: true, trim: true },

		// Author
		author: { type: String, trim: true },

		// Avatar
		avatar: { type: String, trim: true },
		
		// URL
		url: { type: String, required: true, unique: true, trim: true },

		// Feed URL
		feedUrl: { type: String, lowercase: true, required: true, unique: true, trim: true },

		// Entries
		entries: 	[{ 
						entryId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, sparse: true},
						entryPublishDate: { type: Date },
						title: { type: String },
						url: { type: String, required: true },
						images:[{
							url: { type: String, required: true },
							large2xThumbnail: { url: String, height: Number, width: Number },
							largeThumbnail: { url: String, height: Number, width: Number },
							smallThumbnail: { url: String, height: Number, width: Number },
							width: { type: Number },
							height: { type: Number },
							likes: [{ type: String }]
						}]
					}],

		// Image preview
		imagePreview: 	[{
							url: { type: String, required: true },
							largeThumbnail: { url: String, height: Number, width: Number },
							smallThumbnail: { url: String, height: Number, width: Number },
							width: { type: Number },
							height: { type: Number },
							likes: [{ type: String }],
							entryId: { type: mongoose.Schema.Types.ObjectId },
							entryTitle: { type: String },
							entryUrl: { type: String },
							entryPublishDate: { type: Date },
						}],

		// Image preview
		imagePreview2: 	[{
							url: { type: String, required: true },
							largeThumbnail: { url: String, height: Number, width: Number },
							smallThumbnail: { url: String, height: Number, width: Number },
							width: { type: Number },
							height: { type: Number },
							likes: [{ type: String }],
							entryId: { type: mongoose.Schema.Types.ObjectId },
							entryTitle: { type: String },
							entryUrl: { type: String },
							entryPublishDate: { type: Date },
						}],

		// Image preview
		longSmallImagePreview: 	[{
									url: { type: String, required: true },
									largeThumbnail: { url: String, height: Number, width: Number },
									smallThumbnail: { url: String, height: Number, width: Number },
									width: { type: Number },
									height: { type: Number },
									likes: [{ type: String }],
									entryId: { type: mongoose.Schema.Types.ObjectId },
									entryTitle: { type: String },
									entryUrl: { type: String },
									entryPublishDate: { type: Date },
								}],

								// Image preview
		longSmallImagePreview2: 	[{
									url: { type: String, required: true },
									largeThumbnail: { url: String, height: Number, width: Number },
									smallThumbnail: { url: String, height: Number, width: Number },
									width: { type: Number },
									height: { type: Number },
									likes: [{ type: String }],
									entryId: { type: mongoose.Schema.Types.ObjectId },
									entryTitle: { type: String },
									entryUrl: { type: String },
									entryPublishDate: { type: Date },
								}],

								// Image preview
		longSmallImagePreview3: 	[{
									url: { type: String, required: true },
									largeThumbnail: { url: String, height: Number, width: Number },
									smallThumbnail: { url: String, height: Number, width: Number },
									width: { type: Number },
									height: { type: Number },
									likes: [{ type: String }],
									entryId: { type: mongoose.Schema.Types.ObjectId },
									entryTitle: { type: String },
									entryUrl: { type: String },
									entryPublishDate: { type: Date },
								}],

		// Image preview
		longLargeImagePreview: 	[{
									url: { type: String, required: true },
									large2xThumbnail: { url: String, height: Number, width: Number },
									largeThumbnail: { url: String, height: Number, width: Number },
									smallThumbnail: { url: String, height: Number, width: Number },
									width: { type: Number },
									height: { type: Number },
									likes: [{ type: String }],
									entryId: { type: mongoose.Schema.Types.ObjectId },
									entryTitle: { type: String },
									entryUrl: { type: String },
									entryPublishDate: { type: Date },
								}],

		// Image preview
		longLargeImagePreview2: 	[{
										url: { type: String, required: true },
										large2xThumbnail: { url: String, height: Number, width: Number },
										largeThumbnail: { url: String, height: Number, width: Number },
										smallThumbnail: { url: String, height: Number, width: Number },
										width: { type: Number },
										height: { type: Number },
										likes: [{ type: String }],
										entryId: { type: mongoose.Schema.Types.ObjectId },
										entryTitle: { type: String },
										entryUrl: { type: String },
										entryPublishDate: { type: Date },
									}],

		// Description
		description: { type: String, trim: true, default:'' },

		// Categories
		categories: [{ type: String, trim: true }],

		// Ranked Categories
		rankedCategories: 	[{ 
								category: { type: String, required: true, trim: true },
								categoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
								rank: { type: Number, required: true }
							}],

		// Store URL
		storeUrl: { type: String, trim: true },

		// Portfolio URL
		portfolioUrl: { type: String, trim: true },

		// Newsletter sign URL
		newsletterSignupUrl: { type: String, trim: true },

		// Social links
		// Twitter URL
		twitterUrl: { type: String, trim: true },

		// Instagram URL
		instagramUrl: { type: String, trim: true },

		// Facebook URL
		facebookUrl: { type: String, trim: true },

		// Pinterest URL
		pinterestUrl: { type: String, trim: true },

		// Tumblr URL
		tumblrUrl: { type: String, trim: true },

		// Flickr URL
		flickrUrl: { type: String, trim: true },

		// Etsy URL
		etsyUrl: { type: String, trim: true },

		// City
		city: { type: String, trim: true },

		// State
		state: { type: String, trim: true },

		// Country
		country: { type: String, trim: true },

		// Subscribers
		subscribers: [{ type: mongoose.Schema.Types.ObjectId }],

		// Current ranking
		rank: { type: Number },

		// Clicks
		clicks: { type: Number, default: 0 },

		// CookieIDs of those who asterisked
		asterisks: [{ 	
						userId: { type: String, required: true },
						dateAdded: { type: Date, required: true },
					}],

		// # of Asterisks
		asteriskCount: { type: Number },

		// Average asterisk count
		asteriskAvg: { type: Number },

		// Size ranking
		topHalfPercentile: Boolean,

		// Badges
		badges: [{ type: String }],

		// Seen-users List
		seenUsers: [{ type: mongoose.Schema.Types.ObjectId }],

		// Hidden
		hidden: { type: Boolean },

		// Last published
		lastPublished: { type: Date },

		// Date added
		dateAdded: { type: Date, default: Date.now }
	});
	
	// Load feeds from the Google Feed API
	FeedSchema.method('load', function(callback) {
		var data = [],
			feedUrl = this.feedUrl,
			done = false;

		console.log("Loading current posts from %s.", this.feedUrl);

		request({url: feedUrl, timeout: 30*1000})
			/*.on('close', function () {				
				console.log("REQUEST CLOSED for FEED URL: %s", feedUrl);
				//console.dir(error);
				if (!done) callback(null, false);
		    	done = true;
		    	return;
			})*/
			.on('error', function (error) {
		    	console.error("ERROR for FEED URL: %s / %s", feedUrl, error);
		    	
		    	if (!done) callback(error, false);
		    	data = null;
		    	done = true;
		    	return;
		  	})
			.pipe(new Feedparser())
			.on('error', function (error) {
			    console.error("FEEDPARSER ERROR for FEED URL: %s / %s", feedUrl, error);
			    
			    if (!done) callback(error, false);
			    data = null;
			    done = true;
			    return;
			})
		  	.on('meta', function (meta) {
		    	//console.log('===== %s =====', meta.title);
		  	})
		  	.on('readable', function() {
		    	//console.log("READABLE EVENT");
		    	console.log("READABLE EVENT for FEED URL: %s", feedUrl);
		    	var item;

		    	while(item = this.read()) {
		    		///console.log('= %s =', item.title);
		    		
		    		data.push(item);
		    	}
		    })
		    .on('end', function () {
		    	console.log("END EVENT for FEED URL: %s", feedUrl);

				/*_.each(data, function(result) {
		    		//console.log('= %s =', result.title);
		    	});*/

		    	if (!done) {
			    	if (data) callback(data, true);
			    	else callback(data, false);
			    }

			    done = true; 

		    	data = null;
		    	console.log("RECEIVE DATA");
		    	//memwatch.gc();

		    	return;
		 });
	});

	FeedSchema.methods.updateEntries = function (callback) {
		var feed = this;

		console.log("================================= LOADING INDEX OF %s is %d ==============================", feed._id.toHexString(), loading.indexOf(feed._id.toHexString()))
		console.dir(loading);
		
		// Check if feed is currently loading to prevent interference
		if (loading.indexOf(feed._id.toHexString()) < 0) {

			// Add to list of feeds currently loading
			loading.push(feed._id.toHexString());

			feed.load(function (results, success) {

				// Add a 'if no results' catch here...
				console.log("REQUEST RESULT - %s / LENGTH - %d", success, results.length);
				if (success && results.length > 0) {

					Entry.findOne({feedId: feed._id}, 'link guId title', {sort: { publishDate: -1 }}, function (err, entry) {
						if (err) {
							// Handle error
							console.log("Error finding entry: %s", err);
						}

						if (entry) {
							// Check index and mash it up...
							console.log(entry);

							// Use LINK as unique identifier  !!  IMPORTANT: It's crucial to make sure all other RSS data is saved.
							var matchIndex = results.indexOf(_.findWhere(results, {link: entry.link}));
							console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! MATCH INDEX - %d !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", matchIndex);
							console.log("FIRST ENTRY - %s", entry.link);
							console.log("LOAD RESULT - %s", results[0].link);

							/*if (entry.guid === null) {
								console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! %s has no GUID !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", feed.title);
								return callback(feed.title + " post has no guid!");
							}*/

							if (matchIndex == 0) {
								console.log("%s is up-to-date.", feed.title);
								
								// Remove feed from list of currently loading
								loading.splice(loading.indexOf(feed._id.toHexString()), 1);
								console.dir(loading);

								callback(feed.title + " is up-to-date!");

							} else if (matchIndex > 0) {
								console.log("%s has new posts.", feed.title);
								console.log("Index of match: %d", matchIndex);
								feed.buildEntries(results.slice(0, matchIndex), callback);
							} else {
								console.log("WARNING: All are new for %s.", feed.title);
								feed.buildEntries(results, callback);
							}
						} else {
							// add all of them...
							console.log("No entries yet for %s - there are %d available to add.", feed.title, results.length);
							feed.buildEntries(results, callback);
						}

						// Release feed alias
						feed = null;
					});
				} else {
					console.log("ERROR loading %s. - %s", feed.title, results);
								
					// Remove feed from list of currently loading
					loading.splice(loading.indexOf(feed._id.toHexString()), 1);
					callback("ERROR loading " + feed.title);

					// Release feed alias
					feed = null;
				}
			});
		} else {
			console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! %s is currently updating. !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", feed.title);
			callback(feed.title + " is currently updating.");

			// Release feed alias
			feed = null;			
		}	
	}
			
	// Process content and build each entry
	FeedSchema.method('buildEntries', function buildEntries(results, callback) {
		var feed = this;

		async.map(results, function (result, callback) {
			//console.log('async each: %s', result.link);
			
			var entry = new Entry();

			entry.url = result.origlink || result.link;
			entry.link = result.link;
			entry.guId = result.guid;

			entry.generator = result.meta.generator;
			entry.feedId = feed._id;
			entry.title = result.title;
			//entry.content = result.description;
			entry.author = result.author;
			entry.publishDate = result.pubdate || result.meta.pubdate;
			entry.original = result;		// just so it's there...
			//entry.parser = '';			// just so it's there...

			//console.log('>>>>>>>>>', entry);

			
			callback(null, entry);
		}, function(err, entries) {
			if (err)
				console.log("ASYNC BUILD ENTRIES ERROR: %s", err);
				
			console.log('done with creating entries');
			
			// Process & save content from oldest to newest
			// NOTE: the idea is that is the connection is severed before content is saved...
			// ...the updater will still detect those newer posts as missing ad update them.
			
			var containsErrors;

			async.eachSeries(entries.reverse(), function (entry, callback) {
				console.log('async each');
				async.series([
					function (callback) {
						entry.processContent(function () {
							console.log('PROCESS');

							// Initial save attempt
							entry.save(function (err) {		
								if (err) {
									console.log("-------------------");
									console.log("Preliminary entry save error! / " + err);
									console.log("-------------------");
									
									// Cancel the rest of the entry updates
						
									containsErrors = true;
								} else {
									containsErrors = false;
								}

								callback();
							});

						});
					}, function (callback) {
						if (!containsErrors) {
							entry.sizeImages(function () {
								console.log('SIZE');
								callback();
							});
						} else {
							callback();
						}
					}, function (callback) {
						if (!containsErrors) {
							entry.compressImages(function () {
								console.log('COMPRESS');
								callback();
							});
						} else {
							callback();
						}
					/*}, function (callback) {
						entry.organizeImages(function () {
							console.log('ORGANIZE');
							callback();
						}); */
					}], function (err) {
						// Entry finished
						console.log('FINISHED');

						if (containsErrors) {
							console.log("ENTRY CONTAINS ERRORS - %s", entry.link);
							
							// IMPORTANT: This prevents a big memory leak.
							entry = null;

							callback();
						} else {
							console.log("ENTRY IS READY FOR SAVE - %s", entry.link);
							// Save entry to DB
							entry.save(function (err) {		
								if (err) {
									console.log("-------------------");
									console.log("Entry save error! / " + err);
									console.log("-------------------");
									
									// IMPORTANT: This prevents a big memory leak.
									entry = null;

									// Cancel the rest of the entry updates
									//callback(err);

									callback();

								} else {

									console.log("Entry saved.");
									console.log('******Saving entries for %s', entry._id);

									/*var feedEntry = {};

									feedEntry.entryId = entry._id;
									feedEntry.url = entry.url;
									feedEntry.entryPublishDate = entry.publishDate;
									feedEntry.title = entry.title || null;
									feedEntry.images = entry.images;

									if (feed.entries === undefined) {
										console.log("FEED ENTRIES UNDEFINED");
										console.dir(feed.entries);
										feed.entries = [];
									}

									//feed.entries.unshift(feedEntry);
									console.log("FEED MODEL");
									console.dir(feed.model(feed.constructor.modelName));
									//feed.save(function (err) {		
									feed.model(feed.constructor.modelName).update({_id:feed._id}, {$set: {url: feedEntry}}, {upsert: false, multi: false}, function (err, count) {
										if (err) {
											console.log("-------------------");
											console.log("Feed save error! / " + err);
											console.log("-------------------");
										} else {
											console.log('******Saved %s entry for %s in %s', count, feed.title, entry._id);
										}

										// IMPORTANT: This prevents a big memory leak.
										entry = null;
										results = null;

										callback();
									});*/

									// IMPORTANT: This prevents a big memory leak.
									entry = null;
									results = null;

									callback();

									// Remove feed from list of currently loading
									//if (loading.indexOf(feed._id.toHexString()) >= 0) loading.splice(loading.indexOf(feed._id.toHexString()), 1);
								}
							});
						}
				});
				
			}, function (err) {
				if (err)
					console.log("ASYNC PROCESS CONTENT ERROR: %s", err);
				
				// Set of entries finished
				console.log('done with processing content');

				// Remove feed from list of currently loading
				
				if (loading.indexOf(feed._id.toHexString()) >= 0) loading.splice(loading.indexOf(feed._id.toHexString()), 1);
				
				callback('success');

				// Release feed alias
				feed = null;

			});
		});
	});

	// Update Last Published Date
	FeedSchema.method('updateLastPublished', function updateLastPublished(callback) {
		var feed = this;

		Entry.findOne({feedId: feed._id}, 'publishDate dateAdded', {sort: { publishDate: -1 }}, function (err, entry) {
			if (err) {
				// Handle error
				console.log("-------------------");
				console.log("Update last published error! / " + err);
				console.log("-------------------");
			}

			if (entry) {
				var now = new Date();
				if (entry.publishDate > now) {
					console.log("FUTURE PUBDATE DETECTED for %s - %s", feed.title, entry.publishDate);
					console.dir(entry.publishDate);
				}

				// Reset 'seen users' list
				if (feed.lastPublished < entry.publishDate) feed.seenUsers = [];

				feed.lastPublished = entry.publishDate;

				feed.save(function (err) {		
					if (err) {
						console.log("-------------------");
						console.log("Feed last published date for %s - save error! / %s", feed.title, err);
						console.log("-------------------");
					} else {
						console.log("Last published date - %s - %s - saved for %s.", feed.lastPublished, entry.publishDate, feed.title);
					}

					callback();

					// Release feed alias
					feed = null;
				});
			} else {
				console.log("No entries found!");
				callback();

				// Release feed alias
				feed = null;
			}
		});
	});

	FeedSchema.method('updateClicks', function updateLastPublished(callback) {
		var feed = this;
		Activity.count({ feedId: feed._id, $or: [{type: 'imageLinkClick'}, {type: 'titleLinkClick'}] }, function (err, count) {
			if (err) {
				console.log("Error getting feed click count: %s", err);
				callback();
				feed = null;
			} else if (count !== undefined) {
					feed.clicks = count;
					feed.save(function (err) {
						if (err) console.log("Error saving feed clicks: %s", err);
						callback();
						feed = null;
					});
			} else {
				callback();
				feed = null;
			}
		});
	});

	FeedSchema.method('updateImagePreview', function updateLastPublished(callback) {
		//  Small Previews

		var entries = null,
			feed = this,
			limit = 0;

		async.doUntil(function (callback) {
			// Get enough entries to fill image preview
			limit += 10;
			Entry.find({feedId: feed._id}, {images:1, title:1, url:1, publishDate:1 }, { limit: limit, sort: { publishDate: -1}}, function (err, results) {
				if (err) {
					callback("Error searching entries for ranking: %s", err);
				} else {
					console.log('Found %s entries', results.length);
					entries = results;
					callback();
				}
			});
		}, function () { 
			var totalWidth = 0,
				imageCount = 0;
				margin = 2,
				width = 4200;

			_.each(entries, function (elm, i) {
				_.each(elm.images, function (image, i) {
					if (image.smallThumbnail && image.smallThumbnail.height >= 150) {
						totalWidth += image.smallThumbnail.width;
						imageCount++;
					}
				});
			});

			totalWidth = totalWidth - (margin * (imageCount+1));

			console.log("ENOUGH IMAGES CHECK - %s - WIDTH: %s - LIMIT: %s - RESULT LENGTH - %s - IMAGE COUNT - %s", feed.title, totalWidth, limit, entries.length, imageCount);

			return totalWidth >= width || entries.length < limit; 

		}, function (err) {
			var width = 800,
				imagesWidth = 0,
				images2Width = 0,
				margin = 2;

			console.log("BUILDING IMAGE PREVIEW FOR %s", feed.title);

			feed.imagePreview = [];
			feed.imagePreview2 = [];


			_.each(entries, function (elm, i) {
				if ((imagesWidth - (margin * (feed.imagePreview.length+1))) < width || (images2Width - (margin * (feed.imagePreview2.length+1))) < width) {
					_.each(elm.images, function(image) {
						//console.log("MARGIN TEST - %s - %s - %s", feed.title, images2Width, (images2Width - (margin * (feed.imagePreview2.length+1))));
						if ((imagesWidth - (margin * (feed.imagePreview.length+1))) < width) {
							if (image.smallThumbnail && image.smallThumbnail.height >= 150) {
								feed.imagePreview.push(image);
								feed.imagePreview[feed.imagePreview.length-1].entryId = elm._id;
								feed.imagePreview[feed.imagePreview.length-1].entryTitle = elm.title;
								feed.imagePreview[feed.imagePreview.length-1].entryUrl = elm.url;
								feed.imagePreview[feed.imagePreview.length-1].entryPublishDate = elm.publishDate;
								imagesWidth += image.smallThumbnail.width;
							}
						} else if ((imagesWidth - (margin * (feed.imagePreview.length+1))) >= width && (images2Width - (margin * (feed.imagePreview2.length+1))) < width) {

							if (image.smallThumbnail && image.smallThumbnail.height >= 150) {
								feed.imagePreview2.push(image);
								feed.imagePreview2[feed.imagePreview2.length-1].entryId = elm._id;
								feed.imagePreview2[feed.imagePreview2.length-1].entryTitle = elm.title;
								feed.imagePreview2[feed.imagePreview2.length-1].entryUrl = elm.url;
								feed.imagePreview2[feed.imagePreview2.length-1].entryPublishDate = elm.publishDate;
								images2Width += image.smallThumbnail.width;
							}
						}
						//console.log("FINAL MARGIN TEST - %s - %s - %s", feed.title, images2Width, (images2Width - (margin * (feed.imagePreview2.length+1))));
					});
				}
			});

			// Long Small Preview

			width = 1400;
			imagesWidth = 0;
			images2Width = 0;
			images3Width = 0;

			feed.longSmallImagePreview = [];
			feed.longSmallImagePreview2 = [];
			feed.longSmallImagePreview3 = [];

			_.each(entries, function (elm, i) {
				if ((imagesWidth - (margin * (feed.longSmallImagePreview.length+1))) < width || (images2Width - (margin * (feed.longSmallImagePreview2.length+1))) < width || (images3Width - (margin * (feed.longSmallImagePreview3.length+1))) < width) {
					_.each(elm.images, function(image) {
						if ((imagesWidth - (margin * (feed.longSmallImagePreview.length+1))) < width) {
							if (image.smallThumbnail && image.smallThumbnail.height >= 150) {
								feed.longSmallImagePreview.push(image);
								feed.longSmallImagePreview[feed.longSmallImagePreview.length-1].entryId = elm._id;
								feed.longSmallImagePreview[feed.longSmallImagePreview.length-1].entryTitle = elm.title;
								feed.longSmallImagePreview[feed.longSmallImagePreview.length-1].entryUrl = elm.url;
								feed.longSmallImagePreview[feed.longSmallImagePreview.length-1].entryPublishDate = elm.publishDate;
								imagesWidth += image.smallThumbnail.width;
							}
						} else if ((imagesWidth - (margin * (feed.longSmallImagePreview.length+1))) >= width && (images2Width - (margin * (feed.longSmallImagePreview2.length+1))) < width) {
							if (image.smallThumbnail && image.smallThumbnail.height >= 150) {
								feed.longSmallImagePreview2.push(image);
								feed.longSmallImagePreview2[feed.longSmallImagePreview2.length-1].entryId = elm._id;
								feed.longSmallImagePreview2[feed.longSmallImagePreview2.length-1].entryTitle = elm.title;
								feed.longSmallImagePreview2[feed.longSmallImagePreview2.length-1].entryUrl = elm.url;
								feed.longSmallImagePreview2[feed.longSmallImagePreview2.length-1].entryPublishDate = elm.publishDate;
								images2Width += image.smallThumbnail.width;
							}
						} else if ((imagesWidth - (margin * (feed.longSmallImagePreview.length+1))) >= width && (images2Width - (margin * (feed.longSmallImagePreview2.length+1))) >= width  && (images3Width - (margin * (feed.longSmallImagePreview3.length+1))) < width) {
							if (image.smallThumbnail && image.smallThumbnail.height >= 150) {
								feed.longSmallImagePreview3.push(image);
								feed.longSmallImagePreview3[feed.longSmallImagePreview3.length-1].entryId = elm._id;
								feed.longSmallImagePreview3[feed.longSmallImagePreview3.length-1].entryTitle = elm.title;
								feed.longSmallImagePreview3[feed.longSmallImagePreview3.length-1].entryUrl = elm.url;
								feed.longSmallImagePreview3[feed.longSmallImagePreview3.length-1].entryPublishDate = elm.publishDate;
								images3Width += image.smallThumbnail.width;
							}
						}
					});
				}
			});

			//  Long Large Preview
			width = 1400;
			imagesWidth = 0;
			images2Width = 0;

			feed.longLargeImagePreview = [];
			feed.longLargeImagePreview2 = [];

			_.each(entries, function (elm, i) {
				if ((imagesWidth - (margin * (feed.longLargeImagePreview.length+1))) < width || (images2Width - (margin * (feed.longLargeImagePreview2.length+1))) < width) {
					_.each(elm.images, function(image) {
						if ((imagesWidth - (margin * (feed.longLargeImagePreview.length+1))) < width && image.largeThumbnail && image.largeThumbnail.height >= 300) {
							//if (image.largeThumbnail && image.largeThumbnail.height >= 300) {
								feed.longLargeImagePreview.push(image);
								feed.longLargeImagePreview[feed.longLargeImagePreview.length-1].entryId = elm._id;
								feed.longLargeImagePreview[feed.longLargeImagePreview.length-1].entryTitle = elm.title;
								feed.longLargeImagePreview[feed.longLargeImagePreview.length-1].entryUrl = elm.url;
								feed.longLargeImagePreview[feed.longLargeImagePreview.length-1].entryPublishDate = elm.publishDate;
								imagesWidth += image.largeThumbnail.width;
							//}
						} else if (/*(imagesWidth - (margin * (feed.longLargeImagePreview.length+1))) >= width &&*/ (images2Width - (margin * (feed.longLargeImagePreview2.length+1))) < width && image.smallThumbnail && image.smallThumbnail.height >= 150) {

							//if (image.smallThumbnail && image.smallThumbnail.height >= 150) {
								feed.longLargeImagePreview2.push(image);
								feed.longLargeImagePreview2[feed.longLargeImagePreview2.length-1].entryId = elm._id;
								feed.longLargeImagePreview2[feed.longLargeImagePreview2.length-1].entryTitle = elm.title;
								feed.longLargeImagePreview2[feed.longLargeImagePreview2.length-1].entryUrl = elm.url;
								feed.longLargeImagePreview2[feed.longLargeImagePreview2.length-1].entryPublishDate = elm.publishDate;
								images2Width += image.smallThumbnail.width;
							//}
						}
					});
				}
			});

			feed.save(function (err) {		
				if (err) {
					console.log("-------------------");
					console.log("Feed image preview for %s - save error! / %s", feed.title, err);
					console.log("-------------------");
				} else {
					console.log("Image preview - %s - saved for %s.", feed.lastPublished, feed.title);
				}

				callback();

				// Release feed alias
				feed = null;
				entries = null;
			});
		});
		
	});

	// Update Last Published Date
	FeedSchema.method('updateRank', function updateRank(callback) {
		var feed = this,
			date = new Date(),
			dateCutoff = new Date(date.getTime() - (1000 * 60 * 60 * 24)), // one day ago
			entries = null;

		async.series([function (callback) {
			// Get posts with cutoff
			Entry.find({feedId: feed._id, publishDate: {$gte: dateCutoff}}, {publishDate:1 }, function (err, results) {
				if (err) {
					callback("Error searching entries for ranking: %s", err);
				} else if (results) {
					if (results.length > 0) {
						entries = results;
						callback();
					} else {
						callback();
					}
				} else {
					callback();
				}
			});

		}, function (callback) {
			// Get at least two posts if no posts within cutoff
			Entry.find({feedId: feed._id}, {publishDate:1 }, {limit: 3}, function (err, results) {
				if (err) {
					callback("Error searching entries for ranking: %s", err);
				} else {
					entries = results;
					callback();
				}
			});

		}, function (callback) {

			if (entries[2] !== undefined && entries[2].publishDate !== undefined) {
				Activity.find({type:'asterisk', feedId: feed._id, $or: [{dateAdded: {$gte: entries[2].publishDate}}, {dateAdded: {$gte: dateCutoff}}] }, function (err, asterisks) {
					if (err) {
						console.log("ASTERISK FIND ERROR - %s", err);
						return;
					}


					// Calculate rank
					// Get Average Daily Post time
					if (feed.lastPublished) {
						console.log("LAST PUBLISHED DATE IS GOOD - ENTRIES LENGTH: %s - FEED %s", entries.length, feed.title);
						var todaysPosts = true,
							cutoff = new Date(entries[0].publishDate.getFullYear(), entries[0].publishDate.getMonth(), entries[0].publishDate.getDate()),
							todaysPublishDates = [],
							i = 0;
						while (todaysPosts == true && entries[i] !== undefined) {
							if (entries[i].publishDate >= cutoff) {
								console.log("PUSH ENTRY");
								todaysPublishDates.push(entries[i].publishDate);
							} else {
								console.log("DON'T PUSH ENTRY");
								todaysPosts = false;
							}

							console.dir(todaysPublishDates);
							i++;
						}


						var recentPost = _.reduce(todaysPublishDates, function(memo, elm) { return memo + elm.getTime() }, 0);

						console.log(recentPost);

						recentPost = new Date(recentPost/todaysPublishDates.length);

						console.log("RECENT POST / FIRST: %s / LAST: %s / AVG: %s / LENGTH: %s", _.first(todaysPublishDates), _.last(todaysPublishDates), recentPost, todaysPublishDates.length);
						todaysPublishDates = null;
							//recentPost = new Date(recentPost.getFullYear(), recentPost.getMonth(), recentPost.getDate(), Math.floor(recentPost.getHours()/2)*2);
							//recentPost = new Date(recentPost.getTime() - 1*1000*60*60*12); // Making the cuttoff for a newness bonus at 4am PST
					} else {
						console.log("NO LAST PUBLISHED DATE");
						var recentPost = new Date();

						recentPost = new Date(recentPost.getTime() - 1*1000*60*60*24);
					}

					//feed.asterisks = _.pluck(asterisks, "cookieId");
					var recentAsterisks = _.filter(asterisks, function (asterisk) {
						//return asterisk.dateAdded >= feed.entries[0].entryPublishDate;
						return asterisk.dateAdded >= dateCutoff;
					});

					console.log("Asterisks? - %s", feed.title);
					console.dir(recentAsterisks);

					//feed.asterisks = _.pluck(recentAsterisks, "userId");
					feed.asterisks = _.reduce(recentAsterisks, function(memo, obj) { 
						if (obj.userId !== undefined && obj.userId != null && obj.dateAdded >= dateCutoff) {
							var newObj = {};
							newObj.userId = obj.userId;
							newObj.dateAdded = obj.dateAdded;

							memo.push(newObj); 
						}
						
						return memo;
					}, []);

					console.log("Asterisks??");
					console.dir(feed.asterisks);

					feed.asteriskCount = _.reduce(asterisks, function (memo, asterisk) {
						console.log("REDUCE *");
						console.log(asterisk.dateAdded);
						console.log(entries[0].publishDate);
						console.log(entries[1].publishDate);
						console.log(entries[2].publishDate);

						if (asterisk.dateAdded >= entries[0].publishDate) {
							console.log("ONE");
							return memo + 1;
						} else if (asterisk.dateAdded >= entries[1].publishDate) {
							console.log("HALF");
							return memo + .5;
						} else if (asterisk.dateAdded >= entries[2].publishDate) {
							console.log("QUARTER");
							return memo + .25;
						} else {
							console.log("ZERO");
							return memo + 0;
						}
					}, 0);
					console.log("ASTERISK COUNT - %d", feed.asteriskCount);

					console.dir("*** " + feed._id);
					console.log(date);
					console.log(date.getTime());
					console.log(recentPost);
					console.log(recentPost.getTime());
					//console.dir(asterisks);
					console.log("DAYS ELAPSED - %d", (date.getTime() - recentPost.getTime())/(1*1000*60*60*24));
					console.log("ASTERISKS - %d", feed.asteriskCount);

					var timeElapsed = new Date(date.getTime() - recentPost.getTime());
					//var sixHourIntervals = Math.ceil(timeElapsed.getTime()/(1*1000*60*60*6));
					var daysElapsed = (date.getTime() - recentPost.getTime())/(1*1000*60*60*24)+1;
					//var daysElapsed = (1*1000*60*60*sixHourIntervals*6)/(1*1000*60*60*24)+1;

					console.log("RANK - %d", (Math.pow(feed.asteriskCount+50, 1))/(Math.log(Math.pow(daysElapsed, Math.pow(daysElapsed, .9)))/Math.LN10+2));
					console.log("TEST - %d", Math.pow(daysElapsed, 1));
					console.log("TEST - %d", Math.pow(daysElapsed, Math.pow(daysElapsed, 1)));

					//result.rank = (Math.log((asterisks.length+1)/10)/Math.LN10+2)/(Math.log(daysElapsed*daysElapsed)/Math.LN10+2);
					//result.rank = (Math.log((asterisks.length+1))/Math.LN10+2)/(Math.log(daysElapsed*daysElapsed)/Math.LN10+2);
					feed.rank = (Math.pow(feed.asteriskCount+50, 1))/(Math.log(Math.pow(daysElapsed, Math.pow(daysElapsed, 1)))/Math.LN10+2);
					//(x^2)/(ln(y^(y^1.1))/ln(10)+2)
					//feedList.push(result);

					// Make badges random for now...
					feed.badges = [];

					/*_.each(['Popular', 'Rare', 'Hibernating', 'Out of Hibernation', 'Classic', 'Recently Updated', 'New Blog'], function (elm) {
						if (Math.random() > .5) feed.badges.push(elm);
					});*/

					var now = new Date();

					async.series([function (callback) {
						// Recently Updated
						console.log("RECENTLY UPDATED FOR %s", feed.title);
						if ((now.getTime() - feed.lastPublished.getTime()) <= (1000*60*60*12)) feed.badges.push("Recently Updated");
						callback();
					}/*, function (callback) {
						// Popular
						var feedCount;

						async.series([function (callback) {
							feed.model("Feed").find({asteriskCount:{$gt:0}}).count().exec(function (err, count) {
								if (err) console.log("Popular badge - feed count err: %s", err);

								console.log("FEED WITH VOTES COUNT: %d", count);

								feedCount = count;
								callback();
							});
						}, function (callback) {
							feed.model("Feed").find({asteriskCount:{$gt:0}}, {_id: 1, asteriskCount: 1}, {sort:{asteriskCount:-1} }, function (err, result) {
								if (err) console.log("Popular badge - feed find err: %s", err);

								if (result.length) {
									//console.dir(result);

									// Is this feed in the top 25%?
									var benchmarkQuarter = result[Math.floor(feedCount*.25)].asteriskCount;
									console.log("POSITION: %d", Math.floor(feedCount*.25));
									console.dir(result[Math.floor(feedCount*.25)]);

									console.log("BENCHMARK - 25: %d", benchmarkQuarter);
									console.log("ASTERISK COUNT: %d", feed.asteriskCount);
									
									if (feed.asteriskCount >= benchmarkQuarter) {
										console.log("POPULAR");
										feed.badges.push("Popular");
									}

									// Is this feed in the top 50%?
									//var benchmarkHalf = result[Math.floor(feedCount*.5)].asteriskCount;
									//console.log("POSITION: %d", Math.floor(feedCount*.5));
									//console.dir(result[Math.floor(feedCount*.5)]);

									var feedIndex;

									var foundFeed = _.filter(result, function (resultFeed, i) {
										if (feed._id.toString() === resultFeed._id.toString())
											feedIndex = i;

										return feed._id.toString() === resultFeed._id.toString();
									});

									console.log("FEED POSITION: %s", feedIndex);
									console.log("FEED: %s", feed._id);
									console.log("FOUND FEED: %s", foundFeed);
									console.log("FEED COUNT: %s", Math.floor(feedCount*.75));
									console.log("FEED COUNT - 75: %s", feedCount);
									console.log("ASTERISK COUNT: %d", feed.asteriskCount);
									
									if (feedIndex < Math.floor(feedCount*.75)) {
										console.log("Top Half");
										feed.topHalfPercentile = true;
									} else {
										feed.topHalfPercentile = false;
									}
								}
									
								callback();
							});
						}], function (err) {
							if (err) console.log("POPULAR ASYNC ERROR: %s", err);

							callback();
						});
					}, function (callback) {
						// New Blog
						if ((now.getTime() - feed.dateAdded.getTime()) <= (1000*60*60*24*31)) feed.badges.push("Newly Added");
						callback();
					}, function (callback) {
						// Classic
						if (feed.badges.indexOf("Newly Added") < 0) {
							Entry.find({feedId: feed._id,}, {publishDate: 1}, {sort: {publishDate:-1}}, function (err, entries) {
								if (err) console.log("ENTRIES SEARCH FOR CLASSIC CALC ERR for %s: %s", feed.title, err);

								Activity.find({feedId:feed._id, type: "asterisk"}, {dateAdded:1}, function (err, asterisks) {
									if (err) console.log("ASTERISK SEARCH FOR CLASSIC CALC ERR for %s: %s", feed.title, err);

									var values = [];

									console.log("CALC CLASSIC");

									for (var i=0; i < entries.length-1; i++) {
										
										values[i] = _.reduce(asterisks, function (memo, asterisk) {
														//console.log(asterisk);

														if (i == 0 && asterisk.dateAdded > entries[i].publishDate) {
															//console.log("ASTERISK MATCHES");
															//console.dir(memo);
															return memo + 1;
														} else if (asterisk.dateAdded <= entries[i].publishDate && asterisk.dateAdded > entries[i+1].publishDate) {
															//console.log("ASTERISK MATCHES");
															//console.dir(memo);
															return memo + 1;
														} else
															return memo;
													}, 0);
									}

									//console.dir(values);

									feed.asteriskAvg = values.reduce(function(memo, num){return memo+num;})/values.length;

									feed.save(function (err) {		
										if (err) {
											console.log("-------------------");
											console.log("Feed asterisk average save error! / " + err);
											console.log("-------------------");
										} else {
											console.log("Asteirsk average saved for %s.", feed.title);
										}

										feed.model("Feed").find({}, {asteriskAvg:1}, function (err, averages) {
											if (err) console.log("AVERGAE ASTERISK COUNT SEARCH FOR CLASSIC CALC ERR for %s: %s", feed.title, err);

											var averages = _.pluck(averages, 'asteriskAvg'),
												average = averages.reduce(function(memo, num){return memo+num;})/averages.length;

											console.log("CALC CLASSIC - AVG: %d - AVG75: %d - FEED AVG: %d", average, (average/2)+average, feed.asteriskAvg);

											if (feed.asteriskAvg >= ((average/2)+average) ) feed.badges.push("Classic");

											feed.save(function (err) {		
												if (err) {
													console.log("-------------------");
													console.log("Feed classic badge  save error! / " + err);
													console.log("-------------------");
												} else {
													callback();
												}
											});
										});
									});
								});
							});
						} else {
							callback();
						}
					}, function (callback) {
						// Hibernating
						if ((now.getTime() - feed.lastPublished.getTime()) >= (1000*60*60*24*31*2)) feed.badges.push("Hibernating");
						callback();
					}, function (callback) {
						// Out of Hibernation
						Entry.find({feedId: feed._id}, {publishDate: 1}, {limit: 2, sort: { publishDate: -1}}, function (err, result) {
							
							//console.log('OUT OF HIBERNATION');
							//console.log(result[0].publishDate.getTime() - result[1].publishDate.getTime());
							//console.log((result[0].publishDate.getTime() - result[1].publishDate.getTime())/(1000*60*60*24));
							
							if ((result[0].publishDate.getTime() - result[1].publishDate.getTime()) >= (1000*60*60*24*31*2) && feed.badges.indexOf("Hibernating") < 0) feed.badges.push("Out of Hibernation");
							callback();
						});
					}, function (callback) {
						// Rare
						Entry.find({feedId: feed._id}, {publishDate: 1}, {limit: 10, sort: { publishDate: -1}}, function (err, result) {
							var periods = [];
							_.each(result, function (elm, i, list) {
								if (i < list.length-1) periods.push(list[i].publishDate.getTime() - list[i+1].publishDate.getTime());
							});

							//console.log('RARITY');
							//console.log(periods);
							//console.log((periods.reduce(function(memo, num){return memo+num;})/periods.length)/(1000*60*60*24));
							
							if ((periods.reduce(function(memo, num){return memo+num;})/periods.length) >= (1000*60*60*24*31)) feed.badges.push("Rare");
							callback();
						});
					}*/], function (err) {
						if (err) console.log("ASYNC BADGE ERROR: %s", err);

						feed.save(function (err) {		
							if (err) {
								console.log("-------------------");
								console.log("Feed ranking save error! / " + err);
								console.log("-------------------");
							} else {
								console.log("Ranking data saved for %s.", feed.title);
							}

							callback();

							// Release feed alias
							feed = null;
							entries = null;
						});

					});

				});
			} else {
				callback();

				// Release feed alias
				feed = null;
				entries = null;
			}
		}], function (err) {
			if (err) console.log(err);
			callback();
		});
	});

	FeedSchema.index({ rank: 1 }); // schema level
	FeedSchema.index({ 'entries.entryPublishDate': 1 }); // schema level
	FeedSchema.index({ categories: 1 }); // schema level
	FeedSchema.index({ rankedCategories: 1 }); // schema level
	FeedSchema.index({ 'rankedCategories.categoryId': 1 }); // schema level
	
	return mongoose.model('Feed', FeedSchema, 'feeds');
}