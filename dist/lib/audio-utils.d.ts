type RecordAudioType = {
    (stream: MediaStream): Promise<Blob>;
    stop: () => void;
    currentRecorder?: MediaRecorder;
};
export declare const recordAudio: RecordAudioType;
export {};
//# sourceMappingURL=audio-utils.d.ts.map