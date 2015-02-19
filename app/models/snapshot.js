////////////
// Models //
////////////

module.exports = function (mongoose, mixpanel) {
	
	// Users
	var SnapshotSchema = new mongoose.Schema({
		// Author
		userId: { type: mongoose.Schema.Types.ObjectId },

		// Comment
		comment: { type: String, trim: true },

		// URL
		url: { type: String, unique: true, sparse: true },

		// URL
		large2xThumbnail: { type: String, unique: true, sparse: true },

		// URL
		largeThumbnail: { type: String, unique: true, sparse: true },

		// URL
		smallThumbnail: { type: String, unique: true, sparse: true },

		// Feed ID
		feedId: { type: String, trim: true },

		// LINKS
		links: [{
			entryId: { type: mongoose.Schema.Types.ObjectId },
			entryUrl: String,
			entryTitle: String
		}],

		// Images
		images: 	[{
						images: [{
							url: { type: String, required: true },
							largeThumbnail: { url: String, height: Number, width: Number },
							smallThumbnail: { url: String, height: Number, width: Number },
							width: { type: Number },
							height: { type: Number },
							entryId: { type: mongoose.Schema.Types.ObjectId },
							entryUrl: { type: String },
							entryTitle: { type: String }
						}],
						offset: {type: Number }
					}],

		// Date added
		dateAdded: { type: Date, default: Date.now }
	});

	SnapshotSchema.index({ userId: 1, dateAdded: -1 }); // schema level

	return mongoose.model('Snapshot', SnapshotSchema, 'snapshots');
}