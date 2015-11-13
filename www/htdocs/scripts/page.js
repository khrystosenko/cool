function hideList(selector) {
    var time = 0;
    var el = document.getElementById('more');
    $(selector).find('li').velocity(
        { translateX: "0"},
        { duration: 0 });

    $(selector).find('li').each(function() {
      $(this).velocity(
        { display: "none", opacity: "0", translateX: "-100px"},
        { duration: 800, delay: time, easing: [60, 10] });
      time += 120;
      el.classList.remove('active');
      setTimeout(function () {
      document.getElementById('drop-more').style.display="none";
	  }, 700);
    });
  };

function hideShow(select){
	var el = document.getElementById('more');
	if (el.className == 'items item-4 active'){
		hideList(select);
	}
	else {
		Materialize.showStaggeredList(select);
		$(select).find('li').each(function() {
      	$(this).velocity(
        { opacity: "0.5"});
        }); 
		document.getElementById('drop-more').style.display="block";
		el.classList.add('active');
	}
}

 $(document).ready(function() {


});