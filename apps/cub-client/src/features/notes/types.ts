/** A note preview shown in the notes menu before the editor is connected. */
export interface NotePreview {
  content: string;
  createdAt: string;
  folderId: string;
  id: string;
  tagIds: string[];
  title: string;
}

/** The currently selected source in the vault navigation. */
export interface NotesSource {
  id: string;
  name: string;
  type: "folder" | "tag";
}
