import { useId } from 'react';

// The steeple pixel map comes from the project's existing Hacklonega banner,
// so the site and the banner feel like one event.
const steeple = [
  '...................g.................',
  '...................gg................',
  '..................ggg................',
  '..................ggg................',
  '.................gggg................',
  '.................gggg................',
  '................ggggggg..............',
  '................ggggg.g..............',
  '...............gggggg.g..............',
  '...............gggggg.g..............',
  '..............ggggggg.gg.............',
  '..............ggggggg.gg.............',
  '..............ggggggg.gg.............',
  '.............gggggggg.ggg............',
  '.............gggggggg..gg............',
  '............ggggggggg..ggg...........',
  '............ggg.gggggg.gggg..........',
  '...........ggg...ggggg.gggg..........',
  '..........gggg....gg...gggg..........',
  '.........gggg...........gg...........',
  '........ggg....ww...w................',
  '..............wwwwwww......g.........',
  '...........wwwwwwwwww..w...g.........',
  '.........wwwwwwwwwwww..www.gg........',
  '..........wwwwwwwwwww..www..g........',
  '..........wwwwwwwwwww..wwww..g.......',
  '..........wwwwwwwwwww..wwww..........',
  '..........wwwwwwwwwww..wwww..........',
  '..........wwwwwwwwwww..wwww..........',
  '..........wwwwwwwwwww..wwww..........',
  '..........wwwwwwwwwww..wwww..........',
  '..........wwwww........wwww..........',
  '..........www............ww..........',
  '..........ww....wwwwwww..............',
  '..............wwwwwwwwwww............',
  '............wwww.........ww..........',
  '...........www.......................',
  '.........www.........................',
];

const steeplePixels = steeple.flatMap((row, rowIndex) =>
  row.split('').flatMap((cell, columnIndex) => cell === '.'
    ? []
    : [<rect x={columnIndex} y={rowIndex} width="1" height="1" fill={cell === 'g' ? '#ffc62f' : '#f3eedf'} key={`${rowIndex}-${columnIndex}`} />]),
);

/** The Dahlonega steeple in its circle: the hero artwork and the stress ball's texture. */
export default function DahlonegaScene() {
  const id = useId();
  const clip = `${id}-circle`;
  const title = `${id}-title`;
  return (
    <svg className="dahlonega-scene" viewBox="0 0 520 340" role="img" aria-labelledby={title}>
      <title id={title}>The original gold and cream Dahlonega pixel steeple with layered mountains and pine trees, contained within a cobalt circle</title>
      <defs>
        <clipPath id={clip}>
          <circle cx="322" cy="153" r="137" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        {/* A night sky a step darker than the page keeps the circle distinct. */}
        <circle cx="322" cy="153" r="137" fill="#0e2461" />
        <g fill="#92b6e6" opacity=".55">
          <path d="M207 105h18v-5h24v5h17v4h-59zm167-30h19v-5h27v5h22v4h-68z" />
          <path d="M250 57h3v3h-3zm151 43h4v4h-4zm-176 40h3v3h-3z" />
          <path d="M415 129h14v2h-14zm6-6h2v14h-2z" />
        </g>
        <path d="M175 210v-25h20v-15h20v-17h20v-16h18v18h20v18h20v17h25v-12h24v-18h20v-20h20v-17h18v17h18v18h20v18h25v20h22v115H175Z" fill="#3764b5" />
        <path d="M175 238v-20h23v-14h23v-16h23v-14h20v15h23v17h24v19h24v-10h22v-16h24v-18h21v16h24v17h23v18h29v69H175Z" fill="#254984" />
        <path d="M175 270v-19h30v-12h31v-10h29v12h34v12h33v-13h31v-13h28v11h30v13h29v10h23v40H175Z" fill="#173561" />
        <g fill="#10294f">
          <path d="M219 205h5v8h5v8h5v7h-9v14h-7v-14h-9v-7h5v-8h5zm-21 21h5v7h5v7h4v7h-8v13h-7v-13h-8v-7h4v-7h5z" />
          <path d="M405 207h5v9h5v8h5v8h-10v16h-6v-16h-10v-8h5v-8h6zm27 20h5v7h5v8h5v7h-10v16h-6v-16h-9v-7h5v-8h5z" />
        </g>
        <path d="M238 262h25v3h-25zm109 10h32v3h-32zm-60 9h17v3h-17z" fill="#5074a3" />
        <g data-steeple="" transform="translate(216 35) scale(5.5)" shapeRendering="crispEdges">{steeplePixels}</g>
      </g>
    </svg>
  );
}
