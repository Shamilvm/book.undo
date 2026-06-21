export type FeedbackType = "suggestion" | "query" | "bug" | "other";
export type FeedbackStatus = "new" | "read" | "resolved";

export interface FeedbackInput {
  name: string;
  contact?: string;
  type?: FeedbackType;
  message: string;
}

export interface FeedbackStatusUpdate {
  status: FeedbackStatus;
}
