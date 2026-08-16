import type { JSX } from "preact";

/** Element props whose `class` is a plain string, so merging stays a one-liner. */
export type WithClass<E extends EventTarget> = Omit<JSX.HTMLAttributes<E>, "class"> & {
  class?: string;
};

/** Joins class names and ignores falsy values. */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
