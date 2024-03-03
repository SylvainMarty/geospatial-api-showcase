import { Migration } from '@mikro-orm/migrations';

export class Migration20240303164535 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "naf_code" ("id" serial primary key, "code" varchar(255) not null, "label" varchar(255) not null);',
    );
    this.addSql('create index "naf_code_code_index" on "naf_code" ("code");');
    this.addSql(
      'alter table "naf_code" add constraint "naf_code_code_unique" unique ("code");',
    );
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "naf_code" cascade;');
  }
}
