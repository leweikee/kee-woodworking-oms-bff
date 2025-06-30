using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;
using System.Net.Http.Headers;

namespace KeeWoodworking_BFF.Controllers
{
    [Route("api")]
    [ApiController]
    public class GenericController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;

        public GenericController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClient = httpClientFactory.CreateClient();
            _baseUrl = configuration["BaseUrl"] ?? throw new ArgumentNullException("BaseUrl is not configured in appsettings.json");
        }

        // Dynamic GET method
        [HttpGet("{*path}")]
        public async Task<IActionResult> DynamicGet(string path, [FromQuery] Dictionary<string, string> queryParams)
        {
            // Build the target URL
            var queryString = string.Join("&", queryParams.Select(q => $"{q.Key}={q.Value}"));
            var targetUrl = $"{_baseUrl}/{path}?{queryString}";

            try
            {
                using var requestMessage = new HttpRequestMessage(HttpMethod.Get, targetUrl);

                // Forward Authorization Header
                if (Request.Headers.TryGetValue("Authorization", out Microsoft.Extensions.Primitives.StringValues value))
                {
                    requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer",
                        value.ToString().Replace("Bearer ", ""));
                }

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
                return StatusCode(500, $"Error forwarding GET request: {ex.Message}");
            }
        }

        [HttpPost("{*path}")]
        public async Task<IActionResult> DynamicPost(string path)
        {
            var targetUrl = $"{_baseUrl}/{path}";

            try
            {
                using var requestMessage = new HttpRequestMessage(HttpMethod.Post, targetUrl);

                // Detect if the request is JSON or FormData
                if (Request.ContentType != null && Request.ContentType.Contains("application/json"))
                {
                    // Handle JSON requests
                    using var reader = new StreamReader(Request.Body);
                    var requestBody = await reader.ReadToEndAsync();
                    requestMessage.Content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                }
                else if (Request.ContentType != null && Request.ContentType.Contains("multipart/form-data"))
                {
                    // Handle FormData (Files + Fields)
                    var formCollection = await Request.ReadFormAsync();
                    var multipartContent = new MultipartFormDataContent();

                    // Add form fields
                    foreach (var field in formCollection.Keys)
                    {
                        if (formCollection[field].Count > 0)
                        {
                            multipartContent.Add(new StringContent(formCollection[field]), field);
                        }
                    }

                    // Add files
                    foreach (var file in formCollection.Files)
                    {
                        if (file.Length > 0)
                        {
                            var streamContent = new StreamContent(file.OpenReadStream());
                            streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);
                            multipartContent.Add(streamContent, file.Name, file.FileName);
                        }
                    }

                    requestMessage.Content = multipartContent;
                }
                else
                {
                    return BadRequest("Unsupported Content-Type");
                }

                // Forward Authorization Header
                if (Request.Headers.TryGetValue("Authorization", out var value) && !string.IsNullOrEmpty(value))
                {
                    requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", value.ToString().Replace("Bearer ", ""));
                }

                // Forward the request
                var response = await _httpClient.SendAsync(requestMessage);
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

        // Dynamic PUT method
        [HttpPut("{*path}")]
        public async Task<IActionResult> DynamicPut(string path, [FromBody] JsonElement requestBody)
        {
            // Build the target URL
            var targetUrl = $"{_baseUrl}/{path}";

            try
            {
                using var requestMessage = new HttpRequestMessage(HttpMethod.Put, targetUrl);

                // Forward request body
                requestMessage.Content = new StringContent(requestBody.GetRawText(), Encoding.UTF8, "application/json");

                // Forward Authorization Header
                if (Request.Headers.TryGetValue("Authorization", out Microsoft.Extensions.Primitives.StringValues value))
                {
                    requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer",
                        value.ToString().Replace("Bearer ", ""));
                }

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
                return StatusCode(500, $"Error forwarding PUT request: {ex.Message}");
            }
        }

        // Dynamic DELETE method
        [HttpDelete("{*path}")]
        public async Task<IActionResult> DynamicDelete(string path, [FromQuery] Dictionary<string, string> queryParams)
        {
            // Build the target URL
            var queryString = string.Join("&", queryParams.Select(q => $"{q.Key}={q.Value}"));
            var targetUrl = $"{_baseUrl}/{path}?{queryString}";

            try
            {
                using var requestMessage = new HttpRequestMessage(HttpMethod.Delete, targetUrl);

                // Forward Authorization Header
                if (Request.Headers.TryGetValue("Authorization", out Microsoft.Extensions.Primitives.StringValues value))
                {
                    requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer",
                        value.ToString().Replace("Bearer ", ""));
                }

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
                return StatusCode(500, $"Error forwarding DELETE request: {ex.Message}");
            }
        }
    }
}