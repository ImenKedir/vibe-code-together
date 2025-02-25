'use client';

import { toast } from 'sonner';
import type { Message } from 'ai';
import { useSWRConfig } from 'swr';
import { useChat } from 'ai/react';

import { Artifact } from '@/components/artifact';
import { Messages } from '@/components/messages';
import { ChatHeader } from '@/components/chat-header';
import { MultimodalInput } from '@/components/multimodal-input';
import { useArtifactSelector } from '@/hooks/use-artifact';

export function Chat({
  id,
  initialMessages,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();

  const { messages, setMessages, handleSubmit, input, setInput, append, isLoading, stop, reload } =
    useChat({
      id,
      body: { id },
      initialMessages,
      experimental_throttle: 100,
      sendExtraMessageFields: true,
      onFinish: () => {
        mutate('/api/history');
      },
      onError: error => {
        toast.error('An error occured, please try again!');
      },
    });

  const isArtifactVisible = useArtifactSelector(state => state.isVisible);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader />

        <Messages
          chatId={id}
          isLoading={isLoading}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        isReadonly={isReadonly}
      />
    </>
  );
}
