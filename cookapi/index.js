const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv'); // Import dotenv

dotenv.config(); // Load environment variables from .env file
const app = express();
app.use(bodyParser.json());

const apiKey = "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"; // Access the API key from environment variables
const apiUrl = 'https://api.openai.com/v1/chat/completions';
const accessToken = `Bearer ${apiKey}`;

// Enable CORS for all requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'POST');
    return res.status(200).json({});
  }
  next();
});

app.post('/cook_api', async (req, res) => {
  const { cook,country,male,female,childcnt,instruct } = req.body;

  // Generate trip itinerary
  const message = `You are a smart ecommerce cart that is used to assist customer in buying ideal products.
  I want to cook  ${cook} for ${male} adult male, ${female} adult female and ${childcnt} children. specific instructions are ${instruct}. My country is ${country}. List all the neccessary items with ideal quanity and ideal price in rupee and also make total bill.`;

  try {
    const body = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a user.' },
        { role: 'user', content: message },
      ],
      max_tokens: 450,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    };

    const response = await axios.post(apiUrl, body, { headers });
    const parsedResponse = response.data;

    if (!parsedResponse.choices || !parsedResponse.choices[0].message.content) {
      return res.status(500).json({ error: 'Invalid API response' });
    }

    const reply = parsedResponse.choices[0].message.content;
    return res.status(200).json({ event_description: reply });
  } catch (error) {
    console.error('Error calling ChatGPT API:', error.message);
    return res.status(500).json({ error: 'Error calling ChatGPT API' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});