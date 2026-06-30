function init() {		
var manager = new jsAnimManager();  
bunnyFly = document.getElementById("bunny");

manager.registerPosition("bunny");

bunnyFly.setPosition(-300,120); 

var anim = manager.createAnimObject("bunny");
anim.add({property: Prop.positionCircle(false), loop:-5, to: new Pos(-300,158), duration: 2500});}
window.onload = init;

