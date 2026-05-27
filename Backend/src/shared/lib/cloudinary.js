const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup Multer storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'car_ecommerce', // Folder name in Cloudinary
    format: async (req, file) => {
      const ext = file.originalname.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        return ext;
      }
      return 'png'; // default fallback
    }
  }
});

const upload = multer({ storage: storage });

const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    // Cloudinary URL structure: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/public_id.jpg
    const parts = imageUrl.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return;
    
    // Public ID is the part after /upload/v123456/ (excluding file extension)
    const publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
    
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
  }
};

module.exports = {
  cloudinary,
  upload,
  deleteFromCloudinary
};
