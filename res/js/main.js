/*~~~~~~~~~~~~~~~~~~~~ VARIABLES ~~~~~~~~~~~~~~~~~~~~*/
var limit = 25;
var langID = 0;
var page = 1;
var firstPID = "";
var lastPID = "";

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

function clearCurrentPosts() {
	$("#margin ol").empty();
	$("#posts").empty();
}

function displayRedditPosts(posts) {
	clearCurrentPosts();
	for (i = 0; i < posts.length; i++) { 
		var post = posts[i];		
		var postElement = getPostElement(langID, post.type);
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
					$(this).html(post.title.capitalize().replace(/\W|_/g, '').substring(0, 25));
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
						$(this).attr("uuid", post.id);
						$(this).attr("src", post.url);
					}
					break;
				default:
					console.log("Unknown field '" + (this).attr("field") + "' found on post type '" + getPostID(langID, post.type) + "'");
					$(this).html("Unknown Field");
			}
		});
		addLines(postElement.find("li").length)
		$("#posts").append(postElement);
	}	
}

function getJSONFrom(url, callback) {
	$.getJSON(url, function(data) {
    	callback(data);
    	return data;
	});
}

function getLanguageType(languageID) {
	switch (languageID) {
		case 0:
			return "swift-";
			break;
		default:
			return "swift-";
	}
}

function getPostElement(languageID, postID) {
	var element =  $("#" + getPostID(languageID, postID)).clone();
	$("#posts").append(element);
	return element;
}

function getPostID(languageID, postID) {
	return getLanguageType(languageID) + getPostType(postID);
}

function getPostType(postID) {
	switch (postID) {
		case 0:
			return "post-img";
			break;
		case 1:
			return "post-text";
			break;
		case 2:
			return "post-link";
			break;
		default:
			return "post-text";
	}
}

function getRedditPosts(direction, callback) {
	var getVar = "?limit=" + String(limit)
	if (direction != undefined && direction != null) {
		if (lastPID != undefined && lastPID != null && direction == "next") {
			page++;
			getVar += "&after=t3_" + lastPID;
		} else if (firstPID != undefined && firstPID != null && direction == "prev" && page > 1) {
			page--;
			getVar += "&before=t3_" + firstPID;
		}
	}
	console.log("https://www.reddit.com/r/starwarsmemes/.json" + getVar);
	getJSONFrom("https://www.reddit.com/r/starwarsmemes/.json" + getVar, function (posts) {
		callback(posts);
		console.log(posts)
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
	firstPID = posts[0].id
	lastPID = posts[posts.length - 1].id
	return posts
}

function addLines(lineCount) {
	for(var i = 0; i < lineCount; i++) {
		$("#margin ol").append("<li/>")
	}
}

function loadRedditPosts(direction) {
	getRedditPosts(direction, function(jsonPosts) {
		var posts = parseRedditPosts(jsonPosts);
		displayRedditPosts(posts);
		$(".image-link").on("click", function(){
			$(".image-view[uuid='" + $(this).attr("uuid") + "']").toggle();
		});
	});
}
	

/*~~~~~~~~~~~~~~~~~~~~~~~ SCRIPT ~~~~~~~~~~~~~~~~~~~~~~*/
$(function() {  
	loadRedditPosts("prev");

	$("#prevPage").on("click", function(){
		loadRedditPosts("prev");
	});
	$("#nextPage").on("click", function(){
		loadRedditPosts("next");
	});
});