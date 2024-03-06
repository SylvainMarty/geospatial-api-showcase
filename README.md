companies-geospatial-api-test
=========================
This is a technical solution for a hiring test about creating a population statistics API using GeoJSON raw sources.
This project uses NestJS, TypeScript, PostgreSQL, and PostGIS.

# 🚀 Run the project
## Prerequisite
You need:
 - A linux-compatible machine like Ubuntu, MacOSX or Windows WSL2
 - Docker and Docker Compose installed
 - Internet access (the system will fetch NAF codes when it starts for the first time)

If you want to run the project without Docker, go to the **Contribute** section at the end of the README.

## Getting started
Run this command in your terminal:
```
docker-compose up -d
```

To test the project:
1. Access the API doc there: http://localhost:3000/apidoc
2. Login to obtain a JWT with one of the following credentials:
   - chuck/norris
   - tommy/vercetti
3. Register the JWT in the UI with the **Authorize** button
4. Import `tls-business.geojson` with the `POST /companies` API route
5. Query companies with the `POST /companies/search` API route (the examples in the doc will work out of the box)
   - you can use the website https://geojson.io/ to draw a polygon over an area (I recommend somewhere around Toulouse) and obtain the polygon coordinates
   - you can use https://github.com/SocialGouv/codes-naf/blob/master/index.json to see the list of available NAF codes

-------------

# Technical test challenge
## Objective
To propose an API that provides access to population and business data provided in the appendix.
- Geographical filter
- Filter based on various criteria to be defined
- Data returned in aggregated Json format.

## Expectations
We do not expect an exhaustive answer, but rather a scope that you are free to define on the subject.

## The Data
You will find sample data corresponding to the exercise in the `geodata/` folder:
- tls-businesses.geojson
- hg-census-2016.geojson
- hg-census-2017.geojson
- ny-census-2017.geojson

<details>
<summary>Click to see the documentation for each of these data files.</summary>

### tls-businesses
Dictionary of variables for Toulouse establishments:
- denomination: establishment name
- activiteprincipaleetablissement: NAF code for the company’s activity

### hg-census-2016
Dictionary of variables for the 2016 Haute-Garonne census:
- code_iris: unique identifier for the iris
- insee_com: commune code
- nom_iris: iris name
- P16_POP: population
- P16_POP0002: number of people aged 0 to 2 years
- P16_POP0305: number of people aged 3 to 5 years
- P16_POP0610: number of people aged 6 to 10 years
- P16_POP1117: number of people aged 11 to 17 years
- P16_POP1824: number of people aged 18 to 24 years
- P16_POP2539: number of people aged 25 to 39 years
- P16_POP4054: number of people aged 40 to 54 years
- P16_POP5564: number of people aged 55 to 64 years
- P16_POP6579: number of people aged 65 to 79 years
- P16_POP80P: number of people aged 80 years or older

### hg-census-2017
Dictionary of variables for the 2017 Haute-Garonne census:
- code_iris: unique identifier for the iris
- insee_com: commune code
- nom_iris: iris name
- P17_POP: population
- P17_POP0002: number of people aged 0 to 2 years
- P17_POP0305: number of people aged 3 to 5 years
- P17_POP0610: number of people aged 6 to 10 years
- P17_POP1117: number of people aged 11 to 17 years
- P17_POP1824: number of people aged 18 to 24 years
- P17_POP2539: number of people aged 25 to 39 years
- P17_POP4054: number of people aged 40 to 54 years
- P17_POP5564: number of people aged 55 to 64 years
- P17_POP6579: number of people aged 65 to 79 years
- P17_POP80P: number of people aged 80 years or older

### ny-census-2017
Dictionary of variables for the 2017 US state census:
- full_geoid: unique identifier for the census track
- B01001001: Total population
- B01001002: Total male population
- B01001003: Males under 5 years old
- B01001004: Males aged 5 to 9 years
- B01001005: Males aged 10 to 14 years
- B01001006: Males aged 15 to 17 years
- B01001007: Males aged 18 and 19 years
- B01001008: Males aged 20 years
- B01001009: Males aged 21 years
- B01001010: Males aged 22 to 24 years
- B01001011: Males aged 25 to 29 years
- B01001012: Males aged 30 to 34 years
- B01001013: Males aged 35 to 39 years
- B01001014: Males aged 40 to 44 years
- B01001015: Males aged 45 to 49 years
- B01001016: Males aged 50 to 54 years
- B01001017: Males aged 55 to 59 years
- B01001018: Males aged 60 and 61 years
- B01001019: Males aged 62 to 64 years
- B01001020: Males aged 65 and 66 years
- B01001021: Males aged 67 to 69 years
- B01001022: Males aged 70 to 74 years
- B01001023: Males aged 75 to 79 years
- B01001024: Males aged 80 to 84 years
- B01001025: Males aged 85 years and older
- B01001026: Total female population
- B01001027: Females under 5 years old
- B01001028: Females aged 5 to 9 years
- B01001029: Females aged 10 to 14 years
- B01001030: Females aged 15 to 17 years
- B01001031: Females aged 18 and 19 years
- B01001032: Female aged 20
- B01001033: Female aged 21
- B01001034: Female aged 22 to 24
- B01001035: Female aged 25 to 29
- B01001036: Female aged 30 to 34
- B01001037: Female aged 35 to 39
- B01001038: Female aged 40 to 44
- B01001039: Female aged 45 to 49
- B01001040: Female aged 50 to 54
- B01001041: Female aged 55 to 59
- B01001042: Female aged 60 and 61
- B01001043: Female aged 62 to 64
- B01001044: Female aged 65 and 66
- B01001045: Female aged 67 to 69
- B01001046: Female aged 70 to 74
- B01001047: Female aged 75 to 79
- B01001048: Female aged 80 to 84
- B01001049: Female aged 85 and older
</details>

-------------

# Solution specification
I am going to use TypeScript and NestJS for the technical solution of this technical test.

## 1. Challenge interpretation
My interpretation of the given challenge is that I need to build an API that will allow users to:
1. identify which areas are the most likely to contain the targeted customers for a product/company
2. find concurrent companies in a specific geographic area

Those two information combined can help companies identify which places are interesting to establish a new selling point and maximize ROI.

### A list of companies
Each company should include their NAF Code and the associated market activity label.
The market activity label will have to be found in a dictionary of all market activity label by NAF code.

Useful filters:
- geographic (polygon)
- market activity (NAF code and/or label)

### Population census statistics
Useful filters:
- Geographic (polygon)
- By gender
- By age range

## 2. Geospatial index
This section's goal is to answer this question: what geospatial database solution should I use to have a performant and scalable system?
This challenge as 2 big difficulties:
1. We need an efficient way to **filter** the geospatial data that **intersect** or is **within** a polygon for our geospatial search to work
2. We need an efficient way to **filter** based on the properties (NAF code, range of ages)
3. We need an efficient way to **aggregate** the statistics together

There are multiple geospatial databases and solutions (non-exhaustive list):
- Use a files combined with performant geospatial algorithms and indexes: Shapefiles or GeoJSON files, Python for efficient algorithms and clickhouse-local for efficient file parsing and querying
- Use a geospatial indexing system like H3 to index the normalized data into a big index: H3 indexing system with PostgreSQL or Redis
- Use an existing database engine that supports geospatial indexes and queries: PostgreSQL with the PostGIS extension, MongoDB, Clickhouse, etc.

For this test, I am going to use the PostgreSQL and the PostGIS extension:
- PostgreSQL: it's a very powerful RDBMS that I am proficient in it
- PostGIS: provides powerful geospatial types and indexes that are going to save me a lot of time getting started

## 2. Technical solution scope
For this test, I only have access to french companies, so I am not going to ingest US census data because it would not be enough to answer the need I interpreted in section 1.
Since it is the first time I use a geospatial database, I prefer to focus on a smaller scope that will include ingesting data and searching efficiently into companies.
My idea is to create a system can be easily extended to import companies from other GeoJSON files than the one provided for the test (see the section **4. System design** > **Import companies**).

## 3. Companies raw data normalization
The given raw dataset provides the following information:
- the name of the company
- the NAF code of the company market activity
- the geographic coordinates of the company

I am going to use the library [SocialGouv/codes-naf](https://github.com/SocialGouv/codes-naf) (it is the official French government library) to obtain the market activity label.

Here is how companies properties are going to look after normalization:
```json5
{
  "import_id": "french_companies",
  "company_name": "CNRS-DELEGATION MIDI PYRENEES (0)",
  "company_market_identifier": "72.20Z",
  "company_market_label": "Recherche-développement en sciences humaines et sociales"
}
```

With PostGIS, I can choose between Geometry or Geography types to store the multipolygons of each entry.
In my case, I don't need to have accurate geographic distances and using a planar reference (from the geometry type) is enough to answer my needs.

To filter the companies from a polygon, I chose to use the `ST_Intersect()` function instead of `ST_Within()` because I found the latter too exclusive: it was giving less predictable results from a user point of view.

## 4. System architecture
### CQRS: Command and Query Responsibility Segregation
I chose to isolate business logic in services that follows the CQRS pattern.
I am used to this pattern and I think it allows developers to write more focused pieces of software since a handler has only one public method.
Yes, it comes at the cost of simplicity: it isn't always easy to navigate between usages and implementation.

### Import companies from large GeoJSON files
I use the [simdjson_nodejs](https://github.com/luizperes/simdjson_nodejs) library to read the big json files.
It is faster than JSON.parse() and more memory efficient because the library only parse sub parts of the file.

NAF codes data is stored in PostgreSQL. The data is fetched when the app starts for the first time.

To make the import system easily extensible, I implemented the Strategy pattern.
The idea of this pattern is to remove conditions and switches to decide which code should be executed.
Instead, it uses Nest dependency injection system to get a list of classes that implements an abstract class (it should be an interface but TypeScript being JavaScript...).

This abstract class provides 3 abstract methods that are taking the file in parameter:
- `supportsImport(file)`: return true if the file can be imported with the strategy, else false
- `getImportId(file)`: return the unique identifier of the import (used to deal with companies import collision)
- `generateCompany(file)`: a generator function that **yield** a `Company` entity every time it found one in the file

Creating a strategy means create a class that inherits this abstract class and its methods.
When the implementation is done, register the class in the `ImportStrategiesModule` like this:
```js
@Module({
  providers: [
    {
      provide: COMPANIES_STRATEGIES_CLASSES,
      useClass: FrenchCompaniesImportStrategy,
    },
    {
      provide: COMPANIES_STRATEGIES_CLASSES,
      useClass: NewUsCompaniesImportStrategy,
    },
  ],
  exports: [COMPANIES_STRATEGIES_CLASSES],
})
export class ImportStrategiesModule {}
```

The ImportCompaniesHandler will automatically see the new strategy in the list (it uses the ModuleRef service of Nest).
Each strategy can be tested individually, making this pattern simple and useful when we want to give a system some room to expand.

## Project File structure
```
geodata                     Constains the geodata files for the test
src/
├── migrations              MikroORM migrations files
├── config/                 NestJS app config module
│   └── mikro-orm           MikroORM config classes & helpers
├── shared                  Contains classes & helpers shared with all modules
├── auth                    Contains the authentication module and Passport classes (with in memory users, etc.) 
├── api/                    Contains everything related to the Rest API layer
│   ├── auth/
│   │   └── dto
│   ├── companies/
│   │   └── dto
│   └── dto
└── companies/              The module for the companies business code
    ├── entities
    ├── repositories
    ├── import-strategies   Contains the module and the strategies to import companies data
    ├── commands/           Command & handlers that can write the DB
    │   ├── handlers
    │   └── impl
    └── queries/            Query & handlers that can read the DB
        ├── handlers
        └── impl
```

## 5. Retrospective
### API performances
#### Importing companies
I chose to insert a batch of companies in the DB every 2500 companies. 
It is taking around 3 seconds in total to import 96,515 entries (response time).
The response time stayed at 3 seconds even when the DB had 1M entries.

#### Searching companies
For this part, I used artillery to perform simple load testing to see how the response time increase when the number of data in the DB gets bigger.
Tests were executed in local and a PostgreSQL + PostGIS in a Docker container.

**Artillery summary report (response times are in milliseconds) for 96,515 entries in DB:**
```
http.codes.201: ................................................................ 1750
http.downloaded_bytes: ......................................................... 1232000
http.request_rate: ............................................................. 38/sec
http.requests: ................................................................. 1750
http.response_time:
  min: ......................................................................... 8
  max: ......................................................................... 83
  mean: ........................................................................ 11.2
  median: ...................................................................... 10.9
  p95: ......................................................................... 13.1
  p99: ......................................................................... 16
http.responses: ................................................................ 1750
vusers.completed: .............................................................. 1750
vusers.created: ................................................................ 1750
vusers.created_by_name.0: ...................................................... 1750
vusers.failed: ................................................................. 0
vusers.session_length:
  min: ......................................................................... 9.6
  max: ......................................................................... 123
  mean: ........................................................................ 13.2
  median: ...................................................................... 12.3
  p95: ......................................................................... 15.6
  p99: ......................................................................... 30.3
```

**Artillery summary report (response times are in milliseconds) for 1,061,665 entries in DB:**
```
http.codes.201: ................................................................ 1750
http.downloaded_bytes: ......................................................... 12818750
http.request_rate: ............................................................. 34/sec
http.requests: ................................................................. 1750
http.response_time:
  min: ......................................................................... 50
  max: ......................................................................... 81
  mean: ........................................................................ 56.4
  median: ...................................................................... 55.2
  p95: ......................................................................... 64.7
  p99: ......................................................................... 71.5
http.responses: ................................................................ 1750
vusers.completed: .............................................................. 1750
vusers.created: ................................................................ 1750
vusers.created_by_name.0: ...................................................... 1750
vusers.failed: ................................................................. 0
vusers.session_length:
  min: ......................................................................... 52
  max: ......................................................................... 107.5
  mean: ........................................................................ 58.2
  median: ...................................................................... 56.3
  p95: ......................................................................... 67.4
  p99: ......................................................................... 74.4
```

**Conclusion:**
I multiplied by 10 the number of data in the DB and the mediam response time are only multiplied by 5: it is a good start.
I think the Artillery load tests could be improved to introduce different filters to see how the DB performs with less predictable queries.

### Data improvements
The usage of the current ORM is limited: MikroORM doesn't support PostGIS types and functions out of the box so I had to write native queries.
For a small project, using a library like Knex would have been easier and smaller.
For a project which is going to grow, I would stick to use an ORM for better maintainability.

It would improve user experience to be able to search by already defined area like a city, a region, etc.
This means we would have to store the polygons that corresponds to a defined area.
By storing the polygons of a defined area, we could pre-process the statistics for this area to deliver the result instantaneously.
It would also mean implementing a solution to update the statistics of defined area when their data changes.

### Code improvements
For a larger project, it would be useful to avoid leaking ORM entities to external modules.
To achieve this, we could use DTOs or a more heavy architecture like the hexagonal architecture.
With the current structure of the business code, it would not be difficult to add this clear layer of isolation.

For now, collision of companies in the DB is not implemented.
The system deletes the previous import before importing the new data.
It means the property `name` at the root of GeoJSON MUST be set correctly to avoid duplicates.
Deleting the <100k entries takes ~70ms.

There is a workaround in the `CompanyRepository` that introduces an SQL injection vulnerability:
A safe solution should be found before considering to send this code in production.
Here is what I would expect to work with MikroORM query builder:
```ts
public async findPaginatedCompaniesFromPolygonAndMarketIdentifies(
  polygon: Polygon,
  marketIdentifiers: string[],
  offset: number,
  limit: number,
) {
  return this.createQueryBuilder('c')
    .where(
      raw(
        `ST_Intersects(geometry,'POLYGON((?))'::geography::geometry)`,
        [
          polygon.points
            .map((point) => `${point.latitude} ${point.longitude}`)
            .join(',')
        ],
      ),
    )
    .andWhere({
      marketIdentifier: {
        $in: marketIdentifiers,
      },
    })
    .orderBy({
      companyName: QueryOrder.ASC,
    })
    .limit(Math.min(limit, COMPANIES_PAGINATION_SIZE_LIMIT))
    .offset(offset)
    .getResultAndCount();
}
```

### Infra improvement
If there is a lot of traffic on the API, I would create different apps that serves the public facing endpoints and the import endpoints.
Importing large files can be resource intensive: importing a large GeoJSON file should not slow down the rest of the application.
Also, in production, the HTTP server upload limits need to be different: we want to allow very large files to be uploaded on one end, and we should not allow that kind of requests on public facing endpoints for security reasons.

-------------

# Contribute
## Prerequisite
You need a PosgreSQL with PostGIS installed.
I tested with PosgreSQL 16 and PostGIS 3.4.

In local, I used Node 20 (there is `.nvmrc` file at the root of the folder if you use NVM).

## Installation
```bash
$ yarn install
```

Create a file .env.local and update the local DB variables according to your system:
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
