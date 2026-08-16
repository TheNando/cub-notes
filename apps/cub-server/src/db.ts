import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import type { CreateNoteInput, Note, NotesRepository } from "@cub/api";

type DatabaseNote = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

const databasePath = Bun.env.DATABASE_PATH ?? join(import.meta.dir, "../data/cub-notes.sqlite");

if (databasePath !== ":memory:") {
  mkdirSync(dirname(databasePath), { recursive: true });
}

const database = new Database(databasePath);

database.run(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const listNotes = database.query<DatabaseNote, []>(`
  SELECT id, title, content, created_at, updated_at
  FROM notes
  ORDER BY updated_at DESC, id DESC
`);

const createNote = database.query<DatabaseNote, [string, string]>(`
  INSERT INTO notes (title, content)
  VALUES (?, ?)
  RETURNING id, title, content, created_at, updated_at
`);

function toNote(note: DatabaseNote): Note {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  };
}

export const notesRepository: NotesRepository = {
  list() {
    return listNotes.all().map(toNote);
  },
  create(input: CreateNoteInput) {
    const note = createNote.get(input.title, input.content);
    if (note === null) {
      throw new Error("Failed to create note");
    }
    return toNote(note);
  },
};
