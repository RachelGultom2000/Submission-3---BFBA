const routes = (handler) => [
    {
        method: 'POST',
        path: '/exports/playlists/{playlistId}',
        handler: handler.postToExportPlaylistHandler,
        options: {
            auth: 'playlistsapp_jwt',
        },
    },
];

module.exports = routes;