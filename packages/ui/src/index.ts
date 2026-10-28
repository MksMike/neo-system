// Design system: tokens from docs/design-tokens.json and shared components.
// Styles: import "@neo/ui/styles.css" after "tailwindcss" in the app.
export { cn } from './lib/cn';
export { Badge, badgeVariants, Chip, DayCell } from './components/badge';
export type { BadgeProps, ChipProps, DayCellProps, DayKind } from './components/badge';
export { Button, buttonVariants } from './components/button';
export type { ButtonProps } from './components/button';
export { Card, CardHeader, CardInset, CardTitle, cardVariants, Stat } from './components/card';
export type { StatProps } from './components/card';
export { Checkbox, Radio, RadioGroup, Switch } from './components/choice';
export type { CheckboxProps, RadioProps, SwitchProps } from './components/choice';
export {
  Alert,
  Avatar,
  EmptyState,
  Progress,
  Skeleton,
  toast,
  Toaster,
} from './components/feedback';
export type { AlertProps, EmptyStateProps } from './components/feedback';
export { Field, Input, NativeSelect, Textarea, useField } from './components/field';
export type { FieldProps, InputProps, NativeSelectProps, TextareaProps } from './components/field';
export {
  EmployeeIdInput,
  LandlinePhoneInput,
  MobilePhoneInput,
  PostalCodeInput,
} from './components/masked-input';
export {
  SegmentedControl,
  Steps,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './components/navigation';
export type { SegmentedControlProps, SegmentedOption, StepsProps } from './components/navigation';
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipProvider,
} from './components/overlay';
export type { DialogContentProps } from './components/overlay';
export { Spinner } from './components/spinner';
export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from './components/table';
export {
  NavItem,
  PageHeader,
  Sidebar,
  SidebarBrand,
  SidebarSection,
  SkipLink,
} from './components/shell';
export type { NavItemProps, PageHeaderProps } from './components/shell';
