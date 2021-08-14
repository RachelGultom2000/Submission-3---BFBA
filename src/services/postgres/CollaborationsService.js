const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class CollaborationsService{
    constructor(){
        this._pool = new Pool();
    }

    async addToCollaboration(playlistId, userId){
        const id = `collab-${nanoid(16)}`;
        const addQuery = {
            text: 'INSERT INTO collaborations VALUES($1,$2,$3) RETURNING id',
            values: [id, playlistId, userId],
        };

        const addResult = await this._pool.query(addQuery);
        if(!addResult.rows.length){
            throw new InvariantError('Kolaborasi gagal ditambahkan');
        }
        return addResult.rows[0].id;
    }

    async deleteFromCollaboration(playlistId, userId){
        const deleteQuery = {
            text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
            values: [playlistId,userId],
        };
        
        const deleteResult = await this._pool.query(deleteQuery);
        if(!deleteResult.rows.length){
            throw new InvariantError('Kolaborasi gagal dihapus');
        }
    }

    async verifyFromCollaborator(playlistId,userId){
        const verifyQuery = {
            text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
            values: [playlistId,userId],
        };

        const verifyResult = await this._pool.query(verifyQuery);

        if(!verifyResult.rows.length){
            throw new InvariantError('Kolaborasi gagal diverifikasi');
        }
    }
}

module.exports = CollaborationsService;