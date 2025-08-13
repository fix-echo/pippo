"use client"

import React, { Fragment, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation"
import { Source, Sources, SourcesContent, SourcesTrigger } from "@/components/ai-elements/source"
import { Message, MessageContent } from "@/components/ai-elements/message"
import { Response } from "@/components/ai-elements/response"
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning"
import { Loader } from "@/components/ai-elements/loader"
import { PromptInput, PromptInputButton, PromptInputModelSelect, PromptInputModelSelectContent, PromptInputModelSelectItem, PromptInputModelSelectTrigger, PromptInputModelSelectValue, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar, PromptInputTools } from "@/components/ai-elements/prompt-input"
import { GlobeIcon } from "lucide-react"
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion"

const models = [
  {
    name: 'GTP 4o',
    value: 'openai/gpt-4o'
  },
  {
    name: 'DeepSeek R1',
    value: 'deepseek/deepseek-r1'
  }
]

const suggestions = [
  'Can you explain how to play tennis?',
  'What is the weather in Tokyo?',
  'How do I make a really good fish taco?',
];

const ChatBot = () => {
  const [input, setInput] = useState('')
  const [model, setModel] = useState<string>(models[0].value)
  const [webSearch, setWebSearch] = useState(false)
  const {messages, sendMessage, status} = useChat()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if(input.trim()){
      sendMessage(
        {text: input},
        {
          body: {
            model: model,
            webSearch: webSearch
          }
        }
      )
      setInput('')
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion }, {
      body: {
        model: model,
        webSearch: webSearch
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {
              messages.map((message) => (
                <div key={message.id}>
                  {
                    message.role === 'assistant' && message.parts.some((part) => part.type === 'source-url') && (
                      <Sources>
                      <SourcesTrigger
                        count={
                          message.parts.filter(
                            (part) => part.type === 'source-url',
                          ).length
                        }
                      />
                      {message.parts.map((part, i) => {
                        switch (part.type) {
                          case 'source-url':
                            return (
                              <SourcesContent key={`${message.id}-${i}`}>
                                <Source
                                  key={`${message.id}-${i}`}
                                  href={part.url}
                                  title={part.url}
                                />
                              </SourcesContent>
                            );
                        }
                      })}
                    </Sources>
                    )
                  }

                  <Message from={message.role} key={message.id}>
                    <MessageContent>
                      {
                        message.parts.map((part, i) => {
                          switch(part.type){
                            case 'text':
                              return (
                                <Response key={`${message.id}-${i}`}>{part.text}</Response>
                              )
                            case 'reasoning':
                              return (
                                <Reasoning key={`${message.id}-${i}`} className="w-full" isStreaming={status === 'streaming'}>
                                  <ReasoningTrigger />
                                  <ReasoningContent>{part.text}</ReasoningContent>
                                </Reasoning>
                              )
                            default:
                              return null
                          }
                        })
                      }
                    </MessageContent>
                  </Message>
                </div>
              ))
            }
            {status === 'submitted' && <Loader />}
          </ConversationContent>
        </Conversation>
        <Suggestions>
            {suggestions.map((suggestion) => (
              <Suggestion
                key={suggestion}
                onClick={handleSuggestionClick}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>

        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputTextarea onChange={(e) => setInput(e.target.value)} value={input} />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputButton variant={webSearch ? 'default': 'ghost'} onClick={()=> setWebSearch(!webSearch)}>
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputModelSelect onValueChange={(value) => {
                setModel(value)
              }}
              value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model)=> (
                    <PromptInputModelSelectItem key={model.value} value={model.value}>
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  )
}

export default ChatBot