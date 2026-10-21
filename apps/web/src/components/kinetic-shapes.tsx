import "./kinetic-shapes.css";
function Asterisk() {
  return (
    <svg viewBox="0 0 100 100" fill="none">
      <path
        d="M50 3v94M3 50h94M17 17l66 66M17 83l66-66"
        stroke="currentColor"
        strokeWidth="14"
      />
    </svg>
  );
}
export function KineticShapes({
  variant = "hero",
}: {
  variant?: "hero" | "photo" | "rotation";
}) {
  return (
    <div className={`kinetic-shapes kinetic-${variant}`} aria-hidden="true">
      <span className="kinetic-star">
        <Asterisk />
      </span>
      <span className="kinetic-ring" />
      <span className="kinetic-dot" />
      <span className="kinetic-checker">
        <i />
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}
