import type { ColorOption } from "../utils/imageUtils";
import { COLOR_LABELS, COLOR_VALUES } from "../utils/imageUtils";
import type { ProcessingOptions } from "../types";
import "./OptionsSelector.css";

interface OptionsSelectorProps {
  options: ProcessingOptions;
  onOptionsChange: (options: ProcessingOptions) => void;
}

export function OptionsSelector({
  options,
  onOptionsChange,
}: OptionsSelectorProps) {
  const updateOption = <K extends keyof ProcessingOptions>(
    key: K,
    value: ProcessingOptions[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div class="options-selector">
      <section class="options-section">
        <h3>Input Image Type</h3>
        <div class="processing-options">
          <label class="checkbox-option">
            <input
              type="radio"
              name="inputImageMode"
              checked={options.inputImageMode === "black-white"}
              onChange={() => {
                onOptionsChange({
                  ...options,
                  inputImageMode: "black-white",
                  increaseContrast: false,
                });
              }}
            />
            <span class="checkbox-label">Black & White</span>
          </label>
          <label class="checkbox-option">
            <input
              type="radio"
              name="inputImageMode"
              checked={options.inputImageMode === "greyscale"}
              onChange={() => {
                onOptionsChange({
                  ...options,
                  inputImageMode: "greyscale",
                  increaseContrast: true,
                });
              }}
            />
            <span class="checkbox-label">Greyscale/Colour</span>
          </label>
          <label class="checkbox-option">
            <input
              type="radio"
              name="inputImageMode"
              checked={options.inputImageMode === "auto"}
              onChange={() => {
                onOptionsChange({
                  ...options,
                  inputImageMode: "auto",
                });
              }}
            />
            <span class="checkbox-label">Detect</span>
          </label>
        </div>
      </section>
      {/* Character Type Section */}
      <section class="options-section">
        <h3>Character Type</h3>
        <div class="character-type-grid">
          {(
            [
              "blue",
              "red",
              "traveller",
              "gold",
              "green",
              "travellergood",
              "travellerevil",
            ] as ColorOption[]
          ).map((color) => (
            <button
              key={color}
              class={`character-type-btn ${
                options.selectedColor === color ? "selected" : ""
              } ${color.includes("traveller") ? color : ""}`}
              onClick={() => updateOption("selectedColor", color)}
              style={
                !color.includes("traveller")
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
              checked={options.removeBackground}
              onChange={(e) =>
                updateOption(
                  "removeBackground",
                  (e.target as HTMLInputElement).checked
                )
              }
            />
            <span class="checkbox-label">Remove background (slow)</span>
          </label>

          <label class="checkbox-option">
            <input
              type="checkbox"
              checked={options.invertEnabled}
              onChange={(e) =>
                updateOption(
                  "invertEnabled",
                  (e.target as HTMLInputElement).checked
                )
              }
            />
            <span class="checkbox-label">Invert colors</span>
          </label>

          <label class="checkbox-option">
            <input
              type="checkbox"
              checked={options.cropEnabled}
              onChange={(e) =>
                updateOption(
                  "cropEnabled",
                  (e.target as HTMLInputElement).checked
                )
              }
            />
            <span class="checkbox-label">Crop to content</span>
          </label>

          <label class="checkbox-option">
            <input
              type="checkbox"
              checked={options.paddingEnabled}
              onChange={(e) =>
                updateOption(
                  "paddingEnabled",
                  (e.target as HTMLInputElement).checked
                )
              }
            />
            <span class="checkbox-label">
              Add padding (for use with script tools)
            </span>
          </label>

          <label class="checkbox-option">
            <input
              type="checkbox"
              checked={options.smoothBlend}
              onChange={(e) =>
                updateOption(
                  "smoothBlend",
                  (e.target as HTMLInputElement).checked
                )
              }
            />
            <span class="checkbox-label">Smooth blend</span>
          </label>

          {options.inputImageMode !== "black-white" && (
            <div class="slider-option">
              <label class="slider-label">
                Black/white threshold: {options.contrastThreshold}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={options.contrastThreshold}
                onInput={(e) =>
                  updateOption(
                    "contrastThreshold",
                    parseInt((e.target as HTMLInputElement).value)
                  )
                }
                class="range-slider"
              />
            </div>
          )}

          <label class="checkbox-option">
            <input
              type="checkbox"
              checked={options.dropShadowEnabled}
              onChange={(e) =>
                updateOption(
                  "dropShadowEnabled",
                  (e.target as HTMLInputElement).checked
                )
              }
            />
            <span class="checkbox-label">Drop shadow</span>
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
                updateOption(
                  "borderEnabled",
                  (e.target as HTMLInputElement).checked
                )
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
                  updateOption(
                    "borderSize",
                    parseInt((e.target as HTMLInputElement).value) || 0
                  )
                }
                class="number-input"
              />
            </div>
          )}
        </div>
      </section>

      {/* Output Size Section */}
      <section class="options-section">
        <h3>Output Size</h3>
        <div class="border-options">
          <label class="checkbox-option">
            <input
              type="checkbox"
              checked={options.outputSizeEnabled}
              onChange={(e) =>
                updateOption(
                  "outputSizeEnabled",
                  (e.target as HTMLInputElement).checked
                )
              }
            />
            <span class="checkbox-label">Set output size</span>
          </label>

          {options.outputSizeEnabled && (
            <div class="number-input-group">
              <label class="number-label">Size (pixels)</label>
              <input
                type="number"
                min="100"
                max="4000"
                value={options.outputSize}
                onChange={(e) =>
                  updateOption(
                    "outputSize",
                    parseInt((e.target as HTMLInputElement).value) || 800
                  )
                }
                class="number-input"
              />
              <small class="input-hint">
                Largest dimension of the output image
              </small>
            </div>
          )}
        </div>
      </section>

      {/* Traveller Adjustment Section */}
      {options.selectedColor.includes("traveller") && (
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
                updateOption(
                  "horizontalPadding",
                  parseInt((e.target as HTMLInputElement).value) || 0
                )
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
