import { LayoutDashboard } from 'lucide-react';
import { SuperPlaceholder, superMetadata } from './placeholder';

export const generateMetadata = () => superMetadata('home');

export default function Page() {
  return <SuperPlaceholder page="home" icon={LayoutDashboard} />;
}
