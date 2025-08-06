
import { GoogleGenAI, Type } from "@google/genai";
import { AppMode, SimulationContext } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const salesMindsetPrinciples = `
1.  Cultiver une Résilience à toute épreuve face au Rejet.
2.  Développer une Orientation Client et Valeur.
3.  Renforcer la Confiance en Soi et l'Estime de Soi.
4.  Adopter une Mentalité Proactive et Orientée Objectifs.
5.  Développer un Esprit d'Apprentissage Continu et d'Adaptabilité.
6.  Gérer son Énergie et son Bien-être.
7.  Cultiver l'Abondance et la Gratitude.
`;

const systemInstructionBase = `Vous êtes Echo, un sparring-partner et coach IA pour les professionnels de la vente. Votre but est d'aider les utilisateurs à s'entraîner, à débriefer et à renforcer leur mindset de vente. Vous êtes empathique mais direct, jamais dans le jugement, et toujours orienté vers l'action et l'apprentissage. Vous vous basez sur les 7 principes du mindset de vente: ${salesMindsetPrinciples}`;

export const getInitialResponse = async (userInput: string): Promise<{ nextMode: AppMode; response: string }> => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: `Analyse la demande de l'utilisateur et décide quel module activer. La demande est : "${userInput}"`,
            config: {
                systemInstruction: `${systemInstructionBase}
                Votre rôle est de classifier la demande de l'utilisateur dans l'un des modes suivants : 'IDLE', 'SIMULATION_SETUP', 'DEBRIEF', 'JOURNAL', 'MENTAL_PREP'.
                - Si l'utilisateur veut s'entraîner, faire un jeu de rôle, ou se préparer à une conversation, choisis 'SIMULATION_SETUP'.
                - Si l'utilisateur veut analyser une conversation passée, ou parle d'une journée difficile, choisis 'DEBRIEF'.
                - Si l'utilisateur veut simplement écrire ses pensées, ou parle de "journal", choisis 'JOURNAL'.
                - Si l'utilisateur exprime un stress immédiat avant un événement et a besoin d'un exercice rapide, choisis 'MENTAL_PREP'.
                - Sinon, reste en 'IDLE'.
                Fournis une réponse textuelle pour initier l'interaction dans le mode choisi.`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        nextMode: { type: Type.STRING, enum: Object.values(AppMode) },
                        response: { type: Type.STRING },
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Gemini API error in getInitialResponse:", error);
        return {
            nextMode: AppMode.Idle,
            response: "Désolé, une erreur est survenue. Pourriez-vous reformuler votre demande ?"
        };
    }
};

export const getSimulationResponse = async (context: SimulationContext, userInput: string): Promise<{ personaResponse: string; coachComment: string | null }> => {
    try {
         const response = await ai.models.generateContent({
            model,
            contents: `Le dernier message de l'utilisateur est : "${userInput}"`,
            config: {
                systemInstruction: `${systemInstructionBase}
                Tu joues deux rôles : un personnage dans une simulation de vente et un coach expert.
                Contexte de la simulation :
                - Sujet: ${context.topic}
                - Objectif de l'utilisateur: ${context.objective}
                - Personnage que tu incarnes: ${context.persona}
                - Objection redoutée par l'utilisateur: ${context.fearedObjection}
                
                Instructions :
                1.  En tant que personnage, réponds de manière réaliste et cohérente avec ton profil.
                2.  En tant que coach, si l'utilisateur fait une erreur ou pourrait s'améliorer, fournis un commentaire bref et actionnable en méta (bulle de couleur différente). Le commentaire doit être basé sur les 7 principes du mindset. Si aucune intervention n'est nécessaire, laisse le commentaire vide (null).`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        personaResponse: { type: Type.STRING, description: "La réponse du personnage que tu joues." },
                        coachComment: { type: Type.STRING, description: "Le commentaire du coach (ou null)." }
                    },
                    required: ['personaResponse']
                }
            }
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        // Ensure coachComment is null if it's an empty string
        if (parsedResponse.coachComment === "") {
            parsedResponse.coachComment = null;
        }
        return parsedResponse;
    } catch (error) {
        console.error("Gemini API error in getSimulationResponse:", error);
        return {
            personaResponse: "Désolé, je rencontre un problème pour continuer la simulation. Essayons de reprendre.",
            coachComment: "Il semble y avoir une erreur technique. Cela arrive, l'important est de rester calme et de trouver une solution."
        };
    }
};

export const getDebriefResponse = async (conversation: string): Promise<string> => {
     try {
        const response = await ai.models.generateContent({
            model,
            contents: `Voici la transcription d'une conversation de vente que l'utilisateur veut analyser: "${conversation}"`,
            config: {
                systemInstruction: `${systemInstructionBase}
                Ton rôle est d'agir comme un coach pour le débriefing. N'évalue pas avec une note. Pose des questions socratiques puissantes pour guider l'auto-réflexion de l'utilisateur.
                Exemples de questions:
                - "Quel a été le point de bascule de la conversation, selon vous ?"
                - "À quel moment vous êtes-vous senti le plus (ou le moins) en confiance ? Pourquoi ?"
                - "Quelles sont les 3 choses que vous avez bien faites et que vous devriez systématiser ?"
                - "Quelle est LA leçon à retenir pour la prochaine fois ?"
                Concentre-toi sur ce que l'utilisateur pouvait contrôler.`
            }
        });
        return response.text;
    } catch(error) {
        console.error("Gemini API error in getDebriefResponse:", error);
        return "Désolé, une erreur est survenue lors de l'analyse. Pourrions-nous réessayer ?";
    }
};
