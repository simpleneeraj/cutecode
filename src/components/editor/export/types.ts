export enum Visibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  PASSCODE = "PASSCODE",
}

export type PublishSnippetState = {
  description: string;
  title: string;
  tags: string[];
  visibility: Visibility;
  passcode: string;
  isPublishing: boolean;
  isSuccessOpen: boolean;
  publishedUrl: string | null;
};
