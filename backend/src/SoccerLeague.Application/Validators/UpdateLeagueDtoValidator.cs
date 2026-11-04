using FluentValidation;
using SoccerLeague.Application.DTOs;

namespace SoccerLeague.Application.Validators;

public class UpdateLeagueDtoValidator : AbstractValidator<UpdateLeagueDto>
{
    public UpdateLeagueDtoValidator()
    {
        RuleFor(league => league.Id)
            .GreaterThan(0).WithMessage("El ID de la liga debe ser válido.");

        RuleFor(league => league.Name)
            .NotEmpty().WithMessage("El nombre de la liga es obligatorio.")
            .Must(name => !string.IsNullOrWhiteSpace(name) && name.Trim().Length >= 2)
            .WithMessage("El nombre de la liga debe tener al menos 2 caracteres.")
            .MaximumLength(50).WithMessage("El nombre de la liga no puede exceder los 50 caracteres.");

        RuleFor(league => league.Country)
            .NotEmpty().WithMessage("El país de la liga es obligatorio.")
            .Must(country => !string.IsNullOrWhiteSpace(country) && country.Trim().Length >= 2)
            .WithMessage("El país debe tener al menos 2 caracteres.")
            .MaximumLength(50).WithMessage("El país no puede exceder los 50 caracteres.");

        RuleFor(league => league.StartDate)
            .InclusiveBetween(new DateTime(1753, 1, 1), new DateTime(9999, 12, 31, 23, 59, 59, 997))
            .WithMessage("La fecha de inicio está fuera del rango admitido por SQL Server.");

        RuleFor(league => league.EndDate)
            .InclusiveBetween(new DateTime(1753, 1, 1), new DateTime(9999, 12, 31, 23, 59, 59, 997))
            .WithMessage("La fecha de fin está fuera del rango admitido por SQL Server.")
            .GreaterThanOrEqualTo(league => league.StartDate)
            .WithMessage("La fecha de fin debe ser igual o posterior a la fecha de inicio.");
    }
}
