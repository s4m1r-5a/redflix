
var scaling = 1;
//count
var currentSliderCount = 0;
var videoCount = $(".row").children().length;
var showCount = 0;
var sliderCount = 1;
var controlsWidth = 40;
var scollWidth = 0;
var win = $(window);
var prev = $(".prev");
var next = $(".next");
//sizes
var windowWidth = 0;
var frameWidth = 0;

$(document).ready(function () {
    var player = new Playerjs({ id: "player" });
    var player2 = new Playerjs({ id: "player2" });
    var player3 = new Playerjs({ id: "player3" });
    var player4 = new Playerjs({ id: "player4" });
    var player5 = new Playerjs({ id: "player5" });
    $(".tile").on({
        mouseenter: function () {
            /*$(this).mousemove(function () {                
                setTimeout(function () { $('.tile__details').hide('slow') }, 1000);
            });*/
            console.log($(this).offset().left)
            if ($(this).children('input').val()) {
                play = $(this).children('.tile__media').attr("id");
                pley = play + `.api("play", "${$(this).children('input').val()}");`;
                sto = play + '.api("stop");';
                eval(pley);
            }
        },
        mouseleave: function () {
            if ($(this).children('input').val()) {
                eval(sto);
            }
            //$('.tile__details').show('slow')
            /*$(this).parents('.row').velocity({
                left: $(this).parents(".px").val()
            }, {
                duration: 700,
                easing: "swing",
                queue: "",
                loop: false, // Si la animación debe ciclarse
                delay: false, // Demora
                mobileHA: true // Acelerado por hardware, activo por defecto
            });*/
        }
    });
    init();
});
$(window).resize(function () {
    init();
});

function init() {
    windowWidth = win.width();
    frameWidth = win.width() - 80;
}

next.on("click", function () {
    var padre = $(this).parent();
    scollWidth = parseFloat(padre.children(".px").val());
    scollWidth = scollWidth - frameWidth;
    padre.children(".px").val(scollWidth)
    padre.children("div.row").velocity({
        left: scollWidth
    }, {
        duration: 700,
        easing: "swing",
        queue: "",
        loop: false, // Si la animación debe ciclarse
        delay: false, // Demora
        mobileHA: true // Acelerado por hardware, activo por defecto
    });
    padre.children("div.row").css("left", scollWidth);
    currentSliderCount--;
    padre.children(".ctn").val(currentSliderCount);
    console.log(currentSliderCount)
});

prev.on("click", function () {
    var padre = $(this).parent();
    scollWidth = parseFloat(padre.children(".px").val());
    scollWidth = scollWidth + frameWidth;
    padre.children(".px").val(scollWidth)
    console.log(padre.children(".ctn").val() + ' ' + (sliderCount - 1))
    if (parseFloat(padre.children(".ctn").val()) >= sliderCount - 1) {
        padre.children("div.row").css("left", 0);
        currentSliderCount = 0;
        padre.children(".ctn").val(currentSliderCount);
        //scollWidth = 0;
        padre.children(".px").val(0)
    } else {
        currentSliderCount++;
        padre.children(".ctn").val(currentSliderCount);
        padre.children('div.row').velocity({
            left: scollWidth
        }, {
            duration: 700,
            easing: "swing",
            queue: "",
            //begin: function() {
            //console.log("iniciando animación")
            //},
            //progress: function() {
            //console.log("animación en proceso")
            //},
            //complete: function() {
            // console.log("animación completada")
            //},
            loop: false, // Si la animación debe ciclarse
            delay: false, // Demora
            mobileHA: true // Acelerado por hardware, activo por defecto
        });
    }
});