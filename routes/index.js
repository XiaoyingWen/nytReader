var express = require('express');
var router = express.Router();
var Comment = require("./../models/Comment.js");
var Article = require("./../models/Article.js");
var request = require("request");
var cheerio = require("cheerio");

/* GET home page. */
router.get('/', function(req, res, next) {
	// A GET request to scrape the echojs website
	  request("https://www.nytimes.com/section/health", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(html);
      // Now, we grab every h2 within an article tag, and do the following:

      $("article.story.theme-summary.has-kicker").each(function(i, element) {

        var articleStoryId = $(element).parent().attr('id') || "0";
        console.log("check any record with storyId: '" + articleStoryId +"'");
        Article.find({storyId: articleStoryId}).exec(function(error, doc) {
          if (error) {
            console.log(error);
          }
          // Or send the doc to the browser as a json object
          else {
            if(doc.length === 0){
               console.log("add: " + articleStoryId);

               // Save these results in an object that we'll push into the results array we defined earlier
                var result = {};
                result.link = $(element).find('a').attr("href").trim();
                result.summary = $(element).find('p.summary').text().trim();
                result.title = $(element).find('h2.headline').text().trim();
                result.date = $(element).children('footer').children('time').text().trim();
                result.storyId = $(element).parent().attr('id');

                // Using our Article model, create a new entry
                // This effectively passes the result object to the entry (and the title and link)
                var entry = new Article(result);

                // Now, save that entry to the db
                entry.save(function(err, doc) {
                  // Log any errors
                  if (err) {
                    console.log(err);
                  }
                  // Or log the doc
                  else {
                    console.log(doc);
                  }
                });
            } else {
              console.log("find existing record with: " + articleStoryId);
            }
          }
        });  //lookup storyId and save record if it is a new story
      }); //for each story found in the web page
  }); //access the web page

  res.redirect('/articles');
});

// This will get the articles we scraped from the mongoDB
router.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}).sort({ _id: -1 }).limit(15).exec(function(error, doc) {
    //do not populate comments!! 
    //only upon one article-click load the comments
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      var hbsObject = {
        articles: doc
      };
      res.render('index', hbsObject);  //index page should be the only page 
    }
  });
});

// Grab an article by it's ObjectId
router.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("comments")
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

// Create a new comment
router.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newComment = new Comment(req.body);

  // And save the new note the db
  newComment.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
      res.send(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "comments": doc._id } })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
          res.send(err);
        }
        else {
          // Or send the document to the browser
          //console.log("after save:" + JSON.stringify(doc));
          //res.send(doc); not working as this doc does not populate("comments")!!!
          res.redirect('/articles/'+ req.params.id);
        }
      });
    }
  });
});

// Delete a new comment
router.post("/comments/:id", function(req, res) {
  console.log("get: " +req);
  // Create a new note and pass the req.body to the entry
  Comment.findById(req.params.id, function (err, comment) {
    comment.remove(function (err, comment) {
  if (err) {
      console.log(err);
      res.send(err);
  } else{
      res.redirect('/articles/'+ req.body.articleId);
  }
});
  });
});

module.exports = router;  