var os = require('os');

var queue = require('./queue/queue');
const ACCOUNT_QUEUE = "accounts";

var redisHelper = require('./redis/redisHelper');
var REDIS_URL = "redis://microbank-account-redis";

const INITIAL_BALANCE = 100;
var balance;

var name = obtainAccountName();


function getBalance (res) {
    result = { "balance" : balance }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result));
}

function obtainAccountName () {
	hostname = os.hostname();
	array = hostname.split("-");

	// Normal name: microbank-john-account-...
	return array[0] + "-" + array[1];
}

function registerAccount() {
    console.log ("Registering account " + name);
	queue.sendMessage(ACCOUNT_QUEUE, name);
}

function persistBalance() {
    console.log ("Persisting balance of account " + name + " balance: " + balance);

    var client = redisHelper.connectToRedis(REDIS_URL); 
    client.set (name, balance);
}

function updateBalance(delta) {
    balance += parseInt(delta);
    persistBalance ();
}

function resetBalance() {
    balance = INITIAL_BALANCE;
    console.log ("Setting initial balance to: " + balance);
    persistBalance();
}

function getInitialBalance() {
    console.log ("Getting balance for account " + name);

    var client = redisHelper.connectToRedis(REDIS_URL);
    client.get (name, function (err, reply) {
        if (reply == null) {
            resetBalance();
        } else {
            console.log ("Found balance: " + reply.toString());
            balance = parseInt(reply.toString());
        }
    }); 
}

function reset(res) {
    resetBalance();
    getBalance(res);
}

function listenToQueue () {
    console.log ("Listening to the queue..."); 
    queue.consumeMessage(name, function (message) {
        amount = message.toString();
        console.log ("Message: " + amount);
        delta = Number(amount);
        updateBalance (delta);
    }); 
}



getInitialBalance();
listenToQueue();
registerAccount();


module.exports = {
    get: function(req, res) {
        console.log ("Retrieving balance ")
        getBalance(res);
        console.log ("Returning result")
    },
/*
    update: function(req, res) {
        delta = req.params.delta;
        updateBalance(res, delta);
    },
*/

    reset: function(req, res) {
        reset(res);
    }
}