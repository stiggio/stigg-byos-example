# Stigg integration example - Bring Your Own Solution (BYOS)

This repository demonstrates an integration with Stigg for existing entitlement management solution.
To be more specific, the example app does not depend on Stigg SDKs or APIs, but simply consumes events over webhook from Stigg (see `/webhook`), and persists the latest state in a database.
The app also exposes a GraphQL API (based on [PostGraphile](https://www.graphile.org/postgraphile)), that can be accessed on `/graphql` (and `/graphiql` for interactive UI) to query the latest state of the customers, subscriptions and entitlements.
Lastly, the app exposes a simple endpoint to demonstrate entitlement access and usage enforcement on `/check-access`.

You can read about it the [docs](https://docs.stigg.io/docs/byos).

## Project structure

* [/db](/db) - contains the DB schema init script and Dockerfile for the Postgres DB
* [/src](/src) - contains the application code:
  * [/src/index.ts](/src/index.ts) - Express app entry point
  * [/src/db.ts](/src/db.ts) - initializes the DB connection using [Knex](http://knexjs.org/)
  * [/src/event-processor.ts](/src/event-processor.ts) - Processes incoming events and persists the state in the DB 
  * [/src/event-types.ts](/src/event-types.ts) - Typescript helper types for the webhook events 
  * [/src/access-checker.ts](/src/access-checker.ts) - Implements the access check logic


### Requirements

* Docker installed
* You'll need a Stigg account in order to configure a webhook and copy-paste the webhook secret in the `.env` file.

### Setup

* Clone the repository:
  ```
  git clone git@github.com:stiggio/stigg-aws-api-gateway-example.git
  ```
* Install [ngrok](https://ngrok.com/) and run it on port 8080:
  ```
  ngrok http 8080
  ```
* Setup a webhook and point it to `https://YOU_NGROK_ADDRESS.ngrok.io/webhook`. Subscribe to the following events:
  * `customer.created`
  * `customer.updated`
  * `customer.deleted`
  * `subscription.created`
  * `subscription.updated`
  * `subscription.deleted`
  * `entitlement.created`
  * `entitlement.updated`
  * `entitlement.deleted`
* Obtain webhook secret key and paste it in the `.env` file.
* Run the DB and the app:
  ```
  docker compose up -d
  ```
* Populate data in the DB by creating customers and subscriptions.

### Debugging

1. Start the DB in the background by running `docker compose up -d db` in a separate terminal
2. Change the `DATABASE_URL` in the `.env` to `postgres://postgres:password@localhost:5432/byos_example`
3. Start the app by running `yarn watch`


### GraphQL API

You can access the GraphiQL interactive UI at `http://localhost:8080/graphiql` and run queries like:

```graphql
query {
  TBD
}
```

### Access check (REST)

You can execute the request below to check if a customer has access to a specific feature:

```bash

```bash
curl --location --request POST 'http://localhost:8080/check-access' \
--header 'Content-Type: application/json' \
--data-raw '{"featureId": "{{feature-id}}", "customerId": "{{customer-id}}", "requestedUsage": {{requested-usage}}'
```

The following placeholders should be replaced:
* `{{feature-id}}` should be replaced with an ID of a feature.
* `{{customer-id}}` should be replaced with an ID of a customer.
* `{{requested-usage}` should be replaced with an amount of requested usage.

Response (has access):
```json
{"hasAccess":true}
```

Response (no access):
```json
{"hasAccess":false, "reason":"..."}
```
```
