// In netlify/functions/getAiCompletion.js

exports.handler = async function(event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Get the contentParts sent from the frontend
    const { contentParts } = JSON.parse(event.body);
    
    // Get the secret API key from the environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("API key is not configured.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents: [{ role: "user", parts: contentParts }] }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text || !text.trim()) {
      throw new Error('API returned empty response.');
    }

    // Send the successful result back to the frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ flashcardText: text }),
    };

  } catch (err) {
    console.error('Error in getAiCompletion function:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};