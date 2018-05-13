var REDIRECT = "&redirect_uri=http://127.0.0.1/blogger/oauth.html";
var PATH = window.PATH;
if (!PATH) {
	var hash = location.hash;
	var start = hash.indexOf("state");
	if (start < 0) {
		throw Error("state not found");
	}
	var end = hash.indexOf("&", start);
	if (end < 0) {
		end = hash.length;
	}
	PATH = hash.substring(start + 6, end);
}

var pos;

if (!store.ClientId) {
	store.ClientId = prompt("Enter GApp client ID");
}

if ((pos = location.hash.indexOf("access_token=")) != -1) {
	var hash = location.hash;
	hash = hash.substring(pos + 13);
	store.Token = hash.substring(0, hash.indexOf("&"));
	store.Expiry = new Date().getTime() + parseInt(hash.substring(hash.indexOf("expires_in=") + 11)) * 1000;
	window.opener.callback();
	close();

} else if (location.hash.match(/state=\w+/)) {
	location.href = "https://accounts.google.com/o/oauth2/auth?scope=" + store.Scope + "&client_id=" +
	store.ClientId + REDIRECT + "&state=" + PATH + "&response_type=token&authuser=" + (store.User || 0),
	"OAuthor", "width=500,height=500";

} else {
	alert("Authorization failed");
	close();
}