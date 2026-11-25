using IncidentManagement.Api.Models;
using IncidentManagement.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace IncidentManagement.Api.Controllers;

[ApiController]
[Route("api/incidents")]
public sealed class IncidentsController(IIncidentService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Incident>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await service.GetAllAsync(cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Incident>> Get(Guid id, CancellationToken cancellationToken)
    {
        var incident = await service.GetAsync(id, cancellationToken);
        return incident is null ? NotFound() : Ok(incident);
    }

    [HttpPost]
    public async Task<ActionResult<Incident>> Create(IncidentRequest request, CancellationToken cancellationToken)
    {
        var incident = await service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = incident.Id }, incident);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Incident>> Update(Guid id, UpdateIncidentRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var incident = await service.UpdateAsync(id, request, cancellationToken);
            return incident is null ? NotFound() : Ok(incident);
        }
        catch (IncidentConflictException exception)
        {
            return Problem(statusCode: StatusCodes.Status409Conflict, detail: exception.Message);
        }
    }

    [HttpPost("{id:guid}/notes")]
    public async Task<ActionResult<Incident>> AddNote(Guid id, AddNoteRequest request, CancellationToken cancellationToken)
    {
        var incident = await service.AddNoteAsync(id, request, cancellationToken);
        return incident is null ? NotFound() : Ok(incident);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] int version, CancellationToken cancellationToken)
    {
        if (version < 1) return Problem(statusCode: 400, detail: "A positive incident version is required.");
        try
        {
            return await service.DeleteAsync(id, version, cancellationToken) ? NoContent() : NotFound();
        }
        catch (IncidentConflictException exception)
        {
            return Problem(statusCode: StatusCodes.Status409Conflict, detail: exception.Message);
        }
    }
}
