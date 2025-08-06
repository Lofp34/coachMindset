import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import { SendIcon, MicrophoneIcon } from './icons';

// Add type definitions for Web Speech API to fix TypeScript errors.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: any) => void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMessageSentRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';

    recognition.onresult = (event) => {
      // Ne pas traiter les résultats si un message vient d'être envoyé
      if (isMessageSentRef.current) {
        return;
      }
      
      let finalTranscript = '';
      let interimTranscript = '';
      
      // Récupérer tous les résultats finaux depuis le début
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      // Récupérer les résultats intermédiaires (non finaux)
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (!event.results[i].isFinal) {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      // Mettre à jour le texte avec la transcription finale + intermédiaire
      const fullText = finalTranscript + interimTranscript;
      setInputText(fullText);
      
      // Scroll automatiquement à la fin du texte
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.scrollLeft = inputRef.current.scrollWidth;
        }
      }, 0);
    };

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      // Marquer qu'un message est en cours d'envoi
      isMessageSentRef.current = true;
      
      // Arrêter la reconnaissance vocale si elle est active
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      onSendMessage(inputText);
      setInputText('');
      
      // Réinitialiser le flag après un court délai pour éviter les résultats en attente
      setTimeout(() => {
        isMessageSentRef.current = false;
      }, 500);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Réinitialiser le flag si on commence une nouvelle reconnaissance
      isMessageSentRef.current = false;
      recognitionRef.current.start();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
      <div className="flex-grow p-6 overflow-y-auto">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
            <div className="flex justify-start mb-4">
                <div className="max-w-xl px-4 py-3 rounded-2xl flex items-center gap-3 bg-gray-700 text-gray-200 self-start rounded-bl-none">
                    <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-0"></div>
                    </div>
                    <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                    </div>
                    <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-gray-900/80 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={toggleListening}
            className={`flex-shrink-0 text-white rounded-full p-3 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 ${isListening ? 'bg-red-600 animate-pulse' : 'bg-gray-600 hover:bg-gray-500'}`}
            aria-label={isListening ? "Arrêter l'enregistrement" : "Commencer l'enregistrement vocal"}
          >
            <MicrophoneIcon />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              // Scroll automatiquement à la fin lors de la saisie manuelle
              setTimeout(() => {
                if (inputRef.current) {
                  inputRef.current.scrollLeft = inputRef.current.scrollWidth;
                }
              }, 0);
            }}
            placeholder={isListening ? "Écoute en cours..." : "Écrivez votre message à Echo..."}
            className="flex-grow bg-gray-700 text-gray-200 placeholder-gray-400 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition duration-300"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
            aria-label="Envoyer le message"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;