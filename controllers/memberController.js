// controllers/memberController.js
// Member operations controller

const Member = require('../models/Member');
const SpecialDate = require('../models/SpecialDate');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

/**
 * @route   GET /api/members/profile
 * @desc    Get current member profile
 * @access  Private (Member)
 */
const getProfile = async (req, res, next) => {
  try {
    const member = await Member.findById(req.userId)
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
    console.error('Get profile error:', error);
    next(error);
  }
};

/**
 * @route   PUT /api/members/profile
 * @desc    Update member profile
 * @access  Private (Member)
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'phoneNumber',
      'placeOfWork',
      'residentialAddress',
      'localGovernment',
      'nextOfKin'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    updates.profileUpdatedAt = Date.now();

    const member = await Member.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!member) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.UPDATE_SUCCESS,
      data: { member }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
};

/**
 * @route   GET /api/members/special-dates
 * @desc    Get all special dates for current member
 * @access  Private (Member)
 */
const getSpecialDates = async (req, res, next) => {
  try {
    const specialDates = await SpecialDate.find({
      member: req.userId,
      isActive: true
    }).sort({ eventDate: 1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: specialDates.length,
      data: { specialDates }
    });
  } catch (error) {
    console.error('Get special dates error:', error);
    next(error);
  }
};

/**
 * @route   POST /api/members/special-dates
 * @desc    Add new special date
 * @access  Private (Member)
 */
const addSpecialDate = async (req, res, next) => {
  try {
    const {
      eventLabel,
      customLabel,
      eventDate,
      isRecurring,
      recurringPattern,
      sendReminder,
      reminderRecipients,
      reminderHoursBefore,
      notes
    } = req.body;

    // Create special date
    const specialDate = await SpecialDate.create({
      member: req.userId,
      eventLabel,
      customLabel: eventLabel === 'Other Celebration' ? customLabel : undefined,
      eventDate,
      isRecurring: isRecurring !== undefined ? isRecurring : true,
      recurringPattern: isRecurring ? 'Annually' : 'One-time',
      sendReminder: sendReminder !== undefined ? sendReminder : true,
      reminderRecipients: reminderRecipients || ['Member', 'Welfare Officers'],
      reminderHoursBefore: reminderHoursBefore || 24,
      notes,
      createdBy: req.userId,
      createdByModel: 'Member'
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Special date added successfully',
      data: { specialDate }
    });
  } catch (error) {
    console.error('Add special date error:', error);
    next(error);
  }
};

/**
 * @route   PUT /api/members/special-dates/:dateId
 * @desc    Update special date
 * @access  Private (Member)
 */
const updateSpecialDate = async (req, res, next) => {
  try {
    const { dateId } = req.params;

    // Find special date and verify ownership
    const specialDate = await SpecialDate.findOne({
      _id: dateId,
      member: req.userId
    });

    if (!specialDate) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Special date not found'
      });
    }

    const allowedUpdates = [
      'eventLabel',
      'customLabel',
      'eventDate',
      'isRecurring',
      'sendReminder',
      'reminderRecipients',
      'reminderHoursBefore',
      'notes'
    ];

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        specialDate[key] = req.body[key];
      }
    });

    await specialDate.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.UPDATE_SUCCESS,
      data: { specialDate }
    });
  } catch (error) {
    console.error('Update special date error:', error);
    next(error);
  }
};

/**
 * @route   DELETE /api/members/special-dates/:dateId
 * @desc    Delete special date
 * @access  Private (Member)
 */
const deleteSpecialDate = async (req, res, next) => {
  try {
    const { dateId } = req.params;

    // Find special date and verify ownership
    const specialDate = await SpecialDate.findOne({
      _id: dateId,
      member: req.userId
    });

    if (!specialDate) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Special date not found'
      });
    }

    // Soft delete - mark as inactive
    specialDate.isActive = false;
    await specialDate.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.DELETE_SUCCESS
    });
  } catch (error) {
    console.error('Delete special date error:', error);
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getSpecialDates,
  addSpecialDate,
  updateSpecialDate,
  deleteSpecialDate
};
// Send test email reminder
exports.sendTestReminder = async (req, res) => {
  try {
    const member = await Member.findById(req.userId);
    
    const htmlContent = `
      <h1>🎉 Test Email Reminder</h1>
      <p>Hello ${member.firstName},</p>
      <p>This is a test email to confirm your PSN Welfare reminder system is working correctly.</p>
      <p>You will receive similar emails 24 hours before any special dates you've added.</p>
      <br>
      <p>Best regards,<br>PSN Taraba State Welfare System</p>
    `;
    
    const result = await require('../config/email').sendEmail(
      member.email,
      'Test: PSN Welfare Reminder System',
      htmlContent
    );
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
};