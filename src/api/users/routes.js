const routes = (handler) => [
    {
        method : 'POST',
        path: '/users',
        handler: handler.postToUserHandler,
    },
    {
        method: 'GET',
        path: '/users/{id}',
        handler: handler.getFromUserByIdHandler,
    },
];

module.exports = routes;