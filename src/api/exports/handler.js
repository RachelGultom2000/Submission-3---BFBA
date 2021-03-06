const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
    constructor(service, playlistService, validator){
        this._service = service;
        this._playlistService = playlistService;
        this._validator = validator;

        this.postToExportPlaylistHandler = this.postToExportPlaylistHandler.bind(this);
    }
        async postToExportPlaylistHandler(request ,h){
            try{
                const { playlistId } = request.params;
                const { id: credentialId } = request.auth.credentials;
                await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);

                this._validator.validateExportPlaylistPayload(request.payload);
                const messageExport = {
                    playlistId,
                    targetEmail: request.payload.targetEmail,
                };

                await this._service.sendMessage('export: playlist', JSON.stringify(messageExport));

                const response = h.response({
                    status: 'success',
                    message: 'Permintaan Anda sedang kami proses',
                });

                response.code(201);
                return response;
            }catch(error){
                if(error instanceof ClientError){
                    const response = h.response({
                        status: 'fail',
                        message: error.message,
                    });
                    response.code(error.statusCode);
                    return response;
                }
                    // SERVER ERROR
                    const response = h.response({
                        status: 'error',
                        message: 'Maaf,terjadi kegagalan pada server kami',
                    });
                    response.code(500);
                    console.error(error);
                    return response;
                }
            }
        }

module.exports = ExportsHandler;