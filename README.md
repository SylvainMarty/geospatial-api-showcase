geospatial-api-showcase
=========================
This project is a showcase of my skills and methodology for building REST API backend written in TypeScript using NestJS.

The goal of this project is to provide a REST API that could be used to find concurrent companies in a specific geographic area.

This project was a perfect opportunity to learn more about geospatial databases and the PostgreSQL's PostGIS extension.

I used the GeoJSON extract of Haute-Garonne businesses as testing data (see the file [`geodata/tls-business.geojson`](geodata/tls-business.geojson)).

# ⭐ Features & highlights
The API provides the following features:
 - JWT authentication with in-memory users
 - An API route to import companies from a GeoJSON file
 - An API route to search companies from a polygon and a list of market activity codes (ex: French NAF codes)
   This route returns a paginated list of companies. 

On the implementation side, this project uses the **Strategy design pattern** that allows extending the GeoJSON import system to support other GeoJSON sources (see the **Import companies from large GeoJSON files** section in [docs/SYSTEM-DESIGN.md](docs/SYSTEM-DESIGN.md) for more details).

I wrote a retrospective of what I learnt when working on this project here: [docs/RETROSPECTIVE.md](docs/RETROSPECTIVE.md).

> 💡 The retrospective also contains some performance insights of the API after increasing the load and the DB size.

# 🚀 Run the project
## Requirements
To run the project, you need:
 - A linux-compatible machine like Ubuntu, MacOSX or Windows WSL2
 - Docker and Docker Compose installed
 - Internet access (the system will fetch the French NAF codes when it starts for the first time)

> 👉 If you want to run the project without Docker, go to the **Contribute** section at the end of the README.

## Run the project
Run this command in your terminal:
```
docker-compose up -d
```

## Test the project
1. Access the Swagger UI there: http://localhost:3000/apidoc
2. Submit the /auth/login route to obtain a JWT with one of the following credentials:
   - chuck/norris
   - tommy/vercetti
   Copy the JWT returned by the API
3. Paste the JWT in the UI with the **Authorize** button (top right corner)
4. Import the file `geodata/tls-business.geojson` with the `POST /companies` API route
5. Query companies with the `POST /companies/search` API route (the examples in the API doc will work out of the box)
   - you can use the website https://geojson.io/ to draw a polygon over an area (I recommend somewhere around Toulouse) and copy the polygon coordinates
   - you can use https://github.com/SocialGouv/codes-naf/blob/master/index.json to see the list of available NAF codes

# Contribute
## Prerequisite
You need a PosgreSQL with PostGIS installed.

I tested with PosgreSQL 16 and PostGIS 3.4.

In local, I used Node v20 (there is `.nvmrc` file at the root of the folder if you use NVM).

## Installation
```bash
$ yarn install
```

Create a file `.env.local` and update the local DB variables according to your system:
```
# Database
MIKRO_ORM_HOST=localhost
MIKRO_ORM_USER=population-stats-api
MIKRO_ORM_PASSWORD=ThisIsNotASecurePassword
MIKRO_ORM_DB_NAME=population-stats-api
MIKRO_ORM_LOGGING=true
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod

# build and run in production mode
$ yarn run start:prod:build
```

## Test

```bash
# unit tests
$ yarn run test

# load tests
$ yarn run start:load-tests
```

## Project File structure
```
docs                        Constains the Markdown documentation of the project
geodata                     Constains the geodata files for the showcase
src/
├── migrations              MikroORM migration files
├── config/                 NestJS app config module
│   └── mikro-orm           MikroORM config classes & helpers
├── shared                  Contains classes & helpers shared with all modules
├── auth                    Contains the authentication module and Passport classes (with in memory users, etc.) 
├── api/                    Contains everything related to the Rest API layer
│   ├── auth/               Contains API routes & DTOs for authentication
│   │   └── dto
│   ├── companies/          Contains API routes & DTOs for the companies domain
│   │   └── dto
│   └── dto                 Contains shared DTOs accross API domains
└── companies/              The module for the companies business code
    ├── entities            MikroORM entities
    ├── repositories        MikroORM custom repositories
    ├── import-strategies   Contains the module and the strategies to import companies data
    ├── commands/           Command & handlers that can write the DB
    │   ├── handlers
    │   └── impl
    └── queries/            Query & handlers that can read the DB
        ├── handlers
        └── impl
```
