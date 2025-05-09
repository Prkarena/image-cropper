/**
 * Creates a canvas with the cropped area from the image
 */
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed for CORS-enabled images
    image.src = url;
  });

/**
 * Get the cropped image as a Blob
 */
export async function getCroppedImg(imageSrc, pixelCrop, shape = 'rectangle', customSize = null, format = 'jpeg') {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Set canvas size to the desired output size
  const outputSize = getOutputSize(customSize, shape);
  canvas.width = outputSize.width;
  canvas.height = outputSize.height;

  // Fill with white background (important for transparent PNGs) - skip for parallelogram
  if (shape !== 'parallelogram') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // For circle or oval shape, create an appropriate clipping path
  if (shape === 'circle' || shape === 'oval' || shape === 'portrait' || shape === 'portrait-id' || shape === 'parallelogram') {
    ctx.beginPath();
    if (shape === 'circle') {
      const radius = Math.min(canvas.width, canvas.height) / 2;
      ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2, true);
    } else if (shape === 'oval') {
      // Draw oval (ellipse) shape
      const radiusX = canvas.width / 2;
      const radiusY = canvas.height / 2;
      ctx.ellipse(
        canvas.width / 2, 
        canvas.height / 2, 
        radiusX, 
        radiusY, 
        0, 0, Math.PI * 2
      );
    } else if (shape === 'parallelogram') {
      // Create a new approach for parallelogram that doesn't use transformations
      const width = canvas.width;
      const height = canvas.height;
      const skewAmount = width * 0.15;
      
      // Create clipping path
      ctx.beginPath();
      ctx.moveTo(skewAmount, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width - skewAmount, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.clip();
      
      // Calculate the scale factors to maintain the image proportions inside the parallelogram
      const scaleX = (width - skewAmount) / pixelCrop.width;
      const scaleY = height / pixelCrop.height;
      const scale = Math.max(scaleX, scaleY);
      
      // Calculate dimensions of the scaled image
      const scaledWidth = pixelCrop.width * scale;
      const scaledHeight = pixelCrop.height * scale;
      
      // Calculate position to center the image in the parallelogram
      const offsetX = (width - scaledWidth) / 2;
      const offsetY = (height - scaledHeight) / 2;
      
      // Draw the image considering the parallelogram shape without rotation
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        offsetX,
        offsetY,
        scaledWidth,
        scaledHeight
      );
      
    } else if (shape === 'portrait') {
      // Draw portrait shape (oval with more focus on the head/shoulders)
      const radiusX = canvas.width / 2 * 0.95; // Slightly narrower than full width
      const radiusY = canvas.height / 2;
      
      // Draw a more head-focused oval shape
      ctx.ellipse(
        canvas.width / 2, 
        canvas.height * 0.4, // Move center point up to focus more on head
        radiusX,
        radiusY * 1.1, // Slightly taller oval
        0, 0, Math.PI * 2
      );
    } else if (shape === 'portrait-id') {
      // Draw ID portrait shape - similar to the profile image shown
      const width = canvas.width;
      const height = canvas.height;
      const cornerRadius = Math.min(width, height) * 0.2; // 20% corner radius
      
      // Draw a rounded rectangle
      ctx.moveTo(cornerRadius, 0);
      ctx.lineTo(width - cornerRadius, 0);
      ctx.quadraticCurveTo(width, 0, width, cornerRadius);
      ctx.lineTo(width, height - cornerRadius);
      ctx.quadraticCurveTo(width, height, width - cornerRadius, height);
      ctx.lineTo(cornerRadius, height);
      ctx.quadraticCurveTo(0, height, 0, height - cornerRadius);
      ctx.lineTo(0, cornerRadius);
      ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
    }
    ctx.closePath();
    ctx.clip();
  }

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // As a Blob
  return new Promise((resolve) => {
    // Determine image format
    let imageFormat;
    if (format === 'webp') {
      imageFormat = 'image/webp';
    } else if (shape === 'parallelogram' || format === 'png') {
      imageFormat = 'image/png';
    } else {
      imageFormat = 'image/jpeg';
    }
    
    canvas.toBlob((blob) => {
      resolve(blob);
    }, imageFormat);
  });
}

/**
 * Get the cropped image as a data URL
 */
export async function getCroppedImgDataUrl(imageSrc, pixelCrop, shape = 'rectangle', customSize = null, format = 'jpeg') {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Set canvas size to the desired output size
  const outputSize = getOutputSize(customSize, shape);
  canvas.width = outputSize.width;
  canvas.height = outputSize.height;

  // Fill with white background (important for transparent PNGs) - skip for parallelogram
  if (shape !== 'parallelogram') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // For circle or oval shape, create an appropriate clipping path
  if (shape === 'circle' || shape === 'oval' || shape === 'portrait' || shape === 'portrait-id' || shape === 'parallelogram') {
    ctx.beginPath();
    if (shape === 'circle') {
      const radius = Math.min(canvas.width, canvas.height) / 2;
      ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2, true);
    } else if (shape === 'oval') {
      // Draw oval (ellipse) shape
      const radiusX = canvas.width / 2;
      const radiusY = canvas.height / 2;
      ctx.ellipse(
        canvas.width / 2, 
        canvas.height / 2, 
        radiusX, 
        radiusY, 
        0, 0, Math.PI * 2
      );
    } else if (shape === 'parallelogram') {
      // Create a new approach for parallelogram that doesn't use transformations
      const width = canvas.width;
      const height = canvas.height;
      const skewAmount = width * 0.15;
      
      // Create clipping path
      ctx.beginPath();
      ctx.moveTo(skewAmount, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width - skewAmount, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.clip();
      
      // Calculate the scale factors to maintain the image proportions inside the parallelogram
      const scaleX = (width - skewAmount) / pixelCrop.width;
      const scaleY = height / pixelCrop.height;
      const scale = Math.max(scaleX, scaleY);
      
      // Calculate dimensions of the scaled image
      const scaledWidth = pixelCrop.width * scale;
      const scaledHeight = pixelCrop.height * scale;
      
      // Calculate position to center the image in the parallelogram
      const offsetX = (width - scaledWidth) / 2;
      const offsetY = (height - scaledHeight) / 2;
      
      // Draw the image considering the parallelogram shape without rotation
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        offsetX,
        offsetY,
        scaledWidth,
        scaledHeight
      );
      
    } else if (shape === 'portrait') {
      // Draw portrait shape (oval with more focus on the head/shoulders)
      const radiusX = canvas.width / 2 * 0.95; // Slightly narrower than full width
      const radiusY = canvas.height / 2;
      
      // Draw a more head-focused oval shape
      ctx.ellipse(
        canvas.width / 2, 
        canvas.height * 0.4, // Move center point up to focus more on head
        radiusX,
        radiusY * 1.1, // Slightly taller oval
        0, 0, Math.PI * 2
      );
    } else if (shape === 'portrait-id') {
      // Draw ID portrait shape - similar to the profile image shown
      const width = canvas.width;
      const height = canvas.height;
      const cornerRadius = Math.min(width, height) * 0.2; // 20% corner radius
      
      // Draw a rounded rectangle
      ctx.moveTo(cornerRadius, 0);
      ctx.lineTo(width - cornerRadius, 0);
      ctx.quadraticCurveTo(width, 0, width, cornerRadius);
      ctx.lineTo(width, height - cornerRadius);
      ctx.quadraticCurveTo(width, height, width - cornerRadius, height);
      ctx.lineTo(cornerRadius, height);
      ctx.quadraticCurveTo(0, height, 0, height - cornerRadius);
      ctx.lineTo(0, cornerRadius);
      ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
    }
    ctx.closePath();
    ctx.clip();
  }

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Determine image format
  let imageFormat;
  if (format === 'webp') {
    imageFormat = 'image/webp';
  } else if (shape === 'parallelogram' || format === 'png') {
    imageFormat = 'image/png';
  } else {
    imageFormat = 'image/jpeg';
  }

  return canvas.toDataURL(imageFormat);
}

/**
 * Get output size based on shape and custom size
 */
export function getOutputSize(customSize = null, shape = 'rectangle') {
  // Mobile app screenshot size (based on provided image)
  const mobileSize = { width: 375, height: 812 };
  
  // Size presets with updated rectangle aspect ratio
  const sizePresets = {
    'small': { width: 350, height: 560 },
    'medium': { width: 375, height: 600 },
    'large': { width: 400, height: 640 },
    'square-small': { width: 500, height: 500 },
    'square-medium': { width: 800, height: 800 },
    'square-large': { width: 1080, height: 1080 },
    'oval-small': { width: 300, height: 450 },
    'oval-medium': { width: 350, height: 525 },
    'oval-large': { width: 400, height: 600 },
    'parallelogram-small': { width: 375, height: 600 },
    'parallelogram-medium': { width: 665, height: 931 }, 
    'parallelogram-large': { width: 700, height: 931 },
    'portrait-small': { width: 320, height: 480 },
    'portrait-medium': { width: 375, height: 650 },
    'portrait-large': { width: 420, height: 720 },
    'portrait-id-small': { width: 150, height: 200 },
    'portrait-id-medium': { width: 300, height: 400 },
    'portrait-id-large': { width: 600, height: 800 },
  };

  if (customSize && sizePresets[customSize]) {
    return sizePresets[customSize];
  }
  
  // For circle shape, make width and height equal
  if (shape === 'circle') {
    return { width: 600, height: 600 };
  }
  
  // For square shape, make width and height equal
  if (shape === 'square') {
    return { width: 800, height: 800 };
  }

  // For oval shape, use portrait dimensions
  if (shape === 'oval') {
    return { width: 350, height: 525 }; // 2:3 aspect ratio, good for portrait photos
  }
  
  // For parallelogram shape, use wide aspect ratio
  if (shape === 'parallelogram') {
    return { width: 375, height: 600 }; // Changed to match the dimensions shown in the screenshot
  }
  
  // For portrait shape, use portrait dimensions with narrower width
  if (shape === 'portrait') {
    return { width: 375, height: 650 }; // Taller rectangle for head/shoulders portraits
  }
  
  // Default to mobile screenshot dimensions for rectangle
  return mobileSize;
}

/**
 * Get aspect ratio based on shape
 */
export function getAspectRatio(shape = 'rectangle', customSize = null) {
  const size = getOutputSize(customSize, shape);
  return size.width / size.height;
}
