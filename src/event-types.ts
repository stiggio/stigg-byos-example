// Represents a date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
type ISODate = string;

interface Event {
  messageId: string;
  traceId: string;
  accountId: string;
  environmentId: string;
  timestamp: string;
}

export interface CustomerEvent extends Event {
  type: 'customer.created' | 'customer.updated' | 'customer.deleted';
  id: string;
  name: string;
  email: string;
  billingId: string | null;
  metadata: Record<string, string> | null;
}

interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  billingId: string | null;
}

interface FeatureInfo {
  id: string;
  name: string;
  description: string;
  featureType: string;
  meterType: string;
  unit: string;
  units: string;
  status: string;
}

export interface EntitlementInfo {
  feature: FeatureInfo;
  usageLimit: number;
  currentUsage: number;
  hasUnlimitedUsage: boolean;
  nextResetDate: ISODate;
}

export interface EntitlementsUpdatedEvent extends Event {
  type: 'entitlements.updated';
  customer: CustomerInfo;
  entitlements: Array<EntitlementInfo>;
}

interface PlanInfo {
  id: string;
  name: string;
}

export interface SubscriptionEvent extends Event {
  type:
    | 'subscription.created'
    | 'subscription.updated'
    | 'subscription.canceled'
    | 'subscription.expired'
    | 'subscription.trial_expired';
  id: string;
  customer: CustomerInfo;
  plan: PlanInfo;
  status: string;
  billingId: string;
  startDate: ISODate;
  endDate: ISODate | null;
  trialEndDate: ISODate | null;
  cancellationDate: ISODate | null;
}

export interface MeasurementReportedEvent extends Event {
  type: 'measurement.reported';
  currentChange: number;
  usageUsedPercentage: number;
  currentUsage: number;
  hasUnlimitedUsage: false;
  usageLimit: number;
  nextResetDate: ISODate;
  feature: FeatureInfo;
  customer: CustomerInfo;
}

export type WebhookEvent = CustomerEvent | SubscriptionEvent | EntitlementsUpdatedEvent | MeasurementReportedEvent;
