import { Worker } from 'bullmq';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const worker = new Worker('file-upload-queue', async (job) => {
    console.log('Processing job:', job.id);
    const data = job.data;
    console.log('File uploaded:', data.filename);

    try {
        // Check if file exists before processing
        if (!fs.existsSync(data.path)) {
            throw new Error(`File not found: ${data.path}`);
        }
        
        const loader = new PDFLoader(data.path);
        const docs = await loader.load();

        console.log("-----------------####--------------------")
        console.log(docs[0].metadata.pdf)
        console.log("-----------------####--------------------")

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

        await vectorStore.addDocuments(docs);
        console.log('File indexed:', data.filename);
    } catch (error) {
        console.error('Error processing file:', error);
        throw error;
    }
}, {
    connection: {
        host: 'localhost',
        port: 6379,
    },
});

console.log('Worker started and listening for jobs...');

    