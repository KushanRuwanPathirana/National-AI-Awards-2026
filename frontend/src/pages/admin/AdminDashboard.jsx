import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  RiAwardLine, RiLockPasswordLine, RiLogoutBoxLine,
  RiCheckDoubleLine, RiFileList3Line, RiTeamLine,
  RiDashboardLine, RiFileChartLine, RiMailSendLine,
  RiArrowRightLine, RiFolderShield2Line, RiRefreshLine, RiPulseLine, RiStarLine,
  RiUserLine, RiShieldUserLine, RiPencilLine, RiDeleteBin6Line, RiUploadCloud2Line,
  RiEyeLine, RiSearchLine, RiDeleteBinLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import adminService from '../../services/admin.service';
import applicationService from '../../services/application.service';
import categoryService from '../../services/category.service';
import evaluationCriteriaService from '../../services/evaluationCriteria.service';
import judgeService from '../../services/judge.service';
import { judgeImages } from '../../assets/judges';
import JudgeAvatar from '../../components/judge/JudgeAvatar';
import evaluationService from '../../services/evaluation.service';

const COLORS = ['#0072ff', '#00ff87', '#ffc658', '#ff7300', '#d0ed57', '#a4de6c'];

const JUDGE_MAIN_CATEGORIES_MAP = {
  'National AI Trailblazer Awards': [
    'National AI Excellence Award',
    'National AI Leadership Excellence Award',
    'National AI Impact Excellence Award',
    'National AI Export Excellence Award'
  ],
  'Industry & Sector Excellence Awards': [
    'Best AI Solution in Agriculture',
    'Best AI Solution in Banking, Finance & Insurance',
    'Best AI Solution in Healthcare & Life Sciences',
    'Best AI Solution in Manufacturing & Industry 5.0',
    'Best AI Solution in Education',
    'Best AI Solution in Media'
  ],
  'Innovation & Future-Focused Awards': [
    'Best AI Startup / MSME Innovation',
    'Best Agentic AI Solution',
    'Best Sinhala/Tamil AI & Localisation Innovation',
    'University AI Innovation',
    'Women in AI Leadership'
  ]
};

const DB_TO_UI_SUBCATEGORY = {
  'Best AI Solution in Agriculture': 'AI in Agriculture',
  'Best AI Solution in Banking, Finance & Insurance': 'AI in Banking, Finance & Insurance',
  'Best AI Solution in Healthcare & Life Sciences': 'AI in Healthcare & Life Sciences',
  'Best AI Solution in Manufacturing & Industry 5.0': 'AI in Manufacturing & Industry 5.0',
  'Best AI Solution in Education': 'AI in Education',
  'Best AI Solution in Media': 'AI in Media'
};

const UI_TO_DB_SUBCATEGORY = {
  'AI in Agriculture': 'Best AI Solution in Agriculture',
  'AI in Banking, Finance & Insurance': 'Best AI Solution in Banking, Finance & Insurance',
  'AI in Healthcare & Life Sciences': 'Best AI Solution in Healthcare & Life Sciences',
  'AI in Manufacturing & Industry 5.0': 'Best AI Solution in Manufacturing & Industry 5.0',
  'AI in Education': 'Best AI Solution in Education',
  'AI in Media': 'Best AI Solution in Media'
};

const getSubCategoryDisplayName = (sub) => {
  return DB_TO_UI_SUBCATEGORY[sub] || sub;
};

const getSubCategoryDbValue = (sub) => {
  return UI_TO_DB_SUBCATEGORY[sub] || sub;
};

const MAIN_CATEGORIES_MAP = {
  'National AI Trailblazer Awards': [
    'National AI Excellence Award',
    'National AI Leadership Excellence Award',
    'National AI Impact Excellence Award',
    'National AI Export Excellence Award',
    'Women in AI Leadership',
  ],
  'Industry & Sector Excellence Awards': [
    'Best AI Solution in Agriculture',
    'Best AI Solution in Banking, Finance & Insurance',
    'Best AI Solution in Healthcare & Life Sciences',
    'Best AI Solution in Export Development',
    'Best AI Solution in Education',
    'Best AI Solution in Manufacturing & Industry 5.0',
  ],
  'Innovation & Future-Focused Awards': [
    'Best AI Startup / MSME Innovation',
    'Best Agentic AI Solution',
    'Best Sinhala/Tamil AI & Localisation Innovation',
    'University AI Innovation',
  ],
};
const BROADCAST_STATUS_AUDIENCES = [
  { value: 'status:submitted', status: 'submitted', label: 'Submitted' },
  { value: 'status:under_review', status: 'under_review', label: 'Under Review' },
  { value: 'status:eligible', status: 'eligible', label: 'Eligible' },
  { value: 'status:shortlisted', status: 'shortlisted', label: 'Shortlisted' },
  { value: 'status:finalist', status: 'finalist', label: 'Finalist' },
  { value: 'status:winner', status: 'winner', label: 'Winner' },
];

const STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  eligible: 'Eligible',
  ineligible: 'Ineligible',
  initial_stage: 'Initial State',
  f2f_stage: 'Selected to Face-to-Face',
  finalist: 'Finalist',
  winner: 'Winner',
  runner_up: '1st Runner-up',
};

const ADMIN_STATUS_OPTIONS = [
  { value: 'eligible', label: 'Eligible' },
  { value: 'ineligible', label: 'Ineligible' },
  { value: 'initial_stage', label: 'Initial State' },
  { value: 'f2f_stage', label: 'Selected to Face-to-Face' },
  { value: 'finalist', label: 'Finalist' },
  { value: 'winner', label: 'Winner' },
  { value: 'runner_up', label: '1st Runner-up' },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Stats & listings
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [categories, setCategories] = useState([]);
  const [monitoring, setMonitoring] = useState(null);
  const [judgeProgress, setJudgeProgress] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [criteriaStageFilter, setCriteriaStageFilter] = useState('initial');
  const [imageUploading, setImageUploading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    organization: '',
    designation: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [editingCriteriaId, setEditingCriteriaId] = useState(null);
  const [criteriaForm, setCriteriaForm] = useState({
    name: '',
    description: '',
    weight: 10,
    maxScore: 10,
    criteriaType: 'organizational',
    order: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  // Assign Judge Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedJudges, setSelectedJudges] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedReportIds, setSelectedReportIds] = useState([]);
  const [reportActionBusy, setReportActionBusy] = useState(false);

  // Deadline editing
  const [editingDeadlineAppId, setEditingDeadlineAppId] = useState(null);
  const [deadlineValue, setDeadlineValue] = useState('');
  const [savingDeadline, setSavingDeadline] = useState(false);

  // Multi-stage nominations management state
  const [nominationsStageTab, setNominationsStageTab] = useState('initial');
  const [editingDeadlineIsF2F, setEditingDeadlineIsF2F] = useState(false);
  const [assignModalStage, setAssignModalStage] = useState('initial');
  // Change Password form
  const [changeSuccess, setChangeSuccess] = useState('');
  const [changeError,   setChangeError]   = useState('');
  const [eligibilityReview, setEligibilityReview] = useState({ appId: null, isEligible: true, note: '' });
  const { register: regPassword, handleSubmit: handlePassword, formState: { errors: passErrors, isSubmitting: passSubmitting }, watch, reset: resetPassword } = useForm();
  const newPassword = watch('newPassword');
  const passwordRules = [
    { label: 'At least 8 characters', passed: (newPassword || '').length >= 8 },
    { label: 'Includes an uppercase letter', passed: /[A-Z]/.test(newPassword || '') },
    { label: 'Includes a number', passed: /\d/.test(newPassword || '') },
    { label: 'Includes a symbol', passed: /[^A-Za-z0-9]/.test(newPassword || '') },
  ];
  const passwordStrength = passwordRules.filter((rule) => rule.passed).length;

  // Broadcast form
  const { register: regBroadcast, handleSubmit: handleBroadcast, reset: resetBroadcast, watch: watchBroadcast, formState: { isSubmitting: broadcastSubmitting } } = useForm({
    defaultValues: { role: 'all', title: '', message: '' },
  });

  // ─── Judge Management States ──────────────────────────────────────────────────
  const [judges, setJudges] = useState([]);
  const [judgesLoading, setJudgesLoading] = useState(false);
  const [judgeSearch, setJudgeSearch] = useState('');
  const [judgeMainCategoryFilter, setJudgeMainCategoryFilter] = useState('');
  const [judgeSubCategoryFilter, setJudgeSubCategoryFilter] = useState('');
  const [judgeCountryFilter, setJudgeCountryFilter] = useState('');
  const [judgeStatusFilter, setJudgeStatusFilter] = useState('');
  const [judgeSortBy, setJudgeSortBy] = useState('Alphabetical');
  const [judgePage, setJudgePage] = useState(1);
  const [judgeTotalPages, setJudgeTotalPages] = useState(1);
  const [judgeTotal, setJudgeTotal] = useState(0);

  // Modals & Forms
  const [judgeModalOpen, setJudgeModalOpen] = useState(false);
  const [editingJudge, setEditingJudge] = useState(null); // null if adding
  const [judgeForm, setJudgeForm] = useState({
    fullName: '',
    designation: '',
    organization: '',
    country: '',
    email: '',
    linkedin: '',
    mainCategory: '',
    subCategories: [],
    status: 'Active',
    isGrandJury: false,
  });
  const [judgeFormErrors, setJudgeFormErrors] = useState({});
  const [judgeSaving, setJudgeSaving] = useState(false);

  // Photo uploads
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoModalJudge, setPhotoModalJudge] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Detail View
  const [judgeViewModalOpen, setJudgeViewModalOpen] = useState(false);
  const [viewingJudge, setViewingJudge] = useState(null);

  // Image compressor helper
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.85
          );
        };
      };
    });
  };

  const fetchJudges = async () => {
    try {
      setJudgesLoading(true);
      const { data } = await judgeService.getJudges({ all: 'true' });
      setJudges(data.data.judges || []);
      setJudgeTotal(data.data.total || 0);
    } catch (err) {
      toast.error('Failed to load judges list.');
    } finally {
      setJudgesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'judge-management') {
      fetchJudges();
    }
  }, [activeTab]);

  const [sendingWelcomes, setSendingWelcomes] = useState(false);

  const handleSendWelcomeEmails = async () => {
    if (!window.confirm('Are you sure you want to send a welcome email and account setup link to all registered judges?')) return;
    try {
      setSendingWelcomes(true);
      const { data } = await judgeService.sendWelcomeEmails();
      toast.success(data.message || 'Welcome emails dispatched successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send welcome emails.');
    } finally {
      setSendingWelcomes(false);
    }
  };

  const handleOpenAddJudge = () => {
    setEditingJudge(null);
    setJudgeForm({
      fullName: '',
      designation: '',
      organization: '',
      country: 'Sri Lanka',
      email: '',
      linkedin: '',
      mainAwardCategory: '',
      awardSubCategories: [],
      status: 'Active',
      isGrandJury: false,
    });
    setPhotoFile(null);
    setPhotoPreview('');
    setJudgeFormErrors({});
    setJudgeModalOpen(true);
  };

  const handleOpenEditJudge = (judgeItem) => {
    setEditingJudge(judgeItem);
    setJudgeForm({
      fullName: judgeItem.fullName || '',
      designation: judgeItem.designation || '',
      organization: judgeItem.organization || '',
      country: judgeItem.country || 'Sri Lanka',
      email: judgeItem.email || '',
      linkedin: judgeItem.linkedin || '',
      mainAwardCategory: judgeItem.mainAwardCategory || judgeItem.mainCategory || '',
      awardSubCategories: judgeItem.awardSubCategories || judgeItem.subCategories || [],
      status: judgeItem.status || 'Active',
      isGrandJury: !!judgeItem.isGrandJury,
    });
    setPhotoFile(null);
    setPhotoPreview(judgeItem.photo ? (judgeImages[judgeItem.photo] ? judgeImages[judgeItem.photo] : buildAssetUrl(judgeItem.photo)) : '');
    setJudgeFormErrors({});
    setJudgeModalOpen(true);
  };

  const handleOpenPhotoModal = (judgeItem) => {
    setPhotoModalJudge(judgeItem);
    setPhotoFile(null);
    setPhotoPreview(judgeItem.photo ? (judgeImages[judgeItem.photo] ? judgeImages[judgeItem.photo] : buildAssetUrl(judgeItem.photo)) : '');
    setPhotoModalOpen(true);
  };

  const handleOpenViewModal = (judgeItem) => {
    setViewingJudge(judgeItem);
    setJudgeViewModalOpen(true);
  };

  const validateJudgeForm = () => {
    const errors = {};
    if (!judgeForm.fullName.trim()) errors.fullName = 'Full name is required';
    if (!judgeForm.designation.trim()) errors.designation = 'Designation is required';
    if (!judgeForm.organization.trim()) errors.organization = 'Organization is required';
    if (!judgeForm.country.trim()) errors.country = 'Country is required';
    
    if (!judgeForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(judgeForm.email)) {
      errors.email = 'Please provide a valid email address';
    }

    if (!judgeForm.mainAwardCategory) {
      errors.mainAwardCategory = 'Main Award Category is required';
    }

    if (!judgeForm.awardSubCategories || judgeForm.awardSubCategories.length === 0) {
      errors.awardSubCategories = 'At least one subcategory must be assigned';
    }

    setJudgeFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveJudge = async (e) => {
    e.preventDefault();
    if (!validateJudgeForm()) return;

    try {
      setJudgeSaving(true);
      let savedJudge;
      
      if (editingJudge) {
        // Edit mode
        const { data } = await judgeService.updateJudge(editingJudge._id, judgeForm);
        savedJudge = data.data.judge;
        
        // Upload photo if photo file selected
        if (photoFile) {
          const formData = new FormData();
          const optimizedFile = await compressImage(photoFile);
          formData.append('photo', optimizedFile);
          await judgeService.uploadJudgePhoto(editingJudge._id, formData);
        }
        
        toast.success('Judge profile updated successfully.');
      } else {
        // Add mode
        const { data } = await judgeService.createJudge(judgeForm);
        savedJudge = data.data.judge;
        
        // Upload photo if photo file selected
        if (photoFile) {
          const formData = new FormData();
          const optimizedFile = await compressImage(photoFile);
          formData.append('photo', optimizedFile);
          await judgeService.uploadJudgePhoto(savedJudge._id, formData);
        }
        
        toast.success('Judge profile added successfully.');
      }

      setJudgeModalOpen(false);
      fetchJudges();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save judge profile.');
    } finally {
      setJudgeSaving(false);
    }
  };

  const handleUploadPhotoOnly = async (e) => {
    e.preventDefault();
    if (!photoFile || !photoModalJudge) return;

    try {
      setPhotoUploading(true);
      const formData = new FormData();
      const optimizedFile = await compressImage(photoFile);
      formData.append('photo', optimizedFile);
      await judgeService.uploadJudgePhoto(photoModalJudge._id, formData);
      toast.success('Profile photo updated successfully.');
      setPhotoModalOpen(false);
      fetchJudges();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleDeleteJudge = async (judgeId) => {
    if (!window.confirm('Are you sure you want to delete this judge profile? (Soft delete will hide them from the registry)')) return;
    try {
      await judgeService.deleteJudge(judgeId);
      toast.success('Judge profile deleted successfully.');
      fetchJudges();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete judge.');
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await adminService.getDashboardStats();
      setStats(data.data);
    } catch { toast.error('Failed to load dashboard statistics.'); }
  };

  const fetchApps = async () => {
    try {
      const params = {
        search: appSearch || undefined,
        status: appStatusFilter || undefined,
        limit: 100,
      };
      const { data } = await applicationService.getAllApplications(params);
      setApplications(data.data.applications);
    } catch { toast.error('Failed to load applications.'); }
  };

  const fetchUsers = async () => {
    try {
      const params = { role: userRoleFilter || undefined, limit: 100 };
      const { data } = await adminService.getUsers(params);
      setUsers(data.data.users);
    } catch { toast.error('Failed to load users.'); }
  };

  const fetchAdmins = async () => {
    try {
      const { data } = await adminService.getUsers({ role: 'admin', limit: 100 });
      setAdmins(data.data.users);
    } catch { toast.error('Failed to load admins.'); }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await categoryService.getCategories();
      setCategories(data.data.categories);
    } catch { toast.error('Failed to load categories.'); }
  };

  const fetchMonitoring = async () => {
    try {
      const [{ data: monitoringData }, { data: judgeProgressData }] = await Promise.all([
        applicationService.getMonitoringOverview(),
        applicationService.getJudgeProgress(),
      ]);
      setMonitoring(monitoringData.data.overview);
      setJudgeProgress(judgeProgressData.data.progress || []);
    } catch {
      toast.error('Failed to load monitoring metrics.');
    }
  };

  const fetchCriteria = async () => {
    try {
      const { data } = await evaluationCriteriaService.getAllCriteria({ stage: criteriaStageFilter });
      setCriteria(data.data.criteria);
    } catch { toast.error('Failed to load evaluation criteria.'); }
  };

  const fetchTracker = async () => {
    try {
      setTrackerLoading(true);
      const params = {
        stage: trackerStage,
        mainCategory: trackerMainCategory !== 'all' ? trackerMainCategory : undefined,
        subCategory: trackerSubCategory !== 'all' ? trackerSubCategory : undefined,
        search: trackerSearch || undefined,
      };
      const { data } = await evaluationService.getEvaluationTracker(params);
      setTrackerApps(data.data.applications || []);
      setTrackerStats(data.data.stats || null);
    } catch {
      toast.error('Failed to load evaluation tracker details.');
    } finally {
      setTrackerLoading(false);
    }
  };


  useEffect(() => {
    if (activeTab === 'monitoring') {
      fetchTracker();
    }
  }, [trackerStage, trackerMainCategory, trackerSubCategory, trackerSearch, activeTab]);

  useEffect(() => {
    if (activeTab === 'criteria') {
      fetchCriteria();
    }
  }, [criteriaStageFilter, activeTab]);
  const loadAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchApps(),
      fetchUsers(),
      fetchAdmins(),
      fetchCategories(),
      fetchMonitoring(),
      fetchCriteria(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [appSearch, appStatusFilter, userRoleFilter]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const judgesList = users.filter((userItem) => userItem.role === 'judge');
  const candidatesList = users.filter((userItem) => userItem.role === 'candidate');
  const broadcastRole = watchBroadcast('role') || 'all';
  const broadcastTitle = watchBroadcast('title') || '';
  const broadcastMessage = watchBroadcast('message') || '';
  const getStatusAudienceCount = (status) => {
    const candidateIds = new Set(
      applications
        .filter((app) => app.status === status)
        .map((app) => app.candidate?._id || app.candidate)
        .filter(Boolean)
    );
    return candidateIds.size;
  };
  const broadcastStatusAudience = BROADCAST_STATUS_AUDIENCES.find((audience) => audience.value === broadcastRole);
  const broadcastAudienceLabel = broadcastStatusAudience?.label
    || (broadcastRole === 'all' ? 'All users' : broadcastRole === 'candidate' ? 'Candidates' : 'Judges');
  const broadcastAudienceCount = broadcastStatusAudience
    ? getStatusAudienceCount(broadcastStatusAudience.status)
    : broadcastRole === 'judge'
      ? judgesList.length
      : broadcastRole === 'candidate'
        ? candidatesList.length
        : users.length;

  // Change Password submit
  const onChangePasswordSubmit = async (data) => {
    try {
      setChangeError('');
      setChangeSuccess('');
      await api.post('/auth/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      setChangeSuccess('Password updated successfully!');
      toast.success('Password changed successfully.');
      resetPassword();
    } catch (err) {
      setChangeError(err.response?.data?.message || 'Failed to update password.');
      toast.error('Password change failed.');
    }
  };

  // Status transitions
  const handleStatusChange = async (appId, newStatus) => {
    const app = applications.find((item) => item._id === appId);
    if (!app || app.status === newStatus) return;

    try {
      const { data } = await applicationService.changeStatus(appId, { status: newStatus });
      if (data.data?.statusEmail?.sent) {
        toast.success('Application status updated and email sent to the owner.');
      } else {
        toast.success('Application status updated.');
        toast.error('Owner email could not be sent.');
      }
      fetchApps();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // Deadline editing
  const handleEditDeadline = (app, isF2F = false) => {
    setEditingDeadlineAppId(app._id);
    setEditingDeadlineIsF2F(isF2F);
    const targetDeadline = isF2F ? app.deadlineF2F : app.deadline;
    if (targetDeadline) {
      const date = new Date(targetDeadline);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(date - tzOffset)).toISOString().slice(0, 16);
      setDeadlineValue(localISOTime);
    } else {
      setDeadlineValue('');
    }
  };

  // Deadline saving
  const handleSaveDeadline = async () => {
    try {
      setSavingDeadline(true);
      const isoString = new Date(deadlineValue).toISOString();
      if (editingDeadlineIsF2F) {
        await applicationService.updateApplicationDeadlineF2F(editingDeadlineAppId, isoString);
        toast.success('Stage 2 evaluation deadline updated successfully.');
      } else {
        await applicationService.updateApplicationDeadline(editingDeadlineAppId, isoString);
        toast.success('Application deadline updated successfully.');
      }
      setEditingDeadlineAppId(null);
      setDeadlineValue('');
      fetchApps();
      fetchStats();
      fetchMonitoring();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update deadline.');
    } finally {
      setSavingDeadline(false);
    }
  };

  const handleDeleteApplication = async (app) => {
    const title = app.projectTitle || app.referenceNumber || 'this application';
    if (!window.confirm(`Delete "${title}"? This action cannot be undone.`)) return;

    try {
      await applicationService.deleteApplicationAsAdmin(app._id);
      toast.success('Application deleted.');
      fetchApps();
      fetchStats();
      fetchMonitoring();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete application.');
    }
  };

  // User Activation Toggle
  const handleToggleUser = async (userId) => {
    try {
      await adminService.toggleUserStatus(userId);
      toast.success('User status updated.');
      fetchUsers();
      fetchAdmins();
    } catch {
      toast.error('Failed to toggle user status.');
    }
  };

  // User Delete
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted.');
      fetchUsers();
      fetchAdmins();
    } catch {
      toast.error('Failed to delete user.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoryService.deleteCategory(id);
      toast.success('Category deleted.');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category.');
    }
  };

  // Seed default categories
  const handleSeedCategories = async () => {
    try {
      const { data } = await categoryService.seedDefaults();
      toast.success(data.message);
      fetchCategories();
    } catch {
      toast.error('Failed to seed default categories.');
    }
  };

  // ── Criteria Management Handlers ──
  const handleSubmitCriteria = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...criteriaForm,
        weight: Number(criteriaForm.weight || 0),
        maxScore: Number(criteriaForm.maxScore || 0),
        order: Number(criteriaForm.order || 0),
      };
      if (editingCriteriaId) {
        await evaluationCriteriaService.updateCriteria(editingCriteriaId, payload);
        toast.success('Evaluation criteria updated.');
      } else {
        await evaluationCriteriaService.createCriteria(payload);
        toast.success('Evaluation criteria created.');
      }
      setCriteriaForm({ name: '', description: '', weight: 10, maxScore: 10, criteriaType: 'organizational', stage: criteriaStageFilter, order: 0, isActive: true });
      setEditingCriteriaId(null);
      fetchCriteria();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save evaluation criteria.');
    }
  };

  const handleEditCriteria = (c) => {
    setEditingCriteriaId(c._id);
    setCriteriaForm({
      name: c.name || '',
      description: c.description || '',
      weight: c.weight || 10,
      maxScore: c.maxScore || 10,
      criteriaType: c.criteriaType || 'organizational',
      stage: c.stage || criteriaStageFilter,
      order: c.order || 0,
      isActive: c.isActive !== false,
    });
  };

  const handleDeleteCriteria = async (id) => {
    if (!window.confirm('Are you sure you want to delete this evaluation criterion?')) return;
    try {
      await evaluationCriteriaService.deleteCriteria(id);
      toast.success('Evaluation criteria deleted.');
      fetchCriteria();
    } catch {
      toast.error('Failed to delete criteria.');
    }
  };

  const handleSeedCriteria = async () => {
    try {
      const { data } = await evaluationCriteriaService.seedDefaults();
      toast.success(data.message);
      fetchCriteria();
    } catch {
      toast.error('Failed to seed default evaluation criteria.');
    }
  };

  // Broadcast submit
  const onBroadcastSubmit = async (data) => {
    try {
      const statusAudience = BROADCAST_STATUS_AUDIENCES.find((audience) => audience.value === data.role);
      const payload = statusAudience
        ? { ...data, role: 'candidate', status: statusAudience.status }
        : data;
      await adminService.broadcastNotification(payload);
      toast.success('Broadcast notification sent successfully.');
      resetBroadcast();
    } catch {
      toast.error('Failed to send broadcast.');
    }
  };

  // Open Judge Assignment
  const openAssignModal = (app, stage = 'initial') => {
    setSelectedApp(app);
    setAssignModalStage(stage);
    const targetJudges = stage === 'f2f' ? app.assignedJudgesF2F : app.assignedJudges;
    setSelectedJudges(targetJudges?.map(j => j._id || j) || []);
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async () => {
    try {
      if (assignModalStage === 'f2f') {
        await applicationService.assignJudgesF2F(selectedApp._id, selectedJudges);
        toast.success('Stage 2 judges assigned successfully.');
      } else {
        await applicationService.assignJudges(selectedApp._id, selectedJudges);
        toast.success('Judges assigned successfully.');
      }
      setAssignModalOpen(false);
      fetchApps();
      fetchMonitoring();
    } catch {
      toast.error('Failed to assign judges.');
    }
  };

  const handleAutoAssign = async (app) => {
    if (!window.confirm(`Are you sure you want to auto-assign judges matching the category for "${app.projectTitle}"?`)) return;
    try {
      const { data } = await applicationService.autoAssignJudges(app._id);
      toast.success(data.message || 'Judges auto-assigned successfully.');
      fetchApps();
      fetchMonitoring();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to auto-assign judges.');
    }
  };

  const handleEligibilityReview = async (e) => {
    e.preventDefault();
    try {
      await applicationService.reviewEligibility(eligibilityReview.appId, {
        isEligible: eligibilityReview.isEligible,
        note: eligibilityReview.note,
      });
      toast.success('Eligibility review saved.');
      setEligibilityReview({ appId: null, isEligible: true, note: '' });
      fetchApps();
      fetchMonitoring();
    } catch {
      toast.error('Failed to save eligibility review.');
    }
  };

  const toggleJudgeSelection = (judgeId) => {
    setSelectedJudges(prev =>
      prev.includes(judgeId) ? prev.filter(id => id !== judgeId) : [...prev, judgeId]
    );
  };

  const toggleReportSelection = (appId) => {
    setSelectedReportIds((prev) => prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]);
  };

  const handleExportReport = async (format = 'csv') => {
    try {
      const { data } = await applicationService.exportApplications(format);
      const fileName = `ai-awards-report.${format}`;
      const blob = new Blob([data], { type: format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported ${fileName}.`);
    } catch {
      toast.error('Report export failed.');
    }
  };

  const handlePublishFinalists = async () => {
    if (!selectedReportIds.length) {
      toast.error('Select at least one application first.');
      return;
    }

    setReportActionBusy(true);
    try {
      await applicationService.publishFinalists(selectedReportIds);
      toast.success('Finalists published.');
      setSelectedReportIds([]);
      fetchApps();
      fetchMonitoring();
    } catch {
      toast.error('Failed to publish finalists.');
    } finally {
      setReportActionBusy(false);
    }
  };

  const handlePublishWinners = async () => {
    if (!selectedReportIds.length) {
      toast.error('Select at least one application first.');
      return;
    }

    setReportActionBusy(true);
    try {
      await applicationService.publishWinners(selectedReportIds);
      toast.success('Winners published.');
      setSelectedReportIds([]);
      fetchApps();
      fetchMonitoring();
    } catch {
      toast.error('Failed to publish winners.');
    } finally {
      setReportActionBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col pt-20">
      {/* Main dashboard content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-6 text-center !hover:transform-none">
            <div className="w-16 h-16 rounded-full bg-accent-500/15 border border-accent-500/30 flex items-center justify-center mx-auto mb-4 font-display font-bold text-accent-300 text-2xl">
              {user?.firstName?.charAt(0) || 'A'}
            </div>
            <h2 className="font-display font-bold text-white text-lg">{user?.fullName}</h2>
            <span className="badge-gold mt-2 text-[10px] uppercase font-mono">{user?.role}</span>
          </div>

          <div className="glass-card p-2 space-y-1 !hover:transform-none">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: RiDashboardLine },
              { id: 'applications', label: 'Manage Nominations', icon: RiFileList3Line },
              { id: 'monitoring', label: 'Application Monitoring', icon: RiFileChartLine },
              { id: 'judge-management', label: 'Judge Management', icon: RiShieldUserLine },
              { id: 'users', label: 'User Directory', icon: RiTeamLine },
              { id: 'categories', label: 'Categories', icon: RiFolderShield2Line },
              { id: 'criteria', label: 'Evaluation Criteria', icon: RiStarLine },
              { id: 'broadcast', label: 'Broadcast Alerts', icon: RiMailSendLine },
              { id: 'reports', label: 'Reports & Export', icon: RiFileChartLine },
              { id: 'password', label: 'Change Password', icon: RiLockPasswordLine },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-accent-500 text-white shadow-glow'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <RiLogoutBoxLine size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Panel */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-8 !hover:transform-none ${
              ['applications', 'users'].includes(activeTab) ? '' : 'min-h-[500px]'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && stats && (
                  <div className="space-y-8">
                    <h3 className="font-display font-bold text-white text-xl flex justify-between items-center">
                      Dashboard Statistics
                      <button onClick={loadAll} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
                        <RiRefreshLine size={16} />
                      </button>
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Applications</span>
                        <p className="text-white text-xl font-black mt-1 font-display">{stats.stats.totalApplications}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Draft Applications</span>
                        <p className="text-white text-xl font-black mt-1 font-display">{stats.stats.draftApps || 0}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Submitted</span>
                        <p className="text-white text-xl font-black mt-1 font-display text-accent-400">{stats.stats.submittedApps}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Selected to Next Round</span>
                        <p className="text-white text-xl font-black mt-1 font-display text-cyan-400">{stats.stats.selectedToNextRoundApps || 0}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Finalists</span>
                        <p className="text-white text-xl font-black mt-1 font-display text-gold-400">{stats.stats.finalistApps}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Winners</span>
                        <p className="text-white text-xl font-black mt-1 font-display text-emerald-400">{stats.stats.winnerApps || 0}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Judges</span>
                        <p className="text-white text-xl font-black mt-1 font-display">{stats.stats.totalJudges}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Pending Evaluations</span>
                        <p className="text-white text-xl font-black mt-1 font-display text-amber-400">{stats.stats.pendingEvaluations}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Completed Evaluations</span>
                        <p className="text-white text-xl font-black mt-1 font-display text-emerald-400">{stats.stats.completedEvaluations}</p>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider">Judges</h4>
                        <span className="text-[11px] text-slate-400">{judgesList.length} available</span>
                      </div>
                      {judgesList.length > 0 ? (
                        <div className="grid gap-3 md:grid-cols-2">
                          {judgesList.map((judge) => (
                            <div key={judge._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-sm font-semibold text-white">{judge.firstName} {judge.lastName}</div>
                                  <div className="text-[11px] text-slate-400">{judge.email}</div>
                                </div>
                                <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-300">
                                  Judge
                                </span>
                              </div>
                              {(judge.organization || judge.designation) && (
                                <div className="mt-2 text-[11px] text-slate-500">
                                  {judge.organization}{judge.organization && judge.designation ? ' • ' : ''}{judge.designation}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-slate-400">
                          No judges have been added yet.
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Trend chart */}
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/5 h-80">
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5"><RiPulseLine className="text-accent-400" /> Submission Trend</h4>
                        <ResponsiveContainer width="100%" height="85%">
                          <LineChart data={stats.submissionTrend}>
                            <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                            <YAxis stroke="#475569" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                            <Line type="monotone" dataKey="count" stroke="#0072ff" strokeWidth={3} dot={{ fill: '#00ff87' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Category Breakdown chart */}
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/5 h-80 flex flex-col">
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5"><RiAwardLine className="text-gold-400" /> Category Breakdown</h4>
                        <ResponsiveContainer width="100%" height="68%">
                          <BarChart data={stats.categoryBreakdown}>
                            <XAxis dataKey="name" stroke="#475569" fontSize={8} tickFormatter={(val) => val.split(' ').slice(2).join(' ')} />
                            <YAxis stroke="#475569" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                            <Bar dataKey="count" fill="#00ff87" radius={[4, 4, 0, 0]}>
                              {stats.categoryBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 overflow-y-auto pr-1 text-[10px] text-slate-300">
                          {stats.categoryBreakdown.map((entry, index) => (
                            <div key={entry.name || index} className="flex min-w-0 items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="truncate" title={`${entry.name}: ${entry.count}`}>
                                {entry.name} ({entry.count})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ADMINS TAB */}
                {activeTab === 'admins' && (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div>
                        <h3 className="font-display font-bold text-white text-xl">Registered Admins</h3>
                        <p className="text-slate-400 text-xs mt-1">View all administrators currently registered in the system.</p>
                      </div>
                      <div className="text-sm text-slate-400">{admins.length} admin{admins.length === 1 ? '' : 's'}</div>
                    </div>

                    {admins.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {admins.map((admin) => (
                          <div key={admin._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-white font-semibold">{admin.firstName} {admin.lastName}</div>
                                <div className="text-[11px] text-slate-400 mt-1">{admin.email}</div>
                              </div>
                              <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-300">
                                Admin
                              </span>
                            </div>
                            {(admin.organization || admin.designation) && (
                              <div className="mt-3 text-sm text-slate-400">
                                {admin.organization}{admin.organization && admin.designation ? ' • ' : ''}{admin.designation}
                              </div>
                            )}
                            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
                              <span className="rounded-full bg-white/5 px-2.5 py-1">Phone: {admin.phone || 'Not provided'}</span>
                              <span className="rounded-full bg-white/5 px-2.5 py-1">Role: {admin.role}</span>
                              <span className={`rounded-full px-2.5 py-1 ${admin.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {admin.isActive ? 'Active' : 'Suspended'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                        No admins have been registered yet.
                      </div>
                    )}
                  </div>
                )}

                {/* 2. CANDIDATES TAB */}
                {activeTab === 'candidates' && (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div>
                        <h3 className="font-display font-bold text-white text-xl">Registered Candidates</h3>
                        <p className="text-slate-400 text-xs mt-1">View all candidates currently registered in the system.</p>
                      </div>
                      <div className="text-sm text-slate-400">{users.filter((userItem) => userItem.role === 'candidate').length} candidate{users.filter((userItem) => userItem.role === 'candidate').length === 1 ? '' : 's'}</div>
                    </div>

                    {users.filter((userItem) => userItem.role === 'candidate').length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {users.filter((userItem) => userItem.role === 'candidate').map((candidate) => (
                          <div key={candidate._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-white font-semibold">{candidate.firstName} {candidate.lastName}</div>
                                <div className="text-[11px] text-slate-400 mt-1">{candidate.email}</div>
                              </div>
                              <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-300">
                                Candidate
                              </span>
                            </div>
                            {(candidate.organization || candidate.designation) && (
                              <div className="mt-3 text-sm text-slate-400">
                                {candidate.organization}{candidate.organization && candidate.designation ? ' • ' : ''}{candidate.designation}
                              </div>
                            )}
                            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
                              <span className="rounded-full bg-accent-500/10 px-2.5 py-1 font-mono text-accent-300">{candidate.registrationNumber || 'Registration pending'}</span>
                              <span className="rounded-full bg-white/5 px-2.5 py-1">Phone: {candidate.phone || 'Not provided'}</span>
                              <span className="rounded-full bg-white/5 px-2.5 py-1">Role: {candidate.role}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                        No candidates have been registered yet.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. JUDGES TAB */}
                {activeTab === 'judges' && (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div>
                        <h3 className="font-display font-bold text-white text-xl">Registered Judges</h3>
                        <p className="text-slate-400 text-xs mt-1">View all judges currently registered in the system.</p>
                      </div>
                      <div className="text-sm text-slate-400">{judgesList.length} judge{judgesList.length === 1 ? '' : 's'}</div>
                    </div>

                    {judgesList.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {judgesList.map((judge) => (
                          <div key={judge._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-white font-semibold">{judge.firstName} {judge.lastName}</div>
                                <div className="text-[11px] text-slate-400 mt-1">{judge.email}</div>
                              </div>
                              <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-300">
                                Judge
                              </span>
                            </div>
                            {(judge.organization || judge.designation) && (
                              <div className="mt-3 text-sm text-slate-400">
                                {judge.organization}{judge.organization && judge.designation ? ' • ' : ''}{judge.designation}
                              </div>
                            )}
                            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
                              <span className="rounded-full bg-white/5 px-2.5 py-1">Phone: {judge.phone || 'Not provided'}</span>
                              <span className="rounded-full bg-white/5 px-2.5 py-1">Role: {judge.role}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                        No judges have been registered yet.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. APPLICATIONS TAB */}
                {activeTab === 'applications' && (() => {
                  const filteredApps = applications.filter(app => {
                    if (nominationsStageTab === 'f2f') {
                      return app.status === 'f2f_stage';
                    } else {
                      return app.status !== 'f2f_stage' && app.status !== 'draft';
                    }
                  });
                  return (
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                          <h3 className="font-display font-bold text-white text-xl">Manage Nominations</h3>
                          <p className="text-slate-400 text-xs mt-1">Audit statuses and assign judges panels.</p>
                        </div>

                        <div className="flex gap-3 w-full sm:w-auto">
                          <input
                            className="input-field max-w-[200px]"
                            placeholder="Search title/ref..."
                            value={appSearch}
                            onChange={(e) => setAppSearch(e.target.value)}
                          />
                          <select
                            className="input-field max-w-[150px]"
                            value={appStatusFilter}
                            onChange={(e) => setAppStatusFilter(e.target.value)}
                          >
                            <option value="">All Statuses</option>
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="eligible">Eligible</option>
                            <option value="initial_stage">Initial Stage</option>
                            <option value="f2f_stage">Face-to-Face Stage</option>
                            <option value="finalist">Finalist</option>
                            <option value="winner">Winner</option>
                          </select>
                        </div>
                      </div>

                      {/* Stage Tabs */}
                      <div className="flex border-b border-white/10 mb-6 gap-6">
                        <button
                          onClick={() => setNominationsStageTab('initial')}
                          className={`pb-3 text-sm font-semibold transition-all relative ${
                            nominationsStageTab === 'initial'
                              ? 'text-accent-400 border-b-2 border-accent-400'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                           Initial Stage
                        </button>
                        <button
                          onClick={() => setNominationsStageTab('f2f')}
                          className={`pb-3 text-sm font-semibold transition-all relative ${
                            nominationsStageTab === 'f2f'
                              ? 'text-accent-400 border-b-2 border-accent-400'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Face-to-Face Stage
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-300">
                          <thead className="bg-white/5 text-[10px] uppercase font-bold text-slate-400">
                            {nominationsStageTab === 'f2f' ? (
                              <tr>
                                <th className="p-4 text-left">Ref/Title</th>
                                <th className="p-4 text-left">Category</th>
                                <th className="p-4 text-left">Candidate</th>
                                <th className="p-4 text-left">Phone</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-left">Stage 2 Deadline</th>
                                <th className="p-4 text-left">Stage 2 Judges Panel</th>
                                <th className="p-4 text-center">Round 1 Score</th>
                                <th className="p-4 text-center">Stage 2 Score</th>
                                <th className="p-4 text-left">Actions</th>
                              </tr>
                            ) : (
                              <tr>
                                <th className="p-4 text-left">Ref/Title</th>
                                <th className="p-4 text-left">Category</th>
                                <th className="p-4 text-left">Candidate</th>
                                <th className="p-4 text-left">Phone</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-left">Deadline</th>
                                <th className="p-4 text-left">Judges Panel</th>
                                <th className="p-4 text-center">Score</th>
                                <th className="p-4 text-left">Actions</th>
                              </tr>
                            )}
                          </thead>
                          <tbody>
                            {filteredApps.map(app => {
                              const isF2F = nominationsStageTab === 'f2f';
                              return (
                                <tr key={app._id} className="border-b border-white/5 hover:bg-white/5">
                                  <td className="p-4">
                                    <div className="font-bold text-white truncate max-w-[150px]">{app.projectTitle}</div>
                                    <div className="text-[10px] font-mono text-slate-500">{app.referenceNumber || 'Draft'}</div>
                                  </td>
                                  <td className="p-4 truncate max-w-[120px]">{app.category?.name}</td>
                                  <td className="p-4">
                                    <div>{app.candidate?.firstName} {app.candidate?.lastName}</div>
                                    <div className="text-[10px] text-slate-500">{app.candidate?.organization}</div>
                                  </td>
                                  <td className="p-4 font-mono text-[11px] text-slate-300">
                                    {app.primaryContactPhone || app.candidate?.phone || 'Not provided'}
                                  </td>
                                  <td className="p-4">
                                    <select
                                      className="bg-navy-900 border border-white/10 rounded px-2 py-1 text-[10px]"
                                      value={app.status}
                                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                    >
                                      <option value={app.status}>{app.statusLabel}</option>
                                      <option value="under_review">Under Review</option>
                                      <option value="eligible">Eligible</option>
                                      <option value="ineligible">Ineligible</option>
                                      <option value="initial_stage">Initial Stage</option>
                                      <option value="f2f_stage">Face-to-Face Stage</option>
                                      <option value="finalist">Finalist</option>
                                      <option value="winner">Winner</option>
                                    </select>
                                  </td>
                                  <td className="p-4">
                                    {editingDeadlineAppId === app._id && editingDeadlineIsF2F === isF2F ? (
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="datetime-local"
                                          className="bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
                                          value={deadlineValue}
                                          onChange={(e) => setDeadlineValue(e.target.value)}
                                        />
                                        <button
                                          onClick={handleSaveDeadline}
                                          disabled={savingDeadline}
                                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-[11px] font-bold transition-colors disabled:opacity-50"
                                        >
                                          {savingDeadline ? '...' : '✓'}
                                        </button>
                                        <button
                                          onClick={handleCancelDeadlineEdit}
                                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-[11px] font-bold transition-colors"
                                        >
                                          ✗
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-3">
                                        {(isF2F ? app.deadlineF2F : app.deadline) ? (
                                          <div className="flex flex-col">
                                            <span className="text-[11px] font-mono text-white">
                                              {new Date(isF2F ? app.deadlineF2F : app.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-400">
                                              {new Date(isF2F ? app.deadlineF2F : app.deadline).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-[11px] text-slate-500 italic">No deadline set</span>
                                        )}
                                        <button
                                          onClick={() => handleEditDeadline(app, isF2F)}
                                          className="bg-accent-500 hover:bg-accent-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                                        >
                                          {(isF2F ? app.deadlineF2F : app.deadline) ? 'Edit' : 'Set'}
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-4">
                                    <div className="space-y-1.5">
                                      {(isF2F ? app.assignedJudgesF2F : app.assignedJudges)?.map(j => (
                                        <div key={j._id} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded w-fit">{j.firstName}</div>
                                      ))}
                                      <div className="flex flex-col gap-1 pt-1">
                                        <button
                                          onClick={() => openAssignModal(app, isF2F ? 'f2f' : 'initial')}
                                          className="text-accent-400 hover:text-accent-300 text-left text-[11px] font-bold block"
                                        >
                                          + Manual Assign
                                        </button>
                                        <button
                                          onClick={() => handleAutoAssign(app)}
                                          className="text-emerald-400 hover:text-emerald-300 text-left text-[11px] font-bold block"
                                        >
                                          ⚡ Auto Assign
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                  {isF2F ? (
                                    <>
                                      <td className="p-4 text-center font-mono font-bold text-slate-400">
                                        {app.averageScore !== undefined && app.averageScore !== null ? app.averageScore.toFixed(1) : '-'}
                                      </td>
                                      <td className="p-4 text-center">
                                        {app.averageScoreF2F !== undefined && app.averageScoreF2F !== null && app.evaluationCountF2F > 0 ? (
                                          <button
                                            onClick={() => openEvaluationsModal(app)}
                                            className="font-bold text-accent-400 hover:text-accent-300 hover:underline bg-accent-500/10 px-2.5 py-1 rounded border border-accent-500/20 font-mono transition-all"
                                            title="Click to view detailed evaluations"
                                          >
                                            {app.averageScoreF2F?.toFixed(1)}
                                          </button>
                                        ) : (
                                          <span className="text-slate-500">-</span>
                                        )}
                                      </td>
                                    </>
                                  ) : (
                                    <td className="p-4 text-center">
                                      {app.averageScore !== undefined && app.averageScore !== null && app.evaluationCount > 0 ? (
                                        <button
                                          onClick={() => openEvaluationsModal(app)}
                                          className="font-bold text-accent-400 hover:text-accent-300 hover:underline bg-accent-500/10 px-2.5 py-1 rounded border border-accent-500/20 font-mono transition-all"
                                          title="Click to view detailed evaluations"
                                        >
                                          {app.averageScore?.toFixed(1)}
                                        </button>
                                      ) : (
                                        <span className="text-slate-500">-</span>
                                      )}
                                    </td>
                                  )}
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <Link to={`/dashboard/applications/${app._id}`} className="text-accent-400 hover:underline">View</Link>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteApplication(app)}
                                        className="inline-flex items-center gap-1 text-red-400 hover:text-red-300"
                                      >
                                        <RiDeleteBinLine size={14} /> Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. APPLICATION MONITORING TAB */}
                {activeTab === 'monitoring' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="font-display font-bold text-white text-xl">Application Monitoring</h3>
                      <p className="text-slate-400 text-xs mt-1">Review submissions, screen eligibility, manage judge assignment, and track evaluation progress.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {monitoring && [
                        { label: 'Total Applications', value: monitoring.total },
                        { label: 'Pending Review', value: monitoring.pending },
                        { label: 'Screened', value: monitoring.screened },
                        { label: 'Assigned to Judges', value: monitoring.assigned },
                        { label: 'Completed Evaluations', value: monitoring.completedEvaluation },
                        { label: 'Pending Evaluations', value: monitoring.pendingEvaluation },
                      ].map((item) => (
                        <div key={item.label} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="text-slate-400 text-[10px] uppercase tracking-wider">{item.label}</div>
                          <div className="text-white text-2xl font-black mt-2 font-display">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                        <h4 className="font-display font-bold text-white text-base mb-4">Eligibility Screening</h4>
                        <div className="space-y-3 max-h-[320px] overflow-y-auto">
                          {applications.filter((app) => app.status === 'submitted' || app.status === 'under_review').map((app) => (
                            <div key={app._id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                              <div className="flex justify-between items-start gap-3">
                                <div>
                                  <div className="text-white text-sm font-semibold">{app.projectTitle}</div>
                                  <div className="text-[11px] text-slate-400">{app.candidate?.firstName} {app.candidate?.lastName}</div>
                                </div>
                                <button onClick={() => setEligibilityReview({ appId: app._id, isEligible: app.isEligible ?? true, note: app.adminNotes || '' })} className="text-accent-400 text-xs">Review</button>
                              </div>
                              {eligibilityReview.appId === app._id && (
                                <form onSubmit={handleEligibilityReview} className="mt-3 space-y-2">
                                  <textarea className="input-field h-20" placeholder="Review note" value={eligibilityReview.note} onChange={(e) => setEligibilityReview({ ...eligibilityReview, note: e.target.value })} />
                                  <div className="flex items-center gap-3">
                                    <label className="text-xs text-slate-300 flex items-center gap-2"><input type="radio" checked={eligibilityReview.isEligible} onChange={() => setEligibilityReview({ ...eligibilityReview, isEligible: true })} /> Eligible</label>
                                    <label className="text-xs text-slate-300 flex items-center gap-2"><input type="radio" checked={!eligibilityReview.isEligible} onChange={() => setEligibilityReview({ ...eligibilityReview, isEligible: false })} /> Ineligible</label>
                                  </div>
                                  <button type="submit" className="btn-primary text-xs">Save Review</button>
                                </form>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                        <h4 className="font-display font-bold text-white text-base mb-4">Judge Evaluation Progress</h4>
                        <div className="space-y-3 max-h-[320px] overflow-y-auto">
                          {judgeProgress.map((entry) => (
                            <div key={entry.judgeId} className="p-3 rounded-xl bg-white/5 border border-white/10">
                              <div className="flex justify-between items-start gap-3">
                                <div>
                                  <div className="text-white text-sm font-semibold">{entry.judgeName}</div>
                                  <div className="text-[11px] text-slate-400">{entry.email}</div>
                                </div>
                                <div className="text-right text-[11px] text-slate-400">
                                  <div>Submitted: {entry.submitted}</div>
                                  <div>Pending: {entry.pending}</div>
                                </div>
                              </div>
                              <div className="mt-2 text-[11px] text-accent-400">Average score: {entry.avgScore ?? '—'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3.5 JUDGE MANAGEMENT TAB */}
                {activeTab === 'judge-management' && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="font-display font-bold text-white text-xl">Judge Management</h3>
                        <p className="text-slate-400 text-xs mt-1">
                          {judges.length} judges registered. Edit details, change award categories, or manage photos below.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSendWelcomeEmails}
                          disabled={sendingWelcomes || judgesLoading || judges.length === 0}
                          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                          <RiMailSendLine size={16} />
                          {sendingWelcomes ? 'Sending...' : 'Send Welcome Emails'}
                        </button>
                        <button
                          onClick={handleOpenAddJudge}
                          className="bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-glow transition-all"
                        >
                          <RiUserLine size={16} />
                          Add Judge
                        </button>
                      </div>
                    </div>

                    {/* Judges List */}
                    {judgesLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <div key={idx} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                      </div>
                    ) : judges.length > 0 ? (
                      <div className="space-y-3">
                        {judges.map((judgeItem) => (
                          <div
                            key={judgeItem._id}
                            className="rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all p-5"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                              {/* Left: Avatar + Name + Role */}
                              <div className="flex items-center gap-4 min-w-0 lg:w-[280px] shrink-0">
                                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-slate-800 border border-white/10">
                                  <JudgeAvatar judge={judgeItem} variant="card" className="w-full h-full text-xs border-0 shadow-none hover:scale-100" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-white text-sm truncate">{judgeItem.fullName}</div>
                                  <div className="text-[11px] text-accent-400 font-semibold truncate">{judgeItem.designation}</div>
                                  <div className="text-[10px] text-slate-500 truncate">{judgeItem.organization} · {judgeItem.country}</div>
                                </div>
                              </div>

                              {/* Middle: Category & Status */}
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category:</span>
                                  <span className="text-xs text-white font-semibold">{judgeItem.mainAwardCategory || judgeItem.mainCategory || '—'}</span>
                                  {judgeItem.isGrandJury && (
                                    <span className="bg-gold-500/10 text-gold-400 border border-gold-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                      Grand Jury
                                    </span>
                                  )}
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${judgeItem.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    {judgeItem.status}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {(judgeItem.awardSubCategories || judgeItem.subCategories)?.map((sub, i) => (
                                    <span key={i} className="bg-white/5 border border-white/10 text-[9px] px-1.5 py-0.5 rounded text-slate-400" title={sub}>
                                      {getSubCategoryDisplayName(sub)}
                                    </span>
                                  ))}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">{judgeItem.email}</div>
                              </div>

                              {/* Right: Action buttons */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => handleOpenEditJudge(judgeItem)}
                                  className="px-3 py-1.5 bg-white/5 hover:bg-accent-500/15 text-slate-300 hover:text-accent-400 rounded-lg text-[11px] font-bold border border-white/10 transition-all flex items-center gap-1.5"
                                  title="Edit Details & Category"
                                >
                                  <RiPencilLine size={14} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleOpenPhotoModal(judgeItem)}
                                  className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg border border-white/10 transition-all"
                                  title="Change Photo"
                                >
                                  <RiUploadCloud2Line size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteJudge(judgeItem._id)}
                                  className="p-1.5 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg border border-white/10 transition-all"
                                  title="Delete"
                                >
                                  <RiDeleteBin6Line size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-12 text-center text-slate-400 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                          <RiShieldUserLine size={24} />
                        </div>
                        <h4 className="font-bold text-white">No Judges Found</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">No judge profiles have been registered yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. USER DIRECTORY TAB */}
                {activeTab === 'users' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-display font-bold text-white text-xl">User Directory</h3>
                        <p className="text-slate-400 text-xs mt-1">Manage system accounts and access credentials.</p>
                      </div>
                      <select
                        className="input-field max-w-[150px]"
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                      >
                        <option value="">All Roles</option>
                        <option value="candidate">Candidate</option>
                        <option value="judge">Judge</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="max-h-[65vh] lg:max-h-[calc(100vh-22rem)] overflow-auto overscroll-contain">
                      <table className="w-full min-w-[860px] text-xs text-left text-slate-300">
                        <thead className="sticky top-0 z-10 bg-navy-900 text-[10px] uppercase font-bold text-slate-400 shadow-[0_1px_0_rgba(255,255,255,0.06)]">
                          <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Registration No.</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Registered Date</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => (
                            <tr key={u._id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="p-4 font-bold text-white">{u.firstName} {u.lastName}</td>
                              <td className="p-4 font-mono text-accent-300">{u.role === 'candidate' ? (u.registrationNumber || 'Pending') : '—'}</td>
                              <td className="p-4 font-mono">{u.email}</td>
                              <td className="p-4 uppercase text-[10px] tracking-wider font-semibold font-mono text-accent-400">{u.role}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                  {u.isActive ? 'Active' : 'Suspended'}
                                </span>
                              </td>
                              <td className="p-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="p-4 text-right space-x-2">
                                <button onClick={() => handleToggleUser(u._id)} className="text-slate-400 hover:text-white">
                                  {u.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button onClick={() => handleDeleteUser(u._id)} className="text-red-400 hover:text-red-300">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. CATEGORIES TAB */}
                {activeTab === 'categories' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-display font-bold text-white text-xl">Award Categories</h3>
                        <p className="text-slate-400 text-xs mt-1">Manage award categories available for nominations.</p>
                      </div>
                      <button onClick={handleSeedCategories} className="btn-primary text-xs">
                        Seed Default Categories
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                        <h4 className="font-display font-bold text-white text-base">Existing Categories</h4>
                        <div className="space-y-3 max-h-[420px] overflow-y-auto">
                          {categories.map(c => (
                            <div key={c._id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                              <div className="flex justify-between items-start gap-3">
                                <div>
                                  <h5 className="font-semibold text-white text-sm">{c.name}</h5>
                                  <p className="text-slate-400 text-[11px] mt-1">{c.description}</p>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => handleDeleteCategory(c._id)} className="text-red-400 text-xs">Delete</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                  </div>
                )}

                {/* EVALUATION CRITERIA TAB */}
                {activeTab === 'criteria' && (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-display font-bold text-white text-xl">Evaluation Criteria</h3>
                        <p className="text-slate-400 text-xs mt-1">Manage criteria sets and weight distributions for evaluation scorecards.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          className="bg-navy-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white"
                          value={criteriaStageFilter}
                          onChange={(e) => setCriteriaStageFilter(e.target.value)}
                        >
                          <option value="initial">Screening Stage (Initial)</option>
                          <option value="f2f">Face-to-Face Stage (Viva)</option>
                        </select>
                        <button onClick={handleSeedCriteria} className="btn-primary text-xs">
                          Seed Default Criteria
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                        <h4 className="font-display font-bold text-white text-base">
                          {editingCriteriaId ? 'Edit Evaluation Criterion' : 'Create Evaluation Criterion'}
                        </h4>
                        <form onSubmit={handleSubmitCriteria} className="space-y-3">
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Name</label>
                            <input
                              className="input-field"
                              placeholder="Criterion name"
                              value={criteriaForm.name}
                              onChange={(e) => setCriteriaForm({ ...criteriaForm, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Description</label>
                            <textarea
                              className="input-field h-24 resize-none"
                              placeholder="Description / judging focus"
                              value={criteriaForm.description}
                              onChange={(e) => setCriteriaForm({ ...criteriaForm, description: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Weight (%)</label>
                              <input
                                type="number"
                                className="input-field"
                                placeholder="Weight"
                                value={criteriaForm.weight}
                                onChange={(e) => setCriteriaForm({ ...criteriaForm, weight: e.target.value, maxScore: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Max Score</label>
                              <input
                                type="number"
                                className="input-field"
                                placeholder="Max Score (equal to weight)"
                                value={criteriaForm.maxScore}
                                disabled
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Category Type</label>
                              <select
                                className="input-field"
                                value={criteriaForm.criteriaType}
                                onChange={(e) => setCriteriaForm({ ...criteriaForm, criteriaType: e.target.value })}
                              >
                                <option value="organizational" className="bg-navy-950">🏢 Organizational Award</option>
                                <option value="individual" className="bg-navy-950">👤 Individual Award</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Sort Order</label>
                              <input
                                type="number"
                                className="input-field"
                                placeholder="Sort Order"
                                value={criteriaForm.order}
                                onChange={(e) => setCriteriaForm({ ...criteriaForm, order: e.target.value })}
                              />
                            </div>
                          </div>
                          <label className="flex items-center gap-2 text-sm text-slate-300 select-none">
                            <input
                              type="checkbox"
                              checked={criteriaForm.isActive}
                              onChange={(e) => setCriteriaForm({ ...criteriaForm, isActive: e.target.checked })}
                            />
                            Active & enabled for evaluation
                          </label>
                          <div className="flex gap-3 pt-2">
                            <button type="submit" className="btn-primary text-xs">
                              {editingCriteriaId ? 'Save Changes' : 'Create Criterion'}
                            </button>
                            {editingCriteriaId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCriteriaId(null);
                                  setCriteriaForm({ name: '', description: '', weight: 10, maxScore: 10, criteriaType: 'organizational', stage: criteriaStageFilter, order: 0, isActive: true });
                                }}
                                className="btn-ghost text-xs"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </form>
                      </div>

                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                        <h4 className="font-display font-bold text-white text-base">Criteria Definitions</h4>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                          {criteria.map((c) => (
                            <div key={c._id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-2">
                              <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h5 className="font-semibold text-white text-sm truncate">{c.name}</h5>
                                    <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                      c.criteriaType === 'individual'
                                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                                        : 'bg-accent-500/10 text-accent-300 border-accent-500/20'
                                    }`}>
                                      {c.criteriaType === 'individual' ? '👤 Individual' : '🏢 Org'}
                                    </span>
                                  </div>
                                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{c.description}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <button onClick={() => handleEditCriteria(c)} className="text-accent-400 text-xs hover:text-accent-300 font-medium">Edit</button>
                                  <button onClick={() => handleDeleteCriteria(c._id)} className="text-red-400 text-xs hover:text-red-300 font-medium">Delete</button>
                                </div>
                              </div>
                              <div className="flex gap-4 pt-1 border-t border-white/5 text-[10px] text-slate-500 font-mono">
                                <span>Max score: <strong className="text-white">{c.maxScore}</strong></span>
                                <span>Weight: <strong className="text-white">{c.weight}%</strong></span>
                                <span>Order: <strong className="text-white">{c.order}</strong></span>
                                <span className={c.isActive ? 'text-emerald-400' : 'text-red-400'}>{c.isActive ? 'Active' : 'Inactive'}</span>
                              </div>
                            </div>
                          ))}
                          {criteria.length === 0 && (
                            <p className="text-slate-500 text-xs text-center py-8">No criteria definitions found.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. BROADCAST TAB */}
                {activeTab === 'broadcast' && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-accent-300">Communication Center</p>
                        <h3 className="mt-1 font-display text-2xl font-black text-white">Send Broadcast Alert</h3>
                        <p className="mt-1 max-w-2xl text-sm text-slate-400">Dispatch a targeted system notification to candidates, judges, or every registered user.</p>
                      </div>
                      <div className="rounded-xl border border-accent-500/20 bg-accent-500/10 px-4 py-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-accent-300">Estimated Reach</div>
                        <div className="mt-1 font-display text-2xl font-black text-white">{broadcastAudienceCount}</div>
                      </div>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                      <form onSubmit={handleBroadcast(onBroadcastSubmit)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">User Audience</label>
                          <div className="grid gap-4 sm:grid-cols-3">
                            {[
                              { value: 'all', label: 'All Users', count: users.length, helper: 'Full platform notice' },
                              { value: 'candidate', label: 'Candidates', count: candidatesList.length, helper: 'Applicants only' },
                              { value: 'judge', label: 'Judges', count: judgesList.length, helper: 'Evaluation panel' },
                            ].map((audience) => (
                              <label
                                key={audience.value}
                                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                                  broadcastRole === audience.value
                                    ? 'border-accent-500 bg-accent-500/10 shadow-glow'
                                    : 'border-white/10 bg-navy-950/30 hover:border-white/20 hover:bg-white/5'
                                }`}
                              >
                                <input type="radio" value={audience.value} className="sr-only" {...regBroadcast('role')} />
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-sm font-bold text-white">{audience.label}</span>
                                  <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-slate-300">{audience.count}</span>
                                </div>
                                <p className="mt-2 text-xs text-slate-500">{audience.helper}</p>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="mt-5">
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Application Status List</label>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {BROADCAST_STATUS_AUDIENCES.map((audience) => (
                              <label
                                key={audience.value}
                                className={`cursor-pointer rounded-xl border p-3 transition-all ${
                                  broadcastRole === audience.value
                                    ? 'border-gold-500 bg-gold-500/10'
                                    : 'border-white/10 bg-navy-950/30 hover:border-white/20 hover:bg-white/5'
                                }`}
                              >
                                <input type="radio" value={audience.value} className="sr-only" {...regBroadcast('role')} />
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-xs font-bold text-white">{audience.label}</span>
                                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                                    {getStatusAudienceCount(audience.status)}
                                  </span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="mt-6 space-y-4">
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Alert Title</label>
                            <input className="input-field" placeholder="e.g. Submissions Deadline Extended" {...regBroadcast('title', { required: true })} />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Alert Message</label>
                            <textarea className="input-field min-h-36 resize-none" placeholder="Enter notification message..." {...regBroadcast('message', { required: true })} />
                            <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                              <span>Keep the message direct and action-oriented.</span>
                              <span>{broadcastMessage.length} chars</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-slate-500">This sends an in-app notification immediately.</p>
                          <button type="submit" disabled={broadcastSubmitting} className="btn-primary min-w-[180px] disabled:cursor-not-allowed disabled:opacity-60">
                            {broadcastSubmitting ? (
                              <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Sending...</>
                            ) : (
                              <><RiMailSendLine /> Send Broadcast</>
                            )}
                          </button>
                        </div>
                      </form>

                      <div className="space-y-5">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white">Notification Preview</h4>
                            <span className="rounded-full border border-gold-500/20 bg-gold-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-400">Live</span>
                          </div>
                          <div className="mt-4 rounded-2xl border border-white/10 bg-navy-950/60 p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 text-accent-300">
                                <RiMailSendLine size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-white">{broadcastTitle || 'Alert title preview'}</p>
                                <p className="mt-1 text-xs leading-5 text-slate-400">{broadcastMessage || 'Your broadcast message will appear here as users receive the notification.'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                          <h4 className="text-sm font-bold text-white">Delivery Summary</h4>
                          <div className="mt-4 space-y-3 text-sm">
                            <div className="flex justify-between rounded-xl bg-navy-950/40 px-3 py-2">
                              <span className="text-slate-400">Audience</span>
                              <span className="font-semibold text-white">{broadcastAudienceLabel}</span>
                            </div>
                            <div className="flex justify-between rounded-xl bg-navy-950/40 px-3 py-2">
                              <span className="text-slate-400">Recipients</span>
                              <span className="font-semibold text-white">{broadcastAudienceCount}</span>
                            </div>
                            <div className="flex justify-between rounded-xl bg-navy-950/40 px-3 py-2">
                              <span className="text-slate-400">Channel</span>
                              <span className="font-semibold text-white">In-app alert</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. REPORTS TAB */}
                {activeTab === 'reports' && stats && (
                  <div className="space-y-8">
                    <div className="flex flex-col gap-3 border-b border-white/10 pb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-display font-bold text-white text-xl">Reports & Exports</h3>
                          <p className="text-slate-400 text-xs mt-1">Aggregated statistics, export data, and publish finalists/winners.</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => handleExportReport('csv')} className="btn-primary text-xs">Export Excel</button>
                          <button onClick={() => handleExportReport('pdf')} className="btn-gold text-xs">Export PDF</button>
                          <button onClick={() => window.print()} className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/10">Print</button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={handlePublishFinalists} disabled={reportActionBusy} className="btn-primary text-xs disabled:opacity-50">Publish Finalists</button>
                        <button onClick={handlePublishWinners} disabled={reportActionBusy} className="btn-gold text-xs disabled:opacity-50">Publish Winners</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Status Distribution Recharts Pie */}
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/5 h-80 flex flex-col items-center">
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 self-start">Workflow Status Share</h4>
                        <ResponsiveContainer width="100%" height="80%">
                          <PieChart>
                            <Pie
                              data={stats.statusBreakdown}
                              dataKey="count"
                              nameKey="status"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ status, count }) => `${status}: ${count}`}
                            >
                              {stats.statusBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Top Scored leader board */}
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Submission Leaderboard</h4>
                        <div className="space-y-3">
                          {applications.slice(0, 5).sort((a,b)=>b.averageScore - a.averageScore).map((app, idx) => (
                            <div key={app._id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0 text-slate-300">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked={selectedReportIds.includes(app._id)} onChange={() => toggleReportSelection(app._id)} className="rounded border-white/10 bg-transparent" />
                                <span>
                                  <span className="font-bold text-white mr-1">#{idx+1}</span>
                                  {app.projectTitle}
                                </span>
                              </div>
                              <span className="font-bold text-accent-400">{app.averageScore?.toFixed(1) || '-'}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 text-[11px] text-slate-400">Selected: {selectedReportIds.length}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. CHANGE PASSWORD */}
                {activeTab === 'password' && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-accent-300">Account Security</p>
                        <h3 className="mt-1 font-display text-2xl font-black text-white">Change Password</h3>
                        <p className="mt-1 max-w-2xl text-sm text-slate-400">Update your administrator credentials and keep portal access protected.</p>
                      </div>
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Signed In As</div>
                        <div className="mt-1 max-w-[220px] truncate text-sm font-semibold text-white">{user?.email || user?.fullName || 'Administrator'}</div>
                      </div>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                      <form onSubmit={handlePassword(onChangePasswordSubmit)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
                        {(changeError || changeSuccess) && (
                          <div className={`mb-5 rounded-xl border p-4 text-sm ${
                            changeError
                              ? 'border-red-500/30 bg-red-500/10 text-red-400'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {changeError || changeSuccess}
                          </div>
                        )}

                        <div className="space-y-4">
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Current Password</label>
                            <input
                              id="admin-oldpassword"
                              type="password"
                              className="input-field"
                              placeholder="Enter current password"
                              {...regPassword('oldPassword', { required: 'Current password is required' })}
                            />
                            {passErrors.oldPassword && <p className="mt-1 text-xs text-red-400">{passErrors.oldPassword.message}</p>}
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">New Password</label>
                            <input
                              id="admin-newpassword"
                              type="password"
                              className="input-field"
                              placeholder="At least 8 characters"
                              {...regPassword('newPassword', {
                                required: 'New password is required',
                                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                              })}
                            />
                            {passErrors.newPassword && <p className="mt-1 text-xs text-red-400">{passErrors.newPassword.message}</p>}
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Confirm New Password</label>
                            <input
                              id="admin-confirm"
                              type="password"
                              className="input-field"
                              placeholder="Re-enter new password"
                              {...regPassword('confirmPassword', {
                                validate: (v) => v === newPassword || 'Passwords do not match',
                              })}
                            />
                            {passErrors.confirmPassword && <p className="mt-1 text-xs text-red-400">{passErrors.confirmPassword.message}</p>}
                          </div>
                        </div>

                        <div className="mt-6 border-t border-white/10 pt-5">
                          <button
                            id="admin-change-submit"
                            type="submit"
                            disabled={passSubmitting}
                            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {passSubmitting ? (
                              <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Updating...</>
                            ) : (
                              <>Update Password <RiCheckDoubleLine /></>
                            )}
                          </button>
                        </div>
                      </form>

                      <div className="space-y-5">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/15 text-accent-300">
                              <RiLockPasswordLine size={20} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">Password Strength</h4>
                              <p className="text-xs text-slate-500">{passwordStrength} of {passwordRules.length} checks passed</p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-4 gap-2">
                            {passwordRules.map((rule, index) => (
                              <div key={rule.label} className={`h-2 rounded-full ${index < passwordStrength ? 'bg-emerald-400' : 'bg-white/10'}`} />
                            ))}
                          </div>

                          <div className="mt-4 space-y-3">
                            {passwordRules.map((rule) => (
                              <div key={rule.label} className="flex items-center gap-2 text-sm">
                                <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                                  rule.passed
                                    ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                                    : 'border-white/10 bg-white/5 text-slate-500'
                                }`}>
                                  {rule.passed ? '✓' : ''}
                                </span>
                                <span className={rule.passed ? 'text-slate-200' : 'text-slate-500'}>{rule.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                          <h4 className="text-sm font-bold text-white">Security Notes</h4>
                          <div className="mt-4 space-y-3 text-sm text-slate-400">
                            <div className="rounded-xl bg-navy-950/40 px-3 py-3">Use a password that is unique to this admin portal.</div>
                            <div className="rounded-xl bg-navy-950/40 px-3 py-3">Avoid sharing credentials with other administrators.</div>
                            <div className="rounded-xl bg-navy-950/40 px-3 py-3">After updating, use the new password on your next sign-in.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* JUDGES PANEL ASSIGNMENT MODAL */}
      {assignModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6 relative !hover:transform-none">
            <h3 className="font-display font-bold text-white text-lg mb-2">Assign Evaluators</h3>
            <p className="text-slate-400 text-xs mb-4">Select judges to assign to <strong>{selectedApp.projectTitle}</strong>.</p>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
              {judgesList.map(judge => {
                const isSelected = selectedJudges.includes(judge._id);
                return (
                  <div
                    key={judge._id}
                    onClick={() => toggleJudgeSelection(judge._id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected ? 'bg-accent-500/10 border-accent-500' : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isSelected ? 'border-accent-500 bg-accent-500 text-white' : 'border-slate-500'
                    }`}>
                      {isSelected && <RiCheckLine size={12} />}
                    </div>
                    <div>
                      <div className="text-white text-xs font-semibold">{judge.firstName} {judge.lastName}</div>
                      <div className="text-slate-400 text-[10px]">{judge.organization}</div>
                    </div>
                  </div>
                );
              })}
              {judgesList.length === 0 && (
                <p className="text-slate-500 text-xs text-center py-4">No judges registered in directory.</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setAssignModalOpen(false)} className="btn-ghost text-xs !py-2 !px-4">Cancel</button>
              <button onClick={handleAssignSubmit} className="btn-primary text-xs !py-2 !px-4">Save Panel</button>
            </div>
          </div>
        </div>
      )}
      {/* DETAILED JUDGE EVALUATIONS MODAL */}
      {evaluationsModalOpen && evaluationsApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative max-w-4xl w-full p-8 bg-surface-200 rounded-[32px] shadow-2xl border border-white/10 max-h-[85vh] overflow-y-auto z-10">
            <button
              onClick={() => {
                setEvaluationsModalOpen(false);
                setSelectedJudgeEval(null);
              }}
              className="absolute right-6 top-6 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>

            {selectedJudgeEval ? (
              // Sub-view: Individual Judge Scorecard
              <div className="space-y-6 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => setSelectedJudgeEval(null)}
                  className="flex items-center gap-2 text-xs font-bold text-accent-400 hover:text-accent-300 hover:underline mb-2"
                >
                  ← Back to Evaluation Summary
                </button>

                <div className="border-b border-white/10 pb-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-accent-400">Individual Evaluator Sheet</span>
                  <h3 className="font-display font-extrabold text-white text-xl mt-1">{selectedJudgeEval.judge?.firstName} {selectedJudgeEval.judge?.lastName}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">{selectedJudgeEval.judge?.email} | {selectedJudgeEval.judge?.organization || 'Independent Evaluator'}</p>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-6">
                  {/* Score & Status */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Submitted At</span>
                      <strong className="text-white text-xs font-mono">{selectedJudgeEval.submittedAt ? new Date(selectedJudgeEval.submittedAt).toLocaleString() : 'Draft Mode'}</strong>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3.5 py-1.5 rounded-xl bg-accent-500/10 border border-accent-500/25 font-mono text-lg font-black text-accent-400">
                        Score: {selectedJudgeEval.totalScore || 0}/100
                      </span>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Strengths Identified</span>
                      <p className="text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5 whitespace-pre-line">
                        {selectedJudgeEval.strengths || 'None specified'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Weaknesses / Areas of Improvement</span>
                      <p className="text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5 whitespace-pre-line">
                        {selectedJudgeEval.weaknesses || 'None specified'}
                      </p>
                    </div>
                  </div>

                  {/* Overall Comments */}
                  <div className="text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overall Comments</span>
                    <p className="text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5 whitespace-pre-line">
                      {selectedJudgeEval.overallComments || 'No overall comments provided.'}
                    </p>
                  </div>

                  {/* Criteria Scores breakdown */}
                  <div className="space-y-2.5 pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Criteria Breakdown</span>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {selectedJudgeEval.scores?.map((s) => {
                        const crit = s.criteria;
                        return (
                          <div key={s._id || (crit && crit._id)} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-xs">
                            <div className="min-w-0 pr-2">
                              <p className="text-white font-semibold truncate">{crit?.name || 'Criterion score'}</p>
                              {s.comment && <p className="text-[10px] text-slate-400 mt-1 italic leading-relaxed truncate" title={s.comment}>"{s.comment}"</p>}
                            </div>
                            <span className="font-mono font-bold text-accent-300 shrink-0 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                              {s.score} / {crit?.weight || 10}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (() => {
              const completedReviewsCount = evaluationsList.filter(e => e.isSubmitted && (e.stage || 'initial') === trackerStage).length;
              const totalAssignedJudges = evaluationsApp.assignedJudges?.length || 0;
              const activeEvals = evaluationsList.filter(e => e.isSubmitted && (e.stage || 'initial') === trackerStage);
              const calculatedAverage = activeEvals.length > 0 
                ? activeEvals.reduce((s, e) => s + (e.totalScore || 0), 0) / activeEvals.length 
                : null;

              return (
                // Sub-view: Evaluation Summary & Judge List
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent-400">Scorecard Tracker & Summary</span>
                    <h3 className="font-display font-extrabold text-white text-2xl mt-1">{evaluationsApp.projectTitle}</h3>
                    <p className="text-slate-400 text-xs mt-1">Submitted by: <strong className="text-white">{evaluationsApp.candidate?.firstName} {evaluationsApp.candidate?.lastName}</strong> ({evaluationsApp.candidate?.organization || 'Individual'})</p>
                  </div>

                  {evalsLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="w-10 h-10 border-3 border-accent-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-400">Loading scorecard summary...</span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Evaluation Summary Card */}
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                        <div className="p-3 rounded-xl bg-white/[0.02]">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Evaluation Stage</span>
                          <strong className="block text-white text-sm mt-1 capitalize">{trackerStage === 'f2f' ? 'Face-to-Face' : 'Initial'}</strong>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02]">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Average Score</span>
                          <strong className="block text-accent-400 text-sm font-mono mt-1">
                            {calculatedAverage !== null ? calculatedAverage.toFixed(2) : 'Pending'}
                          </strong>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02]">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Completed Reviews</span>
                          <strong className="block text-emerald-400 text-sm font-mono mt-1">
                            {completedReviewsCount} / {totalAssignedJudges}
                          </strong>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02]">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Assigned Judges</span>
                          <strong className="block text-white text-sm font-mono mt-1">
                            {totalAssignedJudges}
                          </strong>
                        </div>
                      </div>

                      {/* Assigned Judges List */}
                      <div className="space-y-3">
                        <h4 className="text-white font-bold text-sm tracking-wide">Evaluator Status & Scorecards</h4>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                          {evaluationsApp.assignedJudges?.map((judge, idx) => {
                            // Find corresponding submitted evaluation in evaluationsList matching the current stage
                            const judgeEval = evaluationsList.find(e => 
                              e.judge?._id?.toString() === judge._id.toString() &&
                              (e.stage || 'initial') === trackerStage
                            );
                            const isSubmitted = judgeEval ? judgeEval.isSubmitted : false;

                            return (
                              <div
                                key={judge._id}
                                className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex justify-between items-center gap-4 flex-wrap"
                              >
                                <div>
                                  <h5 className="text-white text-xs font-bold">Judge {idx + 1}: {judge.firstName} {judge.lastName}</h5>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{judge.organization || 'Independent'} — {judge.designation || 'Specialist'}</p>
                                </div>

                                <div className="flex items-center gap-5">
                                  <div className="text-right">
                                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Evaluation State</div>
                                    <span className={`text-[10px] font-bold ${
                                      isSubmitted ? 'text-emerald-400' : judgeEval ? 'text-amber-400' : 'text-slate-500'
                                    }`}>
                                      {isSubmitted ? 'Completed' : judgeEval ? 'Draft Mode' : 'Not Started'}
                                    </span>
                                  </div>

                                  <div className="text-right font-mono min-w-[70px]">
                                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Total Score</div>
                                    <span className="text-xs text-white font-bold">
                                      {isSubmitted && judgeEval ? `${judgeEval.totalScore}/100` : '—'}
                                    </span>
                                  </div>

                                  <div>
                                    {isSubmitted && judgeEval ? (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedJudgeEval(judgeEval)}
                                        className="btn-primary text-[10px] !py-1 !px-3 font-semibold"
                                      >
                                        View Individual Scorecard
                                      </button>
                                    ) : (
                                      <span className="text-[10px] text-slate-500 italic bg-white/5 px-2 py-1 rounded">
                                        Not Available
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        {(!evaluationsApp.assignedJudges || evaluationsApp.assignedJudges.length === 0) && (
                          <div className="p-8 text-center bg-white/5 border border-dashed border-white/10 rounded-xl">
                            <p className="text-xs text-slate-500">No judges assigned to this application panel yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )/* end of evaluations modal */}
      {/* ─── ADD / EDIT JUDGE MODAL ─── */}
      {judgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative max-w-2xl w-full p-8 bg-surface-200 rounded-[32px] shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto z-10 text-slate-200">
            <button
              onClick={() => setJudgeModalOpen(false)}
              className="absolute right-6 top-6 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="border-b border-white/10 pb-4 mb-6">
              <h3 className="font-display font-extrabold text-white text-2xl">
                {editingJudge ? 'Edit Judge Profile' : 'Add New Judge'}
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                {editingJudge ? 'Modify the selected judge details.' : 'Register a new expert panelist for the awards registry.'}
              </p>
            </div>

            <form onSubmit={handleSaveJudge} className="space-y-6">
              {/* Photo Preview & Selection */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-2 border-white/15 flex items-center justify-center shrink-0">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-500 font-bold text-2xl">
                      {judgeForm.fullName ? judgeForm.fullName.charAt(0).toUpperCase() : 'AI'}
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-center sm:text-left w-full">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Profile Image</label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('Image file size must be less than 5MB.');
                          return;
                        }
                        setPhotoFile(file);
                        setPhotoPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP. Max 5MB. Auto-optimized on save.</p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-accent-400 uppercase tracking-wider">Basic Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-400">Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Mr. Indika De Zoysa"
                      value={judgeForm.fullName}
                      onChange={(e) => setJudgeForm({ ...judgeForm, fullName: e.target.value })}
                    />
                    {judgeFormErrors.fullName && <p className="text-red-400 text-xs mt-1">{judgeFormErrors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-400">Email Address</label>
                    <input
                      type="email"
                      className="input-field font-mono"
                      placeholder="e.g. indika.dezoysa@huawei.com"
                      value={judgeForm.email}
                      onChange={(e) => setJudgeForm({ ...judgeForm, email: e.target.value })}
                    />
                    {judgeFormErrors.email && <p className="text-red-400 text-xs mt-1">{judgeFormErrors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Designation */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-400">Designation</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. VP – Public & Government Affairs"
                      value={judgeForm.designation}
                      onChange={(e) => setJudgeForm({ ...judgeForm, designation: e.target.value })}
                    />
                    {judgeFormErrors.designation && <p className="text-red-400 text-xs mt-1">{judgeFormErrors.designation}</p>}
                  </div>

                  {/* Organization */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-400">Organization</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Huawei Technologies"
                      value={judgeForm.organization}
                      onChange={(e) => setJudgeForm({ ...judgeForm, organization: e.target.value })}
                    />
                    {judgeFormErrors.organization && <p className="text-red-400 text-xs mt-1">{judgeFormErrors.organization}</p>}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-400">Country</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Sri Lanka"
                      value={judgeForm.country}
                      onChange={(e) => setJudgeForm({ ...judgeForm, country: e.target.value })}
                    />
                    {judgeFormErrors.country && <p className="text-red-400 text-xs mt-1">{judgeFormErrors.country}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* LinkedIn */}
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-slate-400">LinkedIn Profile URL</label>
                    <input
                      type="url"
                      className="input-field font-mono"
                      placeholder="e.g. https://www.linkedin.com/in/..."
                      value={judgeForm.linkedin}
                      onChange={(e) => setJudgeForm({ ...judgeForm, linkedin: e.target.value })}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-400">Active Registry Status</label>
                    <select
                      className="input-field bg-navy-950 text-slate-300"
                      value={judgeForm.status}
                      onChange={(e) => setJudgeForm({ ...judgeForm, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <input
                    type="checkbox"
                    id="judge-grandjury-check"
                    className="rounded border-white/10 bg-white/5 text-accent-500 focus:ring-accent-500 w-4 h-4 cursor-pointer"
                    checked={judgeForm.isGrandJury}
                    onChange={(e) => setJudgeForm({ ...judgeForm, isGrandJury: e.target.checked })}
                  />
                  <label htmlFor="judge-grandjury-check" className="text-xs text-slate-300 hover:text-white cursor-pointer select-none font-semibold">
                    Mark as member of the Grand Jury Panel
                  </label>
                </div>
              </div>

              {/* Award Categories Selection */}
              <div className="space-y-4 pt-2 border-t border-white/5">
                <h4 className="text-xs font-bold text-accent-400 uppercase tracking-wider">Award Categories Alignment</h4>
                
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Main Award Category</label>
                  <select
                    className="input-field bg-navy-950 text-slate-300"
                    value={judgeForm.mainAwardCategory}
                    onChange={(e) => setJudgeForm({ ...judgeForm, mainAwardCategory: e.target.value, awardSubCategories: [] })}
                  >
                    <option value="">Select Main Category</option>
                    {Object.keys(JUDGE_MAIN_CATEGORIES_MAP).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {judgeFormErrors.mainAwardCategory && <p className="text-red-400 text-xs mt-1">{judgeFormErrors.mainAwardCategory}</p>}
                </div>

                {judgeForm.mainAwardCategory && (
                  <div className="space-y-2 animate-fadeIn">
                    <label className="block text-xs font-semibold text-slate-400">Award Subcategories (Primary Category)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-white/5 p-4 rounded-xl border border-white/5 max-h-[180px] overflow-y-auto">
                      {JUDGE_MAIN_CATEGORIES_MAP[judgeForm.mainAwardCategory]?.map((sub) => {
                        const checked = judgeForm.awardSubCategories.includes(sub);
                        return (
                          <label key={sub} className="flex items-start gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="mt-0.5 rounded border-white/10 bg-white/5 text-accent-500 focus:ring-accent-500 w-3.5 h-3.5"
                              checked={checked}
                              onChange={() => {
                                if (checked) {
                                  setJudgeForm(prev => ({
                                    ...prev,
                                    awardSubCategories: prev.awardSubCategories.filter(s => s !== sub)
                                  }));
                                } else {
                                  setJudgeForm(prev => ({
                                    ...prev,
                                    awardSubCategories: [...prev.awardSubCategories, sub]
                                  }));
                                }
                              }}
                            />
                            <span>{getSubCategoryDisplayName(sub)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {judgeForm.mainAwardCategory && (
                  <div className="space-y-2 animate-fadeIn pt-2 border-t border-white/5">
                    <label className="block text-xs font-semibold text-slate-400">Additional Award Subcategories (Optional)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-white/5 p-4 rounded-xl border border-white/5 max-h-[220px] overflow-y-auto">
                      {Object.entries(JUDGE_MAIN_CATEGORIES_MAP)
                        .filter(([mainCat]) => mainCat !== judgeForm.mainAwardCategory)
                        .map(([mainCat, subs]) => (
                          <div key={mainCat} className="col-span-1 md:col-span-2 space-y-1.5 mb-2">
                            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{mainCat}</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {subs.map((sub) => {
                                const checked = judgeForm.awardSubCategories.includes(sub);
                                return (
                                  <label key={sub} className="flex items-start gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      className="mt-0.5 rounded border-white/10 bg-white/5 text-accent-500 focus:ring-accent-500 w-3.5 h-3.5"
                                      checked={checked}
                                      onChange={() => {
                                        if (checked) {
                                          setJudgeForm(prev => ({
                                            ...prev,
                                            awardSubCategories: prev.awardSubCategories.filter(s => s !== sub)
                                          }));
                                        } else {
                                          setJudgeForm(prev => ({
                                            ...prev,
                                            awardSubCategories: [...prev.awardSubCategories, sub]
                                          }));
                                        }
                                      }}
                                    />
                                    <span>{getSubCategoryDisplayName(sub)}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                    {judgeFormErrors.awardSubCategories && <p className="text-red-400 text-xs mt-1">{judgeFormErrors.awardSubCategories}</p>}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setJudgeModalOpen(false)}
                  className="btn-ghost text-xs !py-2 !px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={judgeSaving}
                  className="btn-primary text-xs !py-2 !px-5 flex items-center gap-2"
                >
                  {judgeSaving ? 'Saving...' : (editingJudge ? 'Update Profile' : 'Add Panelist')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DEDICATED CHANGE PHOTO MODAL ─── */}
      {photoModalOpen && photoModalJudge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative max-w-md w-full p-8 bg-surface-200 rounded-[32px] shadow-2xl border border-white/10 z-10 text-slate-200">
            <button
              onClick={() => setPhotoModalOpen(false)}
              className="absolute right-6 top-6 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="border-b border-white/10 pb-4 mb-6">
              <h3 className="font-display font-extrabold text-white text-xl">Change Profile Photo</h3>
              <p className="text-slate-400 text-xs mt-1">Upload a new profile photo for {photoModalJudge.fullName}.</p>
            </div>

            <form onSubmit={handleUploadPhotoOnly} className="space-y-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-800 border-2 border-white/15 shadow-glow">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-3xl">
                      {photoModalJudge.fullName.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="w-full space-y-2">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer mx-auto block"
                    required
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('Image file size must be less than 5MB.');
                          return;
                        }
                        setPhotoFile(file);
                        setPhotoPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP. Max 5MB. Compress on upload.</p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setPhotoModalOpen(false)}
                  className="btn-ghost text-xs !py-2 !px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={photoUploading || !photoFile}
                  className="btn-primary text-xs !py-2 !px-5"
                >
                  {photoUploading ? 'Uploading...' : 'Save New Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── VIEW JUDGE DETAILS MODAL ─── */}
      {judgeViewModalOpen && viewingJudge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative max-w-xl w-full p-8 bg-surface-200 rounded-[32px] shadow-2xl border border-white/10 z-10 text-slate-200 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setJudgeViewModalOpen(false)}
              className="absolute right-6 top-6 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-white/10 mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-2 border-white/15 shadow-glow">
                <JudgeAvatar judge={viewingJudge} variant="card" className="w-full h-full hover:scale-100 border-0 shadow-none text-2xl" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-white text-xl flex items-center justify-center gap-2">
                  {viewingJudge.fullName}
                </h3>
                <p className="text-accent-400 text-xs font-semibold mt-1">{viewingJudge.designation}</p>
                <p className="text-slate-400 text-xs mt-0.5">{viewingJudge.organization} — {viewingJudge.country}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</span>
                  <div className="text-white font-mono mt-0.5 select-all">{viewingJudge.email}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">LinkedIn Profile</span>
                  <div className="mt-0.5 truncate">
                    {viewingJudge.linkedin ? (
                      <a href={viewingJudge.linkedin} target="_blank" rel="noreferrer" className="text-accent-400 hover:underline">
                        {viewingJudge.linkedin}
                      </a>
                    ) : (
                      <span className="text-slate-500">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1 p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Award Alignment</span>
                <div className="text-white font-bold text-sm mt-1">{viewingJudge.mainAwardCategory || viewingJudge.mainCategory}</div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(viewingJudge.awardSubCategories || viewingJudge.subCategories)?.map((sub, idx) => (
                    <span key={idx} className="bg-white/5 border border-white/10 text-[9px] px-2 py-0.5 rounded-full text-slate-400">
                      {getSubCategoryDisplayName(sub)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Experience</span>
                  <strong className="text-white font-mono mt-0.5 block">{viewingJudge.experience || 0} Yrs</strong>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Jury Type</span>
                  <strong className="text-gold-400 font-mono mt-0.5 block">{viewingJudge.isGrandJury ? 'Grand Jury' : 'Panelist'}</strong>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Status</span>
                  <strong className={`mt-0.5 block font-mono ${viewingJudge.status === 'Active' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {viewingJudge.status}
                  </strong>
                </div>
              </div>

              {viewingJudge.description && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Biography / Description</span>
                  <p className="text-slate-300 leading-relaxed text-justify max-h-[150px] overflow-y-auto pr-1 bg-white/5 p-3 rounded-lg border border-white/5">
                    {viewingJudge.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-5 border-t border-white/10 mt-6">
              <button onClick={() => setJudgeViewModalOpen(false)} className="btn-ghost text-xs !py-2 !px-4">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Check indicator icon proxy
const RiCheckLine = ({ size }) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height={size} width={size} xmlns="http://www.w3.org/2000/svg">
    <path fill="none" d="M0 0h24v24H0z"></path>
    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path>
  </svg>
);

export default AdminDashboard;






// import { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { motion } from 'framer-motion';
// import { toast } from 'react-hot-toast';
// import {
//   ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
//   LineChart, Line, PieChart, Pie, Cell
// } from 'recharts';
// import {
//   RiAwardLine, RiLockPasswordLine, RiLogoutBoxLine,
//   RiCheckDoubleLine, RiFileList3Line, RiTeamLine,
//   RiDashboardLine, RiFileChartLine, RiMailSendLine,
//   RiArrowRightLine, RiFolderShield2Line, RiRefreshLine, RiPulseLine, RiStarLine,
//   RiUserLine,
// } from 'react-icons/ri';
// import { useAuth } from '../../context/AuthContext';
// import api, { buildAssetUrl } from '../../services/api';
// import adminService from '../../services/admin.service';
// import applicationService from '../../services/application.service';
// import categoryService from '../../services/category.service';
// import evaluationCriteriaService from '../../services/evaluationCriteria.service';

// const COLORS = ['#0072ff', '#00ff87', '#ffc658', '#ff7300', '#d0ed57', '#a4de6c'];

// const MAIN_CATEGORIES_MAP = {
//   'National AI Trailblazer Awards': [
//     'National AI Excellence Award',
//     'National AI Leadership Excellence Award',
//     'National AI Impact Excellence Award',
//     'National AI Export Excellence Award',
//     'Women in AI Leadership',
//   ],
//   'Industry & Sector Excellence Awards': [
//     'Best AI Solution in Agriculture',
//     'Best AI Solution in Banking, Finance & Insurance',
//     'Best AI Solution in Healthcare & Life Sciences',
//     'Best AI Solution in Export Development',
//     'Best AI Solution in Education',
//     'Best AI Solution in Manufacturing & Industry 5.0',
//   ],
//   'Innovation & Future-Focused Awards': [
//     'Best AI Startup / MSME Innovation',
//     'Best Agentic AI Solution',
//     'Best Sinhala/Tamil AI & Localisation Innovation',
//     'University AI Innovation',
//   ],
// };

// const BROADCAST_STATUS_AUDIENCES = [
//   { value: 'status:submitted', status: 'submitted', label: 'Submitted' },
//   { value: 'status:under_review', status: 'under_review', label: 'Under Review' },
//   { value: 'status:eligible', status: 'eligible', label: 'Eligible' },
//   { value: 'status:shortlisted', status: 'shortlisted', label: 'Shortlisted' },
//   { value: 'status:finalist', status: 'finalist', label: 'Finalist' },
//   { value: 'status:winner', status: 'winner', label: 'Winner' },
// ];

// const ADMIN_STATUS_OPTIONS = [
//   { value: 'eligible', label: 'Eligible' },
//   { value: 'ineligible', label: 'Ineligible' },
//   { value: 'initial_stage', label: 'Initial State' },
//   { value: 'f2f_stage', label: 'Selected to Face-to-Face' },
//   { value: 'finalist', label: 'Finalist' },
//   { value: 'winner', label: 'Winner' },
//   { value: 'runner_up', label: '1st Runner-up' },
// ];

// const getIntegerTicks = (values = []) => {
//   const maxValue = Math.max(1, ...values.map((value) => Math.ceil(Number(value) || 0)));
//   if (maxValue <= 5) return Array.from({ length: maxValue + 1 }, (_, index) => index);

//   const step = Math.ceil(maxValue / 5);
//   const ticks = Array.from({ length: Math.floor(maxValue / step) + 1 }, (_, index) => index * step);
//   return ticks.includes(maxValue) ? ticks : [...ticks, maxValue];
// };

// const AdminDashboard = () => {
//   const { user, logout, updateUserLocal } = useAuth();
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState('overview');
//   const [evaluationsModalOpen, setEvaluationsModalOpen] = useState(false);
//   const [evaluationsList, setEvaluationsList] = useState([]);
//   const [evaluationsApp, setEvaluationsApp] = useState(null);
//   const [evalsLoading, setEvalsLoading] = useState(false);

//   // Evaluation Tracker state
//   const [trackerStage, setTrackerStage] = useState('initial');
//   const [trackerMainCategory, setTrackerMainCategory] = useState('all');
//   const [trackerSubCategory, setTrackerSubCategory] = useState('all');
//   const [trackerSearch, setTrackerSearch] = useState('');
//   const [trackerApps, setTrackerApps] = useState([]);
//   const [trackerStats, setTrackerStats] = useState(null);
//   const [trackerLoading, setTrackerLoading] = useState(false);
//   const [selectedJudgeEval, setSelectedJudgeEval] = useState(null);

//   // Stats & listings
//   const [stats, setStats] = useState(null);
//   const [applications, setApplications] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [admins, setAdmins] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [monitoring, setMonitoring] = useState(null);
//   const [judgeProgress, setJudgeProgress] = useState([]);
//   const [criteria, setCriteria] = useState([]);
//   const [imageUploading, setImageUploading] = useState(false);
//   const [profileForm, setProfileForm] = useState({
//     firstName: '',
//     lastName: '',
//     phone: '',
//     organization: '',
//     designation: '',
//   });
//   const [profileSaving, setProfileSaving] = useState(false);
//   const [editingCriteriaId, setEditingCriteriaId] = useState(null);
//   const [criteriaForm, setCriteriaForm] = useState({
//     name: '',
//     description: '',
//     weight: 10,
//     maxScore: 10,
//     criteriaType: 'organizational',
//     stage: 'initial',
//     order: 0,
//     isActive: true,
//   });
//   const [loading, setLoading] = useState(true);

//   // Search & Filters
//   const [appSearch, setAppSearch] = useState('');
//   const [appStatusFilter, setAppStatusFilter] = useState('');
//   const [userRoleFilter, setUserRoleFilter] = useState('');

//   // Assign Judge Modal
//   const [selectedApp, setSelectedApp] = useState(null);
//   const [selectedJudges, setSelectedJudges] = useState([]);
//   const [assignModalOpen, setAssignModalOpen] = useState(false);
//   const [selectedReportIds, setSelectedReportIds] = useState([]);
//   const [reportActionBusy, setReportActionBusy] = useState(false);

//   // Deadline editing
//   const [editingDeadlineAppId, setEditingDeadlineAppId] = useState(null);
//   const [deadlineValue, setDeadlineValue] = useState('');
//   const [savingDeadline, setSavingDeadline] = useState(false);

//   // Change Password form
//   const [changeSuccess, setChangeSuccess] = useState('');
//   const [changeError,   setChangeError]   = useState('');
//   const [eligibilityReview, setEligibilityReview] = useState({ appId: null, isEligible: true, note: '' });
//   const { register: regPassword, handleSubmit: handlePassword, formState: { errors: passErrors, isSubmitting: passSubmitting }, watch, reset: resetPassword } = useForm();
//   const newPassword = watch('newPassword');
//   const passwordRules = [
//     { label: 'At least 8 characters', passed: (newPassword || '').length >= 8 },
//     { label: 'Includes an uppercase letter', passed: /[A-Z]/.test(newPassword || '') },
//     { label: 'Includes a number', passed: /\d/.test(newPassword || '') },
//     { label: 'Includes a symbol', passed: /[^A-Za-z0-9]/.test(newPassword || '') },
//   ];
//   const passwordStrength = passwordRules.filter((rule) => rule.passed).length;

//   // Broadcast form
//   const { register: regBroadcast, handleSubmit: handleBroadcast, reset: resetBroadcast, watch: watchBroadcast, setValue: setBroadcastValue, formState: { isSubmitting: broadcastSubmitting } } = useForm({
//     defaultValues: { role: 'all', title: '', message: '' },
//   });

//   const fetchStats = async () => {
//     try {
//       const { data } = await adminService.getDashboardStats();
//       setStats(data.data);
//     } catch { toast.error('Failed to load dashboard statistics.'); }
//   };

//   const fetchApps = async () => {
//     try {
//       const params = {
//         search: appSearch || undefined,
//         status: appStatusFilter || undefined,
//         limit: 100,
//       };
//       const { data } = await applicationService.getAllApplications(params);
//       setApplications(data.data.applications);
//     } catch { toast.error('Failed to load applications.'); }
//   };

//   const fetchUsers = async () => {
//     try {
//       const params = { role: userRoleFilter || undefined, limit: 100 };
//       const { data } = await adminService.getUsers(params);
//       setUsers(data.data.users);
//     } catch { toast.error('Failed to load users.'); }
//   };

//   const fetchAdmins = async () => {
//     try {
//       const { data } = await adminService.getUsers({ role: 'admin', limit: 100 });
//       setAdmins(data.data.users);
//     } catch { toast.error('Failed to load admins.'); }
//   };

//   const fetchCategories = async () => {
//     try {
//       const { data } = await categoryService.getCategories();
//       setCategories(data.data.categories);
//     } catch { toast.error('Failed to load categories.'); }
//   };

//   const fetchMonitoring = async () => {
//     try {
//       const [{ data: monitoringData }, { data: judgeProgressData }] = await Promise.all([
//         applicationService.getMonitoringOverview(),
//         applicationService.getJudgeProgress(),
//       ]);
//       setMonitoring(monitoringData.data.overview);
//       setJudgeProgress(judgeProgressData.data.progress || []);
//     } catch {
//       toast.error('Failed to load monitoring metrics.');
//     }
//   };

//   const fetchCriteria = async () => {
//     try {
//       const { data } = await evaluationCriteriaService.getAllCriteria();
//       setCriteria(data.data.criteria);
//     } catch { toast.error('Failed to load evaluation criteria.'); }
//   };

//   const fetchTracker = async () => {
//     try {
//       setTrackerLoading(true);
//       const params = {
//         stage: trackerStage,
//         mainCategory: trackerMainCategory !== 'all' ? trackerMainCategory : undefined,
//         subCategory: trackerSubCategory !== 'all' ? trackerSubCategory : undefined,
//         search: trackerSearch || undefined,
//       };
//       const { data } = await evaluationService.getEvaluationTracker(params);
//       setTrackerApps(data.data.applications || []);
//       setTrackerStats(data.data.stats || null);
//     } catch {
//       toast.error('Failed to load evaluation tracker details.');
//     } finally {
//       setTrackerLoading(false);
//     }
//   };


//   useEffect(() => {
//     if (activeTab === 'monitoring') {
//       fetchTracker();
//     }
//   }, [trackerStage, trackerMainCategory, trackerSubCategory, trackerSearch, activeTab]);

//   const loadAll = async () => {
//     setLoading(true);
//     await Promise.all([
//       fetchStats(),
//       fetchApps(),
//       fetchUsers(),
//       fetchAdmins(),
//       fetchCategories(),
//       fetchMonitoring(),
//       fetchCriteria(),
//     ]);
//     setLoading(false);
//   };

//   useEffect(() => {
//     loadAll();
//   }, [appSearch, appStatusFilter, userRoleFilter]);

//   useEffect(() => {
//     if (!user) return;
//     setProfileForm({
//       firstName: user.firstName || '',
//       lastName: user.lastName || '',
//       phone: user.phone || '',
//       organization: user.organization || '',
//       designation: user.designation || '',
//     });
//   }, [user]);

//   const handleLogout = () => {
//     logout();
//     navigate('/');
//   };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append('profileImage', file);

//     try {
//       setImageUploading(true);
//       const { data } = await api.post('/auth/profile-image', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       updateUserLocal(data.data.user);
//       toast.success('Profile picture updated successfully.');
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to upload profile picture.');
//     } finally {
//       setImageUploading(false);
//       e.target.value = '';
//     }
//   };

//   const handleProfileFormChange = (field, value) => {
//     setProfileForm((current) => ({ ...current, [field]: value }));
//   };

//   const handleProfileSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setProfileSaving(true);
//       const { data } = await api.patch('/auth/profile', profileForm);
//       updateUserLocal(data.data.user);
//       toast.success('Profile updated successfully.');
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to update profile.');
//     } finally {
//       setProfileSaving(false);
//     }
//   };

//   const judgesList = users.filter((userItem) => userItem.role === 'judge');
//   const candidatesList = users.filter((userItem) => userItem.role === 'candidate');
//   const broadcastRole = watchBroadcast('role') || 'all';
//   const broadcastTitle = watchBroadcast('title') || '';
//   const broadcastMessage = watchBroadcast('message') || '';
//   const getStatusAudienceCount = (status) => {
//     const candidateIds = new Set(
//       applications
//         .filter((app) => app.status === status)
//         .map((app) => app.candidate?._id || app.candidate)
//         .filter(Boolean)
//     );
//     return candidateIds.size;
//   };
//   const broadcastStatusAudience = BROADCAST_STATUS_AUDIENCES.find((audience) => audience.value === broadcastRole);
//   const broadcastAudienceLabel = broadcastStatusAudience?.label
//     || (broadcastRole === 'all' ? 'All users' : broadcastRole === 'candidate' ? 'Candidates' : 'Judges');
//   const broadcastAudienceCount = broadcastStatusAudience
//     ? getStatusAudienceCount(broadcastStatusAudience.status)
//     : broadcastRole === 'judge'
//       ? judgesList.length
//       : broadcastRole === 'candidate'
//         ? candidatesList.length
//         : users.length;
//   const overviewCards = stats ? [
//     { label: 'Total Applications', value: stats.stats.totalApplications, color: 'text-white' },
//     { label: 'Draft Applications', value: stats.stats.draftApps || 0, color: 'text-slate-200' },
//     { label: 'Submitted', value: stats.stats.submittedApps, color: 'text-accent-400' },
//     { label: 'Selected to Next Round', value: stats.stats.selectedToNextRoundApps || 0, color: 'text-cyan-400' },
//     { label: 'Finalists', value: stats.stats.finalistApps, color: 'text-gold-400' },
//     { label: 'Winners', value: stats.stats.winnerApps || 0, color: 'text-emerald-400' },
//     { label: 'Judges', value: stats.stats.totalJudges, color: 'text-white' },
//     { label: 'Pending Evaluations', value: stats.stats.pendingEvaluations, color: 'text-amber-400' },
//     { label: 'Completed Evaluations', value: stats.stats.completedEvaluations, color: 'text-emerald-400' },
//   ] : [];

//   // Change Password submit
//   const onChangePasswordSubmit = async (data) => {
//     try {
//       setChangeError('');
//       setChangeSuccess('');
//       await api.post('/auth/change-password', {
//         oldPassword: data.oldPassword,
//         newPassword: data.newPassword,
//       });
//       setChangeSuccess('Password updated successfully!');
//       toast.success('Password changed successfully.');
//       resetPassword();
//     } catch (err) {
//       setChangeError(err.response?.data?.message || 'Failed to update password.');
//       toast.error('Password change failed.');
//     }
//   };

//   // Status transitions
//   const handleStatusChange = async (appId, newStatus) => {
//     try {
//       await applicationService.changeStatus(appId, { status: newStatus });
//       toast.success('Application status updated.');
//       fetchApps();
//       fetchStats();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to update status.');
//     }
//   };

//   // Deadline editing
//   const handleEditDeadline = (app) => {
//     setEditingDeadlineAppId(app._id);
//     if (app.deadline) {
//       const date = new Date(app.deadline);
//       const tzOffset = date.getTimezoneOffset() * 60000;
//       const localISOTime = (new Date(date - tzOffset)).toISOString().slice(0, 16);
//       setDeadlineValue(localISOTime);
//     } else {
//       setDeadlineValue('');
//     }
//   };

//   const handleSaveDeadline = async () => {
//     if (!deadlineValue) {
//       return toast.error('Please select a valid deadline.');
//     }
//     try {
//       setSavingDeadline(true);
//       const isoString = new Date(deadlineValue).toISOString();
//       await applicationService.updateApplicationDeadline(editingDeadlineAppId, isoString);
//       toast.success('Application deadline updated successfully.');
//       setEditingDeadlineAppId(null);
//       setDeadlineValue('');
//       fetchApps();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to update deadline.');
//     } finally {
//       setSavingDeadline(false);
//     }
//   };

//   const handleCancelDeadlineEdit = () => {
//     setEditingDeadlineAppId(null);
//     setDeadlineValue('');
//   };

//   // User Activation Toggle
//   const handleToggleUser = async (userId) => {
//     try {
//       await adminService.toggleUserStatus(userId);
//       toast.success('User status updated.');
//       fetchUsers();
//       fetchAdmins();
//     } catch {
//       toast.error('Failed to toggle user status.');
//     }
//   };

//   // User Delete
//   const handleDeleteUser = async (userId) => {
//     if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
//     try {
//       await adminService.deleteUser(userId);
//       toast.success('User deleted.');
//       fetchUsers();
//       fetchAdmins();
//     } catch {
//       toast.error('Failed to delete user.');
//     }
//   };

//   const handleDeleteCategory = async (id) => {
//     if (!window.confirm('Delete this category?')) return;
//     try {
//       await categoryService.deleteCategory(id);
//       toast.success('Category deleted.');
//       fetchCategories();
//     } catch {
//       toast.error('Failed to delete category.');
//     }
//   };

//   // Seed default categories
//   const handleSeedCategories = async () => {
//     try {
//       const { data } = await categoryService.seedDefaults();
//       toast.success(data.message);
//       fetchCategories();
//     } catch {
//       toast.error('Failed to seed default categories.');
//     }
//   };

//   // ── Criteria Management Handlers ──
//   const handleSubmitCriteria = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         ...criteriaForm,
//         weight: Number(criteriaForm.weight || 0),
//         maxScore: Number(criteriaForm.maxScore || 0),
//         order: Number(criteriaForm.order || 0),
//       };
//       if (editingCriteriaId) {
//         await evaluationCriteriaService.updateCriteria(editingCriteriaId, payload);
//         toast.success('Evaluation criteria updated.');
//       } else {
//         await evaluationCriteriaService.createCriteria(payload);
//         toast.success('Evaluation criteria created.');
//       }
//       setCriteriaForm({ name: '', description: '', weight: 10, maxScore: 10, criteriaType: 'organizational', stage: 'initial', order: 0, isActive: true });
//       setEditingCriteriaId(null);
//       fetchCriteria();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to save evaluation criteria.');
//     }
//   };

//   const handleEditCriteria = (c) => {
//     setEditingCriteriaId(c._id);
//     setCriteriaForm({
//       name: c.name || '',
//       description: c.description || '',
//       weight: c.weight || 10,
//       maxScore: c.maxScore || 10,
//       criteriaType: c.criteriaType || 'organizational',
//       stage: c.stage || 'initial',
//       order: c.order || 0,
//       isActive: c.isActive !== false,
//     });
//   };

//   const handleDeleteCriteria = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this evaluation criterion?')) return;
//     try {
//       await evaluationCriteriaService.deleteCriteria(id);
//       toast.success('Evaluation criteria deleted.');
//       fetchCriteria();
//     } catch {
//       toast.error('Failed to delete criteria.');
//     }
//   };

//   const handleSeedCriteria = async () => {
//     try {
//       const { data } = await evaluationCriteriaService.seedDefaults();
//       toast.success(data.message);
//       fetchCriteria();
//     } catch {
//       toast.error('Failed to seed default evaluation criteria.');
//     }
//   };

//   // Broadcast submit
//   const onBroadcastSubmit = async (data) => {
//     try {
//       const statusAudience = BROADCAST_STATUS_AUDIENCES.find((audience) => audience.value === data.role);
//       const payload = statusAudience
//         ? { ...data, role: 'candidate', status: statusAudience.status }
//         : data;

//       await adminService.broadcastNotification(payload);
//       toast.success('Broadcast notification sent successfully.');
//       resetBroadcast();
//     } catch {
//       toast.error('Failed to send broadcast.');
//     }
//   };

//   // Open Judge Evaluations Modal
//   const openEvaluationsModal = async (app) => {
//     setEvaluationsApp(app);
//     setEvaluationsList([]);
//     setEvaluationsModalOpen(true);
//     setEvalsLoading(true);
//     try {
//       const { data } = await evaluationService.getEvaluationsByApplication(app._id);
//       setEvaluationsList(data.data.evaluations || []);
//     } catch {
//       toast.error('Failed to load judge evaluations.');
//     } finally {
//       setEvalsLoading(false);
//     }
//   };

//   // Open Judge Assignment
//   const openAssignModal = (app) => {
//     setSelectedApp(app);
//     setSelectedJudges(app.assignedJudges?.map(j => j._id || j) || []);
//     setAssignModalOpen(true);
//   };

//   const handleAssignSubmit = async () => {
//     try {
//       await applicationService.assignJudges(selectedApp._id, selectedJudges);
//       toast.success('Judges assigned successfully.');
//       setAssignModalOpen(false);
//       fetchApps();
//       fetchMonitoring();
//     } catch {
//       toast.error('Failed to assign judges.');
//     }
//   };

//   const handleEligibilityReview = async (e) => {
//     e.preventDefault();
//     try {
//       await applicationService.reviewEligibility(eligibilityReview.appId, {
//         isEligible: eligibilityReview.isEligible,
//         note: eligibilityReview.note,
//       });
//       toast.success('Eligibility review saved.');
//       setEligibilityReview({ appId: null, isEligible: true, note: '' });
//       fetchApps();
//       fetchMonitoring();
//     } catch {
//       toast.error('Failed to save eligibility review.');
//     }
//   };

//   const toggleJudgeSelection = (judgeId) => {
//     setSelectedJudges(prev =>
//       prev.includes(judgeId) ? prev.filter(id => id !== judgeId) : [...prev, judgeId]
//     );
//   };

//   const toggleReportSelection = (appId) => {
//     setSelectedReportIds((prev) => prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]);
//   };

//   const handleExportReport = async (format = 'csv') => {
//     try {
//       const { data } = await applicationService.exportApplications(format);
//       const fileName = `ai-awards-report.${format}`;
//       const blob = new Blob([data], { type: format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;' });
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = fileName;
//       link.click();
//       window.URL.revokeObjectURL(url);
//       toast.success(`Exported ${fileName}.`);
//     } catch {
//       toast.error('Report export failed.');
//     }
//   };

//   const handlePublishFinalists = async () => {
//     if (!selectedReportIds.length) {
//       toast.error('Select at least one application first.');
//       return;
//     }

//     setReportActionBusy(true);
//     try {
//       await applicationService.publishFinalists(selectedReportIds);
//       toast.success('Finalists published.');
//       setSelectedReportIds([]);
//       fetchApps();
//       fetchMonitoring();
//     } catch {
//       toast.error('Failed to publish finalists.');
//     } finally {
//       setReportActionBusy(false);
//     }
//   };

//   const handlePublishWinners = async () => {
//     if (!selectedReportIds.length) {
//       toast.error('Select at least one application first.');
//       return;
//     }

//     setReportActionBusy(true);
//     try {
//       await applicationService.publishWinners(selectedReportIds);
//       toast.success('Winners published.');
//       setSelectedReportIds([]);
//       fetchApps();
//       fetchMonitoring();
//     } catch {
//       toast.error('Failed to publish winners.');
//     } finally {
//       setReportActionBusy(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-navy-950 flex flex-col pt-20">
//       {/* Main dashboard content */}
//       <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">

//         {/* Sidebar Nav */}
//         <div className="lg:col-span-1 space-y-4">
//           <div className="glass-card p-6 text-center !hover:transform-none">
//             {user?.profileImage ? (
//               <img
//                 src={buildAssetUrl(user.profileImage)}
//                 alt={user.fullName || user.email}
//                 className="w-16 h-16 rounded-full object-cover border border-white/20 shadow-glow mx-auto mb-4"
//               />
//             ) : (
//               <div className="w-16 h-16 rounded-full bg-accent-500/15 border border-accent-500/30 flex items-center justify-center mx-auto mb-4 font-display font-bold text-accent-300 text-2xl">
//                 {user?.firstName?.charAt(0) || 'A'}
//               </div>
//             )}
//             <h2 className="font-display font-bold text-white text-lg">{user?.fullName}</h2>
//             <span className="badge-gold mt-2 text-[10px] uppercase font-mono">{user?.role}</span>
//           </div>

//           <div className="glass-card p-2 space-y-1 !hover:transform-none">
//             {[
//               { id: 'overview', label: 'Dashboard Overview', icon: RiDashboardLine },
//               { id: 'applications', label: 'Manage Nominations', icon: RiFileList3Line },
//               { id: 'monitoring', label: 'Application Monitoring', icon: RiFileChartLine },
//               { id: 'users', label: 'User Directory', icon: RiTeamLine },
//               { id: 'categories', label: 'Categories', icon: RiFolderShield2Line },
//               { id: 'criteria', label: 'Evaluation Criteria', icon: RiStarLine },
//               { id: 'broadcast', label: 'Broadcast Alerts', icon: RiMailSendLine },
//               { id: 'reports', label: 'Reports & Export', icon: RiFileChartLine },
//               { id: 'profile', label: 'My Profile', icon: RiUserLine },
//               { id: 'password', label: 'Change Password', icon: RiLockPasswordLine },
//             ].map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
//                   activeTab === tab.id
//                     ? 'bg-accent-500 text-white shadow-glow'
//                     : 'text-slate-400 hover:bg-white/5 hover:text-white'
//                 }`}
//               >
//                 <tab.icon size={18} />
//                 {tab.label}
//               </button>
//             ))}
//             <button
//               onClick={handleLogout}
//               className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
//             >
//               <RiLogoutBoxLine size={18} />
//               Sign Out
//             </button>
//           </div>
//         </div>

//         {/* Tab Panel */}
//         <div className="lg:col-span-3">
//           <motion.div
//             key={activeTab}
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="glass-card p-8 !hover:transform-none h-full min-h-[500px]"
//           >
//             {loading ? (
//               <div className="flex items-center justify-center h-96">
//                 <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
//               </div>
//             ) : (
//               <>
//                 {/* 1. OVERVIEW TAB */}
//                 {activeTab === 'overview' && stats && (
//                   <div className="space-y-8">
//                     <h3 className="font-display font-bold text-white text-xl flex justify-between items-center">
//                       Dashboard Statistics
//                       <button onClick={loadAll} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
//                         <RiRefreshLine size={16} />
//                       </button>
//                     </h3>

//                     <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
//                       {overviewCards.map((card) => (
//                         <div key={card.label} className="min-h-[110px] rounded-xl bg-white/5 border border-white/5 px-3 py-4 text-center">
//                           <span className="block min-h-[30px] text-slate-400 text-[10px] font-bold uppercase tracking-wider leading-4">{card.label}</span>
//                           <p className={`text-2xl font-black mt-2 font-display ${card.color}`}>{card.value}</p>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
//                       <div className="flex items-center justify-between mb-4">
//                         <h4 className="text-white text-xs font-bold uppercase tracking-wider">Judges</h4>
//                         <span className="text-[11px] text-slate-400">{judgesList.length} available</span>
//                       </div>
//                       {judgesList.length > 0 ? (
//                         <div className="grid gap-3 md:grid-cols-2">
//                           {judgesList.map((judge) => (
//                             <div key={judge._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
//                               <div className="flex items-center justify-between gap-3">
//                                 <div>
//                                   <div className="text-sm font-semibold text-white">{judge.firstName} {judge.lastName}</div>
//                                   <div className="text-[11px] text-slate-400">{judge.email}</div>
//                                 </div>
//                                 <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-300">
//                                   Judge
//                                 </span>
//                               </div>
//                               {(judge.organization || judge.designation) && (
//                                 <div className="mt-2 text-[11px] text-slate-500">
//                                   {judge.organization}{judge.organization && judge.designation ? ' • ' : ''}{judge.designation}
//                                 </div>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                       ) : (
//                         <div className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-slate-400">
//                           No judges have been added yet.
//                         </div>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                       {/* Trend chart */}
//                       <div className="p-6 rounded-2xl bg-white/5 border border-white/5 h-80">
//                         <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5"><RiPulseLine className="text-accent-400" /> Submission Trend</h4>
//                         <ResponsiveContainer width="100%" height="85%">
//                           <LineChart data={stats.submissionTrend}>
//                             <XAxis dataKey="date" stroke="#475569" fontSize={10} />
//                             <YAxis stroke="#475569" fontSize={10} />
//                             <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
//                             <Line type="monotone" dataKey="count" stroke="#0072ff" strokeWidth={3} dot={{ fill: '#00ff87' }} />
//                           </LineChart>
//                         </ResponsiveContainer>
//                       </div>

//                       {/* Category Breakdown chart */}
//                       <div className="p-6 rounded-2xl bg-white/5 border border-white/5 min-h-80">
//                         <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5"><RiAwardLine className="text-gold-400" /> Category Breakdown</h4>
//                         <ResponsiveContainer width="100%" height={210}>
//                           <BarChart data={stats.categoryBreakdown}>
//                             <XAxis dataKey="name" stroke="#475569" fontSize={8} tickFormatter={(val) => val.split(' ').slice(2).join(' ')} />
//                             <YAxis
//                               stroke="#475569"
//                               fontSize={10}
//                               allowDecimals={false}
//                               domain={[0, 'dataMax']}
//                               ticks={getIntegerTicks(stats.categoryBreakdown.map((entry) => entry.count))}
//                             />
//                             <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
//                             <Bar dataKey="count" fill="#00ff87" radius={[4, 4, 0, 0]}>
//                               {stats.categoryBreakdown.map((entry, index) => (
//                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                               ))}
//                             </Bar>
//                           </BarChart>
//                         </ResponsiveContainer>
//                         <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
//                           {stats.categoryBreakdown.map((entry, index) => (
//                             <div key={entry.name || index} className="flex items-center justify-between gap-3 rounded-lg bg-navy-950/35 px-3 py-2">
//                               <div className="flex min-w-0 items-center gap-2">
//                                 <span
//                                   className="h-2.5 w-2.5 shrink-0 rounded-full"
//                                   style={{ backgroundColor: COLORS[index % COLORS.length] }}
//                                 />
//                                 <span className="truncate text-[11px] font-medium text-slate-300">{entry.name}</span>
//                               </div>
//                               <span className="shrink-0 font-mono text-[11px] font-semibold text-white">{entry.count}</span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* 2. ADMINS TAB */}
//                 {activeTab === 'admins' && (
//                   <div>
//                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//                       <div>
//                         <h3 className="font-display font-bold text-white text-xl">Registered Admins</h3>
//                         <p className="text-slate-400 text-xs mt-1">View all administrators currently registered in the system.</p>
//                       </div>
//                       <div className="text-sm text-slate-400">{admins.length} admin{admins.length === 1 ? '' : 's'}</div>
//                     </div>

//                     {admins.length > 0 ? (
//                       <div className="grid gap-4 md:grid-cols-2">
//                         {admins.map((admin) => (
//                           <div key={admin._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
//                             <div className="flex items-start justify-between gap-3">
//                               <div>
//                                 <div className="text-white font-semibold">{admin.firstName} {admin.lastName}</div>
//                                 <div className="text-[11px] text-slate-400 mt-1">{admin.email}</div>
//                               </div>
//                               <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-300">
//                                 Admin
//                               </span>
//                             </div>
//                             {(admin.organization || admin.designation) && (
//                               <div className="mt-3 text-sm text-slate-400">
//                                 {admin.organization}{admin.organization && admin.designation ? ' • ' : ''}{admin.designation}
//                               </div>
//                             )}
//                             <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
//                               <span className="rounded-full bg-white/5 px-2.5 py-1">Phone: {admin.phone || 'Not provided'}</span>
//                               <span className="rounded-full bg-white/5 px-2.5 py-1">Role: {admin.role}</span>
//                               <span className={`rounded-full px-2.5 py-1 ${admin.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
//                                 {admin.isActive ? 'Active' : 'Suspended'}
//                               </span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
//                         No admins have been registered yet.
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* 2. CANDIDATES TAB */}
//                 {activeTab === 'candidates' && (
//                   <div>
//                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//                       <div>
//                         <h3 className="font-display font-bold text-white text-xl">Registered Candidates</h3>
//                         <p className="text-slate-400 text-xs mt-1">View all candidates currently registered in the system.</p>
//                       </div>
//                       <div className="text-sm text-slate-400">{users.filter((userItem) => userItem.role === 'candidate').length} candidate{users.filter((userItem) => userItem.role === 'candidate').length === 1 ? '' : 's'}</div>
//                     </div>

//                     {users.filter((userItem) => userItem.role === 'candidate').length > 0 ? (
//                       <div className="grid gap-4 md:grid-cols-2">
//                         {users.filter((userItem) => userItem.role === 'candidate').map((candidate) => (
//                           <div key={candidate._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
//                             <div className="flex items-start justify-between gap-3">
//                               <div>
//                                 <div className="text-white font-semibold">{candidate.firstName} {candidate.lastName}</div>
//                                 <div className="text-[11px] text-slate-400 mt-1">{candidate.email}</div>
//                               </div>
//                               <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-300">
//                                 Candidate
//                               </span>
//                             </div>
//                             {(candidate.organization || candidate.designation) && (
//                               <div className="mt-3 text-sm text-slate-400">
//                                 {candidate.organization}{candidate.organization && candidate.designation ? ' • ' : ''}{candidate.designation}
//                               </div>
//                             )}
//                             <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
//                               <span className="rounded-full bg-accent-500/10 px-2.5 py-1 font-mono text-accent-300">{candidate.registrationNumber || 'Registration pending'}</span>
//                               <span className="rounded-full bg-white/5 px-2.5 py-1">Phone: {candidate.phone || 'Not provided'}</span>
//                               <span className="rounded-full bg-white/5 px-2.5 py-1">Role: {candidate.role}</span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
//                         No candidates have been registered yet.
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* 3. JUDGES TAB */}
//                 {activeTab === 'judges' && (
//                   <div>
//                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//                       <div>
//                         <h3 className="font-display font-bold text-white text-xl">Registered Judges</h3>
//                         <p className="text-slate-400 text-xs mt-1">View all judges currently registered in the system.</p>
//                       </div>
//                       <div className="text-sm text-slate-400">{judgesList.length} judge{judgesList.length === 1 ? '' : 's'}</div>
//                     </div>

//                     {judgesList.length > 0 ? (
//                       <div className="grid gap-4 md:grid-cols-2">
//                         {judgesList.map((judge) => (
//                           <div key={judge._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
//                             <div className="flex items-start justify-between gap-3">
//                               <div>
//                                 <div className="text-white font-semibold">{judge.firstName} {judge.lastName}</div>
//                                 <div className="text-[11px] text-slate-400 mt-1">{judge.email}</div>
//                               </div>
//                               <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-300">
//                                 Judge
//                               </span>
//                             </div>
//                             {(judge.organization || judge.designation) && (
//                               <div className="mt-3 text-sm text-slate-400">
//                                 {judge.organization}{judge.organization && judge.designation ? ' • ' : ''}{judge.designation}
//                               </div>
//                             )}
//                             <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
//                               <span className="rounded-full bg-white/5 px-2.5 py-1">Phone: {judge.phone || 'Not provided'}</span>
//                               <span className="rounded-full bg-white/5 px-2.5 py-1">Role: {judge.role}</span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
//                         No judges have been registered yet.
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* 3. APPLICATIONS TAB */}
//                 {activeTab === 'applications' && (
//                   <div>
//                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//                       <div>
//                         <h3 className="font-display font-bold text-white text-xl">Manage Nominations</h3>
//                         <p className="text-slate-400 text-xs mt-1">Audit statuses and assign judges panels.</p>
//                       </div>

//                       <div className="flex gap-3 w-full sm:w-auto">
//                         <input
//                           className="input-field max-w-[200px]"
//                           placeholder="Search title/ref..."
//                           value={appSearch}
//                           onChange={(e) => setAppSearch(e.target.value)}
//                         />
//                         <select
//                           className="input-field max-w-[150px]"
//                           value={appStatusFilter}
//                           onChange={(e) => setAppStatusFilter(e.target.value)}
//                         >
//                           <option value="">All Statuses</option>
//                           <option value="submitted">Submitted</option>
//                           <option value="under_review">Under Review</option>
//                           {ADMIN_STATUS_OPTIONS.map((statusOption) => (
//                             <option key={statusOption.value} value={statusOption.value}>
//                               {statusOption.label}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>

//                     <div className="overflow-x-auto">
//                       <table className="w-full text-xs text-left text-slate-300">
//                         <thead className="bg-white/5 text-[10px] uppercase font-bold text-slate-400">
//                           <tr>
//                             <th className="p-4">Ref/Title</th>
//                             <th className="p-4">Category</th>
//                             <th className="p-4">Candidate</th>
//                             <th className="p-4">Email</th>
//                             <th className="p-4">Phone</th>
//                             <th className="p-4">Status</th>
//                             <th className="p-4">Judges Panel</th>
//                             <th className="p-4 text-center">Score</th>
//                             <th className="p-4 text-left">Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {applications.map(app => (
//                             <tr key={app._id} className="border-b border-white/5 hover:bg-white/5">
//                               <td className="p-4">
//                                 <div className="font-bold text-white truncate max-w-[150px]">{app.projectTitle}</div>
//                                 <div className="text-[10px] font-mono text-slate-500">{app.referenceNumber || 'Draft'}</div>
//                               </td>
//                               <td className="p-4 truncate max-w-[120px]">{app.category?.name}</td>
//                               <td className="p-4">
//                                 <div>{app.candidate?.firstName} {app.candidate?.lastName}</div>
//                                 <div className="text-[10px] text-slate-500">{app.candidate?.organization}</div>
//                               </td>
//                               <td className="p-4 font-mono text-[11px] text-slate-300">
//                                 <div className="max-w-[180px] truncate" title={app.primaryContactEmail || app.candidate?.email || 'Not provided'}>
//                                   {app.primaryContactEmail || app.candidate?.email || 'Not provided'}
//                                 </div>
//                               </td>
//                               <td className="p-4 font-mono text-[11px] text-slate-300">
//                                 {app.primaryContactPhone || app.candidate?.phone || 'Not provided'}
//                               </td>
//                               <td className="p-4">
//                                 <select
//                                   className="bg-navy-900 border border-white/10 rounded px-2 py-1 text-[10px]"
//                                   value={app.status}
//                                   onChange={(e) => handleStatusChange(app._id, e.target.value)}
//                                 >
//                                   {!ADMIN_STATUS_OPTIONS.some((statusOption) => statusOption.value === app.status) && (
//                                     <option value={app.status}>{app.statusLabel}</option>
//                                   )}
//                                   {ADMIN_STATUS_OPTIONS.map((statusOption) => (
//                                     <option key={statusOption.value} value={statusOption.value}>
//                                       {statusOption.label}
//                                     </option>
//                                   ))}
//                                 </select>
//                               </td>
//                               <td className="p-4">
//                                 {editingDeadlineAppId === app._id ? (
//                                   <div className="flex items-center gap-2">
//                                     <input
//                                       type="datetime-local"
//                                       className="bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
//                                       value={deadlineValue}
//                                       onChange={(e) => setDeadlineValue(e.target.value)}
//                                     />
//                                     <button
//                                       onClick={handleSaveDeadline}
//                                       disabled={savingDeadline}
//                                       className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-[11px] font-bold transition-colors disabled:opacity-50"
//                                     >
//                                       {savingDeadline ? '...' : '✓'}
//                                     </button>
//                                     <button
//                                       onClick={handleCancelDeadlineEdit}
//                                       className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-[11px] font-bold transition-colors"
//                                     >
//                                       ✗
//                                     </button>
//                                   </div>
//                                 ) : (
//                                   <div className="flex items-center gap-3">
//                                     {app.deadline ? (
//                                       <div className="flex flex-col">
//                                         <span className="text-[11px] font-mono text-white">
//                                           {new Date(app.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
//                                         </span>
//                                         <span className="text-[10px] font-mono text-slate-400">
//                                           {new Date(app.deadline).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
//                                         </span>
//                                       </div>
//                                     ) : (
//                                       <span className="text-[11px] text-slate-500 italic">No deadline set</span>
//                                     )}
//                                     <button
//                                       onClick={() => handleEditDeadline(app)}
//                                       className="bg-accent-500 hover:bg-accent-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
//                                     >
//                                       {app.deadline ? 'Edit' : 'Set'}
//                                     </button>
//                                   </div>
//                                 )}
//                               </td>
//                               <td className="p-4">
//                                 <div className="space-y-1">
//                                   {app.assignedJudges?.map(j => (
//                                     <div key={j._id} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded w-fit">{j.firstName}</div>
//                                   ))}
//                                   <button
//                                     onClick={() => openAssignModal(app)}
//                                     className="text-accent-400 hover:text-accent-300 font-bold block"
//                                   >
//                                     + Assign Panel
//                                   </button>
//                                 </div>
//                               </td>
//                                <td className="p-4 text-center">
//                                 {app.averageScore !== undefined && app.averageScore !== null ? (
//                                   <button
//                                     onClick={() => openEvaluationsModal(app)}
//                                     className="font-bold text-accent-400 hover:text-accent-300 hover:underline bg-accent-500/10 px-2.5 py-1 rounded border border-accent-500/20 font-mono transition-all"
//                                     title="Click to view detailed evaluations"
//                                   >
//                                     {app.averageScore?.toFixed(1)}
//                                   </button>
//                                 ) : (
//                                   <span className="text-slate-500">-</span>
//                                 )}
//                               </td>
//                               <td className="p-4">
//                                 <Link to={`/dashboard/applications/${app._id}`} className="text-accent-400 hover:underline">View</Link>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 )}

//                 {/* 3. APPLICATION MONITORING TAB */}
//                 {activeTab === 'monitoring' && (
//                   <div className="space-y-8">
//                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-5">
//                       <div>
//                         <h3 className="font-display font-bold text-white text-xl">Application Monitoring</h3>
//                         <p className="text-slate-400 text-xs mt-1">Review submissions, screen eligibility, manage judge assignment, and track evaluation progress.</p>
//                       </div>
//                     </div>

//                     {/* Filter Controls Panel */}
//                     <div className="p-5 rounded-2xl bg-white/5 border border-white/5 grid grid-cols-1 sm:grid-cols-4 gap-4">
//                       <div>
//                         <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Evaluation Stage</label>
//                         <select
//                           className="input-field"
//                           value={trackerStage}
//                           onChange={(e) => {
//                             setTrackerStage(e.target.value);
//                           }}
//                         >
//                           <option value="initial">Initial Stage</option>
//                           <option value="f2f">Face-to-Face Stage</option>
//                         </select>
//                       </div>

//                       <div>
//                         <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Main Category</label>
//                         <select
//                           className="input-field"
//                           value={trackerMainCategory}
//                           onChange={(e) => {
//                             setTrackerMainCategory(e.target.value);
//                             setTrackerSubCategory('all'); // Reset subcategory when main changes
//                           }}
//                         >
//                           <option value="all">All Main Categories</option>
//                           <option value="National AI Trailblazer Awards">National AI Trailblazer Awards</option>
//                           <option value="Industry & Sector Excellence Awards">Industry & Sector Excellence Awards</option>
//                           <option value="Innovation & Future-Focused Awards">Innovation & Future-Focused Awards</option>
//                         </select>
//                       </div>

//                       <div>
//                         <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Sub Category</label>
//                         <select
//                           className="input-field"
//                           value={trackerSubCategory}
//                           onChange={(e) => setTrackerSubCategory(e.target.value)}
//                         >
//                           <option value="all">All Sub Categories</option>
//                           {Object.entries(MAIN_CATEGORIES_MAP)
//                             .filter(([main]) => trackerMainCategory === 'all' || main === trackerMainCategory)
//                             .flatMap(([, subs]) => subs)
//                             .map((subName) => (
//                               <option key={subName} value={subName}>
//                                 {subName}
//                               </option>
//                             ))}
//                         </select>
//                       </div>

//                       <div>
//                         <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Search</label>
//                         <input
//                           type="text"
//                           className="input-field"
//                           placeholder="Project title or reference..."
//                           value={trackerSearch}
//                           onChange={(e) => setTrackerSearch(e.target.value)}
//                         />
//                       </div>
//                     </div>

//                     {/* Summary Statistics Cards */}
//                     {trackerLoading ? (
//                       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//                         {[1, 2, 3, 4, 5, 6].map((i) => (
//                           <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 h-20 animate-pulse" />
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//                         {[
//                           { label: 'Total Applications', value: trackerStats?.totalApplications ?? 0, color: 'text-white' },
//                           { label: 'Completed Evaluations', value: trackerStats?.completedEvaluations ?? 0, color: 'text-emerald-400' },
//                           { label: 'Pending Evaluations', value: trackerStats?.pendingEvaluations ?? 0, color: 'text-amber-400' },
//                           {
//                             label: 'Average Score',
//                             value: trackerStats?.averageScore !== undefined && trackerStats?.averageScore !== null && trackerStats?.averageScore > 0
//                               ? trackerStats.averageScore.toFixed(2)
//                               : '—',
//                             color: 'text-accent-400'
//                           },
//                           {
//                             label: 'Highest Avg Score',
//                             value: trackerStats?.highestAverageScore !== undefined && trackerStats?.highestAverageScore !== null && trackerStats?.highestAverageScore > 0
//                               ? trackerStats.highestAverageScore.toFixed(2)
//                               : '—',
//                             color: 'text-gold-400'
//                           },
//                           {
//                             label: 'Lowest Avg Score',
//                             value: trackerStats?.lowestAverageScore !== undefined && trackerStats?.lowestAverageScore !== null && trackerStats?.lowestAverageScore > 0
//                               ? trackerStats.lowestAverageScore.toFixed(2)
//                               : '—',
//                             color: 'text-red-400'
//                           },
//                         ].map((item) => (
//                           <div key={item.label} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
//                             <span className="text-slate-400 text-[9px] uppercase tracking-wider font-bold leading-tight">{item.label}</span>
//                             <span className={`text-xl font-black mt-2 font-display ${item.color}`}>{item.value}</span>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                       <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
//                         <h4 className="font-display font-bold text-white text-base mb-4">Eligibility Screening</h4>
//                         <div className="space-y-3 max-h-[320px] overflow-y-auto">
//                           {applications.filter((app) => app.status === 'submitted' || app.status === 'under_review').map((app) => (
//                             <div key={app._id} className="p-3 rounded-xl bg-white/5 border border-white/10">
//                               <div className="flex justify-between items-start gap-3">
//                                 <div>
//                                   <div className="text-white text-sm font-semibold">{app.projectTitle}</div>
//                                   <div className="text-[11px] text-slate-400">{app.candidate?.firstName} {app.candidate?.lastName}</div>
//                                 </div>
//                                 <button onClick={() => setEligibilityReview({ appId: app._id, isEligible: app.isEligible ?? true, note: app.adminNotes || '' })} className="text-accent-400 text-xs">Review</button>
//                               </div>
//                               {eligibilityReview.appId === app._id && (
//                                 <form onSubmit={handleEligibilityReview} className="mt-3 space-y-2">
//                                   <textarea className="input-field h-20" placeholder="Review note" value={eligibilityReview.note} onChange={(e) => setEligibilityReview({ ...eligibilityReview, note: e.target.value })} />
//                                   <div className="flex items-center gap-3">
//                                     <label className="text-xs text-slate-300 flex items-center gap-2"><input type="radio" checked={eligibilityReview.isEligible} onChange={() => setEligibilityReview({ ...eligibilityReview, isEligible: true })} /> Eligible</label>
//                                     <label className="text-xs text-slate-300 flex items-center gap-2"><input type="radio" checked={!eligibilityReview.isEligible} onChange={() => setEligibilityReview({ ...eligibilityReview, isEligible: false })} /> Ineligible</label>
//                                   </div>
//                                   <button type="submit" className="btn-primary text-xs">Save Review</button>
//                                 </form>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                       <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
//                         <h4 className="font-display font-bold text-white text-base mb-4">Judge Evaluation Progress</h4>
//                         <div className="space-y-3 max-h-[320px] overflow-y-auto">
//                           {judgeProgress.map((entry) => (
//                             <div key={entry.judgeId} className="p-3 rounded-xl bg-white/5 border border-white/10">
//                               <div className="flex justify-between items-start gap-3">
//                                 <div>
//                                   <div className="text-white text-sm font-semibold">{entry.judgeName}</div>
//                                   <div className="text-[11px] text-slate-400">{entry.email}</div>
//                                 </div>
//                                 <div className="text-right text-[11px] text-slate-400">
//                                   <div>Assigned: {entry.assigned || 0}</div>
//                                   <div>Completed: {entry.completed || 0}</div>
//                                   <div>Uncompleted: {entry.pending || 0}</div>
//                                 </div>
//                               </div>
//                               <div className="mt-2 text-[11px] text-accent-400">Average score: {entry.avgScore ?? '—'}</div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Evaluations Tracker Section */}
//                     <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4 mt-6">
//                       <div>
//                         <h4 className="font-display font-bold text-white text-base">Evaluations Tracker</h4>
//                         <p className="text-slate-400 text-xs mt-0.5">Track live average scores and view judge evaluation sheets for each nominee.</p>
//                       </div>

//                       {trackerLoading ? (
//                         <div className="space-y-3 py-6">
//                           {[1, 2, 3].map((i) => (
//                             <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />
//                           ))}
//                         </div>
//                       ) : (
//                         <div className="overflow-x-auto">
//                           <table className="w-full text-xs text-left text-slate-300">
//                             <thead className="bg-white/5 text-[10px] uppercase font-bold text-slate-400">
//                               <tr>
//                                 <th className="p-3">Title/Nominee</th>
//                                 <th className="p-3">Award Category</th>
//                                 <th className="p-3 text-center">Stage</th>
//                                 <th className="p-3 text-center">Judges assigned</th>
//                                 <th className="p-3 text-center">Evaluations Completed</th>
//                                 <th className="p-3 text-center">Average Score</th>
//                                 <th className="p-3 text-center">Status</th>
//                                 <th className="p-3 text-right">Details</th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {trackerApps.map(app => {
//                                 const completedEvals = app.completedJudges || 0;
//                                 const totalAssigned = app.assignedJudges?.length || 0;
//                                 return (
//                                   <tr key={app._id} className="border-b border-white/5 hover:bg-white/5 transition-all">
//                                     <td className="p-3 font-semibold text-white">
//                                       <div>{app.projectTitle}</div>
//                                       <div className="text-[10px] text-slate-500 font-mono font-medium">{app.referenceNumber}</div>
//                                     </td>
//                                     <td className="p-3 text-slate-400">{app.category?.name}</td>
//                                     <td className="p-3 text-center capitalize">{app.stage === 'f2f' ? 'Face-to-Face' : 'Initial'}</td>
//                                     <td className="p-3 text-center font-mono">{totalAssigned}</td>
//                                     <td className="p-3 text-center font-mono">
//                                       <span className={completedEvals === totalAssigned && totalAssigned > 0 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
//                                         {completedEvals} / {totalAssigned}
//                                       </span>
//                                     </td>
//                                     <td className="p-3 text-center">
//                                       <span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded">
//                                         {app.averageScore !== undefined && app.averageScore !== null ? app.averageScore.toFixed(2) : 'Pending Evaluation'}
//                                       </span>
//                                     </td>
//                                     <td className="p-3 text-center">
//                                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
//                                         app.overallStatus === 'Completed'
//                                           ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
//                                           : app.overallStatus === 'In Progress'
//                                             ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
//                                             : 'bg-slate-500/10 text-slate-400 border border-white/5'
//                                       }`}>
//                                         {app.overallStatus}
//                                       </span>
//                                     </td>
//                                     <td className="p-3 text-right">
//                                       <button
//                                         onClick={() => openEvaluationsModal(app)}
//                                         className="text-accent-400 hover:text-accent-300 font-bold hover:underline"
//                                       >
//                                         View scorecards
//                                       </button>
//                                     </td>
//                                   </tr>
//                                 );
//                               })}
//                               {trackerApps.length === 0 && (
//                                 <tr>
//                                   <td colSpan="8" className="p-8 text-center text-slate-500">No applications matching the criteria are available.</td>
//                                 </tr>
//                               )}
//                             </tbody>
//                           </table>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {/* 4. USER DIRECTORY TAB */}
//                 {activeTab === 'users' && (
//                   <div className="space-y-8">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <h3 className="font-display font-bold text-white text-xl">User Directory</h3>
//                         <p className="text-slate-400 text-xs mt-1">Manage system accounts and access credentials.</p>
//                       </div>
//                       <select
//                         className="input-field max-w-[150px]"
//                         value={userRoleFilter}
//                         onChange={(e) => setUserRoleFilter(e.target.value)}
//                       >
//                         <option value="">All Roles</option>
//                         <option value="candidate">Candidate</option>
//                         <option value="judge">Judge</option>
//                         <option value="admin">Admin</option>
//                       </select>
//                     </div>

//                     <div className="overflow-x-auto">
//                       <table className="w-full text-xs text-left text-slate-300">
//                         <thead className="bg-white/5 text-[10px] uppercase font-bold text-slate-400">
//                           <tr>
//                             <th className="p-4">Name</th>
//                             <th className="p-4">Registration No.</th>
//                             <th className="p-4">Email</th>
//                             <th className="p-4">Role</th>
//                             <th className="p-4">Status</th>
//                             <th className="p-4">Registered Date</th>
//                             <th className="p-4 text-right">Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {users.map(u => (
//                             <tr key={u._id} className="border-b border-white/5 hover:bg-white/5">
//                               <td className="p-4 font-bold text-white">{u.firstName} {u.lastName}</td>
//                               <td className="p-4 font-mono text-accent-300">{u.role === 'candidate' ? (u.registrationNumber || 'Pending') : '—'}</td>
//                               <td className="p-4 font-mono">{u.email}</td>
//                               <td className="p-4 uppercase text-[10px] tracking-wider font-semibold font-mono text-accent-400">{u.role}</td>
//                               <td className="p-4">
//                                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
//                                   {u.isActive ? 'Active' : 'Suspended'}
//                                 </span>
//                               </td>
//                               <td className="p-4">{new Date(u.createdAt).toLocaleDateString()}</td>
//                               <td className="p-4 text-right space-x-2">
//                                 <button onClick={() => handleToggleUser(u._id)} className="text-slate-400 hover:text-white">
//                                   {u.isActive ? 'Deactivate' : 'Activate'}
//                                 </button>
//                                 <button onClick={() => handleDeleteUser(u._id)} className="text-red-400 hover:text-red-300">Delete</button>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 )}

//                 {/* 4. CATEGORIES TAB */}
//                 {activeTab === 'categories' && (
//                   <div className="space-y-8">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <h3 className="font-display font-bold text-white text-xl">Award Categories</h3>
//                         <p className="text-slate-400 text-xs mt-1">Manage award categories available for nominations.</p>
//                       </div>
//                       <button onClick={handleSeedCategories} className="btn-primary text-xs">
//                         Seed Default Categories
//                       </button>
//                     </div>

//                     <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
//                         <h4 className="font-display font-bold text-white text-base">Existing Categories</h4>
//                         <div className="space-y-3 max-h-[420px] overflow-y-auto">
//                           {categories.map(c => (
//                             <div key={c._id} className="p-3 rounded-xl bg-white/5 border border-white/10">
//                               <div className="flex justify-between items-start gap-3">
//                                 <div>
//                                   <h5 className="font-semibold text-white text-sm">{c.name}</h5>
//                                   <p className="text-slate-400 text-[11px] mt-1">{c.description}</p>
//                                 </div>
//                                 <div className="flex gap-2">
//                                   <button onClick={() => handleDeleteCategory(c._id)} className="text-red-400 text-xs">Delete</button>
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* EVALUATION CRITERIA TAB */}
//                 {activeTab === 'criteria' && (
//                   <div className="space-y-8">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <h3 className="font-display font-bold text-white text-xl">Evaluation Criteria</h3>
//                         <p className="text-slate-400 text-xs mt-1">Manage criteria sets and weight distributions for evaluation scorecards.</p>
//                       </div>
//                       <button onClick={handleSeedCriteria} className="btn-primary text-xs">
//                         Seed Default Criteria
//                       </button>
//                     </div>

//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                       <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
//                         <h4 className="font-display font-bold text-white text-base">
//                           {editingCriteriaId ? 'Edit Evaluation Criterion' : 'Create Evaluation Criterion'}
//                         </h4>
//                         <form onSubmit={handleSubmitCriteria} className="space-y-3">
//                           <div>
//                             <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Name</label>
//                             <input
//                               className="input-field"
//                               placeholder="Criterion name"
//                               value={criteriaForm.name}
//                               onChange={(e) => setCriteriaForm({ ...criteriaForm, name: e.target.value })}
//                               required
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Description</label>
//                             <textarea
//                               className="input-field h-24 resize-none"
//                               placeholder="Description / judging focus"
//                               value={criteriaForm.description}
//                               onChange={(e) => setCriteriaForm({ ...criteriaForm, description: e.target.value })}
//                               required
//                             />
//                           </div>
//                           <div className="grid grid-cols-2 gap-3">
//                             <div>
//                               <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Weight (%)</label>
//                               <input
//                                 type="number"
//                                 className="input-field"
//                                 placeholder="Weight"
//                                 value={criteriaForm.weight}
//                                 onChange={(e) => setCriteriaForm({ ...criteriaForm, weight: e.target.value, maxScore: e.target.value })}
//                                 required
//                               />
//                             </div>
//                             <div>
//                               <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Max Score</label>
//                               <input
//                                 type="number"
//                                 className="input-field"
//                                 placeholder="Max Score (equal to weight)"
//                                 value={criteriaForm.maxScore}
//                                 disabled
//                               />
//                             </div>
//                           </div>
//                           <div className="grid grid-cols-3 gap-3">
//                             <div>
//                               <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Category Type</label>
//                               <select
//                                 className="input-field"
//                                 value={criteriaForm.criteriaType}
//                                 onChange={(e) => setCriteriaForm({ ...criteriaForm, criteriaType: e.target.value })}
//                               >
//                                 <option value="organizational" className="bg-navy-950">🏢 Organizational</option>
//                                 <option value="individual" className="bg-navy-950">👤 Individual</option>
//                               </select>
//                             </div>
//                             <div>
//                               <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Stage</label>
//                               <select
//                                 className="input-field"
//                                 value={criteriaForm.stage || 'initial'}
//                                 onChange={(e) => setCriteriaForm({ ...criteriaForm, stage: e.target.value })}
//                               >
//                                 <option value="initial" className="bg-navy-950">Initial Stage</option>
//                                 <option value="f2f" className="bg-navy-950">Face-to-Face</option>
//                               </select>
//                             </div>
//                             <div>
//                               <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Sort Order</label>
//                               <input
//                                 type="number"
//                                 className="input-field"
//                                 placeholder="Sort Order"
//                                 value={criteriaForm.order}
//                                 onChange={(e) => setCriteriaForm({ ...criteriaForm, order: e.target.value })}
//                               />
//                             </div>
//                           </div>
//                           <label className="flex items-center gap-2 text-sm text-slate-300 select-none">
//                             <input
//                               type="checkbox"
//                               checked={criteriaForm.isActive}
//                               onChange={(e) => setCriteriaForm({ ...criteriaForm, isActive: e.target.checked })}
//                             />
//                             Active & enabled for evaluation
//                           </label>
//                           <div className="flex gap-3 pt-2">
//                             <button type="submit" className="btn-primary text-xs">
//                               {editingCriteriaId ? 'Save Changes' : 'Create Criterion'}
//                             </button>
//                             {editingCriteriaId && (
//                               <button
//                                 type="button"
//                                 onClick={() => {
//                                   setEditingCriteriaId(null);
//                                   setCriteriaForm({ name: '', description: '', weight: 10, maxScore: 10, criteriaType: 'organizational', stage: 'initial', order: 0, isActive: true });
//                                 }}
//                                 className="btn-ghost text-xs"
//                               >
//                                 Cancel
//                               </button>
//                             )}
//                           </div>
//                         </form>
//                       </div>

//                       <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
//                         <h4 className="font-display font-bold text-white text-base">Criteria Definitions</h4>
//                         <div className="space-y-3 max-h-[500px] overflow-y-auto">
//                           {criteria.map((c) => (
//                             <div key={c._id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-2">
//                               <div className="flex justify-between items-start gap-3">
//                                 <div className="min-w-0">
//                                   <div className="flex items-center gap-1.5 flex-wrap">
//                                     <h5 className="font-semibold text-white text-sm truncate">{c.name}</h5>
//                                     <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
//                                       c.criteriaType === 'individual'
//                                         ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
//                                         : 'bg-accent-500/10 text-accent-300 border-accent-500/20'
//                                     }`}>
//                                       {c.criteriaType === 'individual' ? '👤 Individual' : '🏢 Org'}
//                                     </span>
//                                     <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
//                                       c.stage === 'f2f'
//                                         ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
//                                         : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
//                                     }`}>
//                                       {c.stage === 'f2f' ? '🗣️ Viva (F2F)' : '📄 Screening (Initial)'}
//                                     </span>
//                                   </div>
//                                   <p className="text-slate-400 text-xs mt-1 leading-relaxed">{c.description}</p>
//                                 </div>
//                                 <div className="flex gap-2 shrink-0">
//                                   <button onClick={() => handleEditCriteria(c)} className="text-accent-400 text-xs hover:text-accent-300 font-medium">Edit</button>
//                                   <button onClick={() => handleDeleteCriteria(c._id)} className="text-red-400 text-xs hover:text-red-300 font-medium">Delete</button>
//                                 </div>
//                               </div>
//                               <div className="flex gap-4 pt-1 border-t border-white/5 text-[10px] text-slate-500 font-mono">
//                                 <span>Max score: <strong className="text-white">{c.maxScore}</strong></span>
//                                 <span>Weight: <strong className="text-white">{c.weight}%</strong></span>
//                                 <span>Order: <strong className="text-white">{c.order}</strong></span>
//                                 <span className={c.isActive ? 'text-emerald-400' : 'text-red-400'}>{c.isActive ? 'Active' : 'Inactive'}</span>
//                               </div>
//                             </div>
//                           ))}
//                           {criteria.length === 0 && (
//                             <p className="text-slate-500 text-xs text-center py-8">No criteria definitions found.</p>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* 5. BROADCAST TAB */}
//                 {activeTab === 'broadcast' && (
//                   <div className="space-y-6">
//                     <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
//                       <div>
//                         <p className="text-xs font-semibold uppercase tracking-wider text-accent-300">Communication Center</p>
//                         <h3 className="mt-1 font-display text-2xl font-black text-white">Send Broadcast Alert</h3>
//                         <p className="mt-1 max-w-2xl text-sm text-slate-400">Dispatch a targeted system notification to candidates, judges, every user, or a selected application status list.</p>
//                       </div>
//                       <div className="rounded-xl border border-accent-500/20 bg-accent-500/10 px-4 py-3">
//                         <div className="text-[10px] font-bold uppercase tracking-wider text-accent-300">Estimated Reach</div>
//                         <div className="mt-1 font-display text-2xl font-black text-white">{broadcastAudienceCount}</div>
//                       </div>
//                     </div>

//                     <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
//                       <form onSubmit={handleBroadcast(onBroadcastSubmit)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
//                         <div className="grid gap-4 sm:grid-cols-3">
//                           {[
//                             { value: 'all', label: 'All Users', count: users.length, helper: 'Full platform notice' },
//                             { value: 'candidate', label: 'Candidates', count: candidatesList.length, helper: 'Applicants only' },
//                             { value: 'judge', label: 'Judges', count: judgesList.length, helper: 'Evaluation panel' },
//                           ].map((audience) => (
//                             <label
//                               key={audience.value}
//                               className={`cursor-pointer rounded-xl border p-4 transition-all ${
//                                 broadcastRole === audience.value
//                                   ? 'border-accent-500 bg-accent-500/10 shadow-glow'
//                                   : 'border-white/10 bg-navy-950/30 hover:border-white/20 hover:bg-white/5'
//                               }`}
//                             >
//                               <input type="radio" value={audience.value} className="sr-only" {...regBroadcast('role')} />
//                               <div className="flex items-center justify-between gap-3">
//                                 <span className="text-sm font-bold text-white">{audience.label}</span>
//                                 <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-slate-300">{audience.count}</span>
//                               </div>
//                               <p className="mt-2 text-xs text-slate-500">{audience.helper}</p>
//                             </label>
//                           ))}
//                         </div>

//                         <div className="mt-5">
//                           <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Application Status List</label>
//                           <select
//                             className="input-field"
//                             value={broadcastStatusAudience?.value || ''}
//                             onChange={(event) => setBroadcastValue('role', event.target.value, { shouldDirty: true })}
//                           >
//                             <option value="" disabled>Select application status...</option>
//                             {BROADCAST_STATUS_AUDIENCES.map((audience) => (
//                               <option key={audience.value} value={audience.value}>
//                                 {audience.label} ({getStatusAudienceCount(audience.status)})
//                               </option>
//                             ))}
//                           </select>
//                           <p className="mt-2 text-xs text-slate-500">Use this dropdown to message candidates whose applications are currently in that stage.</p>
//                         </div>

//                         <div className="mt-6 space-y-4">
//                           <div>
//                             <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Alert Title</label>
//                             <input className="input-field" placeholder="e.g. Submissions Deadline Extended" {...regBroadcast('title', { required: true })} />
//                           </div>

//                           <div>
//                             <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Alert Message</label>
//                             <textarea className="input-field min-h-36 resize-none" placeholder="Enter notification message..." {...regBroadcast('message', { required: true })} />
//                             <div className="mt-2 flex justify-between text-[11px] text-slate-500">
//                               <span>Keep the message direct and action-oriented.</span>
//                               <span>{broadcastMessage.length} chars</span>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
//                           <p className="text-xs text-slate-500">This sends an in-app notification and email immediately.</p>
//                           <button type="submit" disabled={broadcastSubmitting} className="btn-primary min-w-[180px] disabled:cursor-not-allowed disabled:opacity-60">
//                             {broadcastSubmitting ? (
//                               <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Sending...</>
//                             ) : (
//                               <><RiMailSendLine /> Send Broadcast</>
//                             )}
//                           </button>
//                         </div>
//                       </form>

//                       <div className="space-y-5">
//                         <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
//                           <div className="flex items-center justify-between">
//                             <h4 className="text-sm font-bold text-white">Notification Preview</h4>
//                             <span className="rounded-full border border-gold-500/20 bg-gold-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-400">Live</span>
//                           </div>
//                           <div className="mt-4 rounded-2xl border border-white/10 bg-navy-950/60 p-4">
//                             <div className="flex items-start gap-3">
//                               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 text-accent-300">
//                                 <RiMailSendLine size={18} />
//                               </div>
//                               <div className="min-w-0">
//                                 <p className="truncate text-sm font-bold text-white">{broadcastTitle || 'Alert title preview'}</p>
//                                 <p className="mt-1 text-xs leading-5 text-slate-400">{broadcastMessage || 'Your broadcast message will appear here as users receive the notification.'}</p>
//                               </div>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
//                           <h4 className="text-sm font-bold text-white">Delivery Summary</h4>
//                           <div className="mt-4 space-y-3 text-sm">
//                             <div className="flex justify-between rounded-xl bg-navy-950/40 px-3 py-2">
//                               <span className="text-slate-400">Audience</span>
//                               <span className="font-semibold text-white">{broadcastAudienceLabel}</span>
//                             </div>
//                             <div className="flex justify-between rounded-xl bg-navy-950/40 px-3 py-2">
//                               <span className="text-slate-400">Recipients</span>
//                               <span className="font-semibold text-white">{broadcastAudienceCount}</span>
//                             </div>
//                             <div className="flex justify-between rounded-xl bg-navy-950/40 px-3 py-2">
//                               <span className="text-slate-400">Channel</span>
//                               <span className="font-semibold text-white">In-app alert + email</span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* 6. REPORTS TAB */}
//                 {activeTab === 'reports' && stats && (
//                   <div className="space-y-8">
//                     <div className="flex flex-col gap-3 border-b border-white/10 pb-4">
//                       <div className="flex justify-between items-center">
//                         <div>
//                           <h3 className="font-display font-bold text-white text-xl">Reports & Exports</h3>
//                           <p className="text-slate-400 text-xs mt-1">Aggregated statistics, export data, and publish finalists/winners.</p>
//                         </div>
//                         <div className="flex gap-2 flex-wrap">
//                           <button onClick={() => handleExportReport('csv')} className="btn-primary text-xs">Export Excel</button>
//                           <button onClick={() => handleExportReport('pdf')} className="btn-gold text-xs">Export PDF</button>
//                           <button onClick={() => window.print()} className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/10">Print</button>
//                         </div>
//                       </div>
//                       <div className="flex flex-wrap gap-2">
//                         <button onClick={handlePublishFinalists} disabled={reportActionBusy} className="btn-primary text-xs disabled:opacity-50">Publish Finalists</button>
//                         <button onClick={handlePublishWinners} disabled={reportActionBusy} className="btn-gold text-xs disabled:opacity-50">Publish Winners</button>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                       {/* Status Distribution Recharts Pie */}
//                       <div className="p-6 rounded-2xl bg-white/5 border border-white/5 h-80 flex flex-col items-center">
//                         <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 self-start">Workflow Status Share</h4>
//                         <ResponsiveContainer width="100%" height="80%">
//                           <PieChart>
//                             <Pie
//                               data={stats.statusBreakdown}
//                               dataKey="count"
//                               nameKey="status"
//                               cx="50%"
//                               cy="50%"
//                               outerRadius={80}
//                               label={({ status, count }) => `${status}: ${count}`}
//                             >
//                               {stats.statusBreakdown.map((entry, index) => (
//                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                               ))}
//                             </Pie>
//                           </PieChart>
//                         </ResponsiveContainer>
//                       </div>

//                       {/* Top Scored leader board */}
//                       <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
//                         <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Submission Leaderboard</h4>
//                         <div className="space-y-3">
//                           {applications.slice(0, 5).sort((a,b)=>b.averageScore - a.averageScore).map((app, idx) => (
//                             <div key={app._id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0 text-slate-300">
//                               <div className="flex items-center gap-2">
//                                 <input type="checkbox" checked={selectedReportIds.includes(app._id)} onChange={() => toggleReportSelection(app._id)} className="rounded border-white/10 bg-transparent" />
//                                 <span>
//                                   <span className="font-bold text-white mr-1">#{idx+1}</span>
//                                   {app.projectTitle}
//                                 </span>
//                               </div>
//                               <span className="font-bold text-accent-400">{app.averageScore?.toFixed(1) || '-'}</span>
//                             </div>
//                           ))}
//                         </div>
//                         <div className="mt-4 text-[11px] text-slate-400">Selected: {selectedReportIds.length}</div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* 7. MY PROFILE */}
//                 {activeTab === 'profile' && (
//                   <div className="space-y-6">
//                     <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
//                       <div>
//                         <p className="text-xs font-semibold uppercase tracking-wider text-accent-300">Admin Profile</p>
//                         <h3 className="mt-1 font-display text-2xl font-black text-white">My Profile</h3>
//                         <p className="mt-1 max-w-2xl text-sm text-slate-400">Manage your administrator identity and profile picture.</p>
//                       </div>
//                       <div className="rounded-xl border border-accent-500/20 bg-accent-500/10 px-4 py-3">
//                         <div className="text-[10px] font-bold uppercase tracking-wider text-accent-300">Signed In As</div>
//                         <div className="mt-1 max-w-[220px] truncate text-sm font-semibold text-white">{user?.email || user?.fullName || 'Administrator'}</div>
//                       </div>
//                     </div>

//                     <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:flex-row sm:items-center">
//                       <div className="relative shrink-0">
//                         {user?.profileImage ? (
//                           <img
//                             src={buildAssetUrl(user.profileImage)}
//                             alt={user.fullName || user.email}
//                             className="h-24 w-24 rounded-full border border-white/10 object-cover shadow-glow"
//                           />
//                         ) : (
//                           <div className="flex h-24 w-24 items-center justify-center rounded-full border border-accent-500/30 bg-accent-500/15 font-display text-3xl font-bold text-accent-300">
//                             {user?.firstName?.charAt(0) || 'A'}
//                           </div>
//                         )}
//                         {imageUploading && (
//                           <div className="absolute inset-0 flex items-center justify-center rounded-full bg-navy-950/70">
//                             <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
//                           </div>
//                         )}
//                       </div>
//                       <div className="text-center sm:text-left">
//                         <h4 className="text-sm font-bold text-white">Profile Picture</h4>
//                         <p className="mt-1 text-xs text-slate-500">Supports JPEG, PNG or WebP. Max 5MB.</p>
//                         <label className="btn-ghost mt-3 inline-flex cursor-pointer items-center gap-2 text-xs !px-3 !py-2">
//                           <RiUserLine className="text-sm" />
//                           Choose Photo
//                           <input
//                             type="file"
//                             accept="image/*"
//                             className="hidden"
//                             onChange={handleImageUpload}
//                             disabled={imageUploading}
//                           />
//                         </label>
//                       </div>
//                     </div>

//                     <form onSubmit={handleProfileSubmit} className="space-y-5">
//                       <div className="grid gap-5 sm:grid-cols-2">
//                         <div>
//                           <span className="mb-1.5 block text-xs font-medium text-slate-500">Email Address</span>
//                           <p className="rounded-xl border border-white/5 bg-white/5 p-3 text-sm font-medium text-white">
//                             {user?.email}
//                           </p>
//                         </div>
//                         <div>
//                           <span className="mb-1.5 block text-xs font-medium text-slate-500">Role</span>
//                           <p className="rounded-xl border border-white/5 bg-white/5 p-3 text-sm font-medium text-white">
//                             {user?.role}
//                           </p>
//                         </div>
//                         {[
//                           { label: 'First Name', field: 'firstName', required: true },
//                           { label: 'Last Name', field: 'lastName', required: true },
//                           { label: 'Phone Number', field: 'phone' },
//                           { label: 'Organisation', field: 'organization' },
//                           { label: 'Designation', field: 'designation' },
//                         ].map((field) => (
//                           <div key={field.field}>
//                             <label className="mb-1.5 block text-xs font-medium text-slate-500">{field.label}</label>
//                             <input
//                               className="input-field"
//                               value={profileForm[field.field]}
//                               onChange={(e) => handleProfileFormChange(field.field, e.target.value)}
//                               required={field.required}
//                             />
//                           </div>
//                         ))}
//                       </div>
//                       <button type="submit" disabled={profileSaving} className="btn-primary text-xs disabled:cursor-not-allowed disabled:opacity-60">
//                         {profileSaving ? 'Saving...' : 'Save Profile'}
//                       </button>
//                     </form>
//                   </div>
//                 )}

//                 {/* 7. CHANGE PASSWORD */}
//                 {activeTab === 'password' && (
//                   <div className="space-y-6">
//                     <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
//                       <div>
//                         <p className="text-xs font-semibold uppercase tracking-wider text-accent-300">Account Security</p>
//                         <h3 className="mt-1 font-display text-2xl font-black text-white">Change Password</h3>
//                         <p className="mt-1 max-w-2xl text-sm text-slate-400">Update your administrator credentials and keep portal access protected.</p>
//                       </div>
//                       <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
//                         <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Signed In As</div>
//                         <div className="mt-1 max-w-[220px] truncate text-sm font-semibold text-white">{user?.email || user?.fullName || 'Administrator'}</div>
//                       </div>
//                     </div>

//                     <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
//                       <form onSubmit={handlePassword(onChangePasswordSubmit)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
//                         {(changeError || changeSuccess) && (
//                           <div className={`mb-5 rounded-xl border p-4 text-sm ${
//                             changeError
//                               ? 'border-red-500/30 bg-red-500/10 text-red-400'
//                               : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
//                           }`}>
//                             {changeError || changeSuccess}
//                           </div>
//                         )}

//                         <div className="space-y-4">
//                           <div>
//                             <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Current Password</label>
//                             <input
//                               id="admin-oldpassword"
//                               type="password"
//                               className="input-field"
//                               placeholder="Enter current password"
//                               {...regPassword('oldPassword', { required: 'Current password is required' })}
//                             />
//                             {passErrors.oldPassword && <p className="mt-1 text-xs text-red-400">{passErrors.oldPassword.message}</p>}
//                           </div>

//                           <div>
//                             <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">New Password</label>
//                             <input
//                               id="admin-newpassword"
//                               type="password"
//                               className="input-field"
//                               placeholder="At least 8 characters"
//                               {...regPassword('newPassword', {
//                                 required: 'New password is required',
//                                 minLength: { value: 8, message: 'Password must be at least 8 characters' },
//                               })}
//                             />
//                             {passErrors.newPassword && <p className="mt-1 text-xs text-red-400">{passErrors.newPassword.message}</p>}
//                           </div>

//                           <div>
//                             <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Confirm New Password</label>
//                             <input
//                               id="admin-confirm"
//                               type="password"
//                               className="input-field"
//                               placeholder="Re-enter new password"
//                               {...regPassword('confirmPassword', {
//                                 validate: (v) => v === newPassword || 'Passwords do not match',
//                               })}
//                             />
//                             {passErrors.confirmPassword && <p className="mt-1 text-xs text-red-400">{passErrors.confirmPassword.message}</p>}
//                           </div>
//                         </div>

//                         <div className="mt-6 border-t border-white/10 pt-5">
//                           <button
//                             id="admin-change-submit"
//                             type="submit"
//                             disabled={passSubmitting}
//                             className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
//                           >
//                             {passSubmitting ? (
//                               <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Updating...</>
//                             ) : (
//                               <>Update Password <RiCheckDoubleLine /></>
//                             )}
//                           </button>
//                         </div>
//                       </form>

//                       <div className="space-y-5">
//                         <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
//                           <div className="flex items-center gap-3">
//                             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/15 text-accent-300">
//                               <RiLockPasswordLine size={20} />
//                             </div>
//                             <div>
//                               <h4 className="text-sm font-bold text-white">Password Strength</h4>
//                               <p className="text-xs text-slate-500">{passwordStrength} of {passwordRules.length} checks passed</p>
//                             </div>
//                           </div>

//                           <div className="mt-4 grid grid-cols-4 gap-2">
//                             {passwordRules.map((rule, index) => (
//                               <div key={rule.label} className={`h-2 rounded-full ${index < passwordStrength ? 'bg-emerald-400' : 'bg-white/10'}`} />
//                             ))}
//                           </div>

//                           <div className="mt-4 space-y-3">
//                             {passwordRules.map((rule) => (
//                               <div key={rule.label} className="flex items-center gap-2 text-sm">
//                                 <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
//                                   rule.passed
//                                     ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
//                                     : 'border-white/10 bg-white/5 text-slate-500'
//                                 }`}>
//                                   {rule.passed ? '✓' : ''}
//                                 </span>
//                                 <span className={rule.passed ? 'text-slate-200' : 'text-slate-500'}>{rule.label}</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>

//                         <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
//                           <h4 className="text-sm font-bold text-white">Security Notes</h4>
//                           <div className="mt-4 space-y-3 text-sm text-slate-400">
//                             <div className="rounded-xl bg-navy-950/40 px-3 py-3">Use a password that is unique to this admin portal.</div>
//                             <div className="rounded-xl bg-navy-950/40 px-3 py-3">Avoid sharing credentials with other administrators.</div>
//                             <div className="rounded-xl bg-navy-950/40 px-3 py-3">After updating, use the new password on your next sign-in.</div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </motion.div>
//         </div>
//       </div>

//       {/* JUDGES PANEL ASSIGNMENT MODAL */}
//       {assignModalOpen && selectedApp && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
//           <div className="relative max-w-md w-full p-6 bg-surface-200 rounded-[24px] shadow-2xl border border-white/10">
//             <h3 className="font-display font-bold text-white text-lg mb-2">Assign Evaluators</h3>
//             <p className="text-slate-400 text-xs mb-4">Select judges to assign to <strong>{selectedApp.projectTitle}</strong>.</p>

//             <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
//               {judgesList.map(judge => {
//                 const isSelected = selectedJudges.includes(judge._id);
//                 return (
//                   <div
//                     key={judge._id}
//                     onClick={() => toggleJudgeSelection(judge._id)}
//                     className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
//                       isSelected ? 'bg-accent-500/10 border-accent-500' : 'bg-white/5 border-white/5 hover:bg-white/10'
//                     }`}
//                   >
//                     <div className={`w-4 h-4 rounded border flex items-center justify-center ${
//                       isSelected ? 'border-accent-500 bg-accent-500 text-white' : 'border-slate-500'
//                     }`}>
//                       {isSelected && <RiCheckLine size={12} />}
//                     </div>
//                     <div>
//                       <div className="text-white text-xs font-semibold">{judge.firstName} {judge.lastName}</div>
//                       <div className="text-slate-400 text-[10px]">{judge.organization}</div>
//                     </div>
//                   </div>
//                 );
//               })}
//               {judgesList.length === 0 && (
//                 <p className="text-slate-500 text-xs text-center py-4">No judges registered in directory.</p>
//               )}
//             </div>

//             <div className="flex justify-end gap-3">
//               <button onClick={() => setAssignModalOpen(false)} className="btn-ghost text-xs !py-2 !px-4">Cancel</button>
//               <button onClick={handleAssignSubmit} className="btn-primary text-xs !py-2 !px-4">Save Panel</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* DETAILED JUDGE EVALUATIONS MODAL */}
//       {evaluationsModalOpen && evaluationsApp && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
//           <div className="relative max-w-4xl w-full p-8 bg-surface-200 rounded-[32px] shadow-2xl border border-white/10 max-h-[85vh] overflow-y-auto z-10">
//             <button
//               onClick={() => {
//                 setEvaluationsModalOpen(false);
//                 setSelectedJudgeEval(null);
//               }}
//               className="absolute right-6 top-6 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
//             >
//               ✕
//             </button>

//             {selectedJudgeEval ? (
//               // Sub-view: Individual Judge Scorecard
//               <div className="space-y-6 animate-fadeIn">
//                 <button
//                   type="button"
//                   onClick={() => setSelectedJudgeEval(null)}
//                   className="flex items-center gap-2 text-xs font-bold text-accent-400 hover:text-accent-300 hover:underline mb-2"
//                 >
//                   ← Back to Evaluation Summary
//                 </button>

//                 <div className="border-b border-white/10 pb-4">
//                   <span className="text-[10px] font-mono uppercase tracking-wider text-accent-400">Individual Evaluator Sheet</span>
//                   <h3 className="font-display font-extrabold text-white text-xl mt-1">{selectedJudgeEval.judge?.firstName} {selectedJudgeEval.judge?.lastName}</h3>
//                   <p className="text-slate-400 text-xs mt-0.5">{selectedJudgeEval.judge?.email} | {selectedJudgeEval.judge?.organization || 'Independent Evaluator'}</p>
//                 </div>

//                 <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-6">
//                   {/* Score & Status */}
//                   <div className="flex justify-between items-center border-b border-white/5 pb-4">
//                     <div>
//                       <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Submitted At</span>
//                       <strong className="text-white text-xs font-mono">{selectedJudgeEval.submittedAt ? new Date(selectedJudgeEval.submittedAt).toLocaleString() : 'Draft Mode'}</strong>
//                     </div>
//                     <div className="text-right">
//                       <span className="inline-block px-3.5 py-1.5 rounded-xl bg-accent-500/10 border border-accent-500/25 font-mono text-lg font-black text-accent-400">
//                         Score: {selectedJudgeEval.totalScore || 0}/100
//                       </span>
//                     </div>
//                   </div>

//                   {/* Strengths & Weaknesses */}
//                   <div className="grid md:grid-cols-2 gap-4 text-xs">
//                     <div className="space-y-1">
//                       <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Strengths Identified</span>
//                       <p className="text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5 whitespace-pre-line">
//                         {selectedJudgeEval.strengths || 'None specified'}
//                       </p>
//                     </div>
//                     <div className="space-y-1">
//                       <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Weaknesses / Areas of Improvement</span>
//                       <p className="text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5 whitespace-pre-line">
//                         {selectedJudgeEval.weaknesses || 'None specified'}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Overall Comments */}
//                   <div className="text-xs space-y-1">
//                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overall Comments</span>
//                     <p className="text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5 whitespace-pre-line">
//                       {selectedJudgeEval.overallComments || 'No overall comments provided.'}
//                     </p>
//                   </div>

//                   {/* Criteria Scores breakdown */}
//                   <div className="space-y-2.5 pt-3">
//                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Criteria Breakdown</span>
//                     <div className="grid sm:grid-cols-2 gap-3">
//                       {selectedJudgeEval.scores?.map((s) => {
//                         const crit = s.criteria;
//                         return (
//                           <div key={s._id || (crit && crit._id)} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-xs">
//                             <div className="min-w-0 pr-2">
//                               <p className="text-white font-semibold truncate">{crit?.name || 'Criterion score'}</p>
//                               {s.comment && <p className="text-[10px] text-slate-400 mt-1 italic leading-relaxed truncate" title={s.comment}>"{s.comment}"</p>}
//                             </div>
//                             <span className="font-mono font-bold text-accent-300 shrink-0 bg-white/5 px-2 py-0.5 rounded border border-white/5">
//                               {s.score} / {crit?.weight || 10}
//                             </span>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ) : (() => {
//               const completedReviewsCount = evaluationsList.filter(e => e.isSubmitted && (e.stage || 'initial') === trackerStage).length;
//               const totalAssignedJudges = evaluationsApp.assignedJudges?.length || 0;
//               const activeEvals = evaluationsList.filter(e => e.isSubmitted && (e.stage || 'initial') === trackerStage);
//               const calculatedAverage = activeEvals.length > 0
//                 ? activeEvals.reduce((s, e) => s + (e.totalScore || 0), 0) / activeEvals.length
//                 : null;

//               return (
//                 // Sub-view: Evaluation Summary & Judge List
//                 <div className="space-y-6 animate-fadeIn">
//                   <div className="border-b border-white/10 pb-4">
//                     <span className="text-[10px] font-mono uppercase tracking-wider text-accent-400">Scorecard Tracker & Summary</span>
//                     <h3 className="font-display font-extrabold text-white text-2xl mt-1">{evaluationsApp.projectTitle}</h3>
//                     <p className="text-slate-400 text-xs mt-1">Submitted by: <strong className="text-white">{evaluationsApp.candidate?.firstName} {evaluationsApp.candidate?.lastName}</strong> ({evaluationsApp.candidate?.organization || 'Individual'})</p>
//                   </div>

//                   {evalsLoading ? (
//                     <div className="flex flex-col items-center justify-center py-16 gap-3">
//                       <div className="w-10 h-10 border-3 border-accent-500 border-t-transparent rounded-full animate-spin" />
//                       <span className="text-xs text-slate-400">Loading scorecard summary...</span>
//                     </div>
//                   ) : (
//                     <div className="space-y-6">
//                       {/* Evaluation Summary Card */}
//                       <div className="p-5 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
//                         <div className="p-3 rounded-xl bg-white/[0.02]">
//                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Evaluation Stage</span>
//                           <strong className="block text-white text-sm mt-1 capitalize">{trackerStage === 'f2f' ? 'Face-to-Face' : 'Initial'}</strong>
//                         </div>
//                         <div className="p-3 rounded-xl bg-white/[0.02]">
//                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Average Score</span>
//                           <strong className="block text-accent-400 text-sm font-mono mt-1">
//                             {calculatedAverage !== null ? calculatedAverage.toFixed(2) : 'Pending'}
//                           </strong>
//                         </div>
//                         <div className="p-3 rounded-xl bg-white/[0.02]">
//                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Completed Reviews</span>
//                           <strong className="block text-emerald-400 text-sm font-mono mt-1">
//                             {completedReviewsCount} / {totalAssignedJudges}
//                           </strong>
//                         </div>
//                         <div className="p-3 rounded-xl bg-white/[0.02]">
//                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Assigned Judges</span>
//                           <strong className="block text-white text-sm font-mono mt-1">
//                             {totalAssignedJudges}
//                           </strong>
//                         </div>
//                       </div>

//                       {/* Assigned Judges List */}
//                       <div className="space-y-3">
//                         <h4 className="text-white font-bold text-sm tracking-wide">Evaluator Status & Scorecards</h4>
//                         <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
//                           {evaluationsApp.assignedJudges?.map((judge, idx) => {
//                             // Find corresponding submitted evaluation in evaluationsList matching the current stage
//                             const judgeEval = evaluationsList.find(e =>
//                               e.judge?._id?.toString() === judge._id.toString() &&
//                               (e.stage || 'initial') === trackerStage
//                             );
//                             const isSubmitted = judgeEval ? judgeEval.isSubmitted : false;

//                             return (
//                               <div
//                                 key={judge._id}
//                                 className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex justify-between items-center gap-4 flex-wrap"
//                               >
//                                 <div>
//                                   <h5 className="text-white text-xs font-bold">Judge {idx + 1}: {judge.firstName} {judge.lastName}</h5>
//                                   <p className="text-[10px] text-slate-400 mt-0.5">{judge.organization || 'Independent'} — {judge.designation || 'Specialist'}</p>
//                                 </div>

//                                 <div className="flex items-center gap-5">
//                                   <div className="text-right">
//                                     <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Evaluation State</div>
//                                     <span className={`text-[10px] font-bold ${
//                                       isSubmitted ? 'text-emerald-400' : judgeEval ? 'text-amber-400' : 'text-slate-500'
//                                     }`}>
//                                       {isSubmitted ? 'Completed' : judgeEval ? 'Draft Mode' : 'Not Started'}
//                                     </span>
//                                   </div>

//                                   <div className="text-right font-mono min-w-[70px]">
//                                     <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Total Score</div>
//                                     <span className="text-xs text-white font-bold">
//                                       {isSubmitted && judgeEval ? `${judgeEval.totalScore}/100` : '—'}
//                                     </span>
//                                   </div>

//                                   <div>
//                                     {isSubmitted && judgeEval ? (
//                                       <button
//                                         type="button"
//                                         onClick={() => setSelectedJudgeEval(judgeEval)}
//                                         className="btn-primary text-[10px] !py-1 !px-3 font-semibold"
//                                       >
//                                         View Individual Scorecard
//                                       </button>
//                                     ) : (
//                                       <span className="text-[10px] text-slate-500 italic bg-white/5 px-2 py-1 rounded">
//                                         Not Available
//                                       </span>
//                                     )}
//                                   </div>
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         {(!evaluationsApp.assignedJudges || evaluationsApp.assignedJudges.length === 0) && (
//                           <div className="p-8 text-center bg-white/5 border border-dashed border-white/10 rounded-xl">
//                             <p className="text-xs text-slate-500">No judges assigned to this application panel yet.</p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                   )}
//                 </div>
//               );
//             })()}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Check indicator icon proxy
// const RiCheckLine = ({ size }) => (
//   <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height={size} width={size} xmlns="http://www.w3.org/2000/svg">
//     <path fill="none" d="M0 0h24v24H0z"></path>
//     <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path>
//   </svg>
// );

// export default AdminDashboard;
