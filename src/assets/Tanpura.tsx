export function Tanpura() {
  return <svg className="tanpura-art" viewBox="0 0 420 350" aria-hidden="true">
    <defs><radialGradient id="halo"><stop stopColor="#F59E0B" stopOpacity=".14" /><stop offset="1" stopColor="#F59E0B" stopOpacity="0" /></radialGradient><linearGradient id="gourd" x2="1" y2="1"><stop stopColor="#c97c39" /><stop offset="1" stopColor="#7F1D1D" /></linearGradient></defs>
    <circle cx="210" cy="175" r="165" fill="url(#halo)" />
    {[105, 132, 159].map(r => <circle key={r} cx="210" cy="175" r={r} fill="none" stroke="#b68242" strokeOpacity=".16" strokeDasharray={r === 132 ? '2 7' : undefined} />)}
    <path d="M55 182Q95 125 139 181T227 181T315 181T395 181" fill="none" stroke="#D97706" strokeWidth=".8" opacity=".28" />
    <g transform="rotate(27 210 175)">
      <path d="M191 210L195 43Q210 33 224 43L229 210Z" fill="#8d4a2d" />
      <path d="M197 210L201 43H217L223 210" fill="#e8b872" />
      <path d="M189 198C162 208 150 232 153 257C157 295 187 313 210 313C238 313 268 293 268 256C268 230 250 206 230 198Z" fill="url(#gourd)" stroke="#89502f" strokeWidth="2" />
      <path d="M193 201C177 228 177 274 210 301C239 280 248 233 226 201Z" fill="#e5b87e" stroke="#f4d5a6" strokeWidth="1" />
      <path d="M199 208V272M206 44V275M213 44V275M220 208V272" stroke="#FFFDF7" strokeWidth=".9" />
      <rect x="195" y="265" width="30" height="6" rx="2" fill="#fff0ce" /><path d="M197 283Q210 293 224 283" stroke="#c78f48" fill="none" />
      <path d="M194 62H181M224 80H239M194 98H181M225 117H239" stroke="#89502f" strokeWidth="5" strokeLinecap="round" />
      <circle cx="210" cy="32" r="10" fill="#a36437" /><path d="M198 28Q210 19 222 28" stroke="#deb77d" fill="none" />
      <path d="M183 223Q169 248 180 271M238 224Q252 248 241 271" stroke="#f1cc94" opacity=".4" fill="none" />
    </g>
    <g fill="#a46c39" fontFamily="Georgia" fontSize="17" opacity=".65"><text x="76" y="105">सा</text><text x="327" y="136">प</text><text x="315" y="279">सा</text></g>
    <path d="M48 297H138M283 61H365" stroke="#b68242" opacity=".3" />
    <circle cx="48" cy="297" r="3" fill="#D97706" opacity=".5" /><circle cx="365" cy="61" r="3" fill="#D97706" opacity=".5" />
  </svg>
}

