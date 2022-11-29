import { config } from 'dotenv';

config();

import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { postgraphile } from 'postgraphile';
import { processEvent } from './event-processor';
import { checkAccess } from './access-checker';

const app = express();

const { PORT } = process.env;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Endpoint to handle incoming webhooks from Stigg
app.post('/webhook', async (req, res) => {
  // Naive verification of the webhook origin, HMAC signatures will be added later
  if (req.header('stigg-webhooks-secret') !== process.env.STIGG_WEBHOOK_SECRET) {
    res.status(401).send('Unauthorized');
    return;
  }

  try {
    await processEvent(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Exposing the GraphQL API generated from the database public schema, accessible at /graphql
app.use(
  postgraphile(process.env.DATABASE_URL, 'public', {
    subscriptions: true,
    watchPg: true,
    dynamicJson: true,
    setofFunctionsContainNulls: false,
    ignoreRBAC: false,
    showErrorStack: 'json',
    extendedErrors: ['hint', 'detail', 'errcode'],
    appendPlugins: [require('@graphile-contrib/pg-simplify-inflector')],
    skipPlugins: [require('graphile-build').NodePlugin],
    graphiql: true,
    enhanceGraphiql: true,
    enableQueryBatching: true,
    legacyRelations: 'omit',
    disableQueryLog: true,
  }),
);

app.post('/check-access', async (req, res) => {
  const { customerId, featureId, requestedUsage } = req.body;
  if (!customerId || !featureId) {
    res.status(400).send('customerId and featureId are required');
    return;
  }

  const decision = await checkAccess(customerId, featureId, requestedUsage);

  if (decision.hasAccess) {
    res.status(200).json(decision);
  } else {
    res.status(403).json(decision);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
