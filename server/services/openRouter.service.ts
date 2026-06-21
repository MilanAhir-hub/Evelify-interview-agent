import OpenAI from "openai";
import { z } from "zod";

let clientInstance: OpenAI | null = null;

const getClient = () => {
    if (!clientInstance) {
        clientInstance = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
        });
    }
    return clientInstance;
};

export type Message = {
    role: "system" | "user" | "assistant";
    content: string;
};

//Normal AI Response

export const askAi = async (messages: Message[]) => {
    try {
        const client = getClient();
        const completion = await client.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages,
        });

        const response = completion.choices[0]?.message?.content || "";

        return response;

    } catch (error: any) {
        console.error("AI Error:", error.message);
        return null;
    }
};

//Streaming response

export const streamAi = async ({
    messages,
    onChunk,
}: {
    messages: Message[];
    onChunk: (chunk: string) => void;
}) => {
    try {
        const client = getClient();
        const stream = await client.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages,
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;

            if (content) {
                onChunk(content);
            }
        }

    } catch (error: any) {
        console.error("Streaming Error:", error.message);
    }
};

// JSON Schema Validation and single retry logic
export const askAiJson = async <T>(
    messages: Message[],
    schema: z.ZodSchema<T>,
    retryCount = 0
): Promise<T> => {
    const rawResponse = await askAi(messages);
    if (!rawResponse) {
        throw new Error("Failed to get response from AI");
    }

    let jsonStr = rawResponse.trim();
    if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    }

    // Try to extract JSON if it has other surrounding text
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
        jsonStr = jsonMatch[0];
    }

    try {
        const parsed = JSON.parse(jsonStr);
        const validated = schema.parse(parsed);
        return validated;
    } catch (error: any) {
        console.error(`[AI:JSON_PARSE_ERROR] Failed parsing/validating AI response (Attempt ${retryCount + 1}). Error: ${error.message}`);
        
        if (retryCount === 0) {
            console.log("[AI:RETRY] Retrying AI query with stricter formatting constraints...");
            
            const retryMessages: Message[] = [
                ...messages,
                {
                    role: "assistant",
                    content: rawResponse
                },
                {
                    role: "user",
                    content: `Your previous response was invalid. It failed validation with error: "${error.message}". Please regenerate the response and output ONLY valid, raw JSON that strictly conforms to the expected structure. No markdown backticks, no notes, no commentary.`
                }
            ];

            return askAiJson(retryMessages, schema, 1);
        }

        throw new Error(`AI JSON validation failed after retry: ${error.message}`);
    }
};