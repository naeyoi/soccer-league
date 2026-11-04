using FluentValidation;

using SoccerLeague.Application.DTOs;
using SoccerLeague.Domain.Entities;
using SoccerLeague.Domain.Interfaces;

namespace SoccerLeague.Application.Services;

public class LeagueService : ILeagueService
{
    private readonly ILeagueRepository _leagueRepository;
    private readonly ITeamRepository _teamRepository;
    private readonly IValidator<CreateLeagueDto> _createValidator;
    private readonly IValidator<UpdateLeagueDto> _updateValidator;

    public LeagueService(
        ILeagueRepository leagueRepository,
        ITeamRepository teamRepository,
        IValidator<CreateLeagueDto> createValidator,
        IValidator<UpdateLeagueDto> updateValidator)
    {
        _leagueRepository = leagueRepository;
        _teamRepository = teamRepository;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<IEnumerable<LeagueResponseDto>> GetAllLeaguesAsync()
    {
        var leagues = await _leagueRepository.GetAllAsync();
        return leagues.Select(ToResponseDto);
    }

    public async Task<LeagueResponseDto?> GetLeagueByIdAsync(int id)
    {
        var league = await _leagueRepository.GetByIdAsync(id);
        return league is null ? null : ToResponseDto(league);
    }

    public async Task<int> CreateLeagueAsync(CreateLeagueDto createDto)
    {
        var validationResult = await _createValidator.ValidateAsync(createDto);
        
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var teams = await GetTeamsAsync(createDto.TeamIds);
        var league = new League
        {
            Name = createDto.Name,
            Country = createDto.Country,
            StartDate = createDto.StartDate,
            EndDate = createDto.EndDate,
            Enabled = true,
            Teams = teams
        };

        await _leagueRepository.AddAsync(league);
        return league.Id;
    }

    public async Task UpdateLeagueAsync(UpdateLeagueDto updateDto)
    {
        var validationResult = await _updateValidator.ValidateAsync(updateDto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var league = await _leagueRepository.GetByIdAsync(updateDto.Id);
        if (league is null)
        {
            throw new KeyNotFoundException($"La liga con ID {updateDto.Id} no existe.");
        }

        var teams = updateDto.TeamIds is null
            ? league.Teams.ToList()
            : await GetTeamsAsync(updateDto.TeamIds);
        league.Name = updateDto.Name;
        league.Country = updateDto.Country;
        league.StartDate = updateDto.StartDate;
        league.EndDate = updateDto.EndDate;
        league.Enabled = updateDto.Enabled;
        league.Teams = teams;

        await _leagueRepository.UpdateAsync(league);
    }

    public async Task SetLeagueEnabledAsync(int id, bool enabled, CancellationToken cancellationToken)
    {
        var league = await _leagueRepository.GetByIdAsync(id, cancellationToken);
        if (league is null)
        {
            throw new KeyNotFoundException($"La liga con ID {id} no existe.");
        }

        league.Enabled = enabled;
        await _leagueRepository.UpdateAsync(league, cancellationToken);
    }

    public Task<bool> DeleteLeagueAsync(int id)
    {
        return _leagueRepository.DeleteAsync(id);
    }

    private static LeagueResponseDto ToResponseDto(League league)
    {
        return new LeagueResponseDto(
            league.Id,
            league.Name,
            league.Country,
            league.StartDate,
            league.EndDate,
            league.Enabled,
            league.Teams.Select(team => team.Id).ToArray());
    }

    private async Task<List<Team>> GetTeamsAsync(IReadOnlyCollection<int>? teamIds)
    {
        var distinctTeamIds = (teamIds ?? Array.Empty<int>()).Distinct().ToArray();
        var teams = await _teamRepository.GetByIdsAsync(distinctTeamIds);
        if (teams.Count != distinctTeamIds.Length)
        {
            throw new KeyNotFoundException("Uno o más equipos seleccionados no existen.");
        }

        return teams.ToList();
    }
}
