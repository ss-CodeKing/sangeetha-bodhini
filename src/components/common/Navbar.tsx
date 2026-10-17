import { BookOpen, Music2, Flower2, ArrowUpRight } from 'lucide-react'

export function Navbar({ page, setPage }: { page: 'theory' | 'studio'; setPage: (page: 'theory' | 'studio') => void }) {
  return <header className="site-header">
    <div className="nav-inner">
      <a className="brand" href="#top" aria-label="Sangeetha Bodhini home"><span className="brand-mark"><Flower2 size={28} strokeWidth={1.3} /></span><span>Sangeetha Bodhini<small>THE ART OF LEARNING CARNATIC MUSIC</small></span></a>
      <nav aria-label="Main navigation">
        <button aria-current={page === 'theory' ? 'page' : undefined} className={page === 'theory' ? 'nav-link active' : 'nav-link'} onClick={() => setPage('theory')}><BookOpen size={16} /> The foundations</button>
        <button aria-current={page === 'studio' ? 'page' : undefined} className={page === 'studio' ? 'nav-link active' : 'nav-link'} onClick={() => setPage('studio')}><Music2 size={16} /> Practice studio <span className="soon">SOON</span></button>
      </nav>
      <a className="nav-about" href="#lineage">Our musical heritage <ArrowUpRight size={14} /></a>
    </div>
  </header>
}

