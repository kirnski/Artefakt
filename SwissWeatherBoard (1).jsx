import { useState, useCallback } from "react";

const TERRAINS = {
  acker: { fill: "#E8C55A", stroke: "#A5872F", dark: false, label: "Ackerland — Mittelland" },
  weide: { fill: "#8FBF63", stroke: "#5E8C3A", dark: false, label: "Weideland — Voralpen" },
  wald: { fill: "#3F7A4E", stroke: "#285134", dark: true, label: "Wald — Jura und Hügelzone" },
  gebirge: { fill: "#9AA0A6", stroke: "#63686D", dark: true, label: "Gebirge — Alpen" },
  huegel: { fill: "#C4743F", stroke: "#8A4E26", dark: true, label: "Hügelland — Süden und Rhonetal" },
};

const CONDITIONS = {
  sonnig: { label: "Sonnig", severity: 5 },
  wolkig: { label: "Bewölkt", severity: 35 },
  regen: { label: "Regen", severity: 70 },
  schnee: { label: "Schneefall", severity: 80 },
  gewitter: { label: "Gewitter", severity: 90 },
};

const REGIONS = [
  { name: "Basel", row: 0, col: 2, terrain: "acker", altitude: 270 },
  { name: "Aarau", row: 0, col: 3, terrain: "acker", altitude: 380 },
  { name: "Zürich", row: 0, col: 4, terrain: "acker", altitude: 410 },
  { name: "St.Gallen", row: 0, col: 5, terrain: "weide", altitude: 670 },
  { name: "Biel", row: 1, col: 1.5, terrain: "wald", altitude: 440 },
  { name: "Bern", row: 1, col: 2.5, terrain: "weide", altitude: 540 },
  { name: "Luzern", row: 1, col: 3.5, terrain: "weide", altitude: 435 },
  { name: "Glarus", row: 1, col: 4.5, terrain: "gebirge", altitude: 1450 },
  { name: "Appenzell", row: 1, col: 5.5, terrain: "wald", altitude: 780 },
  { name: "Genf", row: 2, col: 0, terrain: "huegel", altitude: 375 },
  { name: "Lausanne", row: 2, col: 1, terrain: "acker", altitude: 495 },
  { name: "Fribourg", row: 2, col: 2, terrain: "weide", altitude: 610 },
  { name: "Thun", row: 2, col: 3, terrain: "wald", altitude: 560 },
  { name: "Andermatt", row: 2, col: 4, terrain: "gebirge", altitude: 1440 },
  { name: "Chur", row: 2, col: 5, terrain: "weide", altitude: 590 },
  { name: "Davos", row: 2, col: 6, terrain: "gebirge", altitude: 1560 },
  { name: "Sion", row: 3, col: 1.5, terrain: "huegel", altitude: 500 },
  { name: "Zermatt", row: 3, col: 2.5, terrain: "gebirge", altitude: 1620 },
  { name: "Airolo", row: 3, col: 3.5, terrain: "gebirge", altitude: 1175 },
  { name: "Locarno", row: 3, col: 4.5, terrain: "huegel", altitude: 200 },
  { name: "St.Moritz", row: 3, col: 5.5, terrain: "gebirge", altitude: 1820 },
  { name: "Lugano", row: 4, col: 4, terrain: "huegel", altitude: 275 },
];

const SIZE = 42;
const TILE_W = Math.sqrt(3) * SIZE;
const ORIGIN_X = 118;
const ORIGIN_Y = 70;

function hexPoints(cx, cy, size) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 90);
    return `${(cx + size * Math.cos(a)).toFixed(1)},${(cy + size * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

function rollWeather() {
  const kinds = ["sonnig", "wolkig", "regen", "schnee"];
  const rolled = REGIONS.map((region) => {
    const base = 21 - region.altitude / 150 + (region.terrain === "huegel" && region.altitude < 400 ? 3 : 0);
    const temp = Math.round(base + (Math.random() * 8 - 4));
    let condition =
      temp < 1
        ? Math.random() < 0.6
          ? "schnee"
          : "wolkig"
        : kinds[Math.floor(Math.random() * kinds.length)];
    if (Math.random() < 0.1) condition = "gewitter";
    return {
      ...region,
      temp,
      condition,
      wind: 1 + Math.floor(Math.random() * 5),
      humidity: 45 + Math.floor(Math.random() * 45),
      precipitation: condition === "sonnig" ? 0 : Math.round(CONDITIONS[condition].severity * Math.random()) / 10,
    };
  });
  const robber = rolled.reduce(
    (worst, tile, i) => (CONDITIONS[tile.condition].severity > CONDITIONS[rolled[worst].condition].severity ? i : worst),
    0
  );
  return { tiles: rolled, robber };
}

function Cloud() {
  return (
    <g fill="#EEF1F4" stroke="#7E868E" strokeWidth="0.8">
      <circle cx="-5" cy="1" r="4.5" />
      <circle cx="4" cy="1" r="5" />
      <circle cx="-1" cy="-3" r="5.5" />
      <rect x="-9.5" y="0.5" width="14" height="5.5" rx="2.7" stroke="none" />
    </g>
  );
}

function WeatherIcon({ condition = "sonnig", x = 0, y = 0 }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {condition === "sonnig" && (
        <>
          <circle cx="0" cy="0" r="6" fill="#F2A623" />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (Math.PI / 4) * i;
            return (
              <line
                key={i}
                x1={(8 * Math.cos(a)).toFixed(1)}
                y1={(8 * Math.sin(a)).toFixed(1)}
                x2={(11 * Math.cos(a)).toFixed(1)}
                y2={(11 * Math.sin(a)).toFixed(1)}
                stroke="#F2A623"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            );
          })}
        </>
      )}
      {condition === "wolkig" && (
        <>
          <circle cx="6" cy="-5" r="5" fill="#F2A623" />
          <Cloud />
        </>
      )}
      {condition === "regen" && (
        <>
          <Cloud />
          <g stroke="#378ADD" strokeWidth="1.6" strokeLinecap="round">
            <line x1="-5" y1="8" x2="-6.5" y2="12" />
            <line x1="0" y1="8" x2="-1.5" y2="12" />
            <line x1="5" y1="8" x2="3.5" y2="12" />
          </g>
        </>
      )}
      {condition === "schnee" && (
        <>
          <Cloud />
          <g fill="#85B7EB">
            <circle cx="-5" cy="10" r="1.7" />
            <circle cx="0" cy="11.5" r="1.7" />
            <circle cx="5" cy="10" r="1.7" />
          </g>
        </>
      )}
      {condition === "gewitter" && (
        <>
          <Cloud />
          <polygon points="1,7 -4,7 0.5,14 -1,10 3,10" fill="#EF9F27" stroke="#854F0B" strokeWidth="0.6" />
        </>
      )}
    </g>
  );
}

function TempChip({ x, y, temp }) {
  const color = temp >= 22 ? "#A32D2D" : temp <= 0 ? "#185FA5" : "#3A3630";
  return (
    <>
      <circle cx={x} cy={y} r="15" fill="#F5EEDC" stroke="#B9A77E" />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="15"
        fontWeight="700"
        fill={color}
      >
        {temp}°
      </text>
    </>
  );
}

function WindPips({ x, y, count, color }) {
  return Array.from({ length: count }, (_, i) => (
    <circle key={i} cx={x - (count - 1) * 2.5 + i * 5} cy={y} r="1.4" fill={color} opacity="0.75" />
  ));
}

function HexTile({ tile, selected, hasRobber, onSelect }) {
  const terrain = TERRAINS[tile.terrain];
  const labelColor = terrain.dark ? "#FFFFFF" : "#2C2A24";
  const cx = ORIGIN_X + tile.col * TILE_W;
  const cy = ORIGIN_Y + tile.row * 63;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${tile.name}, ${CONDITIONS[tile.condition].label}, ${tile.temp} Grad`}
      className="cursor-pointer focus:outline-none"
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <polygon
        points={hexPoints(cx, cy, SIZE)}
        fill={terrain.fill}
        stroke={selected ? "#2C2A24" : terrain.stroke}
        strokeWidth={selected ? 4 : 2}
      />
      <WeatherIcon condition={tile.condition} x={cx} y={cy - 24} />
      <TempChip x={cx} y={cy + 2} temp={tile.temp} />
      <WindPips x={cx} y={cy + 20} count={tile.wind} color={labelColor} />
      <text x={cx} y={cy + 32} textAnchor="middle" fontSize="11.5" fontWeight="500" fill={labelColor}>
        {tile.name}
      </text>
      {hasRobber && (
        <>
          <circle cx={cx + 22} cy={cy - 22} r="9" fill="#2C2C2A" stroke="#F1EFE8" strokeWidth="1.5" />
          <text
            x={cx + 22}
            y={cy - 22}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="11"
            fill="#F1EFE8"
          >
            !
          </text>
        </>
      )}
    </g>
  );
}

function Board({ tiles, robber, selected, onSelect }) {
  return (
    <svg viewBox="0 0 680 410" className="w-full h-auto block" role="img" aria-label="Hexfeld-Wetterkarte der Schweiz">
      <rect x="52" y="2" width="576" height="406" rx="30" fill="#A9743C" />
      <rect x="60" y="10" width="560" height="390" rx="24" fill="#BCDCEF" stroke="#7FADCB" strokeWidth="1.5" />
      {tiles.map((tile, i) => (
        <HexTile
          key={tile.name}
          tile={tile}
          selected={i === selected}
          hasRobber={i === robber}
          onSelect={() => onSelect(i)}
        />
      ))}
    </svg>
  );
}

function DetailCard({ tile, hasRobber }) {
  const terrain = TERRAINS[tile.terrain];
  const rows = [
    ["Wetterlage", CONDITIONS[tile.condition].label],
    ["Temperatur", `${tile.temp} °C`],
    ["Wind", `${tile.wind * 8} km/h`],
    ["Niederschlag", `${tile.precipitation.toFixed(1)} mm`],
    ["Luftfeuchte", `${tile.humidity} %`],
    ["Höhe", `${tile.altitude} m ü. M.`],
  ];

  return (
    <div className="rounded-xl border p-5" style={{ background: "#FBF6EC", borderColor: "#E2D8C6", color: "#2E2A24" }}>
      <div className="flex items-center gap-3 mb-4">
        <span
          className="w-10 h-10 rounded-lg shrink-0"
          style={{ background: terrain.fill, border: `1px solid ${terrain.stroke}` }}
        />
        <div>
          <h2 className="text-xl leading-tight m-0">{tile.name}</h2>
          <p className="text-sm m-0" style={{ color: "#7C7365" }}>
            {terrain.label}
          </p>
        </div>
      </div>
      <dl className="grid gap-2 m-0" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(118px, 1fr))" }}>
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg px-3 py-2" style={{ background: "#F2EADC" }}>
            <dt className="text-sm m-0" style={{ color: "#7C7365" }}>
              {label}
            </dt>
            <dd className="text-base font-medium m-0">{value}</dd>
          </div>
        ))}
      </dl>
      {hasRobber && (
        <p className="text-sm mt-4 mb-0" style={{ color: "#8A4E26" }}>
          Der Räuber steht hier — schlechteste Wetterlage der Runde.
        </p>
      )}
    </div>
  );
}

function Legend() {
  return (
    <ul
      className="list-none p-0 mt-6 grid gap-2 text-sm"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", color: "#B6AC9C" }}
    >
      {Object.entries(TERRAINS).map(([key, terrain]) => (
        <li key={key} className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded shrink-0"
            style={{ background: terrain.fill, border: `1px solid ${terrain.stroke}` }}
          />
          {terrain.label}
        </li>
      ))}
      <li className="flex items-center gap-2">
        <span className="w-4 h-4 rounded-full shrink-0" style={{ background: "#F5EEDC", border: "1px solid #B9A77E" }} />
        Chip: Temperatur, Punkte: Windstärke
      </li>
      <li className="flex items-center gap-2">
        <span className="w-4 h-4 rounded-full shrink-0" style={{ background: "#2C2C2A" }} />
        Räuber: schlechteste Wetterlage
      </li>
    </ul>
  );
}

export default function SwissWeatherBoard() {
  const [{ tiles, robber }, setWeather] = useState(rollWeather);
  const [selected, setSelected] = useState(0);
  const reroll = useCallback(() => setWeather(rollWeather()), []);

  return (
    <div className="p-6" style={{ background: "#23201C", color: "#F1EBE0" }}>
      <header className="mb-6">
        <h1 className="text-3xl font-bold m-0 leading-tight">Wetterkarte Schweiz</h1>
        <p className="mt-2 mb-0 max-w-prose" style={{ color: "#B6AC9C" }}>
          Zweiundzwanzig Regionen als Sechseckfelder. Die Zahl auf dem Chip ist die Temperatur, die Punkte darunter
          sind die Windstärke. Alle Werte sind gewürfelte Beispieldaten.
        </p>
      </header>

      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <div>
          <Board tiles={tiles} robber={robber} selected={selected} onSelect={setSelected} />
          <button
            onClick={reroll}
            className="mt-4 rounded-lg px-4 py-2 font-medium"
            style={{ background: "#A9743C", color: "#FFF8EC", borderBottom: "3px solid #6F4A24" }}
          >
            Neue Wetterrunde würfeln
          </button>
          <p className="text-sm mt-2 mb-0" style={{ color: "#B6AC9C" }}>
            Feld anklicken oder mit Tabulator und Enter auswählen.
          </p>
        </div>
        <DetailCard tile={tiles[selected]} hasRobber={selected === robber} />
      </div>

      <Legend />
    </div>
  );
}
