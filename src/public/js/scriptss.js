
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

if (window.location == "http://localhost:3000/tablero"){  
    var ld = [0,0,0,0,0,0,0,0,0,0,0,0];  
    // Line chart
    $(".datos").each(function(){
        if($(this).attr('id') == undefined){
           if($(this).attr('class') == 'datos dos'){
            $('#ventames').html($(this).val());
           }else{
            $('#utilidad').html($(this).val());
           }           
        } else {
            $('#ventaprecio').html($(this).val());
        }      
    });
    $('#utilidad').mask('000,000,000', { reverse: true });    
    $('#ventaprecio').mask('000,000,000', { reverse: true }); 
    $.ajax({
        url: '/tablero2',
        type: 'POST',
        success: function (data) {
            data.forEach(function(data, index) {
                ld[data.Mes-1]=data.venta;
            });
        }
    });  
    console.log(ld[6]);

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
                    $('#4').val() ,
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
                //data: [100000, 20000, 1000000, 400000, 500000, 300000, 700000, 100000, 500000, 100000, 150000, 1200000]
                //data: [ld[0],ld[1],ld[2],ld[3],ld[4],ld[5],ld[6],ld[7],ld[8],ld[9],ld[10],ld[11]]
                data: ld
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

    // Bar chart
    new Chart(document.getElementById("chartjs-dashboard-bar"), {
        type: "bar",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
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
});

$(function () {
    $("#datetimepicker-dashboard").datetimepicker({
        inline: true,
        sideBySide: false,
        format: "L"
    });
});

$(function () {
    // Line chart
    new Chart(document.getElementById("chartjs-dashboard-line"), {
        type: "line",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [{
                label: "Sales ($)",
                fill: true,
                backgroundColor: "transparent",
                borderColor: window.theme.primary,
                data: [2015, 1465, 1487, 1796, 1387, 2123, 2866, 2548, 3902, 4938, 3917, 4927]
            }, {
                label: "Orders",
                fill: true,
                backgroundColor: "transparent",
                borderColor: window.theme.tertiary,
                borderDash: [4, 4],
                data: [928, 734, 626, 893, 921, 1202, 1396, 1232, 1524, 2102, 1506, 1887]
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
                        stepSize: 500
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