import type { Photo } from '../constants/photos';

// The photo strip from the countdown screens: cards that slowly scroll past. The list is
// rendered twice so the loop is seamless; the copy is hidden from assistive technology.
export default function PhotoStrip({ photos }: { photos: Photo[] }) {
  return (
    <div className="strip" role="img" aria-label={`A scrolling strip of ${photos.length} photos from Hacklonega`}>
      <div className="strip__track">
        {[...photos, ...photos].map((photo, i) => (
          <figure className="strip__card" key={`${photo.slug}-${i}`} data-copy={i >= photos.length || undefined}>
            <img src={`/photos/thumb/${photo.slug}.webp`} alt="" width={photo.width} height={photo.height} loading="lazy" decoding="async" />
            <figcaption><span>{photo.time || 'Oct 24'}</span><span>{photo.name}</span></figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
