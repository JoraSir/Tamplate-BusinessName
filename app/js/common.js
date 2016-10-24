$(document).ready(function(){
    $(".toggle_menu").click(function() {
        $(this).toggleClass("on");
        $(".top_nav").slideToggle();
    });
    $("#lightSlider").lightSlider({
        item: 1,
        slideMove: 1,
        loop: true,
        autoWidth: false
    });
    $("#lSlider").lightSlider({
        addClass: 'testimonials',
        item: 1,
        slideMove: 1,
        controls: false,
        loop: true,
        autoWidth: false
    });
});
