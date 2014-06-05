'use strict';

/* Directives */

/*
 * Form Validation
 */

cats.directive('pctValidateFormRequirements', function() {
    return {
        require: '^form',
        link: function(scope, elm, attrs, ctrl) {
            console.dir("FORM REQUIREMENTS ACTIVATED");

            scope.firstTry = true;

            elm.bind('click', function (e) {
                $(elm).closest('form').find('input').trigger('input');
                if (ctrl.$invalid) {
                    console.log("Making the form dirty, hehe.");
                    ctrl.$setDirty();
                    // Making all required fields dirty.
                    var field;
                    for (var i=0; i<ctrl.$error.required.length; i++) {
                        console.dir(ctrl.$error.required[i].$name);
                        field = ctrl.$error.required[i].$name;
                        ctrl[field].$dirty = 1;
                    }

                    if (ctrl.$error.required) scope.error = 'Please fill out everything!';
                    else if (ctrl.$error.email) scope.error = "Put in a real email!";
                    else scope.error = null;

                    scope.firstTry = false;

                    if (!scope.$$phase) scope.$digest();
                    
                    e.preventDefault();
                } else {
                    scope.error = null;
                    scope.firstTry = true;
                    ctrl.$setPristine();
                    console.dir(ctrl);
                    console.log("You are good to go.");
                }
            });
        }
    };
});

cats.directive('uiValidateFormRequirements', function() {
    return {
		require: '^form',
		link: function(scope, elm, attrs, ctrl) {
			console.dir(ctrl);

			elm.bind('click', function (e) {
				if (ctrl.$invalid) {
					console.log("Making the form dirty, hehe.");
					ctrl.$setDirty();
					console.dir(ctrl);
					// Making all required fields dirty.
					var field;
					for (var i=0; i<ctrl.$error.required.length; i++) {
						console.dir(ctrl.$error.required[i].$name);
						field = ctrl.$error.required[i].$name;
						ctrl[field].$dirty = 1;
					}

					if (!scope.$$phase) scope.$digest();
					
					e.preventDefault();
				} else {
					console.log("You are good to go.");
					//ctrl.$setPristine();
					//console.dir(ctrl);
				}
			});
		}
    };
});

cats.directive('validateFeedUrl', function(Feed) {
    return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {
			elm.bind('keypress', function(e) {
				if (e.which == 13) {
					elm.blur();
				}
			});
			
			elm.bind('blur', function() {
				if (ctrl.$viewValue) {
					console.dir(ctrl);
					Feed.validateUrl(ctrl.$viewValue, function(data, status) {
						if (status != 200) {
							console.log("Feed Url Invalid - %s", data);
							ctrl.$setValidity('validFeedUrl', false);
						} else {
							console.log("FeedUrl is all good.");
							ctrl.$setValidity('validFeedUrl', true);
						}

						ctrl.$setPristine();
					});
				}
				console.log("CHECKING: " + ctrl.$viewValue);
			});
    	}
    };
});

cats.directive('validateUsername', function(Cat) {
    return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {
            ctrl.$setValidity('usernameChecked', true);
            
            ctrl.$parsers.push(function(viewValue) {
                ctrl.$setValidity('usernameChecked', false);

                clearTimeout(scope.checkUsername);
                scope.checkingUsername = false;
                
                //if (!ctrl.$error.pattern) {
                    console.log('Checking username.');
                    scope.checkUsername = setTimeout(function () {

                        if (viewValue) {
                            scope.checkingUsername = true;

                            Cat.byUsername({value: viewValue}, function(data) {
                                
                                if (scope.checkingUsername) {
                                    var currentId = scope.user.id || null;
                                    if (data && data.name == ctrl.$viewValue && (data.id != currentId || currentId == null)) {
                                        console.log("Username taken.");
                                        ctrl.$setValidity('validateUsername', false);
                                        ctrl.$setValidity('usernameChecked', true);
                                    } else {
                                        console.log("Username is all good.");
                                        ctrl.$setValidity('validateUsername', true);
                                        ctrl.$setValidity('usernameChecked', true);
                                    }

                                    scope.checkingUsername = false;
                                } else {
                                    console.log("USERNAME CHECK BUMPED BY FUTURE REQUEST");
                                }
                            });
                        }
                    }, 250);
                //}

                // Need to synchronously return for other validators to work
                return viewValue;
            });
    	}
    };
});

cats.directive('validateEmail', function(Cat) {
    
    return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {
            ctrl.$setValidity('emailChecked', true);

            ctrl.$parsers.push(function(viewValue) {
                ctrl.$setValidity('emailChecked', false); 
                
                clearTimeout(scope.checkEmail);
                scope.checkingEmail = false;
                
                //if (!ctrl.$error.email & !ctrl.$error.pattern) {
                    console.log("Check Email.");
                    scope.checkEmail = setTimeout(function () {
                        
                        if (viewValue) {
                            scope.checkingEmail = true;

                            var currentId = scope.user.id || null;
                            Cat.byEmail({value: viewValue}, function(data) {
                                
                                if (scope.checkingEmail) {
                                    if (data && data.email == viewValue && (data.id != currentId || currentId == null)) {
                                        console.log("Email taken.");
                                        ctrl.$setValidity('validateEmail', false);
                                        ctrl.$setValidity('emailChecked', true); 
                                        console.dir(ctrl);
                                    } else {
                                        console.log("Email is all good.");
                                        ctrl.$setValidity('validateEmail', true);
                                        ctrl.$setValidity('emailChecked', true);
                                        console.dir(ctrl); 
                                        console.dir(scope); 
                                    }

                                    scope.checkingEmail = false;
                                } else {
                                    console.log("EMAIL CHECK BUMPED BY FUTURE REQUEST");
                                }
                            });
                        }
                    }, 250);
                //}

                // Need to synchronously return for other validators to work
                return viewValue;
            });
    	}
    };
});

cats.directive('uiValidateEquals', function($parse) {

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            function validateEqual(myValue, otherValue) {
                if (myValue === otherValue) {
                    ctrl.$setValidity('equal', true);
                    return myValue;
                } else {
                    ctrl.$setValidity('equal', false);
                    return undefined;
                }

                console.log(scope);
            }

            scope.$watch(attrs.uiValidateEquals, function(otherModelValue) {
                validateEqual(ctrl.$viewValue, otherModelValue);               
            });

            ctrl.$parsers.unshift(function(viewValue) {
                return validateEqual(viewValue, scope.$eval(attrs.uiValidateEquals));
            });

            ctrl.$formatters.unshift(function(modelValue) {
                if (!modelValue) ctrl.$setViewValue(modelValue);
                else return validateEqual(modelValue, scope.$eval(attrs.uiValidateEquals));                
            });
        }
    };
});

cats.directive('uiValidateMonth', function() {

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            function validateMonth(value) {
                console.log(value);
                
                var val;

                if (value > 0 && value <= 12 && value != null) {
                    ctrl.$setValidity('validateMonth', true);
                    val = value;
                } else {
                    ctrl.$setValidity('validateMonth', false);
                    val = undefined;
                }
                console.log("reqMONTH - %s", ctrl.$error.validateMonth);

                return val;
            }

            ctrl.$parsers.unshift(function(viewValue) {
                console.log("validateMONTH");
                return validateMonth(viewValue);
            });
        }
    };
});

cats.directive('uiValidateDay', function() {

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            function validateDay(value) {
                console.log(value);

                var val;

                if (value > 0 && value <= 31 && value != null) {
                    ctrl.$setValidity('validateDay', true);
                    val = value;
                } else {
                    ctrl.$setValidity('validateDay', false);
                    val = undefined;
                }
                console.log("reqDAY - %s", ctrl.$error.validateDay);

                return val;
            }

            ctrl.$parsers.unshift(function(viewValue) {
                console.log("validateDAY");
                return validateDay(viewValue);
            });
        }
    };
});

cats.directive('uiValidateYear', function() {

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            function validateYear(value) {
                console.log(value);

                var val;

                if (value > 1900 && value <= 2100 && value != null) {
                    ctrl.$setValidity('validateYear', true);
                    val = value;
                } else {
                    ctrl.$setValidity('validateYear', false);
                    val = undefined;
                }
                console.log("reqYEAR - %s", ctrl.$error.validateYear);

                return val;
            }

            ctrl.$parsers.unshift(function(viewValue) {
                console.log("validateYEAR");
                return validateYear(viewValue);

            });
        }
    };
});

cats.directive('uiValidateAge', function() {

    return {
        restrict: 'A',
        require: '^form',
        link: function(scope, elm, attrs, ctrl) {
        	ctrl.$addControl("age");
        	console.dir(ctrl);

            function validateAge(value) {
                console.log("Verifying age.");
				
                var val;

				var month = ctrl.month.$viewValue,
					day = ctrl.day.$viewValue,
					year = ctrl.year.$viewValue,
					thirteenYearsAgo = new Date(),
					birthday = new Date();

				birthday.setFullYear(year);
				birthday.setMonth(month-1);
				birthday.setDate(day);

				//console.log("v");
				//console.dir(ctrl);
				//console.log("Month REQ - %s", ctrl.month.$error.validateMonth);
				//console.log("Day REQ - %s", ctrl.day.$error.validateDay);
				//console.log("Year REQ - %s", ctrl.year.$error.validateYear);
				
				thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);

				if (birthday > thirteenYearsAgo) {
					console.log("Not old enough to register.");
					ctrl.$setValidity('validateAge', false);
					//console.dir(ctrl);	
					//val = undefined;				
				} else {
					console.log("You are good to go.");
					ctrl.$setValidity('validateAge', true);
					//console.dir(ctrl);
					//val = value;
				}

				return value;
            }

            ctrl.year.$parsers.unshift(function(viewValue) {
                console.log("validateAGE - Year");
                return validateAge(viewValue);
            });

            ctrl.month.$parsers.unshift(function(viewValue) {
                console.log("validateAGE - Month");
                return validateAge(viewValue);
            });

            ctrl.day.$parsers.unshift(function(viewValue) {
                console.log("validateAGE - Day");
                return validateAge(viewValue);
            });
        }
    };
});

cats.directive('pctValidatePassword', function() {

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            function validatePassword(value) {                
                var val;

                if (value !== undefined) {
                    if (value.length >= 8 && value.length <= 20 && value != null) {
                        ctrl.$setValidity('length', true);
                        val = value;
                    } else {
                        ctrl.$setValidity('length', false);
                        val = undefined;
                    }
                }

                    console.log(scope);

                return val;
            }

            ctrl.$parsers.unshift(function(viewValue) {
                return validatePassword(viewValue);
            });

            ctrl.$formatters.unshift(function(modelValue) {
                return modelValue;
            });
        }
    };
});

cats.directive('pctHashtag', function ($filter) {

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
                ctrl.$viewValue = "#" + viewValue.replace(/#/g, '');
                
                ctrl.$render();

                return viewValue.replace(/#/g, '');
            });

            ctrl.$formatters.push(function(modelValue) {
                //console.log("NUMBER FORMATTERS - %s", modelValue);
                return modelValue ? '#' + modelValue : '#';
            });
        }
    }
});

cats.directive('pctFeedIdToTitle', function() {

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.push(function(viewValue) {
                console.log("TITLE TO ID - %s", viewValue);
                //console.dir(scope.collection);
                if (_.indexOf(scope.feeds, _.findWhere(scope.feeds, {title: viewValue})) > -1) {
                    ctrl.$setValidity('validFeed', true);
                    return scope.feeds[_.indexOf(scope.feeds, _.findWhere(scope.feeds, {title: viewValue}))].id;
                } else {
                    ctrl.$setValidity('validFeed', false);
                    return undefined;
                }
            });

            ctrl.$formatters.unshift(function(modelValue) {
                console.log("ID TO TITLE - %s", modelValue);
                //console.dir(scope.collection);
                if (modelValue) {
                    console.log(_.findWhere(scope.feeds, {id: modelValue}));
                    return scope.feeds[_.indexOf(scope.feeds, _.findWhere(scope.feeds, {id: modelValue}))].title;
                }
            });
        }
    };
});

cats.directive('fileUpload', function () {
	var types = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png'];

    return {
        scope: true,        //create a new scope
        link: function (scope, el, attrs) {
            el.bind('change', function (event) {
                var files = event.target.files;
                //iterate files since 'multiple' may be specified on the element
                for (var i = 0;i<files.length;i++) {
                    
         			// Check file type
	                if (types.indexOf(files[i].type) < 0) {
	                	scope.$emit("fileTypeError", files[i].type);
	                	this.value = null;
	                } else if (files[i].size > 10*1000000) {
                        scope.$emit("fileSizeError", files[i].size);
                        this.value = null;
                    } else {
	                	//emit event upward
                    	scope.$emit("fileSelected", { file: files[i] });
	                }
                }                                       
            });
        }
    };
});



/*
 * Link Utilities
 */

cats.directive('pHref', function ($location) {
	return {
        restrict: 'A',
        scope: true,
        link: function (scope, elm, attrs) {
        	elm.css('cursor', 'pointer');
        	elm.bind('click', function (e) {
        		console.log("pHref clicked - " + attrs.pHref);
        		scope.$apply( function () {
        			$location.path(attrs.pHref);
        		});
        	});
        }
    }
});

cats.directive('pExternalHref', function ($window) {
	return {
        scope: true,        //create a new scope
        link: function (scope, elm, attrs) {
            elm.bind('click', function (event) {
	              return $window.location.href = attrs.pExternalHref;     
	        });                               
        }
    }
});

cats.directive('pBlankHref', function ($window) {
	return {
        scope: true,        //create a new scope
        link: function (scope, elm, attrs) {
            elm.bind('click', function (event) {
        		return window.open(attrs.pBlankHref, "_blank");  
        	});	
        }
    }
});

cats.directive('pctHashLink', function ($location, $anchorScroll) {
    return {
        scope: true,        //create a new scope
        link: function (scope, elm, attrs) {
            elm.css('cursor', 'pointer');
            elm.bind('click', function () {
                //$location.hash(attrs.pctHashLink);
                //$anchorScroll();
                console.log("CLICK - %s", angular.element('#' + attrs.pctHashLink).offset().top);

                $('html, body').animate({scrollTop: angular.element('#' + attrs.pctHashLink).offset().top}, 1000, 'swing');
            });
        }
    }
});

cats.directive('pctScrollToTop', function ($location, $anchorScroll) {
    return {
        scope: true,        //create a new scope
        link: function (scope, elm, attrs) {
            elm.css('cursor', 'pointer');
            elm.bind('click', function () {

                $('html, body').animate({scrollTop: 0}, 1000, 'swing');
            });
        }
    }
});


/*
 * Visual / Structural
 */


cats.directive('pColors', function ($window, $filter) {
	return {
        scope: true,        //create a new scope
        link: function (scope, elm, attrs) {
            console.log('ngColors');
            console.dir(elm);
            var transitionColor, start, stop;

            function transitionColors() {				
				transitionColor = setInterval(function () {
            		if (scope.color == 360) scope.color = 0;
            		else scope.color++;

            		elm.css('color', 'hsla(' + scope.color + ', 100%, 50%, 1)');
            	}, 10);
            }

            elm.bind('mouseover', function (event) {
                //if (!scope.color) scope.color = 340;
                scope.color = 340;

                start = new Date();

                return transitionColors();                                   
            });

            elm.bind('mouseout', function (event) {
            	clearInterval(transitionColor);
            	elm.css('color', 'hsla(340, 100%, 50%, 1)');

            	stop = new Date();

            	// Mixpanel tracking //
				mixpanel.track('logo colors', {
					Duration: $filter('number')((stop.getTime()-start.getTime())/1000, 1)
				});
				///////////////////////
                return;                                  
            });
        }
    };
});

cats.directive('pColumns', function ($rootScope, $window) {
	return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            var sorting = false;

            console.log("ngColumns");
            //console.dir(scope);
            //console.dir($window);

            // Sort feeds into columns
			function feedSorter (feeds, feedBoxWidth, columnCapacity, columnCount, device)  {
				var columnHeights;
				scope.columns = [];

				//console.log("Feeds -");
				//console.dir(feeds);

				if ((columnCapacity > 1 && device == 'largeDesktop') || scope.noCalc == true) {
					$('.content').width(feedBoxWidth*columnCapacity)
					//console.log("pCOLUMNS scope");
					//console.dir(scope);
					//scope.featuresCenterWidth = { 'width': (feedBoxWidth*(columnCapacity-1)-10) };
				} else {
					$('.content').css('width', '100%');
					scope.featuresCenterWidth = {};
				}

				angular.forEach(feeds, function (value, index) {
					console.log("FEED - %s -- index - %d", value.title, index);
					var columnIndex;
					//var columnIndex = index % columnCount;
					//console.log('Column Index: %s', columnIndex);

					if (index < columnCount) {
						//console.log("FIRST IN COLUMN");
						columnIndex = index;
					} else {
						//console.log("FINDING SHORTEST");
						columnHeights = [];
						_.each(scope.columns, function (feeds, index) {

							columnHeights[index] = 0;

							_.each(feeds, function (elm) {
								columnHeights[index] += .75;
								//console.log("FEED - %s -- index - %d", elm.title, index);

								_.each(elm.entries.slice(0, 2), function (elm) {
									//columnHeights[index] += .5;
									
									_.each(elm.images.slice(0, 10), function (elm, i, list) {
										if (elm.height > 1 && elm.width > 1)
											columnHeights[index] += elm.height/elm.width;
									});
								});
							});
						});
						console.log(columnHeights);
						scope.shortestColumnIndex = Math.min.apply(Math, columnHeights);
						columnIndex = columnHeights.indexOf(scope.shortestColumnIndex);
						console.log("SHORTEST COLUMN - %d / HEIGHT - %d", columnIndex, columnHeights[columnIndex]);
					}

					//console.log("COLUMN INDEX - %d", columnIndex);
					
					if (scope.columns[columnIndex] === undefined)
							scope.columns[columnIndex] = [];
					
					/*console.log("number is not a function??");
					console.log("columns");
					console.dir(scope.columns);
					console.log("column index");
					console.dir(columnIndex);
					console.log("feeds");
					console.dir(feeds);
					console.log("feed index");
					console.dir(index);*/
					scope.columns[columnIndex].push(feeds[index]); // CAUSE: "Type Error: number is not a function"
				});

				// Recalc heights now that all feeds are placed - NEED TO CREATE A FUNCTION OUT OF THIS

				columnHeights = [];
				_.each(scope.columns, function (feeds, index) {

					columnHeights[index] = 0;

					_.each(feeds, function (elm) {
						columnHeights[index] += .75;
						//console.log("FEED - %s -- index - %d", elm.title, index);

						_.each(elm.entries.slice(0, 2), function (elm) {
							//columnHeights[index] += .5;
							
							_.each(elm.images.slice(0, 10), function (elm, i, list) {
								if (elm.height > 1 && elm.width > 1)
									columnHeights[index] += elm.height/elm.width;
							});
						});
					});
				});

				console.log(columnHeights);
				scope.shortestColumnIndex = columnHeights.indexOf(Math.min.apply(Math, columnHeights));

				//console.dir(scope.columns);
				//console.log("Content container width - " + $('.content').css('width'));
				//console.log("Column width - " + $('.column').css('width'));

				if (!scope.$$phase) scope.$digest();
				sorting = false;

				scope.$broadcast('feedsSorted');
			}

			function prepFeedSorting () {
				sorting = true;
	            // Get width of window
	            	var windowWidth = $window.outerWidth;
	            	//console.log("Window width: %s", windowWidth);

	            // Determine box size
	            	var feedBoxWidth = 460;
	            	//console.log("Feed box width: %s", feedBoxWidth);

	         	// Determine column count
	         		scope.columnCapacity = Math.floor(windowWidth/feedBoxWidth);
					
					switch ($rootScope.device) {
						case 'phone':
							scope.columnCapacity = 1;
							scope.columnCount = 1;
							break;
						case 'phoneTablet':
							scope.columnCapacity = 1;
							scope.columnCount = 1;
							break;
						case 'tabletDesktop':
							scope.columnCapacity = 2;
							scope.columnCount = 2;
							break;
						case 'desktop':
							scope.columnCapacity = 3;
							scope.columnCount = 3;
							break;
						default:
							scope.columnCount = scope.columnCapacity;
							break;
					}

					//console.log("Column count: %s", scope.columnCount);
					console.dir(Modernizr);

						if (!Modernizr.csscalc) {
							scope.columnCapacity = Math.floor(windowWidth/feedBoxWidth);
							scope.columnCount = scope.columnCapacity;
							scope.noCalc = true;
						} 

			            // Sort feeds into columns in order
			            feedSorter(scope.feeds, feedBoxWidth, scope.columnCapacity, scope.columnCount, $rootScope.device);
	        }

			scope.$on('feedsLoaded', function () {
				prepFeedSorting();
			});

			scope.$on('feedsLoading', function () {
				prepFeedSorting();
			});

	        document.addEventListener("DOMContentLoaded", scope.$broadcast('feedsLoaded'), false);

	        angular.element($window).bind('resize', function () {
				scope.$broadcast('feedsLoaded');	        	
	        });

	        //WARNING: Isn't working on original iPad
	        $window.onorientationchange = function (event) {
				setTimeout(function () { scope.$broadcast('feedsLoaded'); }, 30);        	
	        } 
        }
    };
});

cats.directive('pScrollAppear', function ($window, $timeout) {

	// Options:
	//
	// TITLE 						- TYPE - 							DESCRIPTION
	// pScrollAppearRange 			- Pixel value - 					how far the transition will take
	// pScrollAppearOpacityInitial 	- Number from 0-1 - 				how opaque the elm will ever be at first
    // pScrollAppearOpacityFinish   - Number from 0-1 -                 how opaque the elm will ever get
	// pScrollAppearOffset			- Pixel Value - 					specific offset top value at which to start the transition
	// pScrollAppearOffsetSelector 	- CSS selector - 					use offset top value of specific element

	return {
        restrict: 'A',
        scope: true,
        link: function (scope, elm, attrs) {
        	console.log("~~~~ SCROLL APPEAR");
        	console.dir(scope);

        	scope.display = elm.css('display');
            scope.opacity = attrs.pScrollAppearOpacityInitial;

        	scope.calcOpacity = function () {
        		scope.scroll = $(document).scrollTop();
        		scope.offset = angular.equals(attrs.pScrollAppearOffset, undefined) ? 0 : parseInt(attrs.pScrollAppearOffset);
                scope.offset = angular.equals(attrs.pScrollAppearOffsetMobile, undefined) ? scope.offset : parseInt(attrs.pScrollAppearOffsetMobile);
                if (scope.offset < 0) scope.offset = 0;
        		scope.invert = angular.equals(attrs.pScrollAppearInvert, undefined) ? false : attrs.pScrollAppearInvert;
        		scope.range = parseInt(attrs.pScrollAppearRange);

        		if (attrs.pScrollAppearOffsetSelector !== undefined && angular.element(attrs.pScrollAppearOffsetSelector).offset() !== undefined) {
        			scope.offset = angular.element(attrs.pScrollAppearOffsetSelector).offset().top || 0;
        			console.log("~~~~ selector - %s ~~~~~", attrs.pScrollAppearOffsetSelector);
        		}

        		if (scope.scroll <= 0 + scope.offset) {
                    if (scope.opacity != attrs.pScrollAppearOpacityInitial) {
                        elm.css('opacity', attrs.pScrollAppearOpacityInitial);
                        scope.opacity = attrs.pScrollAppearOpacityInitial;
                    }
        			
                    if (attrs.pScrollAppearOpacityInitial == 0) elm.css('display', 'none');
                    else elm.css('display', scope.display);
        		} else if (scope.scroll > 0 + scope.offset && scope.scroll <= scope.range + scope.offset) {
                    var newOpacity = ((scope.scroll - scope.offset)/attrs.pScrollAppearRange)*(attrs.pScrollAppearOpacityFinish-attrs.pScrollAppearOpacityInitial)+parseInt(attrs.pScrollAppearOpacityInitial);
                    if (scope.opacity != newOpacity) {
                        elm.css('opacity', newOpacity);
                        scope.opacity = newOpacity;
                    }
                    //console.log("SCROLL RANGE: %s", ((scope.scroll - scope.offset)/attrs.pScrollAppearRange)*(attrs.pScrollAppearOpacityFinish-attrs.pScrollAppearOpacityInitial)+parseInt(attrs.pScrollAppearOpacityInitial));
        			elm.css('display', scope.display);
        		} else {
        			if (scope.opacity != attrs.pScrollAppearOpacityFinish) {
                        console.log("OPACITY ZERO");
                        elm.css('opacity', attrs.pScrollAppearOpacityFinish);
                        scope.opacity = attrs.pScrollAppearOpacityFinish;
                    }
        			if (attrs.pScrollAppearOpacityFinish == 0) elm.css('display', 'none');
                    else elm.css('display', scope.display);
        		}

	        	if(!scope.$$phase) scope.$digest();
    		}

    		// Bind scroll event
        	angular.element($window).bind('scroll', function (e) {
	        	scope.calcOpacity();
        	});

        	// Bind resize event
        	angular.element($window).bind('resize', function (e) {
	        	scope.calcOpacity();
	        });

	        // Initialize
			scope.calcOpacity();	
        }
    }
});

cats.directive('pctScrollSpin', function ($window, Feed) {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, elm, attrs) {
            
            scope.spin = function () {
                scope.scroll = $(document).scrollTop();
                scope.degrees = Math.floor(scope.scroll/5)+parseInt(attrs.pctScrollSpin);
                elm.css({
                    '-webkit-transform' : 'rotate('+ scope.degrees +'deg)',
                    '-moz-transform' : 'rotate('+ scope.degrees +'deg)',
                    '-ms-transform' : 'rotate('+ scope.degrees +'deg)',
                    'transform' : 'rotate('+ scope.degrees +'deg)'
                });

                console.log(scope.degrees);
                
                if (!scope.$$phase) scope.$digest();
            }

            angular.element($window).bind('scroll', function () {
                scope.spin();
            });

            scope.spin();
        }
    }
});

cats.directive('pScrollFreeze', function ($window, $timeout) {

    // Options:
    //
    // TITLE                        - TYPE -                            DESCRIPTION
    // pScrollFreezeUp              - Boolean (defaults to true) -      the direction going into the freeze
    // pScrollFreezeBreakpoint      - Pixel Value -                     the scroll offset value the will trigger the freeze
    // pScrollFreezePosition        - Pixel Value -                     where the element will be frozen

    return {
        restrict: 'A',
        scope: true,
        link: function (scope, elm, attrs) {
            console.log("~~~~ SCROLL FREEZE");
            console.dir(scope);

            scope.position = elm.css('position');
            scope.top = elm.css('top');
            scope.right = elm.css('right');
            scope.left = elm.css('left');

            scope.calcPosition = function () {
                scope.scroll = $(document).scrollTop();
                scope.offset = angular.equals(attrs.pScrollFreezeOffset, undefined) ? 0 : parseInt(attrs.pScrollFreezeOffset);
                scope.up = angular.equals(attrs.pScrollFreezeUp, undefined) ? true : attrs.pScrollFreezeUp;

                if (attrs.pScrollAppearOffsetSelector !== undefined && angular.element(attrs.pScrollAppearOffsetSelector).offset() !== undefined) {
                    scope.offset = angular.element(attrs.pScrollFreezeOffsetSelector).offset().top || 0;
                    console.log("~~~~ selector - %s ~~~~~", attrs.pScrollFreezeOffsetSelector);
                }

                if (scope.scroll >= attrs.pScrollFreezeBreakpoint) {
                    elm.css('position', 'fixed');
                    elm.css('top', attrs.pScrollFreezePosition + 'px');
                    elm.css('right', '0px');
                    elm.css('left', '0px');
                } else {
                    elm.css('position', scope.position);
                    elm.css('top', scope.top);
                    elm.css('right', scope.right);
                    elm.css('left', scope.left);
                }

                if(!scope.$$phase) scope.$digest();
            }

            // Bind scroll event
            angular.element($window).bind('scroll', function (e) {
                scope.calcPosition();
            });

            // Bind resize event
            angular.element($window).bind('resize', function (e) {
                scope.calcPosition();
            });

            // Initialize
            scope.calcPosition();    
        }
    }
});

cats.directive('pHeaderLabels', function ($window, $timeout) {

	// Options:
	//
	// TITLE 						- TYPE - 							DESCRIPTION


	return {
        restrict: 'A',
        scope: true,
        link: function (scope, elm, attrs) {
        	scope.columnLabels = [];

        	scope.calcLabel = function () {
        		if (!scope.loading) {
        			scope.scroll = $(document).scrollTop();
        			scope.height = elm.height();

        			_.each(scope.$parent.columns, function (column, i) {
        				_.each(column, function (feed, ii) {
        					//console.log("i - %s / ii - %s", i, ii);
        					scope.feedElm = $(".column:eq(" + i + ")").find(".feed-box:eq(" + ii + ")");
        					//console.dir(scope.feedElm);
        					if (scope.feedElm.offset() === undefined) return false;

        					scope.offset = scope.feedElm.offset().top;
	        				
	        				if (scope.offset <= scope.scroll + scope.height) {
	        					//console.dir(column[ii]);
	        					scope.columnLabels[i] = column[ii];
		        				//console.dir(scope.columnLabels);
			        			//if(!scope.$$phase) scope.$digest();
			        			return false;
			        		}
        				});
        			});
	        	}
    		}

    		// Bind scroll event
        	angular.element($window).bind('scroll', function (e) {
	        	//if (!scope.pHeaderLabelsScrollThrottleTimer) {
					//scope.pHeaderLabelsScrollThrottleTimer = $timeout(function () {
	        			scope.calcLabel();
	        			//scope.pHeaderLabelsScrollThrottleTimer = null;

	        			//return null;
	        		//}, 500);
	        	//}	
        	});

        	// Bind resize event
        	angular.element($window).bind('resize', function (e) {
				//if (!scope.pHeaderLabelsResizeThrottleTimer) {
					//scope.pHeaderLabelsResizeThrottleTimer = $timeout(function () {
	        			scope.calcLabel();
	        			//scope.pHeaderLabelsResizeThrottleTimer = null;

	        			//return null;
	        		//}, 100);
	        	//}
	        });

	        scope.$on('feedsSorted', function () {
	        	scope.calcLabel();
	        });

	        // Initialize
	        // Test to see if needed...
        }
    }
});

cats.directive('pImageSort', function ($location, $timeout) {

	//    Requirements:
	//
	//    TITLE 						- TYPE - 							DESCRIPTION
	// 1  pImageSort 					- Feed Object -						The feed object where the image info are stored

	return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
        	scope.sortImages = function () {
        		console.log("PIMAGESORT");
				console.dir(scope.feed);

				var largeWidth = 0,
					smallWidth = 0,
					smallWidth2 = 0,
					smallWidth3 = 0;

				scope.feed.largeImages = [];
				scope.feed.smallImages = [];
				scope.feed.smallImages2 = [];
				scope.feed.smallImages3 = [];

				if (scope.lastImage === undefined) scope.afterCutoff = true;

				_.each(scope.feed.entries, function(entry, i, list) {
					_.each(entry.images, function(image) {
						if (image.url == scope.lastImage) scope.afterCutoff = true;

						if (scope.afterCutoff) {
							image.entryUrl = entry.url;
							image.entryTitle = entry.title;
							image.entryPublishDate = entry.entryPublishDate;

							if (image.largeThumbnail && largeWidth < 950) {
								largeWidth += (image.width*300)/image.height;
								scope.feed.largeImages.push(image);

								scope.lastImage = image.url;
							} else if (image.smallThumbnail && smallWidth < 950) {
								smallWidth += (image.width*149)/image.height;
								scope.feed.smallImages.push(image);
								scope.lastImage = image.url;
							} else {
								if (image.height >= 300 && largeWidth < 950) {
									largeWidth += (image.width*300)/image.height;
									scope.feed.largeImages.push(image);
								} else if (image.height >= 149 && smallWidth < 950) {
									smallWidth += (image.width*149)/image.height;
									scope.feed.smallImages.push(image);
								} else if (image.height >= 149 && smallWidth2 < 950) {
									smallWidth2 += (image.width*149)/image.height;
									scope.feed.smallImages2.push(image);

									scope.otherLastImage = image.url;
								} else if (image.height >= 149 && smallWidth3 < 950) {
									smallWidth3 += (image.width*149)/image.height;
									scope.feed.smallImages3.push(image);

									scope.otherLastImage = image.url;
								} else if (largeWidth >= 950 && smallWidth >= 950 && smallWidth2 >= 950 && smallWidth3 >= 950) {
									return false;
								}
							}
						}
					});
				});

				scope.afterCutoff = false;

				if (largeWidth < 950) scope.lastImage = scope.otherLastImage;

				console.log("DATE OFFSET - %s", scope.dateOffset);
				console.dir(scope);

				scope.$parent.$parent.loadingMoreImages = false;
        	};

			scope.$watch(attrs.pImageSort, function pSortImages() {  // Change this so it only updates when the entries are updated
				console.log("LOAD MORE IMAGES!");
				console.dir();
				scope.sortImages();
			});

			console.log("INIT LOAD MORE IMAGES - %s", scope.feed.id);
			scope.$on('loadMoreImages' + scope.feed.id, function () {
				console.log("LOAD MORE IMAGES!");
				scope.sortImages();
			});

        }
    }
});

cats.directive('pEndlessScroll', function ($window, $location, $timeout) {
	return {
        restrict: 'A',
        scope: true,
        link: function (scope, elm, attrs) {
        	var pScrollSelector = attrs.pScrollSelector || document;

        	scope.loading = true;

        	if (attrs.pScrollAtColumn) {
        		scope.$watch(attrs.pScrollAtColumn, function (value) {
        			scope.pScrollAtColumn = value;
        			console.log("SCROLL AT COLUMN - %s", scope.pScrollAtColumn);
        		});
    		}

    		console.log("ENDLESS SCROLL SCOPE");
    		console.dir(scope);

        	angular.element($window).bind('scroll', function (e) {
        		//if (!scope.pEndlessScrollScrollThrottleTimer) {
					//scope.pEndlessScrollScrollThrottleTimer = $timeout(function () {
	        			
		        		if (!scope.loaded) {
			        		// Set defaults for optional attributes
			        		if (attrs.pScrollAtColumn) {
								var pScrollAt = $(".column:eq(" + scope.pScrollAtColumn + ")").height();
								//console.log("SCROLL AT COLUMN HEIGHT - %d", pScrollAt);
			        		} else {
			        			var pScrollAt = attrs.pScrollAt || $('body').height();
			        			//console.log("SCROLL AT SPECIFIED HEIGHT - %d", pScrollAt);
			        		}
			        		
			        		var pScrollThreshold = attrs.pScrollThreshold || 0;
			        		//console.log("SCROLL TOP - %d / SCROLL COLUMN - %d / SCROLL AT - %d / SCROLL TARGET - %d", $('body').scrollTop(), scope.pScrollAtColumn, pScrollAt, pScrollAt - pScrollThreshold - $(window).height());
			        		
			        		//console.log("ENDLESS SCROLL - scrollTop: %s - pScrollAt: %s - pScrollThreshold: %s - pScrollSelector: %s", $(pScrollSelector).scrollTop(), pScrollAt, pScrollThreshold, pScrollSelector);
			        		//console.dir(attrs);

                            //console.log("ENDLESS SCROLL CHECK - %s", $(pScrollSelector).scrollTop());

			        		if ($(pScrollSelector).scrollTop() >= (pScrollAt - pScrollThreshold - $(window).height()) && $('body').height() >= $(window).height() && !scope.loading) {
			        			console.log("ENDLESS SCROLL TRIGGERED");
			        			scope.loading = true;
			        			scope[attrs.pScrollDo](function () {
			        				//scope.loading = false;
			        			});
			        		}
			        	} else {
			        		console.log('Feeds loaded.');
			        	}

			        	//scope.pEndlessScrollScrollThrottleTimer = null;

			        	//return null;
	        		//}, 500);
	        	//}
        	});

			scope.$on('feedsLoaded', function () {
				scope.loading = false;
			});

			scope.$on('feedCotentLoaded', function () {
				scope.loading = false;
			});
        }
    }
});

cats.directive('pArrowLeft', function (Utility) {
	return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
        	console.dir(attrs);
	        scope.$watch(attrs.pArrowLeft, function (value) {
	        	console.log("pARROWLEFT?");
	        	console.dir(value);
	        	if (Utility.toBoolean(value)) {
	        		console.log("pARROWLEFT");
		        	$(window).keydown(function (e) {
		        		if (e.which == 37) {
		        			console.dir(elm);
		        			elm.click();
		        		}
		        	});
		        }
		    });
        }
    }
});

cats.directive('pArrowRight', function (Utility) {
	return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
        	console.dir(attrs);
        	scope.$watch(attrs.pArrowRight, function (value) {
	        	console.log("pARROWRIGHT?");
	        	console.dir(value);
	        	if (Utility.toBoolean(value)) {
	        		console.log("pARROWRIGHT");
		        	$(window).keydown(function (e) {
		        		if (e.which == 39) {
		        			console.dir(elm);
		        			elm.click();
		        		}
		        	});
		        }
		    });
        }
    }
});

cats.directive('pSpinner', function () {
	return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
        	scope.loading = true;
        	if (!scope.$$phase) scope.$digest();

        	scope.$on('feedsLoading', function () {
        		console.log("SPINNER ON");
        		scope.loading = true;
        		if (!scope.$$phase) scope.$digest();
        	});

        	scope.$on('feedsLoaded', function () {
        		console.log("SPINNER OFF");
        		scope.loading = false;
        		if (!scope.$$phase) scope.$digest();
        	});
        }
    }
});

cats.directive('pImagePlaceholder', function () {
	return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
        	var width = $(elm).parent('div').width();

        	elm.css('min-height', (attrs.pImageHeight*width)/attrs.pImageWidth + 'px');
        }
    }
});

cats.directive('pctCloak', function () {
	return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
        	var origDisplay = elm.css('display');
        	elm.css('display', 'none');
        	
        	scope.$on(attrs.pctCloak, function() {
        		elm.css('background', "#ddd");
        		elm.css('display', origDisplay);
        	});
        }
    }
});

cats.directive('pctImageCloak', function () {
	return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
        	console.log('IMAGE CLOAK');
        	elm.bind('load', function () {
        		elm.css('opacity', 1);
        	});
        }
    }
});

cats.directive('pctReload', function ($location) {
	return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
        	elm.bind('click', function () {
        		scope.$emit('$routeUpdate');
        		scope.$emit('feedsLoading');
        		if (!scope.$$phase) scope.$digest();
        	});
        }
    }
});

cats.directive('pctToTop', function () {
	return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
        	elm.bind('click', function () {
        		$('html, body').animate({scrollTop:"0px"}, { duration: 500 });

        		// Mixpanel tracking //
				mixpanel.track('scroll to top', {
					'Scroll Top': $(document).scrollTop()
				});
				///////////////////////
        	});
        }
    }
});

cats.directive('pctEntryLabel', function ($rootScope) {
	return {
        restrict: 'A',
        scope: true,
        link: function (scope, elm, attrs) {
        	
        	elm.bind('mouseover', function (e) {
            	$(window).on('scroll.pctEntryLabel', function (e) {
	        		$rootScope.scrolling = true;

	        		clearTimeout($rootScope.scrollTimer);
	        		$rootScope.scrollTimer = setTimeout(function () {
	        			$rootScope.scrolling = false;
	        		}, 500);

	        		elm.css('opacity', '0');
	        	});

	        	$(elm).on('mousemove.pctEntryLabel', function (e) {
	        		if (!$rootScope.scrolling) {
	        			elm.css('opacity', '.91');
	        		}
	        	});
        	});

        	elm.bind('mouseout', function (e) {
            	elm.css('opacity', '0');

            	$(elm[0]).off('mousemove.pctEntryLabel');
        		$(window).off('scroll.pctEntryLabel');
        	});
        }
    }
});

cats.directive('pctRandomize', function () {
	return {
        restrict: 'A',
        scope: true,
        link: function (scope, elm, attrs) {
        	scope.changeColors = function() {
        		$(elm).find('span').each(function() {
        			$(this).css('color', 'hsla(' + Math.floor(Math.random()*36)*10 + ', 90%, 45%, 1)');
        		})
        	}

        	elm.bind('mouseover', function () {
        		scope.timer = setInterval(function() {
        			scope.changeColors();
        		}, 250);

        		return scope.timer();
        	});

        	elm.bind('mouseout', function () {
        		clearInterval(scope.timer);
        	});

        	//scope.changeColors();
        }
    }
});

cats.directive('pctCelebrate', function () {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, elm, attrs) {
            var letters = elm.text().split(""), 
                colors;

            console.log("LETTERS");
            _.each(letters, function (elm, i, list) {
                if (elm != " ") list[i] = "<span>" + elm + "</span>";
            });
            console.dir(letters)

            elm.html(letters.join(""));

            if (attrs.pctCelebrate == 'light') colors = ['#777', '#FFF', '#FFC61C'];
            else if (attrs.pctCelebrate == 'dark') colors = ['#999', '#FFF', '#555'];
            else if (attrs.pctCelebrate == 'subtle') colors = ['#BBB', '#DDD', '#FFF'];


            scope.changeColors = function() {
                $(elm).find('span').each(function() {
                    var random = Math.random(),
                        color;

                    color = colors[Math.floor(Math.random()*colors.length)];

                    $(this).css('color', color);
                })
            }

            scope.timer = setInterval(function() {
                scope.changeColors();
            }, parseInt(attrs.pctCelebrateSpeed) || 250);

        }
    }
});

cats.directive('pctImageAspect', function ($timeout) {
    return {
        restrict: "A",
        scope: true,
        link: function (scope, elm, attrs) {

            var width, height,
                watch = scope.$parent.$watch('collection', function () {
                if (attrs.pctImageAspect == 'previous') {
                    width = scope.$parent.collection.previousCollection.cover.width;
                    height = scope.$parent.collection.previousCollection.cover.height;
                } else if (attrs.pctImageAspect == 'next') {
                    width = scope.$parent.collection.nextCollection.cover.width;
                    height = scope.$parent.collection.nextCollection.cover.height;
                } else if (attrs.pctImageAspect == 'previous2') {
                    width = scope.$parent.collection.previousCollection2.cover.width;
                    height = scope.$parent.collection.previousCollection2.cover.height;
                } else if (attrs.pctImageAspect == 'next2') {
                    width = scope.$parent.collection.nextCollection2.cover.width;
                    height = scope.$parent.collection.nextCollection2.cover.height;
                } else {
                    width = scope.$parent.collection.cover.width;
                    height = scope.$parent.collection.cover.height;
                }

                if (width/height >= (1.48)) {
                    console.log('IMAGE IS WIDE Enough ');
                    scope.landscape = true;
                } else {
                    console.log('IMAGE IS TALL');
                    scope.portrait = true;
                }

                watch();
            });
        }
    }
});

cats.directive('pctFillWithImages', function () {
	return {
		restrict: 'A',
		scope: true,
		link: function (scope, elm, attrs) {
			scope.width = elm.css('width').replace('px', '');
			scope.size = attrs.pctFillWithImagesSize;
			//scope.retina = ;

			scope.fillWithImages = function () {
				scope.images = [];
				scope.imagesWidth = 0;

				_.each(scope.$parent.feed.entries, function(entry, i, list) {
					if (scope.imagesWidth < scope.width) {
						_.each(entry.images, function(image) {
							if (scope.imagesWidth < scope.width) {
								switch (scope.size) {
									case 'small':
										if (image.smallThumbnail && image.smallThumbnail.height >= 150) {
											scope.images.push(image);
											scope.imagesWidth += image.smallThumbnail.width;
										}
										break;
									case 'large':
										if (image.largeThumbnail && image.largeThumbnail.height >= 150) {
											scope.images.push(image);
											scope.imagesWidth += image.largeThumbnail.width;
										}
										break;
								}
							}
						});
					}
				});
			}

			scope.$watch(attrs.pctFillWithImages, function () {  // Change this so it only updates when the entries are updated
				console.log("FILL WITH IMAGES!");
				console.dir();
				scope.fillWithImages();
			});
		}
	}
});

cats.directive('pctScrollLock', function ($window, $timeout) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            var timer, 
                origClientX,
                origClientY,
                difference;

            function onScroll(e) {
                if (!scope.scrolling) {
                    console.log("SCROLL LOCK");
                    // Reset values
                    origClientX = null;
                    origClientY = null;
                    difference = 0;

                    //console.log("SCROLLING");
                    scope.scrolling = true;
                    scope.$broadcast('scrolling');
                    if (!scope.$$phase) scope.$digest();

                    onMove();

                    $(window).off('scroll.scrollLock');
                } else {
                    console.log("SCROLL LOCKED");
                }
            }

            function onMove() {
                $(window).on('mousemove.releaseScrollLock', function (event) {
                    console.log("SCROLL UNLOCK");
                    // Calculate difference or establish baseline
                    if (origClientY && origClientY)
                        difference = Math.round(Math.sqrt(Math.pow(origClientY - event.clientY, 2) +Math.pow(origClientX - event.clientX, 2)));        
                    else {
                        origClientX = event.clientX;
                        origClientY = event.clientY;
                    }

                    //console.log("MOUSEMOVE - %s", difference);

                    if (difference > 20) {

                        console.log("SCROLL STOP!!!");
                        scope.scrolling = false;
                        if (!scope.$$phase) scope.$digest();

                        $(window).off('mousemove.releaseScrollLock');

                        $(window).on('scroll.scrollLock', function (e) {
                            onScroll(e);
                        });
                    }
                });
            }

            $(window).on('scroll.scrollLock', function (e) {
                onScroll(e);
            });
        }
    }
});

cats.directive('pctVote', function (AuthService, Feed, $location) {
    return {
        restrict: 'A',
        //scope: true,
        link: function (scope, elm, attrs) {
            console.log("COOLEST SCOPE");
            console.dir(scope);

            if (scope.feed.asterisks === undefined) scope.feed.asterisks = [];

            console.log("COOL SCOPE");
            console.dir(scope.feed);
            //$scope.count = $scope.$parent.feed.asterisks.length;
            scope.feed.count = Math.ceil(scope.feed.asteriskCount);
            scope.feed.asterisked = (_.findWhere(scope.feed.asterisks, { userId: AuthService.currentUser().id})) ? _.findWhere(scope.feed.asterisks, { userId: AuthService.currentUser().id}) : false;
            console.dir(scope.asterisked);

            console.log("INDEX OF USER - %d", scope.feed.asterisks.indexOf(_.findWhere(scope.feed.asterisks, { userId: AuthService.currentUser().id})));

            elm.bind('click', function () {
                console.log("VOTE!");
                if (!scope.feed.asterisked) {
                    console.log("USER - %s", AuthService.currentUser().id);

                    Feed.asterisk(scope.feed, function (status, data) {
                        if (status == 200) {
                            console.log("Feed asterisked.");

                        } else {
                            console.log("Error asterisking feed.");
                        }
                    });


                    scope.feed.asterisked = {
                        userId: AuthService.currentUser().id,
                        dateAdded: Date.now()
                    };

                    scope.$emit('vote');

                    console.dir(scope.feed.asterisked);
                    scope.feed.count++;

                    // Mixpanel tracking //
                    mixpanel.track('up vote', {
                        "Feed": scope.feed.title,
                        "Categories": scope.feed.categories,
                        "Badges": scope.feed.badges,
                        Path: $location.path()
                    });
                    ///////////////////////

                } else {
                    console.log("Already asterisked.");
                }
            });
        }
    };
});


cats.directive('pctOpenSnapshot', function ($timeout, $location) {
    return {
        restrict: 'A',
        //scope: true,
        link: function (scope, elm, attrs) {
            elm.bind('click', function () {
                if (!scope.$parent.$parent.snapshot && !scope.feed.takingSnapshot) {
                    // Mixpanel tracking //
                    mixpanel.track('open snapshot', {
                        "Feed": scope.feed.title,
                        "Categories": scope.feed.categories,
                        "Badges": scope.feed.badges,
                        Path: $location.path()
                    });
                    ///////////////////////

                    scope.$parent.$parent.snapshot = true;
                    scope.feed.snapshotOpen = true;
                    if (!scope.$$phase) scope.$apply();
                }

                $(window).on('keyup.closeSnapshot', function (e) {
                        
                    if (e.which == 27) {
                        scope.$broadcast('closeSnapshot');

                        // Mixpanel tracking //
                        mixpanel.track('esc snapshot', {
                            "Feed": scope.feed.title,
                            "Categories": scope.feed.categories,
                            "Badges": scope.feed.badges,
                            Path: $location.path()
                        });
                        ///////////////////////
                    }
                });
            });

            scope.$on('closeSnapshot', function () {
                // Mixpanel tracking //
                mixpanel.track('close snapshot', {
                    "Feed": scope.feed.title,
                    "Categories": scope.feed.categories,
                    "Badges": scope.feed.badges,
                    Path: $location.path()
                });
                ///////////////////////

                scope.$parent.$parent.snapshot = false;
                scope.feed.snapshotOpen = false;
                scope.feed.snapshot = null;
                scope.feed.snapshotPreview = false;
                scope.feed.takingSnapshot = false;

                $(window).off('keyup.closeSnapshot');

                if (!scope.$$phase) scope.$apply();
            });

            scope.$on('reopenSnapshot', function () {
                console.log('REOPEN SNAPSHOT');
                if (!scope.feed.takingSnapshot) {
                    // Mixpanel tracking //
                    mixpanel.track('retake snapshot', {
                        "Feed": scope.feed.title,
                        "Categories": scope.feed.categories,
                        "Badges": scope.feed.badges,
                        Path: $location.path()
                    });
                    ///////////////////////


                    scope.$parent.$parent.snapshot = true;
                    scope.feed.snapshot = null;
                    scope.feed.snapshotOpen = true;
                    scope.feed.snapshotPreview = false;
                    if (!scope.$$phase) scope.$apply();
                }
            });

        }
    }
});


cats.directive('pctReopenSnapshot', function($timeout) {
    return {
        restrict: 'A',
        //scope: true,
        link: function (scope, elm, attrs) {
            elm.bind('click', function () {
                scope.$emit('reopenSnapshot');
            });
        }
    }
});

cats.directive('pctCloseSnapshot', function($timeout) {
    return {
        restrict: 'A',
        //scope: true,
        link: function (scope, elm, attrs) {
            elm.bind('click', function () {
                scope.$broadcast('closeSnapshot');
            });
        }
    }
});

cats.directive('pctFrameSnapshot', function($window, $timeout) {
    return {
        restrict: 'A',
        //scope: true,
        link: function (scope, elm, attrs) {
            var x, y, width, boxWidth, maxLeft;

            var minLeft = 0;

            scope.calcPos = function (x) {
                if (!scope.feed.takingSnapshot && scope.feed.snapshotOpen && !scope.feed.snapshotPreview) {
                    // Min position
                    if (x-boxWidth/2 <= minLeft) {
                        console.log("MIN");
                        angular.element('.snapshot-crop-left').css('width', minLeft);
                        angular.element('.snapshot-viewfinder').css('left', minLeft);
                        angular.element('.snapshot-crop-right').css('left', boxWidth);
                    // Max position
                    } else if (x+boxWidth/2 >= maxLeft+boxWidth) {
                        console.log("MAX");
                        angular.element('.snapshot-crop-left').css('width', maxLeft);
                        angular.element('.snapshot-viewfinder').css('left', maxLeft);
                        angular.element('.snapshot-crop-right').css('left', maxLeft+boxWidth);
                    // Middle position
                    } else {
                        console.log("MID");
                        angular.element('.snapshot-crop-left').css('width', x-boxWidth/2);
                        angular.element('.snapshot-viewfinder').css('left', x-boxWidth/2);
                        angular.element('.snapshot-crop-right').css('left', x+boxWidth-boxWidth/2);
                    }
                }
            }

            elm.bind('mouseenter', function (e) {
                width = elm.width();
                maxLeft = width - 454;
                console.log("W: %s - ml: %s", width, maxLeft);
            });

            elm.bind('mousemove', function (e) {
                x = e.pageX - elm.offset().left;
                scope.calcPos(x);
            });

            function resizeFrame() {
                width = elm.parent().width();
                maxLeft = width - 454 - 2 - 2;
                scope.calcPos(x);
            }

            angular.element($window).bind('resize', resizeFrame());

            scope.$on('$destroy', function () {
                angular.element($window).unbind('resize', resizeFrame());
            })

            scope.$watch('feed.snapshotOpen', function (value) {
                if (value) {
                    width = elm.parent().width();
                    maxLeft = width - 454 - 2 - 2;
                    boxWidth = angular.element('.snapshot-viewfinder').width();
                    x = width/2;
                    console.log("INIT FRAME %s", width);
                    scope.calcPos(x);
                }
            });

            $timeout(function() {
                width = elm.parent().width();
                maxLeft = width - 454;
                boxWidth = angular.element('.snapshot-viewfinder').width();
                console.log("ELM WIDTH: %s", elm.width());
                scope.calcPos(width/2);
                return null;
            }), 0;


        }
    }
});

cats.directive('pctPreviewSnapshot', function (AuthService, Feed, $location) {
    return {
        restrict: 'A',
        //scope: true,
        link: function (scope, elm, attrs) {
            var options, frameLeft, boxWidth, lastImgLeft, previews;

            scope.addImage = function (i, ii) {
                options.images[i].images.push(scope.feed[previews[i]][ii]);

                var foundLink = false;

                if (_.findWhere(options.links, { entryUrl: scope.feed[previews[i]][ii].entryUrl }) === undefined) {
                    var link = {   
                        entryId: scope.feed[previews[i]][ii].entryId,
                        entryUrl: scope.feed[previews[i]][ii].entryUrl,
                        entryTitle: scope.feed[previews[i]][ii].entryTitle,
                        //image: scope.feed[previews[i]][ii].smallThumbnail
                    };
                    options.links.push(link);
                }
            }

            elm.bind('click', function () {
                
                if (!scope.feed.snapshotPreview && scope.feed.snapshotOpen) {
                    console.log("SNAPSHOT!");
                    scope.feed.snapshotPreview = true;
                    if (!scope.$$phase) scope.$apply();

                    //

                    options = {},
                    frameLeft = elm.closest('.feed-images').find('.snapshot-viewfinder').position().left,
                    boxWidth = elm.closest('.feed-images').find('.snapshot-viewfinder').width(),
                    lastImgLeft;

                        options.images = [];
                        options.links = [];
                    //

                    previews = [];

                    if (scope.feed.longLargeImagePreview) {
                        previews = ['longLargeImagePreview', 'longLargeImagePreview2'];
                    } else {
                        previews = ['longSmallImagePreview', 'longSmallImagePreview2', 'longSmallImagePreview3'];
                    }

                    // GET IMAGES INDEX RANGES

                    angular.forEach(elm.closest('.feed-images').find('.feed-images-small'), function(value, i) {
                        options.images[i] = { images: [], offset: 0 }; // offset defaults to 0

                        console.log('GET IMAGES');

                        angular.forEach(angular.element(value).find('img'), function(value, ii) {
                            var imgLeft = angular.element(value).closest('.feed-image-wrapper').position().left,
                                imgRight = imgLeft + angular.element(value).outerWidth();

                            if (imgLeft < frameLeft && imgRight >= frameLeft) {
                                //lastImgLeft = imgLeft;

                                if (options.images[i].images.length == 0) {
                                    options.images[i].offset = frameLeft-imgLeft;
                                }

                                scope.addImage(i, ii);

                                console.log("FIRST _ _ F: %s - IL: %s - IR: %s", frameLeft, imgLeft, imgRight);
                               
                                
                            } else if (imgLeft == frameLeft) {
                                scope.addImage(i, ii);
                            } else if (imgLeft > frameLeft && imgLeft <= frameLeft+boxWidth) {
                                if (options.images[i].images.length == 0) {
                                    options.images[i].offset = frameLeft-imgLeft;
                                }
                                
                                scope.addImage(i, ii);

                                console.log("SECOND _ _ F: %s - IL: %s - FIL: %s", frameLeft, imgLeft, lastImgLeft);
                               
                                //options.images[i].offset = frameLeft-lastImgLeft;
                            } else {
                                return false;
                            }
                        });
                    });

                    // GET FEED ID

                    options.feedId = scope.feed.id;

                    // GET COMMENT

                    //options.comment = scope.feed.snapshotComment || null;

                    // INIT PREVIEW

                    scope.feed.snapshot = options;
                    //scope.feed.snapshotPreview = true;
                    scope.showSnapshotLinks = true;
                
                    console.dir(scope.feed.snapshot);
                    if (!scope.$$phase) scope.$digest();
                    

                    //scope.$emit('snapshot');

                    // Mixpanel tracking //
                    mixpanel.track('preview snapshot', {
                        "Feed": scope.feed.title,
                        "Categories": scope.feed.categories,
                        "Badges": scope.feed.badges,
                        Path: $location.path()
                    });
                    ///////////////////////
                    

                } else {
                    console.log("Currently taking snapshot.");
                }
            });
        }
    };
});

cats.directive('pctTakeSnapshot', function ($rootScope, AuthService, Feed, $location) {
    return {
        restrict: 'A',
        //scope: true,
        link: function (scope, elm, attrs) {
            elm.bind('click', function () {
                if (scope.snapshot && !scope.feed.takingSnapshot) {
                    scope.feed.takingSnapshot = true;
                    scope.$parent.$parent.takingSnapshot = true;
                    if (!scope.$$phase) scope.$apply();

                    // Mixpanel tracking //
                    mixpanel.track('take snapshot', {
                        "Feed": scope.feed.title,
                        "Categories": scope.feed.categories,
                        "Badges": scope.feed.badges,
                        Path: $location.path()
                    });
                    ///////////////////////

                    scope.feed.snapshot.comment = scope.feed.snapshotComment;
                    $rootScope.noSnapshots = false;
                    if ($rootScope.currentUser.snapshotCount == 0) {
                        console.log("FIRST SNAPSHOT");
                        $rootScope.firstSnapshot = true;
                        if (!scope.$$phase) scope.$apply();
                    }

                    Feed.takeSnapshot(scope.feed.snapshot, function (status, data) {
                        if (status == 200) {
                            console.log("Snapshot taken successfully.");
                            console.dir(data);
                        } else {
                            console.log("Error taking snapshot.");
                        }

                        scope.$parent.$parent.snapshot = false;
                        scope.$parent.$parent.takingSnapshot = false;
                        scope.feed.takingSnapshot = false;
                        scope.feed.snapshotPreview = false;
                        scope.feed.snapshotOpen = false;
                        scope.feed.snapshotComment = null;
                        scope.feed.snapshot = null;

                        if (!scope.$$phase) scope.$apply();
                    });
                }
            });
        }
    }
});

cats.directive('pctCountdown', function() {
    return {
        restrict: 'A',
        //scope: true,
        link: function (scope, elm, attrs) {
            var countdown, mouseover;

            scope.startCountdown = function () {
                if (scope.feed.asterisked && mouseover) {
                    console.log("TIME - %s", scope.feed.asterisked.dateAdded);
                    
                    if (isNaN(Date.parse(scope.feed.asterisked.dateAdded)))
                        var endTime = scope.feed.asterisked.dateAdded + (24*60*60*1000);
                    else
                        var endTime = Date.parse(scope.feed.asterisked.dateAdded) + (24*60*60*1000);
                        ///endTime = Date.parse(startTime. + (24*60*60*1000));
                    //scope.feed.asterisked.countdown = new Date(endTime - Date.now());
                    scope.feed.asterisked.countdown = { width: ((new Date(endTime - Date.now())/(24*60*60*1000*1.01)))*100 + "%" };

                    //console.log("STARTTIME - %s / TIMEZONE OFFSET - %s", startTime);
                    //console.log("ENDTIME - %s / TIMEZONE OFFSET - %s", endTime, endTime.getTimezoneOffset());
                    console.log("NOW - %s / TIMEZONE OFFSET - %s", Date.now());

                    countdown = setInterval(function () {
                        console.log("TIME - %s", scope.feed.title);
                        //scope.feed.asterisked.countdown = new Date(endTime - Date.now());
                        if ((new Date(endTime - Date.now())) > 0) {
                            scope.feed.asterisked.countdown = { width: ((new Date(endTime - Date.now())/(24*60*60*1000*1.01)))*100 + "%" };
                            //console.log("UPDATE COUNTDOWN - %s", scope.feed.asterisked.countdown);
                        } else {
                            scope.feed.asterisked = false;
                        }

                        if (!scope.$$phase) scope.$digest();
                    }, 1000);
                }
            };

            scope.$on('vote', function () {
                scope.startCountdown();
            });

            elm.bind('mouseenter', function () {
                if (!scope.scrolling) {
                    console.log("START INTERVAL");
                    mouseover = true;
                    scope.startCountdown();
                }
            });

            scope.$on('scrolling', function () {
                console.log("CANCEL INTERVAL");
                clearInterval(countdown);
                mouseover = false;
                console.dir(countdown);
            });

            elm.bind('mouseleave', function () {
                console.log("CANCEL INTERVAL");
                clearInterval(countdown);
                mouseover = false;
                console.dir(countdown);
            });
        }
    }
});

cats.directive('pctColumnWidth', function($window) {
    return {
        restrict: 'A',
        //scope: true,
        link: function (scope, elm, attrs) {
            scope.sizeElm = function () {
                console.log(Math.floor(($(window).width()-elm.css('padding-left').replace('px','')-elm.css('padding-right').replace('px',''))/(attrs.pctColumnWidth)));
                if (Math.floor(($(window).width()-elm.css('padding-left').replace('px','')-elm.css('padding-right').replace('px',''))/(attrs.pctColumnWidth)) >= attrs.pctColumnCutoff)
                    elm.css('width', (Math.floor(($(window).width()-elm.css('padding-left').replace('px','')-elm.css('padding-right').replace('px',''))/(attrs.pctColumnWidth))*attrs.pctColumnWidth) + "px");
                else
                    elm.css('width', '100%');
            }

            angular.element($window).bind('resize', function () {
                scope.sizeElm();
            });

            scope.sizeElm();
        }
    }
});

cats.directive('pctCenter', function() {
    return {
        restrict: 'A',
        //scope: true,
        link: function (scope, elm, attrs) {
            scope.centerElm = function () {
                console.log("MARGIN LEFT - %s", (elm.width()-attrs.pctCenter)/2 + 'px');
                elm.css('margin-left', (elm.width()-attrs.pctCenter)/2 + 'px');
            }

            scope.centerElm();
        }
    }
});

cats.directive('pctNavHover', function() {
    return {
        restrict: 'A',
        //scope: true,
        link: function (scope, elm, attrs) {
            scope.currentPage = scope.page;

            elm.bind('mouseover', function () {
                if (scope.currentPage.title != attrs.pctNavHover) {
                    scope.page = { title: attrs.pctNavHover, current: false };
                } else {
                    scope.page = scope.currentPage
                }

                if (!scope.$$phase) scope.$digest();
            });

            elm.bind('mouseleave', function () {
                if (scope.page.title != scope.currentPage.title) {
                    scope.page = scope.currentPage;
                }

                if (!scope.$$phase) scope.$digest();
            });
        }
    }
});

cats.directive('pctCanvas', function($window, $timeout) {
    return {
        restrict: 'A',
        //scope: true,
        link: function (scope, elm, attrs) {
            var canvas = elm[0], ctx, flag = false,
                prevX = 0,
                currX = 0,
                prevY = 0,
                currY = 0,
                dot_flag = false;

                console.dir(elm);

            function init() {
                //canvas = document.getElementById('can');
                ctx = elm[0].getContext("2d");
                elm[0].width = elm.width();
                elm[0].height = elm.height();

                ctx.fillStyle = '#FFC61C'; // set canvas background color
                ctx.fillRect(0,   0, elm[0].width, elm[0].height);  // now fill the canvas

                ctx.globalCompositeOperation = 'destination-out';

                console.log("DRAW INIT - w: %s - h: %s", elm[0].width, elm[0].height);
                console.log(elm.height());

                elm.parent().bind("mousemove", function (e) {
                    if (!scope.scrolling) findxy('move', e)
                });
                elm.parent().bind("mouseover", function (e) {
                    if (!scope.scrolling) findxy('over', e)
                });
                elm.parent().bind("mouseenter", function (e) {
                    if (!scope.scrolling) findxy('enter', e)
                });
                elm.parent().bind("mouseleave", function (e) {
                    if (!scope.scrolling) findxy('leave', e)
                });
            }

            function draw() {
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(currX, currY);
                ctx.strokeStyle = "rgba(0,0,0,.4)";
                
                ctx.lineCap = 'square';
                ctx.lineWidth = Math.random()*150+50;
                
                ctx.stroke();
                ctx.closePath();
                console.log("DRAW - x: %s - y: %s", currX, currY);
            }

            function findxy(res, e) {
                if (res == 'enter' || res == 'over' && !flag) {
                    prevX = currX;
                    prevY = currY;
                    currX = e.clientX - elm[0].offsetLeft;
                    currY = e.pageY - elm[0].offsetParent.offsetTop;

                    console.dir(e);
                    console.dir(elm);
                    console.log("clientY: %s - pageY: %s - screenY: %s", e.clientY, e.pageY, e.screenY);
                    console.log("clientX: %s - offsetLeft: %s", e.clientX, elm[0].offsetLeft);
                    console.log("clientY: %s - offsetTop: %s - currY: %s", e.clientY, elm[0].offsetTop, currY);

                    flag = true;
                    dot_flag = true;
                    if (dot_flag) {
                        ctx.beginPath();
                        ctx.fillStyle = "rgba(0,0,0,.4)";
                        ctx.fillRect(currX, currY, 2, 2);
                        ctx.closePath();
                        dot_flag = false;
                    }
                }
                if (res == 'leave') {
                    flag = false;
                }
                if (res == 'move') {
                    if (flag) {
                        prevX = currX;
                        prevY = currY;
                        currX = e.clientX - elm[0].offsetLeft;
                        currY = e.pageY - elm[0].offsetParent.offsetTop;
                        draw();
                    }
                }
            }

            $timeout(function () { 
                init(); 
            }, 0);

            angular.element($window).bind('resize', function () {
                console.log(elm.height());
                var tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;

                // save your canvas into temp canvas
                tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

                // resize my canvas as needed, probably in response to mouse events
                canvas.width = elm.width();
                canvas.height = elm.height();

                ctx.globalCompositeOperation = 'source-over';

                // draw temp canvas back into myCanvas, scaled as needed
                canvas.getContext('2d').drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
            
                ctx.globalCompositeOperation = 'destination-out';
            });

        }
    }
});

cats.directive('pctCarousel', function ($window, Device, $rootScope) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            var index, middle,
                carouselWidth,
                carouselHeight;

            scope.init = function () {
                if ($rootScope.smallDevice) {
                    carouselWidth = attrs.pctCarouselWidth-95,
                    carouselHeight = attrs.pctCarouselHeight-95;
                } else {
                    carouselWidth = attrs.pctCarouselWidth-0,
                    carouselHeight = attrs.pctCarouselHeight-0;
                }

                console.log("DEVICE = %s / WIDTH = %s", $rootScope.device, carouselWidth);

                middle = Math.floor(attrs.pctCarouselCount/2);

                elm.css('width', carouselWidth*(attrs.pctCarouselCount-2) + 'px' );
                elm.css('height', carouselHeight + 'px' );
                elm.css('left', '-' + (carouselWidth*(attrs.pctCarouselCount-2)/2) + 'px' );
                angular.element('.snapshot-carousel-frame').css('left', '-' + (((carouselWidth)/2)-4) + 'px' );
                angular.element('[pct-carousel-anchor]').css('height', carouselHeight + 'px' );
            }

            scope.$watch(attrs.pctCarousel, function (value) {
                index = attrs.pctCarouselCount;
                console.log("SNAPSHOTS FOR CAROUSEL");
                if (scope[attrs.pctCarousel] !== undefined) {
                    console.log("SNAPSHOTS FOR CAROUSEL");
                    scope.carousel = scope[attrs.pctCarousel].slice(0, index);

                    scope.moveCarousel = function () {
                        _.each(scope.carousel, function (elm, i, list) {
                            list[i].left = (i-1)*carouselWidth;

                            list[i].opacity = 1-Math.abs((.5-i/(attrs.pctCarouselCount-1))*2);

                            //console.log("i: %s - count: %s - opacity: %s", i, attrs.pctCarouselCount, (.5-i/(attrs.pctCarouselCount-1))*2);

                            //if (!scope.$$phase) scope.$digest();
                        });
                    }

                    scope.incrementCarousel = function () {
                        if (index >= scope[attrs.pctCarousel].length) index = 0;

                        // ADD
                        scope.carousel.push(scope[attrs.pctCarousel][index]);

                        if (!scope.$$phase) scope.$digest();

                        // REMOVE
                        scope.carousel.shift();

                        index++;
                        //if (!scope.$$phase) scope.$digest();
                    }

                    setInterval(function () {
                        scope.incrementCarousel();
                        if (!scope.$$phase) scope.$digest();
                        scope.moveCarousel();
                        if (!scope.$$phase) scope.$digest();
                    }, 3000);

                    angular.element($window).bind('resize', function () {
                        scope.init();
                    });

                    scope.init();
                    scope.moveCarousel();

                    angular.element('[pct-carousel-anchor]').css('opacity', 1);
                }
            });
        }
    }
});

cats.directive('pctLikeSnapshot', function (Snapshot, $rootScope) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            if (!scope.snapshot.liked) elm.css('cursor', 'pointer');

            elm.bind('click', function () {
                if (!scope.snapshot.liked) {
                    Snapshot.like(scope.snapshot.id, function (data, status) {
                        console.log("SNAPSHOT LIKE RESPONSE: %s - %s", status, data);

                        if (status == 200) {
                            scope.snapshot.liked = true;
                            scope.snapshot.likes++;
                            elm.css('cursor', 'default');
                        }
                    });
                }
            });
        }
    }
});

cats.directive('pctArrowBounc', function ($rootScope) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            var start = true,
                startHeight,
                endHeight;

            scope.bounce = function () {
                if (!$rootScope.smallDevice) startHeight = attrs.pctArrowBounceLg;
                else startHeight = attrs.pctArrowBounceSm;

                endHeight = startHeight - 20;

                if (start) {
                    elm.css('height', endHeight + 'px');
                    start = false;
                } else {
                    elm.css('height', startHeight + 'px');
                    start = true;
                }
            }

            setInterval(function () {
                scope.bounce();
            }, 1000);

            scope.bounce();
        }
    }
});

cats.directive('pctImageLink', function (Feed) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            var loading;

            elm.bind("click", function () {
                
                if (!loading) {
                    loading = true;

                    console.dir(scope.image);

                    var options = {
                        feedId: scope.feed.id,
                        entryId: scope.image.entryId,
                        entryUrl: scope.image.entryUrl,
                        imageId: scope.image.id || scope.image._id,
                        imageUrl: scope.image.url
                    }

                    Feed.clickImageLink(options, function (data, status) {
                        if (status == 200) {
                            console.log('LINK SUCCESS');
                            scope.feed.clicks++;
                        } else console.log('LINK FAILURE');

                        loading = false;
                    });
                }
            });
        }
    }
});

cats.directive('pctTitleLink', function (Feed) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            var loading;

            elm.bind("click", function () {
                
                if (!loading) {
                    loading = true;

                    var options = {
                        feedId: scope.feed.id,
                    }

                    Feed.clickTitleLink(options, function (data, status) {
                        if (status == 200) {
                            console.log('LINK SUCCESS');
                            scope.feed.clicks++;
                        } else console.log('LINK FAILURE');

                        loading = false;
                    });
                }
            });
        }
    }
});

cats.directive('pctFavoriteFeed', function (Feed, $location, $rootScope) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            var loading;

            elm.bind("click", function () {
                if (!loading) {
                    loading = true;

                    if (!scope.feed.favorite) {
                        // Mixpanel tracking //
                        mixpanel.track('favorite feed', {
                            "Feed": scope.feed.title,
                            "Categories": scope.feed.categories,
                            "Badges": scope.feed.badges,
                            Path: $location.path()
                        });
                        ///////////////////////

                        if ($rootScope.currentUser.favoriteFeeds.length == 0) {
                            $rootScope.firstFavorite = true;
                            $rootScope.noFavorites = false;
                            //$rootScope.$broadcast('unlock feeds');
                        }

                        Feed.favorite(scope.feed.id, function (data, status) {
                            if (status == 200) {
                                console.log('FAVORITE SUCCESS');
                                scope.feed.favorite = true;


                                Feed.markAsSeen(scope.feed.id, function (data, status) {
                                if (status == 200) {
                                    console.log('MARK AS SEEN SUCCESS');
                                    
                                    // Mixpanel tracking //
                                    mixpanel.track('mark as seen', {
                                        "Feed": scope.feed.title,
                                        "Categories": scope.feed.categories,
                                        "Badges": scope.feed.badges,
                                        Path: $location.path()
                                    });
                                    ///////////////////////

                                } else console.log('MARK AS SEEN FAILURE');

                                marking = false;
                            });
                                
                                $rootScope.$broadcast('favorites');
                            } else console.log('FAVORITE FAILURE');

                            loading = false;
                        });
                    } else {
                        // Mixpanel tracking //
                        mixpanel.track('unfavorite feed', {
                            "Feed": scope.feed.title,
                            "Categories": scope.feed.categories,
                            "Badges": scope.feed.badges,
                            Path: $location.path()
                        });
                        ///////////////////////

                        Feed.unfavorite(scope.feed.id).then(function (result) {
                            if (result.status == 200) {
                                console.log('UNFAVORITE SUCCESS');
                                scope.feed.favorite = false;
                            } else console.log('UNFAVORITE FAILURE');

                            loading = false;
                        });
                    }
                }
            });
        }
    }
});

cats.directive('pctMarkAsSeen', function (Feed, $location) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            var loading;

            elm.bind("click", function () {
                if (!loading) {
                    loading = true;

                    scope.feed.hidden = true;
                    if (!scope.$$phase) scope.$apply();

                    setTimeout(function () {
                        var i = _.indexOf(scope.feeds, _.findWhere(scope.feeds, { title: scope.feed.title }));
                        scope.feeds.splice(i, 1);
                        return null;
                    }, 1000);
                    
                    Feed.markAsSeen(scope.feed.id, function (data, status) {
                        if (status == 200) {
                            console.log('MARK AS SEEN SUCCESS');
                            
                            // Mixpanel tracking //
                            mixpanel.track('mark feed as seen', {
                                "Feed": scope.feed.title,
                                "Categories": scope.feed.categories,
                                "Badges": scope.feed.badges,
                                Path: $location.path()
                            });
                            ///////////////////////

                        } else console.log('MARK AS SEEN FAILURE');

                        loading = false;
                    });
                }
            });
        }
    }
});

cats.directive('pctHideFeed', function (Feed, $location) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            var loading;

            elm.bind("click", function () {
                if (!loading) {
                    loading = true;
                    if (!scope.feed.hidden) {
                        scope.feed.hidden = true;
                        if (!scope.$$phase) scope.$apply();

                        setTimeout(function () {
                            var i = _.indexOf(scope.feeds, _.findWhere(scope.feeds, { title: scope.feed.title }));
                            scope.feeds.splice(i, 1);
                            return null;
                        }, 1000);

                        // Mixpanel tracking //
                        mixpanel.track('hide feed', {
                            "Feed": scope.feed.title,
                            "Categories": scope.feed.categories,
                            "Badges": scope.feed.badges,
                            Path: $location.path()
                        });
                        ///////////////////////

                        Feed.hide(scope.feed.id, function (data, status) {
                            if (status == 200) {
                                console.log('HIDE SUCCESS');
                            } else console.log('HIDE FAILURE');

                            loading = false;
                        });
                    } else {
                        Feed.unhide(scope.feed.id).then(function (result) {
                            // Mixpanel tracking //
                            mixpanel.track('unhide feed', {
                                "Feed": scope.feed.title,
                                "Categories": scope.feed.categories,
                                "Badges": scope.feed.badges,
                                Path: $location.path()
                            });
                            ///////////////////////

                            if (result.status == 200) {
                                console.log('UNHIDE SUCCESS');
                                scope.feed.hidden = false;
                            } else console.log('UNHIDE FAILURE');

                            loading = false;
                        });
                    }
                }
            });
        }
    }
});

cats.directive('pctSizeToWindow', function ($rootScope, $window, Feed) {
    return {
        restrict: 'A',
        scope: false,
        link: function (scope, elm, attrs) {
            
            var sizeToWindow = function () {
                $rootScope.windowHeight = $(window).height();
                scope.windowHeight = $(window).height();
                elm.css('height', $rootScope.windowHeight - (($rootScope.smallDevice && attrs.pctBottomMarginMobile) || attrs.pctBottomMargin || 0));
                if (!scope.$$phase) scope.$digest();
            }

            angular.element($window).bind('resize', function () {
                sizeToWindow();
            });

            // Init
            sizeToWindow();
        }
    }
});

cats.directive('pctVerticallyCenter', function ($rootScope, $window, Feed) {
    return {
        restrict: 'A',
        scope: false,
        link: function (scope, elm, attrs) {
            
            scope.verticallyCenter = function () {
                var windowHeight = $(window).outerHeight();
                var elmHeight = elm.height();
                console.log("VERTICALLY CENTER - %d", elmHeight);
                elm.css('margin-top', (windowHeight-elmHeight - (($rootScope.smallDevice && attrs.pctVerticallyCenterOffsetMobile) || attrs.pctVerticallyCenterOffset || 0))/2.5);
                if (!scope.$$phase) scope.$digest();
            }

            angular.element($window).bind('resize', function () {
                scope.verticallyCenter();
            });

            scope.$watch(attrs.pctVerticallyCenter, function () {
                scope.verticallyCenter();
            })

            // Init
            scope.verticallyCenter();
        }
    }
});

cats.directive('pctClickAwayToClose', function () {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            $(document).one('click', function () {
                console.log('CLICK');
                scope[attrs.pctClickAwayToClose].show = false;
                console.dir(scope);
                if (!scope.$$phase) scope.$apply();
            });

            elm.bind('click', function(e) {
                console.log('STOP PROP');
                e.stopPropagation();
            });
        }
    }
});

cats.directive('pctClickAwayClose', function ($rootScope) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            $rootScope.$watch(attrs.pctClickAwayClose, function () {
                if (attrs.pctClickAwayClose == true) {
                    console.log("SET CLICK AWAY TO CLOSE");
                    $(document).one('click', function () {
                        console.log('CLICK');
                        $rootScope[attrs.pctClickAwayToClose] = false;
                        console.dir(scope);
                        if (!scope.$$phase) scope.$apply();
                    });

                    elm.bind('click', function(e) {
                        console.log('STOP PROP');
                        e.stopPropagation();
                    });
                }
            });
        }
    }
});

cats.directive('compile', function($compile) {
    // directive factory creates a link function
    return function (scope, element, attrs) {
        scope.$watch(
            function(scope) {
                 // watch the 'compile' expression for changes
                return scope.$eval(attrs.compile);
            },
            function(value) {
                // when the 'compile' expression changes
                // assign it into the current DOM
                element.html(value);

                // compile the new DOM and link it to the current
                // scope.
                // NOTE: we only compile .childNodes so that
                // we don't get into infinite loop compiling ourselves
                $compile(element.contents())(scope);
            }
        );
    };
});

cats.directive('pctLonelyScroll', function() {
    return function (scope, elm, attrs) {
        elm.bind('scroll', function (e) {
            e.stopPropagation();
        })
    };
});

cats.directive('pctBookmarkDrag', function() {
    return function (scope, elm, attrs) {
        scope.bookmarkMessage = 'Drag me to bookmarks bar!';

        elm.on('dragend', function (e) {
            console.log('DRAGEND');

            scope.bookmarkMessage = 'Drag me to bookmarks bar!';
            if (!scope.$$phase) scope.$apply();
        });

        elm.on('drag', function (e) {
            console.dir(e);
            var distance = e.originalEvent.clientY/$(window).height();
            if (distance > .5) {
                scope.bookmarkMessage = 'Great, keep going!';
            } else if (e.originalEvent.clientY >= 1) {
                var numOs = (1-(distance/.5))*10,
                    os = "o";

                while (numOs > 0) {
                    console.log('ADD o');
                    os += 'o';
                    numOs--;
                }
                scope.bookmarkMessage = "You're getting cl" + os + "ser";
            } else if (e.originalEvent.clientY < 1) {
                scope.bookmarkMessage = "Thanks! :)";
            }

            if (!scope.$$phase) scope.$apply();
        })
    };
});


cats.directive('pctWindowHeight', function($rootScope, $window) {
    return function (scope, elm, attrs) {
        $rootScope.windowHeight = $(window).height();

        angular.element($window).resize(function () {
            $rootScope.windowHeight = $(window).height();
        });
    }
});

cats.directive('pctSharePopup', function($rootScope, $window) {
    return {
        scope: true,
        link: function (scope, elm, attrs) {

            elm.bind('click', function () {
                window.open(attrs.pctSharePopup, attrs.pctSharePopupWindow, 'top=50,left=30,width=550,height=420,toolbar=1,resizable=0');
                return false;
            });
        }
    }
});

cats.directive('pctHover', function($rootScope, $window, $timeout) {
    return {
        link: function (scope, elm, attrs) {
            console.dir(scope);
            scope.setEvent = function () {
                if ($rootScope.smallDevice) {
                    console.log('SET EVENT CLICK');
                    elm.on('click.pctHover', function () {
                        console.log('CLICK');
                        scope[attrs.pctHover][attrs.pctHoverParam] = true;
                        if (!scope.$$phase) scope.$digest();
                        $timeout(function () {
                            scope[attrs.pctHover][attrs.pctHoverParam] = false;
                            if (!scope.$$phase) scope.$digest();
                        }, 2000);
                    });
                    elm.off('mouseenter.pctHover');
                    elm.off('mouseleave.pctHover');
                } else {
                    console.log('SET EVENT HOVER');
                    elm.off('click.pctHover');
                    
                    elm.on('mouseenter.pctHover', function () {
                        console.log('HOVER ON - %s', scope[attrs.pctHover][attrs.pctHoverParam]);
                        scope[attrs.pctHover][attrs.pctHoverParam] = true;
                        if (!scope.$$phase) scope.$digest();
                    });

                    elm.on('mouseleave.pctHover', function () {
                        console.log('HOVER OFF - %s', scope[attrs.pctHover][attrs.pctHoverParam]);
                        scope[attrs.pctHover][attrs.pctHoverParam] = false;
                        if (!scope.$$phase) scope.$digest();
                    });
                }
            }

            $(window).resize(function () {
                scope[attrs.pctHover][attrs.pctHoverParam] = false;
                scope.setEvent();
            });

            scope.$watch('attrs.pctHover', function() {
                scope[attrs.pctHover][attrs.pctHoverParam] = false;
                scope.setEvent();
            });
        }
    }
});

cats.directive('pctImageDimensions', function($rootScope, $window) {
    return {
        link: function (scope, elm, attrs) {
            
            scope.calcWidth = function () {
                /*if (scope.image.large2xThumbnail) {
                    elm.attr('width', scope.image.largeThumbnail.width);
                    elm.attr('height', scope.image.largeThumbnail.height);
                } else if (scope.image.largeThumbnail) {
                    elm.attr('width', scope.image.largeThumbnail.width);
                    elm.attr('height', scope.image.largeThumbnail.height);
                } else if (scope.image.smallThumbnail) {
                    elm.attr('width', scope.image.smallThumbnail.width);
                    elm.attr('height', scope.image.smallThumbnail.height);
                } else {*/
                    if (attrs.pctImageDimensions == 'small') {
                        console.log('SMALLLLLL');
                        console.dir(scope.row);
                        elm.attr('width', Math.ceil(scope.image.width*scope.rowHeight/scope.image.height));
                        elm.attr('height', Math.ceil(scope.image.images[attrs.pctImageDimensionsIndex].height*(scope.image.width*scope.rowHeight/scope.image.height)/scope.image.images[attrs.pctImageDimensionsIndex].width));
                    } else {
                        if (scope.image.height >= attrs.pctImageDimensions) {
                            elm.attr('width', Math.ceil(scope.image.width*scope.rowHeight/scope.image.height));
                            elm.attr('height', Math.ceil(scope.rowHeight));
                        } else {
                            elm.attr('width', Math.ceil(scope.image.width*(scope.rowHeight/2)/scope.image.height));
                            elm.attr('height', Math.ceil(scope.rowHeight/2));
                        }
                    }
                //}
            }

            scope.$watch('rowHeight', function () {
                scope.calcWidth();
            });
        }
    }
});

cats.directive('pctDivDimensions', function($rootScope, $window) {
    return {
        link: function (scope, elm, attrs) {
            
            scope.calcWidth = function () {
                if (attrs.pctDivDimensions == 'liquid') {
                    elm.css('width', Math.ceil(scope.image.width*scope.rowHeight/scope.image.height) + 'px');
                    elm.css('height', Math.ceil(scope.rowHeight) + 'px');
                } else {
                    if ($rootScope.smallDevice) {
                        elm.css('width', '25px');
                    } else {
                        elm.css('width', '25px');
                    }

                    elm.css('height', scope.rowHeight + 'px');
                }
            }

            scope.$watch('rowHeight', function () {
                scope.calcWidth();
            });
        }
    }
});

cats.directive('pctImageRows', function($rootScope, $window, $filter) {
    return {
        scope: true,
        link: function (scope, elm, attrs) {

            scope.createRows = function () {
                scope.rows = [];
                console.log('CREATE ROWS');
                var newRow = true,
                    rowWidth,
                    row,
                    smallImage,
                    currentDateSection,
                    lastDateSection;
                _.each(scope[attrs.pctImageRowsImages], function (image, i) {
                    // Create new row if necessary
                    if (newRow) {
                        row = [],
                        rowWidth = 0,
                        newRow = false;
                    }

                    /*if (i == 0) {
                        row.push({
                            titleMarker: true,
                            width: 200,
                            height: 300
                        });

                        rowWidth += 300;
                    }*/

                    var now = new Date(),
                        date = new Date(image.entryPublishDate);

                    if (date >= now-(24*60*60*1000)) {
                    // Today
                        currentDateSection = 'TODAY';
                    } else if (date >= now-(7*24*60*60*1000)) {
                    // This week
                        currentDateSection = 'THIS WEEK';
                    } else if (date.getMonth() == now.getMonth() && date.getFullYear() == now.getFullYear()) {
                    // This month
                        currentDateSection = 'THIS MONTH';
                    } else if (date.getFullYear() == now.getFullYear()) {
                    // X Month
                        currentDateSection = $filter('date')(date, 'MMMM').toUpperCase();
                    } else {
                        currentDateSection = date.getFullYear();
                    }

                    if (currentDateSection != lastDateSection && !smallImage) {
                        if ($rootScope.smallDevice) {
                            row.push({
                                dateMarker: true,
                                dateSection: currentDateSection,
                                width: 25,
                                height: 300
                            });
                        } else {
                            row.push({
                                dateMarker: true,
                                dateSection: currentDateSection,
                                width: 25,
                                height: 300
                            });
                        }

                        rowWidth += row[row.length-1].width;
                    }
                    lastDateSection = currentDateSection;

                    if (smallImage) {
                        row[row.length-1].images.push(image);

                        console.log('SMALL IMAGE');
                        console.dir(row);

                        // Add to row width
                        var ratioHeight1 = row[row.length-1].images[0].height/row[row.length-1].images[0].width,
                            ratioHeight2 = row[row.length-1].images[1].height/row[row.length-1].images[1].width,
                            width = attrs.pctImageRows/(ratioHeight1 + ratioHeight2);

                        row[row.length-1].width = width;
                        row[row.length-1].height = attrs.pctImageRows;

                        rowWidth += width;

                        smallImage = false;
                    } else {

                        if (image.height >= attrs.pctImageRows) {
                            image.isMultiple = false;
                            row.push(image);
                            rowWidth += Math.floor(image.width*attrs.pctImageRows/image.height);
                        } else {
                            //rowWidth += Math.floor(image.width*150/image.height);
                            console.log('SMALL IMAGE FOUND');
                            console.dir(image);
                            var imageCopy = angular.copy(image);
                            row.push({
                                images: [imageCopy],
                                isMultiple: true
                            });
                            smallImage = true;
                        }
                    }

                    // Check if row is full
                    if (rowWidth > $(window).width() && (scope.rows.length < attrs.pctImageRowsMax || !attrs.pctImageRowsMax)) {
                        // Calculate width % for each image

                        // Add row to set
                        scope.rows.push(row);

                        // Trigger new row creation
                        newRow = true;
                    }

                });

                console.dir(scope.rows);
            }

            scope.$watch(attrs.pctImageRowsImages, function () {
                scope.createRows();
            });

            $(window).resize(function () {
                scope.createRows();
                if (!scope.$$phase) scope.$digest();
            });
        }
    }
});

cats.directive('pctImageRowHeight', function($rootScope, $window) {
    return {
        link: function (scope, elm, attrs) {
            scope.calcHeight = function () {
                var rowWidth = 0,
                    dateMarkers = 0,
                    dateMarkerWidth = 0;

                _.each(scope.row, function (image) {
                    if (image.dateMarker) {
                        console.log("DATE MARKER!");
                        dateMarkerWidth = image.width;
                        dateMarkers++;
                    } else if (image.height >= attrs.pctImageRowHeight) {
                        rowWidth += Math.floor(image.width*attrs.pctImageRowHeight/image.height);
                    } else {
                        rowWidth += Math.floor(image.width*(attrs.pctImageRowHeight/2)/image.height);
                    }
                });

                // Scale row to window width
                scope.rowHeight = Math.ceil(attrs.pctImageRowHeight*($(window).width()-(dateMarkerWidth*dateMarkers))/rowWidth);

                elm.css('height', scope.rowHeight + 'px');
                if (!scope.$$phase) scope.$digest();
            }

            scope.$watch('row', function () {
                scope.calcHeight();
            });
        }
    }
});

cats.directive('pctImageError', function($rootScope, $window) {
    return {
        link: function (scope, elm, attrs) {
            elm.bind('error', function () {
                console.log("IMAGE ERROR!");
                console.dir(scope);
                scope.imageError = true;
                if (!scope.$$phase) scope.$digest(); 
            });
        }
    }
});

cats.directive('pctSlideUp', function($rootScope, $location) {
    return {
        link: function (scope, elm, attrs) {
            elm.bind('click', function () {
                console.log("SLIDEUP %s", attrs.pctSlideUp);
                $rootScope.slideLink = true;
                if (!scope.$$phase) scope.$digest(); 
                $rootScope.$apply(function() {
                    $location.path(attrs.pctSlideUp);
                    console.log("SLIDEUP %s", $location.path());
                });
            });
        }
    }
});











// Mixpanel links

cats.directive('pctMx', function ($location) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            elm.bind("click", function () {
                mixpanel.track(attrs.pctMx, {
                    Path: $location.path()
                });
            });
        }
    }
});


cats.directive('pctLogo', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.bind("click", function () {
				mixpanel.track("logo link", {
					Path: $location.path()
				});
			});
		}
	}
});

cats.directive('pctCategoryDropdownLink', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.bind("click", function () {
			    mixpanel.track("dropdown category link", { 
	                Category: elm.children('div').text(),
	                Path: $location.path()
			    });
			});
		}
	}
});

cats.directive('pctCityDropdownLink', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.bind("click", function () {
			    mixpanel.track("dropdown city link", { 
	                "City - Feed Location": elm.children('div').text(),
	                Path: $location.path()
			    });
			});
		}
	}
});

cats.directive('pctStateDropdownLink', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.bind("click", function () {
			    mixpanel.track("dropdown state link", { 
	                "State - Feed Location": elm.children('div').text(),
	                Path: $location.path()
			    });
			});
		}
	}
});

cats.directive('pctCountryDropdownLink', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.bind("click", function () {
			    mixpanel.track("dropdown country link", { 
	                "Country - Feed Location": elm.children('div').text(),
	                Path: $location.path()
			    });
			});
		}
	}
});

cats.directive('pctAbout', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
   			elm.bind("click", function () {
	   			mixpanel.track("about link", {
	   				Path: $location.path()
	   			});
	   		});
   		}
   	}
});

cats.directive('pctBadge', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
		    elm.bind('click', function () {
			    mixpanel.track("badge link", {
	                Badge: scope.badge,
	                Feed: scope.feed.title,
	                Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                'Up Votes': scope.feed.asterisks.length,
	                Path: $location.path()
			    });
			});
		}
	}
});

cats.directive('pctEmailLink', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			if (angular.element("#" + elm.attr('id')).length == 1) {
			    mixpanel.track_links("#" + elm.attr('id'), "email link", {
		            Path: $location.path()
		        });
			} else
				console.log("Duplicate email links detected");
		}
	}
});

cats.directive('pctEmailLinkFooter', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			if (angular.element(".pct-email-link-footer").length == 1) {
				console.log("1 email link detected");

				var data = {};

				scope.$watch('search', function () {
					var data = {};

					if (scope.category.length > 0) data.Category = scope.category;
					else if (scope.city.length > 0) data['City - Feed Location'] = scope.city;
					else if (scope.state.length > 0) data['State - Feed Location'] = scope.state;
					else if (scope.country.length > 0) data['Country - Feed Location'] = scope.country;

					data.Path = $location.path();

					console.log("Email link data");
					console.dir(data);
				});

				mixpanel.track_links(".pct-email-link-footer", "suggestion link", data);
			} else {
				console.log("Multiple email links detected");
			}
		}
	}
});

cats.directive('pctFeedLink', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.attr('id', 'feedTitle' + scope.feed.id);

			if (angular.element("#" + elm.attr('id')).length == 1) {
			    mixpanel.track_links("#" + elm.attr('id'), "feed link", {
					Feed: scope.feed.title,
	                Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                //'Up Votes': scope.feed.asterisks.length,
	                Path: $location.path()
			    });
			} else
				console.log("Duplicate feed links detected");
		}
	}
});

cats.directive('pctFeedCategory', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
		    elm.bind('click', function () {
			    mixpanel.track("feed category link", { 
			        Category: scope.category,
			        Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                'Up Votes': scope.feed.asterisks.length,
	                Path: $location.path()
			    });
			});
		}
	}
});

cats.directive('pctStoreLink', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.attr('id', 'feedStore' + scope.feed.id + scope.$index);

			if (angular.element("#" + elm.attr('id')).length == 1) {
			    mixpanel.track_links("#" + elm.attr('id'), "store link", {
					Feed: scope.feed.title,
					Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                'Up Votes': scope.feed.asterisks.length,
	                Path: $location.path()
			    });
			} else
				console.log("Duplicate store links detected");
		}
	}
});

cats.directive('pctNewsletterLink', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.attr('id', 'feedNewsletter' + scope.feed.id + scope.$index);

			if (angular.element("#" + elm.attr('id')).length == 1) {
			    mixpanel.track_links("#" + elm.attr('id'), "newsletter link", {
					Feed: scope.feed.title,
					Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                'Up Votes': scope.feed.asterisks.length,
	                Path: $location.path()
			    });
			} else
				console.log("Duplicate newsletter links detected");
		}
	}
});

cats.directive('pctCity', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
		    elm.bind('click', function () {
			    mixpanel.track("city link", { 
			        Feed: scope.feed.title,
			        Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                'Up Votes': scope.feed.asterisks.length,
			        'City - Feed Location': scope.feed.city,
			        Path: $location.path()
			    });
			});
		}
	}
});

cats.directive('pctState', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
		    elm.bind('click', function () {
			    mixpanel.track("state link", { 
			        Feed: scope.feed.title,
			        Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                'Up Votes': scope.feed.asterisks.length,
			        'State - Feed Location': scope.feed.state,
			        Path: $location.path()
			    });
			});
		}
	}
});

cats.directive('pctCountry', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
		    elm.bind('click', function () {
			    mixpanel.track("country link", { 
			        Feed: scope.feed.title,
			        Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                'Up Votes': scope.feed.asterisks.length,
			        'Country - Feed Location': scope.feed.country,
			        Path: $location.path()
			    });
			});
		}
	}
});

cats.directive('pctInstagramLink', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.attr('id', 'feedInstagram' + scope.feed.id);

			if (angular.element("#" + elm.attr('id')).length == 1) {
			    mixpanel.track_links("#" + elm.attr('id'), "instagram link", {
					Feed: scope.feed.title,
					Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                'Up Votes': scope.feed.asterisks.length,
	                Path: $location.path()
			    });
			} else
				console.log("Duplicate instagram links detected");
		}
	}
});

cats.directive('pctTwitterLink', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.attr('id', 'feedTwitter' + scope.feed.id);

			if (angular.element("#" + elm.attr('id')).length == 1) {
			    mixpanel.track_links("#" + elm.attr('id'), "twitter link", {
					Feed: scope.feed.title,
					Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                'Up Votes': scope.feed.asterisks.length,
	                Path: $location.path()
			    });
			} else
				console.log("Duplicate twitter links detected");
		}
	}
});

cats.directive('pctFacebookLink', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.attr('id', 'feedFacebook' + scope.feed.id);

			if (angular.element("#" + elm.attr('id')).length == 1) {
			    mixpanel.track_links("#" + elm.attr('id'), "facebook link", {
					Feed: scope.feed.title,
					Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                'Up Votes': scope.feed.asterisks.length,
	                Path: $location.path()
			    });
			} else
				console.log("Duplicate facebook links detected");
		}
	}
});

cats.directive('pctPinterestLink', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.attr('id', 'feedPinterest' + scope.feed.id);

			if (angular.element("#" + elm.attr('id')).length == 1) {
			    mixpanel.track_links("#" + elm.attr('id'), "pinterest link", {
					Feed: scope.feed.title,
					Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                'Up Votes': scope.feed.asterisks.length,
	                Path: $location.path()
			    });
			} else
				console.log("Duplicate pinterest links detected");
		}
	}
});

cats.directive('pctTumblrLink', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.attr('id', 'feedTumblr' + scope.feed.id);

			if (angular.element("#" + elm.attr('id')).length == 1) {
			    mixpanel.track_links("#" + elm.attr('id'), "tumblr link", {
					Feed: scope.feed.title,
					Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                'Up Votes': scope.feed.asterisks.length,
	                Path: $location.path()
			    });
			} else
				console.log("Duplicate tumblr links detected");
		}
	}
});

cats.directive('pctFlickrLink', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.attr('id', 'feedFlickr' + scope.feed.id);

			if (angular.element("#" + elm.attr('id')).length == 1) {
			    mixpanel.track_links("#" + elm.attr('id'), "flickr link", {
					Feed: scope.feed.title,
					Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                'Up Votes': scope.feed.asterisks.length,
	                Path: $location.path()
			    });
			} else
				console.log("Duplicate flickr links detected");
		}
	}
});

cats.directive('pctEntryLgLink', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.attr('id', 'entryLg' + scope.feed.id + scope.$index);

			if (angular.element("#" + elm.attr('id')).length == 1) {
			    mixpanel.track_links("#" + elm.attr('id'), "entry lg link", {
					Feed: scope.feed.title,
					Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                //'Up Votes': scope.feed.asterisks.length,
					Entry: scope.image.entryTitle,
					'Entry ID': scope.image.entryId,
					Path: $location.path()
			    });
			} else
				console.log("Duplicate entry lg links detected");
		}
	}
});

cats.directive('pctEntrySmLink', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.attr('id', 'entrySm' + scope.feed.id + scope.$index);

			if (angular.element("#" + elm.attr('id')).length == 1) {
			    mixpanel.track_links("#" + elm.attr('id'), "entry sm link", {
					Feed: scope.feed.title,
					Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                //'Up Votes': scope.feed.asterisks.length,
					Entry: scope.image.entryTitle,
					'Entry ID': scope.image.entryId,
					Path: $location.path()
			    });
			} else
				console.log("Duplicate entry sm links detected");
		}
	}
});

cats.directive('pctEntrySm2Link', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.attr('id', 'entrySm2' + scope.feed.id + scope.$index);

			if (angular.element("#" + elm.attr('id')).length == 1) {
			    mixpanel.track_links("#" + elm.attr('id'), "entry sm link", {
					Feed: scope.feed.title,
					Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                'Up Votes': scope.feed.asterisks.length,
					Entry: scope.image.entryTitle,
					'Entry ID': scope.image.entryId,
					Path: $location.path()
			    });
			} else
				console.log("Duplicate entry sm2 links detected");
		}
	}
});

cats.directive('pctEntrySm3Link', function ($location) {
	return {
		restrict: 'C',
		link: function (scope, elm, attrs) {
			elm.attr('id', 'entrySm3' + scope.feed.id + scope.$index);

			if (angular.element("#" + elm.attr('id')).length == 1) {
			    mixpanel.track_links("#" + elm.attr('id'), "entry sm link", {
					Feed: scope.feed.title,
					Badges: scope.feed.badges,
	                Categories: scope.feed.categories,
	                'Up Votes': scope.feed.asterisks.length,
					Entry: scope.image.entryTitle,
					'Entry ID': scope.image.entryId,
					Path: $location.path()
			    });
			} else
				console.log("Duplicate entry sm3 links detected");
		}
	}
});

cats.directive('pctShareButtonMx', function ($location) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            elm.bind('click', function () {
                mixpanel.track(attrs.pctShareButtonMx, {
                    Feed: scope.feed.title,
                    Badges: scope.feed.badges,
                    Categories: scope.feed.categories,
                    //'Up Votes': scope.feed.asterisks.length,
                    Entry: scope.image.entryTitle,
                    'Entry ID': scope.image.entryId,
                    Path: $location.path()
                });
            });
        }
    }
});