import { ScreenPlaceholder, screenMetadata } from '../../screen-placeholder';

export const generateMetadata = () => screenMetadata('employees', 'payslips');

export default function EmployeePayslipsPage() {
  return <ScreenPlaceholder section="employees" screen="payslips" />;
}
