import { Boxes } from 'lucide-react';
import { SuperPlaceholder, superMetadata } from '../placeholder';

export const generateMetadata = () => superMetadata('modules');

export default function Page() {
  return <SuperPlaceholder page="modules" icon={Boxes} />;
}
