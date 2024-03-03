import { Migration } from '@mikro-orm/migrations';

export class Migration20240303154544 extends Migration {
  async up(): Promise<void> {
    this.addSql('CREATE EXTENSION IF NOT EXISTS btree_gist;'); // We need this extension to use GIST index on multiple columns
    this.addSql(
      'create table "company" ("id" serial primary key, "geometry" GEOMETRY(Point,4326) not null, "reference" varchar(255) not null, "company_name" varchar(255) not null, "market_identifier" varchar(255) not null, "market_label" varchar(255) not null);',
    );
    this.addSql(
      'alter table "company" add constraint "company_reference_unique" unique ("reference");',
    );
    this.addSql(
      'create index "company_geometry_index" on "company" using GIST ("geometry");',
    );
    this.addSql(
      'create index "company_geometry_market_identifier_idx" on "company" USING GIST("geometry", "market_identifier");',
    );
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "company" cascade;');
  }
}
