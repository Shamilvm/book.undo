export const bookConditions = [
  { value: "new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "worn", label: "Well-loved" },
] as const;

export const bookCategories = [
  { value: "fiction", label: "Fiction" },
  { value: "non-fiction", label: "Non-fiction" },
  { value: "mystery-thriller", label: "Mystery & thriller" },
  { value: "romance", label: "Romance" },
  { value: "sci-fi-fantasy", label: "Sci-fi & fantasy" },
  { value: "young-adult", label: "Young adult" },
  { value: "children", label: "Children's" },
  { value: "comics", label: "Comics & graphic novels" },
  { value: "biography", label: "Biography & memoir" },
  { value: "poetry", label: "Poetry" },
  { value: "science", label: "Science & nature" },
  { value: "history", label: "History" },
  { value: "self-help", label: "Self-help & wellness" },
  { value: "spirituality", label: "Spirituality & religion" },
  { value: "arts", label: "Arts & culture" },
  { value: "regional", label: "Regional language" },
  { value: "textbook", label: "Textbook" },
  { value: "reference", label: "Reference" },
  { value: "other", label: "Other" },
] as const;

export const libraryTypes = [
  { value: "public", label: "Public" },
  { value: "sponsored", label: "Sponsored" },
] as const;

export const userRoles = [
  { value: "default", label: "Default" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super admin" },
] as const;

export const feedbackTypes = [
  { value: "suggestion", label: "Suggestion" },
  { value: "query", label: "Question / query" },
  { value: "bug", label: "Report an issue" },
  { value: "other", label: "Other" },
] as const;

export const feedbackStatuses = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "resolved", label: "Resolved" },
] as const;

export const userStatuses = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

export const borrowStatuses = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "returned", label: "Returned" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const sponsorshipStatuses = [
  { value: "open", label: "Open" },
  { value: "partially_funded", label: "Partially funded" },
  { value: "funded", label: "Funded" },
  { value: "delivered", label: "Delivered" },
] as const;

export const sponsorRequestStatuses = [
  { value: "pending", label: "Pending" },
  { value: "contacted", label: "Contacted" },
  { value: "approved", label: "Approved" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
] as const;
