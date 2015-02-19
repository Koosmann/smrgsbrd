////////////
// Models //
////////////

module.exports = function (mongoose, mixpanel) {
	
	// Users
	var CategorySchema = new mongoose.Schema({		

		title: { type: String, required: true, unique: true, trim: true },

		public: { type: Boolean, required: true, default: false },

		featured: { type: Boolean, required: true },

		createdBy: { type: mongoose.Schema.Types.ObjectId }
		
	});

	return mongoose.model('Category', CategorySchema, 'categories');
}