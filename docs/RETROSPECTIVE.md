# Retrospective
## API performances
### Importing companies
When batching DB insertion every 10,000 companies:
- 96,515 companies were imported and saved in 3.425s
- 2,026,795 companies were imported and saved in 83.358s

When batching DB insertion every 2,500 companies:
- 96,515 companies were imported and saved in 3.374s
- 2,026,795 companies were imported and saved in 103.633s

JSON Parsing took 445.976ms for 96,515 companies (19 Megabytes file).
JSON Parsing took 16.930s for 2,026,795 companies (123 Megabytes file).

**Conclusion:**
Interestingly, database insertion is slower with a big batch of 10,000 with a small GeoJSON. On big GeoJSON files, a bigger batch size is faster.

JSON Parsing is still super long. It would be interesting to see if a JSON parser that supports partial parsing exists.

### Searching companies
For this part, I used artillery to perform simple load testing to see how the response time increase when the number of data in the DB gets bigger.

Tests were executed on a production build with PostgreSQL + PostGIS in a Docker container.

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

**Artillery summary report (response times are in milliseconds) for 2,026,795 entries in DB:**
```
http.codes.201: ................................................................ 1750
http.downloaded_bytes: ......................................................... 24403750
http.request_rate: ............................................................. 43/sec
http.requests: ................................................................. 1750
http.response_time:
  min: ......................................................................... 76
  max: ......................................................................... 187
  mean: ........................................................................ 90.7
  median: ...................................................................... 89.1
  p95: ......................................................................... 108.9
  p99: ......................................................................... 117.9
http.responses: ................................................................ 1750
vusers.completed: .............................................................. 1750
vusers.created: ................................................................ 1750
vusers.created_by_name.0: ...................................................... 1750
vusers.failed: ................................................................. 0
vusers.session_length:
  min: ......................................................................... 78.2
  max: ......................................................................... 188.8
  mean: ........................................................................ 92.7
  median: ...................................................................... 90.9
  p95: ......................................................................... 111.1
  p99: ......................................................................... 125.2
```

**Conclusion:**

When the companies count get multiplied by 20 times, the p99 response time increase 10 times.

It is still a big increase, but it is not linear nor exponential, which is good.

Note about the tests: the Artillery load tests could be improved to introduce randomized filters to see how the DB performs without caching.

## Data improvements
The usage of the current ORM is limited: MikroORM doesn't support PostGIS types and functions out of the box so I had to write native queries.

For a small project, using a library like Knex would have been easier and smaller.

For a project which is going to grow, I would stick to use an ORM for better maintainability.

It would improve user experience to be able to search by already defined area like a city, a region, etc.

This means we would have to store the polygons that corresponds to a defined area.

By storing the polygons of a defined area, we could pre-process the statistics for this area to deliver the result instantaneously.

It would also mean implementing a solution to update the statistics of defined area when their data changes.

## Code improvements
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

## Infra improvement
If there is a lot of traffic on the API, I would create different apps that serves the public facing endpoints and the import endpoints.

Importing large files can be resource intensive: importing a large GeoJSON file should not slow down the rest of the application.

Also, in production, the HTTP server upload limits need to be different: we want to allow very large files to be uploaded on one end, and we should not allow that kind of requests on public facing endpoints for security reasons.
