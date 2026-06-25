/**
 * App-wide internal Link.
 *
 * Re-exports `next/link` today. This is the single choke-point for internal
 * navigation: when multilang lands, locale-prefixing of `href` happens here
 * (and only here), so call sites never change. Always route internal links
 * through this component instead of importing `next/link` directly.
 *
 * External / social links should stay as raw `<a>` elements.
 */
export { default, default as Link } from "next/link";
export type { LinkProps } from "next/link";
