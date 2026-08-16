import "./style.css";
import type { Note } from "@cub/api";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { Button } from "ui";
import { SideNav } from "./features/navigation/side-nav.tsx";
import { trpc } from "./trpc.ts";

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesStatus, setNotesStatus] = useState("Loading notes…");
  const [formStatus, setFormStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function refreshNotes() {
    setNotesStatus("Loading notes…");

    try {
      const nextNotes = await trpc.notes.list.query();
      setNotes(nextNotes);
      setNotesStatus(nextNotes.length === 0 ? "No notes yet." : "");
    } catch (error) {
      setNotesStatus("Could not load notes. Is the Bun server running?");
      console.error(error);
    }
  }

  useEffect(() => {
    void refreshNotes();
  }, []);

  async function saveNote(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const data = new FormData(form);
    const title = formText(data, "title");
    const content = formText(data, "content");

    setIsSaving(true);
    setFormStatus("Saving…");

    try {
      await trpc.notes.create.mutate({ title, content });
      form.reset();
      setFormStatus("Saved.");
      await refreshNotes();
    } catch (error) {
      setFormStatus("Could not save that note.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div class="app-shell">
      <SideNav />

      <main>
        <header>
          <p class="eyebrow">Cub Notes</p>
          <h1>Notes, stored locally.</h1>
          <p class="intro">
            The browser talks to the Bun server through tRPC; notes live in a local SQLite database.
          </p>
        </header>

        <form onSubmit={saveNote}>
          <label>
            Title
            <input name="title" maxlength={200} required autofocus />
          </label>
          <label>
            Content
            <textarea name="content" maxlength={20_000} rows={5} />
          </label>
          <Button type="submit" disabled={isSaving}>
            Save note
          </Button>
          <p id="form-status" role="status">
            {formStatus}
          </p>
        </form>

        <section aria-labelledby="notes-heading">
          <div class="section-heading">
            <h2 id="notes-heading">Your notes</h2>
            <Button class="quiet" type="button" onClick={refreshNotes}>
              Refresh
            </Button>
          </div>
          <p id="notes-status" role="status">
            {notesStatus}
          </p>
          <ol>
            {notes.map((note) => (
              <li key={note.id}>
                <h3>{note.title}</h3>
                <p>{note.content || "No content"}</p>
                <time dateTime={note.updatedAt}>
                  Updated {new Date(note.updatedAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}

function formText(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === "string" ? value : "";
}

const app = document.querySelector<HTMLDivElement>("#app");
if (app === null) {
  throw new Error("App root not found");
}

render(<App />, app);
