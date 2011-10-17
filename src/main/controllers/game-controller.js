/**
 * game-controller.js
 *
 * Controller responsible for handling the games and gamestates.
 */

module.exports = function(app) {
  var GameController = {
    games: {},
    get: function (req, res) {
      var gameId = req.params.gameId,
          gamestate = GameController.games[gameId];                    
      
      // With each GET make sure the player has checked in their time
      if (req.query) {
          for (var i = 0; i < gamestate.players.length; i++) {
              if (gamestate.players[i].name === req.query.player) {
                  gamestate.players[i].timeOut = (new Date).getTime();
              }
          }
      }
      
      res.contentType('application/json');
      res.send(JSON.stringify(gamestate));
    },
    post: function (req, res) {
      var gameId = req.params.gameId,
          gamestate = req.body;
      GameController.games[gameId] = gamestate;
      console.log(GameController.games);
      res.send({"success": true});
    }
  },
  
  // Server function that checks the last check-in timestamps on
  // players in games to see if they've disconnected (every 10s)
  trimDisconnects = function () {
    for (var game in GameController.games) {
      for (var j = 0; j < GameController.games[game].players.length; j++) {
        // If the difference between the server time and the player's last
        // checkin is greater than 10.5 seconds (a little more than 2 ajax calls)
        // then chuck them, as they've left the game
        if (Math.abs(GameController.games[game].players[j].timeOut - (new Date).getTime()) > 10500) {
          GameController.games[game].players.splice(j, 1);
          // If there are no more players left in the game, delete it
          if (GameController.games[game].players.length === 0) {
              delete GameController.games.game;
          }
        }
      }
    }
  };
  
  app.post('/gamestate/:gameId', GameController.post);
  app.get('/gamestate/:gameId', GameController.get);
  
  setInterval(trimDisconnects, 10000);
}