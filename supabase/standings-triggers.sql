-- Standings auto-rebuild for Sportchain Padel
-- Run this in Supabase SQL editor (Database -> SQL).
--
-- Assumptions about schema:
-- - public.matches has: id, tournament_id, team1_id, team2_id, team1_games, team2_games,
--   winner_team_id, finished (boolean), updated_at
-- - public.teams has: id, tournament_id
-- - public.standings exists as provided (unique (tournament_id, team_id))

create or replace function public.rebuild_standings_for_tournament(p_tournament_id bigint)
returns void
language plpgsql
as $$
begin
  -- 1) Base stats (points, W/L, games) from finished matches.
  with finished_matches as (
    select
      m.tournament_id,
      m.team1_id,
      m.team2_id,
      m.team1_games,
      m.team2_games,
      m.winner_team_id,
      case
        when m.winner_team_id is not null then m.winner_team_id
        when m.team1_games > m.team2_games then m.team1_id
        when m.team2_games > m.team1_games then m.team2_id
        else null
      end as derived_winner_team_id
    from public.matches m
    where
      m.tournament_id = p_tournament_id
      and m.finished is true
      and m.team1_id is not null
      and m.team2_id is not null
  ),
  per_team as (
    select
      t.id as team_id,
      p_tournament_id as tournament_id,
      -- matches played (finished only)
      coalesce(sum(
        case
          when fm.team1_id = t.id or fm.team2_id = t.id then 1
          else 0
        end
      ), 0)::int as matches_played,
      coalesce(sum(
        case
          when fm.derived_winner_team_id = t.id then 1
          else 0
        end
      ), 0)::int as matches_won,
      coalesce(sum(
        case
          when (fm.team1_id = t.id or fm.team2_id = t.id)
               and fm.derived_winner_team_id is not null
               and fm.derived_winner_team_id <> t.id then 1
          else 0
        end
      ), 0)::int as matches_lost,
      coalesce(sum(
        case
          when fm.team1_id = t.id then fm.team1_games
          when fm.team2_id = t.id then fm.team2_games
          else 0
        end
      ), 0)::int as games_won,
      coalesce(sum(
        case
          when fm.team1_id = t.id then fm.team2_games
          when fm.team2_id = t.id then fm.team1_games
          else 0
        end
      ), 0)::int as games_lost
    from public.teams t
    left join finished_matches fm
      on (fm.team1_id = t.id or fm.team2_id = t.id)
    where t.tournament_id = p_tournament_id
    group by t.id
  )
  insert into public.standings (
    tournament_id,
    team_id,
    points,
    matches_played,
    matches_won,
    matches_lost,
    games_won,
    games_lost,
    games_difference,
    buchholz,
    created_at,
    updated_at
  )
  select
    pt.tournament_id,
    pt.team_id,
    (pt.matches_won::numeric(5,2)) as points, -- 1 point per win
    pt.matches_played,
    pt.matches_won,
    pt.matches_lost,
    pt.games_won,
    pt.games_lost,
    (pt.games_won - pt.games_lost)::int as games_difference,
    0::int as buchholz,
    now(),
    now()
  from per_team pt
  on conflict (tournament_id, team_id)
  do update set
    points = excluded.points,
    matches_played = excluded.matches_played,
    matches_won = excluded.matches_won,
    matches_lost = excluded.matches_lost,
    games_won = excluded.games_won,
    games_lost = excluded.games_lost,
    games_difference = excluded.games_difference,
    updated_at = now();

  -- 2) Buchholz tie-break: sum of opponents' points (after base update).
  -- Opponents = teams you played in finished matches.
  with finished_pairs as (
    select
      m.team1_id as a,
      m.team2_id as b
    from public.matches m
    where
      m.tournament_id = p_tournament_id
      and m.finished is true
      and m.team1_id is not null
      and m.team2_id is not null
  ),
  opponent_edges as (
    select a as team_id, b as opponent_id from finished_pairs
    union all
    select b as team_id, a as opponent_id from finished_pairs
  ),
  buchholz_by_team as (
    select
      oe.team_id,
      coalesce(sum(s.points), 0)::int as buchholz
    from opponent_edges oe
    join public.standings s
      on s.tournament_id = p_tournament_id
      and s.team_id = oe.opponent_id
    group by oe.team_id
  )
  update public.standings st
  set
    buchholz = coalesce(b.buchholz, 0),
    updated_at = now()
  from buchholz_by_team b
  where st.tournament_id = p_tournament_id
    and st.team_id = b.team_id;

  -- Ensure teams with no finished matches still have buchholz=0 (and exist).
  update public.standings st
  set
    buchholz = 0,
    updated_at = now()
  where st.tournament_id = p_tournament_id
    and st.buchholz is null;
end;
$$;

create or replace function public.trg_matches_rebuild_standings()
returns trigger
language plpgsql
as $$
declare
  tid bigint;
begin
  if (tg_op = 'DELETE') then
    tid := old.tournament_id;
    perform public.rebuild_standings_for_tournament(tid);
    return old;
  end if;

  -- INSERT or UPDATE
  tid := new.tournament_id;

  -- Rebuild if:
  -- - finished toggles
  -- - scores change
  -- - teams change
  -- - winner changes
  if (tg_op = 'INSERT') then
    perform public.rebuild_standings_for_tournament(tid);
    return new;
  end if;

  if (
    new.finished is distinct from old.finished
    or new.team1_id is distinct from old.team1_id
    or new.team2_id is distinct from old.team2_id
    or new.team1_games is distinct from old.team1_games
    or new.team2_games is distinct from old.team2_games
    or new.winner_team_id is distinct from old.winner_team_id
  ) then
    perform public.rebuild_standings_for_tournament(tid);
    if (old.tournament_id is distinct from new.tournament_id) then
      perform public.rebuild_standings_for_tournament(old.tournament_id);
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists matches_rebuild_standings on public.matches;
create trigger matches_rebuild_standings
after insert or update or delete on public.matches
for each row execute function public.trg_matches_rebuild_standings();

