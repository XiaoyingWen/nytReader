function refreshComments(data){
  //console.log(data);

  // Empty the comments section
  $("#comments").empty();

  // The title of the article
  $("#comments").append('<a href="#" class="commfor"><span class="glyphicon glyphicon-comment"></span> ' + data.title + "</a>");

  // The comments of the article
  data.comments.forEach(function(element) {
  //console.log(element);
  /*$('<div/>')
    .attr("id", "newDiv1")
    .addClass("newDiv purple bloated")
    .append("<span/>")
      .text("hello world")*/
      var commbox = $('<div/>').addClass("commentbox");
      /*var speaker = $('<div/>').addClass("speaker").text(element.readerName
        +' <span class="commdt">Posted on: ' + moment(element.createdAt).format("MMM Do YYYY, h:mm:ss a")+"</span>");  */   
      commbox.append('<div class="speaker">'+element.readerName
        +' <span class="commdt">Posted on: ' //fromNow() //format("MMM Do YYYY, h:mm:ss a")
        + moment(element.createdAt).fromNow()+"</span>");     

      commbox.append('<div class="readercomm">'+element.body
        + " <a href='#' data-id='" + element._id 
      + "' article-id='" + data._id 
      + "' id='deletecomment'><span class='glyphicon glyphicon-remove'></span></a></div>");

    $("#comments").append(commbox);
  /*  $("#comments").append("<button data-id='" + element._id 
      + "' article-id='" + data._id + "'' id='deletecomment'>X</button>");

    $("#comments").append("<a href='#' data-id='" + element._id 
      + "' article-id='" + data._id 
      + "' id='deletecomment'><span class='glyphicon glyphicon-remove'></span></a>");*/
  });

      var newcommbox = $('<div/>');
newcommbox.append('<div class="newcomm">Add comment</div>');
  // An input to enter reader name
  newcommbox.append("<p>* Your Name:</p><input id='readerinput' name='reader' >");
      
  // A textarea to add a new comment body
  newcommbox.append("<p>* Enter Comment:</p><textarea id='bodyinput' name='body'></textarea>");

  // A button to submit a new comment, with the id of the article saved to it
  newcommbox.append("<button class='btn btn-primary' type='submit' data-id='" + data._id + "' id='savecomment'>Save Comment</button>");
      $("#comments").append(newcommbox);
}

// Whenever someone clicks a p tag
$(document).on("click", ".story", function() {
  // Empty the comments from the comment section
  $("#comments").empty();
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

// When you click the savecomment button
$(document).on("click", "#savecomment", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
if( $("#readerinput").val() && $("#bodyinput").val()){
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
  $("#readerinput").val("");
  $("#bodyinput").val("");}
  else{
    alert("Both your name and the comment are required.")
  }
});


// When you click the delete comment button
$(document).on("click", "#deletecomment", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the comment, using what's entered in the inputs
  $.ajax({
    method: "POST", //"DELETE" delete not working when try to refresh even though data is deleted
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
