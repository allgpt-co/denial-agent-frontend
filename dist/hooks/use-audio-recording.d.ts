interface UseAudioRecordingOptions {
    transcribeAudio?: (blob: Blob) => Promise<string>;
    onTranscriptionComplete?: (text: string) => void;
}
export declare function useAudioRecording({ transcribeAudio, onTranscriptionComplete, }: UseAudioRecordingOptions): {
    isListening: boolean;
    isSpeechSupported: boolean;
    isRecording: boolean;
    isTranscribing: boolean;
    audioStream: MediaStream | null;
    toggleListening: () => Promise<void>;
    stopRecording: () => Promise<void>;
};
export {};
//# sourceMappingURL=use-audio-recording.d.ts.map