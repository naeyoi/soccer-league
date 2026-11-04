namespace SoccerLeague.Application.DTOs;

public record LeagueResponseDto(int Id, string Name, string Country, DateTime StartDate, DateTime EndDate, bool Enabled, IReadOnlyCollection<int> TeamIds);

public record CreateLeagueDto(string Name, string Country, DateTime StartDate, DateTime EndDate, IReadOnlyCollection<int>? TeamIds = null);

public record UpdateLeagueDto(int Id, string Name, string Country, DateTime StartDate, DateTime EndDate, bool Enabled, IReadOnlyCollection<int>? TeamIds = null);
