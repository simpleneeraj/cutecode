export enum Visibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  PASSCODE = "PASSCODE",
}

export type PublishSnippetState = {
  description: string;
  visibility: Visibility;
  passcode: string;
  isPublishing: boolean;
  isSuccessOpen: boolean;
  publishedUrl: string | null;
};
