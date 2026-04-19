
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.GroupScalarFieldEnum = {
  id: 'id',
  name: 'name',
  registrationId: 'registrationId',
  contributionAmt: 'contributionAmt',
  frequency: 'frequency',
  penaltyRules: 'penaltyRules',
  savingsGoal: 'savingsGoal',
  startDate: 'startDate',
  tier: 'tier',
  maxMembers: 'maxMembers',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  phone: 'phone',
  email: 'email',
  nationalId: 'nationalId',
  name: 'name',
  password: 'password',
  role: 'role',
  mustChangePassword: 'mustChangePassword',
  isActive: 'isActive',
  groupId: 'groupId',
  agreedToRules: 'agreedToRules',
  agreedAt: 'agreedAt',
  agreementUrl: 'agreementUrl',
  lastPasswordChange: 'lastPasswordChange',
  createdAt: 'createdAt'
};

exports.Prisma.ContributionScalarFieldEnum = {
  id: 'id',
  refNo: 'refNo',
  amount: 'amount',
  status: 'status',
  timestamp: 'timestamp',
  userId: 'userId',
  groupId: 'groupId',
  isLocked: 'isLocked',
  fundType: 'fundType',
  paymentStatus: 'paymentStatus',
  providerRef: 'providerRef'
};

exports.Prisma.LoanScalarFieldEnum = {
  id: 'id',
  refNo: 'refNo',
  amount: 'amount',
  interestRate: 'interestRate',
  deadline: 'deadline',
  status: 'status',
  userId: 'userId',
  groupId: 'groupId',
  guarantorId: 'guarantorId',
  createdAt: 'createdAt'
};

exports.Prisma.RepaymentScalarFieldEnum = {
  id: 'id',
  amount: 'amount',
  timestamp: 'timestamp',
  loanId: 'loanId'
};

exports.Prisma.PayoutScalarFieldEnum = {
  id: 'id',
  refNo: 'refNo',
  amount: 'amount',
  description: 'description',
  status: 'status',
  requestedById: 'requestedById',
  groupId: 'groupId',
  loanId: 'loanId',
  fundType: 'fundType',
  paymentStatus: 'paymentStatus',
  providerRef: 'providerRef',
  createdAt: 'createdAt'
};

exports.Prisma.PayoutApprovalScalarFieldEnum = {
  id: 'id',
  payoutId: 'payoutId',
  adminId: 'adminId',
  timestamp: 'timestamp'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  action: 'action',
  details: 'details',
  timestamp: 'timestamp',
  userId: 'userId',
  groupId: 'groupId'
};

exports.Prisma.PenaltyScalarFieldEnum = {
  id: 'id',
  amount: 'amount',
  reason: 'reason',
  status: 'status',
  userId: 'userId',
  groupId: 'groupId',
  timestamp: 'timestamp'
};

exports.Prisma.VerificationCodeScalarFieldEnum = {
  id: 'id',
  phone: 'phone',
  code: 'code',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.AnnouncementScalarFieldEnum = {
  id: 'id',
  title: 'title',
  body: 'body',
  type: 'type',
  eventDate: 'eventDate',
  groupId: 'groupId',
  createdBy: 'createdBy',
  createdAt: 'createdAt'
};

exports.Prisma.MeetingScalarFieldEnum = {
  id: 'id',
  date: 'date',
  title: 'title',
  groupId: 'groupId',
  createdAt: 'createdAt'
};

exports.Prisma.AttendanceScalarFieldEnum = {
  id: 'id',
  meetingId: 'meetingId',
  userId: 'userId',
  status: 'status',
  groupId: 'groupId'
};

exports.Prisma.PollScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  status: 'status',
  groupId: 'groupId',
  createdAt: 'createdAt'
};

exports.Prisma.VoteScalarFieldEnum = {
  id: 'id',
  pollId: 'pollId',
  userId: 'userId',
  choice: 'choice'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Group: 'Group',
  User: 'User',
  Contribution: 'Contribution',
  Loan: 'Loan',
  Repayment: 'Repayment',
  Payout: 'Payout',
  PayoutApproval: 'PayoutApproval',
  AuditLog: 'AuditLog',
  Penalty: 'Penalty',
  VerificationCode: 'VerificationCode',
  Announcement: 'Announcement',
  Meeting: 'Meeting',
  Attendance: 'Attendance',
  Poll: 'Poll',
  Vote: 'Vote'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
