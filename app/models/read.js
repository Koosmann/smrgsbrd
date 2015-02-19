////////////
// Models //
////////////

module.exports = function (mongoose) {
	
	// Reads
	var ReadSchema = new mongoose.Schema({
		
		// ID
		id: { type: mongoose.Schema.Types.ObjectId },
		
		// User
		userId: { type: mongoose.Schema.Types.ObjectId },
		
		// Feed
		feedId: { type: mongoose.Schema.Types.ObjectId },
		
		// Entry
		entryId: { type: mongoose.Schema.Types.ObjectId },

		// Date
		dateMarked: { type: Date, default: Date.now },
	});

	return mongoose.model('Read', ReadSchema, 'reads');
}