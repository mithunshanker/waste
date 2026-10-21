# Smart Compost Bin

A web dashboard for an IoT compost bin. It shows the bin's temperature, moisture, gas levels and weight, gives a compost health score, and suggests what to do next (turn the pile, add water, add dry material, and so on).

The dashboard currently runs on **simulated sensor data**, so you can demo it without any hardware. Readings update every 4 seconds, and the charts show realistic history for the last 6 hours, 24 hours and 7 days.

## Features

- **Overview:** a compost health score (0–100), live temperature, moisture and weight, and a 24-hour summary.
- **Sensor readings:** temperature, moisture, CO₂, CH₄ (methane), NH₃ (ammonia) and H₂S (hydrogen sulfide), each marked Optimal, Warning or Critical.
- **Historical trends:** charts with a 6H / 24H / 7D switch and shaded optimal ranges.
- **Smart guidance:** a recommendation based on the current readings, plus a log of recent activity.
- **Microbial activity, gas analysis and decomposition progress:** what the readings mean for the compost.
- **Light and dark mode:** follows your system setting.
- **Works on phones, tablets and desktops.**

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) with React 19 and TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) for styling
- [Recharts](https://recharts.org) for charts
- [Lucide](https://lucide.dev) for icons

## Requirements

- **Node.js 20.9 or newer** (check with `node -v`)
- **npm** (comes with Node.js)
- Git, if you're cloning the repository

## Run it locally

1. **Get the code**

   ```bash
   git clone https://github.com/mithunshanker/waste.git
   cd waste
   ```

   To use a branch other than `main`, switch to it after cloning:

   ```bash
   git checkout <branch-name>
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open the dashboard** at [http://localhost:3000](http://localhost:3000).

   The page reloads automatically when you edit a file.

### Run a production build

```bash
npm run build
npm start
```

This also serves the app at [http://localhost:3000](http://localhost:3000).

### Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server with hot reload |
| `npm run build` | Creates an optimised production build |
| `npm start` | Serves the production build (run `npm run build` first) |
| `npm run lint` | Checks the code with ESLint |

## Project structure

```
app/
├── page.tsx                  # The dashboard page; runs the live simulation
├── layout.tsx                # Root layout, font and page metadata
├── globals.css               # Colour tokens for light/dark mode
├── components/
│   ├── ui.tsx                # Shared building blocks (cards, status dots, chart colours)
│   ├── Header.tsx            # Top bar with live status and Pause/Resume
│   ├── CompostHealth.tsx     # Health score ring
│   ├── SensorCard.tsx        # One sensor reading
│   ├── DailySummary.tsx      # Last-24-hours averages and ranges
│   ├── Charts.tsx            # Temperature, moisture, weight and gas charts
│   ├── SmartGuidance.tsx     # Current recommendation and activity log
│   ├── MicrobialActivity.tsx
│   ├── GasAnalysis.tsx
│   ├── CompostProgress.tsx
│   ├── SystemWorkflow.tsx
│   └── SensorInfo.tsx
├── data/
│   └── mockSensorData.ts     # Simulated readings, history, thresholds and bin info
└── lib/
    └── compostLogic.ts       # Health score, status checks and recommendation rules
```

## How the demo data works

All simulated data comes from [`app/data/mockSensorData.ts`](app/data/mockSensorData.ts):

- **History** is generated from a fixed model of a composting batch. It includes a hot (thermophilic) phase, a temperature dip after the pile was turned, moisture that dries out and is topped up, and a steady loss of weight. The history looks the same on every reload.
- **Live readings** change slightly every 4 seconds (see `nextReading()` in [`app/page.tsx`](app/page.tsx)).
- **Bin details** (ID, location, batch day, controller) are set in `BIN_INFO`.
- **Thresholds** for Optimal, Warning and Critical are set in `THRESHOLDS`. Adjust them to match your hardware.

## Connecting real sensors

The dashboard is built so you can replace the simulated data with real data:

1. Have your Arduino or ESP32 send readings to an API, either over REST or WebSocket.
2. In `app/page.tsx`, replace the 4-second `setInterval` simulation with a fetch from that API. Each reading must match the `SensorReading` type.
3. Replace `buildHistory()` with a request for stored historical readings.
4. The scoring and recommendation rules in `app/lib/compostLogic.ts` work unchanged with real data.

## Troubleshooting

- **Port 3000 is already in use.** Run `npm run dev -- -p 3001` and open http://localhost:3001.
- **`Bus error` or a crash as soon as `next dev` or `next build` starts.** An incomplete `npm install` can leave Next's compiler file corrupted. Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules
  npm install
  ```
- **The page looks unstyled.** Stop the server, delete the `.next` folder, and run `npm run dev` again.
