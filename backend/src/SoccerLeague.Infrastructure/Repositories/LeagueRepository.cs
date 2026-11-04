using Microsoft.EntityFrameworkCore;
using SoccerLeague.Domain.Entities;
using SoccerLeague.Domain.Interfaces;
using SoccerLeague.Infrastructure.Context;

namespace SoccerLeague.Infrastructure.Repositories;

public class LeagueRepository : ILeagueRepository
{
    private readonly AppDbContext _context;

    public LeagueRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<League?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Leagues
            .Include(league => league.Teams)
            .FirstOrDefaultAsync(league => league.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<League>> GetByIdsAsync(
        IReadOnlyCollection<int> ids,
        CancellationToken cancellationToken = default)
    {
        return await _context.Leagues
            .Where(league => ids.Contains(league.Id))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<League>> GetAllAsync()
    {
        return await _context.Leagues
            .Include(league => league.Teams)
            .ToListAsync();
    }

    public async Task AddAsync(League league)
    {
        await _context.Leagues.AddAsync(league);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(League league, CancellationToken cancellationToken = default)
    {
        _context.Leagues.Update(league);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var league = await _context.Leagues.FindAsync(id);
        if (league is null)
        {
            return false;
        }

        _context.Leagues.Remove(league);
        await _context.SaveChangesAsync();
        return true;
    }
}
