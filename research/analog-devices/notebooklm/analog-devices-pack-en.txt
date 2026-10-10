# Analog device study pack (for Gemini Notebook / NotebookLM)

Source: timememo.net/research/analog-devices/. This pack combines six parts: (1) the study plan (7 sessions); (2) analog circuit fundamentals (current mirrors, main blocks, analog IP); (3) the Q&A (speed, VT and flicker noise); (4) the main guide; (5) gain and noise tricks; (6) the glossary. Figures are reduced to their captions; see the website for the images. Everything is summarized from public material; [Inference] marks the author's judgment, and [TCAD] or [Silicon · research] numbers do not represent production processes.


---

# Study plan: seven sessions to read analog devices

Seven sessions of 40–50 minutes each — one a day, or one every other day. Each session has three steps: read 2–5 sections on this site (already summarized; no original papers needed), work through 4 self-test cards, then do a 10-minute exercise. Tick all three and the session is done. Progress is saved only in this device's browser.

## Session 1: The map: how analog and logic see the same transistor (40 min)

**Goal:** See why analog judges a device by small-signal ratios at a bias point, and learn the four core metrics and the cost each one stands for.

**Sections to read:**
- Basics: Overview: the building-block map of analog circuits
- Basics: Current mirrors: the "current copier" of analog circuits
- Q&A: Q0. What are analog circuits really after?
- Guide: Big-picture map
- Guide: The shift in evaluation paradigm: from "switch" to "amplifier at a bias point"
- Guide: Key metrics quick reference: definitions, focus and extraction methods
- Term: gm/ID (transconductance efficiency)

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
- Q&A: Q3. From bulk to FinFET to nanosheet, does flicker noise get better or worse?
- Q&A: Q2. Does lower VT make flicker noise worse?
- Tricks: Process knobs: public evidence at a glance
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
- Basics: How to draw the layout: make both transistors "see the same world"
- Basics: What the layout looks like
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
- Q&A: Q1. Is speed about the I/C ratio?
- Q&A: Q5. How to speed up when the data rate falls short: easy, medium and hard tiers
- Term: Cdyn (dynamic capacitance)
- Term: V–F curve and Vmin
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

# Analog circuit basics: current mirrors, main blocks, and analog IP

Analog circuits are built up layer by layer from a few transistor-level "building blocks." The bottom layer holds current mirrors, differential pairs, and single-transistor amplifiers. Above that sit op-amps/OTAs, comparators, references, and LDOs. Above those are subsystems such as PLLs, ADCs/DACs, and SerDes, which finally enter the SoC as "analog IP." The current mirror is the most widely used of these blocks. It "copies" a reference current to other places in proportion to W/L (in FinFET, fin count × finger count), so bias distribution, active loads, current-steering DACs, and charge pumps all depend on it. Every current-mirror variant trades voltage headroom for output resistance. Two kinds of error limit its accuracy: systematic error from unequal VDS, and random VT/β mismatch (Pelgrom). Layout (unit cells, common centroid, dummies, same orientation) therefore matters as much as the schematic. At the SoC level, almost every chip needs a set of "foundation analog IP": PLL, oscillator, bandgap, LDO, POR, PVT sensors, I/O with ESD, and OTP. SerDes, DDR PHY, UCIe, and high-precision ADCs/DACs are added as the product requires. Digital IP usually ships as synthesizable RTL. Analog IP is a GDS hard macro tied to one PDK. Moving it to a new node mostly means redesign, new layout, and new silicon validation, so it often sits on the critical path to new-node readiness. This page covers only "what it is, why it is used, and what it looks like." It does not cover the device physics of gain, noise, and mismatch: see the main guide for device metrics and the techniques page for ways to raise gain and cut noise.

## Overview: the building-block map of analog circuits

**Start with the map: each layer is built from the blocks of the layer below, and each layer has its own metrics to watch.**

Key points:
- The layers, from bottom to top: devices → transistor-level primitives → circuit blocks → mixed-signal subsystems → analog IP in the SoC.
- Moving up, the metrics shift from "device parameters" (gm/ID, gm·ro, AVT) to "system parameters" (jitter, ENOB, BER, PSRR).
- Evidence tags: [Textbook] textbook or general knowledge; [Silicon · research] measurements on research devices or research circuits; [Silicon · production platform] production process data; [TCAD] device simulation; [Simulation] circuit or layout simulation; [Vendor] vendor or foundry material and press releases; [Opinion] industry interviews; [Inference] this page's own reasoning.

| Layer | Typical blocks | What it does | Main metrics | Section on this page |
|---|---|---|---|---|
| Devices | MOSFET (planar / FinFET / GAA), BJT/diode, resistor, MOM/MIM capacitor, inductor | Provide transconductance, output resistance, matching, passives | gm/ID, gm·ro, fT, AVT, 1/f noise, resistor temperature coefficient, inductor Q | §1, §7; see the main guide |
| Transistor-level primitives | Current mirror, differential pair, common-source / common-gate / common-drain single transistor | Copy current, amplify a difference, amplify or buffer | Rout, headroom, ratio error; offset, CMRR; gain, bandwidth | §1, §2 |
| Circuit blocks | OTA / op-amp, comparator, bandgap, current reference, LDO | Amplify, decide, generate stable voltages and currents, regulate | Gain, GBW, phase margin; offset, speed; temperature drift; dropout, PSRR | §2, §3 |
| Mixed-signal subsystems | PLL / DLL, oscillator, ADC, DAC | Generate clocks; convert between analog and digital | Jitter, spurs, lock time; ENOB, SNR, SFDR, INL/DNL | §4, §5 |
| Interface, protection, and monitoring | SerDes, DDR/HBM PHY, UCIe, I/O, ESD, temperature and voltage sensors | High-speed chip-to-chip links; external interfaces; electrostatic protection; health monitoring | BER, eye diagram, pJ/bit; HBM/CDM rating; temperature accuracy | §7, §8 |
| Analog IP in the SoC | Power tree, clock tree, PHY, sensing and security blocks | Delivered and integrated as hard macros | Silicon-proven or not; available on the node or not; complete deliverables or not | §8, §9 |

## 1. Current mirrors: the "current copier" of analog circuits

**A current mirror lets a diode-connected transistor turn a reference current into a gate-source voltage, then lets other transistors that share this voltage copy the current in proportion to their size; it appears in almost every analog block, because analog bias, loads, and many data converters all run on "precise currents."**

Key points:
- The ideal ratio is I_OUT = I_REF·(W/L)₂/(W/L)₁ ([TAMU ECEN474 L8](https://people.engr.tamu.edu/spalermo/ecen474/lecture08_ee474_current_mirrors.pdf)) [Textbook]. In FinFET, "W" becomes fin count × finger count ([Tech Design Forums](https://www.techdesignforums.com/practice/?p=5259)) [Opinion].
- The main variants all make the same trade: spend more voltage headroom to get higher output resistance Rout. A simple mirror has Rout ≈ ro, a cascode about gm·ro², and a regulated cascode about A·gm·ro² ([TAMU L8](https://people.engr.tamu.edu/spalermo/ecen474/lecture08_ee474_current_mirrors.pdf); [UTK ECE532 L06](https://web.eecs.utk.edu/~bblalock/ece532/lecture_06.pdf)) [Textbook].
- There are two kinds of error. Systematic error comes mainly from unequal VDS on the two transistors plus channel-length modulation (CLM). Random error comes from VT and β mismatch, σ(ΔVT) = AVT/√(WL) ([Pelgrom et al. 1998](https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf)) [Silicon · research].
- Current matching in a mirror improves at higher overdrive. This is the opposite of voltage offset in a differential pair [Inference].
- Layout requires devices that are "identical in geometry, orientation, bias, and temperature" ([Pelgrom et al.](https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf)). In practice this means unit cells, interdigitation, common centroid, dummies, and same orientation ([Pulsic](https://pulsic.com/?p=1)) [Vendor].
- FinFET/GAA quantizes width, and L is essentially fixed. Ratios can only come from integer numbers of identical units, LDE becomes more complex, and planar layouts mostly have to be redrawn ([Tech Design Forums](https://www.techdesignforums.com/practice/?p=5259)) [Opinion].

### Principle: turn current into voltage, then voltage back into current

[Textbook] The definition of a current mirror is direct: control the current in one device so that it copies the current in another device, as independent of the load as possible. Ideally it is a "current-controlled current source" ([Wikipedia: Current mirror](https://en.wikipedia.org/wiki/Current_mirror)).

The simplest MOS current mirror has only two transistors. M1 has its gate and drain shorted, which is called "diode-connected." The reference current I_REF is forced into M1, and M1, in saturation, settles at the V_GS that makes its drain current exactly equal to I_REF. This step "translates" current into voltage. M2's gate connects to the same node, so its V_GS equals M1's. As long as M2 is also in saturation and the two transistors match, M2's current equals I_REF. This step "translates" voltage back into current ([Wikipedia: Current mirror](https://en.wikipedia.org/wiki/Current_mirror)).

[Figure: Simple NMOS current mirror: VDD drives a reference current IREF through a resistor into M1. Note that M1's gate and drain are tied together (diode connection) and M2 shares M1's gate, so both transistors have the same VGS; IOUT flows into M2's drain, which connects to a voltage source VOUT (representing the load)]

When the two transistors differ in size, the current scales with size: I_OUT = I_REF·(W/L)₂/(W/L)₁ ([TAMU L8](https://people.engr.tamu.edu/spalermo/ecen474/lecture08_ee474_current_mirrors.pdf)). Wikipedia notes that the output current is linear in W, so changing the width is enough to get an integer multiple of I_REF ([Wikipedia: Current mirror](https://en.wikipedia.org/wiki/Current_mirror)). In real circuits, one diode-connected transistor often drives several output transistors, and each output copies the current at its own ratio.

It differs from an ideal current source in four ways ([Wikipedia: Current mirror](https://en.wikipedia.org/wiki/Current_mirror)):
- Its AC output impedance is finite; Rout is not infinite.
- It works only within its "compliance range." If the output voltage is too low, the output transistor drops out of saturation.
- Parasitic capacitance limits its frequency response.
- It is sensitive to noise, supply, and process tolerances.

For people who know logic, one way to see it [Inference]: logic looks at two states of a transistor, on and off. A current mirror keeps the transistor parked at a bias point in saturation and relies on one physical relation: "the same V_GS gives the same current." So any process factor that makes two transistors carry different currents at the same V_GS turns directly into mirror error: VT offset, mobility difference, stress difference, and different VDS.

### Why it is everywhere: analog circuits work with currents

[Textbook] A current mirror has two basic uses: supplying bias current and acting as an active load ([Wikipedia: Current mirror](https://en.wikipedia.org/wiki/Current_mirror)). Biasing with a current mirror also reduces the circuit's sensitivity to VDD, VT, and μCox ([TAMU L8](https://people.engr.tamu.edu/spalermo/ecen474/lecture08_ee474_current_mirrors.pdf)). In more detail:

| Use | What the mirror does there | What sets accuracy | Evidence |
|---|---|---|---|
| Bias distribution | One master reference current fans out to many mirrors across the chip to bias each block | Ratio error; IR drop over long distribution | [Inference] Long-distance distribution usually uses current rather than voltage, to avoid errors from ground drops |
| Active load | Load for differential pairs and OTAs; replaces resistors and raises single-stage gain to the order of gm·ro | Rout (sets gain); matching of the two sides (sets offset) | Common-source gain with a current-source load = −gm1/(go1 + go2) ([TAMU L8](https://people.engr.tamu.edu/spalermo/ecen474/lecture08_ee474_current_mirrors.pdf)) [Textbook] |
| Tail current source | Tail current for differential pairs and comparators | Rout (sets CMRR) | [Textbook] |
| Current-steering DAC | Each unit current source is a mirror output transistor | Unit-to-unit matching sets INL/DNL | Pelgrom area scaling and parallel units are used for IDACs, at the cost of area and capacitance ([Sheikholeslami, IEEE SSC Magazine](https://www.eecg.utoronto.ca/~ali/papers/mag-win-15-process-variation.pdf)) [Textbook] |
| PLL charge pump | The UP and DN currents come from mirrors | UP/DN mismatch | [Inference] Mismatch causes static phase offset and reference spurs |
| Self-biased current reference | A PMOS mirror and an NMOS mirror connected in a loop (beta multiplier) | Insensitive to supply, but needs a start-up circuit | ([US 7,755,419](https://patents.google.com/patent/US7755419)) [Vendor] |

Current mirrors appear in the schematics of every later section: the five-transistor OTA in §2 has two, the CMOS bandgap in §3 has a PMOS mirror, and the charge pump in §4 and the current-steering DAC in §5 are themselves arrays of current mirrors.

### Variants: trading voltage headroom for output resistance

**Why variants exist.** [Textbook] A simple mirror has an Rout of only ro. When the output voltage changes, the output current follows (this is CLM). This lowers amplifier gain and causes ratio error. Every way to raise Rout either "stacks" another transistor on top of the output transistor or adds feedback. The cost is a higher minimum voltage at the output, i.e., headroom. At advanced nodes around 1 V, headroom is the scarcest resource (see the techniques page for the gain-headroom trade-off).

The real schematic below puts four NMOS mirrors side by side, each with a 50 µA bias source and labeled device sizes. It comes from an open-source analog design course and uses IHP SG13G2 130 nm devices.

[Figure: Real xschem schematic from an open-source course (IHP SG13G2 130 nm devices): four NMOS current mirrors side by side, labeled Basic, Cascoded, Regulated, and Degenerated current mirror, each driven by a 50 µA bias source. Note the printed device sizes (e.g., W=10u L=5u): for matching and output resistance, the design uses long-channel devices much larger than minimum size; the Degenerated column has resistors in series with the sources]

| Variant | Rout (order) | Minimum output voltage (headroom) | Pros | Cons | Source |
|---|---|---|---|---|---|
| Simple mirror | ≈ ro | ≈ V_DSAT, about 0.1–0.4 V | Simplest; least headroom | Low Rout; CLM error when the two VDS differ | [TAMU L8](https://people.engr.tamu.edu/spalermo/ecen474/lecture08_ee474_current_mirrors.pdf)[Textbook] |
| Cascode (self-biased) | ≈ gm·ro² | ≈ VT + 2V_OV; about 0.9–1.5 V in the lecture's example process | High Rout; VDS of the lower pair aligns automatically | Costs one extra VT of headroom | [TAMU L8](https://people.engr.tamu.edu/spalermo/ecen474/lecture08_ee474_current_mirrors.pdf)[Textbook] |
| Wide-swing / low-voltage cascode | ≈ gm·ro² | ≈ 2V_DSAT | Keeps Rout while saving one VT; common in designs below about 3 V | Needs a separate cascode bias voltage, which must be set accurately | [TAMU L8](https://people.engr.tamu.edu/spalermo/ecen474/lecture08_ee474_current_mirrors.pdf); [UTK L06](https://web.eecs.utk.edu/~bblalock/ece532/lecture_06.pdf); [Wikipedia: Wilson](https://en.wikipedia.org/wiki/Wilson_current_mirror)[Textbook] |
| Wilson (3-transistor / 4-transistor) | MOS version ≈ gm·ro²/2 | ≈ VT + 2V_OV; about 2V_GS at the input, rising with √I | Raises Rout through negative feedback; the 4-transistor version aligns VDS | High input and output voltages; hard to use below 3 V | [Wikipedia: Wilson](https://en.wikipedia.org/wiki/Wilson_current_mirror); [UTK L06](https://web.eecs.utk.edu/~bblalock/ece532/lecture_06.pdf)[Textbook] |
| Regulated (gain-boosted) cascode | ≈ (1 + A)·gm·ro², up to tens to hundreds of GΩ | ≈ V_GS + V_DSAT | Highest Rout | Extra amplifier: area, power, stability; the simple version does not guarantee equal VDS on both sides | [TAMU L8](https://people.engr.tamu.edu/spalermo/ecen474/lecture08_ee474_current_mirrors.pdf); [UTK L06](https://web.eecs.utk.edu/~bblalock/ece532/lecture_06.pdf)[Textbook] |
| Source degeneration | ≈ ro·(1 + gm·R_S) | ≈ V_DSAT + I·R_S | Lower sensitivity to VT mismatch | Costs I·R of headroom; accuracy now depends on resistor matching | [Wikipedia: Current mirror](https://en.wikipedia.org/wiki/Current_mirror); Rout formula [Textbook] |

Notes:
- The PDF text extraction of the lecture garbles the cascode minimum-voltage formula. The table uses the standard textbook result VT + 2V_OV.
- Some Wilson and regulated-cascode formulas in the UTK lecture are also garbled in extraction. The table gives only orders of magnitude.
- The output voltage floor of a self-biased cascode is "V_GS + V_DSAT." A wide-swing cascode uses an extra bias to push the lower transistor to the edge of saturation (VDS ≈ V_DSAT), which saves one VT ([TAMU L8](https://people.engr.tamu.edu/spalermo/ecen474/lecture08_ee474_current_mirrors.pdf)).

[Figure: NMOS cascode current mirror (no text labels in the figure): four NMOS transistors in a 2×2 stack, with a resistor from the supply setting the reference current. Note that both transistors in the left reference branch are diode-connected; on the right, an extra cascode transistor sits above the output transistor, and the output leaves at the top right. This is where Rout rises from ro to about gm·ro²]

**History and features of the Wilson mirror.** [Textbook] George R. Wilson of Tektronix proposed it in 1967, prompted by a "challenge" from Barrie Gilbert. It raises output impedance with negative feedback rather than degeneration. The BJT version has about 50 times the output impedance of a simple mirror. The improved 4-transistor version adds one more diode-connected transistor so that the matched pair has equal VDS, which removes the first-order CLM error ([Wikipedia: Wilson current mirror](https://en.wikipedia.org/wiki/Wilson_current_mirror)).

[Figure: NMOS Wilson current mirror (no text labels in the figure): three NMOS transistors, with a resistor from the supply setting the reference current. Note the feedback connection between the output transistor at the top right and the pair below: the Wilson mirror uses this negative feedback to hold the output current steady]

**The idea of the regulated cascode.** [Textbook] An amplifier senses the drain voltage of the lower transistor and drives the gate of the cascode transistor to pin that voltage. Rout is then multiplied by the amplifier gain A. In the MOS version, Rout keeps rising with A. In the BJT version, β limits it and sets a ceiling ([Wikipedia: Current mirror](https://en.wikipedia.org/wiki/Current_mirror)).

[Figure: Four-transistor NMOS current mirror with a feedback amplifier: the amplifier A(V1−V2) forces the drain voltages V1 and V2 of the lower transistors M3/M4 to be equal. Note that the amplifier output drives the gate of the upper transistor; this is the core of the regulated / gain-boosted mirror. The figure labels Iref, Iout, VDD, VA, and M1–M4]

Wide-swing cascode patents were still being granted in 2006 and 2013, which shows that industry keeps using it ([US 8,450,992](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/8450992); [US 7,012,415](https://patents.google.com/patent/US7012415)) [Vendor].

### Where the error comes from: systematic error, random mismatch, and environment differences

**Type 1: unequal VDS plus CLM, a systematic error.** [Textbook] The current in saturation is not perfectly flat. Higher VDS shortens the effective channel and raises the current. The diode-connected M1 has a VDS equal to its V_GS, while M2's VDS is set by the load, so the two are generally unequal. The error is about λ₂V_DS2 − λ₁V_DS1. There are two remedies: make the two VDS equal (the cascode and the 4-transistor Wilson do this), and use long devices, because the error falls roughly as 1/L ([TAMU L8](https://people.engr.tamu.edu/spalermo/ecen474/lecture08_ee474_current_mirrors.pdf)). Wikipedia also warns that the simple λ·VDS model is accurate only for "rather old" processes, and that λ should generally be taken from measured data ([Wikipedia: Current mirror](https://en.wikipedia.org/wiki/Current_mirror)).

[Figure: SPICE model curves from the SkyWater SKY130 PDK: Ids–Vds family for sky130_fd_pr__nfet_01v8 at the tt corner, with Vgs from 0 to 1.2 V. Note that the curves in the saturation region on the right are not flat but slope upward: this is channel-length modulation, and the inverse of the slope is ro. If the two mirror transistors have different VDS, they sit at different points on the curve and carry different currents]

**Type 2: random VT and β mismatch.** Pelgrom et al. concluded that σ(ΔVT) = AVT/√(WL). The main source is random dopant fluctuation in the depletion layer; dimension variation and interface states also contribute ([Pelgrom, Tuinhout, Vertregt, IEDM 1998](https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf)) [Silicon · research]. Some intuitive numbers [Textbook] ([Sheikholeslami](https://www.eecg.utoronto.ca/~ali/papers/mag-win-15-process-variation.pdf)):
- At that paper's bias, a 5 mV VT difference between two adjacent transistors causes about a 5% current difference.
- With L fixed and W made 4 times larger, σ(ΔVT) halves.
- With N identical devices in parallel, the VT variance drops to 1/N, at the cost of area and capacitance.

The lecture gives a practical ratio error of about 0.5–2%, "usually" inversely proportional to gate area ([TAMU L8](https://people.engr.tamu.edu/spalermo/ecen474/lecture08_ee474_current_mirrors.pdf)) [Textbook]. The Wilson mirror page gives a CMOS VT offset of "typically 1 to 3 mV" ([Wikipedia: Wilson](https://en.wikipedia.org/wiki/Wilson_current_mirror)) [Textbook]. See the "Noise and mismatch" section of the main guide for the process physics of AVT and values at each node.

**Note: a current mirror wants "high overdrive"; a differential pair wants "low overdrive."** [Inference] The square law gives an approximate expression for random current mismatch: σ²(ΔI/I) ≈ σ²(Δβ/β) + (gm/ID)²·σ²(ΔVT). In strong inversion gm/ID = 2/V_OV, so a larger V_OV (lower gm/ID) turns VT mismatch into a smaller current error. This agrees with Wikipedia: holding the VT offset contribution to about 1% takes "a few tenths of a volt" of overdrive ([Wikipedia: Wilson](https://en.wikipedia.org/wiki/Wilson_current_mirror)). The input offset voltage of a differential pair behaves the opposite way: in the input-referred offset the VT term appears directly and the β term is divided by gm/ID, so differential pairs favor high gm/ID (weak or moderate inversion). The same process AVT must be "diluted" with opposite bias strategies in a current mirror and in a differential pair. The expression is a standard derivation; this page did not find a verbatim source for it.

**Type 3: gradients, IR drop, and layout-dependent effects (LDE).** Pelgrom et al. list other factors: distance between devices, topography, metal coverage, implant striations, packaging, and mechanical stress ([Pelgrom et al.](https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf)) [Silicon · research]. Pulsic adds that well-edge distance shifts VT and that implant direction makes device orientation matter ([Pulsic](https://pulsic.com/?p=1)) [Vendor]. A paper based on a commercial 12 nm FinFET process finds that at the unit level, interconnect resistance dominates, and source-line resistance mismatch directly changes the current ratio ([Sharma et al., NSF PAR](https://par.nsf.gov/servlets/purl/10540359)) [Simulation].

These errors in the language of logic process integration [Inference]:
- VT mismatch: random dopants, metal-gate work-function granularity.
- β mismatch: mobility and stress differences, LER, and fin-width variation.
- Systematic error: LOD/SA-SB, WPE, proximity effects of gate cut and diffusion break, poly/fin density, IR drop on shared source lines, thermal gradients, and self-heating.

All of these map to familiar process knobs. The difference is that logic cares about their effect on the Ion/Ioff distribution, while a current mirror cares about the difference between two adjacent devices.

### How to draw the layout: make both transistors "see the same world"

**The principle fits in one sentence:** matched devices must be designed identical in geometry, orientation, bias, and temperature ([Pelgrom et al.](https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf)) [Silicon · research]. Pulsic breaks this into rules you can apply ([Pulsic](https://pulsic.com/?p=1)) [Vendor]:
- **Unit cells.** Use the same parameterized cell for matched devices. Do not match one wide transistor against several narrow ones. Split large devices into many identical units.
- **Common centroid.** Put the reference transistor at the center, or use a cross-quad arrangement. Cross-quad is more robust to gradients in any direction but harder to route.
- **Interdigitation.** Interdigitate the two device groups so they are spread out and interleaved.
- **Same orientation.** Orient all matched devices the same way, because implant direction matters.
- **Same environment.** Keep guard rings and distances to well edges identical. Advanced processes also require dummies and density control.
- **Routing trade-offs.** Flipping the current direction about the symmetry axis to ease routing can hurt matching.

Below is an official SkyWater layout of a multi-finger NFET. It is not a current mirror, but it shows the basic "unit" of an analog device: several gate fingers sharing sources and drains, with substrate contacts around it.

[Figure: Official SkyWater SKY130 layout render: a 4-finger RF NFET (rf_nfet_01v8, W=3 µm, L=0.15 µm). Note that the vertical polysilicon gate fingers have gate contacts at both the top and bottom ends; the diffusion alternates S/D/S/D/S, and adjacent fingers share a source or drain; substrate taps run along the left and right sides. A "unit" in a current mirror is a multi-finger device like this]

What does common centroid look like in practice? The open-source analog layout tool ALIGN gives an abstract placement grid.

[Figure: Placement grid from the open-source analog layout tool ALIGN (abstract illustration, not a mask view): a differential pair is split into units arranged in 2 rows × 6 columns in the order s-b-a-a-b-s. Note that devices a and b are mirror-symmetric about the center axis, with an s unit at each end; the effects of a first-order linear gradient on a and b then cancel, which is the common-centroid idea]

The same idea applies to current mirrors: split the reference and each output transistor into identical units, interleave them in a near-square array, and add dummy columns on both sides. The 12 nm FinFET paper above does exactly this. It also swaps units to cancel second-order (nonlinear) gradients, and it requires matched devices to have the same SA/SB (LOD), the same well spacing (WPE), the same number of diffusion breaks, uniform OD width, and uniform poly pitch ([Sharma et al.](https://par.nsf.gov/servlets/purl/10540359)). The paper reports [Simulation]:
- For a 10-device current-mirror array, the maximum current-ratio deviation is 1.54%, versus 21.89% and 26.35% for two comparison methods.
- For another array it is −0.25%, versus −5.00% and −8.25% for the comparison methods.
- The maximum IR drop is 1.7 mV, versus 3.7–4.0 mV for the comparison methods.

This shows that in FinFET, the same devices with different placement and wiring can differ by an order of magnitude in ratio error.

### What FinFET/GAA changes: width becomes an integer, and the environment takes center stage

[Figure: 3D illustration of a double-gate FinFET: the fin stands on the substrate, the gate wraps the fin from both sides, and the source and drain sit at the two ends. Note that the device "width" is set by fin height and fin count and cannot be drawn continuously as in a planar transistor; mirror ratios can therefore only be set by integer numbers of fins or units]

Tech Design Forums, summarizing a Synopsys webinar, lists the effects of FinFET on analog design ([Tech Design Forums](https://www.techdesignforums.com/practice/?p=5259)) [Opinion]:
- Width quantization: drive strength is set by paralleling fins that share gate, source, and drain; BSIM-CMG replaces W with fin count.
- Stress-related LDE: fins in the middle of an array, fins at the end of a row, and isolated fins behave differently; unsupported fins relax their stress and lose mobility. Dummy fins maintain stress but cost area.
- Self-heating is more severe.
- Body bias is no longer a practical analog tuning knob.
- Planar analog layouts generally have to be redrawn from scratch.
- The good news: FinFET channels do not need heavy doping, so VT variation is smaller.

Concrete practice for current mirrors [Inference] (common industry practice; the sources above confirm it only in part):
- Set every ratio with an integer number of identical units (same nfin, same finger count, same L), not by drawing different widths. For example, a 1:4 mirror is 1 unit against 4 units.
- When a long L is needed, chain several minimum-L gates in series (stacked gates), because the L of a single device is essentially fixed. See the techniques page for gain and matching details of series-stacked devices.
- In GAA (nanosheet), the "width" knob becomes sheet width or the number of sheet layers, which again has only a few discrete settings.
- Build mirror arrays as common-centroid unit grids with dummy rows and columns, and use continuous diffusion where the rules allow.
- The matching-environment checklist gets longer: gate-cut and diffusion-break locations, fin boundaries, and the IR and parasitic changes from backside power delivery must all be identical on both sides.

Fin boundaries and mirror layout under FinFET remain active topics in patents and CAD conferences ([US 12,446,321](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12446321); [DATE 2021](https://past.date-conference.com/proceedings-archive/2021/pdf/1829.pdf); [ASP-DAC 2022](https://www.aspdac.com/aspdac2022/taoka/pdf/2B-3.pdf)) [Vendor]. This search found no public quantitative data on nanosheet current-mirror matching.

## 2. Differential pairs, amplifiers, and comparators

**A differential pair amplifies the difference between two inputs and rejects what they have in common; add a current-mirror load and a tail current source and it becomes the most basic amplifier (OTA); add one more stage and it is a two-stage op-amp; connect a differential pair to a positive-feedback latch and it becomes a comparator.**

Key points:
- The three single-transistor configurations each have a role [Textbook]: common source (CS) amplifies voltage, with gain about gm·ro; common gate (CG) has low input impedance (≈ 1/gm) and often serves as a cascode; common drain (CD) is a voltage buffer with gain below 1.
- Common-source gain with a current-source load = −gm1/(go1 + go2); a diode-connected load is about 1/gm; adding a cascode multiplies the output resistance by about gm·ro ([TAMU L8](https://people.engr.tamu.edu/spalermo/ecen474/lecture08_ee474_current_mirrors.pdf)) [Textbook].
- Five-transistor OTA = differential pair + current-mirror load + tail current source. A two-stage op-amp adds a common-source stage and a compensation capacitor to get higher gain and swing.
- Amplifiers are judged on gain, GBW, phase margin, slew rate, offset, and noise; comparators on offset, speed, noise, kickback, and metastability [Textbook].
- For ways to recover gain at low voltage (cascode, gain boosting, multiple stages, stacked devices), see the techniques page.

### Differential pair: amplify only the "difference"

[Textbook] A differential pair is two transistors with their sources tied together, sitting on a tail current source. With equal inputs, the tail current splits evenly. With a difference at the inputs, the current tilts to one side and the difference is amplified. When both inputs rise and fall together (a common-mode signal), the tail source "holds" the total current and the output barely changes. This is where the common-mode rejection ratio (CMRR) comes from: the higher the tail source's Rout, the better the CMRR. A differential pair with a current-mirror load is standard material in introductory analog courses ([Harvard ES154 Lecture 15](https://in.ncu.edu.tw/~ncume_ee/harvard-es154/lect_15_diff_pair_2.pdf)).

The key weakness of a differential pair is offset: when the two transistors are mismatched, the output is not zero even with zero input. It is most sensitive to VT mismatch, so the layout uses common centroid and dummies (§1), and the bias favors high gm/ID (the "Note" in §1). Differential pairs also need attention to 1/f noise.

### Five-transistor OTA: one differential pair, two current mirrors

Below is a real five-transistor OTA schematic from an open-source course. Two current mirrors are directly visible: the PMOS mirror at the top is the active load, and the NMOS mirror at the bottom supplies the tail current.

[Figure: Real five-transistor OTA schematic from an open-source course (xschem): NMOS input pair M1/M2 (inputs vinp/vinn), PMOS current-mirror load M3/M4 (common gate node gate_p), and NMOS tail current source M5 mirrored from M6; an external 20 µA ibias comes in and the tail current is 4 µA, i.e., a 5:1 mirror ratio. M7–M13 are enable switches. Note the labeled node voltages (about 0.78 V, 0.38 V, 0.7 V) and the 1.45–1.55 V vdd: every transistor has tight headroom]

[Textbook] The PMOS mirror load has a clever feature: it "copies" the current change on the left side to the right side, so the signal currents from both sides add at the output and a single-ended output still gets the full differential gain. The OTA outputs a current (it is a transconductance amplifier). Its gain is about gm·(ro_n ∥ ro_p), i.e., on the order of gm·ro. At advanced nodes the single-transistor gm·ro is only a few tens, so this stage's gain is often not enough; see the techniques page.

### Two-stage op-amp: add a stage for more gain and swing

[Figure: Classic two-stage CMOS op-amp schematic (German labels): input differential pair V1/V2 with a 50 µA current-source tail and current-mirror load V3/V4; second-stage gain transistor V5 biased by a 25 µA current source; compensation capacitor Ck across the two stages; output stage V6/V7, output Ua, inputs UN/UP. Note that the current sources in the figure are themselves biased by current mirrors]

[Textbook] The first stage is a five-transistor OTA, and the second stage is a common-source amplifier. Total gain is about the product of the two stage gains, on the order of (gm·ro)². Output swing is also larger. The cost is an extra pole, which needs a compensation capacitor (Miller compensation) to secure phase margin. So the typical metrics of a two-stage op-amp are DC gain, GBW, phase margin, slew rate, and output swing.

| Amplifier type | Structure | Gain order | Main trade-offs | Evidence |
|---|---|---|---|---|
| Five-transistor OTA | Differential pair + mirror load + tail source | gm·ro | Simple, fast; low gain | [Textbook] |
| Telescopic / folded cascode | Cascodes stacked within one stage | (gm·ro)² | High gain; telescopic has small swing, folded has larger swing but higher power and noise | [Textbook] |
| Two-stage Miller | OTA + common-source second stage + Cc | (gm·ro)² | High gain and swing; needs compensation, limited bandwidth | [Textbook] |

### Comparator: amplify, then make the call

A comparator answers only one question: which input is larger. Modern ADCs and SerDes receivers mostly use dynamic latched comparators. These work only at clock edges and draw nearly zero static power.

[Figure: Dynamic latched comparator (StrongARM type): input pair on VINP/VINN, a cross-coupled latch above, CLK-controlled PMOS transistors for reset, a clocked NMOS tail at the bottom, outputs OUTP/OUTN. Note the cross-coupled pair: it forms positive feedback that quickly amplifies a tiny input difference into a full-swing 0/1]

[Textbook] Operation takes two phases. With the clock low, the reset transistors pull both outputs to the same potential. With the clock high, the tail turns on, the input pair splits current between the two sides according to the input difference, and the latch uses positive feedback to amplify the small difference to full swing. The main metrics are:
- Offset: set by mismatch in the input pair and the latch; key to SAR ADC accuracy.
- Speed: set by the regeneration time constant, which relates to fT.
- Noise: sets the smallest difference that can be resolved.
- Kickback: glitches coupled back to the inputs when the clock switches.
- Metastability: when the input difference is too small, the decision does not finish within the allotted time.

## 3. References and power: bandgap and LDO

**A bandgap adds two voltages that move in opposite directions with temperature to get a reference of about 1.2 V that barely changes with temperature; an LDO uses this reference and an error amplifier to turn a noisy input supply into a clean, stable local supply.**

Key points:
- A bandgap adds a PTAT voltage (ΔV_BE of two junctions at different current densities) to a CTAT diode voltage (about −2 mV/K). This cancels the first-order temperature coefficient and gives about 1.2–1.3 V ([Wikipedia: Bandgap voltage reference](https://en.wikipedia.org/wiki/Bandgap_voltage_reference)) [Textbook].
- Typical initial error is about 0.5–1.0% and temperature drift is 25–50 ppm/°C; careful design reaches 1.5–2.0 ppm/°C ([Wikipedia: Bandgap](https://en.wikipedia.org/wiki/Bandgap_voltage_reference)) [Textbook].
- LDO = pass transistor + error amplifier + reference + resistor-divider feedback. Dropout is the minimum input-output voltage difference that still maintains regulation ([Wikipedia: Low-dropout regulator](https://en.wikipedia.org/wiki/Low-dropout_regulator)) [Textbook].
- Key LDO metrics are dropout, PSRR, quiescent current, load / line regulation, transient response, and stability ([Wikipedia: LDO](https://en.wikipedia.org/wiki/Low-dropout_regulator)) [Textbook].
- A self-biased current reference (beta multiplier) is insensitive to supply but must have a start-up circuit ([US 7,755,419](https://patents.google.com/patent/US7755419)) [Vendor].

### Bandgap: one goes up, one goes down, the sum stays put

[Textbook] The V_BE of a diode or BJT falls with temperature at about −2 mV/K. This is CTAT (complementary to absolute temperature). The difference ΔV_BE between two junctions at different current densities rises linearly with temperature. This is PTAT (proportional to absolute temperature). Scale the PTAT term by the right factor and add it to the CTAT term, and the first-order temperature coefficients cancel. The result is close to the extrapolated bandgap voltage of silicon, 1.2–1.3 V ([Wikipedia: Bandgap](https://en.wikipedia.org/wiki/Bandgap_voltage_reference)). Historically, Hilbiber (Fairchild, 1964), Widlar (1971), and Brokaw (1974) established this circuit in turn ([Wikipedia: Bandgap](https://en.wikipedia.org/wiki/Bandgap_voltage_reference)).

[Figure: Brokaw bandgap schematic: two BJTs, Q1 with emitter area A and Q2 with 8A; the collectors connect to two equal resistors R; op-amp A forces equal currents in the two branches; R2 and R1 produce the output VOUT. Note the 8:1 area ratio of Q1 and Q2: with equal currents but different current densities, the difference of their V_BE values is the PTAT voltage]

In CMOS processes, the BJT is a parasitic vertical PNP. Real circuits also add current mirrors, cascodes, and a start-up circuit.

[Figure: Real CMOS bandgap schematic from an open-source course (xschem, fairly dense): PNP devices Q1–Q3 in a CMOS process, PMOS current mirrors, NMOS cascodes, and a start-up circuit, with output vref ≈ 1.16 V. Note the row of PMOS current mirrors at the top: they copy the same current into each branch, which is exactly the bias distribution described in §1]

[Textbook] Bandgap metrics include initial accuracy, temperature drift, PSRR, noise, and minimum supply voltage ([Wikipedia: Bandgap](https://en.wikipedia.org/wiki/Bandgap_voltage_reference)).
- A simple first-order design reaches only about 20 ppm/°C over a 100 °C range.
- The standard structure needs a supply of about 1.4 V.
- Banba et al. reported a current-summing sub-1 V CMOS bandgap in 1999.

At the device level, watch BJT/diode matching, resistor temperature coefficient, and op-amp offset. The op-amp offset is amplified to the output, so chopping or trimming is common. Trim values are usually stored in OTP; see §8 [Textbook].

### Current reference: beta multiplier and start-up circuit

[Vendor] A self-biased current reference connects a PMOS mirror and an NMOS mirror in a loop. One NMOS is K times the other and has a resistor in series with its source, which gives a current that is largely independent of supply. The loop also has a stable "zero-current" state, so "self-biased references are almost always used with a start-up circuit" ([US 7,755,419](https://patents.google.com/patent/US7755419)). Start-up circuit design for a low-voltage cascode version is also patented ([US 8,598,862](https://patents.google.com/patent/US8598862)). The layout figure in §6 includes a "Beta multiplier current reference" block.

### LDO: an amplifier that "watches" the output voltage

[Figure: LDO schematic: a PMOS pass transistor (the boxed pass element) sits in series between input and output; the error amplifier compares Vref with the voltage fed back from the R1/R2 voltage divider and drives the pass transistor's gate; the output has a 100 µF capacitor and a 100 Ω load. Note the feedback loop: if the output drops, the divided voltage falls below Vref, and the amplifier pulls the PMOS gate down so it conducts more]

[Textbook] The structure and principle of an LDO are simple. The hard part is balancing the metrics ([Wikipedia: LDO](https://en.wikipedia.org/wiki/Low-dropout_regulator)):
- **Dropout**: limited by the saturation voltage of the pass transistor. Lower dropout means higher efficiency but a larger pass transistor.
- **PSRR**: rejection of input ripple. For example, a PSRR of 55 dB at 1 MHz attenuates 1 mV of ripple to 1.78 µV.
- **Regulation**: line regulation improves with higher DC loop gain.
- **Quiescent current**: the current the LDO itself draws.
- **Transient response**: set by error-amplifier bandwidth, output capacitance, and ESR.
- **Stability**: there is a dominant pole and also an ESR-dependent zero.

Compared with a switching regulator, an LDO has no switching noise and needs no inductor. But it turns all of (V_in − V_out)·I into heat, so efficiency falls as the input-output difference grows ([Wikipedia: LDO](https://en.wikipedia.org/wiki/Low-dropout_regulator)). A common SoC approach is therefore to let a switching regulator (off-chip or on-chip buck) do the large step-down and let LDOs do the "final cleanup" for sensitive analog and clock blocks [Inference]. TI application note SLVA079 explains LDO terms systematically ([TI SLVA079](https://www.ti.com/lit/an/slva079/slva079.pdf), link only).

### Power tree: from the reference to every block

[Inference] Putting this section together, the analog power and bias of an SoC form roughly a tree: the bandgap gives a reference voltage → a bias generator (a beta multiplier or a bandgap-derived current, fanned out through current mirrors) → several LDOs and bucks → each analog block (PLL, ADC, SerDes). At power-up, a POR keeps the chip in reset until the supplies are stable (§8). The accuracy and noise at the root propagate to every leaf, so the bandgap is often trimmed, and LDO PSRR is counted as part of the clock jitter budget.

## 4. Clocks: PLL

**A phase-locked loop (PLL) "multiplies" a low-frequency, stable reference clock (usually from a crystal) up to the high-frequency clock the chip needs, and keeps the output phase tracking the reference; almost every SoC needs it as analog IP.**

Key points:
- Charge-pump PLL = tri-state phase-frequency detector (PFD) + charge pump + PI (R-C) loop filter + VCO, with a divider in the feedback path. It locks fast and has small steady-state phase error ([Wikipedia: Charge-pump PLL](https://en.wikipedia.org/wiki/Charge-pump_phase-locked_loop)) [Textbook].
- The main metrics are jitter / phase noise, reference spurs, lock time, and frequency range [Textbook].
- VCOs come in ring and LC types. In vendor data, ring PLL integrated jitter is "as low as 1 ps RMS," and LC PLL broadband jitter is "well below 300 fs RMS" ([AnySilicon: Silicon Creations](https://anysilicon.com/vendors/silicon-creations/)) [Vendor].
- The higher the data rate, the tighter the jitter budget and the stronger the pull toward LC PLLs. For example, PCIe Gen2/3 uses ring PLLs and Gen4/5 uses LC PLLs ([SemiWiki: Analog Bits](https://semiwiki.com/ip/analog-bits/293408-analog-bits-is-supplying-analog-foundation-ip-on-the-industrys-most-advanced-finfet-processes/)) [Vendor].

### Structure: five blocks form a feedback loop

[Figure: Analog PLL block diagram: Input → phase-frequency detector PFD → Analog Filter → VCO → Output, with a Frequency divider in the feedback path. Note the divider: the output frequency is divided by N and compared with the input, so when the loop locks, the output frequency equals N times the input frequency]

[Textbook] How the loop works:
- The PFD compares the reference clock with the divided feedback clock and outputs "UP" or "DN" pulses whose width represents the phase difference.
- The charge pump turns the UP/DN pulses into current pushed into or pulled out of the loop filter. It is essentially two current mirrors plus switches (§1).
- The loop filter integrates and filters the current to produce the VCO control voltage.
- The VCO frequency changes with the control voltage.
- The divider divides the VCO output by N and sends it back to the PFD. The division ratio can be an integer (integer-N) or, with Δ-Σ modulation, a fraction (fractional-N).

The PFD and divider are digital circuits; the charge pump, loop filter, and VCO are analog. The PLL is a typical mixed-signal block.

### Metrics and device dependence

| Metric | Meaning | Main influences | Evidence |
|---|---|---|---|
| Jitter / phase noise | How far clock edges deviate from their ideal positions | VCO noise (including upconverted 1/f noise), reference noise, loop bandwidth | [Textbook] |
| Reference spurs | Spurs in the output spectrum at integer multiples of the reference frequency | Charge-pump UP/DN current mismatch, leakage | [Inference] |
| Lock time | Time from start-up or a frequency hop to lock | Loop bandwidth | [Textbook] |
| Capture / hold range | Frequency range over which the loop can lock and stay locked | Loop structure | Hold-in and pull-in ranges are defining metrics of a CP-PLL ([Wikipedia: CP-PLL](https://en.wikipedia.org/wiki/Charge-pump_phase-locked_loop)) [Textbook] |

[Textbook] At the device level, ring VCOs depend on device speed (fT) and 1/f noise; LC VCOs depend on inductor Q and varactors. The charge pump depends on current-mirror matching and Rout. This search found no public quantitative data on PLL jitter, spurs, and charge-pump mismatch.

### Ring PLL vs. LC PLL: trading area and design difficulty for jitter

[Vendor] The Silicon Creations catalog works as a ready-made PLL taxonomy ([AnySilicon: Silicon Creations](https://anysilicon.com/vendors/silicon-creations/)):
- Ring PLLs: fractional-N PLL with a 24-bit Δ-Σ modulator, small ring PLL at core voltage, integer PLL, jitter-attenuation PLL, and multiphase PLL with 12/16/32-phase outputs. Process coverage runs from 180 nm to 3 nm.
- LC PLLs: integer LC-PLL with an LC tank, and a 28 nm fractional-N frequency synthesizer. The listed nodes are 7 nm FinFET and 28 nm.

The company says its fractional-N PLL has more than 1,000 production licenses and is deployed on more than 6 million wafers. PLL uses include digital clock generation, reference clocks for DDR/PCIe/Ethernet/USB PHYs, fast frequency hopping, spread-spectrum modulation, and very fine (sub-degree) phase stepping ([Design & Reuse press release](https://us.design-reuse.com/news/57049/silicon-creations-milestone-fractional-n-pll.html)).

[Inference] A ring VCO is built mainly from inverters and current sources. It is more "digital" and follows node scaling more easily, which is why it spans 180 nm to 3 nm. An LC VCO depends on an inductor, takes a lot of area, and is very sensitive to metal layers and substrate, so moving it to a new node is harder.

### Close relatives of the PLL: DLL, crystal oscillator, and CDR

[Textbook]
- **DLL (delay-locked loop)**: locks a delay line to the reference period. Memory PHYs use it to phase-align DQS and the clock. It creates no new frequency and does not accumulate jitter. The Synopsys DDR PHY material lists a "low-jitter DLL" ([Synopsys DDR multiPHY](https://www.synopsys.com/resources/ddr-multiphy-ip-datasheet.html)) [Vendor].
- **Crystal oscillator**: a Pierce-type amplifier pad cell that drives an off-chip quartz crystal and provides the PLL reference.
- **CDR (clock and data recovery)**: recovers the clock from the data stream at the SerDes receiver; it is also essentially a phase-locked loop.

## 5. Data conversion: ADC and DAC

**An ADC turns a continuous analog voltage into a digital code, and a DAC does the reverse; different architectures make different trade-offs among speed, accuracy, and power, and their accuracy ultimately comes down to the matching of comparators, capacitors, or current sources.**

Key points:
- A SAR ADC uses binary search and resolves one bit per clock cycle. It consists of a sample-and-hold, one comparator, one DAC, and a successive-approximation register ([Wikipedia: ADC](https://en.wikipedia.org/wiki/Analog-to-digital_converter)) [Textbook].
- A Δ-Σ ADC uses oversampling and noise shaping to push quantization noise out of band, followed by a digital decimation filter. It suits low-bandwidth, high-precision applications ([Wikipedia: ADC](https://en.wikipedia.org/wiki/Analog-to-digital_converter)) [Textbook].
- Flash is the fastest, but the comparator count nearly doubles with each extra bit; pipeline sits between the two ([Wikipedia: ADC](https://en.wikipedia.org/wiki/Analog-to-digital_converter)) [Textbook].
- The main metrics are ENOB, SNR, SFDR, DNL/INL, and aperture jitter; the SQNR of an ideal 16-bit ADC is about 98 dB (6.02N + 1.76 dB) ([Wikipedia: ADC](https://en.wikipedia.org/wiki/Analog-to-digital_converter)) [Textbook].
- The accuracy of a current-steering DAC is set by the matching of its current-mirror units ([Sheikholeslami](https://www.eecg.utoronto.ca/~ali/papers/mag-win-15-process-variation.pdf)) [Textbook].

### SAR ADC: one comparator doing a binary search

[Figure: SAR ADC block diagram: input VIN goes through sample-and-hold (S/H) to the comparator; the comparator result enters the SAR register (Clock input, end-of-conversion output EOC); the register outputs D_N−1…D0 drive an N-bit DAC (reference voltage VREF), whose output feeds back to the comparator. Note this loop: on each clock the DAC tries a value, the comparator makes one decision, and the register sets one bit, so N bits take N cycles]

[Textbook] The SAR process is like weighing on a balance: try the most significant bit first (half of full scale), let the comparator say "too high or too low," fix that bit, then try the next bit.

In an SoC, the SAR DAC is usually a binary-weighted capacitor array (charge redistribution), with the capacitors laid out in common centroid. The comparator is the dynamic latched comparator from §2. So SAR accuracy depends on three things: comparator noise and offset, capacitor matching, and the on-resistance and leakage of the sampling switch. SAR is close to the "most digital" ADC: apart from the comparator and the sampling switch, the rest is logic. That is why it is popular at advanced nodes [Inference].

[Textbook] Typical speed and accuracy ranges ([Electronic Design](https://www.electronicdesign.com/technologies/analog/adc/article/21801636/whats-the-difference-between-sar-and-delta-sigma-adcs)): SAR usually covers 8 to 18 bits. Conversion time equals the clock period times the number of bits; for example, 16 bits at a 2 MHz clock takes 8 µs. The roughly 10 MS/s upper limit cited in that article applies to discrete ADC chips, not embedded IP.

### Δ-Σ ADC: trading speed for accuracy

[Figure: Second-order Δ-Σ modulator loop: input → summer → integrator → summer → integrator → sampling quantizer (ADC) → ΔΣM output; the quantized result feeds back through a low-resolution DAC to both summers. Note the two feedback lines: the loop "shapes" the quantization error and pushes it to high frequency, and the digital filter that follows removes the high-frequency part]

[Textbook] A Δ-Σ ADC consists of a modulator (a feedback loop of integrators, a comparator, and a 1-bit DAC) followed by a digital decimation filter. It samples far above the signal bandwidth and pushes quantization noise out of band. This suits low-bandwidth, high-precision applications such as 24-bit/96 kHz audio ([Wikipedia: ADC](https://en.wikipedia.org/wiki/Analog-to-digital_converter)). It reaches up to 32 bits, with output rates generally in the kS/s range, and suits DC, audio, and precision instrumentation ([Electronic Design](https://www.electronicdesign.com/technologies/analog/adc/article/21801636/whats-the-difference-between-sar-and-delta-sigma-adcs)). At the device level, the op-amp / OTA in the integrator and 1/f noise are key, so chopping is common. Continuous-time Δ-Σ is also sensitive to clock jitter [Textbook].

### Architecture comparison and DACs

| Architecture | Principle | Strength | Accuracy bottleneck | Evidence |
|---|---|---|---|---|
| Flash | Resistor ladder + a bank of comparators + priority encoder | Fastest | Comparator count grows exponentially with bits; comparator offset | [Wikipedia: ADC](https://en.wikipedia.org/wiki/Analog-to-digital_converter)[Textbook] |
| SAR | Binary search, one bit per cycle | Medium speed, medium-to-high accuracy, low power | Comparator noise and offset, capacitor matching | [Wikipedia: ADC](https://en.wikipedia.org/wiki/Analog-to-digital_converter)[Textbook] |
| Pipeline | Each stage quantizes coarsely, subtracts via a DAC, and amplifies the residue for the next stage | High speed with fairly high accuracy | Op-amp gain and GBW, capacitor matching | [Wikipedia: ADC](https://en.wikipedia.org/wiki/Analog-to-digital_converter)[Textbook] |
| Δ-Σ | Oversampling + noise shaping + digital decimation | Low bandwidth, high accuracy | Integrator op-amp, 1/f noise, clock jitter | [Wikipedia: ADC](https://en.wikipedia.org/wiki/Analog-to-digital_converter)[Textbook] |
| Current-steering DAC | A set of unit current sources switched by the code | High speed | Current-mirror unit matching (INL/DNL), Rout (SFDR) | [Sheikholeslami](https://www.eecg.utoronto.ca/~ali/papers/mag-win-15-process-variation.pdf)[Textbook] |
| R-string DAC | Taps on a resistor ladder | Inherently monotonic | Resistor matching | [Textbook] |

[Textbook] Metric definitions ([Wikipedia: ADC](https://en.wikipedia.org/wiki/Analog-to-digital_converter)):
- ENOB: effective number of bits; the measured SNDR expressed as "the number of bits of an equivalent ideal ADC."
- SNR / SQNR: signal-to-noise ratio; the quantization SQNR of an ideal N-bit ADC is about 6.02N + 1.76 dB, about 98.1 dB for 16 bits.
- SFDR: spurious-free dynamic range; channel mismatch in time-interleaved ADCs degrades SFDR.
- DNL / INL: how far each code width and the whole transfer curve deviate from ideal; they directly reflect capacitor or current-source matching.
- Aperture jitter: uncertainty in the sampling instant, which limits resolution for bandwidths between 1 MHz and 1 GHz. So the accuracy of a high-speed ADC ultimately depends on PLL jitter (§4).

The ADC figures of merit (Walden/Schreier FoM) and Murmann's ADC performance survey are standard public references; this search did not check them item by item.

## 6. What the layout looks like

**Analog layout is custom layout drawn by hand (or semi-automatically): devices are placed in groups according to matching needs, large areas go to capacitors, resistors, and inductors, and routing pays attention to symmetry and current density; it is entirely different from digital standard-cell automatic place and route.**

Key points:
- For device-level matching rules (unit cells, common centroid, dummies, same orientation), see the layout subsection of §1.
- At the block level, passives often take most of the area: compensation capacitors, resistors, and inductors are much larger than transistors.
- In real open-source layouts, blocks such as OTAs, current references, and capacitor arrays are directly recognizable.
- Finishing the drawing is not the end: DRC/LVS, parasitic extraction, and post-layout simulation follow; see §9.

### Layout of a two-stage op-amp: the big capacitor takes a large share of area

[Figure: Teaching layout of a CMOS two-stage op-amp: red is polysilicon (poly), blue is metal 1, green is active area; there is a large square capacitor on the right; the pins are Vdd, GND, Vout, vpos, and vneg. Note that the large square capacitor on the right takes a sizable part of the layout: the two-stage op-amp from §2 needs a compensation capacitor, and such capacitors are often much larger than the transistors in layout]

[Inference] The figure shows several habits of analog layout:
- Transistors are usually placed in groups and pairs to ease matching.
- Power and ground use wide lines to control IR drop and electromigration.
- Compensation capacitors, sampling capacitors, and DAC capacitor arrays often take most of a block's area.
- Spacing is left between capacitors and transistors to reduce coupling.

### A small analog test chip: what blocks look like in layout

[Figure: Layout screenshot of a small analog test chip in the SKY130 process (a Tiny Tapeout project), with colored boxes marking each block: "OTA," "Beta multiplier current reference," "Compensation capacitors," "4-by-1 transmission gate mux," and "Pull-down MOS resistors." Note the size of the compensation-capacitor box and that the current reference appears as a separate block: this is the "reference → bias → amplifier" chain from §3]

This project was fabricated through Tiny Tapeout, and its GDS and schematics are open source ([atenfyr/ttsky_analog](https://github.com/atenfyr/ttsky_analog); [Tiny Tapeout chip page](https://tinytapeout.com/chips/ttsky26a/520)). Another Tiny Tapeout project builds a five-transistor OTA as a 25 µm × 20 µm cell: the PMOS mirror load in an n-well at the top, the NMOS input pair in the middle, and the NMOS tail current mirror at the bottom ([spasquale25/OTA](https://github.com/spasquale25/OTA)). This matches the structure of the five-transistor OTA schematic in §2, although the two come from different authors and different processes.

### How analog layout differs from digital layout

| Aspect | Digital (standard cell) | Analog (custom) | Evidence |
|---|---|---|---|
| How it is made | Synthesis + automatic place and route | By hand or with template / generator help, placed device by device | [Textbook] |
| Main goals | Timing, area, power, routability | Matching, symmetry, parasitics, noise isolation, current density | [Textbook] |
| Devices | Fixed-size standard cells | Each device sized individually; many passives | [Textbook] |
| Matching methods | Largely unnecessary | Common centroid, interdigitation, dummies, same orientation, same environment | [Pulsic](https://pulsic.com/?p=1)[Vendor] |
| Isolation | Usually unnecessary | Guard rings, deep N-well, distance from digital noise sources | [Textbook] |
| Post-layout checks | STA with extracted RC | Full post-layout simulation of all metrics; advanced nodes need more extraction corners | [Semiconductor Engineering](https://semiengineering.com/challenges-increase-for-ip-at-advanced-nodes)[Opinion] |

Automation is entering analog layout. The open-source tool ALIGN can generate common-centroid placements automatically (the figure in §1). OpenFASOC's gLayout can generate current mirrors, differential pairs, common-centroid and interdigitated structures, and two-stage op-amps in SKY130 and GF180 ([OpenFASOC gLayout](https://openfasoc.readthedocs.io/en/latest/notebooks/glayout/glayout_opamp.html)). For commercial tools, see migration automation in §9.

## 7. Main components of analog circuits: from transistors to subsystems

**Analog and mixed-signal circuits are built in layers: transistor-level primitives form circuit blocks, circuit blocks form subsystems, and subsystems enter the SoC as IP; each layer depends on only a few metrics of the layer below, and these metrics trace back to a few device parameters.**

Key points:
- Primitive layer: current mirrors, differential pairs, common source / common gate / common drain. Block layer: OTA / op-amp, comparator, reference, LDO. Subsystem layer: PLL, ADC/DAC, SerDes, power management, sensors [Textbook].
- The compositions are concrete: LDO = bandgap + error amplifier + pass transistor + divider; SAR ADC = sample-and-hold + comparator + capacitor DAC + SAR logic; charge-pump PLL = PFD + charge pump + loop filter + VCO + divider ([Wikipedia: LDO](https://en.wikipedia.org/wiki/Low-dropout_regulator); [Wikipedia: ADC](https://en.wikipedia.org/wiki/Analog-to-digital_converter); [Wikipedia: CP-PLL](https://en.wikipedia.org/wiki/Charge-pump_phase-locked_loop)) [Textbook].
- Device dependence falls into five groups: amplifiers depend on gm/ID, gm·ro, and fT; comparators, references, and data converters on matching; VCOs, LNAs, and ADC front ends on noise; bandgaps on BJTs/diodes; power devices on Ron·C and reliability [Inference].
- Logic process trends cut both ways for analog: lower VDD squeezes headroom, and width quantization limits sizing freedom; higher fT helps RF and SerDes, and the undoped FinFET channel improves VT matching [Inference].

### One summary table: what each block does, what it is judged on, and what it relies on

The row contents of the table below are standard textbook knowledge (Razavi, Johns & Martin, Gray & Meyer, Allen & Holberg, Baker). No web source was found row by row, so all rows are tagged [Textbook].

| Layer | Block | What it does | Key circuit metrics | Device metrics it relies on |
|---|---|---|---|---|
| Primitive | Current mirror | Copy or scale current | Rout, compliance voltage, ratio error | Matching (AVT, Aβ), ro, LDE |
| Primitive | Differential pair | Amplify a difference, reject common mode | Offset, CMRR, gm | Matching, gm/ID, 1/f noise |
| Primitive | Common source / common gate / common drain | Voltage gain / current buffer (cascode) / voltage buffer | Gain, bandwidth, input and output impedance | gm/ID, gm·ro, fT, Cgd |
| Amplifier | OTA, telescopic / folded cascode, two-stage op-amp | Amplify | Gain, GBW, phase margin, slew rate, swing | Intrinsic gain, headroom |
| Decision | Comparator (static / dynamic latch) | 1-bit decision | Offset, speed, kickback, noise, metastability | Matching, fT, 1/f noise |
| Reference | Bandgap, current reference | Stable voltage / current | Accuracy, temperature drift, PSRR, noise, minimum VDD, start-up | BJT/diode matching, resistor TC, op-amp offset |
| Power | LDO, buck, charge pump, POR | Regulate, convert voltage, power-on reset | Dropout, PSRR, Iq, efficiency, ripple, threshold accuracy | Pass-transistor Ron, power-transistor Ron·Qg, reliability (HCI/TDDB), VT distribution |
| Data conversion | SAR, pipeline, Δ-Σ, current-steering DAC, R-string DAC | Analog ↔ digital | ENOB, SNR, SFDR, INL/DNL | Comparator noise, capacitor / resistor / current-source matching, switch Ron and leakage, op-amp gain |
| Clocking | VCO, PLL, DLL, crystal oscillator, CDR | Generate, align, and recover clocks | Phase noise, jitter, spurs, lock time | 1/f noise upconversion, fT, inductor Q |
| Interface | SerDes, I/O, ESD | High-speed transceiving, external interfaces, electrostatic protection | BER, eye diagram, HBM/CDM rating | fT/fmax, gm/C, thick-oxide devices, snapback behavior, breakdown voltage |
| Sensing | Temperature sensor, PVT monitor | Measure temperature, voltage, and process speed | Accuracy after trim | BJT/diode, device speed, VT distribution |
| Filtering | Switched capacitor, Gm-C / active RC | Filtering, sample-and-hold, integration | Bandwidth, linearity, kT/C noise | Capacitor matching, switch charge injection, gm linearity |
| RF | LNA, mixer, PA | Low-noise amplification, frequency conversion, power transmission | NF, IIP3, output power, efficiency | fT/fmax, gate resistance, breakdown voltage, thermal |

### Composition examples: what a block contains

**Charge-pump PLL** [Inference]: PFD (digital) + charge pump (UP/DN current mirrors + switches) + loop filter (R, C) + VCO (ring or LC) + feedback divider (digital). Mismatch between the UP and DN mirrors of the charge pump causes static phase offset and reference spurs. This is one example of current-mirror error from §1 directly affecting PLL performance.

**SAR ADC** [Inference]: bootstrapped sampling switch + capacitor DAC (unit-capacitor array in common centroid) + dynamic comparator (differential pair + latch) + SAR logic (digital) + reference voltage buffer (similar to an LDO).

**LDO** [Inference]: bandgap + error amplifier (an OTA) + pass transistor + divider + compensation.

**One SerDes lane** [Inference]: transmitter (serializer + driver + FFE equalization) + channel + receiver (CTLE + DFE comparators + CDR) + shared PLL.

A pattern [Inference]: the higher the level, the larger the share of digital logic. In modern PLLs, SAR ADCs, and SerDes, the truly analog part is often only the sampling switch, comparator, VCO, charge pump, and front-end amplifier. The rest goes to digital logic and calibration. This is also why these IPs can follow advanced nodes.

### SerDes: the highway between chips

[Textbook] SerDes compresses wide parallel data inside the chip into high-speed serial data on one or two differential lines and restores it at the far end. The transmitter has a driver and feed-forward equalization (FFE). The receiver has continuous-time linear equalization (CTLE), decision-feedback equalization (DFE), and clock and data recovery (CDR), with a PLL alongside. The main metrics are bit error rate (BER), eye opening, and energy per bit. At the device level, fT/fmax and gm/C matter most.

[Vendor] Silicon Creations' SerDes PMA covers more than 30 protocols, including PCIe, JESD204B/C, CPRI, and 10G-KR, on processes from 180 nm to 4 nm ([AnySilicon: Silicon Creations](https://anysilicon.com/vendors/silicon-creations/)). The digital part of SerDes (PCS and control logic) often ships as soft RTL. For PCIe Gen4, the interface is a 16-bit bus at about 1 GHz, and the integrator must close its timing ([Rambus blog](https://www.rambus.com/blogs/overcoming-high-speed-serdes-ip-integration-challenges-part-2)).

### I/O and ESD: the chip's "doors" and "fuses"

[Textbook] I/O cells include pad drivers and receivers and usually use thick-oxide devices to withstand higher interface voltages. ESD protection includes diodes, grounded-gate NMOS (GGNMOS) or SCRs, and clamps between supply rails (rail clamps). These discharge human-body-model (HBM) and charged-device-model (CDM) events. ESD devices are judged on snapback behavior, breakdown voltage, on-resistance, and the area and capacitance they add to signal pins. ESD for high-speed interfaces is especially hard, because the capacitance of the protection devices eats bandwidth directly. This search found no dedicated public source on ESD and I/O cell structures.

[Vendor] In memory PHYs, I/O and analog are one piece: the Synopsys DDR PHY material lists programmable drive strength and ODT, ESD protection, PVT-compensated I/O, a low-jitter DLL, and dynamic drift detection and compensation ([Synopsys DDR multiPHY](https://www.synopsys.com/resources/ddr-multiphy-ip-datasheet.html)).

### Sensors and monitoring: the chip's "health check"

[Textbook] On-chip temperature sensors usually use the PTAT ΔV_BE (the same principle as the bandgap), digitized by a Δ-Σ or SAR ADC, with accuracy set by trimming. PVT monitors include ring oscillators that measure process speed and droop detectors that catch supply dips.

[Vendor] Vendors treat these as separate IP categories:
- Agile Analog has an "IC health and monitoring" subsystem (temperature sensor, IR-drop sensor) and a "security" subsystem (voltage glitch sensor, temperature sensor) ([Embedded Computing Design](https://embeddedcomputing.com/technology/analog-and-power/agile-analog-releases-a-full-set-of-key-analog-ips)).
- Synopsys groups PVT sensors under "silicon lifecycle management (SLM) IP," alongside interface IP and foundation IP ([Synopsys press release](https://news.synopsys.com/2025-04-29-Synopsys-and-Intel-Foundry-Propel-Angstrom-Scale-Chip-Designs-on-Intel-18A-and-Intel-18A-P-Technologies?asPDF=1)).

### A translation for logic process engineers

[Inference] Many device properties that analog cares about get little attention in logic optimization:
- Intrinsic gain gm·ro: falls as L shrinks; in FinFET, stacked gates mitigate this.
- 1/f noise, matching (AVT), ro, and DIBL.
- LDE.
- Passives: MOM/MIM capacitor density and matching, resistor temperature coefficient and matching, inductor Q.

Effects of logic process trends on analog:
- Lower VDD: less headroom; deep cascode stacks no longer fit.
- Width quantization: less sizing freedom.
- Higher fT: helps RF and SerDes.
- Undoped FinFET channel: better VT matching.

See the main guide for the definitions, extraction methods, and per-node data of these device metrics.

## 8. Analog IP: what every chip needs

**Almost every SoC needs a set of "foundation analog IP" (clocking, references, regulation, reset, monitoring, I/O and ESD, OTP), plus high-speed PHYs and data converters as the product requires; this IP is usually licensed as process-specific GDS hard macros, so "whether ready-made, silicon-proven analog IP exists on a node" often decides which node and which foundry a chip can use.**

Key points:
- Must-have tier: PLL, crystal-oscillator pad or on-chip RC oscillator, bandgap, POR, LDO, PVT/temperature sensors, GPIO with ESD, OTP/eFuse [Inference] (basis: the catalogs of [Agile Analog](https://embeddedcomputing.com/technology/analog-and-power/agile-analog-releases-a-full-set-of-key-analog-ips), [Analog Bits](https://semiwiki.com/ip/analog-bits/293408-analog-bits-is-supplying-analog-foundation-ip-on-the-industrys-most-advanced-finfet-processes/), and [Synopsys](https://news.synopsys.com/2025-04-29-Synopsys-and-Intel-Foundry-Propel-Angstrom-Scale-Chip-Designs-on-Intel-18A-and-Intel-18A-P-Technologies?asPDF=1) repeat the same set).
- Chosen by application: SerDes (PCIe/Ethernet/CXL), DDR/LPDDR/HBM PHY, UCIe/BoW die-to-die links, USB/MIPI, high-precision ADC/DAC, LC PLL [Inference].
- Soft vs. hard: digital IP is usually synthesizable RTL and largely process-independent. Analog and mixed-signal IP "is generally developed and licensed as hard IP," i.e., process-specific GDS that cannot be moved to another process ([AnySilicon](https://anysilicon.com/ip-intellectual-property-core-semiconductors/)) [Opinion].
- Porting is hard: it "often requires a from-scratch implementation," and going from 28 nm to 16 nm is "a completely different design" ([Synopsys blog](https://www.synopsys.com/blogs/chip-design/analog-circuit-design-migration.html); [Semiconductor Engineering](https://semiengineering.com/challenges-increase-for-ip-at-advanced-nodes)) [Vendor][Opinion].
- IP availability drives foundry choice: some companies decide which foundry and which node to use based on the IP available ([Semiconductor Engineering](https://semiengineering.com/challenges-increase-for-ip-at-advanced-nodes)) [Opinion].

### Catalog: what each IP does, whether it is required, and its metrics

[Figure: Detail of the RF/analog section of an ESP32 Wi-Fi/Bluetooth SoC die photo: spiral inductors and several analog blocks are visible. Note the spiral inductors: they are large passives common in RF and LC oscillator circuits, and their size is set by electromagnetics and barely shrinks with the process node. This is a visual reason why analog IP has trouble shrinking along with logic]

| IP | What it does | Required / by application | Key metrics |
|---|---|---|---|
| PLL (ring, fractional-N) | Generates clocks for cores, buses, and PHYs | Required [Inference] | Jitter (ring "as low as 1 ps RMS" [Vendor]), frequency range, lock time, area and power ([AnySilicon](https://anysilicon.com/vendors/silicon-creations/)) |
| LC PLL | Provides low-jitter clocks for high-speed SerDes | By application [Inference] | Jitter ("well below 300 fs RMS" [Vendor]) ([AnySilicon](https://anysilicon.com/vendors/silicon-creations/)) |
| Crystal-oscillator pad / RC oscillator | PLL reference; always-on domain, watchdog, low-power clock | Required [Inference] | Frequency accuracy, start-up, power; the RC oscillator needs no external components ([AnySilicon](https://anysilicon.com/vendors/silicon-creations/)) [Vendor] |
| Bandgap | Stable voltage reference | Required [Inference] | Initial accuracy, temperature drift, PSRR, noise |
| LDO | Local regulation; clean supply for sensitive blocks | Required [Inference] | Dropout, PSRR, Iq, transient response |
| POR / brownout detection | Holds reset until supplies are stable; flags supply dips during operation | Required [Inference] | Threshold accuracy, response time |
| PVT / temperature / IR-drop sensors | Monitor chip health; support frequency and voltage scaling | Required [Inference] (Synopsys lists it as SLM IP [Vendor]) | Measurement accuracy, conversion time |
| Voltage glitch sensor | Detects fault-injection attacks | By application (security) [Vendor] | Detection threshold, response speed ([Embedded Computing Design](https://embeddedcomputing.com/technology/analog-and-power/agile-analog-releases-a-full-set-of-key-analog-ips)) |
| GPIO + ESD | External interface and electrostatic protection | Required [Textbook] | Drive strength, voltage class, HBM/CDM rating |
| OTP / eFuse / antifuse | Stores trim values, keys, IDs, and configuration | Required [Inference] | Reliability, area, read-out security ([Synopsys OTP](https://www.synopsys.com/articles/non-volatile-memory.html)) [Vendor] |
| SerDes (PCIe/Ethernet/CXL) | High-speed serial chip-to-chip links | By application (data center, networking, AI) | BER, eye diagram, pJ/bit, protocol compliance |
| DDR/LPDDR/HBM PHY | Connects to external DRAM | By application (when external DRAM is used) | Data rate, timing margin, power; includes DLL and calibrated I/O ([Synopsys DDR](https://www.synopsys.com/resources/ddr-multiphy-ip-datasheet.html)) [Vendor] |
| UCIe / BoW / AIB | Die-to-die links between chiplets | By application (chiplet designs) | Bandwidth density (Tb/s/mm), pJ/bit, reach |
| USB / MIPI | Peripheral, camera, and display interfaces | By application (client, mobile, camera) | Protocol compliance, power |
| ADC / DAC | Sensor interfaces, audio, wireless baseband | By application (low-to-mid-precision SAR is also common in MCUs) [Inference] | ENOB, sample rate, power |

[Vendor] More on OTP: it is "the first circuit to start working as power ramps up," because other analog blocks first read their trim values from it ([Synopsys OTP](https://www.synopsys.com/articles/non-volatile-memory.html)). eFuse blows metal by electromigration. On FinFET it has large area and high leakage, and a blown link can "grow back." Antifuse relies on oxide breakdown, needs no extra masks, and is hard to read out with SEM. This material comes from an antifuse vendor and takes a side in its comparison with eFuse.

[Vendor] The two UCIe package options ([Synopsys UCIe technical bulletin](https://www.synopsys.com/designware-ip/technical-bulletin/ucie-multi-die-socs.html)):

| Parameter | Advanced package | Standard package |
|---|---|---|
| Data rate | 16 Gb/s | 16 Gb/s |
| Lanes per module | 64 | 16 |
| Bump pitch | 45 µm | 110 µm |
| Bandwidth density | 5.2 Tb/s/mm | 0.9 Tb/s/mm |
| Energy efficiency | 0.3 pJ/bit | 0.5 pJ/bit |
| Reach | ≤ 2 mm | ≤ 25 mm |
| Redundant lanes for repair | Yes | No |

### Groupings from vendor catalogs

[Vendor] Vendor catalogs give a practical way to group the IP:

| Source | Group / contents |
|---|---|
| Agile Analog ([Embedded Computing Design](https://embeddedcomputing.com/technology/analog-and-power/agile-analog-releases-a-full-set-of-key-analog-ips)) | Always-On: low-power RC oscillator, low-power bandgap, programmable comparator, POR, small digital cell library |
| | Power: LDO, POR, IR-drop sensor, bandgap |
| | Health and monitoring: temperature sensor, IR-drop sensor |
| | Security: voltage glitch sensor, temperature sensor |
| | Sensor interface: 8/10-bit SAR ADC, 8/10-bit DAC, comparator |
| | Wireless interface: SAR ADC, DAC, RC oscillator, LDO |
| Analog Bits, GF 12LP/12LP+ ([SemiWiki](https://semiwiki.com/ip/analog-bits/293408-analog-bits-is-supplying-analog-foundation-ip-on-the-industrys-most-advanced-finfet-processes/)) | Integer and fractional PLLs, PCIe Gen2/3 ring PLL, PCIe Gen4/5 LC PLL, PVT sensors, POR |
| Analog Bits, Samsung 32LP–5LPE (same source) | Low-power PLL, PCIe reference clock, chip-to-chip I/O, clock transceivers, oscillator pad, PVT sensors, power glitch detection, multi-protocol SerDes |
| Synopsys, Intel 18A/18A-P ([press release](https://news.synopsys.com/2025-04-29-Synopsys-and-Intel-Foundry-Propel-Angstrom-Scale-Chip-Designs-on-Intel-18A-and-Intel-18A-P-Technologies?asPDF=1)) | 224G Ethernet, PCIe 7.0, UCIe, USB4 PHY; foundation IP (embedded memory, logic libraries, I/O); PVT sensors |

A Samsung talk called foundation analog IP "a key differentiator for AI SoCs" ([SemiWiki](https://semiwiki.com/ip/analog-bits/293408-analog-bits-is-supplying-analog-foundation-ip-on-the-industrys-most-advanced-finfet-processes/)) [Vendor]. AnySilicon lists typical analog / mixed-signal hard IP as SerDes, PLL, ADC, DAC, and the PHY layer of DDR and PCIe. The matching digital parts (DRAM controller, Ethernet MAC, AMBA bus IP) are usually soft IP ([AnySilicon](https://anysilicon.com/ip-intellectual-property-core-semiconductors/)) [Opinion].

### How analog IP differs from digital IP

| Aspect | Digital IP | Analog / mixed-signal IP | Evidence |
|---|---|---|---|
| Delivery form | Soft: synthesizable RTL (SystemVerilog/VHDL), sometimes a generic gate-level netlist | Hard: process-specific GDS layout | [AnySilicon](https://anysilicon.com/ip-intellectual-property-core-semiconductors/)[Opinion] |
| Relation to process | "Generally process-independent"; back-end P&R can map it to any process | Tied to one PDK; "cannot be customized for different processes" | [Semiconductor Engineering](https://semiengineering.com/challenges-increase-for-ip-at-advanced-nodes); [AnySilicon](https://anysilicon.com/ip-intellectual-property-core-semiconductors/)[Opinion] |
| How the integrator uses it | Synthesizes, places and routes, and closes timing in house | Drops the GDS straight into the final layout and connects power, signals, and ESD per the rules | [AnySilicon](https://anysilicon.com/ip-intellectual-property-core-semiconductors/)[Opinion] |
| Moving to a new node | Re-synthesize, place and route, and sign off with the new standard-cell library | Redesign, new layout, re-simulation, new silicon validation | [Synopsys blog](https://www.synopsys.com/blogs/chip-design/analog-circuit-design-migration.html)[Vendor]; [Inference] |
| Corner coverage | Mainly through recharacterized standard-cell .lib files | The IP itself must run PVT, Monte Carlo, and parasitic corners | [Inference] |
| Main risks | Verification coverage and timing closure | Custom layout, post-layout re-centering, silicon characterization | [Inference] |
| Effect on node choice | Small | Large: IP readiness affects which node and foundry are chosen | [Semiconductor Engineering](https://semiengineering.com/challenges-increase-for-ip-at-advanced-nodes)[Opinion] |
| Physical location | Anywhere on the chip | High-speed PHYs must sit at the chip edge ("beachfront") | [Semiconductor Engineering](https://semiengineering.com/challenges-increase-for-ip-at-advanced-nodes)[Opinion] |

### Why analog IP is hard to port

[Vendor] Synopsys says analog migration "can be manual, time-consuming, and requires a deep understanding of circuit function," and "often requires a from-scratch implementation." At smaller nodes, LDE, parasitics, electromigration, and stress all increase, so pre-layout simulation alone is not enough at FinFET nodes ([Synopsys blog](https://www.synopsys.com/blogs/chip-design/analog-circuit-design-migration.html)).

[Opinion] A 2014 industry interview gives more specific reasons ([Semiconductor Engineering](https://semiengineering.com/challenges-increase-for-ip-at-advanced-nodes)):
- Hem Hingarh of Synapse Design, on FinFET: "fin width has a significant effect on VT." Add fin-count quantization, changed parasitic R/C, large Miller capacitance, contact resistance, and self-heating. "You have to start from scratch and even throw away some rules of thumb." Parasitic extraction corners have "increased to about 15 to 20," and simulation time grows with them.
- Kevin Yee of Cadence says going from 28 nm to 16 nm is "a completely different design." At 28 nm the PDK started at v1.0; at 16/14/10 nm it started at v0.3/0.5. This means IP has to be designed against immature models.
- Navraj Nandra of Synopsys says analog IP "must fit into the SoC beachfront," and that new protocols and digital scaling both force re-architecture, so "it is less about reuse than about getting it right from the start."

[Inference] For logic process integration, the conclusion is: when analog IP is ready on a new node depends on when the analog device models mature, not only on logic PPA. These models include VT and mismatch per fin / sheet count, flicker noise, LDE/stress, self-heating, and thin-metal EM rules. Each model change means the analog IP must be signed off and validated again.

### Foundry IP ecosystems and quality scoring

[Vendor] Foundries manage this with IP alliances and quality scores:
- **TSMC OIP IP Alliance**: provides "silicon-verified, production-proven, foundry-specific" IP. The page cites tens of thousands of IP options from 40 alliance members, and more than 60,000 IPs as of August 2023. Hard IP goes through physical review and pre-tapeout assessment (including design-kit and design-margin reviews) before test-chip tapeout. Major IP gets a test-chip tapeout review. After tapeout, typical and split-lot silicon assessments are based on test-chip characterization reports. Results are published as a TSMC9000 score, and "the more assessments passed, the higher the confidence"; TSMC9000A adds automotive assessment ([TSMC IP Alliance](https://www.tsmc.com/english/dedicatedFoundry/oip/ip_alliance.htm)).
- **Samsung SAFE**: as of June 2023, IP partners include Synopsys, Cadence, and Alphawave Semi, adding "dozens" of IPs for 3–8 nm processes ([Samsung press release](https://news.samsungsemiconductor.com/global/samsung-electronics-powers-enhanced-customer-development-support-with-expanded-safe-program/)).
- **Intel Foundry**: Synopsys joined the Intel Foundry Accelerator design services alliance and is a founding member of the chiplet alliance ([Synopsys press release](https://news.synopsys.com/2025-04-29-Synopsys-and-Intel-Foundry-Propel-Angstrom-Scale-Chip-Designs-on-Intel-18A-and-Intel-18A-P-Technologies?asPDF=1)). Cadence also announced design IP for 18A/18A-P ([Design & Reuse](https://us.design-reuse.com/news/57767/cadence-intel-18a-p-ip.html), search snippet only).

[Inference] Split-lot (fast / slow) silicon reports are where process variation shows up in analog margins. So "silicon-proven on corner lots" is a commercial prerequisite, not just good practice.

## 9. What an analog IP is made of: front end, back end, and deliverables

**An analog IP goes through the chain "specification → architecture → transistor-level schematic → pre-layout simulation → custom layout → physical verification → parasitic extraction and post-layout simulation → reliability checks → test chip and silicon characterization," and ships as a hard-macro package: GDS, LEF abstract, Liberty for the digital pins, behavioral models, netlists, verification reports, an integration guide, and a silicon characterization report.**

Key points:
- Cadence's basic flow is: specification → schematic → pre-layout simulation → layout → DRC/LVS → parasitic extraction → post-layout simulation → GDSII tapeout, with repeated iteration ([Cadence Community blog](https://community.cadence.com/cadence_blogs_8/b/cic/posts/from-schematic-to-silicon-a-basic-idea-on-analog-ic-design-flow)) [Vendor].
- At advanced nodes the back end gets heavier: more extraction corners, plus checks for self-heating, contact resistance, fin quantization, EM, and stress ([Semiconductor Engineering](https://semiengineering.com/challenges-increase-for-ip-at-advanced-nodes); [Synopsys blog](https://www.synopsys.com/blogs/chip-design/analog-circuit-design-migration.html)) [Opinion][Vendor].
- Getting silicon back after tapeout takes "several months"; only then do characterization and debug start ([Rambus blog](https://www.rambus.com/blogs/overcoming-high-speed-serdes-ip-integration-challenges-part-2)) [Vendor].
- Public sources confirm each part of the deliverables (Liberty, SDC, IBIS-AMI, GDS, characterization reports), but no single public document lists them all; the complete list is [Inference].
- Migration tools automate schematic mapping and layout template reuse. Vendors claim "up to 3x" faster or "weeks" saved, but silicon validation stays on the critical path ([Business Wire / Cadence](https://www.businesswire.com/news/home/20230925981631/en/Cadence-CustomAnalog-Design-Migration-Flow-Accelerates-Adoption-of-TSMC-Advanced-Process-Technologies); [Synopsys / Design & Reuse](https://us.design-reuse.com/news/54885/synopsys-tsmc-advance-analog-design-migration-advanced-tsmc-processes.html)) [Vendor].

### From specification to silicon validation: flow table

| Stage | What happens | Output | Evidence |
|---|---|---|---|
| 1. Specification | Define performance, power, area, interfaces, and operating conditions (voltage, temperature range) | Specification document | [Cadence blog](https://community.cadence.com/cadence_blogs_8/b/cic/posts/from-schematic-to-silicon-a-basic-idea-on-analog-ic-design-flow)[Vendor] |
| 2. Architecture | Choose the topology (e.g., ring or LC PLL, SAR or Δ-Σ) and allocate error and power budgets; behavioral models are often used for system simulation | Architecture document, behavioral models | [Inference] |
| 3. Schematic | Transistor-level design, sized with gm/ID and similar methods | Schematic, symbol | [Cadence blog](https://community.cadence.com/cadence_blogs_8/b/cic/posts/from-schematic-to-silicon-a-basic-idea-on-analog-ic-design-flow)[Vendor] |
| 4. Pre-layout simulation | Typical and PVT corners, Monte Carlo mismatch, noise, stability, transients | Simulation report; design margins | The Cadence article itself does not cover corners and Monte Carlo; for design centering across PVT corners see [Synopsys blog](https://www.synopsys.com/blogs/chip-design/analog-circuit-design-migration.html)[Vendor] |
| 5. Custom layout | Matched placement, guard rings, symmetric routing, power grid, dummies | Layout database | [Cadence blog](https://community.cadence.com/cadence_blogs_8/b/cic/posts/from-schematic-to-silicon-a-basic-idea-on-analog-ic-design-flow)[Vendor] |
| 6. Physical verification | DRC, LVS, ERC, antenna rules | Clean verification reports | [Cadence blog](https://community.cadence.com/cadence_blogs_8/b/cic/posts/from-schematic-to-silicon-a-basic-idea-on-analog-ic-design-flow)[Vendor]; ERC/antenna [Inference] |
| 7. Parasitic extraction + post-layout simulation | Extract R/C and rerun all pre-layout simulations; multiple extraction corners | Post-layout simulation report; back to step 3 or 5 if needed | [Cadence blog](https://community.cadence.com/cadence_blogs_8/b/cic/posts/from-schematic-to-silicon-a-basic-idea-on-analog-ic-design-flow)[Vendor]; [Semiconductor Engineering](https://semiengineering.com/challenges-increase-for-ip-at-advanced-nodes)[Opinion] |
| 8. Reliability checks | EM/IR, self-heating, stress, aging | EM/IR and reliability reports | [Synopsys blog](https://www.synopsys.com/blogs/chip-design/analog-circuit-design-migration.html)[Vendor] |
| 9. Foundry pre-review | Design-kit and design-margin reviews; test-chip tapeout review for major IP | Pre-tapeout assessment records | [TSMC IP Alliance](https://www.tsmc.com/english/dedicatedFoundry/oip/ip_alliance.htm)[Vendor] |
| 10. Test-chip tapeout | Place the IP on a test chip with isolated test paths, loopback, and observability | GDSII / OASIS | [Rambus blog](https://www.rambus.com/blogs/overcoming-high-speed-serdes-ip-integration-challenges-part-2)[Vendor] |
| 11. Silicon characterization | Measure metrics on typical and split-lot parts; package, board, socket, and soldering variation | Characterization report; known-issues list | [TSMC IP Alliance](https://www.tsmc.com/english/dedicatedFoundry/oip/ip_alliance.htm); [Rambus blog](https://www.rambus.com/blogs/overcoming-high-speed-serdes-ip-integration-challenges-part-2)[Vendor] |
| 12. Release and support | Package for delivery; support customer integration and bring-up | Delivery package (see the table below); quality score | [TSMC IP Alliance](https://www.tsmc.com/english/dedicatedFoundry/oip/ip_alliance.htm)[Vendor] |

This chain maps to the earlier sections: step 3 uses the building blocks of §1–§5, step 5 uses the layout rules of §1 and §6, and the Monte Carlo runs in steps 4 and 7 compute the Pelgrom mismatch of §1.

[Inference] The digital IP counterpart is: RTL → lint and CDC checks → functional verification (UVM, coverage) → synthesis to the target standard-cell library → P&R → STA and power sign-off. Risk in the analog flow concentrates in custom layout, post-layout re-centering, and silicon characterization. Risk in the digital flow concentrates in verification coverage and timing closure.

### Advanced nodes make the back end heavier

[Opinion] Hingarh notes that parasitic extraction corners at advanced nodes have grown to about 15–20, and verification must also cover self-heating, contact resistance, and fin quantization effects. IP designers must do "much more effective circuit characterization" at the cell, block, and IP levels ([Semiconductor Engineering](https://semiengineering.com/challenges-increase-for-ip-at-advanced-nodes)). [Vendor] Synopsys' AI optimizer re-centers migrated circuits across "hundreds of PVT corners" ([Synopsys blog](https://www.synopsys.com/blogs/chip-design/analog-circuit-design-migration.html)). Public sources give no authoritative "standard number of sign-off corners."

[Opinion] Rambus lists the difficulties of SerDes silicon bring-up: lab equipment, package and board reviews, board-to-board variation, socket and soldering variation, and failures that "only show up in a particular Monte Carlo sample" ([Rambus blog](https://www.rambus.com/blogs/overcoming-high-speed-serdes-ip-integration-challenges-part-2)).

### Deliverables: what is in a hard-macro package

| File | Purpose | Who uses it | Evidence |
|---|---|---|---|
| GDSII / OASIS | Final layout, placed in the chip top level | Integrator's layout and tapeout team | [AnySilicon](https://anysilicon.com/ip-intellectual-property-core-semiconductors/)[Opinion] |
| LEF / abstract view | Pins, blockages, and usable routing layers for automatic place and route | Integrator's P&R team | [Inference] |
| Liberty (.lib/.db) | Timing arcs and power of the IP's digital pins, often at multiple PVT corners | Integrator's STA and power sign-off | Rambus lists Liberty for the hardened AFE and digital interface ([Rambus blog](https://www.rambus.com/blogs/overcoming-high-speed-serdes-ip-integration-challenges-part-2)) [Vendor] |
| SDC constraints | Clocks, clock groups, clock-domain crossings | Integrator's synthesis and STA | [Rambus blog](https://www.rambus.com/blogs/overcoming-high-speed-serdes-ip-integration-challenges-part-2)[Vendor] |
| Verilog behavioral model; Verilog-AMS / real-number model | Chip-level functional simulation and mixed-signal verification | Integrator's verification team | [Inference]; Rambus mentions support for back-annotated gate-level simulation [Vendor] |
| CDL / SPICE netlist | LVS and transistor-level simulation | Integrator's physical verification team | [Inference] |
| DRC/LVS/ERC/antenna reports | Show that the IP was checked with the foundry sign-off rules (a specified version) | Integrator and foundry | [Inference] |
| EM/IR reports | Show that current density and voltage drop meet the rules | Integrator's power-integrity team | [Inference] |
| IBIS / IBIS-AMI models | Channel simulation for I/O and SerDes; AMI is an executable TX/RX model, including equalization and CDR, that can simulate far more bits than SPICE | Package and board signal-integrity team | [MathWorks](https://www.mathworks.com/help/serdes/ug/understanding-ibis-ami-simulations.html)[Textbook] |
| Datasheet, integration and user guides | Floorplanning, power domains, ESD rules, keep-out zones, decoupling, bump and pad requirements; clocking application notes | Integrator's architecture, layout, and package teams | Rambus clocking application notes ([Rambus blog](https://www.rambus.com/blogs/overcoming-high-speed-serdes-ip-integration-challenges-part-2)) [Vendor]; the rest [Inference] |
| Package / board application notes | Sign-off criteria for crosstalk, impedance, skew, decoupling, insertion and return loss, and regulator noise | Package and board teams | [Rambus blog](https://www.rambus.com/blogs/overcoming-high-speed-serdes-ip-integration-challenges-part-2)[Vendor] |
| DFT / BIST material | Loopback, PRBS, scan for the digital wrapper; UCIe also includes link training, calibration, and test-and-repair logic | Test team | [Synopsys UCIe](https://www.synopsys.com/designware-ip/technical-bulletin/ucie-multi-die-socs.html)[Vendor]; the rest [Inference] |
| Debug tools | Eye-diagram and impulse-response analyzers | Bring-up engineers | [Rambus blog](https://www.rambus.com/blogs/overcoming-high-speed-serdes-ip-integration-challenges-part-2)[Vendor] |
| Soft RTL (digital part of the PHY) | PCS and control logic, synthesized and timing-closed by the integrator | Integrator's front-end team | [Rambus blog](https://www.rambus.com/blogs/overcoming-high-speed-serdes-ip-integration-challenges-part-2); the DDR PHY comes with a soft DFI interface ([Synopsys DDR](https://www.synopsys.com/resources/ddr-multiphy-ip-datasheet.html)) [Vendor] |
| Silicon characterization / qualification reports | Measured data on typical and split-lot parts; known issues | Integrator's selection and quality teams; foundry scoring | [TSMC IP Alliance](https://www.tsmc.com/english/dedicatedFoundry/oip/ip_alliance.htm)[Vendor] |

[Inference] Deliverables for digital soft IP are usually RTL, SDC, a testbench or VIP, synthesis scripts, and DFT/scan-insertion guides, sometimes with a hardened netlist or GDS for a given node. The difference is easy to see: digital IP delivers "how to build it," while analog IP delivers "the finished thing and how to use it correctly."

### Migration automation and schedule: tools are speeding up, silicon is still the bottleneck

[Vendor] What the main vendors say:
- **Cadence + TSMC (September 2023)**: the Virtuoso Studio migration flow migrates schematic cells, parameters, pins, and wiring, re-simulates with ADE, and tunes to spec. Generative layout technology recognizes device groups in the old layout and applies them to the new one. Supported paths are N40→N22, N22→N12, N12→N6, N6→N4, N5→N3E, N4/N5→N3E, and N3E→N2. Customers report "up to 3x" faster than manual migration ([Business Wire / Cadence](https://www.businesswire.com/news/home/20230925981631/en/Cadence-CustomAnalog-Design-Migration-Flow-Accelerates-Adoption-of-TSMC-Advanced-Process-Technologies)).
- **Synopsys + TSMC (September 2023)**: the analog migration reference flow covers N4P, N3E, and N2. It includes machine-learning-based schematic migration, template-based layout migration, and "parasitic-aware, AI-driven optimization," and is claimed to "save weeks of engineering time" ([Design & Reuse / Synopsys](https://us.design-reuse.com/news/54885/synopsys-tsmc-advance-analog-design-migration-advanced-tsmc-processes.html)). Synopsys also cites "a shortfall of 23,000 engineers by 2030" as background ([Synopsys blog](https://www.synopsys.com/blogs/chip-design/analog-circuit-design-migration.html)).
- **Agile Analog**: uses Composa to regenerate analog IP from the target PDK, in place of a "redesign" for every process ([eeNews Europe](https://www.eenewseurope.com/en/process-agnostic-analog-ip-tackles-fab-capacity-challenges/)).

None of these figures has an independent benchmark. Public sources also give no reliable figure for "how many months it takes to port a SerDes, PLL, or DDR PHY."

[Inference] Tools can automate schematic mapping and layout template reuse, but they cannot handle physical changes: width quantization from fin to nanosheet, new mismatch and flicker-noise models, IR and parasitic changes from backside power delivery, and tighter EM limits. The remaining work therefore concentrates on re-centering and revalidation. Even if tools are 3x faster, test-chip silicon (several months) is still on the critical path. "Process-agnostic" generative approaches and ring PLLs that span 180 nm to 3 nm both favor more digital, more scalable architectures. LC tanks, high-precision ADCs, and SerDes front ends remain highly node-dependent.

## 10. More figures: reliable public resources

**For more real schematics, layouts, and die photos, the most reliable sources are open-source PDK and open-source course repositories (where the original design files can be opened directly), Wikimedia Commons (circuit diagrams with stated licenses), and a few courses and application notes that can only be linked, not reproduced.**

Key points:
- Figures in open-source course and PDK repositories are real designs exported from tools, not illustrations. More than half of this page's figures come from them.
- Wikimedia Commons circuit diagrams all state author and license and can be reproduced under that license.
- MIT OCW is CC BY-NC-SA (non-commercial), and TI application notes are copyrighted: these are suitable only for reading via links.
- To get a real common-centroid layout, the most practical option today is to generate one yourself with an open-source generator.

### Open-source courses and PDK repositories (original files downloadable)

- [iic-jku/analog-circuit-design](https://github.com/iic-jku/analog-circuit-design): Harald Pretl's open-source analog course, Apache-2.0. It has xschem schematics (current mirrors and variants, five-transistor OTA, improved OTA, bandgap) using IHP SG13G2 devices, with ngspice simulation setups. This page's current-mirror variant, five-transistor OTA, and CMOS bandgap figures come from here.
- [google/skywater-pdk-libs-sky130_fd_pr](https://github.com/google/skywater-pdk-libs-sky130_fd_pr): SkyWater SKY130 device library, Apache-2.0. Each device has GDS and an official SVG render, plus model-generated I–V curves. This page's multi-finger NFET layout and Ids–Vds curves come from here.
- [SkyWater PDK device documentation](https://skywater-pdk.readthedocs.io/en/main/rules/device-details.html): descriptions of each device; the repository also has reusable cross-section figures.
- [ALIGN-analoglayout/ALIGN-public](https://github.com/ALIGN-analoglayout/ALIGN-public): open-source automatic analog layout generator, BSD-3-Clause. This page's common-centroid placement figure comes from here.
- [OpenFASOC gLayout](https://openfasoc.readthedocs.io/en/latest/notebooks/glayout/glayout_opamp.html): generates real GDS for current mirrors, differential pairs, common-centroid (ABBA) and interdigitated structures, and two-stage op-amps in SKY130/GF180.

### Tiny Tapeout: open-source analog designs that went to silicon

- [atenfyr/ttsky_analog](https://github.com/atenfyr/ttsky_analog): Miller OTA, beta-multiplier current reference, compensation capacitors, and transmission-gate mux, with an annotated layout. Chip page: [Tiny Tapeout ttsky26a #520](https://tinytapeout.com/chips/ttsky26a/520).
- [spasquale25/OTA](https://github.com/spasquale25/OTA): GDS of a SKY130 five-transistor OTA; the 25 µm × 20 µm cell shows the PMOS mirror load, the NMOS input pair, and the tail current mirror.

### Wikimedia Commons: circuit diagrams with stated licenses

All Commons figures used on this page can be viewed at full size, with their licenses, on the original pages:
- [Simple MOSFET mirror](https://commons.wikimedia.org/wiki/File:Simple_MOSFET_mirror.PNG), [Kaskode-Stromspiegel (MOS)](https://commons.wikimedia.org/wiki/File:Kaskode-Stromspiegel_(MOS).svg), [Wilson-Stromspiegel (MOS)](https://commons.wikimedia.org/wiki/File:Wilson-Stromspiegel_(MOS).svg), [Wide-swing MOSFET mirror](https://commons.wikimedia.org/wiki/File:Wide-swing_MOSFET_mirror.svg)
- [Single Supply CMOS OpAmp](https://commons.wikimedia.org/wiki/File:Single_Supply_CMOS_OpAmp.svg), [Dynamic Comparator](https://commons.wikimedia.org/wiki/File:Dynamic_Comparator.png), [Brokaw cell theory](https://commons.wikimedia.org/wiki/File:Brokaw_cell_theory.gif), [Low-dropout regulator circuit](https://commons.wikimedia.org/wiki/File:Low-dropout-regulator-circuit.svg)
- [Analog PLL (block diagram)](https://commons.wikimedia.org/wiki/File:Analog_PLL_(block_diagram).PNG), [SA ADC block diagram](https://commons.wikimedia.org/wiki/File:SA_ADC_block_diagram.png), [2nd order delta-sigma modulation loop](https://commons.wikimedia.org/wiki/File:2nd_order_delta-sigma_modulation_loop.svg)
- [Vlsiopamp2 (op-amp layout)](https://commons.wikimedia.org/wiki/File:Vlsiopamp2.gif), [Doublegate FinFET](https://commons.wikimedia.org/wiki/File:Doublegate_FinFET-en.svg), [ESP32 RF die](https://commons.wikimedia.org/wiki/File:Esp32-rf-HD.jpg)

Similar figures not used on this page but worth a look:
- [Charge pump circuit](https://commons.wikimedia.org/wiki/File:ChargePumpPLLCircuit.svg): two ICP current sources, controlled by Up/Down switches, charge and discharge the loop capacitor.
- [PLL block diagram with charge pump](https://commons.wikimedia.org/wiki/File:PLL_generic_inline_optional_N.svg)
- [Charge-redistribution DAC](https://commons.wikimedia.org/wiki/File:ChargeScalingDAC.png): the binary-weighted capacitor array used in SAR ADCs.
- [Track-and-latch comparator](https://commons.wikimedia.org/wiki/File:Track_and_Latch_Comparator.svg)
- [MOSFET output characteristics with CLM](https://commons.wikimedia.org/wiki/File:MOSFET_enhancement-mode_n-channel_en.svg)
- [CMOS LDO die (Torex XC6206)](https://commons.wikimedia.org/wiki/File:Torex-XC6206-HD.jpg), [CMOS PLL die (CD4046)](https://commons.wikimedia.org/wiki/File:Ti-CD4046BE-50-HD.jpg)

### Courses, notes, and image sites for link-only reading

- [MIT OCW 6.012 Microelectronic Devices and Circuits](https://ocw.mit.edu/courses/6-012-microelectronic-devices-and-circuits-fall-2009/): from devices to basic circuits, CC BY-NC-SA (non-commercial).
- [MIT OCW 6.776 High Speed Communication Circuits](https://ocw.mit.edu/courses/6-776-high-speed-communication-circuits-spring-2005/): PLLs, VCOs, and high-speed circuits, CC BY-NC-SA (non-commercial).
- [TAMU ECEN474 Lecture 8: Current Mirrors](https://people.engr.tamu.edu/spalermo/ecen474/lecture08_ee474_current_mirrors.pdf) and [UTK ECE532 Lecture 6](https://web.eecs.utk.edu/~bblalock/ece532/lecture_06.pdf): the main sources of this page's current-mirror formulas.
- [TI SLVA079: LDO terms and definitions](https://www.ti.com/lit/an/slva079/slva079.pdf): a systematic explanation of LDO metrics.
- [Ken Shirriff's blog](https://www.righto.com/): transistor-by-transistor readings of analog chip die photos.
- [Zeptobars](https://zeptobars.com/en/): the original source of this page's ESP32 die photo, with many high-resolution die photos.

## Sources

- [Wikipedia: Current mirror](https://en.wikipedia.org/wiki/Current_mirror)
- [Wikipedia: Wilson current mirror](https://en.wikipedia.org/wiki/Wilson_current_mirror)
- [Wikipedia: Bandgap voltage reference](https://en.wikipedia.org/wiki/Bandgap_voltage_reference)
- [Wikipedia: Low-dropout regulator](https://en.wikipedia.org/wiki/Low-dropout_regulator)
- [Wikipedia: Analog-to-digital converter](https://en.wikipedia.org/wiki/Analog-to-digital_converter)
- [Wikipedia: Charge-pump phase-locked loop](https://en.wikipedia.org/wiki/Charge-pump_phase-locked_loop)
- [TAMU ECEN474 Lecture 8: Current Mirrors (S. Palermo)](https://people.engr.tamu.edu/spalermo/ecen474/lecture08_ee474_current_mirrors.pdf)
- [UTK ECE532 Lecture 06 (B. Blalock)](https://web.eecs.utk.edu/~bblalock/ece532/lecture_06.pdf)
- [Harvard ES154 Lecture 15: Differential pair](https://in.ncu.edu.tw/~ncume_ee/harvard-es154/lect_15_diff_pair_2.pdf)
- [Pelgrom, Tuinhout, Vertregt: Transistor matching in analog CMOS applications (IEDM 1998)](https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf)
- [Sheikholeslami: Process variation and Pelgrom's law (IEEE SSC Magazine)](https://www.eecg.utoronto.ca/~ali/papers/mag-win-15-process-variation.pdf)
- [Pulsic: Current Mirrors in Analog Layout](https://pulsic.com/?p=1)
- [Tech Design Forums: How to design with finFETs](https://www.techdesignforums.com/practice/?p=5259)
- [Sharma et al.: Constructive Place-and-Route for FinFET-Based Transistor Arrays in Analog Circuits Under Nonlinear Gradients (NSF PAR)](https://par.nsf.gov/servlets/purl/10540359)
- [US 7,755,419: Low power beta multiplier start-up circuit](https://patents.google.com/patent/US7755419)
- [US 8,598,862: Start-up circuit for cascoded beta multiplier](https://patents.google.com/patent/US8598862)
- [US 8,450,992: Wide-swing cascode current mirror](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/8450992)
- [US 7,012,415: Wide swing, low power current mirror](https://patents.google.com/patent/US7012415)
- [US 12,446,321: Fin boundaries](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12446321)
- [DATE 2021 paper (FinFET analog layout)](https://past.date-conference.com/proceedings-archive/2021/pdf/1829.pdf)
- [ASP-DAC 2022 paper 2B-3](https://www.aspdac.com/aspdac2022/taoka/pdf/2B-3.pdf)
- [Electronic Design: What's the difference between SAR and delta-sigma ADCs](https://www.electronicdesign.com/technologies/analog/adc/article/21801636/whats-the-difference-between-sar-and-delta-sigma-adcs)
- [AnySilicon: Silicon Creations vendor page](https://anysilicon.com/vendors/silicon-creations/)
- [Design & Reuse: Silicon Creations fractional-N PLL milestone (Nov 2024)](https://us.design-reuse.com/news/57049/silicon-creations-milestone-fractional-n-pll.html)
- [SemiWiki: Analog Bits analog foundation IP on advanced FinFET processes](https://semiwiki.com/ip/analog-bits/293408-analog-bits-is-supplying-analog-foundation-ip-on-the-industrys-most-advanced-finfet-processes/)
- [Embedded Computing Design: Agile Analog releases a full set of key analog IPs](https://embeddedcomputing.com/technology/analog-and-power/agile-analog-releases-a-full-set-of-key-analog-ips)
- [Synopsys and Intel Foundry press release (Apr 2025)](https://news.synopsys.com/2025-04-29-Synopsys-and-Intel-Foundry-Propel-Angstrom-Scale-Chip-Designs-on-Intel-18A-and-Intel-18A-P-Technologies?asPDF=1)
- [AnySilicon: IP core (soft vs hard IP)](https://anysilicon.com/ip-intellectual-property-core-semiconductors/)
- [Synopsys DDR multiPHY datasheet page](https://www.synopsys.com/resources/ddr-multiphy-ip-datasheet.html)
- [Synopsys technical bulletin: UCIe for multi-die SoCs](https://www.synopsys.com/designware-ip/technical-bulletin/ucie-multi-die-socs.html)
- [Synopsys: Non-volatile memory (OTP) article](https://www.synopsys.com/articles/non-volatile-memory.html)
- [Semiconductor Engineering: Challenges Increase For IP At Advanced Nodes (2014)](https://semiengineering.com/challenges-increase-for-ip-at-advanced-nodes)
- [Synopsys blog: Analog circuit design migration](https://www.synopsys.com/blogs/chip-design/analog-circuit-design-migration.html)
- [eeNews Europe: Process-agnostic analog IP tackles fab capacity challenges](https://www.eenewseurope.com/en/process-agnostic-analog-ip-tackles-fab-capacity-challenges/)
- [TSMC OIP IP Alliance](https://www.tsmc.com/english/dedicatedFoundry/oip/ip_alliance.htm)
- [Samsung Semiconductor newsroom: Expanded SAFE program (June 2023)](https://news.samsungsemiconductor.com/global/samsung-electronics-powers-enhanced-customer-development-support-with-expanded-safe-program/)
- [Design & Reuse: Cadence IP for Intel 18A-P](https://us.design-reuse.com/news/57767/cadence-intel-18a-p-ip.html)
- [Rambus blog: Overcoming high-speed SerDes IP integration challenges, part 2](https://www.rambus.com/blogs/overcoming-high-speed-serdes-ip-integration-challenges-part-2)
- [Cadence Community blog: From schematic to silicon, a basic idea on analog IC design flow](https://community.cadence.com/cadence_blogs_8/b/cic/posts/from-schematic-to-silicon-a-basic-idea-on-analog-ic-design-flow)
- [MathWorks: Understanding IBIS-AMI simulations](https://www.mathworks.com/help/serdes/ug/understanding-ibis-ami-simulations.html)
- [Business Wire: Cadence custom/analog design migration flow for TSMC processes (Sept 2023)](https://www.businesswire.com/news/home/20230925981631/en/Cadence-CustomAnalog-Design-Migration-Flow-Accelerates-Adoption-of-TSMC-Advanced-Process-Technologies)
- [Design & Reuse: Synopsys and TSMC advance analog design migration (Sept 2023)](https://us.design-reuse.com/news/54885/synopsys-tsmc-advance-analog-design-migration-advanced-tsmc-processes.html)
- [iic-jku/analog-circuit-design (Harald Pretl)](https://github.com/iic-jku/analog-circuit-design)
- [google/skywater-pdk-libs-sky130_fd_pr](https://github.com/google/skywater-pdk-libs-sky130_fd_pr)
- [SkyWater PDK device details documentation](https://skywater-pdk.readthedocs.io/en/main/rules/device-details.html)
- [ALIGN-analoglayout/ALIGN-public](https://github.com/ALIGN-analoglayout/ALIGN-public)
- [OpenFASOC gLayout op-amp notebook](https://openfasoc.readthedocs.io/en/latest/notebooks/glayout/glayout_opamp.html)
- [atenfyr/ttsky_analog](https://github.com/atenfyr/ttsky_analog)
- [Tiny Tapeout ttsky26a #520](https://tinytapeout.com/chips/ttsky26a/520)
- [spasquale25/OTA](https://github.com/spasquale25/OTA)
- [Wikimedia Commons: Simple MOSFET mirror](https://commons.wikimedia.org/wiki/File:Simple_MOSFET_mirror.PNG)
- [Wikimedia Commons: Kaskode-Stromspiegel (MOS)](https://commons.wikimedia.org/wiki/File:Kaskode-Stromspiegel_(MOS).svg)
- [Wikimedia Commons: Wilson-Stromspiegel (MOS)](https://commons.wikimedia.org/wiki/File:Wilson-Stromspiegel_(MOS).svg)
- [Wikimedia Commons: Wide-swing MOSFET mirror](https://commons.wikimedia.org/wiki/File:Wide-swing_MOSFET_mirror.svg)
- [Wikimedia Commons: Single Supply CMOS OpAmp](https://commons.wikimedia.org/wiki/File:Single_Supply_CMOS_OpAmp.svg)
- [Wikimedia Commons: Dynamic Comparator](https://commons.wikimedia.org/wiki/File:Dynamic_Comparator.png)
- [Wikimedia Commons: Brokaw cell theory](https://commons.wikimedia.org/wiki/File:Brokaw_cell_theory.gif)
- [Wikimedia Commons: Low-dropout regulator circuit](https://commons.wikimedia.org/wiki/File:Low-dropout-regulator-circuit.svg)
- [Wikimedia Commons: Analog PLL (block diagram)](https://commons.wikimedia.org/wiki/File:Analog_PLL_(block_diagram).PNG)
- [Wikimedia Commons: SA ADC block diagram](https://commons.wikimedia.org/wiki/File:SA_ADC_block_diagram.png)
- [Wikimedia Commons: 2nd order delta-sigma modulation loop](https://commons.wikimedia.org/wiki/File:2nd_order_delta-sigma_modulation_loop.svg)
- [Wikimedia Commons: Vlsiopamp2](https://commons.wikimedia.org/wiki/File:Vlsiopamp2.gif)
- [Wikimedia Commons: Doublegate FinFET](https://commons.wikimedia.org/wiki/File:Doublegate_FinFET-en.svg)
- [Wikimedia Commons: ESP32 RF die (Zeptobars)](https://commons.wikimedia.org/wiki/File:Esp32-rf-HD.jpg)
- [Wikimedia Commons: Charge pump PLL circuit](https://commons.wikimedia.org/wiki/File:ChargePumpPLLCircuit.svg)
- [Wikimedia Commons: PLL generic inline optional N](https://commons.wikimedia.org/wiki/File:PLL_generic_inline_optional_N.svg)
- [Wikimedia Commons: Charge scaling DAC](https://commons.wikimedia.org/wiki/File:ChargeScalingDAC.png)
- [Wikimedia Commons: Track and Latch Comparator](https://commons.wikimedia.org/wiki/File:Track_and_Latch_Comparator.svg)
- [Wikimedia Commons: MOSFET enhancement-mode n-channel characteristics](https://commons.wikimedia.org/wiki/File:MOSFET_enhancement-mode_n-channel_en.svg)
- [Wikimedia Commons: Torex XC6206 die](https://commons.wikimedia.org/wiki/File:Torex-XC6206-HD.jpg)
- [Wikimedia Commons: TI CD4046BE die](https://commons.wikimedia.org/wiki/File:Ti-CD4046BE-50-HD.jpg)
- [MIT OCW 6.012 Microelectronic Devices and Circuits](https://ocw.mit.edu/courses/6-012-microelectronic-devices-and-circuits-fall-2009/)
- [MIT OCW 6.776 High Speed Communication Circuits](https://ocw.mit.edu/courses/6-776-high-speed-communication-circuits-spring-2005/)
- [TI SLVA079: Understanding the terms and definitions of LDO voltage regulators](https://www.ti.com/lit/an/slva079/slva079.pdf)
- [Ken Shirriff's blog](https://www.righto.com/)
- [Zeptobars](https://zeptobars.com/en/)


---

# Q&A: speed, VT and flicker noise

This Q&A is for engineers who know logic process integration but are new to analog and high-speed circuits. It first explains what analog circuits are fundamentally after (Q0), then answers six groups of common questions. First, CMOS circuit speed does depend on the ratio of drive current to load capacitance (I/C, the inverse of CV/I), and the comparison must be made at the same Ioff and the same footprint; but CML, amplifiers, pads and long wires each have their own bottleneck, set by gm/C, fT/fmax and RC. Second, "lower VT gives more drive and more leakage" is a direct, quantitative relation: leakage grows exponentially as 10^(−ΔVT/SS), while drive grows only as a power law, (VDD−VT)^α, far weaker than exponential. "Lower VT gives worse flicker noise" is not a direct relation. In the CNF+CMF model, VT itself does not appear in the noise equation; noise depends only on trap density and bias point. The real noise differences come through two indirect paths: the comparison basis (same VGS or same ID) and the process method used to lower VT (dipole, cap-layer element diffusion, halo doping). Third, flicker noise per unit area improved by about an order of magnitude overall from bulk to FinFET, and nanosheet is roughly on par with planar devices that use the same gate stack; but the noise of a single minimum device and the device-to-device spread got worse, because area shrank faster than trap density fell. Fourth, the first-order knob for lower noise is the trap density of the gate stack, followed by EOT, anneal, channel design and area; on the circuit side, chopping and auto-zero do the work. Fifth, when the data rate falls short, first locate which block is the bottleneck and which metric limits it, then stack methods in three tiers (easy, medium, hard), with matching verification at each step. Finally, five short topics on high-speed and analog design are appended.

## Overview: start with this table

**Find the one-line answer for your question first, then jump to its section for the evidence and details.**

Evidence tags: [Textbook] textbook or general knowledge; [Silicon · research] measurements on research devices or research circuits; [Silicon · production platform] published data from production or near-production processes; [TCAD] device simulation; [Simulation] circuit or SPICE model simulation; [Vendor] briefs or application notes from vendors and standards bodies; [Opinion] judgments from reviews, roadmaps or industry articles; [Inference] this report's own reasoning; [Illustration] example numbers set up to explain a method, not measurements.

| Question | One-line answer | Section |
|---|---|---|
| What are analog circuits really after? | Amplify and convert continuous signals with as little distortion as possible on a limited power budget; gain gm·Rout is the means, and inside negative feedback it is traded for accuracy, linearity and speed | Q0 |
| Is speed about the I/C ratio? | Yes for CMOS logic, clocks and serializers, and the comparison must be at the same Ioff and the same footprint; CML depends on gm/C, pads on R·C, tuned RF on fmax | Q1 |
| Does lower VT make flicker noise worse? | Drive and leakage change directly with VT; flicker does not, and the differences come from the comparison basis and the process method used to lower VT | Q2 |
| bulk → FinFET → nanosheet: does flicker get better or worse? | Per unit area about 10× better (mostly at the FinFET step), nanosheet roughly flat; single minimum devices and spread get worse | Q3 |
| How to optimize flicker? Where is it heading? | Process: lower gate-stack trap density, thin EOT, anneal, undoped channel; device choice: large area, thin-oxide core devices; circuit: low overdrive and chopping; direction: co-optimize the gate stack with reliability | Q4 |
| How to speed up when the data rate falls short? | Locate the bottleneck block and metric first, then stack three tiers: easy (tuning, device choice, VDD), medium (block redesign, process tweaks), hard (new process modules, packaging and architecture) | Q5 |
| What do fT, fmax and CV/I each govern? | fT = gm/C governs broadband amplification, fmax adds Rg and governs tuned RF, CV/I governs digital gate delay | Q6 |
| What does data rate demand of devices? | UI = 1/data rate, NRZ Nyquist = data rate/2, PAM4 halves it again; NRZ front-end bandwidth is about 0.5–0.7× the data rate (PAM4 uses the symbol rate, roughly half) | Q7 |
| Why do pad, ESD and bump capacitance matter? | With termination resistance fixed, the pad pole is set by capacitance alone; 2.5D/3D packaging addresses this by shortening the channel and lowering ESD and bump capacitance | Q8 |
| How do jitter and noise relate? | Random jitter is the integral of phase noise; device flicker noise upconverts into close-in phase noise, and the PLL loop suppresses only the part inside the loop bandwidth | Q9 |
| Why is analog cautious with the lowest VT and shortest L? | Low gain, large mismatch, high leakage, high 1/f; high-speed paths still use them for speed, then recover with calibration and equalization | Q10 |

## Q0. What are analog circuits really after?

**Analog circuits are not after "amplification" itself. They aim to pass, amplify or convert a continuously varying physical signal with as little distortion as possible, under limited power and supply voltage. Gain gm·Rout is the means: put high gain inside negative feedback, and you get a result that is accurate, linear and almost independent of device parameters.**

Key points:
- [Textbook] Digital circuits encode information as 0 and 1, and each stage "regenerates" the signal back to clean levels; errors smaller than the noise margin are simply dropped. In analog circuits the information is in the continuous value of the signal, so every bit of noise, distortion, offset and drift becomes information error and cannot be removed afterward.
- What gets amplified is the "small change" in the signal: a µV–mV signal from a sensor, an antenna or the end of a long wire is raised to a level that the next stage (ADC, comparator) can resolve reliably. The quantity can be voltage, current or charge; in RF it is power.
- gm turns input voltage into current, and Rout turns that current back into voltage, so single-stage voltage gain = gm·Rout. This number is "the most a single stage can amplify", and it is also the upper bound on accuracy once the stage is placed in feedback.
- High gain inside negative feedback buys four things: accuracy (error about 1/(A·β)), linearity, bandwidth and low output impedance. It also makes the result depend only on ratios of resistors and capacitors, not on the transistors themselves.
- So analog design trades off eight quantities: noise, linearity, gain, supply voltage, signal swing, speed, input/output impedance and power (Razavi calls this the "analog design octagon", [Razavi, Design of Analog CMOS Integrated Circuits](https://www.mheducation.com/highered/product/design-of-analog-cmos-integrated-circuits-razavi.html)). Device metrics map onto several of them: gm/ID maps to power efficiency, gm·ro to accuracy, fT to speed, and noise and mismatch to the floor on resolution.

### The basic difference between digital and analog: regeneration

[Textbook] A digital inverter actually has very high gain near its switching point. That gain pushes an ambiguous middle level quickly to 0 or 1, so the signal is "repaired" at every stage and the noise is dropped. This is called regeneration. A digital circuit only needs noise below the noise margin, and the result is exact.

Analog circuits do the opposite: they must hold a precise value at a middle level. A signal of 1.2345 mV and one of 1.2346 mV carry different information, and there is no "margin" in between to absorb error. So the questions analog cares about are all "how large is the error": noise sets how small a signal can be resolved, mismatch and offset set how accurate the zero point is, nonlinearity sets whether large signals get distorted, bandwidth sets how fast a change can be tracked, and power sets the cost of all of this.

In one sentence: digital uses gain to push the signal away from the middle; analog uses gain to hold the signal in the middle.

### What exactly gets amplified

[Textbook] What gets amplified is the "small change" of the signal around the bias point, that is, the small signal. The transistor is first biased at a DC operating point (ID, VGS, VDS), and the signal is a small perturbation on top of that point.

Why amplify:
- The raw signal is too weak. Signals from microphones, image sensors, temperature sensors, antennas and the ends of long wires are often in the µV to few-mV range.
- Later stages have their own noise and errors. ADC quantization error and comparator offset are fixed; if the signal is first amplified by A, these errors shrink by A when referred back to the input. So the noise and accuracy of the chain are set mainly by the first stage.
- Driving the load. Sending the signal into a capacitor, resistor, antenna or long line needs enough current and low output impedance.

The quantity amplified depends on the application: voltage is most common (op amps, ADC front ends); current is used in current mirrors and transimpedance amplifiers; charge is used in sensor readout; in RF it is power, judged by power gain and fmax.

### What gm·Rout means

[Textbook] A transistor is essentially a "voltage-controlled current source": a gate voltage change Δv gives a drain current change gm·Δv. This current flows through the resistance Rout seen at the output and turns back into a voltage gm·Rout·Δv. So:
- gm measures "how much current the input voltage can move". It is set by bias current and gm/ID.
- Rout measures "how close the output is to an ideal current source". The larger Rout, the more completely current turns into voltage; short channels, DIBL and channel-length modulation reduce Rout.
- The maximum a single transistor can give, gm·ro, is called intrinsic gain and is a device "ceiling" metric. Cascode, stacking and gain boosting are all ways to raise Rout (see the [tricks page](../tricks/)).

An analogy: gm is the length of the lever arm, and Rout is how solid the fulcrum is. If the fulcrum wobbles (small Rout), a longer arm still lifts nothing.

### Why gain can be traded for accuracy: negative feedback

[Textbook] Precision circuits almost never use open-loop gain directly. They put the amplifier inside negative feedback: closed-loop gain = A/(1 + A·β) ≈ (1/β)·[1 − 1/(A·β)].

This shows two things:
1. Closed-loop gain is about 1/β. β is set by a ratio of resistors or capacitors, which can be made very accurate and does not drift with temperature or process. Transistor parameters almost vanish from the result.
2. The remaining error is about 1/(A·β). The larger the open-loop gain A, the smaller the error.

[Illustration] An amplifier with closed-loop gain 2 (β = 0.5):
- Open-loop gain 1000 (60 dB): error about 1/500 = 0.2%.
- To meet 12-bit accuracy (1/4096 ≈ 0.024%), A·β must be ≥ about 4096, so A ≥ about 8200 (about 78 dB).
- A single transistor's gm·ro is only 20–50, so cascode, multiple stages or gain boosting must multiply the gain up, or digital calibration must remove the remaining error.

Negative feedback also improves linearity (distortion is compressed by about A·β), extends bandwidth (gain-bandwidth product is roughly conserved) and lowers output impedance. So the accurate version of "analog cares most about gain" is: gain is a "currency" that can be exchanged for accuracy, linearity and speed.

### So what does analog ultimately optimize

[Inference, synthesizing textbook views] The goal of an analog circuit fits in one sentence: at a given power and supply voltage, keep enough signal-to-noise ratio and accuracy over the needed bandwidth. Common figures of merit all take this form:
- Amplifier: gain-bandwidth product divided by power, or noise efficiency factor.
- ADC: effective number of bits (ENOB) and energy per conversion (Walden or Schreier FoM).
- Receiver: noise figure, linearity (IIP3) and power.
- Clock: jitter and power.

Mapped to devices:
| What the circuit needs | Device metric | Better direction |
|---|---|---|
| Low power | gm/ID | Larger is better |
| Accuracy, gain | gm·ro (gm/gds) | Larger is better |
| Speed, bandwidth | fT, fmax | Larger is better |
| Resolution floor | 1/f and thermal noise, AVT | Smaller is better |
| Swing, headroom | VDSAT, VDD | More headroom is better |

This is why, for the same transistor, logic looks at Ion/Ioff and CV/I, while analog looks at gm/ID, gm·ro, fT, noise and mismatch.

## Q1. Is speed about the I/C ratio?

**For CMOS logic, clock trees, serializers and inverter-type drivers, yes: gate delay is about C·VDD/I_eff, so speed depends on I_eff/C, and the comparison must be made at the same Ioff and the same footprint. Looking only at current, only at capacitance or only at "frequency" leads to wrong conclusions.**

Key points:
- [Textbook] Gate delay τ ≈ C_load·VDD/(2·I_eff); ring-oscillator frequency f = 1/(2·N·τ). At the same VDD, speed is proportional to I_eff/C_load.
- Looking only at current misleads: widening a device raises current, but its own capacitance rises in proportion; lowering VT raises current, but Ioff rises exponentially. So Ioff and footprint must be fixed.
- Looking only at capacitance also misleads: thinning the fin or shrinking the contact can lower capacitance, but may also raise external resistance and lower current.
- IBM's 22 nm analysis is a good example: FinFET gains a 13–23% delay advantage from electrostatic control and lower junction capacitance, but added Cgs (fringe capacitance at the fin top and bottom) offsets part of it; the net advantage after optimization is about 17% ([Fuller et al., VLSI 2008](https://www.researchgate.net/profile/N_Fuller/publication/4357592_FinFET_performance_advantage_at_22nm_An_AC_perspective/links/5540eb3d0cf2718618dc7332.pdf)) [Silicon · research + Simulation].
- When the load is mainly long wires, pads or tuned networks, the bottleneck becomes wire RC, termination resistance × pad capacitance, and fmax, respectively; device I/C is no longer the main factor.
- "Frequency" is a result, not a knob: clock frequency, data rate, Nyquist frequency and fT are different quantities and must not be mixed.

### Why I/C, and why I should be I_eff

[Textbook] When a CMOS gate switches, its drive current charges or discharges the load capacitance. The load includes the next stage's gate capacitance, this stage's drain junction capacitance and MOL parasitics, and wire capacitance. The voltage swing is VDD, so delay is about C·VDD/I. This is the CV/I that logic processes talk about.

Here I is not Idsat. During switching, both VGS and VDS change, and the device spends most of the time away from the VGS = VDS = VDD point. The industry uses I_eff for the equivalent drive current. A common definition is the average of the current at VGS = VDD/2, VDS = VDD and the current at VGS = VDD, VDS = VDD/2. I_eff is more sensitive to external resistance and DIBL than Idsat.

Writing the equation as τ ∝ C·VDD/(VDD−VT)^α (alpha-power model, α ≈ 1.1–1.5 in short-channel devices) shows three things:
- Lowering C speeds things up in direct proportion.
- Raising VDD speeds things up, but VDD is also in the numerator, so the gain is smaller than the rise in current.
- The benefit of lowering VT grows as VDD−VT shrinks, so VT has the most leverage at low voltage.

### Why Ioff and footprint must be fixed

Looking only at current has two holes.

The first hole is self-loading. Double a device's width and its current doubles, but its own gate and drain capacitance also double. If the load is mainly similar devices (for example a ring oscillator, or buffers with equal fanout in a clock tree), I/C barely changes and speed barely changes. Widening helps only when the load is dominated by fixed capacitance (long wires, pads), and even then the device's own capacitance soon catches up.

The second hole is leakage. Lowering VT raises current noticeably, but Ioff rises exponentially (see Q2). If Ioff is not fixed, any process can "speed up". So the standard practice in logic processes is to plot Ion–Ioff curves and compare Ion at the same Ioff, then use ring oscillators to compare frequency at the same leakage power.

Footprint must be fixed too. FinFET and nanosheet can raise current by adding fins or sheets, but cell area and capacitance rise with them. Process comparisons use "current per unit footprint width" or "ring oscillators of the same standard cell", so that gains bought with area are not credited to the device.

### Looking only at capacitance misleads too

Methods that reduce capacitance often also affect current:
- A narrower fin or contact reduces fringe capacitance, but may raise external resistance Rext and lower I_eff.
- A thicker spacer reduces gate-to-contact capacitance, but lengthens the access region and raises resistance.
- A shorter fin reduces capacitance, but also lowers current per fin.

The truly "free" capacitance knobs are those that do not change the current path, such as lowering the spacer dielectric constant. IBM/GF used air spacers on 10 nm-class FinFETs to cut device parasitic capacitance by up to 25% and ring-oscillator capacitance by up to 15% ([SST/Semiconductor Digest](https://sst.semiconductor-digest.com/?p=72130); [IBM Research](https://researcher.ibm.com/publications/air-spacer-for-10nm-finfet-cmos-and-beyond)) [Silicon · research]. At constant current, a 15% cut in ring-oscillator capacitance gives roughly the same amount of speedup.

The same IBM 22 nm study also gives a magnitude: reducing fin pitch and fin height from 80/40 nm to 40/20 nm lowers Cgs by about 0.2 fF/µm, which corresponds to about 10% inverter delay ([Fuller et al.](https://www.researchgate.net/profile/N_Fuller/publication/4357592_FinFET_performance_advantage_at_22nm_An_AC_perspective/links/5540eb3d0cf2718618dc7332.pdf)) [Simulation].

### Which quantity "frequency" refers to

When people say "this circuit's frequency is not high enough", they may mean four different quantities:

| Quantity | Definition | Relation to I/C |
|---|---|---|
| Clock or ring-oscillator frequency | 1/(2·N·τ) | Set directly by I_eff/C |
| Data rate | Bits transmitted per second; UI = 1/data rate | Set by the slowest block, not just the device |
| Nyquist frequency | Data rate/2 for NRZ; data rate/4 for PAM4 | Sets how much analog bandwidth the channel and front end need |
| fT | Frequency where small-signal current gain equals 1, ≈ gm/(2π·Cgg) | A "small-signal version of I/C", with gm in place of I |

So "higher frequency is better" is not a target you can optimize directly. Data rate and clock frequency are results of the circuit. fT is a device ratio with the same root as I/C, but it measures small-signal amplification, not large-signal charging.

### When I/C is not the main factor

| Circuit | What sets speed | Key metric |
|---|---|---|
| CMOS logic, clock buffers, serializers, inverter-type drivers | Large-signal charging and discharging | I_eff/C (CV/I) |
| CML, CTLE, limiting amplifiers | Bandwidth 1/(2π·R_L·C_L), gain gm·R_L, gain-bandwidth product gm/(2π·C_L) | gm/C_L, where C_L includes wiring and the next stage's input |
| Long wires | Distributed RC, delay about 0.38·R·C·length² | Metal resistance and capacitance, repeater spacing |
| Terminated pads | Pole 1/(2π·R_term·C_pad), with R_term fixed by the protocol | Pad, ESD and bump capacitance |
| Tuned RF (LNA, VCO, PA) | Output capacitance is resonated out by an inductor | fmax, affected by Rg and Cgd |
| Links limited by clock quality | Eye width eaten by jitter | Phase noise, supply noise |

[Inference] For CML and CTLE, fT matters only indirectly. Modern FinFET fT reaches hundreds of GHz; Intel 22FFL RF devices reported fT/fmax above 230 GHz and 290 GHz ([WikiChip Fuse, IEDM 2017](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/4/)) [Silicon · production platform]. So node capacitance is usually dominated by wiring, the next stage's input and the pad, not by the device's own Cgs.

For a terminated pad, driver current barely matters. The termination resistance is fixed by the protocol (for example 50 Ω), about 25 Ω effective with termination at both ends, and the pole is set by capacitance alone. Only lowering pad capacitance or cancelling it with a T-coil (see Q5, Q8) helps.

One more case: the ideal intrinsic fT badly overestimates the real speed of nanoscale devices. In one simulation study, an L = 20 nm device had an fT of 10.6 THz from a quasi-static CV/I estimate, but only 2.7 THz from the true intrinsic delay; with parasitics added, the quasi-static estimate holds again, but the speed is lower ([arXiv 1611.03856](https://arxiv.org/pdf/1611.03856)) [Simulation]. The conclusion: evaluate high-speed circuits with parasitics and PEX included, not with intrinsic device parameters alone.

## Q2. Does lower VT make flicker noise worse?

**The first half of this claim is right and the second half is not. Lower VT raises drive and raises leakage; that is a direct, quantitative relation. Flicker noise does not change directly with VT: compared at the same ID or the same gm/ID and the same W·L, a pure VT shift does not change noise. The noise differences seen in practice come through two indirect paths: the comparison basis (at the same VGS, the low-VT device has more overdrive), and whether the process method used to lower VT (dipole, cap-layer element diffusion, halo doping) introduces traps.**

Key points:
- [Textbook] Ioff ∝ 10^(−ΔVT/SS): each SS of VT reduction (about 65–110 mV, including DIBL and temperature) raises leakage 10×. Ion ∝ (VDD−VT)^α, α ≈ 1.1–1.5, so the same VT reduction gives only about 10–25% more current.
- [Simulation] On 100 nm-class foundry models, adjacent VT flavors differ by about 65–80 mV; each step changes Ioff by about ×3.6–5.0 and inverter speed by about +20% ([Kahng et al., ISQED 2006](https://vlsicad.ucsd.edu/Publications/Conferences/219/c219.pdf)).
- [Textbook] CNF+CMF model: S_VG = S_VFB·(1 + α_sc·μ_eff·Cox·ID/gm)², S_VFB ∝ N_t/(W·L·Cox²). VT is not in the equation; only trap density N_t and bias point ID/gm are ([arXiv 2512.08388](https://arxiv.org/pdf/2512.08388)).
- [Silicon · research] Processes that lower VT can bring traps: on thick-oxide pFETs, adding high-k and an Al₂O₃ cap layer made noise at least an order of magnitude higher than the SiO₂/poly reference, because Hf and Al diffused to the interface during anneal ([Simoen et al., ECS 2015](https://ecs.confex.com/ecs/228/webprogram/Paper57273.html)). But a dipole can also shift the high-k defect band away and reduce active traps ([Franco et al., EDTM 2019](https://www.iue.tuwien.ac.at/pdf/ib_2019/CP2019_Franco_1.pdf)); the direction depends on the specific process.
- No public 1/f data by VT flavor (ULVT/LVT/SVT/HVT) was found for production FinFET or GAA platforms. To answer "is this true in the process at hand", the only way is to compare in the PDK at the same ID, the same gm/ID and the same W·L.

### Conclusion: which relations are direct and which are indirect

| Quantity | Relation to VT | Nature |
|---|---|---|
| Ioff (subthreshold leakage) | Ioff ∝ 10^(−ΔVT/SS), exponential | Direct, definite |
| Ion / I_eff | ∝ (VDD−VT)^α, power law, far weaker than exponential | Direct, definite |
| Gate delay | ∝ C·VDD/(VDD−VT)^α | Direct, definite |
| flicker noise (same ID or same gm/ID) | VT is not in the equation | No direct relation |
| flicker noise (same VGS) | Low-VT device has more overdrive; absolute S_VG and S_ID rise, S_ID/ID² falls | Indirect: via bias point |
| flicker noise (different process methods) | Dipole, cap layer, halo and doping change trap density | Indirect: via process |
| σVT and RTN | In planar, higher doping is worse, so high VT is often worse; in FinFET/GAA, it depends on how the work-function metal changes | Indirect: via process |

The claim probably comes from a real observation: in some PDK, LVT/ULVT devices have larger flicker coefficients, or a designer who switched to LVT also biased the device at higher overdrive. That observation was then generalized into "low VT means high noise" [Inference].

### Quantitative relation between VT, drive and leakage

[Textbook] Subthreshold current varies exponentially with VGS, with the slope set by subthreshold swing SS (mV/dec). A VT shift ΔVT moves the Id–Vg curve left or right, so:

Ioff(new)/Ioff(old) = 10^(ΔVT_reduction/SS_eff)

Here SS_eff must include DIBL (Ioff measured at VDS = VDD) and temperature. In strong inversion, use the alpha-power model:

Ion ∝ (VDD − VT)^α, α ≈ 1.1–1.5

Together, these give "leakage is exponential, drive is only a power law".

A set of public SPICE data (TSMC 100 nm-class foundry model, INVX4 inverter) shows the ratio directly ([Kahng et al., ISQED 2006](https://vlsicad.ucsd.edu/Publications/Conferences/219/c219.pdf)) [Simulation]:

| NMOS VT flavor | VT (V) | Ioff (nA) | Inverter delay (ps) | Versus previous flavor |
|---|---|---|---|---|
| HVT | 0.402 | 7.5 | 14.86 | — |
| SVT | 0.327 | 37.2 | 12.42 | ΔVT 75 mV; Ioff ×5.0; speed +20% |
| LVT | 0.257 | 164.2 | 10.38 | ΔVT 70 mV; Ioff ×4.4; speed +20% |

| PMOS VT flavor | VT (V) | Ioff (nA) | Versus previous flavor |
|---|---|---|---|
| HVT | −0.300 | 9.4 | — |
| SVT | −0.235 | 34.2 | ΔVT 65 mV; Ioff ×3.6 |
| LVT | −0.155 | 160.6 | ΔVT 80 mV; Ioff ×4.7 |

In the same paper, "intermediate flavors" spaced about 35 mV apart change Ioff by about ×2.1 and improve delay by about 8–10% per step. Another often-cited rule of thumb: static leakage of HVT devices is about 1/10 that of LVT ([Wikipedia: Multi-threshold CMOS, citing Anis et al., DAC 2002](https://en.wikipedia.org/wiki/Multi-threshold_CMOS)) [Opinion].

[Inference] Working back from this data, 5× leakage per 75 mV corresponds to SS_eff of about 107 mV/dec. This is larger than the intrinsic SS of FinFET/GAA (about 65–75 mV/dec at room temperature), because it includes DIBL, temperature and the short-channel effects of 100 nm planar devices. On FinFET/GAA with SS around 70 mV/dec, the same one-flavor VT step of about 70 mV would change leakage by close to ×8–10.

[Inference] An example on the drive side: VDD = 0.75 V, VT lowered from 0.25 V to 0.18 V and α = 1.3 give an Ion ratio of (0.57/0.50)^1.3 ≈ 1.19, about +19% current. This matches the roughly +20% speed per flavor in the table above. The lower VDD, the smaller VDD−VT, and the larger the relative gain from the same ΔVT.

VT flavors on production platforms are getting finer. GF 12LP FinFET offers four flavors (SLVT, LVT, RVT, HVT), with higher off-state leakage in the low-VT flavors ([Vidana et al., OSTI 2311246](https://www.osti.gov/servlets/purl/2311246)) [Silicon · production platform]. Intel 18A-P expands from 4 VT pairs to 5 or more, adding a flavor between ULVT and LVT and lowering ULVT by another 10 mV ([Intel 18A technology brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)) [Vendor]. Finer flavors let designers buy just enough speed at a smaller leakage cost.

### Physics of flicker noise: VT is not in the equation

1/f noise in modern HKMG planar, FinFET and nanosheet devices is usually described by the carrier number fluctuation plus correlated mobility fluctuation model (CNF+CMF). Oxide and border traps capture and release carriers, which causes flat-band voltage fluctuation; the trapped charge also modulates mobility through Coulomb scattering. The input-referred noise is ([arXiv 2512.08388](https://arxiv.org/pdf/2512.08388); original work by Hung et al., TED 1990 and Ghibaudo et al., 1991) [Textbook]:

S_VG = S_VFB · (1 + α_sc·μ_eff·Cox·ID/gm)²

S_VFB = q²·kT·λ·N_t / (W·L·Cox²·f)

Here N_t is the trap density near the Fermi level, λ is the tunneling attenuation length, and α_sc is the Coulomb scattering coefficient. Drain current noise is S_ID = gm²·S_VG, and normalized noise is S_ID/ID² = (gm/ID)²·S_VG.

VT is not in the equations. VT can enter only in two ways:
- Bias point. ID/gm is roughly a function of overdrive: about n·kT/q in weak inversion (about 26–40 mV, constant), about (VGS−VT)/2 in the square-law region, and about VGS−VT in velocity saturation.
- Trap density N_t. If the process that lowers VT changes the traps at the interface or in the high-k, N_t changes.

[Textbook] The empirical form common in SPICE, S_VG = KF/(Cox²·W·L·f), is bias-independent, but KF actually varies with operating point and differs between weak and strong inversion ([Lundberg, MIT](https://web.mit.edu/klund/www/papers/UNP_noise.pdf)). So a single KF number in a PDK may hide the bias dependence.

**Three comparison bases give three answers.** [Inference, derived from the equations above] Assume two devices differ only by a rigid VT shift, with the same N_t, μ, Cox and geometry:

| Comparison basis | Overdrive of low-VT device | S_VG | S_ID | S_ID/ID² | Conclusion |
|---|---|---|---|---|---|
| Same ID or same gm/ID | Same | Same | Same | Same | VT drops out entirely; no noise difference |
| Same VGS | Larger | Rises (CMF term grows) | Rises clearly (larger gm) | Falls | "More noise" is mostly more current; signal-to-noise ratio is not worse |
| Design habit: LVT biased at lower gm/ID for speed | Larger | Rises | Rises | — | Noise really is higher, but the cause is the bias point, not VT |

The third row is the most common. Designers switch to LVT for speed and often push the device toward strong inversion at the same time. The CMF term (1 + α_sc·μ_eff·Cox·ID/gm)² then grows, and input-referred noise really rises. The observation is real; the attribution is wrong.

imec measurements on nanosheets also support the role of the bias point: S_vg increases with V_ov, and the average number of active traps also increases with V_ov and I_D ([Asanovski et al., arXiv 2609.08674](https://arxiv.org/html/2609.08674)) [Silicon · research].

### Do the process methods for lowering VT bring traps

Different architectures set VT in different ways:
- Planar: channel and halo implants. Each extra VT flavor adds one mask and one implant per polarity ([Wikipedia: Multi-threshold CMOS](https://en.wikipedia.org/wiki/Multi-threshold_CMOS)) [Textbook].
- FinFET/GAA: thickness or composition of the work-function metal (WFM), plus La (nFET) or Al (pFET) dipoles. Intel 3 uses angstrom-scale dipole work-function layers to deliver four tightly controlled VT flavors ([IEEE Spectrum](https://spectrum.ieee.org/intel-foundry-finfet)) [Vendor]. The sheet gap in GAA cannot fit a thick WFM, so multi-VT is moving to dipoles.

Public evidence on noise for each method:

| Method | Effect on traps and noise | Evidence |
|---|---|---|
| halo/pocket implant | High trap density in the halo region makes the bias dependence of flicker vary with geometry (verified on 45 nm LP) | [Khandelwal et al., JEDS](https://research.iitj.ac.in/publication/analytical-modeling-of-flicker-noise-in-halo-implanted-mosfets) [Silicon · research] |
| high-k + Al₂O₃ cap (thick-oxide I/O pFET) | Oxide trap density "greatly increased"; input-referred noise at 10 Hz and 10 kHz at least 10× higher than the SiO₂/poly reference; attributed to Hf and Al diffusing to the Si/SiO₂ interface during 600–900 °C anneal; noise trend matches NBTI | [Simoen et al., ECS 2015](https://ecs.confex.com/ecs/228/webprogram/Paper57273.html) [Silicon · research] |
| La / Al dipole | Shifts the HfO₂ defect band away from carrier energy; PBTI down about 8× (La, nMOS), NBTI down up to about 10× (Al, pMOS); the paper has no noise data | [Franco et al., EDTM 2019](https://www.iue.tuwien.ac.at/pdf/ib_2019/CP2019_Franco_1.pdf) [Silicon · research] |
| Fluorine treatment (RMG pFET) | Lowers mean noise and device-to-device spread | [Simoen et al., ECS 2013](https://ecs.confex.com/ecs/224/webprogram/Abstract/Paper19227/E12-2246.pdf) [Silicon · research] |
| WFM composition (nanosheet) | "Some effect" on gate-stack quality and N_OT; no numbers in the paper | [Simoen et al., JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770) [Silicon · research] |

imec has two papers that directly study the effect of cap layers on low-frequency noise (Claeys et al., ECS JSS 2019; Simoen et al., ECS Trans. 2009), but their results were not read for this report ([imec record](https://imec-publications.be/entities/publication/4d61541c-c632-44af-965a-d73964502585/full)).

[Inference] This leads to three judgments:
- In planar processes, low-VT devices usually have lower doping, less Coulomb scattering and fewer halo traps, so at the same ID their noise should be no higher than, or even lower than, that of high-VT devices.
- In FinFET/GAA, WFM thickness changes are far from the channel and should have little effect on N_t. A dipole can go either way: element diffusion to the interface adds traps (the thick-oxide example from ECS 2015); the band shift reduces active traps (the BTI data). Which effect dominates depends on the specific process and thermal budget.
- Dipoles are also often used to raise VT (for example Al for the nFET HVT). In that case, any noise penalty lands on the high-VT flavor. So in dipole processes, "low VT = high noise" may even be reversed.

### Variation and RTN: also not "low VT is worse"

In planar devices, random dopant fluctuation (RDF) is the main source of σVT. Atomistic 3D simulation shows that discrete dopants significantly increase the maximum RTS amplitude caused by a single trap ([Asenov et al., IEDM 2000](https://eprints.gla.ac.uk/3019)) [TCAD]. High-VT flavors have higher doping, so in planar processes high VT often has larger σVT and a longer RTN tail.

FinFET and nanosheet channels are essentially undoped; σVT comes mainly from work-function variation due to metal-gate grain orientation (WFV/MGG). The number of grains under each gate drops from about 10 in 7 nm FinFETs to 1–3 in 2 nm nanosheets ([PatSnap review](https://www.patsnap.com/resources/blog/articles/metal-gate-granularity-and-threshold-voltage-at-5nm/)) [Opinion]. Whether σVT differs across VT flavors depends on how the WFM is changed; public sources give no AVT data by flavor.

[Inference] Two points are easy to confuse:
- In digital circuits, the same σVT is a different fraction of the overdrive on a low-VT device, so delay sensitivity to σVT changes. That is circuit sensitivity, not a larger device σVT.
- Small LVT devices used for speed show larger RTN steps because their area is small (each trap's effect is about q/(Cox·W·L)), not because VT is low.

### How to check in a PDK

To confirm this on the process you use, follow these steps [Inference]:

1. Pick devices of each VT flavor with the same polarity and the same W·L (same fin or sheet count, same L).
2. Simulate noise at the same ID, then again at the same gm/ID (for example one point each at gm/ID = 8, 12, 16 V⁻¹). Read S_VG at 1 kHz, or the integrated noise voltage over 10 Hz–1 MHz.
3. Simulate once more at the same VGS, and see whether the difference comes mainly from the comparison basis.
4. Check the model card: whether each VT flavor has its own flicker parameters (NOIA/NOIB/NOIC or KF/AF/EF in BSIM-CMG), and whether statistical noise corners are provided.
5. If silicon data exists, extract N_OT and α_sc per gate stack: plot √S_VG against ID/gm; the intercept corresponds to N_OT, and the slope divided by the intercept gives α_sc ([Chen, Stanford 2010](https://stacks.stanford.edu/file/druid:pf645xz5659/cy_thesis-augmented.pdf)). Do not compare KF directly, because it mixes in Cox and bias dependence.
6. Also look at AVT and BTI data for each flavor. In imec planar data, trap density extracted from noise tracks BTI trap density ([Asanovski et al.](https://arxiv.org/html/2609.08674)), so BTI differences are often an early sign of noise differences.

If step 2 shows equal noise across flavors and a difference appears only in step 3, "low VT is noisier" is only a comparison-basis issue. If step 2 already shows a difference, the low-VT method in that process really does introduce traps. That is a process property, and it should be recorded during device selection.

## Q3. From bulk to FinFET to nanosheet, does flicker noise get better or worse?

**The answer depends on the basis. Per unit gate area, flicker noise improved by about an order of magnitude over about 20 years, almost all of it at the FinFET step, and nanosheet is roughly on par with planar devices that use the same gate stack. Per single minimum device, noise got larger, because area shrank faster than trap density fell. For device-to-device spread and RTN, the problem got clearly worse, although GAA cut the effect of each trap by about half.**

Key points:
- [Opinion] The ITRS 2005 roadmap assumed S_VG·WL falls only with t_ox² (trap density unchanged): 190 in 2005, 70 in 2013, 30 µV²·µm²/Hz in 2020 (at 1 Hz) ([ITRS 2005 Wireless](https://www.semiconductors.org/wp-content/uploads/2018/08/2005Wireless.pdf)).
- The actual path was not monotonic: both material transitions, nitrided SiON and early HfO₂, made noise worse; production HKMG planar at 28 nm was still about 171 (n)/106 (p) fV²·µm²/Hz (at 1 kHz), roughly back to the roadmap's 2005 SiON level ([Singh et al., GF, TED 2018](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)).
- [Silicon · production platform] FinFET was the breakthrough: GF 14 nm FinFET is 17 (n)/35 (p), about 10× (n) and 3× (p) better than 28 nm planar, and also below the ITRS 2020 target (same source).
- [Silicon · research] Nanosheets have trap density comparable to planar HKMG with the same gate stack; "gate-stack quality, not channel geometry, dominates" 1/f noise ([Asanovski et al., arXiv 2609.08674](https://arxiv.org/html/2609.08674)).
- In FinFET, pFETs lost their planar-era low-noise advantage: planar pFETs are quieter than nFETs, while FinFET pFETs are about 2× nFETs.
- Noise and spread of single minimum devices increased: a single RTN in 20 nm-class devices can cause ΔV_th above 70 mV ([VLSI 2009](https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm)).

### Per unit area: a cross-generation table

Units: ITRS uses µV²·µm²/Hz at 1 Hz; GF uses fV²·µm²/Hz at 1 kHz. For a pure 1/f spectrum the two numbers are equal (here fV² means 10⁻¹⁵ V²): X µV²·µm²/Hz @ 1 Hz = X fV²·µm²/Hz @ 1 kHz. The table below converts everything to area-normalized S_VG·WL, mainly for nFETs.

| Stage (approximate era) | Area-normalized S_VG·WL | Versus previous stage | Main cause | Evidence |
|---|---|---|---|---|
| Nitrided SiON (about 250–130 nm) | S_Id of minimum-L devices rose by about 1.5 orders of magnitude from 350 nm to 130 nm | Worse | Nitridation introduces traps | [Silicon · research] [Chew et al. 2004](https://repository.sutd.edu.sg/esploro/outputs/journalArticle/Impact-of-technology-scaling-on-the/9911713309846) |
| SiO₂/SiON planar, 90 nm class (about 2005) | About 190 (ITRS roadmap value, t_ox 2.2 nm) | Baseline | — | [Opinion] [ITRS 2005](https://www.semiconductors.org/wp-content/uploads/2018/08/2005Wireless.pdf) |
| Early HfO₂ (R&D phase, about 2004–2007) | About 100× higher than SiON or HfSiON | Much worse | high-k bulk traps, remote phonon scattering | [Silicon · research] [Srinivasan et al., JECS 2006](https://digitalcommons.njit.edu/fac_pubs/19253) |
| Production HKMG planar, 28 nm | 171 (n) / 106 (p) | Close to 2005 SiON; short of the roadmap's expected 60–80 | IL, silicates and anneal recovered most of the high-k loss, but cancelled the gain from thinner EOT | [Silicon · production platform] [Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications) |
| FinFET, 14 nm | 17 (n) / 35 (p) | About 10× (n) and 3× (p) better | Thinner EOT, undoped fully depleted channel, mature IL/HfO₂ and RMG anneal | [Silicon · production platform] Same as above |
| nanosheet (research devices) | Comparable to planar devices with the same gate stack; area-normalized, "favorable" versus FinFET and SOI (values only in figures) | Roughly flat | Geometry has little effect; gate stack dominates | [Silicon · research] [Asanovski et al.](https://arxiv.org/html/2609.08674); [Simoen et al., JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770) |

[Inference] Working back from the ITRS 2005 numbers: 190 × (1.3/2.2)² ≈ 66, consistent with the 2013 value of 70; 190 × (0.9/2.2)² ≈ 32, consistent with the 2020 value of 30. So the roadmap's assumption is "trap density unchanged, all improvement from Cox²". Measured against that ruler, SiON nitridation and early high-k were both steps backward, production HKMG planar roughly cancelled the EOT gain, and FinFET beat expectations.

[Inference] A rough nFET estimate: about 190 for 2005 SiON, about 170 for 28 nm HKMG, about 17 for 14 nm FinFET, and nanosheet in the same range as FinFET. The net improvement over two decades is about 10×, almost all at the FinFET step. This size matches the roughly 5–6× from EOT going from about 2.2 nm to about 0.9–1 nm alone, plus a cleaner channel. Note that the 28 nm point compares an ITRS SiON projection with GF HKMG measurements, mixing different companies and bias conditions, so treat it only as an order of magnitude.

ITRS itself admitted this trend was hard to predict. The 2009 edition says new materials (high-k, strain, metal gates) make the 1/f noise trend "uncertain", and that the roadmap "ignores for now" the improvement or degradation they bring ([ITRS 2009 Wireless](https://www.semiconductors.org/wp-content/uploads/2018/09/Wireless.pdf)) [Opinion]. After that, CMOS 1/f metrics disappeared from the roadmap tables.

### Why each step got better or worse

**Nitrided SiON got worse.** NTU measured minimum-L nMOS in four CMOS generations with dual gate oxides. S_Id of thin-oxide devices rose by about 1.5 orders of magnitude from 350 nm to 130 nm, and the rise "closely follows" the switch from thermal oxide to nitrided oxide at ≤250 nm; thick-oxide devices also rose by up to about 1.25 orders of magnitude due to nitridation ([Chew et al. 2004](https://repository.sutd.edu.sg/esploro/outputs/journalArticle/Impact-of-technology-scaling-on-the/9911713309846)) [Silicon · research]. This is current noise of minimum-L devices, not fully area-normalized.

**Early high-k got much worse, then mostly recovered.** With the same interfacial oxide and poly gate, HfO₂ nMOS noise spectral density was two orders of magnitude higher than SiON or HfSiON ([Srinivasan et al., JECS 2006](https://digitalcommons.njit.edu/fac_pubs/19253)) [Silicon · research]. IBM found that noise in TiN/HfO₂ nMOS is of the mobility-fluctuation type, suggested that high-k remote phonon scattering may be the main source, and noted that the choice of interfacial-layer thickness matters for analog ([Srinivasan et al., MEE 2007](https://www.research.ibm.com/publications/impact-of-high-k-and-siolessinfgreater2lessinfgreater-interfacial-layer-thickness-on-low-frequency-1f-noise-in-aggressively-scaled-metal-gatehfolessinfgreater2lessinfgreater-n-mosfets-role-of-high-k-phonons)) [Silicon · research]. Philips/imec found that Hf content in HfSiON does not affect noise, and that the main target for improvement should be the interface between the dielectric and the metal gate ([Rittersma et al., ESSDERC 2005](https://digitalcommons.njit.edu/fac_pubs/19446)) [Silicon · research]. Later, production HKMG adopted an SiO₂ interfacial layer, silicates and anneal, and recovered most of the loss.

**FinFET got better.** Toshiba observed on SiON/poly FinFETs that once fin width falls below 50 nm (fully depleted), "not only the noise itself but also its spread decreases", because the vertical field weakens and the trapping rate drops ([Ohguro et al., IEICE 2015](https://global.ieice.org/en_transactions/electronics/10.1587/transele.E98.C.455/_pdf)) [Silicon · research]. Sony's undoped, widened-channel pixel FinFET cut RTS noise by 99.3% and random noise by 15%, and raised gm to 2.42× ([VLSI 2023 tip sheet](https://archive.vlsisymposium.org/23web/files/press_kit/VLSI2023_TipSheet_Kr.pdf)) [Silicon · research]. Both data sets show that an undoped, fully depleted channel reduces noise by itself.

**FinFET pFETs improved less.** In 28 nm planar, pFETs are quieter than nFETs (106 vs 171); in FinFET this is reversed (35 vs 17). [Inference] The main hypothesis is that FinFET holes conduct on (110) sidewalls, plus gate-stack differences from SiGe strain; no public paper was found that quantitatively compares (110) and (100) trap density. In nanosheets the main conduction surfaces return to the (100) top and bottom faces, which may restore part of the pFET advantage, but this is only a hypothesis. In imec nanosheets, pMOS and nMOS are "qualitatively similar" ([Simoen et al., JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)), so do not assume pFETs are quieter.

**Nanosheet is roughly flat.** imec compared 188 p-type sheets with planar pFETs that use the same gate stack and a similar RMG thermal budget. The effective border trap density N_BT was "comparable", and the authors concluded that "moving to GAA brings no noise penalty" ([Asanovski et al.](https://arxiv.org/html/2609.08674)) [Silicon · research]. These devices had only a forming gas anneal, with no dedicated reliability anneal, so there is room for improvement.

### Per device: noise of minimum devices got larger

[Inference] A typical 2-layer nanosheet minimum device has W_eff of about 2 × 47 nm and L of about 19 nm (imec research device dimensions), for a gate area of about 0.0018 µm². At 17–35 fV²·µm²/Hz, S_VG at 1 kHz is about (0.9–1.9) × 10⁻¹¹ V²/Hz, or about 3.0–4.4 µV/√Hz. For comparison, a 1 µm² device in the same process has only about 0.13–0.19 µV/√Hz.

So "the process improved, so noise improved" holds only at the same gate area. If a design shrinks devices to minimum size, the absolute noise of a single transistor is higher than that of a large device in an older process. This is exactly why analog circuits insist on large-area input transistors.

### Spread and RTN: the statistics problem of small devices

As area shrinks, the 1/f spectrum breaks into the separate Lorentzian spectra of a few traps, and devices can differ by several orders of magnitude:
- IBM measured more than 15,000 nFETs (Lg down to 20 nm) at VLSI 2009. The RTN amplitude distribution is long-tailed and non-Gaussian; in the smallest devices ΔV_th exceeds 70 mV; near 22 nm, RTN-induced V_th variation may exceed RDF at about 3σ ([VLSI 2009 3B-3](https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm)) [Silicon · research].
- In stacked GAA nanowires, the mean ΔV_T per single defect (η) is about 1 mV, versus about 1.9 mV in 10 nm FinFETs; time-dependent variability is about 2× smaller. The authors attribute this to better electrostatic control and volume inversion, which keep current farther from the interface. But under the same stress, more traps are filled in nanowires than in FinFETs ([Chasin et al. 2017](https://www.iue.tuwien.ac.at/pdf/ib_2017/CP2017_Rzepa_02.pdf)) [Silicon · research].

[Inference] GAA makes each trap "lighter", but the number of traps per unit area did not fall, so the expectation is smaller RTN steps, not fewer traps. The relative device-to-device spread of noise power scales roughly as 1/√(number of traps) ∝ 1/√(area). Area shrank by orders of magnitude while trap density fell only a few times, so spread grew overall.

### How to use the conclusions, and what is still uncertain

The conclusions for the three bases are summarized below:

| Basis | bulk → FinFET | FinFET → nanosheet | Overall |
|---|---|---|---|
| Per unit area (S_VG·WL) | About 3–10× better | Roughly flat | Better |
| Single minimum device | Area shrink offsets or exceeds the improvement | Area keeps shrinking | Worse |
| Spread and RTN | Fewer traps, larger effect per trap | Effect per trap about halved; trap count still scales with area | Worse, slightly eased by GAA |

Three things are uncertain:
- No public S_VG·WL series was found for 16/14 → 7 → 5 nm FinFET, and no flicker data for production GAA such as TSMC N2, Samsung SF3/SF2 or Intel 18A.
- Whether all 28 nm data is HKMG, and whether bias conditions match across companies, both affect the accuracy of the 28 nm point in the table.
- The nanosheet conclusions above come from research devices; production gate stacks and anneals differ.

## Q4. How to optimize flicker noise? Where are FinFET and nanosheet heading?

**The first-order knob is the trap density of the gate stack (interfacial layer plus high-k) near the operating Fermi level; together with Cox², it sets noise per unit area. In process, the tools are dielectric chemistry, EOT, reliability anneal and an undoped channel; in device choice, large area and thin-oxide core devices; in circuits, low overdrive, chopping and auto-zero. After FinFET and nanosheet, the direction is to treat 1/f as a by-product of BTI optimization, co-optimize the gate stack together with reliability, and offer dedicated device flavors for analog.**

Key points:
- [Inference] Ranked by historical evidence: dielectric chemistry (pure HfO₂ versus silicate or SiON about 100×; nitridation about 10–30×) > EOT (S_VG ∝ 1/Cox², 2.2 → 1 nm about 5×) > anneal (about 2–5×) > channel and heterostructure (a few times, with a clear reduction in RTN spread). Area and chopping are almost unlimited on the design side, but they cost area and bandwidth.
- [Silicon · research] High-pressure D₂ anneal lowered normalized noise by about 4.8× and slow-trap density by about 4×, but this is FD-SOI TFET data ([Shin et al., Sci. Rep. 2022](https://www.nature.com/articles/s41598-022-22575-5)).
- [Silicon · research] In imec planar data, trap density extracted from 1/f noise tracks BTI trap density across anneal conditions ([Asanovski et al.](https://arxiv.org/html/2609.08674)). A process that lowers BTI very likely lowers 1/f as well.
- [Opinion] ITRS stopped giving CMOS 1/f metrics after 2009 ([ITRS 2009](https://www.semiconductors.org/wp-content/uploads/2018/09/Wireless.pdf)); the item no longer appears in public roadmaps.
- [Inference] The thermal budget of the upper CFET device is limited, and HfO₂ without post-deposition anneal has about 2× higher defect density ([Franco et al., EDTM 2019](https://www.iue.tuwien.ac.at/pdf/ib_2019/CP2019_Franco_1.pdf)). This is the most likely future noise risk.

### Process methods

**Gate dielectric and interface**

| Method | Public results | Evidence |
|---|---|---|
| Avoid or limit nitrogen near the channel | Nitridation raised thick-oxide noise by up to about 1.25 orders of magnitude, and thin-oxide noise by about 1.5 orders from 350 to 130 nm | [Silicon · research] [Chew et al. 2004](https://repository.sutd.edu.sg/esploro/outputs/journalArticle/Impact-of-technology-scaling-on-the/9911713309846) |
| high-k composition: silicate better than pure HfO₂ | On the same IL, HfO₂ is about 100× higher than SiON or HfSiON | [Silicon · research] [Srinivasan et al., JECS 2006](https://digitalcommons.njit.edu/fac_pubs/19253) |
| Improve the interface between the dielectric and the metal gate | Hf content in HfSiON does not affect noise; the interface is the main target | [Silicon · research] [Rittersma et al. 2005](https://digitalcommons.njit.edu/fac_pubs/19446) |
| Interfacial-layer thickness | Both IL thickness and high-k phonon scattering matter for analog noise | [Silicon · research] [Srinivasan et al., MEE 2007](https://www.research.ibm.com/publications/impact-of-high-k-and-siolessinfgreater2lessinfgreater-interfacial-layer-thickness-on-low-frequency-1f-noise-in-aggressively-scaled-metal-gatehfolessinfgreater2lessinfgreater-n-mosfets-role-of-high-k-phonons) |
| Post-deposition anneal and thermal budget | Without PDA, HfO₂ defect density is about 2× higher and trap levels are shallower (BTI data) | [Silicon · research] [Franco et al. 2019](https://www.iue.tuwien.ac.at/pdf/ib_2019/CP2019_Franco_1.pdf) |
| High-pressure D₂/H₂ anneal (400 °C, 10 atm, 30 min) | Normalized S_ID/I² at 100 Hz dropped from 2.15e-9 to 4.49e-10 Hz⁻¹; D₂ about 2× better than H₂ | [Silicon · research] [Shin et al. 2022](https://www.nature.com/articles/s41598-022-22575-5) (FD-SOI TFET) |
| H₂ anneal (FinFET) | Lowers interface trap response | [Silicon · research] [Ohguro et al. 2015](https://global.ieice.org/en_transactions/electronics/10.1587/transele.E98.C.455/_pdf) |
| Fluorine passivation (RMG pFET) | Lowers mean noise and device-to-device spread | [Silicon · research] [Simoen et al., ECS 2013](https://ecs.confex.com/ecs/224/webprogram/Abstract/Paper19227/E12-2246.pdf) |
| La/Al dipole | BTI down 8–10×; no public data on noise impact; element diffusion to the interface must be prevented | [Silicon · research] [Franco et al. 2019](https://www.iue.tuwien.ac.at/pdf/ib_2019/CP2019_Franco_1.pdf); [Simoen et al., ECS 2015](https://ecs.confex.com/ecs/228/webprogram/Paper57273.html) |
| Thinner EOT | Normalized S_VG falls as EOT shrinks; charge sharing among multiple gates further reduces the effect of a single trap | [Silicon · research] [Simoen et al., JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770) |

In a 2006 review, imec/NJIT listed the "gate stack engineering" needed for low-noise HKMG: IL thickness, high-k thickness and bulk properties, post-deposition anneal, gate electrode and substrate strain. The review noted that classical noise models "no longer apply" without modification ([Claeys et al., ECS Trans. 2006](https://digitalcommons.njit.edu/fac_pubs/19233)) [Opinion].

**Channel and device engineering**
- Undoped, fully depleted channel: below 50 nm fin width, both noise and its spread fall ([Ohguro et al. 2015](https://global.ieice.org/en_transactions/electronics/10.1587/transele.E98.C.455/_pdf)); an undoped pixel FinFET cut RTS noise by 99.3% ([VLSI 2023](https://archive.vlsisymposium.org/23web/files/press_kit/VLSI2023_TipSheet_Kr.pdf)) [Silicon · research].
- Remove halo/pocket: halo implants "very likely" degrade both noise and gain ([Rittersma et al. 2005](https://digitalcommons.njit.edu/fac_pubs/19446)) [Opinion]. The IBM alliance built halo-optimized "high-performance analog" HKMG devices with better flicker, mismatch and gain than the digital reference devices, with no extra mask ([Han et al., JJAP 2011](https://www.research.ibm.com/publications/novel-high-performance-analog-devices-for-advanced-low-power-high-k-metal-gate-complementary-metal-oxide-semiconductor-technology)) [Silicon · production platform].
- Buried-channel SiGe for pFETs: Si₀.₆₄Ge₀.₃₆ with a 2 nm Si cap gives lower 1/f noise than the Si reference at the same overdrive, because the band offset leaves fewer active traps at the interface ([Prest et al., ECS 2004](https://www.electrochem.org/dl/ma/206/pdfs/1319.pdf)) [Silicon · research]. Another study found that SiGe pMOS noise correlates with D_it at the SiGe/Si heterointerface, so heterointerface quality sets the noise floor ([Tsuchiya et al., ECS 2003](https://www.electrochem.org/dl/ma/203/pdfs/0966.pdf)) [Silicon · research]. Both data sets are from the SiO₂/poly era.
- Nanosheet geometry: changing the vertical sheet spacing from 7.5 nm to 4.7 nm has only a "marginal effect" on 1/f ([Simoen et al., JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)) [Silicon · research]. Geometry knobs have weak leverage in nanosheets.

### Device choice

| Choice | Basis | Evidence |
|---|---|---|
| Use thin-EOT core devices instead of thick-oxide I/O devices when headroom allows | ITRS 2005: thick-oxide "precision analog" device 500 versus core device 190 µV²·µm²/Hz, scaling roughly as (t_ox,thick/t_ox,thin)² | [Opinion] [ITRS 2005](https://www.semiconductors.org/wp-content/uploads/2018/08/2005Wireless.pdf) |
| Increase gate area: more fins/sheets, wider sheets, more fingers, longer L or stacked devices | Area-normalized S_vg scales as 1/(WL) | [Silicon · research] [Asanovski et al.](https://arxiv.org/html/2609.08674) |
| In FinFET, prefer nFETs for low-noise inputs | GF 14 nm: nFET 17, pFET 35 | [Silicon · production platform] [Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications) |
| Avoid the narrowest, thinnest sheets | 4 nm wires show about 20% higher mean PBTI degradation than 8 nm wires due to field crowding | [TCAD] [Chasin et al. 2017](https://www.iue.tuwien.ac.at/pdf/ib_2017/CP2017_Rzepa_02.pdf) |
| Use the analog-specific device flavors offered in the PDK | Intel 22FFL offers dedicated analog FinFETs and 1.2/1.5/1.8 V thick-gate devices, but the public summary gives no flicker numbers | [Vendor] [WikiChip Fuse](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3) |
| Check each VT flavor with the Q2 method | Do not assume low VT is noisier, and do not assume it is not | [Inference] |

Toshiba's view is that FinFET suits analog and mixed-signal better, and planar suits RF better ([Ohguro et al. 2015](https://global.ieice.org/en_transactions/electronics/10.1587/transele.E98.C.455/_pdf)) [Opinion].

### Circuit methods

- **Low overdrive.** Bias in moderate or weak inversion to shrink the CMF term; imec nanosheet data show that S_vg and the number of active traps both increase with V_ov ([Asanovski et al.](https://arxiv.org/html/2609.08674)) [Silicon · research]. The cost is larger devices and lower fT.
- **Large-area input pair.** Doubling the area halves S_VG and cuts the relative spread to about 1/√2. The cost is input capacitance and area.
- **Chopping, auto-zero, CDS.** These move 1/f noise to high frequency or subtract it; the classic review is by Enz and Temes ([Proc. IEEE 1996](https://infoscience.epfl.ch/record/149579)) [Textbook]. The cost is ripple, residual offset, white-noise aliasing and bandwidth.
- **Statistical noise corners.** The noise distribution of small devices is long-tailed, and corners based on the mean underestimate tail devices. Ask the foundry for the log-normal σ of S_VG·WL, not a single KF [Inference].
- **Upconversion in oscillators.** Pushing oscillator swing to VDD improves phase noise but strengthens flicker upconversion; a tail-current resonance at 2f₀ is one mitigation ([Razavi, TCAS-I 2021](https://www.seas.ucla.edu/brweb/papers/Journals/BR_TCAS_2021.pdf)) [Textbook]. See Q9 for details.
- **Cryogenic use.** At low temperature, white noise falls but 1/f noise barely falls, so the flicker corner moves up; at 4.2 K systematic Lorentzians appear, and chopping and auto-zero need extra suppression at higher frequencies ([Kiene et al., arXiv 2405.17685](https://arxiv.org/pdf/2405.17685)) [Silicon · research].

### Leverage ranking of the methods

[Inference] Ranking the evidence above by magnitude:

| Rank | Method | Magnitude | Status |
|---|---|---|---|
| 1 | Gate dielectric chemistry (pure HfO₂ versus silicate/SiON; nitridation) | About 10–100× | Production gate stacks have captured most of the gain |
| 2 | EOT (Cox²) | 2.2 → 1 nm about 5× | Limited room for further thinning |
| 3 | Anneal (HPD/HPH, PDA, RMG thermal budget) | About 2–5× | Room remains, limited by thermal budget |
| 4 | Channel and heterostructure (undoped fully depleted, buried-channel SiGe pFET) | A few times, with a large cut in RTN spread | FinFET/GAA are already undoped by default |
| 5 | Design area | Unlimited in principle | Costs area and capacitance |
| 6 | Chopping, auto-zero | Removes in-band 1/f almost completely | Costs ripple, offset and bandwidth |

For nanosheet and CFET, the gate-stack knobs (IL, PDA, dipole, HPD) carry over directly; geometry knobs have weak leverage according to imec data; the SiGe channel and Si cap for pFETs and the sheet crystal orientation are open questions.

### Future directions

[Opinion] Public roadmaps no longer give CMOS 1/f noise metrics. ITRS 2009 ignored 1/f changes because of uncertainty from new materials ([ITRS 2009](https://www.semiconductors.org/wp-content/uploads/2018/09/Wireless.pdf)); the 2011/2013 editions state in the bipolar section that 1/f and matching numbers were removed from the tables because "circuit requirements are expected to stay unchanged" ([ITRS 2013 RFAMS](https://www.semiconductors.org/wp-content/uploads/2018/08/2013RFAMS.pdf)). No IRDS table with 1/f numbers was found for this report.

Public research focuses on four directions:
- **Gate-stack trap physics and BTI co-optimization.** imec's conclusion is "gate-stack quality, not channel geometry, dominates", and noise traps and BTI traps are the same set of defects ([Asanovski et al.](https://arxiv.org/html/2609.08674)) [Silicon · research]. [Inference] The most likely approach in the next few years is to treat 1/f as a by-product of BTI optimization: reliability anneals compatible with a low thermal budget, dipole multi-VT and high-pressure D₂ anneal, characterized with arrays and defect-centric statistics.
- **Forksheet and cryogenic.** Excess 1/f noise in forksheet arrays below 100 K "is not related to device architecture but to the material properties of the semiconductor/dielectric interface" ([Asanovski et al., SSE 2024](https://air.uniud.it/retrieve/9b187428-ab70-46d9-ae59-c8f49613a887/1-s2.0-S0038110124000303-main.pdf)) [Silicon · research]. On 2500 nMOS devices, imec measured more RTN-active defects at 5 K than at 300 K; the ΔV_th distribution changed from one peak to three, and more than 80% of defects were in the oxide bulk ([Catapano et al., arXiv 2505.04030](https://arxiv.org/abs/2505.04030v2)) [Silicon · research].
- **CFET.** Monolithic nanosheet CFETs have been demonstrated in research ([VLSI 2023 tip sheet](https://archive.vlsisymposium.org/23web/files/press_kit/VLSI2023_TipSheet_Kr.pdf)) [Silicon · research], but with no noise data. [Inference] The upper device's thermal budget is limited, which according to Franco's data brings more and shallower high-k traps; the upper and lower tiers (n/p) may show a noise asymmetry that needs dipoles or anneal to fix.
- **2D channels.** Noise in MoS₂ also follows the McWhorter (trap number) mechanism, and thick channels (15–18 layers) are quieter than 2–3 layers ([Balandin group, arXiv 1503.01823](https://arxiv.org/abs/1503.01823)) [Silicon · research]. Noise reduction in 2D channels is still an interface and dielectric problem.

[Inference] Two more directions have no public data: wafer bonding, thinning and backside contacts from backside power delivery may affect noise through hydrogen passivation and stress; analog-specific device flavors (longer L, wider sheets, thicker IL) will follow the precedent of 22FFL and the IBM high-performance analog devices.

## Q5. How to speed up when the data rate falls short: easy, medium and hard tiers

**Locate the bottleneck before acting. Link data rate is set by the slowest block, and each block is limited by a different metric (CMOS timing by CV/I, amplifiers by gm/C, pads by R·C, clocks by jitter, high-current blocks by IR drop). Once the bottleneck is located, stack methods in three tiers: easy (tuning, device choice, VDD, local layout), medium (block redesign, process tweaks within the current platform) and hard (new process modules, packaging and architecture), with a matching set of verification for each step.**

Key points:
- Speed is not one number but min(rate each block can reach). Improving only non-bottleneck blocks leaves the overall rate unchanged.
- [Textbook] The limit of CMOS serializers and clocks can be estimated as "how many FO4 per UI": about 8 FO4/UI at full rate, about 4 at half rate, about 2 at quarter rate; a 1/8-rate CMOS mux cannot reach 1 FO4 ([Palermo, TAMU Lecture 12](https://people.engr.tamu.edu/spalermo/ecen689/lecture12_ee689_tx_mux_circuits.pdf)).
- [Textbook] Bandwidth of a terminated pad ≈ 1/(2π·R_eq·C_pad). Compare it with the Nyquist frequency (data rate/2 for NRZ) to see whether pad capacitance is the bottleneck.
- Public magnitudes for single methods: T-coil bandwidth ×2.72 ([Galal & Razavi, JSSC 2003](https://www.seas.ucla.edu/brweb/papers/Journals/G&RDec03_1.pdf)); air spacer ring-oscillator capacitance −15% ([SST](https://sst.semiconductor-digest.com/?p=72130)); 12–20% lower external resistance plus VT and via optimization giving >10% frequency ([Intel 18A technology brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)); backside power cutting worst-case dynamic droop by about 10× and FMAX +5–6% (same source).
- Methods acting on the same critical path roughly multiply; methods acting on different blocks do not, and the overall rate is set by the new slowest block.
- Each method has its risk: VDD and low VT trade for leakage and reliability risk, EQ amplifies noise and crosstalk, lower ESD capacitance sacrifices robustness, and process changes affect yield.

### Step 1: locate which block is the bottleneck and which metric limits it

A high-speed link usually includes: the transmit serializer (mux), clock generation and distribution, pre-driver and driver, pad/ESD/bump, channel (package traces, interposer, bonding), the receive front end (termination, CTLE), sampler (slicer), DFE, and clock recovery (CDR) or deskew. The table below maps common symptoms to bottlenecks and metrics [Inference, based on textbook knowledge and the sources below]:

| Symptom | Possible bottleneck | Limiting metric | How to confirm |
|---|---|---|---|
| Timing fails at SS corner and low voltage but passes at FF; failure point moves clearly with VDD | Last serializer stage, clock buffers, pre-driver | I_eff/C (FO4/UI) | Ring oscillator versus VDD; post-PEX timing margin; check against the FO4/UI budget |
| Eye closes vertically with clear ISI; frequency response drops near Nyquist | TX output pole or RX input pole | R_term·C_pad, plus channel loss | S21/S22, S11; ratio of f_3dB to Nyquist |
| CTLE or CML stage lacks gain-bandwidth | Analog front end | gm/C_L, with C_L including wiring and next-stage input | AC simulation with PEX; breakdown of C_L |
| Sampler cannot resolve small signals, or goes metastable | slicer | Regeneration time constant τ ≈ C/gm, offset | Monte Carlo of sensitivity and offset |
| Eye width eaten by random jitter | PLL/VCO, clock distribution | Phase noise, supply-induced jitter | Jitter decomposition (RJ/DJ/DCD); supply noise injection |
| Large duty-cycle or quadrature phase error | Half-rate or quarter-rate clocks | Mismatch, routing asymmetry | Monte Carlo of phase error; on-chip calibration range |
| Burst errors that depend on data pattern or activity | Power delivery network | IR drop, dynamic droop | Dynamic IR simulation; on-chip droop monitors |
| Errors when adjacent lanes switch | Package or bump layout | Crosstalk | Crosstalk sweeps; bump map and trace isolation check |

Two rules of thumb:

[Textbook] Minimum eye width at the receiver = sampler aperture time + peak-to-peak jitter; minimum eye height = sensitivity + offset ([Palermo, Lecture 12](https://people.engr.tamu.edu/spalermo/ecen689/lecture12_ee689_tx_mux_circuits.pdf)). Whichever of eye width or eye height runs short first tells you whether the bottleneck is in the time domain or the amplitude domain.

[Inference] Quick estimate of the pad pole: with 50 Ω termination at both ends, the effective resistance is about 25 Ω; at C_pad = 200 fF, f_3dB = 1/(2π·25 Ω·200 fF) ≈ 32 GHz; at 125 fF, about 51 GHz. If f_3dB is only slightly above Nyquist, pad capacitance eats several dB at Nyquist, and the pad is then a first-order bottleneck. Short unterminated advanced-packaging links are limited more by driver strength (CV/I) than by an RC pole.

A Razavi design example is typical: ESD 300 fF, pad 70 fF and driver 100 fF total 470 fF; the transmit −3 dB bandwidth is only about 13.5 GHz, and S22 < −10 dB cannot be met below the Nyquist frequency of that example; the whole short link has about 7.2 GHz bandwidth, about 24% vertical eye opening and about 9.4 ps peak-to-peak jitter ([Razavi, IEEE SSC Magazine 2021](https://www.seas.ucla.edu/brweb/papers/Journals/BR_SSCM_2_2021.pdf)) [Simulation]. In this example the devices are not slow; the bottleneck is entirely at the pad node.

Locating the bottleneck also means answering one more question: behind the bottleneck block, how much margin does the second-slowest block have? Once the first bottleneck is fixed, the rate you can gain back is at most the position of the second bottleneck.

### Easy: tuning, device choice, voltage and local layout

This tier changes neither the process nor the circuit architecture and usually takes a few weeks. It mainly means changing bias, switching device flavors, tuning equalizer registers and making local layout edits.

| Method | Principle | Typical gain | Cost/risk | What to verify |
|---|---|---|---|---|
| Raise PHY supply voltage or overdrive within reliability limits | Delay ∝ C·V/(V−VT)^α | [Inference] Near nominal voltage, VDD +10% gives about 8–15% speed; more sensitive closer to Vmin | Power ∝ V²; TDDB, BTI, HCI, EM margin; interface protocol limits on TX voltage (for example, the UCIe tutorial recommends max TX voltage < 0.85 V and a TX high level no more than 100 mV above the RX supply, see the [Hot Chips 2023 UCIe tutorial](https://www.hc2023.hotchips.org/assets/program/tutorials/ucie/Electrical%20Form%20Factor%20and%20Compliance.pdf)) | Vmax reliability signoff; EM at high current; eye and BER at SS/low-voltage corners |
| Switch critical paths to LVT/ULVT (serializer, clock tree, pre-driver) | Ion ∝ (VDD−VT)^α | [Simulation] On 100 nm-class models, about +20% speed per flavor, Ioff ×3.6–5.0 ([Kahng et al.](https://vlsicad.ucsd.edu/Publications/Conferences/219/c219.pdf)); per-flavor gain on FinFET/GAA must be checked in the PDK | Leakage rises exponentially; duty-cycle and quadrature error become more sensitive to mismatch | FF/high-temperature leakage; Monte Carlo of duty cycle and quadrature phase |
| Re-tune equalization (TX FFE/de-emphasis, CTLE peaking, DFE taps) | Compensate channel and pad loss at Nyquist | Recover several dB at Nyquist; the more loss, the more gain | Amplifies noise and crosstalk; DFE error propagation | Statistical eye and BER; crosstalk sweeps |
| Local layout and sizing edits: larger pre-driver, critical routes moved to wide upper metal, doubled vias, double-sided gate contacts | Lower R and RC | [Inference] About 5–15% on RC-dominated paths | Area; self-loading capacitance; self-heating density | PEX (with coupling capacitance); EM; Rg extraction |
| Local power-integrity fixes: add decap, add local power/ground bumps | Reduce dynamic droop and supply-induced jitter | [Inference] A few percent | Area | Dynamic IR simulation; jitter under supply noise injection |
| Shift process centering toward the fast side within spec | Raise the center of the Idsat and ring-oscillator distributions | [Inference] A few percent | Leakage limit and yield | WAT distributions of Idsat/Ioff/ring oscillator; corner coverage |
| Lower junction temperature (cooling, lower bias current) | Mobility falls with temperature | [Inference] A few percent | Cooling cost | Thermal map; temperature corners |

**How to do it:**
1. Use the table in step 1 to find the bottleneck block, and confirm whether it is timing-type (CV/I) or bandwidth-type (RC, gm/C).
2. Timing-type: first sweep VDD and VT flavors in the PDK and map the feasible region of speed, leakage and reliability; switch flavors only on critical paths, not across the whole PHY.
3. Bandwidth-type: tune EQ first, then look at the capacitance breakdown of the pad node and find capacitance that a local edit can remove (for example redundant ESD diodes or overly wide traces).
4. Change one variable at a time, quantify the gain on the post-PEX netlist, then multiply the gains to see whether they are enough (see the section on stacking).
5. On silicon, verify with shmoo (rate versus voltage and temperature), and check whether the failure mode has moved from the original bottleneck to the next block.

### Medium: block redesign and process tweaks

This tier means redesigning a block and taping out again, or adjusting devices and interconnect within the current process platform. It usually takes a few months.

| Method | Principle | Typical gain | Cost/risk | What to verify |
|---|---|---|---|---|
| Change the clock architecture from half rate to quarter rate (or 1/8 rate with a CML last stage) | FO4 budget per UI drops from 4 to 2 | [Textbook] CMOS timing margin per UI roughly doubles ([Palermo, Lecture 12](https://people.engr.tamu.edu/spalermo/ecen689/lecture12_ee689_tx_mux_circuits.pdf)) | Needs accurate quadrature phase and duty-cycle calibration; larger mux node capacitance; power | Phase-error Monte Carlo; supply-induced jitter; calibration range |
| CML or inductively peaked last-stage mux and clock buffers | CML uses small swing and current steering, which is faster than CMOS | Architecture dependent | Static current; inductor area | AC and transient simulation with PEX; inductor Q |
| T-coil and low-capacitance ESD | A T-coil cancels pad capacitance and "hides" ESD capacitance inside the matching network | [Silicon · research] Bandwidth ×2.72, 70% more than plain inductive peaking ([Galal & Razavi, JSSC 2003](https://www.seas.ucla.edu/brweb/papers/Journals/G&RDec03_1.pdf), 0.18 µm process); [Simulation] a 400 fF transmitter with a 330 pH T-coil extends S22 < −10 dB to about 30 GHz ([Razavi 2021](https://www.seas.ucla.edu/brweb/papers/Journals/BR_SSCM_2_2021.pdf)); [Vendor] in the UCIe tutorial, a T-coil cuts effective pad capacitance from 200 fF to 125 fF ([Hot Chips 2023](https://www.hc2023.hotchips.org/assets/program/tutorials/ucie/Electrical%20Form%20Factor%20and%20Compliance.pdf)) | Inductor area (about 250–330 pH per pad); CDM robustness | CDM and human-body-model qualification; TLP; S11/S22 |
| Driver topology: SST (source-series terminated) or low-swing NMOS driver with capacitive equalization | Low swing reduces drive burden and power | Widely used in published die-to-die transceivers ([Palermo, Lecture 15](https://people.engr.tamu.edu/spalermo/ecen689/lecture15_ee720_d2d_xcvrs.pdf)) [Silicon · research] | Redesign and tapeout | Full PHY signoff; silicon eye and BER |
| Process: adjust VT targets or add VT flavors (WFM/dipole) | Finer choices between leakage and speed | [Vendor] 18A-P adds one VT flavor and lowers ULVT by another 10 mV ([Intel 18A technology brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)) | Mask or recipe change; leakage; variation | Id–Vg; σVT; BTI; ring oscillator; SRAM and logic yield |
| Process: lower external resistance (silicide, epi doping, contact area) | I_eff is sensitive to Rext | [Vendor] Rext −20% (N)/−12% (P), drive +5%/+16%; together with VT and via optimization, >10% frequency for HP devices (same source) | Integration risk; contact reliability | Kelvin contact-resistance structures; ring oscillator; contact-to-gate TDDB; yield |
| Process: MOL low-k or air spacer | Lower gate-to-contact capacitance | [Silicon · research] Device parasitic capacitance −25%, ring-oscillator capacitance −15% ([SST](https://sst.semiconductor-digest.com/?p=72130)) | Mechanical strength and reliability; CMP; contact-to-gate shorts | Ceff test structures; ring oscillator; TDDB; yield |
| Process: lower via resistance, thinner barrier, thicker and wider metal options for the PHY | Lower local RC | [Inference] About 5–10% on wire-dominated paths | Process complexity; EM; density | Kelvin via chains; line R/C; EM; PEX recalibration |

**How to do it:**
1. Circuit side: first use behavioral models to confirm how far the new architecture moves the bottleneck (for example, quarter rate cuts FO4/UI from 4 to 2), then do the transistor-level design.
2. Pad side: agree on CDM and human-body-model targets with the ESD team, design the T-coil around the smallest ESD capacitance the targets allow, and reserve inductor area.
3. Process side: first confirm the gain with TCAD and test structures (Kelvin, Ceff, ring oscillator), then assess the impact on yield and reliability; update PDK models and PEX rules at the same time.
4. Every medium-tier change needs a full signoff rerun, because it changes parasitics, reliability and corners.

### Hard: new process modules, packaging and architecture

This tier involves new materials, new process flows, package formats or protocol-level changes, and usually takes several quarters to years. These methods often "change the problem itself", for example by removing ESD, shortening the channel, or using more parallel lanes in exchange for a lower per-lane rate.

| Method | Principle | Typical gain | Cost/risk | What to verify |
|---|---|---|---|---|
| New BEOL metal (Ru semi-damascene) and air gaps | Lower line resistance and capacitance | [Silicon · research] Ru lines at aspect ratio 6 have about 40% lower line resistance than at aspect ratio 3; air gaps can meet >10-year reliability ([imec, EE Journal](https://eejournal.com/industry_news/imec-shows-path-to-line-resistance-halving-using-semi-damascene-with-high-aspect-ratio-processing)) | New tools and materials; EM and TDDB; cost | Full BEOL qualification |
| Backside power delivery | Power enters from the back, which lowers droop and frees front-side routing | [Vendor] Worst-case dynamic droop about 10× lower, FMAX +5–6%, routing convergence improved by 8–10% ([Intel 18A technology brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)) | New flow; heat dissipation; harder debug | IR and droop; thermal map; reliability |
| RF/analog-specific device flavors (thick gate, low Rg, high fmax) | Devices optimized for high-speed analog | [Silicon · production platform] 22FFL RF devices exceed 230/290 GHz fT/fmax ([WikiChip Fuse](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/4/)) | Extra masks; PDK models | fT/fmax; noise figure; matching |
| Move the PHY to a better-suited node or into a separate chiplet | Build I/O on the most suitable process | Architecture dependent | Product architecture, cost, supply chain | Package SI/PI; thermal; KGD test |
| Change the package: organic substrate → interposer or bridge → hybrid bonding | Shorter channel, lower bump and ESD capacitance | [Textbook] Standard-package channels beyond 50 mm exceed 10 dB loss, while 1–3 mm 2.5D channels have only 2.4–3.9 dB ([Palermo, Lecture 15](https://people.engr.tamu.edu/spalermo/ecen689/lecture15_ee720_d2d_xcvrs.pdf)); hybrid bonding can go "without ESD" | Package cost; bonding yield; test | Package SI/PI; thermal; bonding yield |
| Change modulation or architecture: NRZ → PAM4, or a wider bus with a lower per-lane rate | PAM4 halves Nyquist; a wide bus trades lane count for rate | [Vendor] PAM4 Nyquist is half that of NRZ at the same data rate; ideal SNR penalty about 9.5 dB, about 11 dB including nonlinearity ([Intel AN 835](https://www.intel.com/content/www/us/en/docs/programmable/683852/current/nrz-fundamentals.html)) | Protocol compatibility; needs ADC/DSP or more comparators; may need FEC | BER with FEC; linearity (RLM) |

**How to do it:**
1. First use a system-level model to answer "is a hard-tier change really needed": how much is still missing after stacking the easy- and medium-tier methods?
2. Packaging options: run channel S-parameter and eye simulations, and compare pad capacitance, ESD requirements and channel loss for organic substrate, interposer, bridge and hybrid bonding.
3. Process options: align with the process roadmap; most methods in this tier belong to the next-generation platform and cannot be expected on the current product.
4. Architecture options: assess protocol compatibility, power (pJ/bit) and area, and confirm whether the total bandwidth target can be met with a wider, slower interface.

### How methods stack: they multiply, but only on the same bottleneck

[Inference] If several methods act on the same critical path and are independent of each other, the total gain roughly multiplies:

Total speedup ≈ (1 + g₁) × (1 + g₂) × … × (1 + g_n)

There are three limits:
- **Methods that are not independent cannot simply be multiplied.** Raising VDD and lowering VT both increase the overdrive VDD−VT; their combined gain must be computed with the alpha-power equation as a whole, not computed separately and then multiplied.
- **Methods on different blocks do not multiply.** Overall rate = min(rate of each block). If the clock path gets 20% faster but the pad pole allows only 10%, the whole link gets only 10% faster.
- **The bottleneck moves.** After each bottleneck is fixed, redo the step-1 localization.

[Illustration] Suppose a transmitter dominated by CMOS timing needs a 1.20× speedup (the 20% here is only an illustrative number). The methods could stack like this:

| Method | Tier | Single gain | Cumulative |
|---|---|---|---|
| PHY supply +7% (within reliability limits) | Easy | ×1.06 | 1.06 |
| Critical paths moved one VT flavor lower | Easy | ×1.07 | 1.134 |
| Critical routes moved to upper metal, doubled vias | Easy | ×1.05 | 1.191 |
| Add decap to lower dynamic droop | Easy | ×1.03 | 1.227 |

The cumulative gain is about 1.23×, slightly above the need. Note that the first two items both act on overdrive, so the real stack must be computed from the PDK curves of ring-oscillator speed versus VDD and versus VT flavor together. If the pad pole is also found to allow only 1.1×, the stack above is meaningless; a T-coil or lower ESD capacitance must come first, and the single pad-side gain may exceed the sum of all the others. If the easy-tier methods are still not enough after stacking, consider medium-tier methods such as a quarter-rate clock or a CML last stage.

### Verification checklist

Whichever tier of methods is used, cover the following verification [Inference, based on standard practice and the sources above]:

| Category | Content |
|---|---|
| Corners and statistics | SS/FF/SF/FS; low voltage/high temperature and low voltage/low temperature; aging-aware models; Monte Carlo (mismatch, duty cycle, quadrature phase, offset) |
| Parasitic extraction | PEX with coupling capacitance; capacitance breakdown of critical nodes; whether PEX rules were updated with process changes |
| Test structures and ring oscillators | FO4 ring oscillators, CML ring oscillators, Kelvin contact resistance, Ceff structures, via chains; comparison with PDK models |
| Eye, BER and jitter | Silicon eye diagrams; BER bathtub curves; jitter decomposition (RJ, DJ, DCD); jitter under supply noise injection; shmoo (rate versus voltage and temperature) |
| S-parameters | S11/S21/S22 of pad + ESD + bump + package trace + channel; crosstalk |
| Reliability | TDDB, HCI, BTI, EM at the new voltage and current; self-heating; ESD (CDM, human body model, TLP) |
| Leakage and power | Leakage at FF/high temperature; pJ/bit; standby power |
| Yield | Parametric yield; impact of process changes on SRAM and logic yield; leakage distribution after fast-side centering |
| Thermal | Thermal maps; effect of local temperature on mobility and EM |

## Q6. What do fT, fmax and CV/I each govern?

**fT is the frequency where current gain equals 1, about gm/(2π·Cgg), and it measures broadband amplification. fmax is the frequency where power gain equals 1; it also depends on gate resistance Rg and Cgd, and it measures tuned RF capability. CV/I is the large-signal gate delay and measures digital circuits. The three can move in different directions, so a process can have fast ring oscillators while fmax falls instead of rising.**

Key points:
- [Textbook] fT depends on bias: it is highest at maximum current density and minimum L; beyond velocity saturation, more bias no longer raises gm ([MIT 6.776 Lecture 6](https://ocw.mit.edu/courses/6-776-high-speed-communication-circuits-spring-2005/a2408eb19a4ded6f2b8d552688600654_lec6.pdf)).
- [Textbook] Series gate resistance enters the derivation of fmax but not fT; with low gate resistance in layout, fmax can be "much higher" than fT (same source).
- [Textbook] Output capacitance does not affect fmax because an inductor can resonate it out, so tuned RF circuits look at fmax and care little about drain capacitance (same source).
- [Simulation] Digital delay depends on CV/I; fringe capacitance at the FinFET fin top and bottom eats part of the drive advantage ([Fuller et al.](https://www.researchgate.net/profile/N_Fuller/publication/4357592_FinFET_performance_advantage_at_22nm_An_AC_perspective/links/5540eb3d0cf2718618dc7332.pdf)).

### Which circuit looks at which metric

| Circuit | Main metric | Reason |
|---|---|---|
| CMOS logic, clock buffers, serializers | CV/I | Large-signal charging and discharging |
| CML, broadband amplifiers, CTLE | fT, plus node parasitic capacitance | Broadband; capacitance cannot be resonated out |
| Tuned RF circuits such as LNA, PA and VCO | fmax | Output capacitance is resonated out by an inductor; Rg sets power gain |
| Noise figure of low-noise amplifiers | Rg (tied to fmax), plus channel thermal noise | Rg itself also contributes thermal noise [Textbook] |

### Why a process can improve one and not another

[Inference] Four kinds of process knobs act differently on the three metrics:

| Knob | CV/I | fT | fmax |
|---|---|---|---|
| Lower gate-to-contact and fringe capacitance (spacer k, fin height, epi shape) | Better | Better | Better |
| Lower gate metal or gate contact resistance (multiple fingers, double-sided gate contacts, low-resistivity WFM fill) | Nearly unchanged | Nearly unchanged | Better, and noise figure also better |
| Lower M0–M2 resistance | Better | Unchanged when measured at the device reference plane | Unchanged |
| Lower external resistance Rext | Better | Better (gm rises) | Better |

This is why a node can show a good ring-oscillator gain while fmax stays flat or even gets worse, and the reverse can also happen. For RF and high-speed analog, gate resistance is a parameter that logic processes often overlook.

### Intrinsic fT overestimates real speed

Intrinsic fT from a quasi-static CV/I model can be about 4× higher than the real value. For a simulated L = 20 nm device, the quasi-static fT is 10.6 THz, but only 2.7 THz from the true intrinsic delay; with parasitics added, the quasi-static model holds again, but the speed is lower ([arXiv 1611.03856](https://arxiv.org/pdf/1611.03856)) [Simulation]. In practice, evaluate with de-embedded measurements that include parasitics, or with post-PEX simulation, not with intrinsic values at the device reference plane alone.

## Q7. What does data rate demand of devices?

**First convert the data rate into three numbers: UI = 1/data rate, NRZ Nyquist frequency = data rate/2, and PAM4 Nyquist halved again. For NRZ the analog front-end bandwidth target is about 0.5–0.7× the data rate (PAM4 uses the symbol rate, roughly half), CMOS serializers and clocks must meet the FO4 budget per UI, and clock jitter must be a small fraction of the UI. Equalization exists because channel loss at Nyquist closes the eye.**

Key points:
- [Vendor] PAM4 carries 2 bits per symbol, so at the same data rate its Nyquist is half that of NRZ; the ideal SNR penalty is about 9.5 dB (eye height becomes 1/3), and about 11 dB including nonlinearity ([Intel AN 835](https://www.intel.com/content/www/us/en/docs/programmable/683852/current/nrz-fundamentals.html)).
- [Vendor] The same backplane channel has about 33 dB insertion loss at the lower frequency and about 62 dB at twice that frequency (same source); this is the motivation for PAM4 and equalization.
- [Simulation] In his design example, Razavi sets transmit and receive bandwidth at about 70% of the data rate and requires S22/S11 < −10 dB below Nyquist ([Razavi, SSC Magazine 2021](https://www.seas.ucla.edu/brweb/papers/Journals/BR_SSCM_2_2021.pdf)).
- [Textbook] FO4/UI budget: about 8 at full rate, about 4 at half rate, about 2 at quarter rate ([Palermo, Lecture 12](https://people.engr.tamu.edu/spalermo/ecen689/lecture12_ee689_tx_mux_circuits.pdf)).

### Converting data rate into circuit metrics

[Textbook] Let the data rate be R:

| Quantity | NRZ | PAM4 |
|---|---|---|
| Symbol rate | R | R/2 |
| UI (symbol period) | 1/R | 2/R |
| Nyquist frequency | R/2 | R/4 |
| Front-end bandwidth target (about 0.5–0.7× symbol rate) | About 0.5–0.7·R | About 0.25–0.35·R |
| Eye height | Full swing | About 1/3 |
| Quarter-rate clock frequency | R/4 | R/8 |

### FO4 budget: how fast CMOS can run

Palermo's lecture notes give the limits of CMOS serializers and clocks: the minimum period of a clock buffer is about 8 FO4; a full-rate architecture needs about 8 FO4 per UI, half rate about 4 FO4 and quarter rate about 2 FO4; high-fan-in muxes are actually slower because of large node capacitance; half-rate and quarter-rate designs are very sensitive to duty-cycle and quadrature phase errors; the fastest buffers can fall back to CML, with inductive peaking if needed ([Palermo, Lecture 12](https://people.engr.tamu.edu/spalermo/ecen689/lecture12_ee689_tx_mux_circuits.pdf)) [Textbook]. The example in the notes is a 90 nm process with FO4 of about 30 ps, which gives a UI floor of about 240 ps for a full-rate architecture.

[Inference] The method is simple: take the PDK FO4 at the target voltage and slow corner, and multiply by the FO4/UI of the architecture to get the minimum UI; its inverse is the highest data rate the CMOS part can support. If that is not enough, either switch to a faster architecture (lower rate ratio, CML last stage) or make FO4 smaller (the easy- and medium-tier methods of Q5). Research has found that FO4-normalized delay is fairly stable across processes, but voltage, temperature and corner change it by about 20% (static circuits) ([Harris & Horowitz](https://pages.hmc.edu/harris/research/FO4.pdf)) [Silicon · research], so it must be computed at the target corner.

### How high fT must be, and why equalization is needed

[Inference] In practice, people often say device fT should be 5–10× the required stage bandwidth. This is a rule of thumb; no formal source was found for this report. Modern FinFET fT already reaches hundreds of GHz, so in most high-speed interfaces bandwidth is usually limited by node parasitic capacitance (ESD, pad, wiring) and inductor area, not by intrinsic device fT.

Equalization compensates the frequency-dependent loss of the channel. Transmit FFE or de-emphasis attenuates low-frequency content; receive CTLE boosts high-frequency content; DFE subtracts post-cursor ISI using bits already decided. All three have costs: CTLE also amplifies noise and crosstalk, FFE lowers the signal peak, and DFE has error propagation and timing-closure difficulty [Textbook].

## Q8. Why do pad, ESD and bump capacitance matter? What has 3D packaging changed?

**On a high-speed pad, ESD, pad and driver capacitance together often exceed 400 fF, and the termination resistance is fixed by the protocol, so the RC pole of this node is often the bandwidth limit of the whole link. A T-coil can cancel part of the capacitance, while 2.5D/3D packaging removes capacitance at the root by relaxing ESD requirements, shrinking bump pitch and shortening the channel.**

Key points:
- [Simulation] Razavi's example: ESD 300 fF + pad 70 fF + driver 100 fF = 470 fF, with transmit bandwidth about 13.5 GHz; with a 330 pH T-coil, S22 < −10 dB extends to about 30 GHz; at the receiver, 350 fF with 290 pH gives S11 < −10 dB up to 28 GHz ([Razavi 2021](https://www.seas.ucla.edu/brweb/papers/Journals/BR_SSCM_2_2021.pdf)).
- [Opinion] ESD co-design for FinFET SerDes: product CDM spec 250 V, design target 6 A; breakdown voltage in advanced processes ≤ about 4 V; at the 6 A target, even 10 Ω of series resistance limits transmission speed; extra secondary diodes add capacitance, so the parasitic drain-to-well diode is used instead ([In Compliance Magazine 2023](https://digital.incompliancemag.com/issue/november-2023/esd-co-design-for-high-speed-serdes-in-finfet-technologies/)).
- [Vendor] UCIe parameters vary with packaging: standard package bump pitch 100–130 µm, CDM 30 V, about 0.5 pJ/bit; advanced package 25–55 µm, CDM 5 V trending to < 3 V, about 0.25 pJ/bit; 3D package < 10 µm, wafer-to-wafer hybrid bonding "can go without ESD", < 0.05 pJ/bit (9 µm pitch) ([Das Sharma, SNIA SDC 2024](https://snia.org/sites/default/files/2025-05/SNIA-SDC2024-DasSharma-Updates-on-UCIe-Technology.pdf)).
- [Vendor] Pad capacitance budget in the UCIe tutorial: advanced package transmit/receive 250/200 fF; in the standard package, a T-coil can bring effective capacitance down to 125 fF ([Hot Chips 2023](https://www.hc2023.hotchips.org/assets/program/tutorials/ucie/Electrical%20Form%20Factor%20and%20Compliance.pdf)).

### Why a stronger driver cannot save the pad

[Textbook] A terminated pad is an RC low-pass filter: R is the termination resistance (50 Ω at each end in parallel, about 25 Ω), and C is the sum of ESD, pad, bump, driver output and receiver input capacitance. Driver current sets only the signal amplitude, not this pole. So for this node there are only three ways to speed up: lower C, cancel C with a T-coil or inductive peaking, or change the packaging so C itself gets smaller.

There is a direct trade-off between ESD capacitance and robustness. An ESD device must discharge several amperes during a CDM event; a larger device is more robust but has more capacitance. In advanced processes, gate-oxide and junction breakdown voltages are both low (about 4 V), which leaves a narrow voltage window for ESD devices ([In Compliance Magazine](https://digital.incompliancemag.com/issue/november-2023/esd-co-design-for-high-speed-serdes-in-finfet-technologies/)) [Opinion].

### How 2.5D/3D packaging changes the problem

The ESD Association roadmap sets the CDM target for die-to-die interfaces below 30 V and still falling. The reason is that these pins are exposed only between wafer level and package assembly, where charging during assembly is controlled; the driver is shrinking bump pitch and area, not gate oxide ([ESDA forum](https://forum.esda.org/t/cdm-die-to-die-voltage-trend-below-30-v-in-esd-technology-roadmap-section-4-3/878)) [Opinion].

[Inference] This has two consequences:
- At hybrid-bonding pitch < 10 µm, I/O becomes almost an "on-chip wire" with tiny capacitance, and transceivers can be built from simple inverters and flip-flops. UCIe-3D therefore chooses a lower per-lane rate and very high parallelism, trading lane count for bandwidth, with more than an order of magnitude better energy efficiency ([Palermo, Lecture 15](https://people.engr.tamu.edu/spalermo/ecen689/lecture15_ee720_d2d_xcvrs.pdf)).
- Once on-chip ESD is removed, electrostatic control during assembly (bonding tools, wafer handling) becomes the factory's responsibility.

### Aside: why analog and I/O area does not shrink with the node

I/O devices and passives "do not scale with the node", while digital transistors shrink quadratically ([Design & Reuse](https://www.design-reuse.com/blog/51338-mimicking-digital-scaling-trends-for-analog-ip-kind-of/)) [Opinion]. The reasons include:
- Inductor, capacitor and resistor area is set by the electrical value; for example, the T-coil per pad is about 250–330 pH ([Razavi 2021](https://www.seas.ucla.edu/brweb/papers/Journals/BR_SSCM_2_2021.pdf)).
- I/O devices run at higher voltages such as 1.2 V and 1.5 V and need longer gates and thicker dielectrics, which brings reliability and performance issues in the GAA era ([Synopsys](https://www.synopsys.com/articles/serdes-design-trends-angstrom-era.html)) [Vendor].
- ESD and bump pitch are set by the package.
- Matching requirements set device area (see Q10).

So chiplets often put compute on an advanced node and I/O on a more mature, cheaper node; this also takes the SerDes test chip off the critical path ([Cadence blog](https://community.cadence.com/cadence_blogs_8/b/breakfast-bytes/posts/chiplets2)) [Opinion]. [Inference] This pattern applies mainly to I/O dies and to analog-dominated interfaces with little DSP; long-reach SerDes that need heavy DSP often sit on advanced nodes instead.

## Q9. How do jitter and noise relate?

**Jitter is the timing error of clock or data edges. Random jitter equals the integral of the phase-noise spectrum, converted into time. VCO thermal noise sets the far-out floor, device flicker noise upconverts into close-in phase noise, and the PLL loop can suppress VCO noise only inside the loop bandwidth. So device 1/f noise, supply noise and passive Q all end up as lost eye width.**

Key points:
- [Textbook] Phase-to-time conversion: Δt = θ/(2π·f). For example, a −45 dB phase error at 30 GHz is about 30 fs ([Razavi, TCAS-I 2021](https://www.seas.ucla.edu/brweb/papers/Journals/BR_TCAS_2021.pdf)).
- [Textbook] VCO random jitter is the area under the phase-noise spectrum; for a plateau of height S₁ extending to f₂, σ_j² = 4·S₁·f₂·(T_CK/2π)² (same source).
- [Textbook] Pushing oscillator swing to VDD improves phase noise but strengthens flicker upconversion; the upconverted noise extends to larger offsets from the carrier, and the PLL only suppresses what lies inside its loop bandwidth, which is often well below 1 MHz, so the rest gets through (same source).
- [Textbook] Clock jitter needs to be on the order of 1% of the symbol period; below about 10 fs, the power cost becomes very high once reference and charge-pump noise are counted (same source).
- [Simulation] A channel with insufficient bandwidth produces deterministic jitter (ISI): in Razavi's example, uncompensated pad/ESD capacitance causes about 9.4 ps peak-to-peak jitter ([Razavi 2021](https://www.seas.ucla.edu/brweb/papers/Journals/BR_SSCM_2_2021.pdf)).

### How random jitter converts into lost eye width

[Textbook] Random jitter is approximately Gaussian. At a target BER, peak-to-peak jitter is about 2·Q·σ. At BER = 10⁻¹², Q ≈ 7.03, so peak-to-peak is about 14σ.

[Illustration] If clock random jitter σ = 0.5% UI, peak-to-peak at BER = 10⁻¹² is about 7% UI. This does not yet include deterministic jitter (ISI, duty-cycle distortion, crosstalk) or supply-induced jitter. So rms jitter of a few tenths of a percent of a UI already takes a sizable share of the eye-width budget.

### Where noise enters jitter

| Source | Mechanism | Process or design knob |
|---|---|---|
| Device flicker noise | Upconverts into close-in phase noise; ring oscillators are especially sensitive | Gate-stack trap density, device area, tail-current filtering (see Q4) |
| Device thermal noise | Sets the far-out phase-noise floor | Power, gm |
| Q of VCO varactors and inductors | Lower Q, higher phase noise | BEOL metal thickness, substrate loss |
| Supply noise | Delay of ring oscillators and buffers varies with VDD | Power delivery network, decap, LDO; backside power delivery |
| Insufficient channel bandwidth | ISI produces deterministic jitter | Pad capacitance, T-coil, equalization |

[Inference] For process engineers, this table shows that 1/f noise is not only a precision-analog problem. In clock circuits that use ring oscillators, close-in phase noise is directly affected by the device 1/f corner. No public number for the supply-to-jitter conversion factor was found for this report; it must be simulated for the specific design.

## Q10. Why is analog cautious with the lowest VT and shortest L?

**Devices with the lowest VT and shortest L have the highest fT and current density, but also the lowest intrinsic gain gm·ro, the highest leakage (DIBL), the largest random mismatch (σVT ∝ 1/√(W·L)) and, by the same area law, the largest 1/f noise. So precision analog (bias, current mirrors, op amps, comparator offset, references) uses longer L and larger area, while speed-critical paths (CML, drivers, samplers) still use these devices for speed and recover gain and matching with calibration and equalization.**

Key points:
- [Textbook] Pelgrom's law: σ²(ΔVT) = A_VT²/(W·L); at fixed L, making W 4× larger halves σΔVT; with N devices in parallel, σ falls to 1/√N ([Sheikholeslami, IEEE SSC Magazine 2015](https://www.eecg.utoronto.ca/~ali/papers/mag-win-15-process-variation.pdf)).
- [Opinion] "Choose W/L for bandwidth and power, and gate area for accuracy"; without variation, one could "just pick the minimum L" (same source).
- [Textbook] fT is highest at minimum L and maximum current density ([MIT 6.776](https://ocw.mit.edu/courses/6-776-high-speed-communication-circuits-spring-2005/a2408eb19a4ded6f2b8d552688600654_lec6.pdf)).
- [Opinion] Intrinsic gain gm·ro keeps falling from 65 nm to 40 nm to 28 nm, and leakage rises due to DIBL; the well proximity effect can cause VT shifts of "tens of mV" ([Fahim, ISLPED 2014 tutorial](https://www.islped.org/2014/files/ISLPED2014_Challenges%20in%20low-power%20analog%20circuit%20design%20for%20sub-28nm%20CMOS%20technologies%20-%20BY%20Amr%20Fahim%20--%20Semtech%20Corporation.pdf)).

### Why precision analog avoids them

| Problem | Mechanism | Consequence |
|---|---|---|
| Low intrinsic gain | DIBL and channel-length modulation raise gds in short channels | Op-amp open-loop gain falls short; needs cascode or multiple stages |
| Large mismatch | σVT ∝ 1/√(W·L) | Current-mirror error: in the example, 5 mV of ΔVT corresponds to about 5% current error ([Sheikholeslami](https://www.eecg.utoronto.ca/~ali/papers/mag-win-15-process-variation.pdf)) |
| High leakage | Low VT plus DIBL | Sample-and-hold capacitor leakage, bias drift |
| High 1/f noise | Input-referred noise ∝ 1/(Cox²·W·L) (see Q3) | Low-frequency noise and close-in phase noise |
| Sensitive to layout effects | Well proximity, diffusion length, stress | Systematic offset |

### Why high-speed circuits still use them

The first metrics for CML, drivers and samplers are bandwidth and regeneration speed, which need the highest fT and the smallest capacitance. Their needs for gain and matching are relatively low, and those can be made up in other ways:
- Make up gain with multiple stages or equalization.
- Make up offset and mismatch with on-chip calibration, such as sampler offset calibration and duty-cycle and quadrature phase calibration.
- At low VDD, low VT leaves voltage headroom for stacked CML and cascodes; this is one positive role it plays in analog.

[Inference] So VT and L are chosen per block, not per chip. In the same PHY, samplers and drivers may use shortest-L LVT, while bias circuits and current mirrors use long-L SVT or HVT.

### A quick device-selection guide

[Inference]

| Block | L | VT | Area | Reason |
|---|---|---|---|---|
| Serializer, clock buffers, drivers | Shortest | LVT/ULVT | Smallest | Speed first; calibration covers mismatch |
| CML, CTLE input pairs | Short | LVT | Medium | Bandwidth first, with offset in mind |
| Samplers | Short | LVT | Medium | Regeneration speed first; offset calibration |
| Bias, current mirrors, references | Long or stacked | SVT/HVT | Large | Matching, gain, low leakage |
| VCO, low-noise input pairs | Medium to long | Check with the Q2 method | Large | 1/f noise and phase noise |

## Sources

- [arXiv 2512.08388: CNF+CMF low-frequency noise model](https://arxiv.org/pdf/2512.08388)
- [Lundberg, Noise Sources in Bulk CMOS (MIT)](https://web.mit.edu/klund/www/papers/UNP_noise.pdf)
- [Kahng et al., Impact of Gate-Length Biasing on Threshold-Voltage Selection, ISQED 2006](https://vlsicad.ucsd.edu/Publications/Conferences/219/c219.pdf)
- [Wikipedia: Multi-threshold CMOS](https://en.wikipedia.org/wiki/Multi-threshold_CMOS)
- [Vidana et al., GF 12LP FinFET TID study (OSTI 2311246)](https://www.osti.gov/servlets/purl/2311246)
- [Khandelwal et al., Analytical modeling of flicker noise in halo-implanted MOSFETs, IEEE JEDS](https://research.iitj.ac.in/publication/analytical-modeling-of-flicker-noise-in-halo-implanted-mosfets)
- [Simoen et al., ECS 228th Meeting 2015: low-frequency noise in high-k/Al₂O₃ cap I/O pFETs](https://ecs.confex.com/ecs/228/webprogram/Paper57273.html)
- [Simoen et al., ECS 224th Meeting 2013: RMG pFET low-frequency noise and fluorine treatment](https://ecs.confex.com/ecs/224/webprogram/Abstract/Paper19227/E12-2246.pdf)
- [Claeys et al., Low-frequency noise assessment of work function engineering cap layers (imec record)](https://imec-publications.be/entities/publication/4d61541c-c632-44af-965a-d73964502585/full)
- [Asenov et al., IEDM 2000: RTS amplitude and random dopants](https://eprints.gla.ac.uk/3019)
- [PatSnap: Metal gate granularity and VT at 5nm](https://www.patsnap.com/resources/blog/articles/metal-gate-granularity-and-threshold-voltage-at-5nm/)
- [Chen, Stanford PhD thesis 2010: low-frequency noise in high-k MOSFETs](https://stacks.stanford.edu/file/druid:pf645xz5659/cy_thesis-augmented.pdf)
- [ITRS 2005 Wireless chapter](https://www.semiconductors.org/wp-content/uploads/2018/08/2005Wireless.pdf)
- [ITRS 2009 Wireless chapter](https://www.semiconductors.org/wp-content/uploads/2018/09/Wireless.pdf)
- [ITRS 2013 RF and AMS chapter](https://www.semiconductors.org/wp-content/uploads/2018/08/2013RFAMS.pdf)
- [Chew, Yeo & Chu, Impact of technology scaling on the 1/f noise, IEE Proc. CDS 2004](https://repository.sutd.edu.sg/esploro/outputs/journalArticle/Impact-of-technology-scaling-on-the/9911713309846)
- [Srinivasan et al., J. Electrochem. Soc. 2006: HfO₂ vs SiON 1/f noise](https://digitalcommons.njit.edu/fac_pubs/19253)
- [Srinivasan et al., Microelectron. Eng. 2007: high-k phonons and IL thickness (IBM)](https://www.research.ibm.com/publications/impact-of-high-k-and-siolessinfgreater2lessinfgreater-interfacial-layer-thickness-on-low-frequency-1f-noise-in-aggressively-scaled-metal-gatehfolessinfgreater2lessinfgreater-n-mosfets-role-of-high-k-phonons)
- [Rittersma et al., ESSDERC 2005: HfSiON/TaN 1/f noise](https://digitalcommons.njit.edu/fac_pubs/19446)
- [Claeys et al., ECS Trans. 2006: low-noise HKMG gate stack engineering](https://digitalcommons.njit.edu/fac_pubs/19233)
- [Singh et al. (GF), 14 nm FinFET Technology for Analog and RF Applications, IEEE TED 2018](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)
- [Ohguro et al. (Toshiba), IEICE Trans. Electron. 2015: FinFET 1/f noise](https://global.ieice.org/en_transactions/electronics/10.1587/transele.E98.C.455/_pdf)
- [VLSI Symposium 2023 tip sheet](https://archive.vlsisymposium.org/23web/files/press_kit/VLSI2023_TipSheet_Kr.pdf)
- [Asanovski et al. (imec), arXiv 2609.08674: nanosheet vs planar 1/f noise](https://arxiv.org/html/2609.08674)
- [Asanovski et al., Solid-State Electronics 2024: forksheet 1/f noise at 300 K and 4 K](https://air.uniud.it/retrieve/9b187428-ab70-46d9-ae59-c8f49613a887/1-s2.0-S0038110124000303-main.pdf)
- [Simoen et al., JICS 2022: GAA double-nanosheet LFN](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)
- [VLSI 2009 paper 3B-3: RTN in 20 nm-class devices](https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm)
- [Chasin et al. (imec/TU Wien) 2017: time-dependent variability in GAA nanowires vs FinFETs](https://www.iue.tuwien.ac.at/pdf/ib_2017/CP2017_Rzepa_02.pdf)
- [Shin et al., Sci. Rep. 2022: high-pressure D₂/H₂ annealing and LFN](https://www.nature.com/articles/s41598-022-22575-5)
- [Franco et al., EDTM 2019: dipoles and low-thermal-budget gate stacks (BTI)](https://www.iue.tuwien.ac.at/pdf/ib_2019/CP2019_Franco_1.pdf)
- [Prest et al., ECS 2004: SiGe buried-channel pMOS 1/f noise](https://www.electrochem.org/dl/ma/206/pdfs/1319.pdf)
- [Tsuchiya et al., ECS 2003: SiGe channel pMOS LFN](https://www.electrochem.org/dl/ma/203/pdfs/0966.pdf)
- [Han et al., JJAP 2011: high-performance analog devices in HKMG (IBM)](https://www.research.ibm.com/publications/novel-high-performance-analog-devices-for-advanced-low-power-high-k-metal-gate-complementary-metal-oxide-semiconductor-technology)
- [Enz & Temes, Circuit techniques for reducing the effects of op-amp imperfections, Proc. IEEE 1996](https://infoscience.epfl.ch/record/149579)
- [Kiene et al., arXiv 2405.17685: cryogenic LFN in 40 nm bulk](https://arxiv.org/pdf/2405.17685)
- [Catapano et al., arXiv 2505.04030: cryogenic single-defect statistics](https://arxiv.org/abs/2505.04030v2)
- [Balandin group, arXiv 1503.01823: MoS₂ 1/f noise](https://arxiv.org/abs/1503.01823)
- [Fuller et al., FinFET performance advantage at 22nm: An AC perspective, VLSI 2008](https://www.researchgate.net/profile/N_Fuller/publication/4357592_FinFET_performance_advantage_at_22nm_An_AC_perspective/links/5540eb3d0cf2718618dc7332.pdf)
- [MIT 6.776 Lecture 6: fT and fmax](https://ocw.mit.edu/courses/6-776-high-speed-communication-circuits-spring-2005/a2408eb19a4ded6f2b8d552688600654_lec6.pdf)
- [arXiv 1611.03856: intrinsic fT vs CV/I in nanoscale FETs](https://arxiv.org/pdf/1611.03856)
- [WikiChip Fuse: IEDM 2017 Intel 22FFL (RF devices)](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/4/)
- [WikiChip Fuse: IEDM 2017 Intel 22FFL (analog devices)](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)
- [SST/Semiconductor Digest: air spacer for 10 nm FinFET](https://sst.semiconductor-digest.com/?p=72130)
- [IBM Research: Air spacer for 10nm FinFET CMOS and beyond](https://researcher.ibm.com/publications/air-spacer-for-10nm-finfet-cmos-and-beyond)
- [Intel 18A technology brief (2026)](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)
- [IEEE Spectrum: Intel 3 FinFET process](https://spectrum.ieee.org/intel-foundry-finfet)
- [imec via EE Journal: Ru semi-damascene line resistance](https://eejournal.com/industry_news/imec-shows-path-to-line-resistance-halving-using-semi-damascene-with-high-aspect-ratio-processing)
- [Harris & Horowitz: FO4 delay as a process-independent metric](https://pages.hmc.edu/harris/research/FO4.pdf)
- [Palermo, TAMU ECEN689 Lecture 12: TX mux circuits](https://people.engr.tamu.edu/spalermo/ecen689/lecture12_ee689_tx_mux_circuits.pdf)
- [Palermo, TAMU ECEN720 Lecture 15: die-to-die transceivers](https://people.engr.tamu.edu/spalermo/ecen689/lecture15_ee720_d2d_xcvrs.pdf)
- [Galal & Razavi, Broadband ESD protection circuits in CMOS technology, JSSC 2003](https://www.seas.ucla.edu/brweb/papers/Journals/G&RDec03_1.pdf)
- [Razavi, The Analog Mind, IEEE SSC Magazine Spring 2021](https://www.seas.ucla.edu/brweb/papers/Journals/BR_SSCM_2_2021.pdf)
- [Razavi, IEEE TCAS-I 2021: clocking and jitter for wireline transceivers](https://www.seas.ucla.edu/brweb/papers/Journals/BR_TCAS_2021.pdf)
- [Hot Chips 2023 UCIe tutorial: Electrical Form Factor & Compliance](https://www.hc2023.hotchips.org/assets/program/tutorials/ucie/Electrical%20Form%20Factor%20and%20Compliance.pdf)
- [Das Sharma, Updates on UCIe Technology, SNIA SDC 2024](https://snia.org/sites/default/files/2025-05/SNIA-SDC2024-DasSharma-Updates-on-UCIe-Technology.pdf)
- [ESDA forum: CDM die-to-die voltage trend](https://forum.esda.org/t/cdm-die-to-die-voltage-trend-below-30-v-in-esd-technology-roadmap-section-4-3/878)
- [In Compliance Magazine 2023: ESD co-design for high-speed SerDes in FinFET](https://digital.incompliancemag.com/issue/november-2023/esd-co-design-for-high-speed-serdes-in-finfet-technologies/)
- [Intel AN 835: PAM4 Signaling Fundamentals](https://www.intel.com/content/www/us/en/docs/programmable/683852/current/nrz-fundamentals.html)
- [Sheikholeslami, Process Variation, IEEE SSC Magazine Winter 2015](https://www.eecg.utoronto.ca/~ali/papers/mag-win-15-process-variation.pdf)
- [Fahim (Semtech), ISLPED 2014 tutorial: analog design in sub-28nm CMOS](https://www.islped.org/2014/files/ISLPED2014_Challenges%20in%20low-power%20analog%20circuit%20design%20for%20sub-28nm%20CMOS%20technologies%20-%20BY%20Amr%20Fahim%20--%20Semtech%20Corporation.pdf)
- [Design & Reuse: Mimicking digital scaling trends for analog IP](https://www.design-reuse.com/blog/51338-mimicking-digital-scaling-trends-for-analog-ip-kind-of/)
- [Cadence Breakfast Bytes: Chiplets](https://community.cadence.com/cadence_blogs_8/b/breakfast-bytes/posts/chiplets2)
- [Synopsys: SerDes Design Trends in the Angstrom Era](https://www.synopsys.com/articles/serdes-design-trends-angstrom-era.html)


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

