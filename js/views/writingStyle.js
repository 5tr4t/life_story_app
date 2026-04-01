function renderWritingStyle(navigateTo, state) {
    const container = document.createElement('div');
    container.className = 'view-container';

    // Internal state for responses
    const responses = {
        voice: '',
        drama: '',
        humor: '',
        pacing: '',
        dialect: '',
        redPen: ''
    };

    const render = () => {
        container.innerHTML = `
            <div class="container" style="max-width: 800px; padding: 3rem 1.5rem;">
                <header style="text-align: center; margin-bottom: 3rem;">
                    <h1 style="font-size: 2.25rem; margin-bottom: 1rem;">The "Is This You?" Style Tuner</h1>
                    <p style="color: var(--color-text-muted); line-height: 1.6; font-size: 1.1rem; max-width: 600px; margin: 0 auto;">
                        You just read Chapter 1! To make sure the rest of the book sounds exactly like you, we need to calibrate the 'voice' of the writing. 
                        Be honest - we can handle the critique!
                    </p>
                </header>

                <div class="card" style="padding: 2.5rem;">
                    <form id="styleTunerForm" class="flex flex-col gap-xl">
                        
                        <!-- 1. Voice Check -->
                        <div class="form-group">
                            <label class="label" style="font-size: 1.2rem; margin-bottom: 1rem;">1. The "Voice" Check (Tone & Personality)</label>
                            <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 1.5rem;">Which of these statements best describes how you felt reading the draft?</p>
                            <div class="flex flex-col gap-sm">
                                <label class="radio-option">
                                    <input type="radio" name="voice" value="conversational" required>
                                    <span>"It sounds a bit too formal/stiff. I want it to sound more like I'm chatting with a friend over coffee."</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="voice" value="formal">
                                    <span>"It’s too casual. I want it to feel a bit more polished, authoritative, or 'book-ish'."</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="voice" value="perfect">
                                    <span>"The tone is actually perfect."</span>
                                </label>
                            </div>
                        </div>

                        <hr style="border: 0; border-top: 1px solid var(--color-border); margin: 0.5rem 0;">

                        <!-- 2. Drama Dial -->
                        <div class="form-group">
                            <label class="label" style="font-size: 1.2rem; margin-bottom: 1rem;">2. The "Drama" Dial (Emotional Intensity)</label>
                            <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 1.5rem;">When describing the big moments, how did the writing feel?</p>
                            <div class="flex flex-col gap-sm">
                                <label class="radio-option">
                                    <input type="radio" name="drama" value="more_drama" required>
                                    <span>"It was a bit dry. I want more emotion, more description of how I felt, and more sensory details."</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="drama" value="less_drama">
                                    <span>"It felt a bit melodramatic or flowery. I prefer to stick to the facts and keep things understated."</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="drama" value="just_right">
                                    <span>"The balance of facts and feelings was just right."</span>
                                </label>
                            </div>
                        </div>

                        <hr style="border: 0; border-top: 1px solid var(--color-border); margin: 0.5rem 0;">

                        <!-- 3. Humor Setting -->
                        <div class="form-group">
                            <label class="label" style="font-size: 1.2rem; margin-bottom: 1rem;">3. The "Humor" Setting</label>
                            <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 1.5rem;">Did the draft capture your sense of humor?</p>
                            <div class="flex flex-col gap-sm">
                                <label class="radio-option">
                                    <input type="radio" name="humor" value="witty" required>
                                    <span>"I’m naturally sarcastic or witty. Please inject more humor, irony, or lighthearted comments."</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="humor" value="serious">
                                    <span>"I want this to be a serious record of my life. Please keep jokes and playfulness to a minimum."</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="humor" value="matched">
                                    <span>"It matched my style well."</span>
                                </label>
                            </div>
                        </div>

                        <hr style="border: 0; border-top: 1px solid var(--color-border); margin: 0.5rem 0;">

                        <!-- 4. Pacing -->
                        <div class="form-group">
                            <label class="label" style="font-size: 1.2rem; margin-bottom: 1rem;">4. Sentence Structure (Pacing)</label>
                            <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 1.5rem;">Think about parts that you didn't love. What was the issue?</p>
                            <div class="flex flex-col gap-sm">
                                <label class="radio-option">
                                    <input type="radio" name="pacing" value="punchy" required>
                                    <span>"The sentences felt long and winding. I like punchy, short sentences. Get to the point."</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="pacing" value="flowing">
                                    <span>"It felt a bit choppy. I like longer, more flowing sentences that connect ideas together."</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="pacing" value="no_issue">
                                    <span>"I didn't notice any issues with the flow."</span>
                                </label>
                            </div>
                        </div>

                        <hr style="border: 0; border-top: 1px solid var(--color-border); margin: 0.5rem 0;">

                        <!-- 5. Dialect -->
                        <div class="form-group">
                            <label class="label" style="font-size: 1.2rem; margin-bottom: 1rem;">5. British vs. American English</label>
                            <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 1.5rem;">Just a quick check on spelling and phrases:</p>
                            <div class="flex gap-md">
                                <label class="radio-option flex-1">
                                    <input type="radio" name="dialect" value="british" required>
                                    <span>British/Commonwealth (Colour, Centre, 'Holiday')</span>
                                </label>
                                <label class="radio-option flex-1">
                                    <input type="radio" name="dialect" value="american">
                                    <span>American (Color, Center, 'Vacation')</span>
                                </label>
                            </div>
                        </div>

                        <hr style="border: 0; border-top: 1px solid var(--color-border); margin: 0.5rem 0;">

                        <!-- 6. Red Pen -->
                        <div class="form-group" style="width: 100%;">
                            <label class="label" style="font-size: 1.2rem; margin-bottom: 1rem;">6. The "Red Pen" (Open Feedback)</label>
                            <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 1.5rem;">Was there a specific word or phrase that made you cringe? (e.g., 'tapestry', 'delve', or 'Mother' instead of 'Mum')</p>
                            <textarea id="redPen" class="input" style="min-height: 100px; width: 100%;" placeholder="Type any cringe-worthy words or stylistic 'no-gos' here..."></textarea>
                        </div>

                        <div id="submitStatus" style="text-align: center; margin-top: 1rem; font-size: 0.9rem;"></div>

                        <button type="submit" id="styleFinishBtn" class="btn btn-primary" style="height: 55px; font-size: 1.1rem; font-weight: 700; margin-top: 2rem;">
                            Submit
                        </button>
                    </form>
                </div>
            </div>

            <style>
                .radio-option {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding: 1rem;
                    border: 1px solid var(--color-border);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .radio-option:hover {
                    background: #f8fafc;
                    border-color: var(--color-primary);
                }
                .radio-option input {
                    margin-top: 0.25rem;
                }
                .radio-option input:checked + span {
                    font-weight: 600;
                    color: var(--color-primary);
                }
                .radio-option:has(input:checked) {
                    background: #eff6ff;
                    border-color: var(--color-primary);
                }
                .gap-xl { gap: 2.5rem; }
            </style>
        `;

        const form = container.querySelector('#styleTunerForm');
        const submitStatus = container.querySelector('#submitStatus');
        const finishBtn = container.querySelector('#styleFinishBtn');

        form.onsubmit = async (e) => {
            e.preventDefault();

            const getSelectedText = (name) => {
                const checked = form.querySelector(`input[name="${name}"]:checked`);
                if (!checked) return '';
                // Get the text from the sibling span
                const span = checked.parentElement.querySelector('span');
                return span ? span.textContent.trim() : checked.value;
            };

            const styleData = {
                voice: getSelectedText('voice'),
                drama: getSelectedText('drama'),
                humor: getSelectedText('humor'),
                pacing: getSelectedText('pacing'),
                dialect: getSelectedText('dialect'),
                redPen: container.querySelector('#redPen').value
            };

            finishBtn.disabled = true;
            finishBtn.textContent = 'Submitting...';
            submitStatus.textContent = 'Step 1: Calibrating your voice...';
            submitStatus.style.color = 'var(--color-primary)';

            try {
                // 1. Submit Style Persona
                await ApiService.submitStylePersona(state.user.id, styleData, state.user.memoirName);
                state.writingStyleSet = true;

                // 2. Submit Pending Feedback if it exists
                if (state.pendingDraftFeedback) {
                    submitStatus.textContent = 'Step 2: Sending Chapter feedback with new style...';
                    const { chapterNumber, feedback, version } = state.pendingDraftFeedback;
                    await ApiService.submitDraftFeedback(state.user.id, chapterNumber, feedback, state.user.memoirName);
                    if (!state.submittedFeedback) state.submittedFeedback = {};
                    state.submittedFeedback[chapterNumber] = version || '1';
                    state.pendingDraftFeedback = null;
                }

                saveAppState();
                submitStatus.textContent = 'Success! Your story is calibrated.';
                submitStatus.style.color = '#10b981';

                setTimeout(() => {
                    navigateTo('review-draft'); // Back to chapters
                }, 1500);

            } catch (err) {
                console.error("Submission failed:", err);
                submitStatus.textContent = 'Something went wrong. Please try again.';
                submitStatus.style.color = '#ef4444';
                finishBtn.disabled = false;
                finishBtn.textContent = 'Submit';
            }
        };
    };

    render();
    return container;
}
