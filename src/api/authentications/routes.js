const routes = (handler) => [
    {
      method: 'POST',
      path: '/authentications',
      handler: handler.postToAuthenticationHandler,
    },
    {
      method: 'PUT',
      path: '/authentications',
      handler: handler.putToAuthenticationHandler,
    },
    {
      method: 'DELETE',
      path: '/authentications',
      handler: handler.deleteFromAuthenticationHandler,
    },
  ];
   
  module.exports = routes;