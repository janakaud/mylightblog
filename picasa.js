var SCOPE = "https://picasaweb.google.com/data";
var PATH = "picasa";

var BASE_URL = "https://picasaweb.google.com/data/feed/api/user/default";
var ALBUM_URL = BASE_URL + "/albumid/";

function url(base, params) {
	return base + (params ? params + "&" : "?") + "alt=atom";
}

function listPix() {
	picax("get", url(ALBUM_URL + albums.value, "?fields=entry(title," +
	(withurls.checked ? "content" : "gphoto:id") + ")"), null, function(data) {
		populate(pix, mapAtom(data, function(item) {
			return withurls.checked ? item.content.src.value : item.id;
		}), "title");
		var list = pix.options;
		for (var i = 0; i < list.length; i++) {
			list[i].onselect = list[i].onclick = function() {
				output.innerHTML = '<a href="' + this.value + '">' + this.value + '</a>';
			}
		}
	});
}

function listAlbums() {
	picax("get", url(BASE_URL, "?fields=entry(gphoto:id,title)"), null, function(data) {
		pix.innerHTML = "";
		populate(albums, mapAtom(data), "title");
	});
}

function upload() {
	output.innerHTML = "";
	for (var cnt = 0; cnt < picker.files.length; cnt++) {
		var file = picker.files[cnt];
		var reader = new FileReader();
		reader.onload = function (e) {
			picax("POST", ALBUM_URL + albums.value, e.target.result, function(data) {
				var url = data.entry.content.src.value;
				output.innerHTML += '<br/><a href="' + url + '">' + url + '</a>';
			}, e.target._type, {Slug: e.target._name});
		};
		reader._name = file.name;
		reader._type = file.type;
		reader.readAsArrayBuffer(file);
	}
	picker.value = "";
}

function picax(method, url, data, success, type, headers) {
	var headerMap = headers || {};
	headerMap.Base = url;
	ajax(method, "http://kotrivia.appspot.com", headerMap, data, success, type);
}

function mapAtom(data, idResolver = function(item) { return item.id; }) {
	var list = data.feed.entry;
	if (!(list instanceof Array)) {	// probably a single entry
		list = [list];
	}
	return list.map(function(item) {
		return {id: idResolver(item), title: item.title};
	});
}