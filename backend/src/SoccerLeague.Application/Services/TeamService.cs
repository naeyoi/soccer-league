using FluentValidation;

using SoccerLeague.Domain.Entities;
using SoccerLeague.Domain.Interfaces;
using SoccerLeague.Application.DTOs;

namespace SoccerLeague.Application.Services;

public class TeamService : ITeamService
{
    private readonly ITeamRepository _teamRepository;
    private readonly ILeagueRepository _leagueRepository;
    private readonly IValidator<CreateTeamDto> _createValidator;
    private readonly IValidator<UpdateTeamDto> _updateValidator;

    public TeamService(
        ITeamRepository teamRepository,
        ILeagueRepository leagueRepository,
        IValidator<CreateTeamDto> createValidator,
        IValidator<UpdateTeamDto> updateValidator)
    {
        _teamRepository = teamRepository;
        _leagueRepository = leagueRepository;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<IEnumerable<TeamResponseDto>> GetAllTeamsAsync()
    {
        var teams = await _teamRepository.GetAllAsync();

        return teams.Select(t => new TeamResponseDto(
            t.Id,
            t.Name,
            t.Country,
            t.PlayersQuantity,
            t.Enabled,
            t.Leagues.Select(league => league.Id).ToArray()
        ));
    }

    public async Task<TeamResponseDto?> GetTeamByIdAsync(int id)
    {
        var team = await _teamRepository.GetByIdAsync(id);
        if (team == null) return null;

        return new TeamResponseDto(
            team.Id,
            team.Name,
            team.Country,
            team.PlayersQuantity,
            team.Enabled,
            team.Leagues.Select(league => league.Id).ToArray()
        );
    }

    public async Task<int> CreateTeamAsync(CreateTeamDto createDto)
    {
        var validationResult = await _createValidator.ValidateAsync(createDto);
        
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var leagues = await GetLeaguesAsync(createDto.LeagueIds);
        var team = new Team
        {
            Name = createDto.Name,
            Country = createDto.Country,
            PlayersQuantity = createDto.PlayersQuantity,
            Enabled = true,
            Leagues = leagues
        };

        await _teamRepository.AddAsync(team);
        return team.Id;
    }

    public async Task UpdateTeamAsync(UpdateTeamDto updateDto)
    {
        var validationResult = await _updateValidator.ValidateAsync(updateDto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }
        
        var existingTeam = await _teamRepository.GetByIdAsync(updateDto.Id);
        if (existingTeam == null)
        {
            throw new KeyNotFoundException($"El equipo con ID {updateDto.Id} no existe.");
        }

        var leagues = updateDto.LeagueIds is null
            ? existingTeam.Leagues.ToList()
            : await GetLeaguesAsync(updateDto.LeagueIds);
        existingTeam.Name = updateDto.Name;
        existingTeam.Country = updateDto.Country;
        existingTeam.PlayersQuantity = updateDto.PlayersQuantity;
        existingTeam.Enabled = updateDto.Enabled;
        existingTeam.Leagues = leagues;

        await _teamRepository.UpdateAsync(existingTeam);
    }

    public async Task SetTeamEnabledAsync(int id, bool enabled, CancellationToken cancellationToken)
    {
        var team = await _teamRepository.GetByIdAsync(id, cancellationToken);
        if (team is null)
        {
            throw new KeyNotFoundException($"El equipo con ID {id} no existe.");
        }

        team.Enabled = enabled;
        await _teamRepository.UpdateAsync(team, cancellationToken);
    }

    private async Task<List<League>> GetLeaguesAsync(IReadOnlyCollection<int>? leagueIds)
    {
        var distinctLeagueIds = (leagueIds ?? Array.Empty<int>()).Distinct().ToArray();
        var leagues = await _leagueRepository.GetByIdsAsync(distinctLeagueIds);
        if (leagues.Count != distinctLeagueIds.Length)
        {
            throw new KeyNotFoundException("Una o más ligas seleccionadas no existen.");
        }

        return leagues.ToList();
    }

    public async Task<bool> DeleteTeamAsync(int id)
    {
        return await _teamRepository.DeleteAsync(id);
    }
}
