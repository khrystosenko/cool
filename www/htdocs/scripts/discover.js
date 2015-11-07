function loadDoc() {
            $.ajax({url: "http://localhost:8000/search/?limit=2", success: function(result){
        	console.log(result);
        	var streams = result; 
    		}
    	})
        };