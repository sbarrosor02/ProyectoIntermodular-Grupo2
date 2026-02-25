document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const authMessage = document.getElementById('auth-message');
    const authSection = document.getElementById('auth-section');
    const dashboard = document.getElementById('dashboard');

    const detectorRange = document.getElementById('detector-range');
    const detectionCone = document.getElementById('detection-cone');
    const detectionStatusDiv = document.getElementById('detection-status');
    const detectionStatusText = detectionStatusDiv.querySelector('.status-text');
    const buzzerStatusDiv = document.getElementById('buzzer-status');
    const buzzerStatusText = buzzerStatusDiv.querySelector('.status-text');
    const personAnimation = document.getElementById('person-animation');
    const detectionTimerDiv = document.getElementById('detection-timer');
    const resetBtn = document.getElementById('reset-btn');
    const startWalkBtn = document.getElementById('start-animation-btn');
    const statusPanel = document.getElementById('statusPanel');
    const statusTitle = document.getElementById('statusTitle');
    const statusDesc = document.getElementById('statusDesc');
    const popupNotificationContainer = document.getElementById('popup-notification-container');

    let detectionInterval = null;
    let detectionTimestamp = null;
    let personPosition = -60;
    let animationFrameId;
    let isWalking = false;

    // --- Authentication ---
    async function authenticate(endpoint) {
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (!username || !password) {
            authMessage.textContent = 'Por favor, introduce usuario y contraseña.';
            authMessage.style.color = 'red';
            return;
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            authMessage.textContent = data.message;
            if (response.ok) {
                authMessage.style.color = 'green';
                setTimeout(() => {
                    authSection.classList.add('hidden');
                    dashboard.classList.remove('hidden');
                    initializeDashboard();
                }, 1000);
            } else {
                authMessage.style.color = 'red';
            }
        } catch (error) {
            console.error('Authentication error:', error);
            authMessage.textContent = 'Error de conexión con el servidor.';
            authMessage.style.color = 'red';
        }
    }

    loginBtn.addEventListener('click', () => authenticate('/login'));
    registerBtn.addEventListener('click', () => authenticate('/register'));

    // --- Dashboard Initialization ---
    function initializeDashboard() {
        const socket = io();

        function animatePerson() {
            if (!isWalking) return;

            const stage = document.getElementById('stage');
            const stageWidth = stage.offsetWidth;
            const personWidth = personAnimation.offsetWidth;

            personPosition += 2.5;
            personAnimation.style.left = `${personPosition}px`;

            const personCenter = personPosition + (personWidth / 2);
            const stageCenter = stageWidth / 2;
            const coneHalfWidth = 75;

            const isDetected = (personCenter > stageCenter - coneHalfWidth && personCenter < stageCenter + coneHalfWidth);

            if (isDetected && !detectorRange.classList.contains('active')) {
                triggerDetection(socket);
            } else if (!isDetected && detectorRange.classList.contains('active')) {
                resetDetection(socket);
            }

            if (personPosition > stageWidth) {
                stopWalking();
            } else {
                animationFrameId = requestAnimationFrame(animatePerson);
            }
        }

        function triggerDetection(socket) {
            detectorRange.classList.add('active');
            detectionCone.classList.add('active');
            personAnimation.classList.add('active');
            statusPanel.classList.add('alarm');
            statusTitle.textContent = "🚨 MOVIMIENTO DETECTADO";
            statusDesc.textContent = "El sensor PIR ha detectado un intruso en el rango.";

            detectionTimestamp = Date.now();
            startDetectionTimer();
            socket.emit('clientDetectionTriggered', { detected: true });

            detectionStatusDiv.classList.remove('no-detection');
            detectionStatusDiv.classList.add('detection-active');
            detectionStatusText.textContent = '¡Persona detectada!';

            displayNotification('¡Movimiento detectado! El sensor PIR ha enviado señal HIGH.', 'error');
        }

        function resetDetection(socket) {
            detectorRange.classList.remove('active');
            detectionCone.classList.remove('active');
            personAnimation.classList.remove('active');
            statusPanel.classList.remove('alarm');
            statusTitle.textContent = "Sistema en Reposo";
            statusDesc.textContent = "Esperando detección en el campo de visión.";

            stopDetectionTimer();
            socket.emit('clientDetectionTriggered', { detected: false });

            detectionStatusDiv.classList.remove('detection-active');
            detectionStatusDiv.classList.add('no-detection');
            detectionStatusText.textContent = 'Esperando...';
        }

        function startWalking() {
            if (isWalking) return;
            isWalking = true;
            personPosition = -60;
            startWalkBtn.disabled = true;
            animatePerson();
        }

        function stopWalking() {
            isWalking = false;
            personPosition = -60;
            personAnimation.style.left = `${personPosition}px`;
            startWalkBtn.disabled = false;
            cancelAnimationFrame(animationFrameId);
            resetDetection(socket);
        }

        startWalkBtn.addEventListener('click', startWalking);

        socket.on('buzzerStatus', (data) => {
            if (data.active) {
                buzzerStatusDiv.classList.remove('buzzer-inactive');
                buzzerStatusDiv.classList.add('buzzer-active');
                buzzerStatusText.textContent = 'Activo';
                displayNotification('¡El zumbador está activo!', 'error');
            } else {
                buzzerStatusDiv.classList.remove('buzzer-active');
                buzzerStatusDiv.classList.add('buzzer-inactive');
                buzzerStatusText.textContent = 'Inactivo';
            }
        });

        resetBtn.addEventListener('click', () => {
            socket.emit('reset');
            displayNotification('Sistema reiniciado.', 'info');
            stopWalking();
        });
    }

    // --- Timer Functions ---
    function startDetectionTimer() {
        if (detectionInterval) clearInterval(detectionInterval);
        detectionTimerDiv.textContent = '';

        detectionInterval = setInterval(() => {
            if (detectionTimestamp) {
                const elapsedSeconds = Math.floor((Date.now() - detectionTimestamp) / 1000);
                detectionTimerDiv.textContent = `Detectado hace ${elapsedSeconds} segundos`;
            }
        }, 1000);
    }

    function stopDetectionTimer() {
        if (detectionInterval) {
            clearInterval(detectionInterval);
            detectionInterval = null;
        }
        detectionTimerDiv.textContent = '';
    }

    // --- Pop-up Notification Display ---
    function displayNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.classList.add('popup-notification', type);
        notification.textContent = message;
        popupNotificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
});
