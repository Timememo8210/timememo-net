/* Public school information only. Research snapshot: 2026-10-02. */
const GUIDE = {
  schools: ['Lincoln', 'Jesuit', 'OES', 'Catlin Gabel'],
  sources: [
    ['Lincoln 入学与资格','Lincoln enrollment and eligibility','https://lincoln.pps.net/our-school/how-to-enroll'],
    ['Lincoln IB 中学项目','Lincoln IB Middle Years Programme','https://lincoln.pps.net/academics/ib-middle-years-program/our-why-myp-as-a-driver-for-equity'],
    ['Lincoln 学校官网及联系','Lincoln school and contact','https://lincoln.pps.net/'],
    ['Jesuit 学费与资助','Jesuit tuition and aid','https://www.jesuitportland.org/admissions/financial-aid'],
    ['Jesuit 申请流程','Jesuit admission process','https://www.jesuitportland.org/admissions/new-admissions-process'],
    ['Jesuit 访校与跟班','Jesuit visits and shadowing','https://www.jesuitportland.org/admissions/discover-jesuit'],
    ['Jesuit 开放日','Jesuit open house','https://www.jesuitportland.org/admissions/open-house'],
    ['Jesuit 课程与教育理念','Jesuit academics','https://www.jesuitportland.org/academics'],
    ['OES 学费与资助','OES tuition and aid','https://www.oes.edu/admissions/affording-oes'],
    ['OES 高中考试与评估','OES testing and academic assessment','https://www.oes.edu/admissions/application-process/testing'],
    ['OES 申请流程','OES application process','https://www.oes.edu/admissions/application-process'],
    ['OES 访校与跟班','OES visits and shadowing','https://www.oes.edu/admissions/events-and-tours'],
    ['OES 开放日','OES open house','https://www.oes.edu/admissions/events-and-tours/open-house'],
    ['OES 探究式学习','OES inquiry-based academics','https://www.oes.edu/academics'],
    ['OES 宗教与哲学课程','OES religion and philosophy','https://www.oes.edu/academics/academic-curriculum/religionphilosophy'],
    ['Catlin 学费与额外费用','Catlin tuition and extra costs','https://www.catlin.edu/admission/affording-catlin-gabel/tuition'],
    ['Catlin 招生常见问题与免标准化考试政策','Catlin admission FAQ and testing policy','https://www.catlin.edu/admission/faq'],
    ['Catlin 高中申请清单','Catlin Upper School application checklist','https://www.catlin.edu/admission/apply-to-catlin-gabel/upper-school'],
    ['Catlin 校园导览','Catlin campus tours','https://www.catlin.edu/admission/visit/tours'],
    ['Catlin 跟班体验','Catlin student shadow days','https://www.catlin.edu/admission/visit/visits'],
    ['Catlin 高中课程','Catlin Upper School curriculum','https://www.catlin.edu/academics-more/upper-school/upper-school-curriculum'],
    ['Catlin 大学升学辅导与 PSAT','Catlin college counseling and PSAT','https://www.catlin.edu/academics-more/upper-school/college-counseling']
  ],
  rows: [
    {label:['学校路径','School pathway'], cells:[
      {t:['PPS 公立高中。先核实学区、学籍与转学资格。','PPS public high school. Verify attendance boundaries, enrollment and transfer eligibility.'],s:[1]},
      {t:['私立、天主教耶稣会高中。','Private Catholic, Jesuit high school.'],s:[8]},
      {t:['私立、圣公会背景；本页比较高中走读。','Independent Episcopal school; this guide compares Upper School day enrollment.'],s:[9,15]},
      {t:['私立走读学校；重视自主思考与体验式学习。','Independent day school emphasizing independent thinking and experiential learning.'],s:[18,21]}
    ]},
    {label:['年学费 · 2026–27','Annual tuition · 2026–27'],cells:[
      {t:['符合公校入学资格者免学费；不代表所有活动和考试均免费。','Tuition-free for eligible public-school enrollment; activities and exams may still carry fees.'],price:'$0',s:[1]},
      {t:['公布的家庭学费；不是页面列出的每生实际教育成本。','Published family tuition, distinct from the school’s actual per-student cost.'],price:'$20,075',s:[4]},
      {t:['九至十二年级走读学费。','Grades 9–12 day tuition.'],price:'$48,200',s:[9]},
      {t:['九至十二年级学费。','Grades 9–12 tuition.'],price:'$47,600',s:[16]}
    ]},
    {label:['额外预算','Additional budget'],cells:[
      {t:['向学校核实交通、活动、IB 考试等个人项目费用及减免。','Ask about transportation, activities, IB exam costs and fee assistance.'],s:[1,3]},
      {t:['书本及个别课程费约 $500–700；其他项目另核实。','Books and individual course fees about $500–700; confirm other extras.'],s:[4]},
      {t:['含午餐、教材及多数体育／教学活动；另考虑电脑、校车和部分 Winterim 活动。','Includes lunch, textbooks and most sports/field trips; budget for a laptop, bus and some Winterim options.'],s:[9]},
      {t:['书本 $60–500；技术设备估算 $1,200–2,000；午餐、校车及部分活动另计。','Books $60–500; technology estimate $1,200–2,000; lunch, bus and some activities cost extra.'],s:[16]}
    ]},
    {label:['课程观察重点','Academic lens'],cells:[
      {t:['九、十年级以 IB MYP 为教学框架，衔接高年级 IB DP。','IB MYP framework in grades 9–10, leading into upper-grade IB Diploma Programme courses.'],s:[2]},
      {t:['大学预备课程与耶稣会教育理念结合；访校时核实进阶数学、科学与神学课安排。','College-preparatory study within a Jesuit educational framework; ask about advanced math/science and theology.'],s:[8]},
      {t:['跨学科探究式学习，高中包括原创科学研究；设宗教与哲学课程。','Inquiry across disciplines, including original Upper School science research; religion/philosophy coursework.'],s:[14,15]},
      {t:['高阶／荣誉课程、GOA 在线选修、Immersive 体验课程与毕业项目。','Advanced/honors courses, GOA online electives, Immersives and a senior project.'],s:[21]}
    ]},
    {label:['入学考试／评估','Admission assessment'],cells:[
      {t:['普通公校注册流程未列 SSAT、HSPT 或 PSAT 入学门槛。分班与课程先修另核实。','The regular enrollment process lists no SSAT, HSPT or PSAT admission requirement. Placement/prerequisites are separate.'],s:[1]},
      {t:['八年级申请者要求 HSPT。2026 年 12 月 4 日或 5 日，考试费 $25。','HSPT required for eighth-grade applicants. December 4 or 5, 2026; $25 test fee.'],s:[5]},
      {t:['SSAT、ISEE、HSPT、合规 MAP 或免费 OES 校内评估择一。HSPT／MAP 还需 OES 写作。','One of SSAT, ISEE, HSPT, qualifying MAP or free OES assessment. HSPT/MAP also require OES writing.'],s:[10]},
      {t:['不要求标准化入学考试；仍有写作样本及申请材料要求。','No standardized admission test required; writing samples and other application materials still apply.'],s:[17,18]}
    ]},
    {label:['主要申请材料','Main application elements'],cells:[
      {t:['按当前学籍和学区走注册流程；新生通常需住址、年龄、疫苗与学籍材料。','Enrollment route depends on current school/boundary status; new students generally need residency, age, vaccination and school records.'],s:[1]},
      {t:['家长账户、申请、HSPT、教师／校方评价、成绩记录及家庭面试。','Parent account, application, HSPT, teacher/school evaluations, records and family interview.'],s:[5]},
      {t:['学生手写问卷、家长交流、学生面试／访校、评估、英数推荐及成绩单。','Handwritten student questionnaire, parent conversation, student interview/visit, assessment, English/math recommendations and records.'],s:[11]},
      {t:['家庭与学生问卷、学生视频、写作样本、教师评价、学籍记录及必需跟班体验。','Family/student responses, student video, writing sample, teacher evaluations, records and required shadow day.'],s:[18]}
    ]},
    {label:['访校预约路径','Visit booking route'],cells:[
      {t:['向校办公室询问新生说明会或访校；未核实到 2027 入学的公开预约日历。','Contact the school office about incoming-student events or visits; no public 2027-entry booking calendar verified.'],s:[3]},
      {t:['Open House 可直接登记；Shadow Visit 需招生家长账户。','Direct registration for Open House; parent admissions account for Shadow Visits.'],s:[6,7]},
      {t:['公开表单预约校园导览／开放日；可另外安排跟班体验。','Public forms for tours/open house; optional shadow visits are a separate experience.'],s:[12,13]},
      {t:['先填 inquiry 建立招生账户，再在 portal 预约。导览可选；跟班是高中申请必需。','Inquiry → admissions account → portal booking. Tours are optional; Upper School shadow day is required.'],s:[17,19,20]}
    ]},
    {label:['费用与时间提醒','Application-cost notes'],cells:[
      {t:['2027–28 注册／选课安排待更新；不要把 2026–27 页面日期直接顺延。','2027–28 enrollment/course-request details pending; do not simply shift last year’s dates.'],s:[1]},
      {t:['HSPT $25；申请截至 2027-01-08。考试地点／线上形式需在本年度 portal 核实。','HSPT $25; application due Jan 8, 2027. Confirm current-year test venue/delivery in the portal.'],s:[5]},
      {t:['申请费 $50，12 月 15 日后 $75；高中走读申请表截止日需确认。','Application $50, $75 after Dec 15; Upper School day application deadline needs confirmation.'],s:[11]},
      {t:['申请费 $75；优先申请截至 2027-02-04。官网早鸟日期有旧年份，折扣先核实。','Application $75; priority deadline Feb 4, 2027. Verify early-discount dates because the page retains an older year.'],s:[18]}
    ]}
  ],
  visits:[
    {name:'OES',label:['校园导览／开放日','CAMPUS TOUR / OPEN HOUSE'],event:['10/7 周三 08:30–10:30 · 高中导览','Wed Oct 7, 08:30–10:30 · Upper School tour'],text:['10 月 2 日查看时该场可登记；正文说明导览约 90 分钟，但表单预留两小时。无需先建账户。另有 11 月 8 日周日 13:00 中学／高中开放日；请重新查看余位。','This tour was open for registration on Oct 2. The description says about 90 minutes, while the form reserves two hours. No account required for this form. Middle/Upper Open House: Sun Nov 8 at 13:00. Recheck availability.'],address:'6300 SW Nicol Road, Portland, OR 97223',contact:'admit@oes.edu · 503-768-3115',links:[['校园导览日期','Tour calendar','https://apply.oes.edu/portal/campus_tours'],['开放日报名','Open House registration','https://apply.oes.edu/portal/open_house']],s:[12,13]},
    {name:'Jesuit',label:['周日开放日／学生跟班','SUNDAY OPEN HOUSE / STUDENT SHADOW'],event:['10/18 周日 13:00–17:00 · Open House','Sun Oct 18, 13:00–17:00 · Open House'],text:['公开日历按 15 分钟报到窗口预约。10 月 2 日查看时有 13:15–13:30 等选项；这不是总参观时长。平日跟班体验从 10 月 2 日至 1 月，具体日期登录账户后查看。','Choose a 15-minute check-in window on the public calendar. Slots including 13:15–13:30 appeared on Oct 2; this is not the full visit duration. Weekday shadow visits run Oct 2 through January; exact slots require an account.'],address:'9000 SW Beaverton-Hillsdale Hwy, Portland, OR 97225',contact:'admissions@jesuitportland.org · 503-291-5423',links:[['开放日报名','Open House registration','https://jesuitportland.fsenrollment.com/portal/public_calendars/calendar_1'],['招生账户／跟班','Admissions account / shadow','https://jesuitportland.fsenrollment.com/users/sign_in']],s:[6,7]},
    {name:'Catlin Gabel',label:['高中导览／必需跟班','UPPER SCHOOL TOUR / REQUIRED SHADOW'],event:['10/25 周日 13:00–16:00 · 高中开放日','Sun Oct 25, 13:00–16:00 · Upper School Open House'],text:['平日高中导览由学生大使带领，再与招生负责人交流。个人导览不替代必需 Shadow Day；跟班包含课堂、午餐和小组活动。预约前先完成 portal 内相应表单，实时日期以账户为准。','Weekday Upper School tours include a student ambassador and conversation with enrollment staff. A tour does not replace the required Shadow Day, which includes classes, lunch and a group activity. Complete portal prerequisites and check live dates there.'],address:'8825 SW Barnes Road, Portland, OR 97225',contact:'us-apply@catlin.edu · 503-297-1894 ext. 5052',links:[['导览及账户入口','Tours and account setup','https://www.catlin.edu/admission/visit/tours'],['申请与开放日','Application and Open House','https://www.catlin.edu/admission/apply-to-catlin-gabel/upper-school']],s:[18,19,20]},
    {name:'Lincoln',label:['先核实资格，再联系学校','VERIFY ELIGIBILITY, THEN CONTACT SCHOOL'],event:['2027 入学访校／说明会：待学校确认','2027-entry visits / orientation: confirm with school'],text:['目前官方注册说明仍针对 2026–27。当前 PPS 学生如在 Lincoln 学区内，按现行说明可在 1 月查看 ParentVUE 课程申请确认；2027 流程仍需学校核实。在校上某门数学课不等于高中学位已确认。','The current enrollment page is still for 2026–27. Under that guidance, current PPS students in Lincoln’s catchment can check January ParentVUE course requests; verify the 2027 process with staff. Taking a math class there is not proof of a future high-school placement.'],address:'1750 SW Salmon St, Portland, OR 97205',contact:'lincolnoffice@pps.net · 503-916-5200',links:[['官方注册说明','Enrollment guidance','https://lincoln.pps.net/our-school/how-to-enroll'],['学校办公室邮件','Email the school office','mailto:lincolnoffice@pps.net']],s:[1,3]}
  ],
  testing:[
    {title:['同时申请 Jesuit + OES','Applying to Jesuit + OES'],text:['可先考 Jesuit 要求的本学年 HSPT，再向 OES 提交正式成绩并另做 OES 写作。仅针对这两所学校，不一定需要再报 SSAT。先与 OES 确认送分及写作安排。','Take the current-year HSPT required by Jesuit, then submit official results to OES and complete OES writing. For these two schools alone, a separate SSAT is not necessarily needed. Confirm score delivery and writing arrangements with OES.'],s:[5,10]},
    {title:['只考虑 OES？还有其他路线','Only considering OES? More options'],text:['符合要求的学校 MAP 成绩加 OES 写作，或免费的 OES 校内纸笔评估，都可能满足要求。SSAT／ISEE 是选项，不是唯一路径。联系 admit@oes.edu。','Qualifying school-administered MAP plus OES writing, or a free on-campus OES paper assessment, may meet the requirement. SSAT/ISEE are options, not the only routes. Contact admit@oes.edu.'],s:[10]},
    {title:['PSAT ≠ 高中入学考试','PSAT ≠ this admission requirement'],text:['Catlin 不要求标准化入学考试，普通 Lincoln 注册也未列此门槛。PSAT 常用于入学后的大学准备；例如 Catlin 为十年级学生安排 PSAT 练习。不要与 SSAT／HSPT 混淆。','Catlin requires no standardized admission test; regular Lincoln enrollment lists no such gate. PSAT is used later for college preparation—for example, Catlin schedules practice PSAT testing in grade 10. Do not confuse it with SSAT/HSPT.'],s:[1,17,22]}
  ],
  timeline:[
    {date:['2026 · 10—11 月','OCT–NOV 2026'],text:['访校阶段：OES 10/7 导览（需复查余位）；Jesuit 10/18 开放日；Catlin 10/25 高中开放日；OES 11/8 开放日。参观不是正式申请或预约确认。','Visit phase: OES Oct 7 tour (recheck availability), Jesuit Oct 18 Open House, Catlin Oct 25 Upper School Open House, OES Nov 8 Open House. A visit listing is not an application or confirmed reservation.'],s:[6,12,13,18]},
    {date:['2026 · 12 月 4／5 日','DEC 4 / 5, 2026'],text:['Jesuit HSPT 两个考试日期选一。官网当前流程与所链接旧年度材料存在年份差异；具体报到时间、地点与考试形式以本年确认信为准。','Choose one Jesuit HSPT date. The current process and linked older-year material differ in year; use the current-year confirmation for check-in, venue and delivery format.'],s:[5]},
    {date:['2027 · 1 月','JANUARY 2027'],text:['Jesuit：1/8 申请与助学金截止；1/27 学校材料截止；家庭面试 1/23 或 1/30。Lincoln：关注新学年注册与选课通知，核实个人学籍去向。','Jesuit: application/aid Jan 8; school materials Jan 27; family interviews Jan 23 or 30. Lincoln: watch new-year enrollment and course-request notices and verify individual placement.'],s:[1,5]},
    {date:['2027 · 2 月','FEBRUARY 2027'],text:['Catlin：2/4 高中优先申请、2/5 助学金截止。OES：推荐信与成绩单 2/5 截止，走读申请者面试／访校日 2/6；申请表截止日需确认，不能拿寄宿部日期代替。','Catlin: Upper School priority application Feb 4; aid Feb 5. OES: recommendations/records Feb 5; day-applicant interview/visit Feb 6. Confirm the day application deadline; do not substitute the boarding deadline.'],s:[11,12,18]},
    {date:['2027 · 3 月','MARCH 2027'],text:['Catlin：3/5 发出录取及资助结果，3/17 合约与押金截止。作选择前同时核实资助净额、课程安置与退学／退款条款。','Catlin: decisions/aid March 5; agreement/deposit March 17. Before deciding, confirm net aid, course placement and withdrawal/refund terms.'],s:[18]}
  ],
  questions:[
    {title:['数学衔接与挑战度','Math placement and challenge'],text:['已有超前数学经历如何认可？是否要分班测试？之后三至四年的课程路线、跨年级选课与独立学习怎样安排？','How is prior accelerated math recognized? Is placement testing needed? Ask for the next three to four years of courses, cross-grade options and independent study.']},
    {title:['研究、艺术与兴趣空间','Research, arts and room to explore'],text:['学生何时能做真实研究或长期项目？有没有导师、艺术课、心理学相关选修，以及跨学科展示机会？','When can students begin research or sustained projects? Ask about mentors, arts, psychology-related electives and interdisciplinary work.']},
    {title:['校园文化与日常负担','Culture and everyday workload'],text:['作业、通勤、体育与课外活动如何平衡？宗教课程或集会有哪些要求？没有宗教信仰的学生如何参与？','How do homework, commuting, sports and activities fit together? What religious coursework or gatherings are required, and how do nonreligious students participate?']},
    {title:['支持、辅导与真实成本','Support, counseling and real cost'],text:['每位老师／辅导员负责多少学生？学习或情绪支持怎样申请？让学校提供包含设备、交通、旅行的完整费用清单。','How many students does each teacher/counselor support? How is academic or emotional support accessed? Request a complete cost list including equipment, transportation and trips.']}
  ]
};
