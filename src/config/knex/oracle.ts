import { Injectable } from '@nestjs/common';
import { KnexModuleOptions } from 'nest-knexjs/dist/interfaces/knex-options.interface';
import { KnexOptionsFactory } from 'nest-knexjs/dist/interfaces/knex-options-factory.interface';
import { ORACLE_DB, ORACLE_HOST, ORACLE_PASS, ORACLE_USER } from '@env';
import { Knex } from 'knex';

@Injectable()
export class KnexOracleConfig implements KnexOptionsFactory {
  createKnexOptions(): KnexModuleOptions {
    return {
      config: {
        debug: false,
        client: 'oracledb',
        connection: {
          user: ORACLE_USER,
          password: ORACLE_PASS,
          host: ORACLE_HOST,
          database: ORACLE_DB,
        },
        log: {
          warn(message) {
            console.warn('Knex oracle', message);
          },
          error(message) {
            console.error('Knex oracle', message);
          },
          debug(message) {
            console.debug('Knex oracle', message);
          },
          enableColors: true,
        },
      } as Knex.Config,
      retryAttempts: 10,
      retryDelay: 10,
    };
  }
}
