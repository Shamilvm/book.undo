export type BookCategory =
  | "fiction"
  | "non-fiction"
  | "mystery-thriller"
  | "romance"
  | "sci-fi-fantasy"
  | "young-adult"
  | "children"
  | "comics"
  | "biography"
  | "poetry"
  | "science"
  | "history"
  | "self-help"
  | "spirituality"
  | "arts"
  | "regional"
  | "textbook"
  | "reference"
  | "other";

export type BookCondition = "new" | "good" | "fair" | "worn";

export type BookStatus = "available" | "borrowed" | "reserved";

export interface BookInput {
  title: string;
  author: string;
  isbn?: string;
  category: BookCategory;
  description?: string;
  condition: BookCondition;
  bookLanguage?: string;
  grade?: string;
  subject?: string;
  board?: string;
  donorName: string;
  donorContact?: string;
  location: string;
  district: string;
  status?: BookStatus;
  isTextbook?: boolean;
  libraryId?: string;
  coverEmoji?: string;
}

export interface BookQuery {
  category?: string;
  district?: string;
  status?: string;
  isTextbook?: boolean;
  grade?: string;
  subject?: string;
  search?: string;
  limit?: number;
}
