const InvariantError = require('../../exceptions/InvariantError');
const {PlaylistPayloadSchema, PlaylistSongPayloadSchema} = require('./schema');

const PlaylistsValidator = {
    validatePlaylistPayload: (payload) => {
        const playlistvalidationResult = PlaylistPayloadSchema.validate(payload);
        if(playlistvalidationResult.error){
            throw new InvariantError(playlistvalidationResult.error.message);
        }
    },

    validatePlaylistSongPayload: (payload) => {
        const playlistsongvalidationResult = PlaylistSongPayloadSchema.validate(payload);
        if(playlistsongvalidationResult.error){
            throw new InvariantError(playlistsongvalidationResult.error.message);
        }
    },
};

module.exports = PlaylistsValidator;