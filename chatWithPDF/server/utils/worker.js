import { Worker } from 'bullmq';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import UploadedFile from '../models/UploadedFile.model.js';
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
        
        // Get file record from database
        const fileRecord = await UploadedFile.findById(data.fileId);
        if (!fileRecord) {
            throw new Error(`File record not found: ${data.fileId}`);
        }
        
        // Skip if already indexed
        if (fileRecord.isIndexed) {
            console.log('File already indexed, skipping:', data.filename);
            return;
        }
        
        const loader = new PDFLoader(data.path);
        const docs = await loader.load();

        const embeddings = new OpenAIEmbeddings({
            model: 'text-embedding-3-small', 
            apiKey: process.env.OPENAI_API_KEY
        });
        
        const collectionName = data.filename;
        console.log('Creating/using collection:', collectionName);

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                url: process.env.QDRANT_URL,
                collectionName: collectionName,
            }
        );

        await vectorStore.addDocuments(docs);
        
        // Mark as indexed in database
        await UploadedFile.findByIdAndUpdate(data.fileId, { isIndexed: true });
        
        console.log('File indexed successfully in collection:', collectionName);
    } catch (error) {
        console.error('Error processing file:', error);
        
        // Mark as failed if needed
        if (data.fileId) {
            await UploadedFile.findByIdAndUpdate(data.fileId, { isIndexed: false });
        }
        
        throw error;
    }
}, {
    connection: {
        host: 'localhost',
        port: 6379,
    },
});

console.log('Worker started and listening for jobs...');

    