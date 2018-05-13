var store = {};
var handler = {};
["ClientId", "User", "Token", "Expiry", "Scope"].forEach(function(key) {
	handler[key] = {
		get: function() {
			return localStorage[PATH + key];
		},
		set: function(value) {
			localStorage[PATH + key] = value;
		}
	};
});
Object.defineProperties(store, handler);

function expired() {
	return !store.Expiry || (new Date().getTime() - store.Expiry >= 0);
}

function authorize(callback) {
	this.callback = callback;
	store.Scope = SCOPE;
	store.User = prompt("User ID", 3);
	window.open("oauth.html#state=" + PATH);
}

function callWithAuth(callback) {
	if(expired()) {
		authorize(callback);
	} else {
		callback();
	}
}

function populate(list, items, textParam) {
	list.innerHTML = "";
	for(var i in items) {
		list.innerHTML += "<option value='" + items[i].id + "'>" + items[i][textParam] + "</option>";
	}
}

function ajax(method, url, headers, data, success, type) {
	callWithAuth(function() {
		var xhr = new XMLHttpRequest();
		xhr.open(method, url, false);
		headers && Object.entries(headers).forEach(function(e) {
			xhr.setRequestHeader(e[0], e[1]);
		});
		xhr.setRequestHeader("Authorization", "Bearer " + store.Token);

		xhr.onload = function() {
			var content;
			if (this.responseXML) {
				content = {};
				xmlParse(this.responseXML.documentElement, content);
			} else {
				content = JSON.parse(this.responseText);
			}
			success(content);
		};
		xhr.onerror = function(msg) {
			alert(JSON.stringify(msg, undefined, 2));
		};

		if(data) {
			xhr.setRequestHeader("Content-Type", type || "application/json");
			xhr.send(type ? data : JSON.stringify(data));
		} else {
			xhr.send(null);
		}
	});
}

function xmlParse(n, o) {
	var k = n.localName;
	var l = n.children;
	if (!l || l.length == 0) {
		o[k] = n.textContent || n.attributes;
		return;
	}

	var c;
	if (o[k]) {
		if (!(o[k] instanceof Array)) {
			o[k] = [o[k]];
		}
		c = o[k][o[k].length] = {};
	} else {
		c = o[k] = {};
	}

	for (var i = 0; i < l.length; i++) {
		xmlParse(l[i], c);
	}
}