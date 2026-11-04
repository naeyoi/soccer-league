using SoccerLeague.Domain.Entities;

namespace SoccerLeague.Domain.Interfaces;

public interface ITeamRepository
{
    Task<Team?> GetByIdAsync(int id);
    Task<IEnumerable<Team>> GetAllAsync();
    Task AddAsync(Team team);
    Task UpdateAsync(Team team);
    Task<bool> DeleteAsync(int id);
}
