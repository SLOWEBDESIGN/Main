import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

/**
 * The site's buttons are stair treads, after the staircase in the hero: a slanted
 * tread on a riser that rises on hover and sinks when pressed. No pills, no boxes.
 */
type StepStyle = { children: ReactNode; quiet?: boolean; large?: boolean; className?: string };

const stepClass = ({ quiet, large, className }: Omit<StepStyle, "children">) =>
  ["atelier-step", quiet && "is-quiet", large && "is-large", className].filter(Boolean).join(" ");

/** Three treads, drawn in when the step is hovered. */
function Stairs() {
  return (
    <svg className="atelier-step-glyph" viewBox="0 0 20 16" aria-hidden="true" focusable="false">
      <path d="M1 15H7V10H13V5H19V1" />
    </svg>
  );
}

export function StepLink({
  children,
  quiet,
  large,
  className,
  ...rest
}: StepStyle & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={stepClass({ quiet, large, className })} {...rest}>
      <span>{children}</span>
      <Stairs />
    </a>
  );
}

export function StepButton({
  children,
  quiet,
  large,
  className,
  type = "button",
  ...rest
}: StepStyle & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={stepClass({ quiet, large, className })} {...rest}>
      <span>{children}</span>
      <Stairs />
    </button>
  );
}
