(function () {
	var $pL = $('#pl-quick-repayment-succeed');
	var $bP = $('.popup-layers-back-plate');

	$('#button-submit-quick-repayment').on('click', function(event) {
		if (event) event.preventDefault();
		$bP.show();
		$pL.show();
		onPopupLayerShow($pL[0]);
	});

	$pL.find('button[button-action="confirm"]').on('click', function(event) {
		if (event) event.stopPropagation();
		$bP.hide();
		$pL.hide();
		setTimeout(function (argument) {
			location.assign('../html/xfzq-bills-recent.html');
		}, 500);
	});
})();