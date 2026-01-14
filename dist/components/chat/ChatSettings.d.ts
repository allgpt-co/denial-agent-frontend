interface ChatSettingsProps {
    currentAgent: string;
    onAgentChange: (agent: string) => void;
    availableAgents: {
        key: string;
        description: string;
    }[];
    currentModel: string;
    onModelChange: (model: string) => void;
    availableModels: string[];
    voiceConfig: any;
    onVoiceConfigChange: (config: any) => void;
    availableVoices: SpeechSynthesisVoice[];
    selectedVoice: SpeechSynthesisVoice | null;
    onVoiceChange: (voice: SpeechSynthesisVoice | null) => void;
    autoSpeak: boolean;
    onAutoSpeakChange: (autoSpeak: boolean) => void;
}
export declare function ChatSettings({ currentAgent, onAgentChange, availableAgents, currentModel, onModelChange, availableModels, voiceConfig, onVoiceConfigChange, availableVoices, selectedVoice, onVoiceChange, autoSpeak, onAutoSpeakChange, }: ChatSettingsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ChatSettings.d.ts.map