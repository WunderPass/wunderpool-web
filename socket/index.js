const express = require('express');
const eventSource = require('eventsource');
const bodyParser = require('body-parser');
const cors = require('cors');
const uuid = require('uuid');
const app = express();

app.use(cors());

const port = process.env.PORT || 5000;
let clients = [];
let eventEmitter = null;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function notifyClients(title, event) {
  clients.forEach((client) =>
    client.response.write(`event:${title}\ndata:${event.data}\n\n`)
  );
}

const eventList = [
  'POOL_CREATED',
  'USER_JOINED',
  'USER_IVITED',
  'TRANSACTION_REVERTED',
  'TRANSACTION_FAILED',
  'PROPOSAL_CREATED',
  'PROPOSAL_VOTED',
  'PROPOSAL_EXECUTED',
];

eventEmitter = new eventSource(
  `${process.env.POOLS_SERVICE}/web3Proxy/sse/subscriptions`,
  {
    headers: {
      authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    },
  }
);

for (const l of eventList) {
  eventEmitter.addEventListener(l, (event) => notifyClients(l, event));
}

setInterval(() => {
  console.log('Closing Connection...');
  if (eventEmitter) eventEmitter.close();
  console.log('Opening Connection...');
  eventEmitter = new eventSource(
    `${process.env.POOLS_SERVICE}/web3Proxy/sse/subscriptions`,
    {
      headers: {
        authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
      },
    }
  );

  for (const l of eventList) {
    eventEmitter.addEventListener(l, (event) => notifyClients(l, event));
  }
}, 1000 * 60 * 60);

function handleSubscribe(request, response, next) {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  response.writeHead(200, headers);
  response.flushHeaders();
  response.write('retry: 10000\n\n');

  const clientId = uuid.v4();

  const newClient = {
    id: clientId,
    response,
  };

  clients.push(newClient);
  console.log(`${clientId} Connected`);

  request.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter((client) => client.id !== clientId);
  });
}

app.get('/subscribe', handleSubscribe);

app.listen(port, '0.0.0.0', () => console.log(`Listening on Port ${port}...`));

for (let signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, () => {
    console.info(`${signal} signal received.`);
    if (eventEmitter) eventEmitter.close();
  });
