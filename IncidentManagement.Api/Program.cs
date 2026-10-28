using System.Text.Json.Serialization;
using IncidentManagement.Api.Services;

   
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers().AddJsonOptions(options =>
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(allowIntegerValues: false)));
builder.Services.AddProblemDetails();
builder.Services.AddSingleton<IIncidentService, JsonIncidentService>();

var app = builder.Build();
app.UseExceptionHandler();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy" }));
if (Directory.Exists(Path.Combine(app.Environment.ContentRootPath, "wwwroot")))
{
    app.UseDefaultFiles();
    app.UseStaticFiles();
    app.MapFallbackToFile("index.html");
}
app.Run();
