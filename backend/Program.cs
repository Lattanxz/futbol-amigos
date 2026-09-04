using System.Text;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using FutbolAmigos.Api.Data;
using FutbolAmigos.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "Frontend";

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddOpenApi();

var connectionString = NormalizeConnectionString(
    builder.Configuration.GetConnectionString("Default")
        ?? throw new InvalidOperationException(
            "Falta configurar ConnectionStrings:Default. En desarrollo: dotnet user-secrets set \"ConnectionStrings:Default\" \"<connection-string-de-neon>\""));

builder.Services.AddDbContext<FutbolAmigosDbContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddScoped<JwtTokenService>();

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "Falta configurar Jwt:Key. En desarrollo: dotnet user-secrets set \"Jwt:Key\" \"<clave-larga-y-secreta>\"");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "FutbolAmigos";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "FutbolAmigos";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });

builder.Services.AddAuthorization();

var allowedOrigins = new List<string> { "http://localhost:5173" };
var frontendUrl = builder.Configuration["Frontend:Url"];
if (!string.IsNullOrWhiteSpace(frontendUrl))
{
    allowedOrigins.Add(frontendUrl.TrimEnd('/'));
}

// Vercel genera una URL única por cada deploy (ej. frontend-<hash>-<team>.vercel.app),
// además del dominio fijo del proyecto. En vez de tener que actualizar Frontend:Url
// a mano cada vez, aceptamos cualquier deploy de este mismo proyecto de Vercel.
var vercelDeployOrigin = new Regex(@"^https://frontend-[a-z0-9-]+\.vercel\.app$", RegexOptions.IgnoreCase);

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.SetIsOriginAllowed(origin =>
                allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase)
                || vercelDeployOrigin.IsMatch(origin))
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseForwardedHeaders();

app.UseHttpsRedirection();

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FutbolAmigosDbContext>();
    db.Database.Migrate();
}

app.Run();

// Neon (y otros proveedores) entregan el connection string como URI (postgresql://user:pass@host/db?sslmode=require),
// pero NpgsqlConnectionStringBuilder solo entiende el formato Keyword=Value. Convertimos si hace falta.
static string NormalizeConnectionString(string value)
{
    if (!value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
        && !value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        return value;
    }

    var uri = new Uri(value);
    var userInfo = uri.UserInfo.Split(':', 2);

    var npgsqlBuilder = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port > 0 ? uri.Port : 5432,
        Database = uri.AbsolutePath.TrimStart('/'),
        Username = Uri.UnescapeDataString(userInfo[0]),
        Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : null,
    };

    var query = QueryHelpers.ParseQuery(uri.Query);
    if (query.TryGetValue("sslmode", out var sslMode)
        && Enum.TryParse<SslMode>(sslMode.ToString(), ignoreCase: true, out var parsedSslMode))
    {
        npgsqlBuilder.SslMode = parsedSslMode;
    }

    return npgsqlBuilder.ConnectionString;
}
