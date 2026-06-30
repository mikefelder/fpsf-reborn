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



