using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;

namespace ur_admin_web.Controllers
{
    [Route("api")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;

        public AuthController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClient = httpClientFactory.CreateClient();
            _baseUrl = configuration["BaseUrl"] ?? throw new ArgumentNullException("BaseUrl is not configured in appsettings.json");
        }

        // Authorization method
        [HttpPost("account/authenticate")]
        public async Task<IActionResult> DynamicPost([FromBody] JsonElement requestBody)
        {
            // Build the target URL
            var targetUrl = $"{_baseUrl}/account/authenticate";

            try
            {
                using var requestMessage = new HttpRequestMessage(HttpMethod.Post, targetUrl);

                // Forward request body
                requestMessage.Content = new StringContent(requestBody.GetRawText(), Encoding.UTF8, "application/json");

                // Forward the request
                var response = await _httpClient.SendAsync(requestMessage);

                // Read response
                var result = await response.Content.ReadAsStringAsync();

                return response.IsSuccessStatusCode
                    ? Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json")
                    : StatusCode((int)response.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error forwarding POST request: {ex.Message}");
            }
        }
    }
}