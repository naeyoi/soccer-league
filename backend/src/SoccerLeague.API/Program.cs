using Microsoft.EntityFrameworkCore;
using FluentValidation;

using SoccerLeague.Infrastructure.Context;
using SoccerLeague.Domain.Interfaces;
using SoccerLeague.Infrastructure.Repositories;
using SoccerLeague.Application.Services;
using SoccerLeague.Application.Validators;
using SoccerLeague.API.Middlewares;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddValidatorsFromAssemblyContaining<CreateTeamDtoValidator>();

builder.Services.AddScoped<ITeamRepository, TeamRepository>();
builder.Services.AddScoped<ILeagueRepository, LeagueRepository>();

builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<ILeagueService, LeagueService>();

builder.Services.AddControllers();

var app = builder.Build();

app.UseExceptionHandling();
app.UseHttpsRedirection();
app.MapControllers();
app.Run();
