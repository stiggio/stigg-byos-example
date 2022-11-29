# Stigg integration example - Bring Your Own Solution (BYOS)

This repository demonstrates an integration with Stigg for existing entitlement management solution.
To be more specific, the example app does not depend on Stigg SDKs or APIs, but simply consumes events over webhook from Stigg (see `/webhook`), and persists the latest state in a database.
The app also exposes a GraphQL API (based on [PostGraphile](https://www.graphile.org/postgraphile)), that can be accessed on `/graphql` (and `/graphiql` for interactive UI) to query the latest state of the customers, subscriptions and entitlements.
Lastly, the app exposes a simple endpoint to demonstrate entitlement access and usage enforcement on `/check-access`.

You can read about it the [docs](https://docs.stigg.io/docs/byos).

## Project structure

* [/db](/db) - contains the DB schema init script and Dockerfile for the Postgres DB
* [/src](/src) - contains the application code:
* [/src/index.ts](/src/index.ts) - Express app entry point, initializes the DB connection and the webhook listener
* Entrypoint at [index.js](authorizer/index.js)
* Route definitions at [routes.js](authorizer/routes.js)
* Stigg's feature definitions at [features.js](authorizer/features.js)
* Business logic to determine access at [checkRouteEntitlements.js](authorizer/checkRouteEntitlements.js)

## Deployment

The can run both the DB and the app easily by using `docker compose up` command from the terminal, after cloning the repository.

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


### Running REST calls

You can access the GraphiQL interactive UI at `http://localhost:8080/graphiql` and run queries like:

```graphql
TBD
```

### Running REST calls

The below is example of available REST request:
```bash
curl --location --request POST 'http://localhost:8080/check-access' \
--header 'Content-Type: application/json' \
--data-raw '{"featureId": "{{feature-id}}", "customerId": "{{customer-id}}", "requestedUsage": {{requested-usage}}'
```

The following placeholders should be replaced:
* `{{feature-id}}` should be replaced with an ID of a feature.
* `{{customer-id}}` should be replaced with an ID of a customer.
* `{{requested-usage}` should be replaced with an amount of requested usage.
