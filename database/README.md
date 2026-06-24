# Database

## Local setup

```bash
docker compose up -d
```

Connection string:

```
postgresql://finance:finance123@localhost:5432/finance_db
```

## Run migrations

From the `server` directory:

```bash
npm run migrate
```
