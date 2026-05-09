import { CSSProperties } from "react";
import { Theme } from "@/typings/editor";
import { ShikiSyntaxObject } from "./types";

export type ThemeGroup = { value: string; items: Partial<Theme>[] };

export function convertToShikiTheme(syntaxObject: ShikiSyntaxObject, prefix: string = "--cutecode-"): CSSProperties {
  if (!syntaxObject) {
    return {};
  }
  return {
    [`${prefix}foreground`]: syntaxObject.foreground,
    [`${prefix}token-constant`]: syntaxObject.constant,
    [`${prefix}token-string`]: syntaxObject.string,
    [`${prefix}token-comment`]: syntaxObject.comment,
    [`${prefix}token-keyword`]: syntaxObject.keyword,
    [`${prefix}token-parameter`]: syntaxObject.parameter,
    [`${prefix}token-function`]: syntaxObject.function,
    [`${prefix}token-string-expression`]: syntaxObject.stringExpression,
    [`${prefix}token-punctuation`]: syntaxObject.punctuation,
    [`${prefix}token-link`]: syntaxObject.link,
    [`${prefix}token-number`]: syntaxObject.number,
    [`${prefix}token-property`]: syntaxObject.property,
    [`${prefix}highlight`]: syntaxObject.highlight,
    [`${prefix}highlight-border`]: syntaxObject.highlightBorder,
    [`${prefix}highlight-hover`]: syntaxObject.highlightHover,
    [`${prefix}token-diff-deleted`]: syntaxObject.diffDeleted,
    [`${prefix}token-diff-inserted`]: syntaxObject.diffInserted,
    [`${prefix}token-object-literal`]: syntaxObject.objectLiteral,
  } as CSSProperties;
}

export function groupThemes(object: { [index: string]: Theme }) {
  const items = Object.values(object);
  const groups: Record<string, Partial<Theme>[]> = {};
  for (const theme of items) {
    if (!theme.group) continue;
    if (!groups[theme.group]) {
      groups[theme.group] = [];
    }
    groups[theme.group]!.push({
      id: theme?.id,
      name: theme?.name,
      group: theme?.group,
      icon: theme?.icon,
      background: theme.background,
      tags: theme.tags,
      font: theme.font,
    });
  }
  const order: Array<ThemeGroup["value"]> = ["System", "Brands", "AI", "Gaming", "Aesthetic", "Romantic", "Defaults"];
  return order.map((value) => ({ items: groups[value] ?? [], value }));
}
