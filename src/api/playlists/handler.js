class PlaylistsHandler {
    constructor(service, validator){
        this._service = service;
        this._validator = validator;

        this.postToPlaylistHandler = this.postToPlaylistHandler.bind(this);
        this.getFromPlaylistsHandler = this.getFromPlaylistsHandler.bind(this);
        this.getFromPlaylistByIdHandler = this.getFromPlaylistByIdHandler.bind(this);
        this.putToPlaylistByIdHandler = this.putToPlaylistByIdHandler.bind(this);
        this.deleteFromPlaylistByIdHandler = this.deleteFromPlaylistByIdHandler.bind(this);
        // Playlist Song
        this.postToPlaylistSongHandler = this.postToPlaylistSongHandler.bind(this);
        this.getFromPlaylistSongsHandler = this.getFromPlaylistSongsHandler.bind(this);
        this.deleteFromPlaylistSongByIdHandler = this.deleteFromPlaylistSongByIdHandler.bind(this);


    }

    async postToPlaylistHandler(request, h){
        this._validator.validatePlaylistPayload(request.payload);
        const {
            name
        } = request.payload;

        const {id: credentialId} = request.auth.credentials;
        const playlistId = await this._service.addPlaylist({
            name, owner: credentialId,
        });

        const response = h.response({
            status: 'success',
            message: 'Playlist berhasil ditambahkan',
            data: {
                playlistId,
            },
        });
        response.code(201);
        return response;
    }

    async getFromPlaylistsHandler(request){
        const { id: credentialId } = request.auth.credentials;
        const playlists = await this._service.getPlaylists(credentialId);
        return{
            status: 'success',
            data:{
                playlists,
            },
        };
    }

    async getFromPlaylistByIdHandler(request){
        const {id} = request.params;

        const {id: credentialId} = request.auth.credentials;
        await this._service.verifyPlaylistAccess(id,credentialId);

        const playlist = await this._service.getPlaylistById(id);
        return {
            status: 'success',
            data:{
                playlist,
            },
        };
    }

    async putToPlaylistByIdHandler(request){
        this._validator.validatePlaylistPayload(request.payload);
        const {id} = request.params;

        const {id: credentialId } = request.auth.credentials;
        await this._service.verifyPlaylistAccess(id,credentialId);

        await this._service.editPlaylistById(id, request.payload);

        return {
            status: 'success',
            message: 'Playlist berhasil diperbarui',
        };
    }

    async deleteFromPlaylistByIdHandler(request){
        const {id} = request.params;

        const {id: credentialId} = request.auth.credentials;
        await this._service.verifyPlaylistOwner(id,credentialId);

        await this._service.deletePlaylistById(id);

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus',
        };
    }


    // Playlist Song
    async postToPlaylistSongHandler(request,h){
        this._validator.validatePlaylistSongPayload(request.payload);
        const {songId} = request.payload;
        const {playlistId} = request.params;
        const {id: credentialId} = request.auth.credentials;
        await this._service.verifyPlaylistAccess(playlistId,credentialId);
        await this._service.addPlaylistSong(playlistId,songId);

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan ke playlist',
        });
        response.code(201);
        return response;

    }

    async getFromPlaylistSongsHandler(request){
        const {playlistId} = request.params;
        const {id: credentialId} = request.auth.credentials;
        
        await this._service.verifyPlaylistAccess(playlistId,credentialId);
        const songs = await this._service.getPlaylistSongs(playlistId);
        
        return {
            status: 'success',
            data:{
                songs,
            },
        };
    }

    async deleteFromPlaylistSongByIdHandler(request){
        const {playlistId} = request.params;
        const {songId} = request.payload;

        const {id: credentialId } = request.auth.credentials;
        await this._service.verifyPlaylistAccess(playlistId,credentialId);

        await this._service.deletePlaylistSongById(playlistId,songId);

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist',
        };
    }
}

module.exports = PlaylistsHandler;