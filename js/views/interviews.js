function renderInterviews(navigateTo, state) {
    const container = document.createElement('div');

    // Parse current stage to determine active chapter
    const currentStage = state.current_stage || '3.1.1';
    const [_, chapterNum, questionNum] = currentStage.split('.').map(Number);
    const activeChapterIndex = chapterNum - 1; // Convert to 0-based index

    // Chapters sync logic: only fetch if not already in state or if we're forcing a refresh
    // We'll use a simple timeout to trigger a sync once the view is attached
    setTimeout(async () => {
        try {
            const response = await ApiService.getChapters(state.user.id);
            state.chapters = Array.isArray(response) ? response : (response.chapters || []);
            saveAppState();
            renderChapterList(); // Only update the list part, not the whole page

            // Check if we need to start/continue polling
            if (state.chapters.some(c => (c.status || '').toLowerCase() === 'processing')) {
                startPolling();
            }
        } catch (err) {
            console.error("Background chapter sync failed:", err);
        }
    }, 0);

    const chapters = state.chapters;

    // Polling Logic
    let pollingInterval = null;

    function startPolling() {
        if (pollingInterval) return;

        pollingInterval = setInterval(async () => {
            // Check if we are still on the interviews page
            if (!document.body.contains(container)) {
                stopPolling();
                return;
            }

            try {
                const response = await ApiService.getChapters(state.user.id);
                const newChapters = Array.isArray(response) ? response : (response.chapters || []);

                // Update state
                state.chapters = newChapters;
                saveAppState();

                // Check if we still need polling
                const needsPolling = newChapters.some(c => (c.status || '').toLowerCase() === 'processing');
                if (!needsPolling) {
                    stopPolling();
                }

                // Re-render the list only
                renderChapterList();
            } catch (err) {
                console.error("Polling failed:", err);
            }
        }, 30000); // 30 seconds
    }

    function stopPolling() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
    }

    // Event Listeners for Chapter Buttons
    function attachChapterListeners() {
        container.querySelectorAll('.chapter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const chapterNumber = parseInt(btn.getAttribute('data-chapter'));
                const status = btn.getAttribute('data-status');

                state.activeChapter = chapterNumber;
                state.viewingChapterNum = chapterNumber;

                if (status === 'clarification') {
                    navigateTo('clarifications');
                } else {
                    // Start at server-saved question or 1
                    state.viewingQuestionNum = (chapterNumber === chapterNum) ? questionNum : 1;
                    navigateTo('chapter-questions');
                }
            });
        });

        container.querySelectorAll('.review-draft-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                navigateTo('review-draft');
            });
        });
    }

    function renderChapterList() {
        const listContainer = container.querySelector('#chapter-list');
        if (!listContainer) return;

        listContainer.innerHTML = state.chapters.map((chapter, index) => {
            const chapterNumber = chapter.chapterNumber || (index + 1);

            // Backend status takes precedence, otherwise calculate
            const status = (chapter.status || '').toLowerCase();
            const isPending = status === 'pending';

            // Optimistic Override for Race Condition
            // If clarifications were submitted recently (< 3 mins), force 'processing' status
            // even if backend still says 'clarification'
            const submissionTime = state.clarificationSubmissionTimes ? state.clarificationSubmissionTimes[chapterNumber] : 0;
            const isRecentSubmission = submissionTime && (Date.now() - submissionTime < 3 * 60 * 1000);

            if (status === 'clarification' && isRecentSubmission) {
                status = 'processing';
            }

            // Re-evaluate based on potentially modified status
            const isCompleted = status === 'completed';
            const isProcessing = status === 'processing';
            const isClarification = status === 'clarification';

            // Priority Logic:
            // 1. If completed, it stays completed.
            // 2. If clarification, it requires review.
            // 3. If processing, it is currently being worked on.
            // 4. Otherwise, handle based on sequence.

            const isActive = chapterNumber === chapterNum && !isCompleted && !isProcessing && !isClarification;
            const isLocked = chapterNumber > chapterNum && !isCompleted;
            const isActuallyCompleted = isCompleted || (chapterNumber < chapterNum && !isProcessing && !isClarification);

            let statusIcon = '🔒';
            let statusText = 'Locked';
            let statusColor = '#64748b';
            let borderStyle = '';
            let buttonText = 'Start';
            let buttonClass = 'btn-primary';
            let buttonDisabled = 'disabled';
            let badge = '';

            if (isProcessing) {
                statusIcon = '⚙️';
                statusText = 'Processing...';
                statusColor = '#f59e0b'; // Amber
                buttonText = 'Processing';
                buttonDisabled = 'disabled';
            } else if (isClarification) {
                statusIcon = '⚠️';
                statusText = 'Action Required';
                statusColor = '#ef4444'; // Red
                buttonText = 'Review Actions';
                buttonClass = 'btn-accent';
                buttonDisabled = '';
                badge = `<span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; margin-left: 8px;">${chapter.clarifications?.length || 0}</span>`;
            } else if (isActuallyCompleted) {
                statusIcon = '✓';
                statusText = 'Completed';
                statusColor = '#166534';
                buttonText = 'Review Questions';
                buttonClass = 'btn-outline';
                buttonDisabled = '';
            } else if (isActive) {
                statusIcon = '🔓';
                statusText = (status === 'pending' || !status) ? `Question ${questionNum} of ${chapter.questions.length}` : (status.charAt(0).toUpperCase() + status.slice(1));
                statusColor = '#1e40af';
                borderStyle = 'border: 2px solid var(--color-accent);';
                buttonText = 'Continue';
                buttonClass = 'btn-accent';
                buttonDisabled = '';
            } else if (isLocked) {
                statusIcon = '🔒';
                statusText = 'Locked';
                statusColor = '#64748b';
                buttonText = 'Start';
                buttonDisabled = 'disabled';
            }

            return `
                <div class="card" style="${borderStyle} margin-bottom: 1.5rem;">
                    <div class="flex justify-between items-center" style="margin-bottom: 1rem;">
                        <div>
                            <h3 style="font-size: 1.25rem; margin-bottom: 0.25rem; display: flex; align-items: center;">
                                ${chapterNumber}. ${chapter.title || chapter.chapter_title || 'Untitled Chapter'}
                                ${badge}
                            </h3>
                            <p style="color: var(--color-text-muted); font-size: 0.875rem;">
                                ${chapter.description || chapter.chapter_description || ''}
                            </p>
                        </div>
                        <div style="text-align: center; min-width: 100px;">
                            <div style="font-size: 1.5rem;">${statusIcon}</div>
                            <div style="font-size: 0.75rem; color: ${statusColor}; font-weight: 600;">
                                ${statusText}
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-between items-center">
                        <span style="color: var(--color-text-muted); font-size: 0.875rem;">
                            ${chapter.questions?.length || 0} questions
                        </span>
                        <div class="flex gap-sm">
                            ${isActuallyCompleted ? `
                                <button class="btn btn-primary review-draft-btn" data-chapter="${chapterNumber}">Review Draft</button>
                            ` : ''}
                            <button 
                                class="btn ${buttonClass} chapter-btn" 
                                data-chapter="${chapterNumber}"
                                data-status="${status || ''}"
                                ${buttonDisabled}
                            >
                                ${buttonText}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        attachChapterListeners();
    }

    // Main layout
    container.innerHTML = `
        <nav class="navbar">
            <div class="container flex justify-between items-center">
                <div class="flex items-center gap-sm">
                    <button id="backBtn" class="btn" style="padding: 0.5rem;">← Back</button>
                    <h2 style="font-size: 1.25rem;">Interview Chapters</h2>
                </div>
                <div class="flex items-center gap-md">
                    <button id="mainLaunchMeetBtn" class="btn btn-outline" style="border: 1px solid var(--color-border); font-size: 0.875rem;">
                        👥 Start Group Call
                    </button>
                </div>
            </div>
        </nav>

        <main class="container" style="padding-top: 3rem; max-width: 900px;">
            <div style="margin-bottom: 2rem;">
                <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Your Story Chapters</h1>
                <p style="color: var(--color-text-muted); line-height: 1.6;">
                    Complete each chapter in order. We'll transcribe your audio and ask for clarifications if needed.
                </p>
            </div>

            <div id="chapter-list">
                <!-- Chapters will be rendered here -->
            </div>
        </main>
    `;

    // Initialize list
    renderChapterList();

    // Start polling if needed
    if (state.chapters.some(c => (c.status || '').toLowerCase() === 'processing')) {
        startPolling();
    }

    // Event Listeners
    container.querySelector('#backBtn').addEventListener('click', () => {
        stopPolling();
        navigateTo('dashboard');
    });

    const mainLaunchMeetBtn = container.querySelector('#mainLaunchMeetBtn');
    if (mainLaunchMeetBtn) {
        mainLaunchMeetBtn.addEventListener('click', () => {
            window.open('https://meet.google.com/new', '_blank');
        });
    }

    return container;
}
