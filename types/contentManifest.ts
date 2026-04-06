/**
 * Canonical downloaded content shape (stored in SQLite + optional manifest.json).
 * Keys like story / level ids are dynamic maps (Record<string, T>).
 */

export type StoryPage = {
  storytext?: string;
  keywords?: string[];
  imagelink?: string;
};

export type StoryQuestion = {
  text?: string;
  choices?: string[];
  correctanswer?: string;
};

export type StoryItem = {
  title?: string;
  pagecount?: number;
  [pageKey: string]: unknown;
};

export type PictowordImage = { id?: string; imagelink?: string };
export type PictowordQuestion = {
  questiontext?: string;
  images?: PictowordImage[];
  correctImageId?: string;
};

export type TracingQuestion = {
  lettertotrace?: string;
  "lettertoraceimagelink(outline version)"?: string;
  lettertoraceimagelink?: string;
  pronoucevoicelink?: string;
};

export type WordBuilderLevel = {
  letters?: string[];
  "corrects words"?: Array<{ wordid?: string; wordtext?: string }>;
  correctwords?: Array<{ wordid?: string; wordtext?: string }>;
  "hints for the corrects words"?: Array<{ wordid?: string; hinttext?: string }>;
};

export type FillBlankLevel = {
  "full paragraph"?: string;
  fullparagraph?: string;
  "blank space paragraph"?: string;
  blankspaceparagraph?: string;
  "voice reading the full paragraph link"?: string;
  voicereadinglink?: string;
  choices?: string[];
};

export type PronunciationQuestion = {
  word?: string;
  "correct voice pronouncation link "?: string;
  "correct voice pronouncation link"?: string;
  imageofthewordlink?: string;
  "image of the word link"?: string;
};

export type VoiceToWordQuestion = {
  "voiceof the word link"?: string;
  voiceofthewordlink?: string;
  "word choices"?: Array<{ wordid?: string; wordtext?: string }>;
  wordchoices?: Array<{ wordid?: string; wordtext?: string }>;
  correctwordid?: string;
};

/** Top-level `contents` object from a downloaded pack */
export type ContentManifestRoot = {
  contents?: Record<string, unknown>;
  packId?: string;
  [key: string]: unknown;
};
