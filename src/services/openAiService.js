import OpenAI from "openai";
import config from "../config/env.js"

const client = new OpenAI({
    //baseURL: 'https://api.deepseek.com', // Para utilizar deepSeek en lugar de openIa
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: config.CHATGPT_API_KEY,
});

const openAiService = async (message) =>{
    try {
        const response = await client.chat.completions.create({
            messages: [
                {role: 'system', content: 'Comportarte como un mecanico, deberás de resolver las preguntas lo más simple posible, debes dar soluciones respecto a codigos OBD-II. Responde en texto plano, como si fuera una conversación por WhatsApp, no saludes, no generas conversaciones, solo respondes con la pregunta del usuario.'},
                {role: 'user', content: message}
            ],
            model: 'llama-3.3-70b-versatile'
        });
        return response.choices[0].message.content;
    } catch(error){
        console.error(error);
    }
}
// model: "gpt-4o-mini"
// model-deepseek: "deepseek-chat"
// groq: llama-3.3-70b-versatile
export default openAiService;