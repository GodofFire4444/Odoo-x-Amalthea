const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const Company = require('../models/Company');
const User = require('../models/User');
const ApprovalRule = require('../models/ApprovalRule');
const Expense = require('../models/Expense');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const DEMO = {
  company: {
    name: 'Amalthea Travel',
    country: 'Singapore',
    currency: 'USD'
  },
  users: [
    { key: 'admin', username: 'demo.admin', email: 'admin@amalthea.demo', password: 'Demo123!', role: 'admin' },
    { key: 'manager1', username: 'maya.roy', email: 'maya.roy@amalthea.demo', password: 'Demo123!', role: 'manager' },
    { key: 'manager2', username: 'samir.kaul', email: 'samir.kaul@amalthea.demo', password: 'Demo123!', role: 'manager' },
    { key: 'employee1', username: 'ava.chen', email: 'ava.chen@amalthea.demo', password: 'Demo123!', role: 'employee' },
    { key: 'employee2', username: 'noah.patel', email: 'noah.patel@amalthea.demo', password: 'Demo123!', role: 'employee' },
    { key: 'employee3', username: 'leo.garcia', email: 'leo.garcia@amalthea.demo', password: 'Demo123!', role: 'employee' },
    { key: 'employee4', username: 'mia.fernandez', email: 'mia.fernandez@amalthea.demo', password: 'Demo123!', role: 'employee' },
    { key: 'employee5', username: 'jules.park', email: 'jules.park@amalthea.demo', password: 'Demo123!', role: 'employee' }
  ],
  rules: [
    {
      key: 'travelPolicy',
      name: 'Travel Policy',
      type: 'sequential',
      amountThreshold: { min: 250, max: 1199.99 },
      approvers: ['manager2', 'admin'],
      percentageRequired: null,
      specificApprovers: []
    },
    {
      key: 'executiveTravel',
      name: 'Executive Travel',
      type: 'specific_approver',
      amountThreshold: { min: 1200 },
      approvers: [],
      percentageRequired: null,
      specificApprovers: ['admin']
    },
    {
      key: 'sharedOversight',
      name: 'Shared Oversight',
      type: 'hybrid',
      amountThreshold: { min: 100, max: 249.99 },
      approvers: ['manager2'],
      percentageRequired: 50,
      specificApprovers: ['admin']
    }
  ],
  expenses: [
    {
      employee: 'employee4',
      amount: 42.18,
      currency: 'USD',
      category: 'Office Supplies',
      description: 'Ergonomic keyboard and mouse for quarterly setup',
      date: '2026-05-03',
      merchant: 'Staples',
      status: 'approved',
      approvalRule: null,
      currentApproverStep: 0,
      approvalHistory: [],
      convertedAmount: 42.18
    },
    {
      employee: 'employee1',
      amount: 86.4,
      currency: 'USD',
      category: 'Meals',
      description: 'Client dinner during product discovery visit',
      date: '2026-05-06',
      merchant: 'Luna Bistro',
      status: 'pending',
      approvalRule: null,
      currentApproverStep: 0,
      approvalHistory: [],
      convertedAmount: 86.4
    },
    {
      employee: 'employee1',
      amount: 178.25,
      currency: 'USD',
      category: 'Entertainment',
      description: 'Team offsite activity rejected due to missing pre-approval',
      date: '2026-05-04',
      merchant: 'Skyline Bowling',
      status: 'rejected',
      approvalRule: 'sharedOversight',
      currentApproverStep: 0,
      approvalHistory: [
        { step: 0, stage: 'manager', action: 'rejected', comment: 'Please submit before booking entertainment expenses.', approver: 'manager1', date: '2026-05-04T10:45:00.000Z' }
      ],
      convertedAmount: 178.25
    },
    {
      employee: 'employee2',
      amount: 318.9,
      currency: 'USD',
      category: 'Travel',
      description: 'Intercity train and taxi for partner onboarding',
      date: '2026-05-07',
      merchant: 'Rail + Ride',
      status: 'pending',
      approvalRule: 'travelPolicy',
      currentApproverStep: 1,
      approvalHistory: [
        { step: 0, stage: 'manager', action: 'approved', comment: 'Looks valid. Moving to finance.', approver: 'manager1', date: '2026-05-07T09:30:00.000Z' }
      ],
      convertedAmount: 318.9
    },
    {
      employee: 'employee3',
      amount: 742.5,
      currency: 'EUR',
      category: 'Accommodation',
      description: 'Hotel stay for multi-city client workshop',
      date: '2026-05-02',
      merchant: 'Hotel Aurelia',
      status: 'approved',
      approvalRule: 'travelPolicy',
      currentApproverStep: 3,
      approvalHistory: [
        { step: 0, stage: 'manager', action: 'approved', comment: 'Budget and trip rationale are clear.', approver: 'manager1', date: '2026-05-02T09:15:00.000Z' },
        { step: 1, stage: 'sequential', action: 'approved', comment: 'Approved after checking the workshop itinerary.', approver: 'manager2', date: '2026-05-02T11:00:00.000Z' },
        { step: 2, stage: 'sequential', action: 'approved', comment: 'Final approval granted for demo purposes.', approver: 'admin', date: '2026-05-02T13:40:00.000Z' }
      ],
      convertedAmount: 803.88
    },
    {
      employee: 'employee5',
      amount: 1365,
      currency: 'USD',
      category: 'Travel',
      description: 'Executive flight for investor day and board review',
      date: '2026-05-08',
      merchant: 'Apex Airways',
      status: 'approved',
      approvalRule: 'executiveTravel',
      currentApproverStep: 2,
      approvalHistory: [
        { step: 0, stage: 'manager', action: 'approved', comment: 'Necessary for investor day logistics.', approver: 'manager1', date: '2026-05-08T08:00:00.000Z' },
        { step: 1, stage: 'parallel', action: 'approved', comment: 'Approved by finance for the demo chain.', approver: 'admin', date: '2026-05-08T10:25:00.000Z' }
      ],
      convertedAmount: 1365
    },
    {
      employee: 'employee2',
      amount: 189.75,
      currency: 'INR',
      category: 'Meals',
      description: 'Team lunch after client workshop',
      date: '2026-05-09',
      merchant: 'Curry House',
      status: 'approved',
      approvalRule: 'sharedOversight',
      currentApproverStep: 2,
      approvalHistory: [
        { step: 0, stage: 'manager', action: 'approved', comment: 'Team lunch was within policy.', approver: 'manager1', date: '2026-05-09T08:30:00.000Z' },
        { step: 1, stage: 'parallel', action: 'approved', comment: 'Approved to complete the demo scenario.', approver: 'admin', date: '2026-05-09T09:10:00.000Z' }
      ],
      convertedAmount: 2.28
    }
  ]
};

const currencyRates = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.26,
  INR: 0.012,
  JPY: 0.0068
};

const getUser = (usersByKey, key) => usersByKey.get(key);

const computeConvertedAmount = (amount, currency, companyCurrency) => {
  if (currency === companyCurrency) {
    return Number(amount.toFixed(2));
  }

  const sourceRate = currencyRates[currency] || 1;
  const targetRate = currencyRates[companyCurrency] || 1;
  return Number(((amount * sourceRate) / targetRate).toFixed(2));
};

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existingCompany = await Company.findOne({ name: DEMO.company.name });
  if (existingCompany) {
    await Expense.deleteMany({ company: existingCompany._id });
    await ApprovalRule.deleteMany({ company: existingCompany._id });
    await User.deleteMany({ company: existingCompany._id });
    await Company.deleteOne({ _id: existingCompany._id });
  }

  const existingDemoUsers = await User.find({
    $or: [
      { username: { $in: DEMO.users.map((user) => user.username) } },
      { email: { $in: DEMO.users.map((user) => user.email) } }
    ]
  }).select('_id');

  if (existingDemoUsers.length > 0) {
    const demoUserIds = existingDemoUsers.map((user) => user._id);
    await Expense.deleteMany({ employee: { $in: demoUserIds } });
    await ApprovalRule.deleteMany({
      $or: [
        { 'approvers.user': { $in: demoUserIds } },
        { specificApprovers: { $in: demoUserIds } }
      ]
    });
    await User.deleteMany({ _id: { $in: demoUserIds } });
  }

  const adminId = new mongoose.Types.ObjectId();
  const companyId = new mongoose.Types.ObjectId();

  const company = new Company({
    _id: companyId,
    name: DEMO.company.name,
    country: DEMO.company.country,
    currency: DEMO.company.currency,
    admin: adminId
  });

  const createdUsers = [];
  for (const user of DEMO.users) {
    const newUser = new User({
      _id: user.key === 'admin' ? adminId : new mongoose.Types.ObjectId(),
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      company: companyId,
      manager: null,
      isManagerApprover: user.role === 'employee' && user.username !== 'mia.fernandez'
    });
    createdUsers.push(newUser);
  }

  await User.insertMany(createdUsers);
  await company.save();

  const usersByKey = new Map();
  createdUsers.forEach((user, index) => {
    usersByKey.set(DEMO.users[index].key, user);
  });


  await User.updateMany({ _id: { $in: [getUser(usersByKey, 'manager1')._id, getUser(usersByKey, 'manager2')._id] } }, {
    manager: getUser(usersByKey, 'admin')._id
  });

  await User.updateMany({ _id: { $in: [getUser(usersByKey, 'employee1')._id, getUser(usersByKey, 'employee2')._id, getUser(usersByKey, 'employee3')._id, getUser(usersByKey, 'employee5')._id] } }, {
    manager: getUser(usersByKey, 'manager1')._id,
    isManagerApprover: true
  });

  await User.updateMany({ _id: getUser(usersByKey, 'employee4')._id }, {
    manager: getUser(usersByKey, 'manager2')._id,
    isManagerApprover: false
  });

  const rulesByKey = new Map();
  for (const ruleSeed of DEMO.rules) {
    const rule = await ApprovalRule.create({
      company: company._id,
      name: ruleSeed.name,
      type: ruleSeed.type,
      approvers: (ruleSeed.approvers || []).map((approverKey, index) => ({
        user: getUser(usersByKey, approverKey)._id,
        sequence: index + 1
      })),
      percentageRequired: ruleSeed.percentageRequired,
      specificApprovers: (ruleSeed.specificApprovers || []).map((approverKey) => getUser(usersByKey, approverKey)._id),
      amountThreshold: ruleSeed.amountThreshold,
      isActive: true
    });

    rulesByKey.set(ruleSeed.key, rule);
  }

  const expenses = DEMO.expenses.map((expenseSeed) => {
    const employee = getUser(usersByKey, expenseSeed.employee);
    const rule = expenseSeed.approvalRule ? rulesByKey.get(expenseSeed.approvalRule) : null;

    return {
      employee: employee._id,
      company: company._id,
      approvalRule: rule ? rule._id : null,
      amount: expenseSeed.amount,
      currency: expenseSeed.currency,
      convertedAmount: expenseSeed.convertedAmount ?? computeConvertedAmount(expenseSeed.amount, expenseSeed.currency, company.currency),
      category: expenseSeed.category,
      description: expenseSeed.description,
      date: new Date(expenseSeed.date),
      merchant: expenseSeed.merchant,
      status: expenseSeed.status,
      currentApproverStep: expenseSeed.currentApproverStep,
      approvalHistory: expenseSeed.approvalHistory.map((entry) => ({
        ...entry,
        approver: getUser(usersByKey, entry.approver)._id,
        date: new Date(entry.date)
      }))
    };
  });

  await Expense.insertMany(expenses);

  console.log('Demo seed complete');
  console.log('Company:', DEMO.company.name);
  console.log('Admin login: demo.admin / Demo123!');
  console.log('Manager logins: maya.roy, samir.kaul / Demo123!');
  console.log('Employee logins: ava.chen, noah.patel, leo.garcia, mia.fernandez, jules.park / Demo123!');
}

seed()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Demo seed failed:', error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });