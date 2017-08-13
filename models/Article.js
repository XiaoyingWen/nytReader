// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({
    storyId: {
        type: String,
        unique: true,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    // one article has many comment's ObjectId, ref refers to the Comment model
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
});

// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;