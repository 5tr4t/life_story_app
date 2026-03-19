function renderDashboard(navigateTo, state) {
    const container = document.createElement('div');

    // Header
    const header = `
        <nav class="navbar">
            <div class="container flex justify-between items-center">
                <div class="flex items-center gap-sm">
                    <h2 style="font-size: 1.25rem;">FondMemoirs</h2>
                </div>
                <div class="flex items-center gap-md">
                    <button id="addNewMemoirBtn" class="btn btn-outline" style="padding: 0.5rem; font-size: 0.875rem; border-color: var(--color-accent); color: var(--color-accent);">+ Add Memoir</button>
                    <div style="text-align: right; margin-right: 1rem;">
                        <span style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--color-primary);">${state.user ? state.user.memoirName : 'Guest'}</span>
                        <span style="display: block; font-size: 0.75rem; color: var(--color-text-muted);">User: ${state.user ? state.user.name : 'Guest'}</span>
                    </div>
                    <button id="logoutBtn" class="btn" style="padding: 0.5rem; font-size: 0.875rem;">Sign Out</button>
                </div>
            </div>
        </nav>
    `;

    // Helper for Status Badge
    const getBadge = (status, locked) => {
        if (status === 'completed') return `<span style="background: #dcfce7; color: #166534; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600;">Completed</span>`;
        if (status === 'action') return `<span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600;">Action Required</span>`;
        if (locked) return `<span style="background: #f1f5f9; color: #64748b; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600;">Locked</span>`;
        return '';
    };

    // Calculate States based on numerical stage
    const currentStage = state.current_stage || '1';
    const stageNum = parseFloat(currentStage);

    // Step 1: Setup
    const setupCompleted = stageNum >= 2;
    const setupActive = stageNum === 1;
    const setupStatus = setupCompleted ? 'completed' : 'action';
    const setupBorder = setupActive ? 'border: 2px solid var(--color-accent);' : '';
    const setupBtnClass = setupActive ? 'btn-accent' : (setupCompleted ? 'btn-primary' : 'btn-accent');

    // Step 2: Outline
    const outlineCompleted = stageNum >= 3;
    const outlineActive = stageNum === 2;
    const outlineStatus = outlineCompleted ? 'completed' : (stageNum < 2 ? 'locked' : 'action');
    const outlineBorder = outlineActive ? 'border: 2px solid var(--color-accent);' : '';
    let outlineBtnClass = 'btn-primary';
    if (outlineActive) outlineBtnClass = 'btn-accent';
    else if (stageNum < 2) outlineBtnClass = 'btn-locked';
    else if (outlineCompleted) outlineBtnClass = 'btn-primary';

    const outlineBtnText = outlineCompleted ? 'View Outline' : 'Manage Outline';
    const outlineDisabled = stageNum < 2 ? 'disabled' : '';

    // Step 3: Interviews
    const interviewsCompleted = stageNum >= 4;
    const interviewsActive = currentStage.startsWith('3.');
    const interviewStatus = interviewsCompleted ? 'completed' : (stageNum < 3 ? 'locked' : 'action');
    const interviewBorder = interviewsActive ? 'border: 2px solid var(--color-accent);' : '';

    let interviewBtnClass = 'btn-primary';
    if (interviewsActive) interviewBtnClass = 'btn-accent';
    else if (stageNum < 3) interviewBtnClass = 'btn-locked';

    const interviewDisabled = stageNum < 3 ? 'disabled' : '';

    // Step 4: Review Draft
    const draftsCompleted = (state.chapters || []).some(ch => ch.status === 'completed');
    const reviewCompleted = stageNum >= 5;
    const reviewActive = stageNum === 4;
    const actionRequiredOnDraft = (state.chapters || []).some(ch => ch.status === 'completed' && ch.version !== 'final');

    let reviewStatus = 'locked';
    if (reviewCompleted) reviewStatus = 'completed';
    else if (reviewActive || stageNum >= 4) reviewStatus = actionRequiredOnDraft ? 'action' : 'completed';

    const reviewBorder = reviewActive ? 'border: 2px solid var(--color-accent);' : '';

    let reviewBtnClass = 'btn-primary';
    if (reviewActive) reviewBtnClass = 'btn-accent';
    else if (stageNum < 4 && !draftsCompleted) reviewBtnClass = 'btn-locked';

    const reviewDisabled = stageNum < 4 && !draftsCompleted ? 'disabled' : '';

    const main = `
        <main class="container" style="padding-top: 3rem; padding-bottom: 3rem;">
            ${state.current_stage === '5' ? `
            <!-- Completion Message -->
            <div style="background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%); border: 2px solid #166534; border-radius: 1rem; padding: 3rem; text-align: center; margin-bottom: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
                <h1 style="font-size: 2.5rem; color: #166534; margin-bottom: 1rem;">Congratulations!</h1>
                <p style="font-size: 1.25rem; color: #166534; margin-bottom: 0;">Your FondMemoirs book is complete!</p>
            </div>
            ` : ''}
            

            <div style="margin-bottom: 3rem;">
                <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">Your Journey</h1>
                <p style="color: var(--color-text-muted); max-width: 600px;">
                    Follow the steps below to capture your legacy.
                </p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
                <!-- Step 1: Setup -->
                <div class="card" style="${setupBorder}">
                    <div class="flex justify-between items-center" style="margin-bottom: 1rem;">
                        <h3 style="font-size: 1.25rem;">1. Initial Setup</h3>
                        ${getBadge(setupStatus)}
                    </div>
                    <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
                        Profile and story preferences.
                    </p>
                    <button id="setupBtn" class="btn ${setupBtnClass}" style="width: 100%;">View Setup</button>
                </div>

                <!-- Step 2: Story Outline -->
                <div class="card" style="${outlineBorder}">
                    <div class="flex justify-between items-center" style="margin-bottom: 1rem;">
                        <h3 style="font-size: 1.25rem;">2. Story Outline</h3>
                        ${getBadge(outlineStatus, stageNum < 2)}
                    </div>
                    <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
                        Organize chapters and invite contributors.
                    </p>
                    <button id="planBtn" class="btn ${outlineBtnClass}" style="width: 100%;" ${outlineDisabled}>${outlineBtnText}</button>
                </div>

                <!-- Step 3: Conduct Interviews -->
                <div class="card" style="${interviewBorder}">
                    <div class="flex justify-between items-center" style="margin-bottom: 1rem;">
                        <h3 style="font-size: 1.25rem;">3. Conduct Interviews</h3>
                        ${getBadge(interviewStatus, stageNum < 3)}
                    </div>
                    <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
                        Record your stories (or interview others).
                    </p>
                    <button id="startInterviewsBtn" class="btn ${interviewBtnClass}" style="width: 100%;" ${interviewDisabled}>Start Session</button>
                </div>

                <!-- Step 4: Review Draft -->
                <div class="card" style="${reviewBorder}">
                    <div class="flex justify-between items-center" style="margin-bottom: 1rem;">
                        <h3 style="font-size: 1.25rem;">4. Review Draft</h3>
                        ${getBadge(reviewStatus, stageNum < 4 && !draftsCompleted)}
                    </div>
                    <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
                        Read and edit your generated story.
                    </p>
                    <button id="reviewBtn" class="btn ${reviewBtnClass}" style="width: 100%;" ${reviewDisabled}>View Draft</button>
                </div>
            </div>
        </main>
    `;

    container.innerHTML = header + main;

    // Event Listeners
    container.querySelector('#logoutBtn').addEventListener('click', async () => {
        // 1. Sign out from Supabase if available
        if (window.supabaseClient) {
            await window.supabaseClient.auth.signOut();
        }

        // 2. Clear local audio recordings for security/cleanliness
        if (window.AudioStorage && window.AudioStorage.clearAllRecordings) {
            try {
                await window.AudioStorage.clearAllRecordings();
            } catch (err) {
                console.error("Failed to clear audio recordings on logout:", err);
            }
        }

        state.user = null;
        if (window.saveAppState) {
            window.saveAppState();
        } else {
            localStorage.removeItem('lifeStoryState');
        }
        window.location.reload();
    });


    container.querySelector('#addNewMemoirBtn').addEventListener('click', () => {
        navigateTo('redeem-code');
    });

    container.querySelector('#setupBtn').addEventListener('click', () => {
        navigateTo('setup');
    });

    container.querySelector('#planBtn').addEventListener('click', () => {
        navigateTo('interview-plan');
    });

    container.querySelector('#startInterviewsBtn').addEventListener('click', () => {
        navigateTo('interviews');
    });

    container.querySelector('#reviewBtn').addEventListener('click', () => {
        navigateTo('review-draft');
    });

    return container;
}
