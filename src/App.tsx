import { AgentChat } from './components/AgentChat'
import './index.css'

const SUGGESTIONS = [
  'Analyze a new EDI 835 file for denials',
  'Research the CARC 50 denial for BCBS North Dakota',
  'Sort claims by resolution probability',
  'Draft an appeal for a specific claim ID',
]

function App() {
  return (
    <div className="flex w-full flex-col bg-background">
      <main className="flex-1 overflow-hidden">
        <AgentChat
          baseUrl="http://localhost:8080"
          agent="denial-resolver-agent"
          model="gpt-5.1"
          enableStreaming={true}
          showSettings={false}
          showHeader={true}
          suggestions={SUGGESTIONS}
          onError={(error) => {
            console.error('Agent error:', error)
          }}
        />
      </main>
    </div>
  )
}

export default App
