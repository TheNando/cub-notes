import { notesRepository } from "./db.ts";

export function createContext() {
  return { notes: notesRepository };
}
