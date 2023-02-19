import { Injectable } from '@nestjs/common';
import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';
import {
  DO2,
  DO3,
  DPM_API_URL,
  LIMIT_ROW,
  OVIR_API_TOKEN,
  OVIR_API_URL,
} from '@env';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { krillToLatin } from '../utils/translate';
import { isCyrillic, objectId } from '@utils';
import { Cron } from '@nestjs/schedule';
@Injectable()
export class GspPersonalService {
  private table = `gsp.persons`;

  constructor(
    private readonly httpService: HttpService,
    @InjectConnection('oracle') private readonly oracleKnex: Knex,
    @InjectConnection('postgres') private readonly postgresKnex: Knex,
  ) {}

  async records(
    table = DO2,
    limit = LIMIT_ROW,
    offset = 0,
    oracleKnex = this.oracleKnex,
  ) {
    return oracleKnex
      .select([
        'id',
        'date_birth',
        'pass_ser',
        'pass_num',
        'name',
        'f_name as middle_name',
        's_name as surname',
      ])
      .from(table)
      .where('ds32_code', 8)
      .whereNotNull('s_name')
      .whereNotNull('name')
      .whereNotNull('f_name')
      .limit(limit)
      .offset(offset);
  }

  @Cron('0-59/1 22-23,0-7 * * * *')
  async run() {
    const tables = [DO2, DO3];
    for (const table of tables) {
      const last = await this.postgresKnex
        .select('offset')
        .from(this.table)
        .where('table', table)
        .orderBy('offset', 'desc')
        .first();

      const offset = last?.offset || 0;
      const items: Record<
        'id' | 'pass_ser' | 'pass_num' | 'name' | 'middle_name' | 'surname',
        string
      >[] = await this.records(table, LIMIT_ROW, offset);
      for (const item of items) {
        const {
          pass_ser,
          pass_num,
          name,
          middle_name,
          surname,
          id: d_id,
        } = item;

        if (this.validatePassport(pass_ser + pass_num)) {
          await this.requestToDPM(pass_ser, pass_num, d_id, offset, table);
        } else {
          const n = isCyrillic(name) ? krillToLatin(name) : name;
          const m = isCyrillic(middle_name)
            ? krillToLatin(middle_name)
            : middle_name;
          const s = isCyrillic(surname) ? krillToLatin(surname) : surname;
          await this.requestToOVIR(n, s, m, d_id, offset, table);
        }
      }
    }
  }

  async requestToOVIR(
    name: string,
    surname: string,
    middle_name: string,
    d_id,
    offset,
    table,
  ) {
    const data = {
      // PINPP: '',
      // Pcitizen: '',
      // Pcitizenship: '',
      pSurname: surname,
      pName: name,
      pPatronym: middle_name,
      // pBirthfrom: '01.01.2000',
      // pBirthtill: '01.01.2010',
    };

    const request = this.httpService.post(OVIR_API_URL, data, {
      headers: {
        Authorization: `Bearer ` + OVIR_API_TOKEN,
      },
    });
    try {
      const response = await firstValueFrom(request);
      const {
        data: { AnswereId, AnswereMessage, Data },
      } = response;
      if (AnswereId == 1) {
        await this.store(
          Data,
          AnswereId,
          AnswereMessage,
          d_id,
          offset,
          table,
          false,
        );
      }
    } catch (e) {
      console.error('requestToOVIR: ', e);
    }
  }

  async requestToDPM(serial: string, number: string, d_id, offset, table) {
    const data = {
      // surname: '',
      // name: '',
      // patronym: '',
      doc_seria: serial,
      doc_number: number,
      is_consent: 'Y',
      req_name_unit:
        'Департамент по борьбе с экономическими преступлениями при Генеральной прокуратуре',
      req_doc_number: 'ЗРУ-660-II',
    };
    const request = this.httpService.post(DPM_API_URL, data);
    try {
      const response = await firstValueFrom(request);
      const {
        data: { Result, Comments, Data },
      } = response;
      if (Result == 1) {
        await this.store(Data, Result, Comments, d_id, offset, table, true);
      }
    } catch (e) {
      console.error('requestToDPM: ', e);
    }
  }

  async store(
    rows: any[],
    res_code,
    res_message,
    d_id,
    offset: number,
    table: string,
    is_gsp = true,
  ) {
    const data = [];
    for (const row of rows) {
      const pinpp = row?.pinpp || row?.Pinpp;
      data.push({
        id: objectId(),
        res_code: res_code,
        res_message: res_message,
        data: JSON.stringify(row),
        is_gsp: is_gsp,
        d_id: d_id,
        table: table,
        offset: offset,
        pinpp: pinpp,
      });
    }
    try {
      await this.postgresKnex.insert(data).into(this.table);
    } catch (e) {
      console.error('db store: ', e);
    }
  }

  validatePassport(serial_number): boolean {
    return /^[A-Z]{2}[0-9]{7}$/.test(serial_number);
  }
}
