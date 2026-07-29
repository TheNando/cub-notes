import { appRouter, type Note, type NotesRepository } from "../src/index.ts";
import { expect, test } from "vite-plus/test";

test("notes procedures validate and return repository data", async () => {
  const notes: Note[] = [];
  const repository: NotesRepository = {
    list: () => notes,
    create: (input) => {
      const note: Note = {
        id: notes.length + 1,
        title: input.title,
        content: input.content,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      };
      notes.push(note);
      return note;
    },
  };
  const caller = appRouter.createCaller({ notes: repository });

  await expect(
    caller.notes.create({ title: "  First note  ", content: "Hello" }),
  ).resolves.toMatchObject({
    id: 1,
    title: "First note",
  });
  await expect(caller.notes.create({ title: "", content: "" })).rejects.toThrow();
  await expect(caller.notes.list()).resolves.toEqual([
    expect.objectContaining({ title: "First note", content: "Hello" }),
  ]);
});
