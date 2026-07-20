'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Pickaxe, Send } from 'lucide-react';
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
    <Card className="grid gap-5 bg-[#b9e5ff]/95 dark:bg-[#223d52]/95 lg:grid-cols-[0.78fr_1.22fr]">
      <div className="border-2 border-[#241b15] bg-[#8fd3f4] p-4 shadow-[4px_4px_0_rgba(36,27,21,0.38)] dark:bg-[#31546b]">
        <div className="mb-4 flex items-center gap-3 border-b-4 border-[#315f7a] pb-4 dark:border-[#6b93aa]">
          <span className="border-2 border-[#241b15] bg-[#f5c542] p-2 text-[#2b211a] shadow-[3px_3px_0_#241b15]">
            <Pickaxe className="h-5 w-5" />
          </span>
          <h3 className="text-lg font-black uppercase tracking-wide text-[#17263a] dark:text-[#f6edcf]">
            {text.chatbot.quickPromptTitle}
          </h3>
        </div>

        <div className="space-y-3">
          {text.chatbot.starterPrompts.map((prompt, index) => (
            <button
              key={prompt}
              className="w-full border-2 border-[#241b15] bg-[#c7ebff] p-4 text-left text-sm font-bold leading-6 text-[#17263a] shadow-[3px_3px_0_rgba(36,27,21,0.35)] transition hover:-translate-y-1 hover:bg-[#dff4ff] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#3b627a] dark:text-[#f6edcf] dark:hover:bg-[#49778f]"
              onClick={() => submitMessage(prompt)}
              type="button"
              disabled={isLoading}
            >
              <span className="mr-2 text-[#2f6f28] dark:text-[#9ad483]">0{index + 1}</span>
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="border-2 border-[#241b15] bg-[#6db7df] p-4 shadow-[4px_4px_0_rgba(36,27,21,0.38)] dark:bg-[#172c3b]">
        <div className="mb-4 flex items-center gap-3 border-b-4 border-[#315f7a] pb-3 dark:border-[#4d7892]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#244f69] dark:text-[#a9d8ef]">
              AI consultant terminal
            </p>
            <p className="text-sm font-bold text-[#17263a] dark:text-[#f6edcf]">Online · Ready for a new quest</p>
          </div>
        </div>

        <div
          ref={chatContainerRef}
          className="mb-4 max-h-[420px] space-y-4 overflow-y-auto border-2 border-[#241b15] bg-[#bfe8fb] p-4 pr-2 dark:bg-[#203a4b]"
        >
          {messages.map((message, index) => {
            const isUser = message.role === 'user';
            const avatarSrc = isUser
              ? '/chatbox/avatar.png'
              : '/chatbox/creature.gif';
            const avatarAlt = isUser ? 'User profile' : 'AI Tegar bot';

            return (
              <div
                key={`${message.role}-${index}`}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden border-2 border-[#241b15] shadow-[2px_2px_0_#241b15] ${
                    isUser ? 'bg-[#8fd3f4] dark:bg-[#385d73]' : 'bg-[#d8f0ff] dark:bg-[#2c4859]'
                  }`}
                >
                  <Image
                    src={avatarSrc}
                    alt={avatarAlt}
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 object-cover"
                  />
                </div>

                <div
                  className={`max-w-[85%] border-2 border-[#241b15] p-4 text-sm font-medium leading-6 shadow-[3px_3px_0_rgba(36,27,21,0.35)] ${
                    isUser
                      ? 'bg-[#8fd3f4] text-[#17263a] dark:bg-[#385d73] dark:text-[#f6edcf]'
                      : 'bg-[#d8f0ff] text-[#17263a] dark:bg-[#2c4859] dark:text-[#f6edcf]'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-3 leading-6 last:mb-0">{children}</p>,
                        strong: ({ children }) => (
                          <strong className="font-black text-[#12344a] dark:text-white">{children}</strong>
                        ),
                        h1: ({ children }) => (
                          <h1 className="mb-3 mt-4 text-xl font-black leading-7 text-[#12344a] first:mt-0 dark:text-white">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-3 mt-4 text-lg font-black leading-7 text-[#12344a] first:mt-0 dark:text-white">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-2 mt-4 text-base font-black leading-6 text-[#12344a] first:mt-0 dark:text-white">
                            {children}
                          </h3>
                        ),
                        ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>,
                        li: ({ children }) => <li className="leading-6">{children}</li>,
                        code: ({ children }) => (
                          <code className="border border-[#315f7a] bg-[#8fd3f4] px-1.5 py-0.5 text-xs font-bold text-[#17263a] dark:bg-[#1c3444] dark:text-[#d9effb]">
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
