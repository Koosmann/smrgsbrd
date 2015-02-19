////////////
// Models //
////////////

module.exports = function (s3, mongoose, request, im, url, jsdom, bcrypt, _) {

	var feeds = {};
	
	return {	
		
	feeds: function () { return feeds; },
	
	feed: function (usersOnline, link, feedSchema, entrySchema) {
		var that = this;
		
		this.link = link;
		this.readers = [];
		this.content = [];
		this.numOfUpdates = 0;
		this.loading = false;
		this.loadRequests = [];
		
		this.addReader = function (reader) {
			if (this.readers.indexOf(reader) < 0) {
				this.readers.push(reader);
			}
		}
		
		//////////////////////////
		// Handle Load Requests //
		//////////////////////////
		
		// Route load requests by type of request and load state
		this.handleLoadRequest = function (loadRequest, fromQueue) {
			console.log("HANDLE LOAD REQUEST");
			console.dir(loadRequest);
			
			if (that.loading) {
				that.loadRequests.push(loadRequest);
				
				console.log("LOADING ALREADY");
				console.dir(that.loadRequests);
			} else {
				if (fromQueue) {
					console.log("REMOVE REQUEST FROM QUEUE");
					that.loadRequests.splice(0, 1);
				}
					
				that.setLoadingState(true);
				
				switch (loadRequest.type) {
					case 'init':
						// Add feed to user's reading list
						usersOnline[loadRequest.user].user.feeds.push(that.link);
						
						// Add user to feed's reader list
						that.addReader(loadRequest.user);
						that.initializeContent(loadRequest.user, function () {
							console.log("LOADING DONE");
							console.dir(that.loadRequests);
							that.setLoadingState(false);
						});
	
						break;					
					case 'more':
						
						console.log("MORE");
								
						that.addContent(loadRequest.lastEntry, loadRequest.user, function () {
							console.log("LOADING DONE");
							console.dir(that.loadRequests);
							that.setLoadingState(false);
						});
						
						break;
				}
			}
		}
		
		// Set loading state to prevent 'thread' collisions
		// TRUE: suspends all incoming requests until loading is finished
		// FALSE: allows new loading requests and handles other suspended requests
		this.setLoadingState = function (loadState) {
			switch (loadState) {
				case true:
					that.loading = true;
					break;
				case false:
					that.loading = false;
					
					console.log("NOT LOADING ANYMORE");
					console.dir(that.loadRequests);
					
					if (that.loadRequests.length > 0) {
						console.log("LOAD FROM QUEUE");
						console.dir(that.loadRequests);
						that.handleLoadRequest(that.loadRequests[0], true);
					}
					
					break;
			}
		}
		
		//////////////////////////
		// Content Send/Receive //
		//////////////////////////
		
		// Send certain content to a select set of recipients
		this.emit = function (event, content, recipients) {
			console.log("++++++++++");
			console.log('SEND CONTENT: ' + event);
			console.log('TO: ');
			console.dir(usersOnline);
			console.log("++++++++++");
			for (var i=0; i<content.length; i++) {
				console.log(content[i].link);
			}
			console.log("++++++++++");
			
			// CRASH WARNING: Sometimes users get booted from the list unexpectedly (possibly from putting computer in and out of sleep)
			if (recipients instanceof Array) {
				console.log('MULTIPLE RECIPIENTS');
				console.dir(recipients);
				
				for (var i=0 ; i < recipients.length ; i++) {
					for (var x=0 ; x < usersOnline[recipients[i]].sockets.length ; x++) {
						var socket = usersOnline[recipients[i]].sockets[x];
						socket.emit(event, content);
					}
				}	
			} else {
				console.log('ONE RECIPIENTS');
				console.dir(recipients);
				
				for (var x=0 ; x < usersOnline[recipients].sockets.length ; x++) {
					var socket = usersOnline[recipients].sockets[x];
					socket.emit(event, content);
				}
			}
		}
		
		// Load feeds from the API
		this.load = function (length, callback) {
			console.log("Loading " + length + " posts.");
			https.get("https://ajax.googleapis.com/ajax/services/feed/load?q=" + that.link + "&v=1.0&scoring=h&num=" + length, function(res) {
				console.log("Got response: " + res.statusCode);
				
				var output = '';
				
				res.on("data", function(chunk) {			
					output += chunk;
				});
				
				res.on('end', function() {
					if (JSON.parse(output).responseData) {
						// WARNING: Check response first to see if it's even there.
						var entries = JSON.parse(output).responseData.feed.entries;
						
						return callback(entries);
						
					}
				});
			}).on('error', function(e) {
				console.log("Got error: " + e.message);
			});
		}
		
		/////////////////////////
		// Content Preparation //
		/////////////////////////
		
		// Prepares any set of content for end users
		this.prepareContent = function (entries, i, callback) {	
			that.dealWithHTML(entries, 0, function (newEntries) {
				that.sizeImages(newEntries, 0, 0, function (cleanEntries) {	
					that.compressImages(cleanEntries, 0, 0, 'small', function (optimizedEntries1) {
						that.compressImages(optimizedEntries1, 0, 0, 'normal', function (optimizedEntries2) {
							that.compressImages(optimizedEntries2, 0, 0, 'large', function (optimizedEntries3) {
								that.organizePreviews(optimizedEntries3, function (organizedEntries) {
									return callback(organizedEntries);
								});
							});
						});
					});
				});
			});
		}
		
		// Download images (for use in optimizing images)
		this.loadImage = function (link, callback) {
			// WARNING: Block where protocol is checked untested
			var protocol = http;
			
			if (url.parse(link).protocol == 'https:')
				protocol = https;
			
			console.log("URL PROTOCOL: " + url.parse(link).protocol);
			console.log("PROTOCOL CHECK: " + protocol);
			
			protocol.get(link, function(res) {
				console.log("Got response: " + res.statusCode);
				res.setEncoding('binary');
				var output = '';
				
				res.on("data", function(chunk) {			
					output += chunk;
				});
				
				res.on('end', function() {
					return callback(output);
				});
			}).on('error', function(e) {
				console.log("Got error: " + e.message);
			});
		}
		
		// Create text preview & make sure text is free of unnecessary styles & escaped
		this.dealWithHTML = function (content, i, callback) {
			var rawContent = '<span>' + content[i].content + '</span>';
			content[i].images = [];
			
			jsdom.env({
				html: rawContent,
				scripts: ["http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"],
				done: function (errors, window) {
					if (errors)
						console.log(errors);
					
					var $ = window.$;
					
					$("img").each(function (index, img) { 
						console.dir("IMAGE: " + img.src + " / POST: " + i);
						content[i].images[index] = {};
						content[i].images[index].url = img.src;
					});
									
					console.log('#############');
					$("img").remove();
					$("br").replaceWith(" ");
					$("div").contents().unwrap();
					$("span").contents().unwrap();
					$("a").contents().unwrap();
					console.log('#############');
					
					content[i].text = $("body").text();
					
					if (i >= content.length - 1) {
						return callback(content);
					} else {
						that.dealWithHTML(content, i + 1, callback)
					}
				}
			});
		}
		
		this.sizeImages = function (content, i, x, callback) {
			im(content[i].images[x].url).identify(function (err, value) {
			console.log("IDENTIFYING IMAGE: " + x + " of " + content[i].images.length + " in POST: " + i + " of " + content.length );
				
				if (err)
					console.dir(err);
				
				content[i].images[x].width = value.size.width;
				content[i].images[x].height = value.size.height;
				
				console.dir(content[i].images[x]);
				
				//console.dir(value);
				console.log("@@@@@@@@@@@@@@");
			
				if (i >= content.length - 1 && x >= content[i].images.length - 1) {
					return callback(content);
				} else {
					var nextEntry = i;
					var nextImage = x + 1;
					
					if (content[i].images.length - 1 == x) {
						nextEntry = i + 1;
						nextImage = 0;
					}
					
					that.sizeImages(content, nextEntry, nextImage, callback)
				}
			});
		}
		
		// Optimize images to ease the burden on the front end
		// WARNING: Is this the best way to construct this function?  Need to make it DRYer
		// WARNING: This doesn't work consistently with Animated GIFs, resize issues (too skinny or not all frames resizing)
		this.compressImages = function (content, i, x, size, callback) {
			console.log("COMPRESSING '" + size + "' IMAGE: " + x + " of " + content[i].images.length + " in POST: " + i + " of " + content.length );
			
			if (content[i].images.length > 0) {
				var pathname = url.parse(content[i].images[x].url).pathname;
				var filename = pathname.substring(pathname.lastIndexOf("/") + 1);
				var filenameNoFormat = filename.substring(0, filename.lastIndexOf("."));
				var format = filename.substring(filename.lastIndexOf(".") + 1);
				
				if (x == 0)
					content[i][size] = [];
					
				content[i][size][x] = {};
					
				switch (size) {
					case 'small':
						var width = 100;
						break;
					case 'normal':
						var width = 300;
						break;
					case 'large':
						var width = 600;
						break;
				}
					
				if (content[i].images[x].width >= (width - 100) && content[i].images[x].width != 0) {
				
					var height = (content[i].images[x].height*width)/content[i].images[x].width;
					
					console.log('IMAGE ABOUT TO LOAD');
					
					http.get(content[i].images[x].url, function (res) {
						console.log('IMAGE LOADING');
						
						res.on('error', function (err){
							console.log('IMAGE LOAD ERROR: ' + err);
						});
						
						im(res).resize(width, height).coalesce().stream(function (err, stdout, stderr) {
							console.log('IMAGE RESIZE');
							
							if (err)
								console.log('COMPRESSION ERROR: ' + err);
									
							var imageData = [];
					
							stdout.on('data', function (data) {
								imageData.push(data);
							});
							
							stdout.on('error', function (err){
								console.log('IMAGE RESIZE ERROR: ' + err);
							});
					
							stdout.on('close', function () {
								var image = Buffer.concat(imageData);
								
								console.log("SAVE TO S3");
								console.log("URL: " + '/images/' + filenameNoFormat + '_' + size + '.' + format);
								console.log("LENGTH: %d", image.length);
								console.log("TYPE: %s", res.headers['content-type']);
					
								var req = s3.put('/images/' + filenameNoFormat + '_' + size + '.' + format, {
									'Content-Length' : image.length,
									'Content-Type' : res.headers['content-type'],
									'x-amz-acl': 'public-read'
								});
								
								req.on('error', function (err){
									console.log('S3 SAVE ERROR: ' + err);
								});
					
								req.on('response', function (res) {  //prepare 'response' callback from S3
									
									console.log(res.statusCode);
									
									if (200 == res.statusCode)
										console.log('it worked');
									
									content[i][size][x].url = req.url;
									content[i][size][x].height = height;
									content[i][size][x].width = width;
									
									console.log('IMAGE OPTIMIZED');
									
									if (i >= content.length - 1 && x >= content[i].images.length - 1) {
										return callback(content);
									} else {
										var nextEntry = i;
										var nextImage = x + 1;
										
										if (content[i].images.length - 1 == x) {
											nextEntry = i + 1;
											nextImage = 0;
										}
										
										that.compressImages(content, nextEntry, nextImage, size, callback)
									}
								});
							  
								req.end(image);  //send the content of the file and an end
							});
						});
					});
					
				} else {
					content[i][size].url = null;
				
					if (i >= content.length - 1 && x >= content[i].images.length - 1) {
						return callback(content);
					} else {
						var nextEntry = i;
						var nextImage = x + 1;
						
						if (content[i].images.length - 1 == x) {
							nextEntry = i + 1;
							nextImage = 0;
						}
						
						that.compressImages(content, nextEntry, nextImage, size, callback)
					}
				}
			} else {
				if (i >= content.length - 1 && x >= content[i].images.length - 1) {
					return callback(content);
				} else {
					that.compressImages(content, i + 1, 0, callback)
				}
			}
		}
		
		// Organize previews so the client doesn't need to handle any formatting logic
		this.organizePreviews = function (content, callback) {
					
			for (var i=0; i < content.length; i++) {
				content[i].smallPreview = [];
				content[i].normalPreview = [];
				content[i].largePreview = [];
				
				for (var x=0; x < content[i].images.length; x++) {
					console.log("%%%%%%%%%%%%");
					console.log("ORGANIZE IMAGE " + x + " of " + content[i].images.length + " in post " + i + " of " + content.length);
					console.log("%%%%%%%%%%%%");
				
					if (content[i].small[x].url != null) {
						var smallSmall = that.clone(content[i].small[x]);
						smallSmall.relSize = 'smallSmall';
						content[i].smallPreview.push(smallSmall);
						
						var normalSmall = that.clone(content[i].small[x]);
						normalSmall.relSize = 'normalSmall';
						content[i].normalPreview.push(normalSmall);
						
						var largeSmall = that.clone(content[i].small[x]);
						largeSmall.relSize = 'largeSmall';
						content[i].largePreview.push(largeSmall);
					}
					
					if (content[i].normal[x].url != null) {
						var normalNormal = that.clone(content[i].normal[x]);
						normalNormal.relSize = 'normalNormal';
						content[i].normalPreview.splice(x, 1, normalNormal);
						
						var largeNormal = that.clone(content[i].normal[x]);
						largeNormal.relSize = 'largeNormal';
						content[i].largePreview.splice(x, 1, largeNormal);
					}
					
					if (content[i].large[x].url != null) {
						var largeLarge = that.clone(content[i].large[x]);
						largeLarge.relSize = 'largeLarge';
						content[i].largePreview.splice(x, 1, largeLarge);
					}
				}
			}
			
			callback(content);
		}
		
		this.clone = function clone(obj) {
			// Handle the 3 simple types, and null or undefined
			if (null == obj || "object" != typeof obj) return obj;
		
			// Handle Date
			if (obj instanceof Date) {
				var copy = new Date();
				copy.setTime(obj.getTime());
				return copy;
			}
		
			// Handle Array
			if (obj instanceof Array) {
				var copy = [];
				for (var i = 0, len = obj.length; i < len; i++) {
					copy[i] = clone(obj[i]);
				}
				return copy;
			}
		
			// Handle Object
			if (obj instanceof Object) {
				var copy = {};
				for (var attr in obj) {
					if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
				}
				return copy;
			}
		
			throw new Error("Unable to copy obj! Its type isn't supported.");
		}
		
		////////////////////////
		// Content Management //
		////////////////////////
		
		// Prepare content for when a feed is first loaded
		this.initializeContent = function (recipients, callback) {
			console.log('INIT CONTENT');
			console.log('THAT.CONTENT LENGTH: ' + that.content.length);
			var content;
			
			switch (that.content.length) {
				
				case 0:
					console.log('INIT THAT.CONTENT');
					
					that.load(5, function (entries) {				
						that.prepareContent(entries, 0, function (newEntries) {	
							// Update cache
							that.content = newEntries;
							
							// Send content	
							that.emit('init content', that.content, that.readers);
							return callback();
						});
						
					});
	
					break;
				default:
					console.log('SEND FROM THAT.CONTENT');
					var content = this.content.slice(0, 5);
					that.emit('init content', content, recipients);
					
					return callback();
					break;
			}
		}
		
		// Detects new posts in feeds and mashes up the new content with the cached content
		this.refreshContent = function (callback) {
			that.load(that.numOfUpdates + 1, function (entries) {
				
				// Check to see if the feed is counting the number of updates AND if there are new posts
				if (entries.length == (that.numOfUpdates + 1) && entries[0].link != that.content[0].link) {
					
					// Check to see if it needs to keep counting updates 
					if (entries[that.numOfUpdates].link != that.content[0].link) {
						
						that.numOfUpdates++;
						
						console.log("++++++++++");
						console.log("New Posts!");
						console.log("++++++++++");
						console.log(entries[0].link);
						console.log(that.content[0].link);
						console.log("++++++++++");
						console.log(that.numOfUpdates);
						console.log("++++++++++");
						for (var i=0; i < entries.length; i++) {
							console.log(entries[i].link);
						}
						console.log("++++++++++");
						
						that.refreshContent(callback);
	
					// Check to see if it's reached the end of the updates 
					} else if (that.numOfUpdates) {
						console.log("++++++++++++++++++++++++++++++++++++++");
						console.log("There are " + (entries.length - 1) + " new posts!");
						console.log("There are " + that.numOfUpdates + " updates!");
						console.log("++++++++++++++++++++++++++++++++++++++");
						
						console.log("++++++++++++++++++++++++++++++++++++++");
						for (var i=0; i<entries.length; i++) {
							console.log(entries[i].link);
						}
						console.log("++++++++++++++++++++++++++++++++++++++");
						
						entries = entries.splice(0, that.numOfUpdates);
						
						console.log("++++++++++++++++++++++++++++++++++++++");
						for (var i=0; i<that.content.length; i++) {
							console.dir(that.content[i].link);
						}
						console.log("++++++++++++++++++++++++++++++++++++++");
						
						that.numOfUpdates = 0;
						
						// Send the new content
						
						console.log("START PREPARE CONTENT");				
						that.prepareContent(entries, 0, function (newEntries) {	
								console.log("PREPARE CONTENT CALLBACK");
									
								// Update cache
								that.content = newEntries.concat(that.content);
							
								// WARNING: This might not account for people who miss an update bc their internet connection is shoddy
								that.emit('new content', newEntries, that.readers);
								return callback();
						});					
					}
					
				// There are no updates in this case
				} else {
					console.log("----------");
					console.log("No new posts.");
					console.log("----------");
					for (var i=0; i<entries.length; i++) {
						console.log(entries[i].link);
					}
					console.log("----------");
					console.log(entries[that.numOfUpdates].link);
					console.log(that.content[0].link);
					console.log("----------");
					
					that.numOfUpdates = 0;
					
					return callback();
				}
			});
		}
		
		// WARNING: Need to account for new requests before callback is received
		this.addContent = function (lastEntry, recipients, callback) {
			
			console.log('ADD CONTENT');
			console.log(lastEntry);
			
			// Check if more posts are available in the cache
			for (var i=0; i < that.content.length; i++) {
				if (that.content[i].link == lastEntry) {
					var entriesLeft = that.content.length - (i + 1);
					console.log("ENTRIES LEFT: " + entriesLeft);
					
					if (entriesLeft < 5) {
						console.log('LOAD MORE');
						
						// Check for new posts to retain order
						that.refreshContent(function () {
							console.log("REFRESH COMPLETE -> NOW ADD CONTENT");
							that.load(that.content.length + 5, function (content) {
								
								content = content.slice(that.content.length);
								
								// WARNING: Need to process content/imagery first
								that.prepareContent(content, 0, function (newEntries) {	
									// Update cache
									that.content = that.content.concat(newEntries);
									
									// Isolate content for user & send
									// WARNING: Need to test
									for (var x=0; x < that.content.length; x++) {
										if (that.content[x].link == lastEntry) {
											var moreContent = that.content.slice(x + 1, x + 6);
									
											that.emit('more content', moreContent, recipients);
									
											return callback();
										}
									}
								});
								
							});
						});
					} else {
						console.log('MORE FROM CACHE');
						
						// Send the next five from stored content based on the end of the user's feed
						for (var i=0; i < that.content.length; i++) {
							if (that.content[i].link == lastEntry) {
								
								var moreContent = that.content.slice(i + 1, i + 6);
								that.emit('more content', moreContent, recipients);
								
								return callback();
							}
						}
					}
				}
			}
		}
		
		this.saveContent = function (content) {
			var feed = feedSchema;
			console.log("--------");
			console.log("save content");
			console.log("--------");
					
			feed.findOne({ url: that.link }, function(err, feed) {
				if (err) {
					console.log("--------");
					console.log("feed not found / " + err);
					console.log("--------");
				}
				
				if (feed) {
					console.log("++++++++");
					console.log("found feed");
					console.log("++++++++");
				
					for (var i=0; i < content.length; i++) {
						var entry = entrySchema;
						
						entry.url = content[i].url;
						
						entry.title = content[i].title;
						
						entry.content = content[i].content;
						entry.text = content[i].text;
						
						entry.images = content[i].images;
						entry.smallPreview = content[i].smallPreview;
						entry.normalPreview = content[i].normalPreview;
						entry.largePreview = content[i].largePreview;
						
						console.log("--------");
						console.log("entry added");
						console.log("--------");
						
						feed.entries.push(entry);
					}
					
					feed.save(function (err) {		
						if (err) {
							console.log("-------------------");
							console.log("Feed save error! / " + err);
							console.log("-------------------");
							return;
						}
						
						// Send success code		
						console.log('entry save success');
					});
					
				} else {
					console.log("--------");
					console.log("feed not found");
					console.log("--------");
				}
			});
		}
		
		this.remove = function () {
			clearInterval(checkForNew);
		};
		
		var checkForNew = setInterval( function () {
			console.log("Checking for updates.")
			that.refreshContent(function () { 
				console.log('PERIODIC POST REFRESH COMPLETE');
			});
		}, 60000*10);
	}
	}
}
	
