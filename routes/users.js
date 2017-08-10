var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	console.log("in user.js but why the following commented code would redirect to login page...");
  //res.send('respond with a resource');
    res.render('home', { title: 'Express' });
});

module.exports = router;
