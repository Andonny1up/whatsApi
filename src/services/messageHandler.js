import whatsappService from "./whatsappService.js";

class MessageHandler{
    async handleIncomingMessage(message, senderInfo){
        if(message?.type === 'text'){
            const incomingMessage = message.text.body.toLowerCase().trim();
            if (this.isGreating(incomingMessage)) {
                await this.sendWelcomeMessage(message.from, message.id, senderInfo);
                await this.sendWelcomeMenu(message.from);
            }else if(incomingMessage === 'media'){
                await this.sendMedia(message.from);
                await whatsappService.markAsRead(message.id);
            }else{
                const response = `Echo: ${message.text.body}`;
                await whatsappService.sendMessage(message.from,response,message.id);
                await whatsappService.markAsRead(message.id);
            }
            
        } else if (message?.type === 'interactive') {
            const option = message?.interactive?.button_reply?.title.toLowerCase().trim();
            await this.handleMenuOption(message.from, option);
            await whatsappService.markAsRead(message.id);
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

    async handleMenuOption(to, option){
        let response;
        console.log('option', option)
        switch (option) {
            case 'agendar':
                response = "Agendar Cita";
                break;
            case 'consultar':
                response = "Realiza Tu consulta";
                break;
            case 'ubicación':
                response = "Esta es nuestra ubicación";
                break;
            default:
                response = "Lo siento, No entendi. Elige una de las opciones del menu";
                break;
        }
        await whatsappService.sendMessage(to,response);
    }

    async sendMedia(to){
        const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-audio.aac';
        const caption = 'Bienvenida';
        const type = 'audio'

        // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-imagen.png';
        // const caption = 'Esto es una imagen';
        // const type = 'image'

        // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4';
        // const caption = 'Esto es un video';
        // const type = 'video'

        // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-file.pdf';
        // const caption = 'Esto es un pdf';
        // const type = 'document'
        await whatsappService.sendMediaMessage(to, type, mediaUrl, caption);

    }
}

export default new MessageHandler();