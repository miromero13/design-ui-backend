import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Asegúrate de tener esta env var
});

export const openaiProvider = {
    provide: "OPENAI_CLIENT",
    useValue: openai,
};
