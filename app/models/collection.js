////////////
// Models //
////////////

module.exports = function (mongoose, mixpanel, async, Feed, _) {
	
	// Users
	var CollectionSchema = new mongoose.Schema({		
		// Title
		title: { type: String, required: true, trim: true },

		// Description
		description: { type: String, required: true, trim: true },

		// Avatar
		cover: { 	url: String,
					width: Number,
					height: Number },

		// Author
		authorId: { type: mongoose.Schema.Types.ObjectId },

		// Description
		title: { type: String, required: true, trim: true },

		// Blogs
		feeds: 	[{	
					feedId: { type: String, trim: true },
					comment: { type: String, trim: true }
				}],

		// Image preview
		imagePreview: 	[{
							url: { type: String, required: true },
							largeThumbnail: { url: String, height: Number, width: Number },
							smallThumbnail: { url: String, height: Number, width: Number },
							width: { type: Number },
							height: { type: Number },
							likes: [{ type: String }]
						}],

		// Image preview
		imagePreview2: 	[{
							url: { type: String, required: true },
							largeThumbnail: { url: String, height: Number, width: Number },
							smallThumbnail: { url: String, height: Number, width: Number },
							width: { type: Number },
							height: { type: Number },
							likes: [{ type: String }]
						}],

		// Image preview
		imagePreview3: 	[{
							url: { type: String, required: true },
							largeThumbnail: { url: String, height: Number, width: Number },
							smallThumbnail: { url: String, height: Number, width: Number },
							width: { type: Number },
							height: { type: Number },
							likes: [{ type: String }]
						}],

		// Image preview
		imagePreview4: 	[{
							url: { type: String, required: true },
							largeThumbnail: { url: String, height: Number, width: Number },
							smallThumbnail: { url: String, height: Number, width: Number },
							width: { type: Number },
							height: { type: Number },
							likes: [{ type: String }]
						}],

		// Publishing
		published: { type: Boolean, default: false },
		publishDate: { type: Date, default: null },


		// Date added
		dateAdded: { type: Date, default: Date.now }
	});

	CollectionSchema.method('updateImagePreview', function (callback) {
		//  Small Previews

		var width = 600,
			imagesWidth = 0,
			images2Width = 0,
			images3Width = 0,
			images4Width = 0,
			collection = this,
			margin = 2,
			imagePreviews = [];

		console.log("BUILDING IMAGE PREVIEW FOR %s", collection.title);

		collection.imagePreview = [];
		collection.imagePreview2 = [];
		collection.imagePreview3 = [];
		collection.imagePreview4 = [];

		async.series([function (callback) {

			Feed.find({_id: {$in: _.pluck(collection.feeds, 'feedId')}}, 'longSmallImagePreview longSmallImagePreview2 longSmallImagePreview3', function (err, feeds) {
				if (err) {
					console.log("-------------------");
					console.log("Feed search error! (collection images) %s - %s", collection.title, err);
					console.log("-------------------");
				}

				if (feeds.length > 0) {
					_.each(feeds, function (elm) {
						imagePreviews.push(elm.longSmallImagePreview.concat(elm.longSmallImagePreview2, elm.longSmallImagePreview3));
					});

					// Merge image previews
					imagePreviews = _.filter(_.reduceRight(_.zip.apply(_, imagePreviews), function(a, b) { return b.concat(a); }, []), function (elm) { return elm; });
				}

				callback();

			});
		}], function (err) {
			_.each(imagePreviews, function(image) {
				if ((imagesWidth - (margin * (collection.imagePreview.length+1))) < width) {
					if (image.smallThumbnail && image.smallThumbnail.height >= 150) {
						collection.imagePreview.push(image);
						imagesWidth += image.smallThumbnail.width/2;
					}
				} else if ((imagesWidth - (margin * (collection.imagePreview.length+1))) >= width && (images2Width - (margin * (collection.imagePreview2.length+1))) < width) {

					if (image.smallThumbnail && image.smallThumbnail.height >= 150) {
						collection.imagePreview2.push(image);
						images2Width += image.smallThumbnail.width/2;
					}
				} else if ((imagesWidth - (margin * (collection.imagePreview.length+1))) >= width && (images2Width - (margin * (collection.imagePreview2.length+1))) >= width && (images3Width - (margin * (collection.imagePreview3.length+1))) < width) {

					if (image.smallThumbnail && image.smallThumbnail.height >= 150) {
						collection.imagePreview3.push(image);
						images3Width += image.smallThumbnail.width/2;
					}
				} else if ((imagesWidth - (margin * (collection.imagePreview.length+1))) >= width && (images2Width - (margin * (collection.imagePreview2.length+1))) >= width && (images3Width - (margin * (collection.imagePreview3.length+1))) >= width && (images4Width - (margin * (collection.imagePreview4.length+1))) < width) {

					if (image.smallThumbnail && image.smallThumbnail.height >= 150) {
						collection.imagePreview4.push(image);
						images4Width += image.smallThumbnail.width/2;
					}
				}
			});


			collection.save(function (err) {		
				if (err) {
					console.log("-------------------");
					console.log("Collection image preview for %s - save error! / %s", collection.title, err);
					console.log("-------------------");
				} else {
					console.log("Image preview saved for %s.", collection.title);
				}

				callback();

				collection = null;
				imagePreviews = null;
			});
		});
		
	});

	return mongoose.model('Collection', CollectionSchema, 'collections');
}