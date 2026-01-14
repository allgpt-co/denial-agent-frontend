export const extractSuggestions = (content: string) => {
    // Handle JSON format: { "questions": [...] } possibly wrapped in code blocks
    const jsonMatch = content.match(/(?:```(?:json)?\s*)?({\s*"questions":\s*\[.*?\]\s*})(?:\s*```)?/s)
    if (jsonMatch) {
        try {
            const jsonStr = jsonMatch[1] // The inner JSON object
            const data = JSON.parse(jsonStr)
            const suggestions = data.questions || []
            const cleanContent = content.replace(jsonMatch[0], '').trim()
            return { suggestions, cleanContent }
        } catch (e) {
            console.error("Failed to parse followup JSON", e)
        }
    }

    // Legacy format: [FOLLOWUP: sug 1, sug 2]
    const oldMatch = content.match(/\[FOLLOWUP:\s*(.*?)\]/)
    if (oldMatch) {
        const suggestionsStr = oldMatch[1]
        const suggestions = suggestionsStr.split(',').map(s => s.trim()).filter(Boolean)
        const cleanContent = content.replace(/\[FOLLOWUP:\s*.*?\]/, '').trim()
        return { suggestions, cleanContent }
    }

    return { suggestions: [], cleanContent: content }
}
