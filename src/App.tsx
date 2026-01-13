import { FullChatbot } from "./components/chatbot";
import './index.css';

const SUGGESTIONS = [
  'Analyze a new EDI 835 file for denials',
  'Research the CARC 50 denial for BCBS North Dakota',
  'Sort claims by resolution probability',
  'Draft an appeal for a specific claim ID',
];

export default function App() {
  return (
    <div className="chatbot-theme min-h-screen bg-background text-foreground selection:bg-primary/20">
      <FullChatbot
        url="http://localhost:8080"
        storageKey="rcm-chatbot"
        placeholder="Ask me about denials..."
        stream={true}
        header={{
          show: true,
          title: "Denial Resolver",
          subtitle: "AI-Powered RCM Support",
          allowMaximize: true
        }}
        starter={{
          suggestions: SUGGESTIONS
        }}
        footer={{
          show: true,
          text: "Powered by Quickintell AI",
        }}
      />
    </div>
  );
}
