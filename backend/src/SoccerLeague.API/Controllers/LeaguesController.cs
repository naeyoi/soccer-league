using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using SoccerLeague.Application.DTOs;
using SoccerLeague.Application.Services;

namespace SoccerLeague.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaguesController : ControllerBase
{
    private readonly ILeagueService _leagueService;

    public LeaguesController(ILeagueService leagueService)
    {
        _leagueService = leagueService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LeagueResponseDto>>> GetAll()
    {
        var leagues = await _leagueService.GetAllLeaguesAsync();
        return Ok(leagues);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LeagueResponseDto>> GetById(int id)
    {
        var league = await _leagueService.GetLeagueByIdAsync(id);
        if (league is null)
        {
            return NotFound(new { message = $"La liga con ID {id} no fue encontrada." });
        }

        return Ok(league);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create([FromBody] CreateLeagueDto createDto)
    {
        try
        {
            var leagueId = await _leagueService.CreateLeagueAsync(createDto);
            return CreatedAtAction(nameof(GetById), new { id = leagueId }, new { id = leagueId });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Uno o más equipos seleccionados no existen." });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateLeagueDto updateDto)
    {
        if (id != updateDto.Id)
        {
            return BadRequest("El ID de la ruta no coincide con el ID del objeto enviado.");
        }

        try
        {
            await _leagueService.UpdateLeagueAsync(updateDto);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"La liga con ID {id} o uno de los equipos seleccionados no existe." });
        }

        return NoContent();
    }

    [HttpPatch("{id:int}/enabled")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetEnabled(
        int id,
        [FromBody] SetLeagueEnabledRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            await _leagueService.SetLeagueEnabledAsync(id, request.Enabled, cancellationToken);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"La liga con ID {id} no fue encontrada." });
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _leagueService.DeleteLeagueAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = $"La liga con ID {id} no fue encontrada." });
        }

        return NoContent();
    }
}
