import type {
    IAgentRuntime,
    Memory,
    State,
    Evaluator,
} from "@eliza/core";

/**
 * Evaluator to check if a message requires a response
 */
export const shouldRespondEvaluator: Evaluator = {
    name: "SHOULD_RESPOND",
    similes: ["NEEDS_RESPONSE", "REQUIRES_REPLY", "SHOULD_ANSWER"],
    description: "Evaluates whether the agent should respond to an OpenChat message",
    
    validate: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<boolean> => {
        // Always validate for OpenChat messages
        return message.content?.source === "openchat";
    },
    
    handler: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<any> => {
        try {
            const text = message.content?.text?.toLowerCase() || "";
            const agentName = runtime.character?.name?.toLowerCase() || "";
            
            // Check if message mentions the agent
            const isMentioned = text.includes(agentName) || text.includes("@" + agentName);
            
            // Check if it's a direct message
            const isDirect = message.content?.metadata?.isDirect === true;
            
            // Check if it's a question
            const isQuestion = text.includes("?") || 
                text.startsWith("what") ||
                text.startsWith("how") ||
                text.startsWith("why") ||
                text.startsWith("when") ||
                text.startsWith("where") ||
                text.startsWith("who");
            
            // Check if message is longer than 10 characters (avoid spam)
            const isSubstantial = text.length > 10;
            
            // Check if it's a command
            const isCommand = text.startsWith("/");
            
            const shouldRespond = (isMentioned || isDirect || isQuestion || isCommand) && isSubstantial;
            
            return {
                shouldRespond,
                reason: shouldRespond 
                    ? isMentioned ? "mentioned" 
                    : isDirect ? "direct_message"
                    : isQuestion ? "question"
                    : isCommand ? "command"
                    : "general"
                    : "not_relevant",
            };
        } catch (error) {
            runtime.logger?.error("Error in shouldRespondEvaluator", error);
            return { shouldRespond: false, reason: "error" };
        }
    },
};

/**
 * Evaluator to assess conversation sentiment
 */
export const sentimentEvaluator: Evaluator = {
    name: "SENTIMENT",
    similes: ["EMOTION", "MOOD", "FEELING"],
    description: "Evaluates the sentiment of an OpenChat conversation",
    
    validate: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<boolean> => {
        return message.content?.source === "openchat";
    },
    
    handler: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<any> => {
        try {
            const text = message.content?.text?.toLowerCase() || "";
            
            // Simple sentiment analysis
            const positiveWords = ["good", "great", "awesome", "excellent", "love", "thanks", "thank", "amazing", "wonderful", "happy"];
            const negativeWords = ["bad", "terrible", "hate", "angry", "sad", "disappointed", "awful", "horrible", "angry"];
            
            let positiveCount = 0;
            let negativeCount = 0;
            
            for (const word of positiveWords) {
                if (text.includes(word)) positiveCount++;
            }
            
            for (const word of negativeWords) {
                if (text.includes(word)) negativeCount++;
            }
            
            let sentiment = "neutral";
            if (positiveCount > negativeCount) {
                sentiment = "positive";
            } else if (negativeCount > positiveCount) {
                sentiment = "negative";
            }
            
            return {
                sentiment,
                confidence: Math.abs(positiveCount - negativeCount) / (positiveCount + negativeCount + 1),
                positiveCount,
                negativeCount,
            };
        } catch (error) {
            runtime.logger?.error("Error in sentimentEvaluator", error);
            return { sentiment: "neutral", confidence: 0 };
        }
    },
};

/**
 * Evaluator to detect conversation topics
 */
export const topicEvaluator: Evaluator = {
    name: "TOPIC",
    similes: ["SUBJECT", "THEME", "CONTEXT"],
    description: "Identifies the topic of an OpenChat conversation",
    
    validate: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<boolean> => {
        return message.content?.source === "openchat";
    },
    
    handler: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<any> => {
        try {
            const text = message.content?.text?.toLowerCase() || "";
            
            // Topic detection based on keywords
            const topics = {
                technical: ["code", "programming", "bug", "error", "api", "function", "database", "server"],
                crypto: ["token", "wallet", "blockchain", "crypto", "nft", "defi", "icp", "btc", "eth"],
                social: ["hello", "hi", "how are you", "what's up", "bye", "goodbye"],
                help: ["help", "assist", "support", "how to", "guide", "tutorial"],
                general: [],
            };
            
            const detectedTopics: string[] = [];
            
            for (const [topic, keywords] of Object.entries(topics)) {
                for (const keyword of keywords) {
                    if (text.includes(keyword)) {
                        detectedTopics.push(topic);
                        break;
                    }
                }
            }
            
            return {
                topics: detectedTopics.length > 0 ? detectedTopics : ["general"],
                primaryTopic: detectedTopics[0] || "general",
            };
        } catch (error) {
            runtime.logger?.error("Error in topicEvaluator", error);
            return { topics: ["general"], primaryTopic: "general" };
        }
    },
};

export const evaluators = [
    shouldRespondEvaluator,
    sentimentEvaluator,
    topicEvaluator,
];
