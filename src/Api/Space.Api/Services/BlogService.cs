using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Space.Api.Data;
using Space.Api.Data.Entities;
using Space.Api.Models.Blog;

namespace Space.Api.Services;

public interface IBlogService
{
    Task<PaginatedResponse<BlogPostListResponse>> GetPostsAsync(int page, int pageSize, bool includeUnpublished = false);
    Task<BlogPostResponse?> GetPostByIdAsync(Guid id);
    Task<BlogPostResponse?> GetPostBySlugAsync(string slug);
    Task<BlogPostResponse> CreatePostAsync(CreateBlogPostRequest request, string authorId);
    Task<BlogPostResponse?> UpdatePostAsync(Guid id, UpdateBlogPostRequest request, string authorId);
    Task<bool> DeletePostAsync(Guid id, string authorId);
    Task<BlogPostResponse> UploadMarkdownAsync(UploadMarkdownRequest request, string authorId);
}

public partial class BlogService : IBlogService
{
    private readonly ApplicationDbContext _context;

    public BlogService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResponse<BlogPostListResponse>> GetPostsAsync(int page, int pageSize, bool includeUnpublished = false)
    {
        var query = _context.BlogPosts
            .Include(p => p.Author)
            .Include(p => p.Tags)
            .AsQueryable();

        if (!includeUnpublished)
        {
            query = query.Where(p => p.IsPublished);
        }

        var totalCount = await query.CountAsync();

        var posts = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new BlogPostListResponse
            {
                Id = p.Id,
                Title = p.Title,
                Slug = p.Slug,
                Summary = p.Summary,
                CoverImage = p.CoverImage,
                IsPublished = p.IsPublished,
                CreatedAt = p.CreatedAt,
                PublishedAt = p.PublishedAt,
                Author = new AuthorInfo
                {
                    Id = p.Author.Id,
                    DisplayName = p.Author.DisplayName
                },
                Tags = p.Tags.Select(t => t.Name).ToList()
            })
            .ToListAsync();

        return new PaginatedResponse<BlogPostListResponse>
        {
            Items = posts,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<BlogPostResponse?> GetPostByIdAsync(Guid id)
    {
        var post = await _context.BlogPosts
            .Include(p => p.Author)
            .Include(p => p.Tags)
            .FirstOrDefaultAsync(p => p.Id == id);

        return post == null ? null : MapToResponse(post);
    }

    public async Task<BlogPostResponse?> GetPostBySlugAsync(string slug)
    {
        var post = await _context.BlogPosts
            .Include(p => p.Author)
            .Include(p => p.Tags)
            .FirstOrDefaultAsync(p => p.Slug == slug);

        return post == null ? null : MapToResponse(post);
    }

    public async Task<BlogPostResponse> CreatePostAsync(CreateBlogPostRequest request, string authorId)
    {
        var slug = GenerateSlug(request.Title);
        slug = await EnsureUniqueSlugAsync(slug);

        var post = new BlogPost
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Slug = slug,
            Content = request.Content,
            Summary = request.Summary,
            CoverImage = request.CoverImage,
            IsPublished = request.IsPublished,
            PublishedAt = request.IsPublished ? DateTime.UtcNow : null,
            AuthorId = authorId
        };

        foreach (var tagName in request.Tags)
        {
            post.Tags.Add(new BlogPostTag
            {
                Id = Guid.NewGuid(),
                Name = tagName.Trim()
            });
        }

        _context.BlogPosts.Add(post);
        await _context.SaveChangesAsync();

        return (await GetPostByIdAsync(post.Id))!;
    }

    public async Task<BlogPostResponse?> UpdatePostAsync(Guid id, UpdateBlogPostRequest request, string authorId)
    {
        var post = await _context.BlogPosts
            .Include(p => p.Tags)
            .FirstOrDefaultAsync(p => p.Id == id && p.AuthorId == authorId);

        if (post == null)
        {
            return null;
        }

        var wasPublished = post.IsPublished;

        post.Title = request.Title;
        post.Content = request.Content;
        post.Summary = request.Summary;
        post.CoverImage = request.CoverImage;
        post.IsPublished = request.IsPublished;
        post.UpdatedAt = DateTime.UtcNow;

        if (!wasPublished && request.IsPublished)
        {
            post.PublishedAt = DateTime.UtcNow;
        }

        _context.BlogPostTags.RemoveRange(post.Tags);
        foreach (var tagName in request.Tags)
        {
            post.Tags.Add(new BlogPostTag
            {
                Id = Guid.NewGuid(),
                Name = tagName.Trim()
            });
        }

        await _context.SaveChangesAsync();

        return await GetPostByIdAsync(post.Id);
    }

    public async Task<bool> DeletePostAsync(Guid id, string authorId)
    {
        var post = await _context.BlogPosts
            .FirstOrDefaultAsync(p => p.Id == id && p.AuthorId == authorId);

        if (post == null)
        {
            return false;
        }

        _context.BlogPosts.Remove(post);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<BlogPostResponse> UploadMarkdownAsync(UploadMarkdownRequest request, string authorId)
    {
        using var reader = new StreamReader(request.File.OpenReadStream());
        var content = await reader.ReadToEndAsync();

        var tags = string.IsNullOrWhiteSpace(request.Tags)
            ? new List<string>()
            : request.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(t => t.Trim())
                .ToList();

        var createRequest = new CreateBlogPostRequest
        {
            Title = request.Title,
            Content = content,
            Summary = request.Summary,
            IsPublished = request.IsPublished,
            Tags = tags
        };

        return await CreatePostAsync(createRequest, authorId);
    }

    private static BlogPostResponse MapToResponse(BlogPost post)
    {
        return new BlogPostResponse
        {
            Id = post.Id,
            Title = post.Title,
            Slug = post.Slug,
            Content = post.Content,
            Summary = post.Summary,
            CoverImage = post.CoverImage,
            IsPublished = post.IsPublished,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            PublishedAt = post.PublishedAt,
            Author = new AuthorInfo
            {
                Id = post.Author.Id,
                DisplayName = post.Author.DisplayName
            },
            Tags = post.Tags.Select(t => t.Name).ToList()
        };
    }

    private static string GenerateSlug(string title)
    {
        var slug = title.ToLowerInvariant();
        slug = InvalidCharsRegex().Replace(slug, "");
        slug = WhitespaceRegex().Replace(slug, "-");
        slug = MultipleDashesRegex().Replace(slug, "-");
        slug = slug.Trim('-');

        return slug;
    }

    private async Task<string> EnsureUniqueSlugAsync(string slug)
    {
        var baseSlug = slug;
        var counter = 1;

        while (await _context.BlogPosts.AnyAsync(p => p.Slug == slug))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }

        return slug;
    }

    [GeneratedRegex(@"[^a-z0-9\s-]")]
    private static partial Regex InvalidCharsRegex();

    [GeneratedRegex(@"\s+")]
    private static partial Regex WhitespaceRegex();

    [GeneratedRegex(@"-+")]
    private static partial Regex MultipleDashesRegex();
}
