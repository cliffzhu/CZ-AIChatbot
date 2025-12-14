import { useState, useEffect } from 'react'
import './App.css'

interface TextMessage {
  type: 'text'
  content: string
}

interface ImageMessage {
  type: 'image'
  url: string
  alt?: string
}

interface ButtonMessage {
  type: 'buttons'
  id: string
  options: { text: string; value: string }[]
}

interface FormMessage {
  type: 'form'
  id: string
  fields: { name: string; type: string; label: string; required?: boolean }[]
  submitLabel?: string
}

interface ErrorMessage {
  type: 'error'
  message: string
}

type Message = TextMessage | ImageMessage | ButtonMessage | FormMessage | ErrorMessage

interface AppProps {
  config?: any
}

function App({}: AppProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  useEffect(() => {
    // Listen for theme updates
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'setTheme') {
        // Apply theme
        Object.entries(event.data.theme).forEach(([key, value]) => {
          document.documentElement.style.setProperty(`--${key}`, value as string)
        })
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const sendMessage = async (content: string) => {
    // TODO: Send to backend
    setMessages(prev => [...prev, { type: 'text', content }])
    setInput('')
    setIsStreaming(true)
    // Simulate streaming response
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'text', content: 'Hello from assistant!' }])
      setIsStreaming(false)
    }, 1000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input.trim())
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat</h2>
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <MessageComponent key={idx} message={msg} />
        ))}
        {isStreaming && <div className="streaming-indicator">Assistant is typing...</div>}
      </div>
      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isStreaming}
        />
        <button type="submit" disabled={isStreaming}>Send</button>
      </form>
    </div>
  )
}

function MessageComponent({ message }: { message: Message }) {
  switch (message.type) {
    case 'text':
      return <div className="message text">{message.content}</div>
    case 'image':
      return <img src={message.url} alt={message.alt} className="message image" />
    case 'buttons':
      return (
        <div className="message buttons">
          {message.options.map((opt, idx) => (
            <button key={idx} onClick={() => {/* TODO: handle interaction */}}>
              {opt.text}
            </button>
          ))}
        </div>
      )
    case 'form':
      return (
        <form className="message form" onSubmit={(e) => { e.preventDefault(); /* TODO */ }}>
          {message.fields.map((field, idx) => (
            <input key={idx} type={field.type} placeholder={field.label} required={field.required} />
          ))}
          <button type="submit">{message.submitLabel || 'Submit'}</button>
        </form>
      )
    case 'error':
      return <div className="message error">{message.message}</div>
    default:
      return null
  }
}

export default App
