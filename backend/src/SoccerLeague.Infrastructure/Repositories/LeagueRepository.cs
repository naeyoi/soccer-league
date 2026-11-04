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

    public async Task<League?> GetByIdAsync(int id)
    {
        return await _context.Leagues
            .FirstOrDefaultAsync(league => league.Id == id);
    }

    public async Task<IEnumerable<League>> GetAllAsync()
    {
        return await _context.Leagues.ToListAsync();
    }

    public async Task AddAsync(League league)
    {
        await _context.Leagues.AddAsync(league);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(League league)
    {
        _context.Leagues.Update(league);
        await _context.SaveChangesAsync();
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
