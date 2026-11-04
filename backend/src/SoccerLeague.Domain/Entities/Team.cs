namespace SoccerLeague.Domain.Entities;

public class Team
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public int PlayersQuantity { get; set; }
    public bool Enabled { get; set; } = true;
    public ICollection<League> Leagues { get; set; } = new List<League>();
}