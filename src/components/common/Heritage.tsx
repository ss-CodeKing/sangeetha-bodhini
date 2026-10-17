export function Heritage() {
  return <section id="lineage" className="heritage"><div className="heritage-intro"><p className="eyebrow">ROOTED IN A LIVING TRADITION</p><h2>Learning in the footsteps<br />of the masters.</h2><p>A tribute to the teachers and composers whose music continues to guide us.</p></div><div className="masters">{[
    ['Purandara Dasa', 'PITHAMAHA'],
    ['Thyagaraja', 'SANGEETHA TRIMURTI'],
    ['Muthuswami Dikshitar', 'SANGEETHA TRIMURTI'],
    ['Syama Sastri', 'SANGEETHA TRIMURTI'],
  ].map(([name, title], i) => <div className="master" key={name}><svg viewBox="0 0 90 90" aria-hidden="true"><circle cx="45" cy="38" r="31" fill="none" stroke="currentColor" opacity=".2" /><path d={i === 0 ? 'M38 22Q45 9 52 22L55 26H35Z' : 'M35 22Q45 13 55 22L53 26H37Z'} fill="currentColor" opacity=".65" /><circle cx="45" cy="30" r="9" fill="currentColor" opacity=".65" /><path d="M38 40Q45 44 52 40L62 62Q78 67 72 75H18Q12 67 28 62Z" fill="currentColor" opacity=".55" /><path d="M37 47L31 65M51 45L61 64M28 70Q45 61 63 70" stroke="var(--color-ivory)" fill="none" opacity=".7" /></svg><h3>{name}</h3><span>{title}</span></div>)}</div></section>
}

