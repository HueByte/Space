namespace Space.Api.Data.Entities;

public class BlogPostTag
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public Guid BlogPostId { get; set; }
    public BlogPost BlogPost { get; set; } = null!;
}
