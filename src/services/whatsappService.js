import axios from "axios";
import config from "../config/env";

class WhatsAppService{
    async sendMessage(to, body, messageId){
        try {
            await axios({
                method: "POST",
                url: `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
                headers: {
                    Authorization: `Bearer ${config.API_TOKEN}`,
                },
                data: {
                    messaging_product: "whatsapp",
                    to: to,
                    text: { body: body },
                    // el context es para replicar a el mensaje (Dar responder)
                    context: {
                      message_id: messageId,
                    },
                },
            })
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
    async markAsRead(messageId){
        try {
            await axios({
                method: "POST",
                url: `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
                headers: {
                    Authorization: `Bearer ${config.API_TOKEN}`,
                },
                data: {
                    messaging_product: "whatsapp",
                    status: "read",
                    message_id: messageId,
                },
            })
            
        } catch (error) {
            console.error('Error marking message as read:',error)
        }
    }
}

export default new WhatsAppService();