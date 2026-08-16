import "./style.css";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { SideNav } from "./features/navigation/side-nav.tsx";
import { fetchNotes } from "./features/notes/notes-data.ts";
import { NotePage } from "./features/notes/note-page.tsx";
import { NotesMenu } from "./features/notes/notes-menu.tsx";
import type { NotePreview, NotesSource } from "./features/notes/types.ts";

const inbox: NotesSource = { id: "inbox", name: "Inbox", type: "folder" };

type NotesState = { status: "loading" } | { notes: NotePreview[]; status: "ready" };

function App() {
  const [source, setSource] = useState<NotesSource>(inbox);
  const [selectedNote, setSelectedNote] = useState<NotePreview | null>(null);
  const [notesState, setNotesState] = useState<NotesState>({ status: "loading" });

  useEffect(() => {
    let isCurrent = true;
    setNotesState({ status: "loading" });

    void fetchNotes(source).then((nextNotes) => {
      if (!isCurrent) {
        return;
      }

      setSelectedNote(nextNotes[0] ?? null);
      setNotesState({ notes: nextNotes, status: "ready" });
    });

    return () => {
      isCurrent = false;
    };
  }, [source]);

  return (
    <main class="app-shell">
      <SideNav
        selectedFolderId={source.type === "folder" ? source.id : undefined}
        selectedTagId={source.type === "tag" ? source.id : undefined}
        onFolderSelect={(folder) => setSource({ id: folder.id, name: folder.name, type: "folder" })}
        onTagSelect={(tag) => setSource({ id: tag.id, name: tag.name, type: "tag" })}
      />

      <NotesMenu
        notes={notesState.status === "ready" ? notesState.notes : []}
        selectedNoteId={selectedNote?.id}
        sourceName={source.name}
        status={notesState.status}
        onNoteSelect={setSelectedNote}
      />

      <NotePage note={selectedNote} source={source} />
    </main>
  );
}

const app = document.querySelector<HTMLDivElement>("#app");
if (app === null) {
  throw new Error("App root not found");
}

render(<App />, app);
