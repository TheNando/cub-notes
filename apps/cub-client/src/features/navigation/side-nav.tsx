import { ChevronDown, ChevronRight, Folder, FolderOpen, Hash } from "lucide-preact";
import { useState } from "preact/hooks";
import { cx } from "../../lib/class-names.ts";
import type { WithClass } from "../../lib/class-names.ts";
import { getTagData, getVaultData } from "./navigation-data.ts";
import "./side-nav.css";
import type { TagData, VaultData, VaultFolder } from "./types.ts";

interface SideNavProps extends WithClass<HTMLElement> {
  onFolderSelect?: (folder: VaultFolder) => void;
  onTagSelect?: (tag: TagData) => void;
  selectedFolderId?: string;
  selectedTagId?: string;
  tags?: TagData[];
  vault?: VaultData;
}

interface SideNavVaultProps {
  onFolderSelect?: (folder: VaultFolder) => void;
  selectedFolderId?: string;
  vault: VaultData;
}

interface SideNavTagsProps {
  onTagSelect?: (tag: TagData) => void;
  selectedTagId?: string;
  tags: TagData[];
}

export function SideNav({
  vault = getVaultData(),
  tags = getTagData(),
  onFolderSelect,
  onTagSelect,
  selectedFolderId,
  selectedTagId,
  class: className,
  ...props
}: SideNavProps) {
  return (
    <aside aria-label="Vault navigation" class={cx("cub-side-nav", className)} {...props}>
      <SideNavVault
        vault={vault}
        onFolderSelect={onFolderSelect}
        selectedFolderId={selectedFolderId}
      />
      <SideNavTags tags={tags} onTagSelect={onTagSelect} selectedTagId={selectedTagId} />
    </aside>
  );
}

function SideNavVault({ vault, onFolderSelect, selectedFolderId }: SideNavVaultProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section class="cub-side-nav__section" aria-labelledby={`${vault.id}-heading`}>
      <h2 id={`${vault.id}-heading`} class="sr-only">
        {vault.name}
      </h2>
      <button
        type="button"
        class="cub-side-nav__root"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        {isExpanded ? (
          <ChevronDown size={18} aria-hidden="true" />
        ) : (
          <ChevronRight size={18} aria-hidden="true" />
        )}
        <FolderOpen class="cub-side-nav__root-icon" size={20} aria-hidden="true" />
        {vault.name}
      </button>
      {isExpanded ? (
        <ul class="cub-side-nav__tree">
          {vault.folders.map((folder) => (
            <VaultFolderItem
              key={folder.id}
              folder={folder}
              onFolderSelect={onFolderSelect}
              selectedFolderId={selectedFolderId}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function SideNavTags({ tags, onTagSelect, selectedTagId }: SideNavTagsProps) {
  return (
    <section class="cub-side-nav__section" aria-labelledby="tags-heading">
      <h2 id="tags-heading" class="cub-side-nav__section-heading">
        Tags
      </h2>
      <ul class="cub-side-nav__tags">
        {tags.map((tag) => (
          <li key={tag.id}>
            <button
              type="button"
              class="cub-side-nav__tag"
              aria-current={selectedTagId === tag.id ? "page" : undefined}
              onClick={() => onTagSelect?.(tag)}
            >
              <Hash class="cub-side-nav__tag-icon" size={17} aria-hidden="true" />
              <span class="cub-side-nav__tag-label">{tag.name}</span>
              <span class="cub-side-nav__tag-count">{tag.noteCount}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface VaultFolderItemProps {
  folder: VaultFolder;
  onFolderSelect?: (folder: VaultFolder) => void;
  selectedFolderId?: string;
}

function VaultFolderItem({ folder, onFolderSelect, selectedFolderId }: VaultFolderItemProps) {
  const hasChildren = Boolean(folder.children?.length);
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <li class="cub-side-nav__row">
      {hasChildren ? (
        <button
          type="button"
          class="cub-side-nav__toggle"
          aria-label={`${isExpanded ? "Collapse" : "Expand"} ${folder.name}`}
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          {isExpanded ? (
            <ChevronDown size={16} aria-hidden="true" />
          ) : (
            <ChevronRight size={16} aria-hidden="true" />
          )}
        </button>
      ) : null}
      <button
        type="button"
        class="cub-side-nav__item"
        aria-current={selectedFolderId === folder.id ? "page" : undefined}
        onClick={() => onFolderSelect?.(folder)}
      >
        {hasChildren && isExpanded ? (
          <FolderOpen class="cub-side-nav__item-icon" size={18} aria-hidden="true" />
        ) : (
          <Folder class="cub-side-nav__item-icon" size={18} aria-hidden="true" />
        )}
        <span class="cub-side-nav__item-label">{folder.name}</span>
      </button>
      {hasChildren && isExpanded ? (
        <ul class="cub-side-nav__tree">
          {folder.children?.map((child) => (
            <VaultFolderItem
              key={child.id}
              folder={child}
              onFolderSelect={onFolderSelect}
              selectedFolderId={selectedFolderId}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
