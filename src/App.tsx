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
    <div className="flex w-full flex-col bg-background">
      <main className="flex-1 overflow-hidden">
        <AgentChat
          baseUrl="http://localhost:8080"
          agent="rcm-agent"
          model="gpt-4o"
          enableStreaming={true}
          showSettings={true}
          showHeader={true}
          onError={(error) => {
            console.error('Agent error:', error)
          }}
        />
      </main>
    </div>
  )
}

export default App
