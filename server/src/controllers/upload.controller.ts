import { Request, Response } from 'express';
import { uploadBufferToCloudinary } from '../config/cloudinary.js';

export interface UploadedFileDto {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  publicId: string;
  format?: string;
  resourceType?: string;
}

/**
 * Controller: Upload single or multiple files to Cloudinary using Multer buffer
 * Route: POST /api/v1/upload
 */
export const uploadAttachment = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawFiles: Express.Multer.File[] = [];

    if (req.files) {
      if (Array.isArray(req.files)) {
        rawFiles.push(...req.files);
      } else {
        Object.values(req.files).forEach((fileArray) => {
          rawFiles.push(...fileArray);
        });
      }
    } else if (req.file) {
      rawFiles.push(req.file);
    }

    if (rawFiles.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files were uploaded. Please select at least one file.',
      });
      return;
    }

    const folder = (req.body.folder as string) || 'cpgrams_grievances';

    // Parallel upload all files to Cloudinary
    const uploadPromises = rawFiles.map(async (file, index) => {
      const result = await uploadBufferToCloudinary(file.buffer, file.originalname, folder);

      const fileDto: UploadedFileDto = {
        fileId: `FILE-${Date.now()}-${index + 1}`,
        fileName: file.originalname,
        fileUrl: result.secure_url,
        fileSize: file.size,
        fileType: file.mimetype,
        publicId: result.public_id,
        format: result.format,
        resourceType: result.resource_type,
      };

      return fileDto;
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} file(s) successfully uploaded to Cloudinary.`,
      files: uploadedFiles,
      data: uploadedFiles.length === 1 ? uploadedFiles[0] : uploadedFiles,
    });
  } catch (error: any) {
    console.error('Cloudinary Multer Upload Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload files to Cloudinary.',
    });
  }
};
