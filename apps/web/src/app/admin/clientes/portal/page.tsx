import { ScreenPlaceholder, screenMetadata } from '../../screen-placeholder';

export const generateMetadata = () => screenMetadata('clients', 'portal');

export default function ClientPortalPage() {
  return <ScreenPlaceholder section="clients" screen="portal" />;
}
