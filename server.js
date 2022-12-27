import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch';  // Install and require node-fetch to make HTTP requests in Node.js
import xml2js from 'xml2js';
import fs from 'fs';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,  // Replace with your OpenAI API key
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());

app.get('/', async (req, res) => {
  try {
    // Fetch the RSS feed and parse the XML
    const rssUrl = 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pIUWlnQVAB/sections/CAQiQ0NCQVNMQW9JTDIwdk1EZGpNWFlTQW1WdUdnSlZVeUlOQ0FRYUNRb0hMMjB2TUcxcmVpb0pFZ2N2YlM4d2JXdDZLQUEqKggAKiYICiIgQ0JBU0Vnb0lMMjB2TURkak1YWVNBbVZ1R2dKVlV5Z0FQAVAB?hl=en-US&gl=US&ceid=US:en';  // Replace with the URL of the RSS feed
    const rssData = await fetch(rssUrl)
      .then(response => response.text())
      .then(str => xml2js.parseStringPromise(str));  // Use parseStringPromise to parse the XML

    // Extract the title of the first item in the RSS feed
    const title = rssData.rss.channel[0].item[0].title[0];

    // Use the title as an input for the OpenAI API request
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Write a blog article about the following topic with the focus on AI: ${title}`,
      temperature: 0,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });

    // Write the response from the OpenAI API to an XML file
    fs.writeFileSync('title.xml', response.data.choices[0].text, 'utf8');

    // Send a success message to the client
    res.status(200).send({
      message: `${title}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

app.listen(5000, () => console.log('Server is running on port http://localhost:5000'));

