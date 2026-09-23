'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Brain, X, Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  role: 'bot' | 'user';
  content: string;
  timestamp: Date;
};

const RULE_BASED_RESPONSES: Record<string, string> = {
  'help': 'I can help with questions about this HR management prototype. Try asking about task assignment, analytics, human review, or privacy controls.',
  'what can you do': 'I can help with questions about this HR management prototype. Try asking about task assignment, analytics, human review, or privacy controls.',
  'task assignment': 'Task assignment uses a transparent, rule-based weighted scoring system. Each available employee is scored on five factors: availability (25%), current workload (25%), skill match (25%), location (15%), and capacity for high-priority work (10%). The top 3 candidates are shown with an explanation, and the supervisor makes the final decision.',
  'how does task assignment work': 'Task assignment uses a transparent, rule-based weighted scoring system. Each available employee is scored on five factors: availability (25%), current workload (25%), skill match (25%), location (15%), and capacity for high-priority work (10%). The top 3 candidates are shown with an explanation, and the supervisor makes the final decision.',
  'human in the loop': 'Human-in-the-Loop (HITL) governance means AI only recommends. Supervisors and HR review every recommendation and can approve, modify, or reject it with a recorded reason. Every decision is logged in the audit trail.',
  'what is human in the loop': 'Human-in-the-Loop (HITL) governance means AI only recommends. Supervisors and HR review every recommendation and can approve, modify, or reject it with a recorded reason. Every decision is logged in the audit trail.',
  'workload': 'The analytics module provides descriptive statistics on workload distribution across employees, task completion trends, and overdue or delayed tasks, helping supervisors spot imbalances for review.',
  'analytics': 'The analytics module provides descriptive statistics on workload distribution across employees, task completion trends, and overdue or delayed tasks, helping supervisors spot imbalances for review.',
  'privacy': 'The prototype uses role-based access control, row-level database security, data minimization, and a complete audit trail. Formal regulatory compliance is treated as future work.',
  'security': 'The prototype uses role-based access control, row-level database security, data minimization, and a complete audit trail. Formal regulatory compliance is treated as future work.',
  'who created this': 'This is an academic research prototype designed to explore the ethical application of AI in human resources and workforce management.',
  'about': 'This is an academic research prototype designed to explore the ethical application of AI in human resources and workforce management.',
  'recommend employee': 'The recommendation process scores available employees on availability, workload, skill match, location, and priority capacity. Each result includes a plain-language explanation, and a human supervisor always makes the final assignment decision.',
  'suggest': 'The recommendation process scores available employees on availability, workload, skill match, location, and priority capacity. Each result includes a plain-language explanation, and a human supervisor always makes the final assignment decision.',
  'machine learning': 'This prototype deliberately uses rule-based, explainable algorithms instead of machine learning. ML-based recommendation is identified as future work once sufficient labeled task-assignment data is available.',
};

const getResponse = (input: string): string => {
  const lowerInput = input.toLowerCase();
  for (const [key, response] of Object.entries(RULE_BASED_RESPONSES)) {
    if (lowerInput.includes(key)) {
      return response;
    }
  }
  return 'I can help with questions about this HR management prototype. Try asking about task assignment, analytics, human review, or privacy controls.';
};

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: "Hello! I'm the WorkSync AI Operations Assistant. I can assist you with frontline task coordination, AI workforce matching, live workload analytics, and supervisory decision review.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: getResponse(userMessage.content),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-xl transition-all duration-300",
          "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-violet-500/25",
          "hover:scale-105 active:scale-95",
          !isOpen && "animate-pulse",
          isOpen && "opacity-0 pointer-events-none scale-90"
        )}
      >
        <Brain className="w-6 h-6 text-white" />
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[400px] h-[500px] flex flex-col",
          "bg-background/80 backdrop-blur-xl border shadow-2xl rounded-2xl overflow-hidden",
          "transition-all duration-300 origin-bottom-right",
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">WorkSync AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Operations & Decision Support Engine</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                "flex flex-col gap-1",
                msg.role === 'user' ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "px-4 py-2 rounded-2xl text-sm",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground rounded-tr-sm" 
                    : "bg-muted rounded-tl-sm"
                )}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-muted/10">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="w-full pl-4 pr-12 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
