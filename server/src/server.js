const http = require('http');
const { Server } = require('socket.io');
const mongoLoader = require('./loaders/mongoLoader');
const passportLoader = require('./loaders/passportLoader');
const errorResponseMiddleware = require('./middlewares/errorResponseMiddleware');
const routerLoader = require('./loaders/routerLoader');
const app = require('./app');

const ScuntLeaderboardSocketManger = require('./websockets/ScuntLeaderboardSocketManager');
const LeaderboardSubscription = require('./subscribers/leaderboardSubscriber');
const SettingsSubscription = require('./subscribers/scuntGameSettingsSubscription');

mongoLoader(app).then(async () => {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
  });
  passportLoader(app);
  routerLoader(app);
  app.use(errorResponseMiddleware);

  const scuntLeaderboardManager = new ScuntLeaderboardSocketManger(io.of('/leaderboard'));

  await scuntLeaderboardManager.initSettings();

  scuntLeaderboardManager.listenToScores(LeaderboardSubscription);
  scuntLeaderboardManager.listenToSettings(SettingsSubscription);

  server.listen(process.env.PORT || 5001, () => {
    console.log(`Server is running on: ${process.env.API_BASE_URL}`);
  });
});
