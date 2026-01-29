export type ColorOption =
  | "red"
  | "gold"
  | "blue"
  | "green"
  | "traveller"
  | "travellergood"
  | "travellerevil";

import { removeBackground } from "@imgly/background-removal";

// Cache for background removal results
interface BackgroundRemovalCache {
  [key: string]: File;
}

const backgroundRemovalCache: BackgroundRemovalCache = {};

// Generate a hash from file content for cache key
const generateFileHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const COLOR_LABELS: Record<ColorOption, string> = {
  red: "Evil",
  blue: "Good",
  traveller: "Traveller",
  travellergood: "Traveller (Good)",
  travellerevil: "Traveller (Evil)",
  gold: "Fabled",
  green: "Loric",
};

export const COLOR_VALUES: Record<ColorOption, string> = {
  red: "#8b1011",
  blue: "#047ab7",
  gold: "#dba318",
  green: "#0f7d3e",
  traveller: "#9b4f9b",
  travellergood: "#664fff",
  travellerevil: "#750048ff",
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

// Remove background from image file with caching
export const removeImageBackground = async (file: File): Promise<File> => {
  try {
    // Generate cache key from file content
    const cacheKey = await generateFileHash(file);

    // Check if result is already cached
    if (backgroundRemovalCache[cacheKey]) {
      console.log("Using cached background removal result");
      return backgroundRemovalCache[cacheKey];
    }

    console.log("Processing background removal (not cached)");
    const blob = await removeBackground(file);
    const resultFile = new File([blob], file.name, { type: "image/png" });

    // Cache the result
    backgroundRemovalCache[cacheKey] = resultFile;

    return resultFile;
  } catch (error) {
    console.error("Background removal failed:", error);
    throw new Error("Failed to remove background");
  }
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

// Add padding around the entire image edges
export const addEdgePadding = (
  imageData: ImageData,
  padding: number
): ImageData => {
  if (padding <= 0) return imageData;

  const { width, height, data } = imageData;
  const newWidth = width + padding * 2;
  const newHeight = height + padding * 2;

  // Create new image data with added padding
  const paddedImageData = new ImageData(newWidth, newHeight);
  const paddedData = paddedImageData.data;

  // Copy original image data to the center of the new image
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sourceIndex = (y * width + x) * 4;
      const targetIndex = ((y + padding) * newWidth + (x + padding)) * 4;

      paddedData[targetIndex] = data[sourceIndex]; // R
      paddedData[targetIndex + 1] = data[sourceIndex + 1]; // G
      paddedData[targetIndex + 2] = data[sourceIndex + 2]; // B
      paddedData[targetIndex + 3] = data[sourceIndex + 3]; // A
    }
  }

  // The rest of the canvas is already transparent (ImageData is initialized with zeros)
  return paddedImageData;
};

// Add aspect-ratio-aware padding to make the result square
export const addAspectRatioPadding = (imageData: ImageData): ImageData => {
  // Configuration constants - adjust these to change padding behavior
  const DEFAULT_PADDING_PERCENT = 0.25; // Padding on each side for square images
  const MIN_PADDING_PERCENT = 0.16; // Minimum padding on any side

  const IMAGE_AREA_PERCENT = 1 - 2 * DEFAULT_PADDING_PERCENT;
  const SQUARE_SIZE_MULTIPLIER = 1 / IMAGE_AREA_PERCENT;
  const NON_SQUARE_SIZE_MULTIPLIER = 1 / (2 * IMAGE_AREA_PERCENT);
  const MIN_CONSTRAINED_IMAGE_RATIO = 1 - 2 * MIN_PADDING_PERCENT;

  const { width, height } = imageData;

  // If already processing a square that came from previous padding, return as-is
  if (width === height) {
    // Add default padding on all sides for square images
    const finalSize = Math.round(width * SQUARE_SIZE_MULTIPLIER);
    const padding = Math.round((finalSize - width) / 2);
    return addEdgePadding(imageData, padding);
  }

  // Calculate ideal final square size based on default average padding
  let finalSize = Math.round((width + height) * NON_SQUARE_SIZE_MULTIPLIER);

  // Calculate padding in pixels
  let horizontalPadding = (finalSize - width) / 2;
  let verticalPadding = (finalSize - height) / 2;

  // Apply minimum padding constraint
  const minHorizontalPadding = MIN_PADDING_PERCENT * finalSize;
  const minVerticalPadding = MIN_PADDING_PERCENT * finalSize;

  // Check if we violate the minimum constraint
  if (horizontalPadding < minHorizontalPadding) {
    // Horizontal padding is too small, recalculate based on minimum
    finalSize = Math.round(width / MIN_CONSTRAINED_IMAGE_RATIO);
    horizontalPadding = (finalSize - width) / 2;
    verticalPadding = (finalSize - height) / 2;
  } else if (verticalPadding < minVerticalPadding) {
    // Vertical padding is too small, recalculate based on minimum
    finalSize = Math.round(height / MIN_CONSTRAINED_IMAGE_RATIO);
    horizontalPadding = (finalSize - width) / 2;
    verticalPadding = (finalSize - height) / 2;
  }

  // Create new square canvas
  const paddedImageData = new ImageData(finalSize, finalSize);
  const paddedData = paddedImageData.data;

  // Fill entire canvas with white (will be textured later)
  for (let i = 0; i < paddedData.length; i += 4) {
    paddedData[i] = 255; // R
    paddedData[i + 1] = 255; // G
    paddedData[i + 2] = 255; // B
    paddedData[i + 3] = 0; // A
  }

  // Calculate offset to center the image
  const offsetX = Math.round(horizontalPadding);
  const offsetY = Math.round(verticalPadding);

  // Copy original image data to the center, overwriting the white padding
  const { data } = imageData;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sourceIndex = (y * width + x) * 4;
      const targetIndex = ((y + offsetY) * finalSize + (x + offsetX)) * 4;

      paddedData[targetIndex] = data[sourceIndex]; // R
      paddedData[targetIndex + 1] = data[sourceIndex + 1]; // G
      paddedData[targetIndex + 2] = data[sourceIndex + 2]; // B
      paddedData[targetIndex + 3] = data[sourceIndex + 3]; // A
    }
  }

  return paddedImageData;
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
  const ALPHA_THRESHOLD = 0.8 * 255;
  const contentMask = new Array(width * height).fill(false);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const alphaIndex = index * 4 + 3;
      if (data[alphaIndex] > ALPHA_THRESHOLD) {
        contentMask[index] = true;
      }
    }
  }

  // Dilate the content mask to create border area
  let lastIterationPixels = new Set<number>();

  for (let iteration = 0; iteration < borderSize; iteration++) {
    const newMask = [...contentMask];
    const currentIterationPixels = new Set<number>();

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
          currentIterationPixels.add(index);
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

    // Track pixels from the last iteration
    lastIterationPixels = currentIterationPixels;
  }

  // Helper function to count neighbors based on alpha value
  const countNeighbors = (x: number, y: number): number => {
    let score = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue; // Skip self

        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const neighborIndex = (ny * width + nx) * 4;
          const neighborAlpha = newData[neighborIndex + 3];
          score += neighborAlpha / 255;
        }
      }
    }
    return score;
  };

  // Define antialiasing passes: [threshold, targetAlpha]
  const passes: Array<[number, number]> = [
    [3, 0], // Remove pixels with score <= 3
    [4.99, 63], // Set pixels with score <= 4.99 to 25%
    [4.26, 127], // Set pixels with score <= 4.26 to 50%
    [4.51, 191], // Set pixels with score <= 4.51 to 75%
  ];

  // Apply each pass
  for (const [threshold, targetAlpha] of passes) {
    // First, identify all pixels that should be changed in this pass
    const pixelsToChange: number[] = [];

    for (const index of lastIterationPixels) {
      const pixelIndex = index * 4;

      // Only process pixels that are still solid (255 alpha)
      if (newData[pixelIndex + 3] !== 255) continue;

      const x = index % width;
      const y = Math.floor(index / width);
      const neighborScore = countNeighbors(x, y);

      if (neighborScore <= threshold) {
        pixelsToChange.push(pixelIndex);
      }
    }

    // Then, apply all changes at once to avoid domino effects
    for (const pixelIndex of pixelsToChange) {
      newData[pixelIndex + 3] = targetAlpha;
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

// Increase contrast with dramatic thresholding
export const increaseContrast = (imageData: ImageData): ImageData => {
  const { width, height, data } = imageData;
  const newImageData = new ImageData(width, height);
  const newData = newImageData.data;

  // Define thresholds (45% and 55% of 255)
  const lowerThreshold = Math.round(255 * 0.49); // 102
  const upperThreshold = Math.round(255 * 0.51); // 153

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip transparent pixels
    if (a === 0) {
      newData[i] = r;
      newData[i + 1] = g;
      newData[i + 2] = b;
      newData[i + 3] = a;
      continue;
    }

    // Apply dramatic contrast enhancement to each channel
    const enhanceValue = (value: number): number => {
      if (value < lowerThreshold) {
        // Below minimum% - convert to black
        return 0;
      } else if (value > upperThreshold) {
        // Above maximum% - convert to white
        return 255;
      } else {
        // Middle values - preserve original value
        return value;
      }
    };

    newData[i] = enhanceValue(r); // R
    newData[i + 1] = enhanceValue(g); // G
    newData[i + 2] = enhanceValue(b); // B
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
  smoothBlend: boolean = true,
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

      const intensity = (r + g + b) / 3;

      // Get texture pixels (no tiling needed since texture is scaled to image size)
      const textureX = Math.min(x, scaledColorTexture.width - 1);
      const textureY = Math.min(y, scaledColorTexture.height - 1);
      const colorTextureIndex =
        (textureY * scaledColorTexture.width + textureX) * 4;
      const whiteTextureIndex =
        (textureY * scaledWhiteTexture.width + textureX) * 4;

      if (smoothBlend) {
        // Smooth blending based on grayscale intensity
        const blendRatio = intensity / 255; // Normalize to 0-1 range

        // Get color texture pixel
        const colorR = scaledColorTexture.data[colorTextureIndex];
        const colorG = scaledColorTexture.data[colorTextureIndex + 1];
        const colorB = scaledColorTexture.data[colorTextureIndex + 2];

        // Get white texture pixel
        const whiteR = scaledWhiteTexture.data[whiteTextureIndex];
        const whiteG = scaledWhiteTexture.data[whiteTextureIndex + 1];
        const whiteB = scaledWhiteTexture.data[whiteTextureIndex + 2];

        // Blend between color and white textures based on intensity
        newData[index] = Math.round(
          colorR * (1 - blendRatio) + whiteR * blendRatio
        ); // R
        newData[index + 1] = Math.round(
          colorG * (1 - blendRatio) + whiteG * blendRatio
        ); // G
        newData[index + 2] = Math.round(
          colorB * (1 - blendRatio) + whiteB * blendRatio
        ); // B
      } else {
        // Threshold-based approach (traditional)
        let textureToUse: ImageData;
        let textureIndex: number;

        if (intensity < 128) {
          // Closer to black - use color texture
          textureToUse = scaledColorTexture;
          textureIndex = colorTextureIndex;
        } else {
          // Closer to white - use white texture
          textureToUse = scaledWhiteTexture;
          textureIndex = whiteTextureIndex;
        }

        newData[index] = textureToUse.data[textureIndex]; // R
        newData[index + 1] = textureToUse.data[textureIndex + 1]; // G
        newData[index + 2] = textureToUse.data[textureIndex + 2]; // B
      }

      newData[index + 3] = a; // Preserve original alpha
    }
  }

  return newImageData;
};

// Apply drop shadow to an image using canvas filter
export const applyDropShadow = (imageData: ImageData): ImageData => {
  const OFFSET_PC = 1;
  const BLUR_PC = 2;
  const OPACITY = 0.2;

  let averageDimension = (imageData.width + imageData.height) / 2;
  const shadow_offset_x = Math.floor((averageDimension * OFFSET_PC) / 100);
  const shadow_offset_y = Math.floor((averageDimension * OFFSET_PC) / 100);
  const shadow_blur = Math.floor((averageDimension * BLUR_PC) / 100);
  const shadow_colour = `rgba(0, 0, 0, ${OPACITY})`;

  // Calculate extra space needed for shadow
  const extraSpace =
    shadow_blur * 2 + Math.max(shadow_offset_x, shadow_offset_y);

  const { width, height } = imageData;
  const newWidth = width + extraSpace;
  const newHeight = height + extraSpace;

  // Create source canvas with original image
  const sourceCanvas = document.createElement("canvas");
  const sourceCtx = sourceCanvas.getContext("2d");
  if (!sourceCtx) {
    throw new Error("Could not get source canvas context");
  }
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  sourceCtx.putImageData(imageData, 0, 0);

  // Create destination canvas with extra space for shadow
  const destCanvas = document.createElement("canvas");
  const destCtx = destCanvas.getContext("2d");
  if (!destCtx) {
    throw new Error("Could not get destination canvas context");
  }
  destCanvas.width = newWidth;
  destCanvas.height = newHeight;

  // Apply drop shadow filter and draw the image
  destCtx.filter = `drop-shadow(${shadow_offset_x}px ${shadow_offset_y}px ${shadow_blur}px ${shadow_colour})`;

  // Center the image in the new canvas (leaving room for shadow on all sides)
  const offsetX = Math.floor((extraSpace - shadow_offset_x) / 2);
  const offsetY = Math.floor((extraSpace - shadow_offset_y) / 2);
  destCtx.drawImage(sourceCanvas, offsetX, offsetY);

  return destCtx.getImageData(0, 0, newWidth, newHeight);
};

// Detect if an image is predominantly two-tone (black & white with noise tolerance)
// Returns true if the image is two-tone, false if it's greyscale or color
export const isTwoToneImage = (imageData: ImageData): boolean => {
  // Configuration constants
  const BLACK_WHITE_TOLERANCE = 30; // How close to pure black/white (0-255)
  const TWO_TONE_THRESHOLD = 0.85; // 85% of pixels must be near black or white

  const { data } = imageData;
  let twoTonePixelCount = 0;
  let totalNonTransparentPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip transparent pixels
    if (a < 10) continue;

    totalNonTransparentPixels++;

    // Calculate grayscale value (simple average is sufficient for detection)
    const gray = (r + g + b) / 3;

    // Check if pixel is close to black or white
    const isNearBlack = gray <= BLACK_WHITE_TOLERANCE;
    const isNearWhite = gray >= 255 - BLACK_WHITE_TOLERANCE;

    if (isNearBlack || isNearWhite) {
      twoTonePixelCount++;
    }
  }

  // Avoid division by zero
  if (totalNonTransparentPixels === 0) {
    return false;
  }

  const twoToneRatio = twoTonePixelCount / totalNonTransparentPixels;
  return twoToneRatio >= TWO_TONE_THRESHOLD;
};

// Main processing function
export const processImage = async (
  file: File,
  colorOption: ColorOption,
  borderSize: number = 0,
  invert: boolean = false,
  horizontalPadding: number = 0,
  shouldCrop: boolean = true,
  smoothBlend: boolean = true,
  enhanceContrast: boolean = false,
  shouldRemoveBackground: boolean = false,
  shouldAddPadding: boolean = false,
  inputImageMode: "black-white" | "greyscale" | "auto" = "auto",
  shouldApplyDropShadow: boolean = false
): Promise<string> => {
  // Convert SVG to PNG if necessary
  let processFile = file;
  if (file.type === "image/svg+xml") {
    const pngBlob = await svgToPng(file);
    processFile = new File([pngBlob], "converted.png", { type: "image/png" });
  }

  // Remove background if requested (apply before other processing)
  if (shouldRemoveBackground) {
    processFile = await removeImageBackground(processFile);
  }

  // Convert file to ImageData
  let imageData = await fileToImageData(processFile);

  // Add horizontal padding if specified (for Traveller characters)
  if (horizontalPadding !== 0) {
    imageData = addHorizontalPadding(imageData, horizontalPadding);
  }

  // Resize image to be square
  imageData = resizeToSquare(imageData);

  // Add edge padding if border is enabled (ensures border has room and won't be cropped)
  if (borderSize > 0) {
    imageData = addEdgePadding(imageData, borderSize);
  }

  // Store original for grayscale handling
  const originalImageData = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  // Convert to grayscale
  imageData = ensureGrayscale(imageData);

  // Determine whether to apply contrast enhancement based on input mode
  let shouldEnhanceContrast = enhanceContrast;
  if (inputImageMode === "auto") {
    // Auto-detect if image is two-tone (black & white) or greyscale/color
    const isTwoTone = isTwoToneImage(imageData);
    // If two-tone, don't enhance contrast (keep it as-is)
    // If greyscale/color, enhance contrast to push towards black & white
    shouldEnhanceContrast = !isTwoTone;
  } else if (inputImageMode === "black-white") {
    shouldEnhanceContrast = false;
  } else if (inputImageMode === "greyscale") {
    shouldEnhanceContrast = true;
  }

  // Increase contrast if requested (apply after grayscale but before inversion)
  if (shouldEnhanceContrast) {
    imageData = increaseContrast(imageData);
  }

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
  const colorTextureExt = colorOption.includes("traveller") ? "png" : "webp";
  const colorTexture = await loadTexture(
    `${import.meta.env.BASE_URL}background-${colorOption}.${colorTextureExt}`
  );

  // Apply textures
  imageData = applyTextures(
    imageData,
    whiteTexture,
    colorTexture,
    smoothBlend,
    originalImageData
  );

  // Crop to content to remove transparent borders (if enabled)
  if (shouldCrop) {
    imageData = cropToContent(imageData);
  }

  // Apply drop shadow if requested (after cropping, before final padding)
  if (shouldApplyDropShadow) {
    imageData = applyDropShadow(imageData);
  }

  // Add aspect-ratio-aware padding if requested
  if (shouldAddPadding) {
    imageData = addAspectRatioPadding(imageData);
  }

  // Convert to data URL
  return imageDataToDataUrl(imageData);
};
