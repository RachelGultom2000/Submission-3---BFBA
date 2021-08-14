const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const {mapDBToModel, mapDBToPlaylist} = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

 
class PlaylistsService {
  constructor(collaborationService,cacheService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
    this._cacheService = cacheService;
  }
 
  async addPlaylist({name, owner}) {
    const id = `playlist-${nanoid(16)}`;
 
    const addQuery = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
 
    const addResult = await this._pool.query(addQuery);
 
    if (!addResult.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
 
    return addResult.rows[0].id;
  }

  async getPlaylists(owner){
      const allplaylistsQuery = {
          text: `SELECT playlists.*,users.username FROM playlists
          LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
          LEFT JOIN users ON users.id = playlists.owner
          WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
          values: [owner],
      };
      const getResult = await this._pool.query(allplaylistsQuery);
      return getResult.rows.map(mapDBToPlaylist);
  }

  async getPlaylistById(id){
      const getQuery = {
          text: `SELECT playlists.*, users.username FROM playlists
          LEFT JOIN users ON users.id = playlists.owner
          WHERE playlists.id = $1`,
          values: [id],
      };

      const getIdResult = await this._pool.query(getQuery);

      if(!getIdResult.rows.length){
          throw new NotFoundError('Playlist tidak ditemukan');
      }

      return getIdResult.rows.map(mapDBToPlaylist)[0];
  }

  async editPlaylistById(id, {name}){
      const editQuery = {
          text: 'UPDATE playlists SET name = $1, WHERE id = $2 RETURNING id',
          values: [name,id],
      };

      const editIdResult = await this._pool.query(editQuery);

      if(!editIdResult.rows.length){
          throw new NotFoundError("Gagal memperbarui playlist.Id tidak ditemukan");
      }
  }

  async deletePlaylistById(id){
      const deleteQuery = {
          text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
          values: [id],
      };

      const deleteResult = await this._pool.query(deleteQuery);

      if(!deleteResult.rows.length){
          throw new NotFoundError('Playlist gagal dihapus.Id tidak ditemukan');
      }
  }

  async verifyPlaylistOwner(id,owner){
      const verifyQuery = {
          text: 'SELECT * FROM playlists WHERE id = $1',
          values: [id],
      };

      const verifyResult = await this._pool.query(verifyQuery);

      if(!verifyResult.rows.length){
          throw new NotFoundError("Playlist tidak ditemukan");
      }
      const playlist = verifyResult.rows[0];
      if(playlist.owner !== owner){
          throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
      }
  }

  async verifyPlaylistAccess(id, userId){
      try{
          await this.verifyPlaylistOwner(id, userId);
      }catch(error){
          if(error instanceof NotFoundError){
              throw error;
          }
          try{
              await this._collaborationService.verifyFromCollaborator(id, userId);
          }catch{
              throw error;
          }
      }
  }
 
// Playlist

async addPlaylistSong(playlistId, songId){
    const id = `playlistsong-${nanoid(16)}`;
    const addplaylistQuery = {
        text: 'INSERT INTO playlistsongs VALUES($1,$2,$3) RETURNING id',
        values: [id,playlistId, songId],
    };
    const addplaylistResult = await this._pool.query(addplaylistQuery);
    if(!addplaylistResult.rows.length){
        throw new InvariantError('lagu gagal ditambahkan ke playlist');
    }

    await this._cacheService.delete(`playlist:${playlistId}`);
    return addplaylistResult.rows[0].id;
}

async getPlaylistSongs(playlistId){
    try{
        const getplaylistResult = await this._cacheService.getIdResult(`playlist:${playlistId}`);
        return JSON.parse(getplaylistResult);
    }catch(error){
    const getplaylistQuery = {
        text: `SELECT songs.id, songs.title, songs.performer FROM songs
        LEFT JOIN playlistsongs ON playlistsongs.song_id = songs.id
        WHERE playlistsongs.playlist_id = $1 GROUP BY songs.id`,
        values: [playlistId],
    };
    const getplaylistResult = await this._pool.query(getplaylistQuery);
    // return getplaylistResult.rows.map(mapDBToModel);
    const storemapResult = getplaylistResult.rows.map(mapDBToModel);

    await this._cacheService.editPlaylistById(`playlist:${playlistId}`,JSON.stringify());

    return storemapResult;
}
}

async deletePlaylistSongById(playlistId,songId){
    const deleteplaylistQuery = {
        text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
        values: [playlistId,songId],
    };

    const deleteplaylistResult = await this._pool.query(deleteplaylistQuery);
    if(!deleteplaylistResult.rows.length){
        throw new InvariantError('Lagu gagal dihapus dari playlist.Id lagu tidak ditemukan');
    }
    await this._cacheService.delete(`playlist:${playlistId}`);
}
  
}
 
module.exports = PlaylistsService;
