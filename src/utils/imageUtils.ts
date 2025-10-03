export type ColorOption = "red" | "gold" | "blue" | "traveller";

export const COLOR_LABELS: Record<ColorOption, string> = {
  red: "Evil",
  blue: "Good",
  gold: "Fabled",
  traveller: "Traveller",
};

export const COLOR_VALUES: Record<ColorOption, string> = {
  red: "#8b1011",
  blue: "#047ab7",
  gold: "#dba318",
  traveller: "#9b4f9b",
};

// Convert SVG to PNG using canvas
export const svgToPng = (svgFile: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const svgData = e.target?.result as string;
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0);

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert to blob"));
          }
        }, "image/png");
      };

      img.onerror = () => reject(new Error("Failed to load SVG"));

      // Create object URL for SVG
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      img.src = URL.createObjectURL(blob);
    };

    reader.onerror = () => reject(new Error("Failed to read SVG file"));
    reader.readAsText(svgFile);
  });
};

// Convert image file to ImageData
export const fileToImageData = (file: File): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve(imageData);
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

// Convert ImageData to canvas and return as data URL
export const imageDataToDataUrl = (imageData: ImageData): string => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL("image/png");
};

// Load texture image as ImageData
export const loadTexture = (texturePath: string): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve(imageData);
    };

    img.onerror = () =>
      reject(new Error(`Failed to load texture: ${texturePath}`));
    img.src = texturePath;
  });
};

// Scale texture to match target dimensions while maintaining square aspect ratio
export const scaleTexture = (
  texture: ImageData,
  targetWidth: number,
  targetHeight: number
): ImageData => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // Create canvas with texture
  const textureCanvas = document.createElement("canvas");
  const textureCtx = textureCanvas.getContext("2d");

  if (!textureCtx) {
    throw new Error("Could not get texture canvas context");
  }

  textureCanvas.width = texture.width;
  textureCanvas.height = texture.height;
  textureCtx.putImageData(texture, 0, 0);

  // Use the larger dimension to maintain square aspect ratio
  const targetSize = Math.max(targetWidth, targetHeight);

  // Scale texture to square size
  canvas.width = targetSize;
  canvas.height = targetSize;
  ctx.drawImage(textureCanvas, 0, 0, targetSize, targetSize);

  return ctx.getImageData(0, 0, targetSize, targetSize);
};

// Resize image to 320x320px preserving aspect ratio with transparent padding
export const resizeToSquare = (
  imageData: ImageData,
  targetSize?: number
): ImageData => {
  const { width, height } = imageData;

  if (!targetSize) {
    targetSize = Math.max(width, height);
  }

  // If already the target size, return as-is
  if (width === targetSize && height === targetSize) {
    return imageData;
  }

  // Calculate scaling to fit within target size while preserving aspect ratio
  const scale = Math.min(targetSize / width, targetSize / height);
  const scaledWidth = Math.round(width * scale);
  const scaledHeight = Math.round(height * scale);

  // Create canvas for scaling
  const scaleCanvas = document.createElement("canvas");
  const scaleCtx = scaleCanvas.getContext("2d");

  if (!scaleCtx) {
    throw new Error("Could not get canvas context for scaling");
  }

  // Set up original image canvas
  const originalCanvas = document.createElement("canvas");
  const originalCtx = originalCanvas.getContext("2d");

  if (!originalCtx) {
    throw new Error("Could not get canvas context for original image");
  }

  originalCanvas.width = width;
  originalCanvas.height = height;
  originalCtx.putImageData(imageData, 0, 0);

  // Scale the image
  scaleCanvas.width = scaledWidth;
  scaleCanvas.height = scaledHeight;
  scaleCtx.drawImage(originalCanvas, 0, 0, scaledWidth, scaledHeight);

  // Create final canvas with target size
  const finalCanvas = document.createElement("canvas");
  const finalCtx = finalCanvas.getContext("2d");

  if (!finalCtx) {
    throw new Error("Could not get canvas context for final image");
  }

  finalCanvas.width = targetSize;
  finalCanvas.height = targetSize;

  // Center the scaled image on the target canvas (transparent background by default)
  const offsetX = Math.round((targetSize - scaledWidth) / 2);
  const offsetY = Math.round((targetSize - scaledHeight) / 2);

  finalCtx.drawImage(scaleCanvas, offsetX, offsetY);

  return finalCtx.getImageData(0, 0, targetSize, targetSize);
};

// Add white border around image content (not transparent areas)
export const addContentBorder = (
  imageData: ImageData,
  borderSize: number
): ImageData => {
  if (borderSize <= 0) return imageData;

  const { width, height, data } = imageData;
  const newImageData = new ImageData(width, height);
  const newData = newImageData.data;

  // Copy original image data
  for (let i = 0; i < data.length; i++) {
    newData[i] = data[i];
  }

  // Create a mask of the original content (non-transparent pixels)
  const contentMask = new Array(width * height).fill(false);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const alphaIndex = index * 4 + 3;
      if (data[alphaIndex] > 0) {
        contentMask[index] = true;
      }
    }
  }

  // Dilate the content mask to create border area
  for (let iteration = 0; iteration < borderSize; iteration++) {
    const newMask = [...contentMask];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;

        // Skip if already part of content
        if (contentMask[index]) continue;

        // Check if any neighbor is content
        let hasContentNeighbor = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const neighborIndex = ny * width + nx;
              if (contentMask[neighborIndex]) {
                hasContentNeighbor = true;
                break;
              }
            }
          }
          if (hasContentNeighbor) break;
        }

        if (hasContentNeighbor) {
          newMask[index] = true;
          // Add white border pixel
          const pixelIndex = index * 4;
          newData[pixelIndex] = 255; // R
          newData[pixelIndex + 1] = 255; // G
          newData[pixelIndex + 2] = 255; // B
          newData[pixelIndex + 3] = 255; // A
        }
      }
    }

    // Update content mask for next iteration
    for (let i = 0; i < contentMask.length; i++) {
      contentMask[i] = newMask[i];
    }
  }

  return newImageData;
};

// Convert image to grayscale if it's not already black and white
export const ensureGrayscale = (imageData: ImageData): ImageData => {
  const { width, height, data } = imageData;
  const newImageData = new ImageData(width, height);
  const newData = newImageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Calculate grayscale value
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

    newData[i] = gray; // R
    newData[i + 1] = gray; // G
    newData[i + 2] = gray; // B
    newData[i + 3] = a; // A (preserve alpha)
  }

  return newImageData;
};

// Invert image colors (excluding transparent areas)
export const invertImage = (imageData: ImageData): ImageData => {
  const { width, height, data } = imageData;
  const newImageData = new ImageData(width, height);
  const newData = newImageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Only invert non-transparent pixels
    if (a > 0) {
      newData[i] = 255 - r; // R
      newData[i + 1] = 255 - g; // G
      newData[i + 2] = 255 - b; // B
      newData[i + 3] = a; // A (preserve alpha)
    } else {
      // Keep transparent pixels as-is
      newData[i] = r;
      newData[i + 1] = g;
      newData[i + 2] = b;
      newData[i + 3] = a;
    }
  }

  return newImageData;
};

// Crop image to its content (remove transparent borders)
export const cropToContent = (imageData: ImageData): ImageData => {
  const { width, height, data } = imageData;

  // Find the bounding box of non-transparent content
  let minX = width,
    maxX = -1;
  let minY = height,
    maxY = -1;

  // Scan for non-transparent pixels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alphaIndex = (y * width + x) * 4 + 3;
      if (data[alphaIndex] > 0) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  // If no content found, return original image
  if (maxX === -1) {
    return imageData;
  }

  // Calculate crop dimensions
  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;

  // If already tightly cropped, return original
  if (
    minX === 0 &&
    minY === 0 &&
    cropWidth === width &&
    cropHeight === height
  ) {
    return imageData;
  }

  // Create cropped image data
  const croppedImageData = new ImageData(cropWidth, cropHeight);
  const croppedData = croppedImageData.data;

  // Copy pixels from the content area
  for (let y = 0; y < cropHeight; y++) {
    for (let x = 0; x < cropWidth; x++) {
      const sourceIndex = ((minY + y) * width + (minX + x)) * 4;
      const targetIndex = (y * cropWidth + x) * 4;

      croppedData[targetIndex] = data[sourceIndex]; // R
      croppedData[targetIndex + 1] = data[sourceIndex + 1]; // G
      croppedData[targetIndex + 2] = data[sourceIndex + 2]; // B
      croppedData[targetIndex + 3] = data[sourceIndex + 3]; // A
    }
  }

  return croppedImageData;
};

// Add horizontal padding to image (positive = right, negative = left)
export const addHorizontalPadding = (
  imageData: ImageData,
  padding: number
): ImageData => {
  if (padding === 0) return imageData;

  const { width, height, data } = imageData;
  const paddingAmount = Math.abs(padding);
  const newWidth = width + paddingAmount;

  // Create new image data with added width
  const paddedImageData = new ImageData(newWidth, height);
  const paddedData = paddedImageData.data;

  // Calculate offset based on padding direction
  // Positive padding = add to right (image stays left)
  // Negative padding = add to left (image moves right)
  const offsetX = padding < 0 ? paddingAmount : 0;

  // Copy original image data to the new position
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sourceIndex = (y * width + x) * 4;
      const targetIndex = (y * newWidth + (x + offsetX)) * 4;

      paddedData[targetIndex] = data[sourceIndex]; // R
      paddedData[targetIndex + 1] = data[sourceIndex + 1]; // G
      paddedData[targetIndex + 2] = data[sourceIndex + 2]; // B
      paddedData[targetIndex + 3] = data[sourceIndex + 3]; // A
    }
  }

  // The rest of the canvas is already transparent (ImageData is initialized with zeros)
  return paddedImageData;
};

// Apply textures to black and white areas
export const applyTextures = (
  imageData: ImageData,
  whiteTexture: ImageData,
  colorTexture: ImageData,
  originalImage?: ImageData
): ImageData => {
  const { width, height, data } = imageData;
  const newImageData = new ImageData(width, height);
  const newData = newImageData.data;

  // Scale textures to match input image dimensions (as squares)
  const scaledWhiteTexture = scaleTexture(whiteTexture, width, height);
  const scaledColorTexture = scaleTexture(colorTexture, width, height);

  // If we have an original image (for grayscale handling), use it as base
  if (originalImage) {
    for (let i = 0; i < originalImage.data.length; i++) {
      newData[i] = originalImage.data[i];
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      // Skip transparent pixels
      if (a === 0) continue;

      // Determine if pixel is closer to black or white
      const intensity = (r + g + b) / 3;

      let textureToUse: ImageData;
      if (intensity < 128) {
        // Closer to black - use color texture
        textureToUse = scaledColorTexture;
      } else {
        // Closer to white - use white texture
        textureToUse = scaledWhiteTexture;
      }

      // Get texture pixel (no tiling needed since texture is scaled to image size)
      const textureX = Math.min(x, textureToUse.width - 1);
      const textureY = Math.min(y, textureToUse.height - 1);
      const textureIndex = (textureY * textureToUse.width + textureX) * 4;

      newData[index] = textureToUse.data[textureIndex]; // R
      newData[index + 1] = textureToUse.data[textureIndex + 1]; // G
      newData[index + 2] = textureToUse.data[textureIndex + 2]; // B
      newData[index + 3] = a; // Preserve original alpha
    }
  }

  return newImageData;
};

// Main processing function
export const processImage = async (
  file: File,
  colorOption: ColorOption,
  borderSize: number = 0,
  invert: boolean = false,
  horizontalPadding: number = 0,
  shouldCrop: boolean = true
): Promise<string> => {
  // Convert SVG to PNG if necessary
  let processFile = file;
  if (file.type === "image/svg+xml") {
    const pngBlob = await svgToPng(file);
    processFile = new File([pngBlob], "converted.png", { type: "image/png" });
  }

  // Convert file to ImageData
  let imageData = await fileToImageData(processFile);

  // Add horizontal padding if specified (for Traveller characters)
  if (horizontalPadding !== 0) {
    imageData = addHorizontalPadding(imageData, horizontalPadding);
  }

  // Resize image to be square
  imageData = resizeToSquare(imageData);

  // Store original for grayscale handling
  const originalImageData = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  // Convert to grayscale
  imageData = ensureGrayscale(imageData);

  // Invert image if requested (apply before border to invert the content)
  if (invert) {
    imageData = invertImage(imageData);
  }

  // Add border around content if requested
  if (borderSize > 0) {
    imageData = addContentBorder(imageData, borderSize);
  }

  // Load textures
  const whiteTexture = await loadTexture(
    `${import.meta.env.BASE_URL}background-white.webp`
  );
  const colorTextureExt = colorOption === "traveller" ? "png" : "webp";
  const colorTexture = await loadTexture(
    `${import.meta.env.BASE_URL}background-${colorOption}.${colorTextureExt}`
  );

  // Apply textures
  imageData = applyTextures(
    imageData,
    whiteTexture,
    colorTexture,
    originalImageData
  );

  // Crop to content to remove transparent borders (if enabled)
  if (shouldCrop) {
    imageData = cropToContent(imageData);
  }

  // Convert to data URL
  return imageDataToDataUrl(imageData);
};
