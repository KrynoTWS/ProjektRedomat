# Redomat
## Baza podataka

Koristi se **PostgreSQL** kao baza podataka.

Baza je pokrenuta preko Docker-a, koristeći `docker-compose.yml` datoteku.

### Konfiguracija okoline

Potrebno je kreirati .env datoteku na temelju .env.example datoteke:
```
DB_CLIENT=pg
DB_HOST=localhost
DB_PORT=5432
DB_USER=KORISNIČKO_IME
DB_PASS=LOZINKA
DB_NAME=redomat

ADMIN_USER=ADMIN_IME
ADMIN_PASS=ADMIN_LOZINKA
PORT=
```
`docker-compose.yml` sadrži sljedeće:
```
services:
  db:
    image: postgres:15
    container_name: redomat_db
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "5432:5432"
    volumes:
      - redomat_data:/var/lib/postgresql/data

volumes:
  redomat_data:
```
Kako bi se baza pokrenula potrebno je pokrenuti sljedeće nakon stvaranja `docker-compose.yml` datoteke u komandnu liniju:
```
    docker-compose up -d
```
Unutar knexfile.js su postavljeni svi podai za migracije i _seedanje_:
```
development: {
  client: process.env.DB_CLIENT,
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  },
  migrations: { directory: './db/migrations' },
  seeds: { directory: './db/seeds' },
}
```

Pokretanja migracija/stvaranje tablica:
```
npm run knex migrate:latest
```
Seedanje/postavljanje početnih podatka:
```
npm run knex seed:run
```
Zaustavljanje baze:
```
docker-compose down
````