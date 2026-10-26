import type { Project } from '../constants/projects';
import RetroWindow from './RetroWindow';

export default function ProjectCard({ project }: { project: Project }) {
  const { photo } = project;
  const links = [
    { label: 'Source', href: project.source },
    ...(project.demo ? [{ label: 'Demo', href: project.demo }] : []),
    { label: 'MLH', href: project.mlh },
  ];
  return (
    <article className="project" id={project.slug} data-group={project.group} aria-labelledby={`${project.slug}-name`}>
      <RetroWindow title={`${project.slug.toUpperCase()}.EXE`} status={[project.builtWith.join(' · ')]}>
        <img
          className="project__photo"
          src={`/photos/${photo.slug}.webp`}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          data-focus={photo.focus}
          loading="lazy"
          decoding="async"
        />
        <div className="project__body">
          <p className="project__award">
            <span>{project.award}</span>
            {project.place && <span className="project__place">{project.place}</span>}
          </p>
          <h4 className="project__name" id={`${project.slug}-name`}>{project.name}</h4>
          <p className="project__summary">{project.summary}</p>
          <p className="project__team"><span className="sr-only">Team: </span>{project.team.join(', ')}</p>
          <ul className="project__links">
            {links.map(link => (
              <li key={link.label}>
                <a href={link.href}>{link.label}<span aria-hidden="true">↗</span><span className="sr-only"> for {project.name}</span></a>
              </li>
            ))}
          </ul>
        </div>
      </RetroWindow>
    </article>
  );
}
