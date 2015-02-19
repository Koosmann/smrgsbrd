///////////
// Entry //
///////////

module.exports = function (s3, mongoose, request, im, url, jsdom, cheerio, async, memwatch, _) {
	
	var EntrySchema = new mongoose.Schema({ 
		// ID
		id: { type: mongoose.Schema.Types.ObjectId },

		feedId: { type: mongoose.Schema.Types.ObjectId },
		
		url: { type: String, required: true, unique: true }, // IMPORTANT: Do NOT delete or modify this field // This is the url to the post (if origLink -> else link)

		link: { type: String, required: true, unique: true },  // IMPORTANT: Do NOT delete or modify this field // This is the link specified in the RSS data // Use this for creating mash up bc guid is technically optional
		guId: { type: String, required: true, unique: true },  // IMPORTANT: Do NOT delete or modify this field // This is the guid specified in the RSS data

		publishDate: Date,
		
		title: { type: String, trim: true },

		author: String,
		
		content: String,
		text: String,

		original: { type: Object, required: true }, // IMPORTANT: Do NOT delete or modify this field 

		parser: { type: String, default: "Feedparser 0.16.1" },
		generator: { type: String, default: "unknown"},
		
		images: [{ 	url: String, 
					large2xThumbnail: { url: String, height: Number, width: Number },
					largeThumbnail: { url: String, height: Number, width: Number },
					smallThumbnail: { url: String, height: Number, width: Number },
					height: Number, 
					width: Number,
					entryId: { type: mongoose.Schema.Types.ObjectId },
					entryUrl: String,
					entryTitle: String,
					entryPublishDate: String
				}],
		
		smallPreview: [{ url: String, height: Number, width: Number, relSize: String }],
		normalPreview: [{ url: String, height: Number, width: Number, relSize: String }],
		largePreview: [{ url: String, height: Number, width: Number, relSize: String }],

		// Date added
		dateAdded: { type: Date, default: Date.now() }
	});
	
	EntrySchema.method('processContent', function processContent(callback) {
		//console.log('###### start process ######');
		//var hd = new memwatch.HeapDiff();

		var entry = this;

		var $ = cheerio.load('<span>' + entry.original.description + '</span>');

		$("img").each(function (index, img) { 
			console.dir("IMAGE: " + $(this).attr('src') + " / INDEX: " + index);
			if ($(this).attr('src') !== undefined)
				if($(this).attr('src').length <= 2000)
					entry.images.push({ url: $(this).attr('src') });
		});

		_.each(entry.original.enclosures, function (elm) {
			console.log("ENCLOSURE DETECTED");
			console.dir(elm);
			if (elm.url !== undefined && elm.type !== undefined) {
				if (elm.url != null && (elm.type == 'image/jpeg' || elm.type == 'image/jpg' || elm.type == 'image/png' || elm.type == 'image/gif' || elm.url.substr(elm.url.length - 4) == '.jpg' || elm.url.substr(elm.url.length - 4) == '.jpeg' || elm.url.substr(elm.url.length - 4) == '.png' || elm.url.substr(elm.url.length - 4) == '.gif')) {
					if (_.findWhere(entry.images, {url: elm.url}) == null) {
						entry.images.push({ url: elm.url });
					} else {
						console.log("DUPOLICATE ENCLOSURE DETECTED");
					}
				}
			}
		});

		_.each(entry.images, function (elm, i, list) {
			if (elm.url.charAt(0) == '/' && elm.url.charAt(1) != '/') {
				var link = entry.original.meta.link;

				if (link.slice(-1) == '/') link = link.slice(0, -1);
				list[i].url = link + elm.url;
			} else if (elm.url.charAt(0) == '/' && elm.url.charAt(1) == '/') {
				list[i].url = "http:" + elm.url;
			}
		});
		
		//this.text = $("body").text();

		/*console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP");

		var diff = hd.end();
		console.dir(diff);

	    _.each(diff.change.details , function (elm) {
	    	console.dir(elm);
	    });
	    console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP");*/
		
		entry = null;
		$ = null;
		//console.log('###### end process ######');
		callback(null);		
		
		/*jsdom.env({
			html: '<span>' + this.content + '</span>',
			scripts: ['http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js'],
			done: function (errors, window) {
				if (errors)
					console.log(errors);
				
				//var $ = window.$;
				
				window.$("img").each(function (index, img) { 
					//console.dir("IMAGE: " + img.src + " / INDEX: " + index);
					entry.images.push({ url: img.src });
				});
								
				window.$("img").remove();
				window.$("br").replaceWith(" ");
				window.$("div").contents().unwrap();
				window.$("span").contents().unwrap();
				window.$("a").contents().unwrap();
				
				entry.text = window.$("body").text();

				// Clear variables
				window.close();

				console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP");

				var diff = hd.end();
				console.dir(diff);

			    _.each(diff.change.details , function (elm) {
			    	console.dir(elm);
			    });
			    console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP");
				
				//console.log('###### end process ######');
				callback(null);				
			}
		});*/
	});
	
	EntrySchema.method('sizeImages', function sizeImages(callback) {
		//console.log('@@@@@@ start sizing @@@@@@');

		async.eachSeries(this.images, function (image, callback) {
			var valid = false,
				encoded = false,
				imageUrl = image.url;

			async.doUntil(
			    function (callback) {
			        im(imageUrl).identify(function (err, value) {
			        	if (err) {
			        		console.log("IDENTIFY IMAGE ERROR (doUntil 1): %s", err);

			        		/*if (imageUrl.match(/ /g)) {
			        			//console.log("DETECTED SPACES");
			        			imageUrl = imageUrl.replace(/ /g, '%20');
			        		} else*/ if (imageUrl.match(/'/g)) {
			        			//console.log("DETECTED APOSTROPHES");
			        			imageUrl = imageUrl.replace(/'/g, '%29');
			        		} else if (encoded == false) {
			        			console.log("TRYING ESCAPING");
			        			imageUrl = imageUrl.substr(0, imageUrl.indexOf('/', 8)) + encodeURI(imageUrl.substr(imageUrl.indexOf('/', 8)));
			        			encoded = true;
			        		} else {
			 	       			valid = true;
			        		}

			        	} else {
			        		valid = true;
			        	}

			        	callback();
			        });
			    },
			    function () { return valid; },
			    function (err) {
			        im(imageUrl).identify(function (err, value) {
						if (err) {
							console.log("IDENTIFY IMAGE ERROR (doUntil complete): %s", err);
						
							image.width = null;
							image.height = null;
						} else {
							image.width = value.size.width;
							image.height = value.size.height;

							if (value.format == 'gif' || value.format == 'GIF') {
								if (image.width != value['Page geometry'].substr(0, value['Page geometry'].indexOf('x')) && isNaN(value['Page geometry'].substr(0, value['Page geometry'].indexOf('x'))) == false) image.width = parseInt(value['Page geometry'].substr(0, value['Page geometry'].indexOf('x')));
								if (image.height != value['Page geometry'].substring(value['Page geometry'].indexOf('x')+1, value['Page geometry'].indexOf('+')) && isNaN(value['Page geometry'].substring(value['Page geometry'].indexOf('x')+1, value['Page geometry'].indexOf('+'))) == false) image.height = parseInt(value['Page geometry'].substring(value['Page geometry'].indexOf('x')+1, value['Page geometry'].indexOf('+')));
								
								console.log("GIF DETECTED");
								console.dir(value['Page geometry']);
								console.dir(value.width);
								console.dir(value.height);
								console.dir(image);
							}
						}
						
						//console.log('@ end @ %s', image.url);
						callback();					
					});
			    }
			);
		}, function (err) {
			if (err)
				console.log("ASYNC SIZE IMAGES ERROR: %s", err);
			
			//console.log('@@@@@@ end sizing @@@@@@');
			callback(null);	
		});
	});
	
	EntrySchema.method('organizeImages', function (callback) {
		console.log('###### start organizing ######');							
		
		for (var x=0; x < this.images.length; x++) {
			console.log(this.images[x].small);
			console.log(this.images[x].normal);
			console.log(this.images[x].large);

			if (this.images[x].width == null) {
				var smallSmall = _.clone(this.images[x]);
				smallSmall.relSize = 'smallSmall';
				this.smallPreview.push(smallSmall);
				
				var normalNormal = _.clone(this.images[x]);
				normalNormal.relSize = 'normalNormal';
				this.normalPreview.push(normalNormal);
				
				var largeLarge = _.clone(this.images[x]);
				largeLarge.relSize = 'largeLarge';
				this.largePreview.push(largeLarge);
				
			} else {
				if (this.images[x].small.url != null) {
					var smallSmall = _.clone(this.images[x].small);
					smallSmall.relSize = 'smallSmall';
					this.smallPreview.push(smallSmall);
					
					var normalSmall = _.clone(this.images[x].small);
					normalSmall.relSize = 'normalSmall';
					this.normalPreview.push(normalSmall);
					
					var largeSmall = _.clone(this.images[x].small);
					largeSmall.relSize = 'largeSmall';
					this.largePreview.push(largeSmall);
				}
				
				if (this.images[x].normal.url != null) {
					var normalNormal = _.clone(this.images[x].normal);
					normalNormal.relSize = 'normalNormal';
					this.normalPreview.splice(x, 1, normalNormal);
					
					var largeNormal = _.clone(this.images[x].normal);
					largeNormal.relSize = 'largeNormal';
					this.largePreview.splice(x, 1, largeNormal);
				}
				
				if (this.images[x].large.url != null) {
					var largeLarge = _.clone(this.images[x].large);
					largeLarge.relSize = 'largeLarge';
					this.largePreview.splice(x, 1, largeLarge);
				}
			}
		}
		
		callback();					
	});
	
	EntrySchema.method('compressImages', function (callback) {
		var entry = this;

		var q = async.queue(function (task, callback) {
		    console.log('image: %s / size: %d ', task.image.url, task.height);

			switch (task.height) {
				case 150:
					var size = 'smallThumbnail';
					break;
				case 300:
					var size = 'largeThumbnail';
					break;
				case 600:
					var size = 'large2xThumbnail';
					break;
			}
													
			var compressedImage = {};
									
			if (task.image.height && task.image.height >= task.height) {
			
				var width = (task.image.width * task.height) / task.image.height;
				
				//console.log('IMAGE ABOUT TO LOAD');
				
				//console.log('^ start ^');

				var valid = false,
					encoded = false,
					imageUrl = task.image.url;

				// Clean URL until it's usable
				async.doUntil(function (callback) {
			        im(imageUrl).identify(function (err, value) {
			        	if (err) {
			        		console.dir("IDENTIFY IMAGE (COMPRESS IMAGES) ERROR: %s", err);

			        		/*if (imageUrl.match(/ /g)) {
			        			//console.log("DETECTED SPACES");
			        			imageUrl = imageUrl.replace(/ /g, '%20');
			        		} else*/ if (imageUrl.match(/'/g)) {
			        			//console.log("DETECTED APOSTROPHES");
			        			imageUrl = imageUrl.replace(/'/g, '%29');
			        		} else if (encoded == false) {
			        			console.log("TRYING ESCAPING");
			        			imageUrl = imageUrl.substr(0, imageUrl.indexOf('/', 8)) + encodeURI(imageUrl.substr(imageUrl.indexOf('/', 8)));
			        			encoded = true;
			        		} else {
			 	       			valid = true;
			        		}

			        	} else {
			        		valid = true;
			        	}

			        	callback();
			        });
			    },
			    function () { return valid; },
			    function (err) {
		
					request(imageUrl, function(err, res, body) {
						if (err)
							console.log("IMAGE REQUEST (COMPRESS IMAGES) ERROR: %s", err);
						
						if (!err && res.statusCode == 200 && body) {
							console.log("-- REQUEST: %s / %s --", imageUrl, size);
							//console.dir(body);
					
							var pathname = url.parse(imageUrl).pathname;
							var filename = pathname.substring(pathname.lastIndexOf("/") + 1);
							var filenameNoFormat = filename.substring(0, filename.lastIndexOf("."));
							var format = filename.substring(filename.lastIndexOf(".") + 1);

							// Need to eventually prevent weird extensions - probably should use the 'content-type' in the header
							//if (format != 'gif' && format != 'png' && format != 'jpg' && format != 'jpeg' && format != 'tif') format = '';

							// If not a GIF
							var coalesce = false,
								formatType,
								contentType;

							if (res.headers['content-type'] == 'image/gif') {
								format = 'gif';
								formatType = 'gif';
								contentType = 'image/gif';

								coalesce = true;

							} else if (res.headers['content-type'] == 'image/png') {
								format = 'png';
								formatType = 'png';
								contentType = 'image/png';

							} else {

								// By default, make it a JPG

								format = 'jpg';
								formatType = 'jpeg';
								contentType = 'image/jpeg';
							}

							console.log("IMAGE FORMAT / HEADER: %s - FORMAT: %s - FORMAT TYPE: %s - CONTENT TYPE: %s", res.headers['content-type'], format, formatType, contentType)
							
							if (format != '') var hasFormat = '.';
							else var hasFormat = '';

							/*if (format == 'gif') var coalesce = true;
							else var coalesce = false;*/

							var compressedImageUrl = '/preview-images/' + entry.feedId + "/" + entry._id + '_' + task.index + '_' + task.height + hasFormat + format;

							var imageNotEmpty = false,
								tries = 0,
								maxTries = 3,
								compressedImageFile = '';

							// Try resizing image a given number of times until success
							async.doUntil(function (callback) {

								tries++;

								im(request(imageUrl))[coalesce ? 'coalesce' : 'quality'](92).resize(width, task.height).setFormat(formatType).stream(function (err, stdout, stderr) {
									//console.log('IMAGE RESIZE');
									
									if (err) {
										console.log('COMPRESSION ERROR: ' + err);
										entry.images[task.index][size] = null;

										callback();
									}
											
									var imageData = [];
							
									stdout.on('data', function (data) {
										imageData.push(data);
									});
									
									stdout.on('error', function (err){
										console.log('IMAGE RESIZE ERROR: ' + err);
										entry.images[task.index][size] = null;

										callback();
										imageData = null;
									});
							
									stdout.on('close', function () {
										console.log('^ end ^');
										
										compressedImageFile = Buffer.concat(imageData);
										
										console.log("-- RESIZE: %s /  --", imageUrl, size);
										//console.dir(imageData);
										console.log("-");
										//console.dir(compressedImageFile);

										imageData = null;
							
										//console.log("SAVE TO S3");
										//console.log("URL: " + compressedImageUrl);
										console.log("SAVE TO S3 / LENGTH: %d / TYPE: %s / %s", compressedImageFile.length, contentType, compressedImageUrl);
										console.log("RESIZE IMAGE - %s / width - %d / height - %s / coalesce - %s", imageUrl, width, task.height, coalesce);
										//console.log("LENGTH: %d", Buffer.concat(imageData).length);
										//console.log("TYPE: %s", res.headers['content-type']);

										callback();
									});
								});

							},
						    function () { return (compressedImageFile.length > 0 || tries >= maxTries); },
						    function (err) {

						    	if (compressedImageFile.length > 0) {
						    		console.log("SAVING TO S3 / TRY: %s/%s / LENGTH: %d / TYPE: %s / %s", tries, maxTries, compressedImageFile.length, contentType, compressedImageUrl);

									var callbackCalled = false;
						
									// Build S3 request object
									var req = s3.put(compressedImageUrl, {
										'Content-Length' : compressedImageFile.length,
										'Content-Type' : contentType,
										'x-amz-acl': 'public-read'
									});
									
									// Handle S3 error
									req.on('error', function (err){
										console.dir(err);
										if (err.stack !== undefined) console.dir(err.stack);
										else console.log("No error stack :(");
										console.log('S3 SAVE ERROR: ' + err + ' / ' + compressedImageUrl);
										//if (entry) entry.images[task.index][size] = null;

										if (!callbackCalled) {
											if (entry) entry.images[task.index][size] = null;
											callbackCalled = true;
											callback();
										}
									});
						
									// Handle S3 Response
									req.on('response', function (res) {  //prepare 'response' callback from S3
										
										console.log(res.statusCode);
										
										if (200 == res.statusCode) {
											console.log('it worked for %s / TRY: %s/%s', req.url, tries, maxTries);
										
											if (!callbackCalled) {
												compressedImage.url = req.url;
												compressedImage.height = task.height;
												compressedImage.width = width;
												
												entry.images[task.index][size] = compressedImage;
												
												console.log('IMAGE OPTIMIZED');

												callbackCalled = true;
												callback();
											}

										} else {
											console.log("it DIDN'T work");
											if (!callbackCalled) {
												entry.images[task.index][size] = null;
												callbackCalled = true;
												callback();
											}
										}

										compressedImageFile = null;
										console.log('END OF S3 SAVE');

									});
								  
									req.end(compressedImageFile);  //send the content of the file and an end

									/*compressedImage.url = compressedImageUrl;
									compressedImage.height = task.height;
									compressedImage.width = width;

									console.log(task.index);
									console.log(size);
									
									entry.images[task.index][size] = compressedImage;

									//console.dir(entry);

									callback();*/
								} else {
									console.log('Max tries reached: %s', compressedImageUrl);
									entry.images[task.index][size] = null;
											
									callback();
								}
							});
						} else {
							console.log('Request error: %s', compressedImageUrl);
							entry.images[task.index][size] = null;
								
							callback();
						}
					});
				});
			} else {
				entry.images[task.index][size] = null;
								
				callback();	
			}
			//});
				
			/*} else {
				entry.images[task.index][size] = null;
								
				callback();
			}*/

		}, 1);

		q.drain = function() {
		    console.log('all items have been processed');

		    entry = null;
		    console.log("DEALLOC ENTRY - %s", entry);

		    callback();
		}

		console.log('^^^^^^ start compressing ^^^^^^');

		if (entry.images.length > 0) {
			_.each(entry.images, function (image, index) {
				_.each([150, 300, 600], function (height) {
					//console.log('^^^ start %s ^^^', width);
					
					q.push({image: image, height: height, index: index}, function (err) {
						console.log('finished from queue');
					});

					console.log('added to queue');

				});
			});
		} else {
			console.log('no images!');

			entry = null;

		    callback();
		}
	});

	/*EntrySchema.post('save', function (entry) {
		console.log('******Saving entries for %s', entry._id);

		var feedEntry = {};

		feedEntry.id = entry._id;
		feedEntry.url = entry.url;
		feedEntry.title = entry.title;
		feedEntry.images = entry.images;

		Feed.findOneAndUpdate({});

	})*/

	EntrySchema.index({ feedId: 1, publishDate: -1 }); // schema level
	
	return mongoose.model('Entry', EntrySchema);
}