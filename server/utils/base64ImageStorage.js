const fs = require('fs');

/**
 * Base64 Image Storage Utility
 * 
 * Stores images directly in MongoDB as base64 encoded strings.
 * This approach eliminates external dependencies and ensures
 * images persist with the database.
 */

const base64ImageStorage = {
  /**
   * Convert file to base64 string
   * @param {string} filePath - Path to the file
   * @returns {string} Base64 encoded string
   */
  fileToBase64: (filePath) => {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      return fileBuffer.toString('base64');
    } catch (error) {
      throw error;
    }
  },

  /**
   * Save uploaded file as base64 data URL
   * @param {Object} file - Multer file object
   * @returns {Object} Image object with url and public_id
   */
  saveImage: (file) => {
    try {
      const base64Data = base64ImageStorage.fileToBase64(file.path);
      const mimeType = file.mimetype;
      
      // Clean up temporary file
      fs.unlinkSync(file.path);
      
      return {
        url: `data:${mimeType};base64,${base64Data}`,
        public_id: null // No public_id for base64 storage
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete base64 image (no action needed)
   * @returns {boolean} Always returns true
   */
  deleteImage: () => {
    // No cleanup needed for base64 storage
    return true;
  },

  /**
   * Get image URL (returns the base64 data URL)
   * @param {string} base64Data - Base64 data URL
   * @returns {string} The base64 data URL
   */
  getImageUrl: (base64Data) => {
    return base64Data;
  }
};

module.exports = base64ImageStorage;
