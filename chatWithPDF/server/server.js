import express from 'express';
import cors from 'cors';
import path from 'path';
import { Queue } from 'bullmq';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import upload from './middlewares/multer.middleware.js';
import OpenAI from 'openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { formatContextArray, formatContextForUI } from './utils/formatContext.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
// amazonq-ignore-next-line
app.use(express.static(path.join(__dirname, 'client')));

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const queue = new Queue('file-upload-queue', {
    connection: {   
      host: 'localhost',
      port: '6379',
    },
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        await queue.add(
            'file-ready',
            {
              filename: req.file.originalname,
              destination: req.file.destination,
              path: req.file.path,
            }
          );
          console.log('File added to queue:', req.file.originalname);

        return res.json({
            success: true,
            message: 'File uploaded successfully',
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Server error during upload' });
    }
});

app.post('/chat', async (req, res) => {
    try {
        const query = req.query.message || req.body.message;
        if (!query) {
            return res.status(400).json({ success: false, message: 'No question provided' });
        }
        const embeddings = new OpenAIEmbeddings({
            model: 'text-embedding-3-small', 
            apiKey: process.env.OPENAI_API_KEY
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                url: process.env.QDRANT_URL,
                collectionName: 'langchainjs-testing',
            }
        );

        const rawContext = await vectorStore.asRetriever({k: 5}).invoke(query);
        const formattedContext = formatContextArray(rawContext);
        const contextForUI = formatContextForUI(rawContext);

        // console.log(context);
        const SYSTEM_PROMPT = `
        You are a helpful assistant that answers questions about a PDF file.
        Go through the context one by one, understand the overall idea of the context.
        Based on your understanding of the context, phrase the answer according to user query.
        
        context:${formattedContext}
        `;
        // console.log(SYSTEM_PROMPT);
        const chatResult = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: query },
            ],
          });

        return res.json({
            success: true,
            message: 'Chat completed successfully',
            answer: chatResult.choices[0].message.content,
            context: formattedContext,
            contextData: contextForUI
        });
       
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ success: false, message: 'Server error during chat' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});