import type { TagData, VaultData } from "./types.ts";

/**
 * Returns a small stand-in for the folder structure of the open vault.
 * Replace this with the vault data source when loading is available.
 */
export function getVaultData(): VaultData {
  return {
    id: "vault",
    name: "Vault",
    folders: [
      { id: "inbox", name: "Inbox" },
      {
        id: "projects",
        name: "Projects",
        children: [
          { id: "cub-notes", name: "Cub Notes" },
          { id: "website-refresh", name: "Website Refresh" },
        ],
      },
      {
        id: "areas",
        name: "Areas",
        children: [
          { id: "health", name: "Health" },
          { id: "learning", name: "Learning" },
        ],
      },
      { id: "archive", name: "Archive" },
    ],
  };
}

/** Returns sample tags until tags can be collected from notes and persisted. */
export function getTagData(): TagData[] {
  return [
    { id: "ideas", name: "ideas", noteCount: 12 },
    { id: "writing", name: "writing", noteCount: 8 },
    { id: "research", name: "research", noteCount: 6 },
    { id: "weekly-review", name: "weekly-review", noteCount: 4 },
  ];
}
