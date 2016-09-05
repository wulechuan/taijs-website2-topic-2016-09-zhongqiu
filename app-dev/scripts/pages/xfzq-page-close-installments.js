(function () {
	var $pL = $('#pl-close-installments-succeed');
	var $bP = $('.popup-layers-back-plate');

	$('#button-submit-closing-installments').on('click', function(event) {
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
			location.assign('../html/xfzq-close-installments-list.html');
		}, 500);
	});
})();