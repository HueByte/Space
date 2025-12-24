using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Space.Api.Models.Blog;
using Space.Api.Services;

namespace Space.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class PostsController : ControllerBase
{
    private readonly IBlogService _blogService;

    public PostsController(IBlogService blogService)
    {
        _blogService = blogService;
    }

    /// <summary>
    /// Get all published blog posts (paginated)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<BlogPostListResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 50) pageSize = 10;

        var posts = await _blogService.GetPostsAsync(page, pageSize);
        return Ok(posts);
    }

    /// <summary>
    /// Get all blog posts including unpublished (requires Admin role)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("all")]
    [ProducesResponseType(typeof(PaginatedResponse<BlogPostListResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 50) pageSize = 10;

        var posts = await _blogService.GetPostsAsync(page, pageSize, includeUnpublished: true);
        return Ok(posts);
    }

    /// <summary>
    /// Get a blog post by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(BlogPostResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPostById(Guid id)
    {
        var post = await _blogService.GetPostByIdAsync(id);

        if (post == null)
        {
            return NotFound();
        }

        return Ok(post);
    }

    /// <summary>
    /// Get a blog post by slug
    /// </summary>
    [HttpGet("slug/{slug}")]
    [ProducesResponseType(typeof(BlogPostResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPostBySlug(string slug)
    {
        var post = await _blogService.GetPostBySlugAsync(slug);

        if (post == null)
        {
            return NotFound();
        }

        return Ok(post);
    }

    /// <summary>
    /// Create a new blog post (requires Admin role)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPost]
    [ProducesResponseType(typeof(BlogPostResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreatePost([FromBody] CreateBlogPostRequest request)
    {
        var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(authorId))
        {
            return Unauthorized();
        }

        var post = await _blogService.CreatePostAsync(request, authorId);
        return CreatedAtAction(nameof(GetPostById), new { id = post.Id }, post);
    }

    /// <summary>
    /// Upload a markdown file as a new blog post (requires Admin role)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(BlogPostResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UploadMarkdown([FromForm] UploadMarkdownRequest request)
    {
        var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(authorId))
        {
            return Unauthorized();
        }

        if (request.File == null || request.File.Length == 0)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid file",
                Detail = "Please upload a valid markdown file",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var extension = Path.GetExtension(request.File.FileName).ToLowerInvariant();
        if (extension != ".md" && extension != ".markdown")
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid file type",
                Detail = "Only .md and .markdown files are allowed",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var post = await _blogService.UploadMarkdownAsync(request, authorId);
        return CreatedAtAction(nameof(GetPostById), new { id = post.Id }, post);
    }

    /// <summary>
    /// Update an existing blog post (requires Admin role)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(BlogPostResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdatePost(Guid id, [FromBody] UpdateBlogPostRequest request)
    {
        var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(authorId))
        {
            return Unauthorized();
        }

        var post = await _blogService.UpdatePostAsync(id, request, authorId);

        if (post == null)
        {
            return NotFound();
        }

        return Ok(post);
    }

    /// <summary>
    /// Delete a blog post (requires Admin role)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeletePost(Guid id)
    {
        var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(authorId))
        {
            return Unauthorized();
        }

        var deleted = await _blogService.DeletePostAsync(id, authorId);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
