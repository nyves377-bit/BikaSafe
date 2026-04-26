import { Router, Request, Response } from 'express';
import { USSDService } from '../services/ussdService';

const router = Router();

/**
 * USSD Entry Point (POST /api/ussd)
 * Expected Payload (Standard USSD format):
 * {
 *   "sessionId": "12345",
 *   "phoneNumber": "+250...",
 *   "text": ""
 * }
 */
router.post('/', async (req: Request, res: Response) => {
    const { sessionId, phoneNumber, text } = req.body;

    if (!sessionId || !phoneNumber) {
        return res.status(400).send("Bad Request: Missing parameters");
    }

    try {
        const response = await USSDService.handleRequest(sessionId, phoneNumber, text);
        res.send(response);
    } catch (error: any) {
        console.error('[USSD Error]', error);
        res.send("END BikaSafe: An error occurred. Please try again later.");
    }
});

export default router;
