import { useState, useRef, useEffect } from "preact/hooks";
import "./app.css";
import {
  processImage as processImageUtil,
  type ColorOption,
  COLOR_LABELS,
  COLOR_VALUES,
} from "./utils/imageUtils";
import { logUsage } from "./utils/logger";

export function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorOption>("red");
  const [borderSize, setBorderSize] = useState<number>(2);
  const [borderEnabled, setBorderEnabled] = useState<boolean>(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultSectionRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith("image/") || file.type === "image/svg+xml") {
      setSelectedFile(file);
      setProcessedImage(null);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      handleFileSelect(target.files[0]);
    }
  };

  const handlePaste = async (e: ClipboardEvent) => {
    e.preventDefault();

    if (!e.clipboardData) return;

    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith("image/"));

    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        handleFileSelect(file);
      }
    }
  };

  // Add paste event listener
  useEffect(() => {
    const handlePasteEvent = (e: ClipboardEvent) => handlePaste(e);
    document.addEventListener("paste", handlePasteEvent);

    return () => {
      document.removeEventListener("paste", handlePasteEvent);
    };
  }, []);

  const processImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const result = await processImageUtil(
        selectedFile,
        selectedColor,
        borderEnabled ? borderSize : 0
      );
      setProcessedImage(result);
      logUsage(selectedFile, {
        borderSize: borderEnabled ? borderSize : 0,
        selectedColour: selectedColor,
      });

      // Scroll to result section after processing is complete
      setTimeout(() => {
        resultSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;

    const link = document.createElement("a");
    link.href = processedImage;
    link.download = "processed-icon.png";
    link.click();
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setProcessedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div class="app">
      <header>
        <h1>Blood on the Clocktower Character Icon Generator</h1>
        <p>
          Uploaded images should have a transparent background. Black and white
          images work best.
        </p>
        <p>
          You can remove backgrounds from images using free tools such as{" "}
          <a href="https://www.remove.bg/">https://www.remove.bg/</a>
        </p>
      </header>

      <main>
        {!selectedFile && (
          <div class="upload-section">
            <div
              class={`upload-area ${isDragOver ? "drag-over" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.svg"
                onChange={handleFileInputChange}
                style={{ display: "none" }}
              />
              <div class="upload-prompt">
                <p>Drop your image here, click to browse, or paste (Ctrl+V)</p>
              </div>
            </div>
          </div>
        )}

        {selectedFile && previewImage && (
          <div class="preview-section">
            <h3>Original Image</h3>
            <div class="image-preview">
              <img src={previewImage} alt="Original uploaded image" />
            </div>
            <button class="clear-btn" onClick={clearImage}>
              Clear Image
            </button>
          </div>
        )}

        <div class="controls-section">
          <div class="control-group">
            <label>Character Type:</label>
            <div class="color-options">
              {(["blue", "red", "gold", "traveller"] as ColorOption[]).map(
                (color) => (
                  <button
                    key={color}
                    class={`color-option ${
                      color === "traveller" ? "traveller-option" : ""
                    } ${selectedColor === color ? "selected" : ""}`}
                    onClick={() => setSelectedColor(color)}
                    style={
                      color !== "traveller"
                        ? {
                            backgroundColor: COLOR_VALUES[color],
                          }
                        : undefined
                    }
                  >
                    {COLOR_LABELS[color]}
                  </button>
                )
              )}
            </div>
          </div>

          <div class="control-group">
            <label>
              <input
                type="checkbox"
                checked={borderEnabled}
                onChange={(e) =>
                  setBorderEnabled((e.target as HTMLInputElement).checked)
                }
              />
              Add border
            </label>
          </div>

          <div class="control-group">
            <label for="border-size">Border Size (pixels):</label>
            <input
              id="border-size"
              type="number"
              min="0"
              max="20"
              value={borderSize}
              disabled={!borderEnabled}
              onChange={(e) =>
                setBorderSize(
                  parseInt((e.target as HTMLInputElement).value) || 0
                )
              }
            />
          </div>

          <button
            class="process-btn"
            onClick={processImage}
            disabled={!selectedFile || isProcessing}
          >
            {isProcessing ? "Processing..." : "Generate Icon"}
          </button>
        </div>

        {processedImage && (
          <div class="result-section" ref={resultSectionRef}>
            <h3>Generated Icon</h3>
            <div class="image-preview">
              <img src={processedImage} alt="Processed icon" />
            </div>
            <button class="download-btn" onClick={downloadImage}>
              Download PNG
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
