import { Queue } from 'bullmq';
import OpenAI from 'openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { formatContextArray, formatContextForUI } from './utils/formatContext.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const queue = new Queue('file-upload-queue', {
    connection: {   
      host: 'localhost',
      port: '6379',
    },
});

const addFileToQueue = async (req, res) => {
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
};

const chat = async(req, res) => {
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
};

export { addFileToQueue, chat };
