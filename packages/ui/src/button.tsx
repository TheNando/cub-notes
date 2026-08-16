import type { JSX } from "preact";

export type ButtonProps = JSX.IntrinsicElements["button"];

export function Button({ children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>;
}
