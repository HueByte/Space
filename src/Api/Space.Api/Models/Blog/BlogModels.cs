using System.ComponentModel.DataAnnotations;

namespace Space.Api.Models.Blog;

public class CreateBlogPostRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Summary { get; set; }

    public string? CoverImage { get; set; }

    public bool IsPublished { get; set; }

    public List<string> Tags { get; set; } = new();
}

public class UpdateBlogPostRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Summary { get; set; }

    public string? CoverImage { get; set; }

    public bool IsPublished { get; set; }

    public List<string> Tags { get; set; } = new();
}

public class BlogPostResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? CoverImage { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? PublishedAt { get; set; }
    public AuthorInfo Author { get; set; } = null!;
    public List<string> Tags { get; set; } = new();
}

public class BlogPostListResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? CoverImage { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PublishedAt { get; set; }
    public AuthorInfo Author { get; set; } = null!;
    public List<string> Tags { get; set; } = new();
}

public class AuthorInfo
{
    public string Id { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
}

public class UploadMarkdownRequest
{
    [Required]
    public IFormFile File { get; set; } = null!;

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Summary { get; set; }

    public bool IsPublished { get; set; }

    public string? Tags { get; set; }
}

public class PaginatedResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}
