var productName = null;
var productCode = null;
var productId = null;
var reviewsData = [];

var GolosApp = function () {
	
	var username = null;
    var wif = null;
    
    var checkAuth = function (){
    	username = jQuery.cookie('gAuthName');
        wif = jQuery.cookie('gAuthWif');
        
        return (username && wif)
    }
	
	var initReviewForm = function(){

		jQuery('.reviews-form').validate({
		      errorElement: 'span', //default input error message container
		      errorClass: 'help-block', // default input error message class
		      focusInvalid: false, // do not focus the last invalid input
		      rules: {
		          review: {
		              required: true
		          }
		      },

		      messages: {
		          review: {
		              required: "Вы забыли добавить отзыв."
		          }
		      },

		      invalidHandler: function (event, validator) { //display error alert on form submit
		          jQuery('.alert-danger', jQuery('#login-form')).show();
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
		    
		            if(checkAuth()){
		            	var time_for_commetn = new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
		            	var permlink = 'review-to-' + productCode + '-' + time_for_commetn;
		                App.blockUI({animate: true, target: jQuery("#Reviews")});
		                
		                steem.broadcast.comment(
		                    wif, 
		                    '', 
		                    'golos', 
		                    username, 
		                    permlink, 
		                    'Отзыв о продукте - ' + productName, 
		                    jQuery(form).find("[name='review']").val(), 
		                    '{\"tags\":[\"nsfw\"]}', 
		                function(err, result) {
		                    console.log(err, result);
		                    if(err == null){
		                        jQuery.ajax({
		                            method: "POST",
		                            url: jQuery(form).attr('action'),		                            		                            
		                            data: {'name': username, 'permlink':permlink, 'postId': postId, 'product':productCode, 'productId': productId, action: 'my_action'},
		                            beforeSend: function( xhr ) {}
		                        }).done(function( response ) {
		                        	form.reset();
		                            steem.api.getContent(username, permlink, function(err, result) {
		                    			if(err == null && result.id){
		                    				createBlockReview(result);
		                    			}
		                    			App.unblockUI(jQuery("#Reviews"));
		                    		});
		                        }).fail(function( response ) {
		                            alert('Ваш отзыв важен для нас. Попробуйте добавить отзыв позже.');
		                        });
		                    }else{

		                    	App.unblockUI(jQuery("#Reviews"));
		                    	alert('Some error has appeared');

		                    	
		                    }
		                });
		            }else{
		                jQuery.fancybox.open( jQuery('#loginLink'), {}, jQuery('#loginLink').index( this ) );             
		            }

		          return false;
		      }
		  });
	}
	
	var initCommentForm = function (el, result) {
		
		jQuery(el).find('.comment-form').validate({
		      errorElement: 'span', //default input error message container
		      errorClass: 'help-block', // default input error message class
		      focusInvalid: false, // do not focus the last invalid input
		      rules: {
		          comment: {
		              required: true
		          }
		      },

		      messages: {
		          comment: {
		              required: "Вы забыли добавить комментарий."
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
		    	  if(checkAuth()){
		    		var time_for_commetn = new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
					permlink = 'comment-to-'+result.permlink+'-'+time_for_commetn,
					
					App.blockUI({animate: true, target: jQuery(form)});
	                steem.broadcast.comment(
	                    wif,
	                    result.author,
	                    result.permlink,
	                    username,
	                    permlink,
	                    'title',
	                    jQuery(form).find("[name='comment']").val(),
	                    '',
	                    function (err, res) {
		                    if(err == null){
		                    	form.reset();
		                    	var total = parseInt(jQuery(form).parent().parent().find( ".comments-total").html())+1;
		                    	jQuery(form).parent().parent().find( ".comments-total").html(total);
		                    	createCommentsTree(form, result.author, result.permlink, 'in', false);
		                    }else{
		                    	App.unblockUI( jQuery(form));
		                    	alert('Ваш комментарий важен для нас. Попробуйте добавить комментарий позже.');
		                    }
	                });
	                
		    	  }else{
					jQuery.fancybox.open( jQuery('#loginLink'), {}, jQuery('#loginLink').index( this ) );             
				  }
		    	  
		          return false;
		      }
		  });
	}	
	
	
	var initListReviews = function () {
		var length = reviewsData.length;
		var reviewsSortData = [];
		if(length){
			App.blockUI({animate: true, target: jQuery("#Reviews")});
			Array.prototype.forEach.call(reviewsData, function (data) {
				steem.api.getContent(data.author, data.permlink, function(err, result) {
					length--;
					if(err == null && result.id){
						var d = {'voits':result.active_votes.length, 'result':result};
						reviewsSortData.push(d);
					}
					if(length < 1){
						if(reviewsSortData){
							reviewsSortData.sort(compare);
							Array.prototype.forEach.call(reviewsSortData, function (item) {
								var parentDiv = createBlockReview(item.result);
								jQuery(parentDiv).find( ".comments-total").html(parseInt(item.result.children));
							});
						}
						App.unblockUI(jQuery("#Reviews"));
					}
				});
			});
		}
	}
	
	var createCommentsTree = function(el, autor, permlink, type, after) {
		
		steem.api.getContentReplies(autor, permlink, function(err, replies) {
			
			if(err == null){
				jQuery(el).find( "ul.chats" ).html('');
				Array.prototype.forEach.call(replies, function (reply) {
					var commentElement = createBlockComment(reply, type);
					
					if(after){
						jQuery( commentElement ).insertAfter( jQuery(el) );
					}else{
						jQuery(el).find( "ul.chats" ).append( commentElement );
					}
					
					if(parseInt(reply.children) > 0){
						createCommentsTree(commentElement, reply.author, reply.permlink, 'out', true);
					}
				});
			}
			
			App.unblockUI( jQuery(el));
		});
	}
	
	var createBlockReview = function (result) {
		
		
		var div = document.createElement('DIV');
		
		var html = '<div class="review-item-submitted"><strong>'+result.author+'</strong>'
				 +'<ul class="list-inline"><li><i class="fa fa-thumbs-up"></i> <span class="active-votes">'+result.active_votes.length+'</span> Голосов</li>'
				 +'<li><i class="fa fa-dollar"></i> '+result.pending_payout_value+'</li>'
				 +'<li><i class="fa fa-calendar"></i> '+dateFormat(result.created)+'</li>'
				 +'</ul>'
				 +'<div class="rateit">'
				 +'<span class="label label-sm label-default"><i class="fa fa-thumbs-up"></i></span></div></div>'
				 +'<div class="review-item-content"><p>'+result.body+'</p></div>'
				 +'<div class="row"><div class="col-md-12 col-sm-12"><div class="portlet"><div class="portlet-title line">'
				 +'<div class="caption"><i class="fa fa-comments"></i> Комментарии (<small class="comments-total">0</small>)</div>'
				 +'<div class="tools"><a href="" class="expand"></a><a href="" class="reload"></a></div></div>'
				 +'<div class="portlet-body" style="display:none;"><form action="" class="comment-form" role="form">'
				 +'<div class="scroller" data-always-visible="1" data-rail-visible1="1">'
				 +'<ul class="chats"></ul></div>'
				 +'<div class="chat-form">'
				 +'<div class="input-cont"><input class="form-control" type="text" name="comment" placeholder="Добавить комментарий..."/>'
				 +'</div><div class="btn-cont"><span class="arrow"></span>'
				 +'<button type="submit" class="btn blue icn-only"><i class="fa fa-check icon-white"></i></button>'
				 +'</div></div></form></div></div></div></div>'
				 +'</div>'
				 ;
		
		div.innerHTML = html;
		jQuery("#reviewItems").append(div);
		initCommentForm(div, result);
		
		jQuery(div).find('.reload').click(function(){
			App.blockUI({animate: true, target: jQuery(div).find('ul.chats')});
			createCommentsTree(div, result.author, result.permlink, 'in', false);

			return false;
		});
		
		jQuery(div).find('span.label').click(function(){
			


			var label = this;
			if(checkAuth()){
				jQuery(this).css('visibility', 'hidden');
				App.blockUI({animate: true, target: jQuery(this).parent(), iconOnly:true, overlayColor:'transparent'});
                steem.broadcast.vote(wif, username, result.author, result.permlink, 10000, 
                    function(err, result) {
	                	jQuery(label).removeClass('label-default');
	    	            jQuery(label).addClass('label-success');
                        if(err != null){
                            alert ('Вы уже голосовали за этот отзыв');
                        }else{
                        	var votes = parseInt(jQuery(div).find('.active-votes').html());
                        	votes++;
                        	jQuery(div).find('.active-votes').html(votes);
                        }
                        
                        App.unblockUI(jQuery(label).parent());
                        jQuery(label).css('visibility', 'visible');
                });
            } else {
                jQuery.fancybox.open(jQuery('#loginLink'), {}, jQuery('#loginLink').index(this));
            }
	        return false;
		});
		
		jQuery(div).on('click', '.portlet > .portlet-title > .tools > .collapse, .portlet .portlet-title > .tools > .expand', function(e){
			e.preventDefault();
	        var el = jQuery(this).closest(".portlet").children(".portlet-body");
	        if (jQuery(this).hasClass("collapse")) {
	            jQuery(this).removeClass("collapse").addClass("expand");
	            el.slideUp(200);
	        } else {
	            jQuery(this).removeClass("expand").addClass("collapse");
	            el.slideDown(200);
	            var html = jQuery(div).find('ul.chats').html(); 
	            if(html == ''){
	            	App.blockUI({animate: true, target: jQuery(div).find('ul.chats')});
					createCommentsTree(div, result.author, result.permlink, 'in', false);
	            }
	            
	        }
			return false;
		});
		
		return div;
		
	}
	
	var createBlockComment = function (comment, type) {
		
		var li = document.createElement('LI');
		li.className = type;
		var html = '<img class="avatar img-responsive" alt="" src="/wp-content/plugins/golos-feed-for-wordpress-master/img/avatar.png"/>'
			+'<div class="message"><span class="arrow"></span>'
			+'<a href="#" class="name">'+comment.author+'</a>&nbsp;&nbsp;'
			+'<span class="datetime">'+dateFormat(comment.created)+'</span>'
			+'<span class="body">'+comment.body+'</span></div>'
			;
		li.innerHTML = html;
		
		return li;
	}
	
	var dateFormat = function (date) {
		
		date = date+'.000+00:00';
		var formattedDate = new Date(date);
		var d = (parseInt(formattedDate.getDate()) >= 10)? formattedDate.getDate(): '0'+formattedDate.getDate();
		var m =  formattedDate.getMonth()+1;
		m = (parseInt(m) >= 10)? m: '0'+m;
		var y = formattedDate.getFullYear();
		var H = formattedDate.getHours();
		var M = formattedDate.getMinutes();
		
		H = (parseInt(H) >= 10)? H: '0'+H;
		M = (parseInt(M) >= 10)? M: '0'+M;
		
		return d+'.'+m+'.'+y+' - '+H+':'+M;
	}
	
	var compare = function (a, b) {
	  if (a.voits < b.voits) {
	    return 1;
	  }
	  if (a.voits > b.voits) {
	    return -1;
	  }
	  // a muss gleich b sein
	  return 0;
	}
	
	
	return {
        init: function () {
        	initReviewForm();
        	initListReviews();
        },
    };
}();