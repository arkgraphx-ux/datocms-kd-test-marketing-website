import AnchoredLegalDocument from '@/components/AnchoredLegalDocument';
import type { ContentPage } from '@/components/WithRealTimeUpdates/types';
import { notFound } from 'next/navigation';
import type { PageProps, Query } from './meta';

const Content: ContentPage<PageProps, Query> = ({ data }) => {
  if (!data.termsOfService) {
    notFound();
  }

  return <AnchoredLegalDocument data={data.termsOfService} />;
};

export default Content;
