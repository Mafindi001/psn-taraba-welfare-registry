// controllers/adminController.js
// Admin operations controller

const Member = require('../models/Member');
const SpecialDate = require('../models/SpecialDate');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

/**
 * Calculate days until event (recurring aware)
 */
function calculateDaysUntil(eventDate, isRecurring) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const event = new Date(eventDate);
  event.setHours(0, 0, 0, 0);
  
  if (isRecurring) {
    event.setFullYear(today.getFullYear());
    if (event < today) {
      event.setFullYear(today.getFullYear() + 1);
    }
  }
  
  const diffTime = event - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // Count total members
    const totalMembers = await Member.countDocuments();
    
    // Count active members
    const activeMembers = await Member.countDocuments({ isActive: true });
    
    // Get all special dates
    const allSpecialDates = await SpecialDate.find({ isActive: true });
    
    // Calculate upcoming events (next 30 days)
    const upcomingEvents = allSpecialDates.filter(date => {
      const days = calculateDaysUntil(date.eventDate, date.isRecurring);
      return days >= 0 && days <= 30;
    }).length;
    
    // Calculate today's events
    const todayEvents = allSpecialDates.filter(date => {
      const days = calculateDaysUntil(date.eventDate, date.isRecurring);
      return days === 0;
    }).length;
    
    // Get new members this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newMembersThisMonth = await Member.countDocuments({
      registrationDate: { $gte: startOfMonth }
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        upcomingEvents,
        todayEvents,
        newMembersThisMonth
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    next(error);
  }
};

/**
 * @route   GET /api/admin/members
 * @desc    Get all members
 * @access  Private (Admin)
 */
const getAllMembers = async (req, res, next) => {
  try {
    const { search, localGovernment, status, page = 1, limit = 10 } = req.query;
    
    // Build filter query
    const filter = {};
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { psnMembershipNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (localGovernment) {
      filter.localGovernment = localGovernment;
    }
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get members
    const members = await Member.find(filter)
      .select('-password')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Member.countDocuments(filter);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: members.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: { members }
    });
  } catch (error) {
    console.error('Get all members error:', error);
    next(error);
  }
};

/**
 * @route   GET /api/admin/members/:memberId
 * @desc    Get member by ID
 * @access  Private (Admin)
 */
const getMemberById = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    
    const member = await Member.findById(memberId)
      .select('-password')
      .populate('specialDates');
    
    if (!member) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { member }
    });
  } catch (error) {
    console.error('Get member by ID error:', error);
    next(error);
  }
};

/**
 * @route   GET /api/admin/celebrations
 * @desc    Get upcoming celebrations
 * @access  Private (Admin)
 */
const getUpcomingCelebrations = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    
    // Get all active special dates with member info
    const specialDates = await SpecialDate.find({ isActive: true })
      .populate('member', 'fullName email phoneNumber psnMembershipNumber')
      .sort({ eventDate: 1 });
    
    // Filter and enhance with days until calculation
    const upcomingCelebrations = specialDates
      .map(date => {
        const daysUntil = calculateDaysUntil(date.eventDate, date.isRecurring);
        return {
          ...date.toObject(),
          daysUntil
        };
      })
      .filter(date => date.daysUntil >= 0 && date.daysUntil <= parseInt(days))
      .sort((a, b) => a.daysUntil - b.daysUntil);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: upcomingCelebrations.length,
      data: { celebrations: upcomingCelebrations }
    });
  } catch (error) {
    console.error('Get upcoming celebrations error:', error);
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllMembers,
  getMemberById,
  getUpcomingCelebrations
};