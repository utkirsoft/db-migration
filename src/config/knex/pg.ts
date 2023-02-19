import { Injectable } from '@nestjs/common';
import { KnexModuleOptions } from 'nest-knexjs/dist/interfaces/knex-options.interface';
import { KnexOptionsFactory } from 'nest-knexjs/dist/interfaces/knex-options-factory.interface';
import { APP_NAME, PG_PORT, PG_DB, PG_HOST, PG_PASS, PG_USER } from '@env';
import { Knex } from 'knex';

@Injectable()
export class KnexPGConfig implements KnexOptionsFactory {
  createKnexOptions(): KnexModuleOptions {
    return {
      config: {
        debug: false,
        client: 'postgresql',
        connection: {
          user: PG_USER,
          database: PG_DB,
          password: PG_PASS,
          port: PG_PORT,
          host: PG_HOST,
          keepAlive: false,
          statement_timeout: false,
          application_name: APP_NAME,
        },
        pool: {
          min: 75,
          max: 100,
        },
        useNullAsDefault: false,
        asyncStackTraces: false,
        log: {
          warn(message) {
            console.warn('Knex', message);
          },
          error(message) {
            console.error('Knex', message);
          },
          debug(message) {
            console.debug('Knex', message);
          },
          inspectionDepth: 1,
          enableColors: true,
        },
      } as Knex.Config,
      retryAttempts: 10,
      retryDelay: 10,
    };
  }
}
