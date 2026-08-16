import { cx } from "../../lib/class-names.ts";
import type { WithClass } from "../../lib/class-names.ts";
import { formatRelativeTime } from "./relative-time.ts";
import type { NotePreview, NotesSource } from "./types.ts";
import "./note-page.css";

interface NotePageProps extends WithClass<HTMLElement> {
  note: NotePreview | null;
  source: NotesSource;
}

/** Displays the selected note or an empty state for the active source. */
export function NotePage({ note, source, class: className, ...props }: NotePageProps) {
  if (note === null) {
    return (
      <section
        class={cx("note-page", "note-page--empty", className)}
        aria-label="Note page"
        {...props}
      >
        <div class="note-page__empty" aria-live="polite">
          <h1>{source.name}</h1>
          <p>Choose another folder or tag to see its notes.</p>
        </div>
      </section>
    );
  }

  return (
    <section class={cx("note-page", className)} aria-label="Note page" {...props}>
      <article class="note-page__content">
        <p class="note-page__eyebrow">Created {formatRelativeTime(note.createdAt)}</p>
        <h1>{note.title}</h1>
        <p>{note.content}</p>
      </article>
    </section>
  );
}
