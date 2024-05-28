// src/types.ts
export interface Card {
  id: string;
  title: string;
  description: string;
  status: string;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
}

export interface Columns {
  [key: string]: Column;
}
