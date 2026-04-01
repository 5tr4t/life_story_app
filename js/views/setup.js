function renderSetup(navigateTo, state) {
    const container = document.createElement('div');

    container.innerHTML = `
        <nav class="navbar">
            <div class="container flex justify-between items-center">
                <div class="flex items-center gap-sm">
                    <button id="backBtn" class="btn" style="padding: 0.5rem;">← Back</button>
                    <h2 style="font-size: 1.25rem;">Initial Setup</h2>
                </div>
            </div>
        </nav>

        <main class="container" style="padding-top: 3rem; max-width: 800px;">
            <div id="setupLoading" class="card" style="display: none; text-align: center; padding: 6rem 2rem;">
                <div class="loading-spinner" style="width: 60px; height: 60px; border: 4px solid #f3f3f3; border-top: 4px solid var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1.5rem auto;"></div>
                <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Setting up your journey...</h2>
                <p style="color: var(--color-text-muted); font-size: 1.1rem; max-width: 500px; margin: 0 auto;">
                    Please give us a moment while we set up the rest of your journey as per your preferences.
                </p>
                <style>
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                </style>
            </div>

            <div id="setupContent" class="card">
                <div style="margin-bottom: 2rem;">
                    <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Let's Get Started</h1>
                    <p style="color: var(--color-text-muted);">
                        Please provide some basic details to help us tailor your FondMemoirs journey.
                    </p>
                    <div id="setupError" style="display: none; background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; border: 1px solid #fecaca;"></div>
                    ${state.journeyProgress && state.journeyProgress.questions ? `
                    <div style="background: #fff3cd; color: #856404; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; border: 1px solid #ffeeba;">
                        <strong>Note:</strong> Setup is locked because interviews have already started.
                    </div>
                    ` : ''}
                </div>

                <form id="setupForm">
                    <fieldset ${state.current_stage !== '1' && state.journeyProgress && state.journeyProgress.setup ? 'disabled' : ''} style="border: none; padding: 0; margin: 0;">
                    <!-- Section 1: The Basics -->
                    <div style="margin-bottom: 3rem;">
                        <h3 style="font-size: 1.25rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">1. The Basics</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                            <div class="input-group">
                                <label class="input-label">Full Name</label>
                                <input type="text" class="input-field" name="fullName" value="${state.user ? state.user.name : ''}" required>
                            </div>
                            <div class="input-group">
                                <label class="input-label">Date of Birth</label>
                                <input type="date" class="input-field" name="dob">
                            </div>
                        </div>
 
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                            <div class="input-group">
                                <label class="input-label">Place of Birth</label>
                                <input type="text" class="input-field" name="pob" placeholder="City, Country">
                            </div>
                            <div class="input-group">
                                <label class="input-label">Current Residence</label>
                                <input type="text" class="input-field" name="residence" placeholder="City, Country">
                            </div>
                        </div>
 
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                            <div class="input-group">
                                <label class="input-label">Marital Status</label>
                                <select class="input-field" name="maritalStatus">
                                    <option value="">Select...</option>
                                    <option value="single">Single</option>
                                    <option value="married">Married</option>
                                    <option value="divorced">Divorced</option>
                                    <option value="widowed">Widowed</option>
                                    <option value="partnered">Partnered</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label class="input-label">Children</label>
                                <input type="text" class="input-field" name="children" placeholder="Names/Ages (optional)">
                            </div>
                        </div>

                        <div class="input-group">
                            <label class="input-label">Significant Others / Key Relationships</label>
                            <p style="font-size: 0.95rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">Who have been the most significant partners or companions in your life? (Spouses, friends, partners, etc.)</p>
                            <textarea class="input-field" name="significantOthers" rows="2" placeholder="e.g., My wife Sarah, my lifelong best friend Mark..."></textarea>
                        </div>
                    </div>

                    <!-- Section 2: The Journey: Places & Eras -->
                    <div style="margin-bottom: 3rem;">
                        <h3 style="font-size: 1.25rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">2. The Journey: Places & Eras</h3>
                        
                        <div class="input-group" style="margin-bottom: 2rem;">
                            <label class="input-label">Where have you lived?</label>
                            <p style="font-size: 0.95rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">List the main cities/countries you’ve lived in, roughly in order.</p>
                            <textarea class="input-field" name="placesLived" rows="2" placeholder="e.g., Born in London, moved to Singapore in my 20s, settled in Vancouver in my 40s."></textarea>
                        </div>

                        <div id="decadesContainer">
                            <label class="input-label" style="margin-bottom: 1rem; display: block;">Life by the Decade</label>
                            <p style="font-size: 0.95rem; color: var(--color-text-muted); margin-bottom: 1.5rem;">Briefly describe what was happening in your life during these periods. Bullet points are fine!</p>
                            
                            <div id="decadesInputs" style="display: flex; flex-direction: column; gap: 1.5rem;">
                                <!-- Dynamic decade inputs will be injected here -->
                                <div style="text-align: center; color: var(--color-text-muted); padding: 1rem; border: 1px dashed var(--color-border); border-radius: 0.5rem;">
                                    Please enter your Date of Birth above to see your life timeline here.
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Section 3: The Core Theme -->
                    <div style="margin-bottom: 3rem;">
                        <h3 style="font-size: 1.25rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">3. The Core Theme</h3>
                        
                        <div class="input-group" style="margin-bottom: 2rem;">
                            <label class="input-label" style="font-size: 1.1rem; margin-bottom: 1rem; display: block;">
                                Looking back at that timeline, what feels like the "main thread" of your story? (Select one or more)
                            </label>
                            <div style="display: flex; flex-direction: column; gap: 1rem;">
                                <label class="persona-option" style="cursor: pointer; display: block; padding: 1rem; border: 1px solid var(--color-border); border-radius: 0.5rem; transition: all 0.2s;">
                                    <div class="flex items-center gap-sm">
                                        <input type="checkbox" name="mainThemes" value="explorer">
                                        <div>
                                            <span style="font-weight: 600; color: var(--color-primary); display: block;">The Explorer</span>
                                            <span style="font-size: 0.85rem; color: var(--color-text-muted);">A life defined by travel, movement, and seeing the world.</span>
                                        </div>
                                    </div>
                                </label>
                                <label class="persona-option" style="cursor: pointer; display: block; padding: 1rem; border: 1px solid var(--color-border); border-radius: 0.5rem; transition: all 0.2s;">
                                    <div class="flex items-center gap-sm">
                                        <input type="checkbox" name="mainThemes" value="builder">
                                        <div>
                                            <span style="font-weight: 600; color: var(--color-primary); display: block;">The Builder</span>
                                            <span style="font-size: 0.85rem; color: var(--color-text-muted);">Focused on creating a family, a business, or a career legacy.</span>
                                        </div>
                                    </div>
                                </label>
                                <label class="persona-option" style="cursor: pointer; display: block; padding: 1rem; border: 1px solid var(--color-border); border-radius: 0.5rem; transition: all 0.2s;">
                                    <div class="flex items-center gap-sm">
                                        <input type="checkbox" name="mainThemes" value="overcomer">
                                        <div>
                                            <span style="font-weight: 600; color: var(--color-primary); display: block;">The Overcomer</span>
                                            <span style="font-size: 0.85rem; color: var(--color-text-muted);">A story of resilience, surviving challenges, and reinventing yourself.</span>
                                        </div>
                                    </div>
                                </label>
                                <label class="persona-option" style="cursor: pointer; display: block; padding: 1rem; border: 1px solid var(--color-border); border-radius: 0.5rem; transition: all 0.2s;">
                                    <div class="flex items-center gap-sm">
                                        <input type="checkbox" name="mainThemes" value="connector">
                                        <div>
                                            <span style="font-weight: 600; color: var(--color-primary); display: block;">The Connector</span>
                                            <span style="font-size: 0.85rem; color: var(--color-text-muted);">Defined by deep relationships, community, and the people you love.</span>
                                        </div>
                                    </div>
                                </label>
                                <label class="persona-option" style="cursor: pointer; display: block; padding: 1rem; border: 1px solid var(--color-border); border-radius: 0.5rem; transition: all 0.2s;">
                                    <div class="flex items-center gap-sm">
                                        <input type="checkbox" name="mainThemes" value="creative">
                                        <div>
                                            <span style="font-weight: 600; color: var(--color-primary); display: block;">The Creative/Seeker</span>
                                            <span style="font-size: 0.85rem; color: var(--color-text-muted);">A life spent learning, creating art, or spiritual seeking.</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Section 4: Boundaries & Scope -->
                    <div style="margin-bottom: 3rem;">
                        <h3 style="font-size: 1.25rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">4. Boundaries & Scope</h3>
                        
                        <div class="input-group" style="margin-bottom: 2rem;">
                            <label class="input-label" style="margin-bottom: 1rem; display: block;">
                                Are there any topics or parts of your life you would prefer not to include?
                            </label>
                            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                <label class="flex items-center gap-sm" style="cursor: pointer;">
                                    <input type="radio" name="boundaries" value="none" checked>
                                    <span>No, I’m open to everything</span>
                                </label>
                                <label class="flex items-center gap-sm" style="cursor: pointer;">
                                    <input type="radio" name="boundaries" value="specific">
                                    <span>Yes, please specify below</span>
                                </label>
                                <textarea id="boundariesText" class="input-field" rows="2" placeholder="Topics to avoid..." style="display: none; margin-top: 0.5rem; font-size: 1rem;"></textarea>
                            </div>
                        </div>

                        <div class="input-group">
                            <label class="input-label" style="margin-bottom: 1rem; display: block;">
                                Besides the main theme, are there other specific memories you definitely want to include?
                            </label>
                            <p style="font-size: 0.95rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">(e.g., "That trip to Peru in 1995" or "My grandmother's cooking")</p>
                            <textarea class="input-field" name="specificMemories" rows="3" placeholder="List any special moments you don't want us to miss..."></textarea>
                        </div>
                    </div>


                    <!-- Section 5: Writing Style -->
                    <div style="margin-bottom: 3rem;">
                        <h3 style="font-size: 1.25rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">5. Writing Style</h3>
                        
                        <div class="input-group">
                            <label class="input-label" style="margin-bottom: 1rem; display: block;">
                                Read each example and tell us which style feels most like ‘you’.
                            </label>
                            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                                
                                <label class="style-option" style="cursor: pointer; display: block; padding: 1rem; border: 1px solid var(--color-border); border-radius: 0.5rem; transition: all 0.2s;">
                                    <div class="flex items-center gap-sm" style="margin-bottom: 0.5rem;">
                                        <input type="radio" name="writingStyle" value="narrative" required>
                                        <span style="font-weight: 600; color: var(--color-primary);">Narrative</span>
                                    </div>
                                    <p style="font-size: 0.875rem; color: var(--color-text-muted); line-height: 1.5; margin-left: 1.75rem;">
                                        “Jenny and I met in college, and from day one, we clicked like old friends reunited. We shared late-night talks, dreams, and secrets that no one else knew.”
                                    </p>
                                </label>

                                <label class="style-option" style="cursor: pointer; display: block; padding: 1rem; border: 1px solid var(--color-border); border-radius: 0.5rem; transition: all 0.2s;">
                                    <div class="flex items-center gap-sm" style="margin-bottom: 0.5rem;">
                                        <input type="radio" name="writingStyle" value="reflective">
                                        <span style="font-weight: 600; color: var(--color-primary);">Reflective</span>
                                    </div>
                                    <p style="font-size: 0.875rem; color: var(--color-text-muted); line-height: 1.5; margin-left: 1.75rem;">
                                        “Looking back, that friendship was a lifeline—a rare bond that taught me about trust, loyalty, and the comfort of being truly known.”
                                    </p>
                                </label>

                                <label class="style-option" style="cursor: pointer; display: block; padding: 1rem; border: 1px solid var(--color-border); border-radius: 0.5rem; transition: all 0.2s;">
                                    <div class="flex items-center gap-sm" style="margin-bottom: 0.5rem;">
                                        <input type="radio" name="writingStyle" value="conversational">
                                        <span style="font-weight: 600; color: var(--color-primary);">Conversational</span>
                                    </div>
                                    <p style="font-size: 0.875rem; color: var(--color-text-muted); line-height: 1.5; margin-left: 1.75rem;">
                                        “Honestly, Jenny’s always been the one I can call when life’s a mess. We mix a lot of laughter with some serious talks—sometimes all at once.”
                                    </p>
                                </label>

                                <label class="style-option" style="cursor: pointer; display: block; padding: 1rem; border: 1px solid var(--color-border); border-radius: 0.5rem; transition: all 0.2s;">
                                    <div class="flex items-center gap-sm" style="margin-bottom: 0.5rem;">
                                        <input type="radio" name="writingStyle" value="humorous">
                                        <span style="font-weight: 600; color: var(--color-primary);">Humorous</span>
                                    </div>
                                    <p style="font-size: 0.875rem; color: var(--color-text-muted); line-height: 1.5; margin-left: 1.75rem;">
                                        “Jenny and I? We’re like two peas in a pod, except we argue about which pea is actually the weird one. But hey, that’s friendship for you!”
                                    </p>
                                </label>

                                <label class="style-option" style="cursor: pointer; display: block; padding: 1rem; border: 1px solid var(--color-border); border-radius: 0.5rem; transition: all 0.2s;">
                                    <div class="flex items-center gap-sm" style="margin-bottom: 0.5rem;">
                                        <input type="radio" name="writingStyle" value="thematic">
                                        <span style="font-weight: 600; color: var(--color-primary);">Thematic</span>
                                    </div>
                                    <p style="font-size: 0.875rem; color: var(--color-text-muted); line-height: 1.5; margin-left: 1.75rem;">
                                        “Our friendship stands as a pillar in my life, woven with countless shared moments of laughter, growth, and unspoken understanding.”
                                    </p>
                                </label>

                            </div>
                        </div>
                    </div>

                    ${(state.current_stage === '1' || !(state.journeyProgress && state.journeyProgress.setup)) ? `
                    <div class="flex justify-end gap-md">
                        <button type="button" id="cancelBtn" class="btn" style="color: var(--color-text-muted);">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Setup</button>
                    </div>
                    ` : ''}
                    </fieldset>
                </form>
            </div>
        </main>
    `;

    // Logic
    const form = container.querySelector('#setupForm');
    const boundariesRadios = container.querySelectorAll('input[name="boundaries"]');
    const boundariesText = container.querySelector('#boundariesText');
    const dobInput = container.querySelector('input[name="dob"]');
    const decadesInputs = container.querySelector('#decadesInputs');

    // Section 2: Life by the Decade Logic
    function updateDecadeInputs(dob) {
        if (!dob) return;

        const birthDate = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        const eras = [
            { id: '0-20', label: 'Childhood & Adolescence (0-20)', placeholder: 'School, family life, early interests...', minAge: 0 },
            { id: '20-30', label: 'Early Adulthood (20-30)', placeholder: 'First jobs, moving out, finding yourself, travel...', minAge: 20 },
            { id: '30-50', label: 'The Middle Years (30-50)', placeholder: 'Career peaks, raising family, big changes, challenges...', minAge: 30 },
            { id: '50+', label: 'Later Years / Current Chapter (50+)', placeholder: 'Retirement, grandparenthood, new passions, reflection...', minAge: 50 }
        ];

        const relevantEras = eras.filter(era => age >= era.minAge);

        decadesInputs.innerHTML = relevantEras.map(era => `
            <div class="input-group">
                <label class="input-label" style="color: var(--color-primary);">${era.label}</label>
                <textarea class="input-field decade-input" name="era_${era.id}" rows="3" placeholder="${era.placeholder}"></textarea>
            </div>
        `).join('');

        // Restore any existing data if available
        if (state.setupData && state.setupData.eras) {
            relevantEras.forEach(era => {
                const field = container.querySelector(`[name="era_${era.id}"]`);
                if (field && state.setupData.eras[era.id]) {
                    field.value = state.setupData.eras[era.id];
                }
            });
        }
    }

    if (dobInput) {
        dobInput.addEventListener('change', (e) => updateDecadeInputs(e.target.value));
        // Initial trigger if DOB exists
        if (state.setupData && state.setupData.dob) {
            updateDecadeInputs(state.setupData.dob);
        }
    }

    // Persona Selection Highlighting (Multi-select)
    const personaOptions = container.querySelectorAll('.persona-option');
    personaOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const checkbox = option.querySelector('input[type="checkbox"]');

            // If the user clicked the div but not the checkbox itself, toggle it
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }

            // Update styles
            if (checkbox.checked) {
                option.style.borderColor = 'var(--color-primary)';
                option.style.backgroundColor = 'rgba(219, 234, 254, 0.3)';
            } else {
                option.style.borderColor = 'var(--color-border)';
                option.style.backgroundColor = 'transparent';
            }
        });
    });

    // Style Selection Highlighting
    const styleOptions = container.querySelectorAll('.style-option');
    styleOptions.forEach(option => {
        option.addEventListener('click', () => {
            styleOptions.forEach(opt => {
                opt.style.borderColor = 'var(--color-border)';
                opt.style.backgroundColor = 'transparent';
            });
            option.style.borderColor = 'var(--color-primary)';
            option.style.backgroundColor = 'rgba(219, 234, 254, 0.3)';
            option.querySelector('input[type="radio"]').checked = true;
        });
    });

    // Conditional Logic for Boundaries
    boundariesRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            boundariesText.style.display = e.target.value === 'specific' ? 'block' : 'none';
        });
    });

    // Pre-fill Form if data exists
    if (state.setupData) {
        const d = state.setupData;
        if (d.fullName) form.fullName.value = d.fullName;
        if (d.dob) form.dob.value = d.dob;
        if (d.pob) form.pob.value = d.pob;
        if (d.residence) form.residence.value = d.residence;
        if (d.maritalStatus) form.maritalStatus.value = d.maritalStatus;
        if (d.children) form.children.value = d.children;
        if (d.significantOthers) form.significantOthers.value = d.significantOthers;
        if (d.placesLived) form.placesLived.value = d.placesLived;
        if (d.specificMemories) form.specificMemories.value = d.specificMemories;

        if (d.mainThemes && Array.isArray(d.mainThemes)) {
            d.mainThemes.forEach(val => {
                const checkbox = container.querySelector(`input[name="mainThemes"][value="${val}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    checkbox.closest('.persona-option').style.borderColor = 'var(--color-primary)';
                    checkbox.closest('.persona-option').style.backgroundColor = 'rgba(219, 234, 254, 0.3)';
                }
            });
        }

        if (d.boundaries) {
            const radio = container.querySelector(`input[name="boundaries"][value="${d.boundaries}"]`);
            if (radio) {
                radio.checked = true;
                if (d.boundaries === 'specific') {
                    boundariesText.style.display = 'block';
                    boundariesText.value = d.boundariesText || '';
                }
            }
        }

        if (d.writingStyle) {
            const radio = container.querySelector(`input[name="writingStyle"][value="${d.writingStyle}"]`);
            if (radio) {
                radio.checked = true;
                radio.closest('.style-option').style.borderColor = 'var(--color-primary)';
                radio.closest('.style-option').style.backgroundColor = 'rgba(219, 234, 254, 0.3)';
            }
        }
    }

    // Navigation
    container.querySelector('#backBtn').addEventListener('click', () => {
        navigateTo('dashboard');
    });

    const cancelBtn = container.querySelector('#cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            navigateTo('dashboard');
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Collect Data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Handle Eras (collected from textareas named era_XX)
        const eras = {};
        container.querySelectorAll('.decade-input').forEach(ta => {
            const eraId = ta.name.replace('era_', '');
            eras[eraId] = ta.value;
        });
        data.eras = eras;

        // Handle Multi-select Main Themes
        data.mainThemes = Array.from(container.querySelectorAll('input[name="mainThemes"]:checked')).map(cb => cb.value);

        // Handle Boundaries Text
        data.boundariesText = boundariesText.value || '';

        // Show Loading State (Full Page)
        container.querySelector('#setupContent').style.display = 'none';
        container.querySelector('#setupLoading').style.display = 'block';
        window.scrollTo(0, 0);

        // Inject User Info
        if (state.user) {
            data.userName = state.user.id;
            data.userEmail = state.user.email;
        }

        try {
            // Call API
            const plan = await ApiService.generateInterviewPlan(data);
            console.log("Received Interview Plan from n8n:", plan);

            // Validate Response
            if (!plan || !plan.chapters || !Array.isArray(plan.chapters) || plan.chapters.length === 0) {
                console.error("Invalid plan structure:", plan);
                throw new Error("Received response from server, but no chapters were generated.");
            }

            // Update State
            state.setupData = data;
            state.interviewPlan = plan; // Save the generated plan
            state.chapters = plan.chapters; // Store chapters for easy access
            if (state.user) state.user.name = data.fullName;
            state.journeyProgress.setup = true;

            // Save to backend
            try {
                await ApiService.saveProgress(state.user.id, '2');
                state.current_stage = '2';
            } catch (err) {
                console.error("Failed to save setup progress to backend:", err);
            }

            // Save locally
            saveAppState();

            // Navigate
            navigateTo('interview-plan'); // Go directly to the plan
        } catch (error) {
            console.error(error);
            // Restore View
            container.querySelector('#setupLoading').style.display = 'none';
            container.querySelector('#setupContent').style.display = 'block';

            // Show inline error
            const errorDiv = container.querySelector('#setupError');
            errorDiv.textContent = error.message || 'Something went wrong generating the plan. Please check your connection and try again.';
            errorDiv.style.display = 'block';
            window.scrollTo(0, 0);
        }
    });




    return container;
}
