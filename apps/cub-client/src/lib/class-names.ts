import type * as Preact from "preact";

/** Element props whose `class` is a plain string, so merging stays a one-liner. */
export type WithClass<E extends EventTarget> = Omit<Preact.HTMLAttributes<E>, "class"> & {
  class?: string;
};

/** Joins class names and ignores falsy values. */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
