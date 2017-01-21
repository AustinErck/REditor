/*~~~~~~~~~~~~~~~~~~~~ VARIABLES ~~~~~~~~~~~~~~~~~~~~*/
var count = 25;
var langID = 0;
var afterPID = "";
var beforePID = "";

/*~~~~~~~~~~~~~~~~~~~~~ CLASSES ~~~~~~~~~~~~~~~~~~~~~*/
function Post(id, score, author, subreddit, title, url, text){
	this.id = id
	this.score = score
	this.author
	this.subreddit = subreddit
	this.title = title
	this.url = url
	this.text = text

	if(isImgURL(url)) {
		this.type = 0 //Image
	} else if(text != undefined && text != "" && text != null) {
		this.type = 1 //Text
	} else {
		this.type = 2 //Link
	}
}

/*~~~~~~~~~~~~~~~~~~~~~ FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~*/
String.prototype.capitalize = function(){
	return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
};

function displayRedditPosts(posts) {
	var prefix = "";
	switch (langID) {
		case 0:
			prefix = "swift-"
			break;
	}
	for (i = 0; i < posts.length; i++) { 
		var post = posts[i];
		var postType = "";
		switch (post.type) {
			case 0:
				postType = "post-img"
				break;
			case 1:
				postType = "post-text"
				break;
			case 2:
				postType = "post-link"
				break;
		}
		var postElement = $("#" + prefix + postType).clone()
		postElement.removeAttr("id")
		postElement.find(".field").each(function(){
			switch($(this).attr("field")) {
				case "score":
					$(this).html(post.score);
					break;
				case "subreddit":
					$(this).html("." + post.subreddit.toLowerCase());
					break;
				case "author":
					$(this).html('"' + post.author + '"');
					break;
				case "full-title":
					$(this).html('"' + post.title + '"');
					break;
				case "small-title":
					$(this).html(post.title.capitalize().replace(/\W|_/g, '').substring(0, 25))
					break;
				case "text":
					if(post.type == 1) {
						$(this).html(post.text);
					}
					break;
				case "url":
					if(post.type == 0) {
						$(this).html('"<a class="image-link" uuid="' + post.id + '">' + post.url + '</a>"');
					} else if(post.type == 2) {
						$(this).html('"<a class="image-link" uuid="' + post.id + '" target="_blank" href="' + post.url + '">' + post.url + '</a>"');
					}
					break;
				case "image":
					if(post.type == 0) {
						$(this).attr("uuid", post.id)
						$(this).attr("src", post.url)
					}
					break;
			}
		});
		$("#editor").append(postElement);
	
	}	
}

function getJSONFrom(url, callback) {
	$.getJSON(url, function(data) {
    callback(data);
    return data;
	});
}

function getRedditPosts(callback) {
	var getString = "?count=" + String(count)
	if (afterPID != undefined && afterPID != "") {
		getString += "&after=" + afterPID
	}
	if (beforePID != undefined && beforePID != "") {
		getString += "&before=" + beforePID
	}
	getJSONFrom("http://www.reddit.com/.json" + getString, function (posts) {
		callback(posts);
		return posts
	});
}

function isImgURL(url) {
   return(url.match(/\.(jpeg|jpg|gif|png|gifv)$/) != null);
}

function parseRedditPosts(obj) {
	var posts = [];
	var jsonPosts = obj["data"]["children"];
	for (i = 0; i < jsonPosts.length; i++) { 
		var post = jsonPosts[i];
		var id = post["data"]["id"]
		var score = post["data"]["score"]
		var author = post["data"]["author"]
		var subreddit = post["data"]["subreddit"]
		var title = post["data"]["title"]
		var url = post["data"]["url"]
		var text = post["data"]["selftext"]
		var postObj = new Post(id, score, author, subreddit, title, url, text)
		posts.push(postObj)
	}
	return posts
}

function updateLineCount() {
	for(var i = 0; i < 2000; i++) {
		$("#margin ol").append("<li/>")
	}
}

function updateRedditPosts() {
	getRedditPosts(function(jsonPosts) {
		var posts = parseRedditPosts(jsonPosts);
		displayRedditPosts(posts);
		afterPID = jsonPosts["data"]["after"];
		beforePID = jsonPosts["data"]["before"];	
		$(".image-link").on("click", function(){
			$(".image-view[uuid='" + $(this).attr("uuid") + "']").toggle();
		});
	});
}
	

/*~~~~~~~~~~~~~~~~~~~~~~~ SCRIPT ~~~~~~~~~~~~~~~~~~~~~~*/
$(function() {  
	updateRedditPosts()
	updateLineCount()
});