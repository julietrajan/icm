using System.Text.Json.Serialization;

namespace IncidentManagement.Api.Models;

public enum IncidentStatus { New, InProgress, OnHold, Resolved, Closed }
public enum IncidentPriority { Critical, High, Medium, Low }
public enum IncidentCategory { Application, Hardware, Network, Security, Access, Other }

public sealed record Incident
{
    public Guid Id { get; init; }
    public string Number { get; init; } = "";
    public string Title { get; init; } = "";
    public string Description { get; init; } = "";
    public IncidentStatus Status { get; init; }
    public IncidentPriority Priority { get; init; }
    public IncidentCategory Category { get; init; }
    public string ReportedBy { get; init; } = "";
    public string AssignedTo { get; init; } = "";
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }
    public DateTimeOffset? ResolvedAt { get; init; }
    public int Version { get; init; } = 1;
    public List<IncidentNote> Notes { get; init; } = [];
}

public sealed record IncidentNote(Guid Id, string Author, string Text, DateTimeOffset CreatedAt);

public sealed class IncidentStore
{
    [JsonRequired]
    public int SchemaVersion { get; set; } = 1;
    [JsonRequired]
    public long NextIncidentNumber { get; set; } = 1;
    [JsonRequired]
    public List<Incident> Incidents { get; set; } = [];
}
