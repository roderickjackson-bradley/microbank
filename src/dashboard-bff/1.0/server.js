// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var bff        = require('./dashboardBFF');
var chaos      = require('./chaos_router/chaos_router.js');
var cors       = require('cors');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 80;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

app.use (chaos);
app.use(cors());

router.get('/', function(req, res) {
	res.send("I'm healthy... " +
		" You can call getOverallBalance, getTransactionCount, getTransactionHistory, getPods ");
});

router.get('/getOverallBalance', function(req, res) {
	return bff.getOverallBalance (req, res);
});

router.get('/getTransactionCount', function(req, res) {
	return bff.getTransactionCount (req, res);
});

router.get('/getTransactionHistory', function (req, res) {
	return bff.getTransactionHistory (req, res);
});

router.get('/getPods', function (req, res) {
	return bff.getPods (req, res);
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

