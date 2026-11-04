using SoccerLeague.Application.DTOs;

namespace SoccerLeague.Application.Services;

public interface ITeamService
{
    Task<IEnumerable<TeamResponseDto>> GetAllTeamsAsync();
    Task<TeamResponseDto?> GetTeamByIdAsync(int id);
    Task<int> CreateTeamAsync(CreateTeamDto createDto);
    Task UpdateTeamAsync(UpdateTeamDto updateDto);
    Task SetTeamEnabledAsync(int id, bool enabled, CancellationToken cancellationToken);
    Task<bool> DeleteTeamAsync(int id);
}
