import whatsappService from "./whatsappService";

class MessageHandler{
    async handleIncomingMessage(message){
        if(message?.type === 'text'){
            const response = `Echo: ${message.text.body}`;
            await whatsappService.sendMessage(message.from,response,message.id);
            await whatsappService.markAsRead(message.id);
        }
    }
}

export default new MessageHandler();