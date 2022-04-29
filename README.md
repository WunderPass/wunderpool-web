# WunderPool Web App

This Project is the core of WunderPool and enables Users to create Blockchain based Investment Pools.

## Architechture

This Project in its core consists of two docker containers:

1. **web**: The Next.js Application
2. **nginx**: The nginx web server

## Development

To start the Project, first create an ENV file called **_.env_** at the root of the project with the following configuration:

```bash
# .env
BLOCKCHAIN_NAME="matic"
ALCHEMY_API_KEY=<YOUR_ALCHEMY_API_KEY>
WUNDERPASS_URL="http://localhost:3000" # Or set it to "https://app.wunderpass.org" if you don't have a local version of the wunderpass web app running
```

---

To start the App run:

```bash
docker-compose -f docker-compose.dev.yml up
```

and go to localhost:3001
