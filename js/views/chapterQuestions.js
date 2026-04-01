function renderChapterQuestions(navigateTo, state) {
    const container = document.createElement('div');

    const chapterNum = state.activeChapter || 1;
    const chapterIndex = chapterNum - 1;

    // Safety check: if chapters are missing (e.g. fresh reload on question page), 
    // go to interviews page which handles the dynamic fetch
    if (!state.chapters || state.chapters.length === 0) {
        navigateTo('interviews');
        return container;
    }

    const chapter = state.chapters[chapterIndex];

    if (!chapter) {
        container.innerHTML = `<div class="container" style="padding-top: 3rem;">
            <h1>Chapter not found</h1>
            <button class="btn btn-primary" onclick="navigateTo('interviews')">Back to Chapters</button>
        </div>`;
        return container;
    }

    // Parse current stage to get question number
    const currentStage = state.current_stage || `3.${chapterNum}.1`;
    const [_, serverChapter, serverQuestion] = currentStage.split('.').map(Number);

    // If we're on a different chapter (activeChapter vs serverChapter)
    // or if the current question number is less than the server-saved question number,
    // then this is a "previous" question and should be read-only.
    // 1-based comparison: (chapterNum < serverChapter) OR (chapterNum == serverChapter AND currentQuestionNum < serverQuestion)
    const currentQuestionNum = (state.viewingQuestionNum && state.viewingChapterNum === chapterNum) ? state.viewingQuestionNum : serverQuestion;

    // If we're explicitly editing a past chapter, unlock it regardless of server-saved stage
    const isEditing = !!state.isEditingPastChapter;
    const isPastQuestion = !isEditing && ((chapterNum < serverChapter) || (chapterNum === serverChapter && currentQuestionNum < serverQuestion));

    const currentQuestionIndex = currentQuestionNum - 1;
    const question = chapter.questions[currentQuestionIndex];

    // Get saved answer if exists
    const savedAnswer = (state.answers && state.answers[chapterNum] && state.answers[chapterNum][currentQuestionNum]) || '';

    const isLastQuestion = currentQuestionNum >= chapter.questions.length;

    // Instructional Overlay HTML
    const overlay = `
        <div id="collab-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; color: white; padding: 2rem; overflow-y: auto;">
            <div style="max-width: 500px; margin: 2rem auto; text-align: center; background: #1e293b; padding: 3rem; border-radius: 24px; border: 1px solid #334155;">
                <div style="font-size: 4rem; margin-bottom: 2rem;">🎙️</div>
                <h2 style="font-size: 2rem; margin-bottom: 1.5rem; font-family: 'Outfit', sans-serif;">Collaborative Mode</h2>
                <p style="font-size: 1.125rem; line-height: 1.6; color: #94a3b8; margin-bottom: 2.5rem;">
                    To record your guests, we need to capture your system audio. 
                    <br><br>
                    <strong>IMPORTANT:</strong> In the next window, please:
                    <ul style="text-align: left; margin: 1.5rem 0; padding-left: 1.5rem;">
                        <li style="margin-bottom: 0.75rem;">Select the <strong>Google Meet Tab</strong></li>
                        <li>Check the <strong>"Also share tab audio"</strong> box at the bottom</li>
                    </ul>
                </p>
                <button id="startCollabBtn" class="btn btn-accent" style="width: 100%; height: 60px; font-size: 1.25rem;">Got it, let's go!</button>
                <button id="cancelCollabBtn" class="btn" style="margin-top: 1rem; color: #94a3b8;">Maybe later</button>
            </div>
        </div>
    `;

    // VAD Notification HTML
    const vadNotification = `
        <div id="vad-prompt" style="display: none; position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); background: #ef4444; color: white; padding: 1rem 2rem; border-radius: 999px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 1000; animation: bounce 1s infinite;">
            🔊 <strong>It sounds like you're talking!</strong> Don't forget to hit Record.
        </div>
    `;

    container.innerHTML = overlay + vadNotification + `
        <nav class="navbar">
            <div class="container flex justify-between items-center">
                <div class="flex items-center gap-sm">
                    <button id="backBtn" class="btn" style="padding: 0.5rem;">← Back to Chapters</button>
                    <h2 style="font-size: 1.25rem;">${chapter.title || 'Untitled Chapter'}</h2>
                </div>
                <div class="flex items-center gap-md">
                    <button id="launchMeetBtn" class="btn btn-outline" style="border: 1px solid var(--color-border); font-size: 0.875rem;">
                        👥 Launch Meet
                    </button>
                </div>
            </div>
        </nav>

        <main class="container" style="padding-top: 3rem; max-width: 800px;">
            <div style="margin-bottom: 2rem;">
                <div style="display: flex; justify-between; align-items: center; margin-bottom: 1rem;">
                    <h1 style="font-size: 1.5rem; margin: 0;">Question ${currentQuestionNum} of ${chapter.questions.length}</h1>
                    <span style="color: var(--color-text-muted); font-size: 0.875rem;">
                        Chapter ${chapterNum}
                    </span>
                </div>
                <div style="background: #f1f5f9; height: 4px; border-radius: 2px; overflow: hidden;">
                    <div style="background: var(--color-accent); height: 100%; width: ${(currentQuestionNum / chapter.questions.length) * 100}%; transition: width 0.3s;"></div>
                </div>
            </div>

            <div class="card">
                <!-- Mode Toggle -->
                <div style="display: flex; justify-content: center; margin-bottom: 2rem;">
                    <div style="background: #f1f5f9; padding: 4px; border-radius: 12px; display: flex; gap: 4px;">
                        <button id="soloModeBtn" class="btn active-mode" style="padding: 0.5rem 1.5rem; border-radius: 8px; font-size: 0.875rem;">Solo Mode</button>
                        <button id="groupModeBtn" class="btn" style="padding: 0.5rem 1.5rem; border-radius: 8px; font-size: 0.875rem;">Collaborative Mode</button>
                    </div>
                </div>

                <style>
                    .active-mode { background: white !important; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); font-weight: 600; color: var(--color-primary); }
                    @keyframes bounce { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -10px); } }
                </style>

                <h3 style="font-size: 1.25rem; margin-bottom: 1.5rem; color: var(--color-primary); text-align: center;">
                    ${question}
                </h3>

                <div id="audio-recording-container" style="text-align: center; padding: 2rem; border: 2px dashed var(--color-border); border-radius: 12px; background: #f8fafc; margin-bottom: 1.5rem; position: relative;">
                    ${isPastQuestion ? `
                        <div style="color: var(--color-text-muted);">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
                            <p>This story has been captured and locked.</p>
                        </div>
                    ` : `
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
                                <!-- Recording Status / Hints -->
                                <div id="recording-status" style="display: none; position: absolute; top: -30px; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                                    <span id="recording-status-text" style="color: #ef4444;">● RED</span>
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
                                Click to start recording your story
                            </p>
                        </div>
                    `}
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
                </style>

                <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
                    <button 
                        id="prevBtn" 
                        class="btn" 
                        style="border: 1px solid var(--color-border);"
                        ${(chapterNum === 1 && currentQuestionNum === 1) ? 'disabled' : ''}
                    >
                        ← Previous
                    </button>
                    
                    <div id="next-container" style="display: none;">
                        ${isLastQuestion ? `
                            <button id="completeBtn" class="btn btn-accent">
                                Complete Chapter ✓
                            </button>
                        ` : `
                            <button id="nextBtn" class="btn btn-accent">
                                Next →
                            </button>
                        `}
                    </div>
                </div>
            </div>

            <div id="saveStatus" style="text-align: center; margin-top: 1rem; color: var(--color-text-muted); font-size: 0.875rem;">
                <!-- Save status messages will appear here -->
            </div>
        </main>
    `;

    // Event Listeners
    const saveStatus = container.querySelector('#saveStatus');
    const prevBtn = container.querySelector('#prevBtn');
    const nextBtn = container.querySelector('#nextBtn');
    const completeBtn = container.querySelector('#completeBtn');
    const launchMeetBtn = container.querySelector('#launchMeetBtn');
    const soloModeBtn = container.querySelector('#soloModeBtn');
    const groupModeBtn = container.querySelector('#groupModeBtn');
    const recordBtn = container.querySelector('#recordBtn');
    const micIconSvg = container.querySelector('#mic-icon-svg');
    const stopIconSvg = container.querySelector('#stop-icon-svg');
    const rerecordBtn = container.querySelector('#rerecordBtn');
    const nextContainer = container.querySelector('#next-container');
    const timerElem = container.querySelector('#timer');
    const waveformContainer = container.querySelector('#waveform-container');
    const hintElem = container.querySelector('#recording-hint');
    const recordingStatus = container.querySelector('#recording-status');
    const recordingStatusText = container.querySelector('#recording-status-text');
    const vadPrompt = container.querySelector('#vad-prompt');
    const collabOverlay = container.querySelector('#collab-overlay');
    const startCollabBtn = container.querySelector('#startCollabBtn');
    const cancelCollabBtn = container.querySelector('#cancelCollabBtn');

    let mediaRecorder = null;
    let audioChunks = [];
    let startTime = null;
    let timerInterval = null;
    let currentBlob = null;
    let averageVolume = 0;
    const projectPrefix = (state.user && state.user.id) ? state.user.id : 'anon';
    const recordingKey = `audio_${projectPrefix}_${chapterNum}_${currentQuestionNum}`;

    // Initialization: Start Solo Mode by default
    if (!isPastQuestion) {
        window.AudioManager.initSoloMode().catch(err => {
            console.error("Mic init failed:", err);
            alert("Microphone access is required.");
        });

        // Setup VAD
        window.AudioManager.setVADCallback(() => {
            if (!mediaRecorder || mediaRecorder.state !== 'recording') {
                vadPrompt.style.display = 'block';
                setTimeout(() => { vadPrompt.style.display = 'none'; }, 3000);
            }
        });

        // Load existing recording
        window.AudioStorage.getRecording(recordingKey).then(blob => {
            if (blob) {
                currentBlob = blob;
                showRecordedState();
            }
        });
    }

    // Collaborative Mode Logic
    groupModeBtn.onclick = () => {
        collabOverlay.style.display = 'block';
    };

    soloModeBtn.onclick = async () => {
        groupModeBtn.classList.remove('active-mode');
        soloModeBtn.classList.add('active-mode');
        await window.AudioManager.initSoloMode();
    };

    startCollabBtn.onclick = async () => {
        try {
            collabOverlay.style.display = 'none';
            await window.AudioManager.initGroupMode();
            soloModeBtn.classList.remove('active-mode');
            groupModeBtn.classList.add('active-mode');

            // Open Meet in new tab
            window.open('https://meet.google.com/new', '_blank');
        } catch (err) {
            alert(err.message);
            soloModeBtn.click();
        }
    };

    cancelCollabBtn.onclick = () => {
        collabOverlay.style.display = 'none';
        soloModeBtn.click();
    };

    launchMeetBtn.onclick = () => {
        window.open('https://meet.google.com/new', '_blank');
    };

    function showRecordedState() {
        if (!recordBtn) return;
        recordBtn.style.background = '#166534'; // Green
        recordIcon.style.borderRadius = '2px'; // Square icon
        hintElem.textContent = 'Story captured! Click Next to continue.';
        if (rerecordBtn) rerecordBtn.style.display = 'block';
    }

    function startTimer() {
        if (!startTime) {
            startTime = Date.now();
        } else {
            // Adjust start time to account for the pause duration
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

    let pausedTime = 0;
    function pauseTimer() {
        clearInterval(timerInterval);
        pausedTime = Date.now() - startTime;
    }

    function stopTimer() {
        clearInterval(timerInterval);
        startTime = null;
        pausedTime = 0;
    }

    if (recordBtn) {
        recordBtn.addEventListener('click', async () => {
            // Toggle Logic
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                // Pause (Action as "Stop" in the UI toggle)
                mediaRecorder.pause();
                pauseTimer();

                waveformContainer.classList.remove('recording');
                recordBtn.classList.remove('pulse-recording');

                micIconSvg.style.display = 'block';
                stopIconSvg.style.display = 'none';

                // Stop volume monitor and get average
                averageVolume = window.AudioManager.stopVolumeMonitor();
                console.log(`Average Recording Volume: ${averageVolume}`);

                recordingStatusText.textContent = '● PAUSED';
                recordingStatusText.style.color = '#64748b';
                hintElem.textContent = 'Recording paused. Resume, re-record, or submit.';

                if (rerecordBtn) rerecordBtn.style.display = 'block';
                if (nextContainer) nextContainer.style.display = 'block';
                return;
            }

            if (mediaRecorder && mediaRecorder.state === 'paused') {
                // Resume
                mediaRecorder.resume();
                window.AudioManager.startVolumeMonitor();
                startTimer();

                waveformContainer.classList.add('recording');
                recordBtn.classList.add('pulse-recording');

                micIconSvg.style.display = 'none';
                stopIconSvg.style.display = 'block';

                recordingStatusText.textContent = '● RECORDING';
                recordingStatusText.style.color = '#ef4444';
                hintElem.textContent = 'Recording active.';

                if (rerecordBtn) rerecordBtn.style.display = 'none';
                if (nextContainer) nextContainer.style.display = 'none';
                return;
            }

            // Start New Recording
            try {
                const stream = window.AudioManager.mixedStream || window.AudioManager.micStream;
                if (!stream) throw new Error("Audio stream not initialized");

                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];

                mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);

                mediaRecorder.onstop = async () => {
                    currentBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    waveformContainer.classList.remove('recording');
                    recordBtn.classList.remove('pulse-recording');
                    await window.AudioStorage.saveRecording(recordingKey, currentBlob);
                };

                mediaRecorder.start();
                window.AudioManager.startVolumeMonitor();
                startTimer();
                window.AudioManager.pauseVAD();
                if (vadPrompt) vadPrompt.style.display = 'none';

                waveformContainer.classList.add('recording');
                recordBtn.classList.add('pulse-recording');

                micIconSvg.style.display = 'none';
                stopIconSvg.style.display = 'block';

                recordingStatus.style.display = 'block';
                recordingStatusText.textContent = '● RECORDING';
                recordingStatusText.style.color = '#ef4444';

                hintElem.textContent = 'Recording active. Click square to pause.';
                if (rerecordBtn) rerecordBtn.style.display = 'none';
                if (nextContainer) nextContainer.style.display = 'none';

            } catch (err) {
                console.error('Recording failed:', err);
                alert('Audio failure. Please refresh and check permissions.');
            }
        });
    }

    if (rerecordBtn) {
        rerecordBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this recording and start over?')) {
                // Stop the recorder if it's paused or recording
                if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                    mediaRecorder.stop();
                    window.AudioManager.stopVolumeMonitor();
                }

                await window.AudioStorage.deleteRecording(recordingKey);
                currentBlob = null;
                timerElem.textContent = '00:00';
                stopTimer();

                rerecordBtn.style.display = 'none';
                if (nextContainer) nextContainer.style.display = 'none';
                recordingStatus.style.display = 'none';

                micIconSvg.style.display = 'block';
                stopIconSvg.style.display = 'none';

                hintElem.textContent = 'Click to start recording your story';
            }
        });
    }

    async function syncProgressAndAudio(nextStage) {
        // If recording or paused, stop it first to finalize currentBlob
        if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
            return new Promise((resolve) => {
                mediaRecorder.onstop = async () => {
                    currentBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    await window.AudioStorage.saveRecording(recordingKey, currentBlob);
                    const success = await performSync(nextStage);
                    resolve(success);
                };
                mediaRecorder.stop();
            });
        }
        return performSync(nextStage);
    }

    async function performSync(nextStage) {
        const prevRecordDisplay = recordBtn ? recordBtn.style.display : 'none';
        const prevRerecordDisplay = rerecordBtn ? rerecordBtn.style.display : 'none';
        const prevTimerDisplay = timerElem ? timerElem.style.display : 'none';
        const prevHintDisplay = hintElem ? hintElem.style.display : 'none';

        function showProcessing() {
            if (recordBtn) recordBtn.style.display = 'none';
            if (rerecordBtn) rerecordBtn.style.display = 'none';
            if (timerElem) timerElem.style.display = 'none';
            if (hintElem) hintElem.style.display = 'none';
            
            saveStatus.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; color: var(--color-primary); font-weight: 500; font-size: 1.1rem;">
                    <div class="loading-spinner" style="width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top: 3px solid var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <span id="processingText">Processing... Please wait</span>
                </div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            `;
            saveStatus.style.display = 'block';
        }

        function updateProcessingText(text) {
            const span = saveStatus.querySelector('#processingText');
            if (span) span.textContent = text;
            else saveStatus.textContent = text;
        }

        function restoreUI() {
            if (recordBtn) recordBtn.style.display = prevRecordDisplay;
            if (rerecordBtn) rerecordBtn.style.display = prevRerecordDisplay;
            if (timerElem) timerElem.style.display = prevTimerDisplay;
            if (hintElem) hintElem.style.display = prevHintDisplay;
        }

        try {
            showProcessing();
            updateProcessingText('Uploading your story...');

            if (!currentBlob) {
                saveStatus.textContent = '⚠ No recording found';
                restoreUI();
                return false;
            }

            // Audio Quality Check
            const avgVol = averageVolume;
            console.log(`Final sync check - Size: ${currentBlob.size}, Avg Vol: ${avgVol}`);

            if (currentBlob.size < 2000) {
                saveStatus.textContent = '⚠ Recording too short/empty';
                alert("The recording seems too short. Please try again.");
                restoreUI();
                return false;
            }

            if (avgVol < 1) {
                updateProcessingText('⚠ Very low volume detected');
                if (!confirm(`We detected very low volume (${avgVol.toFixed(1)}). This might result in a poor transcription. Save anyway?`)) {
                    restoreUI();
                    return false;
                }
                showProcessing(); // Re-show spinner if they confirmed
            }

            // 1. Upload audio
            const currentStage = `3.${chapterNum}.${currentQuestionNum}`;
            const fileName = `${state.user.id.toLowerCase()}_ch${chapterNum}_q${currentQuestionNum}_${Date.now()}.webm`;

            updateProcessingText('Uploading recording...');
            try {
                const uploadResult = await ApiService.uploadLargeAudio(state.user.id, fileName, currentStage, currentBlob, (percent) => {
                    updateProcessingText(`Uploading: ${percent}%`);
                });

                console.log('Upload completed:', uploadResult);

                // Check for backend-reported quality issues
                if (uploadResult && uploadResult.status === 'failed') {
                    saveStatus.textContent = '⚠ Backend validation failed';
                    alert(`We couldn't capture that correctly: ${uploadResult.message || "Quality check failed"}\n\nPlease try re-recording your answer for this question.`);
                    restoreUI();
                    return false;
                }
            } catch (err) {
                console.error('Upload failed:', err);
                saveStatus.textContent = '⚠ Upload failed';
                alert(`We couldn't capture that correctly: ${err.message || "Connection error"}\n\nPlease try re-recording your answer for this question.`);
                restoreUI();
                return false;
            }

            // 2. Sync stage
            updateProcessingText('Syncing progress...');
            await ApiService.saveProgress(state.user.id, nextStage);
            state.current_stage = nextStage;
            updateProcessingText('✓ Saved Successfully');

            // 3. Cleanup: Delete local recording once synced to server
            await window.AudioStorage.deleteRecording(recordingKey);
            currentBlob = null;

            return true;
        } catch (err) {
            saveStatus.textContent = '⚠ Upload failed - please try again';
            restoreUI();
            return false;
        }
    }

    // Cleanup and Navigation
    const cleanupAndNavigate = async (view) => {
        if (view !== 'chapter-questions') {
            delete state.isEditingPastChapter;
        }
        await window.AudioManager.stopAll();
        navigateTo(view);
    };

    container.querySelector('#backBtn').addEventListener('click', () => cleanupAndNavigate('interviews'));

    if (prevBtn) {
        prevBtn.addEventListener('click', async () => {
            let prevQ = currentQuestionNum - 1;
            let prevC = chapterNum;
            if (prevQ < 1) {
                if (chapterNum > 1) {
                    prevC = chapterNum - 1;
                    prevQ = state.chapters[prevC - 1].questions.length;
                } else return;
            }
            state.viewingChapterNum = prevC;
            state.viewingQuestionNum = prevQ;
            state.activeChapter = prevC;
            await cleanupAndNavigate('chapter-questions');
        });
    }

    if (nextContainer) {
        const nextBtn = nextContainer.querySelector('#nextBtn');
        const completeBtn = nextContainer.querySelector('#completeBtn');

        if (nextBtn) {
            nextBtn.addEventListener('click', async () => {
                const nextQ = currentQuestionNum + 1;
                const nextStage = `3.${chapterNum}.${nextQ}`;

                const success = await syncProgressAndAudio(nextStage);
                if (!success) return;

                state.viewingChapterNum = chapterNum;
                state.viewingQuestionNum = nextQ;
                state.activeChapter = chapterNum;
                await cleanupAndNavigate('chapter-questions');
            });
        }

        if (completeBtn) {
            completeBtn.addEventListener('click', async () => {
                const nextChapterNum = chapterNum + 1;
                const nextStage = nextChapterNum <= state.chapters.length ? `3.${nextChapterNum}.1` : '4';

                const success = await syncProgressAndAudio(nextStage);
                if (!success) return;

                alert(`Chapter ${chapterNum} completed! Your story is now being processed. 🎉`);
                await cleanupAndNavigate('interviews');
            });
        }
    }

    return container;
}
