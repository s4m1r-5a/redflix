
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
}

if ($('#login').is(':visible') || $('.ver').is(':visible')) {
    $('.h').attr("disabled", true);
    //$("nav.navbar").css("display", "none");
    //$("nav.navbar").hide();
} else {
    $("nav.navbar").show();
}
$('#pin').change(function () {
    var fd = $('form').serialize();
    //var fd = $('#id_registro').val();  
    //alert(fd);
    $.ajax({
        url: '/links/id',
        data: fd,
        type: 'POST',
        success: function (data) {
            if (data != 'Pin de registro invalido, comuniquese con su distribuidor!') {
                $('.h').attr("disabled", false);
            } else if ($('#ipin').val() != "") {
                $(".alert").show();
                $('.alert-message').html('<strong>Error!</strong> ' + data);
                setTimeout(function () {
                    $(".alert").fadeOut(1500);
                }, 1000);
            }

        }
    });
})
$('#quien').change(function () {
    //var fd = $('form').serialize();
    var fd = { quien: $('#quien').val() };
    //alert(fd);
    $.ajax({
        url: '/links/patro',
        data: fd,
        type: 'POST',
        success: function (data) {
            $('#id').val(data[0].id);
            $('input[name="id"]').val(data[0].usuario);
        }
    });
})
$('#ventaiux').click(function () {
    var fd = $('#formulario').serialize();
    alert($('input[name="movil"]').val());
    //var fd = {quien : $('#quien').val()};
    //alert(fd);
    $.ajax({
        url: 'https://iux.com.co/x/venta.php',
        data: fd,
        type: 'POST',
        success: function (data) {
            alert(data);
        }
    });
})
$(function () {
    var date = new Date()
    var d = date.getDate(),
        m = date.getMonth(),
        y = date.getFullYear()
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
        eventClick: function (calEvent, jsEvent, view) {
            alert(calEvent.title);
        },
        eventDrop: function (calEvent) { }
    });
});

$(function () {
    $("#datetimepicker-dashboard").datetimepicker({
        inline: true,
        sideBySide: false,
        format: "L"
    });
});
$(document).ready(function () {
    //if (window.location == "http://localhost:3000/tablero") {
    // Line chart
    $(".datos").each(function () {
        if ($(this).attr('id') == undefined) {
            if ($(this).attr('class') == 'datos dos') {
                $('#ventames').html($(this).val());
            } else {
                $('#utilidad').html($(this).val());
            }
        } else {
            $('#ventaprecio').html($(this).val());
        }
    });
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
                borderDash: [5, 5],
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
                //data: datos
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
});
$(function () {
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
});
$(function () {
    $("#datatables-dashboard-projects").DataTable({
        pageLength: 6,
        lengthChange: false,
        bFilter: false,
        autoWidth: false
    });
});