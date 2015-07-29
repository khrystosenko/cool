chrome.tabs.onActivated.addListener(
		function (activeInfo){	
			chrome.tabs.get(activeInfo.tabId, function(tab){
				if(tab.url.indexOf("twitch.tv")>=0){
					
					chrome.browserAction.setIcon({path:"rLogo.png"});
					chrome.browserAction.setTitle({title:"Create room on Roomit.tv"});
					chrome.browserAction.setPopup({popup:"popup.html"});					
				}
				else{
					chrome.browserAction.setIcon({path:"rLogoDis.png"});
					chrome.browserAction.setPopup({popup:""});
					chrome.browserAction.setTitle({title:"Cannot create a room with this link"});
				
				}
			})
		}
	);


chrome.tabs.onUpdated.addListener(
	function(tabId, changeInfo, tab)
	{
			if(changeInfo.url.indexOf("twitch.tv")>=0){
					
					chrome.browserAction.setIcon({path:"rLogo.png"});
					chrome.browserAction.setTitle({title:"Create room on Roomit.tv"});
					chrome.browserAction.setPopup({popup:"popup.html"});					
				}
				else{
					chrome.browserAction.setIcon({path:"rLogoDis.png"});
					chrome.browserAction.setPopup({popup:""});
					chrome.browserAction.setTitle({title:"Cannot create a room with this link"});
				
				}
	}
	);
	