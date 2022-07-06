// load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
RestaurantSchema = new Schema({
    _id: mongoose.Types.ObjectId,
    restaurant_id: String,
    name: String,
    cuisine: String,
    borough: String,
    address: [{ building: String, coord: [Number], street: String, zipcode: String }],
    grade: [{ date: Date, grade: String, score: Number }]
});
module.exports = mongoose.model('Restaurant', RestaurantSchema);