import OpenAI from "openai";

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