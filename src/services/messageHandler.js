import whatsappService from "./whatsappService.js";

class MessageHandler{
    async handleIncomingMessage(message, senderInfo){
        if(message?.type === 'text'){
            const incomingMessage = message.text.body.toLowerCase().trim();
            if (this.isGreating(incomingMessage)) {
                await this.sendWelcomeMessage(message.from, message.id, senderInfo);
                await this.sendWelcomeMenu(message.from);
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
    getSenderName(senderInfo){
        return senderInfo.profile?.name || senderInfo.wa_id || "";
    }

    async sendWelcomeMessage(to, messageId, senderInfo){
        const name = this.getSenderName(senderInfo);
        const firstName = name.split(' ')[0];
        const welcomeMessage = `Hola ${firstName}, Bienvenido a Narnia.` + " ¿En qué puedo ayudarte hoy?";
        await whatsappService.sendMessage(to, welcomeMessage, messageId);
        await whatsappService.markAsRead(messageId);
    }

    async sendWelcomeMenu(to){
        const menuMessage = "Elige una Opción";
        const buttons = [
            {
                type: 'reply',
                reply: { id: 'option_1', title: 'Agendar'}
            },
            {
                type: 'reply',
                reply: { id: 'option_2', title: 'Consultar'}
            },
            {
                type: 'reply',
                reply: { id: 'option_3', title: 'Ubicación'}
            }
        ];
        await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
    }
}

export default new MessageHandler();