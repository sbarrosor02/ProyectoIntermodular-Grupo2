const char WEB_DASHBOARD[] PROGMEM = R"=====(
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Monitor Residencia IoT</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; background: #e0e5ec; color: #444; margin: 0; padding: 20px; }
        h1 { color: #2c3e50; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; max-width: 1000px; margin: 0 auto; }
        .card { background: white; padding: 20px; border-radius: 15px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); transition: transform 0.2s; }
        .card:hover { transform: translateY(-5px); }
        .icon { font-size: 3rem; margin-bottom: 10px; display: block; }
        .status { font-size: 1.2rem; font-weight: bold; padding: 8px 15px; border-radius: 20px; display: inline-block; margin-top: 10px; }
        .status.ok { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .status.alert { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .status.auth { background: #cce5ff; color: #004085; border: 1px solid #b8daff; }
        
        #log_container { grid-column: 1 / -1; text-align: left; }
        #log { max-height: 250px; overflow-y: auto; background: #f8f9fa; padding: 15px; border-radius: 10px; border: 1px solid #ddd; font-family: monospace; font-size: 0.9rem; }
        .log-entry { padding: 5px 0; border-bottom: 1px solid #eee; }
        .log-entry:last-child { border-bottom: none; }
    </style>
</head>
<body>
    <h1>🏠 Panel de Control Residencia IoT</h1>
    
    <div class='grid'>
        <!-- Tarjeta Puerta -->
        <div class='card'>
            <span class='icon'>🚪</span>
            <h3>Puerta Principal</h3>
            <div id='hall_stat' class='status ok'>CERRADA</div>
        </div>

        <!-- Tarjeta Movimiento -->
        <div class='card'>
            <span class='icon'>🏃</span>
            <h3>Sensor Movimiento</h3>
            <div id='pir_stat' class='status ok'>INACTIVO</div>
        </div>

        <!-- Tarjeta Seguridad / RFID -->
        <div class='card'>
            <span class='icon'>🛡️</span>
            <h3>Sistema de Acceso</h3>
            <div id='auth_stat' class='status alert'>BLOQUEADO</div>
            <p style="font-size:0.8rem; margin-top:5px;">Requiere tarjeta RFID</p>
        </div>

        <!-- Historial -->
        <div class='card' id='log_container'>
            <h3>📋 Historial de Eventos</h3>
            <div id='log'>Cargando datos...</div>
        </div>
    </div>

    <script>
        function updateDashboard() {
            fetch('/api/status')
                .then(response => response.json())
                .then(data => {
                    // Actualizar Puerta
                    const hallEl = document.getElementById('hall_stat');
                    hallEl.innerText = data.hall ? "ABIERTA" : "CERRADA";
                    hallEl.className = data.hall ? "status alert" : "status ok";

                    // Actualizar PIR
                    const pirEl = document.getElementById('pir_stat');
                    pirEl.innerText = data.pir ? "DETECTADO" : "INACTIVO";
                    pirEl.className = data.pir ? "status alert" : "status ok";

                    // Actualizar Auth (RFID)
                    const authEl = document.getElementById('auth_stat');
                    if (data.authorized) {
                        authEl.innerText = "AUTORIZADO";
                        authEl.className = "status auth";
                    } else {
                        authEl.innerText = "BLOQUEADO";
                        authEl.className = "status alert";
                    }

                    // Actualizar Logs
                    let logHtml = "";
                    data.logs.forEach(entry => {
                        if(entry) logHtml += `<div class='log-entry'>${entry}</div>`;
                    });
                    document.getElementById('log').innerHTML = logHtml;
                })
                .catch(err => console.error('Error fetching data:', err));
        }

        // Actualizar cada 1 segundo
        setInterval(updateDashboard, 1000);
        updateDashboard(); // Primera carga inmediata
    </script>
</body>
</html>
)=====";