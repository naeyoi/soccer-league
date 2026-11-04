using Microsoft.AspNetCore.Mvc;
using SoccerLeague.Application.DTOs;
using SoccerLeague.Application.Services;

namespace SoccerLeague.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamsController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamResponseDto>>> GetAll()
    {
        var teams = await _teamService.GetAllTeamsAsync();
        return Ok(teams);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TeamResponseDto>> GetById(int id)
    {
        var team = await _teamService.GetTeamByIdAsync(id);
        if (team == null)
        {
            return NotFound(new { message = $"El equipo con ID {id} no fue encontrado." });
        }

        return Ok(team);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create([FromBody] CreateTeamDto createDto)
    {
        try
        {
            var teamId = await _teamService.CreateTeamAsync(createDto);
            return CreatedAtAction(nameof(GetById), new { id = teamId }, new { id = teamId });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Una o más ligas seleccionadas no existen." });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTeamDto updateDto)
    {
        if (id != updateDto.Id)
        {
            return BadRequest("El ID de la ruta no coincide con el ID del objeto enviado.");
        }

        try
        {
            await _teamService.UpdateTeamAsync(updateDto);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"El equipo con ID {id} o una de las ligas seleccionadas no existe." });
        }

        return NoContent();
    }

    [HttpPatch("{id:int}/enabled")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetEnabled(
        int id,
        [FromBody] SetTeamEnabledRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            await _teamService.SetTeamEnabledAsync(id, request.Enabled, cancellationToken);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"El equipo con ID {id} no fue encontrado." });
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _teamService.DeleteTeamAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = $"El equipo con ID {id} no fue encontrado." });
        }

        return NoContent();
    }
}