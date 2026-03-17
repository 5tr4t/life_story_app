function renderInterviewPlan(navigateTo, state) {
    const container = document.createElement('div');

    container.innerHTML = `
        <nav class="navbar">
            <div class="container flex justify-between items-center">
                <div class="flex items-center gap-sm">
                    <button id="backBtn" class="btn" style="padding: 0.5rem;">← Back</button>
                    <h2 style="font-size: 1.25rem;">Story Outline</h2>
                </div>
            </div>
        </nav>

        <main class="container" style="padding-top: 3rem; max-width: 800px;">
            <div style="margin-bottom: 2rem;">
                <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Story Outline</h1>
                <p style="color: var(--color-text-muted); line-height: 1.6;">
                    We've organized your story into chapters based on your setup. This is not a strict plan, but gives us an initial outline for the interviews - we can modify the content and focus areas as we go. However, let us know if you would like any changes at this stage.
                </p>
            </div>

            <div class="card">
                <h3 style="margin-bottom: 1.5rem;">Chapters</h3>
                
                <div id="chapterList">
                    ${renderChapters(state.interviewPlan || { chapters: state.chapters || [] })}
                </div>

                <!-- Feedback Section -->
                ${state.journeyProgress && state.journeyProgress.outlineApproved ? `
                <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--color-border);">
                    <div style="text-align: center; padding: 2rem; background: #dcfce7; border-radius: 0.5rem;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">✓</div>
                        <h4 style="color: #166534; margin-bottom: 0.5rem;">Outline Approved</h4>
                        <p style="color: #166534; font-size: 0.875rem;">This outline has been approved and is now locked. You can proceed to the interviews.</p>
                    </div>
                </div>
                ` : `
                <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--color-border);">
                    <h4 style="margin-bottom: 1rem; text-align: center;">Does the outline sound ok?</h4>
                    
                    <div id="feedbackButtons" class="flex justify-center gap-sm">
                        <button id="btnYes" class="btn btn-primary" style="min-width: 100px;">Yes</button>
                        <button id="btnNo" class="btn" style="min-width: 100px; border: 1px solid var(--color-border);">No</button>
                    </div>

                    <div id="feedbackForm" style="display: none; margin-top: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">What would you like to change?</label>
                        <textarea id="feedbackText" class="input-field" rows="4" placeholder="e.g., I'd like to add a chapter about my college years..."></textarea>
                        <div style="text-align: right; margin-top: 1rem;">
                            <button id="btnSubmitFeedback" class="btn btn-primary">Submit Feedback</button>
                        </div>
                    </div>
                </div>
                `}
            </div>
        </main>
    `;

    // Chapters sync logic: fetch if we are missing them or to ensure freshness
    setTimeout(async () => {
        try {
            console.log("Fetching fresh chapters for outline...");
            const response = await ApiService.getChapters(state.user.id);
            const chapters = Array.isArray(response) ? response : (response.chapters || []);

            if (chapters && chapters.length > 0) {
                state.chapters = chapters;
                // Also update interviewPlan to stop the "No chapters found" fallback
                state.interviewPlan = { chapters };
                saveAppState();

                const list = container.querySelector('#chapterList');
                if (list) list.innerHTML = renderChapters(state.interviewPlan);
            }
        } catch (err) {
            console.error("Background outline sync failed:", err);
        }
    }, 0);

    // Logic
    const feedbackButtons = container.querySelector('#feedbackButtons');
    const feedbackForm = container.querySelector('#feedbackForm');
    const btnYes = container.querySelector('#btnYes');
    const btnNo = container.querySelector('#btnNo');
    const btnSubmitFeedback = container.querySelector('#btnSubmitFeedback');
    const feedbackText = container.querySelector('#feedbackText');

    const submitFeedback = async (approved, text = '') => {
        try {
            const payload = {
                approved,
                feedback: text,
                userName: state.user ? state.user.id : 'Guest',
                userEmail: state.user ? state.user.email : 'Guest'
            };

            // UI Feedback
            if (approved) {
                btnYes.textContent = 'Submitting...';
                btnYes.disabled = true;
                btnNo.disabled = true;
            } else {
                btnSubmitFeedback.textContent = 'Submitting...';
                btnSubmitFeedback.disabled = true;

                // Show waiting overlay for "No" case as it might take time to regenerate
                container.innerHTML = `
                    <div style="text-align: center; padding-top: 5rem;">
                        <h2 style="margin-bottom: 1rem;">Refining Your Outline...</h2>
                        <div class="loading-spinner" style="margin: 2rem auto;"></div>
                        <p style="color: var(--color-text-muted);">We're updating the chapters based on your feedback.</p>
                    </div>
                `;
            }

            const response = await ApiService.submitOutlineFeedback(payload);

            if (approved) {
                // Success - Move to next stage (Dashboard)
                state.journeyProgress = state.journeyProgress || {};
                state.journeyProgress.outlineApproved = true;

                // Save to backend: move to stage 3.1.1 (Interviews start)
                try {
                    const firstChapterStage = '3.1.1';
                    await ApiService.saveProgress(state.user.id, firstChapterStage);
                    state.current_stage = firstChapterStage;
                } catch (err) {
                    console.error("Failed to save approval progress to backend:", err);
                }

                saveAppState(); // Persist the approval
                alert('Outline approved! You can now start the interviews from the dashboard.');
                navigateTo('dashboard');
            } else {
                // "No" case - We expect new chapters in response
                console.log("Feedback response:", response);
                if (response && response.chapters && response.chapters.length > 0) {
                    console.log("Received updated chapters:", response.chapters);
                    state.interviewPlan = response;
                    // Reset approval status so user can review the updated outline
                    state.journeyProgress.outlineApproved = false;
                    saveAppState(); // Persist the updated chapters
                    // Re-render the page with new chapters
                    navigateTo('interview-plan');
                } else {
                    // Fallback if no chapters returned but success
                    console.log("No chapters in response, showing fallback");
                    alert('Feedback received. We will notify you when the update is ready.');
                    navigateTo('dashboard');
                }
            }

        } catch (error) {
            console.error("Feedback submission error:", error);
            alert(`Failed to submit feedback: ${error.message}`);
            // Restore UI if error
            navigateTo('interview-plan');
        }
    };

    if (btnYes) {
        btnYes.addEventListener('click', () => submitFeedback(true));
    }

    if (btnNo) {
        btnNo.addEventListener('click', () => {
            feedbackButtons.style.display = 'none'; // Hide Yes/No
            feedbackForm.style.display = 'block';   // Show Textbox
        });
    }

    if (btnSubmitFeedback) {
        btnSubmitFeedback.addEventListener('click', () => {
            submitFeedback(false, feedbackText.value);
        });
    }

    container.querySelector('#backBtn').addEventListener('click', () => {
        navigateTo('dashboard');
    });

    return container;
}

function renderChapters(plan) {
    if (!plan || !plan.chapters || plan.chapters.length === 0) {
        return `<div style="text-align: center; padding: 2rem;">No chapters found.</div>`;
    }

    return plan.chapters.map((chapter, index) => `
        <div class="chapter-item" style="padding: 1.5rem; margin-bottom: 1rem; background: #f8fafc; border-radius: 8px;">
            <div class="chapter-info">
                <h4 style="margin-bottom: 0.5rem; color: var(--color-primary);">${index + 1}. ${chapter.title}</h4>
                <p style="font-size: 0.9rem; color: var(--color-text); line-height: 1.5;">${chapter.description || 'No description available.'}</p>
            </div>
        </div>
    `).join('');
}
