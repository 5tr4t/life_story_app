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
                            <textarea id="openResponse" class="input" placeholder="Your response (optional)..." style="width: 100%; min-height: 150px; padding: 1rem;"></textarea>
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
                responses[item.id] = { answer: currentAnswer, correction: correctionInput.value };
            };
        } else {
            const openResponse = container.querySelector('#openResponse');
            if (responses[item.id]) {
                openResponse.value = responses[item.id].answer || '';
            }
            openResponse.oninput = () => {
                responses[item.id] = { answer: openResponse.value };
            };
        }

        cancelBtn.onclick = () => {
            if (confirm('Exit without saving these clarifications?')) {
                navigateTo('interviews');
            }
        };

        prevBtn.onclick = () => {
            if (currentIdx > 0) {
                currentIdx--;
                renderCurrentClarification();
            }
        };

        nextBtn.onclick = async () => {
            // Validate mandatory
            if (item.mandatory && isBinary && !responses[item.id]) {
                alert('Please answer this clarification before moving forward.');
                return;
            }

            if (currentIdx < clarifications.length - 1) {
                currentIdx++;
                renderCurrentClarification();
            } else {
                // Submit all responses
                try {
                    saveStatus.textContent = 'Submitting responses...';
                    nextBtn.disabled = true;

                    await ApiService.submitClarifications(state.user.id, chapterNum, responses);

                    // Optimistically set status to completed in local state
                    if (chapter) {
                        chapter.status = 'completed';
                        chapter.clarifications = []; // Clear local clarifications to hide badges immediately
                    }
                    // Record submission time for race condition handling
                    state.clarificationSubmissionTimes[chapterNum] = Date.now();
                    saveAppState();

                    saveStatus.textContent = '✓ Responses Submitted';

                    setTimeout(() => {
                        navigateTo('interviews');
                    }, 1000);
                } catch (err) {
                    console.error('Clarification submission failed:', err);
                    saveStatus.textContent = '⚠ Failed to save. Please try again.';
                    nextBtn.disabled = false;
                }
            }
        };
    }

    renderCurrentClarification();
    return container;
}
