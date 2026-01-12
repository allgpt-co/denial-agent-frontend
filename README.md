# @quickintell/agent-chat

A reusable React library for building chat interfaces with AI agents, built with Vite, shadcn/ui, and TypeScript.

## Features

- 🚀 **Streaming Support**: Real-time message streaming with Server-Sent Events
- 🎨 **Beautiful UI**: Built with shadcn/ui and Tailwind CSS
- 📝 **TypeScript**: Fully typed for better DX
- 🔧 **Configurable**: Customize agent, model, and behavior via props
- 📦 **Standalone or Embedded**: Use as a complete chat UI or integrate components individually
- 🎯 **Tool Call Visualization**: Display agent tool calls and results
- 💬 **Message History**: Automatic persistence with thread IDs
- 👍 **User Feedback**: Built-in thumbs up/down ratings
- 🧩 **Flexible Components**: Includes both a full-page chat and a floating popup widget

## Installation

```bash
# Install from npm (when published)
npm install @quickintell/agent-chat

# Or link locally for development
npm link ../frontend
```

## Usage

### 1. Full Page Chat (`AgentChat`)

Use the `AgentChat` component to embed a full-featured chat interface into any page or container.

```tsx
import { AgentChat } from '@quickintell/agent-chat'
import '@quickintell/agent-chat/styles'

function App() {
  return (
    <div className="h-screen w-full">
      <AgentChat
        baseUrl="http://localhost:8080"
        agent="chatbot"
        model="gpt-4o"
        enableStreaming={true}
        suggestions={[
            "What can you help me with?",
            "Analyze this claim denial"
        ]}
      />
    </div>
  )
}
```

### 2. Popup Chat Widget (`PopupChatbot`)

Use the `PopupChatbot` component to add a floating chat button that opens the chat in a popover.

```tsx
import { PopupChatbot } from '@quickintell/agent-chat'
import '@quickintell/agent-chat/styles'

function App() {
  return (
    <div>
      <h1>My Application</h1>
      {/* ... other content ... */}
      
      <PopupChatbot
        baseUrl="http://localhost:8080"
        agent="support-agent"
        buttonClassName="bg-blue-600 hover:bg-blue-700"
        windowClassName="w-[400px] h-[600px]"
      />
    </div>
  )
}
```

## Props API

### Common Props (`AgentChatProps`)
These props are available for both `AgentChat` and `PopupChatbot`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `baseUrl` | `string` | **required** | URL of your backend agent API |
| `agent` | `string` | `"chatbot"` | The agent identifier to communicate with |
| `model` | `string` | `undefined` | Specific LLM model to use |
| `threadId` | `string` | `undefined` | ID for resuming a specific chat session |
| `userId` | `string` | `undefined` | User ID for tracking and analytics |
| `enableStreaming` | `boolean` | `true` | Enable real-time response streaming |
| `suggestions` | `string[]` | `undefined` | List of starter questions shown when history is empty |
| `showSettings` | `boolean` | `false` | Show the settings gear icon |
| `showHeader` | `boolean` | `true` | Show the chat header with title/controls |
| `className` | `string` | `undefined` | Custom class for the root container |
| `onError` | `(error: Error) => void` | `undefined` | Callback for handling errors |

### PopupChatbot Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `buttonClassName` | `string` | `undefined` | Custom classes for the floating toggle button |
| `windowClassName` | `string` | `undefined` | Custom classes for the popover chat window |

## Development

### Run Demo App
The project includes a demo application in `src/App.tsx` for testing and development.

```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to verify the components.

### Build Library
To build the package for distribution:

```bash
npm run build:lib
```
This generates the `dist` folder with ESM and CJS formats.

## Advanced Usage

For granular control, you can import and compose individual UI sub-components:

```tsx
import { 
  AgentClient, 
  Chat, 
  ChatContainer, 
  MessageInput 
} from '@quickintell/agent-chat'

// Initialize the client manually
const client = new AgentClient({
  baseUrl: 'http://localhost:8080',
  agent: 'chatbot',
})
```

## License

MIT
