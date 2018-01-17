var App = function () {

     // IE mode
    var isRTL = false;
    var isIE8 = false;
    var isIE9 = false;
    var isIE10 = false;

    var responsive = true;

    var responsiveHandlers = [];

    var handleInit = function() {

        if (jQuery('body').css('direction') === 'rtl') {
            isRTL = true;
        }

        isIE8 = !! navigator.userAgent.match(/MSIE 8.0/);
        isIE9 = !! navigator.userAgent.match(/MSIE 9.0/);
        isIE10 = !! navigator.userAgent.match(/MSIE 10.0/);
        
        if (isIE10) {
            jQuery('html').addClass('ie10'); // detect IE10 version
        }
    }

    // runs callback functions set by App.addResponsiveHandler().
    var runResponsiveHandlers = function () {
        // reinitialize other subscribed elements
        for (var i in responsiveHandlers) {
            var each = responsiveHandlers[i];
            each.call();
        }
    }

    // handle the layout reinitialization on window resize
    var handleResponsiveOnResize = function () {
        var resize;
        if (isIE8) {
            var currheight;
            jQuery(window).resize(function () {
                if (currheight == document.documentElement.clientHeight) {
                    return; //quite event since only body resized not window.
                }
                if (resize) {
                    clearTimeout(resize);
                }
                resize = setTimeout(function () {
                    runResponsiveHandlers();
                }, 50); // wait 50ms until window resize finishes.                
                currheight = document.documentElement.clientHeight; // store last body client height
            });
        } else {
            jQuery(window).resize(function () {
                if (resize) {
                    clearTimeout(resize);
                }
                resize = setTimeout(function () {
                    runResponsiveHandlers();
                }, 50); // wait 50ms until window resize finishes.
            });
        }
    }

    var handleIEFixes = function() {
        //fix html5 placeholder attribute for ie7 & ie8
        if (isIE8 || isIE9) { // ie8 & ie9
            // this is html5 placeholder fix for inputs, inputs with placeholder-no-fix class will be skipped(e.g: we need this for password fields)
            jQuery('input[placeholder]:not(.placeholder-no-fix), textarea[placeholder]:not(.placeholder-no-fix)').each(function () {

                var input = jQuery(this);

                if (input.val() == '' && input.attr("placeholder") != '') {
                    input.addClass("placeholder").val(input.attr('placeholder'));
                }

                input.focus(function () {
                    if (input.val() == input.attr('placeholder')) {
                        input.val('');
                    }
                });

                input.blur(function () {
                    if (input.val() == '' || input.val() == input.attr('placeholder')) {
                        input.val(input.attr('placeholder'));
                    }
                });
            });
        }
    }

    // Handles scrollable contents using jQuery SlimScroll plugin.
    var handleScrollers = function () {
        jQuery('.scroller').each(function () {
            var height;
            if (jQuery(this).attr("data-height")) {
                height = jQuery(this).attr("data-height");
            } else {
                height = jQuery(this).css('height');
            }
            jQuery(this).slimScroll({
                allowPageScroll: true, // allow page scroll when the element scroll is ended
                size: '7px',
                color: (jQuery(this).attr("data-handle-color")  ? jQuery(this).attr("data-handle-color") : '#bbb'),
                railColor: (jQuery(this).attr("data-rail-color")  ? jQuery(this).attr("data-rail-color") : '#eaeaea'),
                position: isRTL ? 'left' : 'right',
                height: height,
                alwaysVisible: (jQuery(this).attr("data-always-visible") == "1" ? true : false),
                railVisible: (jQuery(this).attr("data-rail-visible") == "1" ? true : false),
                disableFadeOut: true
            });
        });
    }

    var handleSearch = function() {    
        jQuery('.search-btn').click(function () {            
            if(jQuery('.search-btn').hasClass('show-search-icon')){
                if (jQuery(window).width()>767) {
                    jQuery('.search-box').fadeOut(300);
                } else {
                    jQuery('.search-box').fadeOut(0);
                }
                jQuery('.search-btn').removeClass('show-search-icon');
            } else {
                if (jQuery(window).width()>767) {
                    jQuery('.search-box').fadeIn(300);
                } else {
                    jQuery('.search-box').fadeIn(0);
                }
                jQuery('.search-btn').addClass('show-search-icon');
            } 
        }); 
    }

    var handleMenu = function() {
        jQuery(".header .navbar-toggle").click(function () {
            if (jQuery(".header .navbar-collapse").hasClass("open")) {
                jQuery(".header .navbar-collapse").slideDown(300)
                .removeClass("open");
            } else {             
                jQuery(".header .navbar-collapse").slideDown(300)
                .addClass("open");
            }
        });
    }

    var handleSidebarMenu = function () {
        jQuery(".sidebar .dropdown a").click(function () {
            if (jQuery(this).hasClass("collapsed") == false) {
                jQuery(this).addClass("collapsed");
                jQuery(this).siblings(".dropdown-menu").slideDown(300);
            } else {
                jQuery(this).removeClass("collapsed");
                jQuery(this).siblings(".dropdown-menu").slideUp(300);
            }
        });
    }

    function handleDifInits() { 
        jQuery(".header .navbar-toggle span:nth-child(2)").addClass("short-icon-bar");
        jQuery(".header .navbar-toggle span:nth-child(4)").addClass("short-icon-bar");
    }

    function handleUniform() {
        if (!jQuery().uniform) {
            return;
        }
        var test = jQuery("input[type=checkbox]:not(.toggle), input[type=radio]:not(.toggle, .star)");
        if (test.size() > 0) {
            test.each(function () {
                    if (jQuery(this).parents(".checker").size() == 0) {
                        jQuery(this).show();
                        jQuery(this).uniform();
                    }
                });
        }
    }

    var handleFancybox = function () {
        jQuery(".fancybox-fast-view").fancybox();

        if (!jQuery.fancybox) {
            return;
        }

        if (jQuery(".fancybox-button").size() > 0) {            
            jQuery(".fancybox-button").fancybox({
                groupAttr: 'data-rel',
                prevEffect: 'none',
                nextEffect: 'none',
                closeBtn: true,
                helpers: {
                    title: {
                        type: 'inside'
                    }
                }
            });

            jQuery('.fancybox-video').fancybox({
                type: 'iframe'
            });
        }
    }

    // Handles Bootstrap Accordions.
    var handleAccordions = function () {
       
        jQuery('body').on('shown.bs.collapse', '.accordion.scrollable', function (e) {
            App.scrollTo(jQuery(e.target), -100);
        });
        
    }

    // Handles Bootstrap Tabs.
    var handleTabs = function () {
        // fix content height on tab click
        jQuery('body').on('shown.bs.tab', '.nav.nav-tabs', function () {
            handleSidebarAndContentHeight();
        });

        //activate tab if tab id provided in the URL
        if (location.hash) {
            var tabid = location.hash.substr(1);
            jQuery('a[href="#' + tabid + '"]').click();
        }
    }
	
    return {
        init: function () {
            // init core variables
            handleInit();
            handleResponsiveOnResize();
            handleIEFixes();
            handleSearch();
            handleFancybox();
            handleDifInits();
            handleSidebarMenu();
            handleAccordions();
            handleMenu();
            handleScrollers();

            this.addResponsiveHandler(function(){ 
                App.initBxSlider(true);
            });
        },

        initUniform: function (els) {
            if (els) {
                jQuery(els).each(function () {
                        if (jQuery(this).parents(".checker").size() == 0) {
                            jQuery(this).show();
                            jQuery(this).uniform();
                        }
                    });
            } else {
                handleUniform();
            }
        },

        initTouchspin: function () {
            jQuery(".product-quantity .form-control").TouchSpin({
                buttondown_class: "btn quantity-down",
                buttonup_class: "btn quantity-up"
            });
            jQuery(".quantity-down").html("<i class='fa fa-angle-down'></i>");
            jQuery(".quantity-up").html("<i class='fa fa-angle-up'></i>");
        },

        initBxSlider: function (reload) {
            jQuery('.bxslider').each(function(){
                var width = jQuery(window).width();

                var slides; 
                var slideMargin = parseInt(jQuery(this).attr("data-slide-margin"));
                var slideContainerWidth = jQuery(this).closest('.bxslider-wrapper').width();
                var slideWidth;

                if (width <= 480) {
                    slides = jQuery(this).attr("data-slides-phone");
                } else if (width > 480 && width <= 992) {
                    slides = jQuery(this).attr("data-slides-tablet");
                } else {
                    slides = jQuery(this).attr("data-slides-desktop");
                }

                slides = parseInt(slides);

                slideWidth = slideContainerWidth / slides;


                if (reload === true) {
                    if (!jQuery(this).data("bxslider")) {
                        return;
                    }
                    jQuery(this).data("bxslider").reloadSlider({
                        minSlides: slides,
                        maxSlides: slides,
                        slideWidth: slideWidth,
                        slideMargin: slideMargin,
                        moveSlides:5,
                        responsive:true
                    });
                } else {
                    //alert(2);
                    var slider = jQuery(this).bxSlider({
                        minSlides: slides,
                        maxSlides: slides,
                        slideWidth: slideWidth,
                        slideMargin: slideMargin,   
                        moveSlides:5,
                        responsive:true
                    });
                    jQuery(this).data("bxslider", slider);
                }
            });       
        },

        initImageZoom: function () {
            jQuery('.product-main-image').zoom({url: jQuery('.product-main-image img').attr('data-BigImgSrc')});
        },

        initSliderRange: function () {
            jQuery( "#slider-range" ).slider({
              range: true,
              min: 0,
              max: 500,
              values: [ 50, 250 ],
              slide: function( event, ui ) {
                jQuery( "#amount" ).val( "jQuery" + ui.values[ 0 ] + " - jQuery" + ui.values[ 1 ] );
              }
            });
            jQuery( "#amount" ).val( "jQuery" + jQuery( "#slider-range" ).slider( "values", 0 ) +
            " - jQuery" + jQuery( "#slider-range" ).slider( "values", 1 ) );
        },

        // wrapper function to scroll(focus) to an element
        scrollTo: function (el, offeset) {
            var pos = (el && el.size() > 0) ? el.offset().top : 0;
            if (el) {
                if (jQuery('body').hasClass('page-header-fixed')) {
                    pos = pos - jQuery('.header').height(); 
                }            
                pos = pos + (offeset ? offeset : -1 * el.height());
            }

            jQuery('html,body').animate({
                scrollTop: pos
            }, 'slow');
        },
        
        // wrapper function to  block element(indicate loading)
        blockUI: function (options) {
            var options = jQuery.extend(true, {}, options);
            var html = '';
            if (options.iconOnly) {
                // html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '')+'"><img style="" src="/wp-content/plugins/golos-feed-for-wordpress-master/img/loading.gif" align=""></div>';
            } else if (options.textOnly) {
                // html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '')+'"><span>&nbsp;&nbsp;' + (options.message ? options.message : 'LOADING...') + '</span></div>';
            } else {    
                // html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '')+'"><img style="" src="/wp-content/plugins/golos-feed-for-wordpress-master/img/loading-spinner-grey.gif" align=""><span>&nbsp;&nbsp;' + (options.message ? options.message : 'LOADING...') + '</span></div>';
            }

            if (options.target) { // element blocking
                var el = jQuery(options.target);
                if (el.height() <= (jQuery(window).height())) {
                    options.cenrerY = true;
                }            
                el.block({
                    message: html,
                    baseZ: options.zIndex ? options.zIndex : 1000,
                    centerY: options.cenrerY != undefined ? options.cenrerY : false,
                    css: {
                        top: '10%',
                        border: '0',
                        padding: '0',
                        backgroundColor: 'none'
                    },
                    overlayCSS: {
                        backgroundColor: options.overlayColor ? options.overlayColor : '#000',
                        opacity: options.boxed ? 0.05 : 0.1, 
                        cursor: 'wait'
                    }
                });
            } else { // page blocking
                jQuery.blockUI({
                    message: html,
                    baseZ: options.zIndex ? options.zIndex : 1000,
                    css: {
                        border: '0',
                        padding: '0',
                        backgroundColor: 'none'
                    },
                    overlayCSS: {
                        backgroundColor: options.overlayColor ? options.overlayColor : '#000',
                        opacity: options.boxed ? 0.05 : 0.1,
                        cursor: 'wait'
                    }
                });
            }            
        },

        // wrapper function to  un-block element(finish loading)
        unblockUI: function (target) {
            if (target) {
                jQuery(target).unblock({
                    onUnblock: function () {
                        jQuery(target).css('position', '');
                        jQuery(target).css('zoom', '');
                    }
                });
            } else {
                jQuery.unblockUI();
            }
        },

        //public function to add callback a function which will be called on window resize
        addResponsiveHandler: function (func) {
            responsiveHandlers.push(func);
        },

        scrollTop: function () {
            App.scrollTo();
        },

        gridOption1: function () {
            jQuery(function(){
                jQuery('.grid-v1').mixitup();
            });    
        },
        
        loginForm: function () {
        	jQuery("#frmLogin").validate({
      	      errorElement: 'span', //default input error message container
      	      errorClass: 'help-block', // default input error message class
      	      focusInvalid: false, // do not focus the last invalid input
      	      rules: {
      	    	  name: {
      	              required: true
      	          },
      	    	  password: {
      	              required: true
      	          }
      	      },

      	      messages: {
      	    	  name: {
      	              required: "Имя обязательный параметр."
      	          },
      	          password: {
      	              required: "Пароль обязательный параметр."
      	          }
      	      },

      	      invalidHandler: function (event, validator) { //display error alert on form submit

      	      },

      	      highlight: function (element) { // hightlight error inputs
      	          jQuery(element)
      	              .closest('.form-group').addClass('has-error'); // set error class to the control group
      	      },

      	      success: function (label) {
      	          label.closest('.form-group').removeClass('has-error');
      	          label.remove();
      	      },

      	      submitHandler: function (form) {
      	    	  var name = jQuery(form).find('input[name="name"]').val();
      	    	  var password = jQuery(form).find('input[name="password"]').val();
      	    	  
      	    	  var wif = golos.auth.toWif(name, password, 'posting');
      	    	  var pub = golos.auth.wifToPublic(wif);
      	    	  var auths = {
      	    			posting: [[pub]]
      	    	  };
      	    	  var test = golos.auth.verify(name, password, auths);
      	    	  if(test){
      	    		jQuery.cookie('gAuthName', name, { expires: 1, path: '/' });
        	    	jQuery.cookie('gAuthWif', wif, { expires: 1, path: '/' });
        	    	jQuery.fancybox.close( true );
      	    	  }else{
      	    		  alert('Неправильное Имя или Пароль.');
      	    	  }
      	    	  
      	    	  return false;
      	      }
      	  });
        }

    };
}();