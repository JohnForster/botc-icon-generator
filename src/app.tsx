import { useState } from "preact/hooks";
import "./app.css";
import { processImage as processImageUtil } from "./utils/imageUtils";
import { logUsage } from "./utils/logger";
import type { ProcessingOptions } from "./types";
import { OptionsSelector } from "./components/OptionsSelector";
import { ImageSelector } from "./components/ImageSelector";
import { IconPreview } from "./components/IconPreview";

const DEFAULT_OPTIONS: ProcessingOptions = {
  selectedColor: "red",
  borderSize: 2,
  borderEnabled: false,
  invertEnabled: false,
  cropEnabled: true,
  horizontalPadding: 0,
  smoothBlend: true,
  increaseContrast: true,
  removeBackground: false,
};

export function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [options, setOptions] = useState<ProcessingOptions>(DEFAULT_OPTIONS);
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
        options.cropEnabled,
        options.smoothBlend,
        options.increaseContrast,
        options.removeBackground
      );
      setProcessedImage(result);
      logUsage(selectedFile, options);
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
        <div class="page-header">
          <img src="/artist-icon.png"></img>
          <div class="header-subheader">
            <h1>Clocktower Icon Generator</h1>
            <h2>
              A tool for creating icons for custom Blood on the Clocktower roles
            </h2>
          </div>
        </div>
        <p>
          Uploaded images should have a transparent background. Black and white
          images work best.
        </p>
        <p>
          If background removal doesn't work or isn't very good, use a free tool
          such as <a href="https://www.remove.bg/">https://www.remove.bg/</a>
        </p>
      </header>

      <main>
        <div class={`main-layout ${processedImage ? "has-result" : ""}`}>
          <div class="left-panel">
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
                <OptionsSelector
                  options={options}
                  onOptionsChange={setOptions}
                />

                <button
                  class="process-btn"
                  onClick={processImage}
                  disabled={!selectedFile || isProcessing}
                >
                  {isProcessing ? "Processing..." : "Generate Icon"}
                </button>
              </>
            )}
          </div>

          <div class="right-panel">
            <IconPreview
              processedImage={processedImage}
              isProcessing={isProcessing}
              onDownload={handleDownloadImage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
