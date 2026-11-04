using SoccerLeague.Application.DTOs;

namespace SoccerLeague.Application.Services;

public interface ILeagueService
{
    Task<IEnumerable<LeagueResponseDto>> GetAllLeaguesAsync();
    Task<LeagueResponseDto?> GetLeagueByIdAsync(int id);
    Task<int> CreateLeagueAsync(CreateLeagueDto createDto);
    Task UpdateLeagueAsync(UpdateLeagueDto updateDto);
    Task SetLeagueEnabledAsync(int id, bool enabled, CancellationToken cancellationToken);
    Task<bool> DeleteLeagueAsync(int id);
}
