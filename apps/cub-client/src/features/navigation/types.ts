/** A directory in the currently open vault. */
export interface VaultFolder {
  id: string;
  name: string;
  children?: VaultFolder[];
}

/** The folder structure available in the currently open vault. */
export interface VaultData {
  id: string;
  name: string;
  folders: VaultFolder[];
}

/** A tag discovered in one or more notes. */
export interface TagData {
  id: string;
  name: string;
  noteCount: number;
}
