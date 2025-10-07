import { useState } from "preact/hooks";
import "./app.css";
import { processImage as processImageUtil } from "./utils/imageUtils";
import { logUsage } from "./utils/logger";
import type { ProcessingOptions } from "./types";
import { OptionsSelector } from "./components/OptionsSelector";
import { ImageSelector } from "./components/ImageSelector";
import { IconPreview } from "./components/IconPreview";

export function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [options, setOptions] = useState<ProcessingOptions>({
    selectedColor: "red",
    borderSize: 2,
    borderEnabled: false,
    invertEnabled: false,
    cropEnabled: true,
    horizontalPadding: 0,
  });
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith("image/") || file.type === "image/svg+xml") {
      setSelectedFile(file);
      setProcessedImage(null);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setProcessedImage(null);
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const result = await processImageUtil(
        selectedFile,
        options.selectedColor,
        options.borderEnabled ? options.borderSize : 0,
        options.invertEnabled,
        options.selectedColor === "traveller" ? options.horizontalPadding : 0,
        options.cropEnabled
      );
      setProcessedImage(result);
      logUsage(selectedFile, {
        borderSize: options.borderEnabled ? options.borderSize : 0,
        selectedColour: options.selectedColor,
      });
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadImage = () => {
    if (!processedImage) return;

    const link = document.createElement("a");
    link.href = processedImage;
    link.download = "processed-icon.png";
    link.click();
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
        <ImageSelector
          selectedFile={selectedFile}
          previewImage={previewImage}
          isDragOver={isDragOver}
          onFileSelect={handleFileSelect}
          onDragOver={setIsDragOver}
          onClearImage={handleClearImage}
        />

        {selectedFile && (
          <>
            <OptionsSelector options={options} onOptionsChange={setOptions} />

            <button
              class="process-btn"
              onClick={processImage}
              disabled={!selectedFile || isProcessing}
            >
              {isProcessing ? "Processing..." : "Generate Icon"}
            </button>
          </>
        )}

        <IconPreview
          processedImage={processedImage}
          isProcessing={isProcessing}
          onDownload={handleDownloadImage}
        />
      </main>
    </div>
  );
}
