/**
 * Service to handle local storage of audio blobs using IndexedDB
 * for data resilience and handling large files.
 */
const AudioStorage = {
    DB_NAME: 'LifeStoryAudioDB',
    STORE_NAME: 'recordings',
    DB_VERSION: 1,

    /**
     * Initialize the database
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME);
                }
            };
        });
    },

    /**
     * Save an audio blob locally
     * @param {string} key - Unique key (e.g., "chapter_1_q_1")
     * @param {Blob} blob - The audio data
     */
    async saveRecording(key, blob) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put(blob, key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Get a recorded blob by key
     * @param {string} key 
     * @returns {Promise<Blob|null>}
     */
    async getRecording(key) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Delete a recording
     * @param {string} key 
     */
    async deleteRecording(key) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * List all keys in the store
     */
    async listRecordings() {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.getAllKeys();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Clear all recordings from the store
     */
    async clearAllRecordings() {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};

window.AudioStorage = AudioStorage;
