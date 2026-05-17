import { z } from "zod";

// ─────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─────────────────────────────────────────────
// Snippet
// ─────────────────────────────────────────────

export const createSnippetSchema = z.object({
  presentationId: z.string().min(1),
  elementId: z.string().min(1),
  title: z.string().max(120).optional(),
  tags: z.array(z.string()).max(10).optional(),
  isPublic: z.boolean().default(false),
});

export const updateSnippetSchema = z.object({
  title: z.string().max(120).optional(),
  tags: z.array(z.string()).max(10).optional(),
  isPublic: z.boolean().optional(),
});

// ─────────────────────────────────────────────
// Presentation sync
// ─────────────────────────────────────────────

export const syncPresentationSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  width: z.coerce.number().int().min(200).max(4000).optional(),
  slides: z.record(z.string(), z.unknown()).default({}),
  elements: z.record(z.string(), z.unknown()).default({}),
  slideElements: z.record(z.string(), z.array(z.string())).default({}),
});

export const createPresentationSchema = z.object({
  name: z.string().min(1).max(120).default("Untitled"),
  width: z.coerce.number().int().min(200).max(4000).default(680),
  slides: z.record(z.string(), z.unknown()).default({}),
  elements: z.record(z.string(), z.unknown()).default({}),
  slideElements: z.record(z.string(), z.array(z.string())).default({}),
});

// ─────────────────────────────────────────────
// Share link
// ─────────────────────────────────────────────

export const createShareLinkSchema = z
  .object({
    snippetId: z.string().optional(),
    presentationId: z.string().optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED", "PASSCODE", "PRIVATE"]).default("PUBLIC"),
    passcode: z.string().min(4).max(32).optional(),
    isE2EEncrypted: z.boolean().default(false),
    encryptionHint: z.string().max(200).optional(),
    maxViews: z.number().int().min(1).optional(),
    expiresAt: z.iso.datetime().optional(),
    allowDownload: z.boolean().default(true),
    allowCopy: z.boolean().default(true),
  })
  .refine((d) => !!(d.snippetId || d.presentationId), { message: "Either snippetId or presentationId is required" })
  .refine((d) => !(d.snippetId && d.presentationId), { message: "Only one of snippetId or presentationId is allowed" })
  .refine((d) => d.visibility !== "PASSCODE" || !!d.passcode, {
    message: "passcode is required when visibility is PASSCODE",
  });

export const updateShareLinkSchema = z.object({
  visibility: z.enum(["PUBLIC", "UNLISTED", "PASSCODE", "PRIVATE"]).optional(),
  passcode: z.string().min(4).max(32).optional(),
  isE2EEncrypted: z.boolean().optional(),
  encryptionHint: z.string().max(200).optional(),
  maxViews: z.number().int().min(1).nullable().optional(),
  expiresAt: z.iso.datetime().nullable().optional(),
  allowDownload: z.boolean().optional(),
  allowCopy: z.boolean().optional(),
});

export const verifyPasscodeSchema = z.object({
  passcode: z.string().min(1),
});

export type CreateSnippetInput = z.infer<typeof createSnippetSchema>;
export type UpdateSnippetInput = z.infer<typeof updateSnippetSchema>;
export type SyncPresentationInput = z.infer<typeof syncPresentationSchema>;
export type CreatePresentationInput = z.infer<typeof createPresentationSchema>;
export type CreateShareLinkInput = z.infer<typeof createShareLinkSchema>;
export type UpdateShareLinkInput = z.infer<typeof updateShareLinkSchema>;
export type VerifyPasscodeInput = z.infer<typeof verifyPasscodeSchema>;
