// GET IP
var itf = require('os').networkInterfaces().wlan0;
var ips = "";
if (itf) {
  ips = require('os').networkInterfaces().wlan0.map(function(interface) {
	 return interface.address;
  });
}

//GPIO
var pump0, pump1, pump2, pump3, pump4, pump5, pump6, pump7;
var gpio = require('rpi-gpio');

// pumpx = pin number of gpio breakout connector
// numbered according to MiniPiio ULN2803 board usage
pump0 = 11;
pump1 = 12;
pump2 = 13;
pump3 = 15;
pump4 = 16;
pump5 = 18;
pump6 = 22;
pump7 = 7;

gpio.setup(pump0, gpio.DIR_OUT);
gpio.setup(pump1, gpio.DIR_OUT);
gpio.setup(pump2, gpio.DIR_OUT);
gpio.setup(pump3, gpio.DIR_OUT);
gpio.setup(pump4, gpio.DIR_OUT);
gpio.setup(pump5, gpio.DIR_OUT);
gpio.setup(pump6, gpio.DIR_OUT);
gpio.setup(pump7, gpio.DIR_OUT);

function setPin(pin, val) {
  gpio.write(pin, val, function(err) {
    if (err) throw err;
      console.log('Pin ' + pin + ' set to ' + val);
  });
}

//LCD
var lcdqueue = [];
var ingstring = "";
var lcdbusy = false;

var Lcd = require('lcd'),
  lcd = new Lcd({rs:21, e:20, data:[16, 26, 19, 13], cols:20, rows:4});

lcd.on('ready', function () {
  exports.showTitle();
});

lcd.on('printed', function () {
  lcdbusy = false;
  if(lcdqueue.length > 0) {
    var l = lcdqueue.shift();
    processlcdSend(l);
  }
});

lcd.on('clear', function () {
  lcdbusy = false;
  if(lcdqueue.length > 0) {
    var l = lcdqueue.shift();
    processlcdSend(l);
  }
});

function processlcdSend(l) {
  if(l.str== "lcdClear") {
    lcdbusy = true;
    lcd.clear();
  }
  else {
    lcd.setCursor(l.col, l.row);
    lcdbusy = true;
    lcd.print(l.str);
  }
}

process.on('SIGINT', function () {
  console.log("Shutting down lcd");
  lcd.close();
//  process.exit();
});

exports.lcdPrint = function(cval, rval, strval) {
  var l = { col: cval, row: rval, str: strval };
  if(lcdbusy) {
    lcdqueue.push(l);
  }
  else {
    processlcdSend(l);
  }
}

exports.lcdClear = function() {
  if(lcdbusy) {
    lcdqueue.push({ col: 0, row: 0, str: "lcdClear" });
  }
  else {
    lcdbusy = true;
    lcd.clear();
  }
}

//BACKEND

console.log("\033[31m[MSG] Booze-O-Tron 9000 Ready\033[91m");

exports.getStatus = function() {
    var status = new Object();
    status.working = false;
    return status;
};

exports.pump = function (ingredients) {
  console.log("Dispensing Drink");
  ingstring = "";
  for (var i in ingredients) {
    (function (i) {
      setTimeout(function () {  // Delay implemented to have a top-biased mix
        pumpMilliseconds(ingredients[i].pump, ingredients[i].name, ingredients[i].amount);
      }, ingredients[i].delay);
    })(i);
  }
};

function pumpMilliseconds(pump, name, ms) {
  ingstring += "<" + name + ">";
  printIngredients(ingstring);
  exports.startPump(pump);
  setTimeout(function () {
    exports.stopPump(pump, name);
  }, ms);
}

exports.startPump = function (pump) {
  console.log("\033[32m[PUMP] Starting " + pump + "\033[91m");
  var p = exports.usePump(pump);
  setPin(p, 1);
}

exports.stopPump = function (pump, name) {
  console.log("\033[32m[PUMP] Stopping " + pump + "\033[91m");
  ingstring = ingstring.replace("<" + name + ">","");
  printIngredients(ingstring);
  var p = exports.usePump(pump);
  setPin(p, 0);
  if(ingstring == "") { // no more ingredients, we are finished with this drink
    exports.lcdClear();
    exports.lcdPrint(0, 1, "       ENJOY!       ");
    setTimeout(function () {
      exports.showTitle();
    }, 6000);
  }
}

exports.usePump = function (pump) {
  var using;
  switch(pump) {
    case 'pump0':
      using = pump0;
      break;
    case 'pump1':
      using = pump1;
      break;
    case 'pump2':
      using = pump2;
      break;
    case 'pump3':
      using = pump3;
      break;
    case 'pump4':
      using = pump4;
      break;
    case 'pump5':
      using = pump5;
      break;
    case 'pump6':
      using = pump6;
      break;
    case 'pump7':
      using = pump7;
      break;
    default:
      using = null;
      break;
  }
  console.log('usePump pin: ' + using);
  return using;
}

function printIngredients(ingstring) {
  exports.lcdPrint(0, 1, "                    ");
  exports.lcdPrint(0, 2, "                    ");
  exports.lcdPrint(0, 3, "                    ");
  if(ingstring.length <= 20) {
    exports.lcdPrint(0, 1, ingstring);
  }
  else if(ingstring.length <= 40) {
    exports.lcdPrint(0, 1, ingstring.substring(0,20));
    exports.lcdPrint(0, 2, ingstring.substring(20));
  }
  else if(ingstring.length <= 60) {
    exports.lcdPrint(0, 1, ingstring.substring(0,20));
    exports.lcdPrint(0, 2, ingstring.substring(20,40));
    exports.lcdPrint(0, 3, ingstring.substring(40));
  }
}

exports.showTitle = function () {
  exports.lcdClear();
  exports.lcdPrint(0, 1, " BOOZE-O-TRON 9000  ");
  exports.lcdPrint(0, 3, ips + ":3000");
};