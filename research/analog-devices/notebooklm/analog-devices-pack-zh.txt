# 模拟器件学习资料包（供 NotebookLM 使用）

来源：timememo.net/research/analog-devices/ 。本资料包把四部分合在一起：①学习计划（7 节课）；②指南正文；③提增益与降噪技巧；④术语表。所有内容整理自公开资料；带【推断】的是整理者的判断，带【TCAD】【硅片·研究】的数值不代表量产工艺。


---

# 学习计划：7 节课学会看模拟器件

7 节课，每节 40–50 分钟，可以一周学完，也可以隔天一节。每节三步：先读 2–5 个站内小节（都是已经总结好的内容，不需要读原始论文），再做 4 张自测卡，最后做一个 10 分钟的小练习。三步都打勾，这节就算完成。进度只保存在你这台设备的浏览器里。

## 第1 节：地图：模拟和逻辑怎样看同一个晶体管（40 分钟）

**目标：** 弄清模拟看的是“偏置点上的小信号比值”，记住四个核心指标和它们各自代表的代价。

**要读的章节：**
- 指南: 全景图
- 指南: 评价范式的变化：从"开关"到"偏置点上的放大器"
- 指南: 逻辑优化如何伤害模拟器件：halo、薄氧与低电压
- 指南: 关键指标速查表：定义、关注点与提取方法
- 术语: gm/ID（跨导效率）
- 术语: gm/gds（本征增益）

**核心要点：**
- 逻辑看大信号开关：Ion、Ioff、CV/I。模拟看某个偏置点上的小信号比值：gm/ID、gm/gds、fT、AVT。
- 四个指标对应四种代价：功耗效率、增益、速度、精度。它们都随偏置点移动，所以要放在同一个横轴 gm/ID 上比较。
- 为逻辑做的优化常伤害模拟：halo 降低长沟道器件的输出电阻，薄氧和低电压压缩电压余量。
- FinFET 的本征增益比平面高（GF 14 nm 约 40/34），但 L 和 W 变成了离散台阶。

**自测题：**
- Q: 模拟器件最常用的四个指标是什么？各代表什么代价？
  A: gm/ID（功耗效率）、gm/gds（本征增益，决定精度）、fT（速度）、AVT（匹配精度）。
- Q: 为什么不能只比较 gm？
  A: gm 随电流增大而增大。除以 ID 得到 gm/ID，才能在相同功耗下比较。
- Q: halo 为什么对长沟道模拟器件不友好？
  A: halo 在源漏两端形成高掺杂口袋。长沟道里沟道因此不均匀，漏端势垒随 VDS 变化，输出电阻下降。
- Q: 把逻辑的 Ion/Ioff 换成模拟语言，应该看什么？
  A: 在目标 gm/ID 下的 gm/gds、fT 和 AVT，而不是 VDD 端点上的电流。

**小练习：** 拿一张你熟悉的 ID–VGS 曲线（任何节点都行），标出弱反型、中等反型、强反型大致在哪一段。写一句话：如果它用在放大器里，你会把偏置点放在哪一段，为什么。

## 第2 节：gm/ID 与反型系数：模拟的通用横轴（45 分钟）

**目标：** 学会用 gm/ID 选偏置点、算电流、定尺寸，并知道提取 gm 时的常见陷阱。

**要读的章节：**
- 指南: gm/ID 方法：把所有指标挂到同一个横轴上
- 指南: 提取中的常见陷阱：导数噪声、DC 与 AC gds、去嵌入
- 术语: 反型系数 IC 与弱/中等/强反型
- 术语: fT（特征频率）
- 术语: gm（跨导）

**核心要点：**
- gm/ID 只取决于反型程度，与 W 基本无关。弱反型约 25–30 S/A（上限 1/(n·UT)），强反型低于约 5–8 S/A，模拟常用 10–15 S/A 的中等反型。
- 选定 gm/ID 后：需要的 gm 决定电流，电流密度 ID/W 决定 W。这就是查表（lookup table）设计法。
- fT 随 gm/ID 下降而上升；gm/ID × fT 在中等反型附近有峰值，是速度和功耗的折中点。
- gm 是求导得来的，导数会放大噪声：用细步长、平滑；高频下改用 Y 参数提取。

**自测题：**
- Q: 弱反型 gm/ID 的理论上限是什么？室温下大约多少？
  A: 1/(n·UT)，n ≈ 1.2–1.5，UT ≈ 26 mV，约 25–32 S/A。
- Q: 为什么 gm/ID 可以跨尺寸比较？
  A: 它只依赖反型程度。W 变大时电流和 gm 同比例变大，比值不变。
- Q: 偏置从 gm/ID = 20 移到 8，速度、电流和面积怎么变？
  A: 进入更强反型：fT 上升、器件变小；但同样的 gm 需要更多电流，本征增益一般下降。
- Q: 需要 gm = 1 mS，选 gm/ID = 15 S/A，电流是多少？
  A: ID = gm ÷ (gm/ID) = 1 mS ÷ 15 S/A ≈ 67 µA。

**小练习：** 写下一个模拟偏置点的选择逻辑：目标 gm/ID 是多少，为什么。再算一个例子：gm = 2 mS、gm/ID = 12 S/A 时电流多少（答：约 167 µA）。

## 第3 节：增益：gm/gds、DIBL，以及没有长沟道时怎么办（50 分钟）

**目标：** 搞懂叠管（串联短管）为什么能提高增益、能提高多少、和 cascode 比差在哪，以及低电压下还有哪些办法。

**要读的章节：**
- 指南: 为什么增益重要、为什么长沟道能提高增益
- 技巧: 原理：一步一步看串联为什么像长沟道，又为什么不完全像
- 技巧: 优缺点对比
- 技巧: 何时用叠管，何时用 cascode
- 技巧: 其他提高增益的电路技巧
- 术语: 叠栅 / 串联器件（stacked gates）
- 术语: Cascode 与 gain boosting

**核心要点：**
- 本征增益 ≈ (gm/ID)·VEA，VEA 大致随 L 增长；短沟道里 DIBL 给出上限 gm/gds ≲ 1/η。
- 叠管：N 个短管共栅串联。理想长沟道里等于 N·L；短沟道里像自 cascode——顶管饱和，下面几段在线性区当源极电阻，增益约随 N 线性增长（每翻倍约 +6 dB）。
- 同样两个管子，独立偏置的 cascode 比 N = 2 叠管高约 20 dB：cascode 的下管是约 r_o 的大电阻，叠管的下管只是约 1/gm 的小电阻。代价是多一个 VDSAT 和一路偏置。
- 叠管好处：不需要偏置、省余量、面积大所以匹配和 1/f 好。坏处：内部节点寄生、fT 低、前后仿差异大（业界说法约 30%）。
- 低电压下“每伏余量换到的增益”：CLS、ring amplifier、gain boosting、多级放大优于叠多级 cascode；数字校准则把精确增益的要求拿掉。

**自测题：**
- Q: 叠管为什么在短沟道里不完全等于一根长沟道？
  A: 每段的电流开始依赖自己的 VDS；DIBL、CLM、速度饱和集中在顶管；平面工艺中每段还带自己的 halo。
- Q: 4 个 Lmin 叠管的增益大约是单管的几倍？高多少 dB？
  A: 约 4 倍，约 +12 dB（示意值，实际需用硅片确认）。
- Q: 为什么同样两个管子，cascode 增益比叠管高得多？
  A: cascode 下管饱和，等效约 r_o，输出电阻 ≈ gm·r_o·r_o；叠管下管在线性区，约 1/gm，只把输出电阻放大约 2 倍。
- Q: 什么时候优先用叠管而不是 cascode？
  A: 低余量的电流源和电流镜、需要大面积改善匹配与 1/f、需要规则化版图时。要高 fT 或很高增益时，用 cascode 或 gain boosting。

**小练习：** 画一个 N = 3 的叠管，标出哪一段饱和、哪两段在线性区；写出它输出电阻的近似式（提示：r_out ≈ r_o,top·(1 + gm·R_s)，R_s ≈ 2/gm，所以约 3·r_o）。

## 第4 节：噪声：1/f、RTN，以及 nanosheet 怎么降噪（50 分钟）

**目标：** 知道 1/f 噪声和 RTN 从哪里来、nanosheet 会不会更吵、工艺和设计各有哪些降噪手段。

**要读的章节：**
- 指南: 1/f 噪声的两种模型与诊断方法
- 指南: RTN：小面积器件的统计学问题
- 技巧: 先抓主因：1/f 噪声是栅叠层的陷阱问题
- 技巧: 工艺旋钮：公开证据一览
- 技巧: 设计侧做法
- 技巧: Chopping（斩波稳定）
- 术语: Flicker noise（1/f 噪声，闪烁噪声）
- 术语: RTN（随机电报噪声）

**核心要点：**
- 1/f 噪声来自栅介质陷阱抓放载流子（以载流子数涨落为主），S_VG ∝ N_OT/(Cox²·WL)。面积翻倍，噪声功率减半。
- nanosheet 不比平面更吵：imec 在同栅叠层下比较，边界陷阱密度相当，主导的是栅叠层质量。
- 工艺旋钮：可靠性退火（高压 D₂ 在 FD-SOI TFET 上降约 4.8 倍）、热预算、薄 EOT。dipole 对噪声没有公开数据，BTI 数据显示方向乐观。
- RTN：GAA 单陷阱 ΔVT 约 1 mV（FinFET 约 1.9 mV），但陷阱个数仍按面积算；小器件分布长尾，要看统计角落。
- 设计侧：大面积输入管、低过驱动；chopping 把 1/f 搬走且不混叠白噪声，auto-zero/CDS 能减掉 1/f 但会混叠白噪声。

**自测题：**
- Q: S_ID/ID² 与 (gm/ID)² 成比例，说明什么？
  A: 载流子数涨落（陷阱，ΔN 模型）主导。
- Q: nanosheet 会让 1/f 噪声变差吗？
  A: 公开的 imec 数据显示，同栅叠层下面积归一的噪声与平面相当；关键在栅叠层的陷阱密度。
- Q: chopping 和 auto-zero 的根本区别？
  A: chopping 调制，把失调和 1/f 搬到高频再滤掉，不混叠白噪声但有纹波；auto-zero 采样后减掉，会把宽带白噪声混叠到基带。
- Q: 输入管面积从 0.5 µm² 增到 2 µm²，1/f 噪声电压 rms 变多少？
  A: 噪声功率降到 1/4，rms 降一半，约 −6 dB。

**小练习：** 写下两条：如果要为一个低频精密放大器选输入管，你会在器件选型（面积、器件类型、偏置）上怎么做，在电路上（chopping 或 auto-zero）选哪一个，为什么。

## 第5 节：失配与版图：Pelgrom 定律与“相同环境”（45 分钟）

**目标：** 会用 Pelgrom 定律估面积，知道 GAA 的失配从哪里来，能说出常用的版图匹配手段。

**要读的章节：**
- 指南: 失配：Pelgrom 定律与各类器件的匹配系数
- 指南: FinFET/GAA 中的新失配来源
- 指南: 器件级版图：匹配取决于"环境相同"，而不只是 W/L 相同
- 技巧: 失配：金属栅晶粒主导，堆叠 sheet 是最省面积的旋钮
- 技巧: 版图匹配技巧（多 finger、双边栅接触、dummy、共质心）
- 术语: Pelgrom 定律
- 术语: LDE（版图相关效应：WPE、LOD、OSE）
- 术语: 共质心与交叉指状版图

**核心要点：**
- σΔVT = AVT/√(WL)：面积翻 4 倍，失配减半。单管与差分对的 σ 差 √2，用 PDK 前先确认定义。
- FinFET/GAA 去掉了沟道掺杂（RDF），新的主导项是金属栅晶粒（WFV）、fin/sheet 几何和 S/D 电阻。
- nanosheet：LER 影响很小；更细的栅金属晶粒、更多层 sheet（TCAD：3 层比 1 层低约 40%）能降失配。
- 版图上“相同环境”比相同 W/L 更重要：dummy、共质心、相同朝向、远离阱边和扩散断。
- 先进节点越来越多地用校准代替“把输入管做大”。

**自测题：**
- Q: 要把 σΔVT 从 4 mV 降到 2 mV，面积要变几倍？
  A: 4 倍。
- Q: GAA 中失配的一阶来源是什么？
  A: 金属栅功函数/晶粒涨落（WFV/MGG），其次是几何（sheet 厚度）和 S/D、接触电阻。
- Q: 共质心布局解决的是哪类失配？
  A: 线性梯度（工艺、温度、应力）造成的系统失配；随机失配只能靠面积或校准。
- Q: 什么是 LDE？举两个例子。
  A: 版图相关效应：阱边邻近效应（WPE）、扩散长度和应力（LOD/OSE）、gate cut 和扩散断等。

**小练习：** 画一个 ABBA 共质心的 4 单元差分对，两端加 dummy；写出它抵消的是哪一类梯度、抵消不了什么。

## 第6 节：Nanosheet/GAA 与前沿（45 分钟）

**目标：** 知道 GAA 给模拟带来的好处与新难点：sheet 宽度、寄生、自热、背面供电，以及 forksheet 和 CFET。

**要读的章节：**
- 指南: GAA 相对 FinFET 的模拟优势
- 指南: GAA 给模拟带来的问题
- 指南: 背面供电（BSPDN）对模拟意味着什么
- 技巧: DIBL 与本征增益：窄 sheet、长 Lg
- 技巧: fT / fmax 与寄生：瓶颈在 sheet 之外
- 技巧: 自热：BDI 的代价
- 术语: BDI（底部介质隔离）
- 术语: 自热（self-heating）与热阻 Rth

**核心要点：**
- GAA 静电更好：DIBL 和 SS 改善，本征增益比 FinFET 高（imec 研究器件约 46 dB）。
- 宽度可以按 sheet 宽度调，但量产工艺只给离散菜单；sheet 越宽 DIBL 越大，所以模拟最优的 sheet 偏窄。
- 难点转到寄生和热：fT/fmax 由 sheet 间隙、S/D 外延、接触和 BDI 决定；BDI 改善 RF 和漏电，但加重自热（TCAD 单叠层约 2.59 K/µW）。
- 背面供电降低 IR 压降、释放正面布线，但衬底基本被去掉，散热和衬底耦合的情况随之改变。
- 下一步 forksheet 和 CFET：n 和 p 靠得更近，耦合和散热更难。

**自测题：**
- Q: 为什么 GAA 的本征增益通常好于 FinFET？
  A: 栅从四面包住沟道，DIBL 更小，gds 更低。
- Q: BDI 对模拟的好处和代价？
  A: 好处：切断片下寄生沟道和衬底耦合，RF 指标改善。代价：散热路径变差，自热加重。
- Q: 自热会怎样扭曲 gds 的测量？
  A: DC 测量时器件升温使电流下降，gds 偏小甚至为负；要用脉冲 IV 或高频 Y22 测等温 gds。
- Q: sheet 宽度对模拟有什么影响？
  A: 越宽驱动越大，但 DIBL 越大、增益越低；量产只给离散宽度，匹配器件要用相同宽度。

**小练习：** 列出你最想问 PDK 或器件团队的 3 个 GAA 模拟问题。提示：AVT 和 S_VG·WL 的统计角落、叠管增益随 N 的变化、热阻 Rth。

## 第7 节：速度与功耗：Drive 与 Cdyn，再加总复习（45 分钟）

**目标：** 把模拟指标和你熟悉的 Drive/Cdyn 语言连起来，然后把整张地图重画一遍，清空错题本。

**要读的章节：**
- 术语: Drive 与 Cdyn 关系图
- 术语: Cdyn（动态电容）
- 术语: Drive / 驱动电流（Idsat、Ion）
- 术语: V–F 曲线（电压–频率）与 Vmin
- 术语: 等功耗 / 等频率比较（iso-power、iso-frequency）
- 指南: 把工艺旋钮映射到模拟指标

**核心要点：**
- 速度链：τ ∝ C_load·V/Ieff。看 I/C 比，在同 Ioff、同面积下比较。
- 功耗链：P = Cdyn·V²·f，Cdyn = Σα·C，是全芯片口径：器件、MOL、BEOL、时钟都在里面。
- 两条链在 V–F 曲线相遇。如果降掉的电容不在关键路径上，同功耗下的频率收益只有 Cdyn 降幅的约 1/3–1/2。
- 降 C 是双赢，降 R 只帮速度；本征沟道电容是“好电容”，不能随便减。

**自测题：**
- Q: Cdyn 和频率直接相连吗？
  A: 定义上不相连（已经除以 f），实际通过共享电容、功耗预算和测量效应相连。
- Q: Cdyn 降 15%，降掉的电容不在关键路径上，V–F 斜率 s ≈ 1，同功耗下频率约提高多少？
  A: 约 5%：15% ÷ (1 + 2/s) = 15% ÷ 3。
- Q: 为什么同一个工艺改进，“等频率省电”的百分比比“等功耗提速”大？
  A: 功耗随 V²：等频率时可以降电压，省得多；等功耗时提频要付 V² 的代价。
- Q: 环形振荡器怎样同时给出延迟和 Cdyn？
  A: τ = 1/(2N·f)；C = (IDDA − IDDQ)/(N·VDD·f)。

**小练习：** 不看资料，把第 1 节的指标地图重画一遍，再对照全景图补齐。然后打开错题本，把剩下的卡片再做一遍，直到清空。


---

# 用模拟的尺子重新丈量晶体管

对逻辑出身的器件工程师来说，转向模拟器件首先要换一套评价方式，器件物理本身变化不大。逻辑器件看最小 L 下的 Ion/Ioff 和 CV/I；模拟器件看的是**某个偏置点上的小信号比值**：效率 gm/ID、本征增益 gm/gds、在给定 gm/ID 下的速度 fT，以及匹配系数 AVT。1/f 噪声、RTN、线性度、漏电和自热是第二梯队。这些指标都要跨多个 L、在中等反型附近提取。为逻辑优化的工艺手段（halo、薄氧、低电压、最小 L）往往直接伤害这些指标。FinFET 靠更好的静电控制把本征增益提高了约 2–10 倍（[Fulde 2007](https://d-nb.info/1149772921/34)），代价是宽度量化、寄生、自热和受限的 L。设计者因此用叠栅、宽松 pitch 的模拟器件、厚氧 I/O 器件、低反型偏置、cascode/gain boosting、数字校准和 chiplet 分割来弥补"没有长沟道"。到了 nanosheet/GAA，公开的研究器件数据显示本征增益更高（imec 研究器件约 46 dB），1/f 噪声在相同栅叠层下与平面相当（[imec arXiv 2026](https://arxiv.org/html/2609.08674)）；新的难点是寄生 R/C、sheet 底部寄生沟道、自热、PMOS 迁移率，以及无源器件不随工艺缩小。量产节点（TSMC N2、Intel 18A、Samsung SF3/SF2）的模拟器件参数几乎都只在 PDK 和付费论文里，公开文献以研究器件和 TCAD 为主。本报告逐条标注证据类型，并给出一个从全局到细节、再到前沿的 7 天学习计划。

## 全景图

**先看这张表定位问题，再跳到对应章节；带 + 的细节小节都可以单独点开阅读。**

证据标签约定：【常识】指教科书或通用知识，本次调研未逐条找来源；【硅片·研究】指研究器件的实测数据；【硅片·量产平台】指已发表的量产或准量产工艺实测数据；【TCAD】指仿真；【厂商】指厂商技术简报或声明；【观点】指行业访谈；【推断】是本报告自己的推理。

| 主题 | 核心问题 | 关键指标 / 参数 | 本报告位置 |
|---|---|---|---|
| 模拟 vs 逻辑 | 评价器件的方式有何不同？逻辑优化如何伤害模拟？ | Ion/Ioff、CV/I 对比 gm/ID、gm/gds、fT、AVT；halo、DIBL | §1 |
| 版图与 LDE | 为什么 W/L 相同的两个器件仍然失配？ | WPE、LOD/OSE、PSE、扩散断、dummy、共质心 | §1、§2 |
| 指标与量测 | 模拟看哪些指标？怎么提取？ | gm、gds、VEA、gm/ID、IC、fT、fmax、Cgg、γ、S_VG·WL、AVT、VIP3、ZTC、Rth | §2 |
| 增益与长沟道 | 为什么要 long channel？没有它怎么办？ | gm·ro、VEA/L、叠栅、I/O 器件、cascode、gain boosting、数字校准 | §3 |
| 噪声 | 1/f 和 RTN 从哪来？受什么工艺旋钮控制？ | N_OT/N_BT、α_SC、S_VG·WL、RTN ΔVth、γ、NFmin | §4 |
| 失配 | Pelgrom 定律在 FinFET/GAA 中还适用吗？ | AVT、Aβ、MGG/WFV、fin 角度、LER | §4 |
| Nanosheet/GAA | GAA 对模拟的好处和问题各是什么？ | 本征增益、宽度粒度、寄生 C/R、自热、1/f、sub-sheet 漏电 | §5 |
| 更前沿 | forksheet、CFET、背面供电对模拟意味着什么？ | 介质墙、n/p 垂直堆叠、衬底减薄、MIM、热阻 | §5 |
| 工艺背景的优势 | 哪些工艺旋钮对应哪些模拟指标？ | EOT、金属栅、halo、S/D 电阻、栅接触 | §6 |
| 学习方法 | 不爱线性阅读的专家怎么学最有效？ | 检索练习、间隔、地图先行、专家逆转效应 | 学习方法 |
| 资料 | 先读什么，后读什么？ | 教材章节、经典论文、开源 PDK 与工具 | 推荐阅读路线 |
| 计划 | 7 天、每天 2–3 小时怎么安排？ | 每天的目标、材料、练习、自测 | 7 天学习计划 |

## 1. 模拟器件看"偏置点上的小信号比值"，而不是 Ion/Ioff

**逻辑器件按最小 L 上的开关性能优化，模拟器件按中等反型偏置下的效率、增益、速度、匹配和噪声来评价；为逻辑做的工艺优化常常直接伤害这些模拟指标。**

要点：
- 模拟的评价对象是一组曲线：fT、gm/gds、ID/W 等对 gm/ID 作图，每个 L 一条曲线（[Palermo/TAMU](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)）。
- Halo/pocket 注入改善了短沟器件，却让较长的模拟器件出现"长沟 DIBL"、ro 下降和 RSCE（[Mudanai et al., Intel, 2006](https://briefs.techconnect.org/papers/halo-doping-physical-effects-and-compact-modeling/)）。
- 从平面到 FinFET，本征增益提高约 2–10 倍，代价是短沟 gm 最多低约 30%、宽度量化、寄生变大和自热（[Fulde 2007](https://d-nb.info/1149772921/34)）。
- 匹配取决于器件所处的**环境**是否相同：阱边距离、扩散长度、栅密度、上方走线，W/L 相同远远不够（[eeNews Europe 2014](https://www.eenewseurope.com/en/layout-dependent-effects-in-analog-design)；[ASIC North 2023](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/)）。
- 模拟设计依赖的器件远不止核心晶体管，还有厚氧 I/O 器件、精密电阻、MOM/MIM 电容、varactor、寄生 PNP 等。

### 评价范式的变化：从"开关"到"偏置点上的放大器"

逻辑器件的品质因数是大信号的：Ion 和 Ioff 决定速度与静态功耗，CV/I 或 Ieff 决定门延迟，评价点基本固定在 VDD 和最小 L。模拟器件被当作小信号放大器使用，品质因数都是**某个偏置点**上的导数之比。gm/ID 表示每单位电流换到多少跨导，即功耗效率；gm/gds = gm·ro 是单管能给出的最大电压增益；fT = gm/(2πCgg) 是在该偏置下的速度；σ(ΔVT) = AVT/√(WL) 表示精度。Murmann 一系的 gm/ID 方法把这些量全部画成 gm/ID 的函数，每个 L 一条曲线。这些曲线在一阶近似下与 W 无关，所以可以先做"归一化设计"，最后才用 W = ID/(ID/W) 定尺寸（[Palermo, TAMU ECEN474 Lecture 7](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)）。

因此，模拟设计者对器件提出的问题是：在 gm/ID ≈ 10–15 S/A 的中等反型区，不同 L 下的 gds 和 Cgg 是多少？峰值驱动电流反而是次要的。【常识】gm/ID 的上限约为 1/(n·UT)，弱反型下约 25–35 S/A，强反型下更低；EKV 用反型系数 IC 区分弱反型（IC < 0.1）、中等反型（0.1–10）和强反型（> 10）。同一来源总结了几条基本权衡：gm/ID 高时省功耗、摆幅大，但 fT 低；L 短时 fT 高，L 长时 ro 和本征增益高；本征增益在低过驱动时最高（[Palermo](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)）。

### 逻辑优化如何伤害模拟器件：halo、薄氧与低电压

Intel 的作者在 2006 年明确写道：halo/pocket 注入降低了短器件的 DIBL 和短沟效应，但"通常较长的模拟晶体管性能会因这些注入而严重退化"。具体表现是 ro 下降、出现**长沟 DIBL**和 RSCE，长沟迁移率的提取也会被扭曲（[Mudanai et al., 2006](https://briefs.techconnect.org/papers/halo-doping-physical-effects-and-compact-modeling/)）。【推断】机理是 halo 形成横向不均匀掺杂：漏偏压会降低漏端 halo 势垒，所以把 L 拉长也拿不回预期的 ro。这正是逻辑工艺整合工程师最熟悉的旋钮，只是现在要从 gds 的角度重新审视它。

薄栅氧和 high-k 带来栅漏电，会加载采样保持、积分器、偏置线和电荷泵这些高阻节点。所以这些节点通常改用厚氧 I/O 器件【常识】。GIDL/BTBT 等结漏电决定开关电容电路的保持衰减【常识】。High-k 的电荷俘获在早期 FinFET 上可造成高达约 100 mV 的 VT 漂移，时间常数从 µs 到 ms。数字电路能容忍约 10 mV，而几 mV 的动态漂移就足以让 12 位 SAR ADC 退化（[Fulde 2007](https://d-nb.info/1149772921/34)）。低电压的问题是余量不足：3 nm 级节点的电源已接近 Si 带隙（约 1.2 V），连 bandgap 基准都要重新设计（[Semiconductor Engineering 2021](https://semiengineering.com/wrestling-with-analog-at-3nm/)）【观点】。电压一低，多级 cascode 就叠不起来。

### 从平面到 FinFET：增益上去了，代价换了形式

Infineon/TU München 用 45 nm 级 FinFET 原型（Lg 60 nm、Wfin 30 nm、Hfin 60 nm）与体硅对比，结果如下（[Fulde 2007](https://d-nb.info/1149772921/34)）【硅片·研究 + 仿真】：
- 在典型模拟尺寸下，FinFET 的本征增益 gm/gds 高约 **2–10 倍**。
- 由于侧壁迁移率较低和 S/D 接入电阻，短沟 FinFET 的 gm 最多低 **30%**。
- 两级 Miller OTA 在 3·Lmin 下，FinFET 的 DC 增益为 **81.3 dB**，体硅为 48.4 dB，GBW 相近（10.6 对 10.8 MHz）。
- 作者认为 FinFET 更适合 10 GHz 以下的模拟应用，因为寄生电容和 Rs 限制了 fT。

EPFL 的幻灯片引用 Wambacq（ISSCC 2008）称，80 nm n-FinFET 的 Early 电压是同 L 平面体硅的 10 倍以上，但平面应变硅在 fT 上更快（[Bucher, EPFL 2011](https://www.epfl.ch/labs/iclab/wp-content/uploads/2019/02/Bucher_NanoTera_2011.pdf)）。imec 2012 年的数据显示，FinFET 的 gm/gds–L 曲线在 100–1000 nm 范围内整体高于平面。imec 同时警告，在先进 FinFET 中寄生电阻可能超过沟道电阻，寄生电容可能超过本征栅电容（[Badaroglu, imec, MOS-AK 2012](https://www.mos-ak.org/sanfrancisco_2012/presentations/T01_Badaroglu_MOS-AK_121212.pdf)）。

FinFET 的代价还包括宽度量化（每个 fin 的宽度为 2·Hfin + Wfin，例中为 150 nm/fin）和自热。在 FinFET 测试器件上，热时间常数约 100 ns，电流最多下降约 10%（[Fulde 2007](https://d-nb.info/1149772921/34)）。SOI 层的热导率约为体硅的 1/100，自热问题在 SOI FinFET 中尤其突出（[ASIC North 2023](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/)）。

### 先进节点 PDK 中模拟设计可用的器件菜单

FinFET PDK 在核心逻辑器件之外，一般还提供以下模拟用器件（[ASIC North 2023](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/)，涉及 GF 14LP、IBM/Samsung FX14、TSMC N7/N5/N3）：
- **寄生 PNP BJT**：用于 bandgap 基准和温度传感器。
- **FEOL/MOL 电阻**：基底层电阻会阻挡同区域的 CMOS 摆放，MOL 电阻会阻挡下方的金属走线。
- **finger 电容和 MOS 电容**：密度不错，通常做成 PCell。电荷重分配 DAC 可能需要约 1 pF 的单位电容。

BJT 的 VBE 匹配（AVBE ≈ 0.35 mV·µm）优于 MOS，这是基准电路偏爱 BJT/二极管的原因（[Pelgrom 1998](https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf)）。

有据可查的先进节点模拟器件菜单只有零星几个。Intel 22FFL 在 144/216/270 nm 的宽松栅 pitch 上提供专门的模拟薄氧器件，还提供 Lg 为 90/120/160 nm、对应 1.2/1.5/1.8 V 的厚氧 I/O 器件；逻辑 LL 器件的 Lg 为 74 nm（[WikiChip, IEDM 2017](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)）【硅片·量产平台】。

【常识/行业惯例】模拟 PDK 的器件特性报告通常包含：
- 角落模型和统计模型；
- 每类器件、每种 VT 的 AVT 和 Aβ；
- 电阻的方阻、TCR 和 VCR；
- 电容的密度、VCC/TCC 和匹配；
- BJT 的 β 和 VBE(T)；
- 1/f 模型参数；
- 模拟偏置条件下的可靠性限制；
- LDE 模型的覆盖范围。

开放的 GF180MCU 设计手册也明确要求查阅"device characterization report"中的失配数据（[GF180MCU DRM 5.4](https://mithro-gf180mcu-pdk.readthedocs.io/en/latest/physical_verification/design_manual/drm_05_4.html)）。

### 器件级版图：匹配取决于"环境相同"，而不只是 W/L 相同

先进节点的版图相关效应（LDE）会让 W/L 相同的器件产生系统性差异。下表汇总已有来源的部分；FinFET/GAA 中 LOD、OSE、PSE、扩散断的具体 mV 数值，本次调研没有找到公开来源。

| 效应 | 机理 | 影响 | 缓解方法 | 来源 |
|---|---|---|---|---|
| WPE（阱邻近效应） | 阱注入离子从光刻胶侧壁散射进入沟道 | VT 升高"几到几十 mV" | 加大阱边距离，保持匹配器件到阱边的距离一致 | [eeNews Europe 2014](https://www.eenewseurope.com/en/layout-dependent-effects-in-analog-design) |
| LOD / STI 应力 | 栅到扩散边缘的距离改变应力，从而改变迁移率和 ID | ID 系统性偏移 | 扩散尺寸、形状、方向一致；加 dummy | 同上 |
| OSE / PSE / 扩散断（SDB/DDB） | 相邻有源区和栅几何改变 STI/CESL 应力 | 边缘 finger 的 VT 和 ID 偏移 | 连续扩散，阵列两端加 dummy gate | 【推断】，FinFET 实践见 [ASIC North](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/) |
| fin 分组图形化 | fin 成组图形化，组内匹配更好 | 跨组匹配变差 | 部分 fab 要求匹配器件位于指定 fin pitch 上 | [ASIC North](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/) |
| 上方走线和周边环境 | 金属覆盖、应力、温度梯度 | 系统失配 | 精密匹配器件上下不走无关的金属、poly 或硅化扩散 | [GF180MCU DRM 5.4](https://mithro-gf180mcu-pdk.readthedocs.io/en/latest/physical_verification/design_manual/drm_05_4.html) |
| 梯度 | 工艺、温度和应力的线性梯度 | 系统失配 | 共质心、交指、中心抽头的差分对 | [Pelgrom 1998](https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf)；[ASIC North](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/) |

Pelgrom 的经典规则是：匹配器件在几何、旋转方向、偏置和温度上都要相同，并注意距离、形貌、金属覆盖、注入条纹、封装和机械应力，避免在光刻极限尺寸上做匹配器件（[Pelgrom 1998](https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf)）。

FinFET 增加了几条新规矩（[ASIC North](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/)）：
- 高性能器件因局部 IR 降和 EM 限制，常只用约 4 个 fin。
- M1 要与 fin pitch 和 poly pitch 对齐。
- 锁定 SADP 着色，以保证寄生可预测。
- 设计规则数以"千"计。

共质心并非没有代价：它会增加走线寄生和不对称。UMN Sapatnekar 组有专门研究，本次未能打开全文。

## 2. 模拟器件的四大指标是 gm/ID、gm/gds、fT 和 AVT

**模拟器件最看重的是 gm/ID（效率）、gm/gds（本征增益）、给定 gm/ID 下的 fT（速度）和 AVT（匹配），其次是 1/f 噪声、线性度、漏电与自热；每个指标都要在指定偏置、多个 L 下，用专门的测试结构和去嵌入方法提取。**

要点：
- 逻辑看 Ion、Ioff、CV/I、Ieff；模拟看小信号比值，而且要说明"在哪个 gm/ID、哪个 VDS、哪个 L"。
- 厂商开始按工作点报告指标。例如 Intel 22FFL 报告 gm/ID ≥ 10 时的"可用 fT"约 205 GHz，不只报峰值 fT（[WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)）。
- 存在自热时，DC 测得的 gds 不等于电路在高频下看到的 gds。热时间常数约 100 ns（[Fulde 2007](https://d-nb.info/1149772921/34)），需要用 AC 或脉冲测量。
- 失配和噪声要靠阵列化统计（每种几何数千个器件），只测"典型器件"不够（[Simicic 2015](https://lirias.kuleuven.be/bitstream/123456789/525000/2/IIRW2015_OA.pdf)）。

### 关键指标速查表：定义、关注点与提取方法

| 指标 | 定义 / 公式 | 逻辑 vs 模拟的关注点 | 怎么量测 / 提取 |
|---|---|---|---|
| gm | ∂ID/∂VGS（固定 VDS）【常识】 | 逻辑间接关心（与 Ion 相关）；模拟直接决定增益和噪声 | 对 DC Id–Vg 扫描做数值微分 |
| gds、ro、VEA | gds = ∂ID/∂VDS = 1/ro；VEA ≈ ID/gds，常归一为 VEA/L（V/µm）【常识】 | 逻辑基本不看；模拟中它决定增益上限 | 对 Id–Vd 做平滑或拟合后求导（导数噪声大）；与 AC gds 对照 |
| 本征增益 gm/gds | gm·ro ≈ (gm/ID)·VEA（[Palermo](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)） | 模拟核心指标。FinFET 比平面高约 2–10×（[Fulde](https://d-nb.info/1149772921/34)）；GF 14 nm 为 40 (n)/34 (p)，是 28 nm 平面的 3 倍以上（[Singh/GF, TED 2018](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)） | 以 gm/ID 为横轴、每个 L 一条曲线；在多个 VDS 下画 gm/gds |
| gm/ID 与 IC | 上限约 1/(n·UT)；IC = ID/(2nμCoxUT²·W/L)【常识，EKV】 | 逻辑不看；模拟用它选偏置区（中等反型是"甜点"） | 由 Id–Vg 计算 gm/ID 对 ID/W 的曲线；可借助 lookup table |
| fT | gm/(2π·Cgg)，Cgg ≈ Cgs + Cgd（[Palermo](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)） | 逻辑看 CV/I；模拟看"给定 gm/ID 下的 fT"以及 fT·gm/ID | 去嵌入（open/short）后的 S 参数，取 h21 降到 1 的频率【常识】 |
| fmax | 约为 fT/(2√(Rg·(gds+2πfT·Cgd)))【常识】 | RF 核心指标，由 Rg 主导。GF 14 nm 双边栅接触使 fmax 提升 1.26×/1.40×（n/p）（[Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)） | 单向增益 U 或 MAG/MSG 降到 1 的频率 |
| Cgg、Cgd、Cdd | Cgg = Im(Y11)/ω，Cgd = −Im(Y12)/ω【常识】 | 逻辑看总电容；模拟看 Cgd/Cgg（Miller 效应）和 Cdd/Cgg（[Palermo](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)） | 大阵列 split-CV/LCR（约 100 kHz–1 MHz），或从 Y 参数提取 |
| 热噪声 γ | 漏端噪声电流谱 = 4kT·γ·gm，长沟饱和区 γ = 2/3（[McNeill](https://users.wpi.edu/~mcneill/papers/CICC_v09_CORRECTED.pdf)） | 短沟中 γ 升高；决定 LNA 噪声和 NFmin | 噪声参数系统（tuner、Fmin、Rn、Γopt）【常识】 |
| 1/f 噪声 | S_VG ≈ K/(Cox·W·L·f)；CNF 模型中 S_Vfb ∝ N_OT（[Simoen/JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)） | 逻辑不看；模拟中决定 VCO 相噪、低频精度和 flicker 角频率 | 低噪声放大器加 FFT 分析仪（如 Keysight E4727B），约 1 Hz–100 kHz；报告 S_VG·WL |
| RTN | 单个陷阱引起的两电平或多电平跳变 | 小面积器件中 ΔVth 可超过 70 mV（[VLSI 2009](https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm)） | 时域记录，大样本统计 |
| AVT、Aβ | 对差分对，σ(ΔVT) = AVT/√(WL)，σ(Δβ/β) = Aβ/√(WL)（[Pelgrom 2013](https://indico.cern.ch/event/228972/contributions/1539553/attachments/378475/526400/TWEPP24sept2013Print.pdf)） | 逻辑看 SRAM/Vmin 的 σVT；模拟中直接决定失调和精度 | 成对或阵列器件，σ 对 1/√(WL) 作 Pelgrom 图，斜率即 AVT |
| 电流失配 | σ²(ΔID/ID) = (gm/ID)²·σ²(ΔVT) + σ²(Δβ/β)【常识】 | gm/ID 高（弱反型）时 VT 失配主导 | 由 VT 和 β 失配合成 |
| 线性度 | gm2、gm3；VIP2 = 4gm/gm2，VIP3 = √(24gm/gm3)【常识】 | 模拟/RF 关注失真，gm3 = 0 的"甜点"靠近 VT | 高精度 DC 扫描求高阶导数，或双音 IIP3 测量 |
| ZTC 点 | ID 不随温度变化的 VGS【常识】 | 用于基准和偏置设计。imec nanosheet 的 ZTC 模型误差约 12%（[JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)） | 多温度 Id–Vg 曲线的交点 |
| 栅漏电和结漏电 | IG、GIDL、BTBT【常识】 | 高阻节点、保持电路和高温基准受其影响 | 高精度 SMU，多温度测量 |
| 自热 Rth、τth | 热阻与热时间常数 | FinFET 中 τth 约 100 ns，电流最多降约 10%（[Fulde](https://d-nb.info/1149772921/34)） | 脉冲 IV（< 100 ns）、栅电阻测温、DC 与 AC gds 对比 |
| DIBL、SS | 【常识】 | 逻辑看 Ioff；在模拟中 DIBL 直接进入 gds | 标准 Id–Vg 测量 |

### 逻辑 FoM 与模拟 FoM 的对照

| 维度 | 逻辑器件 | 模拟器件 |
|---|---|---|
| 评价点 | VDD、Lmin、全开或全关 | 指定 gm/ID（常为 5–20 S/A）、VDS 约 VDD/2、多个 L【常识】 |
| 速度 | CV/I、Ieff、环振频率 | 给定 gm/ID 下的 fT、fmax |
| "强度" | Ion（µA/µm） | gm/ID（效率）和 gm/gds（增益） |
| 变异 | σVT（SRAM Vmin、时序） | AVT、Aβ、1/f 噪声的统计分布、RTN 尾部 |
| 关心的 L | 最小 L | 一个 L 的范围（同一芯片上可能从 1× 到数十倍 Lmin） |
| 噪声 | 基本不看 | 热噪声 γ、1/f 角频率、RTN |
| 温度 | 角落和可靠性 | ZTC、VT(T)、自热造成的 gds 频散 |

### gm/ID 方法：把所有指标挂到同一个横轴上

gm/ID 方法的核心是：用 SPICE 对 L、VGS、VDS、VSB 做四维扫描，生成 lookup table，再把 fT、gm/gds、ID/W、Cgd/Cgg 等量都画成 gm/ID 的函数。设计流程是先由带宽和负载得到 gm = 2π·fu·CL，再选 gm/ID 和 L，最后用 ID/W 算出 W（[Palermo](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)）。该讲义的 0.6 µm 工艺算例中，gm/ID = 3.14 V⁻¹、ID = 1 mA，得到 W ≈ 49.5 µm、Cgg = 74.1 fF、fT ≈ 6.7 GHz、gm/gds ≈ 30.6。

这个方法对工艺工程师特别友好，因为它把"器件曲线"直接接到了"电路尺寸"上。Murmann 的开源 starter kit 提供 SKY130、IHP SG13G2、GF180 的 Xschem 扫描原理图和现成的 .mat 表，配合 pygmid 可在几小时内得到这些曲线（[bmurmann/Book-on-gm-ID-design](https://github.com/bmurmann/Book-on-gm-ID-design)）。需要注意的是，开放 PDK 都是 130–180 nm 平面工艺，曲线的形状和权衡关系可以迁移，绝对数值不能。

### 提取中的常见陷阱：导数噪声、DC 与 AC gds、去嵌入

第一个陷阱是**导数噪声**。gds 是 Id–Vd 的导数，在饱和区数值很小，直接差分噪声极大，需要平滑或拟合后再求导；gm2、gm3 等高阶导数更敏感【常识】。

第二个陷阱是**DC 与 AC gds 不一致**。DC 扫描测得的 gds 包含自热效应，在 FinFET/SOI 中甚至可能为负。高频电路看到的是热时间常数之外的 AC gds，以约 100 ns 的 τth 计算，对应约 1–10 MHz 以上的频率（[Fulde 2007](https://d-nb.info/1149772921/34) 的 τth，换算为【推断】）。因此要用 S/Y 参数或亚 100 ns 的脉冲 IV 测量，并在模型中启用自热网络（如 BSIM-CMG 的 SHMOD）。

第三个陷阱是**RF 去嵌入**。fT 和 fmax 必须在 open/short 去嵌入后的 S 参数上提取。fmax 由栅电阻主导，所以 RF 器件要用多 finger 和双边栅接触【常识】。GF 14 nm 的数据可以说明这一点：单边栅接触的 fmax 为 180/140 GHz，双边接触为 227/195 GHz（[Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)）。

第四个陷阱是**统计量**。失配需要 Kelvin 连接的阵列：imec/KU Leuven 在 28 nm 上做了 54,432 个器件、每种几何 4,536 个的阵列，用 Kelvin 检测消除金属线和传输门上的 IR 降，Pelgrom 图带 99% 置信区间（[Simicic 2015](https://lirias.kuleuven.be/bitstream/123456789/525000/2/IIRW2015_OA.pdf)）。

### 器件层面的设计规则清单

| 规则 | 原因 | 证据类型 / 来源 |
|---|---|---|
| 增益和匹配关键的器件不用 Lmin，至少用几倍 Lmin，或用叠栅、模拟专用器件 | 短沟 DIBL/CLM 使 gds 偏大；halo 会伤害较长器件 | [Mudanai 2006](https://briefs.techconnect.org/papers/halo-doping-physical-effects-and-compact-modeling/)；[Fulde 2007](https://d-nb.info/1149772921/34) |
| 默认偏置在中等反型，按 gm/ID 选点 | 在效率、速度和增益之间取折中 | [Palermo](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf) |
| 按目标失调反推 WL：WL ≥ (AVT/σ目标)² | Pelgrom 定律 | [Sheikholeslami 2015](https://www.eecg.utoronto.ca/~ali/papers/mag-win-15-process-variation.pdf) |
| 输入对和低频噪声敏感器件用大面积 | 1/f ∝ 1/WL，而且大面积能压缩器件间的离散 | [VLSI 2009](https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm)；【推断】 |
| 高阻节点（保持、积分、偏置）用厚氧器件 | 薄氧有栅漏电 | 【常识】 |
| 匹配器件的几何、方向、偏置、温度和环境都要相同；加 dummy；连续扩散；共质心 | LDE 和梯度 | [Pelgrom 1998](https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf)；[ASIC North](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/) |
| 精密器件上下不走无关的金属、poly 或硅化扩散；MIM 或栅氧电容接顶层金属时加天线二极管 | 系统失配和天线损伤 | [GF180MCU DRM 5.4](https://mithro-gf180mcu-pdk.readthedocs.io/en/latest/physical_verification/design_manual/drm_05_4.html) |
| 精密电阻做得更宽、更长 | 匹配和精度 | 同上 |
| RF 器件用多 finger 和双边栅接触 | 降低 Rg，提高 fmax 并降低 NF | [Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications) |
| 敏感电路用 guard ring 或深 N 阱隔离 | 衬底噪声。GF 14 nm 的深 N 阱在 0.1 GHz 下使衬底噪声降低多达 75 dB | [Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications) |
| 先做版图寄生提取，再定尺寸 | 先进节点前后仿差异约 30% | [Semiconductor Engineering 2021](https://semiengineering.com/wrestling-with-analog-at-3nm/)【观点】 |
| 检查模拟偏置下的 HCI/BTI/EM 和自热 | 长时间直流偏置、局部热点 | 【常识】；[Fulde 2007](https://d-nb.info/1149772921/34) |

## 3. 模拟确实更看重增益，没有长沟道时需要组合拳

**模拟器件高度看重本征增益 gm·ro，因为它决定单级放大器的最大 DC 增益和闭环精度。长沟道是提高 ro 最直接的办法；在固定 CPP、L 受限的 FinFET/GAA 工艺里，设计者组合使用器件级替代（叠栅、模拟专用 pitch、I/O 器件、低反型）、电路级补偿（cascode、gain boosting、多级）、数字校准和系统分割。**

要点：
- 【常识】本征增益 ≈ (gm/ID)·VEA，VEA 大致随 L 增长；DIBL 给出上限 gm/gds ≲ 1/η。
- 先进 FinFET 中单管可用的增益约为数十：Intel 22FFL 的 GM×Rout 为 47/54/60（[WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)），GF 14 nm 为 40/34（[Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)）。
- 叠栅是最常见的器件级替代，代价是寄生电容、面积和前后仿差异（[EDN 2021](https://www.edn.com/all-about-stacked-mosfets-in-analog-layout/)）。
- FinFET 多出来的增益余量可以换成速度：OTA 改用 1.4·Lmin 后增益仍约 47 dB，GBW/P 提高 22–28%（[Fulde 2007](https://d-nb.info/1149772921/34)）。
- 最大的公开空白：没有找到一篇开放论文在 FinFET/GAA 中定量比较"N 个 Lmin 叠栅"和"单根长 L"的 gm、gds、AVT 和 1/f。

### 为什么增益重要、为什么长沟道能提高增益

【常识】运放、电流镜和基准的精度取决于环路增益，环路增益又取决于每级的 gm·ro。在强反型下 gm/gds ≈ 2VEA/Vov。长沟道中 CLM 造成的 ΔL/L 随 L 增大而减小，所以 VEA 大致与 L 成正比。短沟道中 DIBL 额外贡献一项 gds ≈ η·gm，因此本征增益存在上限 ≈ 1/η。以 Fulde 原型 46 mV/V 的 DIBL 计算，这个上限约为 22（【推断】，DIBL 数值来自 [Fulde 2007](https://d-nb.info/1149772921/34)）。这与 22FFL 模拟器件 47–60 的 GM×Rout 在量级上一致，后者用的是更宽松的 pitch。

在 VDS 方向上，gds 先因 CLM 饱和而下降，随后可能因 DIBL、碰撞电离或自热再次上升，所以增益最佳的 VDS 窗口是有限的【推断】。在反型程度方向上，gm/ID 在弱反型最高，本征增益在低过驱动时最高，并在超过某个最小 gm/ID 后大致持平（[Palermo](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)）。

### 先进节点的增益与速度数据点

| 平台 | 条件 | 本征增益 / 相关指标 | 速度 | 证据类型 | 来源 |
|---|---|---|---|---|---|
| 45 nm 级 FinFET 原型对比体硅 | 典型模拟尺寸 | gm/gds 高 2–10×；OTA 81.3 dB 对 48.4 dB | 适合 10 GHz 以下 | 硅片·研究 + 仿真 | [Fulde 2007](https://d-nb.info/1149772921/34) |
| Intel 22FFL 模拟薄氧器件 | 栅 pitch 144/216/270 nm | GM×Rout 47/54/60 | 可用 fT 约 205 GHz（gm/ID ≥ 10）；fmax 284/242 GHz，改进后 357/290 GHz | 硅片·量产平台 | [WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3) |
| GF 14 nm FinFET | 核心器件 | gm/gds 40 (n)/34 (p)，是 28 nm 平面的 3 倍以上 | fT 314/285 GHz | 硅片·量产平台 | [Singh/GF TED 2018](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications) |
| GF 14 nm 1.8 V I/O FinFET | Lg 150 nm | — | 峰值 fT 50.1/53.5 GHz，fmax 200/160 GHz | 硅片·量产平台 | 同上 |
| imec 双层堆叠 nanosheet | L 28–200 nm，EOT 0.9 nm | 约 46 dB（文中引用的 FinFET 约 34 dB，跨论文比较）；VEA 约 30 V | — | 硅片·研究 | [Simoen/JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770) |
| 平面 0.35 µm 级折叠 cascode | ACM 模型，i_f ≈ 3 | 仿真 DC 增益 141 dB（只说明方法） | GBW 9.77 MHz | 仿真 | [Galup-Montoro CICC 2007](https://lci.ufsc.br/pdf/18-6.pdf) |

TSMC 28HPC/16FF/N7/N5/N3、Samsung SF3/SF2、Intel 4/3/18A 的 AV0–L 曲线，本次调研没有找到开放来源。这些数据通常在付费的 IEDM/VLSI 论文或保密 PDK 中。

### 长沟道替代方案总表

| 方法 | 原理 | 优点 | 代价 | 怎么表征 |
|---|---|---|---|---|
| 叠栅 / 串联器件（stacked gates） | N 个短器件串联，等效 L = N·Lg，例如 3 个 1 µm 器件等效 3 µm（[EDN 2021](https://www.edn.com/all-about-stacked-mosfets-in-analog-layout/)） | 不需要特殊工艺；栅面积和栅电容接近等效的长器件 | 内部节点带来额外寄生电容（主要是互连）和面积；前后仿差异大 | 与相同 W、N·Lg 的单器件对比 gm/ID、gm/gds、gds–VDS、AVT 和 1/f；N = 2、4、8、16 依次扫描 |
| 宽松 pitch 的模拟专用器件 | 工艺直接提供更长的 Lg 或 pitch | 原生恢复增益，模型更准 | 需要 PDK 支持，占面积 | 22FFL 在 144/216/270 nm pitch 上 GM×Rout 为 47/54/60（[WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)） |
| 厚氧 I/O 器件 | 更长的 Lg（22FFL 为 90–160 nm）和更高的 VDD（1.2–1.8 V） | 电压余量大，栅漏电小，ro 高 | fT 低（GF 14 nm I/O 器件约 50 GHz 对核心器件约 300 GHz）、面积大、gm/Cgg 差 | fT 和 gm/gds 对 gm/ID；VT 和噪声（[Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)） |
| 低反型（提高 gm/ID） | 在固定 L 下降低过驱动 | 固定 L 时"免费"提高 gm/gds 和效率 | fT 下降、器件变大、对 VT 失配更敏感 | gm/gds 和 fT 对 gm/ID 的曲线（[Palermo](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)） |
| 用增益换速度 | FinFET 增益有余量时缩短 L | GBW/P 提高 22–28%（[Fulde](https://d-nb.info/1149772921/34)） | 增益回到约 47 dB 水平 | 电路级 GBW/P 对比 |
| Cascode / regulated cascode | 每多一级 cascode，输出阻抗约乘以 gm·ro【常识】 | 增益成倍提高 | 消耗电压余量，在低 VDD 节点很难叠多级 | 输出阻抗、摆幅、PSRR |
| Gain boosting | 用辅助放大器调节 cascode 管的栅极，增益约为 (gm·ro)³ 量级【推断】 | 不额外消耗余量就能获得高增益 | 产生零极点对（doublet），影响建立时间 | 闭环建立时间测试，AC 零极点分析 |
| 多级放大器（3 级以上） | 多级增益相乘 | 低电压下可行 | 需要嵌套补偿，稳定性复杂 | 相位裕度、建立时间 |
| 非对称自 cascode | 用不同 Vth 或 L 的两个器件做复合串联 | 在 FD-SOI 中被研究用于增益增强 | 本次只找到标题 | 同叠栅（[UCLouvain](https://research.dial.uclouvain.be/handle/2078.5/127916)） |
| 动态、反相器型放大器与数字校准 | 接受每级增益低，用开关电容工作方式加数字校准 | 能利用便宜的数字逻辑；用 ADC 做校准，取代超大的差分对 | 架构复杂，需要校准算法 | 系统级 SNDR/INL（[Semiconductor Engineering 2021](https://semiengineering.com/wrestling-with-analog-at-3nm/)【观点】） |
| 模拟辅助数字（analog-assisted digital） | 数字为主、模拟为辅的电路 | 适合先进节点。Samsung 3 nm GAA LDO 负载范围 < 1 mA 到 1.4 A，1 A/1 ns 阶跃下跌落约 38 mV | 并非所有功能都能数字化 | 电路级瞬态测试（[Semiconductor Digest 2022](https://www.semiconductor-digest.com/samsung-has-18-talks-at-the-vlsi-symposia-in-june-including-3nm-gaafet-ldo/)） |
| Chiplet / 3D 分割 | 先进节点上只保留 PLL 和芯片间接口，其余模拟放到成熟节点的 chiplet | 每种电路都在最合适的工艺上实现 | 引入封装、互连和测试的复杂度 | 系统级划分（[Semiconductor Engineering 2021](https://semiengineering.com/wrestling-with-analog-at-3nm/)，Fraunhofer Heinig【观点】） |

### 叠栅（串联器件）的细节与陷阱

在约 28 nm 以下，最大器件长度受限，所以叠栅是标准做法。单 finger 的叠栅在同一行共享扩散区，面积由 poly 最小间距决定。长链需要折叠成多行，从而增加互连和电容。两 finger 的匹配器件不能共享扩散区，要按列排布，漏在中心和源在中心两种方向交替。用 m-factor 可以得到又长又宽的器件。前仿和后仿"经常不一致"，原因通常是叠栅上的互连寄生（[EDN 2021](https://www.edn.com/all-about-stacked-mosfets-in-analog-layout/)）。

模型层面，Galup-Montoro 等指出，只有当斜率因子和迁移率只依赖栅压时，电荷型电流模型才能自洽地描述器件串联；若干 DC、噪声和失配模型做不到这一点（[CICC 2007](https://lci.ufsc.br/pdf/18-6.pdf)）。

【推断，待验证】从器件物理看，叠栅不完全等价于一根均匀的长沟道：
- 最上面（漏侧）的器件承担大部分 VDS，内部器件接近线性区。所以复合器件的 gds 主要由顶部器件的 DIBL/CLM 决定，再被下方器件的跨导削弱。整体更像"长器件加自 cascode"。
- 每个内部节点都有 S/D epi 和接触带来的串联电阻和扩散电容。
- 每个子器件都受各自局部 LDE（gate cut、扩散断）的影响，所以失配随 1/√N 改善，但可能不如真正 N·Lg 的连续沟道。

这些推断正是需要用内部数据回答的问题。

### 如何表征这些替代方案：一套统一的比较测试计划

【推断/行业惯例】建议对每种器件选项（单个 Lg、叠栅 N = 2/4/8/16、宽松 pitch 器件、I/O 器件）都做同一套测试。

曲线：
- ID–VGS，以及 gm/ID 对 ID/W（对数坐标），VDS = VDD/2；
- 多个 VDS 下的 gm/gds 对 gm/ID；
- gds 和 VEA 对 VDS；
- fT 和 fT·gm/ID 对 gm/ID；
- Cgg/W 和 Cdd/W。

制表参数：
- 弱反型 gm/ID；
- gm/ID = 10–15 时的 gm·ro；
- DIBL 和 SS；
- AVT 和 Aβ；
- 1 kHz 下的 S_VG·WL；
- Rth 和 τth。

测试结构：
- Kelvin DC 结构；
- 带 dummy 的共质心匹配对阵列；
- GSG RF 结构，S 参数从约 1 MHz 测到 50 GHz 以上，用来看到 gds 在热截止频率附近的频散；
- 亚 100 ns 脉冲 IV，用于测等温 gds；
- 热测试结构。

## 4. 噪声与失配：由栅叠层决定，并随面积缩小变成统计问题

**1/f 噪声和 RTN 来自栅介质和界面陷阱对载流子的俘获，一阶上由栅叠层质量决定；器件面积越小，噪声越离散，分布尾部越长。失配遵循 Pelgrom 定律：FinFET/GAA 去掉了沟道掺杂（RDF），但金属栅晶粒（MGG/WFV）和几何变化成了新的主导项。**

要点：
- 现代 HKMG 平面、FinFET 和 nanosheet 器件基本都按载流子数涨落加相关迁移率涨落模型（CNF+CMF）分析，诊断方法是看 S_ID/I_D² 是否跟随 (gm/ID)²（[Chen, Stanford 2010](https://stacks.stanford.edu/file/druid:pf645xz5659/cy_thesis-augmented.pdf)）。
- 从 GF 28 nm 平面到 14 nm FinFET，面积归一的 S_VG 下降约 3–10 倍，但 pFET 从比 nFET 安静变为 nFET 的约 2 倍（[Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)）。
- RTN 在 20 nm 级器件中的 ΔVth 可超过 70 mV，在 3σ 处可能超过 RDF（[VLSI 2009](https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm)）。
- FinFET 的匹配在实践中未必优于平面，额外来源包括 fin 角度和波动（[IBM, TED 2015](https://research.ibm.com/publications/transistor-matching-and-fin-angle-variation-in-finfet-technology)）。
- 先进节点 AVT 和 Kf 的量产数值不公开，只能向 PDK 和内部数据要。

### 1/f 噪声的两种模型与诊断方法

**载流子数涨落模型（CNF，McWhorter）**：氧化层陷阱俘获电荷，使平带电压变化，进而调制反型电荷和漏电流。噪声功率按 (gm/ID)² 变化：在弱反型是平台，在强反型下约按 1/Qn² 下降（[Chen, Stanford 2010](https://stacks.stanford.edu/file/druid:pf645xz5659/cy_thesis-augmented.pdf)）。

**Hooge 迁移率涨落模型**：S_ID/I_D² = α_H·q/(f·W·L·Qi)，噪声按 1/Qi 变化。α_H 在高质量材料中为 10⁻⁶–10⁻⁴，Si MOSFET 常用 2–3×10⁻³。CNF 模型解释 n 型器件效果很好，但预测不了 p 型器件，需要加入与陷阱电荷相关的库仑散射迁移率涨落项（CMF）（同上）。

**诊断流程**有四步（[Chen 2010](https://stacks.stanford.edu/file/druid:pf645xz5659/cy_thesis-augmented.pdf)；[Simoen/JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)）：
1. 画 S_ID/I_D² 对 VG：ΔN 型器件先平台后陡降，Hooge 型器件随过驱动减小而上升。
2. 画 S_ID/I_D² 对 (gm/ID)²：成正比说明 ΔN 主导，约按 1/ID 变化说明 Δμ 主导。
3. 画 √S_VG 对 V_GT（≈ ID/gm）：得到一条直线，截距对应陷阱密度 N_OT，斜率对应库仑散射系数 α_SC。
4. 检查 f·S_ID 是否基本平坦，以确认是真正的 1/f 谱。

低频噪声探测的陷阱更深：在 Si/SiO₂ 中，0.01 Hz 对应约 2.6 nm 深的陷阱，1 MHz 对应约 0.7 nm（[Chen 2010](https://stacks.stanford.edu/file/druid:pf645xz5659/cy_thesis-augmented.pdf)）。在 high-k 叠层里，这意味着低频噪声能穿过界面层看到 high-k 内部。

对工艺工程师有一条可直接执行的建议：按栅叠层提取 N_OT 和 α_SC，不要比较原始的 Kf，因为 Kf 吸收了 Cox 和偏置依赖；报告 S_VG·WL 时要写明频率、VDS 和过驱动【推断】。

### 平面、FinFET 与 nanosheet 的 1/f 噪声数据

| 对比 | 结果 | 证据类型 | 来源 |
|---|---|---|---|
| GF 28 nm 平面对 14 nm FinFET，1 kHz 下面积归一的 S_VG | FinFET 为 17 (n)/35 (p) fV²·µm²/Hz；平面为 171 (n)/106 (p) | 硅片·量产平台 | [Singh/GF TED 2018](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications) |
| High-k 对 SiON | "一般来说 high-k MOSFET 的低频噪声更高"（未给比例） | 文献综述 | [Chen 2010](https://stacks.stanford.edu/file/druid:pf645xz5659/cy_thesis-augmented.pdf)；[Fulde 2007](https://d-nb.info/1149772921/34) |
| imec p 型 nanosheet（94 个器件、188 个 sheet，W 17 nm、H 6.5 nm、L 19 nm、EOT 1 nm）对同栅叠层的 1×1 µm 平面器件 | 有效边界陷阱密度 N_BT 相当，面积归一后的噪声相当；作者结论是"转向 GAA 不会增加噪声，噪声仍由栅叠层质量决定" | 硅片·研究 | [Asanovski et al., imec, arXiv 2609.08674](https://arxiv.org/html/2609.08674) |
| imec/USP 双层 nanosheet 基准 | sheet 垂直间距对 1/f 噪声影响很小；归一化 S_VG·A 与体硅、SOI、FinFET、纳米线相比"占优"；不同金属栅会改变 N_OT 和 α_SC | 硅片·研究 | [Simoen/JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770) |

【推断】GF 的数据显示，nFET 的 S_VG·WL 下降约 10 倍，pFET 下降约 3 倍。这符合 S_VG ∝ N_OT/Cox² 的预期（EOT 变薄使 Cox 增大），但这个对比混合了架构变化和栅叠层变化。FinFET pFET 比 nFET 噪声更大，可能与 (110) 侧壁导电面以及 SiGe 应变 S/D 或 SiGe 沟道的栅叠层有关，但这只是假设，本次没有找到证实机理的来源。

### RTN：小面积器件的统计学问题

栅面积缩小后，1/f 谱会分解为单个陷阱的 Lorentzian 谱和 RTN，器件间的离散急剧增大，幅度分布呈对数正态或指数型的长尾。几组数据：
- IBM 在 VLSI 2009 测量了 15,000 多个 nFET（Lg 小至 20 nm，PDSOI）。RTN 幅度分布长尾、非高斯、与温度无关；最小器件中 ΔVth 超过 70 mV；在 22 nm，RTN 引起的 Vth 变化在约 3σ 处可能超过 RDF（[VLSI 2009 3B-3](https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm)）。
- 在 W/L = 70/40 nm 的 1,000 个器件中，约 12% 出现 RTN（[Chen 2010](https://stacks.stanford.edu/file/druid:pf645xz5659/cy_thesis-augmented.pdf)）。
- defect-centric 模型能同时拟合 BTI 后的 ΔVth 分布（[Simicic 2015](https://lirias.kuleuven.be/bitstream/123456789/525000/2/IIRW2015_OA.pdf)）和 nanosheet 积分噪声 Vrms 的分布（[Asanovski 2026](https://arxiv.org/html/2609.08674)）。这说明 1/f 噪声统计和 BTI 陷阱统计是同一套物理。

【推断】对设计的含义有三点：
- 单 fin 或单 sheet 器件的噪声可以相差几个数量级，按均值取的角落会低估尾部器件。
- 输入对要用大 WL，这样既降低平均噪声，也压缩相对离散。
- 应向 foundry 要统计噪声角落（例如 S_VG·WL 的对数正态 σ），而不是单一的 Kf。

### 热噪声与高频噪声：γ 在短沟道中变大

长沟饱和区的漏端热噪声为 4kT·γ·gm，γ = 2/3。当低场沟道区短于载流子平均自由程、载流子来不及热平衡时，漏端噪声会向散粒噪声的极限升高（[McNeill, CICC](https://users.wpi.edu/~mcneill/papers/CICC_v09_CORRECTED.pdf)）。

14 nm RF FinFET 的 γ 已有实验提取（[IEEE 9383331](https://ieeexplore.ieee.org/document/9383331)），但本次只看到条目，没有读到数值。本次也没有找到 FinFET、22FDX 或 GAA 的公开 NFmin 实测值。

【常识】栅感应噪声与漏噪声相关（长沟道 δ = 4/3），在接近 fT/5–fT/10 的频率下变得重要。Rg 和 MOL 寄生会拉低 fmax、抬高 NF，这正是多 finger 和双边栅接触重要的原因。

### 失配：Pelgrom 定律与各类器件的匹配系数

Pelgrom 定律的形式是：σΔVT = AVT/√(WL)，σ(Δβ/β) = Aβ/√(WL)。单管 σ 和差分对 σ 之间相差 √2，使用前要确认 PDK 用的是哪种定义（[Pelgrom 2013](https://indico.cern.ch/event/228972/contributions/1539553/attachments/378475/526400/TWEPP24sept2013Print.pdf)；[Sheikholeslami 2015](https://www.eecg.utoronto.ca/~ali/papers/mag-win-15-process-variation.pdf)）。经验关系为 AVT ∝ tox·NA^(1/4)。"失配能量" σ²VT·Cgate = AVT²·Cox，约为 70 kT，与 W/L 的选择无关。这使失配本质上成为一个功耗问题，也是 Kinget 2005 讨论"失配–速度–功耗"三角权衡的出发点（[Pelgrom 2013](https://indico.cern.ch/event/228972/contributions/1539553/attachments/378475/526400/TWEPP24sept2013Print.pdf)）。

| 元件 | 匹配系数 | 来源 |
|---|---|---|
| MOS，65 nm CMOS | AVT = 3.5 mV·µm | [Pelgrom 2013](https://indico.cern.ch/event/228972/contributions/1539553/attachments/378475/526400/TWEPP24sept2013Print.pdf) |
| MOS 电流因子 | Aβ = 1–2 %·µm | 同上 |
| BJT | AVBE = 0.3 mV·µm（2013）；约 0.35 mV·µm（1998） | 同上；[Pelgrom 1998](https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf) |
| 电阻 | AR = 0.5–5 %·µm | [Pelgrom 2013](https://indico.cern.ch/event/228972/contributions/1539553/attachments/378475/526400/TWEPP24sept2013Print.pdf) |
| 电容 | AC = 0.3 %/√(C, fF) | 同上 |
| 45 nm 级金属栅 FinFET（未掺杂 fin）对多晶栅体硅 | FinFET 的 AVT 约为体硅的一半 | [Fulde 2007](https://d-nb.info/1149772921/34)【硅片·研究】 |
| 28/22 nm 及以下 | 以 foundry PDK 为准；常见的"1–2 mV·µm"说法本次没有找到一手来源 | [Pelgrom 2013](https://indico.cern.ch/event/228972/contributions/1539553/attachments/378475/526400/TWEPP24sept2013Print.pdf) |

### FinFET/GAA 中的新失配来源

未掺杂沟道去掉了平面体硅中占主导的 RDF，这是早期 FinFET 的 AVT 约改善 2 倍的原因（[Fulde 2007](https://d-nb.info/1149772921/34)）。但 IBM 指出，"已有多位作者报告平面器件的匹配更好"。IBM 找到的额外机理是倾斜和波动的 fin 中晶格扰动处的电荷，也就是 fin 角度变化（[Agarwal/Hook, IBM, TED 2015](https://research.ibm.com/publications/transistor-matching-and-fin-angle-variation-in-finfet-technology)）。其他来源还有 fin LER、栅对准偏差、S/D 电阻变化，以及极窄 fin 下的侧壁粗糙度（[Fulde 2007](https://d-nb.info/1149772921/34)）。

金属栅晶粒（MGG）或功函数涨落（WFV）是 FinFET 和 GAA 共有的一阶来源。一项 Pelgrom 型 Ion 变异模型的仿真给出 θ_MGG：FinFET 为 192 nA/nm，NSFET 为 191 nA/nm，NWFET 为 120 nA/nm。同一研究认为 **LER 对 nanosheet 的影响可以忽略**，因为刻蚀粗糙度落在非关键尺寸上，但 LER 对 FinFET 和 NWFET 仍有影响（[Fernandez et al., SSE 2022](https://in4.iue.tuwien.ac.at/pdfs/sispad2022/A-comprehensive-Pelgrom-based-on-current-variability-mod_2023_Solid-State-El.pdf)）【TCAD】。

【推断】W 量化之后，模拟设计者只能按 fin 或 sheet 的离散台阶以及 L、倍数来增加面积；单 fin 窄器件的方差不像宽平面器件那样能平均掉。

### 噪声和失配怎么量测：仪器、偏置、样本量

**1/f 噪声仪器**：Keysight E4727B 的带宽为 0.03 Hz–100 MHz，最小 S_ID 为 1×10⁻²⁸ A²/Hz，最小 ID 为 30 pA；E4727A 分别为 40 MHz、2×10⁻²⁷ A²/Hz、70 pA。测量时间主要花在 1–10 Hz 频段：0.03 Hz–1 MHz 的扫描，B 型需 6 分 52 秒，A 型需 21 分 4 秒。配套需要多重屏蔽的低噪声探针台（[Keysight/FormFactor 2020](https://compass.formfactor.com/wp-content/uploads/2020-Arnaldo-Sans-1f-Noise-Challenges-and-Solutions.pdf)）。

**imec 2026 的晶圆级 1/f 测量流程**（[Asanovski 2026](https://arxiv.org/html/2609.08674)）：
- 仪器：B1500 加 E4727B。
- 偏置：线性区，VDS = −50 mV（pFET），25 °C。
- 恒流点：ID = 100 nA、200 nA、1 µA、2 µA。
- 频段：10 Hz–1 kHz，并在此频段积分 Vrms。
- 样本：94 个 nanosheet 器件和 12 个平面参考器件。
- 分析：把 N 个小器件的谱相加，作为一个"等效大器件"与平面器件比较；离散用 defect-centric 模型拟合。

**失配测量**：用带 Kelvin 连接的可寻址阵列，每种几何数千个器件。线性区 VT 在 Vd = 50 mV 下测，饱和区在 Vd = VDD 下测。用相邻器件之差 ΔX = X(N+1) − X(N) 去除梯度，用 probit/分位数图检验正态性（[Simicic 2015](https://lirias.kuleuven.be/bitstream/123456789/525000/2/IIRW2015_OA.pdf)；[Michl, TU Wien](https://www.iue.tuwien.ac.at/phd/michl/node-Variability-Characterization.html)）。imec SmartArray 在 4.2–300 K 下测量了 30,720 个器件，变异性随温度降低、L 缩短而增大，gm,max 失配增加最多（[Michl](https://www.iue.tuwien.ac.at/phd/michl/node-Variability-Characterization.html)）。

【推断·实操清单】
1. 每次测量前，先用开路和 dummy 负载测系统噪声底。
2. 提取 N_OT 用线性区偏置；面向设计的 S_VG 在目标 gm/ID（10–20 S/A）的饱和区测。
3. 至少测 4–6 个电流点。
4. 默认频段 1 Hz–100 kHz。
5. 小器件每种几何测数十到数百个，报告中位数和对数正态 σ，并保留时域波形以标记 RTN。
6. Pelgrom 拟合至少用多种几何，并给出置信区间。

本次没有找到 JEDEC 之类的 1/f 噪声测量标准，也没有找到关于最小样本量的规范。

## 5. Nanosheet/GAA：静电控制更好，难点转到寄生、热和无源器件

**Nanosheet/GAA 给模拟带来的好处是更好的静电控制（本征增益更高）、比 fin 更细的宽度粒度和更紧的 VT/角落；在相同栅叠层下，1/f 噪声与平面相当。主要问题是寄生电容和电阻、受限的 L 与网格化版图、sheet 底部寄生沟道、自热、PMOS 迁移率，以及无源器件不缩小。量产节点的模拟器件数据几乎都在 PDK 里，公开文献以研究器件和 TCAD 为主。**

要点：
- 宽度"连续"更多是器件物理上的优势。量产 PDK 给的是离散菜单：Intel 18A 的 W1/W1.5/W2/W3/W3P，TSMC N2 NanoFlex 的"相当于 1.5 fin"（[Intel 18A brief 2026](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)；[IEEE Spectrum 2024](https://spectrum.ieee.org/tsmc-n2)）。
- imec 研究器件的本征增益约 46 dB，FinFET 约 34 dB（跨论文比较），gm/ID 峰值约 35 V⁻¹（[JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)）【硅片·研究】，不能当作量产节点的差值引用。
- 相同栅叠层下，nanosheet 的 1/f 陷阱密度与平面相当（[imec arXiv 2026](https://arxiv.org/html/2609.08674)）；nanosheet 的 LER 对失配影响可忽略，MGG 仍是一阶来源（[Fernandez 2022](https://in4.iue.tuwien.ac.at/pdfs/sispad2022/A-comprehensive-Pelgrom-based-on-current-variability-mod_2023_Solid-State-El.pdf)）【TCAD】。
- 背面供电对模拟的公开价值主要在供电完整性和热：PowerVia 的最坏动态压降约低 10 倍；18A-P 的叠层热阻降低 20–40%（[Intel 18A brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)）【厂商】。衬底减薄对隔离和 guard ring 的影响没有公开数据。
- Forksheet 和 CFET 目前只针对逻辑和 SRAM 密度做了优化，没有公开的模拟表征数据。

### GAA 相对 FinFET 的模拟优势

| 方面 | FinFET | Nanosheet / GAA | 证据类型 | 来源 |
|---|---|---|---|---|
| 宽度 | 按 fin 量化，每 fin 为 2·Hfin + Wfin | 物理上连续，量产中是离散菜单（Intel W1–W3P；TSMC NanoFlex 可做到"相当于 1.5 fin"） | 观点 / 厂商 | [SemiWiki 2021](https://semiwiki.com/semiconductor-manufacturers/tsmc/300986-tsmc-design-considerations-for-gate-all-around-gaa-technology/)；[IEEE Spectrum](https://spectrum.ieee.org/tsmc-n2)；[Intel 18A brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf) |
| 本征增益 | 约 34 dB（imec 论文中引用的文献值） | 约 46 dB；VEA 约 30 V（VGT = 200 mV，VDS = 0.7 V）；sheet 间距越小增益越高（4.7 nm 好于 7.5 nm） | 硅片·研究 | [JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770) |
| gm/ID | — | L = 28 nm 时峰值约 35 V⁻¹ | 硅片·研究 | 同上 |
| 温度 | — | 增益到 200 °C 几乎不变；ΔVT/ΔT 约 0.3–0.8 mV/°C；173 K 下 AV 30 dB、fT 185 GHz、AV·fT 约 5.5 THz；78 K 下 SS 约降为 1/4 | 硅片·研究 | [JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)；[Silva et al., SSE 2023](https://educapes.capes.gov.br/handle/11449/307667?mode=full) |
| VT 和角落 | Intel 18A 提供 4 对 VT | 18A-P 提供 5 对以上，ULVT 再低 10 mV，skew 角落收紧约 33% | 厂商 | [Intel 18A brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)；[SemiWiki 2026](https://semiwiki.com/semiconductor-manufacturers/intel/372712-intel-18a-p-pushes-ribbonfet-and-backside-power-beyond-the-first-generation/) |
| 变异来源 | fin 底部形貌、LER | sheet 厚度由原子级外延决定，有望减少一个主要变异源 | 观点（imec Ryckaert） | [Semiconductor Engineering](https://semiengineering.com/what-designers-need-to-know-about-gaa/) |
| 极限缩小 | — | 亚 2 nm 堆叠 nanosheet（Tch 3 nm，Wch 6 nm）gm/gd > 30 | TCAD | [Shen et al., Micromachines 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC12942810/) |

### GAA 给模拟带来的问题

**寄生电容和电阻**。Nanosheet 的栅到 S/D 几何由 inner spacer 决定，Cgs/Cgd 必须和驱动能力一起优化（[SemiWiki 2021](https://semiwiki.com/semiconductor-manufacturers/tsmc/300986-tsmc-design-considerations-for-gate-all-around-gaa-technology/)）。imec 的 Ryckaert 认为，窄纳米线几何会"为很小的电流带来大量寄生"；超过约 4 层 sheet 后，第 5 层主要在增加寄生（[Semiconductor Engineering](https://semiengineering.com/what-designers-need-to-know-about-gaa/)）【观点】。典型逻辑 sheet 厚约 5 nm、宽 20–30 nm，实用叠层为 2–4 层（同上）。Synopsys 和 Fraunhofer 的人士提到，增加的栅漏和体漏电容"难以补偿"；L 受限，设计者只能依赖 W/L 比；规则网格让模拟尺寸设计变难；客户看到的前后仿差异约 30%（[Semiconductor Engineering 2021](https://semiengineering.com/wrestling-with-analog-at-3nm/)）【观点】。

**fT 与 fmax 的权衡**。TCAD 显示，优化后的堆叠 Si nanosheet nFET 可达 fT > 400 GHz、fmax ≈ 1.2 THz；加宽沟道使 fT 提高约 40%，但 fmax 下降约 35%；双 k spacer 可以同时提高两者（[Shen 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC12942810/)）【TCAD】。【推断】由此看，sheet 宽度、finger 数和栅接触策略成了相对于 FinFET fin 数的新 RF 优化维度。

**sheet 底部寄生沟道**。底部 mesa 漏电路径仍然存在，需要额外注入或部分/全部底部介质隔离来抑制（[SemiWiki 2021](https://semiwiki.com/semiconductor-manufacturers/tsmc/300986-tsmc-design-considerations-for-gate-all-around-gaa-technology/)）。

**PMOS 与应变**。未经优化的 nanosheet 空穴迁移率"明显低于"电子迁移率，β 比的考量重新出现；SiGe pFET 的含量和厚度更难控制（同上）。imec 估计，在 nanosheet 和内墙 forksheet 中，缺失沟道应变会损失约 33% 的驱动电流（[EE Times 2025](https://www.eetimes.com/vlsi-2025-outer-wall-forksheet-bridges-nanosheet-and-cfet-architectures/)）【TCAD】。

**自热**。被介质包围的叠层自热"会不同，但影响有多大尚不清楚"（Ansys Swinnen，[Semiconductor Engineering](https://semiengineering.com/what-designers-need-to-know-about-gaa/)）【观点】。Intel 18A-P 宣称叠层热阻比 18A 降低 20–40%（[Intel 18A brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)）【厂商】。这从侧面说明第一代背面供电工艺存在值得改进的热阻【推断】。

**无源器件**。一个 100 Ω 的 poly 电阻在 28 nm 和 180 nm 上面积差不多，LC 电感也不缩小（[Semiconductor Engineering 2021](https://semiengineering.com/wrestling-with-analog-at-3nm/)）【观点】。Intel 18A 的 Omni MIM 达到 397 fF/µm²（[Intel 18A brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)）【厂商】。【推断】模拟面积越来越由无源器件和匹配需求决定，GAA 的密度优势主要落在数字辅助的部分。

### Nanosheet 中 flicker noise、RTN 与失配如何变化

目前最新的开放实测结果来自 imec 2026 年的研究：在 48 nm CGP、1 nm EOT 的 p 型 nanosheet 上，有效边界陷阱密度和面积归一噪声都与同栅叠层的平面 HKMG 器件相当；叠加后的谱是干净的 1/f；VT 呈正态分布；nanosheet 因短沟效应 SS 更高（[Asanovski et al., arXiv 2609.08674](https://arxiv.org/html/2609.08674)）【硅片·研究】。imec/USP 2022 年的结果是：sheet 间距影响很小，不同金属栅会改变 N_OT 和 α_SC，pMOS 定性相似（[JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)）。

**对工艺工程师的结论**：在 nanosheet 中，flicker noise 的一阶旋钮是栅叠层，即界面层、high-k、功函数金属和热预算，GAA 几何本身不是【推断，基于单一 pMOS 数据集】。

【推断·预期变化】
- 每层 sheet 的有效宽度为 2(W+H)，噪声归一面积应为 n_sheets × 2(W+H) × L。
- 上下 (100) 面与侧壁、拐角的界面质量不同。
- inner spacer 和 RMG 腔体工艺可能在 S/D 端引入陷阱。
- 底层 sheet 靠近 sub-fin，各层贡献不完全相同，小器件的离散会因此增大。
- 单 sheet 的栅面积极小（例中 Weff ≈ 47 nm × L ≈ 19 nm），单个最小器件会由 RTN 主导，必须用大倍数器件和统计噪声模型。

**失配**：MGG 仍是一阶来源，LER 影响可忽略【TCAD】（[Fernandez 2022](https://in4.iue.tuwien.ac.at/pdfs/sispad2022/A-comprehensive-Pelgrom-based-on-current-variability-mod_2023_Solid-State-El.pdf)）。本次没有找到 nanosheet 对 FinFET 的公开实测 AVT 比较，也没有 sheet 宽度、层数、SiGe 沟道或 WFM 多 VT 对 flicker 影响的公开数据。

### 量产 GAA 节点公开了哪些与模拟相关的信息

| 厂商与节点 | 公开的模拟相关信息 | 证据类型 | 来源 |
|---|---|---|---|
| Samsung 3 nm GAA（MBCFET） | 2022-06-30 开始量产；VLSI 2022 发表 3 nm GAAFET 模拟辅助数字 LDO（负载 < 1 mA 到 1.4 A，1 A/1 ns 阶跃下跌落约 38 mV）；ISSCC 2021 的 SRAM 通过调节 sheet 宽度改善干扰裕度 | 硅片·电路 | [Samsung](https://semiconductor.samsung.com/news-events/news/samsung-begins-chip-production-using-3nm-process-technology-with-gaa-architecture/)；[Semiconductor Digest 2022](https://www.semiconductor-digest.com/samsung-has-18-talks-at-the-vlsi-symposia-in-june-including-3nm-gaafet-ldo/)；[Semiconductor Digest 2021](https://www.semiconductor-digest.com/gate-all-around-transistors-show-up-at-isscc/) |
| TSMC N2 | NanoFlex 混合宽度单元；相对 N3 速度最高 +15% 或能效 +30%；SRAM 38 Mb/mm²；没有器件级模拟数据 | 厂商 | [IEEE Spectrum 2024](https://spectrum.ieee.org/tsmc-n2) |
| Intel 18A / 18A-P | Omni MIM 397 fF/µm²；PowerVia 最坏动态压降约低 10 倍；18A-P 双接触使外电阻降低 20% (N)/12% (P)、驱动提高 5%/16%；角落收紧；提到"完全隔离体晶体管" | 厂商 | [Intel 18A brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)；[SemiWiki 2026](https://semiwiki.com/semiconductor-manufacturers/intel/372712-intel-18a-p-pushes-ribbonfet-and-backside-power-beyond-the-first-generation/) |
| imec 研究器件 | 增益、gm/ID、fT、温度和 1/f 噪声（见上文） | 硅片·研究 | [JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)；[SSE 2023](https://educapes.capes.gov.br/handle/11449/307667?mode=full)；[arXiv 2026](https://arxiv.org/html/2609.08674) |

本次没有找到 Samsung SF3/SF2、TSMC N2 和 Intel 18A 的 Rg、实测 fT/fmax、AVT 或 Kf，也没有找到厚氧 I/O、ESD、BJT、varactor 和 LDE 在 GAA PDK 中的公开描述。这些很可能属于 NDA 内容。

### 背面供电（BSPDN）对模拟意味着什么

imec 的 DTCO 研究：
- nTSV 深约 320 nm，落在 200 nm pitch 的埋入电源轨上，模块级 tap pitch 为 4–6 µm。
- nTSV 填充由 W 改为 Ru，IR 降减少 23%。
- 相对正面供电，频率提高 6%、面积减少 16%。
- "极端衬底减薄"被列为关键集成挑战。
- 2022 年的演示显示，背面工艺没有劣化 FinFET 前道器件。

（[imec 2023](https://imec-int.com/en/articles/backside-power-delivery-options-dtco-study)）

Intel 对模拟设计者的信息集中在供电完整性：PowerVia 最坏动态压降约低 10 倍，Omni MIM 用于降低电源引起的抖动；18A-P 的热阻降低 20–40%，键合叠层热导提高 50%，在 1500 W/cm² 下 ΔT 最多降低 40%（[Intel 18A brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)）【厂商】。Cadence 指出，埋入电源轨腾出了正面布线空间，可以用更宽、电阻更低的连线（[Semiconductor Engineering 2021](https://semiengineering.com/wrestling-with-analog-at-3nm/)）。

【推断】去掉体衬底并键合到载片后，衬底耦合路径会改变：guard ring 和深阱失去了导电的体衬底，热阻也会上升。Intel 提到的"完全隔离体晶体管"暗示背面工艺可能顺带提供体隔离，对模拟隔离可能有用。但关于衬底噪声隔离、guard ring 有效性、电感 Q 值和 ESD 在 BSPDN 下的变化，本次**没有找到任何公开数据**，这是需要向内部要数据的重点。

### Forksheet、CFET 与更远的前沿

imec 在 VLSI 2025 发表的外墙 forksheet 面向 A10 节点，单元高度 90 nm，A14 nanosheet 为 115 nm。内墙需要约 8–10 nm 介质，外墙约 15 nm SiO₂ 并在单元边界共享。W 形栅的驱动约提高 25%（仿真）。Si"脊"可以保留完整的沟道应变。SRAM 位单元面积减少 22%。CFET 预计从 A7 节点开始量产。文章没有讨论模拟、I/O 或多 VT（[EE Times 2025](https://www.eetimes.com/vlsi-2025-outer-wall-forksheet-bridges-nanosheet-and-cfet-architectures/)）【TCAD + 版图研究】。用堆叠互补 nanosheet 做反相器的工作见 [Xiong et al., Nature Electronics 2024](https://doi.org/10.1038/s41928-024-01329-3)。

【推断】对模拟的影响可能有以下几点：
- forksheet 中 n/p 之间的介质墙引入新的电容和邻近项。
- 内墙方案的静电控制是单侧的，近似三栅。
- CFET 把 n 和 p 垂直堆叠，n/p 尺寸难以独立调节，多 VT 也更复杂，而这两点恰恰是模拟所依赖的。

因此可以预期，模拟会留在并排排布的器件、较老的节点或 chiplet 上。目前没有 forksheet、CFET 或 2D 沟道的公开模拟、RF 或噪声数据。

### 对 3D IC 与 chiplet 工作的含义

行业观点已经指向分割：大部分模拟放在 chiplet 中，GAA 裸片上只保留 PLL 和芯片间接口；设计流程从后仿和基于 TCAD 的 DTCO 开始，并用更多 Monte Carlo、高 σ 和 ML 加速的验证（Fraunhofer Heinig 等，[Semiconductor Engineering 2021](https://semiengineering.com/wrestling-with-analog-at-3nm/)）【观点】。

【推断】对转向 3D IC 和模拟的工程师来说，有四个问题值得优先建立直觉：
1. **热**：3D 堆叠和背面供电都会改变热路径，而模拟器件的 gds 频散、VT(T) 和 ZTC 偏置都对温度敏感。
2. **供电和衬底噪声**：BSPDN 改善了压降，但衬底隔离机制变了。
3. **无源器件放在哪里**：MIM 和电感不缩小，适合放在哪一层或哪颗 die 上。
4. **跨 die 匹配不可依赖**：Pelgrom 的"相同环境"原则意味着匹配器件必须在同一颗 die 的同一局部区域。

### 公开文献的空白：需要向内部数据要答案的问题

本次调研确认以下信息**没有公开来源**：
- 量产 GAA 节点（N2、18A、SF2）的 AVT、Aβ、Kf/S_VG·WL、gm/gds–L、Rg、NFmin、γ。
- 叠栅 N×Lmin 与单根长 L 在 FinFET/GAA 中的定量对比。
- BSPDN 下的衬底隔离、guard ring、电感 Q 值和 ESD。
- 顶层与底层 sheet 之间的差异对噪声和失配的影响。
- forksheet 和 CFET 的任何模拟数据。

在公开文献中，这些问题只能给出框架，答案要从 PDK 器件报告和内部表征中获得。

## 6. 结论：工艺整合背景是学模拟器件的捷径

**对有工艺整合背景的人来说，学模拟器件的关键是把熟悉的工艺旋钮重新映射到模拟指标上；物理基本是现成的，需要新学的是 gm/ID 这套语言和统计思维。**

要点：
- halo、EOT、金属栅、S/D 电阻、栅接触、sheet 间距：每个旋钮都能对应到一两个模拟指标。
- 噪声和失配是统计问题，"典型器件"思维不够用，需要阵列和分布。
- GAA 时代模拟的瓶颈在寄生、热、无源器件和系统分割，正好落在 3D IC 的工作范围内。

### 把工艺旋钮映射到模拟指标

| 工艺旋钮 | 主要影响的模拟指标 | 方向 / 证据 |
|---|---|---|
| Halo/pocket 注入 | gds、VEA、长沟 DIBL、RSCE | 对较长的模拟器件不利（[Mudanai 2006](https://briefs.techconnect.org/papers/halo-doping-physical-effects-and-compact-modeling/)） |
| 沟道掺杂（RDF） | AVT | 未掺杂 fin 使 AVT 约减半（[Fulde 2007](https://d-nb.info/1149772921/34)） |
| EOT | AVT、S_VG | AVT ∝ tox（[Pelgrom 2013](https://indico.cern.ch/event/228972/contributions/1539553/attachments/378475/526400/TWEPP24sept2013Print.pdf)）；EOT 越薄，归一化 S_VG 越低（[JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)） |
| 金属栅 / WFM | N_OT、α_SC、MGG 失配 | 不同金属栅的 N_OT 不同（[JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)）；MGG 是 FinFET 和 NS 的一阶失配源（[Fernandez 2022](https://in4.iue.tuwien.ac.at/pdfs/sispad2022/A-comprehensive-Pelgrom-based-on-current-variability-mod_2023_Solid-State-El.pdf)） |
| fin 形貌（角度、LER） | AVT | fin 角度变化会恶化匹配（[IBM 2015](https://research.ibm.com/publications/transistor-matching-and-fin-angle-variation-in-finfet-technology)） |
| S/D epi、接触电阻 | gm、fT、fmax | FinFET 的 gm 最多低 30%（[Fulde](https://d-nb.info/1149772921/34)）；18A-P 双接触使外电阻降低 20%/12%（[SemiWiki 2026](https://semiwiki.com/semiconductor-manufacturers/intel/372712-intel-18a-p-pushes-ribbonfet-and-backside-power-beyond-the-first-generation/)） |
| 栅接触方式 | fmax、NF | 双边接触使 fmax 提高 1.26×/1.40×（[Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)） |
| Spacer 介电常数 | fT、fmax | 双 k spacer 使两者都提高（[Shen 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC12942810/)）【TCAD】 |
| Sheet 间距 | 本征增益 | 间距越小增益越高（[JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)） |
| 深 N 阱 | 衬底噪声 | 0.1 GHz 下最多降低 75 dB（[Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)） |
| 背面供电、键合叠层 | 压降、热阻、衬底耦合 | 压降约低 10 倍；热阻需要专门优化（[Intel 18A brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)）；隔离方面没有数据 |

两个判断贯穿全文。第一，从平面到 FinFET 再到 GAA，静电控制每前进一步，"增益问题"就松一些，"寄生、热、无源器件和统计变异"就紧一些，模拟的瓶颈正从晶体管本身移到它周围的结构上。第二，公开文献在先进节点上几乎是空白，所以本领域的专家价值在于知道该测什么、怎么测、怎么解读，而不是记住多少数字。这正是工艺和器件工程师相对于电路设计者的优势所在。

## 学习方法

**对已有深厚器件功底、又不喜欢线性阅读的学习者，证据最强的做法是：先画一张图，以检索练习代替重读，用间隔复习巩固，从问题和仿真入手，只在遇到新形式体系（gm/ID lookup table）时才看示例。**

要点：
- Dunlosky 等 2013 年的综述把**练习测试**和**分散练习**评为"高效用"，把重读、划线和总结评为"低效用"（[Dunlosky 2013](https://doi.org/10.1177/1529100612453266)）。
- "先地图后放大"有先行组织者（advance organizer）研究的支持（[Ausubel 1960](https://doi.org/10.1037/h0046669)）。
- **专家逆转效应**：对新手有效的详细示例，对有经验的学习者可能失效甚至有害（[Kalyuga et al. 2003](https://doi.org/10.1207/S15326985EP3801_4)）。
- 交错练习在练习当时显得更难，但延迟测试成绩更好（[Rohrer & Taylor 2007](https://doi.org/10.1007/s11251-007-9015-8)）。
- 真正讲给别人听，比只准备讲，延迟学习效果更好（[Fiorella & Mayer 2013](https://doi.org/10.1016/j.cedpsych.2013.06.001)）。

### 学习科学证据速览

| 方法 | 证据 | 本主题中的用法 |
|---|---|---|
| 检索练习（自测） | 高效用（[Dunlosky 2013](https://doi.org/10.1177/1529100612453266)）；先学后测的延迟保持优于反复学习（[Roediger & Karpicke 2006](https://doi.org/10.1111/j.1467-9280.2006.01693.x)）；优于概念图式精加工（[Karpicke & Blunt 2011](https://doi.org/10.1126/science.1199327)）；元分析结论一致（[Adesope 2017](https://doi.org/10.3102/0034654316689306)） | 每次结束前凭记忆写 5–10 道题，例如"为什么本征增益在低反型最高？" |
| 间隔重复 | 高效用（[Cepeda 2006](https://doi.org/10.1037/0033-2909.132.3.354)）；最佳间隔随需要记住的时长增加（[Cepeda 2008](https://doi.org/10.1111/j.1467-9280.2008.02209.x)） | 第 1、2、4、7 天重测，间隔逐渐拉长 |
| 交错练习 | 中等效用；延迟测试更好（[Rohrer & Taylor 2007](https://doi.org/10.1007/s11251-007-9015-8)） | 自测题混合增益、噪声和失配，不按章节分块 |
| 先行组织者 / 概念图 | [Ausubel 1960](https://doi.org/10.1037/h0046669)；概念图有利于保持和迁移（[Nesbit & Adesope 2006](https://doi.org/10.3102/00346543076003413)） | 第 1 天先画一张"指标地图"，再按需阅读 |
| 自我解释 | [Chi et al. 1994](https://doi.org/10.1207/s15516709cog1803_3) | 每读完一张图，用一句话解释"为什么曲线是这个形状" |
| 教中学 | [Fiorella & Mayer 2013](https://doi.org/10.1016/j.cedpsych.2013.06.001) | 每天写一页、或录 5 分钟讲解，对象设定为逻辑工艺同事 |
| 主动学习、做中学 | 主动学习提高考试成绩，纯讲授学生的不及格率约高 1.5 倍（[Freeman et al. 2014](https://doi.org/10.1073/pnas.1319030111)） | 用开源 PDK 生成 gm/ID 曲线：先预测，再仿真 |
| 专家逆转效应 | [Kalyuga 2003](https://doi.org/10.1207/S15326985EP3801_4)；示例学习对新手有效（[Sweller & Cooper 1985](https://doi.org/10.1207/s1532690xci0201_3)） | 器件物理部分从问题和数据入手；只有 lookup table 定尺寸流程看示例 |

### 地图先行，按需深入

第一天不要读书，先凭记忆画一张"模拟器件指标地图"：gm/ID ↔ IC ↔ fT ↔ gm·ro ↔ 噪声（4kTγ/gm、1/f）↔ 失配（AVT/√WL）↔ 版图和 LDE。画完再对照教材找缺口，只读填补缺口的那几节，也就是"即时阅读"。地图本身就是先行组织者（[Ausubel 1960](https://doi.org/10.1037/h0046669)），自己动手画的概念图也有元分析支持（[Nesbit & Adesope 2006](https://doi.org/10.3102/00346543076003413)）。第 7 天凭记忆重画，和第 1 天的版本对比，差异就是学到的东西。

### 用检索代替重读，用间隔巩固

每次学习留出 20–30% 的时间做检索，不要都花在阅读上。题目要凭记忆写，答不出来再查。可以用 Anki 维护一副卡片，按第 1 → 2 → 4 → 7 天的节奏重测（[Cepeda 2008](https://doi.org/10.1111/j.1467-9280.2008.02209.x)）。需要注意的是，重读会让人感觉更熟，但即时测验的好成绩不代表延迟保持（[Roediger & Karpicke 2006](https://doi.org/10.1111/j.1467-9280.2006.01693.x)）。

### 发挥专家优势：从问题和数据入手

根据专家逆转效应（[Kalyuga 2003](https://doi.org/10.1207/S15326985EP3801_4)），器件物理部分应该跳过入门式推导，直接从一个预测问题开始。例如："把 L 从 2× 加到 10× Lmin，gm/gds 对 gm/ID 的曲线会怎样移动？halo 会让它偏离哪里？"先写下预测，再仿真或查数据验证。真正的新东西是 gm/ID lookup table 定尺寸流程和统计噪声思维，这两部分值得看 Jespers & Murmann 的示例。需要说明的是，上述学习科学证据主要来自学生学习课程材料的研究，用于中年专家 7 天冲刺属于推断。

### 教中学与做中学：产出可复用的材料

每天产出一页"给逻辑工艺同事的解释"，第 7 天汇编成 15 分钟的讲稿。讲解本身能强化学习（[Fiorella & Mayer 2013](https://doi.org/10.1016/j.cedpsych.2013.06.001)），也能留下团队可用的材料。动手部分用开源工具链，把抽象指标变成亲手画出的曲线（[Freeman 2014](https://doi.org/10.1073/pnas.1319030111)），然后在心里把它们和自己熟悉的 FinFET/GAA 数据对照。

## Sources

**指标、器件差异与版图**
- Palermo, TAMU ECEN474 Lecture 7 (gm/ID): https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf
- Sheikholeslami, "Process Variation and Pelgrom's Law," IEEE SSC Magazine 2015: https://www.eecg.utoronto.ca/~ali/papers/mag-win-15-process-variation.pdf
- Pelgrom, Tuinhout, Vertregt, IEDM 1998: https://designers-guide.org/Forum/Attachments/Transistor_matching_in_analog_CMOS_applications_.pdf
- Fulde et al., Adv. Radio Sci. 5 (2007): https://d-nb.info/1149772921/34
- Bucher, EPFL NanoTera 2011: https://www.epfl.ch/labs/iclab/wp-content/uploads/2019/02/Bucher_NanoTera_2011.pdf
- Mudanai et al. (Intel), Halo Doping, Nanotech 2006: https://briefs.techconnect.org/papers/halo-doping-physical-effects-and-compact-modeling/
- ASIC North, FinFET Back-End Layout (2023): https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/
- GF180MCU DRM 5.4: https://mithro-gf180mcu-pdk.readthedocs.io/en/latest/physical_verification/design_manual/drm_05_4.html
- eeNews Europe, Layout-dependent effects (2014): https://www.eenewseurope.com/en/layout-dependent-effects-in-analog-design

**增益与长沟道替代**
- Badaroglu et al., imec, MOS-AK 2012: https://www.mos-ak.org/sanfrancisco_2012/presentations/T01_Badaroglu_MOS-AK_121212.pdf
- WikiChip, Intel 22FFL (IEDM 2017): https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3
- Waller, "All about stacked MOSFETs in analog layout," EDN 2021: https://www.edn.com/all-about-stacked-mosfets-in-analog-layout/
- Galup-Montoro et al., CICC 2007: https://lci.ufsc.br/pdf/18-6.pdf
- UCLouvain asymmetric self-cascode: https://research.dial.uclouvain.be/handle/2078.5/127916
- Semiconductor Digest, Samsung 3nm GAAFET LDO (2022): https://www.semiconductor-digest.com/samsung-has-18-talks-at-the-vlsi-symposia-in-june-including-3nm-gaafet-ldo/

**噪声与失配**
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

**Nanosheet/GAA 与前沿**
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

**教材与经典论文**
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

**课程与工具**
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

**学习科学**
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

# 没有长沟道时怎样拿回模拟性能

在 FinFET/nanosheet 工艺里，单管本征增益 gm·ro 只有几十，L 又被固定 pitch 卡住。拿回增益有三条路：在器件层面把多个短管串起来、用宽松 pitch 或厚氧器件；在电路层面用反馈、时间或电荷去"乘"增益；在系统层面用数字校准，让电路不再需要精确的增益。串联叠管（stacked gates / self-cascode）在理想长沟道理论里与一根 N·L 的长管完全等价（[Vittoz EKV](https://www.epfl.ch/labs/iclab/wp-content/uploads/2019/02/10_EKV_UMW04_Eric_Vittoz.pdf)）。在短沟道里，它更像"一个饱和的顶管加上底下的线性区电阻"，也就是自 cascode：增益大致随 N 线性增长（每翻倍约 +6 dB），远不如独立偏置的 cascode（约 (gm·ro)²）。它的价值在于不需要额外偏置、能省电压余量、能改善匹配和 1/f。代价是面积、内部节点寄生和建模风险，业界报告的前后仿差异约 30%（[Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)）。电路层面，在 0.7–0.9 V 下"每伏余量换到的增益"最多的是 gain boosting、correlated level shifting（CLS）、ring amplifier 和多级放大；动态放大器和数字校准则直接把"精确增益"这个要求拿掉。失调、1/f 噪声和漂移要靠 chopping、auto-zero/CDS 和校准处理，增益技巧解决不了它们。

在 nanosheet 阶段，1/f 噪声主要由栅叠层的陷阱密度决定，几何结构影响不大。imec 的实测显示，同栅叠层下 nanosheet 与平面器件的边界陷阱密度相当（[Asanovski et al., arXiv 2609.08674](https://arxiv.org/html/2609.08674)）。所以降噪的工艺旋钮是退火（高压 D₂ 在 FD-SOI TFET 上使噪声降约 4.8 倍）、热预算、EOT 和 dipole。设计侧的旋钮是面积、低过驱动和 chopping。失配的一阶来源是金属栅晶粒（WFV），LER 在 nanosheet 中影响很小。DIBL 随 sheet 变宽而变差。fT/fmax 主要由寄生决定：sheet 间隙、S/D 外延厚度、接触方式和 BDI。BDI 改善 RF 和漏电，但会加重自热。上面这些结论大多来自研究器件和 TCAD。TSMC N2、Samsung SF3/SF2、Intel 18A 等量产节点的 AVT、Kf、gm/gds、fT 和 Rth 都没有公开，需要向 foundry PDK 或自有硅片数据确认。

## 全景图

**先按"要解决的问题"找到技巧，再看它改善什么、代价是什么、在哪一节展开。**

要点：
- 增益问题有三类解法：器件拼接（§1）、电路乘法（§2）和数字校准（§3）。
- 失调、1/f 噪声和漂移是另一类问题，靠时间域抵消、校准和面积解决（§3、§4）。
- 器件本征参数（噪声、失配、DIBL、fT、自热）的工艺旋钮和设计侧做法见 §4–§6。
- 证据标签：【常识】教科书或通用知识；【硅片·研究】研究器件或研究电路的实测；【硅片·量产平台】已发表的量产或准量产工艺数据；【TCAD】器件仿真；【仿真】电路仿真；【厂商】厂商简报、新闻稿或专利声明；【观点】行业访谈或博客；【推断】本报告自己的推理；【示意】为说明原理而设的示意数字。

| 问题 | 技巧 | 改善什么 | 主要代价 | 章节 |
|---|---|---|---|---|
| L 受限，单管 gm·ro 低 | 串联叠管 / self-cascode | ro 和增益约随 N 增长，匹配、1/f 改善 | 面积、内部节点寄生、fT 下降、建模误差 | §1 |
| 单级增益不够 | cascode（套筒 / 折叠） | 增益约变为 (gm·ro)² 量级 | 每级吃掉一个 VDSAT | §2 |
| 低 VDD 下还要高增益 | gain boosting | +20–40 dB，不增加串联管 | 零极点对（doublet）、功耗、共模范围 | §2 |
| 低 VDD 下还要高增益 | 多级放大 + 嵌套 Miller 补偿 | 每级 20–30 dB，相乘 | 带宽下降、稳定性对负载敏感 | §2 |
| 需要更大的 gm·ro | 低反型偏置 | gm/ID 和增益上升，VDSAT 下降 | fT 下降、器件变大 | §2 |
| 开环增益不精确也能用 | 正反馈负载、动态放大器 | 低功耗、高增益 | 对 PVT 敏感，必须校准 | §2 |
| 开关电容电路的增益和摆幅 | CLS、ring amplifier、反相器型放大器 | 有效环路增益约 A²，接近轨到轨 | 时钟相位多、只适用于离散时间电路 | §2 |
| 电压余量是瓶颈 | 时域 / VCO 架构 | 用相位积分取代电压增益 | VCO 非线性、抖动 | §2 |
| 失调与 1/f 噪声 | chopping、auto-zero、CDS | 失调和 1/f 噪声被搬走或减掉 | 纹波、白噪声混叠、时钟 | §3 |
| 增益误差、失配 | 数字校准 | 去掉对精确模拟增益的要求 | 设计、验证、测试复杂度 | §3 |
| 匹配与 LDE | 版图（dummy、共质心、双边栅接触） | σΔVT、梯度、Rg 噪声 | 面积、布线 | §3、§6 |
| 先进节点不适合精密模拟 | chiplet 分割 | 精密模拟放到合适的节点 | 封装和接口成本 | §3 |
| nanosheet 1/f 与 RTN | 栅叠层退火、EOT、dipole；面积、低过驱动 | N_BT 降低，RTN 平均化 | 热预算、面积 | §4 |
| 失配、DIBL、fT、自热 | 金属栅晶粒、sheet 宽度与层数、BDI、接触 | AVT、gm/gds、fT/fmax、Rth | 多为工艺取舍 | §5 |

### 怎么读这份报告

每节开头的加粗句是直接答案，"要点"是可以单独带走的结论，后面的小节是细节。所有数字都带证据标签。研究器件和 TCAD 的数字只说明方向，不能当作量产 PDK 的值引用。

## 1. 串联叠管：没有长沟道时怎么"拼"出长沟道

**在理想长沟道里，N 个共栅的串联短管与一根长度为 N·L 的管子完全等价；在短沟道里，它的行为更接近自 cascode（顶管饱和、下面几段处于线性区），增益大致随 N 线性增长，比独立偏置的 cascode 低一个数量级。它的优点是不需要额外偏置，并且能改善匹配和 1/f；缺点是面积、寄生和建模。**

要点：
- 【常识】EKV/ACM 理论中，均匀长沟道下的串联段像电阻一样相加，所以长度相加；短沟道效应（CLM、DIBL、速度饱和）和每段各自的 halo 打破了这种等价（[Vittoz EKV](https://www.epfl.ch/labs/iclab/wp-content/uploads/2019/02/10_EKV_UMW04_Eric_Vittoz.pdf)）。
- 公开的定量证据都来自平面或 SOI。一项专利声称，4 个 0.25 µm PMOS 叠管比单根 1 µm 器件的本征增益高约 10–12 dB（[US 2006/0226464](https://patents.justia.com/patent/20060226464)）【厂商】。FinFET/GAA 中"增益随 N 变化"的公开数据没有找到。
- 叠管能改善匹配：串联单元的 VT 方差约按 1/N 平均（[Fiorelli et al., ISCAS 2004](https://lci.ufsc.br/pdf/Series%20parallel%20association.pdf)）【硅片·研究】。
- 代价主要来自互连寄生、poly 间距决定的面积和前后仿差异（[Cadence 博客](https://community.cadence.com/cadence_blogs_8/b/cic/posts/stacked-mosfets-in-analog-layout)）【观点】；老一代紧凑模型对串联结构的电流误差可达 60%（[Dantas & de Sousa](https://sbmicro.org.br/sforum-eventos/sforum2008/43.pdf)）【仿真】。
- 余量允许时，独立偏置的 cascode 增益高得多；在低余量的电流源、电流镜，以及看重匹配和 1/f 的位置上，叠管更合适。

### 为什么要"拼"：先进工艺里 L 不是自由变量

【常识】本征增益约为 (gm/ID)·VEA，VEA 大致随 L 增长，所以长沟道是提高 ro 最直接的办法。在固定 CPP 的 FinFET/GAA 工艺中，单根器件的 L 只有少数几档。Synopsys 的人士说，GAA 中 L 受限，设计者主要能调的是 W/L 比；Fraunhofer 的人士说，GAA 器件必须放在"非常规则的网格"上（[Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)）【观点】。在约 28 nm 以下，最大 L 也受限，设计者因此把短管串起来当长管用，例如用 3 个 1 µm 器件拼成 3 µm（[Cadence 博客](https://community.cadence.com/cadence_blogs_8/b/cic/posts/stacked-mosfets-in-analog-layout)；[EDN 2021](https://www.edn.com/all-about-stacked-mosfets-in-analog-layout/)）【观点】。

作为对比，工艺直接提供的模拟专用器件给出的单管增益是：Intel 22FFL 的模拟薄氧器件在 144/216/270 nm 栅 pitch 上 gm·Rout 为 47/54/60（[WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)）【硅片·量产平台】，GF 14 nm 核心器件的 gm/gds 为 40 (n)/34 (p)（[Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)）【硅片·量产平台】。

### 原理：一步一步看串联为什么像长沟道，又为什么不完全像

**第 1 步：理想长沟道中，串联等于加长。** EKV 把漏电流写成源端和漏端两个独立项之差：I_D = I_F(V_S, V_G) − I_R(V_D, V_G)。沟道电流可以写成沟道电导沿 x 的积分，像一个"伪电阻"。只要每一段有相同的 V_T、迁移率和体（即相同的 F(V, V_G)），共栅的串联段就像电阻一样相加，总长度等于各段之和。这在所有反型区都成立；弱反型下即使沟道不均匀也成立（[Vittoz EKV](https://www.epfl.ch/labs/iclab/wp-content/uploads/2019/02/10_EKV_UMW04_Eric_Vittoz.pdf)）【常识】。

**第 2 步：短沟道打破等价。** 同一份资料指出，强反型下的等价要求沟道长且均匀、载流子速度远低于饱和速度；沟道长度调制（CLM）、势垒降低（DIBL）和速度饱和都会破坏它（[Vittoz EKV](https://www.epfl.ch/labs/iclab/wp-content/uploads/2019/02/10_EKV_UMW04_Eric_Vittoz.pdf)）。原因是每段的电流开始依赖自己的 V_DS，而不再只依赖端点电位。平面工艺中每一段都带着自己的 halo，所以 4 段叠管实际上是一条有约 8 个 halo 区的非均匀沟道【推断】。

**第 3 步：电压怎么分。** 【推断】顶部（漏侧）那段饱和，承担大部分 V_DS；下面 N−1 段处于线性区，每段只有几十 mV。所以 CLM 和 DIBL 主要作用在顶管上，下面几段相当于顶管的源极退化电阻 R_s。

**第 4 步：小信号上就是自 cascode。** 【常识】带源极退化的器件输出电阻约为 r_out ≈ r_o,top·(1 + gm,top·R_s)。GAA 和 FinFET 体效应很弱，这里忽略 gmb。

**第 5 步：代入一组数字。【示意】** 设某个 gm/ID 下单根 Lmin 管的 gm·r_o = 20（26 dB）。按平方律，线性区（V_DS → 0）一段的电导 μCox(W/L)·Vov 正好等于同尺寸饱和管的 gm，所以每段线性区电阻约为 1/gm，R_s ≈ (N−1)/gm，gm·R_s ≈ N−1。于是 r_out ≈ N·r_o,top，增益 ≈ N × 20。

| 结构 | 下方等效电阻 R_s | r_out（以 r_o 为单位） | 增益 | dB | 内部节点 | 额外偏置 |
|---|---|---|---|---|---|---|
| 单管 Lmin | 0 | 1 | 20 | 26 | 0 | 无 |
| 叠管 N = 2 | ≈ 1/gm | ≈ 2 | ≈ 40 | ≈ 32 | 1 | 无 |
| 叠管 N = 4 | ≈ 3/gm | ≈ 4 | ≈ 80 | ≈ 38 | 3 | 无 |
| 叠管 N = 8 | ≈ 7/gm | ≈ 8 | ≈ 160 | ≈ 44 | 7 | 无 |
| 2 管 cascode（独立偏置） | ≈ r_o = 20/gm | ≈ 21 | ≈ 420 | ≈ 52 | 1 | 1 路偏置 + 1 个 VDSAT |

这张表说明三件事【示意】：
- 叠管的增益大致随 N 线性增长，每翻倍约 +6 dB，正好对应"VA 正比于 L"的理想长沟道。这就是第 1 步说的等价。
- 同样用 2 个管子，cascode 比 N = 2 的叠管高约 20 dB。差别在下面那个管子：叠管里它工作在线性区，是一个约 1/gm 的小电阻；cascode 里它工作在饱和区，是一个约 r_o 的大电阻。
- 要在相同 ID 下保持相同 gm/ID，W 也要随 N 加大，面积约按 N² 增长。这一点和真长沟道一样，是"长"本身的代价，不是叠管特有的。

**第 6 步：实际为什么会偏离这张表。** 【推断】有四个原因：
- VDD 固定时，下面各段会分走一部分电压，顶管的 V_DS 随 N 增大而变小，它的 gds 在低 V_DS 下会变大。
- 每个内部节点都带有 S/D 外延电阻、接触电阻和寄生电容，会削弱有效 gm，并引入非主极点。
- 平面工艺中每段的 halo 会提高有效 V_T，使叠管比同长度的单管更好。专利声称，4 段 0.25 µm 叠管的 |V_T| 从约 120 mV 升到约 190 mV，增益比单根 1 µm 器件高 10–12 dB，而且随温度变化更小；专利没有分析电压分配和 DIBL（[US 2006/0226464](https://patents.justia.com/patent/20060226464)）【厂商】。
- FinFET/GAA 基本没有传统 halo（[Fulde 2007](https://d-nb.info/1149772921/34)），所以这份"额外红利"在 FinFET/GAA 叠管中可能更小【推断，无公开数据】。

结论：增益大致随 N 线性增长，但每多一段，面积、节点和余量的成本也在增加。实用的 N 多半在 2–8 之间【推断】。增益随 N 变化的实测曲线需要向 foundry PDK 或自有硅片数据确认。

### 非均匀叠管：有意做成的 self-cascode

把源侧和漏侧做成不同的器件，就是经典的 self-cascode。FD-SOI 的非对称自 cascode（A-SC）数据显示：漏侧器件 M_D 未掺杂、V_T 低，源侧器件 M_S 掺杂、V_T 高。在 V_DS = 1.5 V、V_GT = 200 mV 下，增大 L_S 或 L_D 都能提高 A_V，但增大 L_S 的作用更大，图中 A_V 的范围约为 30–130 dB（[Assalti, de Souza, Flandre 2018](https://research.dial.uclouvain.be/bitstreams/64bfbf3c-cfca-4f4d-8e03-66109d23fdcd/download)）【硅片·研究，µm 级 FD-SOI】。线性度也随之改善：L_D 从 0.75 µm 增到 10 µm，HD2/HD3 分别降低 32 dB 和 39 dB；L_S 从 0.75 µm 增到 10 µm，THD 降低 45 dB（同上）。

尺寸规则【推断】：源侧那段做长或用高 V_T，漏侧那段做短或用低 V_T。FinFET/GAA 中对应的做法是"ULVT/LVT 漏侧 + SVT/HVT 源侧"放在同一条扩散上。但同一扩散上能否混用 V_T，取决于 PDK 的功函数金属边界规则（通常要求额外的栅间距），需要向 foundry PDK 确认。

SOI 的串并联结构还能同时提高 Early 电压和击穿电压，用来做从弱反型到强反型都接近 1:1 的电流镜（[Deceuster et al. 1996](https://research.dial.uclouvain.be/handle/2078.5/71429)）【硅片·研究】。这意味着叠管也是一种"用低压管扛高压"的手段。

### 优缺点对比

| 维度 | 叠管（N × Lmin，共栅） | 真长沟道（单根 N·L，若 PDK 提供） | 独立偏置 cascode | 证据 |
|---|---|---|---|---|
| 增益 | 约 N × 单管【示意】；平面工艺中可能更好（halo 效应） | 约随 L 增长，且 DIBL 本身减小 | 约 (gm·ro)²，最高 | [专利](https://patents.justia.com/patent/20060226464)【厂商】；§1 推导【示意】 |
| 电压余量 | 与一根长管相当，不需要额外 VDSAT | 同左 | 多一个 VDSAT（约 0.1–0.15 V【推断】） | 【推断】 |
| 偏置 | 不需要 | 不需要 | 需要一路 cascode 偏置 | 【常识】 |
| fT / 带宽 | 低：有效 L 长，再加上内部节点电容 | 低：有效 L 长 | 输入管可以保持 Lmin，fT 高 | 【推断】 |
| 面积 | 由 poly 最小间距决定，"明显但不可避免" | 通常更紧凑，但未必有这种器件 | 2 个管子加偏置电路 | [Cadence 博客](https://community.cadence.com/cadence_blogs_8/b/cic/posts/stacked-mosfets-in-analog-layout)【观点】 |
| 匹配 | 总栅面积大；串联单元的方差约按 1/N 平均；业界认为它比又宽又长的单管更省面积 | 按 1/√(WL) | 主要由输入管决定 | [Fiorelli 2004](https://lci.ufsc.br/pdf/Series%20parallel%20association.pdf)【硅片·研究】；[Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)【观点】 |
| 1/f 噪声 | 总面积大，所以低；但饱和顶管的贡献可能偏大 | 按 1/(WL) | 主要由输入管决定 | 【推断】 |
| 建模 | 模型基于单根 Lmin 器件拟合；内部节点必须靠提取；BSIM3 类模型误差曾达 60% | 模型直接覆盖 | 成熟 | [Dantas & de Sousa](https://sbmicro.org.br/sforum-eventos/sforum2008/43.pdf)【仿真】 |
| 版图 | 规则、适合固定 pitch 网格；长链要折行，增加互连 | 需要特殊 pitch | 需要偏置布线 | [Cadence 博客](https://community.cadence.com/cadence_blogs_8/b/cic/posts/stacked-mosfets-in-analog-layout)【观点】 |
| 前后仿一致性 | 差，主要因为互连寄生；电路级误差 2–20% | 较好 | 较好 | [Saari 2014](https://uwaterloo.ca/electrical-computer-engineering/events/masc-seminar-daniel-saari)【仿真】；[Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)【观点】 |

几点补充：
- 65 nm 下的一项研究用"串联堆叠"模拟 FinFET 只有固定 L 的情况，在两级运放中与真长 L 设计的指标差在 2–20%，两者随电流密度和长度的趋势相同；schematic 级仿真会"大大高估"寄生（[Saari 2014](https://uwaterloo.ca/electrical-computer-engineering/events/masc-seminar-daniel-saari)）【仿真，仅摘要】。
- 0.5 µm 的仿真中，BSIM3v3 在 8 个串联器件的电流镜上电流误差达 60%，EKV 只有 9.5%；同一运放用 BSIM 时 GBW 相差 12.5%，用 EKV 时约 1%（[Dantas & de Sousa](https://sbmicro.org.br/sforum-eventos/sforum2008/43.pdf)）【仿真】。这说明叠管能否算准，取决于模型在小 V_DS 下对 DIBL/CLM 的描述。
- Intel 称 18A 的"完全隔离体"晶体管降低了寄生电容，并允许更灵活的模拟配置，包括器件堆叠和隔离供电域（[Intel 18A platform brief](https://www.intel.com/content/www/us/en/foundry/library/intel-18a-platform-brief.html)）【厂商】。没有体效应，叠管和 cascode 中上面那个管子的 V_T 就不会因为源端抬高而增大【推断】。

### 何时用叠管，何时用 cascode

【推断】下面这些情况用叠管：
- 低余量的电流源和电流镜，又没有方便的 cascode 偏置。
- 看重匹配和 1/f 噪声，需要大面积的器件，例如电流镜、基准和偏置。
- 固定 pitch 网格、希望版图规则化和自动化。
- 需要扛比单管更高的电压。

下面这些情况用 cascode 或 gain boosting：
- 需要高 fT 或高 GBW，输入管必须保持 Lmin。
- 需要的增益超过"一步自 cascode"能给的量。
- 电压余量允许多一个 VDSAT。
- 内部节点寄生和建模风险不可接受。

两者也可以组合：用叠管做电流源，用独立偏置的 cascode 做信号通路。

### 怎么表征叠管与长 L 器件

【推断，综合多来源】建议对单管 Lmin、叠管 N = 2/4/8/16，以及 PDK 中的宽松 pitch 器件或 I/O 器件做同一套测试，并用相同的 W 和 N·Lg 对齐比较。

1. **复合 I_D–V_GS（线性区和饱和区）**：提取 V_T,lin、V_T,sat、DIBL 和 SS。看等效 V_T 是否像专利说的那样被"最高 V_T 那一段"拉高。
2. **I_D–V_DS 曲线族**：提取 g_ds(V_DS)、V_EA 和 A_V0 = gm/g_ds，横轴用 gm/ID 或 I_D/(W/L_eff)。增益要在相同 gm/ID 下比较，不要在相同 V_GS 下比较。
3. **内部节点电压**：用带抽头的测试结构或 TCAD，确认顶段饱和、下面几段处于线性区。FD-SOI A-SC 研究就是用中间节点电位 V_X 来解释 L_S、L_D 的作用（[Assalti 2018](https://research.dial.uclouvain.be/bitstreams/64bfbf3c-cfca-4f4d-8e03-66109d23fdcd/download)）。
4. **线性度**：用积分函数法从 DC I–V 提取 HD2/HD3/THD，适用到约 fT/10（同上）。
5. **S 参数**：提取 C_gg、C_gd、fT 和 fmax，包括内部节点寄生。
6. **匹配**：画 Pelgrom 图（σΔV_T、σΔβ/β 对 1/√(N·W·Lg)），匹配对用带 dummy 的共质心布局。
7. **1/f 噪声**：测 S_ID 随 I_D 的变化，看顶段（高场区）是否贡献偏大。
8. **自热**：用脉冲 IV 测等温 g_ds，和 DC g_ds 对比。
9. **模型对比**：对比前仿、带内部节点的后仿和硅片三者。业界给出的前后仿差异约为 30%（[Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)）【观点】。

## 2. 其他提高增益的电路技巧

**在 0.7–0.9 V 的电源下，先进节点不再靠多叠管子拿增益，而是用反馈、时间或电荷去"乘"增益（gain boosting、CLS、ring amplifier、多级放大），或者用数字校准让精确增益变得不必要；低反型偏置和模拟专用器件则从器件端提高每伏的 gm·ro。**

要点：
- 【推断】在 VDD ≈ 0.8 V 下，"每伏余量换到的增益"大致排序为：CLS > ring amplifier > gain boosting > 多级 NMC > 正反馈负载 > 单级 cascode > 套筒双 cascode。
- 能在不增加串联器件的前提下拿增益的是：gain boosting（经典结果 90 dB DC 增益，[Bult & Geelen 1990](https://doi.org/10.1109/4.62165)）和 CLS（30 dB 环路增益的运放达到 60 dB 以上精度，[OSU 文档引用 Gregoire & Moon 2008](https://ece.osu.edu/media/document/2024-04-05/cc_cls.pdf)）。
- 增益不取决于 gm·ro 的结构，能随数字工艺一起缩小：ring amplifier 已用在 16 nm FinFET 流水线 ADC 中（[imec ISSCC 2019](https://api.openalex.org/works/doi:10.1109%2FISSCC.2019.8662319)）；动态放大器配合后台校准，在 28 nm、0.9 V 下做到 6.5 fJ/conv-step（[imec VLSI 2013](https://www.imec-int.com/drupal/sites/default/files/inline-files/400MS_11bit_28nm_ADC_VLSI2013.pdf)）。
- FinFET/GAA 的体效应很弱，体偏置基本无效；V_T 调节要靠多 V_T 器件。
- 没有找到在同一 FinFET/GAA 节点、同一 VDD 下横向比较这些技巧的公开资料。

### Cascode（套筒式 / 折叠式）

**原理**：在增益管上串一个共栅管，输出电阻约乘以 gm·ro，单级增益从 gm·ro 提高到约 (gm·ro)²/2【常识】。套筒式把输入对、cascode 和负载叠在一条支路上；折叠式把信号电流折到第二条支路，腾出约一个 VDSAT 的输入共模范围。

**效果/数字**：以 22FFL 模拟器件 gm·Rout = 47–60 计算（[WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)），一级 cascode 理论上可达约 60–70 dB【推断】。

**代价**：每多一级 cascode 吃掉一个 VDSAT（中等反型下约 0.1–0.15 V）。VDD ≈ 0.8 V 时，套筒式每边只剩约 0.2–0.3 Vpp 的摆幅。折叠式为了相同 gm 约需两倍电流，噪声也更大【推断】。

**何时用**：两级运放的第一级；1.2–1.8 V 的厚氧 I/O 器件。0.75 V 核心器件上的套筒式结构通常不现实，除非有低 V_T 器件【推断】。

### Gain boosting（regulated cascode）

**原理**：用一个增益为 A_aux 的辅助放大器驱动 cascode 管的栅极，把它的源极电压钉住，输出电阻再乘以约 (1 + A_aux)【常识】。

**效果/数字**：经典设计把约 40–50 dB 的折叠 cascode 提到 90 dB DC 增益，同时不影响单极点建立（[Bult & Geelen, JSSC 1990](https://doi.org/10.1109/4.62165)）【硅片·研究，经典文献值】。另有 90 dB、90 MHz、30 mW 的 OTA，用一级和两级辅助放大器实现增益增强（[Bar-Ilan](https://cris.biu.ac.il/en/publications/90db-90mhz-30mw-ota-with-the-gain-enhancement-implemented-by-one-/)）。

**代价**：会产生零极点对（doublet），导致慢建立尾巴。辅助放大器的单位增益带宽要放在主放大器的 β·GBW 和非主极点之间（[Bult & Geelen 1990](https://doi.org/10.1109/4.62165)）。每个辅助放大器通常是一个全差分对加 CMFB，带来额外的功耗和面积。辅助放大器的输入共模要与 cascode 节点兼容，这在低 VDD 下会限制摆幅【推断】。

**何时用**：开关电容积分器和流水线 MDAC。在 1 V 以下的 FinFET 中常与折叠式而非套筒式结构配合。它是"增加增益又不增加串联管"的首选【推断】。

### 多级放大与嵌套 Miller 补偿（NMC / MNMC）

**原理**：级联三级或更多简单的低余量放大级，每级 gm·ro 约 20–30 dB；用嵌套的 Miller 电容分离极点保证稳定，多路前馈（multipath）恢复带宽【常识】。

**效果/数字**：三级各 25–30 dB，合计约 75–90 dB，每级只需约两个 VDSAT 的余量【推断】。经典例子达到 100 dB 增益、100 MHz（[Eschauzier et al., JSSC 1992](https://doi.org/10.1109/4.173108)）【硅片·研究，经典文献值】。

**代价**：同功耗下 GBW 约降到单级的 1/4 或更低；稳定性对负载电容敏感；补偿电容占面积；每级都会增加失调和噪声，但第一级占主导【推断】。

**何时用**：LDO 误差放大器、基准、连续时间传感器前端等低 VDD、高增益、中等速度且需要轨到轨输出的模块【推断】。

### 正反馈负载（交叉耦合负电导）

**原理**：在二极管负载或有源负载旁并联一个交叉耦合对，它提供负电导 −gm_x，部分抵消负载的正电导，增益约为 gm1/(g_load − gm_x + g_ds)。gm_x 超过 g_load 时电路变成锁存器，锁存比较器和动态放大器的再生阶段正是这样工作的【常识】。

**效果/数字**：gm_x 接近 g_load 时，增益可提高 10–20 dB 或更多【推断】。没有找到 2010–2026 年给出定量结果的公开论文。

**代价**：增益强烈依赖 PVT 以及 gm_x 与 g_load 的失配；可能出现迟滞甚至锁死；失调更敏感【推断】。

**何时用**：前置放大器、比较器、开环余差放大器、动态放大器，前提是后面有数字校准。不适合需要精确闭环增益的连续时间运放【推断】。

### 低反型偏置（提高 gm/ID）

**原理**：本征增益 = (gm/ID)·VA。从强反型（gm/ID 约 5–8 S/A）移到中等或弱反型（约 15–25 S/A），每单位电流的 gm 和 gm·ro 都提高，VDSAT 也下降，余出来的电压可以给 cascode 用【常识】。本征增益在低过驱动时最高，超过某个最小 gm/ID 后大致持平（[Palermo, TAMU](https://people.engr.tamu.edu/spalermo/ecen474/lecture07_ee474_gmid.pdf)）。

**效果/数字**：Foundry 会在中等反型下标注模拟器件的速度。例如 22FFL 在 gm/ID ≥ 10 时的"可用 fT"约为 205 GHz，32 nm 平面约为 165 GHz（[WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)）【硅片·量产平台】。

**代价**：fT 明显下降；同电流下器件更大，寄生更多；弱反型下失调由 V_T 失配主导。FinFET 的宽度按 fin 量化，极低电流密度需要长 L 或叠管【推断】。

**何时用**：低功耗前端、基准、偏置、反相器型放大器和 ring amplifier。它同时提高增益、节省余量，是"每伏增益"最好的器件端手段【推断】。

### 反相器型放大器

**原理**：把 CMOS 反相器当放大级用，NMOS 和 PMOS 复用同一份电流，gm = gmn + gmp，不需要尾电流源，摆幅接近轨到轨。单级增益约为 (gmn + gmp)/(gdsn + gdsp)，约 20–30 dB【常识】。

**效果/数字**：级联或 cascode 化的反相器，常偏置在 class-C 或接近亚阈值区，可以搭出开关电容积分器和 ΔΣ 调制器（[Chae & Han, JSSC 2009](https://doi.org/10.1109/JSSC.2008.2010973)）【硅片·研究，经典文献值】。

**代价**：PSRR 和 CMRR 差；增益和工作点随 PVT 漂移；需要 auto-zero 或电容存储失调来设定工作点【常识】。

**何时用**：低压、低功耗的开关电容电路，尤其是 ΔΣ 调制器的积分器。

### Ring amplifier（ringamp）

**原理**：把三级反相器环形振荡器拆成两条信号路径，中间插入一个失调（"死区"）。在开关电容反馈中，它先像 class-AB 轨到轨驱动器一样快速摆动，然后在死区内稳定下来；此时输出级偏置在接近亚阈值区，输出阻抗和增益都很高。精度来自死区机制，不依赖器件的 gm·ro，所以能随数字工艺缩小（[Hershberg et al., JSSC 2012](https://doi.org/10.1109/JSSC.2012.2217865)）。

**效果/数字**：imec 在 16 nm FinFET 上做了 6–600 MS/s 全动态 ringamp 流水线 ADC。摘要称，ring amplification 把放大器效率提得很高，在某些深流水线 ADC 中功耗主要已经花在时钟上，而不是余差放大器上（[imec ISSCC 2019](https://api.openalex.org/works/doi:10.1109%2FISSCC.2019.8662319)）【硅片·研究】。本次没有取到 SNDR 或 FoM 数字。

**代价**：死区和偏置设计难；稳定性依赖 PVT（自偏置版本可以缓解）；只能用于离散时间的开关电容电路；建立过程是非线性的【推断】。

**何时用**：FinFET 节点、VDD ≈ 0.8–1 V 下的流水线、pipelined-SAR 和开关电容 ΔΣ ADC，用它替代 gain boosting OTA。

### 动态放大器（积分型、开环余差放大）

**原理**：预充电的差分对在固定时间内给负载电容放电，增益约为 gm·t/C，由积分时间决定而不是 gm·ro。它没有静态电流，像逻辑一样受时钟控制；增益不精确、随 PVT 变化，所以要靠数字校准。

**效果/数字**：imec 在 28 nm、0.9 V 下做了 2 路交织的 11 bit pipelined-SAR ADC：410 MS/s 下 SNDR 59.8 dB，功耗 2.1 mW，6.5 fJ/conv-step，面积 0.11 mm²。作者明确说余差放大器的增益"对工艺和温度相当敏感"，所以用伪随机抖动注入加相关的方法在后台估计增益（[imec VLSI 2013](https://www.imec-int.com/drupal/sites/default/files/inline-files/400MS_11bit_28nm_ADC_VLSI2013.pdf)）【硅片·研究】。作者的论点是：数字校准随工艺缩小越来越便宜，而失调和增益误差等模拟缺陷不会随之缩小（同上）。

**代价**：增益随 PVT 变化，必须校准；线性度有限；噪声由积分电容决定；增益依赖建立时间。

**何时用**：pipelined-SAR ADC 的余差放大器、比较器前置放大器。在数字校准能覆盖的范围内，它是先进节点里功耗最低的选择【推断】。

### Correlated level shifting（CLS）

**原理**：在第一个放大相的末尾，用电平移位电容 C_LS 采样运放输出的"估计值"；第二相把 C_LS 串到输出端，运放输出回到共模附近，负载仍然看到完整摆幅。运放只需修正剩余误差，所以有效环路增益约为两相环路增益的乘积，约为 A²（[OSU 文档](https://ece.osu.edu/media/document/2024-04-05/cc_cls.pdf)）。

**效果/数字**：
- 经典结果：环路增益只有 30 dB 的运放，实现了 60 dB 以上的"真轨到轨"性能（[Gregoire & Moon, JSSC 2008，见 OSU 文档引用](https://ece.osu.edu/media/document/2024-04-05/cc_cls.pdf)）【硅片·研究】。
- 仿真：36 dB 的运放在 100 MHz 时钟下，原始 CLS 达到约 52 dB 有效环路增益，交叉耦合 CLS 超过 100 dB；C_LS = C_LD 时比理想 A² 少约 6 dB（同上）【仿真】。

**代价**：多一个时钟相位，每相可用时间变短；C_LS = C_LD 时第一相负载约加倍，同速度下需要更多功耗。**失调和 1/f 噪声不被抵消**，它们和信号得到同样的增益（同上）。

**何时用**：低 VDD 节点的开关电容 MDAC 和积分器，它同时改善增益和摆幅。要压失调和 1/f 噪声，可以和 chopping 或 auto-zero 搭配【推断】。

### 时域 / VCO 架构

**原理**：把信号编码成时间或相位（VCO 频率、脉宽、延迟），再用数字计数器或 TDC 量化。积分型 VCO 对相位来说相当于无穷大的 DC 增益；晶体管越快，分辨率越高，所以能从工艺缩小中受益【常识】。

**效果/数字**：一个经典例子是带 5 bit、950 MS/s VCO 量化器的 12 bit、10 MHz 带宽连续时间 ΣΔ ADC（[Straayer & Perrott, JSSC 2008](https://doi.org/10.1109/JSSC.2008.917500)）【硅片·研究，经典文献值】。

**代价**：VCO 调谐非线性（需要校准或反馈）；受相位噪声和抖动限制；多相环形振荡器存在失配【推断】。

**何时用**：电压余量是硬约束的最先进节点中的传感器和射频接收机 ADC、数字 PLL、时域比较器【推断】。

### 体偏置

**原理**：FD-SOI 中背栅位于薄埋氧下方，能大幅移动 V_T：正向体偏置降低 V_T，换取速度和余量；反向体偏置提高 V_T，降低漏电。自适应体偏置（ABB）用背栅电压闭环补偿 PVT 和老化（[GlobalFoundries](https://gf.com/?p=722)）【厂商】。

**效果/数字**：GF 声称补偿工艺变化最多能找回约 30% 的性能；22FDX 上每个模块的偏置方向需要预先选定（同上）【厂商】。模拟中的用法包括：在差分对一侧加背栅来修调失调、降低 V_T 给 cascode 腾余量、调电流镜、补偿 V_T 温漂【推断】。

**代价**：需要偏置发生器和电荷泵，阱隔离占面积，背栅还会引入噪声路径【推断】。

**何时用**：FD-SOI 工艺。FinFET 和 nanosheet 的体效应很弱，体偏置基本无效，V_T 调节改由多种功函数金属或 dipole 的 V_T 选项提供【推断】。

### 模拟器件选型（宽松 pitch、厚氧 I/O、多 V_T）

**原理**：更长的 L 或更宽松的栅 pitch 提高 VA，gm·ro 大致随 L 增长；厚氧 I/O 器件能承受 1.2–1.8 V，恢复 cascode 所需的余量；低 V_T 和超低 V_T 器件在固定 VDD 下给出更多 V_GS − V_T；高 V_T 器件漏电小，有利于采样保持的 droop【常识/推断】。

**效果/数字**：
- 22FFL 提供 0.7/1.2/1.5 V 的专用薄氧模拟器件（144/216/270 nm 栅 pitch，gm·Rout 47/54/60），以及 Lg 90–160 nm 的厚栅器件（逻辑器件 Lg 为 74 nm）（[WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)）【硅片·量产平台】。
- GF 14 nm 的 1.8 V I/O FinFET（Lg 150 nm）峰值 fT 约 50 GHz，核心器件约 300 GHz（[Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)）【硅片·量产平台】。
- TSMC N2 的 NanoFlex 允许同一芯片上混用不同 sheet 宽度的单元（[IEEE Spectrum](https://spectrum.ieee.org/tsmc-n2)）【厂商】；Intel 18A 以 ribbon 宽度作为调节旋钮，并声称多 V_T 器件"失配系数低"（[Intel 18A platform brief](https://www.intel.com/content/www/us/en/foundry/library/intel-18a-platform-brief.html)）【厂商】。

**代价**：厚氧器件 fT 低、面积大；宽松 pitch 器件需要 PDK 支持；GAA 中 L 受限、必须在规则网格上，GAA 还增加了 Cgd 和 Cbd 等难以补偿的电容（[Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)）【观点】。

**何时用**：基准、LDO、偏置和 I/O 电压运放用厚氧器件；精密增益级用宽松 pitch 或长 L 器件；ring amplifier、动态放大器和比较器用核心器件【推断】。

## 3. 不靠增益：处理失调、噪声和精度的技巧

**失调、1/f 噪声和漂移不随增益提高而消失；它们靠时间域抵消（chopping、auto-zero、CDS）、数字校准和版图匹配来处理。在先进节点，这些方法比"把输入管做大"更省面积。**

要点：
- Auto-zero 和 CDS 减掉失调和 1/f 噪声，但会把宽带白噪声混叠到基带；chopping 把失调和 1/f 噪声搬到高频，不混叠白噪声，但会留下纹波（[Enz & Temes 1996](https://doi.org/10.1109/5.542410)）。
- CLS、gain boosting、cascode 和多级放大都不抵消失调和 1/f 噪声；CLS 甚至让它们和信号得到同样的增益（[OSU 文档](https://ece.osu.edu/media/document/2024-04-05/cc_cls.pdf)）。
- 业界观点：3 nm 下"工艺变化太大，数字逻辑又太便宜"，用校准环路取代为匹配而做大的差分对更划算（[Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)）【观点】。
- 先进节点的模拟面积不缩小（100 Ω poly 电阻从 180 nm 到 28 nm 面积几乎不变），所以大部分精密模拟预计会放到 chiplet 上（同上）【观点】。

### Chopping（斩波稳定）

**原理**：先把信号调制到 f_chop，放大后再解调。放大器自身的失调和 1/f 噪声只被调制一次，因此被搬到 f_chop 处并滤掉（[Enz & Temes, Proc. IEEE 1996](https://doi.org/10.1109/5.542410)）【常识，经典综述】。

**效果/数字**：失调和 1/f 噪声被搬离基带，而且不会把白噪声混叠进来（同上）。有生物传感器 TIA 把噪声抵消和 chopping 结合使用（[EPFL ICNF 2015](https://infoscience.epfl.ch/record/215989)）。

**代价**：残余纹波和电荷注入尖峰，需要陷波或纹波抑制环路；需要时钟；带宽受 f_chop 限制【常识】。

**何时用**：连续时间的精密放大器、传感器前端、基准缓冲器。【推断】在 nanosheet 中，小面积器件的 1/f 噪声和 RTN 离散很大，chopping 让输入对可以保持较小面积，省下在先进节点不缩小的模拟面积。

### Auto-zero 与 CDS / CMS

**原理**：在一个相位里采样"失调 + 低频噪声"，下一相减掉。等效于对 1/f 噪声和失调做高通滤波。CDS 是在采样系统中做同样的事；CMS（correlated multiple sampling）把 auto-zero 和 CDS 推广到多次采样，兼有平均和抵消（[EPFL ICNF 2015](https://infoscience.epfl.ch/record/215989)）。

**效果/数字**：失调和 1/f 噪声被抵消；在某些开关电容结构中，auto-zero 还能存储有限增益误差，从而放宽对增益的要求（[Enz & Temes 1996](https://doi.org/10.1109/5.542410)）。

**代价**：宽带白噪声混叠，基带白噪声上升；CMS 最终也受这种混叠限制（[EPFL ICNF 2015](https://infoscience.epfl.ch/record/215989)）。需要额外的时钟相位。

**何时用**：开关电容电路、图像传感器读出、比较器失调消除。与 CLS 组合，可以同时解决增益/摆幅和失调/1/f 的问题【推断】。

### 数字校准（digitally assisted analog）

**原理**：用低增益、低功耗的模拟模块，再用数字方法修正增益误差、非线性、失调和失配，手段包括抖动相关、直方图和冗余，可以在前台或后台进行。

**效果/数字**：
- 经典例子是开环低增益余差放大加后台非线性校准的 12 bit、75 MS/s 流水线 ADC（[Murmann & Boser, JSSC 2003](https://doi.org/10.1109/JSSC.2003.819167)）【硅片·研究，经典文献值】。
- imec 28 nm ADC 用冗余计错和直方图方法在后台校正比较器失调，并校正通道间的增益和失调失配（[imec VLSI 2013](https://www.imec-int.com/drupal/sites/default/files/inline-files/400MS_11bit_28nm_ADC_VLSI2013.pdf)）【硅片·研究】。
- Cadence 的人士认为，基于 ADC 的校准可能比一个为了跨角落匹配而做大的差分对小得多；Synopsys 的人士认为变异性要求数字甚至软件校准环路（[Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)）【观点】。

**代价**：设计和验证复杂；后台环路需要收敛时间；测试成本增加；模拟通路需要冗余。

**何时用**：ADC、DAC 电流源、交织通道、开环放大器。【推断】nanosheet 中 BDI 带来更强的自热，温度漂移因此更大，在大电流模块里后台校准比一次性修调更稳妥。基准和偏置仍可用熔丝或 OTP 修调。

### 版图匹配技巧（多 finger、双边栅接触、dummy、共质心）

**原理**：
- Pelgrom 定律 σ(ΔV_T) = A_VT/√(WL) 决定失调（[Pelgrom et al., JSSC 1989](https://doi.org/10.1109/JSSC.1989.572629)）。
- 共质心和交叉排布抵消线性梯度；阵列边缘的 dummy 栅和 dummy fin 让 WPE、应力和 LOD 等环境一致【常识】。
- 多 finger 器件两端都打栅接触时，分布式栅电阻约为单端接触的 1/4（finger 电阻的 1/12 对 1/3），Rg 热噪声更低，fmax 更高【常识】。

**效果/数字**：22FFL 的 fmax 提升主要归因于栅电容和栅电阻降低（[WikiChip](https://fuse.wikichip.org/news/567/iedm-2017-intel-details-22ffl-a-relaxed-14nm-process-for-foundry-customers-targets-mobile-and-rf-apps/3)）。TSMC 从 N5 起采用固定高度的模拟单元，使用统一的 OD 和 poly 以保证良率，并指出相邻晶体管的版图会影响器件性能（[SemiWiki, TSMC OIP](https://semiwiki.com/semiconductor-manufacturers/321960-tsmc-oip-analog-cell-migration/)）。FinFET 的工厂手册要求环境 dummy、连续扩散和恒定 poly 密度，有的工厂还要求匹配器件放在特定的 fin pitch 上（[ASIC North](https://www.asicnorth.com/blog/part-two-finfet-back-end-layout-analog-techniques-and-design-tools/)）【观点】。

**代价**：面积、布线复杂度；寄生增加，后仿必不可少（[Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)）。

**何时用**：所有匹配器件、RF 输入管、电流镜阵列。具体清单见 §6。

### Chiplet 分割

**原理**：在 GAA 裸片上只保留必须在那里的模拟电路（PLL、芯片间接口），把精密模拟放到更合适的工艺上。

**效果/数字**：Fraunhofer 的人士预计"大部分模拟会采用 chiplet 方式"；Siemens 的人士指出，100 Ω poly 电阻和 LC 电感的面积从 180 nm 到 28 nm 几乎没有缩小（[Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)）【观点】。

**代价**：芯片间接口的功耗和延迟、封装成本、跨裸片模拟信号的噪声和信号完整性【推断】。匹配器件必须在同一颗裸片的同一局部区域，不能跨裸片依赖匹配【推断】。

**何时用**：精密数据转换器、高压和电源管理、传感器接口等不能从 3 nm/2 nm 密度中获益的模块；SerDes、PLL 和存储器 PHY 通常留在先进裸片上【推断】。

## 4. Nanosheet 阶段怎么降 1/f 噪声和 RTN

**在 nanosheet 中，1/f 噪声主要由栅叠层（界面层和 HfO₂）中的边界陷阱密度决定，GAA 几何既不明显加重也不明显减轻它；工艺侧的主要旋钮是可靠性退火、热预算、EOT 和 dipole，设计侧的主要旋钮是栅面积、低过驱动和 chopping。RTN 的单陷阱幅度在 GAA 中约为 FinFET 的一半，但陷阱数量仍按面积计。**

要点：
- imec 在 188 个 p 型 sheet 上的测量显示，同栅叠层下 nanosheet 与平面 HKMG 的边界陷阱密度 N_BT 相当，"栅叠层质量而非沟道几何主导"1/f 噪声（[Asanovski et al.](https://arxiv.org/html/2609.08674)）【硅片·研究】。
- 公开数据中定量最清楚的工艺旋钮是高压 D₂ 退火：噪声降约 4.8 倍，慢陷阱密度降约 4 倍，但这是在 FD-SOI TFET 上测的，不是 nanosheet（[Shin et al., Sci. Rep. 2022](https://www.nature.com/articles/s41598-022-22575-5)）【硅片·研究】。
- 1/f 噪声提取的 N_BT 与 BTI 陷阱密度在不同退火条件下相关（[Asanovski et al.](https://arxiv.org/html/2609.08674)），所以能降 BTI 的工艺手段很可能也能降 1/f 噪声。
- GAA 纳米线的单缺陷 ΔV_T 均值 η 约 1 mV，10 nm FinFET 约 1.9 mV（[Chasin et al. 2017](https://www.iue.tuwien.ac.at/pdf/ib_2017/CP2017_Rzepa_02.pdf)）【硅片·研究】。
- 没有找到 dipole、IL 类型、氮化、氟钝化、inner spacer、BDI、应变、SiGe 沟道对 nanosheet 1/f 或 RTN 影响的公开定量数据。

### 先抓主因：1/f 噪声是栅叠层的陷阱问题

nanosheet 的 1/f 噪声以载流子数涨落为主（陷阱俘获和释放），pMOS 与 nMOS 定性相似；在 78 K 下还能看到相关迁移率涨落（[Simoen et al., JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)）【硅片·研究】。在这种机制下，S_vg ∝ N_BT/(C_ox²·W·L·f)（[Asanovski et al.](https://arxiv.org/html/2609.08674)）。由此有三个直接的旋钮：
- 降低 N_BT，靠栅叠层工艺。
- 增大 C_ox，即更薄的 EOT。
- 增大 W·L，即更大的面积。

imec 的对比用的是 48 nm CGP、EOT ≈ 1 nm、W = 17 nm、H = 6.5 nm、L = 19 nm、每器件 2 层 sheet 的 p 型 nanosheet，与相同栅叠层、相近 RMG 热预算的平面 pFET 对比。两者的 N_BT"相当"，作者的结论是"转向 GAA 不会带来噪声惩罚"（[Asanovski et al.](https://arxiv.org/html/2609.08674)）【硅片·研究】。在面积归一的 S_VG·A 上，imec 双层 nanosheet 相对无结 GAA、反型 GAA、SOI 和 FinFET"表现占优"（[Simoen et al., JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)）【硅片·研究，数值只在图中】。

需要注意，imec 这批器件"没有专门的可靠性退火，只在流程末尾做了合成气烧结"（[Asanovski et al.](https://arxiv.org/html/2609.08674)），所以它的陷阱密度只是基线，还有改进空间。

作为参照，GF 从 28 nm 平面到 14 nm FinFET，1 kHz 下面积归一的 S_VG 从 171 (n)/106 (p) 降到 17 (n)/35 (p) fV²·µm²/Hz（[Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications)）【硅片·量产平台】。FinFET 的 pFET 噪声约为 nFET 的 2 倍，与平面工艺中 pFET 更安静的经验相反。

### 工艺旋钮：公开证据一览

| 工艺旋钮 | 公开结果 | 幅度 | 证据 | 来源 |
|---|---|---|---|---|
| 高压 D₂ / H₂ 退火（400 °C、10 atm、30 min） | 100 Hz 下归一化 S_ID/I²：2.15e-9 → 9.53e-10 (H₂) → 4.49e-10 Hz⁻¹ (D₂)；慢陷阱 N_t：2.72e18 → 6.55e17 eV⁻¹cm⁻³；N_it：3.3e11 → 4.3e10 cm⁻²；SS：79 → 72 mV/dec | 约 4.8 倍（约 7 dB）；D₂ 比 H₂ 约好 2 倍 | 硅片·研究（FD-SOI pTFET，非 nanosheet） | [Shin et al. 2022](https://www.nature.com/articles/s41598-022-22575-5) |
| 高压 D₂ 退火对纳米线 RTN | 被引用为能降低 p 型 Ω 栅纳米线 FET 的 RTN | 未读到数字 | 硅片·研究（仅标题） | [Yang et al., Nanotechnology 2020](https://iopscience.iop.org/article/10.1088/1361-6528/ab9e90) |
| 沉积后退火 / 热预算 | 不做 PDA 时，HfO₂ 缺陷密度约高 2 倍，陷阱能级更浅；BTI ΔV_th 约为目标的 10–20 倍 | 约 2 倍缺陷密度（BTI 数据，非噪声） | 硅片·研究 | [Franco et al., EDTM 2019](https://www.iue.tuwien.ac.at/pdf/ib_2019/CP2019_Franco_1.pdf) |
| 功函数金属 | 在 GAA 双层 nanosheet 中对栅叠层质量和 N_OT"有一定影响" | 文中无数字 | 硅片·研究 | [Simoen et al., JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770) |
| sheet 垂直间距（7.5 → 4.7 nm） | 对 1/f PSD"影响很小" | 很小 | 硅片·研究 | 同上 |
| EOT 缩小 | 归一化 S_VG 随 EOT 减小而下降；多栅之间的电荷共享进一步减小单个陷阱电荷的影响 | 方向明确，数字在图中 | 硅片·研究 | 同上 |
| La / Al dipole（多 V_T） | PBTI 降约 8 倍（La，nMOS），NBTI 最多降约 10 倍（Al，pMOS）；机理是把 HfO₂ 缺陷能带移离载流子能量；该论文没有噪声数据 | 噪声影响未知 | 硅片·研究（BTI） | [Franco et al., EDTM 2019](https://www.iue.tuwien.ac.at/pdf/ib_2019/CP2019_Franco_1.pdf) |
| 界面层厚度 | pMOS dipole 的好处只在约 0.6 nm 的薄 SiO₂ IL 上出现；约 1 nm 时 SiO₂ 空穴陷阱主导，好处消失；nMOS 基本不受 IL 厚度影响 | — | 硅片·研究（BTI） | 同上 |
| 低 N_OT 对迁移率 | N_OT 通过库仑散射与有效迁移率相关，低 N_OT 同时改善噪声和迁移率 | — | 硅片·研究 | [Simoen et al., JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770) |
| IL 类型、氮化、氟钝化、inner spacer、BDI、应变、SiGe pFET、sheet 厚度 | 没有找到 nanosheet/FinFET 的公开定量 1/f 或 RTN 数据 | — | 空白 | — |

【推断】这张表给出三条可以执行的判断：
- 在 imec 平面数据中，噪声提取的 N_BT 与 BTI 的 ΔN_eff 在不同退火条件下同步变化（[Asanovski et al.](https://arxiv.org/html/2609.08674)），所以降 BTI 陷阱的可靠性退火、PDA 和更高的 RMG 热预算，很可能同样降低 nanosheet 的 1/f 噪声。
- 根据 TFET 数据和纳米线 RTN 的定性结果，高压 D₂ 退火的合理预期是 PSD 降低约 2–5 倍（约 3–7 dB）。这不是 nanosheet MOSFET 的实测值。
- inner spacer、BDI、sheet 厚度和应变主要通过栅介质以外的噪声源间接起作用：BDI 去掉 sheet 底部的寄生沟道，inner spacer 和 S/D 影响接入电阻噪声，应变影响迁移率。它们不直接改变 N_BT。

### 多 V_T dipole 对噪声：方向乐观，但没有数据

GAA 的 sheet 间隙很小，放不下厚的功函数金属，所以业界正把多 V_T 从"WFM 厚度"转向"dipole"。imec 提出了"dipole-first"栅叠层，作为 nanosheet/CFET 的多 V_T 方案（[Arimura et al., IEDM 2021](https://imec-publications.be/entities/publication/639ca126-058f-4dd5-9cf3-a0ec41579acf/full)）【硅片·研究】，IBM 发表了双 dipole 的近带边多 V_T 方案（[IBM Research](https://research.ibm.com/publications/selective-enablement-of-dual-dipoles-for-near-bandedge-multi-vt-solution-in-high-performance-finfet-and-nanosheet-technologies)）。

【推断】dipole 把 HfO₂ 缺陷能带移离载流子费米能级，在工作偏置下应该会减少"噪声活跃"的边界陷阱，就像它降低 BTI 一样。如果是这样，用 dipole 做的低 V_T 器件，其 N_BT 可能与只用 WFM 的器件相当甚至更好。需要检查的风险有三个：La 或 Al 扩散到 IL/Si 界面（界面陷阱增加、库仑散射、迁移率下降）、IL 再生长、以及多层 dipole 与 WFM 叠加。没有找到任何 FinFET/GAA 中 dipole 引起 1/f 或 RTN 变化的公开 dB 数字。不同 V_T 器件的噪声需要向 foundry PDK 确认。

### RTN：单陷阱幅度变小，但陷阱数仍按面积计

RTN 是载流子在界面或缺陷处的随机俘获和释放（[Semiconductor Engineering](https://semiengineering.com/knowledge_centers/eda-design/noise-2/random-telegraph-noise/)）。在小面积器件中，1/f 谱分解成单个陷阱的 Lorentzian 谱。20 nm 级平面器件中单个 RTN 的 ΔV_th 可以超过 70 mV（[VLSI 2009](https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm)）【硅片·研究】。

GAA 的相关数据：
- 在堆叠 GAA 纳米线中，defect-centric 拟合给出单缺陷平均 ΔV_T 为 η ≈ 1 mV，10 nm FinFET 为 1.9 mV（各 250 个 nFET，PBTI）。时间相关变异约小 2 倍。作者把原因归为更好的静电控制和体反型让电流远离界面。但在相同应力下，纳米线中被填充的陷阱比 FinFET 多。两者的零时刻 Pelgrom 系数都约为 2 mV·µm（[Chasin et al. 2017](https://www.iue.tuwien.ac.at/pdf/ib_2017/CP2017_Rzepa_02.pdf)）【硅片·研究】。
- TCAD 预测，4 nm 的细线因为氧化层电场集中，平均 PBTI 退化比 8 nm 线高约 20%（同上）【TCAD】。
- nanosheet 的积分噪声 V_rms 分布可以用 defect-centric 模型拟合：活跃缺陷数服从 Poisson 分布，单缺陷贡献服从均值为 η 的指数分布（[Asanovski et al.](https://arxiv.org/html/2609.08674)）。

【推断】由此得到三个结论：
- GAA 让每个陷阱"更轻"，但每单位面积的陷阱数不变。预期是 RTN 台阶更小，而不是陷阱更少。
- 一个由 M 层 sheet 或 M 个并联单元构成的器件，陷阱数约为单层的 M 倍，每个陷阱对总 ΔV_T 的贡献约为 1/M。器件只有 0 或 1 个主导陷阱（双稳态 RTN）的概率随 M 指数下降。结果是 RTN 被平均成接近高斯的 1/f 谱，器件间噪声功率的 σ 约按 1/√M 缩小，但平均 S_vg 仍按 1/面积 变化。这是由模型推出来的，没有 nanosheet 叠层的实测验证。
- 薄而窄的 sheet 有电场集中的风险，低噪声模拟器件应避开最窄、最薄的 sheet。

### 设计侧做法

| 做法 | 依据 | 证据 |
|---|---|---|
| 加大栅面积：更多 sheet、更宽的 sheet、更多 finger、更长的 L 或叠管 | 面积归一的 S_vg 按 1/(WL) 变化；时间相关变异按 1/A 变化 | [Asanovski et al.](https://arxiv.org/html/2609.08674)；[Chasin 2017](https://www.iue.tuwien.ac.at/pdf/ib_2017/CP2017_Rzepa_02.pdf)【硅片·研究】 |
| 低过驱动：中等或弱反型、低 V_DS | S_vg 随 V_ov 增大；活跃陷阱的平均数 ⟨N_T⟩ 随 V_ov 和 I_D 增加 | [Asanovski et al.](https://arxiv.org/html/2609.08674)【硅片·研究】 |
| 余量允许时用薄 EOT 的核心器件 | 归一化 S_VG 随 EOT 减小而下降；厚氧 I/O 器件 C_ox 小，单位面积 S_vg 更高，除非其 N_BT 低得多 | [Simoen et al., JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)；后半句【推断】 |
| 不要默认 pFET 更安静 | imec nanosheet 中 pMOS 与 nMOS"定性相似"；GF 14 nm FinFET 中 pFET 约为 nFET 的 2 倍 | [JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)；[Singh/GF](https://www.academia.edu/124901933/14_nm_FinFET_Technology_for_Analog_and_RF_Applications) |
| 用 chopping 或 auto-zero 代替大面积输入管 | 把 1/f 噪声搬走或减掉，比用面积换噪声更省 | [Enz & Temes 1996](https://doi.org/10.1109/5.542410)；面积结论【推断】 |
| 用统计噪声角落而不是单一 Kf | 小器件的噪声离散呈长尾，按均值取的角落会低估尾部 | [VLSI 2009](https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm)；结论【推断】 |

### 怎么测、怎么报

imec 2026 年的晶圆级流程可以直接参考：B1500 加 E4727B；pFET 线性区 V_DS = −50 mV、25 °C；恒流点 100 nA–2 µA；频段 10 Hz–1 kHz，并在此频段积分 V_rms；94 个 nanosheet 器件对 12 个平面参考器件；把 N 个小器件的谱相加当作一个"等效大器件"，离散用 defect-centric 模型拟合（[Asanovski et al.](https://arxiv.org/html/2609.08674)）【硅片·研究】。

【推断】比较工艺旋钮时，按栅叠层提取 N_OT（或 N_BT）和库仑散射系数，不要直接比较 Kf，因为 Kf 混入了 C_ox 和偏置依赖。报告 S_VG·WL 时要写清频率、V_DS 和过驱动。小器件每种几何测几十到几百个，报告中位数和对数正态 σ，并保留时域波形，用来标记 RTN。

## 5. 失配、DIBL、fT 与自热：其他本征参数的优化

**在公开数据里，nanosheet 每单位栅面积的失配与 FinFET 差不多，主导项是金属栅晶粒（WFV）；它的好处是同样占地面积下能堆出更多栅面积。DIBL 和本征增益受 sheet 宽度和 Lg 影响；fT/fmax 主要由寄生（sheet 间隙、S/D 外延、接触、BDI）决定；BDI 改善 RF，但加重自热。这些结论几乎都来自 TCAD 和研究器件。**

要点：
- WFV 主导 V_T 失配：TiN 晶粒从 5 nm 减到 1 nm，σV_T 从 9.6 mV 降到 3.8 mV（[Mohapatra et al. 2021](https://link.springer.com/article/10.1007/s42452-021-04539-y)）【TCAD】；3 层 sheet 比 1 层的 WFV σV_T 低 40.5%（[Sudarsanan 2020](https://publications.iith.ac.in/publication/superior-work-function-variability-performance-of-horizontally)）【TCAD】。
- LER 对 nanosheet 的 I_ON 影响可以忽略，因为粗糙度落在 sheet 宽度这一非关键尺寸上；MGG 引起的 I_ON 失配系数 FinFET 与 nanosheet 几乎相同（192 对 191 nA/nm）（[Fernandez et al. 2023](https://in4.iue.tuwien.ac.at/pdfs/sispad2022/A-comprehensive-Pelgrom-based-on-current-variability-mod_2023_Solid-State-El.pdf)）【TCAD】。
- sheet 越宽，DIBL 越大（[Mohapatra 2021](https://link.springer.com/article/10.1007/s42452-021-04539-y)）【TCAD】；模拟上最优的 sheet 比逻辑追求的"最宽 sheet"要窄。
- BDI 配合侧壁或环绕金属接触，fT 提高 8%、fmax 提高 13%（[Saleh et al. 2026](https://research.ajman.ac.ae/en/publications/digital-and-analogrf-performance-of-stacked-nanosheet-transistors/)）【TCAD】；但 BDI 让晶格温度"显著"升高（[Saleh et al. 2023](https://research.ajman.ac.ae/en/publications/impact-of-bottom-dielectric-isolation-of-si-stacked-nanosheet-tra/)）【TCAD】。
- 单个 nanosheet 叠层的仿真热阻约为 2.59 K/µW，并排的叠层越多，每个叠层的热阻越高（[Zhao et al. 2023](https://www.mdpi.com/2079-4991/13/22/2971)）【硅片·研究 + TCAD】。

### 失配：金属栅晶粒主导，堆叠 sheet 是最省面积的旋钮

公开的 TCAD 研究给出一致的结论：WFV/MGG 是 nanosheet V_T 失配的主导来源。
- 3 层 nanosheet（LG 14 nm、TiN 栅，仿真已对实验校准）中，WFV 引起的 σV_T(sat) 在 1、3、5 nm 晶粒下分别为 3.8、6.3、9.6 mV。MGG 在 V_T 变异中占主导，而 S/D 延伸区掺杂和接入电阻主导 I_ON 变异（[Mohapatra et al. 2021](https://link.springer.com/article/10.1007/s42452-021-04539-y)）【TCAD】。
- 堆叠 nanosheet 的 WFV 抗扰性比纳米线好 15%；3 层比 1 层的 WFV σV_T 低 40.5%；仅计 WFV 时，A_VT 为 0.7 mV·µm（nanosheet）对 1.2 mV·µm（纳米线）（[Sudarsanan & Venkateswarlu 2020](https://publications.iith.ac.in/publication/superior-work-function-variability-performance-of-horizontally)）【TCAD】。
- 300 个样本的 Monte Carlo 中，σV_T,sat 为 5.84 mV（nanosheet）对 9.40 mV（背栅 MoS₂ FET），多栅几何抑制了靠近源端的高功函数晶粒的影响（[Chen et al., IWCN 2025](https://in4.iue.tuwien.ac.at/pdfs/iwce/iwcn5_2025/IWCN_2025_106-107.pdf)）【TCAD】。
- GAA 纳米线和 FinFET 的零时刻 Pelgrom 系数都约为 2 mV·µm（[Chasin et al. 2017](https://www.iue.tuwien.ac.at/pdf/ib_2017/CP2017_Rzepa_02.pdf)）【硅片·研究】。

【推断】综合来看：
- nanosheet 并没有从根本上改变每单位栅面积的失配。它的收益来自同样占地面积下能获得更多栅面积（堆叠、连续宽度），所以买匹配更省面积。
- 用 dipole 设定 V_T 后，残余 V_T 失配会更多取决于 dipole 剂量均匀性和 high-k 界面质量，而不只是 WFM 晶粒。没有公开数据比较 dipole 型和 WFM 厚度型多 V_T 的匹配。Intel 只给了"18A 多 V_T 器件失配系数低"的定性说法（[Intel 18A platform brief](https://www.intel.com/content/www/us/en/foundry/library/intel-18a-platform-brief.html)）【厂商】。
- LER 被移到非关键尺寸后，剩下的几何来源是 sheet 厚度（由 SiGe/Si 超晶格外延控制）和栅长变化。sheet 越薄、Lg 越短，影响越大。

工艺旋钮：更小或非晶的 WFM 晶粒、更多的堆叠 sheet、均匀的 dipole 工艺。设计旋钮：更大的总栅面积、匹配器件使用相同的 sheet 宽度和 V_T 选项、加 dummy。另外，BDI 让沟道平均应力比带理想 S/D 应力源的穿通阻挡（PTS）方案低约 85%（[Saleh et al., TED 2023](https://research.ajman.ac.ae/en/publications/impact-of-bottom-dielectric-isolation-of-si-stacked-nanosheet-tra/)）【TCAD】。【推断】应力相关的 LDE（扩散断、gate cut 邻近）可能因此变弱，这对匹配有利，但没有公开量化。

### DIBL 与本征增益：窄 sheet、长 Lg

【常识】短沟道中 DIBL 额外贡献一项 g_ds ≈ η·gm，所以本征增益有一个约 1/η 的上限。降低 DIBL 就是提高增益上限。

公开结果：
- 3D 漂移扩散加 Monte Carlo 的对比显示，在 LG 16 nm 下，nanosheet 的导通电流更大，亚阈特性比等效 FinFET 略好（[Nagy et al., IEEE Access 2020](https://minerva.usc.gal/entities/publication/f3f1b8a9-5ef4-484b-9d53-7d72a5108d7d/full)）【TCAD】。
- sheet 越宽，I_ON、I_OFF 和 DIBL 都增大；sheet 越薄，I_OFF 越小；LG 缩到 8 nm 时 SS 劣化约 11 mV/dec（[Mohapatra et al. 2021](https://link.springer.com/article/10.1007/s42452-021-04539-y)）【TCAD】。
- imec 双层 nanosheet 研究器件（L 28–200 nm、EOT 0.9 nm）的本征增益约 46 dB，V_EA 约 30 V；论文引用的 FinFET 值约 34 dB（跨论文比较）；sheet 间距 4.7 nm 的增益高于 7.5 nm（[Simoen et al., JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)）【硅片·研究】。
- IBM 的 FinFET 与 GAA 对比认为，"更宽更薄的堆叠 nanosheet"在逻辑性能上优于 FinFET（[Kim et al., IBM S3S 2015](https://research.ibm.com/publications/performance-trade-offs-in-finfet-and-gate-all-around-device-architectures-for-7nm-node-and-beyond)）【TCAD】。这与"宽 sheet 增大 DIBL"一起说明，逻辑和模拟对 sheet 宽度的偏好不同。

【推断】模拟上的做法是：增益关键的器件选窄或中等宽度的 sheet，用更长的 Lg（若 PDK 提供）或叠管，并在中等反型下偏置。隔离体（BDI 或"完全隔离体"）去掉了叠管和 cascode 中的体效应，这对余量有利（[Intel 18A platform brief](https://www.intel.com/content/www/us/en/foundry/library/intel-18a-platform-brief.html)）【厂商】。nanosheet 与 FinFET 在同节点下的 gm/gds 实测对比没有公开。

### fT / fmax 与寄生：瓶颈在 sheet 之外

TCAD 指出了几个对 RF 影响最大的 nanosheet 特有旋钮：
- **BDI 和接触方式**：BDI 平均比 PTS 改善 RF 约 9%；BDI 加金属侧壁接触（MSW）或环绕接触（WAC）的最佳组合使 fT 提高 8%、fmax 提高 13%，MSW 比 WAC 约好 2%；仿真包含 BEOL 寄生（[Saleh et al., J. Comput. Electron. 2026](https://research.ajman.ac.ae/en/publications/digital-and-analogrf-performance-of-stacked-nanosheet-transistors/)）【TCAD】。
- **sheet 间隙**：牺牲层间距从 20 nm 增到 70 nm，栅电阻降 34.6%，栅电容降 21.9%，fT 提高到 1.71 倍，fmax 提高到 1.96 倍（[Chang et al., SSE 2023](https://in4.iue.tuwien.ac.at/pdfs/sispad2022/TCAD-Based-RF-performance-prediction-and-process-optimizat_2023_Solid-State-.pdf)）【TCAD，已对实测校准，但器件尺寸大，fT 只有 5–20 GHz，只看趋势】。
- **S/D 外延厚度**：抬高的 S/D 从 10 nm 增到 30 nm，fT 和 fmax 大幅提高（全范围内 fT +268%、fmax +186%）；完全释放沟道能降低 Cgs/Cgd（同上）【TCAD】。
- **sheet 宽度**：Chang 的结果是沟道从 40 nm 加宽到 100 nm，fT 降 18%、fmax 降 31.5%，因为 Cgg 随宽度增加，而 S/D 串联电阻固定时 gm/W 下降（同上）。另一项亚 2 nm 的 TCAD 研究则显示加宽使 fT 提高约 40%、fmax 下降约 35%，双 k spacer 能同时提高两者（[Shen et al., Micromachines 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC12942810/)）【TCAD】。两者对 fT 的方向相反，对 fmax 的方向一致。【推断】差别可能来自 S/D 电阻假设不同：S/D 电阻一旦成为瓶颈，加宽对 fT 就没有帮助。
- **悬空区（suspension region）**：IBM 认为优化 sheet 悬空区对驱动电流和寄生电容的取舍至关重要（[Kim et al., IBM](https://research.ibm.com/publications/performance-trade-offs-in-finfet-and-gate-all-around-device-architectures-for-7nm-node-and-beyond)）【TCAD】。
- **量产平台的外电阻**：Intel 称 18A-P 的双接触使外电阻降低 20% (N)/12% (P)，驱动提高 5%/16%（[SemiWiki 2026](https://semiwiki.com/semiconductor-manufacturers/intel/372712-intel-18a-p-pushes-ribbonfet-and-backside-power-beyond-the-first-generation/)）【厂商】。

【推断】对 RF 和高速模拟的做法：宽度适中、多 finger、双边栅接触、尽量大的 S/D 接触面积。很宽的 sheet 在 S/D 电阻固定时反而伤害 fmax。imec、IBM、Samsung、TSMC N2 和 Intel 18A 的 nanosheet 实测 fT/fmax 都没有找到公开数据。

### 自热：BDI 的代价

- **BDI 加重自热**：在相同 DC 电流下，BDI 让晶格温度比 PTS"显著"升高，同时沟道应力降低 85%；接触面积更大的金属 S/D 能同时缓解温度和电阻问题（[Saleh et al., TED 2023](https://research.ajman.ac.ae/en/publications/impact-of-bottom-dielectric-isolation-of-si-stacked-nanosheet-tra/)）【TCAD】。
- **热阻数字**：在 −50 到 125 °C 下测量 3 层 GAA nanosheet，再对 3 nm 级 sheet（LG 16 nm、W 20 nm、T 6 nm）做热仿真，单个横向叠层的 ΔT_max 为 149 K，R_th 为 2.59 K/µW；横向叠层从 1 个增加到 2 个、4 个时，热串扰使每个叠层的 R_th 上升；更大的 S/D 接触面积有助于散热；作者建议把 PMOS 偏置在零温度系数（ZTC）点附近（[Zhao et al., Nanomaterials 2023](https://www.mdpi.com/2079-4991/13/22/2971)）【硅片·研究 + TCAD】。
- **量产平台**：Intel 称 18A-P 的叠层热阻比 18A 降低 20–40%（[Intel 18A brief 2026](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-06/foundry-18a-technology-brief.pdf)）【厂商】。

【推断】自热对模拟的影响有三点：
- g_ds 出现频率色散，DC 和 AC 增益不同。
- V_T(T) 漂移和失调漂移。
- 并排的匹配器件之间存在热耦合。

缓解手段包括：加大 finger 间距、增加 S/D 接触面积、在高电流密度模块中用后台校准，以及用脉冲 IV 测等温参数。

### 本征参数旋钮汇总

下表中，"+"表示改善，"−"表示变差，"?"表示没有公开数据。

| 旋钮 | 1/f / RTN | 失配 | DIBL / 增益 | fT / fmax | 自热 | 主要证据 |
|---|---|---|---|---|---|---|
| 可靠性退火（高压 D₂/H₂、PDA） | +（TFET 上约 4.8 倍） | ? | ? | ? | ? | 【硅片·研究】 |
| 更薄 EOT | + | +（A_VT ∝ t_ox【常识】） | + | ? | ? | 【硅片·研究】 |
| dipole 多 V_T（相对 WFM 厚度） | ?（BTI 显示乐观） | ? | ? | ? | ? | 【硅片·研究，BTI】 |
| 更小的 WFM 晶粒 | ? | +（9.6 → 3.8 mV） | ? | ? | ? | 【TCAD】 |
| 更多堆叠 sheet | +（面积，RTN 平均化） | +（WFV σV_T −40%） | ? | −（第 5 层起主要增加寄生【观点】） | −（热串扰） | 【TCAD】【观点】 |
| 更宽的 sheet | +（面积） | +（面积） | −（DIBL 增大） | fT 结论不一，fmax − | ? | 【TCAD】 |
| 更大的 sheet 间隙 | 很小 | ? | −（JICS：间距小增益高） | +（fT ×1.71） | ? | 【硅片·研究】【TCAD】 |
| BDI | +?（去掉寄生沟道【推断】） | +?（应力 LDE 变弱【推断】） | ? | +（fT +8%、fmax +13%） | −（显著升温） | 【TCAD】 |
| 金属侧壁 / 环绕 S/D 接触 | ? | ? | ? | + | + | 【TCAD】 |
| 更长的 Lg 或叠管 | +（面积） | +（面积） | + | − | ? | 【常识】 |

更多堆叠 sheet 那一行的寄生判断来自 imec 研究人员的观点：超过约 4 层后，第 5 层主要在增加寄生（[Semiconductor Engineering](https://semiengineering.com/what-designers-need-to-know-about-gaa/)）【观点】。

## 6. 器件与版图层面的实用清单

**先按模块选器件（核心、宽松 pitch、厚氧、叠管），再按"相同环境"原则做版图，最后用带内部节点的后仿和统计角落验证；在 nanosheet 中还要额外管住 sheet 宽度一致性、热耦合和寄生。**

要点：
- 匹配器件使用相同的 sheet 宽度、Lg、V_T 选项和朝向，阵列边缘加 dummy【推断】。
- 增益关键器件用窄或中等宽度的 sheet，配合长 Lg 或叠管；RF 器件用适中宽度、多 finger 和双边栅接触【推断，依据 §5 的 TCAD】。
- 叠管必须做带内部节点的寄生提取，业界给出的前后仿差异约 30%（[Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)）【观点】。
- 低噪声输入管：面积大、过驱动低、优先薄 EOT 核心器件，并配合 chopping（§4）。

### 按模块选器件

| 模块 | 推荐器件 / 结构 | 理由 | 证据 |
|---|---|---|---|
| 运放输入对 | 核心器件、中等反型、大 W·L（多 sheet 或叠管）；精密场合加 chopping | 1/f ∝ 1/(WL)，S_vg 随 V_ov 增大 | §4【硅片·研究】【推断】 |
| 电流源、电流镜 | 叠管（N = 2–8）或宽松 pitch 长 L 器件 | 高 r_o、好匹配、不需要额外偏置 | §1【推断】 |
| 信号通路 cascode | 独立偏置 cascode 或 gain boosting | 增益约 (gm·ro)²，输入管保持 Lmin | §2【常识】 |
| 基准、LDO、偏置 | 厚氧 I/O 器件或宽松 pitch 器件 | 电压余量；带隙基准接近电源电压，需要重新设计 | [Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)【观点】 |
| 比较器、动态放大器、ringamp | 核心器件 | 速度高，精度由校准或死区机制保证 | §2 |
| RF / 高速 | 核心器件、宽度适中、多 finger、双边栅接触 | fT/fmax 受寄生和 Rg 限制 | §5【TCAD】 |
| 采样开关 | 高 V_T 器件（漏电小）或自举开关 | droop 由漏电决定 | 【推断】 |

### 版图清单

1. **相同环境**：匹配器件使用相同的 sheet 宽度、Lg、V_T 选项和朝向。NanoFlex 允许一块芯片上有不同的 sheet 宽度（[IEEE Spectrum](https://spectrum.ieee.org/tsmc-n2)），但在一个匹配对内混用不同宽度会引入系统失配【推断】。
2. **dummy 与边缘**：阵列两端加 dummy 栅和 dummy sheet，处理 gate cut、扩散断、WPE 和应力等 LDE。叠管的端部单元靠近扩散断，与中间单元不同，两端都需要 dummy【推断】。
3. **共质心与交叉排布**：用来抵消梯度。两 finger 的匹配叠管不能共享扩散，要按列排布，漏在中心和源在中心两种方向交替（[EDN 2021](https://www.edn.com/all-about-stacked-mosfets-in-analog-layout/)）。
4. **叠管布局**：单 finger 叠管在一行内共享扩散，面积由 poly 最小间距决定；长链折成多行会增加互连和电容，所以尽量在一行内完成（[Cadence 博客](https://community.cadence.com/cadence_blogs_8/b/cic/posts/stacked-mosfets-in-analog-layout)）【观点】。
5. **栅电阻**：多 finger 器件两端都打栅接触，Rg 约降到单端接触的 1/4【常识】。
6. **S/D 接触**：接触面积尽量大，可以同时降低外电阻和自热（[Saleh 2023](https://research.ajman.ac.ae/en/publications/impact-of-bottom-dielectric-isolation-of-si-stacked-nanosheet-tra/)；[Zhao 2023](https://www.mdpi.com/2079-4991/13/22/2971)）【TCAD】。
7. **热**：高电流密度器件与匹配器件之间留出间距，大电流器件拆成多个分开的 finger，以减少热串扰（[Zhao 2023](https://www.mdpi.com/2079-4991/13/22/2971)）；热敏感的匹配对要放在热梯度对称的位置【推断】。
8. **规则化单元**：采用 foundry 提供的固定高度模拟单元和统一的 OD/poly，便于迁移和自动化（[SemiWiki, TSMC OIP](https://semiwiki.com/semiconductor-manufacturers/321960-tsmc-oip-analog-cell-migration/)）。
9. **验证**：后仿必不可少；用更多的 Monte Carlo、高 σ 和 ML 加速的统计验证（[Semiconductor Engineering](https://semiengineering.com/wrestling-with-analog-at-3nm)）【观点】。噪声用统计角落，不用单一 Kf【推断】。

### 一个最小的器件评估包

【推断】拿到一个新的 nanosheet PDK 时，可以先用下面这套最小评估，判断该把精力放在器件选型、叠管还是电路技巧上。

器件选项：
- 核心器件的 Lmin 和最长 Lg。
- 叠管 N = 1/2/4/8。
- 宽松 pitch 器件（若有）。
- 厚氧 I/O 器件。

对每个选项，在 gm/ID = 10 和 15 下列出 gm·ro、fT、A_VT 和 1 kHz 下的 S_VG·WL；再在目标电流密度下列出 R_th。

拿到这张表后：
- gm·ro 不够、余量又紧时，优先考虑 gain boosting 和 CLS（§2）。
- A_VT 和 S_VG·WL 不够时，优先考虑 chopping 和校准（§3），而不是继续加面积。

## 7. 公开资料的空白与可以向 PDK 或自有数据确认什么

**本报告最关键的数字（叠管增益随 N 的变化、量产 nanosheet 的 A_VT/Kf/gm/gds/fT/R_th、dipole 对噪声的影响）在公开文献中都没有；这些需要向 foundry PDK 或自有硅片数据确认。**

要点：
- 没有找到任何 IEDM/VLSI/TED/JSSC 公开论文，给出 FinFET 或 nanosheet 中 N 个 Lmin 叠管的 A_V0 或 r_o 随 N 的变化。
- 没有找到 TSMC N2、Samsung SF3/SF2、Intel 18A 公开的 A_VT、Aβ、Kf、gm/gds、fT/fmax 或 R_th；Intel 只有"失配系数低"的定性说法（[Intel 18A platform brief](https://www.intel.com/content/www/us/en/foundry/library/intel-18a-platform-brief.html)）。
- dipole、IL、氮化、氟、inner spacer、BDI、应变、SiGe 沟道对 nanosheet 1/f 和 RTN 的影响，公开数据要么没有，要么只有 BTI 的间接证据。
- 电路技巧在同一 GAA 节点、同一 VDD 下的横向对比没有公开资料；ringamp 的实测 FoM 本次也没有取到。

### 公开状态与可以确认的内容

| 问题 | 公开状态 | 需要向 foundry PDK 或自有硅片数据确认的内容 |
|---|---|---|
| 叠管与长 L 的对比 | 只有平面/SOI 数据和专利声明；FinFET/GAA 没有 | N = 1/2/4/8/16 叠管的 gm/gds–gm/ID、V_EA、DIBL；内部节点电压；与宽松 pitch 器件的对比；PDK 是否提供带专用模型的叠管 PCell |
| 叠管的模型 | 老一代模型误差可达 60%（[Dantas & de Sousa](https://sbmicro.org.br/sforum-eventos/sforum2008/43.pdf)）；BSIM-CMG 对叠管的处理没有公开资料 | 叠管 PCell 的模型验证报告；带内部节点的提取规则；前仿、后仿和硅片三者的对比 |
| 非均匀叠管 | 只有 FD-SOI 的 µm 级数据 | 同一扩散上混用 V_T 的规则和间距代价；混用 V_T 叠管的增益和匹配 |
| 量产 nanosheet 的失配 | 只有 TCAD（例如 A_VT ≈ 0.7 mV·µm，仅计 WFV） | 各 V_T 选项和 sheet 宽度的 A_VT、Aβ；线性区和饱和区的差别；dipole 型与 WFM 型的对比 |
| 量产 nanosheet 的 1/f 和 RTN | 只有 imec 研究器件 | 按选项（核心/I/O、LVT/HVT、n/p、sheet 宽度）给出的 S_VG·WL 或 N_OT；对数正态 σ；RTN 统计角落；退火条件对噪声的影响 |
| 本征增益 | 只有 imec 研究器件（约 46 dB） | 各 L 和 V_T 选项下 gm·ro 对 gm/ID 的曲线；DIBL 对 sheet 宽度的依赖 |
| fT/fmax 与寄生 | 只有 TCAD | Cgg、Cgd、Rg 和 fT/fmax 对 gm/ID 的曲线；sheet 宽度和 finger 数的 RF 优化窗口；RF 模型的频率上限 |
| 自热 | 只有 TCAD 和研究器件（R_th ≈ 2.59 K/µW） | 各器件选项的 R_th 和热时间常数；热串扰随间距的变化；自热对 g_ds 频率色散的影响；是否有自热相关的版图规则 |
| BDI 对模拟的整体影响 | RF 收益和自热代价都只有 TCAD | 有无 BDI 的工艺选项及其对噪声、匹配、R_th 的影响 |
| LDE | 只有 TSMC 的定性说法 | gate cut、扩散断、sheet 宽度过渡区对 V_T 和 I_D 的影响幅度；dummy 的最低要求 |
| 背面供电 | 只有厂商的压降和热阻声明 | 衬底隔离、guard ring 效果、电感 Q 值；背面供电对噪声耦合的影响 |
| 电路技巧在 GAA 上的实测 | 没有同节点、同 VDD 的横向对比 | 参考设计或 IP 中 gain boosting OTA、ringamp、动态放大器在该节点的实测指标 |

### 本报告依赖的推断

以下结论是推理得到的，第一时间值得用自有数据验证【推断】：
1. 叠管增益约为 N × 单管增益，在 N 较大时因余量和内部节点而提前饱和（§1）。
2. FinFET/GAA 没有 halo，所以叠管比同长度单管多出来的那部分增益会变小（§1）。
3. 降 BTI 的退火也能降 nanosheet 的 1/f 噪声；dipole 不会增加噪声（§4）。
4. 多 sheet 并联让 RTN 平均成高斯分布，器件间 σ 约按 1/√M 缩小（§4）。
5. 增益关键器件应选窄或中等宽度的 sheet；RF 器件不应选最宽的 sheet（§5）。

## Sources

**以下为本报告引用的公开来源，按主题分组。**

**串联叠管与 self-cascode**
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

**电路技巧**
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

**工艺平台与行业观点**
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

**Nanosheet 噪声与 RTN**
- [Asanovski et al. (imec), 1/f noise in nanosheet vs planar, arXiv 2609.08674](https://arxiv.org/html/2609.08674)
- [Simoen et al., LFN and analog of stacked nanosheets, JICS 2022](https://jics.org.br/ojs/index.php/JICS/article/download/617/399/2770)
- [Shin et al., high-pressure D2/H2 annealing and LFN, Sci. Rep. 2022](https://www.nature.com/articles/s41598-022-22575-5)
- [Yang et al., RTN reduction by HPD annealing in nanowire FET, Nanotechnology 2020](https://iopscience.iop.org/article/10.1088/1361-6528/ab9e90)
- [Franco et al., dipoles and thermal budget for BTI, EDTM 2019](https://www.iue.tuwien.ac.at/pdf/ib_2019/CP2019_Franco_1.pdf)
- [Chasin et al., time-dependent variability in GAA nanowires vs FinFET, 2017](https://www.iue.tuwien.ac.at/pdf/ib_2017/CP2017_Rzepa_02.pdf)
- [VLSI 2009, RTN in 15,000 nFETs](https://archive.vlsisymposium.org/09web/technology/tec_abstract/3B-3.htm)
- [Arimura et al., dipole-first gate stack for nanosheet/CFET, IEDM 2021](https://imec-publications.be/entities/publication/639ca126-058f-4dd5-9cf3-a0ec41579acf/full)
- [IBM, dual dipoles for multi-Vt in FinFET and nanosheet](https://research.ibm.com/publications/selective-enablement-of-dual-dipoles-for-near-bandedge-multi-vt-solution-in-high-performance-finfet-and-nanosheet-technologies)

**失配、DIBL、fT 与自热**
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

# 术语表

## 基础指标

### gm（跨导）

**一句话：** 栅压变一点，漏电流跟着变多少：ΔID/ΔVGS，单位 S。

- **实际含义：** gm = ∂ID/∂VGS，在固定 VDS 的偏置点上取。它是晶体管把输入电压信号转换成输出电流信号的“放大倍率”。
- **表征什么：** 器件对输入信号的响应强度，决定放大器的增益、带宽和输入参考噪声。
- **数值越大 / 越小：** 越大越好：同样电流下 gm 越大，增益越高、速度越快、折算到输入的噪声越小。但 gm 本身随电流上升，所以单看 gm 没有意义，要看 gm/ID。
- **打个比方：** 像水龙头的灵敏度：把手转一点点，水流变化多少。灵敏的龙头 gm 大。
- **怎么测：** 扫 ID–VGS 曲线后对 VGS 求导；高频下用 S 参数转 Y 参数，取 Re(Y21)。求导会放大噪声，要平滑或用细步长、多次平均。

### gm/ID（跨导效率）

**一句话：** 每 1 A 电流能换来多少 gm，单位 S/A 或 1/V。模拟设计的“油耗”指标。

- **实际含义：** gm 除以漏电流 ID。它只取决于器件处于哪个反型程度，和 W 基本无关，所以能把不同尺寸的器件放在同一张图上比较。
- **表征什么：** 偏置点的位置：弱反型、中等反型还是强反型；也就是功耗效率和速度之间的取舍。
- **数值越大 / 越小：** 越大越省电：约 25–35 S/A 时在弱反型区，效率最高但速度慢；约 5 S/A 以下在强反型区，速度快但费电。常用的折中在 10–15 S/A。理论上限约为 1/(n·kT/q)，室温下大约 30–40 S/A。
- **打个比方：** 像汽车的油耗：同样一升油（电流）跑多远（gm）。低速档省油但慢，高速档快但费油。
- **怎么测：** 从 ID–VGS 扫描计算 gm 再除以 ID，画 gm/ID 对 ID/(W/L) 的曲线；每个 L 一条。Murmann 的 gm/ID 工具包可直接在开源 PDK 上生成。
- **典型数值：** 【常识】弱反型上限约 1/(n·UT)，n≈1.2–1.5，UT≈26 mV。

### 反型系数 IC 与弱/中等/强反型

**一句话：** 把偏置点归一化的刻度：IC<0.1 弱反型，0.1–10 中等反型，>10 强反型。

- **实际含义：** IC = ID / (I_spec·W/L)，I_spec 是工艺相关的特征电流（EKV 模型）。它衡量沟道里反型电荷有多“满”。
- **表征什么：** 器件工作在哪种导电机制：弱反型以扩散电流为主（指数关系），强反型以漂移电流为主（平方律或速度饱和）。
- **数值越大 / 越小：** IC 越小，gm/ID 越高但 fT 越低、器件越大；IC 越大则相反。最佳折中通常在中等反型。
- **打个比方：** 像水管的开度：开一条缝（弱反型）水流细但每份压力都用得很省；全开（强反型）流量大但浪费也大。
- **怎么测：** 从 gm/ID–ID 曲线拟合出 I_spec 和斜率因子 n，再换算 IC。

### fT（特征频率）

**一句话：** 电流增益降到 1 时的频率，≈ gm/(2π·Cgg)；衡量器件本征速度。

- **实际含义：** 短路电流增益 |h21| 等于 1 时的频率。近似为 gm 除以 2π 倍的总栅电容 Cgg。
- **表征什么：** 器件“推得动”自己栅电容的能力，即本征带宽。
- **数值越大 / 越小：** 越大越快。但 fT 随 gm/ID 下降而上升，所以要说“在某个 gm/ID 下的 fT”才有可比性。电路实际可用带宽通常只有 fT 的十分之一左右。
- **打个比方：** 像一个人能多快把自己的行李搬上车：力气（gm）大、行李（电容）轻，就快。
- **怎么测：** 片上 S 参数测量（去嵌入焊盘和走线后）转 h21，外推到 0 dB；或用 DC 的 gm 加 CV 测的 Cgg 估算。
- **典型数值：** 14 nm FinFET 报道的 fT 约 314/285 GHz（n/p），见指南 §3。

### fmax（最高振荡频率）

**一句话：** 功率增益降到 1 的频率；比 fT 更受栅电阻和 Cgd 影响。

- **实际含义：** 单向功率增益（Mason U）等于 1 时的频率，是器件还能做功率放大的最高频率。
- **表征什么：** 射频能力，同时反映栅电阻 Rg、Cgd 和输出电导这些寄生。
- **数值越大 / 越小：** 越大越适合射频。fmax 远低于 fT 通常说明栅电阻太大，GAA 的多层金属栅要特别注意这一点。
- **打个比方：** fT 是发动机转速，fmax 是车真正跑出来的速度；传动（栅电阻）漏得多，再高转速也白搭。
- **怎么测：** S 参数计算 Mason U 或 MAG，外推到 0 dB。版图上双侧栅接触能明显改善。

### Cgg / Cgd（栅电容）

**一句话：** Cgg 是栅极看进去的总电容；Cgd 是栅到漏的跨接电容，会被 Miller 效应放大。

- **实际含义：** Cgg = Cgs + Cgd + Cgb（含本征和寄生部分）。Cgd 跨接在输入和输出之间。
- **表征什么：** 驱动这个器件要付出的“负载”，决定速度和功耗；Cgd 还决定反馈和稳定性。
- **数值越大 / 越小：** 越小越好。Cgd/Cgg 比值高说明寄生占比大，fT 和 fmax 都会受损；GAA 的内侧墙和栅到源漏电容是重点。
- **打个比方：** 像推车上的货：Cgg 是总重量，Cgd 是一根把你和后面车厢连起来的绳子，你一动它反拽你。
- **怎么测：** CV 测量（分离 Cgs/Cgd 需要分端口连接），或从 S 参数转 Y 参数取虚部。

### VT（阈值电压）

**一句话：** 器件开始导通的栅压；模拟里更关心它的失配和随温度、应力的漂移。

- **实际含义：** 沟道表面形成反型层所需的栅压，常用恒流法或最大跨导外推法定义。
- **表征什么：** 开关点和偏置点的位置，以及多 VT 选项带来的设计自由度。
- **数值越大 / 越小：** 对模拟而言绝对值不是关键，关键是两个“相同”器件之间的 ΔVT（失配）越小越好，以及 VT 随温度变化可预测。低 VT 给更多电压裕量但漏电大。
- **打个比方：** 像门槛高度：门槛高低本身好商量，但一对双胞胎门槛高度不一样，就是麻烦。
- **怎么测：** ID–VGS 扫描后用恒流法或 gm 最大点线性外推法提取；失配需要成对器件统计。

### SS（亚阈值摆幅）

**一句话：** 亚阈值区电流增大 10 倍需要的栅压，室温极限约 60 mV/dec。

- **实际含义：** SS = dVGS/d(log10 ID)，在弱反型区量。
- **表征什么：** 栅极静电控制的好坏，也直接对应弱反型 gm/ID 的上限。
- **数值越大 / 越小：** 越小越好，越接近 60 mV/dec 越理想；SS 小 → 弱反型 gm/ID 高 → 低功耗模拟更有利。GAA 报道约 65 mV/dec。
- **打个比方：** 像音量旋钮的灵敏度：转一格就让声音大十倍，转的角度越小越灵。
- **怎么测：** ID–VGS 半对数图上取亚阈值段斜率的倒数。

### ZTC（零温度系数点）

**一句话：** 某个栅压下，电流几乎不随温度变化；可用作温度稳定的偏置点。

- **实际含义：** 温度升高时 VT 下降（电流增加）而迁移率下降（电流减少），两者抵消的那个 VGS。
- **表征什么：** 器件温度敏感性的平衡点。
- **数值越大 / 越小：** 偏置在 ZTC 附近，电流随温度变化最小；远离它则温漂大。imec 的 nanosheet 数据显示 25–200 °C 存在清晰的 ZTC。
- **打个比方：** 像一杯冷热各半的水：一边升温一边降温，刚好温度不变。
- **怎么测：** 多个温度下测 ID–VGS，找各曲线的交点。

### Ion/Ioff 与 CV/I（逻辑指标）

**一句话：** 逻辑器件的核心指标：开态电流、关态漏电和门延迟；模拟器件不以它们为主。

- **实际含义：** Ion 是 VGS=VDS=VDD 时的电流，Ioff 是 VGS=0 时的漏电，CV/I 近似一级门延迟。
- **表征什么：** 大信号开关的速度和静态功耗。
- **数值越大 / 越小：** Ion 越大越快，Ioff 越小越省电。但模拟器件工作在偏置点的小信号区，这两个数很少直接决定模拟性能。
- **打个比方：** 逻辑器件是电灯开关，只关心开得快、关得严；模拟器件是调光旋钮，关心中间每一档有多稳。
- **怎么测：** 在 VDD 下测 ID–VGS 端点；CV/I 用环形振荡器或 Ieff 估算。

## 增益与输出

### DIBL（漏致势垒降低）

**一句话：** 漏压升高把源端势垒“压低”，VT 随 VDS 下降；单位 mV/V。

- **实际含义：** 短沟道里漏极电场穿透到源端，降低载流子注入势垒。用 ΔVT/ΔVDS 量化。
- **表征什么：** 栅对沟道的控制力有多强，也是输出电导 gds 的主要来源之一。
- **数值越大 / 越小：** 越小越好。DIBL 大意味着漏压会“插手”电流，gds 变大、本征增益变低。FinFET 和 GAA 的 DIBL 明显低于平面器件，这是它们增益更高的原因。
- **打个比方：** 像隔壁房间太吵：本该只听老师（栅）的话，结果被窗外（漏）的声音带偏。
- **怎么测：** 在低 VDS 和高 VDS 下各提一次 VT，相减除以 VDS 差。
- **典型数值：** 45 nm 级 FinFET 原型报道 DIBL 约 46/44 mV/V，见指南 §1。

### gds 与 ro（输出电导与输出电阻）

**一句话：** 漏压变一点，电流跟着变多少：∂ID/∂VDS；倒数 ro 是输出电阻。

- **实际含义：** 饱和区里理想器件的电流不随 VDS 变，实际会因为沟道长度调制和 DIBL 缓慢上升，这个斜率就是 gds。
- **表征什么：** 器件作为电流源有多“硬”。
- **数值越大 / 越小：** gds 越小（ro 越大）越好：电流源越理想，放大器增益越高。gds 随 L 加长而变小，这就是模拟喜欢长沟道的原因。
- **打个比方：** 像一根软管接水龙头：管子越硬，下游压力怎么变流量都不变；管子软，压力一变流量就跟着变。
- **怎么测：** ID–VDS 扫描后对 VDS 求导。要注意自热会让 DC 测的 gds 偏小甚至为负，高频下要用 S 参数（Re(Y22)）测。

### gm/gds（本征增益）

**一句话：** 单个晶体管能给出的最大电压增益：gm 乘 ro，常用 dB 表示。

- **实际含义：** 把输入电压变成电流（gm），再由自己的输出电阻（ro）变回电压，两者相乘就是一个器件在理想负载下的电压放大倍数。
- **表征什么：** 器件作为放大器的“天花板”，决定一级放大最多能放大多少倍、需要几级或要不要 cascode。
- **数值越大 / 越小：** 越大越好。20 倍约 26 dB，100 倍为 40 dB。它随 L 增大、随 gm/ID 增大而上升。从平面到 FinFET 本征增益提高约 2–10 倍；imec 研究用 nanosheet 约 46 dB（≈200 倍）。
- **打个比方：** 像杠杆：gm 是你使的力能撬动多少，ro 是支点有多稳；支点一晃（ro 小），力气再大也撬不起来。
- **怎么测：** 同一偏置下分别提取 gm（ID–VGS）和 gds（ID–VDS）相除；画 gm/gds 对 gm/ID、每个 L 一条曲线。高频下用 Y21/Y22 避开自热。
- **典型数值：** Intel 22FFL 模拟器件 GM×Rout 47/54/60；GF 14 nm FinFET 约 40/34（n/p）；见指南 §3。

### VEA（Early 电压）

**一句话：** ID/gds，单位 V；把输出电阻折算成一个电压，越大越像理想电流源。

- **实际含义：** 饱和区 ID–VDS 曲线向负 VDS 方向外推与横轴相交处的电压绝对值，等于 ID/gds。
- **表征什么：** 与电流无关的输出电阻品质；本征增益 ≈ (gm/ID)·VEA。
- **数值越大 / 越小：** 越大越好，并大致与 L 成正比（常用 VEA/L 表示单位长度的 Early 电压）。imec nanosheet 研究器件报道约 30 V。
- **打个比方：** 像弹簧的硬度系数：把输出电阻这件事换成一个和电流大小无关的数，便于比较。
- **怎么测：** VEA = ID/gds，在指定 VDS 和过驱动下取；也可用外推法。

### CLM（沟道长度调制）

**一句话：** VDS 增大时夹断点向源端移动，有效沟道变短，电流上升。

- **实际含义：** 饱和区夹断区随 VDS 变宽，有效 L 变短。
- **表征什么：** 输出电导 gds 的经典来源之一（另一个是 DIBL）。
- **数值越大 / 越小：** 影响越小越好；L 越长，同样的夹断长度变化占比越小，所以长沟道 gds 小。
- **打个比方：** 像排队：队尾（漏端）被挤掉几个人，长队几乎没感觉，短队就明显变短。
- **怎么测：** 通过不同 L 的 gds 对比分离 CLM 与 DIBL 的贡献。

### Halo / pocket 注入

**一句话：** 在源漏两端打的高掺杂“口袋”，抑制短沟道效应，但伤害长沟道模拟器件的输出电阻。

- **实际含义：** 逻辑工艺为控制最小 L 器件的 VT 滚降而加的倾斜注入。
- **表征什么：** 逻辑优化与模拟需求冲突的典型例子。
- **数值越大 / 越小：** 对模拟：halo 越重，长器件的 gds 越大、出现长沟道 DIBL 和反向短沟道效应，本征增益降低。FinFET/GAA 的无掺杂沟道基本不再依赖 halo。
- **打个比方：** 像为了防短跑选手抢跑在起点加的护栏，对长跑选手反而是绊脚石。
- **怎么测：** 比较有无 halo 或不同 L 下的 VT–L 和 gds–L 曲线。

### 电压裕量（headroom）

**一句话：** 电源电压里扣掉每个器件维持饱和所需的电压后，留给信号摆动的空间。

- **实际含义：** 每个堆叠的器件都要至少 VDS,sat（≈过驱动电压）才能保持饱和。
- **表征什么：** 能堆几层 cascode、信号能摆多大。
- **数值越大 / 越小：** 越大越好。先进节点 VDD 不到 1 V，裕量很紧，cascode 和叠栅都受限，所以模拟常借用电压更高的 I/O 器件。
- **打个比方：** 像一层楼的净高：每层楼板（器件）都占高度，楼板越多留给人（信号）的空间越小。
- **怎么测：** 从 ID–VDS 找饱和点，或由 gm/ID 估算 VDS,sat ≈ 2/(gm/ID)。

## 噪声

### Flicker noise（1/f 噪声，闪烁噪声）

**一句话：** 低频噪声，功率谱按 1/f 规律分布，频率越低噪声越大；来自栅氧中陷阱随机抓放载流子。

- **实际含义：** 电流里一种低频“抖动”，频率越低越强。主流解释是栅介质里的陷阱抓住、放掉沟道载流子，让载流子数目（以及迁移率）随机起伏。
- **表征什么：** 栅介质和界面的质量（陷阱密度），以及对低频精密电路（基准、传感器、ADC、VCO 相位噪声）的影响。
- **数值越大 / 越小：** 越小越好。常用归一化值 SVG·W·L（V²·µm²/Hz）比较不同器件。面积越大噪声越小（与 1/(WL) 成正比）。GF 14 nm FinFET 为 17/35，28 nm 平面为 171/106 fV²·µm²/Hz（n/p）；imec 测得 nanosheet 与同栅叠层的平面器件相当。
- **打个比方：** 像收音机的嗡嗡低频杂音：信号越慢（低频），杂音越显眼；它不是电路坏了，是材料里“小陷阱”在随机开关。
- **怎么测：** 低频噪声分析仪（如 Keysight E4727A/B）配参数分析仪，片上测 SID（A²/Hz），常在 10 Hz–1 kHz、低 VDS 下测，多个器件做统计；用 SID/ID² 对 (gm/ID)² 的关系判断机制。
- **典型数值：** 见指南 §4 的噪声数据表。

### SID / SVG（噪声功率谱密度）

**一句话：** SID 是漏电流噪声谱（A²/Hz），SVG = SID/gm² 是折算到栅极的电压噪声谱（V²/Hz）。

- **实际含义：** 把噪声按频率分解后每赫兹的功率。折算到栅极后，可以直接和输入信号比大小。
- **表征什么：** 器件本身有多“吵”，以及它对输入端精度的影响。
- **数值越大 / 越小：** 越小越好。乘以面积 W·L 得到与尺寸无关的归一化值，才能跨工艺比较；√SVG 的单位是 V/√Hz。
- **打个比方：** 像称体重时秤上的晃动：SID 是秤读数的晃，SVG 是换算成“你身上多了多少斤”的晃。
- **怎么测：** 用低噪声放大器和 FFT/频谱分析测 SID，再除以同一偏置下的 gm²。

### ΔN 与 Δμ 模型（McWhorter 与 Hooge）

**一句话：** 1/f 噪声的两种解释：载流子数目涨落（陷阱，McWhorter）或迁移率涨落（Hooge）。

- **实际含义：** ΔN 模型认为陷阱抓放改变载流子数；Δμ 模型认为晶格散射让迁移率起伏；相关 ΔN–Δμ 模型把两者结合。
- **表征什么：** 噪声的物理来源，决定该改栅介质还是改沟道。
- **数值越大 / 越小：** 诊断方法：SID/ID² 曲线形状跟着 (gm/ID)² 走 → ΔN 主导；随 1/ID 下降 → Δμ 主导。先进节点 nMOS 多数是 ΔN 主导，pMOS 常需要相关项。
- **打个比方：** 像判断车流慢是因为车少（数目）还是因为每辆车走走停停（迁移率）。
- **怎么测：** 测一组 ID 下的 SID，画 SID/ID² 与 (gm/ID)² 对比；从 √SVG–VGT 直线的截距和斜率提取陷阱密度和散射系数。

### 陷阱密度 N_OT / N_BT

**一句话：** 栅介质中能抓放沟道载流子的缺陷密度，单位 cm⁻³·eV⁻¹；1/f 噪声的根源。

- **实际含义：** 距离界面约 1–3 nm 内、能量接近费米能级的介质缺陷（边界陷阱）。
- **表征什么：** 栅叠层（界面层、high-k、功函数金属）的工艺质量。
- **数值越大 / 越小：** 越低越好。它决定 1/f 噪声水平，也和 BTI 可靠性相关；换功函数金属会改变它。
- **打个比方：** 像路面上的坑：坑越多，车流（载流子）越容易被卡一下又放走。
- **怎么测：** 由 1/f 噪声在 ΔN 模型下反推；也可用电荷泵等方法。

### RTN（随机电报噪声）

**一句话：** 小器件里单个陷阱抓放造成的电流两态跳变；面积越小越明显。

- **实际含义：** 大器件里成千上万个陷阱叠加成平滑的 1/f；小器件里只有几个陷阱，就看得到一个个离散的跳变。
- **表征什么：** 器件到器件的噪声差异和偶发的大 ΔVT，是统计问题。
- **数值越大 / 越小：** 幅度越小、出现器件比例越低越好。20 nm 栅长下有报道 ΔVth 超过 70 mV 的尾部；它会让“同样设计”的两个器件噪声差很多。
- **打个比方：** 像大合唱里某人偶尔咳嗽：人多时听不出来，只剩三个人唱时就非常明显。
- **怎么测：** 时域测电流跳变，统计幅度和时间常数；大量器件做统计分布。

### 热噪声与 γ

**一句话：** 沟道电阻里电子热运动产生的白噪声，SID = 4kT·γ·gm；γ 越大越吵。

- **实际含义：** 与频率无关的噪声底。长沟道理论 γ = 2/3，短沟道器件会更大。
- **表征什么：** 高频和宽带电路（LNA、高速 ADC）的噪声底。
- **数值越大 / 越小：** γ 越小越好；输入参考热噪声 ≈ 4kT·γ/gm，所以 gm 越大噪声越小。
- **打个比方：** 像一杯热水分子的乱动：温度在，就一直有，和频率无关。
- **怎么测：** 高频噪声参数测量（噪声源 + 调谐器），得 NFmin、Rn 等；低频下被 1/f 噪声掩盖。

### 1/f 转角频率

**一句话：** 1/f 噪声与热噪声相等的频率；低于它 1/f 主导。

- **实际含义：** 噪声谱从 1/f 斜线变平的拐点。
- **表征什么：** 哪个频段该担心 1/f。
- **数值越大 / 越小：** 越低越好；先进节点常在 MHz 量级，意味着很多“中频”电路也受 1/f 影响。
- **打个比方：** 像海浪和风声：低频的浪声大，高频只剩风声，两者一样响的地方就是转角。
- **怎么测：** 在同一张噪声谱上找交点。

### NFmin（最小噪声系数）

**一句话：** 器件在最佳源阻抗下的最小噪声系数，射频低噪放大器的关键指标，单位 dB。

- **实际含义：** 输入信噪比与输出信噪比之比（dB），在最优匹配下取最小值。
- **表征什么：** 器件给信号加了多少噪声。
- **数值越大 / 越小：** 越小越好；0 dB 表示不加噪声。受 gm、γ、栅电阻影响。
- **打个比方：** 像复印机：每印一次，画面多少会变脏一点，NFmin 就是“最少会脏多少”。
- **怎么测：** 片上噪声参数测试系统，多阻抗点拟合。

## 匹配与版图

### 失配（mismatch）

**一句话：** 两个设计完全相同的器件，实际参数的随机差异；精密模拟电路的主要误差来源。

- **实际含义：** 包括随机失配（掺杂、金属晶粒、线边粗糙度等）和系统失配（应力、梯度、版图环境不同）。
- **表征什么：** 差分对失调、电流镜精度、DAC/ADC 线性度的极限。
- **数值越大 / 越小：** 越小越好；随机部分随 1/√(WL) 减小，靠加面积换；系统部分不随面积下降，要靠版图对称。
- **打个比方：** 像双胞胎的差别：基因一样（设计相同），还是会有细微不同；如果一个住在阳面一个住在阴面（版图环境不同），差别更大。
- **怎么测：** 成对器件阵列测 ΔVT、Δβ/β，统计标准差；用 Kelvin 连接避免串联电阻误差。

### Pelgrom 定律

**一句话：** 失配的标准差与器件面积的平方根成反比：σ(ΔVT) = AVT/√(WL)。

- **实际含义：** 1989 年 Pelgrom 提出的经验模型，描述随机失配随面积和距离的变化。
- **表征什么：** 精度和面积之间的换算关系。
- **数值越大 / 越小：** 面积变 4 倍，失配只降一半，所以靠加面积提精度很“贵”。
- **打个比方：** 像抛硬币：抛得越多（面积越大），正反比例越接近一半，但要误差减半得多抛 4 倍。
- **怎么测：** 用多种 W×L 的成对器件测 σ(ΔVT)，对 1/√(WL) 作图，斜率就是 AVT。

### AVT / Aβ（匹配系数）

**一句话：** Pelgrom 图的斜率：AVT（mV·µm）衡量 VT 失配，Aβ（%·µm）衡量电流因子失配。

- **实际含义：** σ(ΔVT) = AVT/√(WL)；σ(Δβ/β) = Aβ/√(WL)。
- **表征什么：** 一个工艺“天生”的匹配能力，与设计无关。
- **数值越大 / 越小：** 越小越好。65 nm 约 3.5 mV·µm；FinFET 早期报道约为体硅的一半；先进节点常听说的 1–2 mV·µm 没找到可核实的公开来源。
- **打个比方：** 像一台机床的加工公差：同样的图纸，公差小的机床做出的零件更一致。
- **怎么测：** Pelgrom 图拟合；需要大样本（通常上百对）和 Kelvin 连接。
- **典型数值：** 见指南 §4 的匹配系数表。

### LDE（版图相关效应：WPE、LOD、OSE）

**一句话：** 器件参数随它周围的版图环境变化：离阱边多远、有源区多长、邻居间距多大。

- **实际含义：** WPE：注入在阱边散射，VT 变；LOD/STI 应力：有源区长度改变应力，迁移率变；OSE：有源区间距影响应力。
- **表征什么：** 系统失配和模型误差的主要来源。
- **数值越大 / 越小：** 效应越小、越可预测越好。WPE 报道 VT 偏移可达几到几十 mV；要求匹配器件的“邻居环境”完全一致。
- **打个比方：** 像房子的价格不只看户型，还看楼层、朝向和邻居。
- **怎么测：** 专用测试结构：同一器件放在离阱边/有源区端不同距离处，测 VT 和 ID 变化；PDK 中以 LDE 参数进入模型。

### 共质心与交叉指状版图

**一句话：** 把匹配器件拆成单元交错摆放，让工艺梯度对两边的影响抵消；两端加伪器件保证环境一致。

- **实际含义：** ABBA、ABAB 等排布，使两器件的“重心”重合。
- **表征什么：** 对系统失配（梯度、LDE）的版图对策。
- **数值越大 / 越小：** 不是数值指标；效果体现为匹配对的平均偏移接近零。FinFET 下受鳍和栅距离散化限制。
- **打个比方：** 像两个人分一块斜着烤焦的饼：交错切块分，两人吃到的焦边一样多。
- **怎么测：** 对比共质心与非共质心摆法的平均 ΔVT。

## 长沟道替代方案

### 叠栅 / 串联器件（stacked gates）

**一句话：** 把多个最小栅长器件串起来，当作一个长沟道器件用。

- **实际含义：** 先进节点只允许固定栅长和栅距，设计者把 N 个器件的栅连在一起、源漏串联，等效于 L 变成约 N 倍。
- **表征什么：** 在没有真长沟道器件时提高 ro 和匹配的办法。
- **数值越大 / 越小：** 串得越多，gds 越小、匹配越好，但内部节点电容、面积和寄生增加，版图后仿真结果常和版图前不一致。目前没有找到与单个长 L 器件的公开定量对比。
- **打个比方：** 像用几段短绳子接成一根长绳：能用，但每个接头都会多一点松动和重量。
- **怎么测：** 同一偏置下比较叠栅与单器件的 gm/ID、gm/gds、AVT、1/f 噪声和 Cgg；需要专门测试结构和后仿真对照。

### Cascode 与 gain boosting

**一句话：** 在器件上再叠一个器件屏蔽漏压变化，输出电阻乘上约 gm·ro 倍；gain boosting 再用一个辅助放大器，把输出电阻再乘上该放大器的增益。

- **实际含义：** 电路级手段：上面的器件把下面器件的漏压“钉住”，于是下面器件的 gds 影响变小。
- **表征什么：** 用电路换回器件本征增益的不足。
- **数值越大 / 越小：** 增益可以提高一个数量级以上，代价是要多占电压裕量和极点。
- **打个比方：** 像在门外再加一道门：外面再吵，里面也安静了。
- **怎么测：** 在电路测试结构上测输出电阻和增益；器件层面看每个器件的 gm/gds 和 VDS,sat。

### 厚氧 I/O 器件

**一句话：** 为接口电压设计的厚栅氧、长栅器件，常被模拟借用来获得更高电压和增益。

- **实际含义：** 工作在 1.2–1.8 V 等较高电压，栅长比核心逻辑器件长。
- **表征什么：** 在先进节点里为模拟提供裕量和输出电阻的“老办法”。
- **数值越大 / 越小：** 优点是裕量大、gds 小；缺点是速度慢、面积大、1/f 和匹配不一定更好。Intel 22FFL 的厚氧器件 Lg 为 90/120/160 nm，逻辑器件为 74 nm。
- **打个比方：** 像在一辆跑车（核心器件）之外，车库里还停着一辆皮卡（I/O 器件）：慢，但能拉重货。
- **怎么测：** 与核心器件同样的 gm/ID、gm/gds、噪声、匹配表征。

## GAA 与前沿

### Nanosheet / GAA（全环绕栅）

**一句话：** 把沟道做成几层水平的薄片，栅从四面包住；栅控更强，宽度可以按片宽调。

- **实际含义：** FinFET 之后的晶体管结构（Intel 叫 RibbonFET，Samsung 叫 MBCFET）。
- **表征什么：** 先进节点模拟器件的“底座”：静电更好，但寄生、热和无源器件更难。
- **数值越大 / 越小：** 不是单一数值。对模拟：DIBL、SS 更好 → 本征增益更高；1/f 噪声在相同栅叠层下与平面相当；寄生电容、栅电阻和自热是新问题。
- **打个比方：** FinFET 是三面夹住的吸管，nanosheet 是被手掌整个握住的几片饼干：握得更牢，但中间的热散不出去。
- **怎么测：** 与 FinFET 相同的一整套表征，外加自热、sheet 间差异和底部寄生沟道的专门测试。

### Sheet 宽度与宽度量化（NanoFlex 等）

**一句话：** FinFET 的宽度只能按鳍数整数变；nanosheet 可以调片宽，但量产工艺只给一个离散菜单。

- **实际含义：** 例如 TSMC N2 的 NanoFlex 可用“1.5 鳍”这样的分数档，Intel 18A 提供 W1、W1.5、W2、W3、W3P。
- **表征什么：** 器件尺寸的设计自由度，影响电流比例、匹配和面积。
- **数值越大 / 越小：** 选项越多越灵活。片越宽电流越大，但自热和层间温差也越大。
- **打个比方：** 像衣服从只有 S/M/L（鳍数）变成多了半码（分数宽度），但还不是量身定做。
- **怎么测：** 对每个宽度档做 gm/ID、匹配和噪声表征。

### BDI（底部介质隔离）

**一句话：** 在 nanosheet 最底下垫一层介质，切断片下方的寄生沟道和衬底耦合。

- **实际含义：** 替代或补充 punch-through stopper 注入的结构，把有源片与衬底隔开。
- **表征什么：** 漏电、寄生电容、衬底噪声隔离的好坏。
- **数值越大 / 越小：** 有 BDI 时关态漏电和 DIBL 更低（IBM 报道功耗降 18%），衬底噪声耦合更小；代价是工艺更复杂，散热略差。
- **打个比方：** 像在楼板下加一层隔音垫：楼下的噪声（衬底）传不上来，但地板也更“闷热”。
- **怎么测：** 比较有无 BDI 的漏电、Cgg、S 参数耦合。

### 自热（self-heating）与热阻 Rth

**一句话：** 器件自己发的热散不出去，沟道温度高于环境，导致电流下降和 gds 测量失真。

- **实际含义：** 功耗 × 热阻 = 温升。3D 结构（鳍、堆叠片）、低热导率的介质和减薄衬底都让热阻上升。
- **表征什么：** 器件的散热能力，影响可靠性、模型准确性和匹配（温度梯度）。
- **数值越大 / 越小：** 热阻越小越好。FinFET 热时间常数约 100 ns、电流可掉约 10%；nanosheet 小于 10 nm 栅长时温升可超过 100 K；背面供电的峰值温度高约 14 °C（仿真）。
- **打个比方：** 像穿羽绒服跑步：跑得越快越热，衣服越厚（热阻大）越散不掉。
- **怎么测：** 栅电阻测温（四端栅结构）、RF 法（gds 随频率的变化）、脉冲 IV；DC 与 AC 的 gds 差别就是自热的信号。

### BSPDN（背面供电）

**一句话：** 把电源线移到晶圆背面，正面只走信号；需要把衬底几乎全部去掉。

- **实际含义：** Intel 叫 PowerVia，TSMC 叫 Super Power Rail。正面布线空间更多，电源压降更小。
- **表征什么：** 对模拟：电源更干净，但衬底、guard ring、散热和无源器件环境全变了。
- **数值越大 / 越小：** 厂商报道最坏情况压降降约 10 倍、MIM 电容 397 fF/µm²；但衬底隔离、电感 Q 值等没有公开数据。
- **打个比方：** 像把楼里的水管从天花板改到地下室：楼上空间宽敞了，但地基被挖空，老的接地方式要重做。
- **怎么测：** 对比正面/背面供电下的噪声耦合、热阻、ESD 和无源器件参数。

### Forksheet 与 CFET

**一句话：** GAA 之后的路线：forksheet 用介质墙把 n/p 紧贴；CFET 把 n 和 p 上下叠起来。

- **实际含义：** 都是为了继续缩小标准单元高度。imec 计划 forksheet 用于 A10，CFET 从 A7 开始。
- **表征什么：** 未来模拟器件面临的结构变化。
- **数值越大 / 越小：** 目前没有公开的模拟数据；预期寄生和热会更难，器件形态更受限。
- **打个比方：** forksheet 像中间加隔墙的双人床，CFET 像上下铺。
- **怎么测：** 待有硅片后，沿用 GAA 的表征集。

## 量测与模型

### S 参数与去嵌入

**一句话：** 用矢量网络分析仪测器件的高频反射和传输，扣掉焊盘和走线后得到器件本身的参数。

- **实际含义：** S 参数可换算成 Y/Z/h 参数，从中提 gm、gds、Cgg、fT、fmax。
- **表征什么：** 高频小信号行为，以及不受自热影响的 gds。
- **数值越大 / 越小：** 不是指标本身；去嵌入做得越好，提取越准。
- **打个比方：** 像称一只猫：先抱着猫称，再单独称自己，相减才是猫的重量（去嵌入）。
- **怎么测：** 片上 GSG 探针 + VNA，配 open/short 等去嵌入结构。

### Kelvin 连接（四端测量）

**一句话：** 电流和电压用不同的引线，避免引线电阻上的压降污染测量。

- **实际含义：** force 线送电流，sense 线测电压。
- **表征什么：** 精密测量的可靠性，尤其是失配和大电流器件。
- **数值越大 / 越小：** 不是指标；没有 Kelvin，串联电阻会伪装成失配。
- **打个比方：** 像量体温时把温度计直接放在舌下，而不是隔着衣服。
- **怎么测：** 测试结构里给栅和漏各引出 force/sense 两路。

### PDK 与 BSIM-CMG

**一句话：** PDK 是工艺给设计者的器件模型和规则包；BSIM-CMG 是 FinFET/GAA 的标准紧凑模型。

- **实际含义：** 包含器件模型、角模型、失配模型、LDE 参数、版图规则和器件特性报告。
- **表征什么：** 设计者能“看见”的器件；模型不准，设计就不准。
- **数值越大 / 越小：** 不是数值；关键是模型对 gm/ID、gds、噪声、失配的拟合精度。
- **打个比方：** 像地图：地图画错了，开车再小心也会走错路。
- **怎么测：** 用硅片数据对模型做 DC/AC/噪声/失配的对比验证。

## 速度与功耗：Drive 与 Cdyn

### Q: “Drive 越大越好、Cdyn 越小越好，延迟就会降低”对吗？

**方向对，三点要补上。**


- **比 Drive 要控制条件：**同一 Ioff、同一面积（栅距、鳍/片数）下比。否则降 VT 或加宽都能“买”到电流。
- **速度看的是 I/C 比，不是单独的 I 或 C。**靠加宽得来的电流会带来同比例的自身电容；只有导线和扇出负载占大头时，加宽才明显变快。所以工艺开发里常看的 “I-drive 对 C” 图，本质上在看 CV/I 这条斜率。
- **延迟里的 C 和 Cdyn 不是同一个数。**延迟看的是单条路径、单次翻转的负载电容 C_load；Cdyn 是整颗芯片按翻转概率加权的电容，还和所跑程序有关。降寄生电容两边都受益，但幅度不同。

### Q: Cdyn 和频率（effective frequency）是直接相连的吗？

**定义上不相连，实际上通过三条路连在一起。**Cdyn = (P − P_漏电)/(V²·f_eff) 已经把频率除掉了，理想情况下它不随频率变化。


- **共享电容（直接路径）：**如果降掉的电容在关键路径上（比如工艺上的低 k、空气侧墙），同电压下延迟直接变小、频率升高，而功耗基本不变（C 降、f 升相互抵消）。
- **功耗预算（间接路径）：**功耗受限的产品里 P 固定。Cdyn 降低后可以抬电压换频率，但要付 V² 的代价，所以频率收益只有 Cdyn 降幅的一部分：
`Δf/f ≈ −(ΔCdyn/Cdyn) / (1 + 2/s)`，其中 s = d ln f / d ln V 是 V–F 曲线的对数斜率。s≈1 时约为 1/3，s≈2 时约为 1/2（忽略漏电；漏电随电压上升会让收益更小）。【推断】
- **测量效应：**Cdyn 要用 f_eff 计算。内存受限的程序在高频下有更多周期在等待，每周期的 Cdyn 反而下降；短路电流和毛刺也会让测得的 Cdyn 随电压、频率漂移。公开例子：3 nm GAA 路径探索 PDK 上，空气侧墙使环振在等速度下有功功耗降 30%，在等功耗下频率只升 9%（Lee 等，IEEE Access 2022）。同一个改进，用功耗报和用频率报，数字差三倍左右。

### Q: Cdyn 越小越好、降电阻电容能提升 AC 性能，对吗？

**对一半：Cdyn 里只有 C，没有 R。**


- **降 C（不伤 Drive）：**既提速又省电，是双赢。
- **降 R**（接触电阻、源漏电阻、导线电阻、IR 压降）：提升 Drive 和速度，但不降 Cdyn。
- **“越小越好”有前提：**本征沟道电容 Cinv 是换来电流的“好电容”，减它会同时减电流；要减的是寄生部分（交叠/边缘、栅–接触、导线）。
- **R 和 C 常常互换：**加厚侧墙 C 降 R 升；接触做小 C 降 R 升。判断标准是 Ieff/C_load 或环振的“延迟对 Cdyn”是否净改善。

### Q: Cdyn 是不是不光包含器件，后段所有部分都在里面？

**是的。产品层的 Cdyn 是全芯片口径：**凡是每个周期被充放电的电容都在里面，再按各自的翻转率加权——器件本征栅电容、交叠/边缘、栅–接触和栅–外延（MOL）、结电容、所有金属层的导线（含线间耦合）、时钟网络、SRAM 位线等。

不计入的：去耦电容、MIM 电容、封装寄生——它们稳态不翻转（但会影响供电噪声）。测出来的 Cdyn 还会混进短路电流和毛刺。

注意口径：工艺层用环振测的“每级 Cdyn”只含器件、MOL 和局部导线，不含时钟网络和长线。拿工艺的 Cdyn 改进去推算产品功耗时，要按各部分占比折算。

### Drive / 驱动电流（Idsat、Ion）

**一句话：** 晶体管全开时能推出多大电流，通常按每 µm 宽度归一化；越大，充放电越快。

- **实际含义：** Idsat（或 Ion）是 VGS = VDS = VDD 时的漏电流，单位 µA/µm。比较工艺时必须在同一关态漏电 Ioff 下比，否则调低 VT 就能“作弊”换来更大电流。
- **表征什么：** 晶体管给负载电容充放电的能力，是速度公式 τ ∝ C·V/I 里的分母。
- **数值越大 / 越小：** 在同 Ioff、同面积（同栅距）下越大越好。但靠加宽（多鳍、多片、更宽片）得来的电流会带来同比例的自身电容，只有负载主要来自导线和扇出时才划算；靠迁移率、应力、降低源漏电阻得来的电流才是“白赚”。
- **打个比方：** 像水泵的出水量：泵越猛，水桶（电容）灌得越快。但换更大的泵，泵自己的管道也更粗，要先灌满。
- **怎么测：** DC 参数测试：VDS = VDD 下扫 ID–VGS，读 VGS = VDD 时的电流，用 Kelvin 连接扣除接触压降；画 Ion–Ioff 散点，在固定 Ioff（如 1 或 10 nA/µm）处比较。

### Ieff（有效驱动电流）

**一句话：** 反相器翻转过程中的“平均”电流：(IH + IL)/2；比 Idsat 更能预测门延迟。

- **实际含义：** Na 等人（IEDM 2002）的定义：IH 取 VGS = VDD、VDS = VDD/2；IL 取 VGS = VDD/2、VDS = VDD；Ieff 是两者平均。原因是翻转过程中晶体管从不停在 Idsat 那一个偏置点上。
- **表征什么：** 真实开关过程中的驱动能力；对中等栅压和线性区特性（DIBL、源漏电阻、迁移率退化）敏感。
- **数值越大 / 越小：** 越大越好。Ieff/Idsat 的比值也有信息：DIBL 大或亚阈值摆幅差的器件 IL 掉得多，Ieff 会比 Idsat 看起来更差。
- **打个比方：** 像看一辆车的“平均车速”而不是“最高车速”：真上路时大部分时间不在极速档。
- **怎么测：** 在同一 DC 扫描里取 IH、IL 两个偏置点直接计算；再与环形振荡器测得的延迟做相关，检查 Ieff 能否解释延迟变化。
- **典型数值：** 【硅片·研究】Na 等人用紧凑模型和 90 nm 硬件验证了 Ieff 能准确预测反相器延迟。

### 门延迟 CV/I

**一句话：** 一级门的延迟 ≈ 负载电容 × 电压 ÷ 驱动电流；速度链的核心公式。

- **实际含义：** 把负载电容 C 充（或放）到约一半 VDD 所需的时间，τ ∝ C·VDD/Ieff。这里的 C 是这一级看到的全部负载：自身漏端电容、导线、下一级的栅电容。
- **表征什么：** 工艺的“AC 性能”：同一电压下电路能跑多快。
- **数值越大 / 越小：** 越小越快。三个旋钮：I 提高、C 降低、V 降低（但 V 降低时 I 掉得更多，通常反而更慢）。所以“I 越大、C 越小越好”成立，前提是比较时控制住 Ioff 和面积。
- **打个比方：** 用水管灌桶：时间 = 桶的容量（C）× 要灌的高度（V）÷ 水流量（I）。
- **怎么测：** 环形振荡器：测振荡频率 f，N 级环的单级延迟 τ = 1/(2N·f)；用不同扇出或金属负载的环振组拆出 C 和等效开关电阻。

### 负载电容 C_load / Ceff 与自负载

**一句话：** 一级门翻转时真正要充放电的电容：自身漏端 + 导线 + 下一级输入。

- **实际含义：** C_load = C_self（自身漏端的交叠、边缘、结电容）+ C_wire（导线）+ C_fanout（后级栅电容）。速度公式里的 C 就是它，针对的是单条路径、单次翻转。Ceff 常指翻转过程中按 ΔQ/ΔV 积分得到的等效值。
- **表征什么：** 这一级“背着多重的包”在跑；也决定加大器件尺寸值不值。
- **数值越大 / 越小：** 越小越快。自负载占比越高，加宽器件越没用：电流和自身电容同比例增加，延迟几乎不变，功耗却上升；导线和扇出占比高时，加宽才有效。
- **打个比方：** 像搬家：箱子（外部负载）重时，换个更壮的人有用；如果累的主要是自己的体重（自负载），再壮也快不了多少。
- **怎么测：** 对比 FO1/FO3/FO4 环振，或同一驱动后接不同长度的金属线，用频率和电流差值拆分；寄生提取（PEX）给出版图上每条线的电容。

### Cdyn（动态电容）

**一句话：** 平均每个时钟周期被充放电的电容：Cdyn = 动态功耗 ÷ (V²·f)；功耗链的核心量。

- **实际含义：** Cdyn = Σ αᵢ·Cᵢ：芯片上每个节点的电容乘以它每周期翻转的概率 α 再求和。实际中常反过来算：Cdyn = (P_总 − P_漏电)/(V²·f_eff)。它是“芯片 + 所跑程序”的属性，同一颗芯片跑不同程序，Cdyn 不同。
- **表征什么：** 每做一个周期的活要搬多少电荷。它把功耗里与电压、频率无关的部分单独拿出来，方便跨电压、跨频率比较工艺和设计。
- **数值越大 / 越小：** 完成同样工作量时越小越好：同频同压下功耗按比例下降，或者在同功耗下换来更高的电压和频率。但 Cdyn 小也可能只是芯片没在干活（α 低、IPC 低），所以要按每条指令或每单位工作量来看。
- **打个比方：** 像一栋楼里每小时开关灯的总瓦数：灯多（C 大）、开关勤（α 高）都会让电表转得快；它和电价（V²）、营业时长（f）分开记账。
- **怎么测：** 产品层：固定 V 和 f 跑代表性负载，测电源电流，扣除同温度下的漏电（可在停钟时测），再除以 V²·f_eff。工艺层：环振的 (IDDA − IDDQ)/(VDD·f) 给出每级 Cdyn。设计阶段用 PEX 加门级仿真的翻转率估算。
- **典型数值：** 【硅片·研究】0.13 µm 处理器（7700 万晶体管）：互连占动态功耗 50% 以上，栅电容约 34%，扩散电容为其余；时钟网约占 40%（Magen 等，SLIP 2004）。

### 活动因子 α（翻转率）

**一句话：** 一个节点每个时钟周期完成一次充放电的概率；时钟线 α = 1，普通逻辑常在 0.1 量级。

- **实际含义：** Cdyn = Σ α·C 里的 α。常见两种口径（只数 0→1 翻转，或数所有翻转），比较时要统一。它由电路结构、数据和程序共同决定。
- **表征什么：** 电容里有多少“真的在动”；也是设计侧降 Cdyn 的主要抓手（时钟门控、操作数隔离、减少毛刺）。
- **数值越大 / 越小：** 完成同样工作量时越低越省电；但如果 α 低是因为核心在等内存，那是空转，不是高效。
- **打个比方：** 一栋楼里灯很多（C），但每小时真正开关的比例（α）才决定电费。
- **怎么测：** 仿真：门级或 RTL 仿真记录每个网络的翻转次数（SAIF/VCD 文件）。硅片：测得的 Cdyn 除以总电容得到平均 α；片上活动计数器可实时估算。
- **典型数值：** 【常识】时钟 α = 1（每周期一次完整充放电）；随机数据逻辑约 0.1 量级。

### 动态功耗 P = Cdyn·V²·f（含短路功耗）

**一句话：** 翻转一次耗能 C·V²，每秒 f 次：P = Cdyn·V²·f；再加上上下管同时导通时的短路电流。

- **实际含义：** 给电容充电时从电源取能 C·V²：一半存进电容，一半耗在上拉管上；放电时存的那一半耗在下拉管上。总功耗 = 动态 + 短路 + 漏电。短路和毛刺不是电容，但测出来会被算进 Cdyn。
- **表征什么：** 功耗随电压平方涨、随频率线性涨。所以降电压最省电；提频率最费电，因为提频率通常也要提电压。
- **数值越大 / 越小：** 越低越好。沿 V–F 曲线升频时电压也要升；如果频率和电压近似成正比，功耗大约按 f³ 上涨。
- **打个比方：** 像反复给气球打气再放掉：每次打进去的气量 ∝ C·V，打气的压力 ∝ V，所以每次耗能 ∝ C·V²；每秒打 f 次。
- **怎么测：** 在若干 (V, f) 点测总电流；停钟测漏电并扣除；剩余功耗对 V²·f 作图，斜率就是 Cdyn。短路功耗可用改变输入边沿速率的环振估计。

### 有效频率 f_eff

**一句话：** 一段时间内核心实际跑的平均频率：基准频率 × (ΔAPERF/ΔMPERF)，只计活动（C0）时间。

- **实际含义：** 现代 CPU 的频率随负载、温度和功耗上限实时变化（睿频、降频、睡眠态）。MPERF 在 C0 态按基准频率计数，APERF 按实际频率计数；两者增量之比乘以基准频率，就是这段时间的有效频率。
- **表征什么：** 把测到的功耗换算成 Cdyn 时要除的那个 f；也是“产品实际跑多快”的度量。
- **数值越大 / 越小：** 越高说明越多时间跑在高频。算 Cdyn 时要用 f_eff：用标称频率而实际在降频，Cdyn 会被算小；把睡眠时间也算进去，会被算得更小。
- **打个比方：** 像车的平均车速：路牌写的是限速，实际要看里程 ÷ 行驶时间（停车时间不算）。
- **怎么测：** 读处理器的 APERF/MPERF 计数器（Linux 的 turbostat、cpupower 等工具会显示），并与电源电流测量在同一时间窗内对齐。

### V–F 曲线（电压–频率）与 Vmin

**一句话：** 芯片在每个电压下能稳定跑到的最高频率；它是 Drive 链和 Cdyn 链的连接点。

- **实际含义：** 电压越高，Ieff 越大、门延迟越小，能跑的频率越高；Vmin 是保证功能正确的最低电压。DVFS 就是沿这条曲线上下移动工作点。
- **表征什么：** 晶体管的 Drive/C 决定曲线的位置（同电压下多快）；Cdyn 决定曲线上每一点要付多少功耗。
- **数值越大 / 越小：** 曲线越靠左上越好（低电压就能跑高频）。对数斜率 s = d ln f / d ln V 决定省下的 Cdyn 能换多少频率：s 越大，同样的功耗余量换到的频率越多。
- **打个比方：** 像骑自行车的踩踏力与车速：用力（V）越大越快，但体力消耗（功耗）按力的平方涨。
- **怎么测：** Shmoo 测试：在 (V, f) 网格上跑测试向量，记录通过/失败边界；产品上用片上监测电路（环振、关键路径复制电路）跟踪。

### 等功耗 / 等频率比较（iso-power、iso-frequency）

**一句话：** 工艺代际收益的两种报法：同功耗下快多少，或同频率下省多少电；后者的百分比通常大得多。

- **实际含义：** 同一组晶体管和电容改进，可以兑现成频率，也可以兑现成功耗。功耗随 V² 变化：同频率下降电压能省很多电；同功耗下提频率要付 V² 的代价，所以频率收益的百分比小于功耗收益。
- **表征什么：** 把 Drive 和 Cdyn 的改进折算成产品语言；也是判断一项改动值不值的口径。
- **数值越大 / 越小：** 两个数都越大越好，但不要拿一个工艺的 iso-power 数去比另一个工艺的 iso-frequency 数，还要看是在哪个电压点报的。
- **打个比方：** 像换了一辆更轻的车：可以油耗不变跑得快一点，也可以速度不变省很多油；省油的百分比看起来总是更大。
- **怎么测：** 在新旧工艺上实现同一设计或电路块，各自扫 V–F 和功耗，画频率–功耗曲线，在同一功耗或同一频率处读差值。
- **典型数值：** 【硅片·研究】3 nm GAA 路径探索 PDK 上，空气侧墙（k 7→3.3）使 9 级 FO1 环振在等速度下有功功耗降 30%，等功耗下频率升 9%（Lee 等，IEEE Access 2022）。【厂商】据 Tom's Hardware 报道，Intel 18A 对比 Intel 3：1.1 V 等频率功耗降 36%，0.75 V 下速度高 18%。

### 环形振荡器（RO）

**一句话：** 奇数级反相器首尾相接自激振荡；同时测频率和电流，就能得到工艺的门延迟和每级 Cdyn。

- **实际含义：** N 级环振的周期是 2N 个门延迟：τ = 1/(2N·f)。振荡时的电源电流 IDDA 减去停振电流 IDDQ，就是充放电电流，于是每级电容 C = (IDDA − IDDQ)/(N·VDD·f)。
- **表征什么：** 工艺 AC 性能的标尺：在同一结构上同时看到速度（τ）、电容（C）以及两者的取舍。
- **数值越大 / 越小：** τ 越小越快，C 越小越省。常画“延迟对每级 Cdyn”或“延迟对功耗”的图，越靠左下越好。只降 τ 却让 C 上升（如加宽器件），未必是好改动。
- **打个比方：** 像一圈人传话：一圈传完的时间告诉你每人反应多快，大家耗的力气告诉你每人要喊多大声。
- **怎么测：** 片上环振带分频输出测频率；分别测振荡与停振（关使能）时的电源电流。用不同扇出、不同金属负载、不同堆叠的环振组，把 C 拆成栅、扩散、导线等分量（Bhushan 等，IEEE TSM 2006）。

### 本征栅电容（Cinv / 沟道电容）

**一句话：** 栅极对沟道反型电荷的那部分电容；它是换来驱动电流的“好电容”。

- **实际含义：** Cinv ≈ ε / EOT(反型) × 栅长 × 有效宽度。沟道电荷 Q = Cinv·(VGS − VT)，电流 ≈ 电荷 × 速度，所以没有它就没有电流。
- **表征什么：** 栅对沟道的控制力度；也是器件自身那部分 Cdyn 里唯一有回报的部分。
- **数值越大 / 越小：** 不是越小越好：减小它（如加厚 EOT）会同时减小驱动。真正要减的是寄生部分。衡量工艺看的是 I/C，而不是单独的 C。
- **打个比方：** 像水泵的叶轮：叶轮越大泵出的水越多，但启动也越费劲；把叶轮拿掉就没有泵了。
- **怎么测：** 大面积电容结构做 C–V（split C–V 分出栅–沟道部分）；用多个栅长外推，扣除短沟道器件的寄生部分。

### 交叠与边缘电容（Cov、Cof、Cif）与 Miller 效应

**一句话：** 栅与源漏之间不产生电流的寄生电容；栅–漏那一份在翻转时约按 2 倍计入。

- **实际含义：** Cov：栅与源漏延伸区的交叠；Cof：栅侧壁经侧墙到源漏的外边缘场；Cif：栅底部到源漏的内边缘场。翻转时栅和漏反向摆动，Cgd 两端电压变化 2·VDD，等效约 2 倍（Miller 效应）。
- **表征什么：** FEOL 结构里“白交的电费”；也加在漏端的自负载上。
- **数值越大 / 越小：** 越小越好，但有取舍：减小交叠（甚至 underlap）会增加源漏电阻、降低驱动；加厚侧墙降电容但增加电阻。要看 Ieff/C 的净效果。
- **打个比方：** 像水泵外壳上的缝隙：不帮你泵水，却每一下都要先灌满。
- **怎么测：** 关态（VGS < VT）测 Cgd、Cgs 的 C–V 得到交叠加边缘；多栅长外推；TCAD 拆分各分量。
- **典型数值：** 【硅片·研究】IBM、AMD、东芝的 22 nm FinFET AC 分析：FinFET 额外的栅–源漏寄生电容带来 5–19% 的反相器延迟损失，取决于鳍间距和鳍高。

### 栅–接触 / 栅–外延电容（MOL 寄生）

**一句话：** 栅极与紧挨着的源漏外延、源漏接触之间的电容；栅距缩小后，它是器件寄生电容的大头之一。

- **实际含义：** 栅和源漏接触（trench contact）是相隔几纳米、平行排列的两块导体，中间只隔着侧墙和接触衬垫。栅距每缩一代，这块平行板电容就更大。
- **表征什么：** MOL 结构设计的好坏；也是先进节点“面积缩了却没变快”的常见原因。
- **数值越大 / 越小：** 越小越好。主要旋钮：侧墙介电常数（低 k、空气侧墙）、接触的高度和宽度、自对准接触。代价通常是接触电阻和可靠性。
- **打个比方：** 像两栋贴得太近的楼：楼越高、贴得越紧，彼此影响越大；中间留空气（空气侧墙）比灌混凝土隔得更好。
- **怎么测：** 专用梳状栅–接触电容结构做 C–V；用环振对比不同侧墙方案；校准版图寄生提取。
- **典型数值：** 【硅片·研究】IBM 把空气侧墙与自对准接触、有源区上栅接触（COAG）集成，实测 Ceff 降 15%（VLSI 2020）。3 nm GAA 路径探索 PDK 研究中，MOL 与 BEOL 的 RC 占电路性能退化的 60% 以上（Lee 等，IEEE Access 2022）。

### 结电容 / 扩散电容（Cj）

**一句话：** 源漏与衬底（或阱）之间 PN 结的耗尽层电容；漏端每次翻转都要一起充放电。

- **实际含义：** 平面器件的源漏扩散区面积大，Cj 是自负载的重要部分；FinFET 和 nanosheet 的源漏外延长在窄鳍或隔离层上，结面积小得多，BDI 再把底部切断。
- **表征什么：** 漏端自负载的一部分；它随反偏电压增大而减小。
- **数值越大 / 越小：** 越小越好。在 0.13 µm 处理器上，扩散电容是栅电容（约 34%）和互连（50% 以上）之外剩下的那一小份；在 FinFET/GAA 中占比更低。
- **打个比方：** 像水管接头处鼓起的小水囊：每次压力变化都要先把它撑满。
- **怎么测：** 大面积二极管结构的 C–V；环振中改变 NFET 堆叠数来拆出扩散电容（Bhushan 等）。

### 互连电容（BEOL 导线电容）

**一句话：** 金属线对上下层和相邻线的电容；在整颗芯片的 Cdyn 里常常是最大的一块。

- **实际含义：** 由对上下层的电容和线间耦合电容组成。耦合电容的有效值取决于邻线怎么翻转：邻线不动约 1 倍，同向翻转接近 0，反向翻转约 2 倍（Miller 因子）。
- **表征什么：** 布线密度、介质材料和布线质量。
- **数值越大 / 越小：** 越小越好，同时降低延迟和 Cdyn。旋钮：低 k / 超低 k 介质、气隙、加大线距、缩短线长（更好的布局或 3D 堆叠）。代价是机械强度、可靠性和面积。
- **打个比方：** 像城市道路：路网越密，车流（信号）越互相干扰；隔离带（低 k、气隙）让相邻车道互不影响。
- **怎么测：** 梳状–蛇形线结构测线间电容；带金属负载的环振；BEOL 统计模型和寄生提取（PEX）与硅片对标。
- **典型数值：** 【硅片·研究】0.13 µm 处理器中互连占动态功耗 50% 以上，约 90% 的互连功耗来自约 10% 的连线；按功耗优化线距的布线平均省 14% 动态功耗（Magen 等，SLIP 2004）。【厂商】据报道 Intel 18A 的正面金属 RC 比 Intel 3 好约 12%。

### 时钟网络（clock tree）

**一句话：** 把时钟送到每个触发器的网络；每周期必翻转（α = 1），是 Cdyn 的大户。

- **实际含义：** 由全局时钟网格或时钟树、局部缓冲器和触发器的时钟输入组成。和数据线不同，它的活动因子固定为 1，而且线长、缓冲器多。
- **表征什么：** 设计侧的“底噪” Cdyn：哪怕没做有用的计算，时钟也在耗电。
- **数值越大 / 越小：** 越小越好。时钟门控把空闲模块的时钟关掉，是最有效的降 Cdyn 手段之一。
- **打个比方：** 像全楼的广播：不管有没有人听，每层都在响；关掉没人的楼层就省电了。
- **怎么测：** 空闲负载（数据活动很少）下测得的 Cdyn 近似时钟加常开逻辑；设计中由时钟树综合报告给出时钟电容。
- **典型数值：** 【硅片·研究】0.13 µm 处理器中时钟网约占动态功耗 40%（局部约 29%、全局约 13%），而时钟网只占约 1% 的网络、4% 的布线长度（Magen 等，SLIP 2004）。

### 互连电阻与 RC 延迟（含电阻屏蔽）

**一句话：** 导线电阻让信号沿线变慢；它不属于 Cdyn，但和电容一起决定线延迟。

- **实际含义：** 长线延迟 ≈ 0.4·R_wire·C_wire（分布式 RC）+ 驱动电阻 × 总电容。电阻还会“屏蔽”远端电容：驱动器看到的有效电容小于导线总电容，但总延迟仍随电阻增加。供电网络的电阻造成 IR 压降，降低晶体管实际拿到的电压和驱动。
- **表征什么：** 金属线越细越长电阻越大；先进节点里电阻上升得比电容快。
- **数值越大 / 越小：** 越小越好，但降电阻不会降 Cdyn。所以“降 RC”提升 AC 性能，“降 Cdyn”要靠降 C。背面供电（BSPDN）减小 IR 压降、腾出正面布线，两方面同时帮忙。
- **打个比方：** 像细长的水管：管子越细越长，水越慢流到另一头；桶（电容）没变，但灌满要更久。
- **怎么测：** Kelvin 四端法测线电阻和通孔链电阻；长线环振或延迟链测线延迟；片上电压监测电路测 IR 压降。
- **典型数值：** 【常识】分布式 RC 线的 50% 延迟约 0.38·R·C（Elmore 近似给 0.5·R·C）。【厂商】据报道 Intel 18A 的 PowerVia 背面供电使最坏情况电压跌落比 Intel 3 降低至多 10 倍。

