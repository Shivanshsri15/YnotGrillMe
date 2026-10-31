import { Composer } from './components/Composer'
import { EmptyGrill } from './components/EmptyGrill'
import { HeatBar } from './components/HeatBar'
import { MessageList } from './components/MessageList'
import { useGrillChat } from './hooks/useGrillChat'
import './App.css'

export default function App() {
  const chat = useGrillChat()

  return (
    <div className="app">
      <div className="app__glow" aria-hidden="true" />

      <HeatBar
        grillMode={chat.grillMode}
        phase={chat.phase}
        busy={chat.busy}
        modeFlash={chat.modeFlash}
        onGrillMode={chat.setGrillMode}
        onReset={chat.reset}
        onStop={chat.stop}
      />

      <main className="app__main">
        {chat.messages.length === 0 ? (
          <EmptyGrill bootError={chat.bootError} />
        ) : (
          <MessageList messages={chat.messages} />
        )}
      </main>

      <footer className="app__footer">
        <Composer
          busy={chat.busy}
          autoFocus
          onSend={(message) => void chat.send(message)}
          onStop={chat.stop}
        />
      </footer>
    </div>
  )
}
