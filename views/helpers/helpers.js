'use strict';
var moment = require('moment')

//give the string of the date with the needed format for display
exports.formatTime = function(date, format) {
    var mmnt = moment(date);
    return mmnt.format(format);
};