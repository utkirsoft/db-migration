import * as dotenv from 'dotenv';

dotenv.config();

const schema = process.env.SCHEMA || '';
const HTTP_PORT = +process.env.HTTP_PORT || 4007;
const PG_PORT = +process.env.DBPORT || 5432;
const PG_HOST = process.env.PGHOST || '';
const PG_USER = process.env.PGUSER || '';
const PG_DB = process.env.PGDB || '';
const PG_PASS = process.env.PGPASS || '';
const APP_NAME = process.env.APP_NAME || '';

const ORACLE_PORT = +process.env.ORACLE_PORT || 5432;
const ORACLE_HOST = process.env.ORACLE_HOST || '';
const ORACLE_USER = process.env.ORACLE_USER || '';
const ORACLE_DB = process.env.ORACLE_DB || '';
const ORACLE_PASS = process.env.ORACLE_PASS || '';
const DO2 = process.env.DO2 || '';
const DO3 = process.env.DO3 || '';
const OVIR_API_URL = process.env.OVIR_API_URL || '';
const OVIR_API_TOKEN = process.env.OVIR_API_TOKEN || '';
const DPM_API_URL = process.env.DPM_API_URL || '';
const LIMIT_ROW = +process.env.LIMIT_ROW || 100;
export {
  schema,
  HTTP_PORT,
  PG_PORT,
  PG_HOST,
  PG_USER,
  PG_DB,
  PG_PASS,
  APP_NAME,
  ORACLE_HOST,
  ORACLE_PORT,
  ORACLE_USER,
  ORACLE_DB,
  ORACLE_PASS,
  DO2,
  DO3,
  OVIR_API_URL,
  OVIR_API_TOKEN,
  DPM_API_URL,
  LIMIT_ROW,
};
