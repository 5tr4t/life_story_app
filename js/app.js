/**
 * FondMemoirs Application - Main Logic
 */

// State Management
const defaultState = {
    user: null, // { name, email }
    currentView: 'login',
    journeyProgress: {
        setup: false,
        questions: false,
        recording: false,
        review: false
    },
    setupData: {},
    current_stage: '1',
    clarificationSubmissionTimes: {}, // Map of chapterNum -> timestamp
    writingStyleSet: false,
    pendingDraftFeedback: null, // { chapterNumber, feedback }
    initialAuthData: {} // { mode, code }
};

// Load from localStorage
const savedState = localStorage.getItem('lifeStoryState');
const state = savedState ? { ...defaultState, ...JSON.parse(savedState) } : defaultState;

// Parse URL parameters for redemption code
const urlParams = new URLSearchParams(window.location.search);
const urlCode = urlParams.get('code');
if (urlCode) {
    state.initialAuthData = {
        mode: 'signup',
        code: urlCode
    };
    // Clear the URL parameter so it doesn't persist on refresh
    window.history.replaceState({}, document.title, window.location.pathname);
}

// Don't restore currentView from localStorage - always start fresh
// If user is logged in, go to dashboard; otherwise login
async function initSession() {
    // 1. Check Supabase session first
    if (!window.supabaseClient) {
        state.currentView = 'login';
        render();
        return;
    }

    const { data: { session } } = await window.supabaseClient.auth.getSession();

    if (session) {
        console.log("Restoring Supabase session for:", session.user.email);

        // User is logged in, but we need their memoirs to decide where to go
        try {
            const memoirs = await ApiService.getMemoirsByEmail(session.user.email, session.user.id);

            if (memoirs && memoirs.length > 0) {
                state.user = {
                    email: session.user.email,
                    name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
                    last_auth: 'supabase'
                };

                // Resume Logic: Check for pending feedback that needs style tuner
                if (state.pendingDraftFeedback && !state.writingStyleSet) {
                    console.log("Resuming pending feedback with Style Tuner");
                    navigateTo('writing-style');
                    return;
                }

                if (memoirs.length === 1) {
                    await selectProject(memoirs[0]);
                } else {
                    // Force project selection if multiple memoirs exist
                    state.availableMemoirs = memoirs;
                    navigateTo('project-selector');
                }
            } else {
                // No memoirs, redirect to redeem or login
                state.currentView = 'login';
            }
        } catch (err) {
            console.error("Session restoration failed:", err);
            state.currentView = 'login';
        }
    } else if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.user) {
            state.currentView = 'dashboard';
        } else {
            state.currentView = 'login';
        }
    } else {
        state.currentView = 'login';
    }

    render();
}
initSession();

// Save State Helper - Don't save currentView (it's session-only)
function saveAppState() {
    const { currentView, ...stateToPersist } = state;
    localStorage.setItem('lifeStoryState', JSON.stringify(stateToPersist));
}

// Router
function navigateTo(view) {
    state.currentView = view;
    render();
}

// Toast Notification System
function showToast(message, type = 'error', duration = 5000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // SVG icons based on type
    const icons = {
        error: `<svg style="color: #ef4444; width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        success: `<svg style="color: #10b981; width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`,
        info: `<svg style="color: #3b82f6; width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    };

    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">${message}</div>
        <button class="toast-close">
            <svg style="width: 1rem; height: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
    `;

    container.appendChild(toast);

    const removeToast = () => {
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => toast.remove());
    };

    toast.querySelector('.toast-close').addEventListener('click', removeToast);

    if (duration > 0) {
        setTimeout(removeToast, duration);
    }
}

// Main Render Function
function render() {
    const app = document.getElementById('app');
    app.innerHTML = ''; // Clear current content

    // If not logged in and trying to access protected route, redirect to login
    if (!state.user && state.currentView !== 'login' && state.currentView !== 'signup') {
        navigateTo('login');
        return;
    }

    switch (state.currentView) {
        case 'login':
            app.appendChild(renderLogin(navigateTo, loginUser, signupUser, showToast, state.initialAuthData));
            break;
        case 'project-selector':
            app.appendChild(renderProjectSelector(navigateTo, state, selectProject));
            break;
        case 'redeem-code':
            app.appendChild(renderRedeemCode(navigateTo, state, redeemNewCode, showToast));
            break;
        case 'dashboard':
            app.appendChild(renderDashboard(navigateTo, state));
            break;
        case 'setup':
            app.appendChild(renderSetup(navigateTo, state));
            break;
        case 'interview-plan':
            app.appendChild(renderInterviewPlan(navigateTo, state));
            break;
        case 'questionnaire':
            app.appendChild(renderQuestionnaire(navigateTo, state));
            break;
        case 'interviews':
            app.appendChild(renderInterviews(navigateTo, state));
            break;
        case 'chapter-questions':
            app.appendChild(renderChapterQuestions(navigateTo, state));
            break;
        case 'clarifications':
            app.appendChild(renderClarifications(navigateTo, state));
            break;
        case 'review-draft':
            app.appendChild(renderReviewDraft(navigateTo, state));
            break;
        case 'writing-style':
            app.appendChild(renderWritingStyle(navigateTo, state));
            break;
        case 'recorder':
            app.appendChild(renderRecorder(navigateTo));
            break;
        default:
            app.innerHTML = '<h1>404 - Page Not Found</h1>';
    }
}

// Auth Logic
async function loginUser(email, password, onComplete) {
    try {
        console.log(`Attempting Supabase login for ${email}`);

        if (!window.supabaseClient) {
            throw new Error("Authentication service unavailable.");
        }

        // 1. Authenticate with Supabase
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Supabase Auth error:', error.message);
            if (onComplete) onComplete(`Login failed: ${error.message}`);
            return;
        }

        console.log('Supabase login successful, fetching memoirs...');

        // 2. Fetch available memoirs for this email directly from Supabase (via ApiService)
        // Pass the user ID retrieved from login to query by profile_id
        const memoirs = await ApiService.getMemoirsByEmail(email, data.user.id);

        if (!memoirs || memoirs.length === 0) {
            if (onComplete) onComplete("Login successful, but no memoirs were found for this account. Please use a redemption code to create one.");
            // We keep the session, but user is "stuck" until they redeem
            state.user = { email, name: email.split('@')[0] };
            navigateTo('redeem-code');
            return;
        }

        // Store user info
        state.user = { email, name: email.split('@')[0] };

        if (memoirs.length === 1) {
            // Auto-login to the only project
            await selectProject(memoirs[0]);
        } else {
            // Force selection screen for multiple memoirs
            state.availableMemoirs = memoirs;
            navigateTo('project-selector');
        }

        if (onComplete) onComplete(null);

    } catch (error) {
        console.error('Login process failed:', error);
        if (onComplete) onComplete('An unexpected error occurred during login. Please try again.');
    }
}

async function signupUser(name, email, password, code, memoirName, onComplete) {
    try {
        console.log(`Signing up ${email} with code ${code}`);

        // 1. Register with backend
        const result = await ApiService.registerWithCode({
            name,
            email,
            password,
            redemptionCode: code,
            memoirName
        });

        // 2. If successful, backend should return the new memoir ID
        const memoirId = result.memoirId || `${email.split('@')[0]}_${Date.now()}`;

        state.user = { id: memoirId, name, email, memoirName };
        saveAppState();

        if (onComplete) onComplete(null);

        // New users always go to setup
        navigateTo('setup');

    } catch (error) {
        console.error('Signup failed:', error);
        let errorMsg = 'Signup failed. Please try again.';

        // Smart error handling for duplicate email
        const errorStr = error.message || '';
        if (errorStr.includes('already registered') ||
            errorStr.includes('already exists') ||
            errorStr.includes('Conflict') ||
            errorStr.includes('409')) {
            errorMsg = "This email is already registered. Please Sign In to your account to add this new memoir.";
        } else if (errorStr.includes('400') || errorStr.toLowerCase().includes('invalid code')) {
            errorMsg = "Invalid Redemption Code. Please check your code and try again.";
        }

        if (onComplete) onComplete(errorMsg);
    }
}

async function redeemNewCode(code, memoirName) {
    try {
        console.log(`Redeeming new code for existing user: ${state.user.email}`);

        const result = await ApiService.redeemAdditionalCode(code, memoirName);

        // n8n should return the new memoir ID
        const memoirId = result.memoirId || result.id;

        // Refresh memoir list
        state.availableMemoirs = await ApiService.getMemoirsByEmail(state.user.email);

        // Select the new one immediately as requested
        if (memoirId) {
            await selectProject({ id: memoirId, name: memoirName });
        } else {
            // Fallback: refresh and go to selector
            navigateTo('project-selector');
        }

    } catch (error) {
        console.error('Redemption failed:', error);
        const errorStr = error.message || '';
        let errorMsg = "Failed to add memoir. Please try again.";

        if (errorStr.includes('400') || errorStr.toLowerCase().includes('invalid code')) {
            errorMsg = "Invalid Redemption Code. Please check your code and try again.";
        }

        if (typeof showToast === 'function') {
            showToast(errorMsg, 'error');
        } else {
            alert(errorMsg);
        }
    }
}

async function selectProject(memoir) {
    try {
        console.log(`Selecting project: ${memoir.name} (${memoir.id})`);

        // Set unique ID for n8n tracking
        state.user.id = memoir.id;
        state.user.memoirName = memoir.name;

        // Reset session-specific state
        state.chapters = [];
        state.answers = {};
        state.setupData = {};
        state.current_stage = '1';
        state.journeyProgress = {
            setup: false,
            questions: false,
            recording: false,
            review: false
        };
        state.interviewPlan = null;
        state.clarificationSubmissionTimes = {};

        // Save immediately
        saveAppState();

        // Load progress for this specific ID
        await loadUserProgress(state.user.id);

        navigateTo('dashboard');
    } catch (error) {
        console.error('Failed to load memoir:', error);
        alert('Could not load that memoir. Please try again.');
    }
}

// Helper to load progress (extracted from old loginUser)
async function loadUserProgress(userId) {
    const response = await ApiService.getUserProgress(userId);
    console.log('User progress raw:', response);

    // Handle array response format from n8n
    const progress = Array.isArray(response) ? response[0] : response;

    if (progress) {
        state.current_stage = progress.current_stage || state.current_stage || '1';
        // Chapters might be at root or under data property
        state.chapters = progress.chapters || (progress.data && progress.data.chapters) || state.chapters || [];
        state.answers = progress.answers || (progress.data && progress.data.answers) || {};
        state.setupData = progress.setup_data || (progress.data && progress.data.setup_data) || {};

        if (progress.outline_approved !== undefined) {
            state.journeyProgress.outlineApproved = progress.outline_approved;
        }

        // IMPORTANT: Sync writingStyleSet with backend data
        // If DB was reset, this will be undefined/false, forcing the Style Tuner again
        state.writingStyleSet = progress.writing_style_set || (progress.data && progress.data.writing_style_set) || false;

        // Update journey flags based on stage
        const stageNum = parseFloat(state.current_stage);
        if (stageNum >= 2) state.journeyProgress.setup = true;
        if (stageNum >= 3) {
            state.journeyProgress.setup = true;
            state.journeyProgress.questions = true;
        }
    }
}

// Helper to determine route from stage
function getRouteFromStage(stage) {
    if (!stage || stage === '1') return 'setup';
    if (stage === '2') return 'interview-plan';
    if (stage.startsWith('3.')) return 'interviews';
    if (stage === '4') return 'review-draft';
    if (stage === '5') return 'dashboard'; // Completed
    return 'dashboard';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    render();
});
