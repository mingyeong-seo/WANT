import { useEffect, useRef, useState } from "react";

export default function SimpleSelect({
  value,
  options,
  onChange,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleScroll = () => {
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  const handleSelect = (optionValue) => {
    onChange?.(optionValue);
    setOpen(false);
  };

  const handleOptionPointerDown = (event, optionValue) => {
    event.preventDefault();
    event.stopPropagation();
    handleSelect(optionValue);
  };

  const handleTriggerPointerDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen((prev) => !prev);
  };

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={`simple-select ${className}`.trim()} ref={containerRef}>
      <button
        type="button"
        className="simple-select-trigger"
        onPointerDown={handleTriggerPointerDown}
      >
        <span className="simple-select-label">
          {selectedOption ? selectedOption.label : ""}
        </span>
        <span className="simple-select-arrow">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="simple-select-dropdown">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`simple-select-option ${
                value === option.value ? "active" : ""
              }`}
              onPointerDown={(event) =>
                handleOptionPointerDown(event, option.value)
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
