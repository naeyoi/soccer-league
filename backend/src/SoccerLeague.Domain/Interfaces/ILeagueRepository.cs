using SoccerLeague.Domain.Entities;

namespace SoccerLeague.Domain.Interfaces;

public interface ILeagueRepository
{
    Task<League?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<League>> GetByIdsAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default);
    Task<IEnumerable<League>> GetAllAsync();
    Task AddAsync(League league);
    Task UpdateAsync(League league, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id);
}
