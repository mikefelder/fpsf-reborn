var _____WB$wombat$assign$function_____=function(name){return (globalThis._wb_wombat && globalThis._wb_wombat.local_init && globalThis._wb_wombat.local_init(name))||globalThis[name];};if(!globalThis.__WB_pmw){globalThis.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opener = _____WB$wombat$assign$function_____("opener");
/**
 * @author andreaseriksson
 */
      $(document).ready(function() {
		var slideInterval = 10000;
		var animationSpeed = 2000;	
		
		window.setInterval(function() {
		
		  	var firstItem = $('#ul_list2 > li:first ');
			var itemHeight = firstItem.height() + 
							parseInt(firstItem.css("paddingTop")) + 
							parseInt(firstItem.css("paddingBottom") +
							parseInt(firstItem.css("marginTop")));
			
			$('#ul_list2 > li:first ')
				.animate({
					marginTop: (-itemHeight - parseInt(firstItem.css("marginBottom")))
				}, animationSpeed, "linear", function() {
					$('#ul_list2 > li:first ').remove()
					firstItem.css("marginTop", 0)
					$('#ul_list2').append(firstItem)
				})
		}, slideInterval);
      });



}

/*
     FILE ARCHIVED ON 14:06:40 Feb 07, 2011 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 16:03:50 Jun 27, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.345
  exclusion.robots: 0.038
  exclusion.robots.policy: 0.031
  esindex: 0.006
  cdx.remote: 11.708
  LoadShardBlock: 61.234 (3)
  PetaboxLoader3.datanode: 72.813 (4)
  load_resource: 77.361
  PetaboxLoader3.resolve: 45.077
*/