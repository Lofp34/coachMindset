
import React from 'react';
import { Message, MessageSender } from '../types';
import { UserIcon, AIPersonaIcon, AICoachIcon, SystemIcon } from './icons';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === MessageSender.User;
  const isPersona = message.sender === MessageSender.AIPersona;
  const isCoach = message.sender === MessageSender.AICoach;
  const isSystem = message.sender === MessageSender.System;

  const bubbleClasses = {
    base: 'max-w-xl lg:max-w-2xl px-4 py-3 rounded-2xl flex items-start gap-3',
    user: 'bg-blue-600 text-white self-end rounded-br-none',
    persona: 'bg-gray-700 text-gray-200 self-start rounded-bl-none',
    coach: 'bg-amber-500/20 border border-amber-500 text-amber-200 self-start rounded-bl-none',
    system: 'bg-transparent text-gray-400 self-center text-center text-sm italic',
  };

  const containerClasses = {
    base: 'w-full flex mb-4',
    user: 'justify-end',
    persona: 'justify-start',
    coach: 'justify-start',
    system: 'justify-center',
  };

  const Icon = () => {
    switch (message.sender) {
      case MessageSender.User: return <UserIcon />;
      case MessageSender.AIPersona: return <AIPersonaIcon />;
      case MessageSender.AICoach: return <AICoachIcon />;
      case MessageSender.System: return <SystemIcon />;
      default: return null;
    }
  };
  
  const getBubbleStyle = () => {
    if (isUser) return bubbleClasses.user;
    if (isPersona) return bubbleClasses.persona;
    if (isCoach) return bubbleClasses.coach;
    return bubbleClasses.system;
  };
  
  const getContainerStyle = () => {
    if (isUser) return containerClasses.user;
    if (isSystem) return containerClasses.system;
    return containerClasses.persona; // coach and persona align left
  };

  return (
    <div className={`${containerClasses.base} ${getContainerStyle()}`}>
       <div className={`${bubbleClasses.base} ${getBubbleStyle()}`}>
        {!isUser && !isSystem && <div className="flex-shrink-0">{Icon()}</div>}
        <div className="flex-grow whitespace-pre-wrap">{message.text}</div>
        {isUser && !isSystem && <div className="flex-shrink-0">{Icon()}</div>}
      </div>
    </div>
  );
};

export default MessageBubble;
