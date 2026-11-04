namespace SoccerLeague.Application.DTOs;

public record TeamResponseDto(int Id, string Name, string Country, int PlayersQuantity, bool Enabled, IReadOnlyCollection<int> LeagueIds);

public record CreateTeamDto(string Name, string Country, int PlayersQuantity, IReadOnlyCollection<int>? LeagueIds = null);

public record UpdateTeamDto(int Id, string Name, string Country, int PlayersQuantity, bool Enabled, IReadOnlyCollection<int>? LeagueIds = null);
