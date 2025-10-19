// Stub types for @eliza/core for development
// These will be replaced by the actual types when installed in an ElizaOS project

declare module "@eliza/core" {
  export interface Memory {
    id?: string;
    userId?: any;
    agentId?: any;
    roomId?: any;
    content?: {
      text?: string;
      source?: string;
      metadata?: any;
      [key: string]: any;
    };
    createdAt?: number;
    [key: string]: any;
  }

  export interface State {
    [key: string]: any;
  }

  export interface HandlerCallback {
    (response: any): void;
  }

  export interface Action {
    name: string;
    similes?: string[];
    description: string;
    validate: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<boolean>;
    handler: (
      runtime: IAgentRuntime,
      message: Memory,
      state?: State,
      options?: any,
      callback?: HandlerCallback
    ) => Promise<boolean>;
    examples: any[][];
  }

  export interface Provider {
    get: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<string>;
  }

  export interface Evaluator {
    name: string;
    similes?: string[];
    description: string;
    validate: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<boolean>;
    handler: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<any>;
  }

  export interface Plugin {
    name: string;
    description: string;
    actions?: Action[];
    providers?: Provider[];
    evaluators?: Evaluator[];
    init?: (runtime: IAgentRuntime) => Promise<void>;
  }

  export interface IAgentRuntime {
    agentId?: any;
    character?: Character;
    clients?: any[];
    logger?: {
      info: (message: string, ...args: any[]) => void;
      error: (message: string, ...args: any[]) => void;
      warn: (message: string, ...args: any[]) => void;
      debug: (message: string, ...args: any[]) => void;
      success?: (message: string, ...args: any[]) => void;
    };
    messageManager?: {
      addEmbeddingToMemory: (memory: Memory) => Promise<void>;
      createMemory: (memory: Memory) => Promise<void>;
    };
    composeState?: (message: Memory) => Promise<State>;
    generateText?: (options: any) => Promise<string>;
    [key: string]: any;
  }

  export interface Character {
    name: string;
    plugins?: (Plugin | string)[];
    bio?: string | string[];
    lore?: string[];
    messageExamples?: any[][];
    postExamples?: any[];
    topics?: string[];
    adjectives?: string[];
    style?: {
      all?: string[];
      chat?: string[];
      post?: string[];
    };
    [key: string]: any;
  }

  export class AgentRuntime implements IAgentRuntime {
    agentId?: any;
    character?: Character;
    clients?: any[];
    logger?: any;
    messageManager?: any;
    constructor(options: { character: Character; [key: string]: any });
    initialize(): Promise<void>;
    composeState(message: Memory): Promise<State>;
    generateText(options: any): Promise<string>;
  }
}
