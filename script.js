const API = "https://api.github.com/users";

const form = document.getElementById("search-form");
const input = document.getElementById("search-input");

const statusLine = document.getElementById("status");

const profile = document.getElementById("profile");

const repositories = document.getElementById("repositories");

const repoHeading = document.getElementById("repo-heading");


function showSkeletons() {
  repositories.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    const skeleton = document.createElement("div");

    skeleton.className = "skeleton";

    repositories.appendChild(skeleton);
  }
}


async function getUser(username) {
  const response = await fetch(`${API}/${encodeURIComponent(username)}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("GitHub user not found.");
    }

    throw new Error(`Request failed (${response.status})`);
  }

  return response.json();
}


async function getRepositories(username) {
  const response = await fetch(
    `${API}/${encodeURIComponent(username)}/repos?sort=updated&per_page=30`,
  );

  if (!response.ok) {
    throw new Error(`Could not load repositories (${response.status})`);
  }

  return response.json();
}


function makeProfile(user) {
  const card = document.createElement("article");
  card.className = "profile-card";

  const image = document.createElement("img");
  image.className = "profile-image";
  image.src = user.avatar_url;
  image.alt = `${user.login}'s profile picture`;

  const info = document.createElement("div");
  info.className = "profile-info";


  const name = document.createElement("h2");
  name.className = "profile-name";

  name.textContent = user.name || user.login;

  const username = document.createElement("p");

  username.className = "profile-username";

  username.textContent = `@${user.login}`;

  const bio = document.createElement("p");

  bio.className = "profile-bio";

  bio.textContent = user.bio || "No bio available.";

  const stats = document.createElement("div");

  stats.className = "profile-stats";

  stats.append(
    createStat("Repositories", user.public_repos),
    createStat("Followers", user.followers),
    createStat("Following", user.following),
  );

  info.append(name, username, bio, stats);

  card.append(image, info);

  profile.innerHTML = "";

  profile.appendChild(card);
}


function createStat(label, value) {
  const stat = document.createElement("span");

  stat.className = "stat";

  const strong = document.createElement("strong");

  strong.textContent = value;

  stat.append(strong, ` ${label}`);

  return stat;
}

function makeRepository(repo) {
  const card = document.createElement("article");

  card.className = "repo-card";

  const name = document.createElement("h3");

  name.className = "repo-name";

  const link = document.createElement("a");

  link.href = repo.html_url;

  link.target = "_blank";

  link.rel = "noopener";

  link.textContent = repo.name;

  name.appendChild(link);

  const description = document.createElement("p");

  description.className = "repo-description";

  description.textContent = repo.description || "No description available.";

  const meta = document.createElement("div");

  meta.className = "repo-meta";

  const language = document.createElement("span");

  language.textContent = `💻 ${repo.language || "Unknown"}`;

  const stars = document.createElement("span");

  stars.textContent = `⭐ ${repo.stargazers_count}`;

  const forks = document.createElement("span");

  forks.textContent = `🍴 ${repo.forks_count}`;

  meta.append(language, stars, forks);

  card.append(name, description, meta);

  return card;
}


function renderRepositories(repos) {
  repositories.innerHTML = "";

  if (repos.length === 0) {
    repoHeading.textContent = "Repositories";

    repositories.textContent = "This user has no public repositories.";

    return;
  }

  repoHeading.textContent = `Repositories (${repos.length})`;

  const fragment = document.createDocumentFragment();

  repos.forEach((repo) => {
    fragment.appendChild(makeRepository(repo));
  });

  repositories.appendChild(fragment);
}

async function search(username) {

  const trimmed = username.trim();

  if (!trimmed) {
    statusLine.textContent = "Enter a GitHub username.";

    statusLine.classList.remove("error");

    profile.innerHTML = "";

    repositories.innerHTML = "";

    repoHeading.textContent = "";

    return;
  }

  statusLine.textContent = `Searching for @${trimmed}...`;

  statusLine.classList.remove("error");

  profile.innerHTML = "";

  repoHeading.textContent = "";

  showSkeletons();

  try {
    // Fetch both at the same time
    const [user, repos] = await Promise.all([
      getUser(trimmed),
      getRepositories(trimmed),
    ]);

    makeProfile(user);

    renderRepositories(repos);

    statusLine.textContent = `Showing GitHub profile for @${user.login}.`;
  } catch (error) {
    statusLine.textContent = error.message || "Something went wrong.";

    statusLine.classList.add("error");

    profile.innerHTML = "";

    repositories.innerHTML = "";

    repoHeading.textContent = "";

    console.error(error);
  }
}



form.addEventListener("submit", (event) => {
  event.preventDefault();

  search(input.value);
});

window.addEventListener("DOMContentLoaded", () => {
  input.value = "sagar-kumar3099";

  search("sagar-kumar3099");
});