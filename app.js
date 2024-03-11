const express = require('express')

const path = require('path')

const {open} = require('sqlite')

const sqlite3 = require('sqlite3')
const app = express()

app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initialzeDataBaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3020, () => {
      console.log('sever is running')
    })
  } catch (e) {
    console.log(`DataBase Error: ${e.message}`)
    process.exit(1)
  }
}

initialzeDataBaseAndServer()

const covertDbOjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `SELECT 
  *
  FROM
  cricket_team
  ORDER BY 
  player_id;
  `
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => covertDbOjectToResponseObject(eachPlayer)),
  )
})
app.post('/players/', async (request, response) => {
  const playerDetails = request.body

  const {player_id, player_name, jersey_number, role} = playerDetails

  const addPlayerQuery = `
  INSERT INTO 
  cricket_team 
  (player_id, player_name, jersey_number, role)
  VALUES 
  (${player_id},"${player_name}",${jersey_number},"${role}");`

  await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

app.get(`/players/:playerId/`, async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `SELECT 
  *
  FROM
  cricket_team
  WHERE player_id = ${playerId};
  `
  const player = await db.get(getPlayerQuery)
  response.send(covertDbOjectToResponseObject(player))
})

app.put(`/players/:playerId/`, async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {player_id, player_name, jersey_number, role} = playerDetails

  const updatePlayerQuery = `
    UPDATE 
    cricket_team
    SET 
    player_id = ${player_id},
    player_name = "${player_name}",
    jersey_number = ${jersey_number},
    role = "${role}"
    WHERE 
    player_id = ${playerId};`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
     DELETE FROM
     cricket_team
     WHERE player_id = ${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
