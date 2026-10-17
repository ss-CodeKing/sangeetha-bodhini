import { useState } from 'react'
import { ArrowDown, ArrowRight, BookOpen, Check, Flower2, Headphones, Music2, Sparkles } from 'lucide-react'
import { Navbar } from './components/common/Navbar'
import { Heritage } from './components/common/Heritage'
import { SwarasthanaWheel } from './components/theory/SwarasthanaWheel'
import { TalaExplainer } from './components/theory/TalaExplainer'
import { SthayiChart } from './components/theory/SthayiChart'
import { Tanpura } from './assets/Tanpura'
import { shrutiKeys } from './data/swaras'
import { saraliVarisai } from './data/saraliVarisai'
import './App.css'

function App() {
  const [page, setPage] = useState<'theory' | 'studio'>('theory')
  const [shruti, setShruti] = useState(0)
  const baseHz = shrutiKeys[shruti].hz
  return <div id="top">
    <a className="skip-link" href="#main">Skip to content</a>
    <Navbar page={page} setPage={setPage} />
    <main id="main">
      {page === 'theory' ? <>
        <section className="hero"><div className="hero-copy"><p className="eyebrow"><span className="tiny-flower">✦</span> A JOURNEY INTO CARNATIC MUSIC</p><h1>Every melody begins<br />with a little <em>Sa.</em></h1><p className="hero-description">Discover the notes, rhythms, and traditions at the heart of Carnatic music. A thoughtful beginning to a lifelong practice.</p><a href="#swaras" className="primary-button">Explore the foundations <ArrowDown size={16} /></a><span className="hero-caption"><BookOpen size={14} /> Made for curious students & dedicated teachers</span></div><div className="hero-art"><Tanpura /><span className="art-caption">SHRUTI MATA · LAYA PITA<small>Pitch is the mother. Rhythm is the father.</small></span></div></section>
        <div className="chapter-nav" aria-label="On this page"><span>YOUR FIRST STEPS</span><a href="#swaras"><span>01</span> Swaras <ArrowRight size={13} /></a><a href="#talam"><span>02</span> Talam <ArrowRight size={13} /></a><a href="#sthayis"><span>03</span> Sthayis <ArrowRight size={13} /></a><a href="#shruti"><span>04</span> Shruti <ArrowRight size={13} /></a></div>
        <div className="content-width"><SwarasthanaWheel baseHz={baseHz} /><TalaExplainer /><SthayiChart baseHz={baseHz} />
          <section id="shruti" className="theory-section shruti-section"><div className="section-heading"><span className="section-number">04</span><div><p className="eyebrow">THE ANCHOR</p><h2>Come home to your Sa.</h2><p>Shruti is your reference pitch. Let every swara grow from it.</p></div></div>
            <div className="shruti-card"><div className="shruti-symbol"><Headphones size={32} strokeWidth={1.3} /></div><div className="shruti-copy"><h3>Set your adhara shadjam</h3><p>Choose a comfortable tonic with your teacher. Every frequency on this page adjusts to your Sa.</p><span className="drone-notes">P · Ṡ · S · Ṣ <span>Panchama shruti drone pattern</span></span></div><div className="shruti-select"><label htmlFor="shruti-key">YOUR MIDDLE SA</label><select id="shruti-key" value={shruti} onChange={event => setShruti(Number(event.target.value))}>{shrutiKeys.map((key, i) => <option value={i} key={key.label}>{key.label} · {key.hz} Hz</option>)}</select><span>Drone audio comes in the next step</span></div></div>
          </section>
          <section className="next-chapter"><span className="next-icon"><Music2 size={28} strokeWidth={1.4} /></span><div><p className="eyebrow">FROM UNDERSTANDING TO PRACTICE</p><h2>Your next chapter: Sarali Varisai.</h2><p>14 foundational exercises. One raga. A world of possibilities.</p></div><button className="outline-button" onClick={() => { setPage('studio'); window.scrollTo({ top: 0, behavior: 'instant' }) }}>Preview the curriculum <ArrowRight size={16} /></button></section>
        </div>
      </> : <section className="studio-preview content-width"><p className="eyebrow"><Sparkles size={15} /> THE NEXT CHAPTER</p><h1>A foundation for<br /><em>daily practice.</em></h1><p className="studio-intro">The 14 Sarali Varisai exercises are ready for review. Playback and the synchronized three-speed notation studio follow after the foundation review.</p><div className="preview-status"><Check size={17} /> Curriculum data ready <span>Audio & visualizer coming next</span></div><div className="lesson-list">{saraliVarisai.map(lesson => <article className="surface lesson-card" key={lesson.number}><span className="section-number">{String(lesson.number).padStart(2, '0')}</span><h3>{lesson.title}</h3><p>{lesson.objective}</p><small>{lesson.units.length} notation units · {lesson.kaalams[1].avartanams.length} avartanams at first speed</small></article>)}</div><button className="primary-button" onClick={() => setPage('theory')}><BookOpen size={16} /> Back to the foundations</button></section>}
      <Heritage />
    </main>
    <footer className="footer"><a className="footer-brand" href="#top"><Flower2 size={19} /> Sangeetha Bodhini</a><span>Learn with intention. Practice with joy.</span><a href="https://www.shivkumar.org/music/basics/sarali-varisai.pdf" target="_blank" rel="noreferrer">Lesson notation reference ↗</a></footer>
  </div>
}
export default App

