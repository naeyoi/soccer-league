namespace SoccerLeague.Application.DTOs;

public record LeagueResponseDto(int Id, string Name, string Country, DateTime StartDate, DateTime EndDate, bool Enabled);

public record CreateLeagueDto(string Name, string Country, DateTime StartDate, DateTime EndDate);

public record UpdateLeagueDto(int Id, string Name, string Country, DateTime StartDate, DateTime EndDate, bool Enabled);
