const passages=require('./homework-2-passages.json');
const questions=[];
function add(source,subject,skill,level,group,prompt,choices,answer,explanation,diagram=null){
  questions.push({id:'B-'+source,source,subject,skill,level,difficulty:['Easy','Medium','Hard'][level],group,prompt,choices,answer,explanation,diagram,passage:passages[group]||null});
}

add(75,'Math','Box plots',1,'math','A taxi driver tracked daily fares for a month. According to the box plot, which statement must be true?',[
  'The day with 2 fares is an outlier.','The mean number of fares is 16.','The interquartile range is 30 fares.','About one quarter of the days had 12 to 16 fares.'
],3,'The box extends from 12 (first quartile) to 24 (third quartile), with a median of 16. The interval from 12 to 16 is one quartile, or about 25% of the data. The mean cannot be read from a box plot, and 2 is not an outlier under the usual 1.5 IQR rule.',{type:'boxplots',min:0,max:32,step:4,series:[{label:'Daily fares',values:[2,12,16,24,32]}],caption:'Daily fares box plot: minimum 2, first quartile 12, median 16, third quartile 24, maximum 32.'});
add(76,'Math','Proportional relationships',0,'math','A race has 2 water stations over 3 miles, 8 stations over 12 miles, and 12 stations over 18 miles. If x is the race length in miles and y is the number of stations, which rule fits every row?',['y = (2/3)x','y = (3/2)x','y = x + 6','y = x - 1'],0,'Each ratio y/x equals 2/3, so y = (2/3)x.');
add(77,'Math','Sampling and percent',2,'math','Of 200 surveyed residents, 142 favor a park, 38 oppose it, and 20 are undecided. If half the undecided residents vote yes, how many of 24,100 voters would you estimate will support the park?',['17,111','18,316','19,401','19,521'],1,'Estimated yes responses are 142 + 10 = 152 of 200, or 76%. Then 0.76 x 24,100 = 18,316.');
add(78,'Math','Comparing negatives',0,'math','Which number is greatest?',['-1/49','-49','-1/7','-1'],0,'All four values are negative. -1/49 is closest to zero, so it is greatest.');
add(79,'Math','Repeating decimals',1,'math','How can -13/11 be written as a decimal?',['-1.18 exactly','-1.118118...','-1.181818...','-1.818181...'],2,'13 divided by 11 is 1.181818..., with the two-digit block 18 repeating. Keep the negative sign.');
add(80,'Math','Fraction division',0,'math','A loaf needs 1/5 ounce of salt. How many loaves can a baker make using 40 ounces of salt?',['8','20','45','200'],3,'Divide the total salt by the salt per loaf: 40 / (1/5) = 40 x 5 = 200.');
add(81,'Math','Mixed numbers',2,'math','Evaluate (1 5/7 - 1 6/7) / (3 4/7 - 3 6/7).',['-1/2','-1/7','1/7','1/2'],3,'The numerator is -1/7 and the denominator is -2/7. Dividing gives (-1/7) / (-2/7) = 1/2.');
add(82,'Math','Compound inequalities',2,'math','Solve -5 <= 1 - 3x <= 4. Which interval contains every solution?',['-1 < x < 2','-1 <= x <= 2','x <= -1 or x >= 2','-1 <= x < 2'],1,'Subtract 1 to get -6 <= -3x <= 3. Divide by -3 and reverse both inequality signs: 2 >= x >= -1, or -1 <= x <= 2.');
add(83,'Math','Unit conversion',1,'math','One sind is worth 0.75 plunk. How many sinds equal 8 plunks, to the nearest hundredth?',['1.33','6.00','7.25','10.67'],3,'If 1 sind = 0.75 plunk, divide 8 by 0.75 to convert plunks to sinds: 10.666..., which rounds to 10.67.');
add(84,'Math','Expressions',1,'math','Simplify 8x - (7 + 2.5x) + 2.',['5.5x - 9','5.5x - 5','10.5x - 9','10.5x - 5'],1,'Distribute the minus sign: 8x - 7 - 2.5x + 2 = 5.5x - 5.');
add(85,'Math','Box plots',2,'math','Two exercise groups each have 30 members. Based on their age box plots, which comparison is supported?',['Each group must include someone exactly 29 years old.','Group P has more members at least 17 years old than Group Q.','The groups have equal counts of members ages 21 to 24.','Group Q has fewer members ages 19 to 27 than Group P.'],1,'Group P has a minimum age of 17, so all 30 members are at least 17. Group Q has a minimum age of 15, so at least one member is younger than 17. The other claims cannot be read from quartiles alone.',{type:'boxplots',min:15,max:33,step:3,series:[{label:'Group P',values:[17,19,24,27,33]},{label:'Group Q',values:[15,17,21,26,29]}],caption:'Ages in 30-member groups. P: minimum 17, Q1 19, median 24, Q3 27, maximum 33. Q: minimum 15, Q1 17, median 21, Q3 26, maximum 29.'});
add(86,'Math','Probability',1,'math','Jar Q has 12 balls and 1/3 are yellow. Jar R has 8 balls and 3/4 are yellow. All balls are mixed. What fraction of the combined jar is yellow?',['1/4','1/3','1/2','4/7'],2,'Jar Q has 4 yellow balls and Jar R has 6. That is 10 yellow out of 20 total, or 1/2.');
add(87,'Math','Ratios',1,'math','Gia mixes 12 pretzels with 9 raisins. Which other pretzel-to-raisin mix has the same ratio?',['6 pretzels and 18 raisins','15 pretzels and 12 raisins','18 pretzels and 15 raisins','16 pretzels and 12 raisins'],3,'Gia\'s ratio is 12:9 = 4:3. The ratio 16:12 also simplifies to 4:3.');
add(88,'Math','Substitution',1,'math','If y = 4x, simplify 3y + 2(3y + 5) - x in terms of x.',['8x + 10','32x + 10','35x + 10','36x + 10'],2,'Expand first: 3y + 6y + 10 - x = 9y + 10 - x. Substitute y = 4x to get 36x + 10 - x = 35x + 10.');
add(89,'Math','Circle area',1,'math','The two circular plates shown have diameters 18 inches and 12 inches. What is the difference between their areas?',['6pi square inches','9pi square inches','45pi square inches','180pi square inches'],2,'Their radii are 9 and 6 inches. The area difference is pi(9^2 - 6^2) = pi(81 - 36) = 45pi square inches.',{type:'plates',caption:'Two circular plates, with diameters of 18 inches and 12 inches.'});
add(90,'Math','Absolute value and percent',0,'math','For x = -4, add x to 10% of |x|. What is the result?',['-4.4','-3.6','0.4','4.4'],1,'|x| = 4, and 10% of 4 is 0.4. Then -4 + 0.4 = -3.6.');
add(91,'Math','Cube volume',0,'math','A cube has volume 512 cubic centimeters. How long is one edge?',['8 centimeters','42 2/3 centimeters','85 1/3 centimeters','128 centimeters'],0,'For a cube, volume = edge length cubed. Since 8^3 = 512, each edge is 8 centimeters.');

add(10,'English','Main idea',1,'tunnel','Which sentence would best introduce the central subject immediately after sentence 5?',[
  'Swiss voters approved funding for the tunnel in 1992.','Leaders from several countries attended the opening.','At 35.5 miles long, the Gotthard Base Tunnel runs straight beneath the Alps and is the longest and deepest railway tunnel in the world.','The tunnel has continued to reduce truck traffic on mountain roads.'
],2,'The passage explains the scale, construction, and transportation value of the Gotthard Base Tunnel. The sentence identifying its route and exceptional size introduces that focus.');
add(11,'English','Supporting details',0,'tunnel','Which addition immediately after sentence 7 best explains how a tunnel-boring machine works?',[
  'Modern builders prefer this machine to blasting with dynamite.','Its rotating cutter head grinds slowly through stone, much like a cheese grater.','Engineers had wanted a route under the mountains for years.','Builders choose different cutter heads for different geology.'
],1,'Sentence 7 names the cutter head; the correct addition explains what the head does. The other choices shift to history or selection of equipment.');
add(12,'English','Organization',1,'tunnel','Where should sentence 11, about adding concrete, go in the second paragraph?',['Before sentence 6','Between sentences 6 and 7','Between sentences 8 and 9','Between sentences 9 and 10'],3,'The paragraph follows construction from drilling and removing rock to building support, then ends with cost. Concrete belongs after the rock-removal detail in sentence 9 and before the cost in sentence 10.');
add(13,'English','Relevance',1,'tunnel','Which sentence in the third paragraph moves furthest from the paragraph\'s focus on train travel through the Gotthard tunnel?',['Sentence 13','Sentence 14','Sentence 15','Sentence 16'],3,'Sentence 16 discusses moving cars through the separate Channel Tunnel. The other sentences address the Gotthard tunnel or compare it briefly with another tunnel.');
add(14,'English','Transitions',1,'tunnel','Which opening phrase gives sentence 18 the clearest link to the tunnel\'s success?',[
  'Although the tunnel mostly serves freight,','After the tunnel took just ten years to finish,','Because construction of the Gotthard Base Tunnel succeeded,','As the number of trains inside the tunnel rises,'
],2,'The concluding idea is renewed interest in similar projects. The tunnel\'s successful completion is the reason for that interest; the other transitions introduce unsupported or narrower claims.');
add(15,'English','Conclusions',2,'tunnel','Which final sentence best returns to the passage\'s opening idea about overcoming obstacles?',[
  'The tunnel has improved the economy around the mountains.','The Gotthard Base Tunnel shows what persistence and inventive thinking can accomplish when geography creates a barrier.','The tunnel proves that workers can cooperate on a difficult job.','The government believes the construction cost will be recovered.'
],1,'The opening frames a difficult natural obstacle and human invention. The correct conclusion brings both ideas back together.');

add(23,'English','Setting',0,'nez-perce','How does paragraph 1 establish the setting for the gathering?',[
  'It describes a place rich in seasonal food where people can gather for work and celebration.','It says the characters are recalling events long after they happened.','It shows that changes at the camp are causing conflict.','It begins with characters debating where to settle.'
],0,'The salmon, berries, and camas show the land\'s abundance during the seasonal gathering.');
add(24,'English','Character motivation',1,'nez-perce','Taken together, paragraphs 4 and 6 show how the approaching cold affects The People. What do they do?',[
  'They collect food for winter and welcome a chance to celebrate together first.','They postpone the harvest so they can rest.','They abandon leisure altogether to prepare their camps.','They use the weather mainly as a chance to trade supplies.'
],0,'Paragraph 4 shows the last shared festivities before the Cold Moons; paragraph 6 shows the urgent work of preserving food.');
add(25,'English','Central idea',1,'nez-perce','What shared idea is developed by the descriptions of everyone\'s tasks in paragraphs 7 and 9?',[
  'Exploring unfamiliar places is essential.','Careful scheduling is more important than cooperation.','Weather entirely controls the community\'s decisions.','Each person contributes to the community in a useful way.'
],3,'Adults and children all take part in the camp\'s daily life, showing shared work and contribution.');
add(26,'English','Word choice',1,'nez-perce','Why does paragraph 8 repeat the word "played" as it describes the children?',[
  'To show that adults prefer watching children to working.','To suggest everyone at the camp has the same games.','To list all the available entertainment.','To show that the children practice adult responsibilities through play.'
],3,'The paragraph ends by explaining that the children learned how to live through their play.');
add(27,'English','Plot development',2,'nez-perce','What is the main effect of the questions in paragraphs 11-13 on the story?',[
  'They show that the visitors have already explained their purpose.','They build suspense by raising the possibility that the riders bring danger or news.','They resolve the uncertainty about the fifth rider.','They explain an old conflict between the riders and the camp.'
],1,'The crowd does not yet know who is arriving or what the visitors bring, so the questions increase suspense.');
add(28,'English','Figurative language',0,'nez-perce','What do "trophies of their hunt" and "paraded around" tell readers about the hunters in paragraph 20?',[
  'They have been appointed leaders.','They are hiding their supplies from the camp.','They are proud of what they accomplished.','They were invited to the camp only to be honored.'
],2,'Showing off the meat and hides reveals pride in the successful hunt.');
add(29,'English','Textual evidence',2,'nez-perce','Which detail best shows that The People remain concerned about relatives who live far away?',[
  'Families set up camp in places used by earlier generations.','The crowd wonders whether the hunters have news of families who left for Buffalo Country and never returned.','Older men guess that the riders are successful hunters.','The crowd notices a frail woman riding with the hunters.'
],1,'Wondering about distant families who have not returned directly shows an ongoing connection across distance.');
add(30,'English','Character response',1,'nez-perce','After the hunters say the fifth rider "belongs to Red Bear people" and has returned, how does the camp react?',[
  'They worry that she is a stranger.','They expect more missing relatives to arrive the same day.','They grieve because she cannot be recognized.','They are astonished and eager to welcome a long-absent member of the community.'
],3,'Paragraphs 23-25 reveal recognition, a new name, food, rest, and care for the returning woman.');
add(31,'English','Theme',2,'nez-perce','What theme emerges from the repeated camp locations in paragraph 5 and the welcome in paragraphs 23-24?',[
  'Moving camp each year weakens family ties.','The People maintain a sense of belonging across generations and distance.','Retelling every old story is the only way to keep traditions.','Choosing a name matters more than welcoming someone home.'
],1,'The familiar camp locations connect generations, and the welcome of Wat-ku-ese reconnects a person who left long ago.');

add(32,'English','Problem and solution',1,'morse','In paragraph 2, how does Morse respond when he realizes his interest in electricity is not enough to build his idea?',[
  'He returns to Yale to relearn the lectures he enjoyed.','He abandons the plan after his first experiments fail.','He asks Faraday to build the telegraph for him.','After trying batteries, magnets, and wires, he seeks help from Leonard Gale.'
],3,'Paragraph 2 presents the knowledge gap and unsuccessful attempts, then explains that Morse turned to Gale for help.');

module.exports={title:'Homework Quiz #2',version:'homework-2-form-b-v1',questions,passages,counts:{Math:17,English:16},groups:['math','tunnel','nez-perce','morse']};
