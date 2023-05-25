import { prisma } from "@/db"

async function getTeams() {
  return await prisma.team.findMany({
    include: {
      Standings: {
        select: {
          points: true
        },
        orderBy: {
          points: 'desc'
        }
      }
    },
  })
}

async function getMatches() {
  const partidas = await prisma.match.findMany()
  const times = await prisma.team.findMany()

  const todasAsPartidas = partidas.map(partida => {
    const casaTime = times.find(time => time.id === partida.homeTeamId);
    const visitaTime = times.find(time => time.id === partida.awayTeamId);
    
    return {
      id: partida.id,
      casaName: casaTime?.name,
      visitanteName: visitaTime?.name,
      golsCasa: partida.homeGoals,
      golsFora: partida.awayGoals
    };
  });
  console.log("=====>", todasAsPartidas)

  return todasAsPartidas;
}

async function getPlayerStats() {
  return await prisma.playerStats.findMany({
    include: {
      player: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      goals: 'desc'
    }
  })
}

export default async function Home() {
  const teams = await getTeams()
  const playerStats = await getPlayerStats()
  const matches = await getMatches()

  return (
    <>
      <h1>Classificação</h1>
      <h6>{JSON.stringify(matches, null, 3)}</h6>
      <ul className="p-4">
        {teams.map(team => (
          <li key={team.id}>{team.name} {team.Standings[0].points}</li>
        ))}
      </ul>
      <hr></hr>
      <h1>Partidas</h1>
      <ul className="p-4">
        {matches?.map(match => (
          <li key={match.id}>{match.casaName} {match.golsCasa} x {match.golsFora} {match.visitanteName}</li>
        ))}
      </ul>
      <hr></hr>
      <h1>Artilharia</h1>
      <ul className="p-4">
        {playerStats.map(playerStat => (
          <li key={playerStat.id}>{playerStat.player.name}: {playerStat.goals}</li>
        ))}
      </ul>
      <hr></hr>
    </>
  )
}
