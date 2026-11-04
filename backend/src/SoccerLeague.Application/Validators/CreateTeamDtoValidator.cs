using FluentValidation;
using SoccerLeague.Application.DTOs;

namespace SoccerLeague.Application.Validators;

public class CreateTeamDtoValidator : AbstractValidator<CreateTeamDto>
{
    public CreateTeamDtoValidator()
    {
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