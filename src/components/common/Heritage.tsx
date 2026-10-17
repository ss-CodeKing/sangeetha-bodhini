import { heritageImages } from '../../data/heritage'

export function Heritage() {
  return <section id="lineage" className="heritage">
    <div className="heritage-intro"><p className="eyebrow">ROOTED IN A LIVING TRADITION</p><h2>Learning in the footsteps<br />of the masters.</h2><p>A tribute to the teachers and composers whose music continues to guide us.</p>
      <details className="image-credits"><summary>Image sources & credits</summary><ul>{heritageImages.map(person => <li key={person.name}><a href={person.source} target="_blank" rel="noreferrer">{person.name}</a> · {person.creator} · <a href={person.licenseUrl} target="_blank" rel="noreferrer">{person.license}</a>.</li>)}</ul><p>Images are displayed in fitted frames; source files are unmodified. Purandara Dasa is represented by a statue photograph. The two stamps are provided by India Post, Government of India, under the Government Open Data License – India, via Wikimedia Commons. No endorsement is implied.</p></details>
    </div>
    <div className="masters">{heritageImages.map(person => <figure className="master" key={person.name}>
      <a className="portrait-frame" href={person.source} target="_blank" rel="noreferrer" aria-label={'View image source for ' + person.name}><img src={person.file} alt={person.alt} loading="lazy" width="140" height="168" /></a>
      <figcaption><h3>{person.name}</h3><span>{person.title}</span></figcaption>
    </figure>)}</div>
  </section>
}
