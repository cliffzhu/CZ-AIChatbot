import { useState, useEffect } from 'react'
import type { Message, InteractionMessage, StreamingEvent, Theme } from 'chat-shared-schema'
import './CSS_Reference.css'
import './App.css'

interface AppProps {
  config?: any
}

function App({}: AppProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Get token on init
    const getToken = async () => {
      try {
        const response = await fetch('http://localhost:3000/runtime/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ widgetId: 'test123', origin: window.location.origin })
        });
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Failed to get token:', error);
      }
    };

    // Get theme from config
    const getTheme = async () => {
      try {
        const response = await fetch('http://localhost:3000/widget/123/config');
        const config = await response.json();
        if (config.theme) {
          // Apply theme variables to :root
          Object.entries(config.theme).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}`, String(value));
          });
        }
      } catch (error) {
        console.error('Failed to get theme:', error);
      }
    };

    getToken();
    getTheme();

    // Listen for theme updates
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'setTheme') {
        // Apply theme variables to :root
        const theme: Theme = event.data.theme
        Object.entries(theme).forEach(([key, value]) => {
          document.documentElement.style.setProperty(`--${key}`, String(value))
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
        'http://localhost:3000/runtime/query',
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
        token || undefined,
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
        return <div className="message bot">{message.content}</div>
      case 'image':
        return (
          <div className="message bot">
            <img src={message.url} alt={message.alt} className="message image" />
            {message.caption && <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{message.caption}</div>}
          </div>
        )
      case 'buttons':
        return (
          <div className="message bot buttons">
            {message.options.map((opt, idx) => (
              <button key={idx} onClick={() => handleInteraction(message.id, opt.value)}>
                {opt.text}
              </button>
            ))}
          </div>
        )
      case 'form':
        return (
          <div className="message bot">
            <form className="message form" onSubmit={(e) => handleFormSubmit(e, message.id)}>
              {message.fields.map((field, idx) => (
                <div key={idx} style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea name={field.name} required={field.required} rows={3} />
                  ) : field.type === 'select' ? (
                    <select name={field.name} required={field.required}>
                      <option value="">Select...</option>
                      {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input type={field.type} name={field.name} required={field.required} />
                  )}
                </div>
              ))}
              <button type="submit">{message.submitLabel || 'Submit'}</button>
            </form>
          </div>
        )
      case 'error':
        return <div className="message error">{message.message}</div>
      default:
        return null
    }
  }

  return (
    <div className="chatbot-widget">
      <div className="chatbot-header">
        <div className="chatbot-title">AI Assistant</div>
        <div className="chatbot-controls">×</div>
      </div>
      <div className="chatbot-body">
        <div className="chatbot-description">
          Hi! I'm here to help you. How can I assist you today?
        </div>
        <div className="support-buttons">
          <a href="#" className="btn secondary">Help Center</a>
          <a href="#" className="btn secondary">Contact Support</a>
        </div>
        <div className="chat-messages" style={{ marginTop: '16px' }}>
          {messages.map((msg, idx) => (
            <MessageComponent key={idx} message={msg} />
          ))}
          {isStreaming && <div className="streaming-indicator">Assistant is typing...</div>}
        </div>
      </div>
      <div className="chatbot-footer">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flex: 1, gap: '8px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isStreaming}
          />
          <button className="send-btn" type="submit" disabled={isStreaming}>→</button>
        </form>
        {isStreaming && <button type="button" onClick={cancelStream}>Cancel</button>}
      </div>
    </div>
  )
}


export default App
