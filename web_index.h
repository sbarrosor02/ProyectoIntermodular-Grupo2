const char WEB_DASHBOARD[] PROGMEM = R"=====(
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Monitor Residencia</title>
    <style>
        body { font-family: sans-serif; text-align: center; background: #f4f4f9; color: #333; }
        .card { background: white; padding: 20px; margin: 15px auto; width: 80%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .status { font-size: 1.5rem; font-weight: bold; padding: 10px; border-radius: 5px; }
        .alert { background: #e74c3c; color: white; }
        .ok { background: #27ae60; color: white; }
        #log { text-align: left; max-height: 200px; overflow-y: auto; background: #eee; padding: 10px; }
    </style>
</head>
<body>
    <h1>🛡️ Control de Seguridad - Residencia</h1>
    <div class='card'>
        <h3>Puerta (Sensor Hall)</h3>
        <div id='hall_stat' class='status ok'>CERRADA</div>
    </div>
    <div class='card'>
        <h3>Movimiento (PIR)</h3>
        <div id='pir_stat' class='status ok'>SIN MOVIMIENTO</div>
    </div>
    <div class='card'>
        <h3>Historial de Eventos</h3>
        <div id='log'>Esperando datos...</div>
    </div>

    <script>
        setInterval(function() {
            fetch('/api/status').then(r => r.json()).then(data => {
                document.getElementById('hall_stat').innerText = data.hall ? "ABIERTA" : "CERRADA";
                document.getElementById('hall_stat').className = data.hall ? "status alert" : "status ok";
                document.getElementById('pir_stat').innerText = data.pir ? "MOVIMIENTO" : "CALMA";
                document.getElementById('pir_stat').className = data.pir ? "status alert" : "status ok";
                
                let logHtml = "";
                data.logs.forEach(l => logHtml += "<div>" + l + "</div>");
                document.getElementById('log').innerHTML = logHtml;
            });
        }, 1000);
    </script>
</body>
</html>
)=====";
