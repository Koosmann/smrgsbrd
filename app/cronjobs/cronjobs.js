///////////////
// Cron Jobs //
///////////////

module.exports = function (cron, async, _, Feed, memwatch, email, env, Activity, Email, Collection) {
	
	//////////////////
	// Feed Updater //
	//////////////////
	memwatch.gc();

	var q, startTime, query, killProcess,
		shutdown = false,
		isLoading = false;

	process.once("SIGINT", function () {

		console.log("SIGINT!!!!!");

		killProcess = function () {
			console.log("Safe shutdown complete.");
			process.exit(0);
		}
 
		// Cleanup activities go here...
		if (isLoading) {
			console.log("SIGINT WHILE LOADING!");
			shutdown = true;
		} else {
			// Then shutdown.
			console.log("SIGINT WHILE NOT LOADING!");
			killProcess();
		}
	});

	function runUpdates() {
		//var hd = new memwatch.HeapDiff();

		startTime = Date.now();
		isLoading = true;

	    console.log('Checking for updates: %d', startTime);

	    async.series([function (callback) {
	    	console.log("BEGIN FEED UPDATES");

		    Feed.find({}, 'id', function (err, feeds) {
		    	if (err) {
		    		console.log("Error retrieving feeds: ", err);
		    		return;
		    	}

		    	q = async.queue(function (feedId, callback) {
		    		console.log("Start updating: %s", feedId._id);
		    		
		    		if (!shutdown) {
			    		Feed.find({_id: feedId._id}, 'feedUrl title imagePreview dateAdded lastPublished' /*entries'*/, function (err, feed) {
							if (err) {
					    		console.log("Error retrieving feed: ", err);
					    		return;
					    	}

					    	feed = feed[0];
				    		console.log('%s added to queue.', feed.title);
				    		feed.updateEntries(function (response) {
				    			console.log('%s is done updating entries.', feed.title);
				    			console.log(response);
				    			
				    			feed.updateLastPublished(function () {
									feed.updateRank(function () {
										feed.updateClicks(function () {
											feed.updateImagePreview(function () {
												console.log("FEED FINISHED");
												feed = null;
												//memwatch.gc();
												callback();
											});
										});
									});
								});
				    		});
				    	});
				    } else {
				    	console.log("Skipping because SIGINT was received.");
				    	callback();
				    }
		    	}, 1);


		    	q.drain = function() {
				    console.log('FEED UPDATES COMPLETE - %d seconds.', startTime, (Date.now()-startTime)/1000);
				    //isLoading = false;
				    callback();
				    //memwatch.gc();

				    if (shutdown) {
				    	killProcess();
				    }
				}

				_.each(feeds, function (feed, index) {
					q.push(feed, function (err) {
						console.log('%s finished from queue.', feed._id);		
					});
				});
		    });
		}, function (callback) {
			console.log("BEGIN COLLECTION UPDATES");
			// Update collections previews here...

			Collection.find({}, 'id', function (err, collections) {
				if (err) {
		    		console.log("Error retrieving collections: ", err);
		    		return;
		    	}

		    	// Define tasks in queue
		    	q = async.queue(function (collectionId, callback) {
				    console.log(collectionId._id);
				    
				    Collection.find({_id: collectionId._id}, 'feeds title imagePreview imagePreview2', function (err, collection) {
						if (err) {
				    		console.log("Error retrieving collection: ", err);
				    		return;
				    	}

				    	collection = collection[0];
			    		console.log('%s added to queue.', collection.title);
			    		collection.updateImagePreview(function () {
							console.log("COLLECTION FINISHED");
							collection = null;

							callback();
			    		});
			    	});

		    	}, 1);

		    	// Define what happens when the queue is finished
		    	q.drain = function() {
				    console.log('COLLECTION UPDATES COMPLETE - %d seconds.', startTime, (Date.now()-startTime)/1000);

				    callback();
				}

				// Put things into the queue
				_.each(collections, function (collection, index) {
					q.push(collection, function (err) {
						console.log('%s finished from queue.', collection._id);		
					});
				});
			})

			callback();
		}], function (err) {
			if (err) console.log("RUN UPDATES ASYNC ERROR - %s", err);

			isLoading = false;
			console.log('ALL UPDATES COMPLETE - %d seconds.', startTime, (Date.now()-startTime)/1000);
		});
	}

	new cron('00 */10 * * * *', function () {  // Every 10 minutes
	    if (!isLoading) runUpdates(); // IMPORTANT: NEED TO KEEP THIS LOADING CHECK INTACT
	}, null, true);

	console.log('Cron jobs started.');

	// Memory leak info

	memwatch.on('stats', function(stats) {
		// do something with post-gc memory usage stats
		console.log("%%%%%% STATS %%%%%%");
		console.dir(stats);
		console.log("%%%%%%%%%%%%%%%%%%%")
	});

	memwatch.on('leak', function(info) {
		// do something with post-gc memory usage stats
		console.log("%%%%%% LEAK %%%%%%");
		console.dir(info);
		console.log("%%%%%%%%%%%%%%%%%%")
	});


	///////////////////////
	// Newsletter Mailer //
	///////////////////////

	if (env != 'development') {
		function buildNewsletter() {
			var today = new Date(),
				i = 0,
				votes,
				dateCutoff = new Date(today.getTime() - 1000*60*60*24*3),
				subject = "Best of Smörgåsbord " + (today.getMonth()+1) + "/" + today.getDate() + "/" + today.getFullYear().toString().slice(-2),
				/*html = "<div style='font-family:sans-serif;text-align:center;color:#555'>" +
						"<h1>Top 10 Blogs on <a href='http://beta.pictoral.ly'>Pictoral.ly</a> - " + (today.getMonth()+1) + "/" + today.getDate() + "/" + today.getFullYear().toString().slice(-2) + 
						"</h1><br />";*/

				// Header
				html = 	"<div style='margin:0px;padding:0px;'>" +
							"<table cellpadding='0' cellspacing='0' border='0' style='background:#FFF;width:100%;'>" +
								"<tbody>" +
									"<tr>" +
										"<td>" +
											"<table border='0' cellspacing='0' cellpadding='0' align='center' style='background:#FFF;width:608px;border-collapse:separate;'>" +
												"<tbody>" +
													"<tr>" +
														"<td style='width:175px;border-bottom:1px solid #BBB;'>" +
															"<a href='http://www.visitsmorgasbord.com' style='margin-left:-14px;text-decoration:none;font-family:sans-serif;font-size:200px;font-weight:bold;color:#FFC61C;line-height:.95;'>S</a>" +
														"</td>" +
														"<td style='width:90px;vertical-align:bottom;padding-bottom:25px;border-bottom:1px solid #BBB;'>" +
															"<a href='http://www.visitsmorgasbord.com' style='text-decoration:none;font-family:sans-serif;font-size:14px;color:#333;letter-spacing:.5px;line-height:1.2;'>Best of<br/>Smörgåsbord<br/>" +
															"<b>" + (today.getMonth()+1) + "/" + today.getDate() + "/" + today.getFullYear().toString().slice(-2) + "</b>" +
															"</a>" +
														"</td>" +
														"<td style='width:335px;'></td>" +
													"</tr>" +
												"</tbody>" +
											"</table>";
			
			Activity.aggregate({$match: {type: "asterisk", dateAdded: {$gte: dateCutoff} }}, {$project:{feedId:1, asterisk: 1 } }, {$group:{"_id":"$feedId", "votes":{$sum: 1} }}, {$sort:{'votes':-1}}, {$limit:10}, function (err, feeds) {
				if (feeds.length == 10) {
					
					async.eachSeries(feeds, function (feedInfo, callback) {
						console.log(feedInfo._id);

						if (feedInfo.votes == 1) votes = "vote";
						else votes = "votes";

						Feed.findById(feedInfo._id, 'url title entries dateAdded lastPublished', function (err, feed) {
					    	if (err) {
					    		console.log("Error retrieving feeds for email: ", err);
					    		return;
					    	}

					    	i++;
							/* html += "<a href='" + feed.url + "'><h3>" + i + ". " + feed.title + "</h3></a><br /><br />"; */

							// Feed Header
							html += "<table border='0' cellspacing='0' cellpadding='0' align='center' style='background:#FFF;width:600px;padding-left:10px;padding-right:10px;border-collapse:separate;'>" +
										"<tbody>" +
											"<tr style='height:40px;'></tr>" +
											"<tr>" +
												"<td>" +
													"<table border='0' cellspacing='0' cellpadding='0' align='center' style='width:100%;border-collapse:separate;'>" +
														"<tbody>" +
															"<tr>" +
																"<td width='31' height='30' style='border-radius: 17px;border: 2px solid #FFC61C;text-align:center;color:#FFC61C;'>" + i + "</td>" +
																"<td height='34' width='569'></td>" +
															"</tr>" +
														"</tbody>" +
													"</table>" +
												"</td>" +
											"</tr>" +
											"<tr style='height:5px;'></tr>" +
											"<tr>" +
												"<td style='font-family:sans-serif;font-size:11px;color:#FFC61C;'>" +
													feedInfo.votes + " " + votes +
												"</td>" +
											"</tr>" +
											"<tr style='height:4px;'></tr>" +
											"<tr>" +
												"<td>" +
													"<a href='" + feed.url + "' style='text-decoration:none;font-family:sans-serif;font-size:150%;letter-spacing:1px;color:#555;'>" + feed.title + "</a>" +
												"</td>" +
											"</tr>" +
											"<tr style='height:20px;'></tr>" +
										"</tbody>" +
									"</table>";

							var imgSmWidth2 = 0,
								imgSmWidth = 0,
								imgSmDiv = "",
								imgSmDiv2 = "";

							// Feed Images
							_.every(feed.entries, function (entry) {
								_.every(entry.images, function (image) {
									if (image.smallThumbnail != 'null' && imgSmWidth < 600) {
										console.log("1 - FOUND SMALL IMAGE for %s", feed.title);
										console.dir(image.smallThumbnail);
										/* imgSmDiv += "<a href='" + feed.url + "'><img style='margin-right:1px;' src='" + image.smallThumbnail.url + "' /></a>"; */
										imgSmDiv += "<a href='" + feed.url + "' style='text-decoration:none;' target='_blank'>" +
														"<img style='margin-right:1px;' src='" + image.smallThumbnail.url + "'>" +
													"</a>";
										imgSmWidth += image.smallThumbnail.width;
									} else if (imgSmWidth >= 600 && image.smallThumbnail != 'null' && imgSmWidth2 < 600) {
										console.log("2 - FOUND SMALL IMAGE for %s", feed.title);
										console.dir(image.largeThumbnail);
										imgSmDiv2 += "<a href='" + feed.url + "' style='text-decoration:none;' target='_blank'>" +
														"<img style='margin-right:1px;' src='" + image.smallThumbnail.url + "'>" +
													"</a>";
										imgSmWidth2 += image.smallThumbnail.width;
										
									} else {
										console.log("NO IMAGE YET for %s", feed.title);
										return true;
									}

									if (imgSmWidth >= 600 && imgSmWidth2 >= 600) {
										return false;
									} else {
										return true;
									}
									
								});

								if (imgSmWidth >= 600 && imgSmWidth2 >= 600) {
									/*html += "<div style='position:relative;margin:0px auto;width:750px;max-height:300px;white-space: nowrap;border:1px solid #777;padding:2px;'><div style='overflow:hidden;'>" + imgDiv + "</div></div><br /><br /><br /><br />";*/
									// Feed Footer
									var htmlImg1 = "<div style='position:relative;margin:0px auto;max-width:580px;max-height:150px;white-space: nowrap;margin-bottom:1px;'>" +
														"<div style='overflow:hidden;'>" +
															imgSmDiv +
														"</div>" +
													"</div>";

									var htmlImg2 = "<div style='position:relative;margin:0px auto;max-width:580px;max-height:150px;white-space: nowrap;margin-bottom:1px;'>" +
														"<div style='overflow:hidden;'>" +
															imgSmDiv2 +
														"</div>" +
													"</div>";

									// Feed Footer
									html += "<table border='0' cellspacing='0' cellpadding='0' align='center' style='background:#FFF;width:600px;padding-left:10px;padding-right:10px;border-collapse:separate;'>" +
												"<tbody>" +
													"<tr>" +
														"<td>" +
															htmlImg1 +
															htmlImg2 +
														"</td>" +
													"</tr>" +
													"<tr style='height:10px;padding-top:5px;padding-bottom:10px;'>" +
														"<td style='text-align:right;'><a href='" + 
															feed.url + 
															"' style='text-decoration:none;font-family:sans-serif;font-size:12px;letter-spacing:1px;color:#111;'>Go to site <span style='font-size:18px;vertical-align:middle;'>&rarr;</span></a></td>" +
													"</tr>" +
												"</tbody>" +
											"</table>";
									
									return false;
								} else {
									console.log("CHECKING NEXT ENTRY for %s", feed.title);
									return true;
								}
							});

							//if (imgWidth < 750) {
								/*html += "<div style='position:relative;margin:0px auto;width:750px;max-height:150px;white-space: nowrap;border:1px solid #777;padding:2px;'><div style='overflow:hidden;'>" + imgSmDiv + "</div></div><br /><br /><br /><br />";*/
							//}

							

							callback();
						});

					}, function (err) {

							// Footer
							html += "<table border='0' cellspacing='0' cellpadding='0' align='center' style='background:#FFF;width:600px;padding-left:10px;padding-right:10px;border-collapse:separate;'>" +
										"<tbody>" +
											"<tr style='height:50px;'></tr>" +
											"<tr>" +
												"<td style=''>" +
													"<div style='background:#FFC61C;border-radius:5px;-webkit-border-radius:5px;-moz-border-radius:5px;-o-border-radius:5px;text-align:center'>" +
														"<a href='http://www.visitsmorgasbord.com'  style='display:block;height:100%;text-decoration:none;font-family:sans-serif;font-size:14px;font-weight:bold;color:#111;line-height:50px;'>Discover More @ Smörgåsbord</a>" +
													"</div>" +
												"</td>" +
											"</tr>" +
										"</tbody>" +
									"</table>" +
									"<table border='0' cellspacing='0' cellpadding='0' align='center' style='background:#FFF;width:600px;padding-left:10px;padding-right:10px;border-collapse:separate;'>" +
										"<tbody>" +
											"<tr style='height:50px;'></tr>" +
											"<tr>" +
												"<td style='width:265px;border-top:1px solid #CCC;padding-top:75px;'>" +
													"<a href='*|UNSUB:http://www.visitsmorgasbord.com|*' style='text-decoration:none;font-family:sans-serif;font-size:14px;font-weight:bold;color:#555;'>Click here to unsubscribe</a>" +
												"</td>" +
												"<td style='width:335px;'></td>" +
											"</tr>" +
											"<tr style='height:10px;'></tr>" +
											"<tr>" +
												"<td style='width:265px;'>" +
													"<a href='http://www.visitsmorgasbord.com' style='text-decoration:none;font-family:sans-serif;font-size:14px;color:#CCC;'>&#9400; 2014 Smörgåsbord</a>" +
												"</td>" +
											"</tr>" +
											"<tr style='height:100px;'></tr>" +
										"</tbody>" +
									"</table>" +
								"</td>" +
							"</tr>" +
						"</tbody>" +
					"</table>" +
				"</div>";

							console.log(html);

							Email.find({}, function (err, emails) {
								if (err) {
									console.log("ERROR FINDING EMAILS: %s", err);
									return;
								}

								var recipients = [];

								_.each(emails, function (email) {
									var recipient = {};
									recipient.email = email.emailAddress;
									recipients.push(recipient);
								});

								console.log("RECIPIENTS");
								console.dir(recipients);

								/*[{email: 'koosmann@gmail.com', name: 'Marcus Koosmann' }, 
								{email: 'kaytfitz@gmail.com', name: 'Kayt Fitzmorris' }, 
								{email: 'ottoboreson@gmail.com', name: 'Otto Boreson' }, 
								{email: 'mythbauer24@gmail.com', name: 'Andrew Lockridge' }, 
								{email: 'mlockridge@me.com', name: 'Mike Lockridge'}, 
								{email: 'elkekoosmann@gmail.com', name: 'Elke Koosmann'}, 
								{email: 'hallieparker@gmail.com', name: 'Hallie Parker'},
								{email: 'lilmisskate@me.com', name: 'Katie Koosmann'},
								{email: 'danieljkatz@gmail.com', name: 'Daniel Katz'}]*/

								email.send(//recipients, 
											[{email: 'koosmann@gmail.com', name: 'Marcus Koosmann' }],
											'hello@visitsmorgasbord.com', 
											subject, 
											"[Insert the most amazing email ever here]<br /><br /><a href='*|UNSUB:http://www.visitsmorgasbord.com|*''>Click here to unsubscribe.</a></div>", 
											html, // + "<br /><br /><a href='*|UNSUB:http://beta.pictoral.ly|*'>Click here to unsubscribe.</a>", 
											'Top 10 Newsletter',
											function (error, res) {
									if (error) console.log("Error sending newsletter - %s", error);
									else console.log("Newsletter sent!");
								});
							});
					});
				} else {
					console.log("NO TOP FEEDS");
				}
			});
		}

		new cron('00 00 12 1-30/3 * *', function () {  // Every other day at 5AM
			buildNewsletter();
		}, null, true);

		//buildNewsletter();
	}

}