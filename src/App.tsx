import { AgentChat } from './components/AgentChat'
import './index.css'

const SUGGESTIONS = [
    'Show me the top 50 patient records',
    'Find patient details by name or MRN',
    'Get insurance policy information for a patient',
    'Search for claims by patient ID',
]

function App() {
    return (
        <div className="chat-theme">
            <div className="h-screen bg-background flex w-full flex-col">
                <main className="flex-1 overflow-hidden">
                    <AgentChat
                        baseUrl="http://localhost:8080/agent"
                        agent="denial-resolver-agent"
                        model="gpt-4o"
                        userId="019c69f5-02c0-7844-a9ec-97bfd5688880"
                        threadId='b4ab55f3-be28-4cf3-b361-95f1d80f4a60'
                        enableStreaming={false}
                        showSettings={true}
                        showHeader={true}
                        suggestions={SUGGESTIONS}
                        onError={(error) => {
                            console.error('Agent error:', error)
                        }}
                    />
                </main>
            </div>
        </div>
    )
}

export default App
