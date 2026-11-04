using FluentValidation;
using SoccerLeague.Application.DTOs;

namespace SoccerLeague.Application.Validators;

public class UpdateTeamDtoValidator : AbstractValidator<UpdateTeamDto>
{
    public UpdateTeamDtoValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("El ID del equipo debe ser válido.");

        // 2. Las mismas reglas de negocio para los campos actualizables
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre del equipo es obligatorio.")
            .MaximumLength(50).WithMessage("El nombre no puede exceder los 50 caracteres.");

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("El país es obligatorio.")
            .MaximumLength(50).WithMessage("El país no puede exceder los 50 caracteres.");

        RuleFor(x => x.PlayersQuantity)
            .InclusiveBetween(11, 22).WithMessage("La cantidad de jugadores debe estar entre 11 y 22.");
    }
}
