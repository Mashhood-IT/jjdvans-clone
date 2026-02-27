import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getCloudinaryStorage = (subfolder) => {
    return new CloudinaryStorage({
        cloudinary,
        params: (req, file) => ({
            folder: `MTL-BOOKING-APP/${subfolder}`,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
            public_id: `${file.originalname}`,
        }),
    });
};

export const getUploader = (folder) => multer({ storage: getCloudinaryStorage(folder) });