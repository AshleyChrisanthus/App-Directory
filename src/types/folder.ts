export interface Folder {
  id: string;
  name: string;
  icon: string;
  color?: string;
  dateAdded?: string;
}

export type SpecialFolderId = 'all' | 'favorites' | 'unorganized' | 'broken';
export type ActiveFolderId = SpecialFolderId | (string & {});

export interface FolderStats {
  all: number;
  favorites: number;
  unorganized: number;
  broken: number;
  byFolder: Record<string, number>;
}
