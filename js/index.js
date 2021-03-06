var app = angular.module("app", []);

app.controller("AppController", function($scope, $timeout) {
  var ng = $scope;
  var $ = jQuery;

  var socket, host;
  host = "ws://localhost:8000";

  connect = function() {
    try {
      socket = new WebSocket(host);

      console.log("Socket State: " + socket.readyState);

      socket.onopen = function() {
        console.log("Socket Status: " + socket.readyState + " (open)");
        send();
      };

      socket.onclose = function() {
        console.warn("Socket Status: " + socket.readyState + " (closed)");
      };

      socket.onmessage = function(msg) {
        console.log("Received: " + msg.data);
        var chart = $('#container-speed').highcharts(),
        point,
        newVal,
        inc;

        if (chart) {
          point = chart.series[0].points[0];
          var cm = parseFloat(msg.data);
          if (cm > 0) {
            point.update(cm);
          }
        }
        $timeout(function() {
          send();
        }, 1000);
      };
    } catch (exception) {
      console.warn("Error: " + exception);
    }
  };

  send = function() {
    var text = 1;
    try {
      socket.send(text);
    } catch (exception) {
      console.warn("Failed To Send");
    }
  };

  gauge = function() {
    var gaugeOptions = {
      chart: {
        type: 'solidgauge'
      },
      title: null,
      pane: {
        center: ['50%', '85%'],
        size: '140%',
        startAngle: -90,
        endAngle: 90,
        background: {
          backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
          innerRadius: '60%',
          outerRadius: '100%',
          shape: 'arc'
        }
      },
      tooltip: {
        enabled: false
      },
      // the value axis
      yAxis: {
        stops: [
          [0.1, '#55BF3B'], // green
          [0.5, '#DDDF0D'], // yellow
          [0.9, '#DF5353'] // red
        ],
        lineWidth: 0,
        minorTickInterval: null,
        tickPixelInterval: 400,
        tickWidth: 0,
        title: {
          y: -120
        },
        labels: {
          y: 16
        }
      },
      plotOptions: {
        solidgauge: {
          dataLabels: {
            y: 5,
            borderWidth: 0,
            useHTML: true
          }
        }
      }
    };

    $('#container-speed').highcharts(Highcharts.merge(gaugeOptions, {
      yAxis: {
        min: 0,
        max: 500,
        title: {
          text: 'Distancia'
        }
      },
      credits: {
        enabled: false
      },
      series: [{
        name: 'cm',
        data: [0],
        dataLabels: {
          format: '<div style="text-align:center"><span style="font-size:5em;color:' +
          ((Highcharts.theme && Highcharts.theme.contrastTextColor) || '#1B2A56') + '">{y}</span><br/>' +
          '<span style="font-size:1.5em;color:black">cm</span></div>'
        },
        tooltip: {
          valueSuffix: ' cm'
        }
      }]

    }));

  };


  ng.init = function() {
    connect();
    gauge();
  };
});
