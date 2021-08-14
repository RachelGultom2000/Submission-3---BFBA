const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
 
class AuthenticationsService {
  constructor() {
    this._pool = new Pool();
  }
 
  async addRefreshToken(token) {
    const addQuery = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };
 
    await this._pool.query(addQuery);
  }
 
  async verifyRefreshToken(token) {
    const verifyQuery = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };
 
    const verifyResult = await this._pool.query(verifyQuery);
 
    if (!verifyResult.rows.length) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }
 
  async deleteRefreshToken(token) {
    await this.verifyRefreshToken(token);
 
    const deleteQuery = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };
 
    await this._pool.query(deleteQuery);
  }
}
 
module.exports = AuthenticationsService;