import { ChevronDown, ChevronRight, Folder, FolderOpen, Hash } from "lucide-preact";
import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { getTagData, getVaultData } from "./navigation-data.ts";
import "./side-nav.css";
import type { TagData, VaultData, VaultFolder } from "./types.ts";

interface SideNavProps extends JSX.HTMLAttributes<HTMLElement> {
  onFolderSelect?: (folder: VaultFolder) => void;
  onTagSelect?: (tag: TagData) => void;
  tags?: TagData[];
  vault?: VaultData;
}

interface SideNavVaultProps {
  onFolderSelect?: (folder: VaultFolder) => void;
  vault: VaultData;
}

interface SideNavTagsProps {
  onTagSelect?: (tag: TagData) => void;
  tags: TagData[];
}

export function SideNav({
  vault = getVaultData(),
  tags = getTagData(),
  onFolderSelect,
  onTagSelect,
  class: className,
  ...props
}: SideNavProps) {
  const classes = typeof className === "string" ? `cub-side-nav ${className}` : "cub-side-nav";

  return (
    <aside aria-label="Vault navigation" class={classes} {...props}>
      <SideNavVault vault={vault} onFolderSelect={onFolderSelect} />
      <SideNavTags tags={tags} onTagSelect={onTagSelect} />
    </aside>
  );
}

function SideNavVault({ vault, onFolderSelect }: SideNavVaultProps) {
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
            <VaultFolderItem key={folder.id} folder={folder} onFolderSelect={onFolderSelect} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function SideNavTags({ tags, onTagSelect }: SideNavTagsProps) {
  return (
    <section class="cub-side-nav__section" aria-labelledby="tags-heading">
      <h2 id="tags-heading" class="cub-side-nav__section-heading">
        Tags
      </h2>
      <ul class="cub-side-nav__tags">
        {tags.map((tag) => (
          <li key={tag.id}>
            <button type="button" class="cub-side-nav__tag" onClick={() => onTagSelect?.(tag)}>
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
}

function VaultFolderItem({ folder, onFolderSelect }: VaultFolderItemProps) {
  const hasChildren = Boolean(folder.children?.length);
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <li class={hasChildren ? "cub-side-nav__branch" : undefined}>
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
      <button type="button" class="cub-side-nav__item" onClick={() => onFolderSelect?.(folder)}>
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
            <VaultFolderItem key={child.id} folder={child} onFolderSelect={onFolderSelect} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
