const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

const convertDbObjectToResponseObject3 = (dbObject) => {
  return {
    playerMatchId: dbObject.player_match_id,
    playerId: dbObject.player_id,
    matchId: dbObject.match_id,
    score: dbObject.score,
    fours: dbObject.fours,
    sixes: dbObject.sixes,
  };
};
//API 1
app.get("/players/", async (request, response) => {
  try {
    const getPlayersList = `
    SELECT
      *
    FROM
      player_details;`;
    const playersArray = await database.all(getPlayersList);
    response.send(
      playersArray.map((eachPlayer) =>
        convertDbObjectToResponseObject(eachPlayer)
      )
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
});
//API 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getAllPlayers = `
    SELECT 
    *
     FROM 
     player_details
     WHERE
     player_id=${playerId};`;
  const statesArray = await database.get(getAllPlayers);
  response.send(convertDbObjectToResponseObject(statesArray));
});
//API 3
app.put("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const districtDetails = request.body;
    const { playerName } = districtDetails;
    const updatePlayerQuery = `
  UPDATE
    player_details
  SET
   player_name='${playerName}'
  WHERE
     player_id=${playerId};`;
    await database.run(updatePlayerQuery);
    response.send("Player Details Updated");
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
});

//API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getAllPlayers = `
    SELECT 
    *
     FROM 
     match_details
     WHERE
     match_Id=${matchId};`;
  const statesArray = await database.get(getAllPlayers);
  response.send(convertDbObjectToResponseObject2(statesArray));
});
//API 5

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getAllPlayers = `
    SELECT 
    *
     FROM 
        player_match_score
        NATURAL JOIN match_details
     WHERE
     player_id=${playerId};`;
  const statesArray = await database.all(getAllPlayers);
  response.send(
    statesArray.map((eachmatch) => convertDbObjectToResponseObject2(eachmatch))
  );
});

//API 6

app.get("/matches/:matchId/players", async (request, response) => {
  try {
    const { matchId } = request.params;
    const getAllPlayers = `
    SELECT 
    *
     FROM 
      player_match_score NATURAL JOIN   player_details
     WHERE
     match_id=${matchId};`;
    const statesArray = await database.all(getAllPlayers);
    response.send(
      statesArray.map((eachmatch) => convertDbObjectToResponseObject(eachmatch))
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
});
//API 7
app.get("/players/:playerId/playerScores/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const getAllPlayers = `
   SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
    const statesArray = await database.get(getAllPlayers);
    response.send({
      playerId: statesArray["playerId"],
      playerName: statesArray["playerName"],
      totalScore: statesArray["totalScore"],
      totalFours: statesArray["totalFours"],
      totalSixes: statesArray["totalSixes"],
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
});
module.exports = app;
