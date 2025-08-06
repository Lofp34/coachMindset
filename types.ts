
export enum MessageSender {
  User = 'USER',
  AIPersona = 'AI_PERSONA',
  AICoach = 'AI_COACH',
  System = 'SYSTEM',
}

export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
}

export enum AppMode {
  Idle = 'IDLE',
  SimulationSetup = 'SIMULATION_SETUP',
  Simulation = 'SIMULATION',
  Debrief = 'DEBRIEF',
  Journal = 'JOURNAL',
  MentalPrep = 'MENTAL_PREP',
}

export interface SimulationContext {
  topic?: string;
  objective?: string;
  persona?: string;
  fearedObjection?: string;
}

export enum SimulationSetupStep {
  Topic = 'TOPIC',
  Objective = 'OBJECTIVE',
  Persona = 'PERSONA',
  FearedObjection = 'FEARED_OBJECTION',
  Done = 'DONE',
}
