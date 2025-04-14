import whatsappService from "./whatsappService.js";

class MessageHandler{
    async handleIncomingMessage(message){
        if(message?.type === 'text'){
            const incomingMessage = message.text.body.toLowerCase().trim();
            if (this.isGreating(incomingMessage)) {
                await this.sendWelcomeMessage(message.from, message.id)
            }else{
                const response = `Echo: ${message.text.body}`;
                await whatsappService.sendMessage(message.from,response,message.id);
                await whatsappService.markAsRead(message.id);
            }
            
        }
    }

    isGreating(message){
        const greetings = ["hola","buenas tarde","buenos dias","buenas noches"]

        return greetings.includes(message)
    }

    async sendWelcomeMessage(to, messageId){
        const welcomeMessage = "Hola, Bienvenido a Narnia." + "¿En qué puedo ayudarte hoy?";
        await whatsappService.sendMessage(to, welcomeMessage, messageId);
        await whatsappService.markAsRead(messageId);
    }
}

export default new MessageHandler();