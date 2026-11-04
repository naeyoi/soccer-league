using FluentValidation;

using SoccerLeague.Application.DTOs;
using SoccerLeague.Domain.Entities;
using SoccerLeague.Domain.Interfaces;

namespace SoccerLeague.Application.Services;

public class LeagueService : ILeagueService
{
    private readonly ILeagueRepository _leagueRepository;
    private readonly IValidator<CreateLeagueDto> _createValidator;
    private readonly IValidator<UpdateLeagueDto> _updateValidator;

    public LeagueService(
        ILeagueRepository leagueRepository,
        IValidator<CreateLeagueDto> createValidator,
        IValidator<UpdateLeagueDto> updateValidator)
    {
        _leagueRepository = leagueRepository;
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

        var league = new League
        {
            Name = createDto.Name,
            Country = createDto.Country,
            StartDate = createDto.StartDate,
            EndDate = createDto.EndDate,
            Enabled = true
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

        league.Name = updateDto.Name;
        league.Country = updateDto.Country;
        league.StartDate = updateDto.StartDate;
        league.EndDate = updateDto.EndDate;
        league.Enabled = updateDto.Enabled;

        await _leagueRepository.UpdateAsync(league);
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
            league.Enabled);
    }
}
