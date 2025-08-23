export const Logo = () => (
  <svg
    id="logo-skillverse"
    width="160"
    height="32"
    viewBox="0 0 160 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Abstract Logo Symbol (circle with lines) */}
    <circle
      cx="16"
      cy="16"
      r="12"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <line
      x1="16"
      y1="4"
      x2="16"
      y2="28"
      stroke="currentColor"
      strokeWidth="2"
    />
    <line
      x1="4"
      y1="16"
      x2="28"
      y2="16"
      stroke="currentColor"
      strokeWidth="2"
    />

    {/* Text - skillverse */}
    <text
      x="40"
      y="22"
      fontFamily="Arial, sans-serif"
      fontWeight="600"
      fontSize="18"
      fill="currentColor"
      className="fill-foreground"
    >
      skillverse
    </text>
  </svg>
);
