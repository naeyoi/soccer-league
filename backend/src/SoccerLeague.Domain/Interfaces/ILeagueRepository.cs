using SoccerLeague.Domain.Entities;

namespace SoccerLeague.Domain.Interfaces;

public interface ILeagueRepository
{
    Task<League?> GetByIdAsync(int id);
    Task<IEnumerable<League>> GetAllAsync();
    Task AddAsync(League league);
    Task UpdateAsync(League league);
    Task<bool> DeleteAsync(int id);
}
