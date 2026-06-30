$(function() {
    $(".rslides").responsiveSlides();
    $(".reveal").click(function(){
	    $(this).parent().next(".detail").slideToggle();
	    return false;
    });
    $(".nav_toggle").click(function(){
	    $(this).next('.subnav').slideToggle();
    });
 });

