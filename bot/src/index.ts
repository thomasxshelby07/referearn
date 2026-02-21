import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import TelegramBot from 'node-telegram-bot-api';
import { connectDB } from './config/db';
import { redis } from './config/redis';
import { setupCommands } from './bot/commands';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Database
connectDB();

const token = process.env.BOT_TOKEN || '';

if (!token || token === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
    console.warn("⚠️ BOT_TOKEN is missing or not configured correctly in .env!");
}

// Dev Mode: Polling. Prod Mode: Webhook.
const isProd = process.env.NODE_ENV === 'production';
export const bot = new TelegramBot(token, { polling: !isProd });

// Initialize Commands and Menus
setupCommands(bot);

// Initialize Workers
import './workers/broadcast';

if (isProd) {
    const webhookUrl = process.env.WEBHOOK_URL || '';
    bot.setWebHook(`${webhookUrl}/bot${token}`);

    app.post(`/bot${token}`, (req, res) => {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    });
} else {
    console.log('Bot is running in Long-Polling mode...');
}

// Basic Health Check Route
app.get('/', (req, res) => res.send('Cricknowbot Server Running'));


app.listen(PORT, () => {
    console.log(`Bot Server running on port ${PORT}`);
});
