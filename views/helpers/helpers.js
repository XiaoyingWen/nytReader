'use strict';
var moment = require('moment')

exports.formatTime = function (date, format) {
    var mmnt = moment(date);
    return mmnt.format(format);
};