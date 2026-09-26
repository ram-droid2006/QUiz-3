// Stable source numbers allow future homework to exclude these 33 items.
const passages=require('./homework-passages.json');
const questions=[];
function add(source,subject,skill,level,group,prompt,choices,answer,explanation,diagram=null){
  questions.push({id:'B-'+source,source,subject,skill,level,difficulty:['Easy','Medium','Hard'][level],group,prompt,choices,answer,explanation,diagram,passage:passages[group]||null});
}
add(58,'Math','Expressions',1,'math','Simplify (3/5)(2x + 5) - 2x. What is the coefficient of x, written as a decimal?',['-0.8','0.8','1.2','3'],0,'Distribute to get 1.2x + 3 - 2x = -0.8x + 3. The coefficient is -0.8.');
add(59,'Math','Counting outcomes',0,'math','Two number cubes, each labeled 1 through 6, are rolled. How many ordered outcomes have a sum of 6?',['3','5','6','12'],1,'The outcomes are (1,5), (2,4), (3,3), (4,2), and (5,1): five outcomes.');
add(60,'Math','Scale and perimeter',2,'math','The L-shaped garden drawing has the measurements shown. Each centimeter represents 2.5 meters. What is the perimeter of the actual garden?',['38 meters','65 meters','95 meters','120 meters'],2,'The missing sides are 13 - 8 = 5 cm and 6 - 3 = 3 cm. Perimeter = 13 + 3 + 5 + 3 + 8 + 6 = 38 cm. The actual perimeter is 38 x 2.5 = 95 meters.',{type:'garden',caption:'L-shaped garden: top 13 cm, left 6 cm, bottom-left horizontal 8 cm, upper-right vertical 3 cm. Not to scale.'});
add(61,'Math','Signed numbers',1,'math','The temperature was -7 degrees F at 5 a.m. and 4 degrees F at 9 a.m. At 11 a.m. it was 3.5 times the 9 a.m. temperature. What was the total increase from 5 a.m. to 11 a.m.?',['7 degrees F','11 degrees F','14 degrees F','21 degrees F'],3,'At 11 a.m. the temperature was 3.5 x 4 = 14 degrees F. The increase was 14 - (-7) = 21 degrees F.');
add(62,'Math','Volume',1,'math','A triangular prism has a triangular base with base 4 inches and perpendicular height 8 inches. Its prism height is 2 inches, and its lateral faces are rectangles. What is its volume?',['16 cubic inches','32 cubic inches','48 cubic inches','64 cubic inches'],1,'The triangular base area is (1/2) x 4 x 8 = 16 square inches. Multiply by the prism height: 16 x 2 = 32 cubic inches.',{type:'homework-prism',caption:'Triangular prism: triangle base 4 in, perpendicular triangle height 8 in, distance between triangular faces 2 in. Not to scale.'});
add(63,'Math','Unit rates',0,'math','The graph relates pole length x (feet) to weight y (ounces). What does the point (1, 4) represent?',['The unit rate is 4 ounces per foot.','The y-intercept is 4.','A pole 4 feet long weighs 1 ounce.','The length increases 4 feet for every ounce.'],0,'At x = 1 foot, y = 4 ounces, so one foot of pole weighs 4 ounces.',{type:'pole',caption:'Weight of pole: straight line through (0,0), (1,4), (2,8), (3,12), and (4,16); x is feet, y is ounces.'});
add(64,'Math','Signed numbers',0,'math','Which labeled point represents 2.5 + (-4.5)?',['Point E','Point F','Point G','Point H'],1,'2.5 - 4.5 = -2. Point F is located at -2.',{type:'line',points:[[-7,'E'],[-2,'F'],[2,'G'],[7,'H']],caption:'Number line with E at -7, F at -2, G at 2, and H at 7.'});
add(65,'Math','Equations',2,'math','If 9/(2x) = (3y)/8, where x and y are nonzero, what is xy?',['4','6','12','16'],2,'Cross-multiplying gives 72 = 6xy. Divide by 6 to get xy = 12.');
add(66,'Math','Percent',0,'math','A car originally costs $15,600. The dealership takes 12% off. What is the sale price?',['$13,728','$14,300','$14,400','$15,588'],0,'Pay 88% of the original price: 15,600 x 0.88 = 13,728.');
add(67,'Math','Fractions',1,'math','What is 4 2/3 divided by 2 1/2?',['15/28','1 13/15','2 1/3','3 1/3'],1,'Convert to improper fractions: (14/3) / (5/2) = (14/3)(2/5) = 28/15 = 1 13/15.');
add(68,'Math','Ratios',1,'math','A team has 36 players and 3 coaches. The ratio of assistants to players is 1:6. What is the ratio of coaches to assistants?',['1:4','1:2','2:3','5:6'],1,'There are 36 / 6 = 6 assistants. The ratio of coaches to assistants is 3:6 = 1:2.');
add(69,'Math','Fractions',0,'math','A fence post is 10 feet long. It extends 3 1/3 feet below ground. How much of the post is above ground?',['6 2/3 feet','7 1/3 feet','10 feet','13 1/3 feet'],0,'Subtract the buried part: 10 - 3 1/3 = 6 2/3 feet.');
add(70,'Math','Equations',1,'math','If p + 2r = r(p + 1) + 1 and r = 2, what is p?',['0','1','2','3'],1,'Substitute r = 2: p + 4 = 2p + 3. Subtract p and 3 from both sides to get p = 1.');
add(71,'Math','Rates and percent',2,'math','Karen reads 60 pages a day. Martina reads 25% more pages per day. Both start a 1,500-page assignment on the same day. How many days sooner does Martina finish?',['4','5','7','15'],1,'Martina reads 60 x 1.25 = 75 pages daily. Karen takes 1,500/60 = 25 days; Martina takes 1,500/75 = 20 days. The difference is 5 days.');
add(72,'Math','Inequalities',1,'math','Claire has run 650 meters. Each additional lap is 120 meters. What is the least number of complete additional laps needed to reach at least 2,500 meters?',['5','6','15','16'],3,'She needs 2,500 - 650 = 1,850 more meters. 1,850/120 = 15 5/12, so she must complete 16 more laps.');
add(73,'Math','Percent',2,'math','A company has 200 employees. Its workforce grows by 25%, then grows by 10% of the new total. How many employees does it have after both increases?',['235','260','270','275'],3,'The first increase gives 200 x 1.25 = 250. The second gives 250 x 1.10 = 275.');
add(74,'Math','Probability',2,'math','A bowl holds 12 green candies, 4 yellow candies, and some red candies. Choosing green is twice as likely as choosing red. What is the probability of choosing yellow?',['2/11','2/9','1/4','3/11'],0,'There must be 6 red candies because 12 is twice 6. There are 22 candies total, so P(yellow) = 4/22 = 2/11.');
add(1,'English','Combining sentences',2,'editing','Choose the clearest combination of these ideas: The International Space Station has housed crews since 2000. Tourists will soon be allowed to pay for visits. A round trip costs $52-$58 million, so few people can afford the experience.',[
  'The station has housed crews since 2000, but tourists may soon visit because few people can afford the $52-$58 million round trip.',
  'The station has housed crews since 2000 and will soon welcome paying tourists, but the $52-$58 million round-trip cost will put the experience beyond the reach of most people.',
  'The station has housed crews since 2000, although tourists may soon visit, so the round trip costs $52-$58 million.',
  'The station has housed crews since 2000 because tourists may soon visit, and therefore the round trip costs $52-$58 million.'
],1,'The correct sentence joins the two facts about the station, then contrasts the new opportunity with its high cost. The other choices introduce unsupported cause-and-effect relationships.');
add(2,'English','Sentence construction',1,'editing','Which sentence should be revised to fix a misplaced clause? (1) In 1976, the NBA absorbed several ABA teams, including the New York Nets, who played in the Long Island area. (2) The owner decided to take the team to New Jersey after the team had financial troubles, where the team played for thirty-five seasons. (3) The New Jersey Nets had sixteen playoff appearances, including two NBA finals appearances. (4) In 2012, the team changed ownership and returned to New York, where it now plays as the Brooklyn Nets.',['Sentence 1','Sentence 2','Sentence 3','Sentence 4'],1,'In sentence 2, "where the team played" should be next to "New Jersey," not "financial troubles." One revision is: After the team had financial troubles, the owner moved it to New Jersey, where it played for thirty-five seasons.');
add(3,'English','Precise language',0,'editing','Which revision uses the most precise language? Original: "The Appalachian Trail is a really long trail that a lot of people do each year."',['The Appalachian Trail is an extremely long trail that millions of people do each year.','The Appalachian Trail is a 2,200-mile trail that more than a million people hike each year.','The Appalachian Trail is a 2,200-mile trail that two million people hike each year.','The Appalachian Trail is a lengthy trail that a couple million people do each year.'],2,'Within the supplied choices, the third specifies a length, a number of people, and the action "hike." It is more precise than "more than a million," "lengthy," or "do."');
add(4,'English','Grammar and punctuation',1,'editing','Which pair of edits corrects this paragraph? (1) When coal was used to heat homes, it frequently left soot stains on the walls. (2) Brothers Cleo and Noah McVicker, who owned a cleaning product company created a doughy substance to remove soot. (3) Over time, as natural gas becomes more common, people had little need for soot cleansers. (4) Joe McVicker later learned that a teacher used the substance for art projects, so he remarketed it as Play-Doh.',[
  'Delete the comma after "homes"; change "becomes" to "became."',
  'Delete the comma after "homes"; change "remarketed" to "had remarketed."',
  'Insert a comma after "company"; change "becomes" to "became."',
  'Insert a comma after "company"; change "remarketed" to "had remarketed."'
],2,'The nonessential clause "who owned a cleaning product company" needs a closing comma. "Became" keeps the account in the past tense. The introductory clause in sentence 1 already has the needed comma.');
add(5,'English','Precise language',0,'volunteer','Which revision of sentence 2 uses the most precise language?',[
  'These are the people who spend their free time volunteering at animal shelters, helping with activities in community centers, or cleaning up parks.',
  'These are the people who spend their free time helping others in numerous ways at a variety of places, events, or organizations that need support.',
  'These are the people who spend their free time working at local establishments that help people, animals, or other groups in need of assistance.',
  'These are the people who spend a lot of time volunteering at places where they can help people in many ways.'
],0,'Animal shelters, community centers, and cleaning parks are specific examples. The other revisions rely on general terms such as "places" and "numerous ways."');
add(6,'English','Main claim',1,'volunteer','Which sentence should follow sentence 4 to introduce the main claim?',[
  'With that in mind, high school students should consider engaging in some form of regular volunteerism.',
  'Fortunately for students, these benefits are guaranteed to produce both immediate and long-term results.',
  'In fact, studies have confirmed that volunteerism can be beneficial for students, the family, and the community.',
  'For this reason, high school students should learn about how helping others can strengthen their communities.'
],0,'The passage argues that high school students should volunteer regularly. This choice states that claim and gives "this proposition" in sentence 5 a clear reference. Guaranteed results overstates the evidence.');
add(7,'English','Relevance',1,'volunteer','Which sentence is least relevant to the second paragraph (sentences 5-10) and should be deleted?',['Sentence 6','Sentence 7','Sentence 8','Sentence 9'],1,'The paragraph lists existing demands on students\' time. Sentence 7 describes the demands of volunteering itself, interrupting the list of school, extracurricular, family, and job commitments.');
add(8,'English','Supporting evidence',2,'volunteer','Which addition after sentence 12 best supports the third paragraph?',[
  'These students are likely to be responsible, reliable, and helpful young adults, traits that benefit people they meet.',
  'Volunteering can introduce students to people who provide references or advice when they apply for colleges or jobs.',
  'Counselors hope these students will continue volunteering through student government, hospitals, and shelters in college.',
  'Many colleges seek students who are academically successful, work well with others, and care about serving surrounding communities.'
],3,'Sentence 12 explains how admissions counselors view volunteer experience. The correct addition directly links that experience to the qualities colleges seek in applicants.');
add(9,'English','Conclusions',2,'volunteer','Which replacement for sentence 22 best reinforces the passage\'s argument?',[
  'In every city, shelters, food pantries, youth centers, and political campaigns depend on hardworking young people.',
  'Students who volunteer can learn skills, meet interesting people, open opportunities, and gain satisfaction.',
  'When students prioritize volunteering, they fit it into their schedules and soon encourage their peers to do so.',
  'Whether seeking college admission, preparing for work, or hoping to reduce stress, high school students who volunteer can help themselves as much as they help others.'
],3,'This conclusion brings together all three main supports: college admission, employment, and well-being. It also returns to the central idea that volunteers benefit as well as the people they serve.');
add(16,'English','Text structure',1,'exercise','How does the comparison in paragraphs 4 and 5 develop the excerpt\'s ideas?',[
  'It identifies why many adults can never learn a second language.',
  'It demonstrates why every study of adult language learning must include exercise.',
  'It explains why more is known about language learning in children than in adults.',
  'It explains why the researchers studied adults rather than children.'
],3,'Children acquire language readily, while adults tend to lose some language-related plasticity. This contrast establishes why adult learners are useful subjects for a study of possible improvements.');
add(17,'English','Text structure',0,'exercise','What is the structural role of the first sentence of paragraph 6, which introduces the recruitment of 40 college-age learners?',[
  'It moves from the results of the study to its procedure.',
  'It identifies the single aspect of the research that determined the results.',
  'It moves from why the study was undertaken to how it was conducted.',
  'It lists new questions for future studies.'
],2,'Paragraphs 1-5 give the background and reason for the study. Paragraph 6 begins the description of participants and procedures.');
add(18,'English','Summarizing',2,'exercise','Which statement best summarizes the study\'s procedure?',[
  'Learners matched English words to pictures and analyzed words in context, with some exercising and others seated.',
  'Researchers divided English learners into two groups, one exercising before and during lessons and one learning without exercise, then assessed their learning.',
  'All learners cycled for 20 minutes before and 15 minutes during lessons, rested, and judged whether sentences made sense.',
  'Learners studied while sitting or cycling, and their vocabulary was tested after a short break and again a month later.'
],1,'The correct summary includes assignment to comparison groups, the difference in exercise conditions, and assessment. One choice incorrectly says all learners exercised; the others omit important parts of the experimental comparison.');
add(19,'English','Research purpose',0,'exercise','Why did the researchers ask learners to judge whether words made sense in sentences?',[
  'Understanding words in context measures language mastery better than vocabulary recall alone.',
  'Every earlier study had used exactly the same task.',
  'The task was intended primarily to teach the individual words.',
  'This task only becomes difficult after a long delay.'
],0,'Paragraph 11 explains that most linguists view sentence understanding as evidence of greater language mastery than simple vocabulary improvement.');
add(20,'English','Textual evidence',2,'exercise','Which evidence best supports the claim in paragraph 17 that exercise improved learners\' use of words, beyond memorization?',[
  'The learners saw 40 words per session, repeated several times (paragraph 10).',
  'The learners judged whether sentences were accurate or nonsensical (paragraph 11).',
  'Cyclists performed better on the vocabulary tests after each lesson (paragraph 13).',
  'Cyclists became better at recognizing proper sentences than seated learners after several weeks (paragraph 14).'
],3,'The paragraph 14 result shows improved sentence comprehension, not merely a vocabulary score or a description of the testing procedure.');
add(21,'English','Author perspective',1,'exercise','What attitude toward the study does paragraph 18 reveal?',[
  'Its results support some conclusions, but those conclusions have limits.',
  'The researchers should have used strenuous rather than light exercise.',
  'Its methods were appropriate, but its findings probably cannot be repeated.',
  'Its findings about language automatically apply to all learning.'
],0,'The author notes that the study involved only college students doing light exercise. That limits conclusions about other ages or types of activity without dismissing the findings.');
add(22,'English','Textual evidence',1,'exercise','Which evidence most strongly supports the claim that questions remain about movement and learning?',[
  'The study tested only one type of exercise and one age group.',
  'Sulpizio discussed earlier research about neurochemicals.',
  'Cyclists retained learning after a month without practice.',
  'Sulpizio suggested a way to apply the findings in classrooms.'
],0,'Because the study involved college students doing light cycling, it cannot establish whether other ages or activities produce the same effects. This is an explicit unanswered question in paragraph 18.');
module.exports={title:'Homework Quiz #1',version:'homework-1-form-b-v1',questions,passages,counts:{Math:17,English:16},groups:['math','editing','volunteer','exercise']};
