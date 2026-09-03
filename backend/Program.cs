using System.Text;
using System.Text.Json.Serialization;
using FutbolAmigos.Api.Data;
using FutbolAmigos.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "Frontend";

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException(
        "Falta configurar ConnectionStrings:Default. En desarrollo: dotnet user-secrets set \"ConnectionStrings:Default\" \"<connection-string-de-neon>\"");

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

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins(allowedOrigins.ToArray())
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
