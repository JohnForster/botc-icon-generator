import type { ColorOption } from "../utils/imageUtils";
import { COLOR_LABELS, COLOR_VALUES } from "../utils/imageUtils";
import type { ProcessingOptions } from "../types";
import "./OptionsSelector.css";

interface OptionsSelectorProps {
  options: ProcessingOptions;
  onOptionsChange: (options: ProcessingOptions) => void;
}

export function OptionsSelector({ options, onOptionsChange }: OptionsSelectorProps) {
  const updateOption = <K extends keyof ProcessingOptions>(
    key: K,
    value: ProcessingOptions[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div class="options-selector">
      {/* Character Type Section */}
      <section class="options-section">
        <h3>Character Type</h3>
        <div class="character-type-grid">
          {(["blue", "red", "gold", "traveller"] as ColorOption[]).map((color) => (
            <button
              key={color}
              class={`character-type-btn ${options.selectedColor === color ? "selected" : ""} ${
                color === "traveller" ? "traveller" : ""
              }`}
              onClick={() => updateOption("selectedColor", color)}
              style={
                color !== "traveller"
                  ? { backgroundColor: COLOR_VALUES[color] }
                  : undefined
              }
            >
              {COLOR_LABELS[color]}
            </button>
          ))}
        </div>
      </section>

      {/* Image Processing Section */}
      <section class="options-section">
        <h3>Image Processing</h3>
        <div class="processing-options">
          <label class="checkbox-option">
            <input
              type="checkbox"
              checked={options.invertEnabled}
              onChange={(e) =>
                updateOption("invertEnabled", (e.target as HTMLInputElement).checked)
              }
            />
            <span class="checkbox-label">Invert colors</span>
          </label>

          <label class="checkbox-option">
            <input
              type="checkbox"
              checked={options.cropEnabled}
              onChange={(e) =>
                updateOption("cropEnabled", (e.target as HTMLInputElement).checked)
              }
            />
            <span class="checkbox-label">Crop to content</span>
          </label>
        </div>
      </section>

      {/* Border Section */}
      <section class="options-section">
        <h3>Border</h3>
        <div class="border-options">
          <label class="checkbox-option">
            <input
              type="checkbox"
              checked={options.borderEnabled}
              onChange={(e) =>
                updateOption("borderEnabled", (e.target as HTMLInputElement).checked)
              }
            />
            <span class="checkbox-label">Add border</span>
          </label>
          
          {options.borderEnabled && (
            <div class="number-input-group">
              <label class="number-label">Border size (pixels)</label>
              <input
                type="number"
                min="0"
                max="20"
                value={options.borderSize}
                onChange={(e) =>
                  updateOption("borderSize", parseInt((e.target as HTMLInputElement).value) || 0)
                }
                class="number-input"
              />
            </div>
          )}
        </div>
      </section>

      {/* Traveller Adjustment Section */}
      {options.selectedColor === "traveller" && (
        <section class="options-section">
          <h3>Traveller Adjustment</h3>
          <div class="number-input-group">
            <label class="number-label">Horizontal adjustment</label>
            <input
              type="number"
              min="-160"
              max="160"
              value={options.horizontalPadding}
              onChange={(e) =>
                updateOption("horizontalPadding", parseInt((e.target as HTMLInputElement).value) || 0)
              }
              class="number-input"
            />
            <small class="input-hint">
              Positive = right adjustment, Negative = left adjustment
            </small>
          </div>
        </section>
      )}
    </div>
  );
}