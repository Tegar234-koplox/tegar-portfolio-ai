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

type ChatbotProps = {
  mode?: 'embedded' | 'standalone';
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
    initialAssistantMessagePatterns.some((pattern) =>
      pattern.test(message.content.trim()),
    )
  );
}

function removeInitialAssistantMessage(messages: Message[]) {
  return messages.filter((message, index) => {
    const isInitialMessage =
      index === 0 && isInitialAssistantMessage(message);

    return !isInitialMessage;
  });
}

export function Chatbot({ mode = 'embedded' }: ChatbotProps) {
  const { language, text } = useLanguage();

  const [input, setInput] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
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
      if (
        current.length === 1 &&
        isInitialAssistantMessage(current[0])
      ) {
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

    if (!chatContainer) {
      return;
    }

    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  async function submitMessage(message: string) {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    const nextMessages: Message[] = [
      ...messages,
      {
        role: 'user',
        content: trimmedMessage,
      },
    ];

    const messagesForApi =
      removeInitialAssistantMessage(nextMessages);

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
        throw new Error(
          data.error ?? text.chatbot.requestError,
        );
      }

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            data.reply ??
            data.error ??
            text.chatbot.fallbackReply,
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

  function handleQuickPrompt(prompt: string) {
    if (!prompt || isLoading) {
      return;
    }

    // Kembalikan dropdown ke opsi awal.
    setSelectedPrompt('');

    // Kirim prompt ke chatbot.
    void submitMessage(prompt);
  }

  const renderedMessages = messages.map((message, index) => {
    const isUser = message.role === 'user';

    const avatarSrc = isUser
      ? '/chatbox/avatar.png'
      : '/chatbox/creature.gif';

    const avatarAlt = isUser
      ? 'User profile'
      : 'AI Tegar bot';

    return (
      <div
        key={`${message.role}-${index}`}
        className={`flex w-full min-w-0 items-start gap-2 sm:gap-3 ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div
          className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border-2 border-[#241b15] shadow-[2px_2px_0_#241b15] sm:h-11 sm:w-11 ${
            isUser
              ? 'bg-[#8fd3f4] dark:bg-[#385d73]'
              : 'bg-[#d8f0ff] dark:bg-[#2c4859]'
          }`}
        >
          <Image
            src={avatarSrc}
            alt={avatarAlt}
            width={40}
            height={40}
            unoptimized
            className="h-8 w-8 object-cover sm:h-10 sm:w-10"
          />
        </div>

        <div
          className={`min-w-0 flex-1 break-words border-2 border-[#241b15] p-3 text-sm font-medium leading-6 shadow-[3px_3px_0_rgba(36,27,21,0.35)] sm:flex-none sm:max-w-[85%] sm:p-4 ${
            isUser
              ? 'bg-[#8fd3f4] text-[#17263a] dark:bg-[#385d73] dark:text-[#f6edcf]'
              : 'bg-[#d8f0ff] text-[#17263a] dark:bg-[#2c4859] dark:text-[#f6edcf]'
          }`}
        >
          {message.role === 'assistant' ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-3 break-words leading-6 last:mb-0">
                    {children}
                  </p>
                ),

                strong: ({ children }) => (
                  <strong className="font-black text-[#12344a] dark:text-white">
                    {children}
                  </strong>
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

                ul: ({ children }) => (
                  <ul className="mb-3 list-disc space-y-1 pl-5">
                    {children}
                  </ul>
                ),

                ol: ({ children }) => (
                  <ol className="mb-3 list-decimal space-y-1 pl-5">
                    {children}
                  </ol>
                ),

                li: ({ children }) => (
                  <li className="break-words leading-6">
                    {children}
                  </li>
                ),

                code: ({ children }) => (
                  <code className="break-all border border-[#315f7a] bg-[#8fd3f4] px-1.5 py-0.5 text-xs font-bold text-[#17263a] dark:bg-[#1c3444] dark:text-[#d9effb]">
                    {children}
                  </code>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <p className="whitespace-pre-line break-words">
              {message.content}
            </p>
          )}
        </div>
      </div>
    );
  });

  if (mode === 'standalone') {
    return (
      <div className="flex h-[calc(100dvh-72px)] min-h-0 flex-col bg-[#6db7df] dark:bg-[#172c3b]">
        {/* Quick prompt dropdown */}
        <div className="shrink-0 border-b-4 border-[#241b15] bg-[#8fd3f4] p-3 dark:bg-[#31546b]">
          <label
            htmlFor="quick-prompt"
            className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#17263a] dark:text-[#f6edcf]"
          >
            <span className="border-2 border-[#241b15] bg-[#f5c542] p-1.5 text-[#2b211a] shadow-[2px_2px_0_#241b15]">
              <Pickaxe className="h-4 w-4" />
            </span>

            {text.chatbot.quickPromptTitle}
          </label>

          <div className="relative">
            <select
              id="quick-prompt"
              value={selectedPrompt}
              disabled={isLoading}
              onChange={(event) => {
                const prompt = event.target.value;

                setSelectedPrompt(prompt);
                handleQuickPrompt(prompt);
              }}
              className="w-full cursor-pointer appearance-none border-2 border-[#241b15] bg-[#c7ebff] px-3 py-3 pr-10 text-sm font-bold text-[#17263a] shadow-[3px_3px_0_rgba(36,27,21,0.35)] outline-none transition focus:bg-[#dff4ff] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#3b627a] dark:text-[#f6edcf] dark:focus:bg-[#49778f]"
            >
              <option value="">
                {language === 'id'
                  ? 'Pilih prompt cepat...'
                  : 'Choose a quick prompt...'}
              </option>

              {text.chatbot.starterPrompts.map(
                (prompt, index) => (
                  <option
                    key={prompt}
                    value={prompt}
                  >
                    {`0${index + 1} — ${prompt}`}
                  </option>
                ),
              )}
            </select>

            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-[#17263a] dark:text-[#f6edcf]"
            >
              ▼
            </span>
          </div>
        </div>

        {/* Room chat */}
        <div
          ref={chatContainerRef}
          className="min-h-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto bg-[#bfe8fb] px-3 py-4 dark:bg-[#203a4b]"
        >
          {renderedMessages}

          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border-2 border-[#241b15] bg-[#d8f0ff] shadow-[2px_2px_0_#241b15] dark:bg-[#2c4859]">
                <Image
                  src="/chatbox/creature.gif"
                  alt="AI Tegar bot"
                  width={32}
                  height={32}
                  unoptimized
                  className="h-8 w-8 object-cover"
                />
              </div>

              <div className="border-2 border-[#241b15] bg-[#d8f0ff] px-4 py-3 text-sm font-bold text-[#17263a] shadow-[3px_3px_0_rgba(36,27,21,0.35)] dark:bg-[#2c4859] dark:text-[#f6edcf]">
                {text.chatbot.loadingButton}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          className="shrink-0 border-t-4 border-[#241b15] bg-[#6db7df] p-3 dark:bg-[#172c3b]"
          onSubmit={(event) => {
            event.preventDefault();
            void submitMessage(input);
          }}
        >
          <div className="flex min-w-0 items-end gap-2">
            <Textarea
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  void submitMessage(input);
                }
              }}
              placeholder={text.chatbot.placeholder}
              disabled={isLoading}
              className="min-h-[52px] min-w-0 flex-1 resize-none"
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="h-[52px] shrink-0 px-4"
              aria-label={text.chatbot.sendButton}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <Card className="grid gap-5 bg-[#b9e5ff]/95 dark:bg-[#223d52]/95 lg:grid-cols-[0.78fr_1.22fr]">
      {/* Quick prompts desktop */}
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
          {text.chatbot.starterPrompts.map(
            (prompt, index) => (
              <button
                key={prompt}
                type="button"
                disabled={isLoading}
                onClick={() =>
                  void submitMessage(prompt)
                }
                className="w-full border-2 border-[#241b15] bg-[#c7ebff] p-4 text-left text-sm font-bold leading-6 text-[#17263a] shadow-[3px_3px_0_rgba(36,27,21,0.35)] transition hover:-translate-y-1 hover:bg-[#dff4ff] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#3b627a] dark:text-[#f6edcf] dark:hover:bg-[#49778f]"
              >
                <span className="mr-2 text-[#2f6f28] dark:text-[#9ad483]">
                  0{index + 1}
                </span>

                {prompt}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Chat desktop */}
      <div className="min-w-0 border-2 border-[#241b15] bg-[#6db7df] p-2.5 shadow-[4px_4px_0_rgba(36,27,21,0.38)] dark:bg-[#172c3b] sm:p-4">
        <div className="mb-4 flex items-center gap-3 border-b-4 border-[#315f7a] pb-3 dark:border-[#4d7892]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#244f69] dark:text-[#a9d8ef]">
              AI consultant terminal
            </p>

            <p className="text-sm font-bold text-[#17263a] dark:text-[#f6edcf]">
              Online · Ready for a new quest
            </p>
          </div>
        </div>

        <div
          ref={chatContainerRef}
          className="mb-4 max-h-[420px] min-w-0 space-y-4 overflow-x-hidden overflow-y-auto border-2 border-[#241b15] bg-[#bfe8fb] p-2 dark:bg-[#203a4b] sm:p-4 sm:pr-2"
        >
          {renderedMessages}
        </div>

        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submitMessage(input);
          }}
        >
          <Textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey
              ) {
                event.preventDefault();
                void submitMessage(input);
              }
            }}
            placeholder={text.chatbot.placeholder}
            disabled={isLoading}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading
              ? text.chatbot.loadingButton
              : text.chatbot.sendButton}

            <Send className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}