function refreshComments(data) {
    //console.log(data);

    //TODO should only empty the comments not the new comment form
    // Empty the comments section
    $("#comments").empty();

    // The title of the article
    $("#comments").append('<a href="#" class="commfor"><span class="glyphicon glyphicon-comment"></span> ' + data.title + "</a>");

    // The comments of the article
    data.comments.forEach(function(element) {
        /*Not to use the following because any tag given to .text will be content 
        and not function as html tag.
        $('<div/>')
          .attr("id", "newDiv1")
          .addClass("newDiv purple bloated")
          .append("<span/>")
          .text("hello world")*/
        var commbox = $('<div/>').addClass("commentbox");

        commbox.append('<div class="speaker">' + element.readerName +
            ' <span class="commdt">Posted ' // use fromNow() instead of format("MMM Do YYYY, h:mm:ss a")
            +
            moment(element.createdAt).fromNow() + "</span>");

        commbox.append('<div class="readercomm">' + element.body +
            " <a href='#' data-id='" + element._id +
            "' article-id='" + data._id +
            "' id='deletecomment'><span class='glyphicon glyphicon-remove'></span></a></div>");

        $("#comments").append(commbox);
    });

    // The new comment submission box
    var newcommbox = $('<div/>');
    newcommbox.append('<div class="newcomm">Your Comment</div>');

    //TODO use label and better error info display
    // An input to enter reader name
    newcommbox.append("<div>* Name:</div><input id='readerinput' name='reader' >");

    // A textarea to add a new comment body
    newcommbox.append("<div>* Enter Comment:</div><textarea id='bodyinput' name='body'></textarea>");

    // A button to submit a new comment, with the id of the article saved to it
    newcommbox.append("<button class='btn btn-primary' type='submit' data-id='" +
        data._id + "' id='savecomment'>Post Comment</button>");

    $("#comments").append(newcommbox);
}

// Whenever the p tag of the article is clicked
$(document).on("click", ".story", function() {
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
        // With that done, add the comment information to the page
        .done(function(data) {
            refreshComments(data);
        });
});

// When the savecomment button is clicked
$(document).on("click", "#savecomment", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    //save the comment only when requred fields are entered
    if ($("#readerinput").val() && $("#bodyinput").val()) {
        // Run a POST request to change the comment, using what's entered in the inputs
        $.ajax({
                method: "POST",
                url: "/articles/" + thisId,
                data: {
                    // Value taken from title input
                    readerName: $("#readerinput").val(),
                    // Value taken from comment textarea
                    body: $("#bodyinput").val()
                }
            })
            // With that done
            .done(function(data) {
                refreshComments(data);
            });

        // Also, remove the values entered in the input and textarea for comment entry
        //not needed as these will be repaint
        //$("#readerinput").val("");
        //$("#bodyinput").val("");
    } else {
        alert("Both your name and the comment are required.")
    }
});


// When the delete icon of the comment is clicked
$(document).on("click", "#deletecomment", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the comment, using what's entered in the inputs
    //TODO "DELETE" delete not working when try to refresh even though data is deleted
    $.ajax({
            method: "POST",
            url: "/comments/" + thisId,
            data: {
                // Value taken from title input
                articleId: $(this).attr("article-id")
            }
        })
        // With that done
        .done(function(data) {
            refreshComments(data);
        });
});