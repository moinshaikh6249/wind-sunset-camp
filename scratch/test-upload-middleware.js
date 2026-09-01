import { uploadCampImage, uploadAdminGalleryImage, uploadMemoryImage, uploadGalleryImages } from '../backend/middleware/uploadMiddleware.js';

console.log('Upload Middleware Export Check:');
console.log('- uploadCampImage:', typeof uploadCampImage);
console.log('- uploadAdminGalleryImage:', typeof uploadAdminGalleryImage);
console.log('- uploadMemoryImage:', typeof uploadMemoryImage);
console.log('- uploadGalleryImages:', typeof uploadGalleryImages);
