import type { NotePreview, NotesSource } from "./types.ts";

function timestampAgo(milliseconds: number) {
  return new Date(Date.now() - milliseconds).toISOString();
}

/**
 * Returns sample notes while the notes menu is not connected to a data source.
 * Keep this utility asynchronous so callers will not need to change when it is
 * replaced with a server request.
 */
export async function fetchNotes(source: NotesSource): Promise<NotePreview[]> {
  const notes = getMockNotes();

  return notes.filter((note) =>
    source.type === "folder" ? note.folderId === source.id : note.tagIds.includes(source.id),
  );
}

/** Returns a fresh set of timestamps so the relative time labels stay useful. */
export function getMockNotes(): NotePreview[] {
  return [
    {
      id: "quick-capture",
      title: "Quick capture ideas",
      content: "A short place to collect ideas before they disappear.",
      createdAt: timestampAgo(2 * 60 * 1000),
      folderId: "inbox",
      tagIds: ["ideas"],
    },
    {
      id: "weekly-review",
      title: "Weekly review prompts",
      content: "What moved forward this week, and what needs a little more attention?",
      createdAt: timestampAgo(2 * 60 * 60 * 1000),
      folderId: "inbox",
      tagIds: ["weekly-review", "writing"],
    },
    {
      id: "reading-list",
      title: "Reading list",
      content: "Essays and articles to return to on a quieter afternoon.",
      createdAt: timestampAgo(1 * 24 * 60 * 60 * 1000),
      folderId: "inbox",
      tagIds: ["research"],
    },
    {
      id: "menu-feature",
      title: "Notes menu feature",
      content: "The notes list should make it simple to scan a folder without losing context.",
      createdAt: timestampAgo(5 * 60 * 60 * 1000),
      folderId: "cub-notes",
      tagIds: ["ideas", "writing"],
    },
    {
      id: "release-checklist",
      title: "Release checklist",
      content: "Review the empty states, keyboard navigation, and the layout at smaller widths.",
      createdAt: timestampAgo(4 * 24 * 60 * 60 * 1000),
      folderId: "cub-notes",
      tagIds: ["writing"],
    },
    {
      id: "website-notes",
      title: "Website refresh notes",
      content: "Lead with the work and make the next step easy to find.",
      createdAt: timestampAgo(8 * 24 * 60 * 60 * 1000),
      folderId: "website-refresh",
      tagIds: ["writing"],
    },
    {
      id: "movement-plan",
      title: "Movement plan",
      content: "A small routine that feels restorative, not another obligation.",
      createdAt: timestampAgo(3 * 24 * 60 * 60 * 1000),
      folderId: "health",
      tagIds: ["weekly-review"],
    },
    {
      id: "learning-log",
      title: "Learning log",
      content: "Keep a running list of concepts that deserve another pass.",
      createdAt: timestampAgo(7 * 24 * 60 * 60 * 1000),
      folderId: "learning",
      tagIds: ["research"],
    },
    {
      id: "archive-note",
      title: "Old project context",
      content: "Useful decisions from an earlier iteration, preserved for later reference.",
      createdAt: timestampAgo(28 * 24 * 60 * 60 * 1000),
      folderId: "archive",
      tagIds: ["research"],
    },
  ];
}
