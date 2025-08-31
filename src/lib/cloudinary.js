import { v2 as cloudinary } from 'cloudinary';

// This checks if all the necessary Cloudinary credentials are present in your .env.local file.
// If any are missing, it throws an error to prevent the app from running with an incomplete configuration.
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Missing Cloudinary credentials in .env.local');
}

// Configures the Cloudinary SDK with your account details.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Exports the configured client for use in other parts of your application, like your API route.
export default cloudinary;
