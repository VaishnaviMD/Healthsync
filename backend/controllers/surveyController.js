const User = require('../models/User');
const HealthSurvey = require('../models/HealthSurvey');
const { generateHealthReport } = require('../services/healthReportService');

exports.submitSurvey = async (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body;

    const surveyData = {
      user: userId,
      age: body.age,
      gender: body.gender,
      height: body.height,
      weight: body.weight,
      activityLevel: body.activityLevel,
      exerciseFrequency: body.exerciseFrequency,
      sleepHours: body.sleepHours,
      stressLevel: body.stressLevel,
      dietType: body.dietType,
      waterIntake: body.waterIntake,
      mealsPerDay: body.mealsPerDay,
      medicalConditions: Array.isArray(body.medicalConditions) ? body.medicalConditions : (body.medicalConditions ? [body.medicalConditions] : []),
      allergies: Array.isArray(body.allergies) ? body.allergies : (body.allergies ? [body.allergies] : []),
      medications: Array.isArray(body.medications) ? body.medications : (body.medications ? [body.medications] : []),
      bloodPressure: !!body.bloodPressure,
      diabetes: !!body.diabetes,
      menstrualCycleLength: body.menstrualCycleLength,
      periodDuration: body.periodDuration,
      lastPeriodDate: body.lastPeriodDate,
      pregnancyStatus: body.pregnancyStatus,
      fitnessGoal: body.fitnessGoal || body.healthGoal,
    };

    await HealthSurvey.create(surveyData);

    const userUpdate = {
      age: body.age,
      gender: body.gender,
      height: body.height,
      weight: body.weight,
      activityLevel: body.activityLevel,
      sleepHours: body.sleepHours,
      stressLevel: body.stressLevel,
      dietType: body.dietType,
      hydration: body.waterIntake,
      medicalConditions: surveyData.medicalConditions,
      allergies: surveyData.allergies,
      medications: surveyData.medications,
      healthGoal: body.fitnessGoal || body.healthGoal || 'general_health',
      surveyCompleted: true,
    };

    await User.findByIdAndUpdate(userId, userUpdate);

    const report = await generateHealthReport(userId);

    res.status(201).json({ message: 'Survey submitted', report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSurveyStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('surveyCompleted');
    res.json({ surveyCompleted: user?.surveyCompleted || false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
