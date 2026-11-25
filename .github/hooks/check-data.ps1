$dataPath = "IncidentManagement.Api/Data/incidents.json"

try {
    Get-Content -LiteralPath $dataPath -Raw -ErrorAction Stop |
        ConvertFrom-Json -ErrorAction Stop |
        Out-Null

    Write-Output "Incident data JSON is valid."
    exit 0
}
catch {
    [Console]::Error.WriteLine(
        "Incident data is missing or contains invalid JSON. Investigate before changing persistence code."
    )
    exit 1
}
