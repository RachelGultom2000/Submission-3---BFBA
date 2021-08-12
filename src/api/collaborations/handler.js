class CollaborationsHandler {
    constructor(collaborationsService, playlistsService, validator){
        this._collaborationsService = collaborationsService;
        this._playlistsService = playlistsService;
        this._validator = validator;

        this.postToCollaborationHandler = this.postToCollaborationHandler.bind(this);
        this.deleteFromCollaborationHandler = this.deleteFromCollaborationHandler.bind(this);
    }
        async postToCollaborationHandler(request, h){
            this._validator.validateCollaborationPayload(request.payload);

            const {id: credentialId } = request.auth.credentials;
            const { playlistId, userId} = request.payload;

            await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
            const collaborationId = await this._collaborationsService.addToCollaboration(playlistId,userId);

            const response = h.response({
                status: 'success',
                message: 'Kolaborasi berhasil ditambahkan',
                data:{
                    collaborationId,
                },
            });
            response.code(201);
            return response;
        }

        async deleteFromCollaborationHandler(request){
            this._validator.validateCollaborationPayload(request.payload);
            const {id: credentialId} = request.auth.credentials;
            const {playlistId,userId} = request.payload;

            await this._playlistsService.verifyPlaylistOwner(playlistId,credentialId);
            await this._collaborationsService.deleteFromCollaboration(playlistId,userId);

            return {
                status: 'success',
                message: 'Kolaborasi berhasil dihapus',
            };
        }

    }

    module.exports = CollaborationsHandler;