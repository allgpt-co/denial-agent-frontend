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
                        agent="rcm-agent"
                        model="gpt-4o"
                        enableStreaming={true}
                        showSettings={true}
                        showHeader={true}
                        suggestions={SUGGESTIONS}
                        userId={"3feb4c19-3f80-4b2b-ac22-4c045acc36fc"}
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
