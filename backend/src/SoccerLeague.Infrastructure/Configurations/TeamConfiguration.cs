using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoccerLeague.Domain.Entities;

namespace SoccerLeague.Infrastructure.Configurations;

public class TeamConfiguration : IEntityTypeConfiguration<Team>
{
    public void Configure(EntityTypeBuilder<Team> builder)
    {
        builder.ToTable("Teams");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
            .HasColumnType("int")
            .ValueGeneratedOnAdd();

        builder.Property(t => t.Name)
            .HasColumnName("Name")
            .HasColumnType("varchar(50)")
            .IsRequired();

        builder.Property(t => t.Country)
            .HasColumnName("Country")
            .HasColumnType("varchar(50)")
            .IsRequired();

        builder.Property(t => t.PlayersQuantity)
            .HasColumnName("PlayersQuantity")
            .HasColumnType("int")
            .IsRequired();

        builder.ToTable(t => t.HasCheckConstraint(
            "CK_Teams_PlayersQuantity",
            "[PlayersQuantity] BETWEEN 11 AND 22"));
        builder.ToTable(t => t.HasCheckConstraint(
            "CK_Teams_Name_MinLength",
            "LEN(LTRIM(RTRIM([Name]))) >= 2"));
        builder.ToTable(t => t.HasCheckConstraint(
            "CK_Teams_Country_MinLength",
            "LEN(LTRIM(RTRIM([Country]))) >= 2"));

        builder.Property(t => t.Enabled)
            .HasColumnName("Enabled")
            .HasColumnType("bit")
            .HasDefaultValue(true)
            .IsRequired();
    }
}