This project now includes a Socket.io-based notification system.

How it works

- The server initializes Socket.io in `server/index.js` and attaches it to the Express app via `app.set('io', io)`. Routes can emit events using `req.app.get('io')`.
- New notifications are persisted in `server/models/Notification.js` and can be created via POST `/api/notifications` or via existing sync endpoints.
- When a notification is created, a `notification:created` event is emitted to connected Socket.io clients.

Dependencies

- socket.io (server) — added to `server/package.json`.
- client uses `socket.io-client` (already bundled with app? If not, install it in `client/`):
  npm install socket.io-client

Running

1. Install server deps:
   cd server; npm install
2. Start server:
   npm run dev

Client

- The web client will connect to the same origin's Socket.io endpoint by default. No extra config required if served separately in development mode with the proxy set up in client/package.json.

Notes

- If you'd like server-to-specific-user events, extend the socket connection to authenticate and join rooms based on userId.
- For large-scale deployments, consider namespacing events and rate-limiting notification emissions.
