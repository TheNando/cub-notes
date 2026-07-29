import "./style.css";
import type { Note } from "@cub/api";
import { trpc } from "./trpc.ts";

const app = document.querySelector<HTMLDivElement>("#app");
if (app === null) {
  throw new Error("App root not found");
}

app.innerHTML = `
  <main>
    <header>
      <p class="eyebrow">Cub Notes</p>
      <h1>Notes, stored locally.</h1>
      <p class="intro">The browser talks to the Bun server through tRPC; notes live in a local SQLite database.</p>
    </header>

    <form id="new-note">
      <label>
        Title
        <input name="title" maxlength="200" required autofocus>
      </label>
      <label>
        Content
        <textarea name="content" maxlength="20000" rows="5"></textarea>
      </label>
      <button type="submit">Save note</button>
      <p id="form-status" role="status"></p>
    </form>

    <section aria-labelledby="notes-heading">
      <div class="section-heading">
        <h2 id="notes-heading">Your notes</h2>
        <button id="refresh" class="quiet" type="button">Refresh</button>
      </div>
      <p id="notes-status" role="status">Loading notes…</p>
      <ol id="notes"></ol>
    </section>
  </main>
`;

const form = document.querySelector<HTMLFormElement>("#new-note");
const formStatus = document.querySelector<HTMLParagraphElement>("#form-status");
const notesStatus = document.querySelector<HTMLParagraphElement>("#notes-status");
const notesList = document.querySelector<HTMLOListElement>("#notes");
const refreshButton = document.querySelector<HTMLButtonElement>("#refresh");

if (
  form === null ||
  formStatus === null ||
  notesStatus === null ||
  notesList === null ||
  refreshButton === null
) {
  throw new Error("Notes UI is incomplete");
}

const ui = { form, formStatus, notesStatus, notesList, refreshButton };

function noteItem(note: Note) {
  const item = document.createElement("li");
  const title = document.createElement("h3");
  const content = document.createElement("p");
  const timestamp = document.createElement("time");

  title.textContent = note.title;
  content.textContent = note.content || "No content";
  timestamp.dateTime = note.updatedAt;
  timestamp.textContent = `Updated ${new Date(note.updatedAt).toLocaleString()}`;

  item.append(title, content, timestamp);
  return item;
}

async function refreshNotes() {
  ui.notesStatus.textContent = "Loading notes…";

  try {
    const notes = await trpc.notes.list.query();
    ui.notesList.replaceChildren(...notes.map(noteItem));
    ui.notesStatus.textContent = notes.length === 0 ? "No notes yet." : "";
  } catch (error) {
    ui.notesStatus.textContent = "Could not load notes. Is the Bun server running?";
    console.error(error);
  }
}

function formText(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === "string" ? value : "";
}

ui.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(ui.form);
  const submitButton = ui.form.querySelector<HTMLButtonElement>("button[type=submit]");
  const title = formText(data, "title");
  const content = formText(data, "content");

  if (submitButton === null) {
    return;
  }

  submitButton.disabled = true;
  ui.formStatus.textContent = "Saving…";

  try {
    await trpc.notes.create.mutate({ title, content });
    ui.form.reset();
    ui.formStatus.textContent = "Saved.";
    await refreshNotes();
  } catch (error) {
    ui.formStatus.textContent = "Could not save that note.";
    console.error(error);
  } finally {
    submitButton.disabled = false;
  }
});

ui.refreshButton.addEventListener("click", refreshNotes);
void refreshNotes();
