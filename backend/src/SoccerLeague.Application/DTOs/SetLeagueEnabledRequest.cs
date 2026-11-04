namespace SoccerLeague.Application.DTOs;

public sealed record SetLeagueEnabledRequest
{
    public required bool Enabled { get; init; }
}
