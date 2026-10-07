import DatoStructuredText from '@/components/DatoStructuredText';
import { isHeading, isParagraph } from 'datocms-structured-text-utils';
import type { ReactNode } from 'react';
import { renderNodeRule } from 'react-datocms/structured-text';

// Blocks allowed in the Content field of the Privacy Policy, Terms of Service
// and Footer models.
export type PageAnchorBlock = {
  __typename: 'PageAnchorRecord';
  id: string;
  section?: string | null;
};

export type MarkdownBlock = {
  __typename: 'MarkdownRecord';
  id: string;
};

export type AnchoredBlock = PageAnchorBlock | MarkdownBlock;

export type AnchoredDocumentData = {
  title?: string | null;
  headerLogo?: {
    url: string;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  downloadPdf?: { url: string; filename: string } | null;
  content?: {
    value: unknown;
    blocks: AnchoredBlock[];
  } | null;
};

// Section names that are not listed in the Table of Contents.
const NOT_IN_TOC = /^(preamble( \[\d+\])?|table of contents)$/i;

/**
 * Turns a Webflow-style section name into a URL-safe id.
 * "Article [12-A]" -> "article-12-a", "Table of Contents" -> "table-of-contents"
 */
export function anchorId(section: string): string {
  return section
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function anchorsFrom(blocks: AnchoredBlock[]): { id: string; label: string }[] {
  return blocks
    .filter(
      (b): b is PageAnchorBlock =>
        b.__typename === 'PageAnchorRecord' && Boolean(b.section),
    )
    .map((b) => ({ id: anchorId(b.section as string), label: b.section as string }));
}

function TableOfContents({ items }: { items: { id: string; label: string }[] }) {
  const entries = items.filter((i) => !NOT_IN_TOC.test(i.label));
  if (entries.length === 0) return null;

  return (
    <nav aria-label="Table of Contents" className="mb-10">
      <h2 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl">
        Table of Contents
      </h2>
      <ol className="list-none space-y-2">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className="text-base font-medium text-primary hover:underline sm:text-lg"
            >
              {entry.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function AnchoredLegalDocument({
  data,
}: {
  data: AnchoredDocumentData;
}): ReactNode {
  const blocks = data.content?.blocks ?? [];
  const anchors = anchorsFrom(blocks);

  return (
    <section className="mt-24 pb-[120px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap justify-center">
          <div className="w-full px-4 lg:w-8/12">
            {data.headerLogo?.url && (
              // biome-ignore lint/performance/noImgElement: simple static logo
              <img
                src={data.headerLogo.url}
                alt={data.headerLogo.alt || 'Little Caesars'}
                width={215}
                className="mb-8 h-auto"
              />
            )}

            {data.title && (
              <h1 className="mb-6 text-3xl font-bold text-black dark:text-white sm:text-4xl">
                {data.title}
              </h1>
            )}

            {data.downloadPdf?.url && (
              <p className="mb-8">
                <a
                  href={data.downloadPdf.url}
                  className="font-medium text-primary hover:underline"
                  download={data.downloadPdf.filename}
                >
                  Download PDF
                </a>
              </p>
            )}

            {data.content && (
              <DatoStructuredText
                data={data.content as never}
                renderBlock={({ record }) => {
                  const block = record as unknown as AnchoredBlock;

                  if (block.__typename === 'PageAnchorRecord') {
                    if (!block.section) return null;
                    const id = anchorId(block.section);
                    // The Table of Contents anchor renders the clickable list.
                    if (id === 'table-of-contents') {
                      return (
                        <div id={id} className="scroll-mt-28">
                          <TableOfContents items={anchors} />
                        </div>
                      );
                    }
                    // Every other anchor is an invisible jump target.
                    return (
                      <span
                        id={id}
                        data-section={block.section}
                        className="block scroll-mt-28"
                      />
                    );
                  }

                  // Markdown block has no fields yet; nothing to render.
                  return null;
                }}
                customNodeRules={[
                  renderNodeRule(isHeading, ({ children, key }) => (
                    <h3
                      className="mb-4 mt-9 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl"
                      key={key}
                    >
                      {children}
                    </h3>
                  )),
                  renderNodeRule(isParagraph, ({ children, key }) => (
                    <p
                      className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed"
                      key={key}
                    >
                      {children}
                    </p>
                  )),
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

