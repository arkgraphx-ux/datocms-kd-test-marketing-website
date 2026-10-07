import type { AnchoredDocumentData } from '@/components/AnchoredLegalDocument';
import type { SiteLocale } from '@/graphql/types/graphql';
import type { ResolvedGlobalPageProps } from '@/utils/globalPageProps';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type { TitleMetaLinkTag } from 'react-datocms/seo';

// Single-instance model, so this page has no slug parameter.
export type PageProps = ResolvedGlobalPageProps;

export type Query = {
  termsOfService?:
    | (AnchoredDocumentData & {
        seo: TitleMetaLinkTag[];
      })
    | null;
};

export type Variables = {
  locale?: SiteLocale;
  fallbackLocale?: SiteLocale[];
};

export const query = parse(/* GraphQL */ `
  query TermsOfServicePage($locale: SiteLocale, $fallbackLocale: [SiteLocale!]) {
    termsOfService(locale: $locale, fallbackLocales: $fallbackLocale) {
      seo: _seoMetaTags {
        attributes
        content
        tag
      }
      title
      headerLogo {
        url
        alt
        width
        height
      }
      content {
        value
        blocks {
          __typename
          ... on PageAnchorRecord {
            id
            section
          }
          ... on MarkdownRecord {
            id
          }
        }
      }
    }
  }
`) as unknown as TypedDocumentNode<Query, Variables>;
