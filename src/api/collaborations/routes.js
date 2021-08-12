const routes = (handler) => [
    {
        method: 'POST',
        path: '/collaborations',
        handler: handler.postToCollaborationHandler,
        options:{
            auth: 'playlistsapp_jwt'
        },
    },
    {
        method: 'DELETE',
        path: '/collaborations',
        handler: handler.deleteFromCollaborationHandler,
        options: {
            auth: 'playlistsapp_jwt'
        },
    },
];

module.exports = routes;