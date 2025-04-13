import express from "express";
import webhookController from '../controllers/webhookController';

const router = express.Router();

router.post('/webhook', webhookController.handleIncoming);
router.get('/webhook', webhookController.verifyWebhook);

export default router;