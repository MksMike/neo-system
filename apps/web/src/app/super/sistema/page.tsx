import { Activity } from 'lucide-react';
import { SuperPlaceholder, superMetadata } from '../placeholder';

export const generateMetadata = () => superMetadata('system');

export default function Page() {
  return <SuperPlaceholder page="system" icon={Activity} />;
}
