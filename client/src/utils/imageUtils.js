// Utility function to get image URL from product images array
// Handles both old format (array of strings) and new format (array of objects with url property)
export const getImageUrl = (images, index = 0) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return 'https://via.placeholder.com/300x300?text=Product';
  }
  
  const image = images[index];
  
  // New format: object with url property
  if (image && typeof image === 'object' && image.url) {
    return image.url;
  }
  
  // Old format: string URL
  if (typeof image === 'string') {
    return image;
  }
  
  return 'https://via.placeholder.com/300x300?text=Product';
};

// Get all image URLs from product images array
export const getAllImageUrls = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [];
  }
  
  return images.map(image => {
    // New format: object with url property
    if (image && typeof image === 'object' && image.url) {
      return image.url;
    }
    
    // Old format: string URL
    if (typeof image === 'string') {
      return image;
    }
    
    return null;
  }).filter(url => url !== null);
};

// Get image count
export const getImageCount = (images) => {
  if (!images || !Array.isArray(images)) {
    return 0;
  }
  return images.length;
};
