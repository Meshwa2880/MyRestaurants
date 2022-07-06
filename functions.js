// load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
RestaurantSchema = new Schema({
    _id: mongoose.Types.ObjectId,
    restaurant_id: String,
    name: String,
    cuisine: String,
    borough: String,
    address: [{ building: String, coord: Number, street: String, zipcode: String }],
    grades: [{ date: Date, grade: String, score: Number }]
});
//module.exports = mongoose.model('Restaurant', RestaurantSchema);

module.exports = class Restaurant{
    constructor(connectionString){
        this.connectionString = connectionString;
        this.Restaurant = null;
    }

   initialize(){
        return new Promise((resolve,reject)=>{
           let db = mongoose.createConnection(this.connectionString,{ useNewUrlParser: true,useUnifiedTopology: true });

            db.on('error', ()=>{
                reject();
            });
            db.once('open', ()=>{
                this.Restaurant = db.model("restaurants", RestaurantSchema);
                resolve();
               
            });
        });
    }

    async addNewRestaurant(data){
        let newRestaurant = new this.Restaurant(data);
        await newRestaurant.save();
        return `new restaurant: ${newRestaurant._id} successfully added`
    }

    getAllRestaurants(page, perPage, borough){ 
        let findBy = borough ? { borough } : {};

        if(+page && +perPage){
            return this.Restaurant.find(findBy).sort({restaurant_id: +1}).skip(page * +perPage).limit(+perPage).exec();
        }

        return Promise.reject(new Error('page and perPage query parameters must be present'));
    }

    getRestaurantById(id){
       return this.Restaurant.findOne({_id: id}).exec();
    }

    getAllRestaurantData()
    {
        return this.Restaurant.find().exec();
    }

    async updateRestaurantById(data, id){
        await this.Restaurant.updateOne({_id: id}, { $set: data }).exec();
        return `restaurant ${id} successfully updated`;
    }

    async deleteRestaurantById(id){
        await this.Restaurant.deleteOne({_id: id}).exec();
        return `restaurant ${id} successfully deleted`;
    }
}

