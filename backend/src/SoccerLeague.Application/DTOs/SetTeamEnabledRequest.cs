namespace SoccerLeague.Application.DTOs;

public sealed record SetTeamEnabledRequest
{
    public required bool Enabled { get; init; }
}
