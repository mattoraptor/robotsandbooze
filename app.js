var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
//var users = require('./routes/users');
var add = require('./routes/add');
var edit = require('./routes/edit');
var pumps = require('./routes/pumps');

var mongoose = require('mongoose');
var db = mongoose.createConnection('localhost', 'barmixvah');

var DrinkSchema = require('./models/Drink.js').DrinkSchema;
var Drink = db.model('drinks', DrinkSchema);

var PumpSchema = require('./models/Pump.js').PumpSchema;
var Pump = db.model('pumps', PumpSchema);

var app = express();

var robot;
if (app.get('env') == 'test') {
  robot = require('./tests/fake_backend.js');
} else {
  robot = require('./public/javascripts/robot/backend.js');
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index(Drink, Pump));
app.get('/add', add.form(Drink));
app.get('/edit', edit.show(Drink));
app.get('/pumps', pumps.set(Pump));

app.post('/updatepump.json', pumps.updatePump(Pump));
app.post('/drink.json', add.addDrink(Drink));
app.post('/pump.json', add.addPump(Pump));
app.post('/updatedrink.json', edit.updateDrink(Drink));


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


var server = app.listen(3000, '0.0.0.0');
var io = require('socket.io').listen(server);
io.set('log level', 1); // reduce logging

io.sockets.on('connection', function (socket) {
  socket.on("Make Drink", function (drinkName, ingredients) {
    robot.lcdPrint(10 - (drinkName.length/2), 0, drinkName);
    robot.pump(ingredients);
    console.log(ingredients);
  });

  socket.on("Start Pump", function (pump) {
    robot.startPump(pump);
  });

  socket.on("Stop Pump", function (pump) {
    robot.stopPump(pump);
  });

  socket.on("Get Status", function(callback) {
    console.log('pump is on? ' + robot.pumpStatus.working);
    callback(robot.pumpStatus);
  });
});


db.once('open', function () {
  Pump.findOne({}, function (err, pump) {
    if (pump == null) {
      var pumps = {
        label: "pumps",
        ingredients: [ { label: "pump0", ingredient: "" } ]
      };
      Pump.create(pumps);
    }
  });
});

/// error handlers

// development error handler
// will print stacktrace
if ((app.get('env') === 'development') || (app.get('env') == 'test')){
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

process.on('SIGINT', function () {
    console.log("Shutting down Booze-O-Tron");
    process.exit();
});


module.exports = app;
