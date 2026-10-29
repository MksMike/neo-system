import { ScreenPlaceholder, screenMetadata } from '../../screen-placeholder';

export const generateMetadata = () => screenMetadata('clients', 'documents');

export default function ClientDocumentsPage() {
  return <ScreenPlaceholder section="clients" screen="documents" />;
}
