export type ColorOption = "red" | "gold" | "blue";

export const COLOR_LABELS: Record<ColorOption, string> = {
  red: "Evil",
  blue: "Good",
  gold: "Fabled",
};

export const COLOR_VALUES: Record<ColorOption, string> = {
  red: "#8b1011",
  blue: "#047ab7",
  gold: "#dba318",
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
export const scaleTexture = (texture: ImageData, targetWidth: number, targetHeight: number): ImageData => {
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
  colorOption: ColorOption
): Promise<string> => {
  // Convert SVG to PNG if necessary
  let processFile = file;
  if (file.type === "image/svg+xml") {
    const pngBlob = await svgToPng(file);
    processFile = new File([pngBlob], "converted.png", { type: "image/png" });
  }

  // Convert file to ImageData
  let imageData = await fileToImageData(processFile);

  // Store original for grayscale handling
  const originalImageData = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  // Convert to grayscale
  imageData = ensureGrayscale(imageData);


  // Load textures
  const whiteTexture = await loadTexture(`${import.meta.env.BASE_URL}background-white.webp`);
  const colorTexture = await loadTexture(`${import.meta.env.BASE_URL}background-${colorOption}.webp`);

  // Apply textures
  const finalImage = applyTextures(
    imageData,
    whiteTexture,
    colorTexture,
    originalImageData
  );

  // Convert to data URL
  return imageDataToDataUrl(finalImage);
};
