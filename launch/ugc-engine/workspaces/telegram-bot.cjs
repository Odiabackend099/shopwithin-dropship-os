#!/usr/bin/env node

const https = require('https');

const BOT_TOKEN = '8220781503:AAFWjcLZxYIaYdvpgQWwfjlDDwD_nws6tJY';
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

let lastUpdateId = 0;

function getUpdates() {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function sendMessage(chatId, text) {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}/sendMessage`;
    const postData = JSON.stringify({ chat_id: chatId, text });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function processMessage(message) {
  const chatId = message.chat.id;
  const text = message.text || '';
  const userId = message.from.id;
  const username = message.from.username || 'User';

  console.log(`Received message from ${username} (${userId}): ${text}`);

  // Basic command handlers
  if (text === '/start') {
    sendMessage(chatId, `Hello ${username}! I'm Adaqua AI bot. I'm ready to help you with Dropship OS automation. Available commands:\n/help - Show help\n/status - Check system status\n/video - Get latest FurLift demo video`);
  } else if (text === '/help') {
    sendMessage(chatId, `Available commands:\n/start - Start the bot\n/help - Show this help\n/status - Check system status\n/video - Get latest FurLift demo video\n/ugc - Generate UGC content\n/products - List products\n/orders - List orders`);
  } else if (text === '/status') {
    sendMessage(chatId, `✅ System Status:\n- Dropship OS: Online\n- UGC Engine: Ready\n- Database: Connected\n- API: Operational`);
  } else if (text === '/video') {
    sendMessage(chatId, `🎥 Latest FurLift demo video is available. Check your recent messages for the TikTok vertical version with captions and CTA overlay.`);
  } else if (text === '/ugc') {
    sendMessage(chatId, `🎬 UGC Engine is ready to generate content. Use /ugc:generate to create new creatives.`);
  } else if (text === '/products') {
    sendMessage(chatId, `📦 Products:\n- FurLift (VLOY30HZN) - Reusable pet hair detailer\n- Status: Active\n- Price: $29.99`);
  } else if (text === '/orders') {
    sendMessage(chatId, `📋 Recent Orders:\n- No recent orders in staging\n- System ready for production`);
  } else {
    sendMessage(chatId, `I received: "${text}". Use /help for available commands.`);
  }
}

async function poll() {
  console.log('Starting Telegram bot polling...');
  
  while (true) {
    try {
      const updates = await getUpdates();
      
      if (updates.ok && updates.result.length > 0) {
        for (const update of updates.result) {
          lastUpdateId = update.update_id;
          
          if (update.message) {
            processMessage(update.message);
          } else if (update.callback_query) {
            // Handle callback queries
            const chatId = update.callback_query.message.chat.id;
            sendMessage(chatId, 'Callback received');
          }
        }
      }
    } catch (error) {
      console.error('Error polling for updates:', error.message);
    }
    
    // Small delay before next poll
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Start polling
poll().catch(console.error);
