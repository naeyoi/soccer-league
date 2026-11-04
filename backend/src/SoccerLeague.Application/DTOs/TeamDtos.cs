namespace SoccerLeague.Application.DTOs;

public record TeamResponseDto(int Id, string Name, string Country, int PlayersQuantity, bool Enabled);

public record CreateTeamDto(string Name, string Country, int PlayersQuantity);

public record UpdateTeamDto(int Id, string Name, string Country, int PlayersQuantity, bool Enabled);
