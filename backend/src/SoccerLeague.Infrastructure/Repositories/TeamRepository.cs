using Microsoft.EntityFrameworkCore;
using SoccerLeague.Domain.Entities;
using SoccerLeague.Domain.Interfaces;
using SoccerLeague.Infrastructure.Context;

namespace SoccerLeague.Infrastructure.Repositories;

public class TeamRepository : ITeamRepository
{
    private readonly AppDbContext _context;

    public TeamRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Team?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Teams
            .Include(t => t.Leagues)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Team>> GetByIdsAsync(
        IReadOnlyCollection<int> ids,
        CancellationToken cancellationToken = default)
    {
        return await _context.Teams
            .Where(team => ids.Contains(team.Id))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Team>> GetAllAsync()
    {
        return await _context.Teams
            .Include(team => team.Leagues)
            .ToListAsync();
    }

    public async Task AddAsync(Team team)
    {
        await _context.Teams.AddAsync(team);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Team team, CancellationToken cancellationToken = default)
    {
        _context.Teams.Update(team);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var team = await _context.Teams.FindAsync(id);
        if (team is null)
        {
            return false;
        }

        _context.Teams.Remove(team);
        await _context.SaveChangesAsync();
        return true;
    }
}
