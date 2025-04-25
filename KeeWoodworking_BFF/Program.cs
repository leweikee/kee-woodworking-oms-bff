var builder = WebApplication.CreateBuilder(args);

// Register Services
builder.Services.AddControllersWithViews(); // For MVC controllers
builder.Services.AddSpaStaticFiles(config =>
{
    config.RootPath = "wwwroot"; // Path to built SPA static files
});

builder.Services.AddLogging(loggingBuilder =>
{
    loggingBuilder.AddConsole();
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddHealthChecks();

builder.Services.AddHttpClient();

// Build the app
var app = builder.Build();

// Middleware Configuration
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    // Use PathBase if SubPath is specified
    var subPath = builder.Configuration.GetSection("SubPath").Value;
    if (!string.IsNullOrEmpty(subPath))
    {
        app.UsePathBase(subPath);
    }

    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // Serve static files (for SPA)

// Add Routing middleware
app.UseRouting();

// Add Authentication and Authorization
app.UseAuthentication();
app.UseAuthorization();

app.UseHealthChecks("/health"); // Health check endpoint

// Map API routes and controllers
app.UseEndpoints(endpoints =>
{
    // MVC Controller route
    endpoints.MapControllerRoute(
        name: "default",
        pattern: "{controller=Home}/{action=Index}/{id?}");

    // Map API Controllers
    endpoints.MapControllers();
});

// Fallback for SPA routes
if (!app.Environment.IsDevelopment())
{
    app.UseSpaStaticFiles(); // Serve SPA static files in production
}

// SPA development server or static files in production
if (app.Environment.IsDevelopment())
{
    app.UseSpa(spa =>
    {
        spa.Options.SourcePath = "ClientApp"; // Development SPA path
        spa.UseProxyToSpaDevelopmentServer("http://localhost:4200"); // Proxy to React/Vue dev server
    });
}
else
{
    // Fallback to index.html for SPA routes in production
    app.MapFallbackToFile("index.html");
}

app.Run();