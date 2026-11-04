using FluentValidation;
using SoccerLeague.Application.DTOs;

namespace SoccerLeague.Application.Validators;

public class CreateLeagueDtoValidator : AbstractValidator<CreateLeagueDto>
{
    public CreateLeagueDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre de la liga es obligatorio.")
            .MaximumLength(50).WithMessage("El nombre de la liga no puede exceder los 50 caracteres.");

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("El país de la liga es obligatorio.")
            .MaximumLength(50).WithMessage("El país no puede exceder los 50 caracteres.");

        RuleFor(x => x.StartDate)
            .InclusiveBetween(new DateTime(1753, 1, 1), new DateTime(9999, 12, 31, 23, 59, 59, 997))
            .WithMessage("La fecha de inicio es obligatoria y debe estar dentro del rango admitido por SQL Server.");

        RuleFor(x => x.EndDate)
            .InclusiveBetween(new DateTime(1753, 1, 1), new DateTime(9999, 12, 31, 23, 59, 59, 997))
            .WithMessage("La fecha de fin es obligatoria y debe estar dentro del rango admitido por SQL Server.")
            .GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("La fecha de fin debe ser igual o posterior a la fecha de inicio.");
    }
}