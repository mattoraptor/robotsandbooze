var board, pump0, pump1, pump2, pump3, pump4;

var request = require('request');

exports.pump = function (ingredients) {
  console.log("Dispensing Drink");
  for (var i in ingredients) {
    (function (i) {
      setTimeout(function () {  // Delay implemented to have a top-biased mix
        pumpMilliseconds(ingredients[i].pump, ingredients[i].amount);
      }, ingredients[i].delay);
    })(i);
  }
};

function pumpMilliseconds(pump, ms) {
  console.log("\033[32m[PUMP] Starting " + pump + "\033[91m");
  var url = 'http://10.4.204.176/arduino/pumpOn/' + pump + '/' + ms;
  console.log('calling ' + url);
  request.get(url);
  request(url, function (error, response, body) {
    if (error) {
      console.log('error ' + error);
      console.log('resp ' + response);
    }
    console.log('body ' + body);
  });
}

exports.startPump = function (pump) {
  console.log("\033[32m[PUMP] Starting " + pump + "\033[91m");
}

exports.stopPump = function (pump) {
  console.log("\033[32m[PUMP] Stopping " + pump + "\033[91m");
}