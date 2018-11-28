var SCOPE = "https://www.googleapis.com/auth/blogger";
var PATH = "blogger";

var BASE_URL = "https://www.googleapis.com/blogger/v3/";
var BLOG_URL = BASE_URL + "blogs/";

var dirty;

function listPosts(all) {
	blog("get", BLOG_URL + blogs.value + "/posts?status=draft" + (all ? "&status=live" : "") + "&fields=items(id,title)", null, function(data) {
		populate(posts, data.items, "title");
	});
}

function searchPosts() {
	blog("get", BLOG_URL + blogs.value + "/posts/search?q=" + search.value + "&fields=items(id,title)", null, function(data) {
		populate(posts, data.items, "title");
	});
}

function listBlogs() {
	blog("get", BASE_URL + "users/self/blogs?fields=items(id,name)", null, function(data) {
		posts.innerHTML = "";
		populate(blogs, data.items, "name");
	});
}

function loadPost() {
	if(!dirty || confirm("Post has been modified. Are you sure you want to discard?")) {
		blog("get", BLOG_URL + blogs.value + "/posts/" + posts.value + "?view=AUTHOR&fields=title,content,labels", null, function(data) {
			title.value = data.title;
			input.value = data.content;
			labels.value = (data.labels || []).join(", ");
			dirty = false;
		});
	}
}

function submit(method, url) {
	if(dirty) {
		var labelTxt = labels.value;
		var labelList = [];
		if(labelTxt.length > 0)
			labelList = labelTxt.split(/,\s*/g);
		for(var i in labelList) {
			if(labelList[i] == "") {
				alert("Invalid label");
				return;
			}
		}
		blog(method, url, {"content": input.value, "title": title.value, "labels": labelList}, function(data) {
			alert("Success!");
			dirty = false;
		});
	} else {
		alert("Nothing to save!");
	}
}

function newPost() {
	submit("post", BLOG_URL + blogs.value + "/posts?isDraft=" + !(confirm("Publish the post now?")) + "&fields=");
}

function update() {
	submit("put", BLOG_URL + blogs.value + "/posts/" + posts.value + "?fields=");
}

function setPublished(publish) {
	var choice = publish ? ["publish", "publish"] : ["unpublish", "revert"];
	if(confirm("Are you sure you want to " + choice[0] + " this post?")) {
		blog("post", BLOG_URL + blogs.value + "/posts/" + posts.value + "/" + choice[1] + "?fields=", null, function(data) {
			alert("Success!");
		});
	}
}

function publish() {
	setPublished(true);
}

function unpublish() {
	setPublished(false);
}

function delPost() {
	if(confirm("Are you sure you want to delete this post?")) {
		blog("delete", BLOG_URL + blogs.value + "/posts/" + posts.value, null, function(data) {
			alert("Success!");
		});
	}
}

function blog(method, url, data, success) {
	ajax(method, url, null, data, success);
}

function dirtify() {
	dirty = true;
	show();
}

function show() {
	preview.innerHTML = input.value;
}

labels.onchange = input.onchange = title.onchange = dirtify;
input.onkeyup = show;

labels.onblur = input.onblur = title.onblur = function() {
	localStorage.input = input.value;
	localStorage.title = title.value;
	localStorage.labels = labels.value;
};
input.value = localStorage.input || "";
title.value = localStorage.title || "";
labels.value = localStorage.labels || "";