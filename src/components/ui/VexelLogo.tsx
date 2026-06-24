interface Props {
  size?: number
  className?: string
}

export default function VexelLogo({ size = 24, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* V shape - geometric monogram */}
      <path
        d="M8 8L24 40L40 8"
        stroke="#D4AF37"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Ascending candle/chart line on right stroke */}
      <line
        x1="33"
        y1="28"
        x2="33"
        y2="16"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Candle wick top */}
      <line
        x1="33"
        y1="16"
        x2="33"
        y2="12"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Small candle body */}
      <rect
        x="30.5"
        y="18"
        width="5"
        height="6"
        rx="1"
        fill="#D4AF37"
      />
    </svg>
  )
}
