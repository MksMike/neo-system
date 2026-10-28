import { Building2 } from 'lucide-react';
import { SuperPlaceholder, superMetadata } from '../../placeholder';

export const generateMetadata = () => superMetadata('newCompany');

export default function Page() {
  return <SuperPlaceholder page="newCompany" icon={Building2} />;
}
