// Soft wave divider -- the brand's friendly signature shape.
export default function Wave({
  className = "",
  fill = "var(--color-paper)",
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 40c180 40 360 60 540 50s360-60 540-60 280 30 360 40v50H0V40Z"
        fill={fill}
      />
    </svg>
  );
}
