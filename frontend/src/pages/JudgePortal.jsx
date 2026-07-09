import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  RiSearchLine, RiFilterLine, RiLinkedinBoxFill, RiGlobalLine,
  RiCloseLine, RiArrowRightLine, RiUserLine, RiStarLine,
  RiBuildingLine, RiMapPinLine, RiBriefcaseLine, RiGraduationCapLine,
  RiTeamLine, RiAwardLine, RiShieldUserLine, RiArrowDownSLine
} from 'react-icons/ri';
import Button from '../components/shared/Button';
import JudgeAvatar from '../components/judge/JudgeAvatar';

const judgesData = [
  {
    "id": "indika-de-zoysa",
    "name": "Mr. Indika De Zoysa",
    "designation": "VP – Public & Government Affairs",
    "organization": "Huawei Technologies / FITIS / CSSL",
    "category": "Core National Awards & Women in AI Leadership",
    "description": "Mr. Indika De Zoysa is a prominent figure in Sri Lanka’s technology and digital policy landscape, with over two decades of leadership experience across ICT, telecommunications, public-sector digital transformation, and industry development. As the Vice President – Public & Government Affairs at Huawei Technologies Sri Lanka, he plays a pivotal role in strengthening national digital infrastructure, advancing AI adoption, and fostering strategic collaborations between government institutions and global technology ecosystems.He has served in multiple influential capacities across Sri Lanka’s ICT sector, including leadership roles within FITIS, CSSL, and other national technology bodies, where he has contributed to shaping digital policy, industry standards, and capacity-building initiatives. His work spans national-level digital transformation programs, public-sector modernization, and advocacy for emerging technologies such as AI, cloud computing, cybersecurity, and digital governance.Mr. De Zoysa is widely recognized for his contributions to public private partnerships, enabling Sri Lanka’s digital economy to accelerate through innovation, investment, and international collaboration. His engagements with ministries, regulatory bodies, and industry associations have positioned him as a key facilitator in aligning global technology capabilities with national development priorities.With extensive experience in telecommunications, enterprise solutions, and ICT strategy, he has been instrumental in promoting digital inclusion, next-generation connectivity, and technology-driven economic growth. His leadership has supported initiatives in AI readiness, digital skills development, smart government services, and industry digitalization, making him a respected voice in Sri Lanka’s evolving digital ecosystem.Mr. De Zoysa continues to advocate for responsible AI adoption, robust digital infrastructure, and future-focused technology policies that empower citizens, businesses, and government institutions. His career reflects a strong commitment to national digital advancement, industry collaboration, and the long-term vision of positioning Sri Lanka as a competitive digital nation.",
    "linkedin": "https://www.linkedin.com/in/indika-de-zoysa-7068a356/",
    "expertise": [
      "Government",
      "Industry"
    ],
    "country": "Sri Lanka",
    "experience": 22,
    "awardsJudged": 3,
    "isGrandJury": true
  },
  {
    "id": "ruvan-weerasinghe",
    "name": "Dr. Ruvan Weerasinghe",
    "designation": "Academic Dean, IIT | Former Senior Lecturer, UCSC",
    "organization": "University of Colombo",
    "category": "Core National Awards & Women in AI Leadership",
    "description": "Dr. Ruvan Weerasinghe is a distinguished academic, researcher, and technology leader with extensive expertise in artificial intelligence, natural language processing, machine learning, data science, and higher education. As the Academic Dean of the Informatics Institute of Technology (IIT) and former Senior Lecturer at the University of Colombo School of Computing (UCSC), he has played a pivotal role in advancing computing education, AI research, and technology innovation in Sri Lanka.\n\nThroughout his academic and professional career, Dr. Weerasinghe has led numerous research and development initiatives in artificial intelligence, language technologies, intelligent information systems, and digital transformation. His work has contributed significantly to strengthening AI research capacity, fostering industry-academia collaboration, and developing innovative technology solutions that address real-world challenges.\n\nA passionate advocate for AI education and responsible innovation, Dr. Weerasinghe actively supports curriculum development, research excellence, and the adoption of emerging technologies across academia, industry, and the public sector. Through his leadership, mentoring, and policy contributions, he continues to shape the next generation of AI professionals while contributing to the growth of Sri Lanka's digital and artificial intelligence ecosystem.",
    "linkedin": "https://www.linkedin.com/in/ruvanweerasinghe/",
    "expertise": [
      "Academia",
      "AI Research"
    ],
    "country": "Sri Lanka",
    "experience": 28,
    "awardsJudged": 4,
    "isGrandJury": true
  },
  {
    "id": "waruna-sri-dhanapala",
    "name": "Dr. Waruna Sri Dhanapala",
    "designation": "Secretary",
    "organization": "Ministry of Digital Economy",
    "category": "Core National Awards & Women in AI Leadership",
    "description": "Dr. Waruna Sri Dhanapala is a distinguished public sector leader and senior officer of the Sri Lanka Administrative Service with over 25 years of experience in public administration, digital governance, policy development, and international cooperation. Since November 2024, he has served as the Secretary to the Ministry of Digital Economy while also serving as the Chairman of the Telecommunication Regulatory Commission of Sri Lanka (TRCSL). He previously served as the inaugural Acting Director General of the Data Protection Authority of Sri Lanka from 2023 to 2024, leading the country's early implementation of data protection and digital governance initiatives.\n\nThroughout his career, Dr. Dhanapala has held numerous senior leadership positions at the Presidential Secretariat and several key ministries, including Defence, Digital Infrastructure, Home Affairs, Environment, and Foreign Affairs. He has also contributed to national policy development through the National Administrative Reforms Council and has served as a Visiting Research Fellow at the Asian Development Bank Institute (ADBI) in Tokyo.\n\nFrom 2012 to 2014, he served as Minister Counsellor at the Permanent Mission of Sri Lanka to the United Nations in New York, where he contributed to the negotiation and development of the United Nations Sustainable Development Goals (SDGs) and the adoption of the UN Resolution establishing World Youth Skills Day. In 2013, he was unanimously elected Vice Chair of the United Nations General Assembly Second Committee (Economic and Financial), representing the Asia-Pacific Group, and chaired negotiations on global resolutions relating to technology, ICT, sustainable development, development financing, and international economic cooperation.\n\nDr. Dhanapala holds a Master's Degree in International Development Studies from the National Graduate Institute for Policy Studies (GRIPS), Japan, and a Master's Degree in Public Administration from the Postgraduate Institute of Management (PIM), University of Sri Jayewardenepura. He earned his BSc (Special) Degree in Geology and Computer Science from the University of Peradeniya. He is a Professional Member of the Computer Society of Sri Lanka (CSSL), a Council Member of the Sri Lanka National Commission for UNESCO, a member of the Council and Graduate Studies Board of the University of Kelaniya, and serves as the General Secretary of the Japanese Graduates' Alumni Association of Sri Lanka (JAGAAS). Through his leadership, he continues to drive Sri Lanka's digital transformation agenda, strengthen data governance, and promote innovation-led public sector modernization.",
    "linkedin": "https://www.linkedin.com/in/waruna-sri-dhanapala-5aa89216/",
    "expertise": [
      "Government",
      "Standards"
    ],
    "country": "Sri Lanka",
    "experience": 26,
    "awardsJudged": 3,
    "isGrandJury": true
  },
  {
    "id": "lakmini-wijesundara",
    "name": "Ms. Lakmini Wijesundara",
    "designation": "Co-Founder & CEO",
    "organization": "BOARDPAC",
    "category": "Core National Awards & Women in AI Leadership",
    "description": "Lakmini Wijesundara is a globally recognized technology entrepreneur and business leader with extensive expertise in digital transformation, corporate governance, enterprise software, and innovation. As the Co-Founder and Chief Executive Officer of BOARDPAC, she has led the development and global expansion of one of the world's leading board management platforms, enabling organizations across multiple continents to strengthen governance, enhance decision-making, and improve operational excellence through secure digital solutions.\n\nUnder her leadership, BOARDPAC has become a trusted governance platform for leading enterprises, financial institutions, and public sector organizations, earning international recognition for technological innovation and excellence. She has been instrumental in driving digital governance initiatives while positioning Sri Lankan technology on the global stage.\n\nLakmini is widely recognized for championing innovation, entrepreneurship, and the responsible adoption of emerging technologies to transform organizations. She is also a passionate advocate for empowering women in technology and leadership, mentoring aspiring entrepreneurs, and fostering inclusive digital ecosystems.\n\nThroughout her career, she has received numerous national and international accolades for entrepreneurship, business leadership, and technology innovation. Through her vision and leadership, she continues to advance digital governance, inspire the next generation of technology leaders, and contribute to strengthening Sri Lanka's global reputation as a hub for enterprise technology and innovation.",
    "linkedin": "https://www.linkedin.com/in/lakminiwijesundera/",
    "expertise": [
      "Startup",
      "Industry"
    ],
    "country": "Sri Lanka",
    "experience": 20,
    "awardsJudged": 2,
    "isGrandJury": true
  },
  {
    "id": "international-judge-core",
    "name": "International Judge",
    "designation": "TBI",
    "organization": "TBI",
    "category": "Core National Awards & Women in AI Leadership",
    "description": "International expert contributing global perspectives on AI governance and innovation.",
    "linkedin": "",
    "expertise": [
      "AI Research",
      "Standards"
    ],
    "country": "United States",
    "experience": 18,
    "awardsJudged": 2,
    "isGrandJury": true
  },
  {
    "id": "sltmobitel-core",
    "name": "SLTMOBITEL Member",
    "designation": "TBI",
    "organization": "TBI",
    "category": "Core National Awards & Women in AI Leadership",
    "description": "Industry representative supporting national AI excellence and digital innovation.",
    "linkedin": "",
    "expertise": [
      "Telecom",
      "Industry"
    ],
    "country": "Sri Lanka",
    "experience": 15,
    "awardsJudged": 1,
    "isGrandJury": false
  },
  {
    "id": "harsha-subasinghe",
    "name": "Mr. Harsha Subasinghe",
    "designation": "Founder & CEO",
    "organization": "CodeGen",
    "category": "AI in Agriculture",
    "description": "Harsha Subasinghe is a renowned technology entrepreneur, software architect, and business leader with extensive experience in artificial intelligence, enterprise software engineering, digital transformation, and innovation. As the Founder and Chief Executive Officer of CodeGen International, he has built one of Sri Lanka's most successful global technology companies, delivering cutting-edge software solutions to clients across the travel, healthcare, finance, and enterprise sectors.\n\n                  A passionate advocate for AI-driven innovation, Harsha has been instrumental in advancing research and the practical application of artificial intelligence to address complex business and societal challenges. Under his leadership, CodeGen has invested significantly in AI, machine learning, automation, and data-driven technologies, fostering a culture of innovation while developing globally competitive products.\n\n                  Beyond the technology industry, Harsha actively supports initiatives that leverage AI for sustainable development, including smart agriculture, environmental sustainability, and digital transformation across industries. He is widely recognized for nurturing technology talent, promoting entrepreneurship, and contributing to the growth of Sri Lanka's innovation ecosystem through research, collaboration, and industry leadership.",
    "linkedin": "https://www.linkedin.com/in/harsha-subasinghe-9898866b/",
    "expertise": [
      "Industry",
      "AI Research",
      "Startup"
    ],
    "country": "Sri Lanka",
    "experience": 20,
    "awardsJudged": 2,
    "isGrandJury": false
  },
  {
    "id": "heminda-jayaweera",
    "name": "Mr. Heminda Jayaweera",
    "designation": "Executive Director",
    "organization": "TRACE Sri Lanka",
    "category": "AI in Agriculture",
    "description": "Heminda Jayaweera is an accomplished innovation strategist and technology ecosystem leader with extensive experience in entrepreneurship, startup development, digital transformation, and innovation-driven economic growth. As the Executive Director of TRACE Sri Lanka, he plays a pivotal role in fostering collaboration between industry, academia, government, and startups to accelerate the adoption of emerging technologies and strengthen Sri Lanka's innovation ecosystem.\n\n                   Under his leadership, TRACE has become a leading innovation hub, supporting technology startups, research commercialization, and industry partnerships while creating opportunities for entrepreneurs to develop globally competitive solutions. Heminda is a strong advocate for the application of artificial intelligence, digital technologies, and innovation to address challenges across sectors, including agriculture, sustainability, education, and enterprise development.\n\n                  He has actively contributed to numerous national initiatives that promote technology entrepreneurship, capacity building, and innovation-led economic development. Passionate about empowering the next generation of innovators, Heminda continues to champion collaboration, knowledge sharing, and technology adoption to position Sri Lanka as a competitive player in the global digital economy.",
    "linkedin": "https://www.linkedin.com/in/heminda/",
    "expertise": [
      "Startup",
      "Agriculture"
    ],
    "country": "Sri Lanka",
    "experience": 18,
    "awardsJudged": 2,
    "isGrandJury": false
  },
  {
    "id": "buddhi-marambe",
    "name": "Prof. Buddhi Marambe",
    "designation": "Professor, Faculty of Agriculture",
    "organization": "University of Peradeniya",
    "category": "AI in Agriculture",
    "description": "Prof. Buddhi Marambe is a distinguished academic, agricultural scientist, and researcher with extensive expertise in agronomy, sustainable agriculture, food security, climate-smart farming, and agricultural policy. As a Professor in the Faculty of Agriculture at the University of Peradeniya, he has made significant contributions to agricultural research, education, and policy development, both nationally and internationally.\n\nThroughout his academic career, Prof. Marambe has led and collaborated on numerous research initiatives focused on sustainable crop production, climate resilience, precision agriculture, and the application of science and emerging technologies to improve agricultural productivity. His work has supported evidence-based policymaking and the adoption of innovative farming practices that enhance food security while promoting environmental sustainability.\n\nA respected advisor, author, and speaker, Prof. Marambe has worked closely with government institutions, international organizations, research bodies, and industry stakeholders to advance agricultural innovation and rural development. He is a strong advocate for leveraging digital technologies, artificial intelligence, and data-driven decision-making to build resilient, efficient, and sustainable agricultural systems for the future.",
    "linkedin": "https://www.linkedin.com/in/buddhi-marambe-a52aa544/",
    "expertise": [
      "Academia",
      "Agriculture"
    ],
    "country": "Sri Lanka",
    "experience": 30,
    "awardsJudged": 4,
    "isGrandJury": false
  },
  {
    "id": "shehani-seneviratne",
    "name": "Ms. Shehani Seneviratne",
    "designation": "Chairperson, SLASSCOM (2025/26) | COO",
    "organization": "99x",
    "category": "AI in Banking, Finance & Insurance",
    "description": "Shehani Seneviratne is a distinguished technology executive and digital transformation leader with extensive experience in software engineering, product innovation, organizational leadership, and business strategy. As the Chief Operating Officer of 99x and Chairperson of SLASSCOM for 2025/26, she plays a pivotal role in advancing Sri Lanka's technology industry, fostering innovation, and strengthening the country's global digital competitiveness.\n\n                Throughout her career, Shehani has led large-scale technology initiatives, championing agile delivery, engineering excellence, and customer-centric product development for international markets. She is a passionate advocate for the responsible adoption of emerging technologies, including artificial intelligence, cloud computing, and data-driven solutions, enabling organizations to accelerate digital transformation and deliver sustainable business value.\n\n                Beyond her corporate leadership, Shehani actively contributes to the growth of Sri Lanka's ICT ecosystem by promoting industry-academia collaboration, talent development, diversity in technology, and entrepreneurship. She is widely recognized for empowering future technology leaders and driving initiatives that position Sri Lanka as a leading destination for digital innovation, AI, and software excellence.",
    "linkedin": "https://www.linkedin.com/in/shehaniseneviratne/",
    "expertise": [
      "Industry",
      "Startup"
    ],
    "country": "Sri Lanka",
    "experience": 22,
    "awardsJudged": 3,
    "isGrandJury": false
  },
  {
    "id": "dhananath-fernando",
    "name": "Mr. Dhananath Fernando",
    "designation": "Chief Executive Officer",
    "organization": "Advocata Institute",
    "category": "AI in Banking, Finance & Insurance",
    "description": "Dhananath Fernando is a distinguished economist, public policy expert, and thought leader with extensive experience in economic policy, governance, regulatory reform, and market-oriented development. As the Chief Executive Officer of Advocata Institute, he leads research and policy initiatives that promote evidence-based reforms, economic resilience, and innovation-driven growth in Sri Lanka.\n\n                Throughout his career, Dhananath has worked closely with government institutions, private sector organizations, international development partners, and academia to address key policy challenges in fiscal management, financial markets, trade, public sector modernization, and digital transformation. He is widely recognized for translating complex economic issues into practical policy recommendations that foster sustainable and inclusive economic development.\n\n                A strong advocate for technology-enabled governance and innovation, Dhananath actively promotes the responsible adoption of artificial intelligence, digital finance, and data-driven policymaking to enhance institutional efficiency and financial inclusion. Through his research, public engagement, and policy advocacy, he continues to contribute to strengthening Sri Lanka's economic competitiveness and supporting the country's transition toward a digitally empowered economy.",
    "linkedin": "https://www.linkedin.com/in/dhananath-fernando-24970034/",
    "expertise": [
      "Finance",
      "Government"
    ],
    "country": "Sri Lanka",
    "experience": 15,
    "awardsJudged": 1,
    "isGrandJury": false
  },
  {
    "id": "channa-de-silva",
    "name": "Mr. Channa De Silva",
    "designation": "CEO",
    "organization": "LankaPay",
    "category": "AI in Banking, Finance & Insurance",
    "description": "Channa De Silva is a distinguished fintech executive and digital payments leader with extensive experience in financial technology, electronic payment systems, digital banking, and financial infrastructure development. As the Chief Executive Officer of LankaPay, he has been instrumental in driving Sri Lanka's national payment ecosystem, enabling secure, efficient, and inclusive digital financial services that support the country's transition toward a cashless economy.\n\nThroughout his career, Channa has led the development and expansion of innovative payment platforms and financial technologies that enhance interoperability, financial inclusion, and transaction security. Under his leadership, LankaPay has introduced and strengthened several national payment initiatives, fostering collaboration between banks, financial institutions, fintech companies, and regulators to accelerate digital transformation across the financial sector.\n\nA passionate advocate for innovation in financial services, Channa actively promotes the adoption of artificial intelligence, digital identity, cybersecurity, and data-driven technologies to modernize payment infrastructure and improve customer experiences. He continues to contribute to shaping Sri Lanka's fintech landscape by championing technological innovation, regulatory collaboration, and sustainable digital financial ecosystems that support economic growth and financial inclusion.",
    "linkedin": "https://www.linkedin.com/in/channadesilva/",
    "expertise": [
      "Finance",
      "Industry"
    ],
    "country": "Sri Lanka",
    "experience": 25,
    "awardsJudged": 3,
    "isGrandJury": false
  },
  {
    "id": "vajira-dissanayake",
    "name": "Prof. Vajira H.W. Dissanayake",
    "designation": "Dean, Faculty of Medicine",
    "organization": "University of Colombo",
    "category": "AI in Healthcare & Life Sciences",
    "description": "Prof. Vajira H.W. Dissanayake is a distinguished physician, academic, and medical informatics expert with internationally recognized expertise in genomics, digital health, precision medicine, and artificial intelligence in healthcare. As the Dean of the Faculty of Medicine at the University of Colombo, he has played a pivotal role in advancing medical education, biomedical research, and the integration of emerging technologies into healthcare delivery and clinical practice.\n\n                  Throughout his career, Prof. Dissanayake has led numerous national and international initiatives in human genetics, genomic medicine, health informatics, and digital transformation within the healthcare sector. His research and leadership have significantly contributed to the development of innovative, technology-enabled healthcare solutions that improve patient outcomes, strengthen clinical decision-making, and support evidence-based medical practice.\n\n                  A strong advocate for interdisciplinary collaboration, Prof. Dissanayake actively promotes the responsible adoption of artificial intelligence, big data analytics, and precision medicine to transform healthcare systems and advance life sciences research. Through his academic leadership, policy contributions, and international collaborations, he continues to shape the future of healthcare innovation while fostering excellence in medical education, scientific research, and digital health development.",
    "linkedin": "https://www.linkedin.com/in/vajirahwd/",
    "expertise": [
      "Academia",
      "Healthcare"
    ],
    "country": "Sri Lanka",
    "experience": 32,
    "awardsJudged": 4,
    "isGrandJury": false
  },
  {
    "id": "nishan-siriwardhana",
    "name": "Dr. Nishan Siriwardhana",
    "designation": "President / Specialist Health Informatics",
    "organization": "Sri Lanka College of Health Informatics",
    "category": "AI in Healthcare & Life Sciences",
    "description": "Dr. Nishan Siriwardhana is a distinguished consultant physician and health informatics specialist with extensive expertise in digital health, clinical informatics, healthcare information systems, and medical technology innovation. As the President of the Sri Lanka College of Health Informatics, he has played a leading role in advancing the adoption of digital health technologies, health information standards, and data-driven healthcare across Sri Lanka.\n\nThroughout his career, Dr. Siriwardhana has contributed to the design, implementation, and governance of national health information systems that enhance patient care, clinical decision-making, and healthcare service delivery. He has worked closely with healthcare institutions, government agencies, academic organizations, and international partners to promote interoperable health information systems, digital transformation, and evidence-based healthcare practices.\n\nA passionate advocate for artificial intelligence in healthcare, Dr. Siriwardhana actively supports the responsible integration of AI, machine learning, clinical decision support systems, and health data analytics to improve diagnosis, disease surveillance, healthcare management, and public health outcomes. Through his leadership, research, and professional contributions, he continues to advance Sri Lanka's digital health ecosystem while fostering innovation, collaboration, and excellence in health informatics.",
    "linkedin": "https://www.linkedin.com/in/nishan-siriwardena-16256623/",
    "expertise": [
      "Healthcare",
      "AI Research"
    ],
    "country": "Sri Lanka",
    "experience": 20,
    "awardsJudged": 2,
    "isGrandJury": false
  },
  {
    "id": "chitranganie-mubarak",
    "name": "Mrs. Chitranganie Mubarak",
    "designation": "Former Chairperson",
    "organization": "ICTA",
    "category": "AI in Healthcare & Life Sciences",
    "description": "Dr. Nishan Siriwardhana is a distinguished health informatics specialist, physician, and digital health leader with extensive expertise in healthcare information systems, clinical informatics, digital transformation, and health data governance. As the President of the Sri Lanka College of Health Informatics, he has been at the forefront of advancing health informatics education, research, and the adoption of innovative digital technologies across Sri Lanka's healthcare sector.\n\n                  Throughout his career, Dr. Siriwardhana has contributed to the design, implementation, and enhancement of health information systems that improve clinical workflows, patient care, and evidence-based decision-making. He has worked closely with healthcare institutions, government agencies, academic organizations, and international partners to promote the effective use of health data, interoperability standards, and digital health solutions.\n\n                  A strong advocate for the responsible integration of artificial intelligence into healthcare, Dr. Siriwardhana actively supports the application of AI, machine learning, and data analytics to strengthen disease surveillance, clinical decision support, healthcare management, and public health outcomes. Through his leadership, research, and policy contributions, he continues to drive innovation that enhances healthcare quality, efficiency, and accessibility while fostering the growth of Sri Lanka's digital health ecosystem.",
    "linkedin": "https://www.linkedin.com/in/chitranganie-mubarak-ab6111119/",
    "expertise": [
      "Government",
      "Healthcare"
    ],
    "country": "Sri Lanka",
    "experience": 25,
    "awardsJudged": 3,
    "isGrandJury": false
  },
  {
    "id": "oshada-senanayake",
    "name": "Mr. Oshada Senanayake",
    "designation": "Director",
    "organization": "Brandix",
    "category": "AI in Manufacturing & Industry 5.0",
    "description": "Oshada Senanayake is a distinguished business and technology leader with extensive experience in digital transformation, advanced manufacturing, operational excellence, and innovation within the apparel and industrial sectors. As a Director at Brandix, he plays a strategic role in driving enterprise transformation by integrating advanced technologies, data-driven decision-making, and intelligent manufacturing practices across one of South Asia's leading apparel organizations.\n\nThroughout his career, Oshada has championed initiatives that enhance productivity, supply chain resilience, sustainability, and operational efficiency through the adoption of emerging technologies. He is a strong advocate for Industry 5.0 principles, promoting collaboration between human expertise and intelligent automation to create smarter, more agile, and sustainable manufacturing ecosystems.\n\nPassionate about innovation and continuous improvement, Oshada actively supports the application of artificial intelligence, industrial IoT, advanced analytics, and automation to strengthen manufacturing competitiveness. Through his leadership, he continues to contribute to the advancement of Sri Lanka's industrial sector while fostering a culture of digital innovation and operational excellence.",
    "linkedin": "https://www.linkedin.com/in/oshada/",
    "expertise": [
      "Industry",
      "Telecom"
    ],
    "country": "Sri Lanka",
    "experience": 18,
    "awardsJudged": 2,
    "isGrandJury": false
  },
  {
    "id": "ajith-madurapperuma",
    "name": "Dr. Ajith P. Madurapperuma",
    "designation": "Deputy Vice-Chancellor",
    "organization": "Open University of Sri Lanka",
    "category": "AI in Manufacturing & Industry 5.0",
    "description": "Dr. Ajith P. Madurapperuma is a distinguished academic, researcher, and technology leader with extensive expertise in computer science, artificial intelligence, software engineering, intelligent systems, and digital transformation. As the Deputy Vice-Chancellor of the Open University of Sri Lanka, he has played a significant role in advancing higher education, interdisciplinary research, and technology-driven innovation across academia and industry.\n\n                  Throughout his academic career, Dr. Madurapperuma has contributed to numerous research initiatives in artificial intelligence, automation, data analytics, and emerging technologies, with a strong focus on developing practical solutions for industrial and societal challenges. His work promotes collaboration between universities, research institutions, and industry partners to accelerate technology transfer and innovation.\n\n                  A passionate advocate for Industry 5.0, Dr. Madurapperuma actively supports the integration of artificial intelligence, intelligent automation, robotics, and digital technologies into modern manufacturing systems. Through his leadership in research, education, and policy development, he continues to empower the next generation of innovators while contributing to the advancement of smart industries and sustainable technological development.",
    "linkedin": "https://www.linkedin.com/in/ajith-madurapperuma-2031354/",
    "expertise": [
      "Academia",
      "Industry"
    ],
    "country": "Sri Lanka",
    "experience": 28,
    "awardsJudged": 3,
    "isGrandJury": false
  },
  {
    "id": "international-judge-manufacturing",
    "name": "International Judge",
    "designation": "TBI",
    "organization": "TBI",
    "category": "AI in Manufacturing & Industry 5.0",
    "description": "Global specialist in Industry 5.0, automation, and AI-driven industrial transformation.",
    "linkedin": "",
    "expertise": [
      "Industry",
      "Standards"
    ],
    "country": "Germany",
    "experience": 20,
    "awardsJudged": 2,
    "isGrandJury": false
  },
  {
    "id": "sltmobitel-manufacturing",
    "name": "SLTMOBITEL Member",
    "designation": "TBI",
    "organization": "TBI",
    "category": "AI in Manufacturing & Industry 5.0",
    "description": "Industry representative supporting AI adoption in manufacturing and industrial innovation.",
    "linkedin": "",
    "expertise": [
      "Telecom",
      "Industry"
    ],
    "country": "Sri Lanka",
    "experience": 15,
    "awardsJudged": 1,
    "isGrandJury": false
  },
  {
    "id": "roshan-ragel",
    "name": "Prof. Roshan Ragel",
    "designation": "Professor, Dept. of Computer Engineering",
    "organization": "University of Peradeniya",
    "category": "AI in Education",
    "description": "Prof. Roshan Ragel is a distinguished academic, computer engineer, and researcher with extensive expertise in artificial intelligence, computer architecture, embedded systems, cybersecurity, and high-performance computing. As a Professor in the Department of Computer Engineering at the University of Peradeniya, he has made significant contributions to engineering education, research, and the advancement of computing technologies in Sri Lanka.\n\nThroughout his academic career, Prof. Ragel has led numerous research initiatives in artificial intelligence, intelligent systems, computer engineering, and digital technologies while mentoring undergraduate and postgraduate researchers. His work bridges academic research with real-world applications, fostering innovation in emerging technologies and strengthening collaboration between academia and industry.\n\nA passionate advocate for technology-enabled education, Prof. Ragel actively promotes the integration of artificial intelligence, data-driven learning, and digital platforms to enhance teaching, research, and educational outcomes. Through his leadership in research, curriculum development, and academic excellence, he continues to contribute to developing the next generation of technology professionals and advancing Sri Lanka's digital innovation ecosystem.",
    "linkedin": "https://www.linkedin.com/in/roshanragel/",
    "expertise": [
      "Academia",
      "AI Research"
    ],
    "country": "Sri Lanka",
    "experience": 22,
    "awardsJudged": 2,
    "isGrandJury": false
  },
  {
    "id": "sampath-jayasundara",
    "name": "Mr. Sampath Jayasundara",
    "designation": "Vice Chairman 1, SLASSCOM | Director/CEO",
    "organization": "hSenid Business Solutions",
    "category": "AI in Education",
    "description": "Sampath Jayasundara is a distinguished technology executive and business leader with extensive experience in enterprise software, digital transformation, human capital management, and innovation-driven business strategy. As the Director and Chief Executive Officer of hSenid Business Solutions and Vice Chairman 1 of SLASSCOM, he has played a significant role in strengthening Sri Lanka's ICT industry while driving the development of globally competitive software solutions.\n\nThroughout his career, Sampath has championed the adoption of emerging technologies, including artificial intelligence, cloud computing, automation, and data analytics, to transform workforce management and enterprise operations. Under his leadership, hSenid Business Solutions has continued to innovate in HR technology, delivering intelligent digital platforms that serve organizations across international markets.\n\nPassionate about developing future-ready talent, Sampath actively promotes collaboration between industry and academia, supports digital skills development, and advocates for AI-enabled education and workforce transformation. Through his leadership in both industry and the national technology ecosystem, he continues to contribute to innovation, entrepreneurship, and the advancement of Sri Lanka as a global technology destination.",
    "linkedin": "https://www.linkedin.com/in/sampathjayasundara/",
    "expertise": [
      "Industry",
      "Startup"
    ],
    "country": "Sri Lanka",
    "experience": 20,
    "awardsJudged": 2,
    "isGrandJury": false
  },
  {
    "id": "international-judge-education",
    "name": "International Judge",
    "designation": "TBI",
    "organization": "TBI",
    "category": "AI in Education",
    "description": "International expert in AI-enabled learning systems and education technology.",
    "linkedin": "",
    "expertise": [
      "Academia",
      "AI Research"
    ],
    "country": "United Kingdom",
    "experience": 18,
    "awardsJudged": 2,
    "isGrandJury": false
  },
  {
    "id": "nishan-mendis",
    "name": "Mr. Nishan Mendis",
    "designation": "Former Chairman",
    "organization": "SLASSCOM (2024/25)",
    "category": "AI in Media",
    "description": "Nishan Mendis is a distinguished technology executive and digital transformation leader with extensive experience in software engineering, enterprise technology, innovation strategy, and business leadership. As the Former Chairman of SLASSCOM (2024/25), he played a key role in strengthening Sri Lanka's ICT industry by promoting technology innovation, global collaboration, and the growth of the country's digital economy.\n\nThroughout his career, Nishan has led the delivery of large-scale digital transformation initiatives, helping organizations leverage emerging technologies to enhance operational efficiency, customer engagement, and business value. He is a strong advocate for the responsible adoption of artificial intelligence, cloud technologies, and data-driven innovation to accelerate enterprise modernization and digital competitiveness.\n\nBeyond corporate leadership, Nishan actively supports industry-academia collaboration, technology entrepreneurship, and digital skills development. His contributions continue to foster innovation across Sri Lanka's technology ecosystem while encouraging the application of AI and digital technologies to transform industries, including media, communications, and digital content.",
    "linkedin": "https://www.linkedin.com/in/nishan-mendis-64443b42/",
    "expertise": [
      "Industry",
      "AI Research"
    ],
    "country": "Sri Lanka",
    "experience": 22,
    "awardsJudged": 2,
    "isGrandJury": false
  },
  {
    "id": "vajeeendra-kandegamage",
    "name": "Mr. Vajeeendra S. Kandegamage",
    "designation": "Former Chairman",
    "organization": "NBQSA",
    "category": "AI in Media",
    "description": "Vajeeendra S. Kandegamage is a distinguished technology professional, software engineering leader, and ICT industry veteran with extensive expertise in software quality, digital innovation, enterprise technology, and information systems. As the Former Chairman of the National Best Quality ICT Awards (NBQSA), he has played a significant role in promoting excellence in software development, innovation, and technology-driven solutions across Sri Lanka.\n\nThroughout his career, Vajeeendra has contributed to numerous initiatives that encourage innovation, technology entrepreneurship, and the adoption of emerging digital technologies. He has actively supported the recognition and development of high-quality ICT products while fostering collaboration between academia, industry, and professional organizations to strengthen Sri Lanka's digital ecosystem.\n\nA passionate advocate for technological excellence, Vajeeendra promotes the responsible application of artificial intelligence, digital platforms, and intelligent information systems to enhance productivity, digital communications, and media innovation. Through his leadership, mentoring, and industry engagement, he continues to contribute to advancing Sri Lanka's technology landscape and nurturing the next generation of ICT professionals.",
    "linkedin": "https://www.linkedin.com/in/vajeendrask/",
    "expertise": [
      "Industry",
      "Standards"
    ],
    "country": "Sri Lanka",
    "experience": 25,
    "awardsJudged": 3,
    "isGrandJury": false
  },
  {
    "id": "international-judge-media",
    "name": "International Judge",
    "designation": "TBI",
    "organization": "TBI",
    "category": "AI in Media",
    "description": "Global media-tech expert evaluating AI innovation in content and communications.",
    "linkedin": "",
    "expertise": [
      "Industry",
      "AI Research"
    ],
    "country": "Singapore",
    "experience": 15,
    "awardsJudged": 2,
    "isGrandJury": false
  },
  {
    "id": "sltmobitel-media",
    "name": "SLTMOBITEL Member",
    "designation": "TBI",
    "organization": "TBI",
    "category": "AI in Media",
    "description": "Industry representative supporting AI adoption in media and digital communications.",
    "linkedin": "",
    "expertise": [
      "Telecom",
      "Industry"
    ],
    "country": "Sri Lanka",
    "experience": 15,
    "awardsJudged": 1,
    "isGrandJury": false
  },
  {
    "id": "chalinda-abeykoon",
    "name": "Mr. Chalinda Abeykoon",
    "designation": "Managing Partner",
    "organization": "nVentures",
    "category": "Innovation & Future-Focused Awards",
    "description": "Chalinda Abeykoon is a distinguished entrepreneur, venture builder, and innovation ecosystem leader with extensive experience in startup development, venture capital, technology commercialization, and business strategy. As the Managing Partner of nVentures, he works closely with founders, investors, and corporate partners to accelerate the growth of high-potential technology startups and foster a culture of innovation across Sri Lanka and the region.\n\nThroughout his career, Chalinda has actively supported entrepreneurial ecosystems by mentoring founders, facilitating strategic investments, and helping startups scale innovative products for global markets. He is a strong advocate for leveraging artificial intelligence, emerging technologies, and digital innovation to solve complex business challenges and create sustainable economic value.\n\nPassionate about empowering the next generation of innovators, Chalinda continues to contribute to strengthening Sri Lanka's startup ecosystem through collaboration, knowledge sharing, and initiatives that promote technology entrepreneurship, venture creation, and innovation-led growth.",
    "linkedin": "https://www.linkedin.com/in/chalindaabeykoon/",
    "expertise": [
      "Venture Capital",
      "Startup"
    ],
    "country": "Sri Lanka",
    "experience": 18,
    "awardsJudged": 3,
    "isGrandJury": false
  },
  {
    "id": "asela-gunawardana",
    "name": "Mr. Asela Gunawardana",
    "designation": "Head of Operations",
    "organization": "Lankan Angel Network",
    "category": "Innovation & Future-Focused Awards",
    "description": "Asela Gunawardana is an experienced startup ecosystem professional and investment leader with extensive expertise in entrepreneurship, venture funding, business development, and innovation management. As the Head of Operations at the Lankan Angel Network, he plays a vital role in connecting promising startups with investors while supporting founders throughout their growth journey.\n\nThroughout his career, Asela has worked closely with entrepreneurs, angel investors, incubators, and innovation partners to strengthen Sri Lanka's startup ecosystem and encourage the commercialization of innovative technologies. He actively supports ventures developing solutions in artificial intelligence, digital platforms, fintech, healthtech, and other emerging sectors.\n\nA passionate advocate for innovation-driven economic growth, Asela continues to foster collaboration between startups, investors, academia, and industry while promoting investment opportunities that accelerate the development of globally competitive technology companies.",
    "linkedin": "https://www.linkedin.com/in/aselagun/",
    "expertise": [
      "Venture Capital",
      "Startup"
    ],
    "country": "Sri Lanka",
    "experience": 15,
    "awardsJudged": 2,
    "isGrandJury": false
  },
  {
    "id": "madu-ratnayake",
    "name": "Mr. Madu Ratnayake",
    "designation": "Co-Founder & President",
    "organization": "Scybers | Founder President TiE Colombo",
    "category": "Innovation & Future-Focused Awards",
    "description": "Madu Ratnayake is a distinguished technology entrepreneur, cybersecurity leader, and startup ecosystem builder with extensive experience in enterprise technology, digital transformation, cybersecurity, and innovation leadership. As the Co-Founder and President of Scybers and Founder President of TiE Colombo, he has played a significant role in fostering entrepreneurship, mentoring startups, and strengthening Sri Lanka's technology innovation ecosystem.\n\nThroughout his career, Madu has championed the adoption of emerging technologies, including artificial intelligence, cybersecurity, cloud computing, and digital platforms to help organizations navigate an increasingly connected world. Through TiE Colombo, he actively supports entrepreneurs by facilitating mentorship, investment opportunities, industry collaboration, and access to global innovation networks.\n\nPassionate about building a resilient and innovation-driven economy, Madu continues to empower founders, technology professionals, and young innovators while promoting responsible AI adoption, cybersecurity excellence, and sustainable technology entrepreneurship.",
    "linkedin": "https://www.linkedin.com/in/maduratnayake/",
    "expertise": [
      "Industry",
      "Startup",
      "Legal"
    ],
    "country": "Sri Lanka",
    "experience": 25,
    "awardsJudged": 4,
    "isGrandJury": true
  },
  {
    "id": "irfan-ahamed",
    "name": "Mr. Irfan Ahamed",
    "designation": "COO – Wearables and Growth Platforms",
    "organization": "MAS Holdings",
    "category": "Innovation & Future-Focused Awards",
    "description": "Irfan Ahamed is a distinguished business leader and innovation executive with extensive experience in advanced manufacturing, wearable technology, digital transformation, and product innovation. As the Chief Operating Officer – Wearables and Growth Platforms at MAS Holdings, he leads strategic initiatives that drive innovation, operational excellence, and the development of next-generation technology solutions for global markets.\n\nThroughout his career, Irfan has championed the integration of emerging technologies, data analytics, automation, and artificial intelligence to enhance manufacturing capabilities, product development, and customer value. His leadership has contributed to positioning MAS Holdings as a global innovator in wearable technology and intelligent manufacturing.\n\nA passionate advocate for technology-led growth, Irfan actively supports collaboration between industry, startups, and research institutions while promoting sustainable innovation and the adoption of future-focused technologies that strengthen Sri Lanka's position in the global technology and manufacturing landscape.",
    "linkedin": "https://www.linkedin.com/in/irfaniq/",
    "expertise": [
      "Industry",
      "Startup"
    ],
    "country": "Sri Lanka",
    "experience": 20,
    "awardsJudged": 2,
    "isGrandJury": false
  },
  {
    "id": "jiffry-zulfer",
    "name": "Mr. Jiffry Zulfer",
    "designation": "Founder & CEO",
    "organization": "PickMe",
    "category": "Innovation & Future-Focused Awards",
    "description": "Jiffry Zulfer is a pioneering technology entrepreneur and business leader with extensive experience in digital platforms, mobility technology, logistics innovation, and startup entrepreneurship. As the Founder and Chief Executive Officer of PickMe, he has transformed Sri Lanka's mobility and delivery ecosystem by building one of the country's most successful homegrown technology platforms, serving millions of users through innovative digital services.\n\nUnder his leadership, PickMe has continuously embraced emerging technologies, including artificial intelligence, machine learning, geospatial analytics, and data-driven decision-making to optimize transportation, logistics, and customer experiences. His vision has helped drive digital transformation while creating new economic opportunities for drivers, merchants, and businesses across the country.\n\nBeyond his entrepreneurial success, Jiffry actively contributes to Sri Lanka's technology ecosystem by encouraging innovation, supporting entrepreneurship, and advocating for digital solutions that improve urban mobility, operational efficiency, and sustainable economic growth. He remains committed to advancing AI-powered innovation that delivers meaningful impact for businesses and society.",
    "linkedin": "https://www.linkedin.com/in/zulfer/",
    "expertise": [
      "Startup",
      "Industry"
    ],
    "country": "Sri Lanka",
    "experience": 20,
    "awardsJudged": 2,
    "isGrandJury": false
  }
];



// All available expertise options
const expertiseOptions = [
  'Government', 'Academia', 'Industry', 'Startup', 'Healthcare',
  'Agriculture', 'Finance', 'AI Research', 'Venture Capital',
  'Standards', 'Legal', 'Telecom'
];

// Available categories matching structure
const categoryMap = [
  'All',
  'Core National Awards & Women in AI Leadership',
  'Innovation & Future-Focused Awards',
  'AI in Agriculture',
  'AI in Banking, Finance & Insurance',
  'AI in Healthcare & Life Sciences',
  'AI in Manufacturing & Industry 5.0',
  'AI in Education',
  'AI in Media'
];


export { judgesData };

const JudgePortal = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExpertise, setSelectedExpertise] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [sortBy, setSortBy] = useState('Alphabetical');
  const [activeModalJudge, setActiveModalJudge] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter & Sort Logic
  const filteredJudges = useMemo(() => {
    let result = [...judgesData];

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(judge =>
        judge.name.toLowerCase().includes(query) ||
        judge.organization.toLowerCase().includes(query) ||
        judge.designation.toLowerCase().includes(query) ||
        judge.category.toLowerCase().includes(query) ||
        judge.expertise.some(exp => exp.toLowerCase().includes(query))
      );
    }

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(judge => judge.category === selectedCategory);
    }

    // Filter by Expertise
    if (selectedExpertise !== 'All') {
      result = result.filter(judge => judge.expertise.includes(selectedExpertise));
    }

    // Filter by Country type (Local / International)
    if (selectedCountry !== 'All') {
      if (selectedCountry === 'International') {
        result = result.filter(judge => judge.country !== 'Sri Lanka');
      } else {
        result = result.filter(judge => judge.country === 'Sri Lanka');
      }
    }

    // Sort Judges
    if (sortBy === 'Alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'Experience') {
      result.sort((a, b) => b.experience - a.experience);
    } else if (sortBy === 'Category') {
      result.sort((a, b) => a.category.localeCompare(b.category));
    }

    return result;
  }, [searchQuery, selectedCategory, selectedExpertise, selectedCountry, sortBy]);

  // Separate Grand Jury for display
  const grandJuryJudges = useMemo(() => {
    return judgesData.filter(judge => judge.isGrandJury);
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200 overflow-x-hidden font-sans relative selection:bg-accent-500/30 selection:text-white">
      {/* ── Background Mesh ── */}
      <div className="absolute top-0 inset-x-0 h-[1000px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full bg-gradient-to-br from-accent-500/10 to-transparent blur-[150px]" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-gradient-to-br from-purple-500/10 to-transparent blur-[150px]" />
        <div className="absolute inset-0 bg-noise opacity-[0.02]" />
      </div>

      {/* ── Hero Section ── */}
      <section className="relative pt-24 pb-16 overflow-hidden z-10 border-b border-white/5 bg-gradient-hero">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center">

          {/* Header Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <RiShieldUserLine className="text-sm" /> Expert Jury Panel
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]"
          >
            Meet the Experts <br />
            Shaping Sri Lanka's <br />
            <span className="gradient-text">AI Future</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed mt-6"
          >
            Our distinguished judging panel consists of nationally and internationally recognized leaders from academia, government, industry, research, venture capital, and innovation.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/5 justify-center"
          >
            <div>
              <p className="font-display font-black text-3xl text-accent-400">40+</p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Judges Joined</p>
            </div>
            <div>
              <p className="font-display font-black text-3xl text-purple-400">6</p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Categories</p>
            </div>
            <div>
              <p className="font-display font-black text-3xl text-cyan-400">Global</p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Representation</p>
            </div>
            <div>
              <p className="font-display font-bold text-xs text-white leading-tight">Gov • Academia • Industry</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Ecosystem Sectors</p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-8"
          >
            <a href="#judges-grid-section">
              <Button variant="primary" className="hover:shadow-glow text-white font-semibold rounded-2xl px-8 py-3.5">
                Explore Judges
              </Button>
            </a>
            <Link to="/categories">
              <Button variant="ghost" className="border border-white/10 text-slate-300 hover:bg-white/5 rounded-2xl px-6 py-3.5 flex items-center gap-2">
                View Award Categories <RiArrowRightLine />
              </Button>
            </Link>
          </motion.div>

        </div>
      </section>

      {/* ── Main Interactive Section ── */}
      <span id="judges-grid-section" />
      <section className="py-24 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-semibold uppercase tracking-wider">
            Judges Directory
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Judges Registry & Domain Panels
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Search and filter through our full lineup of panel experts by name, industry expertise, organization, and award categories.
          </p>
        </div>

        {/* Sticky Search and Filters Container */}
        <div className="sticky top-20 bg-surface-200/80 backdrop-blur-md z-30 p-4 border border-white/10 shadow-card rounded-2xl mb-12 flex flex-col md:flex-row gap-4 items-center justify-between transition-all duration-300">
          <div className="relative w-full md:w-96">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              type="text"
              placeholder="Search by name, expertise, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 text-sm text-white placeholder-slate-500 bg-surface-100/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Quick Toggle advanced filter drawer */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${showFilters || selectedExpertise !== 'All' || selectedCountry !== 'All'
                ? 'bg-accent-500/10 border-accent-500/30 text-accent-400'
                : 'bg-surface-100 border-white/10 text-slate-300 hover:bg-surface-50'
                }`}
            >
              <RiFilterLine className="text-base" /> Advanced Filters
              {(selectedExpertise !== 'All' || selectedCountry !== 'All') && (
                <span className="w-2 h-2 rounded-full bg-accent-500" />
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative flex items-center gap-2 bg-surface-100 border border-white/10 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400">
              <span>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none text-white cursor-pointer font-bold"
              >
                <option value="Alphabetical">Alphabetical</option>
                <option value="Experience">Years Experience</option>
                <option value="Category">Award Category</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dropdown filters tray */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-8 p-6 bg-surface-100/40 rounded-2xl border border-white/10 grid sm:grid-cols-2 md:grid-cols-3 gap-6"
            >
              {/* Expertise selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expertise Area</label>
                <select
                  value={selectedExpertise}
                  onChange={(e) => setSelectedExpertise(e.target.value)}
                  className="w-full bg-surface-200 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                >
                  <option value="All">All Expertise Domains</option>
                  {expertiseOptions.map(exp => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>

              {/* Country Type selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location Type</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-surface-200 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                >
                  <option value="All">All Judges (Sri Lanka + Global)</option>
                  <option value="Local">Sri Lankan Jury Panel</option>
                  <option value="International">International Jury Panel</option>
                </select>
              </div>

              {/* Reset button wrapper */}
              <div className="flex items-end justify-end">
                <button
                  onClick={() => {
                    setSelectedExpertise('All');
                    setSelectedCountry('All');
                    setSearchQuery('');
                  }}
                  className="text-xs text-red-400 hover:text-red-500 font-bold hover:underline mb-2"
                >
                  Clear Active Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Award Categories Navigation Tabs */}
        <div className="mb-12 border-b border-white/10 flex items-center justify-start overflow-x-auto pb-4 gap-2 scrollbar-none">
          {categoryMap.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${selectedCategory === cat
                ? 'bg-gradient-accent text-white shadow-glow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {cat === 'All' ? 'All Award Categories' : cat}
            </button>
          ))}
        </div>

        {/* Judges Grid Layout */}
        <div className="relative">
          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredJudges.map((judge) => (
                <Link key={judge.id} to={`/judge-portal/${judge.id}`}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="glass-card p-6 flex flex-col items-center text-center cursor-pointer border border-white/10 hover:border-accent-500/50 hover:shadow-glow transition-all duration-300 group"
                  >
                    {/* Circular Portrait with Glowing Border */}
                    <JudgeAvatar judge={judge} variant="card" />

                    {/* Name */}
                    <h3 className="font-display font-bold text-white text-lg mt-5 group-hover:text-accent-400 transition-colors duration-300 leading-tight">
                      {judge.name}
                    </h3>

                    {/* Designation/Role */}
                    <p className="text-accent-400 text-xs font-semibold mt-2">
                      {judge.designation}
                    </p>

                    {/* Company */}
                    <p className="text-slate-400 text-xs mt-1 truncate max-w-full">
                      {judge.organization}
                    </p>

                    {/* Pill Badge at the Bottom */}
                    <div className="mt-6">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full border ${judge.isGrandJury
                        ? 'border-gold-500/30 text-gold-400 bg-gold-500/10'
                        : 'border-accent-500/30 text-accent-400 bg-accent-500/10'
                        }`}>
                        {judge.isGrandJury ? 'Grand Jury' : 'Panelist'}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty Results Placeholder */}
          {filteredJudges.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 rounded-full bg-surface-100 border border-white/10 flex items-center justify-center mx-auto text-slate-400 text-2xl">
                <RiUserLine />
              </div>
              <h3 className="font-display font-bold text-slate-300 text-lg">No Judges Found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                We couldn't find any judges matching your current search parameters. Try expanding your search queries or clearing advanced filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedExpertise('All');
                  setSelectedCountry('All');
                  setSearchQuery('');
                }}
                className="text-sm text-accent-400 hover:text-accent-300 font-bold hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Judge Profile Details Modal ── */}
      <AnimatePresence>
        {activeModalJudge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalJudge(null)}
              className="absolute inset-0 bg-navy-950/80 backdrop-blur-md"
            />

            {/* Modal Card Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              className="relative w-full max-w-2xl bg-surface-200 rounded-[32px] overflow-hidden shadow-2xl border border-white/10 max-h-[85vh] overflow-y-auto z-10 p-8 space-y-6 text-slate-200"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalJudge(null)}
                className="absolute right-6 top-6 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors z-20"
              >
                <RiCloseLine className="text-xl" />
              </button>

              {/* Header profile details */}
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <JudgeAvatar judge={activeModalJudge} variant="modal" />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display font-extrabold text-2xl text-white leading-tight">
                      {activeModalJudge.name}
                    </h2>
                    {activeModalJudge.isGrandJury && (
                      <span className="bg-gold-500/10 text-gold-400 border border-gold-500/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">
                        Grand Jury
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-accent-400">{activeModalJudge.designation}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1.5"><RiBuildingLine /> {activeModalJudge.organization}</span>
                    <span className="flex items-center gap-1.5"><RiMapPinLine /> {activeModalJudge.country}</span>
                  </div>
                </div>
              </div>

              {/* Separator line */}
              <div className="border-t border-white/10" />

              {/* Profile Body sections */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Left col - statistics and info tags */}
                <div className="md:col-span-1 space-y-6">
                  {/* Performance / Judging indicators */}
                  <div className="bg-surface-300 rounded-2xl border border-white/5 p-4 space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Experience</p>
                      <p className="text-lg font-black text-white flex items-center gap-1.5">
                        <RiBriefcaseLine className="text-accent-400 text-sm" /> {activeModalJudge.experience} Years
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Awards Judged</p>
                      <p className="text-lg font-black text-white flex items-center gap-1.5">
                        <RiAwardLine className="text-purple-400 text-sm" /> {activeModalJudge.awardsJudged} Award Cycles
                      </p>
                    </div>
                  </div>

                  {/* Expertise links */}
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Expertise Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeModalJudge.expertise.map(exp => (
                        <span key={exp} className="text-[10px] font-semibold text-slate-300 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Award Category assignment */}
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Evaluating Panel</h4>
                    <span className="inline-block text-[10px] font-bold text-accent-400 bg-accent-500/10 px-2.5 py-1.5 rounded-lg border border-accent-500/20">
                      {activeModalJudge.category}
                    </span>
                  </div>
                </div>

                {/* Right col - Biography details */}
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Executive Biography</h4>
                    <p className="text-slate-300 text-sm leading-relaxed text-justify">
                      {activeModalJudge.bio}
                    </p>
                  </div>

                  {/* Mock Achievements */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Key Qualifications</h4>
                    <ul className="space-y-2 text-xs text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-1.5 flex-shrink-0" />
                        <span>Advises regional committees on Artificial Intelligence and digital innovation policies.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-1.5 flex-shrink-0" />
                        <span>Demonstrated leadership in technical transformations and scaling business solutions.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Social links */}
                  <div className="flex gap-3 pt-4">
                    <a
                      href={activeModalJudge.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-white/10 hover:border-white/20 rounded-xl text-xs text-slate-300 hover:text-white transition-colors bg-white/5 font-semibold"
                    >
                      <RiLinkedinBoxFill className="text-[#0A66C2] text-sm" /> LinkedIn Profile
                    </a>
                    <a
                      href={activeModalJudge.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-white/10 hover:border-white/20 rounded-xl text-xs text-slate-300 hover:text-white transition-colors bg-white/5 font-semibold"
                    >
                      <RiGlobalLine className="text-slate-400 text-sm" /> Website
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JudgePortal;
