/*
 * Central registry of every localStorage key used by the editor store.
 * Always reference these constants — never use raw strings.
 */
export enum StoreKey {
  /* Core editor state */
  SLIDES = "slides",
  SLIDES_STORE = "slides_store",

  /* Selection */
  SELECTION_SLIDE_STORE = "selection_slide_store",
  SELECTION_ELEMENT_STORE = "selection_element_store",
  CURRENT_SLIDE_ID = "selected_slide_id",
  CURRENT_ELEMENT_ID = "selected_element_id",

  /* UI preferences */
  FRAME_WIDTH = "frame_width",
  EXPORT_SIZE = "size",

  /* Themes */
  UNLOCKED_THEMES = "unlockedThemes",

  /* Preview */
  PREVIEW_WALLPAPER_OPTIONS = "preview_wallpaper_options",
}
