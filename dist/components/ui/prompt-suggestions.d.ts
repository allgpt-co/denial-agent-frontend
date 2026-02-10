interface PromptSuggestionsProps {
    label: string;
    append: (message: {
        role: "user";
        content: string;
    }) => void;
    suggestions: string[];
}
export declare function PromptSuggestions({ label, append, suggestions, }: PromptSuggestionsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=prompt-suggestions.d.ts.map