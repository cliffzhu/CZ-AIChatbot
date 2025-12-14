import { useState, useEffect } from 'react'
import type { Message, InteractionMessage, StreamingEvent } from 'chat-shared-schema'
import './App.css'

interface AppProps {
  config?: any
}

function App({}: AppProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

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

  const handleInteraction = (interactionId: string, selection: string) => {
    const interaction: InteractionMessage = { type: 'interaction', interactionId, selection }
    // TODO: Send to backend
    console.log('Interaction:', interaction)
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>, interactionId: string) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const values: Record<string, any> = {}
    formData.forEach((value, key) => { values[key] = value })
    const interaction: InteractionMessage = { type: 'interaction', interactionId, values }
    // TODO: Send to backend
    console.log('Form interaction:', interaction)
  }

  const streamingPost = async (
    url: string,
    payload: any,
    onEvent: (event: StreamingEvent) => void,
    token?: string,
    abortController?: AbortController
  ) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: abortController?.signal
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim()) {
            try {
              const event: StreamingEvent = JSON.parse(line)
              onEvent(event)
            } catch (e) {
              console.error('Invalid JSON:', line)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  const sendMessage = async (content: string) => {
    setMessages(prev => [...prev, { type: 'text', content }])
    setInput('')
    setIsStreaming(true)

    const controller = new AbortController()
    setAbortController(controller)
    // TODO: Get token
    // TODO: Use real URL
    try {
      await streamingPost(
        'http://localhost:3000/runtime/query', // placeholder
        { message: content },
        (event) => {
          if (event.type === 'delta' && event.content) {
            // TODO: Handle streaming text
          } else if (event.type === 'message' && event.message) {
            setMessages(prev => [...prev, event.message!])
          } else if (event.type === 'done') {
            setIsStreaming(false)
            setAbortController(null)
          } else if (event.type === 'error') {
            setMessages(prev => [...prev, { type: 'error', code: 'stream_error', message: event.error || 'Streaming error' }])
            setIsStreaming(false)
            setAbortController(null)
          }
        },
        undefined, // token
        controller
      )
    } catch (error) {
      setMessages(prev => [...prev, { type: 'error', code: 'network_error', message: 'Failed to send message' }])
      setIsStreaming(false)
      setAbortController(null)
    }
  }

  const cancelStream = () => {
    if (abortController) {
      abortController.abort()
      setIsStreaming(false)
      setAbortController(null)
    }
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input.trim())
    }
  }

  const MessageComponent = ({ message }: { message: Message }) => {
    switch (message.type) {
      case 'text':
        return <div className="message text">{message.content}</div>
      case 'image':
        return <img src={message.url} alt={message.alt} className="message image" />
      case 'buttons':
        return (
          <div className="message buttons">
            {message.options.map((opt, idx) => (
              <button key={idx} onClick={() => handleInteraction(message.id, opt.value)}>
                {opt.text}
              </button>
            ))}
          </div>
        )
      case 'form':
        return (
          <form className="message form" onSubmit={(e) => handleFormSubmit(e, message.id)}>
            {message.fields.map((field, idx) => (
              <div key={idx}>
                <label>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea name={field.name} required={field.required} />
                ) : field.type === 'select' ? (
                  <select name={field.name} required={field.required}>
                    {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input type={field.type} name={field.name} required={field.required} />
                )}
              </div>
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
        {isStreaming && <button type="button" onClick={cancelStream}>Cancel</button>}
      </form>
    </div>
  )
}


export default App
