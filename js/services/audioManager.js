/**
 * AudioManager Service
 * Handles persistent audio streams, mixing (Mic + System), and VAD (Voice Activity Detection)
 */

window.AudioManager = {
    audioContext: null,
    micStream: null,
    systemStream: null,
    mixedStream: null,
    analyser: null,
    vadCallback: null,
    isVADPaused: false,

    // Initialize Solo Mode (Mic only)
    async initSoloMode() {
        await this.stopAll();
        this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.setupVAD(this.micStream);
        return this.micStream;
    },

    // Initialize Collaborative Mode (Mic + System Audio)
    async initGroupMode() {
        await this.stopAll();

        try {
            // 1. Get Mic
            this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // 2. Get System Audio (via Screen Sharing)
            // Note: User MUST check "Share system audio"
            this.systemStream = await navigator.mediaDevices.getDisplayMedia({
                video: { width: 1 }, // Required but we'll ignore the video
                audio: true
            });

            // Ensure system audio was actually shared
            if (!this.systemStream.getAudioTracks().length) {
                this.stopAll();
                throw new Error('System audio was not shared. Please ensure you check the "Share system audio" box.');
            }

            // 3. Mix them
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const micSource = this.audioContext.createMediaStreamSource(this.micStream);
            const systemSource = this.audioContext.createMediaStreamSource(this.systemStream);
            const destination = this.audioContext.createMediaStreamDestination();

            micSource.connect(destination);
            systemSource.connect(destination);

            this.mixedStream = destination.stream;

            // Setup VAD on the mixed stream
            this.setupVAD(this.micStream); // Monitor only local mic for "Are you talking?" prompts

            return this.mixedStream;
        } catch (err) {
            this.stopAll();
            throw err;
        }
    },

    setupVAD(stream) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const source = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 512;
        source.connect(this.analyser);

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkVolume = () => {
            if (this.isVADPaused) {
                requestAnimationFrame(checkVolume);
                return;
            }

            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;

            // Threshold for speech (approx)
            if (average > 30 && this.vadCallback) {
                this.vadCallback();
            }

            requestAnimationFrame(checkVolume);
        };

        checkVolume();
    },

    setVADCallback(callback) {
        this.vadCallback = callback;
    },

    pauseVAD() {
        this.isVADPaused = true;
    },

    resumeVAD() {
        this.isVADPaused = false;
    },

    async stopAll() {
        if (this.micStream) {
            this.micStream.getTracks().forEach(t => t.stop());
            this.micStream = null;
        }
        if (this.systemStream) {
            this.systemStream.getTracks().forEach(t => t.stop());
            this.systemStream = null;
        }
        if (this.audioContext) {
            await this.audioContext.close();
            this.audioContext = null;
        }
        this.mixedStream = null;
        this.analyser = null;
    }
};
