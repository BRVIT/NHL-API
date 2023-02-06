import "./main.js";
import axios from "axios";
import teamsLogo from "./teamsPhoto.json";
// Common
const EAST_ID = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 17, 29];
const EXCLUDED_TEAMS = [
  11, 27, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
  48, 49, 50, 51,
];
const TEAMS = 56;

// Stats
const overallStandingContainer = document.querySelector(
  "[data-overall-standings]"
);
const eastStandingContainer = document.querySelector("[data-east-standing]");
const westStandingContainer = document.querySelector("[data-west-standing]");
const overallTemplate = document.querySelector("#table");
let teamPromisesforStats = [];
let overallStats = [];
let westStats = [];
let eastStats = [];
// Render
const allTeamsContainer = document.querySelector("[data-all-teams]");
const eastTeamsContainer = document.querySelector("[data-east-teams]");
const westTeamsContainer = document.querySelector("[data-west-teams]");
const teamTemplate = document.querySelector("#team");
let teamPromisesforRender = [];
let teamPromisesForPrompt = [];
let overallTeams = [];
let westTeams = [];
let eastTeams = [];
// Overlay
const getOverlay = document.querySelector("#overlay");
// Filter
const inputFinder = document.querySelector("[data-team-finder]");

renderSkeleton();
getTeamForRender(overallTeams, eastTeams, westTeams, teamsLogo);
getTeamForRanking(overallStats, eastStats, westStats);

// Filter
inputFinder.addEventListener("input", (e) => {
  const teams = document.querySelectorAll(".team");
  teams.forEach((team) => {
    let individualTeam = team.children[1].innerText;
    if (!individualTeam.toLowerCase().includes(e.target.value.toLowerCase())) {
      team.classList.add("hide");
    } else {
      team.classList.remove("hide");
    }
  });

  const eastTeamsContainerFilter = document.querySelector(
    ".teams__rendered-teams--east"
  );
  const westTeamsContainerFilter = document.querySelector(
    ".teams__rendered-teams--west"
  );
  const allTeamsContainerFilter = document.querySelector(
    ".teams__rendered-teams--all"
  );

  const filteredEast = eastTeams.filter((team) =>
    team.fullName.toLowerCase().includes(e.target.value.toLowerCase())
  );

  const filteredWest = westTeams.filter((team) =>
    team.fullName.toLowerCase().includes(e.target.value.toLowerCase())
  );

  const filteredAll = overallTeams.filter((team) =>
    team.fullName.toLowerCase().includes(e.target.value.toLowerCase())
  );

  if (filteredEast.length === 0) {
    eastTeamsContainerFilter.classList.add("hide");
  } else if (filteredEast.length > 0) {
    eastTeamsContainerFilter.classList.remove("hide");
  }

  if (filteredWest.length === 0) {
    westTeamsContainerFilter.classList.add("hide");
  } else if (filteredWest.length > 0) {
    westTeamsContainerFilter.classList.remove("hide");
  }

  if (filteredAll.length === 0) {
    allTeamsContainerFilter.classList.add("hide");
  } else if (filteredAll.length > 0) {
    allTeamsContainerFilter.classList.remove("hide");
  }
});

// Popup
document.addEventListener("click", (e) => {
  if (!e.target.matches(".show-popup")) return;
  const button = e.target;
  const teamContainer = button.closest(".team");
  const teamPopup = teamContainer.querySelector(".team__pop-up");
  const closeButton = teamPopup.querySelector(".pop-up__close-button");
  teamPopup.classList.toggle("hide");
  closeButton.addEventListener("click", () => {
    teamPopup.classList.add("hide");
    if (teamPopup.classList.contains("hide")) {
      getOverlay.classList.remove("active");
    }
  });
  if (!teamPopup.classList.contains("hide")) {
    getOverlay.classList.add("active");
  }
});

// Table
document.addEventListener("click", (e) => {
  if (!e.target.matches(".table")) return;
  const tableTeams = document.querySelector(".teams__small-tables");
  const renderedTeams = document.querySelectorAll(".teams__rendered-teams");

  const navBar = document.querySelector(".navigation");
  const navOpen = document.querySelector(".navigation__icon--open");
  const navClose = document.querySelector(".navigation__icon--close");

  renderedTeams.forEach((team) => {
    team.classList.toggle("hide");
  });

  tableTeams.classList.toggle("flex");
  navOpen.classList.remove("hide-nav");
  navBar.classList.add("hide-nav");
  navClose.classList.add("hide-nav");
});

const body = document.querySelector("body");

const observer = new ResizeObserver((e) => {
  const pageWidth = e[0].contentRect.width;
  if (pageWidth > 800) {
    const renderedTeams = document.querySelectorAll(".teams__rendered-teams");
    const tableTeams = document.querySelector(".teams__small-tables");

    renderedTeams.forEach((team) => {
      team.classList.remove("hide");
    });

    tableTeams.classList.remove("flex");
  }
});

observer.observe(body);

// Skeleton
function renderSkeleton() {
  for (let i = 0; i < 32; i++) {
    allTeamsContainer.append(teamTemplate.content.cloneNode(true));
    overallStandingContainer.append(overallTemplate.content.cloneNode(true));
  }
  for (let i = 0; i < 16; i++) {
    eastTeamsContainer.append(teamTemplate.content.cloneNode(true));
    westTeamsContainer.append(teamTemplate.content.cloneNode(true));

    eastStandingContainer.append(overallTemplate.content.cloneNode(true));
    westStandingContainer.append(overallTemplate.content.cloneNode(true));
  }
}

// Functions
function getTeamForRender(
  arrayForOverallRender,
  arrayForEastRender,
  arrayForWestRender,
  logo
) {
  getPromisesForTeams(teamPromisesforRender, teamPromisesForPrompt);
  Promise.all(teamPromisesForPrompt).then((res) => {
    res.map((r) => {
      allTeamsContainer.innerHTML = "";
      eastTeamsContainer.innerHTML = "";
      westTeamsContainer.innerHTML = "";
      getOverlay.classList.remove("active");
      const teams = r.data.teams[0];

      const {
        id: teamId,
        name: fullName,
        abbreviation,
        teamName,
        locationName,
        firstYearOfPlay,
        conference,
        division,
        venue,
        officialSiteUrl,
      } = teams;

      const { name: conferenceName } = conference;
      const { name: divisionName } = division;
      const { city: cityName } = venue;

      const team = {
        teamId,
        fullName,
        abbreviation,
        teamName,
        locationName,
        firstYearOfPlay,
        conferenceName,
        divisionName,
        cityName,
        officialSiteUrl,
      };

      if (EAST_ID.includes(teamId)) {
        eastTeams.push(team);
        arrayForEastRender.sort((a, b) => {
          const nameA = a.fullName.toUpperCase();
          const nameB = b.fullName.toUpperCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        });
      } else {
        westTeams.push(team);
        arrayForWestRender.sort((a, b) => {
          const nameA = a.fullName.toUpperCase();
          const nameB = b.fullName.toUpperCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        });
      }
      arrayForOverallRender.push(team);
      arrayForOverallRender.sort((a, b) => {
        const nameA = a.fullName.toUpperCase();
        const nameB = b.fullName.toUpperCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
    });

    renderAllTeams(arrayForOverallRender, logo);
    renderEastTeams(arrayForEastRender, logo);
    renderWestTeams(arrayForWestRender, logo);
  });
}

function getTeamForRanking(
  arrayForOverallStats,
  arrayForEastStats,
  arrayForWestStats
) {
  getPromisesForTeams(teamPromisesforStats, teamPromisesForPrompt);

  Promise.all(teamPromisesforStats).then((res) => {
    res.map((r) => {
      overallStandingContainer.innerHTML = "";
      eastStandingContainer.innerHTML = "";
      westStandingContainer.innerHTML = "";
      const teams = r.data.stats[0].splits[0]?.team;
      if (!teams) return;

      const { id: teamId, name: fullName } = teams;
      const stats = r.data.stats[0].splits[0]?.stat;

      const {
        gamesPlayed: games,
        wins: wins,
        losses: losses,
        ot: ot,
        pts: points,
      } = stats;

      const team = {
        teamId,
        fullName,
        games,
        wins,
        losses,
        ot,
        points,
      };

      if (EAST_ID.includes(teamId)) {
        arrayForEastStats.push(team);
        arrayForEastStats.sort((a, b) => b.points - a.points);
      } else {
        arrayForWestStats.push(team);
        arrayForWestStats.sort((a, b) => b.points - a.points);
      }

      arrayForOverallStats.push(team);
      arrayForOverallStats.sort((a, b) => b.points - a.points);
    });
    renderOverallPosition(arrayForOverallStats);
    renderEastPosition(arrayForEastStats);
    renderWestPosition(arrayForWestStats);
  });
}

function getPromisesForTeams(promisesForStats, promisesForPrompt) {
  for (let x = 1; x < TEAMS; x++) {
    promisesForStats.push(
      axios.get(`https://statsapi.web.nhl.com/api/v1/teams/${x}/stats`)
    );
  }
  for (let x = 1; x < TEAMS; x++) {
    if (!EXCLUDED_TEAMS.includes(x)) {
      promisesForPrompt.push(
        axios.get(`https://statsapi.web.nhl.com/api/v1/teams/${x}`)
      );
    }
  }
}

function renderOverallPosition(stats) {
  stats.map((s, index) => {
    let overallTemplateClone = overallTemplate.content.cloneNode(true);
    const teamPosition = overallTemplateClone.querySelector("[data-position]");
    teamPosition.classList.remove("skeleton", "skeleton-table");
    teamPosition.innerText = index + 1;

    const fullName = overallTemplateClone.querySelector("[data-name]");
    fullName.classList.remove("skeleton", "skeleton-table");
    fullName.innerText = s.fullName;

    const games = overallTemplateClone.querySelector("[data-games]");
    games.classList.remove("skeleton", "skeleton-table");
    games.innerText = s.games;

    const wins = overallTemplateClone.querySelector("[data-wins]");
    wins.classList.remove("skeleton", "skeleton-table");
    wins.innerText = s.wins;

    const loses = overallTemplateClone.querySelector("[data-loses]");
    loses.classList.remove("skeleton", "skeleton-table");
    loses.innerText = s.losses;

    const losesInOvertime = overallTemplateClone.querySelector(
      "[data-loses-overtime]"
    );
    losesInOvertime.classList.remove("skeleton", "skeleton-table");
    losesInOvertime.innerText = s.ot;

    const points = overallTemplateClone.querySelector("[data-points]");
    points.classList.remove("skeleton", "skeleton-table");
    points.innerText = s.points;
    overallStandingContainer.appendChild(overallTemplateClone);
  });
}

function renderEastPosition(stats) {
  stats.map((s, index) => {
    let overallTemplateClone = overallTemplate.content.cloneNode(true);
    const teamPosition = overallTemplateClone.querySelector("[data-position]");
    teamPosition.classList.remove("skeleton", "skeleton-table");
    teamPosition.innerText = index + 1;

    const fullName = overallTemplateClone.querySelector("[data-name]");
    fullName.classList.remove("skeleton", "skeleton-table");
    fullName.innerText = s.fullName;

    const games = overallTemplateClone.querySelector("[data-games]");
    games.classList.remove("skeleton", "skeleton-table");
    games.innerText = s.games;

    const wins = overallTemplateClone.querySelector("[data-wins]");
    wins.classList.remove("skeleton", "skeleton-table");
    wins.innerText = s.wins;

    const loses = overallTemplateClone.querySelector("[data-loses]");
    loses.classList.remove("skeleton", "skeleton-table");
    loses.innerText = s.losses;

    const losesInOvertime = overallTemplateClone.querySelector(
      "[data-loses-overtime]"
    );
    losesInOvertime.classList.remove("skeleton", "skeleton-table");
    losesInOvertime.innerText = s.ot;

    const points = overallTemplateClone.querySelector("[data-points]");
    points.classList.remove("skeleton", "skeleton-table");
    points.innerText = s.points;
    eastStandingContainer.appendChild(overallTemplateClone);
  });
}

function renderWestPosition(stats) {
  stats.map((s, index) => {
    let overallTemplateClone = overallTemplate.content.cloneNode(true);
    const teamPosition = overallTemplateClone.querySelector("[data-position]");
    teamPosition.classList.remove("skeleton", "skeleton-table");
    teamPosition.innerText = index + 1;

    const fullName = overallTemplateClone.querySelector("[data-name]");
    fullName.classList.remove("skeleton", "skeleton-table");
    fullName.innerText = s.fullName;

    const games = overallTemplateClone.querySelector("[data-games]");
    games.classList.remove("skeleton", "skeleton-table");
    games.innerText = s.games;

    const wins = overallTemplateClone.querySelector("[data-wins]");
    wins.classList.remove("skeleton", "skeleton-table");
    wins.innerText = s.wins;

    const loses = overallTemplateClone.querySelector("[data-loses]");
    loses.classList.remove("skeleton", "skeleton-table");
    loses.innerText = s.losses;

    const losesInOvertime = overallTemplateClone.querySelector(
      "[data-loses-overtime]"
    );
    losesInOvertime.classList.remove("skeleton", "skeleton-table");
    losesInOvertime.innerText = s.ot;

    const points = overallTemplateClone.querySelector("[data-points]");
    points.classList.remove("skeleton", "skeleton-table");
    points.innerText = s.points;
    westStandingContainer.appendChild(overallTemplateClone);
  });
}

function renderAllTeams(teams, logos) {
  teams.map((team) => {
    const teamTemplateClone = teamTemplate.content.cloneNode(true);

    const button = teamTemplateClone.querySelector("[data-btn]");
    button.classList.remove("skeleton", "skeleton-button");
    button.innerText = "Zisti viac";

    const skeletonImg = teamTemplateClone.querySelector("[data-skeleton-img]");
    skeletonImg.classList.remove("skeleton", "skeleton-img");

    const skeletonImgPopup = teamTemplateClone.querySelector(
      "[data-skeleton-img-popup]"
    );
    skeletonImgPopup.classList.remove("skeleton", "skeleton-img");

    const fullName = teamTemplateClone.querySelector("[data-name]");
    fullName.classList.remove("skeleton", "skeleton-text");
    fullName.innerText = team.fullName;

    const closeButtonPopup = teamTemplateClone.querySelector(
      "[data-close-button-popup]"
    );
    closeButtonPopup.classList.add("ph-x");
    closeButtonPopup.classList.remove("skeleton", "skeleton-close-button");

    const teamNameHeading = teamTemplateClone.querySelector(
      "[data-heading-name]"
    );
    teamNameHeading.classList.remove("skeleton", "skeleton-popup-heading");
    teamNameHeading.innerText = team.fullName;

    const fullNamePopup = teamTemplateClone.querySelector(
      "[data-full-name-popup]"
    );
    fullNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    fullNamePopup.innerText = team.fullName;

    const abbreviationPopup = teamTemplateClone.querySelector(
      "[data-abbreviation-popup]"
    );
    abbreviationPopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    abbreviationPopup.innerText = team.abbreviation;

    const firstYearOfPlayPopup = teamTemplateClone.querySelector(
      "[data-first-year-popup]"
    );
    firstYearOfPlayPopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    firstYearOfPlayPopup.innerText = team.firstYearOfPlay;

    const teamNamePopup = teamTemplateClone.querySelector(
      "[data-team-name-popup]"
    );
    teamNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    teamNamePopup.innerText = team.teamName;

    const locationNamePopup = teamTemplateClone.querySelector(
      "[data-location-name-popup]"
    );
    locationNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    locationNamePopup.innerText = team.locationName;

    const cityNamePopup = teamTemplateClone.querySelector(
      "[data-city-name-popup]"
    );
    cityNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    cityNamePopup.innerText = team.cityName;

    const conferenceNamePopup = teamTemplateClone.querySelector(
      "[data-conference-name-popup]"
    );
    conferenceNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    conferenceNamePopup.innerText = team.conferenceName;

    const divisionNamePopup = teamTemplateClone.querySelector(
      "[data-division-name-popup]"
    );
    divisionNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    divisionNamePopup.innerText = team.divisionName;

    const officialSitePopup = teamTemplateClone.querySelector(
      "[data-official-site-url-popup]"
    );
    officialSitePopup.classList.remove("skeleton", "skeleton-popup-button");
    officialSitePopup.innerText = "Navštívte stránku";
    officialSitePopup.href = team.officialSiteUrl;

    logos.map((logo) => {
      if (team.teamId === logo.id) {
        const teamLogo = teamTemplateClone.querySelector("[data-nhl-logo]");
        teamLogo.src = `./imgs/logos/${logo.image}`;
        const teamLogoPopup = teamTemplateClone.querySelector(
          "[data-nhl-logo-popup]"
        );
        teamLogoPopup.src = `./imgs/logos/${logo.image}`;
      }
    });
    allTeamsContainer.appendChild(teamTemplateClone);
  });
}

function renderEastTeams(teams, logos) {
  teams.map((team) => {
    const teamTemplateClone = teamTemplate.content.cloneNode(true);

    const button = teamTemplateClone.querySelector("[data-btn]");
    button.classList.remove("skeleton", "skeleton-button");
    button.innerText = "Zisti viac";

    const skeletonImg = teamTemplateClone.querySelector("[data-skeleton-img]");
    skeletonImg.classList.remove("skeleton", "skeleton-img");

    const fullName = teamTemplateClone.querySelector("[data-name]");
    fullName.classList.remove("skeleton", "skeleton-text");
    fullName.innerText = team.fullName;

    const teamNameHeading = teamTemplateClone.querySelector(
      "[data-heading-name]"
    );
    teamNameHeading.classList.remove("skeleton", "skeleton-popup-heading");
    teamNameHeading.innerText = team.fullName;

    const fullNamePopup = teamTemplateClone.querySelector(
      "[data-full-name-popup]"
    );
    fullNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    fullNamePopup.innerText = team.fullName;

    const abbreviationPopup = teamTemplateClone.querySelector(
      "[data-abbreviation-popup]"
    );
    abbreviationPopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    abbreviationPopup.innerText = team.abbreviation;

    const firstYearOfPlayPopup = teamTemplateClone.querySelector(
      "[data-first-year-popup]"
    );
    firstYearOfPlayPopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    firstYearOfPlayPopup.innerText = team.firstYearOfPlay;

    const teamNamePopup = teamTemplateClone.querySelector(
      "[data-team-name-popup]"
    );
    teamNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    teamNamePopup.innerText = team.teamName;

    const locationNamePopup = teamTemplateClone.querySelector(
      "[data-location-name-popup]"
    );
    locationNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    locationNamePopup.innerText = team.locationName;

    const cityNamePopup = teamTemplateClone.querySelector(
      "[data-city-name-popup]"
    );
    cityNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    cityNamePopup.innerText = team.cityName;

    const conferenceNamePopup = teamTemplateClone.querySelector(
      "[data-conference-name-popup]"
    );
    conferenceNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    conferenceNamePopup.innerText = team.conferenceName;

    const divisionNamePopup = teamTemplateClone.querySelector(
      "[data-division-name-popup]"
    );
    divisionNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    divisionNamePopup.innerText = team.divisionName;

    const officialSitePopup = teamTemplateClone.querySelector(
      "[data-official-site-url-popup]"
    );
    officialSitePopup.classList.remove("skeleton", "skeleton-popup-button");
    officialSitePopup.innerText = "Navštívte stránku";
    officialSitePopup.href = team.officialSiteUrl;

    logos.map((logo) => {
      if (team.teamId === logo.id) {
        const teamLogo = teamTemplateClone.querySelector("[data-nhl-logo]");
        teamLogo.src = `./imgs/logos/${logo.image}`;
        const teamLogoPopup = teamTemplateClone.querySelector(
          "[data-nhl-logo-popup]"
        );
        teamLogoPopup.src = `./imgs/logos/${logo.image}`;
      }
    });

    eastTeamsContainer.appendChild(teamTemplateClone);
  });
}

function renderWestTeams(teams, logos) {
  teams.map((team) => {
    const teamTemplateClone = teamTemplate.content.cloneNode(true);

    const button = teamTemplateClone.querySelector("[data-btn]");
    button.classList.remove("skeleton", "skeleton-button");
    button.innerText = "Zisti viac";

    const skeletonImg = teamTemplateClone.querySelector("[data-skeleton-img]");
    skeletonImg.classList.remove("skeleton", "skeleton-img");

    const fullName = teamTemplateClone.querySelector("[data-name]");
    fullName.classList.remove("skeleton", "skeleton-text");
    fullName.innerText = team.fullName;

    const teamNameHeading = teamTemplateClone.querySelector(
      "[data-heading-name]"
    );
    teamNameHeading.classList.remove("skeleton", "skeleton-popup-heading");
    teamNameHeading.innerText = team.fullName;

    const fullNamePopup = teamTemplateClone.querySelector(
      "[data-full-name-popup]"
    );
    fullNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    fullNamePopup.innerText = team.fullName;

    const abbreviationPopup = teamTemplateClone.querySelector(
      "[data-abbreviation-popup]"
    );
    abbreviationPopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    abbreviationPopup.innerText = team.abbreviation;

    const firstYearOfPlayPopup = teamTemplateClone.querySelector(
      "[data-first-year-popup]"
    );
    firstYearOfPlayPopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    firstYearOfPlayPopup.innerText = team.firstYearOfPlay;

    const teamNamePopup = teamTemplateClone.querySelector(
      "[data-team-name-popup]"
    );
    teamNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    teamNamePopup.innerText = team.teamName;

    const locationNamePopup = teamTemplateClone.querySelector(
      "[data-location-name-popup]"
    );
    locationNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    locationNamePopup.innerText = team.locationName;

    const cityNamePopup = teamTemplateClone.querySelector(
      "[data-city-name-popup]"
    );
    cityNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    cityNamePopup.innerText = team.cityName;

    const conferenceNamePopup = teamTemplateClone.querySelector(
      "[data-conference-name-popup]"
    );

    conferenceNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    conferenceNamePopup.innerText = team.conferenceName;

    const divisionNamePopup = teamTemplateClone.querySelector(
      "[data-division-name-popup]"
    );
    divisionNamePopup.parentElement.classList.remove(
      "skeleton",
      "skeleton-popup-text"
    );
    divisionNamePopup.innerText = team.divisionName;

    const officialSitePopup = teamTemplateClone.querySelector(
      "[data-official-site-url-popup]"
    );
    officialSitePopup.classList.remove("skeleton", "skeleton-popup-button");
    officialSitePopup.innerText = "Navštívte stránku";
    officialSitePopup.href = team.officialSiteUrl;

    logos.map((logo) => {
      if (team.teamId === logo.id) {
        const teamLogo = teamTemplateClone.querySelector("[data-nhl-logo]");
        teamLogo.src = `./imgs/logos/${logo.image}`;
        const teamLogoPopup = teamTemplateClone.querySelector(
          "[data-nhl-logo-popup]"
        );
        teamLogoPopup.src = `./imgs/logos/${logo.image}`;
      }
    });

    westTeamsContainer.appendChild(teamTemplateClone);
  });
}
