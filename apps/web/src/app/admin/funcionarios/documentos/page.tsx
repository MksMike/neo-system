import { ScreenPlaceholder, screenMetadata } from '../../screen-placeholder';

export const generateMetadata = () => screenMetadata('employees', 'documents');

export default function EmployeeDocumentsPage() {
  return <ScreenPlaceholder section="employees" screen="documents" />;
}
