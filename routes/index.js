var express = require('express');
var router = express.Router();
var Comment = require("./../models/Comment.js");
var Article = require("./../models/Article.js");
var request = require("request");
var cheerio = require("cheerio");
var moment = require('moment')

/* GET home page. */ 
//scrape NYT health news to save into DB, then redirect to refresh all the articles
router.get('/', function(req, res, next) {
    // GET request to scrape the website
    request("https://www.nytimes.com/section/health", function(error, response, html) {
        // Then, load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);

        // Now, grab every article tag, and save to Mongo DB
        $("article.story.theme-summary.has-kicker").each(function(i, element) {

            var articleStoryId = $(element).parent().attr('id') || "0";
            console.log("check any existing record with the storyId: '" 
                + articleStoryId + "'");
            Article.find({
                storyId: articleStoryId
            }).exec(function(error, doc) {
                if (error) {
                    console.log(error);
                } else {
                    if (doc.length === 0) {
                        //save the article
                        console.log("add: " + articleStoryId);

                        // Save these results in an object
                        var result = {};
                        result.link = $(element).find('a').attr("href").trim();
                        result.summary = $(element).find('p.summary').text().trim();
                        result.title = $(element).find('h2.headline').text().trim();

                        //set the date with the time zone where the datetime read is with YYYY-MM-DD format
                        result.date = new Date(moment($(element).children('footer').children('time').attr("datetime").trim(), 'YYYY-MM-DD', true).format());
                        result.storyId = $(element).parent().attr('id');

                        // Using our Article model, create a new entry
                        // This effectively passes the result object to the entry
                        var entry = new Article(result);

                        // Now, save that entry to the db
                        entry.save(function(err, doc) {
                            if (err) {
                                console.log(err);
                            } else {;
                                //console.log(doc);
                            }
                        });
                    }
                    // else {
                    //     console.log("find existing record with: " + articleStoryId);
                    // }
                }
            }); //end lookup storyId and save record if it is a new story
        }); //end for each story found in the web page
        res.redirect('/articles');
    }); //end access the web page
});

// This will get the articles we scraped from the mongoDB
router.get("/articles", function(req, res) {
    // Grab at most 15 Articles orded with the most recent first from DB
    Article.find({}).sort({
        date: -1
    }).limit(15).exec(function(error, doc) {
        //do not populate comments!! 
        //only upon one article-click load the comments
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {
            res.render('index', {
                articles: doc
            });
        }
    });
});

// Grab an article by it's ObjectId
router.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    Article.findOne({
            "_id": req.params.id
        })
        // ..and populate all of the comments associated with it with the order of most recent first 
        .populate({
            path: "comments",
            options: {
                sort: [{
                    "createdAt": -1
                }]
            }
        })
        // now, execute our query
        .exec(function(error, doc) {
            // Log any errors
            if (error) {
                console.log(error);
            }
            // Otherwise, send the doc to the browser as a json object
            else {
                res.json(doc);
            }
        });
});

// Create a new comment then redirect to refresh all the comments
router.post("/articles/:id", function(req, res) {
    // Create a new comment and pass the req.body to the entry
    var newComment = new Comment(req.body);

    // And save the new comment the db
    newComment.save(function(error, doc) {
        // Log any errors
        if (error) {
            res.send(error);
        }
        // Otherwise
        else {
            // Use the article id to find and update it's comments
            Article.findOneAndUpdate({
                    "_id": req.params.id
                }, {
                    $push: {
                        "comments": doc._id
                    }
                })
                // Execute the above query
                .exec(function(err, doc) {
                    // Log any errors
                    if (err) {
                        res.send(err);
                    } else {
                        // Or send the document to the browser
                        //console.log("after save:" + JSON.stringify(doc));
                        //res.send(doc); not working as this doc does not with populated "comments"!
                        res.redirect('/articles/' + req.params.id);
                    }
                });
        }
    });
});

// Delete an existing comment then redirect to refresh all the comments
router.post("/comments/:id", function(req, res) {
    // Delete a comment and pass the req.body to the entry
    Comment.findById(req.params.id, function(err, comment) {
        comment.remove(function(err, comment) {
            if (err) {
                res.send(err);
            } else {
                res.redirect('/articles/' + req.body.articleId);
            }
        });
    });
});

module.exports = router;