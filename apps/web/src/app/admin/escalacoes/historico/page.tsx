import { ScreenPlaceholder, screenMetadata } from '../../screen-placeholder';

export const generateMetadata = () => screenMetadata('assignments', 'history');

export default function AssignmentHistoryPage() {
  return <ScreenPlaceholder section="assignments" screen="history" />;
}
