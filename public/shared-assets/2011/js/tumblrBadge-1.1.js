var _____WB$wombat$assign$function_____=function(name){return (globalThis._wb_wombat && globalThis._wb_wombat.local_init && globalThis._wb_wombat.local_init(name))||globalThis[name];};if(!globalThis.__WB_pmw){globalThis.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opener = _____WB$wombat$assign$function_____("opener");
// tumblrBadge by Robert Nyman, http://www.robertnyman.com/, http://code.google.com/p/tumblrbadge/
var tumblrBadge = function () {
	// User settings
	var settings = {
		userName : "fpsf", // Your Tumblr user name
		itemsToShow : 1, // Number of Tumblr posts to retrieve
		itemToAddBadgeTo : "tumblr-badge", // Id of HTML element to put badge code into
		imageSize : 100, // Values can be 75, 100, 250, 400 or 500
		shortPublishDate : true, // Whether the publishing date should be cut shorter
		timeToWait : 2000 // Milliseconds, 1000 = 1 second
	};
	
	// Badge functionality
	var head = document.getElementsByTagName("head")[0];
	var badgeContainer = document.getElementById(settings.itemToAddBadgeTo);
	if (head && badgeContainer) {
		var badgeJSON = document.createElement("script");
		badgeJSON.type = "text/javascript";
		badgeJSON.src = "http://" + settings.userName + ".tumblr.com/api/read/json?callback=tumblrBadge.listItems&num=" + settings.itemsToShow;
		head.appendChild(badgeJSON);
		
		var wait = setTimeout(function () {
			badgeJSON.onload = null;
			badgeJSON.parentNode.removeChild(badgeJSON);
			badgeJSON = null;
		}, settings.timeToWait);
		
		listItems = function (json) {
			var posts = json.posts,
				list = document.createElement("ul"), 
				post, 
				listItem, 
				text, 
				link, 
				img, 
				conversation, 
				postLink;
			list.className = "tumblr";
			for (var i=0, il=posts.length; i<il; i=i+1) {
				post = posts[i];

				// Only get content for text, photo, quote and link posts
				if (/regular|photo|quote|link|conversation/.test(post.type)) {
					listItem = document.createElement("li");
					postTitle = document.createElement("h3");
					postTitle.className = "tumblr-post-title";
					postTitle.innerHTML = post["regular-title"];		
					listItem.appendChild(postTitle);

					text = post["regular-body"] || post["photo-caption"] || post["quote-source"] || post["link-text"] || post["link-url"] || "";
					if (post.type === "photo") {
						link = document.createElement("a");
						link.href = post.url;
						img = document.createElement("img");
						// To avoid a creeping page
						img.width = settings.imageSize;
						img.src = post["photo-url-" + settings.imageSize];
						link.appendChild(img);
						listItem.appendChild(link);
						text = "<em>" + text + "</em>";
					}
					else if (post.type === "quote") {
						text = post["quote-text"] + "<em>" + text + "</em>";
					}
					else if (post.type === "link") {
						text = '<a href="' + post["link-url"] + '">' + text + '</a>';
					}
					else if (post.type === "conversation") {
						conversation = post["conversation-lines"];
						for (var j=0, jl=conversation.length; j<jl; j=j+1) {
							text += conversation[j].label + " " + conversation[j].phrase + ((j === (jl -1))? "" : "<br>");
						}
					}
					listItem.innerHTML += text;

					// Create a link to Tumblr post
					postLink = document.createElement("a");
					postLink.className = "tumblr-post-date";
					postLink.href = post.url;
					postLink.innerHTML = (settings.shortPublishDate)? post["date"].replace(/(^\w{3},\s)|(:\d{2}$)/g, "") : post["date"];
					listItem.appendChild(postLink);

					// Apply list item to list
					list.appendChild(listItem);
				}
			}
			
			// Apply list to container element
			badgeContainer.innerHTML = "";
			badgeContainer.appendChild(list);
		};
		
		return {
			listItems : listItems
		};
	}
}();
}

/*
     FILE ARCHIVED ON 01:31:37 May 10, 2011 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 16:04:36 Jun 27, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.506
  exclusion.robots: 0.049
  exclusion.robots.policy: 0.038
  esindex: 0.01
  cdx.remote: 16.934
  LoadShardBlock: 177.203 (3)
  PetaboxLoader3.datanode: 106.132 (4)
  PetaboxLoader3.resolve: 187.441 (2)
  load_resource: 150.252
*/