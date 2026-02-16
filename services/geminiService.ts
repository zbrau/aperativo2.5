
import { GoogleGenAI } from "@google/genai";
import { MENU_ITEMS } from "../constants";

const apiKey = process.env.API_KEY;

export const getAIRecommendation = async (userQuery: string, history: string[]): Promise<string> => {
    if (!apiKey) {
        return "Lo siento, no puedo conectarme al servidor de IA en este momento.";
    }

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        
        const menuContext = MENU_ITEMS.map(item => 
            `- ${item.name} (${item.price} UC): ${item.description} [${item.category}, ${item.calories} cal]`
        ).join('\n');

        const systemInstruction = `Eres "NutriBot", un asistente virtual amable y servicial para la cafetería de una escuela.
        Tu objetivo es ayudar a los estudiantes y maestros a elegir qué comer basándote en el menú disponible.
        
        IMPORTANTE: La moneda de la escuela son los "Ucol Coins" (UC). No uses el signo de pesos ($), usa "UC" (ejemplo: 35 UC).
        
        MENÚ DISPONIBLE:
        ${menuContext}
        
        REGLAS:
        1. Solo recomienda items que estén en el menú.
        2. Si alguien pregunta por algo que no está (ej. Pizza), sugiere la alternativa más cercana (ej. Mollete).
        3. Sé breve y amigable, estilo chat de app de delivery.
        4. Si te preguntan precios, dálos exactos en UC.
        5. Si te preguntan por opciones saludables, prioriza la categoría 'Saludable' o items bajos en calorías.
        6. Puedes sugerir combos (ej. Mollete + Jugo).
        7. Habla en español mexicano informal pero respetuoso (usa "tú", no "usted", amigable para estudiantes).
        `;

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
            }
        });

        const result = await chat.sendMessage({ message: userQuery });
        return result.text || "Lo siento, no entendí bien.";

    } catch (error) {
        console.error("Error fetching AI response:", error);
        return "Tuve un problema pensando en una recomendación. ¿Podrías intentar de nuevo?";
    }
};
