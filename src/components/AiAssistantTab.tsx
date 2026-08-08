import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User as UserIcon, Sparkles, MessageSquare, RefreshCw, Compass, ShieldCheck, MapPin } from 'lucide-react';
import { sendChatMessageApi, fetchChatHistoryApi } from '../services/api';
import { ChatMessage, User } from '../types';
import { DestinationAutocomplete } from './DestinationAutocomplete';
import { FormattedMarkdown } from './FormattedMarkdown';

interface AiAssistantTabProps {
  user: User | null;
  activeCountry: string;
  activeDestination?: string;
  onDestinationChange?: (dest: string) => void;
}

export function AiAssistantTab({
  user,
  activeCountry,
  activeDestination = 'Tokyo, Japan',
  onDestinationChange
}: AiAssistantTabProps) {
  const [conversationId] = useState('conv-default-1');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [destinationContext, setDestinationContext] = useState(activeDestination);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPlaces = [
    'Gujarat, India',
    'Statue of Unity, India',
    'Taj Mahal (Agra), India',
    'New Delhi, India',
    'Kyoto, Japan',
    'Tokyo, Japan',
    'Paris, France',
    'Dubai, United Arab Emirates'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDestinationChange = (newDest: string) => {
    if (!newDest) return;
    const cleanDest = newDest.trim();
    setDestinationContext(cleanDest);
    onDestinationChange?.(cleanDest);

    // Empty previous chat messages completely and display new response for cleanDest
    setMessages([
      {
        id: `msg-init-${Date.now()}`,
        conversationId,
        sender: 'assistant',
        text: `**📍 Active Destination & Profile**
- Hello ${user?.fullName || 'Traveller'}! Nationality: ${user?.nationality || activeCountry} | Travel Style: ${user?.travelStyle || 'Solo'}
- Selected Destination: ${cleanDest}

**🌦️ Live Weather, Safety & Travel Tips**
- I'm ready to help you with local weather updates, attractions, safety tips, and travel guidance for ${cleanDest}.

**💡 Ask me any travel question or pick a suggested topic below!**`,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  useEffect(() => {
    if (activeDestination && activeDestination !== destinationContext) {
      handleDestinationChange(activeDestination);
    }
  }, [activeDestination]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await fetchChatHistoryApi(conversationId);
        if (Array.isArray(history) && history.length > 0) {
          setMessages(history);
        } else {
          // Default initial greeting
          setMessages([
            {
              id: 'msg-init',
              conversationId,
              sender: 'assistant',
              text: `**📍 Active Destination & Profile**
- Hello ${user?.fullName || 'Traveller'}! Nationality: ${user?.nationality || activeCountry} | Travel Style: ${user?.travelStyle || 'Solo'}
- Selected Destination: ${destinationContext}

**🌦️ Live Weather, Safety & Travel Tips**
- I'm ready to help you with local weather updates, attractions, safety tips, and travel guidance for ${destinationContext}.

**💡 Ask me any travel question or pick a suggested topic below!**`,
              timestamp: new Date().toISOString()
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    }
    loadHistory();
  }, [conversationId, user, activeCountry]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (customMsg?: string) => {
    const textToSend = customMsg || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `tmp-${Date.now()}`,
      conversationId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customMsg) setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessageApi({
        conversationId,
        message: textToSend,
        destinationContext
      });

      if (res.assistantMessage) {
        setMessages((prev) => [...prev, res.assistantMessage]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          conversationId,
          sender: 'assistant',
          text: `⚠️ Communication Advisory: ${err.message || 'Error processing query. Fallback intelligence active.'}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    `Is ${destinationContext} safe for solo travellers?`,
    `Emergency contacts and hospital rules in ${destinationContext}`,
    `Public Wi-Fi & VPN safety guidelines in ${destinationContext}`,
    `How to avoid taxi scams & transport traps in ${destinationContext}?`
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[750px]">
      {/* Assistant Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base tracking-tight text-white">
                Tourism AI Assistant
              </h2>
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-400/30">
                AI Guide
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Origin Country: <strong className="text-amber-300">{user?.nationality || activeCountry}</strong> | Target: <strong className="text-white">{destinationContext}</strong>
            </p>
          </div>
        </div>

        {/* Destination autocomplete selector */}
        <div className="w-full sm:w-72">
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-400" /> Active Destination Scope
          </label>
          <DestinationAutocomplete
            value={destinationContext}
            onChange={(val) => handleDestinationChange(val)}
            onSelect={(place) => handleDestinationChange(`${place.name}, ${place.country}`)}
            darkTheme={true}
            placeholder="Search destination..."
          />
        </div>
      </div>

      {/* Quick Destination Chips */}
      <div className="bg-slate-950 text-slate-300 px-4 py-2 text-xs flex flex-wrap items-center gap-1.5 border-b border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
          <Compass className="w-3.5 h-3.5 text-amber-400" /> Switch Scope:
        </span>
        {quickPlaces.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handleDestinationChange(p)}
            className={`text-[11px] px-2.5 py-0.5 rounded-md border transition font-medium ${
              destinationContext === p
                ? 'bg-amber-400 text-slate-950 font-bold border-amber-300'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-amber-300 shadow-md'
              }`}
            >
              {m.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed border shadow-sm ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none font-medium'
                  : 'bg-white text-slate-800 border-slate-200 rounded-tl-none font-sans'
              }`}
            >
              {m.sender === 'user' ? (
                <p className="whitespace-pre-line">{m.text}</p>
              ) : (
                <FormattedMarkdown content={m.text} />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
              <span>Tourism AI is preparing travel insights for {destinationContext}...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200 flex flex-wrap gap-2 items-center">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Suggested Prompts:</span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="text-[11px] bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask AI Assistant about ${destinationContext} safety, weather, news, or travel advice...`}
            className="flex-1 px-4 py-3 bg-slate-50 text-slate-900 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
