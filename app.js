var express = require('express');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
var app = express();
var database = require('./config/database');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)

var path = require('path');//include path module using require method
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ 'extended': 'true' }));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

app.engine('.hbs', expressHandlebars.engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars), extname: '.hbs'
}));
app.set('view engine', '.hbs');

mongoose.connect(database.url);
var db = mongoose.connection;

var Restaurant = require('./models/restaurant');
var Func = require('./functions');

var Rest = new Func(database.url);
Rest.initialize().then(() => {
    app.listen(port, () => {
        console.log(`server listening on: ${port}`);
    });
}).catch((err) => {
    console.log(err);
});


app.get('/', function (req, res) {
    // use mongoose to get all todos in the database
    res.json('hello');
});

//get all restaurant data from db
app.get('/api/restaurants', function (req, res) {
    // use mongoose to get all todos in the database
    Rest.getAllRestaurantData().then(function (err, restaurants) {
        // if there is an error retrieving, send the error otherwise send data
        if (err)
            res.send(err)
        res.json(restaurants); // return all restaurants in JSON format
    });
});

// get a restaurant with ID
app.get('/api/restaurants/:restaurant_id', function (req, res) {
    let id = req.params.restaurant_id;
    Rest.getRestaurantById(id).then(function (err, restaurant) {
        if (err)
            res.send(err)
        res.json(restaurant);
    });
});

//create book and send back all book after creation
app.post('/api/restaurants', function (req, res) {
    var data = {
        _id:mongoose.Types.ObjectId(req.body._id),
		restaurant_id: req.body.restaurant_id,
        name: req.body.name,
        cuisine: req.body.cuisine,
        borough: req.body.borough
    }
	// create mongose method to create a new record into collection
	console.log(req.body);
	Rest.addNewRestaurant(data).then(function (err, restaurant) {
		if (err)
			res.send(err);
		// get and return all the books after newly created book record
		Rest.getAllRestaurantData().then(function (err, restaurants) {
			if (err)
				res.send(err)
			res.json(restaurants);
		});
	});
});


app.put('/api/restaurants/:restaurant_id', function (req, res) {
    // create mongose method to update an existing record into collection
    console.log(req.body);
    let id = req.params._id;
    const data = {
        restaurant_id: req.body.restaurant_id,
        name: req.body.name,
        cuisine: req.body.cuisine,
        borough: req.body.borough
    }

    // save the user
    Rest.updateRestaurantById(data, id).then(function (err, restaurant) {
        if (err) throw err;
        res.send('Successfully! Restaurant updated - ' + id);
    });
});

app.delete('/api/restaurants/:restaurant_id', function (req, res) {
    console.log(req.params.restaurant_id);
    let id = req.params.restaurant_id;
    Rest.deleteRestaurantById(id).then(function (err) {
        if (err)
            res.send(err);
        else
            res.send('Successfully! Restaurant has been Deleted.');
    });
});

//get all restaurant data from db
app.get('/posts', function (req, res) {
    // use mongoose to get all todos in the database
    const borough = req.query.borough;
    Restaurant.find({ borough: borough }, function (err, restaurants) {
        // if there is an error retrieving, send the error otherwise send data
        if (err)
            res.send(err)
        const page = req.query.page;
        const limit = req.query.limit;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const result = restaurants.slice(startIndex, endIndex);
        res.json(result); // return all restaurants in JSON format
    });
});


//add new restaurant
app.post('/api/restaurants', function (req, res) {
    Restaurant.create({
        _id: req.body._id,    //uncomment while adding record.
        //address : req.body.address,
        borough: req.body.borough,
        cuisine: req.body.cuisine,
        // grades: req.body.grades,
        name: req.body.name,
        restaurant_id: req.body.restaurant_id
    }, function (err, restaurant) {
        if (err)
            console.log(err);

        // get and return all the restaurants after newly created restaurant record
        Restaurant.find(function (err, restaurants) {
            if (err)
                console.log(err);
            res.json(restaurants);
            console.log(restaurants);
        });
    });
});

//add new book
app.get('/api/search', (req, res, next) => {
    res.render('search', { layout: false });
});

app.post('/api/search', (req, res, next) => {
    const borough = req.body.borough;
    const page = req.body.page;
    const limit = req.body.limit;
    Restaurant.find({ borough: borough }, function (err, restaurants) {
        // if there is an error retrieving, send the error otherwise send data
        if (err)
            res.send(err)
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const result = restaurants.slice(startIndex, endIndex);
        //res.json(result); // return all restaurants in JSON format
        res.render('display', { data: result, layout: false }); // return all books in JSON format
    });
});


// app.listen(port);
// console.log(`App listening at http://localhost:${port}`)