import { expect, test } from "vite-plus/test";
import { Button } from "../src/index.ts";

test("Button is a Preact component", () => {
  expect(Button({ children: "Save note" }).type).toBe("button");
});
