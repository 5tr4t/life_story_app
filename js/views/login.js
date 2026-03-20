function renderLogin(navigateTo, loginUser, signupUser, showToast, initialData = {}) {
    const container = document.createElement('div');
    container.className = 'container flex items-center justify-center';
    container.style.minHeight = '100vh';

    // State to track current mode
    let isLoginMode = initialData.mode === 'signup' ? false : true;

    function updateUI() {
        const title = container.querySelector('#authTitle');
        const subtitle = container.querySelector('#authSubtitle');
        const nameGroup = container.querySelector('#nameGroup');
        const signupExtras = container.querySelector('#signupExtras');
        const submitBtn = container.querySelector('#submitBtn');
        const toggleText = container.querySelector('#toggleText');
        const toggleLink = container.querySelector('#toggleLink');
        const nameInput = container.querySelector('input[name="fullName"]');

        // Pre-fill code if provided and in signup mode
        const codeInput = container.querySelector('input[name="redemptionCode"]');
        if (!isLoginMode && initialData.code && codeInput) {
            codeInput.value = initialData.code;
        }

        // Show/hide forgot password link based on mode
        const forgotWrapper = container.querySelector('#forgotPasswordLinkWrapper');
        if (forgotWrapper) {
            forgotWrapper.style.display = isLoginMode ? 'block' : 'none';
        }

        if (isLoginMode) {
            title.textContent = 'Welcome Back';
            subtitle.textContent = 'Sign in to continue your journey';
            nameGroup.style.display = 'none';
            signupExtras.style.display = 'none';
            nameInput.removeAttribute('required');
            submitBtn.textContent = 'Sign In';
            toggleText.textContent = "Don't have an account?";
            toggleLink.textContent = 'Start your journey';
        } else {
            title.textContent = 'Create Account';
            subtitle.textContent = 'Start your FondMemoirs journey today';
            nameGroup.style.display = 'block';
            signupExtras.style.display = 'block';
            nameInput.setAttribute('required', 'true');
            submitBtn.textContent = 'Sign Up';
            toggleText.textContent = 'Already have an account?';
            toggleLink.textContent = 'Sign In';
        }
    }

    container.innerHTML = `
        <div class="card" style="width: 100%; max-width: 450px;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h1 id="authTitle" style="margin-bottom: 0.5rem;">Welcome Back</h1>
                <p id="authSubtitle" style="color: var(--color-text-muted);">Sign in to continue your journey</p>
            </div>
            
            <form id="loginForm">
                <div id="nameGroup" class="input-group" style="display: none;">
                    <label class="input-label">Full Name</label>
                    <input type="text" name="fullName" class="input-field" placeholder="First and Last Name">
                </div>

                <div class="input-group">
                    <label class="input-label">Email</label>
                    <input type="email" name="email" class="input-field" placeholder="name@example.com" required>
                </div>
                
                <div class="input-group">
                    <label class="input-label">Password</label>
                    <div class="password-toggle-wrapper">
                        <input type="password" name="password" class="input-field" placeholder="••••••••" required>
                        <button type="button" class="password-toggle-btn" tabindex="-1">
                            <svg class="eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </button>
                    </div>
                </div>

                <div id="signupExtras" style="display: none;">
                    <div class="input-group">
                        <label class="input-label">Confirm Password</label>
                        <div class="password-toggle-wrapper">
                            <input type="password" name="confirmPassword" class="input-field" placeholder="••••••••">
                            <button type="button" class="password-toggle-btn" tabindex="-1">
                                <svg class="eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="input-group" style="margin-top: 1rem;">
                        <label class="input-label">Redemption Code</label>
                        <input type="text" name="redemptionCode" class="input-field" placeholder="XXXX-XXXX-XXXX">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Memoir Name</label>
                        <input type="text" name="memoirName" class="input-field" placeholder="e.g. My Childhood, Dad's Story">
                    </div>
                </div>

                <button type="submit" id="submitBtn" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Sign In</button>
            </form>
            
            <div id="forgotPasswordLinkWrapper" style="margin-top: 1rem; text-align: center;">
                <button id="forgotPasswordBtn" style="background: none; border: none; font-family: inherit; color: var(--color-text-muted); font-size: 0.875rem; cursor: pointer; text-decoration: underline;">Forgot Password?</button>
            </div>
            
            <div style="margin-top: 1.5rem; text-align: center; font-size: 0.875rem;">
                <span id="toggleText" style="color: var(--color-text-muted);">Don't have an account?</span>
                <a href="#" id="toggleLink" style="color: var(--color-primary); font-weight: 500;">Start your journey</a>
            </div>
        </div>
    `;

    // Helper to initialize password visibility toggles
    function initPasswordToggles() {
        container.querySelectorAll('.password-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = btn.parentElement.querySelector('input');
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';

                // Update SVG icon
                btn.innerHTML = isPassword
                    ? `<svg class="eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>`
                    : `<svg class="eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;
            });
        });
    }

    // Attach Event Listeners
    const form = container.querySelector('#loginForm');
    const toggleLink = container.querySelector('#toggleLink');
    const forgotPasswordBtn = container.querySelector('#forgotPasswordBtn');

    // Initialize toggles
    initPasswordToggles();

    // Set initial UI state
    updateUI();

    toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        updateUI();
        // Re-init toggles just in case (though they should persist in the DOM)
        initPasswordToggles();
    });

    forgotPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Forgot password button clicked, navigating...');
        navigateTo('forgot-password');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = container.querySelector('input[name="email"]').value;
        const password = container.querySelector('input[name="password"]').value;

        if (isLoginMode) {
            loginUser(email, password, (err) => {
                if (err) {
                    showToast(err, 'error');
                }
            });
        } else {
            const name = container.querySelector('input[name="fullName"]').value;
            const confirmPassword = container.querySelector('input[name="confirmPassword"]').value;
            const code = container.querySelector('input[name="redemptionCode"]').value;
            const memoirName = container.querySelector('input[name="memoirName"]').value;

            if (password !== confirmPassword) {
                showToast("Passwords do not match. Please try again.", 'error');
                return;
            }

            if (!code || !memoirName) {
                showToast("Please provide both a redemption code and a name for your memoir.", 'error');
                return;
            }

            signupUser(name, email, password, code, memoirName, (err) => {
                if (err) {
                    if (err.includes('already registered')) {
                        // For this specific error, we still want to give them the click option, 
                        // so we can use a callback or just tell them to flip modes.
                        showToast(`${err} Click 'Sign In' below to switch.`, 'info', 10000);
                    } else {
                        showToast(err, 'error');
                    }
                }
            });
        }
    });

    return container;
}

/**
 * Render a screen to select which project/memoir to work on
 */
function renderProjectSelector(navigateTo, state, selectProject) {
    const container = document.createElement('div');
    container.className = 'container flex items-center justify-center';
    container.style.minHeight = '100vh';

    const memoirs = state.availableMemoirs || [];

    container.innerHTML = `
        <div class="card" style="width: 100%; max-width: 500px;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h1 style="margin-bottom: 0.5rem;">Select Memoir</h1>
                <p style="color: var(--color-text-muted);">Which story are you working on today?</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${memoirs.map(memoir => `
                    <button class="project-btn card" data-id="${memoir.id}" style="
                        text-align: left; 
                        padding: 1.5rem; 
                        cursor: pointer; 
                        transition: all 0.2s;
                        border: 1px solid var(--color-border);
                        background: white;
                        width: 100%;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <div>
                            <div style="font-weight: 600; font-size: 1.125rem; color: var(--color-primary);">${memoir.name}</div>
                            <div style="font-size: 0.875rem; color: var(--color-text-muted); margin-top: 0.25rem;">
                                ${memoir.status || 'In Progress'}
                            </div>
                        </div>
                        <div style="color: var(--color-accent); font-size: 1.5rem;">→</div>
                    </button>
                `).join('')}
            </div>

            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border); text-align: center;">
                <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 1rem;">
                    Want to start another story?
                </p>
                <button id="addMemoirBtn" class="btn btn-outline" style="width: 100%;">+ Redeem Another Code</button>
            </div>

            <button id="logoutBtn" class="btn" style="width: 100%; margin-top: 1rem; color: #ef4444;">Sign Out</button>
        </div>

        <style>
            .project-btn:hover {
                border-color: var(--color-accent);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }
        </style>
    `;

    container.querySelectorAll('.project-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const memoir = memoirs.find(m => m.id === id);
            selectProject(memoir);
        });
    });

    container.querySelector('#addMemoirBtn').addEventListener('click', () => {
        navigateTo('redeem-code');
    });

    container.querySelector('#logoutBtn').addEventListener('click', () => {
        state.user = null;
        if (window.saveAppState) window.saveAppState();
        window.location.reload();
    });

    return container;
}

/**
 * Render a simple screen for existing users to add a new memoir code
 */
function renderRedeemCode(navigateTo, state, redeemNewCode, showToast) {
    const container = document.createElement('div');
    container.className = 'container flex items-center justify-center';
    container.style.minHeight = '100vh';

    container.innerHTML = `
        <div class="card" style="width: 100%; max-width: 450px;">
            <div style="margin-bottom: 2rem; text-align: center;">
                <h1 style="margin-bottom: 0.5rem;">Add New Memoir</h1>
                <p style="color: var(--color-text-muted);">Enter a new code to start another story.</p>
            </div>

            <form id="redeemForm">
                <div class="input-group">
                    <label class="input-label">Redemption Code</label>
                    <input type="text" name="redemptionCode" class="input-field" placeholder="XXXX-XXXX-XXXX" required>
                </div>
                <div class="input-group">
                    <label class="input-label">Memoir Name</label>
                    <input type="text" name="memoirName" class="input-field" placeholder="e.g. My Childhood, Dad's Story" required>
                </div>

                <div class="flex gap-sm" style="margin-top: 2rem;">
                    <button type="button" id="cancelBtn" class="btn" style="flex: 1;">Cancel</button>
                    <button type="submit" class="btn btn-primary" style="flex: 2;">Add Memoir</button>
                </div>
            </form>
        </div>
    `;

    container.querySelector('#redeemForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const code = container.querySelector('input[name="redemptionCode"]').value;
        const name = container.querySelector('input[name="memoirName"]').value;
        redeemNewCode(code, name);
    });

    container.querySelector('#cancelBtn').addEventListener('click', () => {
        // Go back to where we came from (Dashboard or Selector)
        if (state.availableMemoirs && state.availableMemoirs.length > 0) { // Changed from > 1 to > 0 to handle case where user has 1 memoir and wants to add another
            navigateTo('project-selector');
        } else {
            navigateTo('dashboard'); // If no memoirs, go to dashboard (which will likely redirect to project selector if no current project)
        }
    });

    return container;
}

/**
 * Render a screen for users who forgot their password
 */
function renderForgotPassword(navigateTo, showToast) {
    const container = document.createElement('div');
    container.className = 'container flex items-center justify-center';
    container.style.minHeight = '100vh';

    container.innerHTML = `
        <div class="card" style="width: 100%; max-width: 450px;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h1 style="margin-bottom: 0.5rem;">Reset Password</h1>
                <p style="color: var(--color-text-muted);">Enter your email to receive a reset link.</p>
            </div>

            <form id="forgotForm">
                <div class="input-group">
                    <label class="input-label">Email</label>
                    <input type="email" name="email" class="input-field" placeholder="name@example.com" required>
                </div>

                <button type="submit" id="submitBtn" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Send Reset Link</button>
                <button type="button" id="backBtn" class="btn" style="width: 100%; margin-top: 0.5rem; background: transparent; border: 1px solid var(--color-border); color: var(--color-text-main);">Back to Sign In</button>
            </form>

            <div id="successMessage" style="display: none; text-align: center; margin-top: 2rem;">
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <p style="margin-bottom: 1rem; font-weight: 500;">Check your email!</p>
                    <p style="font-size: 0.875rem;">We've sent a link to reset your password. Please note that the email will arrive from <strong>'Supabase Auth'</strong> (noreply@mail.supabase.co).</p>
                </div>
                <button id="returnBtn" class="btn btn-primary" style="width: 100%;">Return to Sign In</button>
            </div>
        </div>
    `;

    const form = container.querySelector('#forgotForm');
    const successMessage = container.querySelector('#successMessage');
    const backBtn = container.querySelector('#backBtn');
    const returnBtn = container.querySelector('#returnBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = container.querySelector('input[name="email"]').value;
        const submitBtn = container.querySelector('#submitBtn');
        const originalText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            await ApiService.requestPasswordReset(email);
            form.style.display = 'none';
            successMessage.style.display = 'block';
        } catch (err) {
            showToast(err.message || 'Error sending reset link', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    backBtn.addEventListener('click', () => navigateTo('login'));
    returnBtn.addEventListener('click', () => navigateTo('login'));

    return container;
}

/**
 * Render a screen to update the password (called after clicking email link)
 */
function renderUpdatePassword(navigateTo, showToast) {
    const container = document.createElement('div');
    container.className = 'container flex items-center justify-center';
    container.style.minHeight = '100vh';

    container.innerHTML = `
        <div class="card" style="width: 100%; max-width: 450px;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h1 style="margin-bottom: 0.5rem;">New Password</h1>
                <p style="color: var(--color-text-muted);">Create a secure password for your account.</p>
            </div>

            <form id="resetForm">
                <div class="input-group">
                    <label class="input-label">New Password</label>
                    <input type="password" name="password" class="input-field" placeholder="••••••••" required>
                </div>
                <div class="input-group">
                    <label class="input-label">Confirm New Password</label>
                    <input type="password" name="confirmPassword" class="input-field" placeholder="••••••••" required>
                </div>

                <button type="submit" id="submitBtn" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Update Password</button>
            </form>
        </div>
    `;

    const form = container.querySelector('#resetForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = container.querySelector('input[name="password"]').value;
        const confirmPassword = container.querySelector('input[name="confirmPassword"]').value;
        const submitBtn = container.querySelector('#submitBtn');

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';

        try {
            await ApiService.updatePassword(password);
            showToast('Password updated successfully! Please sign in.', 'success');
            setTimeout(() => {
                navigateTo('login');
            }, 2000);
        } catch (err) {
            showToast(err.message || 'Error updating password', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Password';
        }
    });

    return container;
}
