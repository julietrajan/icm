using IncidentManagement.Api.Models;

namespace IncidentManagement.Api.Services;

public interface IIncidentService
{
    Task<IReadOnlyList<Incident>> GetAllAsync(CancellationToken cancellationToken);
    Task<Incident?> GetAsync(Guid id, CancellationToken cancellationToken);
    Task<Incident> CreateAsync(IncidentRequest request, CancellationToken cancellationToken);
    Task<Incident?> UpdateAsync(Guid id, UpdateIncidentRequest request, CancellationToken cancellationToken);
    Task<Incident?> AddNoteAsync(Guid id, AddNoteRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid id, int version, CancellationToken cancellationToken);
}

public sealed class IncidentConflictException : Exception
{
    public IncidentConflictException() : base("This incident has changed. Refresh it before saving or deleting.") { }
}
