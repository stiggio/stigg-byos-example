import { Knex, knex } from 'knex';
import { EntitlementInfo } from './event-types';

interface Customer {
  created_at: Date;
  updated_at: Date;
  customer_id: string;
  name: string | null;
  email: string | null;
  billing_id: string | null;
  entitlements: Array<EntitlementInfo>;
}

interface Subscription {
  created_at: Date;
  updated_at: Date;
  customer_id: string;
  subscription_id: string;
  status: string;
  plan_name: string;
  start_date: Date;
  end_date: Date | null;
  billing_id: string | null;
  cancellation_date: Date;
  trial_end_date: Date;
}

const config: Knex.Config = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
};

const knexInstance = knex(config);

export const DB = {
  get customers() {
    return knexInstance<Customer>('customers');
  },
  get subscriptions() {
    return knexInstance<Subscription>('subscriptions');
  },
};
