<?php 
/*
Plugin Name: Golos Reviews
Description: A Wordpress plugin that displays Golos.io post reviews for your Products.
Version: 1.0.3
Author: WCD
Author URI: 
License: GPLv3 or later
Text Domain: golos-reviews

Copyright 2018 wcd.
This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

define( 'MNSFVER', '1.0.3' );

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
//Include admin
include dirname( __FILE__ ) .'/golos-reviews-admin.php';

// Add shortcodes
add_shortcode('golos-review', 'display_golos');


add_action( 'wp_enqueue_scripts', 'golos_shortcode_scripts');
function golos_shortcode_scripts() {
	global $post;
	if( has_shortcode( $post->post_content, 'golos-review') ) {
		add_filter( 'woocommerce_product_tabs', 'woo_reviews_tab' );
	}
}

// Add tab Woo Product with Golos reviews
function woo_reviews_tab( $tabs ) {
	
	// Adds the new tab
	
	$tabs['reviews_tab'] = array(
		'title' 	=> __( 'Golos Reviews', 'woocommerce' ),
		'priority' 	=> 5,
		'callback' 	=> 'woo_reviews_tab_content'
	);

	return $tabs;

}

add_action('wp_ajax_my_action', 'my_action_callback');
add_action('wp_ajax_nopriv_my_action', 'my_action_callback');

function my_action_callback() {
	
	$name = $_POST['name'];
	$postId = $_POST['postId'];
	$permlink = $_POST['permlink'];
	$product =  $_POST['product'];
	$productId =  $_POST['productId'];

	$data = get_post_meta($productId, '_product_golos_reviewdata', true);
	if(!empty($data)) {
		$data .= ",{'author':'".$name."','permlink':'".$permlink."'}";
	} else {
		$data .= "{'author':'".$name."','permlink':'".$permlink."'}";
	}
	update_post_meta( $postId, '_product_golos_reviewdata', wp_slash($data) );

	wp_die();
}


function woo_reviews_tab_content() {
	$url = admin_url( 'admin-ajax.php' );
	echo <<<JS
	
	 <div class="tab-pane fade in active" id="Reviews">
	<!--There are no reviews for this product. -->
		<div id="reviewItems"></div>

		<div class="row">
          <div class="col-md-12 col-sm-12">
          <!-- BEGIN FORM-->
          <form action="$url" class="reviews-form" role="form">
            <h2>Написать отзыв</h2>
            <div class="form-group">
              <label for="review">Отзыв <span class="require">*</span></label>
              <textarea class="form-control" name="review"  rows="8" id="review"></textarea>
            </div>
            
            <div class="padding-top-20">                  
              <button type="submit" class="btn btn-primary">Отправить</button>
            </div>
          </form>
          <!-- END FORM--> 
          </div>
      	</div>

		<div class="col-md-6 col-sm-6 additional-nav hidden" >
            <ul class="list-unstyled list-inline pull-right">
                <li><a href="#login-pop-up" class="fancybox-fast-view" id="loginLink">Войти</a></li>
            </ul>
        </div>
		<div id="login-pop-up" style="display: none; width: 500px;">
	    	<div class="product-page product-pop-up">
	    	<div class="row">
	          <div class="col-md-12 col-sm-12">
	            <h1>Войти</h1>
	            <div class="content-form-page">
	              <div class="row">
	                <div class="col-md-12 col-sm-12">
	                  <form class="form-horizontal form-without-legend" role="form" id="frmLogin">
	                    <div class="form-group">
	                      <label for="email" class="col-lg-4 control-label">Имя пользователя <span class="require">*</span></label>
	                      <div class="col-lg-8">
	                        <input type="text" class="form-control" name="name" placeholder="Введи свое имя пользователя">
	                      </div>
	                    </div>
	                    <div class="form-group">
	                      <label for="password" class="col-lg-4 control-label">Пароль <span class="require">*</span></label>
	                      <div class="col-lg-8">
	                        <input type="password" class="form-control" name="password" placeholder="Пароль или WIF">
	                      </div>
	                    </div>
	                    <div class="row">
	                      <div class="col-lg-8 col-md-offset-4 padding-left-0 padding-top-20">
	                        <button type="submit" class="btn btn-primary">Войти</button>
	                      </div>
	                    </div>
	                  </form>
	                </div>
	              </div>
	            </div>
	          </div>
	      </div>
      </div>
    </div>

JS;
	
}

function display_golos($atts, $content = null) {

	STATIC $i = 0;
	$i++;

	global $product;

	/******************* SHORTCODE OPTIONS ********************/
	//General
    $mn_golos_slugurl = trim($atts['slugurl']);

    /******************* CONTENT ********************/

    $mn_golos_content .= "<script type='text/javascript' src='".plugins_url( '/js/fancybox/source/jquery.fancybox.pack.js?ver='.MNSFVER , __FILE__ )."'></script>";
    $mn_golos_content .= "<script type='text/javascript' src='".plugins_url( '/js/jquery.uniform.js?ver='.MNSFVER , __FILE__ )."'></script>";
    $mn_golos_content .= "<script type='text/javascript' src='".plugins_url( '/js/jquery.validate.js?ver='.MNSFVER , __FILE__ )."'></script>";
    $mn_golos_content .= "<script type='text/javascript' src='".plugins_url( '/js/uniform/jquery.uniform.min.js?ver='.MNSFVER , __FILE__ )."'></script>";
    $mn_golos_content .= "<script type='text/javascript' src='".plugins_url( '/js/jquery.cokie.min.js?ver='.MNSFVER , __FILE__ )."'></script>";
	$mn_golos_content .= "<script type='text/javascript' src='".plugins_url( '/js/golos.min.js?ver='.MNSFVER , __FILE__ )."'></script>";
    $mn_golos_content .= "<script type='text/javascript' src='".plugins_url( '/js/app.js?ver='.MNSFVER , __FILE__ )."'></script>";
    $mn_golos_content .= "<script type='text/javascript' src='".plugins_url( '/js/golos-app.js?ver='.MNSFVER , __FILE__ )."'></script>";
	
	// Add script
			
	$mn_sf_ajaxurl = admin_url( 'admin-ajax.php' );
	$encoded_atts = json_encode($atts);

	$post = get_post();				
	$productName = $product->get_title();
		
	if( !empty($mn_golos_slugurl) && isset($mn_golos_slugurl) ){
		$productCode = $mn_golos_slugurl;		
	} else {
		$productCode = basename(get_permalink());
	}
	
	$golosData = get_post_meta($product->id, '_product_golos_reviewdata', true);

	$js = "
	<script type='text/javascript'>
	
		var golos = steem;
		reviewsData = [$golosData];
		productName = '$productName';
		productCode = '$productCode';
		productId = '$product->id';
		postId = '$post->ID';
		
		jQuery(document).ready(function() {
        	App.loginForm();
			GolosApp.init();
		});

	</script>
	";

	$mn_golos_content .= $js;
	 
    //Return our reviews HTML to display
    return $mn_golos_content;
}


	//Allows shortcodes in theme
	// add_filter('widget_text', 'do_shortcode');


//Enqueue stylesheet
add_action( 'wp_enqueue_scripts', 'mn_golos_styles_enqueue' );
function mn_golos_styles_enqueue() {
    wp_register_style( 'mn_golos_styles', plugins_url('css/mn-golos-style.css', __FILE__), array(), MNSFVER );
    wp_register_style( 'mn_fancy_styles', plugins_url('js/fancybox/source/jquery.fancybox.css', __FILE__), array(), MNSFVER );
    wp_register_style( 'mn_fancy_styles', plugins_url('js/uniform/css/uniform.default.css', __FILE__), array(), MNSFVER );
    wp_register_style( 'mn_golos_custom_styles', plugins_url('css/custom.css', __FILE__), array(), MNSFVER );
    wp_enqueue_style( 'mn_golos_styles' );
    wp_enqueue_style( 'mn_fancy_styles' );
    wp_enqueue_style( 'mn_golos_custom_styles' );

    $options = get_option('mn_golos_settings');
    if(isset($options['mn_golos_disable_awesome'])){
        if( !$options['mn_golos_disable_awesome'] || !isset($options['mn_golos_disable_awesome']) ) wp_enqueue_style( 'mn_golos_icons', 'https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css', array(), '4.6.3' );
    }
    
}

//Enqueue scripts
add_action( 'wp_enqueue_scripts', 'mn_golos_scripts_enqueue' );
function mn_golos_scripts_enqueue() {
    //Register the script to make it available
    wp_register_script( 'mn_golos_scripts', plugins_url( '/js/golos.min.js' , __FILE__ ), array('jquery'), MNSFVER, true );
    // wp_register_script( 'mn_golos_scripts', plugins_url( '/js/loadReviews.js' , __FILE__ ), array('jquery'), MNSFVER, true );

    //Options to pass to JS file
    $mn_golos_settings = get_option('mn_golos_settings');

    isset($mn_golos_settings[ 'mn_golos_ajax_theme' ]) ? $mn_golos_ajax_theme = trim($mn_golos_settings['mn_golos_ajax_theme']) : $mn_golos_ajax_theme = '';
    ( $mn_golos_ajax_theme == 'on' || $mn_golos_ajax_theme == 'true' || $mn_golos_ajax_theme == true ) ? $mn_golos_ajax_theme = true : $mn_golos_ajax_theme = false;

    //Enqueue it to load it onto the page
    if( !$mn_golos_ajax_theme ) wp_enqueue_script('mn_golos_scripts');

    //Pass option to JS file
    wp_localize_script('mn_golos_scripts', 'mn_golos_js_options', $data);
}

//Run function on plugin activate
function mn_golos_activate() {
    $options = get_option('mn_golos_settings');
    update_option( 'mn_golos_settings', $options );
}
register_activation_hook( __FILE__, 'mn_golos_activate' );

//Uninstall
function mn_golos_uninstall()
{
    if ( ! current_user_can( 'activate_plugins' ) )
        return;

    //Settings
    delete_option( 'mn_golos_settings' );
}
register_uninstall_hook( __FILE__, 'mn_golos_uninstall' );

?>