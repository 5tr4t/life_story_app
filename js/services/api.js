console.log('%c API Service v3 Loaded - Feedback Webhook Active ', 'background: #222; color: #bada55');
/**
 * API Service for Life Story App
 * Handles communication with n8n backend
 */

const API_CONFIG = {
    // Switch to production URL by removing '-test' when ready
    // WEBHOOK_URL: 'https://str4t.app.n8n.cloud/webhook/0aa27b2b-2ef5-42bf-a957-f13202fda032',

    // Backend integration webhooks (to be provided by user)
    WEBHOOK_URL: 'https://primary-production-adbb0.up.railway.app/webhook/0aa27b2b-2ef5-42bf-a957-f13202fda032',
    PROGRESS_WEBHOOK: 'https://primary-production-adbb0.up.railway.app/webhook/4447dafd-baeb-4627-b7d9-be4f1cc3ebe6',
    SAVE_PROGRESS_WEBHOOK: 'https://primary-production-adbb0.up.railway.app/webhook/0c22a223-238a-4561-995f-04c01877b863',
    CHAPTERS_WEBHOOK: 'https://primary-production-adbb0.up.railway.app/webhook/b3238b69-71cf-41c3-aa2c-f79056fe0f41',
    AUDIO_UPLOAD_WEBHOOK: 'https://primary-production-adbb0.up.railway.app/webhook/9b9f2972-601f-4a81-8f94-da2acb055e91',
    CLARIFICATIONS_WEBHOOK: 'https://primary-production-adbb0.up.railway.app/webhook/2531a5f8-05d1-4957-b401-60e6c3456249',
    FEEDBACK_WEBHOOK: 'https://primary-production-adbb0.up.railway.app/webhook/fba03e36-fd20-423d-9d47-fa64f030378d',
    CHAPTER_DRAFT_WEBHOOK: 'https://primary-production-adbb0.up.railway.app/webhook/a5697537-96de-4c05-821c-4ecd442f1af0',
    DRAFT_FEEDBACK_WEBHOOK: 'https://primary-production-adbb0.up.railway.app/webhook/eb9266f4-3ff1-4c93-9532-302201efb935',
    MEMOIRS_WEBHOOK: '',
    REGISTER_WEBHOOK: 'https://primary-production-adbb0.up.railway.app/webhook/46d8e10a-ad06-4990-8a50-dbeeb57f1181',
    STYLE_PERSONA_WEBHOOK: 'https://primary-production-adbb0.up.railway.app/webhook/1019140e-e429-4f1e-ba6f-bd0ba1f9eba6',


    // Old webhooks - n8n cloud
    //WEBHOOK_URL: 'https://str4t.app.n8n.cloud/webhook/0aa27b2b-2ef5-42bf-a957-f13202fda032',
    //PROGRESS_WEBHOOK: 'https://str4t.app.n8n.cloud/webhook/4447dafd-baeb-4627-b7d9-be4f1cc3ebe6',
    //SAVE_PROGRESS_WEBHOOK: 'https://str4t.app.n8n.cloud/webhook/0c22a223-238a-4561-995f-04c01877b863',
    //CHAPTERS_WEBHOOK: 'https://str4t.app.n8n.cloud/webhook/b3238b69-71cf-41c3-aa2c-f79056fe0f41',
    //AUDIO_UPLOAD_WEBHOOK: 'https://str4t.app.n8n.cloud/webhook/9b9f2972-601f-4a81-8f94-da2acb055e91',
    //CLARIFICATIONS_WEBHOOK: 'https://str4t.app.n8n.cloud/webhook/2531a5f8-05d1-4957-b401-60e6c3456249',
    //FEEDBACK_WEBHOOK: 'https://str4t.app.n8n.cloud/webhook/fba03e36-fd20-423d-9d47-fa64f030378d',
    //CHAPTER_DRAFT_WEBHOOK: 'https://str4t.app.n8n.cloud/webhook/a5697537-96de-4c05-821c-4ecd442f1af0',
    //DRAFT_FEEDBACK_WEBHOOK: 'https://str4t.app.n8n.cloud/webhook/eb9266f4-3ff1-4c93-9532-302201efb935',
    //MEMOIRS_WEBHOOK: 'https://str4t.app.n8n.cloud/webhook/your-memoirs-list-webhook',
    //REGISTER_WEBHOOK: 'https://str4t.app.n8n.cloud/webhook-test/46d8e10a-ad06-4990-8a50-dbeeb57f1181',

    // Supabase Configuration
    SUPABASE_URL: 'https://vxtoqmisqhvuhbhttgfj.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_WHIIjqWmeWFWT3e1d6wtNg_qVgeMrae'
};

// Initialize Supabase client
window.supabaseClient = window.supabase ? window.supabase.createClient(API_CONFIG.SUPABASE_URL, API_CONFIG.SUPABASE_ANON_KEY) : null;

const ApiService = {
    /**
     * Retrieves the Supabase session data.
     * @returns {Promise<Object|null>}
     * @private
     */
    async _getSession() {
        if (!window.supabaseClient) return null;
        try {
            const { data: { session } } = await window.supabaseClient.auth.getSession();
            return session;
        } catch (e) {
            console.error("Error getting Supabase session:", e);
            return null;
        }
    },

    /**
     * Internal fetch wrapper that injects the Supabase Authorization header if available.
     * @param {string} url 
     * @param {Object} options 
     * @returns {Promise<Response>}
     * @private
     */
    async _secureFetch(url, options = {}) {
        const session = await this._getSession();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (session) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
            const userId = session.user.id;

            // Always append userId as a query parameter for consistency
            const urlObj = new URL(url.startsWith('http') ? url : window.location.origin + url);
            if (!urlObj.searchParams.has('userId')) {
                urlObj.searchParams.append('userId', userId);
                url = urlObj.toString();
            }
        }

        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(`API Error [${response.status}]: ${errorText || response.statusText}`);
        }
        return response;
    },

    /**
     * Sends setup data to n8n to generate an interview plan
     * @param {Object} setupData - The user's setup data
     * @returns {Promise<Object>} - The generated interview plan
     */
    async generateInterviewPlan(setupData) {
        try {
            const response = await this._secureFetch(API_CONFIG.WEBHOOK_URL, {
                method: 'POST',
                body: JSON.stringify(setupData)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();

            console.log("Raw API Response:", JSON.stringify(data, null, 2)); // Debug log

            // Use shared normalization logic
            const normalized = this._normalizeChapters(data);

            if (normalized && normalized.chapters) {
                return normalized;
            }

            // If we get here, valid chapters weren't found
            console.error("Could not find chapters in data:", data);
            throw new Error(`Could not find chapters in response. received keys: ${Object.keys(data).join(', ')}`);
        } catch (error) {
            console.error('Failed to generate interview plan:', error);
            throw error;
        }
    },

    /**
     * Sends outline feedback to n8n
     * @param {Object} feedbackData - { approved: boolean, feedback: string, userName: string }
     * @returns {Promise<Object>}
     */
    async submitOutlineFeedback(feedbackData) {
        try {
            console.log("Submitting feedback to:", API_CONFIG.FEEDBACK_WEBHOOK, feedbackData);

            const response = await this._secureFetch(API_CONFIG.FEEDBACK_WEBHOOK, {
                method: 'POST',
                body: JSON.stringify(feedbackData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
            }

            // Handle potential non-JSON response from valid webhook
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                return { success: true, message: text };
            }

            // If the feedback was "Changes Requested" (approved: false), n8n might return new chapters
            if (!feedbackData.approved) {
                const normalized = this._normalizeChapters(data);
                if (normalized && normalized.chapters) {
                    return normalized;
                }
            }

            return data;

        } catch (error) {
            console.error('Failed to submit feedback:', error);
            throw error;
        }
    },

    /**
     * Internal helper to normalize n8n chapter response
     * Reuse logic from generateInterviewPlan
     */
    _normalizeChapters(data) {
        let chapters = [];
        const isChapter = (item) => item && (item.title || item.chapter_title || item.chapterTitle);

        // 1. Check if root is array
        if (Array.isArray(data)) {
            // Check if it's the n8n wrapper (Array of 1 item with data/body/json)
            if (data.length === 1 && data[0]) {
                const first = data[0];
                // Case A: [ { output: { chapters: [ ... ] } } ]
                if (first.output && first.output.chapters && Array.isArray(first.output.chapters)) {
                    chapters = first.output.chapters;
                }
                // Case B: [ { body: [ ...chapters... ] } ]
                else if (first.body && Array.isArray(first.body)) {
                    chapters = first.body;
                }
                // Case C: [ { chapters: [ ... ] } ]
                else if (first.chapters && Array.isArray(first.chapters)) {
                    chapters = first.chapters;
                }
                // Case D: [ { json: { chapters: [ ... ] } } ]
                else if (first.json && first.json.chapters && Array.isArray(first.json.chapters)) {
                    chapters = first.json.chapters;
                }
                // Case E: It IS the chapter list [ { chapter_title: ... } ]
                else if (first.chapter_title || first.title || first.chapterTitle) {
                    chapters = data;
                }
                // Case F: Generic unwrap
                else {
                    const keys = Object.keys(first);
                    for (const key of keys) {
                        if (first[key] && first[key].chapters && Array.isArray(first[key].chapters)) {
                            chapters = first[key].chapters;
                            break;
                        }
                        if (Array.isArray(first[key]) && first[key].length > 0 && isChapter(first[key][0])) {
                            chapters = first[key];
                            break;
                        }
                    }
                }
            }
            // If multiple items, check if they are chapters
            else if (data.length > 0 && isChapter(data[0])) {
                chapters = data;
            }
        }
        // 2. Check common wrapper keys
        else if (data.chapters && Array.isArray(data.chapters)) {
            chapters = data.chapters;
        } else if (data.data && Array.isArray(data.data)) {
            chapters = data.data;
        } else if (data.output && data.output.chapters) {
            chapters = data.output.chapters;
        } else {
            // 3. Last ditch
            const keys = Object.keys(data);
            for (const key of keys) {
                if (Array.isArray(data[key]) && data[key].length > 0 && isChapter(data[key][0])) {
                    chapters = data[key];
                    break;
                }
            }
        }

        if (Array.isArray(chapters)) {
            const normalizedChapters = chapters
                .filter(ch => ch && (typeof ch === 'object'))
                .map(ch => {
                    // Handle stringified clarifications from n8n
                    let clarifications = ch.clarifications || [];
                    if (typeof clarifications === 'string' && clarifications.trim() !== '') {
                        try {
                            clarifications = JSON.parse(clarifications);
                        } catch (e) {
                            console.warn("Failed to parse clarifications for chapter", ch.chapter_number, e);
                            clarifications = [];
                        }
                    }

                    return {
                        title: ch.title || ch.chapter_title || ch.chapterTitle || "Untitled Chapter",
                        description: ch.description || ch.chapter_description || ch.chapterDescription || "",
                        chapterNumber: ch.chapterNumber || ch.chapter_number || ch.chapterNo || null,
                        status: (ch.status || "").toLowerCase(),
                        questions: ch.questions || [],
                        clarifications: Array.isArray(clarifications) ? clarifications : [],
                        estimatedTime: ch.estimatedTime || "15 mins",
                        content: ch.content || "",
                        sections: ch.sections || [],
                        version: ch.version || "draft"
                    };
                });

            if (normalizedChapters.length > 0) {
                return {
                    chapters: normalizedChapters,
                    _debug_raw: data
                };
            }
        }
        return null;
    },

    /**
     * Fetches memoirs associated with a user's email directly from Supabase.
     * Replaces the n8n memoir list webhook for existing users.
     * @param {string} email - User's email address
     * @returns {Promise<Array>} - List of memoirs
     */
    async getMemoirsByEmail(email, userId = null) {
        try {
            console.log(`Fetching memoirs for ${email} (ID: ${userId}) directly from Supabase`);

            if (!window.supabaseClient) {
                throw new Error("Supabase client not initialized");
            }

            let query = window.supabaseClient.from('memoirs').select('*');

            if (userId) {
                query = query.eq('profile_id', userId);
            } else {
                query = query.eq('user_email', email);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Supabase query error:', error);
                return this._getMemoirsViaWebhook(email);
            }

            if (!data || data.length === 0) {
                console.warn('No memoirs found in Supabase for this user.');
                return this._getMemoirsViaWebhook(email);
            }

            // Map Supabase fields to app format
            return data.map(m => ({
                id: m.id || m.memoir_id,
                name: m.title || m.name || m.memoir_name,
                status: m.status || m.current_stage || 'In Progress'
            }));

        } catch (error) {
            console.error('Failed to get memoirs:', error);
            return this._getMemoirsViaWebhook(email);
        }
    },

    /**
     * Fallback helper to fetch via n8n webhook or return mock data
     * @private
     */
    async _getMemoirsViaWebhook(email) {
        try {
            console.warn(`Falling back to webhook/mock for ${email}`);

            // Check for mock data first on dev environments
            if (window.location.hostname === 'localhost' || window.location.protocol === 'file:') {
                return [
                    { id: `${email.split('@')[0]}_1`, name: "My Childhood", status: "In Progress" },
                    { id: `${email.split('@')[0]}_2`, name: "Dad's Story", status: "New" }
                ];
            }

            const url = `${API_CONFIG.MEMOIRS_WEBHOOK}?email=${encodeURIComponent(email)}`;
            const response = await this._secureFetch(url);
            return await response.json();
        } catch (error) {
            console.error('Fallback memoir fetch failed:', error);
            return [];
        }
    },

    async registerWithCode(regData) {
        try {
            console.log(`Registering with code: ${regData.redemptionCode}`);
            const response = await this._secureFetch(API_CONFIG.REGISTER_WEBHOOK, {
                method: 'POST',
                body: JSON.stringify(regData)
            });

            if (!response.ok) {
                let errorDetails = '';
                try {
                    const errorJson = await response.json();
                    errorDetails = errorJson.message || errorJson.error || JSON.stringify(errorJson);
                } catch (e) {
                    errorDetails = await response.text();
                }
                throw new Error(`Registration failed [${response.status}]: ${errorDetails || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    async getUserProgress(memoirId) {
        try {
            console.log(`Fetching progress for ${memoirId}`);

            // Default blank state for new/empty memoirs
            const defaultState = {
                current_stage: "1",
                journeyProgress: {
                    setup: false,
                    questions: false,
                    recording: false,
                    review: false
                },
                data: {}
            };

            const url = `${API_CONFIG.PROGRESS_WEBHOOK}?userName=${encodeURIComponent(memoirId)}`;
            const response = await this._secureFetch(url);

            // Handle empty/no-content response as valid new state
            const text = await response.text();
            if (!text || text.trim() === "" || text === "[]" || text === "{}") {
                console.log("Progress response empty, returning default state.");
                return defaultState;
            }

            let data;
            try {
                data = JSON.parse(text);
                // Handle n8n wrapper [ { json: ... } ]
                if (Array.isArray(data) && data.length > 0) {
                    data = data[0].json || data[0];
                }
            } catch (e) {
                console.warn("Could not parse progress JSON, using default:", text);
                return defaultState;
            }

            // Ensure we have a valid stage at minimum
            if (!data || !data.current_stage) {
                return defaultState;
            }

            // Normalize chapters if they exist in the progress data
            if (data.data && data.data.chapters) {
                const normalized = this._normalizeChapters(data.data.chapters);
                if (normalized) {
                    data.data.chapters = normalized.chapters;
                }
            }

            return data;
        } catch (error) {
            console.error('Failed to get progress:', error);
            // Don't throw here, return default to allow user to proceed
            return {
                current_stage: "1",
                journeyProgress: { setup: false, questions: false, recording: false, review: false },
                data: {}
            };
        }
    },

    /**
     * Save user progress to backend
     * @param {string} userName - The user's name/identifier
     * @param {string} stage - Current stage (e.g., "3.1.2")
     * @returns {Promise<Object>} - Response from backend
     */
    async saveProgress(memoirId, stage) {
        try {
            console.log(`Saving progress for ${memoirId} to stage: ${stage}`);
            const response = await this._secureFetch(API_CONFIG.SAVE_PROGRESS_WEBHOOK, {
                method: 'POST',
                body: JSON.stringify({
                    userName: memoirId,
                    current_stage: stage
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to save progress: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to save progress:', error);
            throw error;
        }
    },

    /**
     * Upload an audio chunk to the backend
     * @param {string} userName - The user's name
     * @param {string} fileName - Unique file name for the audio
     * @param {string} questionStage - The stage identifier (e.g. "3.1.1")
     * @param {number} chunkIndex - 0-based index of the current chunk
     * @param {number} totalChunks - Total number of chunks in the file
     * @param {string} base64Data - The chunk data as base64 string
     * @returns {Promise<Object>}
     */
    async uploadAudioChunk(userName, fileName, questionStage, chunkIndex, totalChunks, base64Data) {
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                const response = await this._secureFetch(API_CONFIG.AUDIO_UPLOAD_WEBHOOK, {
                    method: 'POST',
                    body: JSON.stringify({
                        userName,
                        fileName,
                        questionStage,
                        chunkIndex,
                        totalChunks,
                        data: base64Data
                    })
                });

                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                attempts++;
                console.warn(`Upload attempt ${attempts} failed for chunk ${chunkIndex + 1}:`, error.message);

                if (attempts < maxAttempts) {
                    // Wait before retrying (exponentialish backoff: 1s, 2s)
                    await new Promise(resolve => setTimeout(resolve, attempts * 1000));
                } else {
                    console.error('Failed to upload audio chunk after max retries:', {
                        message: error.message,
                        chunk: `${chunkIndex + 1}/${totalChunks}`,
                        url: API_CONFIG.AUDIO_UPLOAD_WEBHOOK
                    });
                    throw error;
                }
            }
        }
    },

    /**
     * Utility to split a Blob into chunks and upload them
     * @param {string} userName 
     * @param {string} fileName 
     * @param {string} questionStage
     * @param {Blob} blob 
     * @param {function} onProgress - Optional callback for progress updates (0-100)
     */
    async uploadLargeAudio(userName, fileName, questionStage, blob, onProgress = null) {
        const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
        const totalChunks = Math.ceil(blob.size / CHUNK_SIZE);

        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, blob.size);
            const chunk = blob.slice(start, end);

            // Convert chunk to base64
            const base64Data = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.readAsDataURL(chunk);
            });

            await this.uploadAudioChunk(userName, fileName, questionStage, i, totalChunks, base64Data);

            if (onProgress) {
                onProgress(Math.round(((i + 1) / totalChunks) * 100));
            }
        }
    },

    /**
     * Submit responses to clarification questions
     * @param {string} userName 
     * @param {number} chapterNumber 
     * @param {Object} responses - { clarificationId: { answer: string, correction?: string } }
     */
    async submitClarifications(userName, chapterNumber, responses) {
        try {
            const response = await this._secureFetch(API_CONFIG.CLARIFICATIONS_WEBHOOK, {
                method: 'POST',
                body: JSON.stringify({
                    userName,
                    chapter_number: chapterNumber,
                    responses
                })
            });

            return await response.json();
        } catch (error) {
            console.error('Failed to submit clarifications:', error);
            throw error;
        }
    },

    async getChapters(userName) {
        try {
            const url = `${API_CONFIG.CHAPTERS_WEBHOOK}?userName=${encodeURIComponent(userName)}`;
            const response = await this._secureFetch(url);
            const data = await response.json();
            return this._normalizeChapters(data) || { chapters: [] };
        } catch (error) {
            console.error('Failed to get chapters:', error);
            throw error;
        }
    },

    /**
     * Fetch all drafts for a specific user
     */
    async getChapterDrafts(userName) {
        try {
            const url = `${API_CONFIG.CHAPTER_DRAFT_WEBHOOK}?userName=${encodeURIComponent(userName)}`;
            const response = await this._secureFetch(url);
            return await response.json();
        } catch (error) {
            console.error('Failed to get chapter drafts:', error);
            throw error;
        }
    },

    /**
     * Submit feedback for a specific chapter draft
     * @param {string} userName 
     * @param {number} chapterNumber 
     * @param {Array} feedbackList - [{ paragraphIndex: number, originalText: string, feedback: string }]
     * @param {string} memoirName - The human-readable name of the memoir
     */
    async submitDraftFeedback(userName, chapterNumber, feedbackList, memoirName) {
        try {
            console.log('Submitting draft feedback to:', API_CONFIG.DRAFT_FEEDBACK_WEBHOOK);
            const response = await this._secureFetch(API_CONFIG.DRAFT_FEEDBACK_WEBHOOK, {
                method: 'POST',
                body: JSON.stringify({
                    userName,
                    memoirName,
                    chapterNumber,
                    type: 'draft_feedback',
                    feedback: feedbackList
                })
            });

            // Handle potential non-JSON response
            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch (e) {
                return { success: true, message: text };
            }
        } catch (error) {
            console.error('Failed to submit draft feedback:', error);
            throw error;
        }
    },

    /**
     * Submit user's writing style preferences/persona
     * @param {string} userName 
     * @param {Object} styleData - The answers from the Style Tuner
     * @param {string} memoirName - The human-readable name of the memoir
     */
    async submitStylePersona(userName, styleData, memoirName) {
        try {
            console.log('Submitting style persona to:', API_CONFIG.STYLE_PERSONA_WEBHOOK);
            const response = await this._secureFetch(API_CONFIG.STYLE_PERSONA_WEBHOOK, {
                method: 'POST',
                body: JSON.stringify({
                    userName,
                    memoirName,
                    type: 'writing_style_persona',
                    style: styleData
                })
            });

            return await response.json();
        } catch (error) {
            console.error('Failed to submit style persona:', error);
            throw error;
        }
    }
};
