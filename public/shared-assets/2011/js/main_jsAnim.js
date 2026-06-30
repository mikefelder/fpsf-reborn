var _____WB$wombat$assign$function_____=function(name){return (globalThis._wb_wombat && globalThis._wb_wombat.local_init && globalThis._wb_wombat.local_init(name))||globalThis[name];};if(!globalThis.__WB_pmw){globalThis.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opener = _____WB$wombat$assign$function_____("opener");

function init() {		
var manager = new jsAnimManager();  
bunnyFly = document.getElementById("bunny");

manager.registerPosition("bunny");

bunnyFly.setPosition(-300,120); 

var anim = manager.createAnimObject("bunny");
anim.add({property: Prop.positionCircle(false), loop:-5, to: new Pos(-300,158), duration: 2500});}
window.onload = init;

}

/*
     FILE ARCHIVED ON 01:30:42 May 10, 2011 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 18:59:33 Jun 29, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.531
  exclusion.robots: 0.061
  exclusion.robots.policy: 0.053
  esindex: 0.005
  cdx.remote: 18.079
  LoadShardBlock: 117.521 (3)
  PetaboxLoader3.resolve: 89.363 (4)
  PetaboxLoader3.datanode: 80.896 (4)
  load_resource: 83.72
*/