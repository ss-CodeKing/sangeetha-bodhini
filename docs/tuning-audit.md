# Tuning audit

## Result

The application uses a modern 12-position, 16-name just-intonation teaching profile selected from a 22-shruti framework. It does not implement all 22 shrutis or reproduce a historical grama scale.

| Modern swara aliases | Ratio to Sa | Decimal | Audit |
| --- | --- | --- | --- |
| S | 1/1 | 1.000000 | Retained |
| R1 | 16/15 | 1.066667 | Retained |
| R2 / G1 | 9/8 | 1.125000 | Retained |
| R3 / G2 | 6/5 | 1.200000 | Changed from 32/27 |
| G3 | 5/4 | 1.250000 | Retained |
| M1 | 4/3 | 1.333333 | Retained |
| M2 | 45/32 | 1.406250 | Retained |
| P | 3/2 | 1.500000 | Retained |
| D1 | 8/5 | 1.600000 | Retained |
| D2 / N1 | 5/3 | 1.666667 | Retained |
| D3 / N2 | 9/5 | 1.800000 | Changed from 16/9 |
| N3 | 15/8 | 1.875000 | Retained |
| Tara S | 2/1 | 2.000000 | Verified through octave scaling |

The Mayamalavagowla ascent is S, R1, G3, M1, P, D1, N3, upper S, with ratios 1, 16/15, 5/4, 4/3, 3/2, 8/5, 15/8, 2. It is unchanged. With a 240 Hz Sa, the corresponding frequencies are 240, 256, 300, 320, 360, 384, 450, 480 Hz.

## Musicological reference and naming

Directly checked: P. Sambamoorthy, *South Indian Music*, Book IV, second edition (1954), chapter V, Table V; [scan, PDF pages 8–9](https://anaphoria.com/shruti.pdf#page=8). This chart includes both 32/27 and 6/5, both 16/9 and 9/5, and the other selected ratios. [Wolfgang von Schweinitz's transcription](https://www.plainsound.org/pdfs/srutis.pdf) provides another readable presentation of Sambamoorthy's tables.

Historical 22-shruti nomenclature differs from modern 16-name aliases. For example, Sambamoorthy lists 5/3 as trisruti dhaivata and 27/16 as chatussruti dhaivata; this app retains the requested modern D2/N1 alias with 5/3. Thus the table is an explicit application tuning choice, not a claim of one universal Carnatic tuning or a literal Shadja/Madhyama-grama transcription.

M2 uses 45/32 (prati madhyama). The source separately lists 64/45 or 729/512 as chyuta-panchama madhyama. These are higher alternatives, not Kakali Nishadham, which is N3 at 15/8 here. Likewise, 10/9, 32/27, 128/81, 27/16 and 16/9 are distinct alternatives rather than rounding errors.

The Sangita Ratnakara's historical grama framework must not be equated automatically with this modern alias table. A particular translation/passage of that treatise, and a specific C.S. Ramakrishnan edition/page, were not independently verified in this audit. Neither is cited as the direct source of these exact modern defaults. Raga intonation and gamakas are outside this fixed-pitch model.

## Western anchors and octave calculations

The previous C3–B3 table was correct to two decimal places. It is now calculated at full floating-point precision using **A4 = 440 Hz**, **C3 = MIDI 48**, and **f(m) = 440 × 2^((m − 69)/12)**. See [UNSW Music Acoustics](https://newt.phys.unsw.edu.au/jw/notes.html).

These western anchors set the absolute Sa; all other swaras still use the just ratios above. Only display text rounds to two decimals.

| Default G♯ anchor register | Frequency (Hz, rounded to 9 decimals) |
| --- | --- |
| Mandra Sa (× 0.5) | 103.826174395 |
| Madhya Sa (× 1) | 207.652348790 |
| Tara Sa (× 2) | 415.304697580 |

Frequency calculation is always baseHz × ratio × 2^octave; Tara Sa is a single octave shift, not a doubled ratio followed by another octave shift.

## Validation

Data tests cover all 16 aliases, all ratio labels, the complete Mayamalavagowla sequence including upper Sa, all twelve western anchors against independent numerical fixtures, and octave scaling across every anchor. TypeScript, production build and lint are run after the changes.
