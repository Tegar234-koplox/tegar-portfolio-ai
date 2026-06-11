'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, Send, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const initialAssistantMessagePatterns = [
  /^halo, saya asisten ai tegar\.?$/i,
  /^hello, i am tegar's ai assistant\.?$/i,
  /jelaskan project yang ingin dibuat/i,
  /saya akan bantu analisis kompleksitas/i,
  /halo, saya asisten ai portfolio tegar/i,
];

function isInitialAssistantMessage(message: Message) {
  return (
    message.role === 'assistant' &&
    initialAssistantMessagePatterns.some((pattern) => pattern.test(message.content.trim()))
  );
}

function removeInitialAssistantMessage(messages: Message[]) {
  return messages.filter((message, index) => {
    const isInitialMessage = index === 0 && isInitialAssistantMessage(message);
    return !isInitialMessage;
  });
}

export function Chatbot() {
  const { language, text } = useLanguage();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: text.chatbot.initialAssistantMessage,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    setMessages((current) => {
      if (current.length === 1 && isInitialAssistantMessage(current[0])) {
        return [
          {
            role: 'assistant',
            content: text.chatbot.initialAssistantMessage,
          },
        ];
      }

      return current;
    });
  }, [text.chatbot.initialAssistantMessage]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const chatContainer = chatContainerRef.current;

    if (!chatContainer) return;

    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  async function submitMessage(message: string) {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) return;

    const nextMessages: Message[] = [
      ...messages,
      {
        role: 'user',
        content: trimmedMessage,
      },
    ];

    const messagesForApi = removeInitialAssistantMessage(nextMessages);

    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-language': language,
        },
        body: JSON.stringify({
          language,
          messages: messagesForApi,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? text.chatbot.requestError);
      }

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: data.reply ?? data.error ?? text.chatbot.fallbackReply,
        },
      ]);
    } catch (error) {
      console.error('CHATBOT_ERROR:', error);

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: text.chatbot.connectionError,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-slate-950 dark:text-white">
          {text.chatbot.quickPromptTitle}
        </h3>

        <div className="space-y-3">
          {text.chatbot.starterPrompts.map((prompt) => (
            <button
              key={prompt}
              className="w-full rounded-2xl border border-slate-200 bg-white/70 p-4 text-left text-sm leading-6 text-slate-700 transition hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-white dark:hover:text-white"
              onClick={() => submitMessage(prompt)}
              type="button"
              disabled={isLoading}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/70">
        <div ref={chatContainerRef} className="mb-4 max-h-[420px] space-y-4 overflow-y-auto pr-2">
          {messages.map((message, index) => {
            const isUser = message.role === 'user';

            return (
              <div
                key={`${message.role}-${index}`}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
                    isUser ? 'bg-slate-700' : 'bg-slate-950 dark:bg-slate-200 dark:text-slate-950'
                  }`}
                >
                  {isUser ? <UserRound className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-6 shadow-sm ${
                    isUser
                      ? 'rounded-tr-sm bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                      : 'rounded-tl-sm bg-white text-slate-700 dark:bg-slate-950 dark:text-slate-200'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-3 leading-6 last:mb-0">{children}</p>,
                        strong: ({ children }) => (
                          <strong className="font-bold text-slate-950 dark:text-white">
                            {children}
                          </strong>
                        ),
                        h1: ({ children }) => (
                          <h1 className="mb-3 mt-4 text-xl font-bold leading-7 text-slate-950 first:mt-0 dark:text-white">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-3 mt-4 text-lg font-bold leading-7 text-slate-950 first:mt-0 dark:text-white">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-2 mt-4 text-base font-bold leading-6 text-slate-950 first:mt-0 dark:text-white">
                            {children}
                          </h3>
                        ),
                        ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>,
                        li: ({ children }) => <li className="leading-6">{children}</li>,
                        code: ({ children }) => (
                          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-line">{message.content}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            submitMessage(input);
          }}
        >
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submitMessage(input);
              }
            }}
            placeholder={text.chatbot.placeholder}
            disabled={isLoading}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? text.chatbot.loadingButton : text.chatbot.sendButton}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
