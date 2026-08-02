import { Router } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../index';

const router = Router();

// ⚠️  IMPORTANT: Local disk storage is EPHEMERAL on cloud platforms (Render, Railway, Fly.io).
// Uploaded files will be lost on every redeploy. For production with real data:
//   1. Replace multer.diskStorage with multer-s3, multer-cloud, or Cloudinary storage
//   2. Store only the cloud URL in agreementUrl, not a local path
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/agreements';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/agreement', authenticate, upload.single('agreement'), async (req: AuthRequest, res: any) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user?.userId;
        const filePath = req.file.path.replace(/\\/g, '/'); // Normalize path for web

        await prisma.user.update({
            where: { id: userId },
            data: {
                agreementUrl: filePath,
                agreedToRules: true,
                agreedAt: new Date()
            }
        });

        res.json({
            message: 'Agreement uploaded and verified successfully',
            url: filePath
        });
    } catch (error: any) {
        console.error('[UPLOAD] Agreement upload failed:', error.message);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

export default router;
