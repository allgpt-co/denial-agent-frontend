import type { Thread } from '@/lib/types';
interface ChatHistoryProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    threads: Thread[];
    currentThreadId: string | null;
    onSelectThread: (threadId: string) => void;
    onNewChat: () => void;
    isRefreshing: boolean;
    onFetchHistory: () => void;
    direction?: 'left' | 'right' | 'top' | 'bottom';
}
export declare function ChatHistory({ isOpen, onOpenChange, threads, currentThreadId, onSelectThread, onNewChat, isRefreshing, onFetchHistory, direction }: ChatHistoryProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ChatHistory.d.ts.map