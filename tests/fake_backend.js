exports.lcdPrint = function(cval, rval, strval) {
  console.log("lcdPrint");
}

exports.lcdClear = function() {
  console.log("lcdClear");
}

//BACKEND

exports.pump = function (ingredients) {
  console.log("Dispensing Drink " + ingredients);
};

exports.getStatus = function() {
    var currentTime = new Date().getTime();
    var status = new Object();
    status.working = true;
    status.endTime = currentTime + (5 * 1000);
    return status;
};

exports.startPump = function (pump) {
  console.log("\033[32m[PUMP] Starting " + pump + "\033[91m");

}

exports.stopPump = function (pump, name) {
  console.log("\033[32m[PUMP] Stopping " + pump + "\033[91m");

}

exports.usePump = function (pump) {
  console.log('usePump pin: ' + pump);
}

exports.showTitle = function () {
  exports.lcdClear();
  exports.lcdPrint(0, 1, " BOOZE-O-TRON 9000  ");
  exports.lcdPrint(0, 3, ips + ":3000");
};