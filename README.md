# Football Team & Match Management System

## Project Overview

This repository contains a **Football Team & Match Management System** designed and developed by me. The application provides a centralized platform for managing football teams, players, matches, and competitions, while offering different levels of access for administrators, coaches, referees, players, and spectators.

The system is intended to support both operational management (team creation, match scheduling, result tracking) and public-facing features such as viewing fixtures, team details, and match results.

## System Description

The system is used to manage football teams, players, and upcoming matches. It enables administrators, managers, and coaches to form teams, register players, organize matches, and maintain match results and statistics. Fans, players, and staff can access schedules, team information, and match outcomes.

Access to the system is restricted based on user roles, ensuring that only authorized users can modify sensitive data.

## Functional Requirements

The system must:

* Allow administrators and coaches to add, modify, and delete teams and players, including attributes such as player name, position, age, nationality, statistics, and assigned team.
* Enable administrators to schedule matches, including date, time, venue, participating teams, and referees.
* Allow teams to register for leagues or tournaments while validating eligibility requirements (e.g., squad size, player age limits).
* Allow referees or authorized officials to record match results and player statistics, such as goals, assists, and disciplinary actions.

## Non-Functional Requirements

* Support a high volume of concurrent users, particularly on match days.
* Securely store player, team, and match-related data.
* Provide multiple access levels for players, coaches, referees, administrators, and spectators.
* Ensure fast response times for live score updates and match schedules.
* Maintain high availability with minimal downtime during competitions.

## User Interface

The user interface is designed to be intuitive and easy to use for all user roles. It provides quick access to:

* Live scores
* Match fixtures
* League standings and rankings
* Team rosters and player information

The focus is on clarity, usability, and fast navigation.

## Technology Stack

This project is built using modern frontend technologies:

* Vite
* TypeScript
* React
* shadcn/ui
* Tailwind CSS

## Getting Started

### Local Development

Ensure **Node.js** and **npm** are installed (using **nvm** is recommended).

```sh

# Install dependencies
npm install

# Start the development server
npm run dev
```

The development server includes hot reloading and instant preview.

## Author

Developed and maintained by **Mohamed Omar**
BSc Computer Science – University of Debrecen
"# football-management-system" 
"# football-management-system" 
