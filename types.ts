
export enum PaymentStatus {
  NOT_STARTED = 'NOT_STARTED',
  PLEDGED = 'PLEDGED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAID = 'PAID'
}

export enum PaymentMethod {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL'
}

export enum EventVisibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
  HYBRID = 'HYBRID'
}

export type TemplateType = 'REMINDER' | 'THANK_YOU' | 'INVITATION';

export interface CustomTemplate {
  type: TemplateType;
  subject: string;
  body: string;
}

export interface ContributionOption {
  id: string;
  name: string;
  amount: number;
}

export interface EventLocation {
  label: string;
  url: string;
}

export interface CardDesign {
  backgroundImage?: string;
  namePosition: { x: number, y: number, w: number, h: number };
  qrPosition: { x: number, y: number, w: number, h: number };
}

export interface PaymentDetails {
  mobile?: { number: string; name: string };
  bank?: { accountNo: string; bankName: string; name: string };
  lipa?: { number: string; name: string };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  provider: string;
  bio?: string;
  avatarUrl?: string;
  joinDate: string;
  defaults?: PaymentDetails;
  isVerified?: boolean;
}

export interface Event {
  id: string;
  ownerId: string;
  name: string;
  type: string;
  date: string;
  locations: EventLocation[];
  visibility: EventVisibility;
  contributionOptions: ContributionOption[];
  cardDesign?: CardDesign;
  paymentDetails?: PaymentDetails;
  customTemplates?: CustomTemplate[];
}

export interface Guest {
  id: string;
  eventId: string;
  name: string;
  phone: string;
  optionId: string;
  pledgeAmount: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  screenshot?: string;
}

export interface AppState {
  users: User[];
  events: Event[];
  guests: Guest[];
}
