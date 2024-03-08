# System design
## `tls-businesses.geojson`: content explained
Dictionary of variables for Haute-Garonne establishments:
- `denomination`: establishment name
- `activiteprincipaleetablissement`: NAF code for the company’s activity

## Companies raw data normalization
The given raw dataset provides the following information:
- the name of the company
- the NAF code of the company market activity
- the geographic coordinates of the company

I am going to use the library [SocialGouv/codes-naf](https://github.com/SocialGouv/codes-naf) (it is the official French government library) to obtain the market activity label.

NAF codes are stored in PostgreSQL. The data is fetched when the app starts for the first time.

Companies will be represented by the following properties after normalization:
 - `importId` (ex: `french_companies`)
 - `companyName` (ex: `CNRS-DELEGATION MIDI PYRENEES (0)`)
 - `companyMarketIdentifier` (ex: `72.20Z`)
 - `companyMarketLabel` (ex: `Recherche-développement en sciences humaines et sociales`)

With PostGIS, I can choose between Geometry or Geography types to store the multipolygon of each entry.

In my case, I don't need to obtain accurate geographic distances and using a planar reference (from the geometry type) is enough to answer my needs and will be faster.

To filter the companies from a polygon, I chose to use the `ST_Intersect()` function instead of `ST_Within()` because I found the latter too exclusive: it was giving less predictable results from a user point of view.

## Geospatial index
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

## Import companies from large GeoJSON files
### JSON parsing performances
I use the [simdjson_nodejs](https://github.com/luizperes/simdjson_nodejs) library to read the big json files.

It is faster than JSON.parse() and more memory efficient because the library only parse sub parts of the file.

### Extensible companies import system
To make the import system easily extensible, I implemented the Strategy pattern.

The idea of this pattern is to remove conditions and switches to decide which code should be executed in different conditions.

Instead, it uses NestJS dependency injection system to get a list of classes that implement an abstract class (in a real OOP language, it should be an interface but TypeScript is still JavaScript 🤷).

This abstract class provides 3 abstract methods that are accepting the uploaded file buffer in parameter:
- `supportsImport(buffer)`: return true if the file can be imported with the strategy, else false
- `getImportId(buffer)`: return the unique identifier of the import (used to deal with companies import collision)
- `generateCompany(buffer)`: a generator function that **yield** a `Company` entity every time it found one in the file


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

On the business code side, the `ImportCompaniesHandler` will dynamically load the strategies list (it uses NestJS `ModuleRef` service).

Each strategy can be tested individually, making this pattern simple, maintainable, and easily extensible without modifying existing code.

## CQRS: Command and Query Responsibility Segregation
I chose to isolate business logic in services that follows the CQRS pattern.

I am used to this pattern and I think it allows developers to write more focused pieces of software since a handler has only one public method.

It is fair to say it comes at the cost of simplicity: it isn't always easy to navigate between usages and implementations.
