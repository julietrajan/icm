using System.Text.Json;
using System.Text.Json.Serialization;
using IncidentManagement.Api.Models;

namespace IncidentManagement.Api.Services;

public sealed class JsonIncidentService : IIncidentService, IDisposable
{
    private readonly SemaphoreSlim gate = new(1, 1);
    private readonly string filePath;
    private readonly ILogger<JsonIncidentService> logger;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true,
        Converters = { new JsonStringEnumConverter(allowIntegerValues: false) }
    };

    public JsonIncidentService(IWebHostEnvironment environment, IConfiguration configuration,
        ILogger<JsonIncidentService> logger)
    {
        this.logger = logger;
        filePath = Path.GetFullPath(configuration["Storage:FilePath"] ?? "Data/incidents.json",
            environment.ContentRootPath);
    }

    public Task<IReadOnlyList<Incident>> GetAllAsync(CancellationToken cancellationToken) =>
        AccessAsync<IReadOnlyList<Incident>>(store =>
            store.Incidents.OrderByDescending(incident => incident.UpdatedAt).ToList(), false, cancellationToken);

    public Task<Incident?> GetAsync(Guid id, CancellationToken cancellationToken) =>
        AccessAsync(store => store.Incidents.Find(incident => incident.Id == id), false, cancellationToken);

    public Task<Incident> CreateAsync(IncidentRequest request, CancellationToken cancellationToken) =>
        AccessAsync(store =>
        {
            var now = DateTimeOffset.UtcNow;
            var incident = new Incident
            {
                Id = Guid.NewGuid(),
                Number = $"INC-{store.NextIncidentNumber++:D5}",
                Title = request.Title.Trim(),
                Description = request.Description.Trim(),
                Priority = request.Priority!.Value,
                Category = request.Category!.Value,
                ReportedBy = request.ReportedBy.Trim(),
                AssignedTo = request.AssignedTo.Trim(),
                Status = IncidentStatus.New,
                CreatedAt = now,
                UpdatedAt = now
            };
            store.Incidents.Add(incident);
            return incident;
        }, true, cancellationToken);

    public Task<Incident?> UpdateAsync(Guid id, UpdateIncidentRequest request, CancellationToken cancellationToken) =>
        AccessAsync(store =>
        {
            var index = store.Incidents.FindIndex(incident => incident.Id == id);
            if (index < 0) return null;
            var current = store.Incidents[index];
            if (current.Version != request.Version) throw new IncidentConflictException();
            var now = DateTimeOffset.UtcNow;
            var resolved = request.Status is IncidentStatus.Resolved or IncidentStatus.Closed;
            var updated = current with
            {
                Title = request.Title.Trim(),
                Description = request.Description.Trim(),
                Priority = request.Priority!.Value,
                Category = request.Category!.Value,
                ReportedBy = request.ReportedBy.Trim(),
                AssignedTo = request.AssignedTo.Trim(),
                Status = request.Status!.Value,
                UpdatedAt = now,
                ResolvedAt = resolved ? current.ResolvedAt ?? now : null,
                Version = current.Version + 1
            };
            store.Incidents[index] = updated;
            return updated;
        }, true, cancellationToken);

    public Task<Incident?> AddNoteAsync(Guid id, AddNoteRequest request, CancellationToken cancellationToken) =>
        AccessAsync(store =>
        {
            var index = store.Incidents.FindIndex(incident => incident.Id == id);
            if (index < 0) return null;
            var current = store.Incidents[index];
            var now = DateTimeOffset.UtcNow;
            var updated = current with
            {
                Notes = [.. current.Notes, new(Guid.NewGuid(), request.Author.Trim(), request.Text.Trim(), now)],
                UpdatedAt = now,
                Version = current.Version + 1
            };
            store.Incidents[index] = updated;
            return updated;
        }, true, cancellationToken);

    public Task<bool> DeleteAsync(Guid id, int version, CancellationToken cancellationToken) =>
        AccessAsync(store =>
        {
            var incident = store.Incidents.Find(incident => incident.Id == id);
            if (incident is null) return false;
            if (incident.Version != version) throw new IncidentConflictException();
            store.Incidents.Remove(incident);
            return true;
        }, true, cancellationToken);

    private async Task<T> AccessAsync<T>(Func<IncidentStore, T> operation, bool save, CancellationToken cancellationToken)
    {
        await gate.WaitAsync(cancellationToken);
        try
        {
            IncidentStore store;
            if (File.Exists(filePath))
            {
                await using var stream = File.OpenRead(filePath);
                store = await JsonSerializer.DeserializeAsync<IncidentStore>(stream, JsonOptions, cancellationToken)
                    ?? throw new InvalidDataException("The incident file contains no valid store.");
                if (store.SchemaVersion != 1 || store.NextIncidentNumber < 1 || store.Incidents is null)
                    throw new InvalidDataException("The incident file has an invalid or unsupported schema.");
            }
            else
            {
                store = new IncidentStore();
            }

            var result = operation(store);
            if (save && result is not null && result is not false)
            {
                Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
                var temporaryPath = filePath + "." + Guid.NewGuid().ToString("N") + ".tmp";
                try
                {
                    await using (var stream = new FileStream(temporaryPath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                    {
                        await JsonSerializer.SerializeAsync(stream, store, JsonOptions, cancellationToken);
                        await stream.FlushAsync(cancellationToken);
                        stream.Flush(flushToDisk: true);
                    }
                    await ReplaceFileAsync(temporaryPath, cancellationToken);
                }
                finally
                {
                    if (File.Exists(temporaryPath)) File.Delete(temporaryPath);
                }
            }
            return result;
        }
        finally
        {
            gate.Release();
        }
    }

    private async Task ReplaceFileAsync(string temporaryPath, CancellationToken cancellationToken)
    {
        for (var attempt = 0; ; attempt++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            try
            {
                File.Move(temporaryPath, filePath, overwrite: true);
                return;
            }
            catch (Exception exception) when (attempt < 4 && IsWindowsFileLock(exception))
            {
                // Sync clients and scanners can briefly hold Windows replacement handles.
                logger.LogWarning(exception, "Incident file replacement blocked; retry {Attempt} of 4.", attempt + 1);
                await Task.Delay(50 * (1 << attempt), cancellationToken);
            }
        }
    }

    private static bool IsWindowsFileLock(Exception exception) =>
        OperatingSystem.IsWindows() &&
        (exception is IOException or UnauthorizedAccessException) &&
        (exception.HResult & 0xFFFF) is 5 or 32 or 33;

    public void Dispose() => gate.Dispose();
}
