import { Migration } from "@mikro-orm/migrations"

export class Migration20240624200006 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table if exists "region_country" add column if not exists "metadata" jsonb null, add column "created_at" timestamptz not null default now(), add column "updated_at" timestamptz not null default now(), add column "deleted_at" timestamptz null;'
    )
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table if exists "region_country" drop column if exists "metadata";'
    )
    this.addSql(
      'alter table if exists "region_country" drop column if exists "created_at";'
    )
    this.addSql(
      'alter table if exists "region_country" drop column if exists "updated_at";'
    )
    this.addSql(
      'alter table if exists "region_country" drop column if exists "deleted_at";'
    )
  }
}
