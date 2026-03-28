function renderReviewDraft(navigateTo, state) {
    const container = document.createElement('div');
    container.className = 'flex flex-col h-screen';

    // Internal navigation state
    let currentView = 'TOC'; // TOC or DETAIL
    let selectedChapter = null;
    let allDrafts = [];

    const render = async () => {
        container.innerHTML = '';

        if (currentView === 'TOC') {
            await renderTOC();
        } else {
            renderDetail();
        }
    };

    /**
     * View 1: Table of Contents / Chapter List
     */
    const renderTOC = async () => {
        // Show loading state first
        container.innerHTML = `
            <div class="flex items-center justify-center h-screen flex-col gap-md">
                <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="color: var(--color-text-muted);">Syncing your drafts...</p>
            </div>
            <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        `;

        try {
            // Fetch all drafts for the user
            const response = await ApiService.getChapterDrafts(state.user.id);
            // Handle both { drafts: [] } and flat array [] responses
            allDrafts = Array.isArray(response) ? response : (response.drafts || []);

            // Update state with any new chapter info (like better titles)
            allDrafts.forEach(draft => {
                const chapterNo = draft.chapter_number || draft.chapterNumber;
                const stateCh = state.chapters?.find(c => c.chapterNumber === chapterNo);

                if (stateCh) {
                    stateCh.title = draft.chapter_title || stateCh.title;
                    stateCh.version = draft.version || stateCh.version;
                    stateCh.status = 'completed'; // If it has a draft, it's effectively completed/ready
                }
            });

            const chapters = state.chapters || [];

            // Logic for Final Memoir Approval
            const allChaptersFinal = chapters.length > 0 && chapters.every(ch =>
                allDrafts.some(d => (d.chapter_number || d.chapterNumber) === ch.chapterNumber && d.version === 'final')
            );
            const isFullyComplete = (state.current_stage === '5');

            container.innerHTML = `
                <nav class="navbar" style="flex-shrink: 0;">
                    <div class="container flex justify-between items-center">
                        <div class="flex items-center gap-sm">
                            <button id="backToDashBtn" class="btn" style="padding: 0.5rem;">← Dashboard</button>
                            <h2 style="font-size: 1.25rem;">Chapter Review Center</h2>
                        </div>
                    </div>
                </nav>

                <main class="container" style="padding-top: 3rem; max-width: 800px; padding-bottom: 5rem;">
                    <div class="card">
                        <h1 style="margin-bottom: 2rem; font-size: 2rem;">Your Chapters</h1>
                        <div class="chapter-list" style="display: flex; flex-direction: column; gap: 1rem;">
                            ${chapters.length === 0 ? '<p style="color: var(--color-text-muted);">No chapters available yet.</p>' : ''}
                            ${chapters.map(ch => {
                const draft = allDrafts.find(d => (d.chapter_number || d.chapterNumber) === ch.chapterNumber);
                const isDraftReady = !!draft;
                const draftVersion = draft ? (draft.version || '1') : null;
                const isFinal = isDraftReady && draftVersion === 'final';

                const isRedrafting = isDraftReady && !isFinal && state.submittedFeedback && state.submittedFeedback[ch.chapterNumber] === draftVersion;

                let badgeClass = 'badge-pending';
                let statusLabel = 'Pending';

                if (isDraftReady) {
                    if (isFinal) {
                        badgeClass = 'badge-ready';
                        statusLabel = 'Ready';
                    } else if (isRedrafting) {
                        badgeClass = 'badge-pending';
                        statusLabel = 'Redrafting';
                    } else {
                        badgeClass = 'badge-draft';
                        statusLabel = 'Draft v' + draftVersion;
                    }
                }

                return `
                                    <div class="chapter-row" style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border: 1px solid var(--color-border); border-radius: 0.75rem; background: white;">
                                        <div style="flex: 1;">
                                            <div style="font-weight: 700; font-size: 1.1rem; color: var(--color-primary);">Chapter ${ch.chapterNumber}: ${ch.title}</div>
                                            <div style="margin-top: 0.5rem;"><span class="badge ${badgeClass}">${statusLabel}</span></div>
                                        </div>
                                        ${isDraftReady ? `
                                            <button class="btn ${isRedrafting ? 'btn-outline' : 'btn-primary'} review-btn" data-chapter="${ch.chapterNumber}">
                                                ${isFinal ? 'Read Final' : (isRedrafting ? 'View Draft (Redrafting)' : 'Review Draft')}
                                            </button>
                                        ` : `
                                            <span style="font-style: italic; font-size: 0.9rem; color: var(--color-text-muted);">Interviews in progress...</span>
                                        `}
                                    </div>
                                `;
            }).join('')}
                        </div>
                    </div>

                    ${allChaptersFinal && !isFullyComplete ? `
                    <div class="card" style="margin-top: 2rem; border: 2px solid var(--color-accent); background: linear-gradient(to right, #fff, #fff9f0);">
                        <h3 style="color: var(--color-accent); margin-bottom: 1rem;">Memoir Finalization</h3>
                        <p style="margin-bottom: 1.5rem; line-height: 1.6;">Excellent! All your chapters have been reviewed and finalized. You can now officially complete your memoir journey.</p>
                        <button id="finalizeMemoirBtn" class="btn btn-accent" style="width: 100%; height: 50px; font-weight: 700;">Finalize My Memoir 🎉</button>
                    </div>
                    ` : ''}

                    ${isFullyComplete ? `
                    <div style="text-align: center; margin-top: 3rem; padding: 2rem; background: #dcfce7; border-radius: 1rem; border: 1px solid #166534;">
                        <h3 style="color: #166534; margin-bottom: 0.5rem;">Memoir Complete</h3>
                        <p style="color: #166534;">Your FondMemoirs book is officially preserved! You can still read your chapters above.</p>
                    </div>
                    ` : ''}
                </main>
            `;

            container.querySelector('#backToDashBtn').addEventListener('click', () => navigateTo('dashboard'));

            const finalizeBtn = container.querySelector('#finalizeMemoirBtn');
            if (finalizeBtn) {
                finalizeBtn.addEventListener('click', async () => {
                    if (confirm('Are you sure you want to finalize your memoir? This will close the review process and mark your story as complete.')) {
                        finalizeBtn.disabled = true;
                        finalizeBtn.textContent = 'Finalizing...';
                        try {
                            await ApiService.saveProgress(state.user.id, '5');
                            state.current_stage = '5';
                            if (state.journeyProgress) state.journeyProgress.reviewComplete = true;
                            saveAppState();
                            alert('Congratulations! Your memoir is now complete.');
                            navigateTo('dashboard');
                        } catch (e) {
                            alert('Failed to finalize memoir. Please try again.');
                            finalizeBtn.disabled = false;
                            finalizeBtn.textContent = 'Finalize My Memoir 🎉';
                        }
                    }
                });
            }

            container.querySelectorAll('.review-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const chapterNo = parseInt(btn.dataset.chapter);
                    selectedChapter = allDrafts.find(d => (d.chapter_number || d.chapterNumber) === chapterNo);
                    currentView = 'DETAIL';
                    render();
                });
            });

        } catch (error) {
            console.error('Failed to load TOC:', error);
            container.innerHTML = `
                <div class="p-xl text-center">
                    <h2 style="color: #ef4444;">Sync Error</h2>
                    <p>Failed to retrieve your chapter drafts.</p>
                    <button id="retryTOC" class="btn btn-primary" style="margin-top: 1rem;">Retry</button>
                    <button id="backDashError" class="btn" style="margin-top: 1rem; margin-left: 0.5rem;">Back to Dashboard</button>
                </div>
            `;
            container.querySelector('#retryTOC').addEventListener('click', () => render());
            container.querySelector('#backDashError').addEventListener('click', () => navigateTo('dashboard'));
        }
    };

    /**
     * View 2: Detailed Review / Reader
     */
    const renderDetail = () => {
        const chapterNum = selectedChapter.chapter_number || selectedChapter.chapterNumber;
        const draftVersion = selectedChapter.version || '1';
        const isFinal = draftVersion === 'final';
        const isRedrafting = !isFinal && state.submittedFeedback && state.submittedFeedback[chapterNum] === draftVersion;

        // Process sections from content_sections
        let globalParagraphIndex = 0;
        const sections = (selectedChapter.content_sections || []).map(section => ({
            title: section.section_title || section.title,
            paragraphs: (section.content || "").split('\n\n').filter(p => p.trim() !== '').map(text => ({
                text,
                index: globalParagraphIndex++
            }))
        }));

        const allParagraphsList = sections.flatMap(s => s.paragraphs);

        container.innerHTML = `
            <nav class="navbar" style="flex-shrink: 0;">
                <div class="container flex justify-between items-center">
                    <div class="flex items-center gap-sm">
                        <button id="backToListBtn" class="btn" style="padding: 0.5rem;">← Back to List</button>
                        <h2 style="font-size: 1.1rem;">
                            ${isFinal ? 'Reading' : 'Reviewing'}: ${selectedChapter.chapter_title}
                            <span style="font-size: 0.75rem; padding: 0.2rem 0.5rem; background: ${isFinal ? '#dcfce7' : '#fef9c3'}; border-radius: 4px; margin-left: 0.5rem;">
                                ${isFinal ? 'Final' : 'Draft v' + (selectedChapter.version || '1')}
                            </span>
                        </h2>
                    </div>
                    <div class="flex gap-sm">
                        ${!isFinal && !isRedrafting ? `
                            <button id="submitFeedbackBtn" class="btn btn-primary">Submit Feedback</button>
                        ` : `<button class="btn" disabled>Read Only</button>`}
                    </div>
                </div>
            </nav>

            <div class="review-layout">
                <main class="story-pane" id="storyPane">
                    <div style="max-width: 700px; margin: 0 auto;">
                        <div style="border-bottom: 1px solid var(--color-border); padding-bottom: 2rem; margin-bottom: 3rem;">
                            <span style="text-transform: uppercase; font-size: 0.75rem; color: var(--color-accent); font-weight: 700;">Chapter ${selectedChapter.chapter_number || selectedChapter.chapterNumber}</span>
                            <h1 style="font-size: 2.5rem; margin-top: 0.5rem;">${selectedChapter.chapter_title}</h1>
                        </div>
                        <div class="story-content">
                            ${sections.map(section => `
                                ${section.title ? `<h3 style="margin-top: 3rem; margin-bottom: 1.5rem; color: var(--color-primary);">${section.title}</h3>` : ''}
                                ${section.paragraphs.map(p => `
                                    <div class="review-paragraph ${isFinal ? 'readonly' : ''}" data-p-index="${p.index}">
                                        ${p.text}
                                    </div>
                                `).join('')}
                            `).join('')}
                        </div>
                        <div style="height: 20vh;"></div>
                    </div>
                </main>

                <aside class="feedback-pane" id="feedbackPane" style="${isFinal || isRedrafting ? 'display: none;' : ''}">
                    <div class="feedback-header" style="margin-bottom: 1rem;">
                        <h3 style="font-size: 1rem;">Feedback</h3>
                        <p style="font-size: 0.8rem; color: var(--color-text-muted);">Click a paragraph to add comments.</p>
                    </div>
                    <div id="feedbackList" style="display: flex; flex-direction: column; gap: 2rem;">
                        ${allParagraphsList.map(p => `
                            <div class="feedback-item" id="feedback-item-${p.index}" data-p-index="${p.index}">
                                <label class="feedback-label">Paragraph ${p.index + 1}</label>
                                <textarea class="feedback-textarea" 
                                          placeholder="Add feedback for this paragraph..." 
                                          data-p-index="${p.index}"></textarea>
                            </div>
                        `).join('')}
                    </div>
                    <div style="height: 20vh;"></div>
                </aside>
            </div>
        `;

        // Logic for Detailed View
        container.querySelector('#backToListBtn').addEventListener('click', () => {
            currentView = 'TOC';
            render();
        });

        if (!isFinal && !isRedrafting) {
            const storyPane = container.querySelector('#storyPane');
            const allParagraphEls = container.querySelectorAll('.review-paragraph');
            const allFeedbackItems = container.querySelectorAll('.feedback-item');
            const textareas = container.querySelectorAll('.feedback-textarea');

            textareas.forEach(ta => {
                ta.addEventListener('input', (e) => {
                    feedbackMap[e.target.dataset.pIndex] = e.target.value;
                });
            });

            const activateIndex = (index) => {
                allParagraphEls.forEach(p => p.classList.toggle('active', p.dataset.pIndex == index));
                allFeedbackItems.forEach(f => f.classList.toggle('active', f.dataset.pIndex == index));
                const targetF = container.querySelector(`.feedback-item[data-p-index="${index}"]`);
                if (targetF) targetF.scrollIntoView({ behavior: 'smooth', block: 'center' });
            };

            allParagraphEls.forEach(p => {
                p.addEventListener('click', () => activateIndex(p.dataset.pIndex));
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) activateIndex(entry.target.dataset.pIndex);
                });
            }, { root: storyPane, threshold: 0.1, rootMargin: '-10% 0px -70% 0px' });

            allParagraphEls.forEach(p => observer.observe(p));

            container.querySelector('#submitFeedbackBtn').addEventListener('click', async () => {
                const btn = container.querySelector('#submitFeedbackBtn');
                const feedbackList = Object.keys(feedbackMap).map(idx => ({
                    paragraphIndex: parseInt(idx),
                    originalText: allParagraphsList[idx].text.substring(0, 50) + '...',
                    feedback: feedbackMap[idx]
                })).filter(f => f.feedback.trim() !== '');

                if (feedbackList.length === 0) return alert('Please add some feedback.');

                const chapterNum = selectedChapter.chapter_number || selectedChapter.chapterNumber;

                // SPECIAL LOGIC FOR CHAPTER 1: If style not set, pause and redirect
                // Use Number() to handle cases where chapterNum might be a string "1"
                if (Number(chapterNum) === 1 && !state.writingStyleSet) {
                    state.pendingDraftFeedback = {
                        chapterNumber: chapterNum,
                        feedback: feedbackList
                    };
                    saveAppState();
                    alert('Before we process your feedback, we need a quick calibration of your writing style!');
                    navigateTo('writing-style');
                    return;
                }

                btn.disabled = true;
                btn.innerText = 'Submitting...';

                try {
                    await ApiService.submitDraftFeedback(state.user.id, chapterNum, feedbackList, state.user.memoirName);

                    if (!state.submittedFeedback) state.submittedFeedback = {};
                    state.submittedFeedback[chapterNum] = draftVersion;
                    saveAppState();

                    alert('Feedback submitted!');
                    currentView = 'TOC';
                    render();
                } catch (e) {
                    alert('Error submitting feedback.');
                    btn.disabled = false;
                    btn.innerText = 'Submit Feedback';
                }
            });
        }
    };

    render();
    return container;
}
