(function () {
	$('#button-login-in-splash-block').on('click', function () {
		onUserLogdIn();
	});


	var $expandablePanel = $('#credit-details-pane .expandable');
	$('#credit-details-pane .docking button').on('click', function(event) {
		$expandablePanel.toggleClass('expanded');
	});



	var $bP = $('.popup-layers-back-plate');
	var $pL1 = $('#pl-index-user-guide');
	var $pL2 = $('#pl-taijs-app-promotion');


	function onUserLogdIn() {
		$('html').addClass('user-has-logged-in');
		$bP.show();
		$pL1.show();
		// $expandablePanel.addClass('expanded');
	}

	$('#index-user-guide-step-1 img').on('click', function () {
		$bP.hide();
		$pL1.hide();
	});


	$('#credit-abstract-pane .operations button').on('click', function(event) {
		if (event) event.preventDefault();
		$bP.show();
		$pL2.show();
		// onPopupLayerShow($pL[0]);
	});

	$pL2.find('.button-x').on('click', function(event) {
		$bP.hide();
		$pL2.hide();
	});
})();