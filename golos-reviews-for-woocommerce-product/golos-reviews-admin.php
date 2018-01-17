<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

function mn_golos_menu() {
    add_menu_page(
        'Golos Reviews',
        'Golos Reviews',
        'manage_options',
        'mn-golos-reviews',
        'mn_golos_settings_page'
    );

}
add_action('admin_menu', 'mn_golos_menu');

function mn_golos_settings_page() {

 ?>

    <div id="sfi_admin" class="wrap">

        <div id="header">
            <h1><?php _e('Golos reviews', 'golos-reviews'); ?></h1>
        </div>

    
        <h3><?php _e('Display your Golos reviews on WooCommerce Product page', 'golos-reviews'); ?></h3>
        <p><?php _e("Copy and paste the following shortcode directly into the Woo Product page where you'd like the reviews to show up:", 'golos-reviews'); ?></p>
        <input type="text" value="[golos-review]" size="16" readonly="readonly" style="text-align: center;" onclick="this.focus();this.select()" title="<?php _e('To copy, click the field then press Ctrl + C (PC) or Cmd + C (Mac).', 'golos-reviews'); ?>" />
        <p><?php _e("If you want to change the url of posts in Golos.io. Ie replace the Woo product name on your own value in the example below using the tag slugurl:", 'golos-reviews'); ?>
            <br>
            <br>
            <input type="text" value='[golos-review slugurl="woocommerce-custom-product-name"]' size="56" readonly="readonly" style="text-align: center;" onclick="this.focus();this.select()" title="<?php _e('To copy, click the field then press Ctrl + C (PC) or Cmd + C (Mac).', 'golos-reviews'); ?>" />
        </p>

    </div> <!-- end #sfi_admin -->

<?php } //End Settings page
?>