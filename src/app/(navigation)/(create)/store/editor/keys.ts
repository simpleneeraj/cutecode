/*
 * Central registry of every localStorage key used by the editor store.
 * Always reference these constants — never use raw strings.
 */
export enum StoreKey {
  /* Core editor state */
  SLIDES = "slides",
  SLIDES_STORE = "slides_store",

  /* Selection */
  SELECTION_STORE = "selection_store",
  CURRENT_SLIDE_ID = "selected_slide_id",
  CURRENT_ELEMENT_ID = "selected_element_id",

  /* UI preferences */
  FRAME_WIDTH = "frame_width",
  EXPORT_SIZE = "size",

  /* Themes */
  UNLOCKED_THEMES = "unlockedThemes",
}
