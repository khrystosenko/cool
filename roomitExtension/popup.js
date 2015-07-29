	document.addEventListener('DOMContentLoaded', function() 
	{
		$("#error").hide();
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
		 $.ajax(
		 {
            url: "http://roomit.tv/room/create/",
            type: "POST",
            data: data,
            dataType: "text",
            error: function(xhr,status,error){
              	
            },
			success: function(responce){
				var x = jQuery.parseJSON(responce);
				if(x.error==null){
					openRoom("http://roomit.tv/room/"+ x.name);
				}
				else{$("#error").show();}
			}  			 
        }
    );		 
	});
	});	 
	function openRoom(url){
		chrome.tabs.create({url:url});		
	};	