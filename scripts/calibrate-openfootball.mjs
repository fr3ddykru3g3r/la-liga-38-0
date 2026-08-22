import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const sourceRoot=process.argv[2];
if(!sourceRoot)throw new Error('Usage: npm run calibrate -- /path/to/openfootball-espana');
const seasons=['2012-13','2013-14','2014-15','2015-16','2016-17','2017-18','2018-19','2019-20','2020-21','2021-22','2022-23','2023-24','2024-25','2025-26'];
let matches=0,homeGoals=0,awayGoals=0,homeWins=0,draws=0,awayWins=0;
const bySeason=[];
for(const season of seasons){
  const text=await readFile(join(sourceRoot,season,'1-liga.txt'),'utf8');
  const results=text.split('\n').flatMap(line=>{
    if(line.trimStart().startsWith('#'))return[];
    const match=line.replace(/\([^)]*\)/g,'').match(/\b(\d+)-(\d+)\b/);
    return match?[[Number(match[1]),Number(match[2])]]:[];
  });
  const row={season,matches:results.length,homeGoals:0,awayGoals:0,homeWins:0,draws:0,awayWins:0};
  for(const [home,away] of results){row.homeGoals+=home;row.awayGoals+=away;if(home>away)row.homeWins++;else if(home===away)row.draws++;else row.awayWins++;}
  matches+=row.matches;homeGoals+=row.homeGoals;awayGoals+=row.awayGoals;homeWins+=row.homeWins;draws+=row.draws;awayWins+=row.awayWins;bySeason.push(row);
}
const pct=n=>Number((100*n/matches).toFixed(2));
const output={
  generatedAt:new Date().toISOString(),
  source:{repository:'https://github.com/openfootball/espana',commit:'6ae1e0f1dcfedefcfd1513d9ec54b06a681612c9',license:'CC0-1.0'},
  coverage:{seasons:`${seasons[0]} through ${seasons.at(-1)}`,matches},
  targets:{goalsPerMatch:Number(((homeGoals+awayGoals)/matches).toFixed(3)),homeGoalsPerMatch:Number((homeGoals/matches).toFixed(3)),awayGoalsPerMatch:Number((awayGoals/matches).toFixed(3)),homeWinPct:pct(homeWins),drawPct:pct(draws),awayWinPct:pct(awayWins)},
  bySeason
};
await mkdir('data/calibration',{recursive:true});
await writeFile('data/calibration/openfootball-summary.json',`${JSON.stringify(output,null,2)}\n`);
console.log(JSON.stringify(output.targets));
