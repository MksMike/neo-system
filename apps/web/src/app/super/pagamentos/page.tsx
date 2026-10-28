import { Wallet } from 'lucide-react';
import { SuperPlaceholder, superMetadata } from '../placeholder';

export const generateMetadata = () => superMetadata('payments');

export default function Page() {
  return <SuperPlaceholder page="payments" icon={Wallet} />;
}
