# Analog device study pack (for NotebookLM)

Source: timememo.net/research/analog-devices/. This pack combines four parts: (1) the study plan (7 sessions); (2) the main guide; (3) gain and noise tricks; (4) the glossary. Everything is summarized from public material; [Inference] marks the author's judgment, and [TCAD] or [Silicon · research] numbers do not represent production processes.


---

# Study plan: seven sessions to read analog devices

Seven sessions of 40–50 minutes each — one a day, or one every other day. Each session has three steps: read 2–5 sections on this site (already summarized; no original papers needed), work through 4 self-test cards, then do a 10-minute exercise. Tick all three and the session is done. Progress is saved only in this device's browser.

## Session 1: The map: how analog and logic see the same transistor (40 min)

**Goal:** See why analog judges a device by small-signal ratios at a bias point, and learn the four core metrics and the cost each one stands for.

**Sections to read:**
- Guide: Big-picture map
- Guide: The shift in evaluation paradigm: from "switch" to "amplifier at a bias point"
- Guide: How logic optimization hurts analog devices: halo, thin oxide and low voltage
- Guide: Key metrics quick reference: definitions, focus and extraction methods
- Term: gm/ID (transconductance efficiency)
- Term: gm/gds (intrinsic gain)

**Key points:**
- Logic judges large-signal switching: Ion, Ioff, CV/I. Analog judges small-signal ratios at a bias point: gm/ID, gm/gds, fT, AVT.
- The four metrics map to four costs: power efficiency, gain, speed and precision. All move with the bias point, so compare them on one axis, gm/ID.
- Logic-driven choices often hurt analog: halos lower long-channel output resistance; thin oxides and low supply squeeze headroom.
- FinFETs have higher intrinsic gain than planar (about 40/34 at GF 14 nm), but L and W become discrete steps.

**Self-test:**
- Q: What are the four core analog metrics, and what cost does each represent?
  A: gm/ID (power efficiency), gm/gds (intrinsic gain, which sets precision), fT (speed), AVT (matching).
- Q: Why not compare gm alone?
  A: gm grows with current. Dividing by ID gives gm/ID, which compares devices at the same power.
- Q: Why are halo implants bad for long-channel analog devices?
  A: Halos form heavily doped pockets at source and drain. In a long channel this makes the channel non-uniform; the drain-side barrier then moves with VDS and output resistance drops.
- Q: Translating Ion/Ioff into analog terms, what should you look at instead?
  A: gm/gds, fT and AVT at the target gm/ID — not the current at the VDD end point.

**Exercise:** Take any ID–VGS curve you know well and mark roughly where weak, moderate and strong inversion sit. Write one sentence: if this device were in an amplifier, where would you bias it, and why?

## Session 2: gm/ID and the inversion coefficient: analog's common axis (45 min)

**Goal:** Learn to use gm/ID to pick a bias point, compute current and size a device, and know the usual pitfalls in extracting gm.

**Sections to read:**
- Guide: The gm/ID method: hanging every metric on the same x-axis
- Guide: Common extraction pitfalls: derivative noise, DC vs AC gds, de-embedding
- Term: Inversion coefficient (IC) and weak/moderate/strong inversion
- Term: fT (transition frequency)
- Term: gm (transconductance)

**Key points:**
- gm/ID depends on inversion level, not on W. Weak inversion is about 25–30 S/A (ceiling 1/(n·UT)), strong inversion below about 5–8 S/A; analog usually sits in moderate inversion at 10–15 S/A.
- Once gm/ID is chosen, the required gm sets the current and the current density ID/W sets W. That is lookup-table design.
- fT rises as gm/ID falls; gm/ID × fT peaks near moderate inversion, the speed–power sweet spot.
- gm comes from a derivative, which amplifies noise: use fine steps and smoothing; at high frequency extract from Y-parameters.

**Self-test:**
- Q: What is the theoretical weak-inversion ceiling of gm/ID, and its rough value at room temperature?
  A: 1/(n·UT), with n ≈ 1.2–1.5 and UT ≈ 26 mV: about 25–32 S/A.
- Q: Why can gm/ID compare devices of different sizes?
  A: It depends only on inversion level. Widening a device scales current and gm together, so the ratio stays put.
- Q: Moving the bias from gm/ID = 20 to 8 — what happens to speed, current and area?
  A: Stronger inversion: fT rises and the device shrinks, but the same gm costs more current and intrinsic gain usually drops.
- Q: You need gm = 1 mS at gm/ID = 15 S/A. What current?
  A: ID = gm ÷ (gm/ID) = 1 mS ÷ 15 S/A ≈ 67 µA.

**Exercise:** Write down how you would choose one analog bias point: the target gm/ID and why. Then compute: gm = 2 mS at gm/ID = 12 S/A — what current? (Answer: about 167 µA.)

## Session 3: Gain: gm/gds, DIBL, and what to do without long channels (50 min)

**Goal:** Understand why stacking short devices raises gain, by how much, how it compares with a cascode, and what else works at low supply.

**Sections to read:**
- Guide: Why gain matters and why a long channel raises it
- Tricks: Principle: step by step, why a stack looks like a long channel and why it does not fully
- Tricks: Pros and cons
- Tricks: When to use a stack and when to use a cascode
- Tricks: Other circuit techniques for raising gain
- Term: Stacked gates / series devices
- Term: Cascode and gain boosting

**Key points:**
- Intrinsic gain ≈ (gm/ID)·VEA, and VEA grows roughly with L; in short channels DIBL caps it at gm/gds ≲ 1/η.
- Stacking: N short devices in series with tied gates. In an ideal long channel it equals N·L; in short channels it acts like a self-cascode — the top device saturates, the lower ones sit in the linear region as source resistance — and gain grows roughly linearly with N (about +6 dB per doubling).
- With the same two devices, a separately biased cascode beats an N = 2 stack by about 20 dB: its lower device looks like r_o, the stack's like 1/gm. The cost is one more VDSAT and a bias line.
- Stacking pros: no bias, saves headroom, large area helps matching and 1/f. Cons: internal-node parasitics, lower fT, big pre-/post-layout gaps (about 30%, per industry comments).
- Gain per volt of headroom at low supply: CLS, ring amplifiers, gain boosting and multistage amplifiers beat stacking cascodes; digital calibration removes the need for precise gain.

**Self-test:**
- Q: Why is a stack not exactly a long channel in short-channel devices?
  A: Each segment's current starts to depend on its own VDS; DIBL, CLM and velocity saturation concentrate in the top device; in planar processes each segment also carries its own halo.
- Q: Roughly how much more gain does a 4 × Lmin stack give than one device, in ratio and dB?
  A: About 4×, roughly +12 dB (illustrative; confirm on silicon).
- Q: Why does a cascode get far more gain than a stack with the same two devices?
  A: In a cascode the lower device is saturated and looks like r_o, so r_out ≈ gm·r_o·r_o; in a stack it is linear and looks like 1/gm, so r_out only doubles.
- Q: When do you prefer a stack over a cascode?
  A: For low-headroom current sources and mirrors, when large area is needed for matching and 1/f, or when a regular layout is required. For high fT or very high gain, use a cascode or gain boosting.

**Exercise:** Draw an N = 3 stack and mark which segment saturates and which two are linear; write the approximate output resistance (hint: r_out ≈ r_o,top·(1 + gm·R_s) with R_s ≈ 2/gm, so about 3·r_o).

## Session 4: Noise: 1/f, RTN and how to lower them in nanosheets (50 min)

**Goal:** Know where 1/f noise and RTN come from, whether nanosheets are noisier, and which process and design levers reduce noise.

**Sections to read:**
- Guide: Two 1/f noise models and the diagnostic method
- Guide: RTN: a statistical problem for small-area devices
- Tricks: Start with the main cause: 1/f noise is a gate-stack trap problem
- Tricks: Process knobs: public evidence at a glance
- Tricks: Design-side practices
- Tricks: Chopping (chopper stabilization)
- Term: Flicker noise (1/f noise)
- Term: RTN (random telegraph noise)

**Key points:**
- 1/f noise comes from gate-dielectric traps capturing and releasing carriers (mainly number fluctuation): S_VG ∝ N_OT/(Cox²·WL). Double the area, halve the noise power.
- Nanosheets are not noisier than planar: imec found comparable border-trap density with the same gate stack; gate-stack quality dominates.
- Process levers: reliability anneals (high-pressure D₂ cut noise about 4.8× on an FD-SOI TFET), thermal budget, thin EOT. No public noise data on dipoles; BTI data point in a good direction.
- RTN: per-trap ΔVT is about 1 mV in GAA versus 1.9 mV in FinFET, but trap count still scales with area; small devices have long tails, so use statistical corners.
- Design side: large-area input devices and low overdrive; chopping moves 1/f away without aliasing white noise, while auto-zero/CDS subtract it but alias white noise.

**Self-test:**
- Q: S_ID/ID² tracks (gm/ID)². What does that tell you?
  A: Carrier-number fluctuation (traps, the ΔN model) dominates.
- Q: Do nanosheets make 1/f noise worse?
  A: Public imec data show area-normalized noise comparable to planar with the same gate stack; trap density in the stack is what matters.
- Q: What is the basic difference between chopping and auto-zeroing?
  A: Chopping modulates offset and 1/f up to high frequency and filters them — no white-noise aliasing, but ripple; auto-zero samples and subtracts, folding broadband white noise into the baseband.
- Q: Input-device area goes from 0.5 µm² to 2 µm². How does the 1/f noise voltage (rms) change?
  A: Noise power drops to 1/4, rms halves — about −6 dB.

**Exercise:** Write two lines: for a low-frequency precision amplifier's input pair, what would you choose for the device (area, flavor, bias), and which circuit technique (chopping or auto-zero) would you pick, and why?

## Session 5: Mismatch and layout: Pelgrom's law and identical surroundings (45 min)

**Goal:** Use Pelgrom's law to size area, know where GAA mismatch comes from, and name the standard layout matching techniques.

**Sections to read:**
- Guide: Mismatch: Pelgrom's law and matching coefficients by component type
- Guide: New mismatch sources in FinFET/GAA
- Guide: Device-level layout: matching depends on "identical environment", not just identical W/L
- Tricks: Mismatch: metal gate grains dominate; stacking sheets is the most area-efficient knob
- Tricks: Layout matching techniques (multi-finger, double-sided gate contacts, dummies, common centroid)
- Term: Pelgrom's law
- Term: LDE (layout-dependent effects: WPE, LOD, OSE)
- Term: Common-centroid and interdigitated layout

**Key points:**
- σΔVT = AVT/√(WL): four times the area halves the mismatch. Single-device and pair σ differ by √2 — check which one the PDK uses.
- FinFET/GAA removed channel doping (RDF); metal-gate grains (WFV), fin/sheet geometry and S/D resistance now dominate.
- Nanosheets: LER barely matters; finer metal grains and more stacked sheets (TCAD: 3 sheets about 40% lower than 1) reduce mismatch.
- In layout, identical surroundings matter more than identical W/L: dummies, common centroid, same orientation, distance from well edges and diffusion breaks.
- Advanced nodes increasingly use calibration instead of oversized input devices.

**Self-test:**
- Q: To cut σΔVT from 4 mV to 2 mV, how much more area?
  A: Four times.
- Q: What is the first-order mismatch source in GAA?
  A: Metal-gate work-function/grain variation (WFV/MGG), then geometry (sheet thickness) and S/D and contact resistance.
- Q: What kind of mismatch does common-centroid layout fix?
  A: Systematic mismatch from linear gradients (process, temperature, stress); random mismatch needs area or calibration.
- Q: What is LDE? Give two examples.
  A: Layout-dependent effects: well-proximity effect (WPE), diffusion length and stress (LOD/OSE), gate cuts and diffusion breaks.

**Exercise:** Sketch a four-unit ABBA common-centroid pair with dummies at both ends; write which gradient it cancels and what it cannot cancel.

## Session 6: Nanosheet/GAA and the frontier (45 min)

**Goal:** Know what GAA gives analog and what it makes harder: sheet width, parasitics, self-heating, backside power, then forksheet and CFET.

**Sections to read:**
- Guide: Analog advantages of GAA over FinFET
- Guide: Problems GAA creates for analog
- Guide: What backside power delivery (BSPDN) means for analog
- Tricks: DIBL and intrinsic gain: narrow sheets, long Lg
- Tricks: fT / fmax and parasitics: the bottleneck is outside the sheet
- Tricks: Self-heating: the cost of BDI
- Term: BDI (bottom dielectric isolation)
- Term: Self-heating and thermal resistance Rth

**Key points:**
- GAA has better electrostatics: DIBL and SS improve, and intrinsic gain beats FinFET (about 46 dB in imec research devices).
- Width can follow sheet width, but production offers a discrete menu; wider sheets raise DIBL, so the analog optimum is narrower.
- The hard parts move to parasitics and heat: fT/fmax depend on sheet spacing, S/D epi, contacts and BDI; BDI helps RF and leakage but worsens self-heating (TCAD: about 2.59 K/µW per stack).
- Backside power cuts IR drop and frees front-side routing, but the substrate is largely removed, which changes heat removal and substrate coupling.
- Next come forksheet and CFET: n and p sit closer, so coupling and heat get harder.

**Self-test:**
- Q: Why is GAA intrinsic gain usually better than FinFET?
  A: The gate wraps the channel on all sides, so DIBL and gds are lower.
- Q: What does BDI give analog, and at what cost?
  A: Benefit: it cuts the sub-sheet parasitic channel and substrate coupling, improving RF metrics. Cost: a worse heat path and more self-heating.
- Q: How does self-heating distort gds measurements?
  A: In DC sweeps the device heats and current drops, so gds reads low or even negative; use pulsed IV or high-frequency Y22 for isothermal gds.
- Q: How does sheet width affect analog?
  A: Wider gives more drive but more DIBL and lower gain; production offers discrete widths, and matched devices must use the same one.

**Exercise:** List three GAA analog questions you most want to ask the PDK or device team. Hints: statistical corners for AVT and S_VG·WL, stacked gain versus N, thermal resistance Rth.

## Session 7: Speed and power: drive and Cdyn, plus a full review (45 min)

**Goal:** Connect analog metrics to the drive/Cdyn language you already know, then redraw the whole map and clear your review deck.

**Sections to read:**
- Term: Drive and Cdyn map
- Term: Cdyn (dynamic capacitance)
- Term: Drive current (Idsat, Ion)
- Term: V–F curve and Vmin
- Term: Iso-power vs iso-frequency comparisons
- Guide: Mapping process knobs to analog metrics

**Key points:**
- Speed chain: τ ∝ C_load·V/Ieff. Look at the I/C ratio, compared at the same Ioff and footprint.
- Power chain: P = Cdyn·V²·f with Cdyn = Σα·C — a whole-chip quantity covering devices, MOL, BEOL and clocks.
- The chains meet at the V–F curve. If the capacitance removed is off the critical path, the iso-power frequency gain is only about 1/3–1/2 of the Cdyn cut.
- Cutting C wins twice; cutting R only helps speed; the intrinsic channel capacitance is the “good” capacitance, not something to cut.

**Self-test:**
- Q: Is Cdyn directly tied to frequency?
  A: Not by definition (f is divided out), but in practice through shared capacitance, the power budget and measurement effects.
- Q: Cdyn drops 15% off the critical path, with V–F slope s ≈ 1. Roughly how much frequency at iso-power?
  A: About 5%: 15% ÷ (1 + 2/s) = 15% ÷ 3.
- Q: Why does the same improvement look bigger as iso-frequency power saving than as iso-power speedup?
  A: Power scales with V²: at iso-frequency you lower V and save a lot; at iso-power, raising frequency pays the V² toll.
- Q: How does a ring oscillator give both delay and Cdyn?
  A: τ = 1/(2N·f); C = (IDDA − IDDQ)/(N·VDD·f).

**Exercise:** Without notes, redraw the metric map from session 1, then check it against the overview and fill the gaps. Then open the review deck and redo the remaining cards until it is empty.


---

# Re-measuring the Transistor with an Analog Ruler

For a device engineer with a logic background, moving to analog devices means first adopting a different way of evaluating devices; the device physics itself changes little. Logic devices are judged by Ion/Ioff and CV/I at minimum L. Analog devices are judged by **small-signal ratios at a given bias point**: efficiency gm/ID, intrinsic gain gm/gds, speed fT at a given gm/ID, and the matching coefficient AVT. 1/f noise, RTN, linearity, leakage and self-heating form the second tier. All of these metrics must be extracted across multiple L values, near moderate inversion. Process knobs optimized for logic (halo, thin oxide, low voltage, minimum L) often hurt these metrics directly. FinFET raised intrinsic gain by roughly 2–10× through better electrostatic control ([Fulde 2007](https://d-nb.info/1149772921/34)), at the cost of width quantization, parasitics, self-heating and restricted L. Designers therefore compensate for "no long channel" with stacked gates, relaxed-pitch analog devices, thick-oxide I/O devices, low-inversion biasing, cascode/gain boosting, digital calibration and chiplet partitioning. At nanosheet/GAA, published research-device data show higher intrinsic gain (about 46 dB on imec research devices) and 1/f noise comparable to planar for the same gate stack ([imec arXiv 2026](https://arxiv.org/html/2609.08674)). The new difficulties are parasitic R/C, the parasitic channel under the bottom sheet, self-heating, PMOS mobility, and passives that do not scale with the process. Analog device parameters for production nodes (TSMC N2, Intel 18A, Samsung SF3/SF2) are almost entirely confined to PDKs and paywalled papers; the public literature is dominated by research devices and TCAD. This report labels the evidence type of each claim and gives a 7-day learning plan that goes from the big picture to the details and then to the frontier.

## Big-picture map

**Use this table to locate your question first, then jump to the corresponding section; each + detail block can be opened and read on its own.**

Evidence label conventions: [Textbook] means textbook or general knowledge, not individually sourced in this survey; [Silicon · research] means measured data on research devices; [Silicon · production] means published measured data on production or near-production processes; [TCAD] means simulation; [Vendor] means vendor technical briefs or statements; [Opinion] means industry interviews; [Inference] is this report's own reasoning.

| Topic | Core question | Key metrics / parameters | Location in this report |
|---|---|---|---|
| Analog vs logic | How does device evaluation differ? How does logic optimization hurt analog? | Ion/Ioff, CV/I vs gm/ID, gm/gds, fT, AVT; halo, DIBL | §1 |
| Layout and LDE | Why do two devices with the same W/L still mismatch? | WPE, LOD/OSE, PSE, diffusion break, dummy, common centroid | §1, §2 |
| Metrics and measurement | Which metrics matter for analog? How are they extracted? | gm, gds, VEA, gm/ID, IC, fT, fmax, Cgg, γ, S_VG·WL, AVT, VIP3, ZTC, Rth | §2 |
| Gain and long channel | Why is a long channel needed? What to do without it? | gm·ro, VEA/L, stacked gates, I/O devices, cascode, gain boosting, digital calibration | §3 |
| Noise | Where do 1/f and RTN come from? Which process knobs control them? | N_OT/N_BT, α_SC, S_VG·WL, RTN ΔVth, γ, NFmin | §4 |
| Mismatch | Does Pelgrom's law still hold in FinFET/GAA? | AVT, Aβ, MGG/WFV, fin angle, LER | §4 |
| Nanosheet/GAA | What are the benefits and problems of GAA for analog? | Intrinsic gain, width granularity, parasitic C/R, self-heating, 1/f, sub-sheet leakage | §5 |
| Further frontier | What do forksheet, CFET and backside power mean for analog? | Dielectric wall, vertical n/p stacking, substrate thinning, MIM, thermal resistance | §5 |
| Process-background advantage | Which process knobs map to which analog metrics? | EOT, metal gate, halo, S/D resistance, gate contact | §6 |
| Learning method | How does an expert who dislikes linear reading learn most effectively? | Retrieval practice, spacing, map first, expertise reversal effect | Learning method |
| Resources | What to read first, what later? | Textbook chapters, classic papers, open-source PDKs and tools | Recommended reading path |
| Plan | How to arrange 7 days at 2–3 hours per day? | Daily goals, materials, exercises, self-tests | 7-day learning plan |

## 1. Analog devices are judged by "small-signal ratios at a bias point", not Ion/Ioff

**Logic devices are optimized for switching performance at minimum L; analog devices are evaluated by efficiency, gain, speed, matching and noise at moderate-inversion bias. Process optimizations made for logic often hurt these analog metrics directly.**

Key points:
- The object of analog evaluation is a family of curves: fT, gm/gds, ID/W and so on plotted against gm/ID, one curve per L ([Palermo/TAMU](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)).
- Halo/pocket implants improve short-channel devices but cause "long-channel DIBL", lower ro and RSCE in longer analog devices ([Mudanai et al., Intel, 2006](https://briefs.techconnect.org/papers/halo-doping-physical-effects-and-compact-modeling/)).
- Going from planar to FinFET raised intrinsic gain by about 2–10×, at the cost of up to about 30% lower short-channel gm, width quantization, larger parasitics and self-heating ([Fulde 2007](https://d-nb.info/1149772921/34)).
- Matching depends on whether the devices sit in the same **environment**: well-edge distance, diffusion length, gate density, overhead routing. Identical W/L is far from enough ([eeNews Europe 2014](https://www.eenewseurope.com/en/layout-dependent-effects-in-analog-design); [ASIC North 2023](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/)).
- Analog design relies on far more than core transistors: thick-oxide I/O devices, precision resistors, MOM/MIM capacitors, varactors, parasitic PNPs and more.

### The shift in evaluation paradigm: from "switch" to "amplifier at a bias point"

Logic figures of merit are large-signal: Ion and Ioff set speed and static power, CV/I or Ieff sets gate delay, and the evaluation point is essentially fixed at VDD and minimum L. Analog devices are used as small-signal amplifiers, and their figures of merit are all ratios of derivatives at **a given bias point**. gm/ID is the transconductance obtained per unit current, i.e. power efficiency; gm/gds = gm·ro is the maximum voltage gain a single device can deliver; fT = gm/(2πCgg) is the speed at that bias; σ(ΔVT) = AVT/√(WL) expresses precision. The gm/ID methodology of the Murmann school plots all of these quantities as functions of gm/ID, one curve per L. To first order these curves are independent of W, so one can first do a "normalized design" and size W = ID/(ID/W) only at the end ([Palermo, TAMU ECEN474 Lecture 7](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)).

So the question an analog designer asks of a device is: in moderate inversion at gm/ID ≈ 10–15 S/A, what are gds and Cgg at different L? Peak drive current is secondary. [Textbook] The upper bound of gm/ID is about 1/(n·UT), roughly 25–35 S/A in weak inversion and lower in strong inversion; EKV uses the inversion coefficient IC to separate weak inversion (IC < 0.1), moderate inversion (0.1–10) and strong inversion (> 10). The same source summarizes the basic trade-offs: high gm/ID saves power and gives large swing but low fT; short L gives high fT, long L gives high ro and intrinsic gain; intrinsic gain is highest at low overdrive ([Palermo](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)).

### How logic optimization hurts analog devices: halo, thin oxide and low voltage

Intel authors wrote explicitly in 2006 that halo/pocket implants reduce DIBL and short-channel effects in short devices, but "the performance of the typically longer analog transistors is often severely degraded by these implants". The symptoms are lower ro, **long-channel DIBL** and RSCE, and distorted extraction of long-channel mobility ([Mudanai et al., 2006](https://briefs.techconnect.org/papers/halo-doping-physical-effects-and-compact-modeling/)). [Inference] The mechanism is laterally non-uniform doping from the halo: drain bias lowers the drain-side halo barrier, so lengthening L does not recover the expected ro. This is exactly the knob logic process integration engineers know best; it just needs to be re-examined from the gds point of view.

Thin gate oxide and high-k bring gate leakage, which loads high-impedance nodes such as sample-and-holds, integrators, bias lines and charge pumps. These nodes therefore usually use thick-oxide I/O devices instead [Textbook]. Junction leakage such as GIDL/BTBT sets hold droop in switched-capacitor circuits [Textbook]. Charge trapping in high-k caused VT shifts of up to about 100 mV in early FinFETs, with time constants from µs to ms. Digital circuits tolerate about 10 mV, while a dynamic shift of a few mV is enough to degrade a 12-bit SAR ADC ([Fulde 2007](https://d-nb.info/1149772921/34)). The problem with low voltage is lack of headroom: supplies at 3 nm-class nodes are approaching the Si bandgap (about 1.2 V), and even bandgap references must be redesigned ([Semiconductor Engineering 2021](https://semiengineering.com/wrestling-with-analog-at-3nm/)) [Opinion]. At low voltage, multi-level cascodes can no longer be stacked.

### From planar to FinFET: gain goes up, the cost changes form

Infineon/TU München compared 45 nm-class FinFET prototypes (Lg 60 nm, Wfin 30 nm, Hfin 60 nm) with bulk Si, with the following results ([Fulde 2007](https://d-nb.info/1149772921/34)) [Silicon · research + simulation]:
- At typical analog dimensions, FinFET intrinsic gain gm/gds is about **2–10×** higher.
- Because of lower sidewall mobility and S/D access resistance, short-channel FinFET gm is up to **30%** lower.
- For a two-stage Miller OTA at 3·Lmin, DC gain is **81.3 dB** for FinFET versus 48.4 dB for bulk, with similar GBW (10.6 vs 10.8 MHz).
- The authors consider FinFET better suited to analog applications below 10 GHz, because parasitic capacitance and Rs limit fT.

EPFL slides citing Wambacq (ISSCC 2008) state that the Early voltage of an 80 nm n-FinFET is more than 10× that of planar bulk Si at the same L, but planar strained Si is faster in fT ([Bucher, EPFL 2011](https://www.epfl.ch/labs/iclab/wp-content/uploads/2019/02/Bucher_NanoTera_2011.pdf)). imec 2012 data show the FinFET gm/gds–L curve lying above planar across the whole 100–1000 nm range. imec also warns that in advanced FinFETs parasitic resistance may exceed channel resistance, and parasitic capacitance may exceed intrinsic gate capacitance ([Badaroglu, imec, MOS-AK 2012](https://www.mos-ak.org/sanfrancisco_2012/presentations/T01_Badaroglu_MOS-AK_121212.pdf)).

FinFET costs also include width quantization (each fin has width 2·Hfin + Wfin, 150 nm/fin in this example) and self-heating. On FinFET test devices the thermal time constant is about 100 ns, and current drops by up to about 10% ([Fulde 2007](https://d-nb.info/1149772921/34)). The SOI layer has about 1/100 the thermal conductivity of bulk Si, so self-heating is especially severe in SOI FinFETs ([ASIC North 2023](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/)).

### The device menu available to analog designers in advanced-node PDKs

Beyond core logic devices, FinFET PDKs typically provide the following devices for analog use ([ASIC North 2023](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/), covering GF 14LP, IBM/Samsung FX14, TSMC N7/N5/N3):
- **Parasitic PNP BJT**: used for bandgap references and temperature sensors.
- **FEOL/MOL resistors**: base-layer resistors block CMOS placement in the same area; MOL resistors block metal routing underneath.
- **Finger capacitors and MOS capacitors**: good density, usually built as PCells. A charge-redistribution DAC may need a unit capacitor of about 1 pF.

BJT VBE matching (AVBE ≈ 0.35 mV·µm) is better than MOS, which is why reference circuits favor BJTs/diodes ([Pelgrom 1998](https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf)).

Only a few advanced-node analog device menus are documented publicly. Intel 22FFL offers dedicated analog thin-oxide devices at relaxed gate pitches of 144/216/270 nm, plus thick-oxide I/O devices with Lg of 90/120/160 nm for 1.2/1.5/1.8 V; the logic LL device has Lg of 74 nm ([WikiChip, IEDM 2017](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)) [Silicon · production].

[Textbook/industry practice] The device characterization report of an analog PDK typically includes:
- corner models and statistical models;
- AVT and Aβ for each device type and each VT flavor;
- sheet resistance, TCR and VCR for resistors;
- density, VCC/TCC and matching for capacitors;
- β and VBE(T) for BJTs;
- 1/f model parameters;
- reliability limits under analog bias conditions;
- coverage of the LDE models.

The open GF180MCU design manual also explicitly requires consulting the "device characterization report" for mismatch data ([GF180MCU DRM 5.4](https://mithro-gf180mcu-pdk.readthedocs.io/en/latest/physical_verification/design_manual/drm_05_4.html)).

### Device-level layout: matching depends on "identical environment", not just identical W/L

Layout-dependent effects (LDE) at advanced nodes cause systematic differences between devices with the same W/L. The table below summarizes what the available sources cover; this survey found no public source for specific mV values of LOD, OSE, PSE or diffusion break in FinFET/GAA.

| Effect | Mechanism | Impact | Mitigation | Source |
|---|---|---|---|---|
| WPE (well proximity effect) | Well-implant ions scatter off the photoresist sidewall into the channel | VT rises by "a few to tens of mV" | Increase well-edge distance; keep the same distance to the well edge for matched devices | [eeNews Europe 2014](https://www.eenewseurope.com/en/layout-dependent-effects-in-analog-design) |
| LOD / STI stress | Gate-to-diffusion-edge distance changes stress, hence mobility and ID | Systematic ID shift | Identical diffusion size, shape and orientation; add dummies | Same as above |
| OSE / PSE / diffusion break (SDB/DDB) | Neighboring active and gate geometry change STI/CESL stress | VT and ID shift in edge fingers | Continuous diffusion; dummy gates at both ends of the array | [Inference]; FinFET practice in [ASIC North](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/) |
| Fin-group patterning | Fins are patterned in groups; matching is better within a group | Cross-group matching degrades | Some fabs require matched devices to sit on designated fin pitches | [ASIC North](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/) |
| Overhead routing and surroundings | Metal coverage, stress, temperature gradients | Systematic mismatch | No unrelated metal, poly or silicided diffusion above or below precision matched devices | [GF180MCU DRM 5.4](https://mithro-gf180mcu-pdk.readthedocs.io/en/latest/physical_verification/design_manual/drm_05_4.html) |
| Gradients | Linear gradients in process, temperature and stress | Systematic mismatch | Common centroid, interdigitation, center-tapped differential pairs | [Pelgrom 1998](https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf); [ASIC North](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/) |

Pelgrom's classic rules: matched devices must be identical in geometry, orientation, bias and temperature; pay attention to distance, topography, metal coverage, implant striations, packaging and mechanical stress; avoid making matched devices at lithography-limit dimensions ([Pelgrom 1998](https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf)).

FinFET adds several new rules ([ASIC North](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/)):
- High-performance devices often use only about 4 fins because of local IR drop and EM limits.
- M1 must be aligned to the fin pitch and poly pitch.
- SADP coloring is locked to keep parasitics predictable.
- Design rules number in the "thousands".

Common centroid is not free: it adds routing parasitics and asymmetry. The Sapatnekar group at UMN has dedicated work on this; the full text could not be accessed for this survey.

## 2. The four main analog device metrics are gm/ID, gm/gds, fT and AVT

**What analog devices value most is gm/ID (efficiency), gm/gds (intrinsic gain), fT at a given gm/ID (speed) and AVT (matching), followed by 1/f noise, linearity, leakage and self-heating. Each metric must be extracted at a specified bias, across multiple L, using dedicated test structures and de-embedding methods.**

Key points:
- Logic looks at Ion, Ioff, CV/I, Ieff; analog looks at small-signal ratios, and must state "at which gm/ID, which VDS, which L".
- Vendors are starting to report metrics at an operating point. For example, Intel 22FFL reports a "usable fT" of about 205 GHz at gm/ID ≥ 10, not just peak fT ([WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)).
- With self-heating, the gds measured at DC is not the gds the circuit sees at high frequency. The thermal time constant is about 100 ns ([Fulde 2007](https://d-nb.info/1149772921/34)), so AC or pulsed measurements are needed.
- Mismatch and noise require array-based statistics (thousands of devices per geometry); measuring a "typical device" is not enough ([Simicic 2015](https://lirias.kuleuven.be/bitstream/123456789/525000/2/IIRW2015_OA.pdf)).

### Key metrics quick reference: definitions, focus and extraction methods

| Metric | Definition / formula | Logic vs analog focus | How to measure / extract |
|---|---|---|---|
| gm | ∂ID/∂VGS (fixed VDS) [Textbook] | Logic cares indirectly (related to Ion); in analog it directly sets gain and noise | Numerical differentiation of DC Id–Vg sweeps |
| gds, ro, VEA | gds = ∂ID/∂VDS = 1/ro; VEA ≈ ID/gds, often normalized as VEA/L (V/µm) [Textbook] | Logic barely looks at it; in analog it sets the gain ceiling | Smooth or fit Id–Vd before differentiating (the derivative is noisy); cross-check against AC gds |
| Intrinsic gain gm/gds | gm·ro ≈ (gm/ID)·VEA ([Palermo](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)) | Core analog metric. FinFET is about 2–10× higher than planar ([Fulde](https://d-nb.info/1149772921/34)); GF 14 nm reaches 40 (n)/34 (p), more than 3× 28 nm planar ([Singh/GF, TED 2018](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)) | gm/ID on the x-axis, one curve per L; plot gm/gds at multiple VDS |
| gm/ID and IC | Upper bound about 1/(n·UT); IC = ID/(2nμCoxUT²·W/L) [Textbook, EKV] | Logic ignores it; analog uses it to choose the bias region (moderate inversion is the "sweet spot") | Compute gm/ID vs ID/W from Id–Vg; lookup tables can help |
| fT | gm/(2π·Cgg), Cgg ≈ Cgs + Cgd ([Palermo](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)) | Logic looks at CV/I; analog looks at "fT at a given gm/ID" and fT·gm/ID | S-parameters after (open/short) de-embedding; frequency where h21 falls to 1 [Textbook] |
| fmax | About fT/(2√(Rg·(gds+2πfT·Cgd))) [Textbook] | Core RF metric, dominated by Rg. Double-sided gate contact at GF 14 nm raises fmax by 1.26×/1.40× (n/p) ([Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)) | Frequency where unilateral gain U or MAG/MSG falls to 1 |
| Cgg, Cgd, Cdd | Cgg = Im(Y11)/ω, Cgd = −Im(Y12)/ω [Textbook] | Logic looks at total capacitance; analog looks at Cgd/Cgg (Miller effect) and Cdd/Cgg ([Palermo](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)) | Split-CV/LCR on large arrays (about 100 kHz–1 MHz), or extraction from Y-parameters |
| Thermal noise γ | Drain noise current spectrum = 4kT·γ·gm; γ = 2/3 for long channel in saturation ([McNeill](https://users.wpi.edu/~mcneill/papers/CICC_v09_CORRECTED.pdf)) | γ rises in short channels; sets LNA noise and NFmin | Noise parameter system (tuner, Fmin, Rn, Γopt) [Textbook] |
| 1/f noise | S_VG ≈ K/(Cox·W·L·f); in the CNF model S_Vfb ∝ N_OT ([Simoen/JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)) | Logic ignores it; in analog it sets VCO phase noise, low-frequency precision and the flicker corner frequency | Low-noise amplifier plus FFT analyzer (e.g. Keysight E4727B), about 1 Hz–100 kHz; report S_VG·WL |
| RTN | Two-level or multi-level switching caused by a single trap | ΔVth can exceed 70 mV in small-area devices ([VLSI 2009](https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm)) | Time-domain recording, large-sample statistics |
| AVT, Aβ | For a differential pair, σ(ΔVT) = AVT/√(WL), σ(Δβ/β) = Aβ/√(WL) ([Pelgrom 2013](https://indico.cern.ch/event/228972/contributions/1539553/attachments/378475/526400/TWEPP24sept2013Print.pdf)) | Logic looks at σVT for SRAM/Vmin; in analog it directly sets offset and precision | Paired or arrayed devices; Pelgrom plot of σ vs 1/√(WL), slope = AVT |
| Current mismatch | σ²(ΔID/ID) = (gm/ID)²·σ²(ΔVT) + σ²(Δβ/β) [Textbook] | At high gm/ID (weak inversion) VT mismatch dominates | Combined from VT and β mismatch |
| Linearity | gm2, gm3; VIP2 = 4gm/gm2, VIP3 = √(24gm/gm3) [Textbook] | Analog/RF cares about distortion; the gm3 = 0 "sweet spot" lies near VT | High-precision DC sweeps for higher-order derivatives, or two-tone IIP3 measurement |
| ZTC point | The VGS at which ID does not vary with temperature [Textbook] | Used in reference and bias design. ZTC model error for imec nanosheets is about 12% ([JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)) | Intersection of Id–Vg curves at multiple temperatures |
| Gate and junction leakage | IG, GIDL, BTBT [Textbook] | Affects high-impedance nodes, hold circuits and high-temperature references | High-precision SMU, multi-temperature measurement |
| Self-heating Rth, τth | Thermal resistance and thermal time constant | In FinFET τth is about 100 ns, current drops by up to about 10% ([Fulde](https://d-nb.info/1149772921/34)) | Pulsed IV (< 100 ns), gate-resistance thermometry, DC vs AC gds comparison |
| DIBL, SS | [Textbook] | Logic looks at Ioff; in analog DIBL feeds directly into gds | Standard Id–Vg measurement |

### Logic FoM vs analog FoM

| Dimension | Logic device | Analog device |
|---|---|---|
| Evaluation point | VDD, Lmin, fully on or fully off | Specified gm/ID (often 5–20 S/A), VDS about VDD/2, multiple L [Textbook] |
| Speed | CV/I, Ieff, ring-oscillator frequency | fT, fmax at a given gm/ID |
| "Strength" | Ion (µA/µm) | gm/ID (efficiency) and gm/gds (gain) |
| Variability | σVT (SRAM Vmin, timing) | AVT, Aβ, statistical distribution of 1/f noise, RTN tails |
| L of interest | Minimum L | A range of L (from 1× to tens of times Lmin on the same chip) |
| Noise | Barely considered | Thermal noise γ, 1/f corner frequency, RTN |
| Temperature | Corners and reliability | ZTC, VT(T), gds dispersion from self-heating |

### The gm/ID method: hanging every metric on the same x-axis

The core of the gm/ID method: run a four-dimensional SPICE sweep over L, VGS, VDS and VSB to build lookup tables, then plot fT, gm/gds, ID/W, Cgd/Cgg and other quantities as functions of gm/ID. The design flow is to get gm = 2π·fu·CL from bandwidth and load, choose gm/ID and L, and finally compute W from ID/W ([Palermo](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)). In the lecture's 0.6 µm process example, gm/ID = 3.14 V⁻¹ and ID = 1 mA give W ≈ 49.5 µm, Cgg = 74.1 fF, fT ≈ 6.7 GHz and gm/gds ≈ 30.6.

This method is especially friendly to process engineers, because it connects "device curves" directly to "circuit sizing". Murmann's open-source starter kit provides Xschem sweep schematics and ready-made .mat tables for SKY130, IHP SG13G2 and GF180; with pygmid these curves can be generated in a few hours ([bmurmann/Book-on-gm-ID-design](https://github.com/bmurmann/Book-on-gm-ID-design)). Note that the open PDKs are all 130–180 nm planar processes: the shapes of the curves and the trade-offs transfer, the absolute values do not.

### Common extraction pitfalls: derivative noise, DC vs AC gds, de-embedding

The first pitfall is **derivative noise**. gds is the derivative of Id–Vd and is very small in saturation, so direct differencing is extremely noisy; smooth or fit before differentiating. Higher-order derivatives such as gm2 and gm3 are even more sensitive [Textbook].

The second pitfall is **DC vs AC gds mismatch**. gds measured by DC sweeps includes self-heating and can even be negative in FinFET/SOI. High-frequency circuits see the AC gds beyond the thermal time constant; with τth of about 100 ns, this corresponds to frequencies above about 1–10 MHz (τth from [Fulde 2007](https://d-nb.info/1149772921/34), conversion is [Inference]). So use S/Y-parameter or sub-100 ns pulsed IV measurements, and enable the self-heating network in the model (e.g. SHMOD in BSIM-CMG).

The third pitfall is **RF de-embedding**. fT and fmax must be extracted from S-parameters after open/short de-embedding. fmax is dominated by gate resistance, so RF devices use multiple fingers and double-sided gate contacts [Textbook]. GF 14 nm data illustrate this: fmax is 180/140 GHz with single-sided gate contact and 227/195 GHz with double-sided contact ([Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)).

The fourth pitfall is **statistics**. Mismatch requires Kelvin-connected arrays: imec/KU Leuven built a 28 nm array of 54,432 devices, 4,536 per geometry, used Kelvin sensing to remove IR drop on metal lines and transmission gates, and reported Pelgrom plots with 99% confidence intervals ([Simicic 2015](https://lirias.kuleuven.be/bitstream/123456789/525000/2/IIRW2015_OA.pdf)).

### Device-level design rule checklist

| Rule | Reason | Evidence type / source |
|---|---|---|
| Do not use Lmin for gain- and matching-critical devices; use at least several times Lmin, or stacked gates or analog-specific devices | Short-channel DIBL/CLM makes gds large; halo hurts longer devices | [Mudanai 2006](https://briefs.techconnect.org/papers/halo-doping-physical-effects-and-compact-modeling/); [Fulde 2007](https://d-nb.info/1149772921/34) |
| Default to moderate-inversion bias; choose the point by gm/ID | Balances efficiency, speed and gain | [Palermo](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf) |
| Back-calculate WL from the target offset: WL ≥ (AVT/σtarget)² | Pelgrom's law | [Sheikholeslami 2015](https://www.eecg.utoronto.ca/~ali/papers/mag-win-15-process-variation.pdf) |
| Use large area for input pairs and low-frequency-noise-sensitive devices | 1/f ∝ 1/WL, and large area also tightens device-to-device spread | [VLSI 2009](https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm); [Inference] |
| Use thick-oxide devices for high-impedance nodes (hold, integrate, bias) | Thin oxide has gate leakage | [Textbook] |
| Matched devices must be identical in geometry, orientation, bias, temperature and environment; add dummies; continuous diffusion; common centroid | LDE and gradients | [Pelgrom 1998](https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf); [ASIC North](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/) |
| No unrelated metal, poly or silicided diffusion above or below precision devices; add antenna diodes when MIM or gate-oxide capacitors connect to top metal | Systematic mismatch and antenna damage | [GF180MCU DRM 5.4](https://mithro-gf180mcu-pdk.readthedocs.io/en/latest/physical_verification/design_manual/drm_05_4.html) |
| Make precision resistors wider and longer | Matching and accuracy | Same as above |
| Use multiple fingers and double-sided gate contacts for RF devices | Lowers Rg, raises fmax and lowers NF | [Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications) |
| Isolate sensitive circuits with guard rings or deep N-well | Substrate noise. Deep N-well at GF 14 nm reduces substrate noise by up to 75 dB at 0.1 GHz | [Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications) |
| Do layout parasitic extraction first, then finalize sizing | Pre- vs post-layout simulation differs by about 30% at advanced nodes | [Semiconductor Engineering 2021](https://semiengineering.com/wrestling-with-analog-at-3nm/) [Opinion] |
| Check HCI/BTI/EM and self-heating under analog bias | Long-duration DC bias, local hot spots | [Textbook]; [Fulde 2007](https://d-nb.info/1149772921/34) |
## 3. Analog really does value gain more; without long channels it takes a combination of measures

**Analog devices place high value on intrinsic gain gm·ro, because it sets the maximum DC gain of a single amplifier stage and the closed-loop accuracy. A long channel is the most direct way to raise ro. In FinFET/GAA processes with fixed CPP and limited L, designers combine device-level substitutes (stacked gates, analog-specific pitch, I/O devices, lower inversion), circuit-level compensation (cascode, gain boosting, multistage), digital calibration and system partitioning.**

Key points:
- [Textbook] Intrinsic gain ≈ (gm/ID)·VEA, and VEA grows roughly with L; DIBL sets an upper bound gm/gds ≲ 1/η.
- The usable single-transistor gain in advanced FinFETs is in the tens: Intel 22FFL GM×Rout is 47/54/60 ([WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)), GF 14 nm is 40/34 ([Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)).
- Stacked gates are the most common device-level substitute, at the cost of parasitic capacitance, area and pre-/post-layout simulation mismatch ([EDN 2021](https://www.edn.com/all-about-stacked-mosfets-in-analog-layout/)).
- Extra FinFET gain margin can be traded for speed: an OTA moved to 1.4·Lmin still has about 47 dB gain, with GBW/P up 22–28% ([Fulde 2007](https://d-nb.info/1149772921/34)).
- The biggest public gap: no open paper was found that quantitatively compares "N stacked Lmin gates" with "a single long L" in FinFET/GAA for gm, gds, AVT and 1/f.

### Why gain matters and why a long channel raises it

[Textbook] The accuracy of op-amps, current mirrors and references depends on loop gain, and loop gain depends on gm·ro of each stage. In strong inversion, gm/gds ≈ 2VEA/Vov. In a long channel, the CLM-induced ΔL/L falls as L grows, so VEA is roughly proportional to L. In a short channel, DIBL adds a term gds ≈ η·gm, so intrinsic gain has an upper bound ≈ 1/η. With the 46 mV/V DIBL of the Fulde prototype, this bound is about 22 ([Inference], DIBL value from [Fulde 2007](https://d-nb.info/1149772921/34)). This is the same order of magnitude as the 47–60 GM×Rout of the 22FFL analog devices, which use a more relaxed pitch.

Along VDS, gds first falls as CLM saturates, then may rise again due to DIBL, impact ionization or self-heating, so the VDS window for best gain is limited [Inference]. Along the inversion level, gm/ID is highest in weak inversion; intrinsic gain is highest at low overdrive and is roughly flat above a certain minimum gm/ID ([Palermo](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)).

### Gain and speed data points at advanced nodes

| Platform | Conditions | Intrinsic gain / related metric | Speed | Evidence type | Source |
|---|---|---|---|---|---|
| 45 nm-class FinFET prototype vs. bulk | Typical analog sizing | gm/gds 2–10× higher; OTA 81.3 dB vs. 48.4 dB | Suitable below 10 GHz | Silicon · research + simulation | [Fulde 2007](https://d-nb.info/1149772921/34) |
| Intel 22FFL analog thin-oxide devices | Gate pitch 144/216/270 nm | GM×Rout 47/54/60 | Usable fT about 205 GHz (gm/ID ≥ 10); fmax 284/242 GHz, improved to 357/290 GHz | Silicon · production | [WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3) |
| GF 14 nm FinFET | Core devices | gm/gds 40 (n)/34 (p), more than 3× 28 nm planar | fT 314/285 GHz | Silicon · production | [Singh/GF TED 2018](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications) |
| GF 14 nm 1.8 V I/O FinFET | Lg 150 nm | — | Peak fT 50.1/53.5 GHz, fmax 200/160 GHz | Silicon · production | Same as above |
| imec two-level stacked nanosheet | L 28–200 nm, EOT 0.9 nm | About 46 dB (FinFET cited in the paper about 34 dB, cross-paper comparison); VEA about 30 V | — | Silicon · research | [Simoen/JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770) |
| Planar 0.35 µm-class folded cascode | ACM model, i_f ≈ 3 | Simulated DC gain 141 dB (method illustration only) | GBW 9.77 MHz | Simulation | [Galup-Montoro CICC 2007](https://lci.ufsc.br/pdf/18-6.pdf) |

This survey found no open source for AV0–L curves of TSMC 28HPC/16FF/N7/N5/N3, Samsung SF3/SF2 or Intel 4/3/18A. Such data usually sits in paywalled IEDM/VLSI papers or confidential PDKs.

### Summary table of long-channel substitutes

| Method | Principle | Advantages | Costs | How to characterize |
|---|---|---|---|---|
| Stacked gates / series devices | N short devices in series, equivalent L = N·Lg; e.g., three 1 µm devices equal 3 µm ([EDN 2021](https://www.edn.com/all-about-stacked-mosfets-in-analog-layout/)) | No special process needed; gate area and gate capacitance close to the equivalent long device | Internal nodes add parasitic capacitance (mainly interconnect) and area; large pre-/post-layout simulation mismatch | Compare gm/ID, gm/gds, gds–VDS, AVT and 1/f against a single device with the same W and N·Lg; sweep N = 2, 4, 8, 16 |
| Relaxed-pitch analog-specific devices | Process directly offers longer Lg or pitch | Restores gain natively; more accurate models | Needs PDK support; costs area | 22FFL GM×Rout 47/54/60 at 144/216/270 nm pitch ([WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)) |
| Thick-oxide I/O devices | Longer Lg (90–160 nm in 22FFL) and higher VDD (1.2–1.8 V) | Large voltage headroom, low gate leakage, high ro | Low fT (GF 14 nm I/O about 50 GHz vs. core about 300 GHz), large area, poor gm/Cgg | fT and gm/gds vs. gm/ID; VT and noise ([Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)) |
| Lower inversion (higher gm/ID) | Reduce overdrive at fixed L | "Free" increase in gm/gds and efficiency at fixed L | Lower fT, larger devices, more sensitive to VT mismatch | gm/gds and fT vs. gm/ID curves ([Palermo](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)) |
| Trade gain for speed | Shorten L when FinFET gain has margin | GBW/P up 22–28% ([Fulde](https://d-nb.info/1149772921/34)) | Gain falls back to about 47 dB | Circuit-level GBW/P comparison |
| Cascode / regulated cascode | Each added cascode level multiplies output impedance by about gm·ro [Textbook] | Gain multiplies | Consumes voltage headroom; hard to stack several levels at low-VDD nodes | Output impedance, swing, PSRR |
| Gain boosting | An auxiliary amplifier drives the cascode gate; gain on the order of (gm·ro)³ [Inference] | High gain without extra headroom | Creates a pole-zero pair (doublet) that affects settling time | Closed-loop settling test, AC pole-zero analysis |
| Multistage amplifiers (3+ stages) | Stage gains multiply | Feasible at low voltage | Needs nested compensation; stability is complex | Phase margin, settling time |
| Asymmetric self-cascode | Composite series pair of two devices with different Vth or L | Studied for gain enhancement in FD-SOI | Only the title was found in this survey | Same as stacked gates ([UCLouvain](https://research.dial.uclouvain.be/handle/2078.5/127916)) |
| Dynamic and inverter-based amplifiers with digital calibration | Accept low per-stage gain; use switched-capacitor operation plus digital calibration | Uses cheap digital logic; ADC-based calibration replaces oversized differential pairs | Complex architecture; needs calibration algorithms | System-level SNDR/INL ([Semiconductor Engineering 2021](https://semiengineering.com/wrestling-with-analog-at-3nm/) [Opinion]) |
| Analog-assisted digital | Mostly digital circuits with analog assistance | Suits advanced nodes. Samsung 3 nm GAA LDO load range < 1 mA to 1.4 A, about 38 mV droop for a 1 A/1 ns step | Not every function can be digitized | Circuit-level transient test ([Semiconductor Digest 2022](https://www.semiconductor-digest.com/samsung-has-18-talks-at-the-vlsi-symposia-in-june-including-3nm-gaafet-ldo/)) |
| Chiplet / 3D partitioning | Keep only PLLs and die-to-die interfaces on the advanced node; move other analog to mature-node chiplets | Each circuit is built on the most suitable process | Adds packaging, interconnect and test complexity | System-level partitioning ([Semiconductor Engineering 2021](https://semiengineering.com/wrestling-with-analog-at-3nm/), Fraunhofer Heinig [Opinion]) |

### Stacked gates (series devices): details and pitfalls

Below about 28 nm, maximum device length is limited, so stacked gates are standard practice. Single-finger stacked gates share diffusion in one row, and area is set by the minimum poly spacing. Long chains must be folded into multiple rows, which adds interconnect and capacitance. Matched two-finger devices cannot share diffusion; they are arranged in columns, alternating drain-centered and source-centered orientation. An m-factor gives devices that are both long and wide. Pre- and post-layout simulation "often disagree," usually because of interconnect parasitics on the stacked gates ([EDN 2021](https://www.edn.com/all-about-stacked-mosfets-in-analog-layout/)).

At the model level, Galup-Montoro et al. point out that a charge-based current model can describe series-connected devices self-consistently only if the slope factor and mobility depend only on gate voltage; several DC, noise and mismatch models do not meet this ([CICC 2007](https://lci.ufsc.br/pdf/18-6.pdf)).

[Inference, to be verified] From device physics, stacked gates are not fully equivalent to one uniform long channel:
- The top (drain-side) device takes most of VDS, and the internal devices are close to the linear region. So the gds of the composite device is set mainly by the DIBL/CLM of the top device, then reduced by the transconductance of the devices below it. Overall it behaves more like "a long device plus a self-cascode."
- Every internal node carries series resistance and diffusion capacitance from S/D epi and contacts.
- Each sub-device sees its own local LDE (gate cut, diffusion break), so mismatch improves as 1/√N but may be worse than a true continuous N·Lg channel.

These inferences are exactly the questions internal data must answer.

### How to characterize these substitutes: a unified comparison test plan

[Inference / industry practice] Run the same test set on every device option (single Lg, stacked gates N = 2/4/8/16, relaxed-pitch devices, I/O devices).

Curves:
- ID–VGS, and gm/ID vs. ID/W (log scale), at VDS = VDD/2;
- gm/gds vs. gm/ID at several VDS;
- gds and VEA vs. VDS;
- fT and fT·gm/ID vs. gm/ID;
- Cgg/W and Cdd/W.

Tabulated parameters:
- Weak-inversion gm/ID;
- gm·ro at gm/ID = 10–15;
- DIBL and SS;
- AVT and Aβ;
- S_VG·WL at 1 kHz;
- Rth and τth.

Test structures:
- Kelvin DC structures;
- Common-centroid matched-pair arrays with dummies;
- GSG RF structures, with S-parameters from about 1 MHz to above 50 GHz, to see gds dispersion near the thermal cutoff frequency;
- Sub-100 ns pulsed IV, to measure isothermal gds;
- Thermal test structures.

## 4. Noise and mismatch: set by the gate stack, and a statistical problem as area shrinks

**1/f noise and RTN come from carrier trapping by gate-dielectric and interface traps, and are set to first order by gate-stack quality; the smaller the device, the larger the noise spread and the longer the distribution tail. Mismatch follows Pelgrom's law: FinFET/GAA removes channel doping (RDF), but metal gate granularity (MGG/WFV) and geometric variation become the new dominant terms.**

Key points:
- Modern HKMG planar, FinFET and nanosheet devices are mostly analyzed with the carrier number fluctuation plus correlated mobility fluctuation model (CNF+CMF); the diagnostic is whether S_ID/I_D² tracks (gm/ID)² ([Chen, Stanford 2010](https://stacks.stanford.edu/file/druid:pf645xz5659/cy_thesis-augmented.pdf)).
- From GF 28 nm planar to 14 nm FinFET, area-normalized S_VG drops about 3–10×, but pFET goes from quieter than nFET to about 2× nFET ([Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)).
- RTN ΔVth in 20 nm-class devices can exceed 70 mV and may exceed RDF at 3σ ([VLSI 2009](https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm)).
- In practice FinFET matching is not necessarily better than planar; extra sources include fin angle and fin waviness ([IBM, TED 2015](https://research.ibm.com/publications/transistor-matching-and-fin-angle-variation-in-finfet-technology)).
- Production AVT and Kf values for advanced nodes are not public; they must come from PDKs and internal data.

### Two 1/f noise models and the diagnostic method

**Carrier number fluctuation model (CNF, McWhorter)**: oxide traps capture charge, shifting the flat-band voltage, which modulates the inversion charge and drain current. Noise power scales as (gm/ID)²: flat in weak inversion, falling roughly as 1/Qn² in strong inversion ([Chen, Stanford 2010](https://stacks.stanford.edu/file/druid:pf645xz5659/cy_thesis-augmented.pdf)).

**Hooge mobility fluctuation model**: S_ID/I_D² = α_H·q/(f·W·L·Qi), and noise scales as 1/Qi. α_H is 10⁻⁶–10⁻⁴ in high-quality material; 2–3×10⁻³ is commonly used for Si MOSFETs. The CNF model explains n-type devices well but cannot predict p-type devices; a Coulomb-scattering mobility fluctuation term correlated with trapped charge (CMF) must be added (same source).

**The diagnostic flow** has four steps ([Chen 2010](https://stacks.stanford.edu/file/druid:pf645xz5659/cy_thesis-augmented.pdf); [Simoen/JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)):
1. Plot S_ID/I_D² vs. VG: ΔN-type devices show a plateau then a steep drop; Hooge-type devices rise as overdrive decreases.
2. Plot S_ID/I_D² vs. (gm/ID)²: proportionality indicates ΔN dominance; scaling roughly as 1/ID indicates Δμ dominance.
3. Plot √S_VG vs. V_GT (≈ ID/gm): this gives a straight line; the intercept corresponds to trap density N_OT and the slope to the Coulomb scattering coefficient α_SC.
4. Check that f·S_ID is essentially flat, to confirm a true 1/f spectrum.

Lower frequencies probe deeper traps: in Si/SiO₂, 0.01 Hz corresponds to traps about 2.6 nm deep and 1 MHz to about 0.7 nm ([Chen 2010](https://stacks.stanford.edu/file/druid:pf645xz5659/cy_thesis-augmented.pdf)). In high-k stacks, this means low-frequency noise sees through the interfacial layer into the high-k.

One directly actionable recommendation for process engineers: extract N_OT and α_SC per gate stack rather than comparing raw Kf, because Kf absorbs Cox and bias dependence; when reporting S_VG·WL, state frequency, VDS and overdrive [Inference].

### 1/f noise data for planar, FinFET and nanosheet

| Comparison | Result | Evidence type | Source |
|---|---|---|---|
| GF 28 nm planar vs. 14 nm FinFET, area-normalized S_VG at 1 kHz | FinFET 17 (n)/35 (p) fV²·µm²/Hz; planar 171 (n)/106 (p) | Silicon · production | [Singh/GF TED 2018](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications) |
| High-k vs. SiON | "In general, high-k MOSFETs have higher low-frequency noise" (no ratio given) | Literature review | [Chen 2010](https://stacks.stanford.edu/file/druid:pf645xz5659/cy_thesis-augmented.pdf); [Fulde 2007](https://d-nb.info/1149772921/34) |
| imec p-type nanosheet (94 devices, 188 sheets, W 17 nm, H 6.5 nm, L 19 nm, EOT 1 nm) vs. 1×1 µm planar device with the same gate stack | Comparable effective border trap density N_BT and comparable area-normalized noise; the authors conclude "moving to GAA does not increase noise; noise is still set by gate-stack quality" | Silicon · research | [Asanovski et al., imec, arXiv 2609.08674](https://arxiv.org/html/2609.08674) |
| imec/USP two-level nanosheet benchmark | Vertical sheet spacing has little effect on 1/f noise; normalized S_VG·A "compares favorably" with bulk, SOI, FinFET and nanowire; different metal gates change N_OT and α_SC | Silicon · research | [Simoen/JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770) |

[Inference] The GF data show nFET S_VG·WL dropping about 10× and pFET about 3×. This fits the expectation S_VG ∝ N_OT/Cox² (thinner EOT raises Cox), but the comparison mixes architecture change with gate-stack change. FinFET pFETs being noisier than nFETs may relate to the (110) sidewall conduction surface and to gate stacks on SiGe-strained S/D or SiGe channels, but this is only a hypothesis; this survey found no source confirming the mechanism.

### RTN: a statistical problem for small-area devices

As gate area shrinks, the 1/f spectrum breaks down into single-trap Lorentzian spectra and RTN, device-to-device spread grows sharply, and the amplitude distribution has a lognormal or exponential long tail. Several data sets:
- IBM at VLSI 2009 measured more than 15,000 nFETs (Lg down to 20 nm, PDSOI). The RTN amplitude distribution is long-tailed, non-Gaussian and temperature-independent; ΔVth exceeds 70 mV in the smallest devices; at 22 nm, RTN-induced Vth variation may exceed RDF at about 3σ ([VLSI 2009 3B-3](https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm)).
- Among 1,000 devices with W/L = 70/40 nm, about 12% showed RTN ([Chen 2010](https://stacks.stanford.edu/file/druid:pf645xz5659/cy_thesis-augmented.pdf)).
- The defect-centric model fits both the post-BTI ΔVth distribution ([Simicic 2015](https://lirias.kuleuven.be/bitstream/123456789/525000/2/IIRW2015_OA.pdf)) and the distribution of nanosheet integrated noise Vrms ([Asanovski 2026](https://arxiv.org/html/2609.08674)). This indicates that 1/f noise statistics and BTI trap statistics share the same physics.

[Inference] Three implications for design:
- Noise of single-fin or single-sheet devices can differ by orders of magnitude; corners taken from the mean will underestimate tail devices.
- Use large WL for input pairs, which lowers mean noise and also compresses relative spread.
- Ask the foundry for statistical noise corners (e.g., lognormal σ of S_VG·WL) rather than a single Kf.

### Thermal and high-frequency noise: γ grows in short channels

In long-channel saturation, drain thermal noise is 4kT·γ·gm with γ = 2/3. When the low-field channel region is shorter than the carrier mean free path and carriers cannot thermalize, drain noise rises toward the shot-noise limit ([McNeill, CICC](https://users.wpi.edu/~mcneill/papers/CICC_v09_CORRECTED.pdf)).

γ has been extracted experimentally for 14 nm RF FinFETs ([IEEE 9383331](https://ieeexplore.ieee.org/document/9383331)), but this survey saw only the listing and did not read the values. This survey also found no public measured NFmin for FinFET, 22FDX or GAA.

[Textbook] Induced gate noise is correlated with drain noise (δ = 4/3 in long channels) and becomes important at frequencies near fT/5–fT/10. Rg and MOL parasitics lower fmax and raise NF, which is why multi-finger layouts and double-sided gate contacts matter.

### Mismatch: Pelgrom's law and matching coefficients by component type

Pelgrom's law takes the form σΔVT = AVT/√(WL), σ(Δβ/β) = Aβ/√(WL). Single-transistor σ and differential-pair σ differ by √2; confirm which definition the PDK uses before applying it ([Pelgrom 2013](https://indico.cern.ch/event/228972/contributions/1539553/attachments/378475/526400/TWEPP24sept2013Print.pdf); [Sheikholeslami 2015](https://www.eecg.utoronto.ca/~ali/papers/mag-win-15-process-variation.pdf)). The empirical relation is AVT ∝ tox·NA^(1/4). The "mismatch energy" σ²VT·Cgate = AVT²·Cox is about 70 kT, independent of the W/L choice. This makes mismatch fundamentally a power problem, and it is the starting point of Kinget 2005's discussion of the mismatch–speed–power trade-off triangle ([Pelgrom 2013](https://indico.cern.ch/event/228972/contributions/1539553/attachments/378475/526400/TWEPP24sept2013Print.pdf)).

| Component | Matching coefficient | Source |
|---|---|---|
| MOS, 65 nm CMOS | AVT = 3.5 mV·µm | [Pelgrom 2013](https://indico.cern.ch/event/228972/contributions/1539553/attachments/378475/526400/TWEPP24sept2013Print.pdf) |
| MOS current factor | Aβ = 1–2 %·µm | Same as above |
| BJT | AVBE = 0.3 mV·µm (2013); about 0.35 mV·µm (1998) | Same as above; [Pelgrom 1998](https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf) |
| Resistor | AR = 0.5–5 %·µm | [Pelgrom 2013](https://indico.cern.ch/event/228972/contributions/1539553/attachments/378475/526400/TWEPP24sept2013Print.pdf) |
| Capacitor | AC = 0.3 %/√(C, fF) | Same as above |
| 45 nm-class metal-gate FinFET (undoped fin) vs. poly-gate bulk | FinFET AVT about half of bulk | [Fulde 2007](https://d-nb.info/1149772921/34) [Silicon · research] |
| 28/22 nm and below | Use the foundry PDK; this survey found no primary source for the common "1–2 mV·µm" claim | [Pelgrom 2013](https://indico.cern.ch/event/228972/contributions/1539553/attachments/378475/526400/TWEPP24sept2013Print.pdf) |

### New mismatch sources in FinFET/GAA

Undoped channels remove RDF, which dominates in planar bulk; this is why early FinFET AVT improved about 2× ([Fulde 2007](https://d-nb.info/1149772921/34)). But IBM notes that "several authors have reported better matching for planar devices." The extra mechanism IBM identified is charge at lattice disturbances in tilted and wavy fins, that is, fin angle variation ([Agarwal/Hook, IBM, TED 2015](https://research.ibm.com/publications/transistor-matching-and-fin-angle-variation-in-finfet-technology)). Other sources include fin LER, gate misalignment, S/D resistance variation, and sidewall roughness in very narrow fins ([Fulde 2007](https://d-nb.info/1149772921/34)).

Metal gate granularity (MGG) or work function variation (WFV) is a first-order source shared by FinFET and GAA. A simulation using a Pelgrom-type Ion variability model gives θ_MGG of 192 nA/nm for FinFET, 191 nA/nm for NSFET and 120 nA/nm for NWFET. The same study finds that **LER has negligible impact on nanosheets**, because etch roughness falls on a non-critical dimension, but LER still affects FinFETs and NWFETs ([Fernandez et al., SSE 2022](https://in4.iue.tuwien.ac.at/pdfs/sispad2022/A-comprehensive-Pelgrom-based-on-current-variability-mod_2023_Solid-State-El.pdf)) [TCAD].

[Inference] With W quantized, analog designers can add area only in discrete fin or sheet steps and through L and multiplicity; the variance of narrow single-fin devices does not average out the way it does in wide planar devices.

### How to measure noise and mismatch: instruments, bias, sample size

**1/f noise instruments**: Keysight E4727B has a bandwidth of 0.03 Hz–100 MHz, minimum S_ID of 1×10⁻²⁸ A²/Hz and minimum ID of 30 pA; E4727A has 40 MHz, 2×10⁻²⁷ A²/Hz and 70 pA, respectively. Measurement time is spent mostly in the 1–10 Hz band: a 0.03 Hz–1 MHz sweep takes 6 min 52 s on the B model and 21 min 4 s on the A model. A multi-shielded low-noise probe station is also required ([Keysight/FormFactor 2020](https://compass.formfactor.com/wp-content/uploads/2020-Arnaldo-Sans-1f-Noise-Challenges-and-Solutions.pdf)).

**imec 2026 wafer-level 1/f measurement flow** ([Asanovski 2026](https://arxiv.org/html/2609.08674)):
- Instruments: B1500 plus E4727B.
- Bias: linear region, VDS = −50 mV (pFET), 25 °C.
- Constant-current points: ID = 100 nA, 200 nA, 1 µA, 2 µA.
- Band: 10 Hz–1 kHz, with Vrms integrated over this band.
- Samples: 94 nanosheet devices and 12 planar reference devices.
- Analysis: sum the spectra of N small devices into one "equivalent large device" for comparison with the planar device; fit the spread with the defect-centric model.

**Mismatch measurement**: use addressable arrays with Kelvin connections, thousands of devices per geometry. Linear-region VT is measured at Vd = 50 mV and saturation at Vd = VDD. Use adjacent-device differences ΔX = X(N+1) − X(N) to remove gradients, and probit/quantile plots to check normality ([Simicic 2015](https://lirias.kuleuven.be/bitstream/123456789/525000/2/IIRW2015_OA.pdf); [Michl, TU Wien](https://www.iue.tuwien.ac.at/phd/michl/node-Variability-Characterization.html)). imec SmartArray measured 30,720 devices at 4.2–300 K; variability grows as temperature falls and L shortens, with gm,max mismatch increasing the most ([Michl](https://www.iue.tuwien.ac.at/phd/michl/node-Variability-Characterization.html)).

[Inference · practical checklist]
1. Before each measurement, measure the system noise floor with an open and a dummy load.
2. Extract N_OT with linear-region bias; measure design-oriented S_VG in saturation at the target gm/ID (10–20 S/A).
3. Measure at least 4–6 current points.
4. Default band: 1 Hz–100 kHz.
5. For small devices, measure tens to hundreds per geometry, report the median and lognormal σ, and keep time-domain waveforms to flag RTN.
6. Fit Pelgrom with at least several geometries, and give confidence intervals.

This survey found no 1/f noise measurement standard such as a JEDEC standard, and no specification for minimum sample size.
## 5. Nanosheet/GAA: better electrostatics, with the hard problems shifting to parasitics, heat and passives

**For analog, nanosheet/GAA brings better electrostatic control (higher intrinsic gain), finer width granularity than fins, and tighter VT/corners. With the same gate stack, 1/f noise is comparable to planar. The main problems are parasitic capacitance and resistance, restricted L and gridded layout, the parasitic channel under the bottom sheet, self-heating, PMOS mobility, and passives that do not scale. Analog device data for production nodes sits almost entirely in PDKs; the public literature is mostly research devices and TCAD.**

Key points:
- "Continuous" width is mainly a device-physics advantage. Production PDKs offer a discrete menu: Intel 18A's W1/W1.5/W2/W3/W3P, and TSMC N2 NanoFlex's "equivalent to 1.5 fins" ([Intel 18A brief 2026](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf); [IEEE Spectrum 2024](https://spectrum.ieee.org/tsmc-n2)).
- imec research devices show intrinsic gain of about 46 dB versus about 34 dB for FinFET (cross-paper comparison), with peak gm/ID of about 35 V⁻¹ ([JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)) [Silicon · research]. This should not be quoted as the difference at a production node.
- With the same gate stack, nanosheet 1/f trap density is comparable to planar ([imec arXiv 2026](https://arxiv.org/html/2609.08674)); nanosheet LER has negligible impact on mismatch, and MGG remains the first-order source ([Fernandez 2022](https://in4.iue.tuwien.ac.at/pdfs/sispad2022/A-comprehensive-Pelgrom-based-on-current-variability-mod_2023_Solid-State-El.pdf)) [TCAD].
- The public value of backside power for analog is mainly in power integrity and thermals: PowerVia cuts worst-case dynamic droop by about 10×; 18A-P lowers stack thermal resistance by 20–40% ([Intel 18A brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)) [Vendor]. There is no public data on how substrate thinning affects isolation and guard rings.
- Forksheet and CFET are so far optimized only for logic and SRAM density; there is no public analog characterization data.

### Analog advantages of GAA over FinFET

| Aspect | FinFET | Nanosheet / GAA | Evidence type | Source |
|---|---|---|---|---|
| Width | Quantized by fin, 2·Hfin + Wfin per fin | Physically continuous, a discrete menu in production (Intel W1–W3P; TSMC NanoFlex can reach "equivalent to 1.5 fins") | Opinion / Vendor | [SemiWiki 2021](https://semiwiki.com/semiconductor-manufacturers/tsmc/300986-tsmc-design-considerations-for-gate-all-around-gaa-technology/); [IEEE Spectrum](https://spectrum.ieee.org/tsmc-n2); [Intel 18A brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf) |
| Intrinsic gain | About 34 dB (literature value cited in the imec paper) | About 46 dB; VEA about 30 V (VGT = 200 mV, VDS = 0.7 V); smaller sheet spacing gives higher gain (4.7 nm better than 7.5 nm) | Silicon · research | [JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770) |
| gm/ID | — | Peak about 35 V⁻¹ at L = 28 nm | Silicon · research | Same as above |
| Temperature | — | Gain nearly unchanged up to 200 °C; ΔVT/ΔT about 0.3–0.8 mV/°C; at 173 K, AV 30 dB, fT 185 GHz, AV·fT about 5.5 THz; at 78 K, SS drops to about 1/4 | Silicon · research | [JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770); [Silva et al., SSE 2023](https://educapes.capes.gov.br/handle/11449/307667?mode=full) |
| VT and corners | Intel 18A offers 4 VT pairs | 18A-P offers 5+ pairs, ULVT 10 mV lower, skew corners tightened by about 33% | Vendor | [Intel 18A brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf); [SemiWiki 2026](https://semiwiki.com/semiconductor-manufacturers/intel/372712-intel-18a-p-pushes-ribbonfet-and-backside-power-beyond-the-first-generation/) |
| Variability sources | Fin bottom profile, LER | Sheet thickness is set by atomic-level epitaxy, which may remove one major variability source | Opinion (imec Ryckaert) | [Semiconductor Engineering](https://semiengineering.com/what-designers-need-to-know-about-gaa/) |
| Ultimate scaling | — | Sub-2 nm stacked nanosheet (Tch 3 nm, Wch 6 nm) gm/gd > 30 | TCAD | [Shen et al., Micromachines 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC12942810/) |

### Problems GAA creates for analog

**Parasitic capacitance and resistance**. In a nanosheet, the gate-to-S/D geometry is set by the inner spacer, so Cgs/Cgd must be co-optimized with drive strength ([SemiWiki 2021](https://semiwiki.com/semiconductor-manufacturers/tsmc/300986-tsmc-design-considerations-for-gate-all-around-gaa-technology/)). imec's Ryckaert argues that narrow nanowire geometries bring "a lot of parasitics for very little current"; beyond about 4 sheets, a 5th sheet mostly adds parasitics ([Semiconductor Engineering](https://semiengineering.com/what-designers-need-to-know-about-gaa/)) [Opinion]. A typical logic sheet is about 5 nm thick and 20–30 nm wide, and practical stacks are 2–4 sheets (same source). People from Synopsys and Fraunhofer note that the added gate-drain and bulk-drain capacitance is "hard to compensate"; L is restricted, so designers can only rely on the W/L ratio; regular grids make analog sizing harder; and customers see about 30% difference between pre- and post-layout simulation ([Semiconductor Engineering 2021](https://semiengineering.com/wrestling-with-analog-at-3nm/)) [Opinion].

**fT versus fmax trade-off**. TCAD shows that an optimized stacked Si nanosheet nFET can reach fT > 400 GHz and fmax ≈ 1.2 THz; widening the channel raises fT by about 40% but lowers fmax by about 35%; a dual-k spacer can improve both ([Shen 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC12942810/)) [TCAD]. [Inference] This suggests that sheet width, finger count and gate-contact strategy become new RF optimization dimensions, compared with fin count in FinFET.

**Parasitic channel under the bottom sheet**. The bottom mesa leakage path still exists and must be suppressed with an extra implant or partial/full bottom dielectric isolation ([SemiWiki 2021](https://semiwiki.com/semiconductor-manufacturers/tsmc/300986-tsmc-design-considerations-for-gate-all-around-gaa-technology/)).

**PMOS and strain**. Without optimization, nanosheet hole mobility is "significantly lower" than electron mobility, so β-ratio considerations return; SiGe pFET content and thickness are harder to control (same source). imec estimates that the loss of channel strain costs about 33% of drive current in nanosheet and inner-wall forksheet ([EE Times 2025](https://www.eetimes.com/vlsi-2025-outer-wall-forksheet-bridges-nanosheet-and-cfet-architectures/)) [TCAD].

**Self-heating**. Self-heating in a dielectric-surrounded stack "will be different, but how much it matters is not yet clear" (Ansys Swinnen, [Semiconductor Engineering](https://semiengineering.com/what-designers-need-to-know-about-gaa/)) [Opinion]. Intel claims 18A-P lowers stack thermal resistance by 20–40% versus 18A ([Intel 18A brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)) [Vendor]. This indirectly indicates that the first-generation backside-power process had thermal resistance worth improving [Inference].

**Passives**. A 100 Ω poly resistor takes about the same area at 28 nm as at 180 nm, and LC inductors do not scale either ([Semiconductor Engineering 2021](https://semiengineering.com/wrestling-with-analog-at-3nm/)) [Opinion]. Intel 18A's Omni MIM reaches 397 fF/µm² ([Intel 18A brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)) [Vendor]. [Inference] Analog area is increasingly set by passives and matching requirements, and the density gain of GAA lands mainly on the digitally assisted parts.

### How flicker noise, RTN and mismatch change in nanosheets

The most recent open measured results come from imec's 2026 study: on p-type nanosheets with 48 nm CGP and 1 nm EOT, effective border-trap density and area-normalized noise are both comparable to planar HKMG devices with the same gate stack; the aggregate spectrum is clean 1/f; VT is normally distributed; and nanosheets show higher SS due to short-channel effects ([Asanovski et al., arXiv 2609.08674](https://arxiv.org/html/2609.08674)) [Silicon · research]. The imec/USP 2022 results: sheet spacing has little effect, different metal gates change N_OT and α_SC, and pMOS is qualitatively similar ([JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)).

**Conclusion for process engineers**: in nanosheets, the first-order knob for flicker noise is the gate stack, i.e. interfacial layer, high-k, work-function metal and thermal budget, not the GAA geometry itself [Inference, based on a single pMOS dataset].

[Inference · expected changes]
- The effective width per sheet is 2(W+H), so the noise-normalization area should be n_sheets × 2(W+H) × L.
- Interface quality differs between the top/bottom (100) surfaces and the sidewalls and corners.
- Inner spacer and RMG cavity processing may introduce traps at the S/D ends.
- The bottom sheet sits close to the sub-fin, so the sheets do not contribute equally, which increases spread in small devices.
- Single-sheet gate area is tiny (in the example, Weff ≈ 47 nm × L ≈ 19 nm), so a single minimum device will be RTN-dominated; large-multiplier devices and statistical noise models are required.

**Mismatch**: MGG remains the first-order source, and LER impact is negligible [TCAD] ([Fernandez 2022](https://in4.iue.tuwien.ac.at/pdfs/sispad2022/A-comprehensive-Pelgrom-based-on-current-variability-mod_2023_Solid-State-El.pdf)). This review found no public measured AVT comparison between nanosheet and FinFET, and no public data on how sheet width, sheet count, SiGe channel or WFM-based multi-VT affect flicker.

### What production GAA nodes have disclosed that is relevant to analog

| Vendor and node | Disclosed analog-relevant information | Evidence type | Source |
|---|---|---|---|
| Samsung 3 nm GAA (MBCFET) | Volume production started 2022-06-30; VLSI 2022 presented a 3 nm GAAFET analog-assisted digital LDO (load < 1 mA to 1.4 A, droop about 38 mV for a 1 A/1 ns step); ISSCC 2021 SRAM improved disturb margin by tuning sheet width | Silicon · circuit | [Samsung](https://semiconductor.samsung.com/news-events/news/samsung-begins-chip-production-using-3nm-process-technology-with-gaa-architecture/); [Semiconductor Digest 2022](https://www.semiconductor-digest.com/samsung-has-18-talks-at-the-vlsi-symposia-in-june-including-3nm-gaafet-ldo/); [Semiconductor Digest 2021](https://www.semiconductor-digest.com/gate-all-around-transistors-show-up-at-isscc/) |
| TSMC N2 | NanoFlex mixed-width cells; up to +15% speed or +30% power efficiency vs N3; SRAM 38 Mb/mm²; no device-level analog data | Vendor | [IEEE Spectrum 2024](https://spectrum.ieee.org/tsmc-n2) |
| Intel 18A / 18A-P | Omni MIM 397 fF/µm²; PowerVia worst-case dynamic droop about 10× lower; 18A-P dual contacts cut external resistance by 20% (N)/12% (P) and raise drive by 5%/16%; tighter corners; mentions "fully isolated body transistors" | Vendor | [Intel 18A brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf); [SemiWiki 2026](https://semiwiki.com/semiconductor-manufacturers/intel/372712-intel-18a-p-pushes-ribbonfet-and-backside-power-beyond-the-first-generation/) |
| imec research devices | Gain, gm/ID, fT, temperature and 1/f noise (see above) | Silicon · research | [JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770); [SSE 2023](https://educapes.capes.gov.br/handle/11449/307667?mode=full); [arXiv 2026](https://arxiv.org/html/2609.08674) |

This review found no Rg, measured fT/fmax, AVT or Kf for Samsung SF3/SF2, TSMC N2 or Intel 18A, and no public description of thick-oxide I/O, ESD, BJT, varactor or LDE in GAA PDKs. These are likely under NDA.

### What backside power delivery (BSPDN) means for analog

imec's DTCO study:
- nTSVs about 320 nm deep land on buried power rails at 200 nm pitch, with a block-level tap pitch of 4–6 µm.
- Changing the nTSV fill from W to Ru cuts IR drop by 23%.
- Compared with frontside power, frequency improves by 6% and area shrinks by 16%.
- "Extreme substrate thinning" is listed as a key integration challenge.
- A 2022 demonstration showed that backside processing did not degrade FinFET front-end devices.

([imec 2023](https://imec-int.com/en/articles/backside-power-delivery-options-dtco-study))

Intel's message to analog designers centers on power integrity: PowerVia worst-case dynamic droop is about 10× lower, and Omni MIM is used to reduce supply-induced jitter; 18A-P lowers thermal resistance by 20–40%, raises bonded-stack thermal conductance by 50%, and reduces ΔT by up to 40% at 1500 W/cm² ([Intel 18A brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)) [Vendor]. Cadence notes that buried power rails free up frontside routing, allowing wider, lower-resistance wires ([Semiconductor Engineering 2021](https://semiengineering.com/wrestling-with-analog-at-3nm/)).

[Inference] Once the bulk substrate is removed and the wafer is bonded to a carrier, substrate coupling paths change: guard rings and deep wells lose the conductive bulk substrate, and thermal resistance also rises. Intel's mention of "fully isolated body transistors" hints that the backside process may provide body isolation as a by-product, which could be useful for analog isolation. However, this review **found no public data at all** on how substrate noise isolation, guard-ring effectiveness, inductor Q and ESD change under BSPDN. This is the key area to request internal data.

### Forksheet, CFET and the further frontier

imec's outer-wall forksheet presented at VLSI 2025 targets the A10 node with a 90 nm cell height, versus 115 nm for A14 nanosheet. The inner wall needs about 8–10 nm of dielectric; the outer wall uses about 15 nm SiO₂ shared at the cell boundary. A W-shaped gate raises drive by about 25% (simulation). A Si "ridge" can retain full channel strain. SRAM bitcell area shrinks by 22%. CFET is expected to enter production from the A7 node. The article does not discuss analog, I/O or multi-VT ([EE Times 2025](https://www.eetimes.com/vlsi-2025-outer-wall-forksheet-bridges-nanosheet-and-cfet-architectures/)) [TCAD + layout study]. Work on inverters built from stacked complementary nanosheets is in [Xiong et al., Nature Electronics 2024](https://doi.org/10.1038/s41928-024-01329-3).

[Inference] Possible impacts on analog:
- In forksheet, the dielectric wall between n and p introduces new capacitance and proximity terms.
- In the inner-wall scheme, electrostatic control is one-sided, approximating a tri-gate.
- CFET stacks n and p vertically, making it hard to size n and p independently and making multi-VT more complex, and these are exactly the two things analog relies on.

One can therefore expect analog to stay on side-by-side devices, older nodes or chiplets. There is currently no public analog, RF or noise data for forksheet, CFET or 2D channels.

### Implications for 3D IC and chiplet work

Industry opinion already points to partitioning: most analog goes into chiplets, with only PLLs and die-to-die interfaces kept on the GAA die; the design flow starts from post-layout simulation and TCAD-based DTCO, with more Monte Carlo, high-σ and ML-accelerated verification (Fraunhofer's Heinig et al., [Semiconductor Engineering 2021](https://semiengineering.com/wrestling-with-analog-at-3nm/)) [Opinion].

[Inference] For an engineer moving into 3D IC and analog, four questions are worth building intuition for first:
1. **Thermal**: 3D stacking and backside power both change the heat path, and analog gds dispersion, VT(T) and ZTC biasing are all temperature-sensitive.
2. **Supply and substrate noise**: BSPDN improves droop, but the substrate isolation mechanism changes.
3. **Where to put passives**: MIM caps and inductors do not scale; which layer or which die suits them.
4. **Cross-die matching cannot be relied on**: Pelgrom's "same environment" principle means matched devices must be in the same local region of the same die.

### Gaps in the public literature: questions that need internal data

This review confirmed that the following have **no public source**:
- AVT, Aβ, Kf/S_VG·WL, gm/gds–L, Rg, NFmin and γ for production GAA nodes (N2, 18A, SF2).
- Quantitative comparison of stacked-gate N×Lmin versus a single long L in FinFET/GAA.
- Substrate isolation, guard rings, inductor Q and ESD under BSPDN.
- The effect of top-versus-bottom sheet differences on noise and mismatch.
- Any analog data for forksheet and CFET.

The public literature can only provide a framework for these questions; the answers must come from PDK device reports and internal characterization.

## 6. Conclusion: a process-integration background is a shortcut to learning analog devices

**For someone with a process-integration background, the key to learning analog devices is remapping familiar process knobs onto analog metrics; the physics is mostly already there, and what needs to be learned is the gm/ID language and statistical thinking.**

Key points:
- Halo, EOT, metal gate, S/D resistance, gate contact, sheet spacing: each knob maps to one or two analog metrics.
- Noise and mismatch are statistical problems; "typical device" thinking is not enough, and arrays and distributions are needed.
- In the GAA era the analog bottlenecks are parasitics, heat, passives and system partitioning, which fall squarely within the scope of 3D IC work.

### Mapping process knobs to analog metrics

| Process knob | Main analog metrics affected | Direction / evidence |
|---|---|---|
| Halo/pocket implant | gds, VEA, long-channel DIBL, RSCE | Harmful for longer analog devices ([Mudanai 2006](https://briefs.techconnect.org/papers/halo-doping-physical-effects-and-compact-modeling/)) |
| Channel doping (RDF) | AVT | Undoped fins roughly halve AVT ([Fulde 2007](https://d-nb.info/1149772921/34)) |
| EOT | AVT, S_VG | AVT ∝ tox ([Pelgrom 2013](https://indico.cern.ch/event/228972/contributions/1539553/attachments/378475/526400/TWEPP24sept2013Print.pdf)); thinner EOT gives lower normalized S_VG ([JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)) |
| Metal gate / WFM | N_OT, α_SC, MGG mismatch | Different metal gates give different N_OT ([JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)); MGG is a first-order mismatch source in FinFET and NS ([Fernandez 2022](https://in4.iue.tuwien.ac.at/pdfs/sispad2022/A-comprehensive-Pelgrom-based-on-current-variability-mod_2023_Solid-State-El.pdf)) |
| Fin profile (angle, LER) | AVT | Fin angle variation degrades matching ([IBM 2015](https://research.ibm.com/publications/transistor-matching-and-fin-angle-variation-in-finfet-technology)) |
| S/D epi, contact resistance | gm, fT, fmax | FinFET gm up to 30% lower ([Fulde](https://d-nb.info/1149772921/34)); 18A-P dual contacts cut external resistance by 20%/12% ([SemiWiki 2026](https://semiwiki.com/semiconductor-manufacturers/intel/372712-intel-18a-p-pushes-ribbonfet-and-backside-power-beyond-the-first-generation/)) |
| Gate contact scheme | fmax, NF | Double-sided contact raises fmax by 1.26×/1.40× ([Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)) |
| Spacer dielectric constant | fT, fmax | Dual-k spacer improves both ([Shen 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC12942810/)) [TCAD] |
| Sheet spacing | Intrinsic gain | Smaller spacing gives higher gain ([JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)) |
| Deep N-well | Substrate noise | Up to 75 dB reduction at 0.1 GHz ([Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)) |
| Backside power, bonded stack | Droop, thermal resistance, substrate coupling | Droop about 10× lower; thermal resistance needs dedicated optimization ([Intel 18A brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)); no data on isolation |

Two judgments run through this whole report. First, from planar to FinFET to GAA, each step forward in electrostatic control loosens the "gain problem" a little and tightens "parasitics, heat, passives and statistical variability" a little; the analog bottleneck is moving from the transistor itself to the structures around it. Second, the public literature is almost blank at advanced nodes, so expert value in this field lies in knowing what to measure, how to measure it and how to interpret it, not in how many numbers one remembers. This is exactly where process and device engineers have an advantage over circuit designers.

## Learning method

**For a learner with deep device expertise who dislikes linear reading, the best-supported approach is: draw a map first, use retrieval practice instead of rereading, consolidate with spaced review, start from problems and simulation, and look at worked examples only when meeting a new formalism (gm/ID lookup tables).**

Key points:
- The 2013 review by Dunlosky et al. rated **practice testing** and **distributed practice** as "high utility", and rereading, highlighting and summarization as "low utility" ([Dunlosky 2013](https://doi.org/10.1177/1529100612453266)).
- "Map first, then zoom in" is supported by advance organizer research ([Ausubel 1960](https://doi.org/10.1037/h0046669)).
- **Expertise reversal effect**: detailed worked examples that help novices can become ineffective or even harmful for experienced learners ([Kalyuga et al. 2003](https://doi.org/10.1207/S15326985EP3801_4)).
- Interleaved practice feels harder during practice but gives better delayed-test scores ([Rohrer & Taylor 2007](https://doi.org/10.1007/s11251-007-9015-8)).
- Actually teaching others yields better delayed learning than only preparing to teach ([Fiorella & Mayer 2013](https://doi.org/10.1016/j.cedpsych.2013.06.001)).

### Learning-science evidence at a glance

| Method | Evidence | Use in this topic |
|---|---|---|
| Retrieval practice (self-testing) | High utility ([Dunlosky 2013](https://doi.org/10.1177/1529100612453266)); study-then-test gives better delayed retention than repeated study ([Roediger & Karpicke 2006](https://doi.org/10.1111/j.1467-9280.2006.01693.x)); better than elaborative concept mapping ([Karpicke & Blunt 2011](https://doi.org/10.1126/science.1199327)); meta-analysis agrees ([Adesope 2017](https://doi.org/10.3102/0034654316689306)) | At the end of each session, write 5–10 questions from memory, e.g. "Why is intrinsic gain highest in weak inversion?" |
| Spaced repetition | High utility ([Cepeda 2006](https://doi.org/10.1037/0033-2909.132.3.354)); the optimal gap grows with how long the material must be retained ([Cepeda 2008](https://doi.org/10.1111/j.1467-9280.2008.02209.x)) | Retest on Days 1, 2, 4 and 7, with gaps gradually widening |
| Interleaved practice | Moderate utility; better delayed-test results ([Rohrer & Taylor 2007](https://doi.org/10.1007/s11251-007-9015-8)) | Mix gain, noise and mismatch in self-test questions instead of blocking by chapter |
| Advance organizer / concept map | [Ausubel 1960](https://doi.org/10.1037/h0046669); concept maps help retention and transfer ([Nesbit & Adesope 2006](https://doi.org/10.3102/00346543076003413)) | On Day 1, draw a "metrics map" first, then read as needed |
| Self-explanation | [Chi et al. 1994](https://doi.org/10.1207/s15516709cog1803_3) | After each figure, explain in one sentence "why the curve has this shape" |
| Learning by teaching | [Fiorella & Mayer 2013](https://doi.org/10.1016/j.cedpsych.2013.06.001) | Each day, write one page or record a 5-minute explanation aimed at a logic-process colleague |
| Active learning, learning by doing | Active learning improves exam scores; students in pure lecture have about 1.5× the failure rate ([Freeman et al. 2014](https://doi.org/10.1073/pnas.1319030111)) | Generate gm/ID curves with an open-source PDK: predict first, then simulate |
| Expertise reversal effect | [Kalyuga 2003](https://doi.org/10.1207/S15326985EP3801_4); worked examples help novices ([Sweller & Cooper 1985](https://doi.org/10.1207/s1532690xci0201_3)) | Start the device-physics part from problems and data; use worked examples only for the lookup-table sizing flow |

### Map first, go deep on demand

On the first day, do not read a book. First draw an "analog device metrics map" from memory: gm/ID ↔ IC ↔ fT ↔ gm·ro ↔ noise (4kTγ/gm, 1/f) ↔ mismatch (AVT/√WL) ↔ layout and LDE. Then check it against a textbook to find gaps, and read only the sections that fill them, i.e. "just-in-time reading". The map itself is an advance organizer ([Ausubel 1960](https://doi.org/10.1037/h0046669)), and self-constructed concept maps are also supported by meta-analysis ([Nesbit & Adesope 2006](https://doi.org/10.3102/00346543076003413)). On Day 7, redraw it from memory and compare with the Day 1 version; the difference is what you learned.

### Retrieve instead of rereading, and consolidate with spacing

Reserve 20–30% of each session for retrieval rather than spending it all on reading. Write questions from memory, and look things up only when you cannot answer. You can keep an Anki deck and retest on a Day 1 → 2 → 4 → 7 schedule ([Cepeda 2008](https://doi.org/10.1111/j.1467-9280.2008.02209.x)). Note that rereading makes material feel more familiar, but good scores on an immediate quiz do not imply delayed retention ([Roediger & Karpicke 2006](https://doi.org/10.1111/j.1467-9280.2006.01693.x)).

### Use the expert advantage: start from problems and data

Following the expertise reversal effect ([Kalyuga 2003](https://doi.org/10.1207/S15326985EP3801_4)), the device-physics part should skip introductory derivations and start directly from a prediction question. For example: "If L goes from 2× to 10× Lmin, how does the gm/gds versus gm/ID curve shift? Where does halo make it deviate?" Write down the prediction first, then verify with simulation or data. What is genuinely new is the gm/ID lookup-table sizing flow and statistical noise thinking; these two parts are worth studying through the worked examples in Jespers & Murmann. Note that the learning-science evidence above comes mainly from studies of students learning course material; applying it to a 7-day sprint by a mid-career expert is an inference.

### Learn by teaching and doing: produce reusable material

Each day, produce one page of "explanation for a logic-process colleague", and on Day 7 compile it into a 15-minute talk. Explaining strengthens learning ([Fiorella & Mayer 2013](https://doi.org/10.1016/j.cedpsych.2013.06.001)) and also leaves material the team can use. For the hands-on part, use an open-source toolchain to turn abstract metrics into curves you have plotted yourself ([Freeman 2014](https://doi.org/10.1073/pnas.1319030111)), then mentally compare them with the FinFET/GAA data you already know.

## Sources

**Metrics, device differences and layout**
- Palermo, TAMU ECEN474 Lecture 7 (gm/ID): https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf
- Sheikholeslami, "Process Variation and Pelgrom's Law," IEEE SSC Magazine 2015: https://www.eecg.utoronto.ca/~ali/papers/mag-win-15-process-variation.pdf
- Pelgrom, Tuinhout, Vertregt, IEDM 1998: https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf
- Fulde et al., Adv. Radio Sci. 5 (2007): https://d-nb.info/1149772921/34
- Bucher, EPFL NanoTera 2011: https://www.epfl.ch/labs/iclab/wp-content/uploads/2019/02/Bucher_NanoTera_2011.pdf
- Mudanai et al. (Intel), Halo Doping, Nanotech 2006: https://briefs.techconnect.org/papers/halo-doping-physical-effects-and-compact-modeling/
- ASIC North, FinFET Back-End Layout (2023): https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/
- GF180MCU DRM 5.4: https://mithro-gf180mcu-pdk.readthedocs.io/en/latest/physical_verification/design_manual/drm_05_4.html
- eeNews Europe, Layout-dependent effects (2014): https://www.eenewseurope.com/en/layout-dependent-effects-in-analog-design

**Gain and long-channel alternatives**
- Badaroglu et al., imec, MOS-AK 2012: https://www.mos-ak.org/sanfrancisco_2012/presentations/T01_Badaroglu_MOS-AK_121212.pdf
- WikiChip, Intel 22FFL (IEDM 2017): https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3
- Waller, "All about stacked MOSFETs in analog layout," EDN 2021: https://www.edn.com/all-about-stacked-mosfets-in-analog-layout/
- Galup-Montoro et al., CICC 2007: https://lci.ufsc.br/pdf/18-6.pdf
- UCLouvain asymmetric self-cascode: https://research.dial.uclouvain.be/handle/2078.5/127916
- Semiconductor Digest, Samsung 3nm GAAFET LDO (2022): https://www.semiconductor-digest.com/samsung-has-18-talks-at-the-vlsi-symposia-in-june-including-3nm-gaafet-ldo/

**Noise and mismatch**
- C.-Y. Chen, Stanford PhD dissertation 2010: https://stacks.stanford.edu/file/druid:pf645xz5659/cy_thesis-augmented.pdf
- Simoen et al., JICS 17(2), 2022: https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770
- Singh et al. (GF), 14-nm FinFET for Analog and RF, IEEE TED 2018: https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications
- Asanovski et al. (imec), arXiv 2609.08674: https://arxiv.org/html/2609.08674 ; https://arxiv.org/abs/2609.08674
- VLSI Symposium 2009 3B-3 (RTN): https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm
- Simicic et al., IIRW 2015: https://lirias.kuleuven.be/bitstream/123456789/525000/2/IIRW2015_OA.pdf
- McNeill, Noise in Short Channel MOSFETs: https://users.wpi.edu/~mcneill/papers/CICC_v09_CORRECTED.pdf
- IEEE Xplore 9383331 (14 nm RF FinFET γ): https://ieeexplore.ieee.org/document/9383331
- Pelgrom, TWEPP-13 2013: https://indico.cern.ch/event/228972/contributions/1539553/attachments/378475/526400/TWEPP24sept2013Print.pdf
- Agarwal, Hook et al. (IBM), fin angle variation, TED 2015: https://research.ibm.com/publications/transistor-matching-and-fin-angle-variation-in-finfet-technology
- Fernandez et al., SSE 2022 (Pelgrom-based Ion variability): https://in4.iue.tuwien.ac.at/pdfs/sispad2022/A-comprehensive-Pelgrom-based-on-current-variability-mod_2023_Solid-State-El.pdf
- Michl, TU Wien PhD thesis: https://www.iue.tuwien.ac.at/phd/michl/node-Variability-Characterization.html
- Keysight/FormFactor, 1/f Noise Challenges and Solutions (2020): https://compass.formfactor.com/wp-content/uploads/2020-Arnaldo-Sans-1f-Noise-Challenges-and-Solutions.pdf

**Nanosheet/GAA and the frontier**
- SemiWiki, TSMC GAA design considerations (2021): https://semiwiki.com/semiconductor-manufacturers/tsmc/300986-tsmc-design-considerations-for-gate-all-around-gaa-technology/
- Semiconductor Engineering, What Designers Need To Know About GAA: https://semiengineering.com/what-designers-need-to-know-about-gaa/
- Semiconductor Engineering, Wrestling With Analog At 3nm (2021): https://semiengineering.com/wrestling-with-analog-at-3nm/
- IEEE Spectrum, TSMC N2 (2024): https://spectrum.ieee.org/tsmc-n2
- Intel Foundry 18A technology brief (June 2026): https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf
- SemiWiki, Intel 18A-P (2026): https://semiwiki.com/semiconductor-manufacturers/intel/372712-intel-18a-p-pushes-ribbonfet-and-backside-power-beyond-the-first-generation/
- Semiconductor Digest, GAA at ISSCC (2021): https://www.semiconductor-digest.com/gate-all-around-transistors-show-up-at-isscc/
- Samsung 3nm GAA production: https://semiconductor.samsung.com/news-events/news/samsung-begins-chip-production-using-3nm-process-technology-with-gaa-architecture/
- Silva et al., SSE 2023 (nanosheet 473–173 K): https://educapes.capes.gov.br/handle/11449/307667?mode=full
- Shen et al., Micromachines 2026 (TCAD nanosheet RF): https://pmc.ncbi.nlm.nih.gov/articles/PMC12942810/
- EE Times, imec outer-wall forksheet (VLSI 2025): https://www.eetimes.com/vlsi-2025-outer-wall-forksheet-bridges-nanosheet-and-cfet-architectures/
- imec, Backside power delivery DTCO (2023): https://imec-int.com/en/articles/backside-power-delivery-options-dtco-study
- Xiong et al., Nature Electronics 2024 (CFET inverters): https://doi.org/10.1038/s41928-024-01329-3
- Yoon et al., IEEE Access 2020: https://doi.org/10.1109/access.2020.3031870
- Sonoda et al., SBMicro 2026: https://doi.org/10.1109/sbmicro70495.2026.11684453

**Textbooks and classic papers**
- Razavi, Design of Analog CMOS ICs, 2nd ed.: https://www.mheducation.com/highered/product/design-of-analog-cmos-integrated-circuits-razavi.html
- Jespers & Murmann 2017: https://doi.org/10.1017/9781108125840
- Enz & Vittoz, EKV: https://doi.org/10.1002/0470855460
- Enz, Chicco, Pezzotta Part 1: https://doi.org/10.1109/MSSC.2017.2712318 ; Part 2: https://doi.org/10.1109/MSSC.2017.2745838
- Binkley 2008: https://doi.org/10.1002/9780470033715 ; Binkley 2003: https://doi.org/10.1109/TCAD.2002.806606
- Pelgrom ADC book: https://doi.org/10.1007/978-3-030-90808-9 ; Modeling of MOS Matching: https://doi.org/10.1007/978-90-481-8614-3_15 ; A Designer's View on Mismatch: https://doi.org/10.1007/978-1-4614-4587-6_13
- Sansen, Analog Design Essentials: https://doi.org/10.1007/b135984
- von Haartman & Östling: https://doi.org/10.1007/978-1-4020-5910-0
- Tsividis & McAndrew (OUP): https://global.oup.com/academic/product/operation-and-modeling-of-the-mos-transistor-9780195170153
- Pelgrom 1989: https://doi.org/10.1109/JSSC.1989.572629 ; Pelgrom 1998: https://doi.org/10.1109/IEDM.1998.746503
- Kinget 2005: https://doi.org/10.1109/JSSC.2005.848021
- Silveira 1996: https://doi.org/10.1109/4.535416
- Hung 1990: https://doi.org/10.1109/16.47770
- Claeys 2004: https://doi.org/10.1149/1.1683633 ; Claeys 2000: https://doi.org/10.1016/s0026-2714(00)00068-8
- Tuinhout ICMTS 2000: https://doi.org/10.1109/icmts.2000.844419 ; ICMTS 2003: https://doi.org/10.1109/icmts.2003.1197465
- Murmann, Thermal Noise in T&H, SSC Mag 2012: https://doi.org/10.1109/mssc.2012.2192190
- Razavi, The Analog Mind (2025): https://doi.org/10.1109/mssc.2025.3611213 ; (2026): https://doi.org/10.1109/mssc.2026.3686589
- Kilchytska ESSDERC 2004: https://doi.org/10.1109/essder.2004.1356489
- Subramanian TED 2006: https://doi.org/10.1109/ted.2006.885649
- Wambacq ESSDERC 2006: https://doi.org/10.1109/essder.2006.307636
- Parvais VLSI-TSA 2009: https://doi.org/10.1109/vtsa.2009.5159300
- Zhong IEDM 2014: https://doi.org/10.1109/iedm.2014.7046971
- Wang S3S 2014: https://doi.org/10.1109/s3s.2014.7028207
- Liu IEDM 2021: https://doi.org/10.1109/iedm19574.2021.9720680

**Courses and tools**
- bmurmann/Book-on-gm-ID-design: https://github.com/bmurmann/Book-on-gm-ID-design
- bmurmann/EE628: https://github.com/bmurmann/EE628
- IIC-OSIC-TOOLS: https://github.com/iic-jku/IIC-OSIC-TOOLS
- Pretl, Analog Circuit Design: https://iic-jku.github.io/analog-circuit-design/ ; https://github.com/iic-jku/analog-circuit-design
- pygmid: https://github.com/dreoilin/pygmid
- Mosplot (medwatt/gmid): https://github.com/medwatt/gmid
- Xschem: https://github.com/StefanSchippers/xschem
- IHP Open PDK: https://github.com/IHP-GmbH/IHP-Open-PDK ; https://ihp-open-pdk-docs.readthedocs.io/
- SKY130: https://github.com/google/skywater-pdk ; https://skywater-pdk.readthedocs.io/ ; open_pdks: https://github.com/RTimothyEdwards/open_pdks ; ciel: https://github.com/fossi-foundation/ciel
- GF180MCU: https://github.com/google/gf180mcu-pdk ; https://gf180mcu-pdk.readthedocs.io/
- MIT OCW 6.012: https://ocw.mit.edu/courses/6-012-microelectronic-devices-and-circuits-fall-2009/ ; 6.301: https://ocw.mit.edu/courses/6-301-solid-state-circuits-fall-2010/ ; 6.776: https://ocw.mit.edu/courses/6-776-high-speed-communication-circuits-spring-2005/
- nanoHUB-U Fundamentals of Nanotransistors: https://nanohub.org/courses/NT
- IEEE SSCS Education: https://sscs.ieee.org/education/ ; Resource Center: https://resourcecenter.sscs.ieee.org/
- circuitgenome gmid_lut: https://circuitgenome.readthedocs.io/en/stable/api/sizer/shared/gmid_lut.html

**Learning science**
- Dunlosky et al. 2013: https://doi.org/10.1177/1529100612453266
- Roediger & Karpicke 2006: https://doi.org/10.1111/j.1467-9280.2006.01693.x
- Karpicke & Blunt 2011: https://doi.org/10.1126/science.1199327
- Adesope et al. 2017: https://doi.org/10.3102/0034654316689306
- Cepeda et al. 2006: https://doi.org/10.1037/0033-2909.132.3.354 ; 2008: https://doi.org/10.1111/j.1467-9280.2008.02209.x
- Rohrer & Taylor 2007: https://doi.org/10.1007/s11251-007-9015-8
- Ausubel 1960: https://doi.org/10.1037/h0046669
- Kalyuga et al. 2003: https://doi.org/10.1207/S15326985EP3801_4
- Sweller & Cooper 1985: https://doi.org/10.1207/s1532690xci0201_3
- Chi et al. 1994: https://doi.org/10.1207/s15516709cog1803_3
- Nesbit & Adesope 2006: https://doi.org/10.3102/00346543076003413
- Fiorella & Mayer 2013: https://doi.org/10.1016/j.cedpsych.2013.06.001
- Freeman et al. 2014: https://doi.org/10.1073/pnas.1319030111


---

# Recovering Analog Performance Without Long Channels

In FinFET/nanosheet processes, the intrinsic gain gm·ro of a single device is only a few tens, and L is pinned by the fixed pitch. There are three ways to get gain back. At the device level, chain several short devices in series, or use relaxed-pitch or thick-oxide devices. At the circuit level, use feedback, time or charge to "multiply" gain. At the system level, use digital calibration so the circuit no longer needs precise gain. In ideal long-channel theory, series-stacked devices (stacked gates / self-cascode) are fully equivalent to one long device of length N·L ([Vittoz EKV](https://www.epfl.ch/labs/iclab/wp-content/uploads/2019/02/10_EKV_UMW04_Eric_Vittoz.pdf)). In short channels, a stack behaves more like "a saturated top device on a linear-region resistor", that is, a self-cascode. Gain grows roughly linearly with N (about +6 dB per doubling), far below an independently biased cascode (about (gm·ro)²). Its value is that it needs no extra bias, saves voltage headroom, and improves matching and 1/f noise. The costs are area, internal-node parasitics and modeling risk; industry reports a pre-/post-layout simulation gap of about 30% ([Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)). At the circuit level, at 0.7–0.9 V, the techniques that buy the most "gain per volt of headroom" are gain boosting, correlated level shifting (CLS), ring amplifiers and multistage amplifiers. Dynamic amplifiers and digital calibration remove the need for precise gain altogether. Offset, 1/f noise and drift need chopping, auto-zero/CDS and calibration. Gain techniques do not solve them.

In the nanosheet era, 1/f noise is set mainly by the trap density of the gate stack. Geometry matters little. imec measurements show that, with the same gate stack, nanosheet and planar devices have similar border trap density ([Asanovski et al., arXiv 2609.08674](https://arxiv.org/html/2609.08674)). So the process knobs for noise are anneals (high-pressure D₂ cut noise by about 4.8x on FD-SOI TFETs), thermal budget, EOT and dipoles. The design knobs are area, low overdrive and chopping. The first-order source of mismatch is metal gate grains (WFV); LER has little effect in nanosheets. DIBL gets worse as sheets get wider. fT/fmax is set mainly by parasitics: sheet gap, S/D epi thickness, contact scheme and BDI. BDI improves RF and leakage but makes self-heating worse. Most of these conclusions come from research devices and TCAD. AVT, Kf, gm/gds, fT and Rth for production nodes such as TSMC N2, Samsung SF3/SF2 and Intel 18A are not public. They need to be confirmed against the foundry PDK or your own silicon data.

## Overview map

**First find the technique by "the problem to solve", then check what it improves, what it costs, and which section covers it.**

Key points:
- Gain problems have three kinds of solutions: device composition (§1), circuit multiplication (§2) and digital calibration (§3).
- Offset, 1/f noise and drift are a separate class of problem. They are handled by time-domain cancellation, calibration and area (§3, §4).
- Process knobs and design practices for intrinsic device parameters (noise, mismatch, DIBL, fT, self-heating) are in §4–§6.
- Evidence tags: [Textbook] textbook or general knowledge; [Silicon · research] measurements on research devices or research circuits; [Silicon · production platform] published data from production or near-production processes; [TCAD] device simulation; [Simulation] circuit simulation; [Vendor] vendor briefs, press releases or patent claims; [Opinion] industry interviews or blogs; [Inference] this report's own reasoning; [Illustration] illustrative numbers used to explain a principle.

| Problem | Technique | What it improves | Main cost | Section |
|---|---|---|---|---|
| L is limited, single-device gm·ro is low | Series stack / self-cascode | ro and gain grow roughly with N; better matching and 1/f | Area, internal-node parasitics, lower fT, modeling error | §1 |
| Single-stage gain is not enough | Cascode (telescopic / folded) | Gain rises to the order of (gm·ro)² | Each level costs one VDSAT | §2 |
| High gain needed at low VDD | Gain boosting | +20–40 dB without adding series devices | Pole-zero doublet, power, common-mode range | §2 |
| High gain needed at low VDD | Multistage + nested Miller compensation | 20–30 dB per stage, multiplied | Lower bandwidth, stability sensitive to load | §2 |
| Need higher gm·ro | Low-inversion bias | Higher gm/ID and gain, lower VDSAT | Lower fT, larger devices | §2 |
| Imprecise open-loop gain is acceptable | Positive-feedback load, dynamic amplifier | Low power, high gain | Sensitive to PVT, calibration required | §2 |
| Gain and swing of switched-capacitor circuits | CLS, ring amplifier, inverter-based amplifier | Effective loop gain about A², near rail-to-rail | More clock phases, discrete-time circuits only | §2 |
| Voltage headroom is the bottleneck | Time-domain / VCO architectures | Phase integration replaces voltage gain | VCO nonlinearity, jitter | §2 |
| Offset and 1/f noise | Chopping, auto-zero, CDS | Offset and 1/f noise are moved away or subtracted | Ripple, white-noise aliasing, clocks | §3 |
| Gain error, mismatch | Digital calibration | Removes the need for precise analog gain | Design, verification and test complexity | §3 |
| Matching and LDE | Layout (dummies, common centroid, double-sided gate contacts) | σΔVT, gradients, Rg noise | Area, routing | §3, §6 |
| Advanced node is unsuited to precision analog | Chiplet partitioning | Precision analog goes on a suitable node | Packaging and interface cost | §3 |
| Nanosheet 1/f and RTN | Gate-stack anneal, EOT, dipole; area, low overdrive | Lower N_BT, RTN averaging | Thermal budget, area | §4 |
| Mismatch, DIBL, fT, self-heating | Metal gate grains, sheet width and count, BDI, contacts | AVT, gm/gds, fT/fmax, Rth | Mostly process trade-offs | §5 |

### How to read this report

The bold sentence at the start of each section is the direct answer. "Key points" are conclusions that stand on their own. The subsections that follow give the details. Every number carries an evidence tag. Numbers from research devices and TCAD show direction only. Do not quote them as production PDK values.

## 1. Series stacks: how to "build" a long channel when you do not have one

**In an ideal long channel, N series short devices with a common gate are fully equivalent to one device of length N·L. In short channels, the stack behaves more like a self-cascode (top device saturated, lower segments in the linear region). Gain grows roughly linearly with N and is an order of magnitude below an independently biased cascode. Its advantages are no extra bias and better matching and 1/f. Its drawbacks are area, parasitics and modeling.**

Key points:
- [Textbook] In EKV/ACM theory, series segments in a uniform long channel add like resistors, so their lengths add. Short-channel effects (CLM, DIBL, velocity saturation) and each segment's own halo break this equivalence ([Vittoz EKV](https://www.epfl.ch/labs/iclab/wp-content/uploads/2019/02/10_EKV_UMW04_Eric_Vittoz.pdf)).
- All public quantitative evidence comes from planar or SOI. One patent claims that a stack of four 0.25 µm PMOS devices has about 10–12 dB more intrinsic gain than a single 1 µm device ([US 2006/0226464](https://patents.justia.com/patent/20060226464)) [Vendor]. No public data on "gain versus N" in FinFET/GAA was found.
- Stacks improve matching: the VT variance of series units averages roughly as 1/N ([Fiorelli et al., ISCAS 2004](https://lci.ufsc.br/pdf/Series%20parallel%20association.pdf)) [Silicon · research].
- The costs come mainly from interconnect parasitics, area set by poly spacing, and the pre-/post-layout simulation gap ([Cadence blog](https://community.cadence.com/cadence_blogs_8/b/cic/posts/stacked-mosfets-in-analog-layout)) [Opinion]. Older compact models can be off by up to 60% in current for series structures ([Dantas & de Sousa](https://sbmicro.org.br/sforum-eventos/sforum2008/43.pdf)) [Simulation].
- When headroom allows, an independently biased cascode gives much more gain. Stacks fit better in low-headroom current sources and current mirrors, and where matching and 1/f matter.

### Why "build" one: L is not a free variable in advanced processes

[Textbook] Intrinsic gain is about (gm/ID)·VEA, and VEA grows roughly with L, so a long channel is the most direct way to raise ro. In fixed-CPP FinFET/GAA processes, a single device offers only a few L options. A Synopsys engineer says L is limited in GAA and the main thing designers can tune is the W/L ratio. A Fraunhofer researcher says GAA devices must sit on a "very regular grid" ([Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)) [Opinion]. Below about 28 nm, the maximum L is also limited, so designers chain short devices to act as long ones, for example three 1 µm devices to make 3 µm ([Cadence blog](https://community.cadence.com/cadence_blogs_8/b/cic/posts/stacked-mosfets-in-analog-layout); [EDN 2021](https://www.edn.com/all-about-stacked-mosfets-in-analog-layout/)) [Opinion].

For comparison, analog-specific devices offered directly by the process give this single-device gain: Intel 22FFL analog thin-oxide devices reach gm·Rout of 47/54/60 at 144/216/270 nm gate pitch ([WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)) [Silicon · production platform], and GF 14 nm core devices reach gm/gds of 40 (n)/34 (p) ([Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)) [Silicon · production platform].

### Principle: step by step, why a stack looks like a long channel and why it does not fully

**Step 1: In an ideal long channel, series equals longer.** EKV writes drain current as the difference of two independent terms at the source and drain: I_D = I_F(V_S, V_G) − I_R(V_D, V_G). Channel current can be written as the integral of channel conductance along x, like a "pseudo-resistor". As long as every segment has the same V_T, mobility and body (that is, the same F(V, V_G)), common-gate series segments add like resistors and the total length is the sum of the segments. This holds in all inversion regions. In weak inversion it holds even for a non-uniform channel ([Vittoz EKV](https://www.epfl.ch/labs/iclab/wp-content/uploads/2019/02/10_EKV_UMW04_Eric_Vittoz.pdf)) [Textbook].

**Step 2: Short channels break the equivalence.** The same source notes that equivalence in strong inversion requires a long, uniform channel with carrier velocity well below saturation. Channel length modulation (CLM), drain-induced barrier lowering (DIBL) and velocity saturation all break it ([Vittoz EKV](https://www.epfl.ch/labs/iclab/wp-content/uploads/2019/02/10_EKV_UMW04_Eric_Vittoz.pdf)). The reason is that each segment's current starts to depend on its own V_DS, not only on the terminal potentials. In planar processes every segment carries its own halo, so a 4-segment stack is in fact a non-uniform channel with about 8 halo regions [Inference].

**Step 3: How the voltage divides.** [Inference] The top (drain-side) segment saturates and takes most of V_DS. The lower N−1 segments are in the linear region, each with only a few tens of mV. So CLM and DIBL act mainly on the top device, and the lower segments act as a source degeneration resistor R_s for it.

**Step 4: In small signal, it is a self-cascode.** [Textbook] The output resistance of a source-degenerated device is about r_out ≈ r_o,top·(1 + gm,top·R_s). Body effect in GAA and FinFET is weak, so gmb is ignored here.

**Step 5: Plug in some numbers. [Illustration]** Assume a single Lmin device has gm·r_o = 20 (26 dB) at some gm/ID. Under the square law, the linear-region (V_DS → 0) conductance of one segment, μCox(W/L)·Vov, equals the gm of a saturated device of the same size. So each linear-region segment is about 1/gm, R_s ≈ (N−1)/gm, and gm·R_s ≈ N−1. Then r_out ≈ N·r_o,top and gain ≈ N × 20.

| Structure | Equivalent resistance below, R_s | r_out (in units of r_o) | Gain | dB | Internal nodes | Extra bias |
|---|---|---|---|---|---|---|
| Single device, Lmin | 0 | 1 | 20 | 26 | 0 | None |
| Stack N = 2 | ≈ 1/gm | ≈ 2 | ≈ 40 | ≈ 32 | 1 | None |
| Stack N = 4 | ≈ 3/gm | ≈ 4 | ≈ 80 | ≈ 38 | 3 | None |
| Stack N = 8 | ≈ 7/gm | ≈ 8 | ≈ 160 | ≈ 44 | 7 | None |
| 2-device cascode (independent bias) | ≈ r_o = 20/gm | ≈ 21 | ≈ 420 | ≈ 52 | 1 | 1 bias line + 1 VDSAT |

The table shows three things [Illustration]:
- Stack gain grows roughly linearly with N, about +6 dB per doubling. This matches the ideal long channel where "VA is proportional to L". It is the equivalence from Step 1.
- With the same 2 devices, a cascode beats an N = 2 stack by about 20 dB. The difference is the lower device. In the stack it is in the linear region and acts as a small resistor of about 1/gm. In the cascode it is in saturation and acts as a large resistor of about r_o.
- To keep the same gm/ID at the same ID, W must also scale with N, so area grows about as N². This is the same as for a true long channel. It is the cost of "length" itself, not something specific to stacks.

**Step 6: Why real results deviate from the table.** [Inference] There are four reasons:
- At fixed VDD, the lower segments take part of the voltage, so the top device's V_DS shrinks as N grows, and its gds rises at low V_DS.
- Every internal node carries S/D epi resistance, contact resistance and parasitic capacitance. These weaken effective gm and add non-dominant poles.
- In planar processes, each segment's halo raises the effective V_T, which makes a stack better than a single device of the same length. The patent claims that a 4-segment 0.25 µm stack raises |V_T| from about 120 mV to about 190 mV, gives 10–12 dB more gain than a single 1 µm device, and varies less with temperature. The patent does not analyze voltage division or DIBL ([US 2006/0226464](https://patents.justia.com/patent/20060226464)) [Vendor].
- FinFET/GAA have essentially no conventional halo ([Fulde 2007](https://d-nb.info/1149772921/34)), so this "extra bonus" may be smaller in FinFET/GAA stacks [Inference, no public data].

Conclusion: gain grows roughly linearly with N, but each added segment also adds cost in area, nodes and headroom. Practical N is most likely between 2 and 8 [Inference]. Measured gain-versus-N curves need to be confirmed against the foundry PDK or your own silicon data.

### Non-uniform stacks: a deliberate self-cascode

Making the source-side and drain-side devices different gives the classic self-cascode. Data on the FD-SOI asymmetric self-cascode (A-SC) show the following. The drain-side device M_D is undoped with low V_T. The source-side device M_S is doped with high V_T. At V_DS = 1.5 V and V_GT = 200 mV, increasing either L_S or L_D raises A_V, but increasing L_S has the larger effect. A_V in the plots spans about 30–130 dB ([Assalti, de Souza, Flandre 2018](https://research.dial.uclouvain.be/bitstreams/64bfbf3c-cfca-4f4d-8e03-66109d23fdcd/download)) [Silicon · research, µm-scale FD-SOI]. Linearity also improves. Raising L_D from 0.75 µm to 10 µm lowers HD2/HD3 by 32 dB and 39 dB. Raising L_S from 0.75 µm to 10 µm lowers THD by 45 dB (same source).

Sizing rules [Inference]: make the source-side segment long or high-V_T, and the drain-side segment short or low-V_T. In FinFET/GAA, the equivalent is "ULVT/LVT on the drain side + SVT/HVT on the source side" on the same diffusion. Whether V_T options can be mixed on one diffusion depends on the PDK's work-function metal boundary rules (usually an extra gate spacing is required). Confirm with the foundry PDK.

SOI series-parallel structures can raise both Early voltage and breakdown voltage, and have been used to build current mirrors close to 1:1 from weak to strong inversion ([Deceuster et al. 1996](https://research.dial.uclouvain.be/handle/2078.5/71429)) [Silicon · research]. This means stacks are also a way to "handle high voltage with low-voltage devices".

### Pros and cons

| Dimension | Stack (N × Lmin, common gate) | True long channel (single N·L, if the PDK offers it) | Independently biased cascode | Evidence |
|---|---|---|---|---|
| Gain | About N × single device [Illustration]; possibly better in planar (halo effect) | Grows roughly with L, and DIBL itself drops | About (gm·ro)², the highest | [Patent](https://patents.justia.com/patent/20060226464) [Vendor]; §1 derivation [Illustration] |
| Voltage headroom | Same as one long device, no extra VDSAT | Same as left | One extra VDSAT (about 0.1–0.15 V [Inference]) | [Inference] |
| Bias | Not needed | Not needed | Needs one cascode bias | [Textbook] |
| fT / bandwidth | Low: long effective L plus internal-node capacitance | Low: long effective L | Input device can stay at Lmin, high fT | [Inference] |
| Area | Set by minimum poly spacing, "significant but unavoidable" | Usually more compact, but the device may not exist | 2 devices plus bias circuit | [Cadence blog](https://community.cadence.com/cadence_blogs_8/b/cic/posts/stacked-mosfets-in-analog-layout) [Opinion] |
| Matching | Large total gate area; variance of series units averages roughly as 1/N; industry considers it more area-efficient than a single wide, long device | Scales as 1/√(WL) | Set mainly by the input device | [Fiorelli 2004](https://lci.ufsc.br/pdf/Series%20parallel%20association.pdf) [Silicon · research]; [Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm) [Opinion] |
| 1/f noise | Low because total area is large; but the saturated top device may contribute more than its share | Scales as 1/(WL) | Set mainly by the input device | [Inference] |
| Modeling | Models are fitted on single Lmin devices; internal nodes need extraction; BSIM3-class models have shown errors up to 60% | Covered directly by the model | Mature | [Dantas & de Sousa](https://sbmicro.org.br/sforum-eventos/sforum2008/43.pdf) [Simulation] |
| Layout | Regular, fits a fixed-pitch grid; long chains must wrap to new rows, adding interconnect | Needs a special pitch | Needs bias routing | [Cadence blog](https://community.cadence.com/cadence_blogs_8/b/cic/posts/stacked-mosfets-in-analog-layout) [Opinion] |
| Pre-/post-layout agreement | Poor, mainly due to interconnect parasitics; circuit-level error 2–20% | Better | Better | [Saari 2014](https://uwaterloo.ca/electrical-computer-engineering/events/masc-seminar-daniel-saari) [Simulation]; [Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm) [Opinion] |

Some additional notes:
- A 65 nm study used "series stacking" to emulate FinFET's fixed L. In a two-stage op amp, metrics differed from a true long-L design by 2–20%, and both followed the same trends with current density and length. Schematic-level simulation "greatly overestimates" parasitics ([Saari 2014](https://uwaterloo.ca/electrical-computer-engineering/events/masc-seminar-daniel-saari)) [Simulation, abstract only].
- In 0.5 µm simulation, BSIM3v3 had a 60% current error on a current mirror of 8 series devices, while EKV had only 9.5%. For the same op amp, GBW differed by 12.5% with BSIM and about 1% with EKV ([Dantas & de Sousa](https://sbmicro.org.br/sforum-eventos/sforum2008/43.pdf)) [Simulation]. This shows that whether a stack can be simulated accurately depends on how well the model describes DIBL/CLM at small V_DS.
- Intel says the "fully isolated body" transistor in 18A lowers parasitic capacitance and allows more flexible analog configurations, including device stacking and isolated supply domains ([Intel 18A platform brief](https://www.intel.com/content/www/us/en/foundry/library/intel-18a-platform-brief.html)) [Vendor]. Without body effect, the V_T of the upper device in a stack or cascode does not rise when its source is lifted [Inference].

### When to use a stack and when to use a cascode

[Inference] Use a stack in these cases:
- Low-headroom current sources and current mirrors with no convenient cascode bias.
- Where matching and 1/f noise matter and large devices are needed, such as current mirrors, references and bias circuits.
- Fixed-pitch grids where you want regular, automatable layout.
- Where the device must withstand more voltage than a single device can.

Use a cascode or gain boosting in these cases:
- High fT or high GBW is needed and the input device must stay at Lmin.
- The required gain exceeds what "one step of self-cascode" can give.
- Voltage headroom allows one more VDSAT.
- Internal-node parasitics and modeling risk are not acceptable.

The two can also be combined: use a stack for the current source and an independently biased cascode for the signal path.

### How to characterize stacks and long-L devices

[Inference, synthesized from multiple sources] Run the same test set on a single Lmin device, stacks with N = 2/4/8/16, and the PDK's relaxed-pitch or I/O devices. Align the comparison at the same W and N·Lg.

1. **Composite I_D–V_GS (linear and saturation)**: extract V_T,lin, V_T,sat, DIBL and SS. Check whether the equivalent V_T is pulled up by "the highest-V_T segment" as the patent claims.
2. **I_D–V_DS family**: extract g_ds(V_DS), V_EA and A_V0 = gm/g_ds, with gm/ID or I_D/(W/L_eff) on the x-axis. Compare gain at the same gm/ID, not at the same V_GS.
3. **Internal node voltages**: use tapped test structures or TCAD to confirm that the top segment is saturated and the lower segments are in the linear region. The FD-SOI A-SC study used the mid-node potential V_X to explain the roles of L_S and L_D ([Assalti 2018](https://research.dial.uclouvain.be/bitstreams/64bfbf3c-cfca-4f4d-8e03-66109d23fdcd/download)).
4. **Linearity**: extract HD2/HD3/THD from DC I–V with the integral function method, valid up to about fT/10 (same source).
5. **S-parameters**: extract C_gg, C_gd, fT and fmax, including internal-node parasitics.
6. **Matching**: draw a Pelgrom plot (σΔV_T, σΔβ/β versus 1/√(N·W·Lg)), with matched pairs in a common-centroid layout with dummies.
7. **1/f noise**: measure S_ID versus I_D and check whether the top segment (high-field region) contributes more than its share.
8. **Self-heating**: measure isothermal g_ds with pulsed IV and compare with DC g_ds.
9. **Model comparison**: compare pre-layout simulation, post-layout simulation with internal nodes, and silicon. Industry reports a pre-/post-layout gap of about 30% ([Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)) [Opinion].

## 2. Other circuit techniques for raising gain

**At 0.7–0.9 V supplies, advanced nodes no longer get gain by stacking more devices. They use feedback, time or charge to "multiply" gain (gain boosting, CLS, ring amplifiers, multistage amplifiers), or use digital calibration so precise gain is not needed. Low-inversion bias and analog-specific devices raise gm·ro per volt from the device side.**

Key points:
- [Inference] At VDD ≈ 0.8 V, the rough ranking of "gain per volt of headroom" is: CLS > ring amplifier > gain boosting > multistage NMC > positive-feedback load > single-stage cascode > telescopic double cascode.
- The techniques that add gain without adding series devices are gain boosting (classic result: 90 dB DC gain, [Bult & Geelen 1990](https://doi.org/10.1109/4.62165)) and CLS (an op amp with 30 dB loop gain reached better than 60 dB accuracy, [OSU document citing Gregoire & Moon 2008](https://ece.osu.edu/media/document/2024-04-05/cc_cls.pdf)).
- Structures whose gain does not depend on gm·ro can scale with digital processes: ring amplifiers are used in a 16 nm FinFET pipelined ADC ([imec ISSCC 2019](https://api.openalex.org/works/doi:10.1109%2FISSCC.2019.8662319)); dynamic amplifiers with background calibration reached 6.5 fJ/conv-step at 28 nm and 0.9 V ([imec VLSI 2013](https://www.imec-int.com/drupal/sites/default/files/inline-files/400MS_11bit_28nm_ADC_VLSI2013.pdf)).
- Body effect in FinFET/GAA is weak, so body bias is largely ineffective. V_T tuning relies on multi-V_T devices.
- No public source was found that compares these techniques side by side on the same FinFET/GAA node at the same VDD.

### Cascode (telescopic / folded)

**Principle**: put a common-gate device in series with the gain device. Output resistance is multiplied by about gm·ro, and single-stage gain rises from gm·ro to about (gm·ro)²/2 [Textbook]. A telescopic cascode stacks the input pair, cascode and load in one branch. A folded cascode folds the signal current into a second branch, freeing about one VDSAT of input common-mode range.

**Effect/numbers**: using the 22FFL analog device gm·Rout = 47–60 ([WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)), one cascode level could in theory reach about 60–70 dB [Inference].

**Cost**: each added cascode level costs one VDSAT (about 0.1–0.15 V in moderate inversion). At VDD ≈ 0.8 V, a telescopic cascode leaves only about 0.2–0.3 Vpp of swing per side. A folded cascode needs about twice the current for the same gm, and has more noise [Inference].

**When to use**: the first stage of a two-stage op amp; 1.2–1.8 V thick-oxide I/O devices. A telescopic structure on 0.75 V core devices is usually impractical unless low-V_T devices are available [Inference].

### Gain boosting (regulated cascode)

**Principle**: an auxiliary amplifier with gain A_aux drives the cascode device's gate and pins its source voltage. Output resistance is multiplied again by about (1 + A_aux) [Textbook].

**Effect/numbers**: a classic design raised a folded cascode of about 40–50 dB to 90 dB DC gain without hurting single-pole settling ([Bult & Geelen, JSSC 1990](https://doi.org/10.1109/4.62165)) [Silicon · research, classic literature value]. Another example is a 90 dB, 90 MHz, 30 mW OTA with gain enhancement using one- and two-stage auxiliary amplifiers ([Bar-Ilan](https://cris.biu.ac.il/en/publications/90db-90mhz-30mw-ota-with-the-gain-enhancement-implemented-by-one-/)).

**Cost**: it creates a pole-zero doublet that causes a slow settling tail. The auxiliary amplifier's unity-gain bandwidth must sit between the main amplifier's β·GBW and its non-dominant pole ([Bult & Geelen 1990](https://doi.org/10.1109/4.62165)). Each auxiliary amplifier is usually a fully differential pair plus CMFB, which adds power and area. The auxiliary amplifier's input common mode must be compatible with the cascode node, which limits swing at low VDD [Inference].

**When to use**: switched-capacitor integrators and pipelined MDACs. In sub-1 V FinFET it is often paired with a folded rather than telescopic structure. It is the first choice for "adding gain without adding series devices" [Inference].

### Multistage amplifiers with nested Miller compensation (NMC / MNMC)

**Principle**: cascade three or more simple low-headroom stages, each with gm·ro of about 20–30 dB. Nested Miller capacitors split the poles for stability, and multipath feedforward recovers bandwidth [Textbook].

**Effect/numbers**: three stages at 25–30 dB each give about 75–90 dB in total, and each stage needs only about two VDSAT of headroom [Inference]. A classic example reached 100 dB gain at 100 MHz ([Eschauzier et al., JSSC 1992](https://doi.org/10.1109/4.173108)) [Silicon · research, classic literature value].

**Cost**: at the same power, GBW drops to about 1/4 of a single stage or lower; stability is sensitive to load capacitance; compensation capacitors take area; each stage adds offset and noise, though the first stage dominates [Inference].

**When to use**: low-VDD, high-gain, medium-speed blocks that need rail-to-rail output, such as LDO error amplifiers, references and continuous-time sensor front ends [Inference].

### Positive-feedback load (cross-coupled negative conductance)

**Principle**: place a cross-coupled pair in parallel with a diode or active load. It provides a negative conductance −gm_x that partly cancels the load's positive conductance, giving gain of about gm1/(g_load − gm_x + g_ds). When gm_x exceeds g_load, the circuit becomes a latch. This is how the regeneration phase of latched comparators and dynamic amplifiers works [Textbook].

**Effect/numbers**: when gm_x approaches g_load, gain can rise by 10–20 dB or more [Inference]. No public paper from 2010–2026 with quantitative results was found.

**Cost**: gain depends strongly on PVT and on the mismatch between gm_x and g_load; hysteresis or even latch-up can occur; offset sensitivity rises [Inference].

**When to use**: preamplifiers, comparators, open-loop residue amplifiers and dynamic amplifiers, provided digital calibration follows. Not suited to continuous-time op amps that need precise closed-loop gain [Inference].

### Low-inversion bias (raising gm/ID)

**Principle**: intrinsic gain = (gm/ID)·VA. Moving from strong inversion (gm/ID about 5–8 S/A) to moderate or weak inversion (about 15–25 S/A) raises gm and gm·ro per unit current, and lowers VDSAT. The saved voltage can go to a cascode [Textbook]. Intrinsic gain is highest at low overdrive and roughly flat beyond some minimum gm/ID ([Palermo, TAMU](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)).

**Effect/numbers**: foundries quote analog device speed in moderate inversion. For example, the "usable fT" at gm/ID ≥ 10 is about 205 GHz for 22FFL and about 165 GHz for 32 nm planar ([WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)) [Silicon · production platform].

**Cost**: fT drops noticeably; devices are larger at the same current, with more parasitics; offset in weak inversion is dominated by V_T mismatch. FinFET width is quantized in fins, so very low current density needs long L or a stack [Inference].

**When to use**: low-power front ends, references, bias, inverter-based amplifiers and ring amplifiers. It raises gain and saves headroom at the same time, and is the best device-side tool for "gain per volt" [Inference].

### Inverter-based amplifiers

**Principle**: use a CMOS inverter as an amplifying stage. NMOS and PMOS reuse the same current, so gm = gmn + gmp. No tail current source is needed, and swing is close to rail-to-rail. Single-stage gain is about (gmn + gmp)/(gdsn + gdsp), about 20–30 dB [Textbook].

**Effect/numbers**: cascaded or cascoded inverters, often biased in class-C or near subthreshold, can build switched-capacitor integrators and ΔΣ modulators ([Chae & Han, JSSC 2009](https://doi.org/10.1109/JSSC.2008.2010973)) [Silicon · research, classic literature value].

**Cost**: poor PSRR and CMRR; gain and operating point drift with PVT; auto-zero or capacitive offset storage is needed to set the operating point [Textbook].

**When to use**: low-voltage, low-power switched-capacitor circuits, especially ΔΣ modulator integrators.

### Ring amplifier (ringamp)

**Principle**: split a three-stage inverter ring oscillator into two signal paths and insert an offset (a "dead zone") between them. In switched-capacitor feedback, it first slews quickly like a class-AB rail-to-rail driver, then settles inside the dead zone. At that point the output stage is biased near subthreshold, with high output impedance and high gain. Accuracy comes from the dead-zone mechanism, not from device gm·ro, so it scales with digital processes ([Hershberg et al., JSSC 2012](https://doi.org/10.1109/JSSC.2012.2217865)).

**Effect/numbers**: imec built a 6–600 MS/s fully dynamic ringamp pipelined ADC in 16 nm FinFET. The abstract says ring amplification makes the amplifier so efficient that in some deep pipelined ADCs most of the power now goes to clocking, not the residue amplifiers ([imec ISSCC 2019](https://api.openalex.org/works/doi:10.1109%2FISSCC.2019.8662319)) [Silicon · research]. SNDR or FoM numbers were not obtained this time.

**Cost**: dead-zone and bias design are hard; stability depends on PVT (self-biased versions help); only usable in discrete-time switched-capacitor circuits; settling is nonlinear [Inference].

**When to use**: pipelined, pipelined-SAR and switched-capacitor ΔΣ ADCs on FinFET nodes at VDD ≈ 0.8–1 V, as a replacement for gain-boosted OTAs.

### Dynamic amplifiers (integrating, open-loop residue amplification)

**Principle**: a precharged differential pair discharges the load capacitance for a fixed time. Gain is about gm·t/C, set by integration time rather than gm·ro. It has no static current and is clocked like logic. Its gain is imprecise and varies with PVT, so it relies on digital calibration.

**Effect/numbers**: imec built a 2-way interleaved 11-bit pipelined-SAR ADC in 28 nm at 0.9 V: SNDR 59.8 dB at 410 MS/s, 2.1 mW, 6.5 fJ/conv-step, 0.11 mm². The authors state that residue amplifier gain is "quite sensitive to process and temperature", so they estimate gain in the background with pseudo-random dither injection and correlation ([imec VLSI 2013](https://www.imec-int.com/drupal/sites/default/files/inline-files/400MS_11bit_28nm_ADC_VLSI2013.pdf)) [Silicon · research]. The authors argue that digital calibration gets cheaper with scaling, while analog impairments such as offset and gain error do not scale (same source).

**Cost**: gain varies with PVT and must be calibrated; limited linearity; noise is set by the integration capacitor; gain depends on settling time.

**When to use**: residue amplifiers in pipelined-SAR ADCs, comparator preamplifiers. Within the range digital calibration can cover, it is the lowest-power option on advanced nodes [Inference].

### Correlated level shifting (CLS)

**Principle**: at the end of the first amplification phase, a level-shifting capacitor C_LS samples an "estimate" of the op amp output. In the second phase, C_LS is placed in series with the output. The op amp output returns near common mode while the load still sees the full swing. The op amp only has to correct the residual error, so the effective loop gain is about the product of the two phases' loop gains, about A² ([OSU document](https://ece.osu.edu/media/document/2024-04-05/cc_cls.pdf)).

**Effect/numbers**:
- Classic result: an op amp with only 30 dB loop gain achieved better than 60 dB "true rail-to-rail" performance ([Gregoire & Moon, JSSC 2008, as cited in the OSU document](https://ece.osu.edu/media/document/2024-04-05/cc_cls.pdf)) [Silicon · research].
- Simulation: with a 36 dB op amp and a 100 MHz clock, basic CLS reached about 52 dB effective loop gain and cross-coupled CLS exceeded 100 dB. With C_LS = C_LD, the result is about 6 dB below the ideal A² (same source) [Simulation].

**Cost**: one more clock phase, so less time per phase; with C_LS = C_LD the first-phase load roughly doubles, needing more power at the same speed. **Offset and 1/f noise are not cancelled.** They get the same gain as the signal (same source).

**When to use**: switched-capacitor MDACs and integrators on low-VDD nodes, where it improves both gain and swing. To suppress offset and 1/f noise, pair it with chopping or auto-zero [Inference].

### Time-domain / VCO architectures

**Principle**: encode the signal as time or phase (VCO frequency, pulse width, delay), then quantize it with a digital counter or TDC. An integrating VCO acts as infinite DC gain for phase. Faster transistors give finer resolution, so it benefits from scaling [Textbook].

**Effect/numbers**: a classic example is a 12-bit, 10 MHz bandwidth continuous-time ΣΔ ADC with a 5-bit, 950 MS/s VCO quantizer ([Straayer & Perrott, JSSC 2008](https://doi.org/10.1109/JSSC.2008.917500)) [Silicon · research, classic literature value].

**Cost**: VCO tuning nonlinearity (needs calibration or feedback); limited by phase noise and jitter; mismatch in multiphase ring oscillators [Inference].

**When to use**: sensor and RF receiver ADCs, digital PLLs and time-domain comparators on the most advanced nodes, where voltage headroom is a hard constraint [Inference].

### Body bias

**Principle**: in FD-SOI the back gate sits under a thin buried oxide and can shift V_T a lot. Forward body bias lowers V_T for speed and headroom. Reverse body bias raises V_T to cut leakage. Adaptive body bias (ABB) uses the back-gate voltage in a closed loop to compensate PVT and aging ([GlobalFoundries](https://gf.com/?p=722)) [Vendor].

**Effect/numbers**: GF claims compensating process variation can recover up to about 30% of performance; on 22FDX the bias direction of each block must be chosen in advance (same source) [Vendor]. Analog uses include trimming offset with a back gate on one side of a differential pair, lowering V_T to free headroom for a cascode, tuning current mirrors, and compensating V_T temperature drift [Inference].

**Cost**: needs bias generators and charge pumps; well isolation takes area; the back gate adds a noise path [Inference].

**When to use**: FD-SOI processes. Body effect in FinFET and nanosheet is weak, so body bias is largely ineffective there. V_T tuning instead comes from multiple work-function metal or dipole V_T options [Inference].

### Analog device selection (relaxed pitch, thick-oxide I/O, multi-V_T)

**Principle**: longer L or relaxed gate pitch raises VA, and gm·ro grows roughly with L. Thick-oxide I/O devices handle 1.2–1.8 V and restore the headroom a cascode needs. Low-V_T and ultra-low-V_T devices give more V_GS − V_T at fixed VDD. High-V_T devices leak less, which helps sample-and-hold droop [Textbook/Inference].

**Effect/numbers**:
- 22FFL offers dedicated thin-oxide analog devices at 0.7/1.2/1.5 V (144/216/270 nm gate pitch, gm·Rout 47/54/60), and thick-gate devices with Lg 90–160 nm (logic Lg is 74 nm) ([WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)) [Silicon · production platform].
- GF 14 nm 1.8 V I/O FinFETs (Lg 150 nm) have peak fT of about 50 GHz, versus about 300 GHz for core devices ([Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)) [Silicon · production platform].
- TSMC N2 NanoFlex allows cells with different sheet widths on the same chip ([IEEE Spectrum](https://spectrum.ieee.org/tsmc-n2)) [Vendor]. Intel 18A uses ribbon width as a tuning knob and claims multi-V_T devices have a "low mismatch coefficient" ([Intel 18A platform brief](https://www.intel.com/content/www/us/en/foundry/library/intel-18a-platform-brief.html)) [Vendor].

**Cost**: thick-oxide devices have low fT and large area; relaxed-pitch devices need PDK support; in GAA, L is limited and devices must sit on a regular grid, and GAA also adds capacitances such as Cgd and Cbd that are hard to compensate ([Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)) [Opinion].

**When to use**: thick-oxide devices for references, LDOs, bias and I/O-voltage op amps; relaxed-pitch or long-L devices for precision gain stages; core devices for ring amplifiers, dynamic amplifiers and comparators [Inference].

## 3. Beyond gain: techniques for offset, noise and accuracy

**Offset, 1/f noise and drift do not go away when gain goes up. They are handled with time-domain cancellation (chopping, auto-zero, CDS), digital calibration and layout matching. On advanced nodes these methods save more area than "making the input devices bigger".**

Key points:
- Auto-zero and CDS subtract offset and 1/f noise but alias wideband white noise into the baseband. Chopping moves offset and 1/f noise to high frequency without aliasing white noise, but leaves ripple ([Enz & Temes 1996](https://doi.org/10.1109/5.542410)).
- CLS, gain boosting, cascodes and multistage amplifiers do not cancel offset or 1/f noise. CLS even gives them the same gain as the signal ([OSU document](https://ece.osu.edu/media/document/2024-04-05/cc_cls.pdf)).
- Industry view: at 3 nm "process variation is too large and digital logic is too cheap", so it pays to replace differential pairs sized up for matching with calibration loops ([Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)) [Opinion].
- Analog area does not shrink on advanced nodes (a 100 Ω poly resistor has nearly the same area from 180 nm to 28 nm), so most precision analog is expected to move to chiplets (same source) [Opinion].

### Chopping (chopper stabilization)

**Principle**: first modulate the signal to f_chop, amplify, then demodulate. The amplifier's own offset and 1/f noise are modulated only once, so they are moved to f_chop and filtered out ([Enz & Temes, Proc. IEEE 1996](https://doi.org/10.1109/5.542410)) [Textbook, classic review].

**Effect/numbers**: offset and 1/f noise are moved out of the baseband, and white noise is not aliased in (same source). One biosensor TIA combines noise cancellation with chopping ([EPFL ICNF 2015](https://infoscience.epfl.ch/record/215989)).

**Cost**: residual ripple and charge-injection spikes, which need notch filters or ripple-reduction loops; needs a clock; bandwidth limited by f_chop [Textbook].

**When to use**: continuous-time precision amplifiers, sensor front ends, reference buffers. [Inference] In nanosheets, 1/f noise and RTN spread widely in small devices. Chopping lets the input pair stay small and saves analog area that does not shrink on advanced nodes.

### Auto-zero and CDS / CMS

**Principle**: sample "offset + low-frequency noise" in one phase and subtract it in the next. This acts as a high-pass filter on 1/f noise and offset. CDS does the same in sampled systems. CMS (correlated multiple sampling) extends auto-zero and CDS to multiple samples, combining averaging and cancellation ([EPFL ICNF 2015](https://infoscience.epfl.ch/record/215989)).

**Effect/numbers**: offset and 1/f noise are cancelled. In some switched-capacitor structures, auto-zero can also store the finite-gain error, which relaxes the gain requirement ([Enz & Temes 1996](https://doi.org/10.1109/5.542410)).

**Cost**: wideband white noise aliases and the baseband white noise floor rises; CMS is also limited by this aliasing in the end ([EPFL ICNF 2015](https://infoscience.epfl.ch/record/215989)). Needs extra clock phases.

**When to use**: switched-capacitor circuits, image sensor readout, comparator offset cancellation. Combined with CLS, it addresses gain/swing and offset/1/f at the same time [Inference].

### Digital calibration (digitally assisted analog)

**Principle**: use low-gain, low-power analog blocks, then correct gain error, nonlinearity, offset and mismatch digitally. Methods include dither correlation, histograms and redundancy, run in the foreground or background.

**Effect/numbers**:
- A classic example is a 12-bit, 75 MS/s pipelined ADC with open-loop low-gain residue amplification and background nonlinearity calibration ([Murmann & Boser, JSSC 2003](https://doi.org/10.1109/JSSC.2003.819167)) [Silicon · research, classic literature value].
- The imec 28 nm ADC corrects comparator offset in the background with redundancy-based error counting and histograms, and corrects gain and offset mismatch between channels ([imec VLSI 2013](https://www.imec-int.com/drupal/sites/default/files/inline-files/400MS_11bit_28nm_ADC_VLSI2013.pdf)) [Silicon · research].
- A Cadence engineer argues that ADC-based calibration can be much smaller than a differential pair sized up to match across corners. A Synopsys engineer argues that variability calls for digital or even software calibration loops ([Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)) [Opinion].

**Cost**: complex design and verification; background loops need convergence time; higher test cost; the analog path needs redundancy.

**When to use**: ADCs, DAC current sources, interleaved channels, open-loop amplifiers. [Inference] In nanosheets, BDI brings stronger self-heating and therefore larger temperature drift, so in high-current blocks background calibration is safer than one-time trimming. References and bias can still use fuse or OTP trimming.

### Layout matching techniques (multi-finger, double-sided gate contacts, dummies, common centroid)

**Principle**:
- Pelgrom's law σ(ΔV_T) = A_VT/√(WL) sets offset ([Pelgrom et al., JSSC 1989](https://doi.org/10.1109/JSSC.1989.572629)).
- Common-centroid and interdigitated placement cancel linear gradients. Dummy gates and dummy fins at array edges keep WPE, stress, LOD and similar surroundings uniform [Textbook].
- With gate contacts on both ends of a multi-finger device, distributed gate resistance is about 1/4 of single-ended contact (1/12 versus 1/3 of the finger resistance). This lowers Rg thermal noise and raises fmax [Textbook].

**Effect/numbers**: the fmax gain in 22FFL is attributed mainly to lower gate capacitance and gate resistance ([WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)). From N5 on, TSMC uses fixed-height analog cells with uniform OD and poly for yield, and notes that the layout of neighboring transistors affects device performance ([SemiWiki, TSMC OIP](https://semiwiki.com/semiconductor-manufacturers/321960-tsmc-oip-analog-cell-migration/)). FinFET fab manuals require environment dummies, continuous diffusion and constant poly density, and some fabs require matched devices to sit on specific fin pitches ([ASIC North](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/)) [Opinion].

**Cost**: area and routing complexity; more parasitics, so post-layout simulation is mandatory ([Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)).

**When to use**: all matched devices, RF input devices, current mirror arrays. See §6 for the detailed checklist.

### Chiplet partitioning

**Principle**: keep only the analog that must be there (PLLs, die-to-die interfaces) on the GAA die, and move precision analog to a better-suited process.

**Effect/numbers**: a Fraunhofer researcher expects "most analog will take a chiplet approach". A Siemens engineer notes that the area of a 100 Ω poly resistor and an LC inductor barely shrank from 180 nm to 28 nm ([Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)) [Opinion].

**Cost**: power and latency of die-to-die interfaces, packaging cost, noise and signal integrity for analog signals crossing dies [Inference]. Matched devices must be in the same local area of the same die. Do not rely on matching across dies [Inference].

**When to use**: blocks that do not benefit from 3 nm/2 nm density, such as precision data converters, high-voltage and power management, and sensor interfaces. SerDes, PLLs and memory PHYs usually stay on the advanced die [Inference].

## 4. How to lower 1/f noise and RTN in the nanosheet era

**In nanosheets, 1/f noise is set mainly by the border trap density in the gate stack (interfacial layer and HfO₂). GAA geometry neither clearly worsens nor clearly improves it. The main process knobs are reliability anneals, thermal budget, EOT and dipoles. The main design knobs are gate area, low overdrive and chopping. The single-trap RTN amplitude in GAA is about half that in FinFET, but trap count still scales with area.**

Key points:
- imec measurements on 188 p-type sheets show that, with the same gate stack, nanosheet and planar HKMG have similar border trap density N_BT, and that "gate stack quality, not channel geometry, dominates" 1/f noise ([Asanovski et al.](https://arxiv.org/html/2609.08674)) [Silicon · research].
- The process knob with the clearest public numbers is high-pressure D₂ anneal: noise down about 4.8x and slow trap density down about 4x. But this was measured on FD-SOI TFETs, not nanosheets ([Shin et al., Sci. Rep. 2022](https://www.nature.com/articles/s41598-022-22575-5)) [Silicon · research].
- The N_BT extracted from 1/f noise correlates with BTI trap density across anneal conditions ([Asanovski et al.](https://arxiv.org/html/2609.08674)), so process steps that lower BTI are likely to lower 1/f noise too.
- The mean single-defect ΔV_T, η, is about 1 mV for GAA nanowires and about 1.9 mV for 10 nm FinFETs ([Chasin et al. 2017](https://www.iue.tuwien.ac.at/pdf/ib_2017/CP2017_Rzepa_02.pdf)) [Silicon · research].
- No public quantitative data was found on how dipoles, IL type, nitridation, fluorine passivation, inner spacers, BDI, strain or SiGe channels affect nanosheet 1/f noise or RTN.

### Start with the main cause: 1/f noise is a gate-stack trap problem

Nanosheet 1/f noise is dominated by carrier number fluctuation (trap capture and emission). pMOS and nMOS are qualitatively similar. At 78 K, correlated mobility fluctuation is also visible ([Simoen et al., JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)) [Silicon · research]. Under this mechanism, S_vg ∝ N_BT/(C_ox²·W·L·f) ([Asanovski et al.](https://arxiv.org/html/2609.08674)). This gives three direct knobs:
- Lower N_BT, through the gate-stack process.
- Raise C_ox, that is, thinner EOT.
- Raise W·L, that is, larger area.

The imec comparison used p-type nanosheets with 48 nm CGP, EOT ≈ 1 nm, W = 17 nm, H = 6.5 nm, L = 19 nm and 2 sheets per device, against planar pFETs with the same gate stack and a similar RMG thermal budget. N_BT was "comparable" for both, and the authors conclude that "moving to GAA brings no noise penalty" ([Asanovski et al.](https://arxiv.org/html/2609.08674)) [Silicon · research]. In area-normalized S_VG·A, imec's two-sheet nanosheets "performed best" against junctionless GAA, inversion-mode GAA, SOI and FinFET ([Simoen et al., JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)) [Silicon · research, values only in figures].

Note that these imec devices had "no dedicated reliability anneal, only a forming gas anneal at the end of the flow" ([Asanovski et al.](https://arxiv.org/html/2609.08674)). So their trap density is only a baseline, with room to improve.

As a reference, from GF 28 nm planar to 14 nm FinFET, area-normalized S_VG at 1 kHz dropped from 171 (n)/106 (p) to 17 (n)/35 (p) fV²·µm²/Hz ([Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)) [Silicon · production platform]. FinFET pFET noise is about 2x nFET noise, the opposite of the planar experience that pFETs are quieter.

### Process knobs: public evidence at a glance

| Process knob | Public result | Magnitude | Evidence | Source |
|---|---|---|---|---|
| High-pressure D₂ / H₂ anneal (400 °C, 10 atm, 30 min) | Normalized S_ID/I² at 100 Hz: 2.15e-9 → 9.53e-10 (H₂) → 4.49e-10 Hz⁻¹ (D₂); slow trap N_t: 2.72e18 → 6.55e17 eV⁻¹cm⁻³; N_it: 3.3e11 → 4.3e10 cm⁻²; SS: 79 → 72 mV/dec | About 4.8x (about 7 dB); D₂ about 2x better than H₂ | Silicon · research (FD-SOI pTFET, not nanosheet) | [Shin et al. 2022](https://www.nature.com/articles/s41598-022-22575-5) |
| High-pressure D₂ anneal on nanowire RTN | Cited as reducing RTN in p-type Ω-gate nanowire FETs | No numbers read | Silicon · research (title only) | [Yang et al., Nanotechnology 2020](https://iopscience.iop.org/article/10.1088/1361-6528/ab9e90) |
| Post-deposition anneal / thermal budget | Without PDA, HfO₂ defect density is about 2x higher with shallower trap levels; BTI ΔV_th is about 10–20x the target | About 2x defect density (BTI data, not noise) | Silicon · research | [Franco et al., EDTM 2019](https://www.iue.tuwien.ac.at/pdf/ib_2019/CP2019_Franco_1.pdf) |
| Work-function metal | Has "some influence" on gate stack quality and N_OT in GAA two-sheet nanosheets | No numbers in the paper | Silicon · research | [Simoen et al., JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770) |
| Vertical sheet spacing (7.5 → 4.7 nm) | "Little effect" on 1/f PSD | Small | Silicon · research | Same as above |
| EOT scaling | Normalized S_VG drops as EOT shrinks; charge sharing among multiple gates further reduces the impact of a single trapped charge | Clear direction, numbers in figures | Silicon · research | Same as above |
| La / Al dipole (multi-V_T) | PBTI down about 8x (La, nMOS), NBTI down up to about 10x (Al, pMOS); mechanism is shifting the HfO₂ defect band away from carrier energy; the paper has no noise data | Noise impact unknown | Silicon · research (BTI) | [Franco et al., EDTM 2019](https://www.iue.tuwien.ac.at/pdf/ib_2019/CP2019_Franco_1.pdf) |
| Interfacial layer thickness | The pMOS dipole benefit appears only on a thin SiO₂ IL of about 0.6 nm; at about 1 nm, SiO₂ hole traps dominate and the benefit disappears; nMOS is largely insensitive to IL thickness | — | Silicon · research (BTI) | Same as above |
| Low N_OT and mobility | N_OT correlates with effective mobility through Coulomb scattering; low N_OT improves both noise and mobility | — | Silicon · research | [Simoen et al., JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770) |
| IL type, nitridation, fluorine passivation, inner spacer, BDI, strain, SiGe pFET, sheet thickness | No public quantitative 1/f or RTN data for nanosheet/FinFET found | — | Gap | — |

[Inference] The table supports three actionable judgments:
- In imec planar data, noise-extracted N_BT and BTI ΔN_eff move together across anneal conditions ([Asanovski et al.](https://arxiv.org/html/2609.08674)). So reliability anneals, PDA and higher RMG thermal budget that lower BTI traps are likely to lower nanosheet 1/f noise as well.
- Based on the TFET data and the qualitative nanowire RTN result, a reasonable expectation for high-pressure D₂ anneal is a PSD reduction of about 2–5x (about 3–7 dB). This is not a measured value for nanosheet MOSFETs.
- Inner spacers, BDI, sheet thickness and strain act indirectly, through noise sources outside the gate dielectric: BDI removes the parasitic channel under the sheets, inner spacers and S/D affect access-resistance noise, and strain affects mobility. They do not change N_BT directly.

### Multi-V_T dipoles and noise: optimistic direction, no data

The sheet gap in GAA is too small for thick work-function metal, so the industry is moving multi-V_T from "WFM thickness" to "dipoles". imec proposed a "dipole-first" gate stack as a multi-V_T scheme for nanosheet/CFET ([Arimura et al., IEDM 2021](https://imec-publications.be/entities/publication/639ca126-058f-4dd5-9cf3-a0ec41579acf/full)) [Silicon · research], and IBM published a dual-dipole near-band-edge multi-V_T scheme ([IBM Research](https://research.ibm.com/publications/selective-enablement-of-dual-dipoles-for-near-bandedge-multi-vt-solution-in-high-performance-finfet-and-nanosheet-technologies)).

[Inference] Dipoles shift the HfO₂ defect band away from the carrier Fermi level, so at operating bias they should reduce the number of "noise-active" border traps, just as they reduce BTI. If so, low-V_T devices made with dipoles may have N_BT equal to or better than WFM-only devices. Three risks need checking: La or Al diffusing to the IL/Si interface (more interface traps, Coulomb scattering, lower mobility), IL regrowth, and stacking multiple dipole layers with WFM. No public dB figures were found for dipole-induced changes in 1/f noise or RTN in FinFET/GAA. Noise for each V_T option needs to be confirmed with the foundry PDK.

### RTN: smaller single-trap amplitude, but trap count still scales with area

RTN is the random capture and emission of carriers at the interface or at defects ([Semiconductor Engineering](https://semiengineering.com/knowledge_centers/eda-design/noise-2/random-telegraph-noise/)). In small devices, the 1/f spectrum breaks up into Lorentzian spectra of individual traps. In 20 nm-class planar devices, a single RTN ΔV_th can exceed 70 mV ([VLSI 2009](https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm)) [Silicon · research].

Relevant GAA data:
- In stacked GAA nanowires, a defect-centric fit gives a mean single-defect ΔV_T of η ≈ 1 mV, versus 1.9 mV for 10 nm FinFETs (250 nFETs each, PBTI). Time-dependent variability is about 2x smaller. The authors attribute this to better electrostatic control and volume inversion keeping current away from the interface. But under the same stress, more traps are filled in nanowires than in FinFETs. Both have a time-zero Pelgrom coefficient of about 2 mV·µm ([Chasin et al. 2017](https://www.iue.tuwien.ac.at/pdf/ib_2017/CP2017_Rzepa_02.pdf)) [Silicon · research].
- TCAD predicts that thin 4 nm wires show about 20% more mean PBTI degradation than 8 nm wires because of oxide field crowding (same source) [TCAD].
- The distribution of integrated noise V_rms in nanosheets can be fitted with the defect-centric model: the number of active defects follows a Poisson distribution, and each defect's contribution follows an exponential distribution with mean η ([Asanovski et al.](https://arxiv.org/html/2609.08674)).

[Inference] This leads to three conclusions:
- GAA makes each trap "lighter" but does not change the number of traps per unit area. Expect smaller RTN steps, not fewer traps.
- A device built from M sheets or M parallel units has about M times as many traps as a single one, and each trap contributes about 1/M of the total ΔV_T. The probability that a device has only 0 or 1 dominant trap (bistable RTN) falls exponentially with M. As a result, RTN averages into a near-Gaussian 1/f spectrum, and the device-to-device σ of noise power shrinks roughly as 1/√M, while mean S_vg still scales as 1/area. This follows from the model and has not been verified with measurements on nanosheet stacks.
- Thin, narrow sheets carry a field-crowding risk. Low-noise analog devices should avoid the narrowest and thinnest sheets.

### Design-side practices

| Practice | Basis | Evidence |
|---|---|---|
| Increase gate area: more sheets, wider sheets, more fingers, longer L or stacks | Area-normalized S_vg scales as 1/(WL); time-dependent variability scales as 1/A | [Asanovski et al.](https://arxiv.org/html/2609.08674); [Chasin 2017](https://www.iue.tuwien.ac.at/pdf/ib_2017/CP2017_Rzepa_02.pdf) [Silicon · research] |
| Low overdrive: moderate or weak inversion, low V_DS | S_vg rises with V_ov; the mean number of active traps ⟨N_T⟩ rises with V_ov and I_D | [Asanovski et al.](https://arxiv.org/html/2609.08674) [Silicon · research] |
| Use thin-EOT core devices when headroom allows | Normalized S_VG drops as EOT shrinks; thick-oxide I/O devices have small C_ox and higher S_vg per unit area unless their N_BT is much lower | [Simoen et al., JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770); second half [Inference] |
| Do not assume pFETs are quieter | In imec nanosheets, pMOS and nMOS are "qualitatively similar"; in GF 14 nm FinFET, pFET is about 2x nFET | [JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770); [Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications) |
| Use chopping or auto-zero instead of large input devices | Moving or subtracting 1/f noise is cheaper than trading area for noise | [Enz & Temes 1996](https://doi.org/10.1109/5.542410); area conclusion [Inference] |
| Use statistical noise corners, not a single Kf | Noise spread in small devices has a long tail; corners based on the mean underestimate the tail | [VLSI 2009](https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm); conclusion [Inference] |

### How to measure and report

imec's 2026 wafer-level flow is a direct reference: B1500 plus E4727B; pFET in linear region at V_DS = −50 mV and 25 °C; constant-current points from 100 nA to 2 µA; band 10 Hz–1 kHz, with V_rms integrated over that band; 94 nanosheet devices against 12 planar reference devices; spectra of N small devices summed as one "equivalent large device", with spread fitted by the defect-centric model ([Asanovski et al.](https://arxiv.org/html/2609.08674)) [Silicon · research].

[Inference] When comparing process knobs, extract N_OT (or N_BT) and the Coulomb scattering coefficient per gate stack. Do not compare Kf directly, because Kf mixes in C_ox and bias dependence. When reporting S_VG·WL, state frequency, V_DS and overdrive. Measure tens to hundreds of small devices per geometry, report the median and lognormal σ, and keep time-domain waveforms to flag RTN.

## 5. Mismatch, DIBL, fT and self-heating: optimizing other intrinsic parameters

**In public data, nanosheet mismatch per unit gate area is similar to FinFET, and the dominant term is metal gate grains (WFV). The benefit is that more gate area fits in the same footprint. DIBL and intrinsic gain depend on sheet width and Lg. fT/fmax is set mainly by parasitics (sheet gap, S/D epi, contacts, BDI). BDI improves RF but worsens self-heating. Nearly all of these conclusions come from TCAD and research devices.**

Key points:
- WFV dominates V_T mismatch: shrinking TiN grains from 5 nm to 1 nm cuts σV_T from 9.6 mV to 3.8 mV ([Mohapatra et al. 2021](https://link.springer.com/article/10.1007/s42452-021-04539-y)) [TCAD]; 3 sheets have 40.5% lower WFV σV_T than 1 sheet ([Sudarsanan 2020](https://publications.iith.ac.in/publication/superior-work-function-variability-performance-of-horizontally)) [TCAD].
- LER has negligible effect on nanosheet I_ON, because the roughness falls on sheet width, a non-critical dimension. The MGG-induced I_ON mismatch coefficient is nearly the same for FinFET and nanosheet (192 versus 191 nA/nm) ([Fernandez et al. 2023](https://in4.iue.tuwien.ac.at/pdfs/sispad2022/A-comprehensive-Pelgrom-based-on-current-variability-mod_2023_Solid-State-El.pdf)) [TCAD].
- Wider sheets have higher DIBL ([Mohapatra 2021](https://link.springer.com/article/10.1007/s42452-021-04539-y)) [TCAD]. The analog-optimal sheet is narrower than the "widest sheet" logic aims for.
- BDI with sidewall or wrap-around metal contacts raises fT by 8% and fmax by 13% ([Saleh et al. 2026](https://research.ajman.ac.ae/en/publications/digital-and-analogrf-performance-of-stacked-nanosheet-transistors/)) [TCAD]; but BDI raises lattice temperature "significantly" ([Saleh et al. 2023](https://research.ajman.ac.ae/en/publications/impact-of-bottom-dielectric-isolation-of-si-stacked-nanosheet-tra/)) [TCAD].
- The simulated thermal resistance of a single nanosheet stack is about 2.59 K/µW, and the more stacks placed side by side, the higher each stack's thermal resistance ([Zhao et al. 2023](https://www.mdpi.com/2079-4991/13/22/2971)) [Silicon · research + TCAD].

### Mismatch: metal gate grains dominate; stacking sheets is the most area-efficient knob

Public TCAD studies agree that WFV/MGG is the dominant source of V_T mismatch in nanosheets.
- In 3-sheet nanosheets (LG 14 nm, TiN gate, simulation calibrated to experiment), WFV-induced σV_T(sat) is 3.8, 6.3 and 9.6 mV for 1, 3 and 5 nm grains. MGG dominates V_T variation, while S/D extension doping and access resistance dominate I_ON variation ([Mohapatra et al. 2021](https://link.springer.com/article/10.1007/s42452-021-04539-y)) [TCAD].
- Stacked nanosheets are 15% more immune to WFV than nanowires; 3 sheets have 40.5% lower WFV σV_T than 1 sheet; counting WFV only, A_VT is 0.7 mV·µm (nanosheet) versus 1.2 mV·µm (nanowire) ([Sudarsanan & Venkateswarlu 2020](https://publications.iith.ac.in/publication/superior-work-function-variability-performance-of-horizontally)) [TCAD].
- In a 300-sample Monte Carlo, σV_T,sat is 5.84 mV (nanosheet) versus 9.40 mV (back-gated MoS₂ FET); the multi-gate geometry suppresses the effect of high-work-function grains near the source ([Chen et al., IWCN 2025](https://in4.iue.tuwien.ac.at/pdfs/iwce/iwcn5_2025/IWCN_2025_106-107.pdf)) [TCAD].
- GAA nanowires and FinFETs both have a time-zero Pelgrom coefficient of about 2 mV·µm ([Chasin et al. 2017](https://www.iue.tuwien.ac.at/pdf/ib_2017/CP2017_Rzepa_02.pdf)) [Silicon · research].

[Inference] Taken together:
- Nanosheets do not fundamentally change mismatch per unit gate area. The gain comes from getting more gate area in the same footprint (stacking, continuous width), so matching is cheaper in area.
- Once V_T is set by dipoles, residual V_T mismatch will depend more on dipole dose uniformity and high-k interface quality, not only on WFM grains. No public data compares the matching of dipole-based and WFM-thickness-based multi-V_T. Intel gives only the qualitative claim that "18A multi-V_T devices have a low mismatch coefficient" ([Intel 18A platform brief](https://www.intel.com/content/www/us/en/foundry/library/intel-18a-platform-brief.html)) [Vendor].
- With LER moved to a non-critical dimension, the remaining geometric sources are sheet thickness (controlled by SiGe/Si superlattice epitaxy) and gate length variation. Thinner sheets and shorter Lg make them matter more.

Process knobs: smaller or amorphous WFM grains, more stacked sheets, uniform dipole processing. Design knobs: larger total gate area, the same sheet width and V_T option for matched devices, dummies. In addition, BDI lowers average channel stress by about 85% compared with a punch-through stopper (PTS) scheme with ideal S/D stressors ([Saleh et al., TED 2023](https://research.ajman.ac.ae/en/publications/impact-of-bottom-dielectric-isolation-of-si-stacked-nanosheet-tra/)) [TCAD]. [Inference] Stress-related LDE (diffusion breaks, gate-cut proximity) may become weaker as a result, which helps matching, but this has not been quantified publicly.

### DIBL and intrinsic gain: narrow sheets, long Lg

[Textbook] In short channels, DIBL adds a term g_ds ≈ η·gm, so intrinsic gain has an upper limit of about 1/η. Lowering DIBL raises that limit.

Public results:
- A 3D drift-diffusion plus Monte Carlo comparison shows that at LG 16 nm, nanosheets have higher on-current and slightly better subthreshold behavior than an equivalent FinFET ([Nagy et al., IEEE Access 2020](https://minerva.usc.gal/entities/publication/f3f1b8a9-5ef4-484b-9d53-7d72a5108d7d/full)) [TCAD].
- Wider sheets raise I_ON, I_OFF and DIBL; thinner sheets lower I_OFF; at LG 8 nm, SS degrades by about 11 mV/dec ([Mohapatra et al. 2021](https://link.springer.com/article/10.1007/s42452-021-04539-y)) [TCAD].
- imec two-sheet nanosheet research devices (L 28–200 nm, EOT 0.9 nm) have intrinsic gain of about 46 dB and V_EA of about 30 V; the FinFET value cited in the paper is about 34 dB (a cross-paper comparison); 4.7 nm sheet spacing gives higher gain than 7.5 nm ([Simoen et al., JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)) [Silicon · research].
- IBM's FinFET versus GAA comparison finds that "wider, thinner stacked nanosheets" beat FinFET on logic performance ([Kim et al., IBM S3S 2015](https://research.ibm.com/publications/performance-trade-offs-in-finfet-and-gate-all-around-device-architectures-for-7nm-node-and-beyond)) [TCAD]. Together with "wider sheets raise DIBL", this shows that logic and analog prefer different sheet widths.

[Inference] The analog approach: choose narrow or medium sheets for gain-critical devices, use longer Lg (if the PDK offers it) or stacks, and bias in moderate inversion. An isolated body (BDI or "fully isolated body") removes body effect in stacks and cascodes, which helps headroom ([Intel 18A platform brief](https://www.intel.com/content/www/us/en/foundry/library/intel-18a-platform-brief.html)) [Vendor]. No public measured comparison of nanosheet and FinFET gm/gds at the same node exists.

### fT / fmax and parasitics: the bottleneck is outside the sheet

TCAD points to several nanosheet-specific knobs with the largest RF impact:
- **BDI and contact scheme**: BDI improves RF by about 9% on average over PTS. The best combination, BDI plus metal sidewall contact (MSW) or wrap-around contact (WAC), raises fT by 8% and fmax by 13%, with MSW about 2% better than WAC. The simulation includes BEOL parasitics ([Saleh et al., J. Comput. Electron. 2026](https://research.ajman.ac.ae/en/publications/digital-and-analogrf-performance-of-stacked-nanosheet-transistors/)) [TCAD].
- **Sheet gap**: increasing sacrificial layer spacing from 20 nm to 70 nm cuts gate resistance by 34.6% and gate capacitance by 21.9%, raising fT 1.71x and fmax 1.96x ([Chang et al., SSE 2023](https://in4.iue.tuwien.ac.at/pdfs/sispad2022/TCAD-Based-RF-performance-prediction-and-process-optimizat_2023_Solid-State-.pdf)) [TCAD, calibrated to measurements, but devices are large and fT is only 5–20 GHz; use for trends only].
- **S/D epi thickness**: raising the elevated S/D from 10 nm to 30 nm greatly improves fT and fmax (fT +268% and fmax +186% over the full range); fully releasing the channel lowers Cgs/Cgd (same source) [TCAD].
- **Sheet width**: in Chang's results, widening the channel from 40 nm to 100 nm lowers fT by 18% and fmax by 31.5%, because Cgg grows with width while gm/W drops at fixed S/D series resistance (same source). Another sub-2 nm TCAD study shows widening raises fT by about 40% and lowers fmax by about 35%, and that dual-k spacers improve both ([Shen et al., Micromachines 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC12942810/)) [TCAD]. The two disagree on the direction of fT and agree on fmax. [Inference] The difference may come from different S/D resistance assumptions: once S/D resistance is the bottleneck, widening does not help fT.
- **Suspension region**: IBM considers optimizing the sheet suspension region critical to the trade-off between drive current and parasitic capacitance ([Kim et al., IBM](https://research.ibm.com/publications/performance-trade-offs-in-finfet-and-gate-all-around-device-architectures-for-7nm-node-and-beyond)) [TCAD].
- **External resistance on a production platform**: Intel says 18A-P's dual contacts cut external resistance by 20% (N)/12% (P) and raise drive by 5%/16% ([SemiWiki 2026](https://semiwiki.com/semiconductor-manufacturers/intel/372712-intel-18a-p-pushes-ribbonfet-and-backside-power-beyond-the-first-generation/)) [Vendor].

[Inference] For RF and high-speed analog: moderate width, multiple fingers, double-sided gate contacts, and the largest possible S/D contact area. Very wide sheets actually hurt fmax at fixed S/D resistance. No public measured nanosheet fT/fmax data was found for imec, IBM, Samsung, TSMC N2 or Intel 18A.

### Self-heating: the cost of BDI

- **BDI worsens self-heating**: at the same DC current, BDI raises lattice temperature "significantly" compared with PTS, while channel stress drops by 85%. Metal S/D with larger contact area eases both temperature and resistance ([Saleh et al., TED 2023](https://research.ajman.ac.ae/en/publications/impact-of-bottom-dielectric-isolation-of-si-stacked-nanosheet-tra/)) [TCAD].
- **Thermal resistance numbers**: 3-sheet GAA nanosheets were measured from −50 to 125 °C, followed by thermal simulation of 3 nm-class sheets (LG 16 nm, W 20 nm, T 6 nm). A single lateral stack has ΔT_max of 149 K and R_th of 2.59 K/µW. Going from 1 lateral stack to 2 and 4, thermal crosstalk raises R_th per stack. Larger S/D contact area helps heat removal. The authors suggest biasing PMOS near the zero-temperature-coefficient (ZTC) point ([Zhao et al., Nanomaterials 2023](https://www.mdpi.com/2079-4991/13/22/2971)) [Silicon · research + TCAD].
- **Production platform**: Intel says 18A-P cuts stack thermal resistance by 20–40% relative to 18A ([Intel 18A brief 2026](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)) [Vendor].

[Inference] Self-heating affects analog in three ways:
- g_ds shows frequency dispersion, so DC and AC gain differ.
- V_T(T) drift and offset drift.
- Thermal coupling between matched devices placed side by side.

Mitigations include wider finger spacing, larger S/D contact area, background calibration in high-current-density blocks, and pulsed IV to measure isothermal parameters.

### Summary of intrinsic-parameter knobs

In the table below, "+" means better, "−" means worse, and "?" means no public data.

| Knob | 1/f / RTN | Mismatch | DIBL / gain | fT / fmax | Self-heating | Main evidence |
|---|---|---|---|---|---|---|
| Reliability anneal (high-pressure D₂/H₂, PDA) | + (about 4.8x on TFET) | ? | ? | ? | ? | [Silicon · research] |
| Thinner EOT | + | + (A_VT ∝ t_ox [Textbook]) | + | ? | ? | [Silicon · research] |
| Dipole multi-V_T (versus WFM thickness) | ? (BTI looks optimistic) | ? | ? | ? | ? | [Silicon · research, BTI] |
| Smaller WFM grains | ? | + (9.6 → 3.8 mV) | ? | ? | ? | [TCAD] |
| More stacked sheets | + (area, RTN averaging) | + (WFV σV_T −40%) | ? | − (from the 5th sheet on, mostly adds parasitics [Opinion]) | − (thermal crosstalk) | [TCAD] [Opinion] |
| Wider sheets | + (area) | + (area) | − (higher DIBL) | fT results disagree, fmax − | ? | [TCAD] |
| Larger sheet gap | Small | ? | − (JICS: smaller spacing, higher gain) | + (fT ×1.71) | ? | [Silicon · research] [TCAD] |
| BDI | +? (removes parasitic channel [Inference]) | +? (weaker stress LDE [Inference]) | ? | + (fT +8%, fmax +13%) | − (significant temperature rise) | [TCAD] |
| Metal sidewall / wrap-around S/D contacts | ? | ? | ? | + | + | [TCAD] |
| Longer Lg or stacks | + (area) | + (area) | + | − | ? | [Textbook] |

The parasitic judgment in the "more stacked sheets" row comes from the view of imec researchers: beyond about 4 sheets, the 5th sheet mainly adds parasitics ([Semiconductor Engineering](https://semiengineering.com/what-designers-need-to-know-about-gaa/)) [Opinion].

## 6. A practical checklist at the device and layout level

**First choose devices by block (core, relaxed pitch, thick oxide, stack). Then lay out by the "same surroundings" principle. Finally, verify with post-layout simulation that includes internal nodes and with statistical corners. In nanosheets, also control sheet width consistency, thermal coupling and parasitics.**

Key points:
- Matched devices use the same sheet width, Lg, V_T option and orientation, with dummies at array edges [Inference].
- Gain-critical devices use narrow or medium sheets with long Lg or stacks. RF devices use moderate width, multiple fingers and double-sided gate contacts [Inference, based on TCAD in §5].
- Stacks must be extracted with internal nodes. Industry reports a pre-/post-layout gap of about 30% ([Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)) [Opinion].
- Low-noise input devices: large area, low overdrive, thin-EOT core devices preferred, combined with chopping (§4).

### Choosing devices by block

| Block | Recommended device / structure | Reason | Evidence |
|---|---|---|---|
| Op amp input pair | Core devices, moderate inversion, large W·L (multiple sheets or stack); add chopping for precision | 1/f ∝ 1/(WL), S_vg rises with V_ov | §4 [Silicon · research] [Inference] |
| Current sources, current mirrors | Stack (N = 2–8) or relaxed-pitch long-L devices | High r_o, good matching, no extra bias | §1 [Inference] |
| Signal-path cascode | Independently biased cascode or gain boosting | Gain about (gm·ro)², input device stays at Lmin | §2 [Textbook] |
| References, LDOs, bias | Thick-oxide I/O devices or relaxed-pitch devices | Voltage headroom; bandgap references sit close to the supply and need redesign | [Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm) [Opinion] |
| Comparators, dynamic amplifiers, ringamps | Core devices | High speed; accuracy comes from calibration or the dead-zone mechanism | §2 |
| RF / high speed | Core devices, moderate width, multiple fingers, double-sided gate contacts | fT/fmax limited by parasitics and Rg | §5 [TCAD] |
| Sampling switches | High-V_T devices (low leakage) or bootstrapped switches | Droop is set by leakage | [Inference] |

### Layout checklist

1. **Same surroundings**: matched devices use the same sheet width, Lg, V_T option and orientation. NanoFlex allows different sheet widths on one chip ([IEEE Spectrum](https://spectrum.ieee.org/tsmc-n2)), but mixing widths within a matched pair introduces systematic mismatch [Inference].
2. **Dummies and edges**: add dummy gates and dummy sheets at both ends of arrays to handle LDE from gate cuts, diffusion breaks, WPE and stress. The end units of a stack sit near the diffusion break and differ from the middle units, so both ends need dummies [Inference].
3. **Common centroid and interdigitation**: use them to cancel gradients. Two-finger matched stacks cannot share diffusion; place them in columns and alternate drain-in-center and source-in-center orientations ([EDN 2021](https://www.edn.com/all-about-stacked-mosfets-in-analog-layout/)).
4. **Stack layout**: single-finger stacks share diffusion in one row, and area is set by minimum poly spacing. Folding a long chain into multiple rows adds interconnect and capacitance, so keep it in one row where possible ([Cadence blog](https://community.cadence.com/cadence_blogs_8/b/cic/posts/stacked-mosfets-in-analog-layout)) [Opinion].
5. **Gate resistance**: contact the gate at both ends of multi-finger devices; Rg drops to about 1/4 of single-ended contact [Textbook].
6. **S/D contacts**: make contact area as large as possible to lower both external resistance and self-heating ([Saleh 2023](https://research.ajman.ac.ae/en/publications/impact-of-bottom-dielectric-isolation-of-si-stacked-nanosheet-tra/); [Zhao 2023](https://www.mdpi.com/2079-4991/13/22/2971)) [TCAD].
7. **Thermal**: leave spacing between high-current-density devices and matched devices, and split high-current devices into multiple separated fingers to reduce thermal crosstalk ([Zhao 2023](https://www.mdpi.com/2079-4991/13/22/2971)). Place thermally sensitive matched pairs where the thermal gradient is symmetric [Inference].
8. **Regular cells**: use foundry-provided fixed-height analog cells and uniform OD/poly for easier migration and automation ([SemiWiki, TSMC OIP](https://semiwiki.com/semiconductor-manufacturers/321960-tsmc-oip-analog-cell-migration/)).
9. **Verification**: post-layout simulation is mandatory. Use more Monte Carlo, high-σ and ML-accelerated statistical verification ([Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)) [Opinion]. Use statistical corners for noise, not a single Kf [Inference].

### A minimal device evaluation package

[Inference] When you get a new nanosheet PDK, start with the minimal evaluation below to decide whether to focus on device selection, stacks or circuit techniques.

Device options:
- Core device at Lmin and at the longest Lg.
- Stacks with N = 1/2/4/8.
- Relaxed-pitch devices (if available).
- Thick-oxide I/O devices.

For each option, list gm·ro, fT, A_VT and S_VG·WL at 1 kHz at gm/ID = 10 and 15. Also list R_th at the target current density.

With this table in hand:
- If gm·ro is not enough and headroom is tight, look first at gain boosting and CLS (§2).
- If A_VT and S_VG·WL are not enough, look first at chopping and calibration (§3), rather than adding more area.

## 7. Gaps in public data and what to confirm with the PDK or your own data

**The most important numbers in this report (stack gain versus N; A_VT/Kf/gm/gds/fT/R_th of production nanosheets; the effect of dipoles on noise) are not in the public literature. They need to be confirmed with the foundry PDK or your own silicon data.**

Key points:
- No public IEDM/VLSI/TED/JSSC paper was found that gives A_V0 or r_o versus N for stacks of N Lmin devices in FinFET or nanosheet.
- No public A_VT, Aβ, Kf, gm/gds, fT/fmax or R_th was found for TSMC N2, Samsung SF3/SF2 or Intel 18A. Intel offers only the qualitative claim of a "low mismatch coefficient" ([Intel 18A platform brief](https://www.intel.com/content/www/us/en/foundry/library/intel-18a-platform-brief.html)).
- For the effects of dipoles, IL, nitridation, fluorine, inner spacers, BDI, strain and SiGe channels on nanosheet 1/f noise and RTN, public data either does not exist or is only indirect BTI evidence.
- No public source compares circuit techniques side by side on the same GAA node at the same VDD. Measured ringamp FoM was also not obtained this time.

### Public status and what can be confirmed

| Question | Public status | What to confirm with the foundry PDK or your own silicon data |
|---|---|---|
| Stacks versus long L | Only planar/SOI data and patent claims; none for FinFET/GAA | gm/gds versus gm/ID, V_EA and DIBL for stacks with N = 1/2/4/8/16; internal node voltages; comparison with relaxed-pitch devices; whether the PDK offers a stack PCell with a dedicated model |
| Stack modeling | Older models can be off by up to 60% ([Dantas & de Sousa](https://sbmicro.org.br/sforum-eventos/sforum2008/43.pdf)); no public information on how BSIM-CMG handles stacks | Model validation report for the stack PCell; extraction rules with internal nodes; comparison of pre-layout, post-layout and silicon |
| Non-uniform stacks | Only µm-scale FD-SOI data | Rules and spacing cost for mixing V_T on one diffusion; gain and matching of mixed-V_T stacks |
| Mismatch in production nanosheets | Only TCAD (e.g., A_VT ≈ 0.7 mV·µm, WFV only) | A_VT and Aβ for each V_T option and sheet width; linear versus saturation differences; dipole-based versus WFM-based comparison |
| 1/f and RTN in production nanosheets | Only imec research devices | S_VG·WL or N_OT per option (core/I/O, LVT/HVT, n/p, sheet width); lognormal σ; RTN statistical corners; effect of anneal conditions on noise |
| Intrinsic gain | Only imec research devices (about 46 dB) | gm·ro versus gm/ID curves for each L and V_T option; dependence of DIBL on sheet width |
| fT/fmax and parasitics | Only TCAD | Cgg, Cgd, Rg and fT/fmax versus gm/ID; RF optimization window for sheet width and finger count; upper frequency limit of the RF model |
| Self-heating | Only TCAD and research devices (R_th ≈ 2.59 K/µW) | R_th and thermal time constant for each device option; thermal crosstalk versus spacing; effect of self-heating on g_ds frequency dispersion; whether there are layout rules related to self-heating |
| Overall impact of BDI on analog | Both the RF benefit and the self-heating cost are TCAD only | Whether BDI is a process option, and its effect on noise, matching and R_th |
| LDE | Only qualitative statements from TSMC | Magnitude of V_T and I_D shifts from gate cuts, diffusion breaks and sheet-width transitions; minimum dummy requirements |
| Backside power | Only vendor claims on IR drop and thermal resistance | Substrate isolation, guard ring effectiveness, inductor Q; effect of backside power on noise coupling |
| Circuit techniques measured on GAA | No side-by-side comparison at the same node and VDD | Measured metrics for gain-boosted OTAs, ringamps and dynamic amplifiers in reference designs or IP on that node |

### Inferences this report relies on

The following conclusions come from reasoning and are worth validating first with your own data [Inference]:
1. Stack gain is about N × single-device gain, and saturates early at large N because of headroom and internal nodes (§1).
2. FinFET/GAA have no halo, so the extra gain a stack has over a single device of the same length will be smaller (§1).
3. Anneals that lower BTI also lower nanosheet 1/f noise; dipoles do not add noise (§4).
4. Parallel sheets average RTN into a Gaussian distribution, and device-to-device σ shrinks roughly as 1/√M (§4).
5. Gain-critical devices should use narrow or medium sheets; RF devices should not use the widest sheets (§5).

## Sources

**Public sources cited in this report, grouped by topic.**

**Series stacks and self-cascode**
- [Vittoz, EKV model slides (EPFL)](https://www.epfl.ch/labs/iclab/wp-content/uploads/2019/02/10_EKV_UMW04_Eric_Vittoz.pdf)
- [Fiorelli, Arnaud, Galup-Montoro, Series-parallel association, ISCAS 2004](https://lci.ufsc.br/pdf/Series%20parallel%20association.pdf)
- [Dantas & de Sousa, associated transistors modeling, SBMicro SForum](https://sbmicro.org.br/sforum-eventos/sforum2008/43.pdf)
- [Deceuster et al., series-parallel SOI MOSFETs, Electronics Letters 1996](https://research.dial.uclouvain.be/handle/2078.5/71429)
- [US 2006/0226464, stacked short-channel PMOS patent](https://patents.justia.com/patent/20060226464)
- [Assalti, de Souza, Flandre, asymmetric self-cascode FD-SOI, 2018](https://research.dial.uclouvain.be/bitstreams/64bfbf3c-cfca-4f4d-8e03-66109d23fdcd/download)
- [Saari, series-stack topology, U. Waterloo MASc seminar 2014](https://uwaterloo.ca/electrical-computer-engineering/events/masc-seminar-daniel-saari)
- [Cadence Community blog: Stacked MOSFETs in Analog Layout](https://community.cadence.com/cadence_blogs_8/b/cic/posts/stacked-mosfets-in-analog-layout)
- [EDN: All about stacked MOSFETs in analog layout (2021)](https://www.edn.com/all-about-stacked-mosfets-in-analog-layout/)
- [Fulde et al., Adv. Radio Sci. 5 (2007), FinFET analog](https://d-nb.info/1149772921/34)

**Circuit techniques**
- [Bult & Geelen, 90-dB fast-settling op amp, JSSC 1990](https://doi.org/10.1109/4.62165)
- [90 dB, 90 MHz, 30 mW OTA with gain enhancement (Bar-Ilan)](https://cris.biu.ac.il/en/publications/90db-90mhz-30mw-ota-with-the-gain-enhancement-implemented-by-one-/)
- [Eschauzier, Kerklaan, Huijsing, 100-MHz 100-dB op amp with MNMC, JSSC 1992](https://doi.org/10.1109/4.173108)
- [Chae & Han, inverter-based SC delta-sigma modulator, JSSC 2009](https://doi.org/10.1109/JSSC.2008.2010973)
- [Hershberg et al., Ring amplifiers for switched capacitor circuits, JSSC 2012](https://doi.org/10.1109/JSSC.2012.2217865)
- [imec, 6-to-600MS/s ringamp pipelined ADC in 16nm, ISSCC 2019 (OpenAlex)](https://api.openalex.org/works/doi:10.1109%2FISSCC.2019.8662319)
- [imec, 410 MS/s 11b pipelined-SAR ADC in 28 nm, VLSI 2013](https://www.imec-int.com/drupal/sites/default/files/inline-files/400MS_11bit_28nm_ADC_VLSI2013.pdf)
- [OSU letter on cross-coupled correlated level shifting](https://ece.osu.edu/media/document/2024-04-05/cc_cls.pdf)
- [Straayer & Perrott, VCO-based quantizer ΣΔ ADC, JSSC 2008](https://doi.org/10.1109/JSSC.2008.917500)
- [Enz & Temes, autozeroing, CDS and chopper stabilization, Proc. IEEE 1996](https://doi.org/10.1109/5.542410)
- [Recent trends in low-frequency noise reduction techniques, ICNF 2015 (EPFL)](https://infoscience.epfl.ch/record/215989)
- [Murmann & Boser, open-loop residue amplification pipelined ADC, JSSC 2003](https://doi.org/10.1109/JSSC.2003.819167)
- [Pelgrom et al., Matching properties of MOS transistors, JSSC 1989](https://doi.org/10.1109/JSSC.1989.572629)
- [Palermo, gm/ID lecture, TAMU ECEN474](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)
- [GlobalFoundries, body bias in FD-SOI](https://gf.com/?p=722)

**Process platforms and industry views**
- [WikiChip, IEDM 2017: Intel 22FFL](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)
- [Singh et al. (GF), 14 nm FinFET technology for analog and RF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)
- [Semiconductor Engineering, Wrestling With Analog At 3nm](https://semiengineering.com/wrestling-with-analog-at-3nm)
- [Semiconductor Engineering, What designers need to know about GAA](https://semiengineering.com/what-designers-need-to-know-about-gaa/)
- [Semiconductor Engineering, Random telegraph noise](https://semiengineering.com/knowledge_centers/eda-design/noise-2/random-telegraph-noise/)
- [SemiWiki, TSMC OIP analog cell migration](https://semiwiki.com/semiconductor-manufacturers/321960-tsmc-oip-analog-cell-migration/)
- [SemiWiki, Intel 18A-P RibbonFET and backside power](https://semiwiki.com/semiconductor-manufacturers/intel/372712-intel-18a-p-pushes-ribbonfet-and-backside-power-beyond-the-first-generation/)
- [ASIC North, FinFET back-end layout analog techniques](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/)
- [IEEE Spectrum, TSMC N2](https://spectrum.ieee.org/tsmc-n2)
- [Intel 18A platform brief](https://www.intel.com/content/www/us/en/foundry/library/intel-18a-platform-brief.html)
- [Intel 18A technology brief (2026)](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)

**Nanosheet noise and RTN**
- [Asanovski et al. (imec), 1/f noise in nanosheet vs planar, arXiv 2609.08674](https://arxiv.org/html/2609.08674)
- [Simoen et al., LFN and analog of stacked nanosheets, JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)
- [Shin et al., high-pressure D2/H2 annealing and LFN, Sci. Rep. 2022](https://www.nature.com/articles/s41598-022-22575-5)
- [Yang et al., RTN reduction by HPD annealing in nanowire FET, Nanotechnology 2020](https://iopscience.iop.org/article/10.1088/1361-6528/ab9e90)
- [Franco et al., dipoles and thermal budget for BTI, EDTM 2019](https://www.iue.tuwien.ac.at/pdf/ib_2019/CP2019_Franco_1.pdf)
- [Chasin et al., time-dependent variability in GAA nanowires vs FinFET, 2017](https://www.iue.tuwien.ac.at/pdf/ib_2017/CP2017_Rzepa_02.pdf)
- [VLSI 2009, RTN in 15,000 nFETs](https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm)
- [Arimura et al., dipole-first gate stack for nanosheet/CFET, IEDM 2021](https://imec-publications.be/entities/publication/639ca126-058f-4dd5-9cf3-a0ec41579acf/full)
- [IBM, dual dipoles for multi-Vt in FinFET and nanosheet](https://research.ibm.com/publications/selective-enablement-of-dual-dipoles-for-near-bandedge-multi-vt-solution-in-high-performance-finfet-and-nanosheet-technologies)

**Mismatch, DIBL, fT and self-heating**
- [Mohapatra et al., variability in stacked nanosheet FET, SN Appl. Sci. 2021](https://link.springer.com/article/10.1007/s42452-021-04539-y)
- [Sudarsanan & Venkateswarlu, WFV in stacked nanosheets, 2020](https://publications.iith.ac.in/publication/superior-work-function-variability-performance-of-horizontally)
- [Fernandez et al., Pelgrom-based current variability model, SSE 2023](https://in4.iue.tuwien.ac.at/pdfs/sispad2022/A-comprehensive-Pelgrom-based-on-current-variability-mod_2023_Solid-State-El.pdf)
- [Chen et al., metal grain variability NSFET vs 2D FET, IWCN 2025](https://in4.iue.tuwien.ac.at/pdfs/iwce/iwcn5_2025/IWCN_2025_106-107.pdf)
- [Nagy et al., FinFET vs NW vs NS at LG ≤ 16 nm, IEEE Access 2020](https://minerva.usc.gal/entities/publication/f3f1b8a9-5ef4-484b-9d53-7d72a5108d7d/full)
- [Kim et al. (IBM), FinFET vs GAA trade-offs, S3S 2015](https://research.ibm.com/publications/performance-trade-offs-in-finfet-and-gate-all-around-device-architectures-for-7nm-node-and-beyond)
- [Saleh et al., BDI in stacked nanosheet, IEEE TED 2023](https://research.ajman.ac.ae/en/publications/impact-of-bottom-dielectric-isolation-of-si-stacked-nanosheet-tra/)
- [Saleh et al., digital and analog/RF performance of stacked nanosheets, J. Comput. Electron. 2026](https://research.ajman.ac.ae/en/publications/digital-and-analogrf-performance-of-stacked-nanosheet-transistors/)
- [Chang et al., TCAD RF prediction and process optimization, SSE 2023](https://in4.iue.tuwien.ac.at/pdfs/sispad2022/TCAD-Based-RF-performance-prediction-and-process-optimizat_2023_Solid-State-.pdf)
- [Shen et al., sub-2 nm stacked nanosheet RF, Micromachines 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC12942810/)
- [Zhao et al., self-heating in GAA nanosheets, Nanomaterials 2023](https://www.mdpi.com/2079-4991/13/22/2971)


---

# Glossary

## Core metrics

### gm (transconductance)

**In one line:** How much drain current changes per small change in gate voltage: ΔID/ΔVGS, in siemens.

- **What it is:** gm = ∂ID/∂VGS at a fixed VDS bias point. It is the factor by which the transistor converts an input voltage signal into an output current signal.
- **What it tells you:** How strongly the device responds to an input signal; it sets amplifier gain, bandwidth and input-referred noise.
- **Bigger vs smaller:** Larger is better: at the same current, higher gm means more gain, more speed and less input-referred noise. But gm rises with current, so gm alone means little; look at gm/ID.
- **Analogy:** Like the sensitivity of a faucet: turn the handle a little, how much does the flow change? A sensitive faucet has high gm.
- **How it is measured:** Sweep ID–VGS and differentiate; at high frequency convert S- to Y-parameters and take Re(Y21). Differentiation amplifies noise, so smooth or use fine steps and averaging.

### gm/ID (transconductance efficiency)

**In one line:** How much gm each ampere of current buys, in S/A (1/V). Analog design's fuel-efficiency number.

- **What it is:** gm divided by drain current. It depends mainly on the inversion level, not on W, so devices of different sizes can be compared on one chart.
- **What it tells you:** Where the bias point sits — weak, moderate or strong inversion — and therefore the trade-off between power efficiency and speed.
- **Bigger vs smaller:** Higher means more power-efficient: around 25–35 S/A is weak inversion, most efficient but slow; below about 5 S/A is strong inversion, fast but power-hungry. The usual compromise is 10–15 S/A. The theoretical ceiling is about 1/(n·kT/q), roughly 30–40 S/A at room temperature.
- **Analogy:** Like fuel economy: how far (gm) each liter of fuel (current) takes you. Low gear saves fuel but is slow; high gear is fast but thirsty.
- **How it is measured:** Compute gm from an ID–VGS sweep and divide by ID; plot gm/ID against ID/(W/L), one curve per L. Murmann's gm/ID kit generates these on open PDKs.
- **Typical numbers:** [Textbook] Weak-inversion ceiling ≈ 1/(n·UT), with n ≈ 1.2–1.5 and UT ≈ 26 mV.

### Inversion coefficient (IC) and weak/moderate/strong inversion

**In one line:** A normalized scale for the bias point: IC < 0.1 weak, 0.1–10 moderate, > 10 strong inversion.

- **What it is:** IC = ID / (I_spec·W/L), where I_spec is a process-dependent specific current (EKV model). It measures how ‘full’ the channel inversion charge is.
- **What it tells you:** Which conduction regime the device is in: diffusion-dominated in weak inversion (exponential), drift-dominated in strong inversion (square law or velocity saturation).
- **Bigger vs smaller:** Lower IC gives higher gm/ID but lower fT and bigger devices; higher IC does the opposite. The best compromise is usually moderate inversion.
- **Analogy:** Like how far a valve is open: a crack (weak inversion) gives a thin but efficient flow; wide open (strong inversion) gives big flow with more waste.
- **How it is measured:** Fit I_spec and slope factor n from the gm/ID–ID curve, then convert to IC.

### fT (transition frequency)

**In one line:** The frequency at which current gain falls to 1, ≈ gm/(2π·Cgg); the device's intrinsic speed.

- **What it is:** The frequency where short-circuit current gain |h21| reaches 1. Approximately gm divided by 2π times total gate capacitance Cgg.
- **What it tells you:** How well the device can drive its own gate capacitance — its intrinsic bandwidth.
- **Bigger vs smaller:** Higher is faster. fT rises as gm/ID falls, so compare ‘fT at a given gm/ID’. Usable circuit bandwidth is typically about a tenth of fT.
- **Analogy:** Like how fast someone can load their own luggage: more strength (gm) and lighter bags (capacitance) mean faster.
- **How it is measured:** On-wafer S-parameters, de-embedded, converted to h21 and extrapolated to 0 dB; or estimate from DC gm and CV-measured Cgg.
- **Typical numbers:** 14 nm FinFET reports fT ≈ 314/285 GHz (n/p); see guide §3.

### fmax (maximum oscillation frequency)

**In one line:** Frequency where power gain falls to 1; more sensitive to gate resistance and Cgd than fT.

- **What it is:** The frequency where unilateral power gain (Mason's U) equals 1 — the highest frequency at which the device can still amplify power.
- **What it tells you:** RF capability, reflecting parasitics such as gate resistance Rg, Cgd and output conductance.
- **Bigger vs smaller:** Higher suits RF better. fmax far below fT usually means gate resistance is too high — a watch item for GAA's multi-layer metal gates.
- **Analogy:** fT is engine RPM; fmax is the speed the car actually reaches. If the drivetrain (gate resistance) leaks, high RPM is wasted.
- **How it is measured:** Compute Mason's U or MAG from S-parameters and extrapolate to 0 dB. Double-sided gate contacts improve it markedly.

### Cgg / Cgd (gate capacitances)

**In one line:** Cgg is total capacitance seen at the gate; Cgd is gate-to-drain, multiplied by the Miller effect.

- **What it is:** Cgg = Cgs + Cgd + Cgb, intrinsic plus parasitic. Cgd bridges input and output.
- **What it tells you:** The load you pay to drive the device, setting speed and power; Cgd also sets feedback and stability.
- **Bigger vs smaller:** Smaller is better. A high Cgd/Cgg ratio means parasitics dominate and hurt both fT and fmax; GAA inner spacers and gate-to-S/D capacitance are the focus.
- **Analogy:** Like cargo on a cart: Cgg is the total weight; Cgd is a rope tying you to the car behind, pulling back whenever you move.
- **How it is measured:** CV measurements (split terminals to separate Cgs/Cgd), or from Y-parameter imaginary parts.

### VT (threshold voltage)

**In one line:** The gate voltage where the device turns on; analog cares more about its mismatch and drift with temperature and stress.

- **What it is:** The gate voltage needed to form the inversion layer, defined by constant-current or max-gm extrapolation.
- **What it tells you:** The switching point and bias position, and the design freedom of multi-VT options.
- **Bigger vs smaller:** For analog the absolute value matters less than ΔVT between two ‘identical’ devices (smaller is better) and a predictable temperature drift. Low VT gives more headroom but more leakage.
- **Analogy:** Like a doorstep height: the height itself is negotiable, but two ‘twin’ doors with different steps are a problem.
- **How it is measured:** Extract from ID–VGS by constant current or max-gm linear extrapolation; mismatch needs paired-device statistics.

### SS (subthreshold swing)

**In one line:** Gate voltage needed for a 10× current increase below threshold; ~60 mV/dec limit at room temperature.

- **What it is:** SS = dVGS/d(log10 ID), measured in weak inversion.
- **What it tells you:** Quality of gate electrostatic control; it directly sets the weak-inversion gm/ID ceiling.
- **Bigger vs smaller:** Smaller is better, ideally near 60 mV/dec; low SS means higher weak-inversion gm/ID, good for low-power analog. GAA reports ≈ 65 mV/dec.
- **Analogy:** Like a volume knob: the less you turn it for a 10× louder sound, the more sensitive it is.
- **How it is measured:** Inverse slope of the subthreshold region on a semilog ID–VGS plot.

### ZTC (zero-temperature-coefficient point)

**In one line:** A gate voltage where current barely changes with temperature; a temperature-stable bias point.

- **What it is:** As temperature rises, VT falls (more current) while mobility falls (less current); ZTC is the VGS where they cancel.
- **What it tells you:** The balance point of the device's temperature sensitivity.
- **Bigger vs smaller:** Biasing near ZTC minimizes current drift with temperature; far from it, drift grows. imec nanosheet data show a clear ZTC from 25 to 200 °C.
- **Analogy:** Like mixing hot and cold water so the temperature stays the same.
- **How it is measured:** Measure ID–VGS at several temperatures and find where the curves cross.

### Ion/Ioff and CV/I (logic metrics)

**In one line:** Core logic metrics: on-current, off-leakage and gate delay; analog does not lead with them.

- **What it is:** Ion is current at VGS = VDS = VDD; Ioff is leakage at VGS = 0; CV/I approximates one gate delay.
- **What it tells you:** Large-signal switching speed and static power.
- **Bigger vs smaller:** Higher Ion is faster, lower Ioff saves power. But analog works in small-signal mode at a bias point, so these rarely decide analog performance directly.
- **Analogy:** A logic device is a light switch — fast on, fully off; an analog device is a dimmer — every position in between must be stable.
- **How it is measured:** ID–VGS endpoints at VDD; CV/I from ring oscillators or Ieff.

## Gain & output

### DIBL (drain-induced barrier lowering)

**In one line:** Raising drain voltage lowers the source barrier so VT falls with VDS; in mV/V.

- **What it is:** In short channels the drain field reaches the source and lowers the injection barrier. Quantified as ΔVT/ΔVDS.
- **What it tells you:** How firmly the gate controls the channel; also a main source of output conductance gds.
- **Bigger vs smaller:** Smaller is better. Large DIBL lets the drain ‘interfere’ with current, raising gds and cutting intrinsic gain. FinFET and GAA have much lower DIBL than planar, which is why their gain is higher.
- **Analogy:** Like a noisy room next door: the class should only follow the teacher (gate) but gets pulled off by the noise outside (drain).
- **How it is measured:** Extract VT at low and high VDS; divide the difference by the VDS step.
- **Typical numbers:** A 45 nm-class FinFET prototype reported DIBL ≈ 46/44 mV/V; see guide §1.

### gds and ro (output conductance and resistance)

**In one line:** How much current changes per small change in drain voltage: ∂ID/∂VDS; its inverse ro is output resistance.

- **What it is:** In saturation an ideal device's current is independent of VDS; in reality CLM and DIBL make it creep up, and that slope is gds.
- **What it tells you:** How ‘stiff’ the device is as a current source.
- **Bigger vs smaller:** Smaller gds (larger ro) is better: a more ideal current source and more amplifier gain. gds falls as L grows, which is why analog likes long channels.
- **Analogy:** Like a hose: a stiff one keeps the flow constant whatever the downstream pressure; a soft one lets flow follow the pressure.
- **How it is measured:** Differentiate an ID–VDS sweep. Self-heating can make DC gds look small or even negative; measure at high frequency with S-parameters (Re(Y22)).

### gm/gds (intrinsic gain)

**In one line:** The maximum voltage gain a single transistor can give: gm times ro, often in dB.

- **What it is:** The device turns input voltage into current (gm), and its own output resistance (ro) turns it back into voltage; the product is its voltage gain with an ideal load.
- **What it tells you:** The device's ceiling as an amplifier: how much one stage can amplify, and whether you need more stages or cascodes.
- **Bigger vs smaller:** Bigger is better: 20× ≈ 26 dB, 100× = 40 dB. It rises with longer L and higher gm/ID. Going from planar to FinFET raised intrinsic gain by about 2–10×; imec research nanosheets reach ≈ 46 dB (≈ 200×).
- **Analogy:** Like a lever: gm is how much your push moves, ro is how solid the pivot is; a wobbly pivot (low ro) wastes any push.
- **How it is measured:** Extract gm (ID–VGS) and gds (ID–VDS) at the same bias and divide; plot gm/gds versus gm/ID, one curve per L. Use Y21/Y22 at high frequency to avoid self-heating.
- **Typical numbers:** Intel 22FFL analog devices: GM×Rout 47/54/60; GF 14 nm FinFET ≈ 40/34 (n/p); see guide §3.

### VEA (Early voltage)

**In one line:** ID/gds in volts; output resistance expressed as a voltage — larger is closer to an ideal current source.

- **What it is:** The magnitude where saturation ID–VDS lines, extrapolated backward, cross the VDS axis; equals ID/gds.
- **What it tells you:** Current-independent output-resistance quality; intrinsic gain ≈ (gm/ID)·VEA.
- **Bigger vs smaller:** Larger is better and roughly proportional to L (often quoted as VEA/L). imec research nanosheets report about 30 V.
- **Analogy:** Like a spring constant: it turns output resistance into one number independent of current, easy to compare.
- **How it is measured:** VEA = ID/gds at specified VDS and overdrive; or by extrapolation.

### CLM (channel-length modulation)

**In one line:** As VDS rises the pinch-off point moves toward the source, shortening the effective channel and raising current.

- **What it is:** In saturation the pinch-off region widens with VDS, shortening effective L.
- **What it tells you:** One classic source of gds (the other is DIBL).
- **Bigger vs smaller:** Less is better; with longer L the same pinch-off change is a smaller fraction, so long channels have lower gds.
- **Analogy:** Like a queue losing a few people at the end: a long queue barely notices; a short one shrinks noticeably.
- **How it is measured:** Separate CLM from DIBL by comparing gds across several L.

### Halo / pocket implant

**In one line:** Heavily doped pockets at source and drain that suppress short-channel effects but hurt long-channel analog output resistance.

- **What it is:** An angled implant added in logic processes to control VT roll-off at minimum L.
- **What it tells you:** A textbook case of logic optimization conflicting with analog needs.
- **Bigger vs smaller:** For analog, heavier halo means higher gds in long devices, long-channel DIBL and reverse short-channel effect, and lower gain. Undoped FinFET/GAA channels largely drop the halo.
- **Analogy:** Like hurdles added at the start to stop sprinters jumping the gun — a trip hazard for distance runners.
- **How it is measured:** Compare VT–L and gds–L curves with and without halo or across L.

### Voltage headroom

**In one line:** What remains of the supply for signal swing after each device takes the voltage it needs to stay saturated.

- **What it is:** Each stacked device needs at least VDS,sat (≈ overdrive) to stay in saturation.
- **What it tells you:** How many cascodes you can stack and how large the signal can swing.
- **Bigger vs smaller:** More is better. Advanced nodes run below 1 V, so headroom is tight, limiting cascodes and stacks; analog often borrows higher-voltage I/O devices.
- **Analogy:** Like ceiling height: every floor slab (device) takes height, leaving less room for people (signal).
- **How it is measured:** Find the saturation knee on ID–VDS, or estimate VDS,sat ≈ 2/(gm/ID).

## Noise

### Flicker noise (1/f noise)

**In one line:** Low-frequency noise whose power density scales as 1/f — the lower the frequency, the larger the noise; caused by oxide traps randomly capturing and releasing carriers.

- **What it is:** A low-frequency jitter in the current that grows stronger at lower frequency. The main explanation is gate-dielectric traps capturing and releasing channel carriers, so carrier number (and mobility) fluctuate randomly.
- **What it tells you:** Gate-dielectric and interface quality (trap density), and its impact on low-frequency precision circuits — references, sensors, ADCs and VCO phase noise.
- **Bigger vs smaller:** Smaller is better. Compare devices with area-normalized SVG·W·L (V²·µm²/Hz); noise falls as 1/(WL). GF 14 nm FinFET: 17/35 vs 28 nm planar 171/106 fV²·µm²/Hz (n/p); imec found nanosheets comparable to planar devices with the same gate stack.
- **Analogy:** Like a low hum on a radio: the slower the signal, the more the hum shows. Nothing is broken — tiny traps in the material are flipping at random.
- **How it is measured:** A low-frequency noise analyzer (e.g., Keysight E4727A/B) with a parameter analyzer measures SID (A²/Hz) on-wafer, usually 10 Hz–1 kHz at low VDS, over many devices; SID/ID² versus (gm/ID)² diagnoses the mechanism.
- **Typical numbers:** See the noise data table in guide §4.

### SID / SVG (noise power spectral density)

**In one line:** SID is drain-current noise spectrum (A²/Hz); SVG = SID/gm² is the gate-referred voltage noise (V²/Hz).

- **What it is:** Noise power per hertz of bandwidth. Referred to the gate, it compares directly with the input signal.
- **What it tells you:** How noisy the device is and how it limits input-side precision.
- **Bigger vs smaller:** Smaller is better. Multiply by W·L for a size-independent value to compare across processes; √SVG is in V/√Hz.
- **Analogy:** Like a jittery bathroom scale: SID is the reading jitter, SVG is that jitter converted into ‘how many pounds on you’.
- **How it is measured:** Measure SID with a low-noise amplifier and FFT/spectrum analysis, then divide by gm² at the same bias.

### ΔN vs Δμ models (McWhorter vs Hooge)

**In one line:** Two explanations of 1/f noise: carrier-number fluctuation (traps, McWhorter) or mobility fluctuation (Hooge).

- **What it is:** The ΔN model says trapping changes carrier number; the Δμ model says lattice scattering makes mobility fluctuate; the correlated ΔN–Δμ model combines them.
- **What it tells you:** The physical origin of the noise, telling you whether to fix the gate dielectric or the channel.
- **Bigger vs smaller:** Diagnosis: if SID/ID² tracks (gm/ID)², ΔN dominates; if it falls as 1/ID, Δμ dominates. In advanced nodes nMOS is mostly ΔN-dominated; pMOS often needs the correlated term.
- **Analogy:** Like asking whether traffic is thin because there are fewer cars (number) or because each car keeps stopping (mobility).
- **How it is measured:** Measure SID over a range of ID, compare SID/ID² with (gm/ID)²; extract trap density and scattering coefficient from the intercept and slope of √SVG versus VGT.

### Trap density N_OT / N_BT

**In one line:** Density of gate-dielectric defects that capture and release channel carriers, in cm⁻³·eV⁻¹; the root of 1/f noise.

- **What it is:** Dielectric defects within about 1–3 nm of the interface with energies near the Fermi level (border traps).
- **What it tells you:** Process quality of the gate stack — interfacial layer, high-k and work-function metal.
- **Bigger vs smaller:** Lower is better. It sets 1/f noise level and relates to BTI reliability; changing the work-function metal changes it.
- **Analogy:** Like potholes: more of them, more often the traffic (carriers) gets stuck and released.
- **How it is measured:** Back-calculated from 1/f noise via the ΔN model; or by charge pumping and similar methods.

### RTN (random telegraph noise)

**In one line:** Two-level current jumps from a single trap in small devices; worse as area shrinks.

- **What it is:** In large devices thousands of traps add up to smooth 1/f; in small devices only a few exist, so individual discrete jumps show up.
- **What it tells you:** Device-to-device noise spread and occasional large ΔVT — a statistical problem.
- **Bigger vs smaller:** Smaller amplitude and fewer affected devices are better. At 20 nm gate length, tails above 70 mV ΔVth have been reported; two ‘identical’ devices can differ widely in noise.
- **Analogy:** Like someone coughing in a choir: lost in a crowd, glaring in a trio.
- **How it is measured:** Record current in the time domain, extract amplitudes and time constants, and build statistics over many devices.

### Thermal noise and γ

**In one line:** White noise from thermal motion in the channel resistance, SID = 4kT·γ·gm; larger γ means noisier.

- **What it is:** A frequency-independent noise floor. Long-channel theory gives γ = 2/3; short-channel devices are higher.
- **What it tells you:** The noise floor for high-frequency and wideband circuits (LNAs, fast ADCs).
- **Bigger vs smaller:** Smaller γ is better; input-referred thermal noise ≈ 4kT·γ/gm, so more gm means less noise.
- **Analogy:** Like molecules jiggling in warm water: as long as there is temperature, it is there, at every frequency.
- **How it is measured:** High-frequency noise-parameter measurements (noise source plus tuner) give NFmin, Rn, etc.; at low frequency 1/f noise masks it.

### 1/f corner frequency

**In one line:** The frequency where 1/f noise equals thermal noise; below it 1/f dominates.

- **What it is:** The knee where the noise spectrum turns from the 1/f slope to flat.
- **What it tells you:** Which frequency band needs to worry about 1/f.
- **Bigger vs smaller:** Lower is better; in advanced nodes it is often in the MHz range, so many mid-band circuits feel 1/f too.
- **Analogy:** Like waves and wind: waves dominate low pitch, wind the high; where they are equally loud is the corner.
- **How it is measured:** Find the crossing on one noise spectrum.

### NFmin (minimum noise figure)

**In one line:** The device's noise figure at optimal source impedance; key for RF LNAs, in dB.

- **What it is:** Ratio of input to output SNR in dB, minimized at optimal matching.
- **What it tells you:** How much noise the device adds to a signal.
- **Bigger vs smaller:** Smaller is better; 0 dB means no added noise. Driven by gm, γ and gate resistance.
- **Analogy:** Like a photocopier: every copy gets a bit dirtier; NFmin is the least dirt it can add.
- **How it is measured:** On-wafer noise-parameter system, fitted over several source impedances.

## Matching & layout

### Mismatch

**In one line:** Random differences between two identically designed devices; a main error source in precision analog.

- **What it is:** Includes random mismatch (dopants, metal grains, line-edge roughness) and systematic mismatch (stress, gradients, different layout surroundings).
- **What it tells you:** The limit on differential-pair offset, current-mirror accuracy and DAC/ADC linearity.
- **Bigger vs smaller:** Smaller is better; the random part shrinks as 1/√(WL) with area; the systematic part does not, and needs symmetric layout.
- **Analogy:** Like twins: same genes (same design) yet subtly different; raise one on the sunny side and one on the shady side (different layout surroundings) and the gap widens.
- **How it is measured:** Measure ΔVT and Δβ/β on paired-device arrays and take standard deviations; use Kelvin connections to avoid series-resistance error.

### Pelgrom's law

**In one line:** Mismatch standard deviation scales inversely with the square root of area: σ(ΔVT) = AVT/√(WL).

- **What it is:** An empirical model proposed by Pelgrom in 1989 for how random mismatch varies with area and distance.
- **What it tells you:** The exchange rate between precision and area.
- **Bigger vs smaller:** Quadrupling area only halves mismatch, so buying precision with area is expensive.
- **Analogy:** Like coin tossing: more tosses (more area) bring you closer to 50/50, but halving the error takes four times as many tosses.
- **How it is measured:** Measure σ(ΔVT) on pairs of many W×L, plot against 1/√(WL); the slope is AVT.

### AVT / Aβ (matching coefficients)

**In one line:** Slopes of the Pelgrom plot: AVT (mV·µm) for VT mismatch, Aβ (%·µm) for current-factor mismatch.

- **What it is:** σ(ΔVT) = AVT/√(WL); σ(Δβ/β) = Aβ/√(WL).
- **What it tells you:** A process's inherent matching capability, independent of design.
- **Bigger vs smaller:** Smaller is better. About 3.5 mV·µm at 65 nm; early FinFETs about half of bulk; the often-quoted 1–2 mV·µm for advanced nodes has no verifiable public source.
- **Analogy:** Like a machine tool's tolerance: from the same drawing, a tighter tool makes more consistent parts.
- **How it is measured:** Fit the Pelgrom plot; needs large samples (often hundreds of pairs) and Kelvin connections.
- **Typical numbers:** See the matching-coefficient table in guide §4.

### LDE (layout-dependent effects: WPE, LOD, OSE)

**In one line:** Device parameters that change with surrounding layout: distance to well edge, diffusion length, neighbor spacing.

- **What it is:** WPE: implant scattering at the well edge shifts VT; LOD/STI stress: diffusion length changes stress and mobility; OSE: diffusion spacing affects stress.
- **What it tells you:** A main source of systematic mismatch and model error.
- **Bigger vs smaller:** Smaller and more predictable is better. WPE has been reported to shift VT by several to tens of mV; matched devices need identical surroundings.
- **Analogy:** Like a home's price depending not just on floor plan but on floor, orientation and neighbors.
- **How it is measured:** Dedicated test structures place the same device at varied distances to well edges or diffusion ends and measure VT and ID shifts; PDKs model them as LDE parameters.

### Common-centroid and interdigitated layout

**In one line:** Split matched devices into unit cells and interleave them so process gradients cancel; add dummies so every cell sees the same surroundings.

- **What it is:** Arrangements like ABBA or ABAB make the two devices share a centroid.
- **What it tells you:** The layout answer to systematic mismatch (gradients, LDE).
- **Bigger vs smaller:** Not a numeric metric; success shows as near-zero mean offset in matched pairs. FinFET fin and gate-pitch quantization constrain it.
- **Analogy:** Like sharing a pizza that burned on one side: interleave the slices and each person gets the same amount of burnt crust.
- **How it is measured:** Compare mean ΔVT between common-centroid and non-centroid placements.

## Long-channel alternatives

### Stacked gates / series devices

**In one line:** Several minimum-length devices in series, used as one long-channel device.

- **What it is:** When only fixed gate length and pitch are allowed, designers tie N gates together with source/drain in series, emulating roughly N times the length.
- **What it tells you:** A way to raise ro and matching without a true long-channel device.
- **Bigger vs smaller:** More in series gives lower gds and better matching, but internal-node capacitance, area and parasitics grow, and post-layout often disagrees with pre-layout. No public quantitative comparison with a single long-L device was found.
- **Analogy:** Like tying short ropes into a long one: it works, but every knot adds a bit of slack and weight.
- **How it is measured:** At the same bias, compare stacks and single devices on gm/ID, gm/gds, AVT, 1/f noise and Cgg; needs dedicated test structures and post-layout correlation.

### Cascode and gain boosting

**In one line:** Stack another device to shield drain-voltage changes, multiplying output resistance by about gm·ro; gain boosting adds an auxiliary amplifier that multiplies it again by that amplifier's gain.

- **What it is:** A circuit technique: the upper device pins the lower device's drain voltage, so the lower device's gds matters less.
- **What it tells you:** Recovering gain the devices no longer provide.
- **Bigger vs smaller:** Gain can rise by an order of magnitude or more, at the cost of headroom and extra poles.
- **Analogy:** Like adding a second door: however loud outside, the room stays quiet.
- **How it is measured:** Measure output resistance and gain on circuit test structures; at device level check each device's gm/gds and VDS,sat.

### Thick-oxide I/O devices

**In one line:** Thick-oxide, longer-gate devices built for interface voltages, often borrowed by analog for higher voltage and gain.

- **What it is:** Operate at higher voltages such as 1.2–1.8 V with longer gates than core logic devices.
- **What it tells you:** The classic way to get headroom and output resistance in advanced nodes.
- **Bigger vs smaller:** Pros: more headroom, lower gds. Cons: slower, larger, and not necessarily better 1/f or matching. Intel 22FFL thick-oxide devices use Lg 90/120/160 nm versus 74 nm for logic.
- **Analogy:** Like keeping a pickup (I/O device) in the garage next to the sports car (core device): slower, but hauls heavy loads.
- **How it is measured:** The same gm/ID, gm/gds, noise and matching characterization as core devices.

## GAA & frontier

### Nanosheet / GAA (gate-all-around)

**In one line:** The channel is several stacked horizontal sheets wrapped on all sides by the gate; stronger gate control, width set by sheet width.

- **What it is:** The transistor architecture after FinFET (Intel calls it RibbonFET, Samsung MBCFET).
- **What it tells you:** The base of analog in advanced nodes: better electrostatics, harder parasitics, heat and passives.
- **Bigger vs smaller:** Not a single number. For analog: better DIBL and SS mean higher intrinsic gain; 1/f noise matches planar with the same gate stack; parasitic capacitance, gate resistance and self-heating are the new problems.
- **Analogy:** A FinFET is a straw pinched on three sides; a nanosheet is a stack of crackers gripped all around — a firmer grip, but heat in the middle has nowhere to go.
- **How it is measured:** The full FinFET characterization set plus dedicated tests for self-heating, sheet-to-sheet variation and the bottom parasitic channel.

### Sheet width and width quantization (NanoFlex, etc.)

**In one line:** FinFET width comes in whole fins; nanosheets allow sheet-width tuning, but production processes offer a discrete menu.

- **What it is:** For example TSMC N2's NanoFlex allows fractional steps such as ‘1.5 fins’, and Intel 18A offers W1, W1.5, W2, W3, W3P.
- **What it tells you:** Sizing freedom, affecting current ratios, matching and area.
- **Bigger vs smaller:** More options means more flexibility. Wider sheets give more current but also more self-heating and inter-layer temperature difference.
- **Analogy:** Like clothing going from only S/M/L (fin count) to half sizes (fractional widths) — still not tailor-made.
- **How it is measured:** Characterize gm/ID, matching and noise for each width option.

### BDI (bottom dielectric isolation)

**In one line:** A dielectric layer under the nanosheet stack that cuts the parasitic sub-sheet channel and substrate coupling.

- **What it is:** A structure that replaces or supplements the punch-through stopper implant, isolating the sheets from the substrate.
- **What it tells you:** Leakage, parasitic capacitance and substrate-noise isolation.
- **Bigger vs smaller:** With BDI, off-leakage and DIBL fall (IBM reports 18% lower power) and substrate noise coupling drops; the cost is process complexity and slightly worse heat removal.
- **Analogy:** Like soundproofing under a floor: noise from below (substrate) stays out, but the room gets a bit warmer.
- **How it is measured:** Compare leakage, Cgg and S-parameter coupling with and without BDI.

### Self-heating and thermal resistance Rth

**In one line:** Heat the device generates cannot escape, so the channel runs hotter than ambient, cutting current and distorting gds.

- **What it is:** Power × thermal resistance = temperature rise. 3D structures (fins, stacked sheets), low-conductivity dielectrics and thinned substrates all raise thermal resistance.
- **What it tells you:** The device's ability to shed heat, affecting reliability, model accuracy and matching (thermal gradients).
- **Bigger vs smaller:** Lower thermal resistance is better. FinFET thermal time constant ≈ 100 ns with up to ~10% current loss; nanosheets below 10 nm gate length can rise over 100 K; backside power raises peak temperature about 14 °C (simulation).
- **Analogy:** Like running in a down jacket: the faster you run the hotter you get, and the thicker the jacket (higher Rth) the less heat escapes.
- **How it is measured:** Gate-resistance thermometry (four-terminal gates), the RF method (gds versus frequency), pulsed IV; the gap between DC and AC gds is the self-heating signature.

### BSPDN (backside power delivery)

**In one line:** Power lines move to the wafer backside, leaving the front for signals; the substrate is almost entirely removed.

- **What it is:** Intel calls it PowerVia, TSMC Super Power Rail. More front-side routing room and lower supply droop.
- **What it tells you:** For analog: cleaner supplies, but the substrate, guard rings, heat paths and passive-device environment all change.
- **Bigger vs smaller:** Vendors report ~10× lower worst-case droop and 397 fF/µm² MIM; no public data on substrate isolation or inductor Q.
- **Analogy:** Like moving a building's pipes from the ceiling to the basement: more room upstairs, but the foundation is hollowed and grounding must be redone.
- **How it is measured:** Compare noise coupling, thermal resistance, ESD and passive parameters with front versus backside power.

### Forksheet and CFET

**In one line:** Next after GAA: forksheet puts n and p side by side against a dielectric wall; CFET stacks n on top of p.

- **What it is:** Both aim to shrink standard-cell height further. imec targets forksheet at A10 and CFET from A7.
- **What it tells you:** Structural changes analog will face next.
- **Bigger vs smaller:** No public analog data yet; parasitics and heat are expected to get harder and device shapes more constrained.
- **Analogy:** Forksheet is a double bed with a divider; CFET is a bunk bed.
- **How it is measured:** Once silicon exists, reuse the GAA characterization set.

## Measurement & models

### S-parameters and de-embedding

**In one line:** Measure high-frequency reflection and transmission with a VNA, then subtract pads and leads to get the device itself.

- **What it is:** S-parameters convert to Y/Z/h, from which gm, gds, Cgg, fT and fmax are extracted.
- **What it tells you:** High-frequency small-signal behavior, and gds free of self-heating.
- **Bigger vs smaller:** Not a metric itself; better de-embedding means more accurate extraction.
- **Analogy:** Like weighing a cat: weigh yourself holding it, then alone, and subtract (de-embedding).
- **How it is measured:** On-wafer GSG probes and a VNA, with open/short de-embedding structures.

### Kelvin (four-terminal) connection

**In one line:** Separate leads for current and voltage so lead-resistance drop does not corrupt the measurement.

- **What it is:** Force lines carry current; sense lines measure voltage.
- **What it tells you:** Reliability of precision measurements, especially mismatch and high-current devices.
- **Bigger vs smaller:** Not a metric; without it, series resistance masquerades as mismatch.
- **Analogy:** Like putting a thermometer under the tongue rather than over clothing.
- **How it is measured:** Bring out force and sense lines for gate and drain in the test structure.

### PDK and BSIM-CMG

**In one line:** A PDK is the process's package of models and rules for designers; BSIM-CMG is the standard compact model for FinFET/GAA.

- **What it is:** Includes device models, corners, mismatch models, LDE parameters, layout rules and device characterization reports.
- **What it tells you:** The device as designers see it; an inaccurate model means an inaccurate design.
- **Bigger vs smaller:** Not a number; what matters is how well the model fits gm/ID, gds, noise and mismatch.
- **Analogy:** Like a map: if it is wrong, careful driving still gets you lost.
- **How it is measured:** Validate the model against silicon for DC, AC, noise and mismatch.

## Speed & power: drive and Cdyn

### Q: Is it right that more drive and less Cdyn lower delay?

**The direction is right; three qualifications.**


- **Compare drive under controlled conditions:** at the same Ioff and the same footprint (gate pitch, fin or sheet count). Otherwise lower VT or more width simply buys current.
- **Speed is about the I/C ratio, not I or C alone.** Current bought with width brings proportional self-capacitance; widening pays only when wire and fan-out load dominate. The familiar “I-drive versus C” plot is really reading the CV/I slope.
- **The C in delay is not Cdyn.** Delay uses the load capacitance of one path and one transition, C_load; Cdyn is the whole chip's capacitance weighted by switching probability, and it depends on the workload. Cutting parasitics helps both, by different amounts.

### Q: Is Cdyn directly tied to (effective) frequency?

**Not by definition, but in practice through three routes.** Cdyn = (P − P_leak)/(V²·f_eff) already divides out frequency, so ideally it does not change with f.


- **Shared capacitance (direct route):** if the capacitance removed sits on the critical path (process-level low-k, air spacers), delay drops at the same voltage and frequency rises while power stays roughly flat (less C, more f).
- **Power budget (indirect route):** in a power-limited product P is fixed. Lower Cdyn lets you raise voltage for frequency, but you pay V², so the frequency gain is a fraction of the Cdyn cut:
`Δf/f ≈ −(ΔCdyn/Cdyn) / (1 + 2/s)`, where s = d ln f / d ln V is the log slope of the V–F curve. About 1/3 for s≈1, about 1/2 for s≈2 (ignoring leakage; leakage rising with voltage shrinks the gain further). [Inference]
- **Measurement effects:** compute Cdyn with f_eff. Memory-bound programs stall more cycles at high frequency, so Cdyn per cycle falls; short-circuit current and glitches also make measured Cdyn drift with V and f.A public example: on a 3 nm GAA path-finding PDK, an air spacer cut ring-oscillator active power by 30% at iso-speed but raised frequency by only 9% at iso-power (Lee et al., IEEE Access 2022). The same improvement reads about three times larger when quoted as power.

### Q: Is smaller Cdyn always better, and does cutting R and C improve AC performance?

**Half right: Cdyn contains C only, not R.**


- **Cutting C (without hurting drive):** faster and lower power — a double win.
- **Cutting R** (contact, source/drain, wire resistance, IR drop): more drive and speed, but no change in Cdyn.
- **“Smaller is better” has a condition:** the intrinsic channel capacitance Cinv is the “good” capacitance that buys current; cutting it cuts current. Cut the parasitic parts (overlap/fringe, gate-to-contact, wires).
- **R and C often trade:** thicker spacers cut C but raise R; smaller contacts cut C but raise R. The test is a net gain in Ieff/C_load, or in ring-oscillator delay versus Cdyn.

### Q: Does Cdyn cover more than the device — all of the back end too?

**Yes. Product-level Cdyn is a whole-chip quantity:** every capacitance charged each cycle counts, weighted by its toggle rate — intrinsic gate capacitance, overlap and fringe, gate-to-contact and gate-to-epi (MOL), junctions, wires on every metal layer (including coupling), the clock network, SRAM bit lines and more.

Not counted: decoupling capacitors, MIM capacitors and package parasitics — they do not toggle in steady state (though they affect supply noise). Measured Cdyn also picks up short-circuit current and glitches.

Mind the scope: the process-level “Cdyn per stage” from ring oscillators covers only device, MOL and local wire, not the clock network or long wires. To project a process Cdyn gain onto product power, weight it by each part's share.

### Drive current (Idsat, Ion)

**In one line:** How much current a fully-on transistor delivers, usually per µm of width; more drive charges and discharges loads faster.

- **What it is:** Idsat (or Ion) is the drain current at VGS = VDS = VDD, in µA/µm. Processes must be compared at the same off-state leakage Ioff; otherwise lowering VT buys current dishonestly.
- **What it tells you:** The transistor's ability to charge and discharge load capacitance — the denominator of τ ∝ C·V/I.
- **Bigger vs smaller:** Larger is better at the same Ioff and footprint (gate pitch). Current bought with width (more fins, more or wider sheets) brings proportional self-capacitance and only pays when wires and fan-out dominate the load; current from mobility, strain or lower source/drain resistance comes for free.
- **Analogy:** Like a pump's flow rate: a stronger pump fills the bucket (capacitance) faster. But a bigger pump has bigger pipes of its own to fill first.
- **How it is measured:** DC parametric test: sweep ID–VGS at VDS = VDD, read the current at VGS = VDD, using Kelvin connections to remove contact drops; plot Ion versus Ioff and compare at a fixed Ioff (e.g., 1 or 10 nA/µm).

### Ieff (effective drive current)

**In one line:** The average current during an inverter transition, (IH + IL)/2; predicts gate delay better than Idsat.

- **What it is:** Defined by Na et al. (IEDM 2002): IH at VGS = VDD, VDS = VDD/2; IL at VGS = VDD/2, VDS = VDD; Ieff is their average. During a transition the transistor never sits at the single Idsat bias point.
- **What it tells you:** Drive under real switching conditions; sensitive to mid-gate-voltage and linear-region behavior (DIBL, source/drain resistance, mobility degradation).
- **Bigger vs smaller:** Larger is better. The Ieff/Idsat ratio is informative too: devices with high DIBL or poor subthreshold swing lose IL, so Ieff looks worse than Idsat suggests.
- **Analogy:** Like a car's average speed rather than its top speed: on a real trip you rarely sit at top speed.
- **How it is measured:** Compute IH and IL from the same DC sweep, then correlate with ring-oscillator delay to check that Ieff explains the delay shifts.
- **Typical numbers:** [Silicon · research] Na et al. validated with compact models and 90 nm hardware that Ieff predicts inverter delay accurately.

### Gate delay CV/I

**In one line:** One gate's delay ≈ load capacitance × voltage ÷ drive current; the core formula of the speed chain.

- **What it is:** The time to charge (or discharge) load C to about half of VDD: τ ∝ C·VDD/Ieff. C is everything the stage sees: its own drain-side capacitance, the wire and the next gate.
- **What it tells you:** A process's AC performance: how fast circuits run at a given voltage.
- **Bigger vs smaller:** Smaller is faster. Three knobs: raise I, cut C, lower V (but I falls faster than V, so lower V is usually slower). So “more I, less C” holds — provided Ioff and area are held fixed.
- **Analogy:** Filling a bucket with a hose: time = bucket size (C) × fill height (V) ÷ flow (I).
- **How it is measured:** Ring oscillators: measure frequency f; an N-stage ring's per-stage delay is τ = 1/(2N·f); families with different fan-out or metal loads separate C from effective switching resistance.

### Load capacitance (C_load / Ceff) and self-loading

**In one line:** The capacitance a gate actually charges when it switches: its own drain side, the wire and the next stage's input.

- **What it is:** C_load = C_self (own drain-side overlap, fringe and junction) + C_wire + C_fanout (next stages' gates). This is the C in the speed formula — one path, one transition. Ceff usually means the equivalent value integrated as ΔQ/ΔV over the transition.
- **What it tells you:** How heavy a load the stage carries — and whether upsizing the device is worth it.
- **Bigger vs smaller:** Smaller is faster. The higher the self-loading share, the less upsizing helps: current and self-capacitance grow together, delay barely moves and power rises; upsizing helps only when wire and fan-out load dominate.
- **Analogy:** Like moving house: when the boxes (external load) are heavy, a stronger mover helps; when the burden is mostly the mover's own weight (self-loading), strength buys little.
- **How it is measured:** Compare FO1/FO3/FO4 ring oscillators, or one driver with different metal loads, and difference frequency and current; parasitic extraction (PEX) gives per-net capacitance from layout.

### Cdyn (dynamic capacitance)

**In one line:** The capacitance charged and discharged per clock cycle on average: Cdyn = dynamic power ÷ (V²·f); the core of the power chain.

- **What it is:** Cdyn = Σ αᵢ·Cᵢ: every node's capacitance times its per-cycle switching probability α, summed. In practice it is backed out as Cdyn = (P_total − P_leak)/(V²·f_eff). It belongs to chip plus workload: the same chip has a different Cdyn on each program.
- **What it tells you:** How much charge each cycle of work moves. It strips voltage and frequency out of power so processes and designs can be compared across V and f.
- **Bigger vs smaller:** Smaller is better for the same work: power falls proportionally at the same V and f, or the budget buys higher voltage and frequency. But a low Cdyn can also mean the chip is idling (low α, low IPC), so normalize per instruction or per unit of work.
- **Analogy:** Like the wattage of lights switched per hour in a building: more lamps (C) or more frequent switching (α) spin the meter faster; it is booked separately from the tariff (V²) and opening hours (f).
- **How it is measured:** Product level: run representative workloads at fixed V and f, measure supply current, subtract leakage at the same temperature (e.g., with clocks stopped), then divide by V²·f_eff. Process level: (IDDA − IDDQ)/(VDD·f) on a ring oscillator gives Cdyn per stage. During design, estimate from PEX plus gate-level toggle rates.
- **Typical numbers:** [Silicon · research] 0.13 µm processor (77 M transistors): interconnect >50% of dynamic power, gate capacitance ~34%, diffusion the rest; clock nets ~40% (Magen et al., SLIP 2004).

### Activity factor α (toggle rate)

**In one line:** The probability a node completes a charge–discharge each clock cycle; α = 1 for clocks, on the order of 0.1 for ordinary logic.

- **What it is:** The α in Cdyn = Σ α·C. Two conventions exist (counting 0→1 transitions only, or all transitions), so compare like with like. It depends on circuit structure, data and the program.
- **What it tells you:** How much of the capacitance actually moves — and the main design-side lever on Cdyn (clock gating, operand isolation, fewer glitches).
- **Bigger vs smaller:** Lower saves power for the same work; but a low α because the core is waiting on memory is idling, not efficiency.
- **Analogy:** A building may have many lamps (C), but the fraction actually switched each hour (α) sets the bill.
- **How it is measured:** Simulation: count toggles per net in gate-level or RTL simulation (SAIF/VCD files). Silicon: divide measured Cdyn by total capacitance for an average α; on-chip activity counters estimate it in real time.
- **Typical numbers:** [Textbook] Clocks α = 1 (one full charge–discharge per cycle); random-data logic is on the order of 0.1.

### Dynamic power P = Cdyn·V²·f (incl. short-circuit power)

**In one line:** Each switch costs C·V², f times a second: P = Cdyn·V²·f, plus short-circuit current while pull-up and pull-down conduct together.

- **What it is:** Charging a capacitor draws C·V² from the supply: half is stored, half burned in the pull-up; discharging burns the stored half in the pull-down. Total power = dynamic + short-circuit + leakage. Short-circuit and glitch power are not capacitance, but they land in measured Cdyn.
- **What it tells you:** Power grows with V² and linearly with f. Lowering voltage saves the most; raising frequency costs the most, because it usually needs more voltage too.
- **Bigger vs smaller:** Lower is better. Climbing the V–F curve raises voltage too; if frequency is roughly proportional to voltage, power grows roughly like f³.
- **Analogy:** Like inflating and releasing a balloon over and over: each fill holds air ∝ C·V at a pressure ∝ V, so each cycle costs ∝ C·V², f times a second.
- **How it is measured:** Measure total current at several (V, f) points; stop the clocks to measure and subtract leakage; plot the remaining power against V²·f — the slope is Cdyn. Short-circuit power can be estimated with ring oscillators that vary input slew.

### Effective frequency f_eff

**In one line:** The average frequency a core actually ran over an interval: reference frequency × (ΔAPERF/ΔMPERF), counting active (C0) time only.

- **What it is:** Modern CPU clocks shift constantly with load, temperature and power limits (turbo, throttling, sleep states). MPERF counts at the reference frequency in C0, APERF at the actual frequency; the ratio of their increments times the reference frequency is the interval's effective frequency.
- **What it tells you:** The f to divide by when turning measured power into Cdyn — and a measure of how fast the product actually ran.
- **Bigger vs smaller:** Higher means more time at high clocks. Use f_eff when computing Cdyn: dividing by the nominal frequency while the part throttles understates Cdyn, and folding in sleep time understates it further.
- **Analogy:** Like a car's average speed: the sign shows the limit, but the truth is distance ÷ driving time (parked time excluded).
- **How it is measured:** Read the APERF/MPERF counters (shown by Linux turbostat, cpupower and similar tools) and align them with the supply-current measurement window.

### V–F curve and Vmin

**In one line:** The highest stable frequency at each voltage; the hinge between the drive chain and the Cdyn chain.

- **What it is:** Higher voltage gives more Ieff, shorter gate delay and higher achievable frequency; Vmin is the lowest functional voltage. DVFS moves the operating point along this curve.
- **What it tells you:** Drive/C sets where the curve sits (how fast at a given voltage); Cdyn sets the power cost at each point on it.
- **Bigger vs smaller:** The further up and left, the better (high frequency at low voltage). The log slope s = d ln f / d ln V decides how much frequency a Cdyn saving buys: larger s turns the same power headroom into more frequency.
- **Analogy:** Like pedal force versus speed on a bike: push harder (V) and you go faster, but effort (power) climbs with the square of the force.
- **How it is measured:** Shmoo testing: run test patterns on a (V, f) grid and record the pass/fail boundary; products track it with on-die monitors (ring oscillators, critical-path replicas).

### Iso-power vs iso-frequency comparisons

**In one line:** Two ways to quote a node's gain: how much faster at the same power, or how much less power at the same frequency; the second percentage is usually much larger.

- **What it is:** The same transistor and capacitance gains can be cashed in as frequency or as power. Since power scales with V², lowering V at iso-frequency saves a lot, while raising frequency at iso-power pays the V² toll, so the frequency gain in percent is smaller.
- **What it tells you:** It translates drive and Cdyn improvements into product terms — and is the yardstick for whether a change is worth it.
- **Bigger vs smaller:** Larger is better for both, but never compare one node's iso-power number with another's iso-frequency number — and check which voltage it was quoted at.
- **Analogy:** Like a lighter car: same fuel, a bit faster; or same speed, a lot less fuel — the fuel saving always looks bigger.
- **How it is measured:** Implement the same design or block on both nodes, sweep V–F and power, plot frequency versus power, and read the difference at the same power or the same frequency.
- **Typical numbers:** [Silicon · research] On a 3 nm GAA path-finding PDK, an air spacer (k 7→3.3) cut a 9-stage FO1 ring oscillator's active power by 30% at iso-speed but raised frequency by only 9% at iso-power (Lee et al., IEEE Access 2022). [Vendor] As reported by Tom's Hardware, Intel 18A versus Intel 3: 36% lower power at iso-frequency at 1.1 V, 18% faster at 0.75 V.

### Ring oscillator (RO)

**In one line:** An odd chain of inverters looped into self-oscillation; measuring frequency and current together yields gate delay and Cdyn per stage.

- **What it is:** An N-stage ring's period is 2N gate delays: τ = 1/(2N·f). Oscillating supply current IDDA minus the stopped current IDDQ is the switching current, so per-stage capacitance is C = (IDDA − IDDQ)/(N·VDD·f).
- **What it tells you:** The yardstick for a process's AC performance: speed (τ), capacitance (C) and their trade-off on one structure.
- **Bigger vs smaller:** Smaller τ is faster, smaller C is thriftier; plots of delay versus Cdyn per stage, or delay versus power, are better toward the lower left. A τ cut bought with more C (e.g., wider devices) is not necessarily a win.
- **Analogy:** Like a whisper passed around a circle: the round time tells you each person's reaction speed; the total effort tells you how loudly each had to shout.
- **How it is measured:** On-chip ROs with divided outputs for frequency; measure supply current oscillating and stopped (enable off). Families with different fan-out, metal loads and stacks split C into gate, diffusion and wire parts (Bhushan et al., IEEE TSM 2006).

### Intrinsic gate capacitance (Cinv / channel capacitance)

**In one line:** The part of gate capacitance that couples to the channel's inversion charge — the “good” capacitance that buys drive current.

- **What it is:** Cinv ≈ ε / EOT(inv) × gate length × effective width. Channel charge Q = Cinv·(VGS − VT), and current ≈ charge × velocity, so no Cinv means no current.
- **What it tells you:** How firmly the gate controls the channel — and the only part of the device's own Cdyn that pays a return.
- **Bigger vs smaller:** Not smaller-is-better: cutting it (e.g., thicker EOT) cuts drive with it. The parasitic part is what to cut. Judge a process by I/C, not C alone.
- **Analogy:** Like a pump's impeller: bigger means more flow but more effort to spin up; remove it and there is no pump.
- **How it is measured:** C–V on large-area structures (split C–V separates the gate-to-channel part); extrapolate across several gate lengths to remove short-channel parasitics.

### Overlap and fringe capacitance (Cov, Cof, Cif) and the Miller effect

**In one line:** Gate-to-source/drain parasitics that carry no current; the gate–drain share counts roughly double during switching.

- **What it is:** Cov: gate overlap with source/drain extensions; Cof: outer fringe from the gate sidewall through the spacer to source/drain; Cif: inner fringe from the gate bottom to source/drain. Gate and drain swing in opposite directions, so Cgd sees a 2·VDD change and counts about double (Miller effect).
- **What it tells you:** The FEOL's wasted charge; it also adds to the self-load at the drain.
- **Bigger vs smaller:** Smaller is better, with trade-offs: less overlap (or underlap) raises source/drain resistance and cuts drive; thicker spacers cut C but add R. Judge the net Ieff/C.
- **Analogy:** Like seams in a pump housing: they pump no water but must fill on every stroke.
- **How it is measured:** Off-state (VGS < VT) C–V of Cgd and Cgs gives overlap plus fringe; extrapolate across gate lengths; TCAD separates the pieces.
- **Typical numbers:** [Silicon · research] IBM, AMD and Toshiba's 22 nm FinFET AC analysis: the extra FinFET gate-to-S/D parasitic costs 5–19% in inverter delay, depending on fin pitch and height.

### Gate-to-contact and gate-to-epi capacitance (MOL parasitics)

**In one line:** Capacitance between the gate and the adjacent source/drain epi and contacts; once gate pitch shrinks it is one of the largest device parasitics.

- **What it is:** The gate and the source/drain trench contact are parallel conductors a few nanometers apart, separated only by spacer and liner. Each gate-pitch shrink enlarges this parallel-plate capacitance.
- **What it tells you:** How good the MOL structure is — and a common reason a shrink fails to get faster.
- **Bigger vs smaller:** Smaller is better. Knobs: spacer dielectric constant (low-k, air spacer), contact height and width, self-aligned contacts. The usual costs are contact resistance and reliability.
- **Analogy:** Like two buildings built too close: the taller and tighter, the more they interfere; an air gap between them isolates better than concrete.
- **How it is measured:** Dedicated comb gate-to-contact capacitor structures for C–V; ring oscillators comparing spacer options; calibrated layout parasitic extraction.
- **Typical numbers:** [Silicon · research] IBM integrated an air spacer with self-aligned contacts and contact-over-active-gate (COAG), measuring a 15% Ceff reduction (VLSI 2020). In a 3 nm GAA path-finding PDK study, MOL and BEOL RC accounted for over 60% of circuit degradation (Lee et al., IEEE Access 2022).

### Junction / diffusion capacitance (Cj)

**In one line:** Depletion capacitance of the source/drain-to-substrate (or well) junction; it charges with every drain transition.

- **What it is:** In planar devices large source/drain diffusions made Cj a big part of self-load; FinFET and nanosheet S/D epi sits on narrow fins or isolation with far less junction area, and BDI cuts the bottom further.
- **What it tells you:** Part of the drain self-load; it shrinks as reverse bias grows.
- **Bigger vs smaller:** Smaller is better. On a 0.13 µm processor diffusion was the small remainder after gate capacitance (~34%) and interconnect (>50%); its share is lower still in FinFET/GAA.
- **Analogy:** Like a small bulge at a pipe joint that must fill every time pressure changes.
- **How it is measured:** C–V on large-area diode structures; ring oscillators with varied NFET stack height separate diffusion capacitance (Bhushan et al.).

### Interconnect (BEOL wire) capacitance

**In one line:** Metal lines' capacitance to the layers above and below and to neighbors; often the largest piece of a chip's Cdyn.

- **What it is:** Capacitance to layers above and below plus line-to-line coupling. Effective coupling depends on the neighbors: quiet ≈ 1×, switching the same way ≈ 0, switching the opposite way ≈ 2× (Miller factor).
- **What it tells you:** Routing density, dielectric material and routing quality.
- **Bigger vs smaller:** Smaller is better, cutting both delay and Cdyn. Knobs: low-k and ultra-low-k dielectrics, air gaps, wider spacing, shorter wires (better placement or 3D stacking). Costs: mechanical strength, reliability and area.
- **Analogy:** Like a city's roads: the denser the grid, the more traffic (signals) interferes; medians (low-k, air gaps) keep adjacent lanes apart.
- **How it is measured:** Comb–serpentine structures for line-to-line capacitance; ring oscillators with metal loads; BEOL statistical models and PEX correlated to silicon.
- **Typical numbers:** [Silicon · research] In a 0.13 µm processor interconnect took >50% of dynamic power, with ~90% of it in ~10% of the nets; power-aware wire spacing saved 14% of dynamic power on average (Magen et al., SLIP 2004). [Vendor] Intel 18A's front-side metal RC is reported ~12% better than Intel 3.

### Clock network (clock tree)

**In one line:** The network that delivers the clock to every flip-flop; it switches every cycle (α = 1) and is a major Cdyn consumer.

- **What it is:** A global grid or tree, local buffers and flip-flop clock pins. Unlike data nets, its activity factor is fixed at 1, with long wires and many buffers.
- **What it tells you:** Design-side baseline Cdyn: the clock burns power even when no useful work happens.
- **Bigger vs smaller:** Smaller is better. Clock gating stops the clock to idle blocks — one of the most effective Cdyn reductions.
- **Analogy:** Like a building-wide PA system: every floor plays whether or not anyone listens; switch off the empty floors and you save power.
- **How it is measured:** Cdyn measured on an idle workload (little data activity) approximates the clock plus always-on logic; in design, clock-tree synthesis reports the clock capacitance.
- **Typical numbers:** [Silicon · research] In a 0.13 µm processor clock nets took ~40% of dynamic power (local ~29%, global ~13%) while being ~1% of nets and ~4% of routing length (Magen et al., SLIP 2004).

### Interconnect resistance and RC delay (incl. resistive shielding)

**In one line:** Wire resistance slows signals along the line; it is not part of Cdyn, but with capacitance it sets wire delay.

- **What it is:** Long-wire delay ≈ 0.4·R_wire·C_wire (distributed RC) + driver resistance × total capacitance. Resistance also shields far-end capacitance: the driver sees less than the total, yet total delay still grows with resistance. Power-grid resistance causes IR drop, reducing the voltage and drive the transistor actually gets.
- **What it tells you:** Thinner, longer wires mean more resistance; at advanced nodes resistance rises faster than capacitance.
- **Bigger vs smaller:** Smaller is better, but lower R does not lower Cdyn. Cutting RC helps AC performance; cutting Cdyn is about C. Backside power (BSPDN) cuts IR drop and frees front-side routing, helping on both counts.
- **Analogy:** Like a long, thin hose: the thinner and longer it is, the slower water reaches the far end; the bucket (capacitance) is unchanged, but filling takes longer.
- **How it is measured:** Four-terminal Kelvin measurement of line and via-chain resistance; long-wire ring oscillators or delay chains for wire delay; on-die voltage monitors for IR drop.
- **Typical numbers:** [Textbook] A distributed RC line's 50% delay is ≈ 0.38·R·C (Elmore gives 0.5·R·C). [Vendor] Intel 18A's PowerVia backside power is reported to cut worst-case voltage droop by up to 10× versus Intel 3.

