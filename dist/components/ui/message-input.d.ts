import React from "react";
interface MessageInputBaseProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value: string;
    submitOnEnter?: boolean;
    stop?: () => void;
    isGenerating: boolean;
    enableInterrupt?: boolean;
    transcribeAudio?: (blob: Blob) => Promise<string>;
}
interface MessageInputWithoutAttachmentProps extends MessageInputBaseProps {
    allowAttachments?: false;
}
interface MessageInputWithAttachmentsProps extends MessageInputBaseProps {
    allowAttachments: true;
    files: File[] | null;
    setFiles: React.Dispatch<React.SetStateAction<File[] | null>>;
}
type MessageInputProps = MessageInputWithoutAttachmentProps | MessageInputWithAttachmentsProps;
export declare function MessageInput({ placeholder, className, onKeyDown: onKeyDownProp, submitOnEnter, stop, isGenerating, enableInterrupt, transcribeAudio, ...props }: MessageInputProps): import("react/jsx-runtime").JSX.Element;
export declare namespace MessageInput {
    var displayName: string;
}
export {};
//# sourceMappingURL=message-input.d.ts.map