// Vercel Serverless Function for Telegram Bot with better CORS
export default async function handler(req, res) {
  // Enhanced CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle both GET and POST requests
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'API is working',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { botToken, chatId, message, rawData } = req.body;

    // Validate required parameters
    if (!botToken || !chatId || !message) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['botToken', 'chatId', 'message']
      });
    }

    console.log('Sending to Telegram:', { chatId, messageLength: message.length });

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
      console.log('✅ Telegram message sent:', telegramData.result.message_id);
      
      return res.status(200).json({
        success: true,
        messageId: telegramData.result.message_id,
        timestamp: new Date().toISOString(),
        chatId: chatId
      });
    } else {
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
