const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService{
    constructor(){
        this._pool = new Pool();
    }

    async addToUser({username,password,fullname}){
        await this.verifyAllNewUsername(username);

        const id = `user-${nanoid(16)}`;
        const hashedPassword = await bcrypt.hash(password, 10);
        const adduserQuery = {
            text : 'INSERT INTO users VALUES($1,$2,$3,$4) RETURNING id',
            values: [id,username,hashedPassword,fullname],
        };

        const addResult = await this._pool.query(adduserQuery);

        if(!addResult.rows.length){
            throw new InvariantError('User gagal ditambahkan');
        }

        return addResult.rows[0].id;
    
    }


    async verifyAllNewUsername(username){
        const verifyuserQuery = {
            text : 'SELECT username FROM users WHERE username = $1',
            values: [username],
        };

        const verifyResult = await this._pool.query(verifyuserQuery);

        if(verifyResult.rows.length > 0){
            throw new InvariantError('Gagal menambahkan user.Username sudah digunakan')
        }
    }

    async getFromUserById(userId){
        const getuserQuery = {
            text: 'SELECT id, username,fullname FROM users WHERE id = $1',
            values: [userId],
        };

        const getResult = await this._pool.query(getuserQuery);

        if(!getResult.rows.length){
            throw new NotFoundError('User tidak ditemukan');
        }

        return getResult.rows[0];
    }

    async verifyFromUserCredential(username, password) {
        const verifycredentialQuery = {
          text: 'SELECT id, password FROM users WHERE username = $1',
          values: [username],
        };
        const verifyResult = await this._pool.query(verifycredentialQuery);

        if(!verifyResult.rows.length){
            throw new AuthenticationError('Kredensial yang Anda berikan salah');
        }

        const { id,password: hashedPassword } = verifyResult.rows[0];

        const matchVerify = await bcrypt.compare(password,hashedPassword);

        if(!matchVerify){
            throw new AuthenticationError('Kredensial yang Anda berikan salah');
        }

        return id;
      }
}

module.exports = UsersService;