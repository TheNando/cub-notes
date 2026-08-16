import { FilePlus2, Search, X } from "lucide-preact";
import { useState } from "preact/hooks";
import { formatRelativeTime } from "./relative-time.ts";
import type { NotePreview } from "./types.ts";
import "./notes-menu.css";

interface NotesMenuProps {
  notes: NotePreview[];
  selectedNoteId?: string;
  sourceName: string;
  status: "loading" | "ready";
  onNoteSelect: (note: NotePreview) => void;
}

export function NotesMenu({
  notes,
  selectedNoteId,
  sourceName,
  status,
  onNoteSelect,
}: NotesMenuProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <aside aria-label="Notes menu" class="cub-notes-menu">
      <header
        class={`cub-notes-menu__action-bar${isSearchOpen ? " cub-notes-menu__action-bar--searching" : ""}`}
      >
        {!isSearchOpen ? <h2 class="cub-notes-menu__title">{sourceName}</h2> : null}
        <div class="cub-notes-menu__actions">
          {!isSearchOpen ? (
            <button
              type="button"
              class="cub-notes-menu__icon-button cub-notes-menu__new-note"
              aria-label="Create a new note"
            >
              <FilePlus2 size={17} aria-hidden="true" />
            </button>
          ) : null}
          {!isSearchOpen ? (
            <button
              type="button"
              class="cub-notes-menu__icon-button cub-notes-menu__search"
              aria-label="Search notes"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search size={17} aria-hidden="true" />
            </button>
          ) : (
            <div class="cub-notes-menu__search-input">
              <Search size={17} aria-hidden="true" />
              <input aria-label="Search notes" autofocus placeholder="Search notes" type="search" />
              <button
                type="button"
                class="cub-notes-menu__icon-button"
                aria-label="Close search"
                onClick={() => setIsSearchOpen(false)}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </header>

      <ul class="cub-notes-menu__list" aria-busy={status === "loading"}>
        {status === "ready"
          ? notes.map((note) => {
              const firstLine = note.content.split(/\r?\n/, 1)[0] || "No content";
              return (
                <li key={note.id}>
                  <button
                    type="button"
                    class="cub-notes-menu__card"
                    aria-current={selectedNoteId === note.id ? "page" : undefined}
                    onClick={() => onNoteSelect(note)}
                  >
                    <span class="cub-notes-menu__card-title">{note.title}</span>
                    <span class="cub-notes-menu__card-preview">{firstLine}</span>
                    <time class="cub-notes-menu__card-time" dateTime={note.createdAt}>
                      {formatRelativeTime(note.createdAt)}
                    </time>
                  </button>
                </li>
              );
            })
          : null}
        {status === "loading" ? (
          <li class="cub-notes-menu__empty" role="status">
            Loading notes…
          </li>
        ) : null}
        {status === "ready" && notes.length === 0 ? (
          <li class="cub-notes-menu__empty" role="status">
            No notes in this view yet.
          </li>
        ) : null}
      </ul>
    </aside>
  );
}
