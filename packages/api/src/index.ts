import { initTRPC } from "@trpc/server";
import { z } from "zod";

export type Note = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export const createNoteInput = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(20_000).default(""),
});

export type CreateNoteInput = z.infer<typeof createNoteInput>;

export type NotesRepository = {
  list(): Note[];
  create(input: CreateNoteInput): Note;
};

export type Context = {
  notes: NotesRepository;
};

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  notes: t.router({
    list: t.procedure.query(({ ctx }) => ctx.notes.list()),
    create: t.procedure
      .input(createNoteInput)
      .mutation(({ ctx, input }) => ctx.notes.create(input)),
  }),
});

export type AppRouter = typeof appRouter;
