# Bidding App

A real-time auction web app designed for sports teams to bid on players. This platform lets organizers add, edit, and manage players and teams for a tournament. The user-friendly interface lets teams bid on players to build a squad from an allotted fund.

The bidding app is a sports auction platform that facilitates the player drafting process for tournaments. It follows a hierarchical structure with seasons, events, teams, and players, supporting real-time bidding through WebSockets.

## Features

- Multi-level user roles: Super admin, event admin, and team representatives
- Tournament management: Organize tournaments by seasons and events
- Real-time bidding: Live auction interface with instant updates
- Budget management: Track team budgets during the bidding process
- Player management: Set base prices and track player status

## Tech Stack

- Frontend: Next.js (TypeScript, App Router)
- UI: Material UI
- Backend: MongoDB, JWT authentication, WebSockets

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/your-username/bidding-app.git
cd bidding-app
```

2. Install dependencies and run
```bash
npm install
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Structure

- Super Admin: Manages seasons
- Event Admin: Creates events under seasons
- Team Rep: Bids on players with budget constraints
- Players: Categorized and priced for auction

## Hierarchy

- Super Admin: Manages seasons and has all administrative privileges
- Event Admin: Creates and manages events under a season
- Team Representative: Participates in auctions to bid on players
- Players: Managed by admins, bid on by team representatives

## Development Workflow

1. Create feature branches (`git checkout -b feature/name`)
2. Follow code standards
3. Submit PRs for review