import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY!,
    });

    try {
        const models = await ai.models.list();

        let count = 0;

        for await (const model of models) {
            count++;
            console.log(model.name);
        }

        console.log("Total models:", count);
    } catch (err) {
        console.error(err);
    }
}

main();