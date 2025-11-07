import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image to Cloudinary.
 * @param {string} filePath - The local file path of the image to upload.
 * @param {object} options - Additional options for the upload (e.g., folder, tags).
 * @returns {Promise<object>} - The result of the upload operation.
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, options);
    return result;
  } catch (err) {
    console.error("Error uploading to Cloudinary:", err.message);
    throw new Error("Cloudinary upload failed. Please try again later.");
  }
};

/**
 * Deletes an image from Cloudinary.
 * @param {string} publicId - The public ID of the image to delete.
 * @returns {Promise<object>} - The result of the deletion operation.
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok") {
      throw new Error(`Failed to delete image with public ID: ${publicId}`);
    }
    return result;
  } catch (err) {
    console.error("Error deleting from Cloudinary:", err.message);
    throw new Error("Cloudinary deletion failed. Please try again later.");
  }
};

/**
 * Retrieves details of a resource from Cloudinary.
 * @param {string} publicId - The public ID of the resource to retrieve.
 * @returns {Promise<object>} - The resource details.
 */
export const getResourceFromCloudinary = async (publicId) => {
  try {
    const resource = await cloudinary.api.resource(publicId);
    return resource;
  } catch (err) {
    console.error("Error fetching resource from Cloudinary:", err.message);
    throw new Error("Failed to fetch resource from Cloudinary.");
  }
};

export default cloudinary;