import { useState } from 'react'
import { ArrowDown, ArrowRight, BookOpen, Flower2, Music2 } from 'lucide-react'
import { Navbar } from './components/common/Navbar'
import { Heritage } from './components/common/Heritage'
import { SwarasthanaWheel } from './components/theory/SwarasthanaWheel'
import { TalaExplainer } from './components/theory/TalaExplainer'
import { SthayiChart } from './components/theory/SthayiChart'
import { KaalamExplainer } from './components/theory/KaalamExplainer'
import { Tanpura } from './assets/Tanpura'
import { shrutiKeys, defaultShrutiIndex } from './data/swaras'
import { useCarnaticAudio } from './hooks/useCarnaticAudio'
import { ShrutiDrone } from './components/common/ShrutiDrone'
import { Studio } from './components/studio/Studio'
import './App.css'

function App() {
  const [page, setPage] = useState<'theory' | 'studio'>('theory')
  const [shruti, setShruti] = useState(defaultShrutiIndex)
  const baseHz = shrutiKeys[shruti].hz
  const audio = useCarnaticAudio()
  const changeShruti = (index: number) => {
    setShruti(index)
    audio.engine.configure({ baseHz: shrutiKeys[index].hz })
  }
  const changePage = (next: 'theory' | 'studio') => {
    if (next === 'theory') audio.engine.pause()
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  return <div id="top">
    <a className="skip-link" href="#main">Skip to content</a>
    <Navbar page={page} setPage={changePage} />
    <main id="main">
      {audio.snapshot.error && <div className="audio-error" role="alert">{audio.snapshot.error}</div>}
      {page === 'theory' ? <>
        <section className="hero"><div className="hero-copy"><p className="eyebrow"><span className="tiny-flower">✦</span> A JOURNEY INTO CARNATIC MUSIC</p><h1>Every melody begins<br />with a little <em>Sa.</em></h1><p className="hero-description">Discover the notes, rhythms, and traditions at the heart of Carnatic music. A thoughtful beginning to a lifelong practice.</p><a href="#swaras" className="primary-button">Explore the foundations <ArrowDown size={16} /></a><span className="hero-caption"><BookOpen size={14} /> Made for curious students & dedicated teachers</span></div><div className="hero-art"><Tanpura /><span className="art-caption">SHRUTI MATA · LAYA PITA<small>Pitch is the mother. Rhythm is the father.</small></span></div></section>
        <div className="chapter-nav" aria-label="On this page"><span>YOUR FIRST STEPS</span><a href="#swaras"><span>01</span> Swaras <ArrowRight size={13} /></a><a href="#talam"><span>02</span> Talam <ArrowRight size={13} /></a><a href="#kaalam"><span>03</span> Kaalam <ArrowRight size={13} /></a><a href="#sthayis"><span>04</span> Sthayis <ArrowRight size={13} /></a><a href="#shruti"><span>05</span> Shruti <ArrowRight size={13} /></a></div>
        <div className="content-width"><SwarasthanaWheel baseHz={baseHz} onAudition={audio.engine.audition} /><TalaExplainer /><KaalamExplainer /><SthayiChart baseHz={baseHz} onAudition={audio.engine.audition} />
          <section id="shruti" className="theory-section shruti-section"><div className="section-heading"><span className="section-number">05</span><div><p className="eyebrow">THE ANCHOR</p><h2>Come home to your Sa.</h2><p>Shruti is your reference pitch. Let every swara grow from it.</p></div></div>
            <ShrutiDrone audio={audio} shruti={shruti} onShrutiChange={changeShruti} />
          </section>
          <section className="next-chapter"><span className="next-icon"><Music2 size={28} strokeWidth={1.4} /></span><div><p className="eyebrow">FROM UNDERSTANDING TO PRACTICE</p><h2>Four chapters. A growing practice.</h2><p>Sarali, Janta, Melsthayi and Dhatu. 33 exercises in Mayamalavagowla.</p></div><button className="outline-button" onClick={() => changePage('studio')}>Enter the practice studio <ArrowRight size={16} /></button></section>
        </div>
      </> : <Studio audio={audio} shruti={shruti} onShrutiChange={changeShruti} onTheory={() => changePage('theory')} />}
      <Heritage />
    </main>
    <footer className="footer"><a className="footer-brand" href="#top"><Flower2 size={19} /> Sangeetha Bodhini</a><span>Learn with intention. Practice with joy.</span><a href="https://www.shivkumar.org/music/basics/sarali-varisai.htm" target="_blank" rel="noreferrer">Lesson notation reference ↗</a></footer>
  </div>
}
export default App
