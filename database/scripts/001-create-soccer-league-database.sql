-- 1. Crear la Base de Datos
CREATE DATABASE SoccerLeague;
GO

USE SoccerLeague;
GO

-- 2. Crear la tabla League
CREATE TABLE Leagues (
    Id INT IDENTITY(1,1) PRIMARY KEY,                             -- int, PK, Identity(1,1)
    Name VARCHAR(50) NOT NULL,                                    -- varchar(50), not null
    Country VARCHAR(50) NOT NULL,                                 -- varchar(50), not null
    StartDate DATETIME NOT NULL DEFAULT GETDATE(),                -- datetime, not null, default now
    EndDate DATETIME NOT NULL DEFAULT GETDATE(),                  -- datetime, not null, default now
    Enabled BIT NOT NULL DEFAULT 1,                               -- bit, default 1
    CONSTRAINT CK_Leagues_Name_MinLength CHECK (LEN(LTRIM(RTRIM(Name))) >= 2), -- El nombre debe tener al menos 2 caracteres no blancos
    CONSTRAINT CK_Leagues_Country_MinLength CHECK (LEN(LTRIM(RTRIM(Country))) >= 2), -- El país debe tener al menos 2 caracteres no blancos
    CONSTRAINT CK_Leagues_DateRange CHECK (StartDate <= EndDate) -- La fecha de inicio no puede ser posterior a la fecha final
);
GO

-- 3. Crear la tabla Team
CREATE TABLE Teams (
    Id INT IDENTITY(1,1) PRIMARY KEY,                             -- int, PK, Identity(1,1)
    Name VARCHAR(50) NOT NULL,                                    -- varchar(50), not null
    Country VARCHAR(50) NOT NULL,                                 -- varchar(50), not null
    PlayersQuantity INT NOT NULL CHECK (PlayersQuantity BETWEEN 11 AND 22), -- Cantidad permitida de jugadores: entre 11 y 22
    Enabled BIT NOT NULL DEFAULT 1,                               -- bit, default 1
    CONSTRAINT CK_Teams_Name_MinLength CHECK (LEN(LTRIM(RTRIM(Name))) >= 2), -- El nombre debe tener al menos 2 caracteres no blancos
    CONSTRAINT CK_Teams_Country_MinLength CHECK (LEN(LTRIM(RTRIM(Country))) >= 2) -- El país debe tener al menos 2 caracteres no blancos
);
GO

-- 4. Crear la tabla intermedia para la relación Muchos a Muchos (*..*)
CREATE TABLE LeagueTeams (
    LeagueId INT NOT NULL,
    TeamId INT NOT NULL,
    CONSTRAINT PK_LeagueTeams PRIMARY KEY (LeagueId, TeamId), -- Evita inscribir el mismo equipo dos veces en una liga
    CONSTRAINT FK_LeagueTeams_League FOREIGN KEY (LeagueId) REFERENCES Leagues(Id) ON DELETE CASCADE, -- Exige que la liga exista y elimina sus inscripciones al borrarla
    CONSTRAINT FK_LeagueTeams_Team FOREIGN KEY (TeamId) REFERENCES Teams(Id) ON DELETE CASCADE -- Exige que el equipo exista y elimina sus inscripciones al borrarlo
);
GO

-- 5. Insertar datos de ejemplo
INSERT INTO Leagues (Name, Country, StartDate, EndDate)
VALUES
    ('Liga Nacional', 'Mexico', '2026-01-15', '2026-11-30'),
    ('Copa Internacional', 'Global', '2026-03-01', '2026-12-15');
GO

INSERT INTO Teams (Name, Country, PlayersQuantity)
VALUES
    ('Aguilas FC', 'Mexico', 22),
    ('Tigres del Norte', 'Mexico', 20),
    ('Leones United', 'Spain', 18),
    ('Rovers FC', 'England', 21);
GO

INSERT INTO LeagueTeams (LeagueId, TeamId)
SELECT league.Id, team.Id
FROM (VALUES
    ('Liga Nacional', 'Aguilas FC'),
    ('Liga Nacional', 'Tigres del Norte'),
    ('Liga Nacional', 'Leones United'),
    ('Copa Internacional', 'Aguilas FC'),
    ('Copa Internacional', 'Leones United'),
    ('Copa Internacional', 'Rovers FC')
) AS membership (LeagueName, TeamName)
INNER JOIN Leagues AS league ON league.Name = membership.LeagueName
INNER JOIN Teams AS team ON team.Name = membership.TeamName;
GO