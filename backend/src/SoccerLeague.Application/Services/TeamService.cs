using FluentValidation;

using SoccerLeague.Domain.Entities;
using SoccerLeague.Domain.Interfaces;
using SoccerLeague.Application.DTOs;

namespace SoccerLeague.Application.Services;

public class TeamService : ITeamService
{
    private readonly ITeamRepository _teamRepository;
    private readonly IValidator<CreateTeamDto> _createValidator;
    private readonly IValidator<UpdateTeamDto> _updateValidator;

    public TeamService(ITeamRepository teamRepository, IValidator<CreateTeamDto> createValidator, IValidator<UpdateTeamDto> updateValidator)
    {
        _teamRepository = teamRepository;
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
            t.Enabled
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
            team.Enabled
        );
    }

    public async Task<int> CreateTeamAsync(CreateTeamDto createDto)
    {
        var validationResult = await _createValidator.ValidateAsync(createDto);
        
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var team = new Team
        {
            Name = createDto.Name,
            Country = createDto.Country,
            PlayersQuantity = createDto.PlayersQuantity,
            Enabled = true
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

        existingTeam.Name = updateDto.Name;
        existingTeam.Country = updateDto.Country;
        existingTeam.PlayersQuantity = updateDto.PlayersQuantity;
        existingTeam.Enabled = updateDto.Enabled;

        await _teamRepository.UpdateAsync(existingTeam);
    }

    public async Task<bool> DeleteTeamAsync(int id)
    {
        return await _teamRepository.DeleteAsync(id);
    }
}
