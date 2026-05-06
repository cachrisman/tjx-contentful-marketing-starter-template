/** Resolved "View All" row under a column heading (column heading itself is never a link). */
export type ColumnTitleLinkGraph =
  | {
      __typename?: 'Page';
      slug?: string | null;
    }
  | {
      __typename?: 'NavigationLink';
      linkText?: string | null;
      linkTarget?: { slug?: string | null } | null;
    }
  | null
  | undefined;

export function resolveColumnTitleLinkRow(link: ColumnTitleLinkGraph): { label: string; slug: string } | null {
  if (!link) return null;
  if (link.__typename === 'Page') {
    const slug = link.slug;
    if (!slug) return null;
    return { label: 'View All', slug };
  }
  if (link.__typename === 'NavigationLink') {
    const slug = link.linkTarget?.slug;
    if (!slug) return null;
    const text = link.linkText?.trim();
    return { label: text || 'View All', slug };
  }
  return null;
}
