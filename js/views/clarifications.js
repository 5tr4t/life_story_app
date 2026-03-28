function renderClarifications(navigateTo, state) {
    const container = document.createElement('div');
    const chapterNum = state.activeChapter;
    const chapter = state.chapters.find(c => (c.chapterNumber || c.id) === chapterNum);

    if (!chapter || !chapter.clarifications || chapter.clarifications.length === 0) {
        state.currentView = 'interviews';
        navigateTo('interviews');
        return container;
    }

    const clarifications = chapter.clarifications;
    let currentIdx = 0;
    const responses = {};

    function renderCurrentClarification() {
        const item = clarifications[currentIdx];
        const isBinary = item.type === 'binary';

        container.innerHTML = `
            <nav class="navbar">
                <div class="container flex justify-between items-center">
                    <button id="cancelBtn" class="btn">Cancel</button>
                    <span style="font-weight: 600;">Refining: ${chapter.title}</span>
                    <span style="color: var(--color-text-muted); font-size: 0.875rem;">
                        ${currentIdx + 1} of ${clarifications.length}
                    </span>
                </div>
            </nav>

            <main class="container" style="padding-top: 4rem; max-width: 600px;">
                <div class="card" style="padding: 2.5rem; border: 2px solid var(--color-accent);">
                    <div style="margin-bottom: 2rem; text-align: center;">
                        <span style="background: var(--color-accent); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase;">
                            Clarification Needed
                        </span>
                        <h2 style="font-size: 1.5rem; margin-top: 1.5rem; line-height: 1.4;">
                            ${item.text}
                        </h2>
                    </div>

                    <div id="clarification-interface">
                        ${isBinary ? `
                            <div class="flex flex-col gap-md">
                                <div class="flex gap-md">
                                    <button id="yesBtn" class="btn btn-outline flex-1" style="height: 60px; font-size: 1.125rem; border: 1px solid var(--color-border);">Yes</button>
                                    <button id="noBtn" class="btn btn-outline flex-1" style="height: 60px; font-size: 1.125rem; border: 1px solid var(--color-border);">No</button>
                                </div>
                                <div id="correction-container" style="margin-top: 1.5rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 600;">Additional details (optional):</label>
                                    <textarea id="correctionInput" class="input" placeholder="Type any clarification or details here..." style="width: 100%; min-height: 120px; padding: 1rem;"></textarea>
                                </div>
                            </div>
                        ` : `
                             <div id="audio-recording-container" style="text-align: center; padding: 2rem; border: 2px dashed var(--color-border); border-radius: 12px 12px 0 0; background: #f8fafc; position: relative;">
                                <div id="recording-controls">
                                    <div id="waveform-container" style="height: 60px; display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 1.5rem;">
                                        <div class="waveform-bar"></div>
                                        <div class="waveform-bar"></div>
                                        <div class="waveform-bar"></div>
                                        <div class="waveform-bar"></div>
                                        <div class="waveform-bar"></div>
                                        <div class="waveform-bar"></div>
                                        <div class="waveform-bar"></div>
                                        <div class="waveform-bar"></div>
                                    </div>
                                    
                                    <div id="timer" style="font-family: monospace; font-size: 1.75rem; margin-bottom: 1.5rem; font-weight: bold; color: var(--color-primary);">
                                        00:00
                                    </div>

                                    <div style="position: relative; height: 100px; display: flex; align-items: center; justify-content: center;">
                                        <!-- Recording Status -->
                                        <div id="recording-status" style="display: none; position: absolute; top: -30px; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                                            <span id="recording-status-text" style="color: #ef4444;">● RECORDING</span>
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

                                        <button id="rerecordBtn" class="btn" style="display: none; position: absolute; right: 0; border: 1px solid var(--color-border); font-size: 0.8rem; padding: 0.5rem 1rem;">
                                            ↺ Re-record
                                        </button>
                                    </div>
                                    
                                    <p id="recording-hint" style="color: var(--color-text-muted); font-size: 0.875rem; margin-top: 1.5rem;">
                                        Click to start recording your voice answer
                                    </p>
                                </div>
                            </div>

                            <div style="position: relative;">
                                <textarea id="openResponse" class="input" placeholder="Your response (optional)..." style="width: 100%; min-height: 120px; padding: 1rem; border-top: none; border-radius: 0 0 12px 12px;"></textarea>
                                <div id="transcribeStatus" style="display: none; position: absolute; bottom: 10px; right: 10px; font-size: 0.75rem; color: var(--color-accent); font-weight: 600; background: rgba(255,255,255,0.9); padding: 2px 8px; border-radius: 10px; z-index: 10;">
                                    Transcribing...
                                </div>
                            </div>

                            <style>
                                .waveform-bar {
                                    width: 4px;
                                    height: 20px;
                                    background: var(--color-border);
                                    border-radius: 2px;
                                    transition: height 0.1s ease;
                                }
                                .recording .waveform-bar {
                                    background: #ef4444;
                                    animation: pulse 0.6s infinite ease-in-out;
                                }
                                @keyframes pulse {
                                    0%, 100% { height: 10px; }
                                    50% { height: 40px; }
                                }
                                .waveform-bar:nth-child(2) { animation-delay: 0.1s; }
                                .waveform-bar:nth-child(3) { animation-delay: 0.2s; }
                                .waveform-bar:nth-child(4) { animation-delay: 0.3s; }
                                .waveform-bar:nth-child(5) { animation-delay: 0.4s; }
                                .waveform-bar:nth-child(6) { animation-delay: 0.3s; }
                                .waveform-bar:nth-child(7) { animation-delay: 0.2s; }
                                .waveform-bar:nth-child(8) { animation-delay: 0.1s; }
                                
                                .pulse-recording {
                                    animation: shadow-pulse 1.5s infinite;
                                }
                                @keyframes shadow-pulse {
                                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                                    70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
                                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                                }
                            </style>
                        `}
                    </div>

                    <div id="saveStatus" style="text-align: center; margin-top: 1.5rem; color: var(--color-text-muted); font-size: 0.875rem;"></div>

                    <div class="flex justify-between items-center" style="margin-top: 2.5rem;">
                        <button id="prevBtn" class="btn" ${currentIdx === 0 ? 'disabled' : ''}>← Previous</button>
                        <button id="nextBtn" class="btn btn-accent" style="min-width: 120px;">
                            ${currentIdx === clarifications.length - 1 ? 'Finish' : 'Next →'}
                        </button>
                    </div>
                </div>
                
                <p style="text-align: center; color: var(--color-text-muted); font-size: 0.875rem; margin-top: 2rem;">
                    Your answers help us create a more accurate and polished version of your FondMemoirs.
                </p>
            </main>
        `;

        // Attach listeners
        const saveStatus = container.querySelector('#saveStatus');
        const nextBtn = container.querySelector('#nextBtn');
        const prevBtn = container.querySelector('#prevBtn');
        const cancelBtn = container.querySelector('#cancelBtn');

        if (isBinary) {
            const yesBtn = container.querySelector('#yesBtn');
            const noBtn = container.querySelector('#noBtn');
            const correctionInput = container.querySelector('#correctionInput');

            // Restore previous answer if exists
            if (responses[item.id]) {
                if (responses[item.id].answer === 'Yes') {
                    yesBtn.classList.replace('btn-outline', 'btn-primary');
                    yesBtn.style.color = 'white';
                } else if (responses[item.id].answer === 'No') {
                    noBtn.classList.replace('btn-outline', 'btn-primary');
                    noBtn.style.color = 'white';
                }
                correctionInput.value = responses[item.id].correction || '';
            }

            yesBtn.onclick = () => {
                responses[item.id] = { answer: 'Yes', correction: correctionInput.value };
                yesBtn.classList.replace('btn-outline', 'btn-primary');
                yesBtn.style.color = 'white';
                noBtn.classList.replace('btn-primary', 'btn-outline');
                noBtn.style.color = '';
            };

            noBtn.onclick = () => {
                responses[item.id] = { answer: 'No', correction: correctionInput.value };
                noBtn.classList.replace('btn-outline', 'btn-primary');
                noBtn.style.color = 'white';
                yesBtn.classList.replace('btn-primary', 'btn-outline');
                yesBtn.style.color = '';
            };

            correctionInput.oninput = () => {
                const currentAnswer = responses[item.id] ? responses[item.id].answer : '';
                responses[item.id] = { ...responses[item.id], answer: currentAnswer, correction: correctionInput.value };
            };
        } else {
            const openResponse = container.querySelector('#openResponse');
            const transcribeStatus = container.querySelector('#transcribeStatus');
            const recordBtn = container.querySelector('#recordBtn');
            const micIconSvg = container.querySelector('#mic-icon-svg');
            const stopIconSvg = container.querySelector('#stop-icon-svg');
            const rerecordBtn = container.querySelector('#rerecordBtn');
            const timerElem = container.querySelector('#timer');
            const waveformContainer = container.querySelector('#waveform-container');
            const hintElem = container.querySelector('#recording-hint');
            const recordingStatus = container.querySelector('#recording-status');
            const recordingStatusText = container.querySelector('#recording-status-text');

            if (responses[item.id]) {
                if (responses[item.id].isTranscribing) {
                    openResponse.value = responses[item.id].answer || '';
                    openResponse.placeholder = "Transcribing your voice... please wait or type here.";
                    transcribeStatus.style.display = 'block';
                } else {
                    openResponse.value = responses[item.id].answer || '';
                }
            }

            openResponse.oninput = () => {
                responses[item.id] = { ...responses[item.id], answer: openResponse.value, isTranscribing: false };
                transcribeStatus.style.display = 'none';
            };

            // Voice Recording Logic
            let mediaRecorder = null;
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

            recordBtn.onclick = async () => {
                if (mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                    stopTimer();

                    waveformContainer.classList.remove('recording');
                    recordBtn.classList.remove('pulse-recording');
                    micIconSvg.style.display = 'block';
                    stopIconSvg.style.display = 'none';

                    recordingStatusText.textContent = '● RECORDED';
                    recordingStatusText.style.color = '#166534';
                    hintElem.textContent = 'Transcription in progress...';
                    rerecordBtn.style.display = 'block';

                    window.AudioManager.stopVolumeMonitor();
                    return;
                }

                // New Recording
                try {
                    const stream = await window.AudioManager.initSoloMode();
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = [];

                    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
                    mediaRecorder.onstop = async () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                        const reader = new FileReader();
                        reader.readAsDataURL(audioBlob);
                        reader.onloadend = async () => {
                            const base64Data = reader.result.split(',')[1];

                            // Start background transcription
                            const itemId = item.id;
                            responses[itemId] = { ...responses[itemId], isTranscribing: true };

                            if (currentIdx === clarifications.indexOf(item)) {
                                transcribeStatus.style.display = 'block';
                            }

                            try {
                                const result = await ApiService.transcribeAudio(base64Data, chapterNum, itemId);
                                responses[itemId].answer = result.text;
                                responses[itemId].isTranscribing = false;

                                // Update UI if still on this question
                                if (currentIdx === clarifications.indexOf(item)) {
                                    openResponse.value = result.text;
                                    transcribeStatus.style.display = 'none';
                                    hintElem.textContent = 'Voice captured! You can edit the text or re-record.';
                                }
                            } catch (err) {
                                console.error("Transcription failed:", err);
                                responses[itemId].isTranscribing = false;
                                if (currentIdx === clarifications.indexOf(item)) {
                                    transcribeStatus.textContent = "⚠ Transcription failed";
                                    setTimeout(() => { transcribeStatus.style.display = 'none'; }, 3000);
                                    hintElem.textContent = 'Transcription failed. Please try again or type your answer.';
                                }
                            }
                        };
                    };

                    mediaRecorder.start();
                    startTimer();
                    window.AudioManager.startVolumeMonitor();

                    waveformContainer.classList.add('recording');
                    recordBtn.classList.add('pulse-recording');
                    micIconSvg.style.display = 'none';
                    stopIconSvg.style.display = 'block';

                    recordingStatus.style.display = 'block';
                    recordingStatusText.textContent = '● RECORDING';
                    recordingStatusText.style.color = '#ef4444';
                    hintElem.textContent = 'Recording active. Click square to stop and transcribe.';
                    rerecordBtn.style.display = 'none';
                } catch (err) {
                    console.error("Mic access denied:", err);
                    alert("Microphone access is required for voice answers.");
                }
            };

            rerecordBtn.onclick = () => {
                if (confirm('Are you sure you want to delete this recording and start over?')) {
                    cleanup();
                    audioChunks = [];
                    timerElem.textContent = '00:00';

                    waveformContainer.classList.remove('recording');
                    recordBtn.classList.remove('pulse-recording');
                    micIconSvg.style.display = 'block';
                    stopIconSvg.style.display = 'none';

                    recordingStatus.style.display = 'none';
                    rerecordBtn.style.display = 'none';
                    hintElem.textContent = 'Click to start recording your voice answer';
                    openResponse.value = '';
                    responses[item.id] = { ...responses[item.id], answer: '', isTranscribing: false };
                }
            };
        }

        const cleanup = () => {
            // Need to reach into the voice recording logic if it was initialized
            // But since this is called for every navigation, we should be safe
            // if we just check AudioManager directly or if we keep a reference.
            window.AudioManager.stopAll();
            // Note: timerElem and other UI elements are re-rendered on renderCurrentClarification,
            // so we don't strictly need to reset them here, but stopping logic is key.
        };

        cancelBtn.onclick = () => {
            cleanup();
            if (confirm('Exit without saving these clarifications?')) {
                navigateTo('interviews');
            }
        };

        prevBtn.onclick = () => {
            cleanup();
            if (currentIdx > 0) {
                currentIdx--;
                renderCurrentClarification();
            }
        };

        nextBtn.onclick = async () => {
            cleanup();
            // Validate mandatory
            if (item.mandatory && isBinary && !responses[item.id]) {
                alert('Please answer this clarification before moving forward.');
                return;
            }

            if (currentIdx < clarifications.length - 1) {
                currentIdx++;
                renderCurrentClarification();
            } else {
                // "Submit & Forget" Background Logic
                try {
                    // 1. Mark as pending in global state
                    if (!state.pendingVoiceSubmissions) state.pendingVoiceSubmissions = {};
                    state.pendingVoiceSubmissions[chapterNum] = {
                        responses: responses,
                        startedAt: Date.now()
                    };

                    // 2. Optimistically update local UI state
                    if (chapter) {
                        chapter.status = 'completed';
                        chapter.clarifications = [];
                    }
                    saveAppState();

                    // 3. Show success and fly back to dashboard
                    showToast('✓ Story updated! Processing your voice answers in the background...', 'success');

                    // We also trigger a check immediately
                    if (window.checkPendingVoiceSubmissions) {
                        window.checkPendingVoiceSubmissions();
                    }

                    navigateTo('dashboard');
                } catch (err) {
                    console.error('Clarification redirect failed:', err);
                    navigateTo('interviews');
                }
            }
        };
    }

    renderCurrentClarification();
    return container;
}
