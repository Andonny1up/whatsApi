import openAiService from "./openAiService.js";
import whatsappService from "./whatsappService.js";

class MessageHandler{

    constructor(){
        this.appointmentState = {};
        this.assistandState = {};
    }
    async handleIncomingMessage(message, senderInfo){
        if(message?.type === 'text'){
            const incomingMessage = message.text.body.toLowerCase().trim();
            if (this.isGreating(incomingMessage)) {
                await this.sendWelcomeMessage(message.from, message.id, senderInfo);
                await this.sendWelcomeMenu(message.from);
            }else if(incomingMessage === 'media'){
                await this.sendMedia(message.from);
                await whatsappService.markAsRead(message.id);
            }else if (this.appointmentState[message.from]){
                await this.handleAppointmentFlow(message.from, incomingMessage);     
            }else if(this.assistandState[message.from]){
                await this.handleAssistandFlow(message.from, incomingMessage)
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
                this.appointmentState[to] = { step: 'name' }
                response = "Por favor, ingresa tu nombre:";
                break;
            case 'consultar':
                this.assistandState[to] = { step: 'question' };
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

    completeAppointment(to){
        const appointment = this.appointmentState[to];
        delete this.appointmentState[to];

        const userData = [
            to,
            appointment.name,
            appointment.petName,
            appointment.petType,
            appointment.reason,
            new Date().toISOString
        ]
        console.log(userData);

        return `Gracias por agendar tu cita.
        Resumen:
        
        Nombre: ${appointment.name}
        Nombre de la mascota: ${appointment.petName}
        Tipo de mascota: ${appointment.petType}
        Razon: ${appointment.reason}
        Nos pondremos en contacto contigo de inmediato.
        `
    }
    async handleAppointmentFlow(to, message){
        const state = this.appointmentState[to];
        let response;
        switch (state.step) {
            case 'name':
                state.name = message;
                state.step = 'petName';
                response = 'Gracias, ¿Cual es el nombre de tu mascota?';
                break;
            case 'petName':
                state.petName = message;
                state.step = 'petType';
                response = 'Que tipo de mascota es? perro-gato';
                break
            case 'petType':
                state.petType = message;
                state.step = 'reason';
                response = '¿motivo de la consulta?';
                break
            case 'reason':
                state.reason = message;
                response = this.completeAppointment(to);
                break
            default:
                break;
        }
        await whatsappService.sendMessage(to,response);
    }
    async handleAssistandFlow(to, message){
        const state = this.assistandState[to];
        let response;
        const menuMessage = "¿La respuesta fue de ayuda?"
        const buttons = [
            {type: 'reply', reply: {id: 'option_ia_1', title:"Si, Gracias"}},
            {type: 'reply', reply: {id: 'option_ia_2', title:"Preguntar Denuevo"}}
        ]

        if (state.step == 'question') {
            response = await openAiService(message);
        }

        delete this.assistandState[to];
        await whatsappService.sendMessage(to, response);
        await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);

    }
}

export default new MessageHandler();