import { heritageImages } from '../../data/heritage'

export function Heritage() {
  return <section id="lineage" className="heritage">
    <div className="heritage-intro"><p className="eyebrow">ROOTED IN A LIVING TRADITION</p><h2>Learning in the footsteps<br />of the masters.</h2><p>A tribute to the teachers and composers whose music continues to guide us.</p>
    </div>
    <div className="masters">{heritageImages.map(person => <figure className="master" key={person.name}>
      <a className="portrait-frame" href={person.source} target="_blank" rel="noreferrer" title={person.creator + ' · ' + person.license} aria-label={'View image source for ' + person.name}><img src={import.meta.env.BASE_URL + person.file} alt={person.alt} loading="lazy" width="140" height="168" /></a>
      <figcaption><h3>{person.name}</h3><span>{person.title}</span></figcaption>
    </figure>)}</div>
  </section>
}
