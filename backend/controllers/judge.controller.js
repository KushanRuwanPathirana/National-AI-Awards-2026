const Judge = require('../models/Judge.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// ─── GET All Judges (Public & Admin Dashboard) ──────────────────────────────────
const getJudges = async (req, res, next) => {
  try {
    const {
      search,
      mainCategory,
      subCategory,
      mainAwardCategory,
      awardSubCategory,
      country,
      status,
      sortBy,
      page = 1,
      limit = 10,
      all = 'false',
    } = req.query;

    const query = { isDeleted: false };

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { fullName: searchRegex },
        { organization: searchRegex },
        { designation: searchRegex },
        { email: searchRegex },
      ];
    }

    // Filter by mainAwardCategory / mainCategory
    const targetMainCategory = mainAwardCategory || mainCategory;
    if (targetMainCategory) {
      query.mainAwardCategory = targetMainCategory;
    }

    // Filter by awardSubCategory / subCategory
    const targetSubCategory = awardSubCategory || subCategory;
    if (targetSubCategory) {
      query.awardSubCategories = targetSubCategory;
    }

    // Filter by country
    if (country) {
      if (country === 'International') {
        query.country = { $ne: 'Sri Lanka' };
      } else if (country === 'Sri Lanka') {
        query.country = 'Sri Lanka';
      } else {
        query.country = country;
      }
    }

    // Filter by status (Active / Inactive)
    if (status) {
      query.status = status;
    }

    // Sorting options
    let sortOptions = {};
    if (sortBy === 'Alphabetical' || sortBy === 'name') {
      sortOptions.fullName = 1;
    } else if (sortBy === 'Experience' || sortBy === 'experience') {
      sortOptions.experience = -1;
    } else if (sortBy === 'Category') {
      sortOptions.mainAwardCategory = 1;
    } else {
      sortOptions.createdAt = -1;
    }

    // Return all if requested
    if (all === 'true') {
      const judges = await Judge.find(query).sort(sortOptions);
      return successResponse(res, { data: { judges, total: judges.length } });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [judges, total] = await Promise.all([
      Judge.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Judge.countDocuments(query),
    ]);

    return successResponse(res, {
      data: {
        judges,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET Single Judge by ID ────────────────────────────────────────────────────
const getJudgeById = async (req, res, next) => {
  try {
    const judge = await Judge.findOne({ _id: req.params.id, isDeleted: false });
    if (!judge) {
      return errorResponse(res, { statusCode: 404, message: 'Judge profile not found.' });
    }
    return successResponse(res, { data: { judge } });
  } catch (error) {
    next(error);
  }
};

// Helper: validate subcategories belong to 15 official subcategories
const validateSubCategories = (subs) => {
  if (!subs || !Array.isArray(subs) || subs.length === 0) return false;
  const validSubcategories = [
    'National AI Excellence Award',
    'National AI Leadership Excellence Award',
    'National AI Impact Excellence Award',
    'National AI Export Excellence Award',
    'Best AI Solution in Agriculture',
    'Best AI Solution in Banking, Finance & Insurance',
    'Best AI Solution in Healthcare & Life Sciences',
    'Best AI Solution in Manufacturing & Industry 5.0',
    'Best AI Solution in Education',
    'Best AI Solution in Media',
    'Best AI Startup / MSME Innovation',
    'Best Agentic AI Solution',
    'Best Sinhala/Tamil AI & Localisation Innovation',
    'University AI Innovation',
    'Women in AI Leadership'
  ];
  return subs.every(sub => validSubcategories.includes(sub));
};

// ─── POST Create Judge ──────────────────────────────────────────────────────────
const createJudge = async (req, res, next) => {
  try {
    const {
      fullName,
      designation,
      organization,
      country,
      email,
      linkedin,
      mainCategory,
      subCategories,
      mainAwardCategory,
      awardSubCategories,
      photo,
      description,
      status,
      isGrandJury,
      expertise,
      experience,
      awardsJudged,
    } = req.body;

    // Check email uniqueness
    const existing = await Judge.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (existing) {
      return errorResponse(res, { statusCode: 400, message: 'A judge with this email already exists.' });
    }

    const finalMainCategory = mainAwardCategory || mainCategory;
    const finalSubCategories = awardSubCategories || subCategories;

    if (!finalMainCategory) {
      return errorResponse(res, { statusCode: 400, message: 'Main Award Category is required.' });
    }
    if (!validateSubCategories(finalSubCategories)) {
      return errorResponse(res, { statusCode: 400, message: 'At least one valid Award Subcategory is required.' });
    }

    const judge = await Judge.create({
      fullName,
      designation,
      organization,
      country,
      email: email.toLowerCase(),
      linkedin: linkedin || '',
      mainAwardCategory: finalMainCategory,
      awardSubCategories: finalSubCategories,
      photo: photo || null,
      description: description || '',
      status: status || 'Active',
      isGrandJury: !!isGrandJury,
      expertise: expertise || [],
      experience: experience || 5,
      awardsJudged: awardsJudged || 0,
    });

    logger.info(`Judge profile created: ${judge.fullName} (${judge.email})`);
    return successResponse(res, { statusCode: 201, message: 'Judge profile created successfully.', data: { judge } });
  } catch (error) {
    next(error);
  }
};

// ─── PUT Update Judge ───────────────────────────────────────────────────────────
const updateJudge = async (req, res, next) => {
  try {
    const {
      fullName,
      designation,
      organization,
      country,
      email,
      linkedin,
      mainCategory,
      subCategories,
      mainAwardCategory,
      awardSubCategories,
      status,
      isGrandJury,
      expertise,
      experience,
      awardsJudged,
    } = req.body;

    const judge = await Judge.findOne({ _id: req.params.id, isDeleted: false });
    if (!judge) {
      return errorResponse(res, { statusCode: 404, message: 'Judge profile not found.' });
    }

    // Verify email uniqueness if changed
    if (email && email.toLowerCase() !== judge.email.toLowerCase()) {
      const existing = await Judge.findOne({ email: email.toLowerCase(), isDeleted: false });
      if (existing) {
        return errorResponse(res, { statusCode: 400, message: 'A judge with this email already exists.' });
      }
      judge.email = email.toLowerCase();
    }

    const finalMainCategory = mainAwardCategory || mainCategory;
    const finalSubCategories = awardSubCategories || subCategories;

    if (finalMainCategory) judge.mainAwardCategory = finalMainCategory;
    if (finalSubCategories) {
      if (!validateSubCategories(finalSubCategories)) {
        return errorResponse(res, { statusCode: 400, message: 'At least one valid Award Subcategory must be assigned.' });
      }
      judge.awardSubCategories = finalSubCategories;
    }

    // Edit fields (description is NOT modified, as per requirements)
    if (fullName) judge.fullName = fullName;
    if (designation) judge.designation = designation;
    if (organization) judge.organization = organization;
    if (country) judge.country = country;
    if (linkedin !== undefined) judge.linkedin = linkedin || '';
    if (status) judge.status = status;
    if (isGrandJury !== undefined) judge.isGrandJury = !!isGrandJury;
    if (expertise !== undefined) judge.expertise = expertise;
    if (experience !== undefined) judge.experience = experience;
    if (awardsJudged !== undefined) judge.awardsJudged = awardsJudged;

    await judge.save();

    logger.info(`Judge profile updated: ${judge.fullName}`);
    return successResponse(res, { message: 'Judge profile updated successfully.', data: { judge } });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH Update Judge Photo ──────────────────────────────────────────────────
const uploadJudgePhoto = async (req, res, next) => {
  try {
    const judge = await Judge.findOne({ _id: req.params.id, isDeleted: false });
    if (!judge) {
      return errorResponse(res, { statusCode: 404, message: 'Judge profile not found.' });
    }

    if (!req.file) {
      return errorResponse(res, { statusCode: 400, message: 'Please upload a photo.' });
    }

    // Remove older local photo file if it exists
    if (judge.photo && judge.photo.includes('uploads/judges/')) {
      const oldPath = path.join(__dirname, '..', judge.photo);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
          logger.info(`Deleted old photo file: ${oldPath}`);
        } catch (err) {
          logger.error(`Error deleting old photo: ${err.message}`);
        }
      }
    }

    const relativePath = `uploads/judges/${req.file.filename}`;
    judge.photo = relativePath;
    await judge.save();

    logger.info(`Photo updated for judge ${judge.fullName}: ${relativePath}`);
    return successResponse(res, {
      message: 'Profile photo updated successfully.',
      data: { photo: relativePath },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE Soft-Delete Judge ──────────────────────────────────────────────────
const deleteJudge = async (req, res, next) => {
  try {
    const judge = await Judge.findOne({ _id: req.params.id, isDeleted: false });
    if (!judge) {
      return errorResponse(res, { statusCode: 404, message: 'Judge profile not found.' });
    }

    judge.isDeleted = true;
    await judge.save();

    logger.info(`Judge profile soft-deleted: ${judge.fullName}`);
    return successResponse(res, { message: 'Judge profile deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── Seeding Static Judges into MongoDB ───────────────────────────────────────
const seedDefaultJudges = async () => {
  try {
    const count = await Judge.countDocuments();
    if (count > 0) {
      return;
    }

    logger.info('Database empty: Seeding default judges from static frontend list...');

    // Extracted from front-end page judgesData
    const initialJudges = [
      {
        fullName: "Mr. Indika De Zoysa",
        designation: "VP – Public & Government Affairs",
        organization: "Huawei Technologies / FITIS / CSSL",
        country: "Sri Lanka",
        email: "indika.dezoysa@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/indika-de-zoysa-7068a356/",
        mainCategory: "National AI Trailblazer Awards",
        subCategories: ["National AI Excellence Award", "National AI Leadership Excellence Award", "National AI Impact Excellence Award", "National AI Export Excellence Award", "Women in AI Leadership"],
        photo: "indika-de-zoysa",
        description: "Mr. Indika De Zoysa is a prominent figure in Sri Lanka’s technology and digital policy landscape, with over two decades of leadership experience across ICT, telecommunications, public-sector digital transformation, and industry development...",
        isGrandJury: true,
        experience: 22,
        awardsJudged: 3,
        expertise: ["Government", "Industry"]
      },
      {
        fullName: "Dr. Ruvan Weerasinghe",
        designation: "Academic Dean, IIT | Former Senior Lecturer, UCSC",
        organization: "University of Colombo",
        country: "Sri Lanka",
        email: "ruvan.weerasinghe@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/ruvanweerasinghe/",
        mainCategory: "National AI Trailblazer Awards",
        subCategories: ["National AI Excellence Award", "National AI Leadership Excellence Award", "National AI Impact Excellence Award", "National AI Export Excellence Award", "Women in AI Leadership"],
        photo: "ruvan-weerasinghe",
        description: "Dr. Ruvan Weerasinghe is a distinguished academic, researcher, and technology leader with extensive expertise in artificial intelligence...",
        isGrandJury: true,
        experience: 28,
        awardsJudged: 4,
        expertise: ["Academia", "AI Research"]
      },
      {
        fullName: "Dr. Waruna Sri Dhanapala",
        designation: "Secretary",
        organization: "Ministry of Digital Economy",
        country: "Sri Lanka",
        email: "waruna.dhanapala@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/waruna-sri-dhanapala-5aa89216/",
        mainCategory: "National AI Trailblazer Awards",
        subCategories: ["National AI Excellence Award", "National AI Leadership Excellence Award", "National AI Impact Excellence Award", "National AI Export Excellence Award", "Women in AI Leadership"],
        photo: "waruna-sri-dhanapala",
        description: "Dr. Waruna Sri Dhanapala is a distinguished public sector leader and senior officer of the Sri Lanka Administrative Service...",
        isGrandJury: true,
        experience: 26,
        awardsJudged: 3,
        expertise: ["Government", "Standards"]
      },
      {
        fullName: "Ms. Lakmini Wijesundara",
        designation: "Co-Founder & CEO",
        organization: "BOARDPAC",
        country: "Sri Lanka",
        email: "lakmini.wijesundera@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/lakminiwijesundera/",
        mainCategory: "National AI Trailblazer Awards",
        subCategories: ["National AI Excellence Award", "National AI Leadership Excellence Award", "National AI Impact Excellence Award", "National AI Export Excellence Award", "Women in AI Leadership"],
        photo: "lakmini-wijesundara",
        description: "Lakmini Wijesundara is a globally recognized technology entrepreneur and business leader...",
        isGrandJury: true,
        experience: 20,
        awardsJudged: 2,
        expertise: ["Startup", "Industry"]
      },
      {
        fullName: "International Judge",
        designation: "TBI",
        organization: "TBI",
        country: "United States",
        email: "intl.core.judge@naiawards.lk",
        linkedin: "",
        mainCategory: "National AI Trailblazer Awards",
        subCategories: ["National AI Excellence Award", "National AI Leadership Excellence Award", "National AI Impact Excellence Award", "National AI Export Excellence Award", "Women in AI Leadership"],
        photo: "international-judge-core",
        description: "International expert contributing global perspectives on AI governance and innovation.",
        isGrandJury: true,
        experience: 18,
        awardsJudged: 2,
        expertise: ["AI Research", "Standards"]
      },
      {
        fullName: "SLTMOBITEL Member",
        designation: "TBI",
        organization: "TBI",
        country: "Sri Lanka",
        email: "slt.core.member@naiawards.lk",
        linkedin: "",
        mainCategory: "National AI Trailblazer Awards",
        subCategories: ["National AI Excellence Award", "National AI Leadership Excellence Award", "National AI Impact Excellence Award", "National AI Export Excellence Award", "Women in AI Leadership"],
        photo: "sltmobitel-core",
        description: "Industry representative supporting national AI excellence and digital innovation.",
        isGrandJury: false,
        experience: 15,
        awardsJudged: 1,
        expertise: ["Telecom", "Industry"]
      },
      {
        fullName: "Mr. Harsha Subasinghe",
        designation: "Founder & CEO",
        organization: "CodeGen",
        country: "Sri Lanka",
        email: "harsha.subasinghe@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/harsha-subasinghe-9898866b/",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Agriculture"],
        photo: "harsha-subasinghe",
        description: "Harsha Subasinghe is a renowned technology entrepreneur, software architect, and business leader...",
        isGrandJury: false,
        experience: 20,
        awardsJudged: 2,
        expertise: ["Industry", "AI Research", "Startup"]
      },
      {
        fullName: "Mr. Heminda Jayaweera",
        designation: "Executive Director",
        organization: "TRACE Sri Lanka",
        country: "Sri Lanka",
        email: "heminda.jayaweera@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/heminda/",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Agriculture"],
        photo: "heminda-jayaweera",
        description: "Heminda Jayaweera is an accomplished innovation strategist and technology ecosystem leader...",
        isGrandJury: false,
        experience: 18,
        awardsJudged: 2,
        expertise: ["Startup", "Agriculture"]
      },
      {
        fullName: "Prof. Buddhi Marambe",
        designation: "Professor, Faculty of Agriculture",
        organization: "University of Peradeniya",
        country: "Sri Lanka",
        email: "buddhi.marambe@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/buddhi-marambe-a52aa544/",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Agriculture"],
        photo: "buddhi-marambe",
        description: "Prof. Buddhi Marambe is a distinguished academic, agricultural scientist, and researcher...",
        isGrandJury: false,
        experience: 30,
        awardsJudged: 4,
        expertise: ["Academia", "Agriculture"]
      },
      {
        fullName: "Ms. Shehani Seneviratne",
        designation: "Chairperson, SLASSCOM (2025/26) | COO",
        organization: "99x",
        country: "Sri Lanka",
        email: "shehani.seneviratne@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/shehaniseneviratne/",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Banking, Finance & Insurance"],
        photo: "shehani-seneviratne",
        description: "Shehani Seneviratne is a distinguished technology executive and digital transformation leader...",
        isGrandJury: false,
        experience: 22,
        awardsJudged: 3,
        expertise: ["Industry", "Startup"]
      },
      {
        fullName: "Mr. Dhananath Fernando",
        designation: "Chief Executive Officer",
        organization: "Advocata Institute",
        country: "Sri Lanka",
        email: "dhananath.fernando@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/dhananath-fernando-24970034/",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Banking, Finance & Insurance"],
        photo: "dhananath-fernando",
        description: "Dhananath Fernando is a distinguished economist, public policy expert, and thought leader...",
        isGrandJury: false,
        experience: 15,
        awardsJudged: 1,
        expertise: ["Finance", "Government"]
      },
      {
        fullName: "Mr. Channa De Silva",
        designation: "CEO",
        organization: "LankaPay",
        country: "Sri Lanka",
        email: "channa.desilva@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/channadesilva/",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Banking, Finance & Insurance"],
        photo: "channa-de-silva",
        description: "Channa De Silva is a distinguished fintech executive and digital payments leader...",
        isGrandJury: false,
        experience: 25,
        awardsJudged: 3,
        expertise: ["Finance", "Industry"]
      },
      {
        fullName: "Prof. Vajira H.W. Dissanayake",
        designation: "Dean, Faculty of Medicine",
        organization: "University of Colombo",
        country: "Sri Lanka",
        email: "vajira.dissanayake@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/vajirahwd/",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Healthcare & Life Sciences"],
        photo: "vajira-dissanayake",
        description: "Prof. Vajira H.W. Dissanayake is a distinguished physician, academic, and medical informatics expert...",
        isGrandJury: false,
        experience: 32,
        awardsJudged: 4,
        expertise: ["Academia", "Healthcare"]
      },
      {
        fullName: "Dr. Nishan Siriwardhana",
        designation: "President / Specialist Health Informatics",
        organization: "Sri Lanka College of Health Informatics",
        country: "Sri Lanka",
        email: "nishan.siriwardena@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/nishan-siriwardena-16256623/",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Healthcare & Life Sciences"],
        photo: "nishan-siriwardhana",
        description: "Dr. Nishan Siriwardhana is a distinguished consultant physician and health informatics specialist...",
        isGrandJury: false,
        experience: 20,
        awardsJudged: 2,
        expertise: ["Healthcare", "AI Research"]
      },
      {
        fullName: "Mrs. Chitranganie Mubarak",
        designation: "Former Chairperson",
        organization: "ICTA",
        country: "Sri Lanka",
        email: "chitranganie.mubarak@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/chitranganie-mubarak-ab6111119/",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Healthcare & Life Sciences"],
        photo: "chitranganie-mubarak",
        description: "Chitranganie Mubarak is a distinguished technology leader and digital transformation strategist...",
        isGrandJury: false,
        experience: 25,
        awardsJudged: 3,
        expertise: ["Digital Transformation", "ICT Strategy", "Digital Governance", "Public Sector Innovation", "Artificial Intelligence", "Digital Health"]
      },
      {
        fullName: "Mr. Oshada Senanayake",
        designation: "Director",
        organization: "Brandix",
        country: "Sri Lanka",
        email: "oshada.senanayake@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/oshada/",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Manufacturing & Industry 5.0"],
        photo: "oshada-senanayake",
        description: "Oshada Senanayake is a distinguished business and technology leader...",
        isGrandJury: false,
        experience: 18,
        awardsJudged: 2,
        expertise: ["Industry", "Telecom"]
      },
      {
        fullName: "Dr. Ajith P. Madurapperuma",
        designation: "Deputy Vice-Chancellor",
        organization: "Open University of Sri Lanka",
        country: "Sri Lanka",
        email: "ajith.madurapperuma@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/ajith-madurapperuma-2031354/",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Manufacturing & Industry 5.0"],
        photo: "ajith-madurapperuma",
        description: "Dr. Ajith P. Madurapperuma is a distinguished academic, researcher, and technology leader...",
        isGrandJury: false,
        experience: 28,
        awardsJudged: 3,
        expertise: ["Academia", "Industry"]
      },
      {
        fullName: "International Judge (Manufacturing)",
        designation: "TBI",
        organization: "TBI",
        country: "Germany",
        email: "intl.mfg.judge@naiawards.lk",
        linkedin: "",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Manufacturing & Industry 5.0"],
        photo: "international-judge-manufacturing",
        description: "Global specialist in Industry 5.0, automation, and AI-driven industrial transformation.",
        isGrandJury: false,
        experience: 20,
        awardsJudged: 2,
        expertise: ["Industry", "Standards"]
      },
      {
        fullName: "SLTMOBITEL Member (Manufacturing)",
        designation: "TBI",
        organization: "TBI",
        country: "Sri Lanka",
        email: "slt.mfg.member@naiawards.lk",
        linkedin: "",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Manufacturing & Industry 5.0"],
        photo: "sltmobitel-manufacturing",
        description: "Industry representative supporting AI adoption in manufacturing and industrial innovation.",
        isGrandJury: false,
        experience: 15,
        awardsJudged: 1,
        expertise: ["Telecom", "Industry"]
      },
      {
        fullName: "Prof. Roshan Ragel",
        designation: "Professor, Dept. of Computer Engineering",
        organization: "University of Peradeniya",
        country: "Sri Lanka",
        email: "roshan.ragel@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/roshanragel/",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Education"],
        photo: "roshan-ragel",
        description: "Prof. Roshan Ragel is a distinguished academic, computer engineer, and researcher...",
        isGrandJury: false,
        experience: 22,
        awardsJudged: 2,
        expertise: ["Academia", "AI Research"]
      },
      {
        fullName: "Mr. Sampath Jayasundara",
        designation: "Vice Chairman 1, SLASSCOM | Director/CEO",
        organization: "hSenid Business Solutions",
        country: "Sri Lanka",
        email: "sampath.jayasundara@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/sampathjayasundara/",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Education"],
        photo: "sampath-jayasundara",
        description: "Sampath Jayasundara is a distinguished technology executive and business leader...",
        isGrandJury: false,
        experience: 20,
        awardsJudged: 2,
        expertise: ["Industry", "Startup"]
      },
      {
        fullName: "International Judge (Education)",
        designation: "TBI",
        organization: "TBI",
        country: "United Kingdom",
        email: "intl.edu.judge@naiawards.lk",
        linkedin: "",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Education"],
        photo: "international-judge-education",
        description: "International expert in AI-enabled learning systems and education technology.",
        isGrandJury: false,
        experience: 18,
        awardsJudged: 2,
        expertise: ["Academia", "AI Research"]
      },
      {
        fullName: "Mr. Nishan Mendis",
        designation: "Former Chairman",
        organization: "SLASSCOM (2024/25)",
        country: "Sri Lanka",
        email: "nishan.mendis@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/nishan-mendis-64443b42/",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Export Development"],
        photo: "nishan-mendis",
        description: "Nishan Mendis is a distinguished technology executive and digital transformation leader...",
        isGrandJury: false,
        experience: 22,
        awardsJudged: 2,
        expertise: ["Industry", "AI Research"]
      },
      {
        fullName: "Mr. Vajeeendra S. Kandegamage",
        designation: "Former Chairman",
        organization: "NBQSA",
        country: "Sri Lanka",
        email: "vajeeendra.kandegamage@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/vajeendrask/",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Export Development"],
        photo: "vajeeendra-kandegamage",
        description: "Vajeeendra S. Kandegamage is a distinguished technology professional, software engineering leader...",
        isGrandJury: false,
        experience: 25,
        awardsJudged: 3,
        expertise: ["Industry", "Standards"]
      },
      {
        fullName: "International Judge (Media)",
        designation: "TBI",
        organization: "TBI",
        country: "Singapore",
        email: "intl.media.judge@naiawards.lk",
        linkedin: "",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Export Development"],
        photo: "international-judge-media",
        description: "Global media-tech expert evaluating AI innovation in content and communications.",
        isGrandJury: false,
        experience: 15,
        awardsJudged: 2,
        expertise: ["Industry", "AI Research"]
      },
      {
        fullName: "SLTMOBITEL Member (Media)",
        designation: "TBI",
        organization: "TBI",
        country: "Sri Lanka",
        email: "slt.media.member@naiawards.lk",
        linkedin: "",
        mainCategory: "Industry & Sector Excellence Awards",
        subCategories: ["Best AI Solution in Export Development"],
        photo: "sltmobitel-media",
        description: "Industry representative supporting AI adoption in media and digital communications.",
        isGrandJury: false,
        experience: 15,
        awardsJudged: 1,
        expertise: ["Telecom", "Industry"]
      },
      {
        fullName: "Mr. Chalinda Abeykoon",
        designation: "Managing Partner",
        organization: "nVentures",
        country: "Sri Lanka",
        email: "chalinda.abeykoon@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/chalindaabeykoon/",
        mainCategory: "Innovation & Future-Focused Awards",
        subCategories: ["Best AI Startup / MSME Innovation"],
        photo: "chalinda-abeykoon",
        description: "Chalinda Abeykoon is a distinguished entrepreneur, venture builder, and innovation ecosystem leader...",
        isGrandJury: false,
        experience: 18,
        awardsJudged: 3,
        expertise: ["Venture Capital", "Startup"]
      },
      {
        fullName: "Mr. Asela Gunawardana",
        designation: "Head of Operations",
        organization: "Lankan Angel Network",
        country: "Sri Lanka",
        email: "asela.gunawardana@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/aselagun/",
        mainCategory: "Innovation & Future-Focused Awards",
        subCategories: ["Best AI Startup / MSME Innovation"],
        photo: "asela-gunawardana",
        description: "Asela Gunawardana is an experienced startup ecosystem professional and investment leader...",
        isGrandJury: false,
        experience: 15,
        awardsJudged: 2,
        expertise: ["Venture Capital", "Startup"]
      },
      {
        fullName: "Mr. Madu Ratnayake",
        designation: "Co-Founder & President",
        organization: "Scybers | Founder President TiE Colombo",
        country: "Sri Lanka",
        email: "madu.ratnayake@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/maduratnayake/",
        mainCategory: "Innovation & Future-Focused Awards",
        subCategories: ["Best AI Startup / MSME Innovation", "Best Agentic AI Solution"],
        photo: "madu-ratnayake",
        description: "Madu Ratnayake is a distinguished technology entrepreneur, cybersecurity leader, and startup ecosystem builder...",
        isGrandJury: true,
        experience: 25,
        awardsJudged: 4,
        expertise: ["Industry", "Startup", "Legal"]
      },
      {
        fullName: "Mr. Irfan Ahamed",
        designation: "COO – Wearables and Growth Platforms",
        organization: "MAS Holdings",
        country: "Sri Lanka",
        email: "irfan.ahamed@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/irfaniq/",
        mainCategory: "Innovation & Future-Focused Awards",
        subCategories: ["Best AI Startup / MSME Innovation"],
        photo: "irfan-ahamed",
        description: "Irfan Ahamed is a distinguished business leader and innovation executive with extensive experience...",
        isGrandJury: false,
        experience: 20,
        awardsJudged: 2,
        expertise: ["Industry", "Startup"]
      },
      {
        fullName: "Mr. Jiffry Zulfer",
        designation: "Founder & CEO",
        organization: "PickMe",
        country: "Sri Lanka",
        email: "jiffry.zulfer@naiawards.lk",
        linkedin: "https://www.linkedin.com/in/zulfer/",
        mainCategory: "Innovation & Future-Focused Awards",
        subCategories: ["Best AI Startup / MSME Innovation"],
        photo: "jiffry-zulfer",
        description: "Jiffry Zulfer is a pioneering technology entrepreneur and business leader...",
        isGrandJury: false,
        experience: 20,
        awardsJudged: 2,
        expertise: ["Startup", "Industry"]
      }
    ];

    const processedJudges = initialJudges.map(judge => {
      // Map mainCategory and subCategories to new schema fields
      judge.mainAwardCategory = judge.mainCategory;
      judge.awardSubCategories = judge.subCategories.map(sub => {
        if (sub === 'Best AI Solution in Export Development') {
          return 'Best AI Solution in Media';
        }
        return sub;
      });
      return judge;
    });

    await Judge.insertMany(processedJudges);
    logger.info(`Successfully seeded ${processedJudges.length} default judges.`);
  } catch (error) {
    logger.error(`Error seeding default judges: ${error.message}`);
  }
};

// ─── Self-Executing Migration for Existing Judges ──────────────────────────
const migrateExistingJudges = async () => {
  try {
    const judges = await Judge.find({ mainAwardCategory: { $exists: false } });
    if (judges.length > 0) {
      logger.info(`Migrating ${judges.length} existing judges to the new award category structure...`);
      let migratedCount = 0;
      for (const judge of judges) {
        let changed = false;
        
        if (!judge.mainAwardCategory && judge.mainCategory) {
          judge.mainAwardCategory = judge.mainCategory;
          changed = true;
        }

        if ((!judge.awardSubCategories || judge.awardSubCategories.length === 0) && judge.subCategories && judge.subCategories.length > 0) {
          judge.awardSubCategories = judge.subCategories.map(sub => {
            if (sub === 'Best AI Solution in Export Development') {
              return 'Best AI Solution in Media';
            }
            return sub;
          });
          changed = true;
        }

        if (changed) {
          await judge.save();
          migratedCount++;
        }
      }
      logger.info(`✅ Successfully migrated ${migratedCount} judges to the new structure.`);
    } else {
      logger.info('✅ No judges require migration.');
    }
  } catch (err) {
    logger.error(`❌ Error migrating existing judges: ${err.message}`);
  }
};

// ─── POST Send Welcome Email to All Judges ─────────────────────────────────────
const { sendEmail } = require('../services/email.service');

const sendWelcomeToAllJudges = async (req, res, next) => {
  try {
    const judges = await Judge.find({ isDeleted: false });
    if (judges.length === 0) {
      return errorResponse(res, { statusCode: 404, message: 'No judges found to send welcome messages.' });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const registerLink = `${clientUrl}/login?mode=register`;

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;
    let lastError = null;

    for (const judge of judges) {
      if (judge.email && judge.email.endsWith('@naiawards.lk')) {
        skippedCount++;
        continue;
      }
      try {
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #0f172a; color: #f8fafc; text-align: left;">
            <h2 style="color: #38bdf8; font-weight: 800; border-bottom: 2px solid #334155; padding-bottom: 12px; margin-top: 0;">Welcome to AI Awards Sri Lanka 2026!</h2>
            <p style="font-size: 15px; line-height: 1.6;">Dear ${judge.fullName},</p>
            <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">You have been registered as an expert evaluator on our portal.</p>
            <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">To begin reviewing submissions and participating in the evaluation process, please set up your account by clicking the link below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${registerLink}" style="background-color: #0ea5e9; color: white; padding: 12px 28px; border-radius: 12px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 14px; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);">Create Your Account</a>
            </div>
            <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">Please use your registered email address <strong>${judge.email}</strong> and select <strong>"Judge"</strong> as the role during registration.</p>
            <hr style="border: 0; border-top: 1px solid #334155; margin-top: 30px; margin-bottom: 20px;" />
            <p style="font-size: 11px; color: #64748b; text-align: center; margin-bottom: 0;">National AI Awards Sri Lanka 2026. All rights reserved.</p>
          </div>
        `;

        await sendEmail({
          to: judge.email,
          subject: '🎉 Action Required: Setup Your Judge Account — AI Awards Sri Lanka',
          html
        });
        successCount++;
      } catch (err) {
        logger.error(`Failed to send welcome email to ${judge.email}: ${err.message}`);
        failCount++;
        lastError = err.message;
      }
    }

    if (successCount === 0 && failCount > 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: `Failed to send welcome emails. SMTP server error: ${lastError || 'Email credentials are not configured.'}`
      });
    }

    return successResponse(res, {
      message: `Welcome emails sent: ${successCount} succeeded, ${failCount} failed, ${skippedCount} skipped.`,
      data: { successCount, failCount, skippedCount }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJudges,
  getJudgeById,
  createJudge,
  updateJudge,
  uploadJudgePhoto,
  deleteJudge,
  seedDefaultJudges,
  migrateExistingJudges,
  sendWelcomeToAllJudges,
};
