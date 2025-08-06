
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, MessageSender, AppMode, SimulationContext, SimulationSetupStep } from './types';
import ChatWindow from './components/ChatWindow';
import * as geminiService from './services/geminiService';
import { AICoachIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from './components/icons';

const INITIAL_MESSAGE: Message = {
    id: 'init-1',
    sender: MessageSender.System,
    text: "Bonjour ! Je suis Echo, votre sparring-partner IA. Comment puis-je vous aider aujourd'hui ?\n\nVous pouvez me demander de :\n- **Faire un jeu de rôle** (ex: \"Je veux m'entraîner pour un appel à froid\")\n- **Analyser une conversation** (ex: \"Je veux débriefer un rendez-vous\")\n- **Tenir un journal** (ex: \"Ouvrir mon carnet de bord\")\n- **Vous préparer mentalement** (ex: \"J'ai un appel important dans 5 minutes\")",
    timestamp: new Date().toISOString(),
};

const SIMULATION_SETUP_QUESTIONS: Record<SimulationSetupStep, string> = {
    [SimulationSetupStep.Topic]: "Excellent. Quel est le contexte ? (ex: Appel à froid, Négociation de prix, Gestion d'un client mécontent...)",
    [SimulationSetupStep.Objective]: "Compris. Quel est votre objectif principal pour cet échange ?",
    [SimulationSetupStep.Persona]: "Noté. Maintenant, décrivez le profil de votre interlocuteur. Est-il pressé, analytique, amical, agressif ?",
    [SimulationSetupStep.FearedObjection]: "Parfait. Y a-t-il une objection particulière que vous redoutez ? (ex: C'est trop cher, Je dois en parler à mon boss...)",
    [SimulationSetupStep.Done]: "Très bien, nous sommes prêts. La simulation va commencer. Je jouerai le rôle que vous avez décrit. Vous pouvez commencer à parler.",
};

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [mode, setMode] = useState<AppMode>(AppMode.Idle);
    const [simulationContext, setSimulationContext] = useState<SimulationContext>({});
    const [setupStep, setSetupStep] = useState<SimulationSetupStep>(SimulationSetupStep.Topic);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeechSynthesisEnabled, setIsSpeechSynthesisEnabled] = useState(true);
    
    const addMessage = (sender: MessageSender, text: string) => {
        setMessages(prev => [...prev, {
            id: `msg-${Date.now()}-${Math.random()}`,
            sender,
            text,
            timestamp: new Date().toISOString()
        }]);
    };

    // Effect for Text-to-Speech
    useEffect(() => {
        if (!isSpeechSynthesisEnabled || messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];
        const isAIMessage = lastMessage.sender === MessageSender.AIPersona || lastMessage.sender === MessageSender.AICoach || lastMessage.sender === MessageSender.System;

        if (isAIMessage && lastMessage.id !== 'init-1') {
            const synth = window.speechSynthesis;
            if (synth.speaking) {
                synth.cancel();
            }
            const utterance = new SpeechSynthesisUtterance(lastMessage.text);
            utterance.lang = 'fr-FR';
            synth.speak(utterance);
        }
    }, [messages, isSpeechSynthesisEnabled]);

    const handleSimulationSetup = useCallback((userInput: string) => {
        let nextStep = setupStep;
        const newContext = { ...simulationContext };

        switch (setupStep) {
            case SimulationSetupStep.Topic:
                newContext.topic = userInput;
                nextStep = SimulationSetupStep.Objective;
                break;
            case SimulationSetupStep.Objective:
                newContext.objective = userInput;
                nextStep = SimulationSetupStep.Persona;
                break;
            case SimulationSetupStep.Persona:
                newContext.persona = userInput;
                nextStep = SimulationSetupStep.FearedObjection;
                break;
            case SimulationSetupStep.FearedObjection:
                newContext.fearedObjection = userInput;
                nextStep = SimulationSetupStep.Done;
                break;
        }

        setSimulationContext(newContext);
        setSetupStep(nextStep);

        const aiResponse = SIMULATION_SETUP_QUESTIONS[nextStep];
        addMessage(MessageSender.System, aiResponse);
        
        if (nextStep === SimulationSetupStep.Done) {
            setMode(AppMode.Simulation);
        }
    }, [setupStep, simulationContext]);

    const handleSendMessage = async (text: string) => {
        addMessage(MessageSender.User, text);
        setIsLoading(true);

        try {
            if (text.toLowerCase().includes("fin de la simulation") || text.toLowerCase().includes("arrêter la simulation")) {
                setMode(AppMode.Debrief);
                const conversationHistory = messages.filter(m => m.sender === MessageSender.User || m.sender === MessageSender.AIPersona).map(m => `${m.sender}: ${m.text}`).join('\n');
                addMessage(MessageSender.System, "Simulation terminée. Passons au débriefing.");
                const debriefPrompt = await geminiService.getDebriefResponse(conversationHistory);
                addMessage(MessageSender.AICoach, debriefPrompt);
                setSimulationContext({});
                setSetupStep(SimulationSetupStep.Topic);
                return;
            }

            switch (mode) {
                case AppMode.Idle:
                    const initialResponse = await geminiService.getInitialResponse(text);
                    addMessage(MessageSender.AIPersona, initialResponse.response);
                    if (initialResponse.nextMode === AppMode.SimulationSetup) {
                        setMode(AppMode.SimulationSetup);
                        setSetupStep(SimulationSetupStep.Topic);
                        addMessage(MessageSender.System, SIMULATION_SETUP_QUESTIONS[SimulationSetupStep.Topic]);
                    } else {
                        setMode(initialResponse.nextMode);
                    }
                    break;
                
                case AppMode.SimulationSetup:
                    handleSimulationSetup(text);
                    break;

                case AppMode.Simulation:
                    const simResponse = await geminiService.getSimulationResponse(simulationContext, text);
                    if (simResponse.personaResponse) {
                        addMessage(MessageSender.AIPersona, simResponse.personaResponse);
                    }
                    if (simResponse.coachComment) {
                        addMessage(MessageSender.AICoach, simResponse.coachComment);
                    }
                    break;
                
                case AppMode.Debrief:
                    const debriefResponse = await geminiService.getDebriefResponse(text);
                    addMessage(MessageSender.AICoach, debriefResponse);
                    break;

                default:
                    addMessage(MessageSender.System, "Ce module n'est pas encore entièrement implémenté. Essayez de commencer une simulation.");
                    setMode(AppMode.Idle);
            }
        } catch (error) {
            console.error("Error handling message:", error);
            addMessage(MessageSender.System, "Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSpeechSynthesis = () => {
        setIsSpeechSynthesisEnabled(prev => !prev);
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
    };


    return (
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black h-screen w-screen text-white flex flex-col p-4 md:p-8 font-sans">
            <header className="flex items-center justify-between mb-4 md:mb-6 flex-shrink-0">
                <div className="flex items-center">
                    <AICoachIcon />
                    <h1 className="text-2xl md:text-3xl font-bold ml-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Echo: Votre Sparring-Partner IA
                    </h1>
                </div>
                <button 
                    onClick={toggleSpeechSynthesis} 
                    className="p-2 rounded-full hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                    aria-label={isSpeechSynthesisEnabled ? "Désactiver la synthèse vocale" : "Activer la synthèse vocale"}
                >
                    {isSpeechSynthesisEnabled ? <SpeakerWaveIcon /> : <SpeakerXMarkIcon />}
                </button>
            </header>
            <main className="flex-grow overflow-hidden">
                 <ChatWindow
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                />
            </main>
        </div>
    );
};

export default App;
