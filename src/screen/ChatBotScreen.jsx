import React, { useEffect, useRef, useState } from 'react';
import SideBar from '../components/SideBar';
import logo from '../assets/indian.png';
import './DashboardScreen.css';
import './ChatBotScreen.css';

const promptCards = [
    {
        icon: 'fa-solid fa-users',
        tone: 'blue',
        title: 'Leave policy for railway employees',
        category: 'Policy & Rules',
    },
    {
        icon: 'fa-solid fa-clock',
        tone: 'green',
        title: 'Railway hours of work and rest rules',
        category: 'Work & Rest',
    },
    {
        icon: 'fa-solid fa-business-time',
        tone: 'purple',
        title: 'Overtime rules for railway staff',
        category: 'Overtime & Pay',
    },
    {
        icon: 'fa-solid fa-file-lines',
        tone: 'orange',
        title: 'Leave sanction process in railways',
        category: 'Process & Workflow',
    },
];

const normalizeList = (value) => {
    if (!Array.isArray(value)) return [];

    return value
        .map((item) => {
            if (typeof item === 'string') return item.trim();
            if (item && typeof item === 'object') {
                return (item.label || item.title || item.name || item.source || item.text || '').toString().trim();
            }
            return '';
        })
        .filter(Boolean);
};

const renderInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }

        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={index}>{part.slice(1, -1)}</code>;
        }

        return part;
    });
};

function BotContent({ text }) {
    const blocks = String(text || '').split(/\n{2,}/);

    return (
        <div className="bot-content">
            {blocks.map((block, blockIndex) => {
                const lines = block
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean);

                if (!lines.length) return null;

                const isNumbered = lines.every((line) => /^\d+[.)]\s+/.test(line));
                const isBulleted = lines.every((line) => /^[-*]\s+/.test(line));

                if (isNumbered || isBulleted) {
                    return (
                        <ul className="bot-list" key={blockIndex}>
                            {lines.map((line, lineIndex) => (
                                <li key={lineIndex}>{renderInline(line.replace(/^(\d+[.)]|[-*])\s+/, ''))}</li>
                            ))}
                        </ul>
                    );
                }

                return (
                    <p className="bot-para" key={blockIndex}>
                        {lines.map((line, lineIndex) => (
                            <React.Fragment key={lineIndex}>
                                {renderInline(line)}
                                {lineIndex < lines.length - 1 ? ' ' : ''}
                            </React.Fragment>
                        ))}
                    </p>
                );
            })}
        </div>
    );
}

function MessageBubble({ message, onSuggestionClick }) {
    const isUser = message.role === 'user';

    return (
        <div className={`rail-message-row ${isUser ? 'user' : 'bot'}`}>
            {!isUser && (
                <div className="rail-message-avatar">
                    {/* <img src={logo} alt="Rail AI" /> */}
                </div>
            )}

            <div className={`rail-message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
                {isUser ? <p>{message.text}</p> : <BotContent text={message.text} />}

                {!isUser && message.sources?.length > 0 && (
                    <div className="message-meta">
                        <span>Sources</span>
                        <div>
                            {message.sources.map((source, index) => (
                                <small key={index}>{source}</small>
                            ))}
                        </div>
                    </div>
                )}

                {!isUser && message.suggestions?.length > 0 && (
                    <div className="message-meta">
                        <span>Try next</span>
                        <div>
                            {message.suggestions.map((suggestion, index) => (
                                <button type="button" key={index} onClick={() => onSuggestionClick(suggestion)}>
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {isUser && <div className="rail-user-avatar"><i className="fa-solid fa-user"></i></div>}
        </div>
    );
}

function TypingDots() {
    return (
        <div className="rail-message-row bot">
            <div className="rail-message-avatar">
                <img src={logo} alt="Rail AI" />
            </div>
            <div className="typing-bubble">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    );
}

export default function ChatBotScreen() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = async (text = input) => {
        const question = text.trim();
        if (!question || loading) return;

        const userMessage = { role: 'user', text: question, id: Date.now() };

        setInput('');
        setMessages((previous) => [...previous, userMessage]);
        setLoading(true);

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8080/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ question }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            const data = await response.json();

            setMessages((previous) => [
                ...previous,
                {
                    role: 'bot',
                    text: data.answer || data.response || data.message || 'No response received.',
                    sources: normalizeList(data.sources),
                    suggestions: normalizeList(data.suggestions),
                    id: Date.now() + 1,
                },
            ]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((previous) => [
                ...previous,
                {
                    role: 'bot',
                    text: 'Unable to reach the server. Please make sure the chatbot backend is running, then try again.',
                    sources: [],
                    suggestions: [
                        'Leave policy for railway employees',
                        'Railway hours of work and rest rules',
                        'Overtime rules for railway staff',
                    ],
                    id: Date.now() + 1,
                },
            ]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="dashboard-shell">
            <SideBar />

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">Railways Ai</h1>
                        <p style={{ fontSize: '16px' }}>Ask questions related to railway IT services and dashboard data</p>
                    </div>
                </header>

                <section className="chatbot-panel">
                    <div className="chatbot-scroll">
                        {messages.length === 0 && !loading ? (
                            <div className="chatbot-welcome">
                     
                                <h2 className="dashboard-title">Welcome to <span>Railways Ai</span></h2>
                                <p>
                                    Ask about railway rules, employee policies, operations, administration,
                                    or any other Railways query you want answered clearly.
                                </p>

                                <div className="chatbot-prompts">
                                    {/* {promptCards.map((card) => (
                                        <button
                                            type="button"
                                            className="prompt-card"
                                            key={card.title}
                                            onClick={() => sendMessage(card.title)}
                                        >
                                            <strong>{card.title}</strong>
                                            <small>{card.category}</small>
                                        </button>
                                    ))} */}
                                 
                                </div>
                            </div>
                        ) : (
                            <div className="rail-chat-thread">
                                {messages.map((message) => (
                                    <MessageBubble
                                        key={message.id}
                                        message={message}
                                        onSuggestionClick={sendMessage}
                                    />
                                ))}
                                {loading && <TypingDots />}
                                <div ref={bottomRef} />
                            </div>
                        )}
                    </div>

                    <form
                        className="rail-ai-composer"
                        onSubmit={(event) => {
                            event.preventDefault();
                            sendMessage();
                        }}
                    >
                        <span className="composer-tool">
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                        </span>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Ask a railway question..."
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                        <button type="button" className="composer-mic" aria-label="Use microphone">
                            <i className="fa-solid fa-microphone"></i>
                        </button>
                        <button type="submit" className="composer-send" disabled={!input.trim() || loading}>
                            <i className="fa-solid fa-paper-plane"></i>
                            <span>Send</span>
                        </button>
                    </form>

                    <div className="composer-help">Press Enter to send <span></span> Shift + Enter for new line</div>
                </section>
            </main>
        </div>
    );
}
