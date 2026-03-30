import { useMemo, useState } from "react";

export default function PriceRange({ price, onChange }) {
  const MIN = 0;
  const MAX = 17500000;

  const [minInput, setMinInput] = useState(String(price.min ?? MIN));
  const [maxInput, setMaxInput] = useState(String(price.max ?? MAX));

  const parseNumber = (value) => {
    const cleaned = String(value).replace(/\D/g, "");
    if (!cleaned) return null;
    return Number(cleaned);
  };

  const formatPrice = (value) => {
    if (value == null || value === "") return "";
    return Number(value).toLocaleString("vi-VN");
  };

  const clamp = (value) => {
    if (value == null) return null;
    if (value < MIN) return MIN;
    if (value > MAX) return MAX;
    return value;
  };

  const minValue = useMemo(() => parseNumber(minInput), [minInput]);
  const maxValue = useMemo(() => parseNumber(maxInput), [maxInput]);

  const safeMinValue = clamp(minValue);
  const safeMaxValue = clamp(maxValue);

  const error = useMemo(() => {
    if (minValue == null || maxValue == null) return "";

    if (minValue < MIN || maxValue > MAX) {
      return `Giá phải nằm trong khoảng ${formatPrice(MIN)} - ${formatPrice(MAX)} đ`;
    }

    if (maxValue < minValue) {
      return "Giá đến phải lớn hơn hoặc bằng giá từ";
    }

    return "";
  }, [minValue, maxValue]);

  const commitIfValid = (nextMin, nextMax) => {
    if (nextMin == null || nextMax == null) return;
    if (nextMin < MIN || nextMin > MAX) return;
    if (nextMax < MIN || nextMax > MAX) return;
    if (nextMax < nextMin) return;

    onChange(nextMin, nextMax);
  };

  const handleMinInputChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setMinInput("");
      return;
    }

    const value = clamp(Number(raw));
    setMinInput(String(value));
    commitIfValid(value, safeMaxValue);
  };

  const handleMaxInputChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setMaxInput("");
      return;
    }

    const value = clamp(Number(raw));
    setMaxInput(String(value));
    commitIfValid(safeMinValue, value);
  };

  const handleMinBlur = () => {
    if (minInput === "") return;

    const value = clamp(parseNumber(minInput));
    setMinInput(String(value));
    commitIfValid(value, safeMaxValue);
  };

  const handleMaxBlur = () => {
    if (maxInput === "") return;

    const value = clamp(parseNumber(maxInput));
    setMaxInput(String(value));
    commitIfValid(safeMinValue, value);
  };

  const sliderMin = safeMinValue ?? MIN;
  const sliderMax = safeMaxValue ?? MAX;

  const activeLeft = (Math.min(sliderMin, sliderMax) / MAX) * 100;
  const activeRight = 100 - (Math.max(sliderMin, sliderMax) / MAX) * 100;

  const handleMinSliderChange = (e) => {
    const value = Number(e.target.value);
    const limitedValue = Math.min(value, sliderMax);

    setMinInput(String(limitedValue));
    commitIfValid(limitedValue, sliderMax);
  };

  const handleMaxSliderChange = (e) => {
    const value = Number(e.target.value);
    const limitedValue = Math.max(value, sliderMin);

    setMaxInput(String(limitedValue));
    commitIfValid(sliderMin, limitedValue);
  };

  return (
    <div className="w-full space-y-5">
      <div className="relative price-range-slider">
        <div className="price-range-track" />

        <div
          className="price-range-active"
          style={{
            left: `${activeLeft}%`,
            right: `${activeRight}%`,
          }}
        />

        <input
          type="range"
          min={MIN}
          max={MAX}
          value={sliderMin}
          onChange={handleMinSliderChange}
          className="price-range-input"
        />

        <input
          type="range"
          min={MIN}
          max={MAX}
          value={sliderMax}
          onChange={handleMaxSliderChange}
          className="price-range-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="price-range-value-box">
          <p className="price-range-value-label">Từ</p>
          <input
            type="text"
            inputMode="numeric"
            value={minInput}
            onChange={handleMinInputChange}
            onBlur={handleMinBlur}
            placeholder="Nhập giá từ"
            className="price-range-value-number w-full bg-transparent outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            {minInput ? `${formatPrice(minInput)} đ` : ""}
          </p>
        </div>

        <div className="price-range-value-box text-right">
          <p className="price-range-value-label">Đến</p>
          <input
            type="text"
            inputMode="numeric"
            value={maxInput}
            onChange={handleMaxInputChange}
            onBlur={handleMaxBlur}
            placeholder="Nhập giá đến"
            className="price-range-value-number w-full bg-transparent text-right outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            {maxInput ? `${formatPrice(maxInput)} đ` : ""}
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}