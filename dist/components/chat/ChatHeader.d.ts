import type { Thread } from '@/lib/types';
interface ChatHeaderProps {
    currentAgent: string;
    isRefreshing: boolean;
    onNewChat: () => void;
    isHistoryOpen: boolean;
    onHistoryOpenChange: (open: boolean) => void;
    threads: Thread[];
    currentThreadId: string | null;
    onSelectThread: (threadId: string) => void;
    onFetchHistory: () => void;
    direction?: 'left' | 'right' | 'top' | 'bottom';
    showSettings?: boolean;
    availableAgents: {
        key: string;
        description: string;
    }[];
    onAgentChange: (agent: string) => void;
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
    onDeleteThread?: (threadId: string) => void;
    onExpand?: () => void;
    isExpanded?: boolean;
    onClose?: () => void;
}
export declare function ChatHeader({ currentAgent, isRefreshing, onNewChat, isHistoryOpen, onHistoryOpenChange, threads, currentThreadId, onSelectThread, onFetchHistory, direction, showSettings, availableAgents, onAgentChange, currentModel, onModelChange, availableModels, voiceConfig, onVoiceConfigChange, availableVoices, selectedVoice, onVoiceChange, autoSpeak, onAutoSpeakChange, onDeleteThread, onExpand, isExpanded, onClose }: ChatHeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ChatHeader.d.ts.map