const mongoose = require('mongoose');

const judgeSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
      maxlength: [150, 'Designation cannot exceed 150 characters'],
    },
    organization: {
      type: String,
      required: [true, 'Organization is required'],
      trim: true,
      maxlength: [150, 'Organization cannot exceed 150 characters'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    linkedin: {
      type: String,
      trim: true,
      default: '',
    },
    mainAwardCategory: {
      type: String,
      required: [true, 'Main Award Category is required'],
      trim: true,
      enum: {
        values: [
          'National AI Trailblazer Awards',
          'Industry & Sector Excellence Awards',
          'Innovation & Future-Focused Awards'
        ],
        message: 'Invalid Main Award Category'
      }
    },
    awardSubCategories: {
      type: [String],
      required: [true, 'At least one Award Subcategory is required'],
      validate: {
        validator: function (val) {
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
          return val && val.length > 0 && val.every(sub => validSubcategories.includes(sub));
        },
        message: 'At least one valid Award Subcategory must be assigned.',
      },
    },
    mainCategory: {
      type: String,
      trim: true,
    },
    subCategories: {
      type: [String],
    },
    photo: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isGrandJury: {
      type: Boolean,
      default: false,
    },
    expertise: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      default: 5,
    },
    awardsJudged: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook: Sync new fields to legacy fields for backward compatibility
judgeSchema.pre('save', function (next) {
  if (this.mainAwardCategory) {
    this.mainCategory = this.mainAwardCategory;
  }
  if (this.awardSubCategories) {
    this.subCategories = this.awardSubCategories;
  }
  next();
});

// Virtual: Map awardSubCategories to the frontend-expected category string
judgeSchema.virtual('category').get(function () {
  if (this.awardSubCategories && this.awardSubCategories.length > 0) {
    const sub = this.awardSubCategories[0];
    if ([
      'National AI Excellence Award',
      'National AI Leadership Excellence Award',
      'National AI Impact Excellence Award',
      'National AI Export Excellence Award',
      'Women in AI Leadership'
    ].includes(sub)) {
      return 'Core National Awards & Women in AI Leadership';
    }
    if (sub === 'Best AI Solution in Agriculture') return 'AI in Agriculture';
    if (sub === 'Best AI Solution in Banking, Finance & Insurance') return 'AI in Banking, Finance & Insurance';
    if (sub === 'Best AI Solution in Healthcare & Life Sciences') return 'AI in Healthcare & Life Sciences';
    if (sub === 'Best AI Solution in Manufacturing & Industry 5.0') return 'AI in Manufacturing & Industry 5.0';
    if (sub === 'Best AI Solution in Education') return 'AI in Education';
    if (sub === 'Best AI Solution in Media') return 'AI in Media';
    if ([
      'Best AI Startup / MSME Innovation',
      'Best Agentic AI Solution',
      'Best Sinhala/Tamil AI & Localisation Innovation',
      'University AI Innovation'
    ].includes(sub)) {
      return 'Innovation & Future-Focused Awards';
    }
  }
  return 'AI in Media'; // Default fallback
});

// Index for performance on searches
judgeSchema.index({ isDeleted: 1, status: 1 });
judgeSchema.index({ fullName: 1, organization: 1, designation: 1 });

const Judge = mongoose.model('Judge', judgeSchema);
module.exports = Judge;
