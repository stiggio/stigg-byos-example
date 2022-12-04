import { DB } from './db';
import {
  CustomerEvent,
  EntitlementsUpdatedEvent,
  MeasurementReportedEvent,
  SubscriptionEvent,
  WebhookEvent,
} from './event-types';

export async function processEvent(event: WebhookEvent) {
  console.log(`Processing event: ${event.messageId}`, event);
  try {
    await applyEvent(event);
  } catch (err) {
    console.error(`Failed to process event: ${event.messageId}`, err);
    throw err;
  }
  console.log(`Event processed: ${event.messageId}`);
}

async function applyEvent(event: WebhookEvent) {
  switch (event.type) {
    case 'customer.created':
      return onCustomerCreated(event);
    case 'customer.updated':
      return onCustomerUpdated(event);
    case 'customer.deleted':
      return onCustomerDeleted(event);
    case 'entitlements.updated':
      return onEntitlementsUpdated(event);
    case 'measurement.reported':
      return onMeasurementReported(event);
    case 'subscription.created':
      return onSubscriptionCreated(event);
    case 'subscription.updated':
    case 'subscription.canceled':
    case 'subscription.expired':
    case 'subscription.trial_expired':
      return onSubscriptionUpdated(event);
  }
}

async function onCustomerCreated(event: CustomerEvent) {
  await DB.customers.insert({
    created_at: new Date(event.timestamp),
    customer_id: event.id,
    ...mapCustomerState(event),
  });
}

async function onCustomerUpdated(event: CustomerEvent) {
  await DB.customers.where({ customer_id: event.id }).update({
    updated_at: new Date(event.timestamp),
    ...mapCustomerState(event),
  });
}

async function onCustomerDeleted(event: CustomerEvent) {
  await DB.customers.where({ customer_id: event.id }).delete();
}

async function onEntitlementsUpdated(event: EntitlementsUpdatedEvent) {
  await DB.customers.where({ customer_id: event.customer.id }).update({
    entitlements: JSON.stringify(event.entitlements) as any,
    updated_at: new Date(event.timestamp),
  });
}

async function onMeasurementReported(event: MeasurementReportedEvent) {
  const customer = await DB.customers.where({ customer_id: event.customer.id }).first();
  if (!customer) {
    console.log(`Customer not found: ${event.customer.id}`);
    return;
  }

  const entitlements = [...customer.entitlements];
  const entitlement = entitlements.find((entitlement) => entitlement.feature.id === event.feature.id);
  if (!entitlement) {
    console.log('No entitlement found for feature', event.feature.id);
    return;
  }

  entitlement.currentUsage = event.currentUsage;
  entitlement.usageLimit = event.usageLimit;
  entitlement.nextResetDate = event.nextResetDate;

  await DB.customers.update({
    entitlements: JSON.stringify(entitlements) as any,
    updated_at: new Date(event.timestamp),
  });
}

async function onSubscriptionCreated(event: SubscriptionEvent) {
  await DB.subscriptions.insert({
    created_at: new Date(event.timestamp),
    subscription_id: event.id,
    customer_id: event.customer.id,
    ...mapSubscriptionState(event),
  });
}

async function onSubscriptionUpdated(event: SubscriptionEvent) {
  await DB.subscriptions.where({ subscription_id: event.id }).update({
    updated_at: new Date(event.timestamp),
    ...mapSubscriptionState(event),
  });
}

function mapCustomerState(event: CustomerEvent) {
  return {
    name: event.name,
    email: event.email,
    billing_id: event.billingId,
  };
}

function mapSubscriptionState(event: SubscriptionEvent) {
  return {
    status: event.status,
    plan_id: event.plan.id,
    plan_name: event.plan.name,
    start_date: event.startDate ? new Date(event.startDate) : null,
    end_date: event.endDate ? new Date(event.endDate) : null,
    cancellation_date: event.cancellationDate ? new Date(event.cancellationDate) : null,
    trial_end_date: event.trialEndDate ? new Date(event.trialEndDate) : null,
    billing_id: event.billingId,
  };
}
