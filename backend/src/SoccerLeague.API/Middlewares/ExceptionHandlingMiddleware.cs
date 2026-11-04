using System.Net;
using System.Text.Json;
using FluentValidation;

namespace SoccerLeague.API.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionHandlingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;

            var errors = ex.Errors.Select(e => new 
            {
                Property = e.PropertyName,
                Error = e.ErrorMessage
            });

            var response = JsonSerializer.Serialize(new
            {
                status = (int)HttpStatusCode.BadRequest,
                message = "Se encontraron errores de validación en los datos enviados.",
                errors = errors
            });

            await context.Response.WriteAsync(response);
        }
        catch (Exception ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var response = JsonSerializer.Serialize(new
            {
                status = (int)HttpStatusCode.InternalServerError,
                message = "Ocurrió un error interno en el servidor.",
                detail = ex.Message
            });

            await context.Response.WriteAsync(response);
        }
    }
}