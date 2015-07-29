	document.addEventListener('DOMContentLoaded', function() 
	{
	var roomName = document.getElementById('roomName');		
	var openLink = document.getElementById('open');		
	var newurl;		
		chrome.tabs.query({
			active:true,
			lastFocusedWindow:true
		}, function(result){
			newurl = result[0].url;
		});
    openLink.addEventListener('click',function(){					
		var data={
			link:newurl,
			name:roomName.value			
		}				
		 $.ajax({
              url: "http://localhost:8000/room/create/",
             type: "POST",
              data: data,
              dataType: "text",
			 success: function(responce){
				 var x = jQuery.parseJSON(responce);
				 openRoom("http://localhost:8000/room/"+ x.name);				 
			 }			  			 
         });		 
	});
	});	 
	function openRoom(url)
	{
		chrome.tabs.create({url:url});		
	};	