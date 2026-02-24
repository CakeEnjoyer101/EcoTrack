import { query } from '../../boilerplate/db/index.js';
export const getTest = async () => {
  const { rows } = await query("SELECT 'It works' as test");
  return rows;
};
