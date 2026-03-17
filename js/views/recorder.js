function renderRecorder(navigateTo) {
    const container = document.createElement('div');

    container.innerHTML = `
        <nav class="navbar">
            <div class="container flex justify-between items-center">
                <div class="flex items-center gap-sm">
                    <button id="backBtn" class="btn" style="padding: 0.5rem;">← Back</button>
                    <h2 style="font-size: 1.25rem;">Voice Recorder</h2>
                </div>
            </div>
        </nav>

        <main class="container" style="padding-top: 3rem; max-width: 600px; text-align: center;">
            <div class="card" style="padding: 2.5rem;">
                <div style="margin-bottom: 2rem;">
                    <h1 style="font-size: 2rem;">Record Your Story</h1>
                    <p style="color: var(--color-text-muted); margin-top: 0.5rem;">
                        Speak naturally. You can pause and resume as needed.
                    </p>
                </div>

                <div style="margin: 3rem 0; position: relative; min-height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <div id="timer" style="font-family: monospace; font-size: 2.5rem; margin-bottom: 2rem; font-weight: bold; color: var(--color-primary);">
                        00:00
                    </div>

                    <div class="flex items-center justify-center" style="width: 100%;">
                        <button id="recordBtn" class="btn" style="border-radius: 50%; width: 80px; height: 80px; background: #ef4444; border: 4px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; padding: 0; transition: all 0.2s; color: white;">
                            <div id="mic-icon-svg">
                                <svg viewBox="0 0 24 24" fill="currentColor" style="width: 32px; height: 32px;">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                                </svg>
                            </div>
                            <div id="stop-icon-svg" style="display: none;">
                                <svg viewBox="0 0 24 24" fill="currentColor" style="width: 32px; height: 32px;">
                                    <rect x="6" y="6" width="12" height="12" rx="1.5" />
                                </svg>
                            </div>
                        </button>
                    </div>

                    <button id="resetBtn" class="btn" style="display: none; position: absolute; right: 0; border: 1px solid var(--color-border); font-size: 0.8rem; padding: 0.5rem 1rem;">
                        ↺ Reset
                    </button>

                    <div id="statusText" style="margin-top: 2rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted);">Ready to record</div>
                </div>

                <div id="audioPreview" class="hidden" style="margin-top: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 12px; border: 1px solid var(--color-border);">
                    <audio controls style="width: 100%;"></audio>
                    <div class="flex justify-center mt-md">
                        <button id="saveBtn" class="btn btn-primary">Save Recording</button>
                    </div>
                </div>
            </div>
        </main>
    `;

    // Logic
    const recordBtn = container.querySelector('#recordBtn');
    const micIconSvg = container.querySelector('#mic-icon-svg');
    const stopIconSvg = container.querySelector('#stop-icon-svg');
    const resetBtn = container.querySelector('#resetBtn');
    const timerElem = container.querySelector('#timer');
    const statusText = container.querySelector('#statusText');
    const audioPreview = container.querySelector('#audioPreview');
    const audioElement = audioPreview.querySelector('audio');
    const saveBtn = container.querySelector('#saveBtn');
    const backBtn = container.querySelector('#backBtn');

    let mediaRecorder;
    let audioChunks = [];
    let startTime = null;
    let timerInterval = null;
    let pausedTime = 0;

    function startTimer() {
        if (!startTime) {
            startTime = Date.now();
        } else {
            const now = Date.now();
            startTime = now - (pausedTime || 0);
        }

        timerInterval = setInterval(() => {
            const delta = Date.now() - startTime;
            const minutes = Math.floor(delta / 60000).toString().padStart(2, '0');
            const seconds = Math.floor((delta % 60000) / 1000).toString().padStart(2, '0');
            timerElem.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        pausedTime = Date.now() - startTime;
    }

    function stopTimer() {
        clearInterval(timerInterval);
        startTime = null;
        pausedTime = 0;
    }

    recordBtn.addEventListener('click', async () => {
        // Toggle Logic
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.pause();
            pauseTimer();

            recordBtn.classList.remove('pulse-recording');
            micIconSvg.style.display = 'block';
            stopIconSvg.style.display = 'none';

            statusText.textContent = '● PAUSED';
            statusText.style.color = '#64748b';
            resetBtn.style.display = 'block';
            audioPreview.classList.remove('hidden');
            return;
        }

        if (mediaRecorder && mediaRecorder.state === 'paused') {
            mediaRecorder.resume();
            startTimer();

            recordBtn.classList.add('pulse-recording');
            micIconSvg.style.display = 'none';
            stopIconSvg.style.display = 'block';

            statusText.textContent = '● RECORDING';
            statusText.style.color = '#ef4444';
            resetBtn.style.display = 'none';
            return;
        }

        // New Recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = event => audioChunks.push(event.data);

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioElement.src = audioUrl;
                audioPreview.classList.remove('hidden');
                statusText.textContent = 'Recording complete';
                statusText.style.color = 'var(--color-text-muted)';
                recordBtn.classList.remove('pulse-recording');
                micIconSvg.style.display = 'block';
                stopIconSvg.style.display = 'none';
            };

            mediaRecorder.start();
            startTimer();

            recordBtn.classList.add('pulse-recording');
            micIconSvg.style.display = 'none';
            stopIconSvg.style.display = 'block';

            resetBtn.style.display = 'none';
            audioPreview.classList.add('hidden');

            statusText.textContent = '● RECORDING';
            statusText.style.color = '#ef4444';

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please allow permissions.");
        }
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('Trash this recording and start over?')) {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
            timerElem.textContent = '00:00';
            stopTimer();
            audioPreview.classList.add('hidden');
            resetBtn.style.display = 'none';
            statusText.textContent = 'Ready to record';
            micIconSvg.style.display = 'block';
            stopIconSvg.style.display = 'none';
        }
    });

    saveBtn.addEventListener('click', () => {
        if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
            mediaRecorder.stop();
            stopTimer();
        }
        alert("Recording saved locally (Demo only).");
    });

    backBtn.addEventListener('click', () => {
        navigateTo('dashboard');
    });

    return container;
}
