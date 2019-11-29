var $validationForm = $("#smartwizard-arrows-primary");
$validationForm.smartWizard({
    theme: "arrows",
    showStepURLhash: false,
    lang: {// Variables del lenguaje
        next: 'Siguiente',
        previous: 'Atras'
    },
    toolbarSettings: {
        toolbarPosition: 'bottom', // none, top, bottom, both
        toolbarButtonPosition: 'right', // left, right
        showNextButton: true, // show/hide a Next button
        showPreviousButton: false // show/hide a Previous button
        //toolbarExtraButtons: [$("<button class=\"btn btn-submit btn-primary\" type=\"button\">Finish</button>")]
    },
    autoAdjustHeight: false,
    backButtonSupport: false,
    useURLhash: false
}).on("leaveStep", () => {
    var fd = $('form').serialize();
    let skdt;
    $.ajax({
        url: '/links/id',
        data: fd,
        type: 'POST',
        async: false,
        success: function (data) {
            //alert(data)
            if (data != 'Pin de registro invalido, comuniquese con su distribuidor!') {
                $('.h').attr("disabled", false);
                skdt = true;
            } else if ($('#ipin').val() != "") {
                $(".alert").show();
                $('.alert-message').html('<strong>Error!</strong> ' + data);
                setTimeout(function () {
                    $(".alert").fadeOut(3000);
                }, 2000);
                skdt = false;
            }
        }
    });
    return skdt;
});
function init_events(ele) {
    ele.each(function () {
        // crear un objeto de evento (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
        // no necesita tener un comienzo o un final
        var eventObject = {
            title: $.trim($(this).text()) // Usa el texto del elemento como título del evento.
        }
        // almacenar el objeto de evento en el elemento DOM para que podamos acceder a él más tarde
        $(this).data('eventObject', eventObject)
        // haz que el evento se pueda arrastrar usando jQuery UI
        $(this).draggable({
            zIndex: 1070,
            revert: true, // hará que el evento vuelva a su
            revertDuration: 0 //  Posición original después del arrastre
        })
    })
};

$('.pagarpayu').attr("disabled", true);
$('.ntfx').attr("disabled", true);
$('input[name="nombre"]').attr("disabled", true);

/*$('.pagar').change(function () {
    card = $(this).parents('div.card').attr("id")
    var fd = $(`#${card} form`).serialize();
    actualizardatos(card, fd)
});*/

function actualizardatos(card, fd, ot) {
    $.ajax({
        url: '/links/cliente',
        data: fd,
        type: 'POST',
        async: false,
        success: function (data) {
            if (data[0] !== 'smg') {
                $(`#${card} .pagarpayu`).attr("disabled", false);
                if (ot) {
                    $(`.pagarpayu`).attr("disabled", false);
                    $(`input[name="telephone"]`).val(data[2][0].id);
                    $(`input[name="buyerFullName"]`).val(data[2][0].name);
                    $(`input[name="buyerEmail"]`).val(data[2][0].email);
                }
                $('input[name="signature"]').val(data[0]);
                $('input[name="referenceCode"]').val(data[1]);
                $(`#${card} form`).submit();
                $('#ModalEventos').one('shown.bs.modal', function() {
                    $('#ModalEventos').modal('hide') 
                }).modal('show');                
            } else {
                $('#actualizardatos').html(`${data[1]}Si desea realizar alguna modificacion a tu cuenta presione editar, en caso contrario verifique bien los datos ingresados e intentelo nuevamente, para mayor informacion puede contactarnos al 3012673944 Wtspp`)
                //$('#actualizar').modal('toggle');
                $('#ModalEventos').one('shown.bs.modal', function() {
                    $('#ModalEventos').modal('hide') 
                }).modal('show');
                $('#ModalEventos').one('hidden.bs.modal', function() {
                    $('#actualizar').modal('show'); 
                }).modal('hide');
                let cont = 0;
                let dat = data[2].map((r) => {
                    cont++
                    return `<li class="mb-4">
                            <input type="text" name="telephone" class="form-control pagar g${cont}" placeholder="Movil"
                            style="text-align:center" value="${r.id}">
                        </li>
                        <li class="mb-4">
							<input type="hidden" name="actualizar" class="g${cont}" value="${r.id}">
						</li>
                        <li class="mb-4">
                            <input type="text" name="buyerFullName" class="form-control pagar g${cont}"
                            placeholder="Nombre completo" style="text-align:center;" value="${r.name}">
                        </li>
                        <li class="mb-4">
                            <input type="email" name="buyerEmail" class="form-control pagar g${cont}" placeholder="Email"
                            style="text-align:center;" value="${r.email}">
                        </li>
                        <li class="mb-4">
                            <hr width=400>
                        </li>`
                });
                $('#datosactualiza').html(dat);
            }
        }
    });
}
$('.pagarp').click(function () {
    card = $(this).parents('div.card').attr("id")
    if ($(`#${card} input[name="telephone"]`).val() != "" && $(`#${card} input[name="buyerFullName"]`).val() != "" && $(`#${card} input[name="buyerEmail"]`).val() != "") {
        $('#ModalEventos').modal({
            backdrop: 'static',
            keyboard: true,
            toggle: true
        });        
        var fd = $(`#${card} form`).serialize();
        actualizardatos(card, fd)
    } else {
        alert('Debes completar todos los campos');
    }
});

$(".pagar").keydown(function () {
    $(`.pagarpayu`).attr("disabled", true);
});
$('#meterdat').on('click', function () {
    card = $(this).parents('div.card').attr("id")
    var fd = $(`#${card} form`).serialize(), ot = 'ot';
    actualizardatos(card, fd, ot)
});
$('#eliminard').on('click', function () {
    $(".g2").remove('input');
    $(".g1").remove('input');
});
$('#datosactualiza').on('change', '.g1', function () {
    $(".g2").remove('input');
});
$('#datosactualiza').on('change', '.g2', function () {
    $(".g1").remove('input');
});
if ($('#iuxemail').html() == '' && $('#iuxemail').is(':visible')) {
    window.location.href = "https://iux.com.co/app/login";
};
if ($('#msg').html() == 'aprobada') {
    history.pushState(null, "", "planes?iux=ir");
};
$('#iriux').click(function () {
    window.location.href = "https://iux.com.co/app/login";
});
if ($('#pin').is(':visible') || $('.ver').is(':visible')) {
    $('.h').attr("disabled", true);
} else {
    $("nav.navbar").show();
};
$('#quien').change(function () {
    var fd = { quien: $('#quien').val() };
    $.ajax({
        url: '/links/patro',
        data: fd,
        type: 'POST',
        success: function (data) {
            $('#id').val(data[0].id);
            $('input[name="id"]').val(data[0].usuario);
        }
    });
});
$(`.movil`).change(function () {
    $('form input[name="nombre"]').val("");
    $('form input[name="user"]').val("");
    var fd = { movil: $(this).val().replace(/-/g, "") };
    $.ajax({
        url: '/links/movil',
        data: fd,
        type: 'POST',
        success: function (data) {
            $(`#${formu} input[name="nombre"]`).val(data[0].nombre);
            $(`#${formu} input[name="user"]`).val(data[0].id);
        }
    });
    $(`form input[name="nombre"]`).attr("disabled", true);
    $(`form .ntfx`).attr("disabled", true);
    $(`#${formu} input[name="nombre"]`).attr("disabled", false);
    $(`#${formu} .ntfx`).attr("disabled", false);
});
$('#ventaiux').click(function () {
    var fd = $('#formulario').serialize();
    //alert($('input[name="movil"]').val());
    $.ajax({
        url: 'https://iux.com.co/x/venta.php',
        data: fd,
        type: 'POST',
        success: function (data) {
            alert(data);
        }
    });
});
$('#canjear').click(function () {
    var fd = { pin: $('#pin').val() };
    $.ajax({
        url: '/links/canjear',
        data: fd,
        type: 'POST',
        success: function (data) {
            if (data !== 'Pin invalido!' && data !== 'Este pin ya fue canjeado!') {
                $('#precio').html('$' + data[0].precio);
                $('#tiempo').html(data[0].dias + ' Dias');
                $('input[name="pin"]').val(data[0].pin);
                $('.z').show("slow");
                $('.y').hide("slow");
            } else {
                alert(data)
            }
        }
    });
});
$('#ediact').click(function () {
    $('.p').hide("slow");
    $('.q').show("slow");
});
$('.plancito').click(function () {
    card = $(this).parents('div.card').attr("id")
    let clase = $(this).attr('href');
    $(`#${card} ${clase}`).show("slow");
    $(`#${card} .z`).hide("slow");
});
$('.payu').click(function () {
    card = $(this).parents('div.card').attr("id")
    let clase = $(this).attr('name');
    $(`#${card} ${clase}`).show("slow");
});
$('.plancit').click(function () {
    let clase = $(this).attr('href');
    $(clase).hide("slow");
    $('.x').hide("slow");
    $('.z').show("slow");
});
if (window.location == "http://localhost:3000/tablero" || window.location == "https://redflixx.herokuapp.com/tablero") {
    var date = new Date()
    $("#fullcalendar").fullCalendar({
        locale: 'es',
        header: {
            left: "prev,next today, Miboton, Reporte",
            center: "title",
            right: "month,agendaWeek,agendaDay,listMonth"
        },
        buttonText: {
            today: 'Hoy',
            month: 'mes',
            week: 'semana',
            day: 'dia',
            listMonth: 'lista'
        },
        customButtons: {
            Miboton: {
                text: "Reservar",
                click: function () {
                    $('#fechas').show();
                    $("#ModalEventos").modal();
                }
            }
        },
        dayClick: function (date, jsEvent, view) {
            alert(date.format() + " " + view.name);
        },
        weekNumbers: true,
        eventLimit: true,
        editable: true,
        events: "https://fullcalendar.io/demo-events.json",
        eventClick: function (calEvent) {
            alert(calEvent.title);
        },
        eventDrop: function () { }
    });
    // Bar chart
    new Chart(document.getElementById("chartjs-dashboard-bar"), {
        type: "bar",
        data: {
            labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            datasets: [{
                label: "Last year",
                backgroundColor: window.theme.primary,
                borderColor: window.theme.primary,
                hoverBackgroundColor: window.theme.primary,
                hoverBorderColor: window.theme.primary,
                data: [54, 67, 41, 55, 62, 45, 55, 73, 60, 76, 48, 79]
            }, {
                label: "This year",
                backgroundColor: "#E8EAED",
                borderColor: "#E8EAED",
                hoverBackgroundColor: "#E8EAED",
                hoverBorderColor: "#E8EAED",
                data: [69, 66, 24, 48, 52, 51, 44, 53, 62, 79, 51, 68]
            }]
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    gridLines: {
                        display: false
                    },
                    stacked: false,
                    ticks: {
                        stepSize: 20
                    }
                }],
                xAxes: [{
                    barPercentage: .75,
                    categoryPercentage: .5,
                    stacked: false,
                    gridLines: {
                        color: "transparent"
                    }
                }]
            }
        }
    });

    $("#datetimepicker-dashboard").datetimepicker({
        inline: true,
        sideBySide: false,
        format: "L"
    });

    var ld = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // Line chart
    var f = new Date(),
        pro = 0,
        prom = 0,
        promedio = 0;
    $(".datos").each(function () {
        if ($(this).attr('id') == undefined) {
            if ($(this).attr('class') == 'datos dos') {
                $('#ventames').html($(this).val());
            } else {
                $('#utilidad').html($(this).val());
            }
        } else {
            $('#ventaprecio').html($(this).val());
            if ($(this).attr('id') <= f.getMonth()) {
                pro += 1;
                prom += parseFloat($(this).val());
                prom /= pro;
                promedio = Math.round(prom);
            }
            $('#promedio').html(promedio);
        }
    });
    $('#promedio').mask('000,000,000', { reverse: true });
    $('#utilidad').mask('000,000,000', { reverse: true });
    $('#ventaprecio').mask('000,000,000', { reverse: true });
    new Chart(document.getElementById("chartjs-line"), {
        type: "line",
        data: {
            labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            datasets: [{
                label: "Ventas ($)",
                fill: true,
                backgroundColor: "transparent",
                borderColor: window.theme.primary,
                data: [
                    $('#1').val(),
                    $('#2').val(),
                    $('#3').val(),
                    $('#4').val(),
                    $('#5').val(),
                    $('#6').val(),
                    $('#7').val(),
                    $('#8').val(),
                    $('#9').val(),
                    $('#10').val(),
                    $('#11').val(),
                    $('#12').val()
                ]
            }, {
                label: "Ventas indirectas ($)",
                fill: true,
                backgroundColor: "transparent",
                borderColor: window.theme.tertiary,
                borderDash: [4, 4],
                data: [
                    $('#m1').val(),
                    $('#m2').val(),
                    $('#m3').val(),
                    $('#m4').val(),
                    $('#m5').val(),
                    $('#m6').val(),
                    $('#m7').val(),
                    $('#m8').val(),
                    $('#m9').val(),
                    $('#m10').val(),
                    $('#m11').val(),
                    $('#m12').val()
                ]
            }]
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            tooltips: {
                intersect: false
            },
            hover: {
                intersect: true
            },
            plugins: {
                filler: {
                    propagate: false
                }
            },
            scales: {
                xAxes: [{
                    reverse: true,
                    gridLines: {
                        color: "rgba(0,0,0,0.05)"
                    }
                }],
                yAxes: [{
                    ticks: {
                        stepSize: 1000000
                    },
                    display: true,
                    borderDash: [5, 5],
                    gridLines: {
                        color: "rgba(0,0,0,0)",
                        fontColor: "#fff"
                    }
                }]
            }
        }
    });

    // Pie chart
    new Chart(document.getElementById("chartjs-dashboard-pie"), {
        type: "pie",
        data: {
            labels: ["Direct", "Affiliate", "E-mail", "Other"],
            datasets: [{
                data: [2602, 1253, 541, 1465],
                backgroundColor: [
                    window.theme.primary,
                    window.theme.warning,
                    window.theme.danger,
                    "#E8EAED"
                ],
                borderColor: "transparent"
            }]
        },
        options: {
            responsive: !window.MSInputMethodContext,
            maintainAspectRatio: false,
            legend: {
                display: false
            }
        }
    });

    $("#datatables-dashboard-projects").DataTable({
        pageLength: 6,
        lengthChange: false,
        bFilter: false,
        autoWidth: false
    });
};