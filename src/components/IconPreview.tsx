import { useRef, useEffect } from "preact/hooks";
import "./IconPreview.css";

interface IconPreviewProps {
  processedImage: string | null;
  isProcessing: boolean;
  onDownload: () => void;
}

export function IconPreview({
  processedImage,
  isProcessing,
  onDownload,
}: IconPreviewProps) {
  const resultSectionRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to result when processing completes
  useEffect(() => {
    if (processedImage && !isProcessing) {
      setTimeout(() => {
        resultSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [processedImage, isProcessing]);

  if (isProcessing) {
    return (
      <div class="icon-preview processing">
        <div class="processing-content">
          <div class="loading-spinner"></div>
          <h3>Processing Your Icon</h3>
          <p>Applying textures and effects...</p>
        </div>
      </div>
    );
  }

  if (!processedImage) {
    return null;
  }

  return (
    <div class="icon-preview" ref={resultSectionRef}>
      <div class="result-content">
        <h3 class="section-title">Generated Icon</h3>
        <div class="icon-container">
          <img
            src={processedImage}
            alt="Generated icon"
            class="transparent-background"
          />
        </div>
        <div class="result-actions">
          <button class="btn" onClick={onDownload}>
            Download
          </button>
        </div>
        <div class="usage-note">
          <p>
            <strong>Tip:</strong> If using with bloodstar.xyz, make sure to
            uncheck the "Colorize" and "Texture" options when uploading the
            image.
          </p>
        </div>
      </div>
    </div>
  );
}
