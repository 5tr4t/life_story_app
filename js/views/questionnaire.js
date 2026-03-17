function renderQuestionnaire(navigateTo, state) {
    // ... (existing code) ...
    const container = document.createElement('div');

    container.innerHTML = `
        <nav class="navbar">
            <div class="container flex justify-between items-center">
                <div class="flex items-center gap-sm">
                    <button id="backBtn" class="btn" style="padding: 0.5rem;">← Back</button>
                    <h2 style="font-size: 1.25rem;">Interview Session</h2>
                </div>
            </div>
        </nav>

        <main class="container" style="padding-top: 3rem; max-width: 800px; text-align: center;">
            <div class="card">
                <div style="margin-bottom: 2rem;">
                    <span style="color: var(--color-accent); font-weight: 600; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em;">Chapter 1: Early Childhood</span>
                    <h1 style="margin-top: 0.5rem; font-size: 2rem;">What is your earliest childhood memory?</h1>
                    <p style="color: var(--color-text-muted); margin-top: 0.5rem;">
                        Tap the microphone to start recording your answer.
                    </p>
                </div>

                <!-- Voice Recorder Section -->
                <div style="margin: 3rem 0; position: relative; height: 120px; display: flex; align-items: center; justify-content: center;">
                    <!-- Pulse Ring (Hidden by default) -->
                    <div id="pulseRing" style="
                        position: absolute;
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        background: rgba(239, 68, 68, 0.2);
                        z-index: 0;
                    "></div>

                    <button id="recordBtn" class="btn" style="
                        width: 80px; 
                        height: 80px; 
                        border-radius: 50%; 
                        background-color: #ef4444; 
                        color: white; 
                        font-size: 2rem;
                        z-index: 1;
                        position: relative;
                        border: none;
                        cursor: pointer;
                        transition: transform 0.2s;
                    ">
                        🎤
                    </button>
                </div>
                
                <div id="statusText" style="margin-bottom: 2rem; font-weight: 500; color: var(--color-text-muted);">Ready to record</div>

                <!-- Optional Text Input -->
                <div class="input-group" style="text-align: left; margin-top: 2rem; border-top: 1px solid var(--color-border); padding-top: 2rem;">
                    <label class="input-label" style="font-size: 0.875rem;">Add a written note (optional)</label>
                    <textarea class="input-field" rows="3" placeholder="Any specific details to add?"></textarea>
                </div>

                <div class="flex justify-between items-center" style="margin-top: 2rem;">
                    <button class="btn" style="color: var(--color-text-muted);">Skip</button>
                    <button id="saveBtn" class="btn btn-primary">Save & Next Question</button>
                </div>
            </div>
        </main>
    `;

    // Logic
    const recordBtn = container.querySelector('#recordBtn');
    const pulseRing = container.querySelector('#pulseRing');
    const statusText = container.querySelector('#statusText');
    const backBtn = container.querySelector('#backBtn');
    const saveBtn = container.querySelector('#saveBtn');

    let isRecording = false;

    recordBtn.addEventListener('click', () => {
        if (!isRecording) {
            // Start Recording Simulation
            isRecording = true;
            recordBtn.innerHTML = '⏹';
            pulseRing.classList.add('recording-pulse'); // Add CSS animation class
            statusText.textContent = 'Recording...';
            statusText.style.color = '#ef4444';
        } else {
            // Stop Recording
            isRecording = false;
            recordBtn.innerHTML = '🎤';
            pulseRing.classList.remove('recording-pulse');
            statusText.textContent = 'Recording saved';
            statusText.style.color = '#166534';
        }
    });

    saveBtn.addEventListener('click', () => {
        // Mark questions as started/in-progress
        if (state) {
            state.journeyProgress.questions = true;
            saveAppState(); // Global function from app.js
        }
        alert('Answer saved!');
        navigateTo('dashboard');
    });

    backBtn.addEventListener('click', () => {
        navigateTo('dashboard');
    });

    return container;
}
