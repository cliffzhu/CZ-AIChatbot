import { useState, useEffect } from 'react'
import type { Message, InteractionMessage, StreamingEvent, Theme } from 'chat-shared-schema'
import './CSS_Reference.css'
import './App.css'

// Simple logging utility
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
    // In production, send to logging service
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // In production, send to error tracking service
  },
  performance: (metric: string, value: number) => {
    console.log(`[PERF] ${metric}: ${value}ms`);
    // In production, send to metrics service
  }
};

interface ImageComponentProps {
  src: string
  alt?: string
  width?: number
  height?: number
  caption?: string
}

const ImageComponent = ({ src, alt, width, height, caption }: ImageComponentProps) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setLoaded(true)
    img.onerror = () => setError(true)
    img.src = src
  }, [src])

  const maxWidth = 300
  const maxHeight = 200

  const aspectRatio = width && height ? width / height : 1
  const displayWidth = Math.min(width || maxWidth, maxWidth)
  const displayHeight = Math.min(height || (displayWidth / aspectRatio), maxHeight)

  if (error) {
    return (
      <div className="image-fallback" style={{
        width: displayWidth,
        height: displayHeight,
        background: 'var(--bg-soft)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--muted)',
        fontSize: '12px'
      }}>
        Failed to load image
      </div>
    )
  }

  return (
    <div className="image-container">
      {!loaded && (
        <div className="image-placeholder" style={{
          width: displayWidth,
          height: displayHeight,
          background: 'var(--bg-soft)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="loading-spinner" style={{
            width: '20px',
            height: '20px',
            border: '2px solid var(--border)',
            borderTop: '2px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        style={{
          width: displayWidth,
          height: displayHeight,
          objectFit: 'cover',
          borderRadius: 'var(--radius-sm)',
          display: loaded ? 'block' : 'none'
        }}
        loading="lazy"
      />
      {caption && (
        <div style={{
          fontSize: '12px',
          color: 'var(--muted)',
          marginTop: '4px',
          textAlign: 'center'
        }}>
          {caption}
        </div>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

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
      const startTime = Date.now();
      try {
        logger.info('Requesting auth token');
        const response = await fetch('http://localhost:3000/runtime/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ widgetId: '123', origin: window.location.origin })
        });
        const data = await response.json();
        setToken(data.token);
        logger.performance('token_request', Date.now() - startTime);
        logger.info('Auth token received');
      } catch (error) {
        logger.error('Failed to get token', error);
      }
    };

    // Get theme from config
    const getTheme = async () => {
      const startTime = Date.now();
      try {
        logger.info('Loading theme configuration');
        const response = await fetch('http://localhost:3000/widget/123/config');
        const config = await response.json();
        if (config.theme) {
          // Apply theme variables to :root
          Object.entries(config.theme).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}`, String(value));
          });
          logger.performance('theme_load', Date.now() - startTime);
          logger.info('Theme applied', config.theme);
        }
      } catch (error) {
        logger.error('Failed to get theme', error);
      }
    };

    getToken();
    getTheme();

    // Mobile UX: Prevent body scroll when widget is open
    const preventBodyScroll = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest && target.closest('.chatbot-widget')) {
        e.stopPropagation();
      } else {
        e.preventDefault();
      }
    };

    // Handle keyboard show/hide on mobile
    const handleResize = () => {
      const viewport = window.visualViewport;
      if (viewport) {
        const heightDiff = window.innerHeight - viewport.height;
        if (heightDiff > 150) { // Keyboard is likely shown
          document.body.style.paddingBottom = `${heightDiff}px`;
        } else {
          document.body.style.paddingBottom = '0px';
        }
      }
    };

    // Orientation change handling
    const handleOrientationChange = () => {
      // Force layout recalculation
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    // Add mobile event listeners
    if ('visualViewport' in window && window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    window.addEventListener('orientationchange', handleOrientationChange);
    document.addEventListener('touchmove', preventBodyScroll, { passive: false });

    // Listen for theme updates and test commands
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || !event.data.type) return

      if (event.data.type === 'setTheme') {
        const theme: Theme = event.data.theme
        Object.entries(theme).forEach(([key, value]) => {
          document.documentElement.style.setProperty(`--${key}`, String(value))
        })
        // Notify parent that theme was applied
        try {
          (event.source as Window)?.postMessage({ type: 'themeApplied', theme }, event.origin)
        } catch (e) {
          // ignore
        }
      }

      if (event.data.type === 'simulateUserMessage') {
        const content = String(event.data.content || '')
        // Send message as if user typed it
        sendMessage(content).then(() => {
          try {
            (event.source as Window)?.postMessage({ type: 'messageSent', content }, event.origin)
          } catch (e) {}
        }).catch((err) => {
          try {
            (event.source as Window)?.postMessage({ type: 'messageSendFailed', error: String(err) }, event.origin)
          } catch (e) {}
        })
      }

      if (event.data.type === 'getWidgetMetrics') {
        const el = document.querySelector('.chatbot-widget') as HTMLElement | null
        const width = el ? window.getComputedStyle(el).width : null
        try {
          (event.source as Window)?.postMessage({ type: 'widgetMetrics', width }, event.origin)
        } catch (e) {}
      }
    }
    window.addEventListener('message', handleMessage)

    // Notify parent that app is ready for test messages
    try {
      window.parent.postMessage({ type: 'appReady' }, '*')
    } catch (e) {}

    return () => {
      if ('visualViewport' in window && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('touchmove', preventBodyScroll);
      window.removeEventListener('message', handleMessage);
    }
  }, [])

  const handleInteraction = (interactionId: string, selection: string) => {
    logger.info('User interaction', { interactionId, selection });
    const interaction: InteractionMessage = { type: 'interaction', interactionId, selection }
    // Send to backend
    sendInteraction(interaction)
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>, interactionId: string) => {
    logger.info('Form submitted', { interactionId });
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const values: Record<string, any> = {}
    formData.forEach((value, key) => { values[key] = value })
    const interaction: InteractionMessage = { type: 'interaction', interactionId, values }
    // Send to backend
    sendInteraction(interaction)
    // Clear form
    e.currentTarget.reset()
  }

  const sendInteraction = async (interaction: InteractionMessage) => {
    if (!token) {
      logger.error('No auth token for interaction');
      return;
    }

    try {
      await streamingPost(
        'http://localhost:3000/runtime/query',
        { message: interaction },
        (event) => {
          if (event.type === 'delta' && event.content) {
            // Handle streaming text
          } else if (event.type === 'message' && event.message) {
            setMessages(prev => [...prev, event.message!])
          } else if (event.type === 'done') {
            // Interaction complete
          } else if (event.type === 'error') {
            setMessages(prev => [...prev, { type: 'error', code: 'interaction_error', message: event.error || 'Interaction failed' }])
          }
        },
        token,
        new AbortController()
      )
    } catch (error) {
      logger.error('Interaction send failed', error);
      setMessages(prev => [...prev, { type: 'error', code: 'network_error', message: 'Failed to send interaction' }])
    }
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
    const startTime = Date.now();
    logger.info('Sending message', { content: content.substring(0, 50) });

    setMessages(prev => [...prev, { type: 'text', content }]);
    setInput('');
    setIsStreaming(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      await streamingPost(
        'http://localhost:3000/runtime/query',
        { message: content },
        (event) => {
          if (event.type === 'delta' && event.content) {
            // Handle streaming text
          } else if (event.type === 'message' && event.message) {
            setMessages(prev => [...prev, event.message!]);
            logger.info('Received message', { type: event.message!.type });
            // Notify parent about received message (for tests)
            try {
              window.parent.postMessage({ type: 'receivedMessage', message: event.message }, '*')
            } catch (e) {}
          } else if (event.type === 'done') {
            setIsStreaming(false);
            setAbortController(null);
            const duration = Date.now() - startTime;
            logger.performance('message_roundtrip', duration);
          } else if (event.type === 'error') {
            setMessages(prev => [...prev, { type: 'error', code: 'stream_error', message: event.error || 'Streaming error' }]);
            setIsStreaming(false);
            setAbortController(null);
            logger.error('Streaming error', event.error);
            try {
              window.parent.postMessage({ type: 'streamError', error: event.error }, '*')
            } catch (e) {}
          }
        },
        token || undefined,
        controller
      );
    } catch (error) {
      logger.error('Message send failed', error);
      setMessages(prev => [...prev, { type: 'error', code: 'network_error', message: 'Failed to send message' }]);
      setIsStreaming(false);
      setAbortController(null);
      try {
        window.parent.postMessage({ type: 'streamError', error: String(error) }, '*')
      } catch (e) {}
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
            <ImageComponent
              src={message.url}
              alt={message.alt}
              width={message.width}
              height={message.height}
              caption={message.caption}
            />
          </div>
        )
      case 'buttons':
        return (
          <div className="message bot buttons">
            {message.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleInteraction(message.id, opt.value)}
                className="btn secondary"
              >
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
                <div key={idx} style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: 'var(--text)' }}>
                    {field.label}
                    {field.required && <span style={{ color: 'var(--primary)' }}> *</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      required={field.required}
                      rows={3}
                      placeholder={`Enter ${field.label.toLowerCase()}...`}
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                  ) : field.type === 'select' ? (
                    <select name={field.name} required={field.required} style={{ width: '100%' }}>
                      <option value="">Select {field.label.toLowerCase()}...</option>
                      {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <input type="checkbox" name={field.name} required={field.required} />
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      required={field.required}
                      placeholder={`Enter ${field.label.toLowerCase()}...`}
                      style={{ width: '100%' }}
                    />
                  )}
                </div>
              ))}
              <button type="submit" className="btn primary" style={{ width: '100%' }}>
                {message.submitLabel || 'Submit'}
              </button>
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
