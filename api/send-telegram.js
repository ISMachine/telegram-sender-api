// Vercel Serverless Function for Telegram Bot
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { botToken, chatId, message, rawData } = req.body;

    // Validate required parameters
    if (!botToken || !chatId || !message) {
      return res.status(400).json({ 
        error: 'Missing required parameters: botToken, chatId, message' 
      });
    }

    // Send to Telegram API
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const telegramData = await telegramResponse.json();

    if (telegramResponse.ok) {
      // Log successful send
      console.log('✅ Telegram message sent successfully:', {
        messageId: telegramData.result.message_id,
        chatId: chatId,
        timestamp: new Date().toISOString()
      });

      return res.status(200).json({
        success: true,
        messageId: telegramData.result.message_id,
        timestamp: new Date().toISOString(),
        data: rawData
      });
    } else {
      // Telegram API error
      console.error('❌ Telegram API error:', telegramData);
      return res.status(400).json({
        success: false,
        error: 'Telegram API error',
        details: telegramData
      });
    }

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}  
