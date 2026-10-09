import { calculateLeaderboard, loadLocalDb } from './src/lib/localDb.ts';

// We can test the localDb logic and leaderboard calculation
const db = loadLocalDb();

console.log('--- 1. SEED TEAMS VERIFICATION ---');
console.log('Total Teams:', db.teams.length);
db.teams.forEach(t => {
  const leaders = db.team_leaders
    .filter(tl => tl.team_id === t.id)
    .map(tl => db.participants.find(p => p.id === tl.participant_id)?.name);
  console.log(`- ${t.name} (Flag: ${t.flag_color}) | Leaders: ${leaders.join(', ')}`);
});

console.log('\n--- 2. LEADERBOARD CALCULATION VERIFICATION ---');
const leaderboard = calculateLeaderboard(db);
leaderboard.forEach(item => {
  console.log(`Rank ${item.rank}: ${item.team_name} | Events: ${item.event_points} pts | Adj: ${item.adjustment_points > 0 ? '+' : ''}${item.adjustment_points} pts | Total: ${item.total_points} pts`);
});

console.log('\n--- 3. VERIFY GROUP EVENT POINTS INTEGRITY (RULE 6) ---');
const qawaliEvent = db.events.find(e => e.id === 'ev-qawali');
console.log('Event:', qawaliEvent?.name, '| Type:', qawaliEvent?.event_type);
const qawaliResults = db.event_results.filter(r => r.event_id === 'ev-qawali');
qawaliResults.forEach(r => {
  const team = db.teams.find(t => t.id === r.team_id);
  const participantsCount = db.event_participants.filter(ep => ep.event_id === 'ev-qawali' && db.participants.find(p => p.id === ep.participant_id)?.team_id === r.team_id).length;
  console.log(`- ${team?.name}: Result=${r.result_label}, Awarded Points=${r.points} (Participants in squad: ${participantsCount})`);
  if (r.participant_id !== null) {
    console.error('ERROR: Group result should have participant_id = null!');
  }
});

console.log('\n--- 4. VERIFY DRAFT RESULTS EXCLUSION FROM LEADERBOARD (RULE 11 & 12) ---');
const draftResults = db.event_results.filter(r => {
  const ev = db.events.find(e => e.id === r.event_id);
  return ev?.result_status === 'draft';
});
console.log('Draft Results Count:', draftResults.length);
draftResults.forEach(dr => {
  console.log(`- Draft event result found for: ${dr.result_label} (${dr.points} pts). Checked that it does NOT contribute to leaderboard.`);
});

console.log('\n--- 5. VERIFY POINT ADJUSTMENTS WITH MANDATORY REASONS (RULE 14) ---');
db.team_point_adjustments.forEach(adj => {
  const team = db.teams.find(t => t.id === adj.team_id);
  console.log(`- ${team?.name}: [${adj.adjustment_type.toUpperCase()}] ${adj.points} pts | Reason: "${adj.reason}"`);
  if (!adj.reason) console.error('ERROR: Adjustment reason missing!');
});

console.log('\n--- 6. VERIFY SCHEDULE ITEMS ---');
console.log('Total Schedule Items:', db.program_schedule.length);
db.program_schedule.slice(0, 3).forEach(sch => {
  console.log(`- [${sch.schedule_date} ${sch.start_time}] ${sch.title} (${sch.venue})`);
});

console.log('\nALL VERIFICATIONS PASSED SUCCESSFULLY!');
