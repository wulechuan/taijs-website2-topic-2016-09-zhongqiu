(function () {
	window.console = window.console || { log: function () {} };
	var ua = navigator.userAgent;
	// var isIE = !!ua.match(/(\bmsie|\btrident\b)/i);
	var isMSEdge = !!ua.match(/\bedge\b/i);
	var isIE8 = !!ua.match(/\bmsie\s+8/i);
	var isIE9 = !!ua.match(/\bmsie\s+9/i);

	var isWebkit = !!ua.match(/\bapplewebkit\b/i) && !isMSEdge;

	if (isWebkit) {
		$('body').addClass('webkit');
	}

	if (!Array.isArray) {
		Array.isArray = function(arg) {
			return Object.prototype.toString.call(arg) === '[object Array]';
		};
	}

	// if (isIE8) {
	// 	$('.f-list > li .timestamp').each(function () {
	// 		this.innerHTML = '2013-05-15 11:55';
	// 	});
	// } else {
	// 	$('.f-list > li .timestamp > time').html('2013-05-15 11:55');
	// }

	function processParametersPassedIn() {
		var qString = location.href.match(/\?.*/);
		if (qString) qString = qString[0].slice(1);

		var qKVPairs = [];
		if (qString) {
			qKVPairs = qString.split('&');
		}

		var psn1; // page sidebar nav Level 1 current
		var psn2; // page sidebar nav Level 2 current
		var tabLabel; // id of tabLabel to show if any
		var bank;
		var bankHTML;

		if (typeof window.psn === 'object') {
			if (window.psn.level1) psn1 = window.psn.level1;
			if (window.psn.level2) psn2 = window.psn.level2;
		}

		for (var i in qKVPairs){
			var kvpString = qKVPairs[i];
			var kvp = kvpString.split('=');

			if (kvp[0] === 'psn1') psn1 = kvp[1];
			if (kvp[0] === 'psn2') psn2 = kvp[1];
			if (kvp[0] === 'tabLabel') tabLabel = kvp[1];
			if (kvp[0] === 'bank') bank = kvp[1];
			if (kvp[0] === 'bankHTML') bankHTML = kvp[1];
		}

		return {
			bank: decodeURIComponent(bank),
			bankHTML: decodeURIComponent(bankHTML).replace(/\+/g, ' '),
			tabLabel: tabLabel,
			psn: {
				level1: psn1,
				level2: psn2
			}
		};
	}


	var urlParameters = processParametersPassedIn();


	var bodyClickListener = new function () {
		this.registeredElements = [];

		this.register = function (elements, callback) {
			if (typeof callback !== 'function') return false;

			if (!Array.isArray(elements)) elements = [elements];
			for (var i = 0; i < elements.length; i++) {
				var el = elements[i];
				if (!el) continue;
				this.registeredElements.push({
					element: el,
					callback: callback
				});
			}
		};

		this.broadCastOutsideClickToRegisteredElements = function (clickedEl) {
			for (var i = 0; i < this.registeredElements.length; i++) {
				var record = this.registeredElements[i];
				var el = record.element;
				var isOutside = this.testClickOutsideElement(el, clickedEl);
				if (isOutside) {
					record.callback(clickedEl);
				}
			}
		};

		this.testClickOutsideElement = function (testEl, clickedEl) {
			if (!testEl || !clickedEl) return true;

			while (clickedEl && clickedEl!==document.body && clickedEl!==testEl) {
				clickedEl = clickedEl.parentNode;
			}

			return testEl !== clickedEl;
		};

		var thisController = this;
		function _init() {
			$('body').on('click', function (event) {
				var clickedEl = event.target;
				thisController.broadCastOutsideClickToRegisteredElements(clickedEl);
			});
		}

		_init.call(this);
	}();


	window.onPopupLayerShow = function(popupLayer) {
		if (!isIE9) return true;
		var popupWindow = $(popupLayer).find('.popup-window')[0];
		var currentWidth = $(popupWindow).outerWidth();

		if (popupWindow) popupWindow.style.width = currentWidth + 'px';
	};


	$('input[placeholder]').each(function () {
		function _updateInputStyleForGroomingPlaceholder(field) {
			if (!field) {
				return false;
			}

			var tagNameLC = field.tagName.toLowerCase();
			if (tagNameLC !== 'input' && tagNameLC !== 'textarea') {
				return false;
			}

			var classNameToDealWith = 'empty-field';
			if (field.value) {
				$(field).removeClass(classNameToDealWith);
			} else {
				$(field).addClass(classNameToDealWith);
			}
		}

		_updateInputStyleForGroomingPlaceholder(this);

		if (isIE8) {
			$(this).on('focus', function () {
				_updateInputStyleForGroomingPlaceholder(this);
			});

			$(this).on('blur', function () {
				_updateInputStyleForGroomingPlaceholder(this);
			});

			$(this).on('change', function () {
				_updateInputStyleForGroomingPlaceholder(this);
			});

			$(this).on('keypress', function () {
				_updateInputStyleForGroomingPlaceholder(this);
			});
		} else {
			$(this).on('input', function () {
				_updateInputStyleForGroomingPlaceholder(this);
			});
		}
	});


	$('.tab-panel-set').each(function () {
		var $allPanels = $(this).find('.panel');
		if ($allPanels.length < 1) return false;

		var $tabList = $(this).find('.tab-list');
		var $allTabs = $tabList.find('> li');

		$allPanels.each(function () {
			this.elements = { tab: null };
		});

		$allTabs.each(function (index, tab) {
			var panelId = tab.getAttribute('aria-controls');
			var panel = $('#'+panelId)[0];

			if (!panel) throw('Can not find controlled panel for tab [expected panel id="'+panelId+'"].');

			panel.elements.tab = tab;
			tab.elements = { panel: panel };
		});



		var currentTab = null;
		var currentItemHint = $tabList.find('> .current-item-hint')[0];


		if ($allTabs.length > 1) {
			$allTabs.on('click', function () {
				_showPanelAccordingToTab(this);
			});
			$allTabs.on('mouseover', function () {
				_slideHintToTab(this);
			});
			$tabList.on('mouseout', function () {
				_slideHintToTab(currentTab);
			});
		}

		if ($allTabs.length < 1 || $allPanels.length === 1) {
			_showPanel($allPanels[0]);
		} else {
			var tabToShowAtBegining = $('#panel-tab-'+urlParameters.tabLabel).parent()[0] || $allTabs[0];
			_showPanelAccordingToTab(tabToShowAtBegining);
		}


		function _slideHintToTab(theTab) {
			if (!currentItemHint) return false;

			var currentItemHintCssLeft = -20;

			if (!theTab) {
				currentItemHint.style.clip = '';
				return true;
			}

			var _P = $(theTab).offsetParent();
			var _L = $(theTab).offset().left;
			var _LP = $(_P).offset().left;

			_L -= _LP;
			_L -= currentItemHintCssLeft;

			var _W = $(theTab).outerWidth();

			var _R = _L+_W;


			currentItemHint.style.clip = 'rect(0px, '+
				_R+'px, 2px, '+
				_L+'px)'
			;

			return true;
		}

		function _showPanelAccordingToTab(theTab) {
			currentTab = theTab;
			_slideHintToTab(theTab);

			var thePanel = null;
			if (theTab && theTab.elements) thePanel = theTab.elements.panel;
			_showPanel(thePanel);
		}

		function _showPanel(thePanel) {
			var currentTab = null;
			if (thePanel && thePanel.elements) currentTab = thePanel.elements.tab;
			_slideHintToTab(currentTab);

			for (var i = 0; i < $allPanels.length; i++) {
				var panel = $allPanels[i];
				_showHideOnePanel(panel, (thePanel && panel === thePanel));
			}
		}

		function _showHideOnePanel(panel, isToShow) {
			if (!panel) return false;

			var tab = panel.elements.tab;

			if (isToShow) {
				panel.setAttribute('aria-hidden', false);
				$(tab).addClass('current');
				$(panel).addClass('current');
			} else {
				panel.setAttribute('aria-hidden', true);
				$(tab).removeClass('current');
				$(panel).removeClass('current');
			}

			return true;
		}
	});


	$('dl.initially-collapsed').each(function (index, dl) {
		var forceUpdatingContainer = null;
		if (isIE8) {
			forceUpdatingContainer = dl.parentNode
				// || $(this).parents('.page-content')[0]
				// || $(this).parents('.page')[0]
				// || document.body
			;
		}

		var $allDTs = $(this).find('> dt');
		var $allDDs = $(this).find('> dd');

		$allDTs.each(function (index, dt) {
			var dd = $(dt).find('+ dd')[0];
			if (!dd) throw('Can not find <dd> right after a <dt> element.');

			var ddContent = $(dd).find('> .content')[0];
			if (!ddContent) throw('Can not find .content within a <dd> element.');

			dd.elements = { dt: dt, content: ddContent };
			dt.elements = { dd: dd };

			$(dd).removeClass('expanded');

			if (isIE9) {
				dd.style.display = 'none';

				// height values and transitions would effect jQuery sliding
				dd.style.height = 'auto';
				// dd.style.transitionProperty = 'none';
			}
		});


		$allDTs.on('click', function () {
			_showDDAccordingToDT(this);
		});


		_showDDAccordingToDT(null);



		function _showDDAccordingToDT(dt) {
			var theDD = null;
			if (dt) theDD = dt.elements.dd;

			for (var i = 0; i < $allDDs.length; i++) {
				var dd = $allDDs[i];
				if (theDD && dd === theDD) {
					_processOnePairOfDTDD(dd, 'toggle');
				} else {
					_processOnePairOfDTDD(dd, 'collapse');
				}
			}

			if (isIE8) {
				if (forceUpdatingContainer) {
					forceUpdatingContainer.visibility = 'hidden';
					setTimeout(function () {
						forceUpdatingContainer.visibility = '';
					}, 0);
				}
			}
		}

		function _processOnePairOfDTDD(dd, action) {
			if (!dd) return false;

			var dt = dd.elements.dt;
			var content = dd.elements.content;

			if (!dt) return false;
			if (!content) return false;

			var $dt = $(dt);
			var $dd = $(dd);
			var $content = $(content);

			var ddNewHeight;
			var ddContentCurrentHeight;

			var wasCollapsed = !$dd.hasClass('expanded');
			var needAction = (!wasCollapsed && action==='collapse') || (action==='toggle');
			if (!needAction) {
				return true;
			}


			if (isIE8) { // update className BEFORE animation
				if (wasCollapsed) {
					ddContentCurrentHeight = $content.outerHeight();
					ddNewHeight = ddContentCurrentHeight;

					$dd.addClass('expanded');
					dd.setAttribute('aria-expanded', true);
					dd.setAttribute('aria-hidden',   false);
					$dt.addClass('expanded');

					dd.style.height = ddNewHeight + 'px';

					return true;
				} else {
					$dd.removeClass('expanded');
					dd.setAttribute('aria-expanded', false);
					dd.setAttribute('aria-hidden',   true);
					$dt.removeClass('expanded');

					dd.style.height = '';

					return true;
				}
			} else if (isIE9) { // update className BEFORE animation
				if (wasCollapsed) {
					$dd.addClass('expanded');
					dd.setAttribute('aria-expanded', true);
					dd.setAttribute('aria-hidden',   false);
					$dt.addClass('expanded');
					$dd.slideDown();
				} else {
					$dd.removeClass('expanded');
					dd.setAttribute('aria-expanded', false);
					dd.setAttribute('aria-hidden',   true);
					$dt.removeClass('expanded');
					$dd.slideUp();
				}
			} else { // update className AFTER transition
				if (wasCollapsed) {
					if (content.knownHeight > 20) {
						setTimeout(function () {
							var ddContentCurrentHeight = $content.outerHeight();
							if (ddContentCurrentHeight !== content.knownHeight) {
								content.knownHeight = ddContentCurrentHeight;
								ddNewHeight = ddContentCurrentHeight;
								dd.style.height = content.ddNewHeight+'px';
							}
						}, 100);
					} else {
						content.knownHeight = $content.outerHeight();
					}

					ddNewHeight = content.knownHeight;
					dd.style.height = ddNewHeight+'px';

					$dd.addClass('expanded');
					dd.setAttribute('aria-expanded', true);
					dd.setAttribute('aria-hidden',   false);
					$dt.addClass('expanded');
				} else {
					dd.style.height = '';

					$dd.removeClass('expanded');
					dd.setAttribute('aria-expanded', false);
					dd.setAttribute('aria-hidden',   true);
					$dt.removeClass('expanded');
				}
			}


			return 0;
		}
	});


	setPageSidebarNavCurrentItem(urlParameters.psn);

	function updatePageSidebarNavSubMenuForMenuItem(menuItem, action) {
		var forceUpdatingContainer = $('.page')[0];
		var $subMenu = $(menuItem).find('> .menu');
		var subMenuWasExpanded = $(menuItem).hasClass('coupled-shown');
		var needAction =
			(!subMenuWasExpanded && action==='expand') ||
			(subMenuWasExpanded && action==='collapse') ||
			(action==='toggle')
		;
		if (!needAction) {
			return 0;
		}

		if (subMenuWasExpanded) {
			$(menuItem).removeClass('coupled-shown');
			$subMenu.slideUp(null, _onAnimationEnd);
		} else {
			$(menuItem).addClass('coupled-shown');
			$subMenu.slideDown(null, _onAnimationEnd);
		}

		function _onAnimationEnd() {
			if (!isIE8) return true;

			if (forceUpdatingContainer) {
				forceUpdatingContainer.visibility = 'hidden';
				setTimeout(function () {
					forceUpdatingContainer.visibility = '';
				}, 0);
			}
		}
	}

	function setPageSidebarNavCurrentItem(conf) {
		conf = conf || {};
		conf.level1IdPrefix = 'menu-psn-1-';
		setMenuCurrentItemForLevel(1, 2, $('#page-sidebar-nav'), conf);
	}

	function setMenuCurrentItemForLevel(level, depth, parentDom, conf) {
		level = parseInt(level);
		depth = parseInt(depth);
		if (!(level > 0) || !(depth >= level)) {
			throw('Invalid menu level/depth for configuring a menu tree.');
		}
		if (typeof conf !== 'object') {
			throw('Invalid configuration object for configuring a menu tree.');
		}

		var prefix = conf['level'+level+'IdPrefix'];
		var desiredId = prefix + conf['level'+level];

		var $allItems = $(parentDom).find('.menu.level-'+level+' > .menu-item');
		var currentItem;
		var currentItemId;

		$allItems.each(function (index, menuItem) {
			var itemLabel = $(menuItem).find('> a > .label')[0];
			var itemId = itemLabel.id;

			var isCurrentItemOrParentOfCurrentItem = itemId && desiredId && (itemId===desiredId);
			var isCurrentItem = isCurrentItemOrParentOfCurrentItem && level === depth;
			if (isCurrentItemOrParentOfCurrentItem) {
				currentItem = menuItem;
				currentItemId = itemId;
				if (isCurrentItem) {
					$(menuItem).addClass('current');
					$(menuItem).removeClass('current-parent');
				} else {
					$(menuItem).addClass('current-parent');
					$(menuItem).removeClass('current');
				}
			} else {
				$(menuItem).removeClass('current');
				$(menuItem).removeClass('current-parent');
			}
		});

		var currentSubMenuItem = null;
		if (level < depth && currentItem) {
			var nextLevel = level + 1;
			conf['level'+nextLevel+'IdPrefix'] = currentItemId + '-' + nextLevel + '-';
			currentSubMenuItem = setMenuCurrentItemForLevel(nextLevel, depth, currentItem, conf);
			if (currentSubMenuItem) {
				$(currentItem).addClass('has-sub-menu'); // update this for robustness
				$(currentItem).addClass('coupled-shown');
			}
		}

		return currentSubMenuItem || currentItem;
	}

	$('.menu-item.has-sub-menu').each(function () {
		var menuItem = this;
		var $subMenuHint = $(this).find('> a > .sub-menu-hint, > .sub-menu-hint');

		$subMenuHint.on('click', function (event) {
			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}

			updatePageSidebarNavSubMenuForMenuItem(menuItem, 'toggle');
		});
	});


	var $allTabularLists = $('.tabular .f-list');

	$allTabularLists.each(function () {
		var $allListItems  = $(this).find(' > li.selectable');
		var $allCheckboxes = $allListItems.find('input[type="checkbox"].selectable-list-item-selector');
		var $allRadios     = $allListItems.find('input[type="radio"].selectable-list-item-selector');
		// console.log('has checkboxes: ', $allCheckboxes.length > 0, '\nhas radios: ', $allRadios.length > 0);

		function _updateListItemAccordingToCheckboxStatus(listItem, checkbox) {
			var $li = $(listItem);
			if (checkbox.disabled) {
				$li.addClass('disabled');
			} else {
				$li.removeClass('disabled');
			}

			if (checkbox.checked) {
				$li.addClass('selected');
			} else {
				$li.removeClass('selected');
			}
		}

		if ($allCheckboxes.length > 0) {
			$allListItems.each(function () {
				var listItem = this;
				var $listItem = $(this);


				var $myCheckbox = $listItem.find('input[type="checkbox"].selectable-list-item-selector');
				var myCheckbox = $myCheckbox[0];
				var $myCheckboxLabel = $myCheckbox.find('+ label.deco-input[for]');


				var _myCheckboxUntouchedYet = true;
				setTimeout(function () { /* Initializing selection status; And this must dealy because ie8 to ie11 updates cached "checked" statuses very late */
					if (_myCheckboxUntouchedYet) {
						_updateListItemAccordingToCheckboxStatus(listItem, myCheckbox);
					}
				}, 100);

				if (myCheckbox) {
					if (isIE8) {
						$myCheckboxLabel.on('click', function (event) {
							_myCheckboxUntouchedYet = false;
							if (event) event.stopPropagation();
						});
					}
					$myCheckbox.on('click', function(event) {
						if (this.disabled) return false;
						_myCheckboxUntouchedYet = false;
						if (event) event.stopPropagation();
						if (isIE8) {
							_updateListItemAccordingToCheckboxStatus(listItem, this);
							_playAnimationForIE8AndIE9OnStatusChange(listItem);
						}
					});

					$listItem.on('click', function () {
						if (myCheckbox.disabled) return false;
						myCheckbox.checked = !myCheckbox.checked;
						_myCheckboxUntouchedYet = false;
						_updateListItemAccordingToCheckboxStatus(this, myCheckbox);
						_playAnimationForIE8AndIE9OnStatusChange(this);
					});

					$myCheckbox.on('change', function() {
						_updateListItemAccordingToCheckboxStatus(listItem, this);
						// _playAnimationForIE8AndIE9OnStatusChange(listItem);
					});
				}
			});
		}







		function _updateAllListItemsAccordingToRadioStatuses() {
			for (var i = 0; i < $allListItems.length; i++) {
				var _li = $allListItems[i];
				var _radio = _li.elements && _li.elements.radio;

				var $li = $(_li);

				if (_radio.disabled) {
					$li.addClass('disabled');
				}

				if (_radio.checked) {
					$li.addClass('selected');
					if (!_radio.disabled) _playAnimationForIE8AndIE9OnStatusChange(_li);
				} else {
					$li.removeClass('selected');
					// _playAnimationForIE8AndIE9OnStatusChange(_li);
				}
			}
		}

		if ($allRadios.length > 0) {
			var _radioUntouchedYet = true;
			setTimeout(function () { /* Initializing selection status; And this must dealy because ie8 to ie11 updates cached "checked" statuses very late */
				if (_radioUntouchedYet) {
					_updateAllListItemsAccordingToRadioStatuses();
				}
			}, 100);

			$allListItems.each(function () {
				var listItem = this;
				var $listItem = $(this);

				var $myRadio = $listItem.find('input[type="radio"].selectable-list-item-selector');
				var myRadio = $myRadio[0];
				if (myRadio) {
					if (typeof listItem.elements !== 'object') listItem.elements = {};
					listItem.elements.radio = myRadio;

					$listItem.on('click', function () {
						if (!myRadio.disabled) {
							_radioUntouchedYet = false;
							myRadio.checked = true;
						}
						_updateAllListItemsAccordingToRadioStatuses();
					});
				}
			});
		}

		function _playAnimationForIE8AndIE9OnStatusChange(listItem) {
			if (!isIE8 && !isIE9) {
				return true;
			}

			function _zoomToFactor(factor) {
				if (factor===1) {
					if (isIE8) {
						listItem.style.zoom = '';
						listItem.style.margin = '';
						return true;
					}
					if (isIE9) {
						listItem.style.msTransform = '';
						return true;
					}
				}

				if (isIE8) {
					var tempMarginHori = oldWidth  * (1 - factor) / 2;
					var tempMarginVert = oldHeight * (1 - factor) / 2 + originalVertMargin;

					if (factor) {
						listItem.style.zoom = factor;
					} else {
						console.error('Invalid zooming factor: ', factor);
						return false;
					}
					listItem.style.margin = tempMarginVert+'px' + ' ' + tempMarginHori+'px';
				}

				if (isIE9) {
					listItem.style.msTransform = 'scale('+factor+', '+factor+')';
				}
			}
			function _doZoomDelay(targetStage) {
				var zoomFactor = 1;
				if (targetStage !== tempStageCounter-1) {
					var lastSegRatioBetweenPiAndTwoPi = 0.75;

					var animationProgress = targetStage/(tempStageCounter-1);
					var ratio = Math.cos(Math.PI * (2 - (1 - animationProgress) * lastSegRatioBetweenPiAndTwoPi));
						ratio = ratio * 0.5 + 0.5;

					zoomFactor = minFactor + (1 - minFactor) * ratio;
				}

				if (targetStage === 0) {
					_zoomToFactor(zoomFactor);
				} else {
					var delayMS = frameGapMS*targetStage;
					setTimeout(function () {
						if (currentAniStage < targetStage) {
							currentAniStage = targetStage;
							_zoomToFactor(zoomFactor);
						}
					}, delayMS);
				}
			}

			var currentAniStage = 0;
			var minFactor = 0.984;
			var frameGapMS, tempStageCounter;

			var originalVertMargin, oldHeight, oldWidth;
			if (isIE8) {
				originalVertMargin = -1; // set by css file
				oldHeight = $(listItem).outerHeight();
				oldWidth  = $(listItem).outerWidth();
			}

			if (isIE8) {
				frameGapMS = 26;
				tempStageCounter = 13;
			}
			if (isIE9) {
				frameGapMS = 18;
				tempStageCounter = 19;
			}

			for (var i = 0; i < tempStageCounter; i++) {
				_doZoomDelay(i);
			}
		}
	});



	$('.drop-down-list').each(function () {
		var dropDownList = this;
		var $currentValueContainer = $(this).find('.drop-down-list-current-value');
		var inputForStoringValue = $(this).find('input.drop-down-list-value');
		var inputForStoringHTML = $(this).find('input.drop-down-list-value-html');
		var $options = $(this).find('.drop-down-list-options > li'); // assuming there is only one level of menu

		if (urlParameters.bank && urlParameters.bank !== 'undefined') {
			_chooseOption(urlParameters.bank, urlParameters.bankHTML);
		} else {
			if ($options.length > 0) {
				bodyClickListener.register(this, onClickOutside);
				_chooseOption(0);
			} else {
				_chooseOption(null);
			}
		}

		$currentValueContainer.on('click', function () {
			$(dropDownList).toggleClass('coupled-shown');
		});

		$options.on('click', function () {
			_chooseOption(this);
			$(dropDownList).removeClass('coupled-shown');
		});

		function _chooseOption(chosenOption, chosenOptionHTML) {
			if (typeof chosenOption === 'number') {
				chosenOption = $options[chosenOption];
			}

			var chosenValue;

			if (chosenOption && typeof chosenOption === 'string' && chosenOptionHTML && typeof chosenOptionHTML === 'string') {
				$currentValueContainer.html(chosenOptionHTML);
				$(inputForStoringValue).val(chosenOption);
				$(inputForStoringHTML).val(chosenOptionHTML);
			}

			if (!chosenOption) {
				$currentValueContainer[0].innerHTML = '';
				$(inputForStoringValue).val('');
				$(inputForStoringHTML).val('');
				return true;
			}

			if (!chosenValue) chosenValue = $(chosenOption).find('.value')[0];
			if (chosenValue) chosenValue = chosenValue.getAttribute('data-value');

			chosenOptionHTML = $(chosenOption).html();
			$currentValueContainer.html(chosenOptionHTML);
			$(inputForStoringValue).val(chosenValue);
			$(inputForStoringHTML).val(chosenOptionHTML);
		}

		function onClickOutside() {
			$(dropDownList).removeClass('coupled-shown');
		}
	});
})();
