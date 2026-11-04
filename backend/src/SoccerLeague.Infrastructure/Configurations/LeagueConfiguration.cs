using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoccerLeague.Domain.Entities;

namespace SoccerLeague.Infrastructure.Configurations;

public class LeagueConfiguration : IEntityTypeConfiguration<League>
{
    public void Configure(EntityTypeBuilder<League> builder)
    {
        builder.ToTable("Leagues");
        builder.ToTable(t => t.HasCheckConstraint(
            "CK_Leagues_Name_MinLength",
            "LEN(LTRIM(RTRIM([Name]))) >= 2"));
        builder.ToTable(t => t.HasCheckConstraint(
            "CK_Leagues_Country_MinLength",
            "LEN(LTRIM(RTRIM([Country]))) >= 2"));
        builder.ToTable(t => t.HasCheckConstraint(
            "CK_Leagues_DateRange",
            "[StartDate] <= [EndDate]"));

        builder.HasKey(league => league.Id);

        builder.Property(league => league.Id)
            .HasColumnType("int")
            .ValueGeneratedOnAdd();

        builder.Property(league => league.Name)
            .HasColumnName("Name")
            .HasColumnType("varchar(50)")
            .IsRequired();

        builder.Property(league => league.Country)
            .HasColumnName("Country")
            .HasColumnType("varchar(50)")
            .IsRequired();

        builder.Property(league => league.StartDate)
            .HasColumnName("StartDate")
            .HasColumnType("datetime")
            .HasDefaultValueSql("GETDATE()")
            .IsRequired();

        builder.Property(league => league.EndDate)
            .HasColumnName("EndDate")
            .HasColumnType("datetime")
            .HasDefaultValueSql("GETDATE()")
            .IsRequired();

        builder.Property(league => league.Enabled)
            .HasColumnName("Enabled")
            .HasColumnType("bit")
            .HasDefaultValue(true)
            .IsRequired();

        builder.HasMany(l => l.Teams)
            .WithMany(t => t.Leagues)
            .UsingEntity<Dictionary<string, object>>(
                "LeagueTeams",
                j => j.HasOne<Team>()
                    .WithMany()
                    .HasForeignKey("TeamId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK_LeagueTeams_Team"),
                j => j.HasOne<League>()
                    .WithMany()
                    .HasForeignKey("LeagueId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK_LeagueTeams_League"),
                j => 
                {
                    j.ToTable("LeagueTeams");
                    j.HasKey("LeagueId", "TeamId").HasName("PK_LeagueTeams");
                    j.Property<int>("LeagueId").HasColumnType("int");
                    j.Property<int>("TeamId").HasColumnType("int");
                });
    }
}
