using SoccerLeague.Domain.Entities;

namespace SoccerLeague.Domain.Interfaces;

public interface ITeamRepository
{
    Task<Team?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Team>> GetByIdsAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default);
    Task<IEnumerable<Team>> GetAllAsync();
    Task AddAsync(Team team);
    Task UpdateAsync(Team team, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id);
}
