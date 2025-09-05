import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
    uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
        return new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    // Pertama, cek jika ada object error dari Cloudinary
                    if (error) {
                        return reject(error);
                    }

                    // Kedua, cek jika karena suatu hal, result-nya tidak ada (undefined)
                    if (!result) {
                        return reject(new Error('Cloudinary upload failed, no result received.'));
                    }

                    // Jika semua aman, baru resolve dengan result
                    resolve(result);
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }
}