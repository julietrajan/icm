using System.ComponentModel.DataAnnotations;

namespace IncidentManagement.Api.Models;

public class IncidentRequest
{
    [Required, StringLength(160, MinimumLength = 3)]
    public string Title { get; set => field = value?.Trim() ?? ""; } = "";

    [Required, StringLength(10000, MinimumLength = 5)]
    public string Description { get; set => field = value?.Trim() ?? ""; } = "";

    [Required, EnumDataType(typeof(IncidentPriority))]
    public IncidentPriority? Priority { get; set; }

    [Required, EnumDataType(typeof(IncidentCategory))]
    public IncidentCategory? Category { get; set; }

    [Required, StringLength(100)]
    public string ReportedBy { get; set => field = value?.Trim() ?? ""; } = "";

    [StringLength(100)]
    public string AssignedTo { get; set => field = value?.Trim() ?? ""; } = "";
}

public sealed class UpdateIncidentRequest : IncidentRequest
{
    [Required, EnumDataType(typeof(IncidentStatus))]
    public IncidentStatus? Status { get; set; }

    [Range(1, int.MaxValue)]
    public int Version { get; set; }
}

public sealed class AddNoteRequest
{
    [Required, StringLength(100)]
    public string Author { get; set => field = value?.Trim() ?? ""; } = "";

    [Required, StringLength(4000)]
    public string Text { get; set => field = value?.Trim() ?? ""; } = "";
}
