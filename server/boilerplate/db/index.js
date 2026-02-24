import pg from 'pg';
const DATE_OID = 1082;
const parseDate = (value) => value;

pg.types.setTypeParser(DATE_OID, parseDate);
export const pool = new pg.Pool();

export const query = (text, params) => pool.query(text, params);
export const close = () => pool.end();
