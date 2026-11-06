// Confirma que supabase/instalar/instalar-tudo.sql (as migrações juntas, para colar no SQL Editor
// do Supabase quando a porta 5432 está bloqueada) instala tudo do zero e regista as migrações.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const raiz = join(import.meta.dirname, "..", "supabase");


test("instalar-tudo.sql corre do zero e regista as migrações", async () => {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb, invited_at timestamptz);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create publication supabase_realtime;
  `);
  await db.exec(readFileSync(join(raiz, "instalar", "instalar-tudo.sql"), "utf8"));

  const versoes = readdirSync(join(raiz, "migrations")).map((f) => f.split("_")[0]).sort();
  const { rows } = await db.query("select version from supabase_migrations.schema_migrations order by version");
  assert.deepEqual(rows.map((r) => r.version), versoes);

  const tabelas = await db.query(
    "select table_name from information_schema.tables where table_schema = 'public' order by 1",
  );
  assert.deepEqual(tabelas.rows.map((r) => r.table_name), [
    "adeptos", "classificacoes", "clube_config", "escaloes", "expulsoes", "golos", "jogos", "locais", "perfis", "perfis_escaloes",
  ]);
  const { rows: cfg } = await db.query("select nome_curto, cor_primaria from public.clube_config");
  assert.deepEqual(cfg, [{ nome_curto: "Fiães SC", cor_primaria: "#0B6B35" }]);
});

test("convite: o perfil é criado mesmo sem permissão para chamar a função do trigger", async () => {
  // No Supabase quem insere em auth.users é o papel supabase_auth_admin (não o dono das funções).
  const db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin; create role supabase_auth_admin nologin;
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb, invited_at timestamptz);
    create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
    create publication supabase_realtime;
    grant usage on schema auth to supabase_auth_admin; grant insert on auth.users to supabase_auth_admin;
  `);
  await db.exec(readFileSync(join(raiz, "instalar", "instalar-tudo.sql"), "utf8"));
  await db.exec("set role supabase_auth_admin");
  await db.query(
    "insert into auth.users (id, email, raw_user_meta_data, invited_at) values ('44444444-4444-4444-8444-444444444444', 'novo@clube.pt', '{\"nome\":\"Novo\"}', now())",
  );
  await db.exec("reset role");
  const { rows } = await db.query("select nome, email, papel from public.perfis");
  assert.deepEqual(rows, [{ nome: "Novo", email: "novo@clube.pt", papel: "treinador" }]);
});
