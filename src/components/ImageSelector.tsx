import { useRef, useEffect } from "preact/hooks";
import "./ImageSelector.css";

interface ImageSelectorProps {
  selectedFile: File | null;
  previewImage: string | null;
  isDragOver: boolean;
  onFileSelect: (file: File) => void;
  onDragOver: (isDragOver: boolean) => void;
  onClearImage: () => void;
}

export function ImageSelector({
  selectedFile,
  previewImage,
  isDragOver,
  onFileSelect,
  onDragOver,
  onClearImage,
}: ImageSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    onDragOver(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    onDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    onDragOver(false);
  };

  const handleFileInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      onFileSelect(target.files[0]);
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
        onFileSelect(file);
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

  if (selectedFile && previewImage) {
    return (
      <div class="image-selector">
        <div class="image-preview-section">
          <h3>Selected Image</h3>
          <div class="image-preview-container">
            <img
              src={previewImage}
              alt="Selected image preview"
              class="transparent-background"
            />
          </div>
          <div class="image-info">
            <p class="filename">{selectedFile.name}</p>
            <p class="filesize">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
          <button class="clear-image-btn" onClick={onClearImage}>
            Clear Image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class="image-selector">
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
          class="file-input"
        />
        <div class="upload-content">
          <h3>Upload Your Image</h3>
          <p class="upload-primary">
            Drop your image here, click to browse, or paste (Ctrl+V)
          </p>
          <p class="upload-secondary">
            Best results with black and white line drawn images with transparent
            backgrounds
          </p>
        </div>
      </div>
    </div>
  );
}
