import { Queue } from 'bullmq';
import OpenAI from 'openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { formatContextArray, formatContextForUI } from '../utils/formatContext.js';
import UploadedFile from '../models/UploadedFile.model.js';
import Chat from '../models/Chat.model.js';
import crypto from 'crypto';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

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

        const userId = req.user.id;
        const fileBuffer = fs.readFileSync(req.file.path);
        const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        
        // Check if file already exists for this user
        const existingFile = await UploadedFile.findOne({ 
            userId, 
            fileHash 
        });
        
        if (existingFile) {
            // Remove the newly uploaded duplicate file
            fs.unlinkSync(req.file.path);
            
            return res.json({
                success: true,
                message: 'File already exists and is indexed',
                fileData: {
                    id: existingFile._id,
                    filename: existingFile.originalName,
                    collectionName: existingFile.collectionName,
                    isIndexed: existingFile.isIndexed,
                    uploadedAt: existingFile.createdAt
                }
            });
        }
        
        // Create file record
        const uploadedFile = new UploadedFile({
            userId,
            filename: req.file.filename,
            originalName: req.file.originalname,
            fileType: 'pdf',
            filePath: req.file.path,
            fileSize: req.file.size,
            collectionName: req.file.originalname,
            fileHash,
            isIndexed: false
        });
        
        await uploadedFile.save();
        
        // Process file immediately instead of using queue
        try {
            const { PDFLoader } = await import('@langchain/community/document_loaders/fs/pdf');
            const { OpenAIEmbeddings } = await import('@langchain/openai');
            const { QdrantVectorStore } = await import('@langchain/qdrant');
            
            const loader = new PDFLoader(req.file.path);
            const docs = await loader.load();

            const embeddings = new OpenAIEmbeddings({
                model: 'text-embedding-3-small', 
                apiKey: process.env.OPENAI_API_KEY
            });
            
            const vectorStore = await QdrantVectorStore.fromExistingCollection(
                embeddings,
                {
                    url: process.env.QDRANT_URL,
                    collectionName: req.file.originalname,
                }
            );

            await vectorStore.addDocuments(docs);
            
            // Mark as indexed
            await UploadedFile.findByIdAndUpdate(uploadedFile._id, { isIndexed: true });
            
            console.log('File indexed successfully:', req.file.originalname);
            
            return res.json({
                success: true,
                message: 'File uploaded and indexed successfully',
                fileData: {
                    id: uploadedFile._id,
                    filename: uploadedFile.originalName,
                    collectionName: uploadedFile.collectionName,
                    isIndexed: true,
                    uploadedAt: uploadedFile.createdAt
                }
            });
        } catch (indexError) {
            console.error('Indexing error:', indexError);
            
            return res.json({
                success: true,
                message: 'File uploaded but indexing failed',
                fileData: {
                    id: uploadedFile._id,
                    filename: uploadedFile.originalName,
                    collectionName: uploadedFile.collectionName,
                    isIndexed: false,
                    uploadedAt: uploadedFile.createdAt
                }
            });
        }
    } catch (error) {
        console.error('Upload error:', error);
        
        // Clean up file if error occurs
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ success: false, message: 'Server error during upload' });
    }
};

const chat = async(req, res) => {
    try {
        const collectionName = req.query.collectionName || req.body.collectionName;
        const query = req.query.message || req.body.message;

        console.log('Collection name:', collectionName);
        console.log('Query:', query);
        
        if (!query) {
            return res.status(400).json({ success: false, message: 'No question provided' });
        }
        
        if (!collectionName) {
            return res.status(400).json({ success: false, message: 'Collection name is required' });
        }
        const embeddings = new OpenAIEmbeddings({
            model: 'text-embedding-3-small', 
            apiKey: process.env.OPENAI_API_KEY
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                url: process.env.QDRANT_URL,
                collectionName: collectionName,
            }
        );
        console.log('Using collection:', collectionName);
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
        console.log("---------------*******---------------")
        console.log(rawContext);
        console.log("---------------*******---------------")
        console.log(formattedContext);
        console.log("---------------*******---------------")
        console.log(contextForUI);
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

const getUserFiles = async (req, res) => {
    try {
        const userId = req.user.id;
        const files = await UploadedFile.find({ userId, fileType: 'pdf' })
            .sort({ createdAt: -1 })
            .select('originalName collectionName isIndexed createdAt fileSize');
        
        return res.json({
            success: true,
            files
        });
    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching files' });
    }
};

const deleteFile = async (req, res) => {
    try {
        const userId = req.user.id;
        const fileId = req.params.fileId;
        
        const file = await UploadedFile.findOne({ _id: fileId, userId });
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }
        
        // Delete physical file
        if (fs.existsSync(file.filePath)) {
            fs.unlinkSync(file.filePath);
        }
        
        // Delete from database
        await UploadedFile.deleteOne({ _id: fileId });
        
        return res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting file' });
    }
};

const getFileStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const fileId = req.params.fileId;
        
        console.log('Checking status for file:', fileId, 'user:', userId);
        
        const file = await UploadedFile.findOne({ _id: fileId, userId });
        if (!file) {
            console.log('File not found in database');
            return res.status(404).json({ success: false, message: 'File not found' });
        }
        
        console.log('File found, isIndexed:', file.isIndexed);
        
        return res.json({
            success: true,
            file: {
                id: file._id,
                filename: file.originalName,
                isIndexed: file.isIndexed,
                collectionName: file.collectionName
            }
        });
    } catch (error) {
        console.error('Get file status error:', error);
        res.status(500).json({ success: false, message: 'Server error getting file status' });
    }
};

const getUserChats = async (req, res) => {
    try {
        const userId = req.user.id;
        const chats = await Chat.find({ userId })
            .populate('fileId', 'originalName collectionName isIndexed')
            .sort({ updatedAt: -1 })
            .select('fileName collectionName messages createdAt updatedAt');
        
        return res.json({
            success: true,
            chats: chats.map(chat => ({
                id: chat._id,
                fileId: chat.fileId._id,
                fileName: chat.fileName,
                collectionName: chat.collectionName,
                messages: chat.messages,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt
            }))
        });
    } catch (error) {
        console.error('Get chats error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching chats' });
    }
};

const saveChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fileId, fileName, collectionName, messages } = req.body;
        
        if (!fileId || !fileName || !collectionName) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        // Check if chat already exists for this file
        let chat = await Chat.findOne({ userId, fileId });
        
        if (chat) {
            // Update existing chat
            chat.messages = messages || [];
            chat.updatedAt = new Date();
            await chat.save();
        } else {
            // Create new chat
            chat = new Chat({
                userId,
                fileId,
                fileName,
                collectionName,
                messages: messages || []
            });
            await chat.save();
        }
        
        return res.json({
            success: true,
            message: 'Chat saved successfully',
            chatId: chat._id
        });
    } catch (error) {
        console.error('Save chat error:', error);
        res.status(500).json({ success: false, message: 'Server error saving chat' });
    }
};

const getChatById = async (req, res) => {
    try {
        const userId = req.user.id;
        const chatId = req.params.chatId;
        
        const chat = await Chat.findOne({ _id: chatId, userId })
            .populate('fileId', 'originalName collectionName isIndexed');
        
        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }
        
        return res.json({
            success: true,
            chat: {
                id: chat._id,
                fileId: chat.fileId._id,
                fileName: chat.fileName,
                collectionName: chat.collectionName,
                messages: chat.messages,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt,
                fileInfo: {
                    originalName: chat.fileId.originalName,
                    isIndexed: chat.fileId.isIndexed
                }
            }
        });
    } catch (error) {
        console.error('Get chat error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching chat' });
    }
};

const deleteChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const chatId = req.params.chatId;
        
        const result = await Chat.deleteOne({ _id: chatId, userId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }
        
        return res.json({
            success: true,
            message: 'Chat deleted successfully'
        });
    } catch (error) {
        console.error('Delete chat error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting chat' });
    }
};

export { addFileToQueue, chat, getUserFiles, deleteFile, getFileStatus, getUserChats, saveChat, getChatById, deleteChat };
